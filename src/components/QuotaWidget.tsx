"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, ArrowUpRight, X } from "lucide-react";
import { fmtMoney, myNumber, type Persona } from "@/lib/mock";
import { useGoals, targetFor } from "./GoalsContext";

export function QuotaWidget({ persona, compact = false }: { persona: Persona; compact?: boolean }) {
  const { goals } = useGoals();
  const target = targetFor(goals, persona);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const { primary, label, sub, deltaPct } = derive(persona, target);
  const pct = Math.min(100, Math.round((primary / target) * 100));

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const size = compact ? 26 : 44;
  const stroke = compact ? 3 : 4;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const dashOffset = C - (pct / 100) * C;

  const ringColor = pct >= 75 ? "var(--pos)" : pct >= 40 ? "var(--accent-deep)" : "var(--warn)";
  const detailRoute = "/scorecard";
  const shortLabel = label.split(" · ")[1] ?? label;

  if (compact) {
    return (
      <div ref={wrapRef} className="relative hidden md:block">
        <button onClick={() => setOpen(!open)}
          title={`${label} · ${fmtMoney(primary)} of ${fmtMoney(target)} (${pct}%)`}
          className="inline-flex items-center gap-2 h-8 pl-1.5 pr-2.5 rounded-lg border border-line bg-surface hover:bg-surface-2 transition-colors group">
          <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
              <circle cx={size/2} cy={size/2} r={r}
                stroke="var(--bg-deep)" strokeWidth={stroke} fill="none" />
              <circle cx={size/2} cy={size/2} r={r}
                stroke={ringColor} strokeWidth={stroke} fill="none"
                strokeDasharray={C} strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 600ms cubic-bezier(0.32, 0.72, 0, 1)" }} />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-[8.5px] font-bold tnum" style={{ color: ringColor }}>
              {pct}
            </div>
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="mono-label text-[8.5px]" style={{ letterSpacing: "0.08em" }}>{shortLabel}</span>
            <span className="text-[11px] font-bold text-ink tnum mt-0.5">
              {fmtMoney(primary)} <span className="text-muted-2 font-normal">/ {fmtMoney(target)}</span>
            </span>
          </div>
        </button>
        {open && (
          <ScorecardPopover
            persona={persona}
            label={shortLabel}
            primary={primary}
            target={target}
            pct={pct}
            sub={sub}
            deltaPct={deltaPct}
            ringColor={ringColor}
            detailRoute={detailRoute}
            onClose={() => setOpen(false)} />
        )}
      </div>
    );
  }

  return (
    <Link
      href={detailRoute}
      className="card flex items-center gap-3 px-3 py-2 hover:shadow-md transition-shadow group"
      style={{ minWidth: 220 }}
    >
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r}
            stroke="var(--bg-deep)" strokeWidth={stroke} fill="none" />
          <circle cx={size/2} cy={size/2} r={r}
            stroke={ringColor} strokeWidth={stroke} fill="none"
            strokeDasharray={C} strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 600ms cubic-bezier(0.32, 0.72, 0, 1)" }} />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-[10px] font-bold tnum" style={{ color: ringColor }}>
          {pct}%
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="mono-label text-[9px] mb-0.5" style={{ letterSpacing: "0.1em" }}>
          {label}
        </div>
        <div className="text-[13px] font-bold text-ink tnum leading-tight">
          {fmtMoney(primary)}
          <span className="text-muted font-normal text-[11px]"> / {fmtMoney(target)}</span>
        </div>
        <div className="text-[10px] text-muted-2 leading-tight">
          {sub}
          {typeof deltaPct === "number" && (
            <span style={{ color: deltaPct >= 0 ? "var(--pos)" : "var(--neg)" }}>
              {" "}· {deltaPct >= 0 ? "+" : ""}{deltaPct}% pace
            </span>
          )}
        </div>
      </div>

      <ChevronRight size={12} className="text-muted-2 group-hover:text-ink shrink-0" strokeWidth={1.6} />
    </Link>
  );
}

