"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="9" width="11" height="9" rx="1"/>
      <line x1="8.5" y1="9" x2="8.5" y2="18"/>
      <path d="M8.5 9c-1.5-2-0.5-4 1-4s2 2 0 4"/>
      <path d="M8.5 9c1.5-2 0.5-4-1-4s-2 2 0 4"/>
      <circle cx="17" cy="15" r="3.5"/>
      <line x1="19.5" y1="17.5" x2="22" y2="20"/>
    </svg>
  );
}
function ArrowRightIcon() {
  return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
}
function SparkleIcon() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></svg>;
}

type Step = "phone" | "otp" | "name";

export default function SignInPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [devCode, setDevCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const otpRefs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  const updateOtp = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) otpRefs[i + 1].current?.focus();
  };

  const sendCode = async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 9) { setErr("Enter a valid phone number"); return; }
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: digits }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Failed to send code"); return; }
      if (data.devCode) setDevCode(data.devCode);
      setStep("otp");
      setTimeout(() => otpRefs[0].current?.focus(), 50);
    } catch {
      setErr("Network error — try again");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    const code = otp.join("");
    if (code.length < 6) { setErr("Enter the 6-digit code"); return; }
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.replace(/\D/g, ""), code }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Invalid code"); return; }
      if (data.isNew) {
        setStep("name");
      } else {
        router.push("/gifts");
      }
    } catch {
      setErr("Network error — try again");
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async () => {
    if (!name.trim()) { setErr("Tell us your name"); return; }
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.replace(/\D/g, ""), name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Failed to create account"); return; }
      router.push("/gifts");
    } catch {
      setErr("Network error — try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="m-signin-page">
      <div className="m-signin-brand">
        <div className="m-logo">
          <div className="m-logo-mark"><LogoMark size={22} /></div>
          <div className="m-logo-wordmark">Muhtar</div>
        </div>
        <div style={{ marginTop: 40 }}>
          <h1 className="m-signin-headline">The gift you <em>meant</em> to give them.</h1>
          <p className="m-signin-sub m-mt24">Tell Muhtar about the person. We&apos;ll find thoughtful options from real Saudi stores — in under a minute.</p>
        </div>
        <div className="m-signin-testimonial">
          <div className="m-testimonial-meta">PMU Senior Capstone · Al Khobar · 2026</div>
        </div>
      </div>

      <div className="m-signin-right">
        <div>
          {step === "phone" && (
            <>
              <div className="m-signin-step-label">Step 01 — Sign in or create account</div>
              <h2 className="m-signin-title">Your number</h2>
              <p className="m-signin-desc">We&apos;ll send you a one-time code. No passwords needed.</p>
              <div className="m-field full">
                <div className="m-label">Mobile Number</div>
                <div className="m-phone-input">
                  <span className="m-phone-prefix">+966</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="5XX XXX XXXX"
                    value={phone}
                    autoFocus
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    onKeyDown={(e) => e.key === "Enter" && sendCode()}
                  />
                </div>
                {err && <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 4 }}>{err}</div>}
              </div>
              <button
                className="m-btn m-btn-primary m-btn-lg m-mt24"
                style={{ width: "100%" }}
                onClick={sendCode}
                disabled={loading}
              >
                {loading ? "Sending…" : <><span>Send code</span> <ArrowRightIcon /></>}
              </button>
              <div className="m-mt24" style={{ fontSize: 12, color: "var(--fg-4)" }}>
                By continuing you agree to our{" "}
                <span style={{ color: "var(--fg-2)", textDecoration: "underline", cursor: "pointer" }}>terms</span>
                {" "}and{" "}
                <span style={{ color: "var(--fg-2)", textDecoration: "underline", cursor: "pointer" }}>privacy policy</span>.
              </div>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="m-signin-step-label">Step 02 — Verify</div>
              <h2 className="m-signin-title">Enter the code</h2>
              <p className="m-signin-desc">
                Sent to <span style={{ fontFamily: "var(--mono)", color: "var(--fg-2)" }}>+966 {phone}</span>
              </p>
              <div className="m-otp-boxes">
                {otp.map((v, i) => (
                  <input
                    key={i}
                    ref={otpRefs[i]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className={v ? "filled" : ""}
                    value={v}
                    onChange={(e) => updateOtp(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !v && i > 0) otpRefs[i - 1].current?.focus();
                      if (e.key === "Enter") verifyCode();
                    }}
                  />
                ))}
              </div>
              {devCode && (
                <div className="m-row" style={{ justifyContent: "center", marginBottom: 20 }}>
                  <span className="m-hint-chip" style={{ fontSize: 11 }}>
                    Dev mode · your code: <strong style={{ fontFamily: "var(--mono)" }}>{devCode}</strong>
                  </span>
                </div>
              )}
              {err && <div style={{ color: "var(--danger)", fontSize: 12, marginBottom: 12, textAlign: "center" }}>{err}</div>}
              <button
                className="m-btn m-btn-primary m-btn-lg"
                style={{ width: "100%" }}
                onClick={verifyCode}
                disabled={loading}
              >
                {loading ? "Verifying…" : <><span>Verify</span> <ArrowRightIcon /></>}
              </button>
              <div className="m-mt16" style={{ textAlign: "center", fontSize: 13, color: "var(--fg-4)" }}>
                Didn&apos;t get it?{" "}
                <button onClick={sendCode} style={{ color: "var(--accent)" }} disabled={loading}>Resend</button>
                {" · "}
                <button onClick={() => { setStep("phone"); setOtp(["","","","","",""]); setDevCode(""); }} style={{ color: "var(--fg-3)" }}>
                  Different number
                </button>
              </div>
            </>
          )}

          {step === "name" && (
            <>
              <div className="m-signin-step-label">Step 03 — One last thing</div>
              <h2 className="m-signin-title">What should we call you?</h2>
              <p className="m-signin-desc">Just a first name. We&apos;ll also add 100 free credits to your new account.</p>
              <div className="m-field full">
                <div className="m-label">Your name</div>
                <input
                  className="m-input"
                  placeholder="e.g. Noura"
                  value={name}
                  autoFocus
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createAccount()}
                />
                {err && <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 4 }}>{err}</div>}
              </div>
              <button
                className="m-btn m-btn-primary m-btn-lg m-mt24"
                style={{ width: "100%" }}
                onClick={createAccount}
                disabled={loading}
              >
                {loading ? "Creating account…" : <><span>Enter Muhtar</span> <ArrowRightIcon /></>}
              </button>
              <div className="m-mt16 m-row" style={{ fontSize: 12, color: "var(--fg-4)" }}>
                <SparkleIcon /> 100 credits added on first sign in.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
