import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const STORE_URLS: Record<string, (q: string) => string> = {
  "Amazon.sa": (q) => `https://www.amazon.sa/s?k=${encodeURIComponent(q)}&language=en_AE`,
  "Noon.com":  (q) => `https://www.noon.com/saudi-en/search/?q=${encodeURIComponent(q)}`,
};

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  try {
    const { q } = await req.json();
    if (!q) return NextResponse.json({ error: "No query" }, { status: 400 });

    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genai.getGenerativeModel({
      model: "gemini-2.5-flash",
      // @ts-expect-error thinkingConfig not in types yet
      generationConfig: { thinkingConfig: { thinkingBudget: 0 } },
    });

    const prompt = `You are a product comparison expert for Saudi Arabia.
Compare "${q}" against two strong alternatives available in Saudi stores.
Use realistic SAR prices.

IMPORTANT: Respond with ONLY a raw JSON object. No markdown, no code fences.
{
  "summary": "2-sentence comparison summary",
  "products": [
    {
      "name": "product name",
      "brand": "brand name",
      "price": 299,
      "searchQuery": "short search query for this product",
      "store": "Amazon.sa",
      "pros": ["pro 1", "pro 2", "pro 3"],
      "cons": ["con 1", "con 2"],
      "inStock": true
    },
    {
      "name": "competitor 1",
      "brand": "brand name",
      "price": 199,
      "searchQuery": "short search query",
      "store": "Noon.com",
      "pros": ["pro 1", "pro 2", "pro 3"],
      "cons": ["con 1", "con 2"],
      "inStock": true
    },
    {
      "name": "competitor 2",
      "brand": "brand name",
      "price": 399,
      "searchQuery": "short search query",
      "store": "Amazon.sa",
      "pros": ["pro 1", "pro 2", "pro 3"],
      "cons": ["con 1", "con 2"],
      "inStock": true
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim()
      .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object in Gemini response");

    const data = JSON.parse(match[0]) as {
      summary: string;
      products: Array<{
        name: string; brand: string; price: number;
        searchQuery?: string; store: string;
        pros: string[]; cons: string[]; inStock: boolean;
      }>;
    };

    // Build URLs server-side
    data.products = data.products.map(p => {
      const query = p.searchQuery || `${p.brand} ${p.name}`;
      const urlFn = STORE_URLS[p.store] ?? STORE_URLS["Amazon.sa"];
      return { ...p, url: urlFn(query), imageUrl: "" };
    });

    return NextResponse.json(data);
  } catch (err) {
    const msg = String(err);
    console.error("compare-products error:", msg);
    return NextResponse.json({ error: "Compare failed — " + msg.slice(0, 120) }, { status: 500 });
  }
}
