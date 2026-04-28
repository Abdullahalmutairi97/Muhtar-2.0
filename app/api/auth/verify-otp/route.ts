import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";
import { createSessionToken, sessionCookieOptions } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();
    const normalized = String(phone).replace(/\D/g, "");

    const supabase = getSupabase();

    const { data: otp } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("phone", normalized)
      .single();

    if (!otp) {
      return NextResponse.json({ error: "No code requested for this number" }, { status: 400 });
    }
    if (new Date(otp.expires_at) < new Date()) {
      await supabase.from("otp_codes").delete().eq("phone", normalized);
      return NextResponse.json({ error: "Code expired — request a new one" }, { status: 400 });
    }
    if (otp.attempts >= 5) {
      return NextResponse.json({ error: "Too many attempts — request a new code" }, { status: 429 });
    }

    await supabase.from("otp_codes").update({ attempts: otp.attempts + 1 }).eq("phone", normalized);

    if (otp.code !== String(code)) {
      return NextResponse.json({ error: "Incorrect code" }, { status: 400 });
    }

    // Code correct — check if user exists
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("phone", normalized)
      .maybeSingle();

    if (user) {
      // Existing user — log them in
      const token = await createSessionToken(user.id);
      await supabase.from("otp_codes").delete().eq("phone", normalized);
      const res = NextResponse.json({ ok: true, isNew: false });
      res.cookies.set(sessionCookieOptions(token));
      return res;
    }

    // New user — mark verified, frontend will ask for name
    await supabase
      .from("otp_codes")
      .update({ verified_at: new Date().toISOString() })
      .eq("phone", normalized);

    return NextResponse.json({ ok: true, isNew: true });
  } catch (err) {
    console.error("verify-otp error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
