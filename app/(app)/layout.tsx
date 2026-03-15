import { cookies } from "next/headers";
import { parseSessionToken, SESSION_COOKIE } from "@/lib/session";
import { getSupabase } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const userId = token ? await parseSessionToken(token) : null;

  let user = null;
  if (userId) {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("users")
      .select("id, name, phone, credits")
      .eq("id", userId)
      .single();
    user = data;
  }

  return <AppShell user={user}>{children}</AppShell>;
}
