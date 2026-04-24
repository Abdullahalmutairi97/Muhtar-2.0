"use client";

import { useState } from "react";
import { useCredits } from "@/hooks/useCredits";
import { useSearchHistory } from "@/hooks/useSearchHistory";

interface CompareProduct {
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  url: string;
  badge?: "value" | "premium";
  pros: string[];
  cons: string[];
  inStock: boolean;
}
interface CompareResult {
  summary: string;
  products: CompareProduct[];
}

const LOAD_LABELS = [
  "Parsing the product",
  "Finding two strong competitors",
  "Searching Amazon.sa",
  "Extracting pros, cons, verdict",
];

function SparkleIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></svg>;
}
function BoltIcon() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}
function CompareIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>;
}
function ArrowOutIcon() {
  return <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"/><polyline points="7 7 17 7 17 17"/></svg>;
}

function AILoading({ step }: { step: number }) {
  return (
    <div className="m-ai-loading">
      <div className="m-orb">
        <div className="m-orb-inner"><SparkleIcon size={26} /></div>
      </div>
      <div className="m-think-steps">
        {LOAD_LABELS.map((label, i) => (
          <div key={i} className={`m-think-step ${step === i ? "active" : step > i ? "done" : ""}`}>
            <span className="m-think-dot" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ComparePage() {
  const [q, setQ] = useState("");
  const [loadStep, setLoadStep] = useState(-1);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [err, setErr] = useState("");

  const { credits, deduct } = useCredits();
  const { addEntry } = useSearchHistory();

  const run = async () => {
    if (credits < 5) { setErr("Not enough credits"); return; }
    if (!q.trim()) { setErr("Enter a product to compare"); return; }
    setErr("");
    setResult(null);
    setLoadStep(0);

    let step = 0;
    const interval = setInterval(() => {
      if (step < 3) { step++; setLoadStep(step); }
    }, 950);

    try {
      deduct(5);
      const res = await fetch("/api/compare-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q }),
      });
      clearInterval(interval);
      const data = await res.json();
      setResult(data);
      setLoadStep(-1);
      addEntry({ type: "comparison" as const, query: `${q} vs alternatives`, credits: 5 });
    } catch {
      clearInterval(interval);
      setErr("Comparison failed. Please try again.");
      setLoadStep(-1);
    }
  };

  return (
    <>
      <div className="m-page-head">
        <h1 className="m-page-title">Compare</h1>
        <p className="m-page-sub">Name any product. Muhtar finds two strong alternatives and breaks down the real trade-offs.</p>
      </div>

      {!result && loadStep < 0 && (
        <div className="m-card hi">
          <div className="m-field full">
            <div className="m-label">Product Name</div>
            <input
              className="m-input"
              placeholder="e.g. AirPods Pro, Galaxy S24, Nike Pegasus..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && run()}
            />
          </div>
          {err && <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 12 }}>{err}</p>}
          <div className="m-row m-mt24" style={{ justifyContent: "space-between" }}>
            <div className="m-row m-fg4 m-small"><BoltIcon /><span>Costs 5 credits per comparison</span></div>
            <button className="m-btn m-btn-primary m-btn-lg" onClick={run}>
              <CompareIcon size={16} /> Compare
            </button>
          </div>
        </div>
      )}

      {loadStep >= 0 && <AILoading step={loadStep} />}

      {result && (
        <>
          <div className="m-results-head">
            <div>
              <h2 className="m-results-title">"{q}" vs alternatives</h2>
              <div className="m-results-meta m-mt8">3 products · sourced from Amazon.sa</div>
            </div>
            <div className="m-row">
              <button className="m-btn m-btn-ghost m-btn-sm" onClick={() => { setResult(null); setQ(""); }}>
                New comparison
              </button>
            </div>
          </div>

          {result.summary && (
            <div className="m-ai-summary">
              <div className="summary-icon"><SparkleIcon size={16} /></div>
              <div>{result.summary}</div>
            </div>
          )}

          <div className="m-compare-grid">
            {result.products.map((p, idx) => (
              <article key={p.name} className="m-compare-card" style={{ animationDelay: `${idx * 110}ms` }}>
                {p.badge === "value" && <span className="m-compare-badge value">Best Value</span>}
                {p.badge === "premium" && <span className="m-compare-badge premium">Premium Choice</span>}

                {p.imageUrl && (
                  <div className="m-gift-img" style={{ aspectRatio: "16/10" }}>
                    <img src={p.imageUrl} alt={p.name} onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }} />
                  </div>
                )}

                <div>
                  <div className="m-gift-brand">{p.brand}</div>
                  <div className="m-gift-name m-mt8">{p.name}</div>
                </div>

                <div className="m-gift-footer">
                  <div className="m-price-pill">
                    <span className="cur">SAR</span>{p.price.toLocaleString()}
                  </div>
                  <a className="m-take-me" href={p.url} target="_blank" rel="noreferrer">
                    Take me there <ArrowOutIcon />
                  </a>
                </div>

                <div className="m-pros-cons">
                  <div>
                    <div className="m-pc-head">Pros</div>
                    {p.pros.map((t, i) => (
                      <div key={i} className="m-pc-item pro">
                        <span className="m-pc-marker">+</span>{t}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="m-pc-head">Cons</div>
                    {p.cons.map((t, i) => (
                      <div key={i} className="m-pc-item con">
                        <span className="m-pc-marker">−</span>{t}
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </>
  );
}