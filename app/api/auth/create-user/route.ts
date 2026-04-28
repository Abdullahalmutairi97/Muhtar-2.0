import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";
import { createSessionToken, sessionCookieOptions } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { phone, name } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const normalized = String(phone).replace(/\D/g, "");
    const supabase = getSupabase();

    // Ensure OTP was verified recently
    const { data: otp } = await supabase
      .from("otp_codes")
      .select("verified_at")
      .eq("phone", normalized)
      .single();

    if (!otp?.verified_at) {
      return NextResponse.json({ error: "Phone not verified — start over" }, { status: 401 });
    }
    if (new Date(otp.verified_at) < new Date(Date.now() - 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Verification expired — start over" }, { status: 400 });
    }

    // Double-check phone isn't already taken
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("phone", normalized)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "This number is already registered" }, { status: 409 });
    }

    const { data: user, error } = await supabase
      .from("users")
      .insert({ phone: normalized, name: name.trim() })
      .select("id")
      .single();

    if (error || !user) {
      throw error ?? new Error("Insert failed");
    }

    await supabase.from("otp_codes").delete().eq("phone", normalized);

    const token = await createSessionToken(user.id);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(sessionCookieOptions(token));
    return res;
  } catch (err) {
    console.error("create-user error:", err);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
