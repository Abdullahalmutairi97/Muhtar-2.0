"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GiftCard from "@/components/GiftCard";
import { searchGifts } from "@/lib/api";
import { deduplicateProducts } from "@/utils/deduplicateProducts";
import type { GiftResult } from "@/types";
import { X, Loader2, GitCompare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCredits } from "@/hooks/useCredits";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import GiftCardSkeleton from "@/components/GiftCardSkeleton";
import { toast } from "sonner";

const BUDGET_STEPS = [
  100, 200, 300, 400, 500, 600, 700, 800, 900,
  1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 7500, 10000,
];

const GENDERS = ["Male", "Female", "Any"] as const;
type Gender = (typeof GENDERS)[number];

const INTEREST_SUGGESTIONS = [
  "Tech", "Gaming", "Books", "Fitness", "Travel",
  "Cooking", "Fashion", "Music", "Art", "Sports",
];

export default function GiftsPage() {
  const router = useRouter();
  const [gender, setGender] = useState<Gender>("Any");
  const [age, setAge] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");
  const [budgetIdx, setBudgetIdx] = useState(9);
  const [results, setResults] = useState<GiftResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [compareList, setCompareList] = useState<GiftResult[]>([]);

  const { credits, deduct } = useCredits();
  const { addEntry } = useSearchHistory();
  const budget = BUDGET_STEPS[budgetIdx];

  function addInterest(tag: string) {
    const t = tag.trim();
    if (t && !interests.includes(t)) setInterests((p) => [...p, t]);
    setInterestInput("");
  }

  function handleInterestKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addInterest(interestInput);
    }
    if (e.key === "Backspace" && !interestInput && interests.length > 0) {
      setInterests((p) => p.slice(0, -1));
    }
  }

  function toggleCompare(gift: GiftResult) {
    setCompareList((prev) => {
      if (prev.find((g) => g.id === gift.id)) return prev.filter((g) => g.id !== gift.id);
      if (prev.length >= 3) return prev;
      return [...prev, gift];
    });
  }

  function goCompare() {
    localStorage.setItem("muhtar_compare", JSON.stringify(compareList));
    router.push("/compare");
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!age || Number(age) < 1) { setError("Enter a valid age"); return; }
    if (credits < 5) { setError("Not enough credits. Buy more to continue."); return; }
    setError("");
    setLoading(true);
    setSearched(false);
    setCompareList([]);
    deduct(5);
    toast.info("Searching for gifts…", { duration: 1000 });
    try {
      const raw = await searchGifts({ gender, age: Number(age), interests, budget });
      const deduped = deduplicateProducts(raw);
      setResults(deduped);
      addEntry({ query: { gender, age: Number(age), interests, budget }, results: deduped });
      toast.success(`Found ${deduped.length} gifts · 5 credits used`);
    } catch {
      setError("Search failed. Please try again.");
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-24">
      {/* Search form */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-5 space-y-5">
        {/* Gender */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-card-foreground">Gender</label>
          <div className="flex gap-2">
            {GENDERS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={cn(
                  "rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors",
                  gender === g
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Age */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-card-foreground">Age</label>
          <Input
            type="number"
            min={1}
            max={120}
            placeholder="e.g. 25"
            value={age}
            onChange={(e) => { setError(""); setAge(e.target.value); }}
            className="w-32"
          />
        </div>

        {/* Interests */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-card-foreground">
            Interests <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-1.5 rounded-lg border border-input bg-input/30 px-2.5 py-2 min-h-9 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 transition-colors">
            {interests.map((tag) => (
              <span key={tag} className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                {tag}
                <button type="button" onClick={() => setInterests((p) => p.filter((t) => t !== tag))}>
                  <X className="size-3 text-muted-foreground hover:text-foreground" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyDown={handleInterestKey}
              onBlur={() => interestInput && addInterest(interestInput)}
              placeholder={interests.length === 0 ? "Type and press Enter…" : ""}
              className="flex-1 min-w-24 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {INTEREST_SUGGESTIONS.filter((s) => !interests.includes(s)).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addInterest(s)}
                className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-card-foreground">Budget</label>
            <span className="text-sm font-bold text-foreground">
              {budget.toLocaleString("en-SA")} <span className="text-xs font-normal text-muted-foreground">SAR</span>
            </span>
          </div>
          <Slider
            min={0}
            max={BUDGET_STEPS.length - 1}
            value={[budgetIdx]}
            onValueChange={(v) => setBudgetIdx(Array.isArray(v) ? v[0] : v)}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>100 SAR</span>
            <span>10,000 SAR</span>
          </div>
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <Button type="submit" className="w-full" size="lg" disabled={loading || credits < 5}>
          {loading
            ? <><Loader2 className="size-4 animate-spin" /> Finding gifts…</>
            : credits < 5
            ? "Not enough credits"
            : `Find Gifts — 5 credits (${credits} remaining)`}
        </Button>
      </form>

      {/* Skeletons while loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <GiftCardSkeleton key={i} />)}
        </div>
      )}

      {/* Results */}
      {searched && !loading && (
        results.length > 0 ? (
          <div>
            <p className="mb-3 text-sm text-muted-foreground">
              {results.length} suggestions · select up to 3 to compare
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.map((gift, i) => (
                <div
                  key={gift.id}
                  className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300"
                  style={{ animationDelay: `${i * 75}ms`, animationFillMode: "both" }}
                >
                  <GiftCard
                    gift={gift}
                    onCompare={toggleCompare}
                    compareSelected={!!compareList.find((g) => g.id === gift.id)}
                    compareDisabled={compareList.length >= 3}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-10">
            No gifts found. Try adjusting your filters.
          </p>
        )
      )}

      {/* Floating compare bar */}
      {compareList.length >= 2 && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/90 backdrop-blur-md px-4 py-3 shadow-2xl shadow-black/40">
            <span className="text-sm text-muted-foreground">
              {compareList.length} selected
            </span>
            <Button size="sm" onClick={goCompare} className="gap-1.5">
              <GitCompare className="size-4" /> Compare Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}