"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight, Sparkles, AlertTriangle, Bell, Target, Plus, CheckCircle2,
  Circle, Clock, ArrowRight, ChevronDown, ChevronUp, Zap, TrendingUp,
  TrendingDown, Crown, Calendar, Flame, ArrowUpRight, Users, FileText,
  AlertCircle, MoveRight, ExternalLink, Eye,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TodayQueue } from "@/components/TodayQueue";
import { MyNumber } from "@/components/MyNumber";
import { Logo } from "@/components/Logo";
import { DataFreshness } from "@/components/SourceChip";
import { usePersona, PERSONA_LABEL } from "@/components/PersonaContext";
import {
  pinnedAccounts, accountDetails, fmtMoney, outcomes, accounts, myNumber,
  slugify, championChanges, csmWorkloads, accountPlans,
  expansionOpportunities, EXPANSION_STAGES,
  type PlanTask, type ExpansionOpportunity, type ExpansionStage, type ChampionChange,
} from "@/lib/mock";

// ════════════════════════════════════════════════════════════════════════
// HOME PAGE — persona switch
// ════════════════════════════════════════════════════════════════════════
export default function HomePage() {
  const { persona } = usePersona();

  // The AM persona gets the entirely new expansion-first home.
  // Other personas keep the previous layout for now.
  if (persona === "am") return <AMHome />;

  return <DefaultHome />;
}

// ════════════════════════════════════════════════════════════════════════
// AM HOME — "Pipeline for accounts you already own"
// ════════════════════════════════════════════════════════════════════════
function AMHome() {
  const greeting = greetingFor();

  // Derived buckets from real mock data
  const hot = useMemo(
    () => [...expansionOpportunities].sort((a, b) => b.score - a.score).slice(0, 3),
    []
  );
  const allRanked = useMemo(
    () => [...expansionOpportunities].sort((a, b) => b.score - a.score),
    []
  );
  const stuckDeals = useMemo(
    () => expansionOpportunities.filter((o) => o.daysInStage >= 12).sort((a, b) => b.daysInStage - a.daysInStage),
    []
  );

  const movers = championChanges.filter((c) => c.impact === "high" || c.impact === "medium");

  // Pipeline summary
  const pipelineValue  = expansionOpportunities.reduce((s, o) => s + o.estimatedArr, 0);
  const inMotion       = expansionOpportunities.filter((o) => o.stage !== "identified" && o.stage !== "closed").reduce((s, o) => s + o.estimatedArr, 0);
  const signalsThisWk  = 23;  // illustrative — real value would come from signal feed
  const movedStage     = 4;

  return (
    <AppShell>
      {/* ─── Top bar ─────────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-4 flex-wrap mb-7 pb-5 border-b border-line">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-[24px] font-semibold text-ink" style={{ letterSpacing: "-0.022em" }}>
              {greeting}, Walid
            </h1>
            <span className="persona-chip"><span className="dot" />Account Manager</span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-muted">
            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
            <span className="text-muted-2">·</span>
            <DataFreshness minutesAgo={3} sources={["Salesforce", "LinkedIn", "Gong", "Alphy AI"] as any} />
          </div>
        </div>

        <div className="flex items-stretch gap-0 rounded-xl overflow-hidden border border-line bg-surface">
          <SummaryStat label="Pipeline value"   value={fmtMoney(pipelineValue)} accent="var(--accent)" />
          <SummaryStat label="In motion"        value={fmtMoney(inMotion)}      accent="var(--ink)" />
          <SummaryStat label="Signals this wk"  value={signalsThisWk}           accent="var(--pos)" delta="+8" />
          <SummaryStat label="Moved stage"      value={movedStage}              accent="var(--ink)" />
        </div>
      </div>

      {/* ─── 1 · Hot list — RANKED DAILY ─────────────────────── */}
      <HotListSection hot={hot} all={allRanked} />

      {/* ─── 2 · Three-column intelligence row ───────────────── */}
      <div className="grid grid-cols-12 gap-5 mt-7">
        <div className="col-span-12 lg:col-span-4"><ChampionMoversPanel movers={movers} /></div>
        <div className="col-span-12 lg:col-span-4"><StuckDealsPanel deals={stuckDeals} /></div>
        <div className="col-span-12 lg:col-span-4"><RenewalWindowsPanel /></div>
      </div>

      {/* ─── 3 · White space heatmap ────────────────────────── */}
      <div className="mt-7"><WhiteSpaceFeed /></div>

      {/* ─── 4 · Today's queue (compact) ────────────────────── */}
      <div className="mt-7"><TodayQueue persona="am" /></div>
    </AppShell>
  );
}

