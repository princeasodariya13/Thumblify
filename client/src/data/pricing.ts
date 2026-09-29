import type { IPricing } from "../types";

export const pricingData: IPricing[] = [
  {
    name: "Basic",
    price: 49,
    period: "100 credits",
    features: [
      "10 Premium AI Thumbnails",
      "Best for starters",
      "Access to all AI models",
      "No watermark on downloads",
      "High-quality",
      "Commercial usage allowed",
      "Credits never expire",
    ],
    mostPopular: false,
  },
  {
    name: "Pro",
    price: 199,
    period: "500 credits",
    features: [
      "50 Premium AI Thumbnails",
"Best for intermediate",
"Access to all AI models",
"No watermark on downloads",
"High-quality",
"Commercial usage allowed",
"Credits never expire"
    ],
    mostPopular: true,
  },
  {
    name: "Enterprise",
    price:599,
    period: "month",
    features: [
      "150 Premium AI Thumbnails",
"Best for professionals",
"Access to all AI models",
"No watermark on downloads",
"High-quality",
"Commercial usage allowed",
"Credits never expire"
    ],
    mostPopular: false,
  },
];
