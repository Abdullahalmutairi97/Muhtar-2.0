import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { CreditsProvider } from "@/lib/credits-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CreditsProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6">
            {children}
          </main>
        </div>
      </div>
    </CreditsProvider>
  );
}