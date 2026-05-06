"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { waterfallData, accountMovements, fmtMoney } from "@/lib/mock";

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

type View = "overview" | "waterfall" | "movement";

export default function RevenuePage() {
  const [team, setTeam] = useState<Team>("Marketing");
  const [view, setView] = useState<View>("overview");
  const cur = TEAM_DATA[team];
  return (
    <AppShell>
      <div className="mb-5">
        <div className="mono-label mb-1.5">Revenue</div>
        <h1 className="display" style={{ fontSize: 22 }}>
          {view === "overview" ? "Funnel overview" : view === "waterfall" ? "ARR Waterfall" : "Account Movement"}
        </h1>
      </div>

      {/* View tabs */}
      <div className="flex items-center gap-1 mb-4">
        {([["overview", "Overview"], ["waterfall", "Waterfall"], ["movement", "Movement"]] as const).map(([v, label]) => (
          <button key={v} onClick={() => setView(v)}
            className={`text-[12px] font-medium px-3 py-2 rounded-lg transition-colors ${
              view === v ? "bg-ink text-white" : "text-muted hover:text-ink hover:bg-bg-deep"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {view === "waterfall" && <WaterfallView />}
      {view === "movement" && <MovementView />}
      {view === "overview" && <OverviewView team={team} setTeam={setTeam} cur={cur} />}
    </AppShell>
  );
}

function WaterfallView() {
  const [period, setPeriod] = useState(0);
  const w = waterfallData[period];
  const segments = [
    { label: "Starting ARR", value: w.startArr, color: "var(--muted)" },
    { label: "New Business", value: w.newBusiness, color: "var(--pos)" },
    { label: "Expansion", value: w.expansion, color: "var(--accent)" },
    { label: "Contraction", value: w.contraction, color: "var(--warn)" },
    { label: "Churn", value: w.churn, color: "var(--neg)" },
    { label: "Ending ARR", value: w.endArr, color: "var(--info)" },
  ];
  const max = Math.max(...segments.map((s) => Math.abs(s.value)));

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="mono-label">ARR Bridge</div>
        <div className="flex items-center gap-1">
          {waterfallData.map((d, i) => (
            <button key={i} onClick={() => setPeriod(i)}
              className={`text-[11.5px] font-medium px-3 py-1.5 rounded-lg ${
                period === i ? "bg-ink text-white" : "text-muted hover:text-ink border border-line"
              }`}>
              {d.period}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <span className="text-[11.5px] text-muted w-28 text-right shrink-0">{s.label}</span>
            <div className="flex-1 h-8 rounded-lg overflow-hidden relative" style={{ background: "var(--bg-deep)" }}>
              <div
                className="h-full rounded-lg transition-all"
                style={{ width: `${(Math.abs(s.value) / max) * 100}%`, background: s.color, opacity: 0.85 }}
              />
              <span className="absolute inset-y-0 right-2 flex items-center text-[11px] font-mono tnum font-semibold text-ink">
                {s.value < 0 ? "−" : ""}{fmtMoney(Math.abs(s.value))}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-line text-[10.5px] text-muted">
        {segments.slice(0, -1).map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />{s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function MovementView() {
  const months = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];
  const COLORS: Record<string, string> = {
    expansion: "var(--accent)", contraction: "var(--warn)", churn: "var(--neg)", flat: "var(--line)", new: "var(--pos)",
  };
  return (
    <div className="card p-5">
      <div className="mono-label mb-4">Account Movement Grid</div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left px-3 py-2 text-[10.5px] font-semibold text-muted uppercase tracking-wider w-32">Account</th>
              {months.map((m) => (
                <th key={m} className="text-center px-2 py-2 text-[10.5px] font-semibold text-muted uppercase tracking-wider">{m}</th>
              ))}
              <th className="text-right px-3 py-2 text-[10.5px] font-semibold text-muted uppercase tracking-wider">ARR</th>
            </tr>
          </thead>
          <tbody>
            {accountMovements.map((a) => (
              <tr key={a.slug} className="border-t border-line/50">
                <td className="px-3 py-2.5">
                  <Link href={`/accounts/${a.slug}`} className="text-[12.5px] font-semibold text-ink hover:underline">
                    {a.account}
                  </Link>
                </td>
                {a.months.map((m, i) => (
                  <td key={i} className="px-2 py-2.5 text-center">
                    <span
                      className="inline-block w-7 h-7 rounded-lg"
                      style={{ background: COLORS[m], opacity: m === "flat" ? 0.3 : 0.85 }}
                      title={m}
                    />
                  </td>
                ))}
                <td className="px-3 py-2.5 text-right text-[12.5px] font-mono tnum font-semibold text-ink">
                  {fmtMoney(a.arr)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-line text-[10.5px] text-muted">
        {Object.entries(COLORS).map(([k, v]) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: v, opacity: k === "flat" ? 0.3 : 0.85 }} />
            {k.charAt(0).toUpperCase() + k.slice(1)}
          </span>
        ))}
      </div>
    </div>
  );
}

function OverviewView({ team, setTeam, cur }: { team: Team; setTeam: (t: Team) => void; cur: typeof TEAM_DATA[Team] }) {
  return (
    <div>
      <div className="card p-3 mb-4 flex items-center gap-2 flex-wrap text-[12.5px]">
        <span className="mono-label">Filters</span>
        <Tag>Account Stage Entered · 10/01/2024 — 12/31/2024</Tag>
        <Tag>Vertical · Software, Technology</Tag>
        <Tag>Stage · Target → Expand</Tag>
      </div>

      <div className="card p-5 mb-4">
        <div className="mono-label mb-2">Revenue Funnel Overview</div>
        <FunnelChart />
        <div className="flex items-center gap-4 text-[11px] text-muted mt-3 justify-end">
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "var(--pos)" }} />Achieved</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full border-2" style={{ borderColor: "var(--neg)" }} />Expected</span>
        </div>
      </div>

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
    </div>
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
