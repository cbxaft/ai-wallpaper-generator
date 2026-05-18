"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Wand2, Sparkles, Download, Loader2, CheckCircle2, Trash2,
  ImageIcon,
} from "lucide-react";

type GenerationStep = "idle" | "generating" | "done";

interface GeneratedImage {
  url: string;
  prompt: string;
  id: number;
}

export default function PremiumPage() {
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [step, setStep] = useState<GenerationStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [generatedCount, setGeneratedCount] = useState(0);
  const maxGenerations = 10;
  const remaining = maxGenerations - generatedCount;
  const imageIdRef = useRef(0);

  const generateWallpaper = useCallback(async () => {
    if (!prompt.trim()) return;
    if (remaining <= 0) return;

    setStep("generating");
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `${prompt}, no watermark, ultra HD, 1920x1080`,
          width: 1920,
          height: 1080,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Generation failed");
      }

      const newId = imageIdRef.current++;
      setImages((prev) => [
        ...prev,
        { url: data.imageUrl, prompt, id: newId },
      ]);
      setGeneratedCount((prev) => prev + 1);
      setStep("done");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
      setStep("idle");
    }
  }, [prompt, remaining]);

  const handleDownload = useCallback(
    (imageUrl: string, index: number) => {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `premium-wallpaper-${Date.now()}-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    []
  );

  const downloadAllImages = useCallback(() => {
    images.forEach((img, i) => {
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = img.url;
        link.download = `premium-wallpaper-${i + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, i * 500);
    });
  }, [images]);

  const clearImages = useCallback(() => {
    setImages([]);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-orange-500" />
            <span className="text-xl font-bold">
              Premium Generator
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-orange-500 font-medium">
              {remaining} / {maxGenerations} remaining
            </span>
            <Link
              href="/"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-500 transition-colors"
            >
              Back to Free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {remaining > 0 ? (
          <>
            {/* Generator area */}
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center mb-4">
                <h1 className="text-3xl font-bold mb-2">
                  Generate Your Custom Wallpaper
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  You have <strong>{remaining} generations</strong> left.
                  Each time you generate, the image is saved below.
                  Change your prompt and generate again!
                </p>
              </div>

              {/* Prompt input */}
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your dream wallpaper..."
                  className="w-full h-28 p-4 rounded-xl border border-orange-300 dark:border-orange-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-base"
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      (e.metaKey || e.ctrlKey)
                    ) {
                      generateWallpaper();
                    }
                  }}
                />
                <button
                  onClick={generateWallpaper}
                  disabled={
                    !prompt.trim() || step === "generating"
                  }
                  className="absolute bottom-4 right-4 px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 dark:disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {step === "generating" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Generate (1 credit)
                    </>
                  )}
                </button>
              </div>

              {/* Quick prompt ideas */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Try these ideas or write your own
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "A majestic dragon flying over a medieval castle at sunset",
                    "Neon-lit Tokyo street at midnight with cherry blossoms",
                    "Underwater city with bioluminescent coral and ancient ruins",
                    "Cozy cabin in a snowy forest with warm fireplace light",
                    "Abstract swirling galaxy with neon colors",
                  ].map((item) => (
                    <button
                      key={item}
                      onClick={() => setPrompt(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                        prompt === item
                          ? "bg-orange-600 text-white shadow-lg shadow-orange-500/25"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {item.slice(0, 35)}...
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
            </div>

            {/* Generated images gallery */}
            {images.length > 0 && (
              <div className="max-w-6xl mx-auto mt-12 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">
                      Your Gallery ({images.length})
                    </h2>
                    <p className="text-sm text-gray-500">
                      All your generated wallpapers are saved here.
                      Download any time.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {images.length > 0 && (
                      <button
                        onClick={clearImages}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear
                      </button>
                    )}
                    <button
                      onClick={downloadAllImages}
                      className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-orange-500/25 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download All ({images.length})
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {images.map((img, i) => (
                    <div
                      key={img.id}
                      className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={`Wallpaper ${i + 1}`}
                        className="w-full aspect-video object-cover"
                      />
                      <div className="p-3 flex items-center justify-between">
                        <div className="text-xs text-gray-500 truncate max-w-[180px]">
                          #{i + 1} &bull;{" "}
                          {img.prompt.slice(0, 30)}
                          {img.prompt.length > 30 ? "..." : ""}
                        </div>
                        <button
                          onClick={() =>
                            handleDownload(img.url, i)
                          }
                          className="text-xs text-orange-500 hover:text-orange-400 font-medium flex items-center gap-1 flex-shrink-0"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {images.length === 0 && step !== "generating" && (
              <div className="max-w-md mx-auto text-center py-16">
                <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">
                  Your generated wallpapers will appear here.
                  <br />
                  Write a prompt above and click Generate!
                </p>
              </div>
            )}
          </>
        ) : (
          /* All used up */
          <div className="max-w-md mx-auto text-center py-20">
            <CheckCircle2 className="w-16 h-16 text-orange-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">
              You've used all {maxGenerations} generations!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Don't forget to download your wallpapers above before
              they expire.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Purchase another pack to continue generating.
            </p>
            <form
              action="https://www.paypal.com/cgi-bin/webscr"
              method="post"
              target="_blank"
            >
              <input type="hidden" name="cmd" value="_xclick" />
              <input
                type="hidden"
                name="business"
                value="627891168@qq.com"
              />
              <input
                type="hidden"
                name="item_name"
                value="Premium Custom Generation - 10 HD Wallpapers"
              />
              <input type="hidden" name="amount" value="4.99" />
              <input
                type="hidden"
                name="currency_code"
                value="USD"
              />
              <input
                type="hidden"
                name="return"
                value="https://ai-wallpaper-generator-tawny.vercel.app/premium"
              />
              <input
                type="hidden"
                name="cancel_return"
                value="https://ai-wallpaper-generator-tawny.vercel.app/premium"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/25 cursor-pointer"
              >
                Buy Again - $4.99
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
