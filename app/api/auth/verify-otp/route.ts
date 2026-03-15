import { NextRequest, NextResponse } from "next/server";

const DEMO_CODE = "1234";

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  if (String(code) !== DEMO_CODE) {
    return NextResponse.json({ error: "Incorrect code" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, isNew: true });
}
