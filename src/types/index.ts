export interface GenerateRequest {
  prompt: string;
  style?: string;
  width?: number;
  height?: number;
}

export interface GenerateResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  id?: string;
}

export interface StripeSessionResponse {
  sessionId: string;
  url: string | null;
}

export interface WallpaperPack {
  id: string;
  name: string;
  description: string;
  price: number;
  priceId: string;
  credits: number;
}

export const WALLPAPER_PACKS: WallpaperPack[] = [
  {
    id: "single",
    name: "Single Wallpaper",
    description: "One stunning AI-generated wallpaper, high resolution",
    price: 299, // $2.99 in cents
    priceId: "price_single", // Replace with actual Stripe price ID
    credits: 1,
  },
  {
    id: "premium",
    name: "Premium Pack",
    description: "5 wallpapers at a discounted price",
    price: 999, // $9.99
    priceId: "price_premium",
    credits: 5,
  },
  {
    id: "unlimited",
    name: "Monthly Unlimited",
    description: "Unlimited generations for one month",
    price: 1999, // $19.99
    priceId: "price_unlimited",
    credits: 999,
  },
];
