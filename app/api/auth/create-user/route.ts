import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";
import { createSessionToken, sessionCookieOptions } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { phone, name } = await req.json();
    const normalized = String(phone).replace(/\D/g, "");
    const supabase = getSupabase();

    // If phone already registered, log them in (returning user — name not needed)
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("phone", normalized)
      .maybeSingle();

    let userId: string;

    if (existing) {
      userId = existing.id;
    } else {
      if (!name?.trim()) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
      }
      const { data: user, error } = await supabase
        .from("users")
        .insert({ phone: normalized, name: name.trim() })
        .select("id")
        .single();

      if (error || !user) {
        console.error("insert error:", error);
        return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
      }
      userId = user.id;
    }

    const token = await createSessionToken(userId);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(sessionCookieOptions(token));
    return res;
  } catch (err) {
    console.error("create-user error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
