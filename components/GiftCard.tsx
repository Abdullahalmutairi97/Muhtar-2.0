import type { GiftResult } from "@/types";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GiftCardProps {
  gift: GiftResult;
  onCompare?: (gift: GiftResult) => void;
  compareSelected?: boolean;
  compareDisabled?: boolean;
}

export default function GiftCard({
  gift,
  onCompare,
  compareSelected,
  compareDisabled,
}: GiftCardProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-lg hover:shadow-black/20">
      {/* Image */}
      <div className="relative h-44 bg-muted/30 flex items-center justify-center">
        {gift.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={gift.imageUrl}
            alt={gift.name}
            className="h-full w-full object-contain p-3"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        {!gift.inStock && (
          <span className="absolute top-2 right-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground border border-border">
            Out of stock
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">{gift.store}</p>
          <h3 className="mt-0.5 text-sm font-semibold leading-snug text-card-foreground line-clamp-2">
            {gift.name}
          </h3>
          <p className="mt-2 text-lg font-bold text-foreground">
            {gift.price.toLocaleString("en-SA")}
            <span className="ml-1 text-xs font-normal text-muted-foreground">SAR</span>
          </p>
        </div>

        <div className="flex gap-2">
          <a
            href={gift.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button size="sm" className="w-full gap-1.5">
              View <ExternalLink className="size-3" />
            </Button>
          </a>
          {onCompare && (
            <Button
              size="sm"
              variant={compareSelected ? "secondary" : "outline"}
              disabled={compareDisabled && !compareSelected}
              onClick={() => onCompare(gift)}
              className="shrink-0"
            >
              {compareSelected ? "✓ Added" : "Compare"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}