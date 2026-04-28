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
    const model = genai.getGenerativeModel(
      { model: "gemini-2.5-flash" },
      { apiVersion: "v1beta" }
    );

    const prompt = `You are a gift expert for Saudi Arabia. Recommend 4 specific real products for this person.

Recipient: ${gender === "m" ? "Male" : "Female"}, age ${age}
Interests: ${(interests as string[]).length > 0 ? (interests as string[]).join(", ") : "general"}
Budget: up to ${budget} SAR

Rules:
- Use realistic SAR market prices (not made up)
- Each product from a different store: Amazon.sa, Noon.com, Jarir, Extra
- Build working search URLs for each store
- For imageUrl: use a real product image URL from the brand's official website or a CDN (e.g. m.media-amazon.com, images-na.ssl-images-amazon.com, images.noon.com). If unsure, leave empty string.
- Products must be genuinely different categories

IMPORTANT: Respond with ONLY a raw JSON array. No markdown, no code fences.
[
  {
    "id": "1",
    "name": "Brand + Full Product Name",
    "price": 150,
    "currency": "SAR",
    "store": "Amazon.sa",
    "url": "https://www.amazon.sa/s?k=PRODUCT+NAME+URL+ENCODED&language=en_AE",
    "imageUrl": "https://m.media-amazon.com/images/...",
    "badge": null,
    "inStock": true
  },
  {
    "id": "2",
    "name": "Brand + Full Product Name",
    "price": 250,
    "currency": "SAR",
    "store": "Noon.com",
    "url": "https://www.noon.com/saudi-en/search/?q=PRODUCT+NAME+URL+ENCODED",
    "imageUrl": "",
    "badge": null,
    "inStock": true
  },
  {
    "id": "3",
    "name": "Brand + Full Product Name",
    "price": 180,
    "currency": "SAR",
    "store": "Jarir",
    "url": "https://www.jarir.com/sa-en/catalogsearch/result/?q=PRODUCT+NAME+URL+ENCODED",
    "imageUrl": "",
    "badge": null,
    "inStock": true
  },
  {
    "id": "4",
    "name": "Brand + Full Product Name",
    "price": 400,
    "currency": "SAR",
    "store": "Extra",
    "url": "https://www.extra.com/en-sa/search/?q=PRODUCT+NAME+URL+ENCODED",
    "imageUrl": "",
    "badge": null,
    "inStock": true
  }
]`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
    });

    const text = result.response.text().trim().replace(/^```json\s*/i, "").replace(/```\s*$/i, "");
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("No JSON array in Gemini response");

    const products: GiftResult[] = JSON.parse(match[0]);

    // Ensure no badges
    const clean = products.slice(0, 4).map(p => ({ ...p, badge: null }));

    return NextResponse.json(deduplicateProducts(clean));
  } catch (err) {
    const msg = String(err);
    console.error("gift-search error:", msg);
    return NextResponse.json({ error: "Search failed — " + msg.slice(0, 200) }, { status: 500 });
  }
}
