"use client";

import Link from "next/link";
import { Sparkles, Check, ArrowLeft } from "lucide-react";

const PAYPAL_EMAIL = "627891168@qq.com";
const BASE_URL = "https://ai-wallpaper-generator-tawny.vercel.app";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period?: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
  paypalAmount?: string;
}

const plans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Try it out",
    features: [
      "Standard resolution",
      "Small watermark on downloads",
      "Basic style options",
      "3 generations per day",
    ],
    cta: "Get Started",
  },
  {
    id: "single",
    name: "Single Download",
    price: 299,
    description: "One HD wallpaper, no watermark",
    features: [
      "HD resolution (up to 4K)",
      "No watermark",
      "All styles & aspect ratios",
      "One-time purchase",
    ],
    popular: true,
    cta: "Buy Now - $2.99",
    paypalAmount: "2.99",
  },
  {
    id: "monthly",
    name: "Monthly Unlimited",
    price: 999,
    period: "/month",
    description: "Best for creators",
    features: [
      "Unlimited generations",
      "HD resolution (up to 4K)",
      "No watermark",
      "All styles & aspect ratios",
      "Priority generation speed",
    ],
    cta: "Subscribe - $9.99/mo",
    paypalAmount: "9.99",
  },
];

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
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 border ${
                plan.popular
                  ? "border-purple-500 dark:border-purple-400 shadow-2xl shadow-purple-500/10 scale-105"
                  : "border-gray-200 dark:border-gray-700"
              } bg-white dark:bg-gray-900`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    ${(plan.price / 100).toFixed(2)}
                  </span>
                  {plan.period && (
                    <span className="text-gray-500">{plan.period}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {plan.id === "free" ? (
                <Link
                  href="/"
                  className="block w-full py-3 rounded-xl text-sm font-semibold text-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-all"
                >
                  Get Started
                </Link>
              ) : (
                <form
                  action="https://www.paypal.com/cgi-bin/webscr"
                  method="post"
                  target="_blank"
                >
                  <input type="hidden" name="cmd" value="_xclick" />
                  <input type="hidden" name="business" value={PAYPAL_EMAIL} />
                  <input
                    type="hidden"
                    name="item_name"
                    value={`AI Wallpaper - ${plan.name}`}
                  />
                  <input type="hidden" name="amount" value={plan.paypalAmount} />
                  <input type="hidden" name="currency_code" value="USD" />
                  <input type="hidden" name="return" value={`${BASE_URL}/success`} />
                  <input type="hidden" name="cancel_return" value={BASE_URL} />
                  <button
                    type="submit"
                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      plan.popular
                        ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25"
                        : "bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 text-white"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
