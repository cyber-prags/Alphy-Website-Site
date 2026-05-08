"use client";

// ─────────────────────────────────────────────────────────────────────────────
// /scorecard — persona-aware bento grid that drills the metric the
// QuotaWidget surfaces in the top bar.
//   AM   → Expansion (target attainment, pipeline by stage, likelihood, gaps)
//   AE   → Quota (pipeline coverage, won/committed/pipe, win-rate cohort)
//   CSM  → Retention (NRR, at-risk ARR, save plays, churn risk)
//   Mgr  → Team Commit (per-rep, coverage, forecast variance)
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ChevronDown, Filter, Search, Target, TrendingUp, TrendingDown,
  AlertTriangle, ShieldCheck, Sparkles, Users, DollarSign, Calendar, ArrowUpRight,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { usePersona } from "@/components/PersonaContext";
import { accounts, deals, myNumber, fmtMoney, slugify, type Persona, type Account, type DealRow } from "@/lib/mock";
import { useGoals, targetFor } from "@/components/GoalsContext";
import { Logo } from "@/components/Logo";

const cardClass = "rounded-2xl border border-line bg-surface";
const subCardClass = "rounded-xl border border-line bg-bg-deep";

export default function ScorecardPage() {
  const { persona } = usePersona();
  return (
    <AppShell>
      <div className="max-w-[1640px] mx-auto pb-12">
        <Header persona={persona} />
        {persona === "am"      && <AMBoard />}
        {persona === "ae"      && <AEBoard />}
        {persona === "csm"     && <CSMBoard />}
        {persona === "manager" && <ManagerBoard />}
      </div>
    </AppShell>
  );
}

