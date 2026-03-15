export const SESSION_COOKIE = "msid";

function secret() {
  return new TextEncoder().encode(
    process.env.SESSION_SECRET ?? "muhtar-dev-secret-change-in-production"
  );
}

async function hmac(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", secret(), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const buf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function createSessionToken(userId: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + 30 * 24 * 3600;
  const payload = `${userId}.${exp}`;
  const sig = await hmac(payload);
  return `${payload}.${sig}`;
}

export async function parseSessionToken(token: string): Promise<string | null> {
  try {
    const lastDot = token.lastIndexOf(".");
    const secondLastDot = token.lastIndexOf(".", lastDot - 1);
    if (lastDot < 0 || secondLastDot < 0) return null;
    const userId = token.substring(0, secondLastDot);
    const exp = Number(token.substring(secondLastDot + 1, lastDot));
    const sig = token.substring(lastDot + 1);
    if (isNaN(exp) || Math.floor(Date.now() / 1000) > exp) return null;
    const expected = await hmac(`${userId}.${exp}`);
    return sig === expected ? userId : null;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 30 * 24 * 3600,
    path: "/",
  };
}
