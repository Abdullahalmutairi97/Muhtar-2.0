import type { GiftResult } from "@/types";

export function deduplicateProducts(products: GiftResult[]): GiftResult[] {
  const seen = new Set<string>();
  return products.filter((p) => {
    const key = p.name.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}