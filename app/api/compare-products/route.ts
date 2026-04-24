import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { q } = await req.json();
    if (!q) return NextResponse.json({ error: "No query" }, { status: 400 });

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(getFallback(q));
    }

    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genai.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a product comparison assistant for Saudi Arabia.
Compare "${q}" against two strong alternatives available on Amazon.sa.

Return ONLY a valid JSON object, no explanation:
{
  "summary": "2-sentence overall comparison summary",
  "products": [
    {
      "name": "product name without brand",
      "brand": "brand name",
      "price": number (realistic SAR price),
      "imageUrl": "",
      "url": "https://www.amazon.sa/s?k=url+encoded+product+name",
      "badge": "value" or "premium" or null,
      "pros": ["pro 1", "pro 2", "pro 3"],
      "cons": ["con 1", "con 2"],
      "inStock": true
    }
  ]
}

Rules:
- First product must be "${q}" (or closest real match)
- Second and third must be strong competitors from different brands
- Assign "value" badge to best price-to-quality product, "premium" to highest-end (max 1 each)
- Exactly 3 pros and 2 cons per product, concise (under 10 words each)
- All prices must be realistic Saudi market prices in SAR
- Use Amazon.sa search URLs: https://www.amazon.sa/s?k=product+name+here`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json(getFallback(q));

    return NextResponse.json(JSON.parse(match[0]));
  } catch (err) {
    console.error("compare-products error:", err);
    return NextResponse.json(getFallback("product"));
  }
}

function getFallback(q: string) {
  return {
    summary: `Comparing ${q} against two strong alternatives from Amazon.sa. All three are solid choices depending on your budget and priorities.`,
    products: [
      {
        name: q, brand: "—", price: 599, imageUrl: "", url: `https://www.amazon.sa/s?k=${encodeURIComponent(q)}`,
        badge: null, inStock: true,
        pros: ["Popular choice", "Good build quality", "Wide availability"],
        cons: ["Price may vary", "Check local warranty"],
      },
      {
        name: "Alternative A", brand: "—", price: 449, imageUrl: "", url: "https://www.amazon.sa",
        badge: "value", inStock: true,
        pros: ["Better value", "Comparable features", "Strong reviews"],
        cons: ["Less premium feel", "Smaller brand presence"],
      },
      {
        name: "Alternative B", brand: "—", price: 899, imageUrl: "", url: "https://www.amazon.sa",
        badge: "premium", inStock: true,
        pros: ["Top-tier quality", "Best-in-class features", "Long warranty"],
        cons: ["Higher price", "May be overkill for casual use"],
      },
    ],
  };
}
