"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/AppShell";

const STAGES = ["Prospect", "Educate", "Close", "Onboard", "Retain", "Expand"];
const ACHIEVED = [30, 22, 15, 11, 11.2, 12.4];
const EXPECTED = [30, 23.2, 17, 13, 11, 11.4];
const DELTAS   = ["+$2M", "−$1.2M", "−$2M", "−$600K", "+$200K", "+$1M"];

const TEAMS = ["Marketing", "Product", "Sales", "Customer Success", "Account Management"] as const;
type Team = typeof TEAMS[number];

const TEAM_DATA: Record<Team, { kpis: { label: string; value: string }[]; insights: { tone: "pos" | "neg" | "warn"; head: string; body: string }[] }> = {
  Marketing: {
    kpis: [
      { label: "Total leads generated", value: "1,200" },
      { label: "Qualified MQLs",        value: "450"   },
      { label: "SQL conversion",        value: "38%"   },
    ],
    insights: [
      { tone: "pos",  head: "C-suite lift (+20% QoQ)",                body: "Share of qualified leads from VP/CXO titles increased ~20% vs Q1, improving meeting quality and enterprise access." },
      { tone: "warn", head: "Persona mis-targeting (RevOps/Enablement)", body: "Disqualifications were concentrated in RevOps & Enablement personas, indicating weak buyer authority and poorer deal progression." },
      { tone: "neg",  head: "Outbound underperformed",                  body: "Outbound reply rate at ~12% vs 18% last quarter; inbound events/webinars contributed the majority of SQLs." },
    ],
  },
  Product:  { kpis: [{ label: "Activation rate", value: "62%" }, { label: "DAU/MAU", value: "0.41" }, { label: "Feature usage breadth", value: "5.2" }],
              insights: [{ tone: "pos", head: "Coach adoption climbing", body: "Coach views grew 38% MoM after the Apr release of clip-level evidence." }] },
  Sales:    { kpis: [{ label: "Bookings", value: "$5.3M" }, { label: "Avg deal size", value: "$192K" }, { label: "Win rate", value: "27%" }],
              insights: [{ tone: "pos", head: "MEDDPICC scoring up", body: "Average MEDDPICC completeness rose from 4.1 to 5.3 across active deals." },
                         { tone: "warn", head: "Cycle length creeping", body: "Median cycle in Enterprise pipeline ticked from 49 to 56 days." }] },
  "Customer Success": { kpis: [{ label: "Net retention", value: "112%" }, { label: "Churn $",  value: "$220K" }, { label: "QBRs delivered", value: "47" }],
              insights: [{ tone: "pos", head: "Expansion green-shoots", body: "8 customers expanded seats by ≥20% after Coach was activated for their CSMs." }] },
  "Account Management": { kpis: [{ label: "Renewals at risk", value: "5" }, { label: "Multi-year %", value: "42%" }, { label: "Reference accounts", value: "12" }],
              insights: [{ tone: "warn", head: "Single-threaded renewals", body: "5 strategic accounts have only one engaged contact — flagging for multithreading." }] },
};

