import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/image-generator";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const productImage = formData.get("productImage") as File | null;
    const style = formData.get("style") as string || "studio";
    const description = formData.get("description") as string || "";

    if (!productImage) {
      return NextResponse.json(
        { success: false, error: "请上传产品图片" },
        { status: 400 }
      );
    }

    // 将上传的图片转为 base64
    const bytes = await productImage.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");
    const mimeType = productImage.type || "image/jpeg";

    // 根据风格构造 prompt
    const stylePrompts: Record<string, string> = {
      studio: `Professional studio photography of a product on a clean white background, soft lighting, commercial product photography, 8K, highly detailed`,
      outdoor: `Product placed in a beautiful outdoor natural setting, golden hour sunlight, professional product photography, lifestyle shot, green grass background`,
      luxury: `Luxury product on a marble surface with gold accessories, elegant lighting, high-end commercial photography, minimalist`,
      warm: `Cozy lifestyle scene with warm lighting, wooden table, natural home environment, product on display, hygge style`,
      tech: `Futuristic tech product on a sleek desk with RGB lighting, modern minimal workspace, blue ambient light`,
    };

    const basePrompt = stylePrompts[style] || stylePrompts.studio;
    const finalPrompt = description
      ? `${description}, ${basePrompt}`
      : basePrompt;

    // 调用硅基流动的图生图 API
    const apiKey = process.env.SILICONFLOW_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API Key 未配置" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.siliconflow.cn/v1/images/generations",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "Kwai-Kolors/Kolors",
          prompt: finalPrompt,
          n: 1,
          size: "1024x1024",
          image: `data:${mimeType};base64,${base64Image}`,
          image_strength: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { success: false, error: `AI 生成失败: ${errorText}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url || data.images?.[0]?.url;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: "AI 返回异常" },
        { status: 500 }
      );
    }

    // 下载生成的图片
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const resultBase64 = imageBuffer.toString("base64");

    return NextResponse.json({
      success: true,
      imageUrl: `data:${imageResponse.headers.get("content-type") || "image/png"};base64,${resultBase64}`,
    });
  } catch (error) {
    console.error("生成商品图错误:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "生成失败",
      },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
