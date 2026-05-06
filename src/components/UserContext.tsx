"use client";

import { createContext, useContext, useEffect, useState } from "react";

type UserProfile = {
  name: string;
  firstName: string;
  initials: string;
  company: string;
  email: string;
};

const DEFAULT: UserProfile = {
  name: "Walid Qayoumi",
  firstName: "Walid",
  initials: "WQ",
  company: "Alphard",
  email: "",
};

const KEY = "alphard:user";

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function deriveProfile(name: string, company?: string, email?: string): UserProfile {
  const trimmed = name.trim();
  const firstName = trimmed.split(/\s+/)[0] || "Friend";
  return {
    name: trimmed || DEFAULT.name,
    firstName,
    initials: deriveInitials(trimmed),
    company: (company ?? DEFAULT.company).trim() || DEFAULT.company,
    email: (email ?? "").trim(),
  };
}

type Ctx = {
  user: UserProfile;
  setUser: (name: string, company?: string, email?: string) => void;
};

const UserCtx = createContext<Ctx>({ user: DEFAULT, setUser: () => {} });

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserProfile>(DEFAULT);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { name: string; company?: string; email?: string };
        if (parsed?.name) setUserState(deriveProfile(parsed.name, parsed.company, parsed.email));
      }
    } catch {}
  }, []);

  const setUser = (name: string, company?: string, email?: string) => {
    const next = deriveProfile(name, company, email);
    setUserState(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify({
        name: next.name, company: next.company, email: next.email,
      }));
    } catch {}
  };

  return <UserCtx.Provider value={{ user, setUser }}>{children}</UserCtx.Provider>;
}

export function useUser() { return useContext(UserCtx); }
