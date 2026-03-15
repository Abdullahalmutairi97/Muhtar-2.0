import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";
import { parseSessionToken, SESSION_COOKIE } from "@/lib/session";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const userId = token ? await parseSessionToken(token) : null;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { amount } = await req.json();
  const supabase = getSupabase();

  const { data: user } = await supabase
    .from("users")
    .select("credits")
    .eq("id", userId)
    .single();

  if (!user || user.credits < amount) {
    return NextResponse.json({ error: "Insufficient credits" }, { status: 400 });
  }

  const newCredits = user.credits - amount;
  await supabase.from("users").update({ credits: newCredits }).eq("id", userId);

  return NextResponse.json({ ok: true, credits: newCredits });
}
