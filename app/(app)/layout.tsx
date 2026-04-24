"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { CreditsProvider } from "@/lib/credits-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <CreditsProvider>
      <div className="m-app">
        <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <div className="m-main">
          <Header onMenuClick={() => setMobileOpen(true)} />
          <div className="m-content">
            {children}
          </div>
        </div>
      </div>
    </CreditsProvider>
  );
}