"use client";

import Link from "next/link";
import { CheckCircle2, Download } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Thank you for purchasing the{" "}
          <strong>HD Wallpaper Pack</strong>.
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Click below to download your 15 premium AI wallpapers.
        </p>

        <a
          href="/ai-wallpaper-pack.tar.gz"
          download
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-orange-500/25 mb-6"
        >
          <Download className="w-6 h-6" />
          Download Wallpaper Pack (6.5MB)
        </a>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-left text-sm text-gray-500 dark:text-gray-400 space-y-2">
          <p>What's included:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>15 HD wallpapers (1920x1080)</li>
            <li>No watermarks</li>
            <li>Various styles: scenic, cyberpunk, fantasy & more</li>
            <li>Ready for desktop use</li>
          </ul>
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="text-purple-500 hover:text-purple-400 underline text-sm"
          >
            Back to Generator
          </Link>
        </div>
      </div>
    </div>
  );
}
