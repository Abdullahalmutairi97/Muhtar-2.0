"use client";

import { useState } from "react";

function ChevIcon() {
  return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
}

const FAQS = [
  { q: "How does Muhtar find gifts?", a: "Muhtar sends your recipient profile to our AI, which generates four diverse search queries, scrapes real product listings from Amazon.sa, and selects the four strongest matches with a short reason for each." },
  { q: "Are the prices accurate?", a: "Prices are pulled live at the time of your search. They may change by the time you open the store page — always verify at checkout." },
  { q: "How do credits work?", a: "Every search — gift or comparison — costs 5 credits. New accounts start with 100 free credits. You can buy more any time from your Account page." },
  { q: "Which stores do you search?", a: "We search Amazon.sa and Noon.com. More Saudi retailers are coming." },
  { q: "Do credits expire?", a: "No. Credits are yours forever once purchased, and they are non-refundable." },
];

function RuleBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "18px 0", borderBottom: "1px solid var(--m-border)" }}>
      <div className="serif" style={{ fontSize: 18, color: "var(--on-card)", marginBottom: 6 }}>{title}</div>
      <div style={{ color: "var(--on-card-2)", fontSize: 14, lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

export default function MorePage() {
  const [tab, setTab] = useState("support");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      <div className="m-page-head">
        <h1 className="m-page-title">Help &amp; Info</h1>
        <p className="m-page-sub">Support, the team behind Muhtar, and the rules of the road.</p>
      </div>

      <div className="m-tabs">
        {["support", "about", "rules"].map((t) => (
          <button key={t} className={`m-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "support" && (
        <>
          <div className="m-stat-grid">
            <div className="m-stat">
              <div className="m-stat-label">Email</div>
              <div style={{ fontSize: 16, fontFamily: "var(--serif)", color: "var(--on-card)", marginTop: 6 }}>support@muhtar.app</div>
            </div>
            <div className="m-stat">
              <div className="m-stat-label">Phone</div>
              <div style={{ fontSize: 16, fontFamily: "var(--serif)", color: "var(--on-card)", marginTop: 6 }}>+966 13 860 0000</div>
            </div>
            <div className="m-stat">
              <div className="m-stat-label">Hours</div>
              <div style={{ fontSize: 16, fontFamily: "var(--serif)", color: "var(--on-card)", marginTop: 6 }}>Sun–Thu, 9–5 AST</div>
            </div>
          </div>

          <div className="m-card">
            <div className="m-tweaks-title" style={{ marginBottom: 6 }}>Frequently Asked</div>
            {FAQS.map((f, i) => (
              <div key={i} className={`m-accordion-item ${openFaq === i ? "open" : ""}`}>
                <button className="m-accordion-head" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {f.q}
                  <span className="m-accordion-chev"><ChevIcon /></span>
                </button>
                <div className="m-accordion-body">{f.a}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "about" && (
        <div className="m-card hi">
          <div className="m-tweaks-title">Our mission</div>
          <p className="serif" style={{ fontSize: 24, lineHeight: 1.35, color: "var(--on-card)", margin: "10px 0 0", maxWidth: 680 }}>
            To make thoughtful gift-giving effortless for everyone — starting in Saudi Arabia, where occasions matter and the right gift is never the first one you find.
          </p>
          <div className="m-mt24" style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--on-card-3)", letterSpacing: "0.08em" }}>
            PMU SENIOR CAPSTONE · AL KHOBAR · SPRING 2026
          </div>
        </div>
      )}

      {tab === "rules" && (
        <div className="m-card">
          <RuleBlock title="Acceptable use">
            Muhtar is for personal, non-commercial gift discovery. Don&apos;t automate searches, scrape the site, or try to evade the credits system.
          </RuleBlock>
          <RuleBlock title="Your account">
            You&apos;re responsible for keeping your phone number and device secure. One account per person — sharing accounts is not permitted.
          </RuleBlock>
          <RuleBlock title="Credits policy">
            Credits are non-refundable and do not expire. Demo purchases in this prototype add credits instantly; in production a payment provider handles transactions.
          </RuleBlock>
          <RuleBlock title="Availability &amp; pricing">
            Product availability, stock, and pricing are pulled from third-party stores and may change between your search and checkout. Always verify before purchasing.
          </RuleBlock>
          <RuleBlock title="Disclaimer">
            Muhtar is not affiliated with any retailer it indexes. Recommendations are generated by AI and should be treated as suggestions, not endorsements.
          </RuleBlock>
        </div>
      )}
    </>
  );
}