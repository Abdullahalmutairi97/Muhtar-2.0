import { Gift, Sparkles, ShieldCheck, Phone } from "lucide-react";

const SECTIONS = [
  {
    icon: Gift,
    title: "How it works",
    body: "Enter the recipient's gender, age, interests, and budget. Muhtar uses AI to search Amazon.sa and surface the 4 best-matched gifts in seconds.",
  },
  {
    icon: Sparkles,
    title: "AI-powered",
    body: "Powered by Google Gemini 2.5 Flash. Gift queries are generated intelligently and results are ranked by relevance, price, and availability.",
  },
  {
    icon: ShieldCheck,
    title: "Saudi-first",
    body: "All products are sourced from Amazon.sa and local Saudi stores. Prices are in SAR and reflect current availability.",
  },
  {
    icon: Phone,
    title: "About",
    body: "Muhtar is a PMU senior capstone project (2026). Built by a 5-student team in Al Khobar as a demo AI gift recommendation platform.",
  },
];

export default function MorePage() {
  return (
    <div className="mx-auto max-w-lg space-y-3">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Muhtar</h2>
        <p className="text-sm text-muted-foreground">AI Gift Finder · v0.1.0 · Demo</p>
      </div>

      {SECTIONS.map(({ icon: Icon, title, body }) => (
        <div key={title} className="flex gap-4 rounded-xl border border-border bg-card p-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-card-foreground">{title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}