export default function RevenuePage() {
  const [team, setTeam] = useState<Team>("Marketing");
  const cur = TEAM_DATA[team];
  return (
    <AppShell>
      <div className="mb-5">
        <div className="mono-label mb-1.5">Revenue</div>
        <h1 className="display" style={{ fontSize: 22 }}>Funnel overview</h1>
      </div>

      {/* Filters strip */}
      <div className="card p-3 mb-4 flex items-center gap-2 flex-wrap text-[12.5px]">
        <span className="mono-label">Filters</span>
        <Tag>Account Stage Entered · 10/01/2024 — 12/31/2024</Tag>
        <Tag>Vertical · Software, Technology</Tag>
        <Tag>Stage · Target → Expand</Tag>
      </div>

      {/* Funnel */}
      <div className="card p-5 mb-4">
        <div className="mono-label mb-2">Revenue Funnel Overview</div>
        <FunnelChart />
        <div className="flex items-center gap-4 text-[11px] text-muted mt-3 justify-end">
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "var(--pos)" }} />Achieved</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full border-2" style={{ borderColor: "var(--neg)" }} />Expected</span>
        </div>
      </div>

      {/* Team tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-line">
        {TEAMS.map((t) => (
          <button key={t} onClick={() => setTeam(t)}
            className={`text-[12.5px] font-medium px-3 py-2 -mb-px ${
              team === t ? "text-ink border-b-2 border-ink" : "text-muted hover:text-ink"
            }`}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {cur.kpis.map((k) => (
          <div key={k.label} className="card p-4">
            <div className="display" style={{ fontSize: 32 }}>{k.value}</div>
            <div className="text-[11.5px] text-muted mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <div className="mono-label mb-3">Key Insights</div>
        <div className="space-y-3">
          {cur.insights.map((i) => {
            const Icon = i.tone === "pos" ? TrendingUp : i.tone === "neg" ? TrendingDown : AlertTriangle;
            const c = i.tone === "pos" ? "var(--pos)" : i.tone === "neg" ? "var(--neg)" : "var(--warn)";
            return (
              <div key={i.head} className="flex gap-3">
                <Icon size={16} strokeWidth={1.6} style={{ color: c, marginTop: 2 }} />
                <div>
                  <div className="text-[13.5px] font-semibold text-ink">{i.head}</div>
                  <div className="text-[12.5px] text-ink-2 mt-0.5">{i.body}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center h-7 px-2.5 rounded-full bg-bg-deep text-ink-2">{children}</span>;
}

function FunnelChart() {
  const w = 1100, h = 280, pad = 20;
  const stepX = (w - 2 * pad) / (STAGES.length - 1);
  const max = 32;
  const yOf = (v: number) => pad + ((max - v) / max) * (h - 2 * pad);
  const achPath = ACHIEVED.map((v, i) => `${i === 0 ? "M" : "L"}${pad + i * stepX},${yOf(v)}`).join(" ");
  const expPath = EXPECTED.map((v, i) => `${i === 0 ? "M" : "L"}${pad + i * stepX},${yOf(v)}`).join(" ");
  const achArea = `${achPath} L${pad + (STAGES.length - 1) * stepX},${h - pad} L${pad},${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h + 30}`} className="w-full" style={{ maxHeight: 320 }}>
      {[0, 10, 20, 30].map((y) => (
        <line key={y} x1={pad} x2={w - pad} y1={yOf(y)} y2={yOf(y)} stroke="var(--line)" strokeDasharray="2 4" />
      ))}
      <path d={achArea} fill="rgba(47,143,77,0.12)" />
      <path d={achPath} stroke="var(--pos)" fill="none" strokeWidth="2.5" />
      <path d={expPath} stroke="var(--neg)" fill="none" strokeWidth="2" strokeDasharray="6 4" />
      {ACHIEVED.map((v, i) => <circle key={`a${i}`} cx={pad + i * stepX} cy={yOf(v)} r="4" fill="var(--pos)" />)}
      {EXPECTED.map((v, i) => <circle key={`e${i}`} cx={pad + i * stepX} cy={yOf(v)} r="4" fill="white" stroke="var(--neg)" strokeWidth="2" />)}
      {STAGES.map((s, i) => (
        <g key={s}>
          <text x={pad + i * stepX} y={pad - 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--ink)">{s}</text>
          <text x={pad + i * stepX} y={h - 5} textAnchor="middle" fontSize="10" fill="var(--muted)">${ACHIEVED[i]}M</text>
        </g>
      ))}
      {DELTAS.map((d, i) => (
        <g key={i} transform={`translate(${pad + i * stepX}, ${yOf(EXPECTED[i]) - 14})`}>
          <rect x="-22" y="-10" width="44" height="18" rx="9" fill="white" stroke={d.startsWith("+") ? "var(--pos)" : "var(--neg)"} />
          <text textAnchor="middle" y="3" fontSize="9.5" fontWeight="700" fill={d.startsWith("+") ? "var(--pos)" : "var(--neg)"}>{d}</text>
        </g>
      ))}
    </svg>
  );
}
