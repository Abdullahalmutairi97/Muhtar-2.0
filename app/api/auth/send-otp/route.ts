import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    const normalized = String(phone).replace(/\D/g, "");
    if (normalized.length < 9) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const supabase = getSupabase();
    const { error } = await supabase.from("otp_codes").upsert(
      { phone: normalized, code, expires_at: expiresAt, attempts: 0, verified_at: null },
      { onConflict: "phone" }
    );
    if (error) throw error;

    // TODO: Replace with real SMS (Twilio / Unifonic) when SMS_API_KEY is set
    const devMode = !process.env.SMS_API_KEY;

    return NextResponse.json({ ok: true, ...(devMode ? { devCode: code } : {}) });
  } catch (err) {
    console.error("send-otp error:", err);
    return NextResponse.json({ error: "Failed to send code" }, { status: 500 });
  }
}
