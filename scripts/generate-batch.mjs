/**
 * Batch wallpaper generator script.
 * Generates multiple wallpapers and saves them locally.
 * Runs standalone (no Next.js dependency) — calls SiliconFlow API directly.
 */

const API_KEY = process.env.SILICONFLOW_API_KEY;
if (!API_KEY) {
  console.error("Error: SILICONFLOW_API_KEY environment variable not set");
  process.exit(1);
}

const BASE_URL = "https://api.siliconflow.cn/v1";
const MODEL = "Kwai-Kolors/Kolors"; // default provider model

// 15 wallpaper prompts — diverse styles, stock-photo quality, no text
const PROMPTS = [
  {
    id: "01-mountain-sunset",
    prompt: "A serene mountain landscape at sunset with golden light streaming through peaks, misty valleys, vibrant orange and purple sky, photorealistic, ultra detailed, nature wallpaper",
    width: 1920, height: 1080,
  },
  {
    id: "02-forest-path",
    prompt: "A winding forest path covered in autumn leaves, sunlight filtering through colorful trees, warm golden hour atmosphere, magical woodland scene, photorealistic, 4k wallpaper",
    width: 1920, height: 1080,
  },
  {
    id: "03-ocean-wave",
    prompt: "A dramatic ocean wave crashing at sunset, turquoise water with white foam, golden sky, cinematic composition, ultra realistic, ocean wallpaper, wide angle",
    width: 1920, height: 1080,
  },
  {
    id: "04-northern-lights",
    prompt: "A stunning display of northern lights dancing across a starry night sky over a snowy mountain cabin, vibrant green and purple aurora, peaceful winter scene, dreamy wallpaper",
    width: 1920, height: 1080,
  },
  {
    id: "05-city-night",
    prompt: "A futuristic cityscape at night with neon lights reflecting on wet streets, cyberpunk vibe, towering skyscrapers, vibrant blue and pink lighting, cinematic, wide angle wallpaper",
    width: 1920, height: 1080,
  },
  {
    id: "06-sakura-garden",
    prompt: "A beautiful Japanese garden with cherry blossom trees in full bloom, pink petals floating on a calm pond, traditional wooden bridge, soft sunlight, tranquil atmosphere, high quality wallpaper",
    width: 1920, height: 1080,
  },
  {
    id: "07-space-nebula",
    prompt: "A breathtaking cosmic nebula with swirling purple, blue, and pink gas clouds, distant stars, and galaxies, deep space scene, ultra high resolution, sci-fi wallpaper",
    width: 1920, height: 1080,
  },
  {
    id: "08-desert-dunes",
    prompt: "Golden sand dunes in the Sahara desert at sunset with long shadows, dramatic lighting, wind-swept patterns in the sand, clear sky, serene and vast landscape, 4k wallpaper",
    width: 1920, height: 1080,
  },
  {
    id: "09-waterfall",
    prompt: "A majestic waterfall cascading down lush green cliffs into a crystal clear pool, rainbow forming in the mist, tropical paradise, bright sunlight, photorealistic nature wallpaper",
    width: 1920, height: 1080,
  },
  {
    id: "10-lavender-field",
    prompt: "Endless lavender fields in Provence at golden hour, purple rows stretching to the horizon, warm sunset light, rolling hills in background, peaceful countryside, high quality wallpaper",
    width: 1920, height: 1080,
  },
  {
    id: "11-snowy-peaks",
    prompt: "Snow-capped mountain peaks in the Himalayas at dawn, dramatic clouds wrapping around the summit, first light hitting the snow, majestic and powerful, ultra realistic wallpaper",
    width: 1920, height: 1080,
  },
  {
    id: "12-tropical-beach",
    prompt: "A pristine tropical beach with white sand and crystal clear turquoise water, palm trees swaying in the breeze, vibrant blue sky with fluffy clouds, paradise view, vacation wallpaper",
    width: 1920, height: 1080,
  },
  {
    id: "13-abstract-art",
    prompt: "Abstract fluid art with vibrant colors swirling together, gold and teal and magenta paint mixing beautifully, smooth curves and organic shapes, artistic wallpaper, high contrast",
    width: 1920, height: 1080,
  },
  {
    id: "14-crystal-cave",
    prompt: "An underground crystal cave illuminated by bioluminescent blue light, giant geometric crystals reflecting light, mysterious atmosphere, fantasy scene, detailed texture, wallpaper",
    width: 1920, height: 1080,
  },
  {
    id: "15-zen-garden",
    prompt: "A minimalist zen rock garden with raked sand patterns, moss-covered stones, bamboo fence, soft morning light, peaceful meditation space, Japanese aesthetic, calm wallpaper",
    width: 1920, height: 1080,
  },
];

const OUTPUT_DIR = process.env.OUTPUT_DIR || "/home/admin/ai-wallpaper-generator/public/wallpapers";

async function generateWallpaper(item) {
  console.log(`\n[${item.id}] Generating: "${item.prompt.substring(0, 60)}..."`);

  const response = await fetch(`${BASE_URL}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      prompt: item.prompt,
      n: 1,
      size: `${item.width}x${item.height}`,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const imageUrl = data.data?.[0]?.url || data.images?.[0]?.url;
  if (!imageUrl) {
    throw new Error("No image URL in response");
  }

  console.log(`  Downloading from: ${imageUrl.substring(0, 80)}...`);

  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Download failed: ${imageResponse.status}`);
  }

  const arrayBuffer = await imageResponse.arrayBuffer();
  const fs = await import("fs");
  const path = await import("path");

  const ext = imageResponse.headers.get("content-type")?.includes("png") ? "png" : "jpg";
  const filename = `${item.id}.${ext}`;
  const filepath = path.join(OUTPUT_DIR, filename);

  fs.writeFileSync(filepath, Buffer.from(arrayBuffer));
  console.log(`  Saved: ${filepath} (${(arrayBuffer.byteLength / 1024).toFixed(1)} KB)`);

  return { filename, path: filepath, size: arrayBuffer.byteLength };
}

async function main() {
  const fs = await import("fs");
  const path = await import("path");

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}`);
  }

  console.log(`Batch Generating Wallpapers (${PROMPTS.length} items)`);
  console.log(`Model: ${MODEL}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  const results = [];
  for (const item of PROMPTS) {
    try {
      const result = await generateWallpaper(item);
      results.push(result);
    } catch (err) {
      console.error(`  FAILED: ${err.message}`);
      results.push({ filename: `${item.id}.failed`, error: err.message });
    }
    // Small delay between API calls to avoid rate limiting
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log("\n=== Summary ===");
  let successCount = 0;
  let failCount = 0;
  let totalSize = 0;
  for (const r of results) {
    if (r.error) {
      console.log(`  FAIL: ${r.filename} — ${r.error}`);
      failCount++;
    } else {
      console.log(`  OK:   ${r.filename} (${(r.size / 1024).toFixed(1)} KB)`);
      successCount++;
      totalSize += r.size;
    }
  }
  console.log(`\nDone: ${successCount} success, ${failCount} failed`);
  console.log(`Total size: ${(totalSize / 1024 / 1024).toFixed(1)} MB`);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
