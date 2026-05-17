import { NextRequest, NextResponse } from "next/server";
import { generateImage, getProviderName } from "@/lib/image-generator";

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

    // Return base64 image data
    return NextResponse.json({
      success: true,
      imageUrl: `data:${result.contentType};base64,${result.base64}`,
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
