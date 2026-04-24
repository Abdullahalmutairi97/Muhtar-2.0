"use client";

import { useState } from "react";
import { useSearchHistory, type HistoryEntry } from "@/hooks/useSearchHistory";

function GiftIcon() {
  return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>;
}
function CompareIcon() {
  return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>;
}
function ClockIcon() {
  return <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function TrashIcon() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${d.getDate()} ${months[d.getMonth()]} · ${hh}:${mm}`;
}

export default function HistoryPage() {
  const { history, clearHistory } = useSearchHistory();
  const [confirm, setConfirm] = useState(false);

  return (
    <>
      <div className="m-page-head">
        <div className="m-row" style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 className="m-page-title">History</h1>
            <p className="m-page-sub">Every search stays in your account so you can find it again — or delete it.</p>
          </div>
          {history.length > 0 && (
            <button className="m-btn m-btn-ghost m-btn-sm" onClick={() => setConfirm(true)}>
              <TrashIcon /> Clear all
            </button>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="m-empty">
          <div className="m-empty-icon"><ClockIcon /></div>
          <div className="m-empty-title">No searches yet</div>
          <div className="m-small">Once you run a gift search or comparison, it will appear here.</div>
        </div>
      ) : (
        <div className="m-history-list">
          {history.map((h: HistoryEntry) => (
            <div key={h.id} className="m-history-item">
              <div className="m-history-icon">
                {h.type === "gift" ? <GiftIcon /> : <CompareIcon />}
              </div>
              <div>
                <div className="m-history-query">{h.query}</div>
                <div className="m-history-meta">{h.type.toUpperCase()} · {formatDate(h.at)}</div>
              </div>
              <div className="m-history-credits">−{h.credits} credits</div>
            </div>
          ))}
        </div>
      )}

      {confirm && (
        <div className="m-backdrop" onClick={() => setConfirm(false)}>
          <div className="m-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="m-dialog-title">Clear all history?</div>
            <div className="m-dialog-sub">This removes {history.length} saved searches. It can&apos;t be undone.</div>
            <div className="m-row m-mt16" style={{ justifyContent: "flex-end" }}>
              <button className="m-btn m-btn-ghost" onClick={() => setConfirm(false)}>Cancel</button>
              <button className="m-btn m-btn-primary" onClick={() => { clearHistory(); setConfirm(false); }}>Yes, clear</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
