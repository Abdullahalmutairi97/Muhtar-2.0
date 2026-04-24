"use client";

import { useRef, useState } from "react";
import { searchGifts } from "@/lib/api";
import { deduplicateProducts } from "@/utils/deduplicateProducts";
import type { GiftResult } from "@/types";
import { useCredits } from "@/hooks/useCredits";
import { useSearchHistory } from "@/hooks/useSearchHistory";

const SUGGESTED = ["tech", "cooking", "sports", "reading", "fashion", "travel", "gaming", "art"];

function sliderToBudget(v: number) {
  if (v <= 0.5) return Math.round((100 + (1000 - 100) * (v / 0.5)) / 50) * 50;
  return Math.round((1000 + (10000 - 1000) * ((v - 0.5) / 0.5)) / 100) * 100;
}
function budgetToSlider(b: number) {
  if (b <= 1000) return ((b - 100) / 900) * 0.5;
  return 0.5 + ((b - 1000) / 9000) * 0.5;
}

const LOAD_LABELS = [
  "Understanding the recipient",
  "Generating 4 search queries",
  "Searching Amazon.sa",
  "Selecting the best four",
];

function SparkleIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></svg>;
}
function BoltIcon() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
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

function GiftCard({ gift, delay }: { gift: GiftResult; delay: number }) {
  const ref = useRef<HTMLElement>(null);
  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    ref.current.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  return (
    <article className="m-gift-card" ref={ref} onMouseMove={onMove} style={{ animationDelay: `${delay}ms` }}>
      {gift.imageUrl && (
        <div className="m-gift-img">
          <img src={gift.imageUrl} alt={gift.name} onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }} />
        </div>
      )}
      {gift.badge && (
        <span style={{
          position: "absolute", top: 12, right: 12,
          padding: "3px 10px", borderRadius: 999,
          fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
          fontWeight: 700,
          background: gift.badge === "Best Value" ? "color-mix(in oklch, oklch(0.7 0.15 150) 20%, transparent)" : "color-mix(in oklch, var(--accent) 20%, transparent)",
          color: gift.badge === "Best Value" ? "oklch(0.72 0.13 150)" : "oklch(0.78 0.12 70)",
          border: "1px solid currentColor",
        }}>{gift.badge}</span>
      )}
      <div className="m-gift-brand">{gift.store}</div>
      <div className="m-gift-name">{gift.name}</div>
      {gift.inStock === false && (
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--fg-4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Out of stock</div>
      )}
      <div className="m-gift-footer">
        <div className="m-price-pill">
          <span className="cur">SAR</span>
          {gift.price.toLocaleString()}
        </div>
        <a className="m-take-me" href={gift.url} target="_blank" rel="noreferrer">
          Take me there <ArrowOutIcon />
        </a>
      </div>
    </article>
  );
}

