"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { CreditsProvider } from "@/lib/credits-context";
import { UserProvider, type AppUser } from "@/lib/user-context";

export default function AppShell({
  user,
  children,
}: {
  user: AppUser | null;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <UserProvider user={user}>
      <CreditsProvider initialCredits={user?.credits ?? 100}>
        <div className="m-app">
          <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
          <div className="m-main">
            <Header onMenuClick={() => setMobileOpen(true)} />
            <div className="m-content">{children}</div>
          </div>
        </div>
      </CreditsProvider>
    </UserProvider>
  );
}
