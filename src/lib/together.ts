import Together from "together-ai";

let togetherClient: Together | null = null;

export function getTogetherClient(): Together {
  if (!togetherClient) {
    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) {
      throw new Error("TOGETHER_API_KEY is not set");
    }
    togetherClient = new Together({ apiKey });
  }
  return togetherClient;
}

export interface GenerateImageParams {
  prompt: string;
  width?: number;
  height?: number;
  steps?: number;
  seed?: number;
}

export async function generateWallpaper(params: GenerateImageParams) {
  const client = getTogetherClient();

  const width = params.width || 1024;
  const height = params.height || 768;

  const response = await client.images.generate({
    model: "black-forest-labs/FLUX.1-schnell",
    prompt: params.prompt,
    width,
    height,
    steps: params.steps || 4,
    n: 1,
    response_format: "base64",
  });

  const b64Json = response.data?.[0]?.b64_json;
  if (!b64Json) {
    throw new Error("Failed to generate image: no data returned");
  }

  const imageBuffer = Buffer.from(b64Json, "base64");

  return {
    imageBuffer,
    base64: b64Json,
    contentType: "image/png",
  };
}