export default function GiftsPage() {
  const [gender, setGender] = useState("");
  const [age, setAge] = useState<number | "">(25);
  const [interests, setInterests] = useState("");
  const [budget, setBudget] = useState(1000);
  const [loadStep, setLoadStep] = useState(-1);
  const [results, setResults] = useState<GiftResult[] | null>(null);
  const [err, setErr] = useState("");

  const { credits, deduct } = useCredits();
  const { addEntry } = useSearchHistory();
  const sliderVal = budgetToSlider(budget);

  const toggleSuggest = (t: string) => {
    const tokens = interests.split(",").map((s) => s.trim()).filter(Boolean);
    const has = tokens.includes(t);
    setInterests(has ? tokens.filter((x) => x !== t).join(", ") : [...tokens, t].join(", "));
  };

  const runSearch = async () => {
    if (credits < 5) { setErr("Not enough credits"); return; }
    if (!gender) { setErr("Select a gender"); return; }
    if (!interests.trim()) { setErr("Add at least one interest"); return; }
    setErr("");
    setResults(null);
    setLoadStep(0);

    let step = 0;
    const interval = setInterval(() => {
      if (step < 3) { step++; setLoadStep(step); }
    }, 900);

    try {
      deduct(5);
      const raw = await searchGifts({
        gender,
        age: typeof age === "number" ? age : 25,
        interests: interests.split(",").map((s) => s.trim()).filter(Boolean),
        budget,
      });
      clearInterval(interval);
      const deduped = deduplicateProducts(raw);
      setResults(deduped);
      setLoadStep(-1);
      addEntry({
        type: "gift" as const,
        query: `${gender === "m" ? "Male" : "Female"}, ${age}, ${interests}, SAR ${budget.toLocaleString()}`,
        credits: 5,
      });
    } catch (e) {
      clearInterval(interval);
      setErr(e instanceof Error ? e.message : "Search failed. Please try again.");
      setLoadStep(-1);
    }
  };

  const reset = () => { setResults(null); setLoadStep(-1); };

  return (
    <>
      <div className="m-page-head">
        <h1 className="m-page-title">Discover Gifts</h1>
        <p className="m-page-sub">Tell us about the person. Muhtar searches real Saudi stores and returns four ideas tailored to them.</p>
      </div>

      {!results && loadStep < 0 && (
        <div className="m-card hi">
          <div className="m-form-grid">
            <div className="m-field">
              <div className="m-label">Gender</div>
              <select className="m-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Select gender</option>
                <option value="m">Male</option>
                <option value="f">Female</option>
              </select>
            </div>

            <div className="m-field">
              <div className="m-label">Age</div>
              <div className="m-age-stepper">
                <button type="button" className="m-age-btn" onClick={() => setAge((a) => Math.max(1, (+(a || 0)) - 1))}>−</button>
                <div className="m-age-display">
                  <input
                    type="text"
                    inputMode="numeric"
                    className="m-age-input"
                    value={age}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 3);
                      setAge(v === "" ? "" : Math.min(120, +v));
                    }}
                    onBlur={() => { if (!age || +age < 1) setAge(1); }}
                  />
                  <span className="m-age-unit">yrs</span>
                </div>
                <button type="button" className="m-age-btn" onClick={() => setAge((a) => Math.min(120, (+(a || 0)) + 1))}>+</button>
              </div>
            </div>

            <div className="m-field full">
              <div className="m-label">Interests</div>
              <input
                className="m-input"
                placeholder="e.g. tech, cooking, sports, reading..."
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
              />
              <div className="m-pill-row m-mt8">
                {SUGGESTED.map((s) => {
                  const on = interests.toLowerCase().split(",").map((x) => x.trim()).includes(s);
                  return (
                    <button key={s} className={`m-pill ${on ? "on" : ""}`} onClick={() => toggleSuggest(s)}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="m-field full">
              <div className="m-label">Budget</div>
              <div className="m-slider-wrap">
                <input
                  className="m-slider"
                  type="range"
                  min={0}
                  max={1}
                  step={0.005}
                  value={sliderVal}
                  style={{ "--pct": `${sliderVal * 100}%` } as React.CSSProperties}
                  onChange={(e) => setBudget(sliderToBudget(+e.target.value))}
                />
                <div className="m-mt12 m-row" style={{ justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 11, color: "var(--fg-4)" }}>
                  <span>SAR 100</span>
                  <span className="m-budget-readout">Up to SAR {budget.toLocaleString()}</span>
                  <span>SAR 10,000</span>
                </div>
              </div>
            </div>
          </div>

          {err && <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 12 }}>{err}</p>}

          <div className="m-row m-mt24" style={{ justifyContent: "space-between" }}>
            <div className="m-row m-fg4 m-small"><BoltIcon /><span>Costs 5 credits per search</span></div>
            <button className="m-btn m-btn-primary m-btn-lg" onClick={runSearch}>
              <SparkleIcon size={16} /> Find gifts
            </button>
          </div>
        </div>
      )}

      {loadStep >= 0 && <AILoading step={loadStep} />}

      {results && (
        <>
          <div className="m-results-head">
            <div>
              <h2 className="m-results-title">Four gifts for them</h2>
              <div className="m-results-meta m-mt8">
                4 results · {gender === "m" ? "Male" : "Female"} · age {age} · up to SAR {budget.toLocaleString()}
              </div>
            </div>
            <div className="m-row">
              <button className="m-btn m-btn-ghost m-btn-sm" onClick={reset}>New search</button>
              <button className="m-btn m-btn-outline m-btn-sm" onClick={runSearch}>Regenerate</button>
            </div>
          </div>

          <div className="m-gift-grid">
            {results.map((g, idx) => (
              <GiftCard key={g.id} gift={g} delay={idx * 110} />
            ))}
          </div>
        </>
      )}
    </>
  );
}