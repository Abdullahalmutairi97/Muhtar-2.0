import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";
import { createSessionToken, sessionCookieOptions } from "@/lib/session";

const DEMO_CODE = "1234";

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();
    const normalized = String(phone).replace(/\D/g, "");

    if (String(code) !== DEMO_CODE) {
      return NextResponse.json({ error: "Incorrect code" }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("phone", normalized)
      .maybeSingle();

    if (user) {
      const token = await createSessionToken(user.id);
      const res = NextResponse.json({ ok: true, isNew: false });
      res.cookies.set(sessionCookieOptions(token));
      return res;
    }

    return NextResponse.json({ ok: true, isNew: true });
  } catch (err) {
    console.error("verify-otp error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