function derive(persona: Persona, _target: number) {
  if (persona === "ae") {
    const a = myNumber.ae;
    return {
      primary:  a.closed,
      label:    `${a.quarter} · QUOTA`,
      sub:      `${fmtMoney(a.commit)} commit`,
      deltaPct: a.deltaPct,
    };
  }
  if (persona === "am") {
    const e = myNumber.am.expansion;
    return {
      primary:  e.closed + e.inMotion,
      label:    `${myNumber.am.quarter} · EXPANSION`,
      sub:      `${fmtMoney(e.closed)} closed · ${fmtMoney(e.inMotion)} in motion`,
      deltaPct: undefined,
    };
  }
  if (persona === "csm") {
    const r = myNumber.csm.retention;
    return {
      primary:  r.secured,
      label:    `${myNumber.csm.quarter} · RETENTION`,
      sub:      `${fmtMoney(r.atRisk)} at-risk`,
      deltaPct: undefined,
    };
  }
  const m = myNumber.manager;
  return {
    primary:  m.teamCommit,
    label:    `${m.quarter} · TEAM COMMIT`,
    sub:      `${m.coverage}x coverage`,
    deltaPct: undefined,
  };
}

function ScorecardPopover({
  persona, label, primary, target, pct, sub, deltaPct, ringColor, detailRoute, onClose,
}: {
  persona: Persona; label: string; primary: number; target: number; pct: number;
  sub: string; deltaPct: number | undefined; ringColor: string; detailRoute: string; onClose: () => void;
}) {
  const remaining = Math.max(0, target - primary);
  const personaLabel =
    persona === "am" ? "Expansion"  :
    persona === "ae" ? "Quota"      :
    persona === "csm" ? "Retention" : "Team Commit";
  return (
    <div className="absolute right-0 top-full mt-2 w-[320px] rounded-2xl border border-line bg-surface shadow-xl z-50 fade-in"
      style={{ boxShadow: "0 24px 60px -16px rgba(15,18,24,0.30)" }}>
      <div className="flex items-start justify-between p-4 pb-2">
        <div>
          <div className="mono-label text-[9px] mb-0.5" style={{ letterSpacing: "0.12em" }}>{label}</div>
          <div className="text-[20px] font-bold tnum text-ink leading-none" style={{ letterSpacing: "-0.018em" }}>
            {fmtMoney(primary)}
            <span className="text-[12px] font-normal text-muted ml-1">/ {fmtMoney(target)}</span>
          </div>
          <div className="text-[11px] font-mono tnum mt-0.5" style={{ color: ringColor }}>{pct}% achieved</div>
        </div>
        <button onClick={onClose} className="p-1 rounded text-muted hover:text-ink hover:bg-bg-deep transition-colors">
          <X size={12} strokeWidth={1.8} />
        </button>
      </div>
      {/* Progress rail */}
      <div className="px-4 pb-2.5">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--line)" }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: ringColor }} />
        </div>
      </div>
      <div className="px-4 pb-3 text-[11.5px] text-muted-2 leading-snug">
        {sub}
        {typeof deltaPct === "number" && (
          <span style={{ color: deltaPct >= 0 ? "var(--pos)" : "var(--neg)" }}>
            {" · "}{deltaPct >= 0 ? "+" : ""}{deltaPct}% pace
          </span>
        )}
        {remaining > 0 && (
          <>{" · "}<b className="text-ink-2">{fmtMoney(remaining)} to target</b></>
        )}
      </div>
      <div className="border-t border-line px-4 py-2.5 flex items-center justify-between">
        <span className="text-[11px] text-muted">View {personaLabel} detail</span>
        <Link href={detailRoute} onClick={onClose}
          className="inline-flex items-center gap-1 text-[11.5px] font-semibold px-2.5 py-1.5 rounded-md text-white transition-transform hover:scale-[1.03]"
          style={{ background: "var(--ink)" }}>
          Open <ArrowUpRight size={11} strokeWidth={2.2} />
        </Link>
      </div>
    </div>
  );
}
