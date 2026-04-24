import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { deduplicateProducts } from "@/utils/deduplicateProducts";
import type { GiftResult } from "@/types";

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  try {
    const { gender, age, interests, budget } = await req.json();
    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genai.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a gift assistant for Saudi Arabia. Recommend 4 specific real products sold on Amazon.sa.

Recipient: ${gender === "m" ? "Male" : "Female"}, age ${age}
Interests: ${(interests as string[]).length > 0 ? (interests as string[]).join(", ") : "general"}
Budget: up to ${budget} SAR

IMPORTANT: Respond with ONLY a raw JSON array. No markdown, no code fences, no explanation.
[
  {
    "id": "1",
    "name": "Brand + Full Product Name",
    "price": <number within ${budget} SAR>,
    "currency": "SAR",
    "store": "Amazon.sa",
    "url": "https://www.amazon.sa/s?k=product+name+url+encoded",
    "imageUrl": "",
    "badge": "Best Value",
    "inStock": true
  },
  {
    "id": "2",
    "name": "Brand + Full Product Name",
    "price": <number within ${budget} SAR>,
    "currency": "SAR",
    "store": "Amazon.sa",
    "url": "https://www.amazon.sa/s?k=product+name+url+encoded",
    "imageUrl": "",
    "badge": null,
    "inStock": true
  },
  {
    "id": "3",
    "name": "Brand + Full Product Name",
    "price": <number within ${budget} SAR>,
    "currency": "SAR",
    "store": "Amazon.sa",
    "url": "https://www.amazon.sa/s?k=product+name+url+encoded",
    "imageUrl": "",
    "badge": null,
    "inStock": true
  },
  {
    "id": "4",
    "name": "Brand + Full Product Name",
    "price": <number within ${budget} SAR>,
    "currency": "SAR",
    "store": "Amazon.sa",
    "url": "https://www.amazon.sa/s?k=product+name+url+encoded",
    "imageUrl": "",
    "badge": "Premium Choice",
    "inStock": true
  }
]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/^```json\s*/i, "").replace(/```\s*$/i, "");
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("No JSON array in Gemini response");

    const products: GiftResult[] = JSON.parse(match[0]);
    return NextResponse.json(deduplicateProducts(products.slice(0, 4)));
  } catch (err) {
    const msg = String(err);
    console.error("gift-search error:", msg);
    const friendly = msg.includes("quota") || msg.includes("429")
      ? "API quota reached — try again later or enable billing at console.cloud.google.com"
      : msg.includes("API_KEY") || msg.includes("key")
      ? "Invalid Gemini API key"
      : "Search failed — " + msg.slice(0, 120);
    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}
