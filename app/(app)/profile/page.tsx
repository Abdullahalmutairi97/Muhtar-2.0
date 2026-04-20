"use client";

import { useRouter } from "next/navigation";
import { useCredits } from "@/hooks/useCredits";
import { Button } from "@/components/ui/button";
import BuyCreditsDialog from "@/components/BuyCreditsDialog";
import { Coins, LogOut, User } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const { credits } = useCredits();

  function handleSignOut() {
    toast.success("Signed out");
    localStorage.clear();
    router.push("/signin");
  }

  return (
    <div className="mx-auto max-w-sm space-y-4">
      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <User className="size-8 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-card-foreground">Demo User</p>
          <p className="text-sm text-muted-foreground">+966 5XXXXXXXX</p>
        </div>
      </div>

      {/* Credits */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <Coins className="size-5 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-card-foreground">Credits</p>
            <p className="text-xs text-muted-foreground">5 credits per search</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-foreground">{credits}</span>
          <BuyCreditsDialog>
            <button className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors">
              Buy
            </button>
          </BuyCreditsDialog>
        </div>
      </div>

      {/* Sign out */}
      <Button variant="destructive" className="w-full gap-2" onClick={handleSignOut}>
        <LogOut className="size-4" /> Sign Out
      </Button>
    </div>
  );
}