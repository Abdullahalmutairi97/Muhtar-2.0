import { NextRequest, NextResponse } from "next/server";
import type { CompareResult, GiftResult } from "@/types";

function mockCompare(product: GiftResult): CompareResult {
  return {
    product,
    pros: [
      "Great build quality",
      "Good value for the price",
      "Widely available in Saudi Arabia",
    ],
    cons: [
      "Limited warranty support locally",
      product.inStock ? "High demand — stock may vary" : "Currently out of stock",
    ],
    aiSummary: `${product.name} is a solid choice ${
      product.badge === "Best Value"
        ? "offering excellent value for money"
        : product.badge === "Premium Choice"
        ? "for those who want premium quality"
        : "for the recipient"
    } within a SAR ${product.price.toLocaleString("en-SA")} budget.`,
  };
}

export async function POST(req: NextRequest) {
  const { products } = await req.json() as { products: GiftResult[] };
  await new Promise((r) => setTimeout(r, 900));
  return NextResponse.json(products.map(mockCompare));
}