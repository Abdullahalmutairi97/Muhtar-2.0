import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CompareResult, GiftResult } from "@/types";

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genai.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function POST(req: NextRequest) {
  try {
    const { products }: { products: GiftResult[] } = await req.json();

    const prompt = `You are a product comparison assistant for Saudi Arabia.
Compare the following ${products.length} products and generate pros, cons, and an AI summary for each.

Products:
${products.map((p, i) => `${i + 1}. ${p.name} — ${p.price} SAR — ${p.inStock ? "In stock" : "Out of stock"}`).join("\n")}

Return ONLY a valid JSON array with exactly ${products.length} objects in the same order:
[
  {
    "pros": ["pro 1", "pro 2", "pro 3"],
    "cons": ["con 1", "con 2"],
    "aiSummary": "2-sentence summary of this product as a gift choice"
  }
]

Rules:
- 3 pros and 2 cons per product
- Keep each point concise (under 10 words)
- aiSummary should mention the product name and why it makes a good or average gift
- Consider the Saudi market context`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const match = text.match(/\[[\s\S]*\]/);

    if (!match) throw new Error("No JSON in response");

    const comparisons: { pros: string[]; cons: string[]; aiSummary: string }[] = JSON.parse(match[0]);

    const output: CompareResult[] = products.map((product, i) => ({
      product,
      pros: comparisons[i]?.pros ?? ["Good build quality", "Popular choice", "Available locally"],
      cons: comparisons[i]?.cons ?? ["Price may vary", "Limited warranty"],
      aiSummary: comparisons[i]?.aiSummary ?? `${product.name} is a solid gift option within the ${product.price} SAR range.`,
    }));

    return NextResponse.json(output);
  } catch (err) {
    console.error("compare-products error:", err);
    return NextResponse.json({ error: "Comparison failed" }, { status: 500 });
  }
}