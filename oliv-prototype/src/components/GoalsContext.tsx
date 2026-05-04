"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Persona } from "@/lib/mock";

export type Goals = {
  ae:      { quota: number };
  am:      { expansionTarget: number };
  csm:     { retentionTarget: number };
  manager: { teamQuota: number };
};

const DEFAULT_GOALS: Goals = {
  ae:      { quota: 1_200_000 },
  am:      { expansionTarget: 600_000 },     // matches myNumber.am.expansion.target
  csm:     { retentionTarget: 2_380_000 },   // matches sum of customer ARR
  manager: { teamQuota: 9_600_000 },
};

type Ctx = {
  goals: Goals;
  setQuota: (persona: Persona, value: number) => void;
};
const GoalsCtx = createContext<Ctx | null>(null);

const KEY = "alphard:goals";

export function GoalsProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<Goals>(DEFAULT_GOALS);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setGoals({ ...DEFAULT_GOALS, ...parsed });
      }
    } catch {}
  }, []);

  const setQuota = (persona: Persona, value: number) => {
    setGoals((prev) => {
      let next: Goals;
      if (persona === "ae")           next = { ...prev, ae:      { quota: value } };
      else if (persona === "am")      next = { ...prev, am:      { expansionTarget: value } };
      else if (persona === "csm")     next = { ...prev, csm:     { retentionTarget: value } };
      else                            next = { ...prev, manager: { teamQuota: value } };
      try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return (
    <GoalsCtx.Provider value={{ goals, setQuota }}>
      {children}
    </GoalsCtx.Provider>
  );
}

export function useGoals(): Ctx {
  const ctx = useContext(GoalsCtx);
  if (!ctx) return { goals: DEFAULT_GOALS, setQuota: () => {} };
  return ctx;
}

export function targetFor(goals: Goals, persona: Persona): number {
  if (persona === "ae")      return goals.ae.quota;
  if (persona === "am")      return goals.am.expansionTarget;
  if (persona === "csm")     return goals.csm.retentionTarget;
  return goals.manager.teamQuota;
}
