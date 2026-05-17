/**
 * Unified image generation service supporting multiple providers.
 *
 * Provider is selected via the GEN_PROVIDER environment variable:
 *   - "siliconflow" (default if GEN_PROVIDER is unset or empty)
 *   - "together"     (original Together AI provider)
 *
 * Required environment variables per provider:
 *   - siliconflow: SILICONFLOW_API_KEY
 *   - together:    TOGETHER_API_KEY
 */

interface ProviderConfig {
  name: string;
  apiKeyEnvVar: string;
  apiBaseUrl: string;
  /** Default model identifier for this provider */
  defaultModel: string;
  /** Whether the provider supports multiple aspect ratios via size parameter */
  supportsSizeParam: boolean;
}

const PROVIDERS: Record<string, ProviderConfig> = {
  siliconflow: {
    name: "SiliconFlow",
    apiKeyEnvVar: "SILICONFLOW_API_KEY",
    apiBaseUrl: "https://api.siliconflow.cn/v1",
    defaultModel: "Kwai-Kolors/Kolors",
    supportsSizeParam: true,
  },
  together: {
    name: "Together AI",
    apiKeyEnvVar: "TOGETHER_API_KEY",
    apiBaseUrl: "https://api.together.xyz/v1",
    defaultModel: "black-forest-labs/FLUX.1-schnell",
    supportsSizeParam: false,
  },
};

export interface GenerateImageParams {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
  steps?: number;
  n?: number;
}

export interface GeneratedImage {
  imageBuffer: Buffer;
  base64: string;
  contentType: string;
}

function getActiveProvider(): ProviderConfig {
  const providerName = process.env.GEN_PROVIDER || "siliconflow";
  const provider = PROVIDERS[providerName];
  if (!provider) {
    throw new Error(
      `Unknown GEN_PROVIDER "${providerName}". Available: ${Object.keys(PROVIDERS).join(", ")}`
    );
  }
  return provider;
}

function getApiKey(): string {
  const provider = getActiveProvider();
  const apiKey = process.env[provider.apiKeyEnvVar];
  if (!apiKey) {
    throw new Error(
      `${provider.apiKeyEnvVar} is not set (required for ${provider.name} provider)`
    );
  }
  return apiKey;
}

/**
 * Generate an image using the active provider.
 *
 * SiliconFlow API format (OpenAI-compatible):
 *   POST /v1/images/generations
 *   { model, prompt, n, size: "WxH" }
 *   Returns { images: [{ url }] }
 *
 * Together AI API format:
 *   POST /v1/images/generations
 *   { model, prompt, width, height, steps, n, response_format: "base64" }
 *   Returns { data: [{ b64_json }] }
 */
export async function generateImage(
  params: GenerateImageParams
): Promise<GeneratedImage> {
  const provider = getActiveProvider();
  const apiKey = getApiKey();

  const width = params.width || 1024;
  const height = params.height || 768;

  if (provider.name === "SiliconFlow") {
    return generateWithSiliconFlow(apiKey, provider, params, width, height);
  } else if (provider.name === "Together AI") {
    return generateWithTogether(apiKey, provider, params, width, height);
  }

  throw new Error(`Unsupported provider: ${provider.name}`);
}

async function generateWithSiliconFlow(
  apiKey: string,
  provider: ProviderConfig,
  params: GenerateImageParams,
  width: number,
  height: number
): Promise<GeneratedImage> {
  const response = await fetch(`${provider.apiBaseUrl}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: params.model || provider.defaultModel,
      prompt: params.prompt,
      n: params.n || 1,
      size: `${width}x${height}`,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `SiliconFlow API error (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();

  // SiliconFlow returns the image URL
  const imageUrl =
    data.data?.[0]?.url || data.images?.[0]?.url;
  if (!imageUrl) {
    throw new Error(
      "Failed to generate image: no image URL returned from SiliconFlow"
    );
  }

  // Download the image from the URL
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(
      `Failed to download generated image: ${imageResponse.status}`
    );
  }

  const arrayBuffer = await imageResponse.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuffer);
  const base64 = imageBuffer.toString("base64");

  return {
    imageBuffer,
    base64,
    contentType: imageResponse.headers.get("content-type") || "image/png",
  };
}

async function generateWithTogether(
  apiKey: string,
  provider: ProviderConfig,
  params: GenerateImageParams,
  width: number,
  height: number
): Promise<GeneratedImage> {
  const response = await fetch(`${provider.apiBaseUrl}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: params.model || provider.defaultModel,
      prompt: params.prompt,
      width,
      height,
      steps: params.steps || 4,
      n: params.n || 1,
      response_format: "base64",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Together AI API error (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();

  const b64Json = data.data?.[0]?.b64_json;
  if (!b64Json) {
    throw new Error("Failed to generate image: no data returned from Together AI");
  }

  const imageBuffer = Buffer.from(b64Json, "base64");

  return {
    imageBuffer,
    base64: b64Json,
    contentType: "image/png",
  };
}

/**
 * Get the display name of the active provider.
 */
export function getProviderName(): string {
  return getActiveProvider().name;
}

/**
 * Get the default model for the active provider.
 */
export function getDefaultModel(): string {
  return getActiveProvider().defaultModel;
}
