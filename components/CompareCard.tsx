import type { CompareResult } from "@/types";
import { Check, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CompareCard({ result }: { result: CompareResult }) {
  const { product, pros, cons, aiSummary } = result;

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden">
      {/* Image */}
      <div className="relative h-40 bg-muted/30 flex items-center justify-center">
        {product.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain p-3"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        )}
        {product.badge && (
          <span className={cn(
            "absolute top-2 left-2 rounded-full px-2.5 py-0.5 text-xs font-semibold border",
            product.badge === "Best Value"
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/20 text-amber-400 border-amber-500/30"
          )}>
            {product.badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div>
          <p className="text-xs text-muted-foreground">{product.store}</p>
          <h3 className="mt-0.5 text-sm font-semibold leading-snug text-card-foreground">
            {product.name}
          </h3>
          <p className="mt-1.5 text-xl font-bold text-foreground">
            {product.price.toLocaleString("en-SA")}
            <span className="ml-1 text-xs font-normal text-muted-foreground">SAR</span>
          </p>
        </div>

        {/* Pros */}
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-400">Pros</p>
          <ul className="space-y-1">
            {pros.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-card-foreground">
                <Check className="size-3.5 mt-0.5 shrink-0 text-emerald-400" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-rose-400">Cons</p>
          <ul className="space-y-1">
            {cons.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-card-foreground">
                <X className="size-3.5 mt-0.5 shrink-0 text-rose-400" />
                {c}
              </li>
            ))}
          </ul>
        </div>

        {/* AI Summary */}
        <div className="rounded-lg bg-muted/40 border border-border p-3">
          <p className="mb-1 text-xs font-semibold text-muted-foreground">AI Summary</p>
          <p className="text-xs leading-relaxed text-card-foreground">{aiSummary}</p>
        </div>

        {/* CTA */}
        <a href={product.url} target="_blank" rel="noopener noreferrer" className="mt-auto">
          <Button size="sm" className="w-full gap-1.5">
            View Product <ExternalLink className="size-3" />
          </Button>
        </a>
      </div>
    </div>
  );
}