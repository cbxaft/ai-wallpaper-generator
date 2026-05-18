"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, Sparkles, Download, Loader2, RefreshCw } from "lucide-react";

const STYLES = [
  { id: "studio", label: "📷 影棚白底", desc: "专业产品摄影，白底打光" },
  { id: "outdoor", label: "🌿 户外自然", desc: "户外场景，金色阳光" },
  { id: "luxury", label: "💎 高端奢华", desc: "大理石+金色，奢侈感" },
  { id: "warm", label: "🏠 温馨家居", desc: "温暖灯光，居家场景" },
  { id: "tech", label: "💻 科技极简", desc: "未来感桌面，RGB灯光" },
];

const PRICE_CNY = 5;

export default function ProductImagePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [style, setStyle] = useState("studio");
  const [description, setDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;
    setShowPayModal(true);
  };

  const doGenerate = async () => {
    if (!selectedFile) return;
    setShowPayModal(false);
    setGenerating(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("productImage", selectedFile);
      formData.append("style", style);
      formData.append("description", description);

      const res = await fetch("/api/product-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "生成失败");
      }
      setResult(data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请重试");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result;
    link.download = `product-image-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-500" />
          <span className="text-xl font-bold">AI 商品图生成器</span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            AI 商品场景图
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            上传产品照片，AI 自动生成专业场景图。{" "}
            <strong className="text-blue-500">¥{PRICE_CNY}/张</strong>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Input */}
          <div className="space-y-6">
            {/* Upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {preview ? (
                <div className="relative w-full aspect-square max-w-xs mx-auto">
                  <Image
                    src={preview}
                    alt="产品图"
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="py-12">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">点击上传产品照片</p>
                  <p className="text-xs text-gray-400 mt-2">
                    支持 JPG / PNG，建议正方形构图
                  </p>
                </div>
              )}
            </div>

            {/* Style selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                选择场景风格
              </label>
              <div className="grid grid-cols-1 gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`text-left px-4 py-3 rounded-xl text-sm transition-all ${
                      style === s.id
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="font-medium">{s.label}</div>
                    <div className="text-xs opacity-70 mt-0.5">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional description */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                补充描述（可选）
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="例如：红色咖啡杯、北欧风格..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!selectedFile || generating}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  生成商品图 - ¥{PRICE_CNY}
                </>
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Right: Result */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">生成结果</h2>
            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl aspect-square flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              {result ? (
                <div className="relative w-full h-full p-4">
                  <Image
                    src={result}
                    alt="生成结果"
                    fill
                    className="object-contain rounded-xl"
                  />
                </div>
              ) : (
                <p className="text-gray-400 text-sm">
                  {generating
                    ? "AI 正在生成..."
                    : "上传产品图后点击生成"}
                </p>
              )}
            </div>

            {result && (
              <button
                onClick={handleDownload}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                下载图片
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-sm w-full p-8 relative">
            <button
              onClick={() => setShowPayModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4 text-center">
              支付 ¥{PRICE_CNY}
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              扫码支付后点击"已支付"继续生成
            </p>

            {/* 收款码占位 - 需要你替换成自己的 */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 mb-4 text-center">
              <p className="text-sm text-gray-500 mb-2">微信支付</p>
              <div className="w-48 h-48 mx-auto bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <p className="text-xs text-gray-400">请替换为你的收款码</p>
              </div>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 mb-6 text-center">
              <p className="text-sm text-gray-500 mb-2">支付宝</p>
              <div className="w-48 h-48 mx-auto bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <p className="text-xs text-gray-400">请替换为你的收款码</p>
              </div>
            </div>

            <button
              onClick={doGenerate}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all"
            >
              已支付，开始生成
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">
              付款后点击按钮，AI 自动生成
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
