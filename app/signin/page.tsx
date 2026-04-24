"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const DEMO_OTP = "123456";

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
function BoltIcon() {
  return <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}

export default function SignInPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp" | "name">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [err, setErr] = useState("");

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const sendCode = () => {
    if (phone.length < 3) { setErr("Enter a phone number."); return; }
    setErr("");
    setStep("otp");
    setTimeout(() => otpRefs[0].current?.focus(), 50);
  };

  const updateOtp = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) otpRefs[i + 1].current?.focus();
  };

  const verify = () => {
    const code = otp.join("");
    if (code !== DEMO_OTP) { setErr("Invalid code. Demo code is 123456."); return; }
    setErr("");
    setStep("name");
  };

  const finish = () => {
    if (!name.trim()) { setErr("Tell us your name."); return; }
    router.push("/gifts");
  };

  return (
    <div className="m-signin-page">
      {/* Left brand panel */}
      <div className="m-signin-brand">
        <div className="m-logo">
          <div className="m-logo-mark"><LogoMark size={22} /></div>
          <div className="m-logo-wordmark">Muhtar</div>
        </div>
        <div style={{ marginTop: 40 }}>
          <h1 className="m-signin-headline">The gift you <em>meant</em> to give them.</h1>
          <p className="m-signin-sub m-mt24">Tell Muhtar about the person. We&apos;ll find four thoughtful options from real stores — in under a minute.</p>
        </div>
        <div className="m-signin-testimonial">
          <div className="m-testimonial-meta">PMU Senior Capstone · Al Khobar · 2026</div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="m-signin-right">
        <div>
          {step === "phone" && (
            <>
              <div className="m-signin-step-label">Step 01 — Sign in</div>
              <h2 className="m-signin-title">Your number</h2>
              <p className="m-signin-desc">We&apos;ll text you a one-time code. No passwords, no email spam.</p>
              <div className="m-field full">
                <div className="m-label">Mobile Number</div>
                <div className="m-phone-input">
                  <span className="m-phone-prefix">+966</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="5XX XXX XXX"
                    value={phone}
                    autoFocus
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    onKeyDown={(e) => e.key === "Enter" && sendCode()}
                  />
                </div>
                {err && <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 4 }}>{err}</div>}
              </div>
              <button className="m-btn m-btn-primary m-btn-lg m-mt24" style={{ width: "100%" }} onClick={sendCode}>
                Send code <ArrowRightIcon />
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
                We sent a six-digit code to <span style={{ fontFamily: "var(--mono)", color: "var(--fg-2)" }}>+966 {phone}</span>.
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
                      if (e.key === "Enter") verify();
                    }}
                  />
                ))}
              </div>
              <div className="m-row" style={{ justifyContent: "center", marginBottom: 24 }}>
                <span className="m-hint-chip"><BoltIcon /> Demo code: 123456</span>
              </div>
              {err && <div style={{ color: "var(--danger)", fontSize: 12, marginBottom: 12, textAlign: "center" }}>{err}</div>}
              <button className="m-btn m-btn-primary m-btn-lg" style={{ width: "100%" }} onClick={verify}>
                Verify <ArrowRightIcon />
              </button>
              <div className="m-mt16" style={{ textAlign: "center", fontSize: 13, color: "var(--fg-4)" }}>
                Didn&apos;t get it?{" "}
                <button onClick={() => setOtp(["","","","","",""])} style={{ color: "var(--accent)" }}>Resend</button>
                {" · "}
                <button onClick={() => setStep("phone")} style={{ color: "var(--fg-3)" }}>Use different number</button>
              </div>
            </>
          )}

          {step === "name" && (
            <>
              <div className="m-signin-step-label">Step 03 — One last thing</div>
              <h2 className="m-signin-title">What should we call you?</h2>
              <p className="m-signin-desc">Just a first name. We&apos;ll also drop 100 free credits in your account to get you started.</p>
              <div className="m-field full">
                <div className="m-label">Your name</div>
                <input
                  className="m-input"
                  placeholder="e.g. Noura"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && finish()}
                  autoFocus
                />
                {err && <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 4 }}>{err}</div>}
              </div>
              <button className="m-btn m-btn-primary m-btn-lg m-mt24" style={{ width: "100%" }} onClick={finish}>
                Enter Muhtar <ArrowRightIcon />
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