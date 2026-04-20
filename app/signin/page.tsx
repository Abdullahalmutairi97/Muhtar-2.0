"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DEMO_OTP = "1234";

export default function SignInPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  function handlePhoneSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 9 || !digits.startsWith("5")) {
      setError("Enter a valid Saudi number (9 digits starting with 5)");
      return;
    }
    setStep("otp");
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setError("");
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  }

  function handleOtpSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (code.length < 4) {
      setError("Enter the 4-digit code");
      return;
    }
    if (code !== DEMO_OTP) {
      setError("Incorrect code. Try 1234.");
      setOtp(["", "", "", ""]);
      otpRefs[0].current?.focus();
      return;
    }
    setLoading(true);
    router.push("/gifts");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Muhtar
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI-powered gift finder for Saudi Arabia
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card/60 p-6 shadow-xl backdrop-blur-sm">
          {step === "phone" ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">
                  Sign in
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Enter your Saudi mobile number
                </p>
              </div>

              <div className="flex gap-2">
                <span className="flex h-8 items-center rounded-lg border border-input bg-muted/40 px-3 text-sm text-muted-foreground select-none">
                  +966
                </span>
                <Input
                  type="tel"
                  inputMode="numeric"
                  placeholder="5XXXXXXXX"
                  maxLength={9}
                  value={phone}
                  onChange={(e) => {
                    setError("");
                    setPhone(e.target.value.replace(/\D/g, ""));
                  }}
                  className="flex-1 tracking-widest"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" size="lg">
                Send Code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-5">
              <div>
                <button
                  type="button"
                  onClick={() => { setStep("phone"); setOtp(["", "", "", ""]); setError(""); }}
                  className="mb-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back
                </button>
                <h2 className="text-lg font-semibold text-card-foreground">
                  Enter the code
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Sent to +966 {phone}
                </p>
              </div>

              <div className="flex justify-center gap-3">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={otpRefs[i]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    autoFocus={i === 0}
                    className="size-12 rounded-xl border border-input bg-input/30 text-center text-xl font-semibold text-foreground outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50"
                  />
                ))}
              </div>

              {error && (
                <p className="text-center text-xs text-destructive">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading || otp.join("").length < 4}
              >
                {loading ? "Signing in…" : "Verify"}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Demo: use code <span className="font-mono font-semibold text-foreground">1234</span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}