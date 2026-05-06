"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ClosureStatus = "new" | "seen" | "acted" | "resolved" | "dismissed" | "snoozed";

export type ClosureEvent = {
  at: string;            // ISO
  by: string;            // actor name
  type: ClosureStatus | "commented" | "assigned";
  note?: string;
  to?: string;           // for "assigned"
};

export type ClosureRecord = {
  id: string;
  status: ClosureStatus;
  assignee?: string;
  events: ClosureEvent[];
};

type Ctx = {
  records: Record<string, ClosureRecord>;
  get: (id: string) => ClosureRecord | undefined;
  status: (id: string) => ClosureStatus;
  see: (id: string, by: string) => void;
  act: (id: string, by: string, note?: string) => void;
  resolve: (id: string, by: string, note?: string) => void;
  dismiss: (id: string, by: string, note?: string) => void;
  snooze: (id: string, by: string) => void;
  reopen: (id: string, by: string) => void;
  comment: (id: string, by: string, text: string) => void;
  assign: (id: string, by: string, to: string) => void;
  totals: { new: number; seen: number; acted: number; resolved: number; dismissed: number; snoozed: number; openActioned: number };
};

const ClosureCtx = createContext<Ctx | null>(null);
const KEY = "alphard:closure";

export function ClosureProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<Record<string, ClosureRecord>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setRecords(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(KEY, JSON.stringify(records)); } catch {}
  }, [records, hydrated]);

  const update = useCallback((id: string, fn: (r: ClosureRecord) => ClosureRecord) => {
    setRecords((prev) => {
      const cur = prev[id] ?? { id, status: "new" as ClosureStatus, events: [] };
      return { ...prev, [id]: fn(cur) };
    });
  }, []);

  const append = (r: ClosureRecord, ev: ClosureEvent): ClosureRecord => ({
    ...r,
    events: [...r.events, ev],
  });

  const see = useCallback((id: string, by: string) => {
    update(id, (r) => {
      if (r.status !== "new") return r;
      return { ...append(r, { at: now(), by, type: "seen" }), status: "seen" };
    });
  }, [update]);

  const act = useCallback((id: string, by: string, note?: string) => {
    update(id, (r) => ({ ...append(r, { at: now(), by, type: "acted", note }), status: "acted" }));
  }, [update]);

  const resolve = useCallback((id: string, by: string, note?: string) => {
    update(id, (r) => ({ ...append(r, { at: now(), by, type: "resolved", note }), status: "resolved" }));
  }, [update]);

  const dismiss = useCallback((id: string, by: string, note?: string) => {
    update(id, (r) => ({ ...append(r, { at: now(), by, type: "dismissed", note }), status: "dismissed" }));
  }, [update]);

  const snooze = useCallback((id: string, by: string) => {
    update(id, (r) => ({ ...append(r, { at: now(), by, type: "snoozed" }), status: "snoozed" }));
  }, [update]);

  const reopen = useCallback((id: string, by: string) => {
    update(id, (r) => ({ ...append(r, { at: now(), by, type: "seen", note: "Reopened" }), status: "seen" }));
  }, [update]);

  const comment = useCallback((id: string, by: string, text: string) => {
    update(id, (r) => append(r, { at: now(), by, type: "commented", note: text }));
  }, [update]);

  const assign = useCallback((id: string, by: string, to: string) => {
    update(id, (r) => ({ ...append(r, { at: now(), by, type: "assigned", to }), assignee: to }));
  }, [update]);

  const status = useCallback((id: string): ClosureStatus => records[id]?.status ?? "new", [records]);
  const get    = useCallback((id: string) => records[id], [records]);

  const totals = useMemo(() => {
    const t = { new: 0, seen: 0, acted: 0, resolved: 0, dismissed: 0, snoozed: 0, openActioned: 0 };
    Object.values(records).forEach((r) => {
      t[r.status] += 1;
      if (r.status === "acted") t.openActioned += 1;
    });
    return t;
  }, [records]);

  const value: Ctx = { records, get, status, see, act, resolve, dismiss, snooze, reopen, comment, assign, totals };
  return <ClosureCtx.Provider value={value}>{children}</ClosureCtx.Provider>;
}

export function useClosure(): Ctx {
  const v = useContext(ClosureCtx);
  if (!v) throw new Error("useClosure must be used inside ClosureProvider");
  return v;
}

const now = () => new Date().toISOString();

// ---------------------------------------------------------------------------
// UI atoms — used across TodayQueue, Signals, Notifications
// ---------------------------------------------------------------------------

const STATUS_META: Record<ClosureStatus, { label: string; bg: string; ink: string; dot?: string }> = {
  new:       { label: "New",        bg: "var(--accent-soft)", ink: "var(--accent-ink)", dot: "var(--accent-deep)" },
  seen:      { label: "Seen",       bg: "var(--info-soft)",   ink: "var(--info)",       dot: "var(--info)" },
  acted:     { label: "Acted",      bg: "var(--bg-deep)",     ink: "var(--ink)",        dot: "var(--ink)" },
  resolved:  { label: "Resolved",   bg: "var(--pos-soft)",    ink: "var(--pos)",        dot: "var(--pos)" },
  dismissed: { label: "Dismissed",  bg: "var(--bg-deep)",     ink: "var(--muted)",      dot: "var(--muted-2)" },
  snoozed:   { label: "Snoozed",    bg: "var(--warn-soft)",   ink: "var(--warn)",       dot: "var(--warn)" },
};

export function ClosureBadge({ status, size = "sm" }: { status: ClosureStatus; size?: "xs" | "sm" }) {
  const m = STATUS_META[status];
  const fontSize = size === "xs" ? 9 : 10;
  const padY = size === "xs" ? 1 : 2;
  return (
    <span
      className="inline-flex items-center gap-1 font-mono uppercase tracking-[0.06em] rounded font-semibold"
      style={{ background: m.bg, color: m.ink, fontSize, padding: `${padY}px 6px` }}
    >
      <span className="w-1 h-1 rounded-full" style={{ background: m.dot }} />
      {m.label}
    </span>
  );
}

export function STATUS_LABEL(s: ClosureStatus) { return STATUS_META[s].label; }
