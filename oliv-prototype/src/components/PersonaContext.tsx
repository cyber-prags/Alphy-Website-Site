"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Persona } from "@/lib/mock";

type Ctx = { persona: Persona; setPersona: (p: Persona) => void };
const PersonaCtx = createContext<Ctx | null>(null);

const KEY = "alphard:persona";
const LEGACY_KEY = "oliv:persona";

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<Persona>("ae");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(KEY) ?? window.localStorage.getItem(LEGACY_KEY);
      if (stored === "ae" || stored === "am" || stored === "csm" || stored === "manager") {
        setPersonaState(stored);
        // migrate
        if (window.localStorage.getItem(LEGACY_KEY)) {
          window.localStorage.setItem(KEY, stored);
          window.localStorage.removeItem(LEGACY_KEY);
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  const setPersona = (p: Persona) => {
    setPersonaState(p);
    try { window.localStorage.setItem(KEY, p); } catch {}
  };

  return (
    <PersonaCtx.Provider value={{ persona, setPersona }}>
      {/* avoid hydration mismatch flicker by waiting one tick before showing
          persona-dependent surfaces; non-persona-dependent UI renders fine */}
      <span data-hydrated={hydrated} hidden />
      {children}
    </PersonaCtx.Provider>
  );
}

export function usePersona(): Ctx {
  const ctx = useContext(PersonaCtx);
  if (!ctx) return { persona: "ae", setPersona: () => {} };
  return ctx;
}

export const PERSONA_LABEL: Record<Persona, string> = {
  ae:      "Account Executive",
  am:      "Account Manager",
  csm:     "Customer Success",
  manager: "Sales Manager",
};
