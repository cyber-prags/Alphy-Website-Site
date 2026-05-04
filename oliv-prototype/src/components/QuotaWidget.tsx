"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { fmtMoney, myNumber, type Persona } from "@/lib/mock";
import { useGoals, targetFor } from "./GoalsContext";

export function QuotaWidget({ persona, compact = false }: { persona: Persona; compact?: boolean }) {
  const { goals } = useGoals();
  const target = targetFor(goals, persona);

  const { primary, label, sub, deltaPct } = derive(persona, target);
  const pct = Math.min(100, Math.round((primary / target) * 100));

  const size = compact ? 26 : 44;
  const stroke = compact ? 3 : 4;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const dashOffset = C - (pct / 100) * C;

  const ringColor = pct >= 75 ? "var(--pos)" : pct >= 40 ? "var(--accent-deep)" : "var(--warn)";

  if (compact) {
    return (
      <Link href="/forecast"
        title={`${label} · ${fmtMoney(primary)} of ${fmtMoney(target)} (${pct}%)`}
        className="hidden md:inline-flex items-center gap-2 h-8 pl-1.5 pr-2.5 rounded-lg border border-line bg-surface hover:bg-surface-2 transition-colors group">
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
          <span className="mono-label text-[8.5px]" style={{ letterSpacing: "0.08em" }}>{label.split(" · ")[1] ?? label}</span>
          <span className="text-[11px] font-bold text-ink tnum mt-0.5">
            {fmtMoney(primary)} <span className="text-muted-2 font-normal">/ {fmtMoney(target)}</span>
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href="/forecast"
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
      primary:  e.inMotion,
      label:    `${myNumber.am.quarter} · EXPANSION`,
      sub:      `${fmtMoney(e.drafted)} drafted`,
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
