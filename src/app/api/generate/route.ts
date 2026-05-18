import { NextRequest, NextResponse } from "next/server";
import { generateImage, getProviderName } from "@/lib/image-generator";
import sharp from "sharp";

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
