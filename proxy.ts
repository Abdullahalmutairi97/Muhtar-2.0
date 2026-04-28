import { NextResponse, type NextRequest } from "next/server";
import { parseSessionToken, SESSION_COOKIE } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const userId = token ? await parseSessionToken(token) : null;
  const path = request.nextUrl.pathname;

  if (!userId && path !== "/signin") {
    return NextResponse.redirect(new URL("/signin", request.url));
  }
  if (userId && path === "/signin") {
    return NextResponse.redirect(new URL("/gifts", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico).*)"],
};
