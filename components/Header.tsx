"use client";

import { usePathname } from "next/navigation";
import { Coins } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import BuyCreditsDialog from "@/components/BuyCreditsDialog";

const TITLES: Record<string, string> = {
  "/gifts":   "Find a Gift",
  "/compare": "Compare",
  "/history": "History",
  "/profile": "Profile",
  "/more":    "More",
};

export default function Header() {
  const pathname = usePathname();
  const { credits } = useCredits();
  const title = TITLES[pathname] ?? "Muhtar";

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 md:px-6 shrink-0">
      <h1 className="text-base font-semibold text-foreground">{title}</h1>
      <BuyCreditsDialog>
        <button className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-sm font-medium text-foreground transition-colors hover:bg-muted">
          <Coins className="size-4 text-amber-400" />
          {credits}
        </button>
      </BuyCreditsDialog>
    </header>
  );
}