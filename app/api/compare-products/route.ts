import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { q } = await req.json();
    if (!q) return NextResponse.json({ error: "No query" }, { status: 400 });

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });
    }

    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genai.getGenerativeModel(
      { model: "gemini-2.0-flash" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { apiVersion: "v1beta" } as any
    );

    const prompt = `Search Amazon.sa right now and compare "${q}" against two strong alternatives.
Find REAL current products and prices on amazon.sa using Google Search.

Return ONLY a valid JSON object, no markdown, no explanation:
{
  "summary": "2-sentence comparison summary",
  "products": [
    {
      "name": "product name without brand",
      "brand": "brand name",
      "price": number in SAR,
      "imageUrl": "",
      "url": "real amazon.sa product or search URL",
      "badge": "value" or "premium" or null,
      "pros": ["pro 1", "pro 2", "pro 3"],
      "cons": ["con 1", "con 2"],
      "inStock": true
    }
  ]
}
Rules:
- First product must be "${q}"
- Two strong competitors from different brands
- Assign "value" badge to best price-to-quality, "premium" to highest-end (max 1 each)
- Exactly 3 pros and 2 cons per product, under 10 words each
- Real SAR prices from Amazon.sa`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [{ googleSearch: {} }] as any,
    });

    const text = result.response.text().trim();
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in response");

    return NextResponse.json(JSON.parse(match[0]));
  } catch (err) {
    console.error("compare-products error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
