"use client";

export function useAuth() {
  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.href = "/signin";
  }

  return { signOut };
}

