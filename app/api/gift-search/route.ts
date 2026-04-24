import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { deduplicateProducts } from "@/utils/deduplicateProducts";
import type { GiftResult } from "@/types";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(getFallback());
    }

    const { gender, age, interests, budget } = await req.json();

    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genai.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a gift recommendation assistant for Saudi Arabia.
Suggest 4 unique, specific gift products available on Amazon.sa for:
- Recipient: ${gender === "m" ? "Male" : "Female"}, age ${age}
- Interests: ${interests.length > 0 ? interests.join(", ") : "general"}
- Budget: up to ${budget} SAR

Return ONLY a valid JSON array of exactly 4 objects, no explanation:
[
  {
    "id": "unique string",
    "name": "full product name including brand",
    "price": number (SAR, must be within budget),
    "currency": "SAR",
    "store": "Amazon.sa",
    "url": "https://www.amazon.sa/s?k=url+encoded+product+name",
    "imageUrl": "",
    "badge": "Best Value" or "Premium Choice" or null,
    "inStock": true
  }
]

Rules:
- All prices must be realistic Saudi market prices, within ${budget} SAR
- Assign "Best Value" badge to 1 product and "Premium Choice" badge to 1 product only
- Each product must be from a different category
- Tailor suggestions specifically to the recipient's interests and age
- Use realistic Amazon.sa search URLs: https://www.amazon.sa/s?k=product+name+here`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const match = text.match(/\[[\s\S]*\]/);

    if (!match) return NextResponse.json(getFallback());

    const products: GiftResult[] = JSON.parse(match[0]);
    const deduped = deduplicateProducts(products.slice(0, 4));
    return NextResponse.json(deduped);
  } catch (err) {
    console.error("gift-search error:", err);
    return NextResponse.json(getFallback());
  }
}

function getFallback(): GiftResult[] {
  return [
    { id: "f1", name: "Apple AirPods Pro (2nd Gen)", price: 899, currency: "SAR", store: "Amazon.sa", url: "https://www.amazon.sa/s?k=apple+airpods+pro", imageUrl: "", badge: "Best Value", inStock: true },
    { id: "f2", name: "Samsung Galaxy Watch 6 Classic", price: 1299, currency: "SAR", store: "Amazon.sa", url: "https://www.amazon.sa/s?k=samsung+galaxy+watch+6", imageUrl: "", badge: "Premium Choice", inStock: true },
    { id: "f3", name: "JBL Charge 5 Portable Speaker", price: 549, currency: "SAR", store: "Amazon.sa", url: "https://www.amazon.sa/s?k=jbl+charge+5", imageUrl: "", badge: undefined, inStock: true },
    { id: "f4", name: "Kindle Paperwhite (16 GB)", price: 449, currency: "SAR", store: "Amazon.sa", url: "https://www.amazon.sa/s?k=kindle+paperwhite", imageUrl: "", badge: undefined, inStock: true },
  ];
}
