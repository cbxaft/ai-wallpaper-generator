"use client";

import Link from "next/link";
import { Sparkles, Check, ArrowLeft } from "lucide-react";

const PAYPAL_EMAIL = "627891168@qq.com";
const BASE_URL = "https://ai-wallpaper-generator-tawny.vercel.app";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-purple-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <span className="text-xl font-bold">AI Wallpapers</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 py-16 w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Start for free, upgrade when you need more.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Free */}
          <div className="relative rounded-2xl p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-1">Free</h3>
              <p className="text-sm text-gray-500 mb-4">Try it out</p>
              <div className="text-4xl font-bold">$0</div>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "Standard resolution",
                "Small watermark on downloads",
                "Basic style options",
                "3 generations per day",
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/"
              className="block w-full py-3 rounded-xl text-sm font-semibold text-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-all"
            >
              Get Started
            </Link>
          </div>

          {/* Wallpaper Pack (Popular) */}
          <div className="relative rounded-2xl p-8 border border-purple-500 dark:border-purple-400 shadow-2xl shadow-purple-500/10 scale-105 bg-white dark:bg-gray-900">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
              MOST POPULAR
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-1">HD Wallpaper Pack</h3>
              <p className="text-sm text-gray-500 mb-4">15 premium wallpapers</p>
              <div className="text-4xl font-bold">$2.99</div>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "15 HD wallpapers (1920x1080)",
                "No watermark",
                "Various styles & themes",
                "Instant ZIP download",
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                </li>
              ))}
            </ul>
            <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
              <input type="hidden" name="cmd" value="_xclick" />
              <input type="hidden" name="business" value={PAYPAL_EMAIL} />
              <input type="hidden" name="item_name" value="HD Wallpaper Pack - 15 Premium AI Wallpapers" />
              <input type="hidden" name="amount" value="2.99" />
              <input type="hidden" name="currency_code" value="USD" />
              <input type="hidden" name="return" value={`${BASE_URL}/success`} />
              <input type="hidden" name="cancel_return" value={BASE_URL} />
              <button
                type="submit"
                className="w-full py-3 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
              >
                Buy Now - $2.99
              </button>
            </form>
          </div>

          {/* Custom Generation */}
          <div className="relative rounded-2xl p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-1">Custom Generation</h3>
              <p className="text-sm text-gray-500 mb-4">Create your own</p>
              <div className="text-4xl font-bold">$4.99</div>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "10 HD custom wallpapers",
                "No watermark",
                "Your choice of style & content",
                "1920x1080 resolution",
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                </li>
              ))}
            </ul>
            <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
              <input type="hidden" name="cmd" value="_xclick" />
              <input type="hidden" name="business" value={PAYPAL_EMAIL} />
              <input type="hidden" name="item_name" value="Premium Custom Generation - 10 HD Wallpapers" />
              <input type="hidden" name="amount" value="4.99" />
              <input type="hidden" name="currency_code" value="USD" />
              <input type="hidden" name="return" value={`${BASE_URL}/premium`} />
              <input type="hidden" name="cancel_return" value={BASE_URL} />
              <button
                type="submit"
                className="w-full py-3 rounded-xl text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white transition-all cursor-pointer"
              >
                Buy Now - $4.99
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
