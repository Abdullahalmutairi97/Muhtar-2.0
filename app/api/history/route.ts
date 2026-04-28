import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";
import { parseSessionToken, SESSION_COOKIE } from "@/lib/session";

async function getUserId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return token ? parseSessionToken(token) : null;
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json([]);

  const supabase = getSupabase();
  const { data } = await supabase
    .from("search_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json(
    (data ?? []).map((r) => ({
      id: r.id,
      type: r.type,
      query: r.query,
      credits: r.credits_spent,
      at: r.created_at,
    }))
  );
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { type, query, credits } = await req.json();
  const supabase = getSupabase();
  await supabase.from("search_history").insert({
    user_id: userId,
    type,
    query,
    credits_spent: credits ?? 0,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const supabase = getSupabase();
  await supabase.from("search_history").delete().eq("user_id", userId);

  return NextResponse.json({ ok: true });
}
