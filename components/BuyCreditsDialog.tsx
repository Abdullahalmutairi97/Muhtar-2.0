"use client";

import { useState } from "react";
import { useCredits } from "@/hooks/useCredits";

const PACKAGES = [
  { credits: 50,  price: 10 },
  { credits: 100, price: 18, popular: true },
  { credits: 250, price: 40 },
  { credits: 500, price: 70 },
];

export default function BuyCreditsDialog({ children }: { children: React.ReactNode }) {
  const { add } = useCredits();
  const [open, setOpen] = useState(false);
  const [bought, setBought] = useState<number | null>(null);

  function handleBuy(credits: number) {
    add(credits);
    setBought(credits);
    setTimeout(() => { setBought(null); setOpen(false); }, 1200);
  }

  return (
    <>
      <span onClick={() => setOpen(true)} style={{ display: "contents" }}>{children}</span>

      {open && (
        <div className="m-backdrop" onClick={() => setOpen(false)}>
          <div className="m-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="m-dialog-title">Buy Credits</div>
            <div className="m-dialog-sub">5 credits per search. No subscription, no expiration.</div>

            <div className="m-credit-pkgs">
              {PACKAGES.map((p) => (
                <button
                  key={p.credits}
                  className={`m-credit-pkg ${p.popular ? "popular" : ""}`}
                  onClick={() => handleBuy(p.credits)}
                >
                  <div className="m-pkg-credits">
                    {bought === p.credits ? "Added!" : p.credits}
                    {bought !== p.credits && <span className="c">CREDITS</span>}
                  </div>
                  <div className="m-pkg-price">SAR {p.price}</div>
                </button>
              ))}
            </div>

            <div className="m-mt16 m-fg4 m-small" style={{ textAlign: "center" }}>
              Demo mode — no real payment is processed.
            </div>
            <div className="m-row m-mt16" style={{ justifyContent: "flex-end" }}>
              <button className="m-btn m-btn-ghost" onClick={() => setOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}