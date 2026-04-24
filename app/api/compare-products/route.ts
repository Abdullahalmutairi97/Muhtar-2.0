import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import FirecrawlApp from "@mendable/firecrawl-js";

export async function POST(req: NextRequest) {
  try {
    const { q } = await req.json();
    if (!q) return NextResponse.json({ error: "No query" }, { status: 400 });

    if (!process.env.GEMINI_API_KEY || !process.env.FIRECRAWL_API_KEY) {
      return NextResponse.json(getFallback(q));
    }

    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
    const model = genai.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Step 1: Generate 3 search queries (exact product + 2 competitors)
    const queryPrompt = `You are a product comparison assistant for Saudi Arabia.
Generate 3 Amazon.sa search queries for comparing "${q}" against two alternatives:
1. One query for the exact product: "${q}"
2. Two queries for strong competitors from different brands

Return ONLY a JSON array of 3 strings, no explanation.
Example: ["AirPods Pro 2nd gen", "Sony WF-1000XM5", "Samsung Galaxy Buds2 Pro"]`;

    const queryResult = await model.generateContent(queryPrompt);
    const queryText = queryResult.response.text().trim();
    const jsonMatch = queryText.match(/\[[\s\S]*\]/);
    const queries: string[] = jsonMatch ? JSON.parse(jsonMatch[0]) : [q, `${q} alternative`, `${q} competitor`];

    // Step 2: Firecrawl each query
    const searchResults = await Promise.allSettled(
      queries.map((query) =>
        firecrawl.search(`site:amazon.sa ${query}`, { limit: 2, scrapeOptions: { formats: ["markdown"] } })
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

    // Step 3: Extract 3 products with pros/cons/badges
    const extractPrompt = `You are a product comparison assistant for Saudi Arabia.
From these Amazon.sa search results, extract exactly 3 products for comparison.
The first should be "${q}" (or closest match), the other two should be strong competitors.

Search results:
${scrapedContent.slice(0, 12000)}

Return ONLY a valid JSON object with this structure:
{
  "summary": "2-sentence overall comparison summary",
  "products": [
    {
      "name": "product name without brand",
      "brand": "brand name",
      "price": number (SAR),
      "imageUrl": "https://... or empty string",
      "url": "https://amazon.sa/...",
      "badge": "value" or "premium" or null,
      "pros": ["pro 1", "pro 2", "pro 3"],
      "cons": ["con 1", "con 2"],
      "inStock": true or false
    }
  ]
}

Rules:
- Assign "value" badge to best price-to-quality, "premium" to highest-end (max 1 each)
- Exactly 3 pros and 2 cons per product (concise, under 10 words each)
- All prices in SAR`;

    const extractResult = await model.generateContent(extractPrompt);
    const extractText = extractResult.response.text().trim();
    const objMatch = extractText.match(/\{[\s\S]*\}/);
    if (!objMatch) return NextResponse.json(getFallback(q));

    const result = JSON.parse(objMatch[0]);
    return NextResponse.json(result);
  } catch (err) {
    console.error("compare-products error:", err);
    return NextResponse.json(getFallback("product"), { status: 200 });
  }
}

function getFallback(q: string) {
  return {
    summary: `Comparing ${q} against two strong alternatives from Amazon.sa. All three are solid choices depending on your budget and priorities.`,
    products: [
      {
        name: q, brand: "—", price: 599, imageUrl: "", url: "https://amazon.sa",
        badge: null, inStock: true,
        pros: ["Popular choice", "Good build quality", "Wide availability"],
        cons: ["Price may vary", "Check local warranty"],
      },
      {
        name: "Alternative A", brand: "—", price: 449, imageUrl: "", url: "https://amazon.sa",
        badge: "value", inStock: true,
        pros: ["Better value", "Comparable features", "Strong reviews"],
        cons: ["Less premium feel", "Smaller brand presence"],
      },
      {
        name: "Alternative B", brand: "—", price: 899, imageUrl: "", url: "https://amazon.sa",
        badge: "premium", inStock: true,
        pros: ["Top-tier quality", "Best-in-class features", "Long warranty"],
        cons: ["Higher price", "May be overkill for casual use"],
      },
    ],
  };
}