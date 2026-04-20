"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CompareCard from "@/components/CompareCard";
import { Button } from "@/components/ui/button";
import { compareProducts } from "@/lib/api";
import type { CompareResult, GiftResult } from "@/types";
import { Loader2, ArrowLeft } from "lucide-react";

export default function ComparePage() {
  const router = useRouter();
  const [results, setResults] = useState<CompareResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("muhtar_compare");
    if (!raw) { setLoading(false); return; }
    const products: GiftResult[] = JSON.parse(raw);
    if (products.length < 2) { setLoading(false); return; }

    compareProducts(products)
      .then(setResults)
      .catch(() => setError("Comparison failed. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" /> Comparing products…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" onClick={() => router.push("/gifts")}>
          Back to Gifts
        </Button>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-sm text-muted-foreground">
          No products selected. Go back and pick up to 3 gifts to compare.
        </p>
        <Button onClick={() => router.push("/gifts")}>Find Gifts</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/gifts")} className="gap-1.5">
          <ArrowLeft className="size-4" /> Back
        </Button>
        <p className="text-sm text-muted-foreground">
          Comparing {results.length} product{results.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className={`grid gap-4 ${
        results.length === 2 ? "grid-cols-1 sm:grid-cols-2" :
        results.length === 3 ? "grid-cols-1 sm:grid-cols-3" :
        "grid-cols-1"
      }`}>
        {results.map((r) => (
          <CompareCard key={r.product.id} result={r} />
        ))}
      </div>
    </div>
  );
}