import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";
import { createSessionToken, sessionCookieOptions } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { phone, name } = await req.json();
    const normalized = String(phone).replace(/\D/g, "");
    const supabase = getSupabase();

    const { data: existing, error: selectErr } = await supabase
      .from("users")
      .select("id")
      .eq("phone", normalized)
      .maybeSingle();

    if (selectErr) return NextResponse.json({ error: "Database error" }, { status: 500 });

    let userId: string;

    if (existing) {
      userId = existing.id;
    } else {
      if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

      const { data: user, error: insertErr } = await supabase
        .from("users")
        .insert({ phone: normalized, name: name.trim() })
        .select("id")
        .single();

      if (insertErr || !user) return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
      userId = user.id;
    }

    const token = await createSessionToken(userId);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(sessionCookieOptions(token));
    return res;
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
