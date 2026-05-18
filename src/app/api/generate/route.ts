import { NextRequest, NextResponse } from "next/server";
import { generateImage, getProviderName } from "@/lib/image-generator";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const DAILY_LIMIT = 3;
const RATE_LIMIT_DIR = path.join(process.cwd(), ".rate-limit");

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "127.0.0.1";
}

function getDailyUsage(ip: string): number {
  try {
    fs.mkdirSync(RATE_LIMIT_DIR, { recursive: true });
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const filePath = path.join(RATE_LIMIT_DIR, today);
    const data: Record<string, number> = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, "utf-8"))
      : {};
    return data[ip] || 0;
  } catch {
    return 0;
  }
}

function incrementDailyUsage(ip: string): number {
  fs.mkdirSync(RATE_LIMIT_DIR, { recursive: true });
  const today = new Date().toISOString().slice(0, 10);
  const filePath = path.join(RATE_LIMIT_DIR, today);
  const data: Record<string, number> = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, "utf-8"))
    : {};
  data[ip] = (data[ip] || 0) + 1;
  fs.writeFileSync(filePath, JSON.stringify(data));
  return data[ip];
}

function getRemaining(ip: string): number {
  return Math.max(0, DAILY_LIMIT - getDailyUsage(ip));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, width, height } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Check rate limit
    const ip = getClientIp(request);
    const remaining = getRemaining(ip);

    if (remaining <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Daily limit reached (${DAILY_LIMIT} free generations). Please upgrade for unlimited HD generation.`,
          remaining: 0,
          limitReached: true,
        },
        { status: 429 }
      );
    }

    // Enhanced prompt for wallpaper quality
    const enhancedPrompt = `Professional wallpaper, ultra high quality, 4k, ${prompt}. High detail, vibrant colors, suitable for desktop wallpaper, no text, no watermark`;

    const providerName = getProviderName();
    console.log(`Using provider: ${providerName}`);

    const result = await generateImage({
      prompt: enhancedPrompt,
      width: width || 1024,
      height: height || 768,
      steps: 4,
    });

    // Increment usage AFTER successful generation
    const used = incrementDailyUsage(ip);
    const newRemaining = Math.max(0, DAILY_LIMIT - used);

    // Add watermark overlay at the bottom of the image
    const metadata = await sharp(result.imageBuffer).metadata();
    const w = metadata.width || 1024;
    const h = metadata.height || 768;

    const watermarked = await sharp(result.imageBuffer)
      .composite([
        {
          input: Buffer.from(
            `<svg width="${w}" height="${h}">
              <rect x="0" y="${h - 40}" width="${w}" height="40" fill="rgba(0,0,0,0.2)" />
              <text x="${w / 2}" y="${h - 14}" font-size="18" font-family="sans-serif" fill="rgba(255,255,255,0.5)" text-anchor="middle">AI Wallpapers</text>
            </svg>`
          ),
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toBuffer();

    const base64 = watermarked.toString("base64");

    return NextResponse.json({
      success: true,
      imageUrl: `data:image/png;base64,${base64}`,
      provider: providerName,
      remaining: newRemaining,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate wallpaper",
      },
      { status: 500 }
    );
  }
}
