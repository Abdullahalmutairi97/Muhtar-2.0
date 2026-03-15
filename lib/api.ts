import type { GiftResult, CompareResult } from "@/types";

export async function searchGifts(params: {
  gender: string;
  age: number;
  interests: string[];
  budget: number;
}): Promise<GiftResult[]> {
  const res = await fetch("/api/gift-search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? "Gift search failed");
  }
  return res.json();
}

export async function compareProducts(
  products: GiftResult[]
): Promise<CompareResult[]> {
  const res = await fetch("/api/compare-products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ products }),
  });
  if (!res.ok) throw new Error("Compare failed");
  return res.json();
}