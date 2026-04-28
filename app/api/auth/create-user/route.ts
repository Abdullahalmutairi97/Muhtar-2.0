import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";
import { createSessionToken, sessionCookieOptions } from "@/lib/session";

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "MISSING";

  try {
    const { phone, name } = await req.json();
    const normalized = String(phone).replace(/\D/g, "");

    let supabase: ReturnType<typeof getSupabase>;
    try {
      supabase = getSupabase();
    } catch (e) {
      return NextResponse.json({ error: "supabase-init: " + String(e), supabaseUrl }, { status: 500 });
    }

    // If phone already registered, log them in (returning user — name not needed)
    let existing: { id: string } | null = null;
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("phone", normalized)
        .maybeSingle();
      if (error) {
        return NextResponse.json({ error: "supabase-select: " + JSON.stringify(error), supabaseUrl }, { status: 500 });
      }
      existing = data;
    } catch (e) {
      return NextResponse.json({ error: "supabase-select-catch: " + String(e), supabaseUrl }, { status: 500 });
    }

    let userId: string;

    if (existing) {
      userId = existing.id;
    } else {
      if (!name?.trim()) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
      }

      let newUser: { id: string } | null = null;
      try {
        const { data, error } = await supabase
          .from("users")
          .insert({ phone: normalized, name: name.trim() })
          .select("id")
          .single();
        if (error) {
          return NextResponse.json({ error: "supabase-insert: " + JSON.stringify(error), supabaseUrl }, { status: 500 });
        }
        newUser = data;
      } catch (e) {
        return NextResponse.json({ error: "supabase-insert-catch: " + String(e), supabaseUrl }, { status: 500 });
      }

      if (!newUser) {
        return NextResponse.json({ error: "supabase-insert: no data returned", supabaseUrl }, { status: 500 });
      }
      userId = newUser.id;
    }

    const token = await createSessionToken(userId);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(sessionCookieOptions(token));
    return res;
  } catch (err) {
    const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error("create-user error:", msg);
    return NextResponse.json({ error: "unexpected: " + msg, supabaseUrl }, { status: 500 });
  }
}
