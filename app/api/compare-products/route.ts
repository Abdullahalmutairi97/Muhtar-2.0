import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  try {
    const { q } = await req.json();
    if (!q) return NextResponse.json({ error: "No query" }, { status: 400 });

    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genai.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a product comparison expert for Saudi Arabia.
Compare "${q}" against two strong alternatives available in Saudi stores (Amazon.sa, Noon.com, Jarir, Extra).
Use realistic SAR prices. Pick the best store URL per product.

IMPORTANT: Respond with ONLY a raw JSON object. No markdown, no code fences, no explanation.
{
  "summary": "2-sentence comparison summary explaining the key trade-offs",
  "products": [
    {
      "name": "product name without brand",
      "brand": "brand name",
      "price": <realistic SAR price>,
      "imageUrl": "",
      "url": "https://www.amazon.sa/s?k=product+name+url+encoded",
      "badge": "value",
      "pros": ["pro 1", "pro 2", "pro 3"],
      "cons": ["con 1", "con 2"],
      "inStock": true
    },
    {
      "name": "competitor 1 name",
      "brand": "brand name",
      "price": <realistic SAR price>,
      "imageUrl": "",
      "url": "https://www.noon.com/saudi-en/search/?q=competitor+name+url+encoded",
      "badge": null,
      "pros": ["pro 1", "pro 2", "pro 3"],
      "cons": ["con 1", "con 2"],
      "inStock": true
    },
    {
      "name": "competitor 2 name",
      "brand": "brand name",
      "price": <realistic SAR price>,
      "imageUrl": "",
      "url": "https://www.amazon.sa/s?k=competitor+name+url+encoded",
      "badge": "premium",
      "pros": ["pro 1", "pro 2", "pro 3"],
      "cons": ["con 1", "con 2"],
      "inStock": true
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/^```json\s*/i, "").replace(/```\s*$/i, "");
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object in Gemini response");

    return NextResponse.json(JSON.parse(match[0]));
  } catch (err) {
    const msg = String(err);
    console.error("compare-products error:", msg);
    const friendly = msg.includes("quota") || msg.includes("429")
      ? "API quota reached — try again later or enable billing at console.cloud.google.com"
      : "Compare failed — " + msg.slice(0, 120);
    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}
