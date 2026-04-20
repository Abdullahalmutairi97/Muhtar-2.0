import { NextRequest, NextResponse } from "next/server";
import type { GiftResult } from "@/types";

const MOCK: GiftResult[] = [
  {
    id: "1",
    name: "Apple AirPods Pro (2nd Gen)",
    price: 899,
    currency: "SAR",
    store: "Amazon.sa",
    url: "https://amazon.sa",
    imageUrl: "https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg",
    badge: "Best Value",
    inStock: true,
  },
  {
    id: "2",
    name: "Samsung Galaxy Watch 6 Classic",
    price: 1299,
    currency: "SAR",
    store: "Amazon.sa",
    url: "https://amazon.sa",
    imageUrl: "https://m.media-amazon.com/images/I/71Kc5-dEXmL._AC_SL1500_.jpg",
    badge: "Premium Choice",
    inStock: true,
  },
  {
    id: "3",
    name: "JBL Charge 5 Portable Speaker",
    price: 549,
    currency: "SAR",
    store: "Amazon.sa",
    url: "https://amazon.sa",
    imageUrl: "https://m.media-amazon.com/images/I/81QpkIctqPL._AC_SL1500_.jpg",
    inStock: true,
  },
  {
    id: "4",
    name: "Kindle Paperwhite (16 GB)",
    price: 449,
    currency: "SAR",
    store: "Amazon.sa",
    url: "https://amazon.sa",
    imageUrl: "https://m.media-amazon.com/images/I/61m1pFgsKVL._AC_SL1500_.jpg",
    inStock: false,
  },
];

export async function POST(_req: NextRequest) {
  await new Promise((r) => setTimeout(r, 1200));
  return NextResponse.json(MOCK);
}