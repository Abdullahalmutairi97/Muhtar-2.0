import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { deduplicateProducts } from "@/utils/deduplicateProducts";
import type { GiftResult } from "@/types";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function resolveAmazon(query: string): Promise<{ url: string; imageUrl: string }> {
  const fallback = `https://www.amazon.sa/s?k=${encodeURIComponent(query)}&language=en_AE`;
  try {
    const res = await fetch(
      `https://www.amazon.sa/s?k=${encodeURIComponent(query)}&language=en_AE`,
      { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(4000) }
    );
    const html = await res.text();

    // Extract first product URL
    const dpMatch = html.match(/href="(\/[^"]*\/dp\/[A-Z0-9]{10}[^"]*?)"/);
    const productUrl = dpMatch ? `https://www.amazon.sa${dpMatch[1].split('"')[0]}` : fallback;

    // Extract first product image
    const imgMatch = html.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9%._-]+\.jpg/);
    const imageUrl = imgMatch ? imgMatch[0] : "";

    return { url: productUrl, imageUrl };
  } catch {
    return { url: fallback, imageUrl: "" };
  }
}

async function fetchImage(query: string): Promise<string> {
  if (!process.env.UNSPLASH_ACCESS_KEY) return "";
  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=squarish&client_id=${process.env.UNSPLASH_ACCESS_KEY}`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (!res.ok) return "";
    const data = await res.json() as { urls?: { small?: string } };
    return data.urls?.small ?? "";
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  try {
    const { gender, age, interests, budget } = await req.json();
    const seed = Math.random().toString(36).slice(2, 8);
    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genai.getGenerativeModel({
      model: "gemini-2.5-flash",
      // @ts-expect-error thinkingConfig not in types yet
      generationConfig: { thinkingConfig: { thinkingBudget: 0 } },
    });

    const prompt = `You are a Saudi Arabia gift expert. Return ONLY a JSON array (no markdown, no explanation) with exactly 4 gift suggestions. Seed: ${seed}

Recipient: ${gender === "m" ? "Male" : "Female"}, age ${age}, interests: ${(interests as string[]).join(", ") || "general"}, budget: up to ${budget} SAR.

Each item must have these exact fields:
- id: "1" to "4"
- name: real brand + product name
- price: realistic SAR price (number)
- currency: "SAR"
- store: "Amazon.sa" or "Noon.com" — mix them
- searchQuery: short English search query (e.g. "Sony WH-1000XM5 headphones")
- inStock: true

Always suggest different products each time. Different categories. Realistic Saudi Arabia prices.`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim()
      .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");

    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("No JSON array: " + raw.slice(0, 200));

    const products = JSON.parse(match[0]) as Array<GiftResult & { searchQuery?: string }>;
    const slice = products.slice(0, 4);

    // Resolve Amazon products (direct links + images), Noon gets search link + Unsplash image
    const resolved = await Promise.all(slice.map(async (p) => {
      const query = p.searchQuery || p.name;
      if (p.store === "Amazon.sa") {
        const { url, imageUrl } = await resolveAmazon(query);
        return { url, imageUrl };
      } else {
        const url = `https://www.noon.com/saudi-en/search/?q=${encodeURIComponent(query)}`;
        const imageUrl = await fetchImage(query);
        return { url, imageUrl };
      }
    }));

    const clean: GiftResult[] = slice.map((p, i) => ({
      id: String(i + 1),
      name: p.name,
      price: Number(p.price),
      currency: "SAR",
      store: p.store,
      url: resolved[i].url,
      imageUrl: resolved[i].imageUrl,
      inStock: true,
    }));

    return NextResponse.json(deduplicateProducts(clean));
  } catch (err) {
    const msg = String(err);
    console.error("gift-search error:", msg);
    return NextResponse.json({ error: "Search failed — " + msg.slice(0, 200) }, { status: 500 });
  }
}
