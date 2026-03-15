"use client";

import { createContext, useContext } from "react";

export interface AppUser {
  id: string;
  name: string;
  phone: string;
  credits: number;
}

const UserContext = createContext<AppUser | null>(null);

export function UserProvider({ user, children }: { user: AppUser | null; children: React.ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser(): AppUser | null {
  return useContext(UserContext);
}
