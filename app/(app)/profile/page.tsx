"use client";

import { useRouter } from "next/navigation";
import { useCredits } from "@/hooks/useCredits";
import { useTheme } from "next-themes";
import BuyCreditsDialog from "@/components/BuyCreditsDialog";

function PlusIcon() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function MoonIcon() {
  return <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>;
}
function SunIcon() {
  return <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>;
}
function LogoutIcon() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}

export default function ProfilePage() {
  const router = useRouter();
  const { credits } = useCredits();
  const { theme, setTheme } = useTheme();

  function handleSignOut() {
    localStorage.clear();
    router.push("/signin");
  }

  return (
    <>
      <div className="m-page-head">
        <h1 className="m-page-title">Account</h1>
        <p className="m-page-sub">Your profile, credits, and preferences.</p>
      </div>

      <div className="m-profile-hero">
        <div className="m-avatar">Y</div>
        <div>
          <div className="m-profile-name">Demo User</div>
          <div className="m-profile-phone">+966 5XX XXX XXX</div>
        </div>
        <div className="m-spacer" />
        <BuyCreditsDialog>
          <button className="m-btn m-btn-outline m-btn-sm">
            <PlusIcon /> Buy credits
          </button>
        </BuyCreditsDialog>
      </div>

      <div className="m-stat-grid">
        <div className="m-stat">
          <div className="m-stat-label">Credit Balance</div>
          <div className="m-stat-value">{credits}</div>
        </div>
        <div className="m-stat">
          <div className="m-stat-label">Total Searches</div>
          <div className="m-stat-value">—</div>
        </div>
        <div className="m-stat">
          <div className="m-stat-label">Credits Spent</div>
          <div className="m-stat-value"><span className="cur">SAR </span>—</div>
        </div>
      </div>

      <div className="m-card">
        <div className="m-tweaks-title">Preferences</div>
        <div className="m-settings-row">
          <div>
            <div className="m-settings-label">Theme</div>
            <div className="m-settings-desc">Dark is the default. Light is available if you prefer.</div>
          </div>
          <div className="m-row">
            <button
              className={`m-btn m-btn-sm ${theme === "dark" ? "m-btn-outline" : "m-btn-ghost"}`}
              onClick={() => setTheme("dark")}
            >
              <MoonIcon /> Dark
            </button>
            <button
              className={`m-btn m-btn-sm ${theme === "light" ? "m-btn-outline" : "m-btn-ghost"}`}
              onClick={() => setTheme("light")}
            >
              <SunIcon /> Light
            </button>
          </div>
        </div>
        <div className="m-settings-row">
          <div>
            <div className="m-settings-label">Sign out</div>
            <div className="m-settings-desc">End your session on this device.</div>
          </div>
          <button className="m-btn m-btn-ghost m-btn-sm" onClick={handleSignOut}>
            <LogoutIcon /> Sign out
          </button>
        </div>
      </div>
    </>
  );
}