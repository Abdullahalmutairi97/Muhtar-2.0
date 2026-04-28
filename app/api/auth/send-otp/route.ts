import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { phone } = await req.json();
  const normalized = String(phone).replace(/\D/g, "");
  if (normalized.length < 9) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
