import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { deduplicateProducts } from "@/utils/deduplicateProducts";
import type { GiftResult } from "@/types";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });
    }

    const { gender, age, interests, budget } = await req.json();
    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genai.getGenerativeModel(
      { model: "gemini-2.0-flash" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { apiVersion: "v1beta" } as any
    );

    const prompt = `Search Amazon.sa right now and find 4 real gift products for:
- Recipient: ${gender === "m" ? "Male" : "Female"}, age ${age}
- Interests: ${(interests as string[]).length > 0 ? (interests as string[]).join(", ") : "general interests"}
- Budget: up to ${budget} SAR

Use Google Search to find REAL current products on amazon.sa that are within the budget.
Return ONLY a valid JSON array of exactly 4 objects, no markdown, no explanation:
[
  {
    "id": "1",
    "name": "exact product name with brand",
    "price": number in SAR within budget,
    "currency": "SAR",
    "store": "Amazon.sa",
    "url": "real amazon.sa product or search URL",
    "imageUrl": "",
    "badge": "Best Value" or "Premium Choice" or null,
    "inStock": true
  }
]
Rules:
- Prices MUST be within ${budget} SAR
- Each product from a different category
- Tailored to the recipient's interests and age
- Assign "Best Value" to cheapest, "Premium Choice" to best quality`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [{ googleSearch: {} }] as any,
    });

    const text = result.response.text().trim();
    const match = text.match(/\[[\s\S]*?\]/);
    if (!match) throw new Error("No JSON in response");

    const products: GiftResult[] = JSON.parse(match[0]);
    return NextResponse.json(deduplicateProducts(products.slice(0, 4)));
  } catch (err) {
    console.error("gift-search error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
