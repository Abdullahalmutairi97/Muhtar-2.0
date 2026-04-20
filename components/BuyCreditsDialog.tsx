"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { useCredits } from "@/hooks/useCredits";
import { Coins, Check } from "lucide-react";
import { toast } from "sonner";
import type { CreditPackage } from "@/types";

const PACKAGES: CreditPackage[] = [
  { id: "p1", credits: 50,  price: 10, currency: "SAR" },
  { id: "p2", credits: 100, price: 18, currency: "SAR" },
  { id: "p3", credits: 250, price: 40, currency: "SAR" },
  { id: "p4", credits: 500, price: 70, currency: "SAR" },
];

export default function BuyCreditsDialog({ children }: { children: React.ReactNode }) {
  const { add } = useCredits();
  const [bought, setBought] = useState<string | null>(null);

  function handleBuy(pkg: CreditPackage) {
    add(pkg.credits);
    setBought(pkg.id);
    toast.success(`${pkg.credits} credits added!`);
    setTimeout(() => setBought(null), 1500);
  }

  return (
    <Dialog>
      <DialogTrigger render={<span />}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buy Credits</DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted-foreground -mt-2">
          Demo mode — no real payment. Credits are added instantly.
        </p>

        <div className="grid grid-cols-2 gap-3 py-1">
          {PACKAGES.map((pkg) => {
            const isBought = bought === pkg.id;
            return (
              <button
                key={pkg.id}
                onClick={() => handleBuy(pkg)}
                className="flex flex-col gap-1 rounded-xl border border-border bg-muted/30 p-4 text-left transition-colors hover:border-primary/50 hover:bg-muted/60"
              >
                <div className="flex items-center gap-1.5">
                  <Coins className="size-4 text-amber-400" />
                  <span className="text-base font-bold text-foreground">
                    {pkg.credits}
                  </span>
                  <span className="text-xs text-muted-foreground">credits</span>
                </div>
                <p className="text-sm font-semibold text-primary">
                  {pkg.price} SAR
                </p>
                <div className={`mt-2 flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                  isBought
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-primary/10 text-primary"
                }`}>
                  {isBought ? <><Check className="size-3" /> Added!</> : "Buy"}
                </div>
              </button>
            );
          })}
        </div>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}