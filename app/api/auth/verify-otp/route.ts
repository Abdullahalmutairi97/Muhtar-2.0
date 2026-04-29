import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";

const DEMO_CODE = "1234";

export async function POST(req: NextRequest) {
  const { phone, code } = await req.json();

  if (String(code) !== DEMO_CODE) {
    return NextResponse.json({ error: "Incorrect code" }, { status: 400 });
  }

  const normalized = String(phone).replace(/\D/g, "");
  const supabase = getSupabase();

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("phone", normalized)
    .maybeSingle();

  return NextResponse.json({ ok: true, isNew: !existing });
}