// ── Header ─────────────────────────────────────────────────────────────────
function Header({ persona }: { persona: Persona }) {
  const title =
    persona === "am" ? "Expansion" :
    persona === "ae" ? "Quota" :
    persona === "csm" ? "Retention" : "Team Commit";
  const sub =
    persona === "am" ? "Target attainment, pipeline by stage, likelihood, and gaps." :
    persona === "ae" ? "Pipeline coverage, win-rate, and quota path." :
    persona === "csm" ? "NRR, at-risk ARR, save plays, churn risk." :
    "Team commit, coverage, forecast variance.";
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <Link href="/home" className="inline-flex items-center gap-1 text-[12px] text-muted hover:text-ink transition-colors mb-2">
          <ArrowLeft size={12} strokeWidth={1.7} /> Back
        </Link>
        <h1 className="text-[28px] font-bold text-ink leading-tight"
          style={{ letterSpacing: "-0.02em" }}>{title}</h1>
        <div className="text-[12.5px] text-muted mt-0.5">{sub}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AM — Expansion bento
// ─────────────────────────────────────────────────────────────────────────────
function AMBoard() {
  const { goals } = useGoals();
  const target = targetFor(goals, "am");
  const e = myNumber.am.expansion;
  const closed = e.closed;
  const inMotion = e.inMotion;
  const total = closed + inMotion;
  const pct = Math.round((total / target) * 100);

  // Customers in scope for expansion plays = AM persona accounts
  const am = useMemo(() => accounts.filter((a) => a.status === "Customer"), []);
  // Filters
  const [stageFilter, setStageFilter] = useState<"all" | "discovery" | "proposal" | "negotiation" | "closing">("all");
  const [ownerFilter, setOwnerFilter] = useState<"all" | string>("all");
  const [search, setSearch] = useState("");

  // Derive an "expansion deal" view from accounts: each customer has an
  // expansion likelihood + projected ARR + stage based on health & arr.
  const opportunities = useMemo(() => am.map((a, i) => {
    const stages: ("discovery" | "proposal" | "negotiation" | "closing")[] = ["discovery", "proposal", "negotiation", "closing"];
    const stage = stages[(i + (a.healthScore % 4)) % 4];
    const projected = Math.round(a.arr * (0.20 + (a.healthScore - 50) / 200));
    const likelihood = Math.max(15, Math.min(95, a.healthScore - 5 + (stage === "closing" ? 10 : stage === "negotiation" ? 5 : 0)));
    return { account: a, stage, projected, likelihood };
  }), [am]);

  const owners = useMemo(() => Array.from(new Set(am.map((a) => a.owner))), [am]);
  const filtered = opportunities.filter((o) => {
    if (stageFilter !== "all" && o.stage !== stageFilter) return false;
    if (ownerFilter !== "all" && o.account.owner !== ownerFilter) return false;
    if (search && !o.account.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stageGroups = (["discovery", "proposal", "negotiation", "closing"] as const).map((stage) => ({
    stage,
    items: filtered.filter((o) => o.stage === stage).sort((a, b) => b.likelihood - a.likelihood),
  }));

  const projectedTotal = filtered.reduce((s, o) => s + (o.projected * o.likelihood / 100), 0);
  const leftOut = am.filter((a) => !filtered.some((o) => o.account.name === a.name));
  const remaining = Math.max(0, target - total);

  return (
    <div className="space-y-4">
      {/* Bento KPIs */}
      <div className="grid grid-cols-12 gap-4">
        <BentoCard span="col-span-12 md:col-span-3" label="Q4 target" value={fmtMoney(target)} sub="Expansion ARR" Icon={Target} />
        <BentoCard span="col-span-12 md:col-span-3" label="Achieved"  value={fmtMoney(total)}  sub={`${pct}% of target`} tone="ink" Icon={ShieldCheck} />
        <BentoCard span="col-span-12 md:col-span-3" label="Closed"    value={fmtMoney(closed)} sub={`${Math.round((closed/target)*100)}% locked`} tone="pos" Icon={DollarSign} />
        <BentoCard span="col-span-12 md:col-span-3" label="In motion" value={fmtMoney(inMotion)} sub={`${filtered.length} active plays`} tone="info" Icon={TrendingUp} />
      </div>

      {/* Progress + projection */}
      <div className="grid grid-cols-12 gap-4">
        <div className={`${cardClass} col-span-12 lg:col-span-8 p-5`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-0.5">Attainment path · weekly</div>
              <div className="text-[15px] font-semibold text-ink">{fmtMoney(total)} of {fmtMoney(target)}</div>
            </div>
            <div className="text-right">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-0.5">Probability-weighted pipe</div>
              <div className="text-[15px] font-semibold tnum" style={{ color: "var(--accent)" }}>{fmtMoney(projectedTotal)}</div>
            </div>
          </div>

          {/* Sparkline showing weekly attainment vs pace */}
          <AttainmentSparkline target={target} />

          {/* Stacked progress */}
          <div className="h-3 rounded-full overflow-hidden flex mt-4" style={{ background: "var(--line)" }}>
            <div style={{ width: `${(closed/target)*100}%`, background: "var(--pos)" }} title={`Closed ${fmtMoney(closed)}`} />
            <div style={{ width: `${(inMotion/target)*100}%`, background: "var(--accent)" }} title={`In motion ${fmtMoney(inMotion)}`} />
            <div style={{ width: `${Math.min(60, (projectedTotal/target)*100)}%`, background: "var(--accent)", opacity: 0.25 }} title={`Weighted projection ${fmtMoney(projectedTotal)}`} />
          </div>
          <div className="flex items-center gap-4 mt-3 text-[11px] text-muted">
            <LegendDot color="var(--pos)" label={`Closed ${fmtMoney(closed)}`} />
            <LegendDot color="var(--accent)" label={`In motion ${fmtMoney(inMotion)}`} />
            <LegendDot color="var(--accent)" label={`Weighted ${fmtMoney(projectedTotal)}`} opacity={0.25} />
            <span className="ml-auto text-ink-2 font-semibold">
              {remaining > 0 ? <>{fmtMoney(remaining)} to target</> : "Target hit"}
            </span>
          </div>
        </div>
        <div className={`${cardClass} col-span-12 lg:col-span-4 p-5`}>
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-3">Likelihood mix</div>
          <LikelihoodMix items={filtered} />
        </div>
      </div>

      {/* Stage funnel — visual flow from Discovery → Closing */}
      <StageFunnel groups={stageGroups} target={target} />

      {/* Filters */}
      <Filters
        searchValue={search} onSearch={setSearch}
        chips={[
          { label: "Stage", value: stageFilter, options: [
            { v: "all", l: "All stages" }, { v: "discovery", l: "Discovery" }, { v: "proposal", l: "Proposal" }, { v: "negotiation", l: "Negotiation" }, { v: "closing", l: "Closing" },
          ], onChange: (v) => setStageFilter(v as typeof stageFilter) },
          { label: "Owner", value: ownerFilter, options: [
            { v: "all", l: "All owners" }, ...owners.map((o) => ({ v: o, l: o })),
          ], onChange: (v) => setOwnerFilter(v) },
        ]} />

      {/* Stage columns */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {stageGroups.map(({ stage, items }) => (
          <div key={stage} className={`${cardClass} p-3 min-h-[200px]`}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">{stage}</div>
              <span className="text-[10px] font-mono tnum text-muted">{items.length}</span>
            </div>
            <div className="space-y-2">
              {items.length === 0 && <div className="text-[11.5px] text-muted py-3 text-center">No deals.</div>}
              {items.map((o) => <OpportunityCard key={o.account.id} o={o} />)}
            </div>
          </div>
        ))}
      </div>

      {/* Left-out */}
      {leftOut.length > 0 && (
        <div className={`${cardClass} p-5`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-2">Left out · no expansion play</div>
              <div className="text-[14px] font-semibold text-ink">{leftOut.length} customer{leftOut.length === 1 ? "" : "s"}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {leftOut.map((a) => (
              <Link key={a.id} href={`/accounts/${slugify(a.name)}`}
                className={`${subCardClass} px-3.5 py-2.5 flex items-center gap-3 hover:bg-surface transition-colors`}>
                <Logo name={a.name} size={20} />
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-semibold text-ink truncate">{a.name}</div>
                  <div className="text-[10.5px] text-muted">{fmtMoney(a.arr)} · {a.owner}</div>
                </div>
                <ArrowUpRight size={11} className="text-muted-2" strokeWidth={1.8} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OpportunityCard({ o }: { o: { account: Account; stage: string; projected: number; likelihood: number } }) {
  const tone = o.likelihood >= 70 ? "var(--pos)" : o.likelihood >= 45 ? "var(--accent)" : "var(--warn)";
  // Per-stage, per-likelihood next-best-action.
  const nba =
    o.stage === "discovery" && o.likelihood < 60 ? "Multi-thread CFO" :
    o.stage === "discovery"                       ? "Schedule discovery" :
    o.stage === "proposal"   && o.likelihood < 60 ? "Send ROI calculator" :
    o.stage === "proposal"                        ? "Re-run proposal call" :
    o.stage === "negotiation" && o.likelihood < 70 ? "Flag procurement" :
    o.stage === "negotiation"                     ? "Counter-sign terms" :
    o.likelihood < 80                             ? "InfoSec sign-off" : "Finalise PO";
  return (
    <Link href={`/accounts/${slugify(o.account.name)}`}
      className={`${subCardClass} p-3 block hover:bg-surface transition-colors group/card relative`}
      title={`${o.account.name} · ${o.stage} · ${o.likelihood}% likely · projected ${fmtMoney(o.projected)} ARR · next: ${nba}`}>
      <div className="flex items-center gap-2 mb-1">
        <Logo name={o.account.name} size={16} />
        <span className="text-[12px] font-semibold text-ink truncate flex-1">{o.account.name.replace(/(, Inc\.?| Inc\.?)$/, "")}</span>
        <span className="text-[10.5px] font-mono tnum" style={{ color: tone }}>{o.likelihood}%</span>
      </div>
      <div className="text-[10.5px] text-muted mb-1.5">Projected · <b className="text-ink">{fmtMoney(o.projected)}</b> · {o.account.owner}</div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--line)" }}>
        <div className="h-full rounded-full transition-all group-hover/card:opacity-90"
          style={{ width: `${o.likelihood}%`, background: tone }} />
      </div>
      {/* Next-best-action chip — appears on hover */}
      <div className="mt-2 text-[10px] flex items-center gap-1.5 text-muted-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
        <Sparkles size={9} strokeWidth={2} style={{ color: "var(--accent)" }} />
        <span>Next: <b style={{ color: "var(--ink)" }}>{nba}</b></span>
      </div>
    </Link>
  );
}

// ── Attainment sparkline — weekly closed + cumulative pace line ────────────
function AttainmentSparkline({ target }: { target: number }) {
  // Mock weekly cumulative attainment (10 weeks of the quarter)
  const weeks = [60_000, 110_000, 160_000, 220_000, 250_000, 290_000, 340_000, 410_000, 450_000, 480_000];
  const W = 760, H = 80, padX = 4, padY = 4;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;
  const stepX = innerW / (weeks.length - 1);
  const xy = weeks.map((v, i) => ({ x: padX + i * stepX, y: padY + innerH * (1 - v / target) }));
  const path = xy.map((p, i) => i === 0 ? `M${p.x} ${p.y}` : `L${p.x} ${p.y}`).join(" ");
  const area = `${path} L${xy[xy.length - 1].x} ${padY + innerH} L${xy[0].x} ${padY + innerH} Z`;
  // Linear pace line
  const paceX1 = padX, paceY1 = padY + innerH;
  const paceX2 = padX + innerW, paceY2 = padY;
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[80px]" preserveAspectRatio="none"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
          const xRatio = (e.clientX - rect.left) / rect.width;
          const xInChart = padX + xRatio * innerW;
          let nearest = 0, best = Infinity;
          xy.forEach((p, i) => { const d = Math.abs(p.x - xInChart); if (d < best) { best = d; nearest = i; } });
          setHover(nearest);
        }}>
        <defs>
          <linearGradient id="attainArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(38,109,240,0.30)" />
            <stop offset="100%" stopColor="rgba(38,109,240,0)" />
          </linearGradient>
        </defs>
        {/* pace line */}
        <line x1={paceX1} y1={paceY1} x2={paceX2} y2={paceY2}
          stroke="var(--muted-2)" strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />
        <path d={area} fill="url(#attainArea)" />
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinecap="round" />
        {xy.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={hover === i ? 3 : 2} fill="var(--accent)" stroke="var(--surface)" strokeWidth={1} />
        ))}
        {hover !== null && (
          <line x1={xy[hover].x} x2={xy[hover].x} y1={padY} y2={padY + innerH}
            stroke="var(--ink)" strokeWidth={1} strokeDasharray="2 2" opacity={0.4} />
        )}
      </svg>
      <div className="flex items-center justify-between text-[9.5px] text-muted-2 mt-1">
        <span>Wk 1</span>
        <span className="text-muted">— pace line —</span>
        <span>Wk 13</span>
      </div>
      {hover !== null && (
        <div className="absolute pointer-events-none bg-surface border border-line rounded-md px-2 py-1 text-[10.5px] shadow-lg"
          style={{
            left: `${(xy[hover].x / W) * 100}%`,
            top: 0,
            transform: "translate(-50%, -110%)",
          }}>
          <div className="font-mono tnum text-ink">{fmtMoney(weeks[hover])}</div>
          <div className="text-muted-2">Wk {hover + 1}</div>
        </div>
      )}
    </div>
  );
}

// ── Stage funnel — horizontal bar with proportional widths ─────────────────
function StageFunnel({ groups, target }: { groups: { stage: string; items: { likelihood: number; projected: number }[] }[]; target: number }) {
  const totalProj = groups.reduce((s, g) => s + g.items.reduce((ss, i) => ss + i.projected, 0), 0) || 1;
  const stageColors: Record<string, string> = {
    discovery:    "#94A3B8",
    proposal:     "#3B82F6",
    negotiation:  "#F59E0B",
    closing:      "#16A34A",
  };
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-0.5">Stage funnel</div>
          <div className="text-[14px] font-semibold text-ink">{fmtMoney(totalProj)} unweighted across {groups.reduce((s, g) => s + g.items.length, 0)} deals</div>
        </div>
        <div className="text-right">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-2">Vs target</div>
          <div className="text-[14px] font-semibold tnum text-ink">{Math.round((totalProj/target)*100)}%</div>
        </div>
      </div>
      <div className="flex h-9 rounded-lg overflow-hidden border border-line">
        {groups.map(({ stage, items }) => {
          const sum = items.reduce((s, i) => s + i.projected, 0);
          const pct = (sum / totalProj) * 100;
          if (pct < 0.1) return null;
          return (
            <div key={stage}
              className="flex flex-col items-center justify-center text-[10.5px] font-semibold text-white transition-all hover:brightness-110"
              style={{ width: `${pct}%`, background: stageColors[stage] }}
              title={`${stage} · ${items.length} deals · ${fmtMoney(sum)} unweighted`}>
              {pct >= 8 && <span>{Math.round(pct)}%</span>}
              {pct >= 16 && <span className="text-[9px] opacity-90 capitalize">{stage}</span>}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-4 gap-2 mt-3">
        {groups.map(({ stage, items }) => (
          <div key={stage} className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: stageColors[stage] }} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">{stage}</span>
            </div>
            <div className="text-[12px] font-semibold text-ink tnum">
              {items.length} <span className="font-normal text-muted text-[11px]">· {fmtMoney(items.reduce((s, i) => s + i.projected, 0))}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LikelihoodMix({ items }: { items: { likelihood: number; projected: number }[] }) {
  const buckets = [
    { label: "High (70+)",   tone: "var(--pos)",   match: (l: number) => l >= 70 },
    { label: "Medium (45–69)",tone: "var(--accent)",match: (l: number) => l >= 45 && l < 70 },
    { label: "Low (<45)",    tone: "var(--warn)",  match: (l: number) => l < 45 },
  ];
  const totalProjected = items.reduce((s, i) => s + i.projected, 0) || 1;
  return (
    <div className="space-y-3">
      {buckets.map((b) => {
        const inB = items.filter((i) => b.match(i.likelihood));
        const sum = inB.reduce((s, i) => s + i.projected, 0);
        const pct = (sum / totalProjected) * 100;
        return (
          <div key={b.label}>
            <div className="flex items-center justify-between text-[11.5px] mb-1">
              <span className="text-ink-2">{b.label}</span>
              <span className="text-muted tnum">{inB.length} · {fmtMoney(sum)}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--line)" }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: b.tone }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AE — Quota bento
// ─────────────────────────────────────────────────────────────────────────────
function AEBoard() {
  const a = myNumber.ae;
  const { goals } = useGoals();
  const target = targetFor(goals, "ae");
  const myDeals = useMemo(() => deals, []);

  const [stageF, setStageF] = useState<string>("all");
  const [search, setSearch] = useState("");
  const filtered = myDeals
    .filter((d) => stageF === "all" || d.stage.toLowerCase() === stageF.toLowerCase())
    .filter((d) => !search || d.name.toLowerCase().includes(search.toLowerCase()));

  const closed = a.closed;
  const commit = a.commit;
  const pipeline = filtered.reduce((s, d) => s + d.amount, 0);
  const coverage = +(pipeline / Math.max(1, target - closed)).toFixed(1);
  const winRate = 32; // mock

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        <BentoCard span="col-span-12 md:col-span-3" label="Quota target"      value={fmtMoney(target)}   sub={a.quarter} Icon={Target} />
        <BentoCard span="col-span-12 md:col-span-3" label="Closed-won"        value={fmtMoney(closed)}   sub={`${Math.round((closed/target)*100)}% of quota`} tone="pos" Icon={DollarSign} />
        <BentoCard span="col-span-12 md:col-span-3" label="Commit"            value={fmtMoney(commit)}   sub={`${a.deltaPct >= 0 ? "+" : ""}${a.deltaPct}% pace`} tone="ink" Icon={TrendingUp} />
        <BentoCard span="col-span-12 md:col-span-3" label="Pipeline coverage" value={`${coverage}×`}     sub={`${fmtMoney(pipeline)} pipe`} tone="info" Icon={ShieldCheck} />
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className={`${cardClass} col-span-12 lg:col-span-8 p-5`}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-2">Quota progress</div>
            <div className="text-[11.5px] text-muted">{fmtMoney(closed)} closed · {fmtMoney(commit)} commit · {fmtMoney(target)} target</div>
          </div>
          <div className="h-3 rounded-full overflow-hidden flex" style={{ background: "var(--line)" }}>
            <div style={{ width: `${(closed/target)*100}%`, background: "var(--pos)" }} />
            <div style={{ width: `${((commit-closed)/target)*100}%`, background: "var(--accent)" }} />
          </div>
          <div className="flex items-center gap-4 mt-3 text-[11px] text-muted">
            <LegendDot color="var(--pos)" label="Closed" />
            <LegendDot color="var(--accent)" label="Commit" />
            <span className="ml-auto text-ink-2">{fmtMoney(Math.max(0, target - commit))} gap to target</span>
          </div>
        </div>
        <div className={`${cardClass} col-span-12 lg:col-span-4 p-5`}>
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-2">Win rate cohort</div>
          <div className="text-[28px] font-bold tnum text-ink" style={{ letterSpacing: "-0.018em" }}>{winRate}%</div>
          <div className="text-[11px] text-muted">vs team avg 28% · top decile 38%</div>
        </div>
      </div>
      <Filters
        searchValue={search} onSearch={setSearch}
        chips={[{
          label: "Stage", value: stageF, onChange: (v) => setStageF(v),
          options: [
            { v: "all", l: "All stages" },
            { v: "Qualification", l: "Qualification" },
            { v: "Discovery", l: "Discovery" },
            { v: "Demo", l: "Demo" },
            { v: "Proposal", l: "Proposal" },
            { v: "Negotiation", l: "Negotiation" },
          ],
        }]} />
      <DealsList rows={filtered} />
    </div>
  );
}

function DealsList({ rows }: { rows: DealRow[] }) {
  return (
    <div className={`${cardClass} divide-y divide-line`}>
      <div className="px-5 py-2.5 grid grid-cols-12 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
        <div className="col-span-5">Deal</div>
        <div className="col-span-2">Stage</div>
        <div className="col-span-2">Probability</div>
        <div className="col-span-2 text-right">Amount</div>
        <div className="col-span-1 text-right">Close</div>
      </div>
      {rows.length === 0 && <div className="px-5 py-6 text-center text-[12px] text-muted">No deals match.</div>}
      {rows.slice(0, 12).map((d) => (
        <div key={d.id} className="px-5 py-3 grid grid-cols-12 items-center text-[12.5px]">
          <div className="col-span-5 flex items-center gap-2 min-w-0">
            <Logo name={d.account} size={14} />
            <span className="font-semibold text-ink truncate">{d.name}</span>
          </div>
          <div className="col-span-2 text-muted">{d.stage}</div>
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "var(--line)" }}>
                <div className="h-full rounded-full" style={{ width: `${d.forecastProb}%`, background: "var(--accent)" }} />
              </div>
              <span className="text-[11px] tnum font-mono text-muted">{d.forecastProb}%</span>
            </div>
          </div>
          <div className="col-span-2 text-right font-mono tnum text-ink">{fmtMoney(d.amount)}</div>
          <div className="col-span-1 text-right text-muted text-[11px]">{d.closeDate.slice(5)}</div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CSM — Retention bento
// ─────────────────────────────────────────────────────────────────────────────
function CSMBoard() {
  const r = myNumber.csm.retention;
  const customers = useMemo(() => accounts.filter((a) => a.status === "Customer"), []);
  const [healthF, setHealthF] = useState<"all" | "high" | "medium" | "low">("all");
  const [search, setSearch] = useState("");

  const filtered = customers
    .filter((c) => healthF === "all" || c.health === healthF)
    .filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  const atRisk = filtered.filter((c) => c.healthScore < 60);
  const watch  = filtered.filter((c) => c.healthScore >= 60 && c.healthScore < 75);
  const safe   = filtered.filter((c) => c.healthScore >= 75);
  const totalArrAtRisk = atRisk.reduce((s, c) => s + c.arr, 0);
  const totalArr = filtered.reduce((s, c) => s + c.arr, 0);
  const nrrEstimate = Math.round(((totalArr - totalArrAtRisk * 0.4) / totalArr) * 110);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        <BentoCard span="col-span-12 md:col-span-3" label="NRR (proj.)"   value={`${nrrEstimate}%`} sub={myNumber.csm.quarter} tone={nrrEstimate >= 110 ? "pos" : "warn"} Icon={ShieldCheck} />
        <BentoCard span="col-span-12 md:col-span-3" label="At-risk ARR"   value={fmtMoney(totalArrAtRisk)} sub={`${atRisk.length} accounts`} tone="warn" Icon={AlertTriangle} />
        <BentoCard span="col-span-12 md:col-span-3" label="Secured"        value={fmtMoney(r.secured)} sub={`${customers.length} active customers`} tone="pos" Icon={DollarSign} />
        <BentoCard span="col-span-12 md:col-span-3" label="Save plays"     value="6" sub="active this quarter" tone="info" Icon={Sparkles} />
      </div>
      <Filters
        searchValue={search} onSearch={setSearch}
        chips={[{
          label: "Health", value: healthF, onChange: (v) => setHealthF(v as typeof healthF),
          options: [
            { v: "all", l: "All" }, { v: "high", l: "Healthy" }, { v: "medium", l: "Watch" }, { v: "low", l: "At risk" },
          ],
        }]} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HealthColumn label="At risk" tone="var(--warn)" rows={atRisk} />
        <HealthColumn label="Watch"   tone="var(--accent)" rows={watch} />
        <HealthColumn label="Healthy" tone="var(--pos)" rows={safe} />
      </div>
    </div>
  );
}

function HealthColumn({ label, tone, rows }: { label: string; tone: string; rows: Account[] }) {
  return (
    <div className={`${cardClass} p-3`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: tone }} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">{label}</span>
        </div>
        <span className="text-[10px] font-mono tnum text-muted">{rows.length}</span>
      </div>
      <div className="space-y-2">
        {rows.length === 0 && <div className="text-[11.5px] text-muted py-3 text-center">None.</div>}
        {rows.map((c) => (
          <Link key={c.id} href={`/accounts/${slugify(c.name)}`}
            className={`${subCardClass} px-3 py-2 flex items-center gap-2 hover:bg-surface transition-colors`}>
            <Logo name={c.name} size={16} />
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-semibold text-ink truncate">{c.name.replace(/(, Inc\.?| Inc\.?)$/, "")}</div>
              <div className="text-[10.5px] text-muted">{fmtMoney(c.arr)} · renews in {c.healthScore}d</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Manager — Team commit bento
// ─────────────────────────────────────────────────────────────────────────────
function ManagerBoard() {
  const m = myNumber.manager;
  const reps = [
    { name: "Brad Allen",  closed: 580_000, commit: 720_000, target: 850_000 },
    { name: "Paul Acker",  closed: 320_000, commit: 480_000, target: 700_000 },
    { name: "Mike Torres", closed: 410_000, commit: 540_000, target: 700_000 },
    { name: "Lisa Park",   closed: 290_000, commit: 410_000, target: 600_000 },
    { name: "Derek Evans", closed: 110_000, commit: 230_000, target: 600_000 },
  ];
  const teamTarget  = reps.reduce((s, r) => s + r.target, 0);
  const teamClosed  = reps.reduce((s, r) => s + r.closed, 0);
  const teamCommit  = reps.reduce((s, r) => s + r.commit, 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        <BentoCard span="col-span-12 md:col-span-3" label="Team target"   value={fmtMoney(teamTarget)} sub={m.quarter} Icon={Target} />
        <BentoCard span="col-span-12 md:col-span-3" label="Closed-won"     value={fmtMoney(teamClosed)} sub={`${Math.round((teamClosed/teamTarget)*100)}% locked`} tone="pos" Icon={DollarSign} />
        <BentoCard span="col-span-12 md:col-span-3" label="Team commit"    value={fmtMoney(teamCommit)} sub={`${m.coverage}× coverage`} tone="ink" Icon={TrendingUp} />
        <BentoCard span="col-span-12 md:col-span-3" label="Forecast risk"  value={`${reps.filter((r) => r.commit/r.target < 0.7).length}`} sub="reps below 70% commit" tone="warn" Icon={AlertTriangle} />
      </div>
      <div className={`${cardClass} divide-y divide-line`}>
        <div className="px-5 py-2.5 grid grid-cols-12 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
          <div className="col-span-3">Rep</div>
          <div className="col-span-4">Attainment</div>
          <div className="col-span-2 text-right">Closed</div>
          <div className="col-span-2 text-right">Commit</div>
          <div className="col-span-1 text-right">Target</div>
        </div>
        {reps.map((r) => {
          const pctClosed = (r.closed / r.target) * 100;
          const pctCommit = (r.commit / r.target) * 100;
          return (
            <div key={r.name} className="px-5 py-3 grid grid-cols-12 items-center text-[12.5px]">
              <div className="col-span-3 font-semibold text-ink">{r.name}</div>
              <div className="col-span-4">
                <div className="h-2 rounded-full overflow-hidden flex" style={{ background: "var(--line)" }}>
                  <div style={{ width: `${pctClosed}%`, background: "var(--pos)" }} />
                  <div style={{ width: `${pctCommit - pctClosed}%`, background: "var(--accent)" }} />
                </div>
                <div className="text-[10.5px] text-muted mt-1">{Math.round(pctClosed)}% closed · {Math.round(pctCommit)}% commit</div>
              </div>
              <div className="col-span-2 text-right tnum text-ink">{fmtMoney(r.closed)}</div>
              <div className="col-span-2 text-right tnum text-ink">{fmtMoney(r.commit)}</div>
              <div className="col-span-1 text-right tnum text-muted">{fmtMoney(r.target)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reusable bits
// ─────────────────────────────────────────────────────────────────────────────
function BentoCard({ span, label, value, sub, tone, Icon }: {
  span: string; label: string; value: string; sub: string; tone?: "pos" | "warn" | "info" | "ink"; Icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
}) {
  const color = tone === "pos" ? "var(--pos)" : tone === "warn" ? "var(--warn)" : tone === "info" ? "var(--accent)" : "var(--ink)";
  return (
    <div className={`${cardClass} ${span} p-5`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={11} strokeWidth={1.8} style={{ color: "var(--muted)" }} />
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">{label}</span>
      </div>
      <div className="text-[26px] font-bold tnum" style={{ color, letterSpacing: "-0.018em" }}>{value}</div>
      <div className="text-[11px] text-muted-2 mt-0.5">{sub}</div>
    </div>
  );
}

function LegendDot({ color, label, opacity }: { color: string; label: string; opacity?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block w-2 h-2 rounded-full" style={{ background: color, opacity }} />
      {label}
    </span>
  );
}

function Filters({ searchValue, onSearch, chips }: {
  searchValue: string; onSearch: (v: string) => void;
  chips: { label: string; value: string; options: { v: string; l: string }[]; onChange: (v: string) => void }[];
}) {
  return (
    <div className={`${cardClass} p-3 flex items-center gap-2 flex-wrap`}>
      <Filter size={11} strokeWidth={1.8} className="text-muted-2 ml-1" />
      {chips.map((c) => <FilterPill key={c.label} {...c} />)}
      <span className="flex-1" />
      <div className="relative">
        <Search size={11} strokeWidth={1.8} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-2" />
        <input value={searchValue} onChange={(e) => onSearch(e.target.value)}
          placeholder="Search…"
          className="text-[12px] bg-bg-deep border border-line rounded-lg pl-7 pr-3 py-1.5 w-56 focus:outline-none focus:border-ink/30" />
      </div>
    </div>
  );
}

function FilterPill({ label, value, options, onChange }: { label: string; value: string; options: { v: string; l: string }[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const display = options.find((o) => o.v === value)?.l ?? "Any";
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2.5 py-1.5 rounded-lg border border-line bg-bg-deep hover:bg-surface transition-colors">
        <span className="text-muted">{label}:</span>
        <span className="text-ink">{display}</span>
        <ChevronDown size={10} strokeWidth={1.8} className="text-muted-2" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-30 min-w-[160px] rounded-lg border border-line bg-surface shadow-xl overflow-hidden">
          {options.map((o) => (
            <button key={o.v} onClick={() => { onChange(o.v); setOpen(false); }}
              className="block w-full text-left text-[11.5px] px-3 py-1.5 hover:bg-bg-deep transition-colors"
              style={{ color: value === o.v ? "var(--ink)" : "var(--muted)" }}>
              {o.l}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// silence unused imports lint if a tone removed
void Calendar; void Users; void TrendingDown;