// ────────────────────────────────────────────────────────────────────────
function SummaryStat({ label, value, accent, delta }: { label: string; value: string | number; accent: string; delta?: string }) {
  return (
    <div className="px-5 py-3 border-r border-line last:border-r-0">
      <div className="text-[10px] uppercase tracking-[0.12em] text-muted-2 mb-1 font-semibold">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[18px] font-bold tnum" style={{ color: accent, letterSpacing: "-0.02em" }}>{value}</span>
        {delta && <span className="text-[10.5px] font-semibold tnum" style={{ color: "var(--pos)" }}>{delta}</span>}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// HOT LIST — the hero. Ranked daily.
// ════════════════════════════════════════════════════════════════════════
function HotListSection({ hot, all }: { hot: ExpansionOpportunity[]; all: ExpansionOpportunity[] }) {
  const [view, setView] = useState<"hot" | "all">("hot");
  const data = view === "hot" ? hot : all;

  return (
    <section>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl grid place-items-center"
            style={{
              background: "linear-gradient(135deg, #FF8A3D 0%, #F5360F 100%)",
              boxShadow: "0 6px 18px -6px rgba(245,54,15,0.45)",
            }}
          >
            <Flame size={16} strokeWidth={2.2} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-semibold text-ink" style={{ letterSpacing: "-0.018em" }}>The hot list</h2>
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] px-2 py-0.5 rounded"
                style={{ background: "var(--bg-deep)", color: "var(--muted)" }}>Ranked daily</span>
            </div>
            <div className="text-[11.5px] text-muted mt-0.5">Accounts where 2+ signals fired this week — ready to expand</div>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: "var(--bg-deep)" }}>
          <button onClick={() => setView("hot")}
            className={`px-3 py-1.5 rounded text-[11.5px] font-medium ${view === "hot" ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
            🔥 Hot {hot.length}
          </button>
          <button onClick={() => setView("all")}
            className={`px-3 py-1.5 rounded text-[11.5px] font-medium ${view === "all" ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
            All ranked {all.length}
          </button>
          <Link href="/accounts" className="ml-1 px-3 py-1.5 rounded text-[11.5px] font-medium text-muted hover:text-ink inline-flex items-center gap-1">
            Book of business <ChevronRight size={11} />
          </Link>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {data.map((opp, i) => <HotCard key={opp.id} opp={opp} rank={i + 1} featured={view === "hot" && i === 0} />)}
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────
// HotCard — a single ranked expansion opportunity, with reason chips.
// Top-1 in "hot" view gets featured treatment.
// ────────────────────────────────────────────────────────────────────────
function HotCard({ opp, rank, featured }: { opp: ExpansionOpportunity; rank: number; featured: boolean }) {
  const [expanded, setExpanded] = useState(featured);
  const tier = opp.score >= 85 ? "hot" : opp.score >= 75 ? "warm" : "cool";
  const tierColor = tier === "hot" ? "#F5360F" : tier === "warm" ? "#F5B900" : "var(--accent)";
  const tierGlow  = tier === "hot" ? "rgba(245,54,15,0.35)" : tier === "warm" ? "rgba(245,185,0,0.30)" : "rgba(38,109,240,0.25)";

  // Generate reason chips from data
  const chips = useMemo<{ icon: any; label: string; tone: string }[]>(() => {
    const c: { icon: any; label: string; tone: string }[] = [];
    if (opp.usageTrend > 5) c.push({ icon: Zap, label: `Usage +${opp.usageTrend}%`, tone: "var(--pos)" });
    if (opp.usageTrend < 0) c.push({ icon: TrendingDown, label: `Usage ${opp.usageTrend}%`, tone: "var(--neg)" });
    if (opp.daysInStage <= 7) c.push({ icon: ArrowUpRight, label: "Just moved stage", tone: "var(--accent)" });
    if (opp.daysInStage >= 14) c.push({ icon: AlertCircle, label: `${opp.daysInStage}d in stage`, tone: "var(--warn)" });
    if (opp.factors.find((f) => f.label === "Champion strength" && f.score >= 90))
      c.push({ icon: Crown, label: "Champion just promoted", tone: "var(--accent)" });
    if (opp.factors.find((f) => f.label === "Champion strength" && f.score < 60))
      c.push({ icon: AlertCircle, label: "Champion silent", tone: "var(--neg)" });
    if (opp.comparables.length >= 3)
      c.push({ icon: TrendingUp, label: `${opp.comparables.length} comparable wins`, tone: "var(--info)" });
    if (opp.factors.find((f) => f.label === "Budget signals" && f.score >= 80))
      c.push({ icon: Target, label: "Budget confirmed", tone: "var(--pos)" });
    return c.slice(0, 4);
  }, [opp]);

  const StageStepper = () => {
    const idx = EXPANSION_STAGES.indexOf(opp.stage);
    return (
      <div className="flex items-center gap-0.5">
        {EXPANSION_STAGES.map((s, i) => (
          <div key={s} className="flex items-center">
            {i > 0 && <div className="w-3 h-[2px]" style={{ background: i <= idx ? tierColor : "var(--line)" }} />}
            <div className={`w-2 h-2 rounded-full ${i === idx ? "ring-2" : ""}`}
              style={{ background: i <= idx ? tierColor : "var(--line)", ringColor: tierColor } as any} />
          </div>
        ))}
      </div>
    );
  };

  if (featured) {
    return (
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, var(--bg) 0%, color-mix(in srgb, ${tierColor} 4%, var(--bg)) 100%)`,
          border: `1px solid ${tierColor}40`,
          boxShadow: `0 0 36px -8px ${tierGlow}`,
        }}
      >
        {/* Decorative gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: `linear-gradient(90deg, ${tierColor}, transparent 80%)` }} />

        <div className="grid grid-cols-12 gap-0">
          {/* Left: Account + score + chips */}
          <div className="col-span-12 lg:col-span-7 p-6">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div className="absolute -inset-1.5 rounded-xl opacity-50 blur"
                  style={{ background: `radial-gradient(circle, ${tierColor}, transparent 70%)` }} />
                <Logo name={opp.accountName} size={56} rounded={14} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-muted-2">#{rank}</span>
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] px-2 py-0.5 rounded"
                    style={{ background: `${tierColor}18`, color: tierColor }}>
                    {tier === "hot" ? "🔥 Hot" : tier === "warm" ? "Warm" : "Building"}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[24px] font-bold text-ink leading-none" style={{ letterSpacing: "-0.025em" }}>
                    {opp.accountName}
                  </h3>
                  <span className="text-[12px] font-semibold px-2 py-1 rounded"
                    style={{ background: "var(--accent-soft)", color: "var(--accent-deep)" }}>
                    {opp.productName}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11.5px] text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <StageStepper />
                    <span className="text-ink-2 font-medium ml-1 capitalize">{opp.stage}</span>
                    <span className="text-muted-2">· {opp.daysInStage}d</span>
                  </span>
                </div>
              </div>

              {/* Big score display */}
              <ScoreVisual score={opp.score} color={tierColor} size={86} />
            </div>

            {/* Reason chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-5">
              {chips.map((c, i) => (
                <span key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--line)",
                    color: c.tone,
                  }}
                >
                  <c.icon size={11} strokeWidth={2.2} />
                  {c.label}
                </span>
              ))}
            </div>

            {/* Next move */}
            <div className="mt-5 p-4 rounded-xl"
              style={{ background: "var(--bg-deep)", border: "1px solid var(--line)" }}>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1.5">Your next move</div>
              <div className="flex items-start gap-2.5">
                <Zap size={14} strokeWidth={2.2} style={{ color: tierColor }} className="mt-0.5 shrink-0" />
                <div className="flex-1 text-[13.5px] font-medium text-ink leading-snug">{opp.play}</div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Link href={`/accounts/${opp.accountSlug}`}
                  className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1.5 rounded-lg text-white"
                  style={{ background: tierColor }}>
                  Open account <ArrowRight size={11} strokeWidth={2.2} />
                </Link>
                <button className="inline-flex items-center gap-1.5 text-[11.5px] font-medium px-3 py-1.5 rounded-lg"
                  style={{ background: "var(--surface)", color: "var(--ink-2)", border: "1px solid var(--line)" }}>
                  <Sparkles size={11} strokeWidth={2} /> Brief me
                </button>
              </div>
            </div>
          </div>

          {/* Right: ARR + champion + comparables */}
          <div className="col-span-12 lg:col-span-5 p-6 lg:border-l border-line"
            style={{ background: "var(--surface)" }}>
            <div className="grid grid-cols-2 gap-5 mb-5">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1">Estimated ARR</div>
                <div className="text-[26px] font-bold text-ink tnum" style={{ letterSpacing: "-0.02em" }}>
                  {fmtMoney(opp.estimatedArr)}
                </div>
                <div className="text-[10.5px] text-muted mt-0.5">vs current {fmtMoney(opp.currentArr)}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1">Target close</div>
                <div className="text-[20px] font-semibold text-ink tnum" style={{ letterSpacing: "-0.015em" }}>
                  {new Date(opp.closeDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
                <div className="text-[10.5px] text-muted mt-0.5">{daysUntil(opp.closeDate)}d away</div>
              </div>
            </div>

            <div className="border-t border-line pt-4 mb-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-2">Champion</div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full grid place-items-center text-[10px] font-bold text-white"
                  style={{ background: tierColor }}>
                  {opp.champion.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-semibold text-ink truncate">{opp.champion}</div>
                  <div className="text-[10.5px] text-muted truncate">{opp.championTitle}</div>
                </div>
              </div>
            </div>

            <div className="border-t border-line pt-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-2">Comparable wins</div>
              <div className="space-y-1.5">
                {opp.comparables.slice(0, 3).map((c) => (
                  <div key={c.account} className="flex items-center justify-between text-[11.5px]">
                    <span className="text-ink-2">{c.account}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold tnum" style={{ color: "var(--pos)" }}>{fmtMoney(c.arr)}</span>
                      <span className="text-muted-2 tnum text-[10.5px]">{c.daysToClose}d</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ──── Compact card (non-featured) ────
  return (
    <div
      onClick={() => setExpanded((e) => !e)}
      className="rounded-xl cursor-pointer transition-all hover:shadow-sm"
      style={{
        background: "var(--bg)",
        border: `1px solid ${expanded ? tierColor + "40" : "var(--line)"}`,
        boxShadow: expanded ? `0 0 18px -8px ${tierGlow}` : undefined,
      }}
    >
      <div className="flex items-center gap-4 px-4 py-3.5">
        <span className="text-[10px] font-mono font-bold w-4 text-center text-muted shrink-0">#{rank}</span>
        <Logo name={opp.accountName} size={32} rounded={9} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[13.5px] font-semibold text-ink">{opp.accountName}</span>
            <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded"
              style={{ background: "var(--accent-soft)", color: "var(--accent-deep)" }}>
              {opp.productName}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded ml-auto lg:ml-0"
              style={{ background: `${tierColor}14`, color: tierColor }}>
              {tier}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {chips.slice(0, 3).map((c, i) => (
              <span key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-medium"
                style={{ background: "var(--bg-deep)", color: c.tone }}>
                <c.icon size={10} strokeWidth={2.2} />
                {c.label}
              </span>
            ))}
          </div>
        </div>

        <div className="hidden md:block">
          <ScoreVisual score={opp.score} color={tierColor} size={42} compact />
        </div>

        <div className="text-right shrink-0">
          <div className="text-[15px] font-bold tnum text-ink leading-none" style={{ letterSpacing: "-0.015em" }}>
            {fmtMoney(opp.estimatedArr)}
          </div>
          <div className="text-[10px] text-muted-2 mt-0.5 capitalize">{opp.stage} · {opp.daysInStage}d</div>
        </div>

        <ChevronDown size={14} strokeWidth={1.8}
          className={`text-muted shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-line mx-4 grid grid-cols-12 gap-4 mt-1">
          <div className="col-span-12 md:col-span-7">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1.5">Next move</div>
            <div className="flex items-start gap-2 mb-3">
              <Zap size={12} strokeWidth={2.2} style={{ color: tierColor }} className="mt-0.5 shrink-0" />
              <span className="text-[12.5px] font-medium text-ink-2">{opp.play}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/accounts/${opp.accountSlug}`}
                className="inline-flex items-center gap-1 text-[10.5px] font-semibold px-2.5 py-1.5 rounded-md text-white"
                style={{ background: tierColor }}>
                Open <ArrowRight size={10} strokeWidth={2.2} />
              </Link>
              <button className="inline-flex items-center gap-1 text-[10.5px] font-medium px-2.5 py-1.5 rounded-md"
                style={{ background: "var(--surface)", color: "var(--ink-2)", border: "1px solid var(--line)" }}>
                <Sparkles size={10} strokeWidth={2} /> Brief
              </button>
            </div>
          </div>
          <div className="col-span-12 md:col-span-5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1.5">Champion</div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full grid place-items-center text-[8.5px] font-bold text-white"
                style={{ background: tierColor }}>
                {opp.champion.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="min-w-0">
                <div className="text-[12px] font-semibold text-ink truncate">{opp.champion}</div>
                <div className="text-[10px] text-muted truncate">{opp.championTitle}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
function ScoreVisual({ score, color, size = 64, compact = false }: { score: number; color: string; size?: number; compact?: boolean }) {
  const r = (size - 4) / 2;
  const C = 2 * Math.PI * r;
  const offset = C - (score / 100) * C;
  const cx = size / 2;
  const fontSize = compact ? Math.round(size * 0.36) : Math.round(size * 0.30);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--line)" strokeWidth={compact ? 3 : 4} opacity={0.4} />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={compact ? 3 : 4}
          strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 800ms cubic-bezier(0.4,0,0.2,1)" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ color }}>
        <span className="font-bold tnum leading-none" style={{ fontSize, letterSpacing: "-0.02em" }}>{score}</span>
        {!compact && <span className="text-[8.5px] uppercase tracking-[0.14em] font-semibold opacity-70 mt-0.5">score</span>}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// CHAMPION MOVERS
// ════════════════════════════════════════════════════════════════════════
function ChampionMoversPanel({ movers }: { movers: ChampionChange[] }) {
  return (
    <div className="card p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg grid place-items-center"
            style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)" }}>
            <Crown size={13} strokeWidth={2} className="text-white" />
          </div>
          <div>
            <div className="text-[14px] font-semibold text-ink">Champion movers</div>
            <div className="text-[10.5px] text-muted">Last 7 days</div>
          </div>
        </div>
        <span className="text-[10px] font-mono text-muted-2 bg-bg-deep px-1.5 py-0.5 rounded">{movers.length}</span>
      </div>

      <div className="space-y-2.5">
        {movers.map((m) => {
          const Icon =
            m.changeType === "promotion" ? TrendingUp :
            m.changeType === "departure" ? TrendingDown :
            m.changeType === "new-hire" ? Users : MoveRight;
          const tone = m.tone === "pos" ? "var(--pos)" : m.tone === "neg" ? "var(--neg)" : m.tone === "warn" ? "var(--warn)" : "var(--info)";
          const soft = m.tone === "pos" ? "var(--pos-soft)" : m.tone === "neg" ? "var(--neg-soft)" : m.tone === "warn" ? "var(--warn-soft)" : "var(--info-soft)";
          return (
            <Link key={m.id} href={`/accounts/${m.accountSlug}`}
              className="block rounded-xl p-3 hover:bg-bg-deep transition-colors"
              style={{ border: "1px solid var(--line)" }}>
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full grid place-items-center shrink-0"
                  style={{ background: soft }}>
                  <Icon size={13} strokeWidth={2} style={{ color: tone }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[12.5px] font-semibold text-ink truncate">{m.personName}</span>
                    <span className="text-[10px] text-muted-2 ml-auto shrink-0">{m.detectedAgo}</span>
                  </div>
                  <div className="text-[10.5px] text-muted truncate">
                    <span className="text-ink-2">{m.accountName}</span>
                    <span className="text-muted-2"> · </span>
                    {m.changeType === "promotion" && `→ ${m.newTitle}`}
                    {m.changeType === "departure" && "Left company"}
                    {m.changeType === "new-hire" && `New ${m.newTitle}`}
                    {m.changeType === "role-change" && `→ ${m.newTitle}`}
                  </div>
                  <div className="text-[10.5px] mt-1.5 leading-snug font-medium" style={{ color: tone }}>
                    {m.recommendedPlay}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// STUCK DEALS
// ════════════════════════════════════════════════════════════════════════
function StuckDealsPanel({ deals }: { deals: ExpansionOpportunity[] }) {
  return (
    <div className="card p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg grid place-items-center"
            style={{ background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" }}>
            <AlertCircle size={13} strokeWidth={2} className="text-white" />
          </div>
          <div>
            <div className="text-[14px] font-semibold text-ink">Stuck</div>
            <div className="text-[10.5px] text-muted">14+ days, no movement</div>
          </div>
        </div>
        <span className="text-[10px] font-mono text-muted-2 bg-bg-deep px-1.5 py-0.5 rounded">{deals.length}</span>
      </div>

      <div className="space-y-2.5">
        {deals.map((d) => {
          const reason = d.risks[0] ?? "No recent activity";
          return (
            <Link key={d.id} href={`/accounts/${d.accountSlug}`}
              className="block rounded-xl p-3 hover:bg-bg-deep transition-colors"
              style={{ border: "1px solid var(--line)" }}>
              <div className="flex items-start gap-2.5">
                <Logo name={d.accountName} size={28} rounded={7} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[12.5px] font-semibold text-ink truncate">{d.accountName}</span>
                    <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                      style={{ background: "var(--neg-soft)", color: "var(--neg)" }}>
                      {d.daysInStage}d
                    </span>
                    <span className="text-[10.5px] font-semibold tnum ml-auto text-ink shrink-0">
                      {fmtMoney(d.estimatedArr)}
                    </span>
                  </div>
                  <div className="text-[10.5px] text-muted-2 capitalize mb-1">
                    {d.productName} · {d.stage}
                  </div>
                  <div className="text-[10.5px] leading-snug" style={{ color: "var(--ink-2)" }}>
                    <AlertTriangle size={9} strokeWidth={2.4} className="inline mr-1 mb-0.5" style={{ color: "var(--warn)" }} />
                    {reason}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// RENEWAL WINDOWS — expansion adjacent to renewals
// ════════════════════════════════════════════════════════════════════════
const RENEWAL_WINDOWS = [
  { account: "Snowflake",  slug: "snowflake-inc",       arr: 480_000, renewalIn: 47, expansionPotential: 72_000, signal: "Insights upsell — bundle into renewal" },
  { account: "Tableau",    slug: "tableau-software",    arr: 540_000, renewalIn: 62, expansionPotential: 175_000, signal: "RevIntel + AI Copilot stack — joint proposal" },
  { account: "Akamai",     slug: "akamai-technologies", arr: 380_000, renewalIn: 78, expansionPotential: 120_000, signal: "Data Hub + Forecasting bundle" },
  { account: "GitLab",     slug: "gitlab-inc",          arr: 290_000, renewalIn: 89, expansionPotential: 60_000,  signal: "AI Copilot — addresses adoption gap" },
];

function RenewalWindowsPanel() {
  return (
    <div className="card p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg grid place-items-center"
            style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)" }}>
            <Calendar size={13} strokeWidth={2} className="text-white" />
          </div>
          <div>
            <div className="text-[14px] font-semibold text-ink">Renewal windows</div>
            <div className="text-[10.5px] text-muted">Next 90d — bundle expansion</div>
          </div>
        </div>
        <span className="text-[10px] font-mono text-muted-2 bg-bg-deep px-1.5 py-0.5 rounded">{RENEWAL_WINDOWS.length}</span>
      </div>

      <div className="space-y-2.5">
        {RENEWAL_WINDOWS.map((w) => {
          const urgent = w.renewalIn <= 60;
          return (
            <Link key={w.slug} href={`/accounts/${w.slug}`}
              className="block rounded-xl p-3 hover:bg-bg-deep transition-colors"
              style={{ border: "1px solid var(--line)" }}>
              <div className="flex items-start gap-2.5">
                <Logo name={w.account} size={28} rounded={7} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[12.5px] font-semibold text-ink truncate">{w.account}</span>
                    <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                      style={{ background: urgent ? "var(--warn-soft)" : "var(--accent-soft)", color: urgent ? "var(--warn)" : "var(--accent-deep)" }}>
                      {w.renewalIn}d
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5 text-[10px] text-muted">
                    <span>Renewal {fmtMoney(w.arr)}</span>
                    <span>+</span>
                    <span className="font-semibold tnum" style={{ color: "var(--pos)" }}>
                      {fmtMoney(w.expansionPotential)} expansion
                    </span>
                  </div>
                  <div className="text-[10.5px] leading-snug text-ink-2">{w.signal}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// WHITE SPACE FEED — usage signals across the book
// ════════════════════════════════════════════════════════════════════════
const WHITE_SPACE_SIGNALS = [
  { account: "Cloudflare",  slug: "cloudflare-inc",      icon: Zap,         label: "Hit 92% of plan limits", detail: "Networking module — 3rd time this quarter", tone: "var(--accent)" },
  { account: "Snowflake",   slug: "snowflake-inc",       icon: Eye,         label: "New use case detected",  detail: "ML Ops team using API in prod last 14 days", tone: "var(--pos)"   },
  { account: "Cloudflare",  slug: "cloudflare-inc",      icon: TrendingUp,  label: "Weekend usage +340%",    detail: "Heavy use Sat/Sun — power-user adoption signal", tone: "var(--pos)"   },
  { account: "Tableau",     slug: "tableau-software",    icon: Users,       label: "New seats added: 12",    detail: "ML team grew — governance gap widening", tone: "var(--accent)" },
  { account: "Akamai",      slug: "akamai-technologies", icon: FileText,    label: "Pricing page visited 4x", detail: "Tom Nakamura viewed enterprise tier", tone: "var(--info)"  },
  { account: "GitLab",      slug: "gitlab-inc",          icon: Eye,         label: "Trial signup detected",  detail: "Alex Rivera signed up for AI Copilot trial", tone: "var(--pos)"   },
];

function WhiteSpaceFeed() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg grid place-items-center"
            style={{ background: "linear-gradient(135deg, #266DF0 0%, #1A5AD4 100%)" }}>
            <Sparkles size={13} strokeWidth={2} className="text-white" />
          </div>
          <div>
            <div className="text-[14px] font-semibold text-ink">White space — suspiciously good usage</div>
            <div className="text-[10.5px] text-muted">Signals from across your book that look like expansion-ready behavior</div>
          </div>
        </div>
        <Link href="/accounts" className="text-[11px] font-medium text-muted hover:text-ink inline-flex items-center gap-1">
          View matrix <ChevronRight size={11} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {WHITE_SPACE_SIGNALS.map((s, i) => (
          <Link key={i} href={`/accounts/${s.slug}`}
            className="rounded-xl p-3.5 hover:shadow-sm transition-all flex items-start gap-3"
            style={{ background: "var(--bg)", border: "1px solid var(--line)" }}>
            <div className="w-8 h-8 rounded-lg grid place-items-center shrink-0"
              style={{ background: `color-mix(in srgb, ${s.tone} 12%, transparent)` }}>
              <s.icon size={14} strokeWidth={2} style={{ color: s.tone }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Logo name={s.account} size={14} rounded={3} />
                <span className="text-[11.5px] font-semibold text-ink truncate">{s.account}</span>
              </div>
              <div className="text-[12px] font-semibold leading-snug mb-0.5" style={{ color: s.tone }}>{s.label}</div>
              <div className="text-[10.5px] text-muted leading-snug">{s.detail}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// DEFAULT HOME (non-AM personas) — preserves existing layout
// ════════════════════════════════════════════════════════════════════════
function DefaultHome() {
  const { persona } = usePersona();
  const greeting = greetingFor();
  const sources = persona === "ae"
    ? (["Salesforce", "Gong", "Google Workspace", "Alphy AI"] as const)
    : persona === "csm"
    ? (["Salesforce", "Mixpanel", "Zendesk", "Intercom", "Alphy AI"] as const)
    : (["Salesforce", "Clari", "Gong", "Alphy AI"] as const);

  return (
    <AppShell>
      {/* Welcome banner */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6 pb-5 border-b border-line">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-[22px] font-semibold text-ink" style={{ letterSpacing: "-0.02em" }}>
              {greeting}, Walid
            </h1>
            <span className="persona-chip"><span className="dot" />{PERSONA_LABEL[persona]}</span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-muted">
            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
            <span className="text-muted-2">·</span>
            <DataFreshness minutesAgo={3} sources={sources as any} />
          </div>
        </div>
      </div>

      <MyNumber persona={persona} />

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8"><TodayQueue persona={persona} /></div>
        <div className="col-span-12 lg:col-span-4 space-y-5">
          <RisksPanel />
          <AlertsPanel />
        </div>
      </div>

      <MyTasksSection />
      {persona === "manager" && <CapacitySummary />}
      <GoalsSection persona={persona} />
    </AppShell>
  );
}

// ════════════════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════════════════
function greetingFor() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function daysUntil(dateStr: string) {
  const d = new Date(dateStr);
  return Math.max(0, Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

// ════════════════════════════════════════════════════════════════════════
// Legacy panels (kept for non-AM personas)
// ════════════════════════════════════════════════════════════════════════

const ALERTS = [
  { account: "Snowflake",    slug: "snowflake-inc",       body: "Champion Brad Wallace silent for 14 days — renewal risk escalating",               ago: "2h ago",      tone: "neg",  kind: "signal" as const },
  { account: "Snowflake",    slug: "snowflake-inc",       body: "⚑ Champion change: James Whitfield (VP Sales Ops) left company — succession needed", ago: "2d ago",      tone: "neg",  kind: "champion" as const },
  { account: "GitLab Inc.",  slug: "gitlab-inc",          body: "WAU/MAU declined further to 0.48 — three teams fully inactive",                    ago: "4h ago",      tone: "neg",  kind: "signal" as const },
  { account: "Cloudflare",   slug: "cloudflare-inc",      body: "⚑ Champion change: Maya Chen promoted to VP Engineering — expansion door opens",    ago: "12h ago",     tone: "pos",  kind: "champion" as const },
  { account: "Akamai",       slug: "akamai-technologies", body: "QBR now 14 days overdue — expansion narrative stale, Q2 risk",                     ago: "Yesterday",   tone: "warn", kind: "signal" as const },
  { account: "Tableau",      slug: "tableau-software",    body: "⚑ New hire: Priya Sharma joined as Head of Revenue Operations",                    ago: "3d ago",      tone: "info", kind: "champion" as const },
];

function RisksPanel() {
  const risks = outcomes.filter(o => o.status === "at-risk" || o.status === "watch").slice(0, 5);
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg grid place-items-center" style={{ background: "var(--neg-soft)" }}>
            <AlertTriangle size={13} strokeWidth={1.8} style={{ color: "var(--neg)" }} />
          </div>
          <span className="text-[14px] font-semibold text-ink">Risks</span>
          <span className="text-[11px] font-mono text-muted-2 bg-bg-deep px-1.5 py-0.5 rounded">{risks.length}</span>
        </div>
        <Link href="/outcomes" className="text-[11px] text-muted hover:text-ink inline-flex items-center gap-0.5">
          All <ChevronRight size={11} strokeWidth={1.6} />
        </Link>
      </div>
      <div className="space-y-2">
        {risks.map((r) => {
          const isRisk = r.status === "at-risk";
          const tone = isRisk ? "var(--neg)" : "var(--warn)";
          const soft = isRisk ? "var(--neg-soft)" : "var(--warn-soft)";
          const label = isRisk ? "At Risk" : "Watch";
          return (
            <div key={r.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-deep cursor-pointer transition-colors"
              style={{ border: "1px solid var(--line)" }}>
              <Logo name={r.account} size={24} rounded={6} />
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-semibold text-ink truncate">{r.account}</div>
                <div className="text-[10.5px] text-muted truncate mt-0.5">{r.metric}</div>
              </div>
              <span className="text-[9.5px] font-semibold px-2 py-1 rounded-md shrink-0"
                style={{ background: soft, color: tone }}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AlertsPanel() {
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg grid place-items-center" style={{ background: "var(--info-soft)" }}>
            <Bell size={13} strokeWidth={1.8} style={{ color: "var(--info)" }} />
          </div>
          <span className="text-[14px] font-semibold text-ink">Alerts</span>
          <span className="text-[11px] font-mono text-muted-2 bg-bg-deep px-1.5 py-0.5 rounded">{ALERTS.length}</span>
        </div>
        <span className="text-[10.5px] text-muted">Newest first</span>
      </div>
      <div className="space-y-1">
        {ALERTS.map((a, i) => {
          const dot = a.tone === "neg" ? "var(--neg)" : a.tone === "warn" ? "var(--warn)" : a.tone === "pos" ? "var(--pos)" : "var(--info)";
          const isOpen = expanded === i;
          return (
            <div key={i}>
              <div onClick={() => setExpanded(isOpen ? null : i)}
                className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-bg-deep cursor-pointer transition-colors"
                style={isOpen ? { background: "var(--bg-deep)" } : undefined}>
                <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: dot }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[12.5px] font-semibold text-ink">{a.account}</span>
                    <span className="text-[10px] text-muted-2 ml-auto shrink-0">{a.ago}</span>
                  </div>
                  <div className={`text-[11.5px] text-muted leading-relaxed ${isOpen ? "" : "line-clamp-2"}`}>{a.body}</div>
                </div>
              </div>
              {isOpen && (
                <div className="ml-8 px-3 pb-3 flex items-center gap-2">
                  <Link href={`/accounts/${a.slug}`}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg transition-colors"
                    style={{ background: "var(--accent-soft)", color: "var(--accent-deep)" }}>
                    View account <ArrowRight size={11} strokeWidth={2} />
                  </Link>
                  <span className="text-[10px] font-medium px-2 py-1.5 rounded-lg"
                    style={{ background: a.kind === "champion" ? "var(--warn-soft)" : "var(--info-soft)", color: a.kind === "champion" ? "var(--warn)" : "var(--info)" }}>
                    {a.kind === "champion" ? "Champion change" : "Signal"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type EnhancedGoal = {
  text: string;
  category: "Renewal" | "Adoption" | "Expansion" | "Onboarding" | "Risk" | "QBR";
  owner: { name: string; initials: string; bg: string };
  due: string;
  daysLeft: number;
  progress: number;
  recent: boolean;
};

const GOALS_CSM_X: EnhancedGoal[] = [
  { text: "Renew Snowflake — $480K ARR",                  category: "Renewal",    owner: { name: "Walid",  initials: "WQ", bg: "#374151" }, due: "May 22",  daysLeft: 18, progress: 35, recent: false },
  { text: "Complete Akamai QBR overdue 14 days",          category: "QBR",        owner: { name: "Walid",  initials: "WQ", bg: "#374151" }, due: "May 10",  daysLeft: 6,  progress: 60, recent: false },
  { text: "GitLab adoption recovery — re-engage teams",   category: "Adoption",   owner: { name: "Rachel", initials: "RK", bg: "#7C3AED" }, due: "May 16",  daysLeft: 12, progress: 22, recent: true  },
  { text: "Close GitLab renewal risk before day-64",      category: "Risk",       owner: { name: "Walid",  initials: "WQ", bg: "#374151" }, due: "Jun 02",  daysLeft: 29, progress: 18, recent: true  },
  { text: "Cloudflare expansion case to VP Eng",          category: "Expansion",  owner: { name: "Marcus", initials: "MW", bg: "#1E40AF" }, due: "May 12",  daysLeft: 8,  progress: 70, recent: false },
];

const GOALS_AE_X: EnhancedGoal[] = [
  { text: "Close Shopify — security questionnaire sent",  category: "Renewal",    owner: { name: "Walid", initials: "WQ", bg: "#374151" }, due: "May 08", daysLeft: 4,  progress: 80, recent: false },
  { text: "Unblock Stripe legal stall",                   category: "Risk",       owner: { name: "Walid", initials: "WQ", bg: "#374151" }, due: "Today",  daysLeft: 0,  progress: 50, recent: false },
  { text: "Schedule Raytheon discovery call",             category: "Onboarding", owner: { name: "Walid", initials: "WQ", bg: "#374151" }, due: "May 12", daysLeft: 8,  progress: 25, recent: true  },
];

const GOAL_CATEGORY_STYLE: Record<EnhancedGoal["category"], { bg: string; color: string }> = {
  Renewal:    { bg: "var(--warn-soft)",   color: "var(--warn)"        },
  Adoption:   { bg: "var(--info-soft)",   color: "var(--info)"        },
  Expansion:  { bg: "var(--accent-soft)", color: "var(--accent-deep)" },
  Onboarding: { bg: "var(--pos-soft)",    color: "var(--pos)"         },
  Risk:       { bg: "var(--neg-soft)",    color: "var(--neg)"         },
  QBR:        { bg: "var(--bg-deep)",     color: "var(--ink-2)"       },
};

function GoalsSection({ persona }: { persona: string }) {
  const all = persona === "ae" ? GOALS_AE_X : GOALS_CSM_X;
  const overdue   = all.filter(g => g.daysLeft <= 1);
  const thisWeek  = all.filter(g => g.daysLeft > 1 && g.daysLeft <= 7);
  const upcoming  = all.filter(g => g.daysLeft > 7);
  const avgProg   = Math.round(all.reduce((s, g) => s + g.progress, 0) / all.length);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  return (
    <div className="card p-6 mt-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg grid place-items-center" style={{ background: "var(--accent-soft)" }}>
            <Target size={13} strokeWidth={1.8} style={{ color: "var(--accent-deep)" }} />
          </div>
          <span className="text-[15px] font-semibold text-ink">Goals</span>
          <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded"
            style={{ background: "var(--accent-soft)", color: "var(--accent-deep)" }}>BETA</span>
          <span className="text-[11.5px] text-muted">{all.length} active · {avgProg}% avg</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11.5px]">
          <button className="px-3 py-1.5 rounded-lg font-medium text-ink bg-bg-deep">Live goals</button>
          <button className="px-3 py-1.5 rounded-lg text-muted hover:text-ink">Completed</button>
          <button className="ml-2 h-8 px-3 rounded-lg text-[11.5px] font-medium inline-flex items-center gap-1.5 border border-line bg-surface hover:bg-bg-deep">
            <Plus size={12} strokeWidth={2} /> Add goal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <GoalBucket title="Overdue / today"   count={overdue.length}  tone="var(--neg)"  goals={overdue} expandedGoal={expandedGoal} setExpandedGoal={setExpandedGoal} />
        <GoalBucket title="This week"          count={thisWeek.length} tone="var(--warn)" goals={thisWeek} expandedGoal={expandedGoal} setExpandedGoal={setExpandedGoal} />
        <GoalBucket title="Upcoming"           count={upcoming.length} tone="var(--info)" goals={upcoming} expandedGoal={expandedGoal} setExpandedGoal={setExpandedGoal} />
      </div>
    </div>
  );
}

function GoalBucket({ title, count, tone, goals, expandedGoal, setExpandedGoal }: {
  title: string; count: number; tone: string; goals: EnhancedGoal[];
  expandedGoal: string | null; setExpandedGoal: (v: string | null) => void;
}) {
  return (
    <div className="rounded-xl p-3.5" style={{ background: "var(--bg-deep)", border: "1px solid var(--line)" }}>
      <div className="flex items-center gap-2 mb-3 px-0.5">
        <span className="w-2 h-2 rounded-full" style={{ background: tone }} />
        <span className="text-[12px] font-semibold text-ink">{title}</span>
        {count > 0 && <span className="text-[10px] font-mono text-muted ml-auto">{count}</span>}
      </div>
      {goals.length === 0 ? (
        <div className="text-[11.5px] text-muted-2 py-4 text-center">Nothing here</div>
      ) : (
        <div className="space-y-2.5">
          {goals.map((g, i) => (
            <EnhancedGoalRow key={i} goal={g}
              isExpanded={expandedGoal === g.text}
              onToggle={() => setExpandedGoal(expandedGoal === g.text ? null : g.text)} />
          ))}
        </div>
      )}
    </div>
  );
}

const GOAL_ACTIONS: Record<string, string[]> = {
  Renewal:    ["Schedule renewal call", "Prep value deck", "Send executive summary"],
  Adoption:   ["Review usage data", "Set up re-engagement campaign", "Schedule training"],
  Expansion:  ["Build business case", "Map stakeholders", "Schedule discovery"],
  Onboarding: ["Send welcome kit", "Schedule kickoff", "Assign CSM"],
  Risk:       ["Escalate to manager", "Prep recovery plan", "Loop in exec sponsor"],
  QBR:        ["Prep QBR deck", "Pull usage analytics", "Confirm attendees"],
};

function EnhancedGoalRow({ goal, isExpanded, onToggle }: { goal: EnhancedGoal; isExpanded: boolean; onToggle: () => void }) {
  const cat = GOAL_CATEGORY_STYLE[goal.category];
  const dueTone = goal.daysLeft <= 1 ? "var(--neg)" : goal.daysLeft <= 7 ? "var(--warn)" : "var(--ink-2)";
  const actions = GOAL_ACTIONS[goal.category] ?? [];
  return (
    <div className={`rounded-xl border bg-surface transition-all ${isExpanded ? "border-accent/30 shadow-sm" : "border-line hover:border-line-strong hover:shadow-sm"}`}>
      <div className="group cursor-pointer px-3.5 py-3" onClick={onToggle}>
        <div className="flex items-start gap-2.5">
          <div className={`w-[18px] h-[18px] rounded-full border-2 shrink-0 mt-0.5 ${isExpanded ? "border-accent-deep" : "border-line group-hover:border-accent-deep"}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-2">
              <span className="text-[12.5px] font-medium text-ink leading-snug flex-1 min-w-0">{goal.text}</span>
              <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md shrink-0"
                style={{ background: cat.bg, color: cat.color }}>{goal.category}</span>
            </div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-deep)" }}>
                <div className="h-full rounded-full" style={{ width: `${goal.progress}%`, background: "var(--accent-deep)" }} />
              </div>
              <span className="text-[10px] font-mono tnum text-muted font-semibold">{goal.progress}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full text-white grid place-items-center text-[8px] font-semibold"
                  style={{ background: goal.owner.bg }}>{goal.owner.initials}</div>
                <span className="text-[10.5px] text-muted">{goal.owner.name}</span>
              </div>
              <span className="text-[10.5px] font-mono tnum font-medium" style={{ color: dueTone }}>{goal.due}</span>
            </div>
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="px-3.5 pb-3 pt-0 border-t border-line mx-2">
          <div className="pt-2.5 space-y-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-2 mb-1.5">Suggested next steps</div>
            {actions.map((a, i) => (
              <button key={i} className="flex items-center gap-2 w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-bg-deep transition-colors group/act">
                <Circle size={10} strokeWidth={2} className="text-muted-2 group-hover/act:text-accent-deep shrink-0" />
                <span className="text-[11.5px] text-ink-2 group-hover/act:text-ink">{a}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MyTasksSection() {
  const myTasks = accountPlans.flatMap(plan =>
    plan.milestones.flatMap(ms =>
      ms.tasks
        .filter(t => t.assignee === "Walid Qayoumi" && t.status !== "done")
        .map(t => ({ ...t, planTitle: plan.title, accountName: plan.accountName, accountSlug: plan.accountSlug, milestone: ms.title }))
    )
  ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  if (myTasks.length === 0) return null;

  const overdue = myTasks.filter(t => new Date(t.dueDate) < new Date());
  const upcoming = myTasks.filter(t => new Date(t.dueDate) >= new Date());

  return (
    <div className="card p-5 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg grid place-items-center" style={{ background: "var(--accent-soft)" }}>
            <CheckCircle2 size={13} strokeWidth={1.8} style={{ color: "var(--accent-deep)" }} />
          </div>
          <span className="text-[14px] font-semibold text-ink">My Tasks</span>
          <span className="text-[11px] font-mono text-muted-2 bg-bg-deep px-1.5 py-0.5 rounded">{myTasks.length}</span>
        </div>
        <span className="text-[10.5px] text-muted">Across all plans</span>
      </div>
      <div className="space-y-1">
        {overdue.length > 0 && <div className="text-[10px] font-semibold uppercase tracking-wider text-neg px-3 py-1">Overdue</div>}
        {overdue.map(t => <TaskRow key={t.id} task={t} />)}
        {upcoming.length > 0 && overdue.length > 0 && (
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-2 px-3 py-1 mt-2">Upcoming</div>
        )}
        {upcoming.map(t => <TaskRow key={t.id} task={t} />)}
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: PlanTask & { planTitle: string; accountName: string; accountSlug: string; milestone: string } }) {
  const isOverdue = new Date(task.dueDate) < new Date();
  const isInProgress = task.status === "in-progress";
  return (
    <Link href={`/accounts/${task.accountSlug}`}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-deep transition-colors group">
      <div className="shrink-0">
        {isInProgress
          ? <Clock size={14} strokeWidth={1.8} style={{ color: "var(--accent-deep)" }} />
          : <Circle size={14} strokeWidth={1.8} className="text-muted-2 group-hover:text-accent-deep transition-colors" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-medium text-ink truncate">{task.title}</div>
        <div className="text-[10.5px] text-muted mt-0.5 truncate">{task.accountName} · {task.milestone}</div>
      </div>
      <span className={`text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${task.priority === "high" ? "" : "text-muted"}`}
        style={task.priority === "high" ? { background: "var(--neg-soft)", color: "var(--neg)" } : { background: "var(--bg-deep)" }}>
        {task.priority === "high" ? "High" : task.priority === "medium" ? "Med" : "Low"}
      </span>
      <span className={`text-[10.5px] font-mono tnum shrink-0 ${isOverdue ? "font-semibold" : ""}`}
        style={{ color: isOverdue ? "var(--neg)" : "var(--muted)" }}>
        {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </span>
      <ArrowRight size={11} strokeWidth={1.8} className="text-muted-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </Link>
  );
}

function CapacitySummary() {
  const overloaded = csmWorkloads.filter((c) => c.workloadScore >= 75).slice(0, 3);
  return (
    <div className="card p-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="mono-label">Team Capacity</div>
        <Link href="/capacity" className="text-[11px] font-medium text-muted hover:text-ink inline-flex items-center gap-1">
          View all <ChevronRight size={11} />
        </Link>
      </div>
      {overloaded.length === 0 ? (
        <div className="text-[12px] text-muted">All CSMs within normal capacity range.</div>
      ) : (
        <div className="space-y-2">
          {overloaded.map((csm) => (
            <div key={csm.id} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full grid place-items-center text-[9px] font-semibold shrink-0"
                style={{ background: "var(--bg-deep)" }}>{csm.initials}</span>
              <span className="text-[12px] font-medium text-ink flex-1">{csm.name}</span>
              <div className="w-20 h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-deep)" }}>
                <div className="h-full rounded-full" style={{ width: `${csm.workloadScore}%`, background: "var(--neg)" }} />
              </div>
              <span className="text-[10.5px] font-mono tnum" style={{ color: "var(--neg)" }}>{csm.workloadScore}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
