import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import FirecrawlApp from "@mendable/firecrawl-js";
import { deduplicateProducts } from "@/utils/deduplicateProducts";
import type { GiftResult } from "@/types";

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! });

const model = genai.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function POST(req: NextRequest) {
  try {
    const { gender, age, interests, budget } = await req.json();

    // Step 1: Gemini generates 4 Amazon.sa search queries
    const queryPrompt = `You are a gift recommendation assistant for Saudi Arabia.
Generate 4 diverse Amazon.sa search queries for a gift with these details:
- Recipient: ${gender}, age ${age}
- Interests: ${interests.length > 0 ? interests.join(", ") : "general"}
- Budget: up to ${budget} SAR

Rules:
- Each query should target a different gift category
- Keep queries short and specific (3-6 words)
- Suitable for Saudi Arabian market
- Return ONLY a JSON array of 4 strings, no explanation

Example: ["wireless earbuds", "smart watch fitness", "gaming headset ps5", "kindle e-reader"]`;

    const queryResult = await model.generateContent(queryPrompt);
    const queryText = queryResult.response.text().trim();
    const jsonMatch = queryText.match(/\[[\s\S]*\]/);
    const queries: string[] = jsonMatch ? JSON.parse(jsonMatch[0]) : ["gift ideas"];

    // Step 2: Firecrawl searches Amazon.sa for each query
    const searchResults = await Promise.allSettled(
      queries.map((q) =>
        firecrawl.search(`site:amazon.sa ${q}`, { limit: 3, scrapeOptions: { formats: ["markdown"] } })
      )
    );

    const scrapedContent = searchResults
      .map((r, i) => {
        if (r.status === "fulfilled") {
          const val = r.value as { success?: boolean; data?: { markdown?: string; url?: string }[] };
          if (val.success && val.data) {
            return val.data
              .map((d) => `Query: ${queries[i]}\nURL: ${d.url}\n${d.markdown ?? ""}`)
              .join("\n---\n");
          }
        }
        return "";
      })
      .filter(Boolean)
      .join("\n===\n");

    // Step 3: Gemini extracts and ranks 4 best products
    const extractPrompt = `You are a gift recommendation assistant for Saudi Arabia.
From the following Amazon.sa search results, extract the 4 best unique gift products.

Budget limit: ${budget} SAR
Recipient: ${gender}, age ${age}
Interests: ${interests.length > 0 ? interests.join(", ") : "general"}

Search results:
${scrapedContent.slice(0, 12000)}

Return ONLY a valid JSON array of exactly 4 objects with this structure:
[
  {
    "id": "unique string",
    "name": "full product name",
    "price": number (in SAR, must be within budget),
    "currency": "SAR",
    "store": "Amazon.sa",
    "url": "https://amazon.sa/...",
    "imageUrl": "https://... (product image URL or empty string)",
    "badge": "Best Value" or "Premium Choice" or null,
    "inStock": true or false
  }
]

Rules:
- All prices must be in SAR and within the ${budget} SAR budget
- Assign "Best Value" badge to the best value product, "Premium Choice" to the most premium
- Only assign badges to 1 product each at most
- Use real URLs from the search results
- Deduplicate — no two products should be the same item
- If price is unclear, estimate based on the product type within budget`;

    const extractResult = await model.generateContent(extractPrompt);
    const extractText = extractResult.response.text().trim();
    const extractMatch = extractText.match(/\[[\s\S]*\]/);

    if (!extractMatch) {
      return NextResponse.json(getFallback(), { status: 200 });
    }

    const products: GiftResult[] = JSON.parse(extractMatch[0]);
    const deduped = deduplicateProducts(products.slice(0, 4));

    return NextResponse.json(deduped);
  } catch (err) {
    console.error("gift-search error:", err);
    return NextResponse.json(getFallback());
  }
}

function getFallback(): GiftResult[] {
  return [
    { id: "f1", name: "Apple AirPods Pro (2nd Gen)", price: 899, currency: "SAR", store: "Amazon.sa", url: "https://amazon.sa", imageUrl: "https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg", badge: "Best Value", inStock: true },
    { id: "f2", name: "Samsung Galaxy Watch 6 Classic", price: 1299, currency: "SAR", store: "Amazon.sa", url: "https://amazon.sa", imageUrl: "https://m.media-amazon.com/images/I/71Kc5-dEXmL._AC_SL1500_.jpg", badge: "Premium Choice", inStock: true },
    { id: "f3", name: "JBL Charge 5 Portable Speaker", price: 549, currency: "SAR", store: "Amazon.sa", url: "https://amazon.sa", imageUrl: "https://m.media-amazon.com/images/I/81QpkIctqPL._AC_SL1500_.jpg", badge: undefined, inStock: true },
    { id: "f4", name: "Kindle Paperwhite (16 GB)", price: 449, currency: "SAR", store: "Amazon.sa", url: "https://amazon.sa", imageUrl: "https://m.media-amazon.com/images/I/61m1pFgsKVL._AC_SL1500_.jpg", badge: undefined, inStock: false },
  ];
}