"use client";

import { useState, useCallback, useRef } from "react";
import { Wand2, Sparkles, Download, RefreshCw, ImageIcon, Loader2 } from "lucide-react";

type GenerationStep = "idle" | "generating" | "done";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [step, setStep] = useState<GenerationStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [style, setStyle] = useState("realistic");
  const [aspectRatio, setAspectRatio] = useState("landscape");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const aspectRatios = [
    { id: "landscape", label: "Desktop (16:9)", width: 1024, height: 576 },
    { id: "portrait", label: "Mobile (9:16)", width: 576, height: 1024 },
    { id: "square", label: "Square (1:1)", width: 768, height: 768 },
  ];

  const styles = [
    { id: "realistic", label: "Realistic" },
    { id: "anime", label: "Anime" },
    { id: "fantasy", label: "Fantasy" },
    { id: "minimalist", label: "Minimalist" },
    { id: "cyberpunk", label: "Cyberpunk" },
    { id: "watercolor", label: "Watercolor" },
  ];

  const selectedRatio = aspectRatios.find((r) => r.id === aspectRatio)!;

  const generateWallpaper = useCallback(async () => {
    if (!prompt.trim()) return;

    setStep("generating");
    setError(null);
    setImageUrl(null);

    try {
      const stylePrompt =
        style === "realistic"
          ? prompt
          : `${prompt}, ${style} style`;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: stylePrompt,
          width: selectedRatio.width,
          height: selectedRatio.height,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Generation failed");
      }

      setImageUrl(data.imageUrl);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("idle");
    }
  }, [prompt, style, selectedRatio]);

  const handleDownload = useCallback(async () => {
    if (!imageUrl) return;

    // Free tier: download directly (with watermark notice for free version)
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `ai-wallpaper-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [imageUrl]);

  const generateNew = useCallback(() => {
    setImageUrl(null);
    setStep("idle");
    setError(null);
    setPrompt("");
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <span className="text-xl font-bold">AI Wallpapers</span>
          </div>
          <nav className="flex items-center gap-4">
            <button
              onClick={() => setShowPricing(!showPricing)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-500 transition-colors"
            >
              Pricing
            </button>
            <a
              href="https://github.com/cbxaft/ai-wallpaper-generator"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-500 transition-colors"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Create Stunning{" "}
            <span className="text-gradient bg-gradient-to-r from-purple-500 to-pink-500">
              AI Wallpapers
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Generate unique, high-quality wallpapers for your desktop and mobile
            devices using cutting-edge AI.
          </p>
        </div>

        {/* Generator section */}
        {step !== "done" ? (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Prompt input */}
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your dream wallpaper... e.g., 'A serene mountain lake at sunset with cherry blossoms'"
                className="w-full h-32 p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-base"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    generateWallpaper();
                  }
                }}
              />
              <button
                onClick={generateWallpaper}
                disabled={!prompt.trim() || step === "generating"}
                className="absolute bottom-4 right-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 dark:disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {step === "generating" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Generate
                  </>
                )}
              </button>
            </div>

            {/* Style selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Style
              </label>
              <div className="flex flex-wrap gap-2">
                {styles.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      style === s.id
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick prompts */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Try These Prompts
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "🏔️ Mountain Lake", prompt: "A serene mountain lake at sunset with cherry blossoms, vibrant colors, highly detailed" },
                  { label: "🌲 Enchanted Forest", prompt: "A mystical forest path with glowing mushrooms and fireflies, magical atmosphere, ethereal lighting" },
                  { label: "🌊 Ocean Wave", prompt: "Dramatic waves crashing against a rocky coastline, stormy sky, cinematic lighting, seascape" },
                  { label: "🌃 Cyberpunk City", prompt: "Cyberpunk cityscape at night with neon signs and flying cars, rain-slicked streets, blade runner style" },
                  { label: "🌌 Aurora Night", prompt: "Brilliant northern lights dancing over a snowy mountain range, starry sky, night landscape" },
                  { label: "🌸 Sakura Garden", prompt: "Japanese garden in full bloom with cherry blossoms, koi pond, traditional bridge, peaceful atmosphere" },
                  { label: "🚀 Space Nebula", prompt: "Vibrant space nebula with swirling colors of purple and blue, distant galaxies, cosmic background" },
                  { label: "🏜️ Desert Dunes", prompt: "Golden sand dunes at sunset, warm colors, long shadows, minimalist desert landscape" },
                  { label: "💎 Crystal Cave", prompt: "Underground crystal cave with glowing purple amethyst geodes, bioluminescent light, fantasy" },
                  { label: "☯️ Zen Garden", prompt: "Minimalist zen garden with raked sand patterns, single bonsai tree, peaceful meditation space" },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setPrompt(item.prompt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      prompt === item.prompt
                        ? "bg-pink-600 text-white shadow-lg shadow-pink-500/25"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect ratio */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Aspect Ratio
              </label>
              <div className="flex gap-2">
                {aspectRatios.map((ar) => (
                  <button
                    key={ar.id}
                    onClick={() => setAspectRatio(ar.id)}
                    className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      aspectRatio === ar.id
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div>{ar.label}</div>
                    <div className="text-xs opacity-70 mt-0.5">
                      {ar.width}x{ar.height}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Tip */}
            <p className="text-xs text-gray-500 text-center">
              Tip: Press Cmd/Ctrl + Enter to generate
            </p>
          </div>
        ) : (
          /* Result section */
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              {imageUrl && (
                <div className="flex items-center justify-center p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imageRef}
                    src={imageUrl}
                    alt="Generated wallpaper"
                    className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-2xl"
                  />
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
                <input type="hidden" name="cmd" value="_xclick" />
                <input type="hidden" name="business" value="627891168@qq.com" />
                <input type="hidden" name="item_name" value="HD Wallpaper Pack - 15 Premium AI Wallpapers" />
                <input type="hidden" name="amount" value="2.99" />
                <input type="hidden" name="currency_code" value="USD" />
                <input type="hidden" name="return" value="https://ai-wallpaper-generator-tawny.vercel.app/success" />
                <input type="hidden" name="cancel_return" value="https://ai-wallpaper-generator-tawny.vercel.app" />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-orange-500/25 flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"/>
                  </svg>
                  Buy 15 HD Wallpapers - $2.99
                </button>
              </form>
              <button
                onClick={handleDownload}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Free (Watermarked)
              </button>
              <button
                onClick={generateNew}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-medium transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Generate New
              </button>
            </div>

            <p className="text-sm text-gray-500 text-center">
              Free download includes a watermark.{" "}
              <a
                href="https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=627891168@qq.com&item_name=HD+Wallpaper+Pack+-+15+Premium+AI+Wallpapers&amount=2.99&currency_code=USD&return=https://ai-wallpaper-generator-tawny.vercel.app/success&cancel_return=https://ai-wallpaper-generator-tawny.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 hover:text-orange-400 underline font-medium"
              >
                Buy 15 HD Wallpapers for $2.99, no watermark
              </a>
            </p>
          </div>
        )}

        {/* Pricing modal */}
        {showPricing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-8 relative">
              <button
                onClick={() => setShowPricing(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <h2 className="text-2xl font-bold mb-6">Choose Your Plan</h2>

              <div className="space-y-4">
                {/* Free */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">Free</h3>
                      <p className="text-sm text-gray-500">Basic quality</p>
                    </div>
                    <div className="text-2xl font-bold">$0</div>
                  </div>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                    <li>Standard resolution</li>
                    <li>Small watermark</li>
                    <li>Limited styles</li>
                  </ul>
                  <button
                    onClick={() => setShowPricing(false)}
                    className="w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Current Plan
                  </button>
                </div>

                {/* Single */}
                <div className="border border-purple-500 dark:border-purple-400 rounded-xl p-6 relative">
                  <div className="absolute -top-3 left-4 px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                    POPULAR
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">Single Download</h3>
                      <p className="text-sm text-gray-500">
                        HD, no watermark
                      </p>
                    </div>
                    <div className="text-2xl font-bold">$2.99</div>
                  </div>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                    <li>HD resolution (up to 4K)</li>
                    <li>No watermark</li>
                    <li>All styles available</li>
                    <li>One-time purchase</li>
                  </ul>
                  <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
                    <input type="hidden" name="cmd" value="_xclick" />
                    <input type="hidden" name="business" value="627891168@qq.com" />
                    <input type="hidden" name="item_name" value="AI Wallpaper - Single HD Download" />
                    <input type="hidden" name="amount" value="2.99" />
                    <input type="hidden" name="currency_code" value="USD" />
                    <input type="hidden" name="return" value="https://ai-wallpaper-generator-tawny.vercel.app/success" />
                    <input type="hidden" name="cancel_return" value="https://ai-wallpaper-generator-tawny.vercel.app" />
                    <button
                      type="submit"
                      className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-purple-500/25 cursor-pointer"
                    >
                      Buy Now - $2.99
                    </button>
                  </form>
                </div>

                {/* Monthly */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">Monthly Unlimited</h3>
                      <p className="text-sm text-gray-500">Best value</p>
                    </div>
                    <div className="text-2xl font-bold">$9.99/mo</div>
                  </div>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                    <li>Unlimited generations</li>
                    <li>HD resolution (up to 4K)</li>
                    <li>No watermark</li>
                    <li>All styles & ratios</li>
                    <li>Priority generation</li>
                  </ul>
                  <button className="w-full py-2 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                    Subscribe Monthly
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>AI-powered wallpaper generation &bull; Secure payments by PayPal</p>
          <p className="mt-1">
            &copy; {new Date().getFullYear()} AI Wallpapers. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
