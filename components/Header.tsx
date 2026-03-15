"use client";

import { usePathname } from "next/navigation";
import { useCredits } from "@/hooks/useCredits";
import BuyCreditsDialog from "@/components/BuyCreditsDialog";

const TITLES: Record<string, string> = {
  "/gifts":   "Discover",
  "/compare": "Compare",
  "/history": "History",
  "/profile": "Account",
  "/more":    "Help & Info",
};

function MenuIcon() {
  return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>;
}
function CoinIcon() {
  return <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/></svg>;
}

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const { credits } = useCredits();
  const page = TITLES[pathname] ?? "Muhtar";

  return (
    <header className="m-header">
      <button className="m-hamburger" onClick={onMenuClick} aria-label="Menu">
        <MenuIcon />
      </button>
      <div className="m-breadcrumb">Muhtar / {page}</div>
      <div className="m-spacer" />
      <BuyCreditsDialog>
        <button className="m-credits-badge">
          <span className="coin"><CoinIcon /></span>
          {credits}
        </button>
      </BuyCreditsDialog>
    </header>
  );
}