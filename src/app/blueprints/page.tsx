"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown, ChevronRight, Zap, Trophy, AlertTriangle, Sparkles,
  ArrowRight, Bot, Mail, Users as UsersIcon, GitBranch, CircleDot,
  Wrench, BarChart3, TrendingUp, TrendingDown, Clock, Target,
  DollarSign, Hash, Eye, Lightbulb, ShieldCheck, ArrowUpRight,
  Calendar, User, Layers, SlidersHorizontal, Search,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import {
  blueprintInsights, blueprintStages, blueprintPlays, deals,
  type MotionType, type SignalCategory, type InsightSignal,
  type BlueprintStage, type BlueprintNode, type FlowNodeType,
  type PlayCard,
  fmtMoney,
} from "@/lib/mock";

type Tab = "insights" | "process" | "plays" | "comparison";

const TABS: { key: Tab; label: string; count?: number }[] = [
  { key: "insights", label: "Insights", count: 17 },
  { key: "process", label: "Process", count: 5 },
  { key: "plays", label: "Plays", count: 18 },
  { key: "comparison", label: "Deal Comparison" },
];

const MOTIONS: MotionType[] = ["New Business", "Strategic", "Expansion", "Renewal"];

const MOTION_SIGNAL_BOOST: Record<MotionType, SignalCategory> = {
  "New Business": "Timing",
  Strategic: "Win",
  Expansion: "Win",
  Renewal: "Risk",
};

export default function BlueprintsPage() {
  const [tab, setTab] = useState<Tab>("insights");
  const [motion, setMotion] = useState<MotionType>("New Business");

  return (
    <AppShell>
      <div className="flex flex-col gap-5 p-6 max-w-[1400px] mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-[20px] font-bold text-ink">Sales Blueprints</h1>
            <p className="text-[12px] text-muted-2 mt-0.5">Pattern-based intelligence across your pipeline</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-2">Motion</span>
            <select
              value={motion}
              onChange={(e) => setMotion(e.target.value as MotionType)}
              className="h-8 px-3 text-[12px] rounded-lg border border-line bg-surface text-ink focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {MOTIONS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-line">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-[12px] font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
                tab === t.key
                  ? "border-accent text-ink"
                  : "border-transparent text-muted-2 hover:text-ink"
              }`}
            >
              {t.label}
              {t.count && (
                <span className={`text-[9px] font-mono tnum px-1.5 py-0.5 rounded-full ${
                  tab === t.key ? "bg-accent/15 text-accent" : "bg-bg-deep text-muted-2"
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === "insights" && <InsightsTab motion={motion} />}
        {tab === "process" && <ProcessTab />}
        {tab === "plays" && <PlaysTab />}
        {tab === "comparison" && <ComparisonTab />}
      </div>
    </AppShell>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Insights Tab
   ═══════════════════════════════════════════════════════════════════ */

const SIGNAL_CATS: { key: SignalCategory; label: string; icon: typeof Zap; color: string }[] = [
  { key: "Timing", label: "Timing Signals", icon: Clock, color: "var(--accent)" },
  { key: "Win", label: "Win Signals", icon: Trophy, color: "var(--pos)" },
  { key: "Risk", label: "Risk Signals", icon: AlertTriangle, color: "var(--neg)" },
];

function InsightsTab({ motion }: { motion: MotionType }) {
  const boosted = MOTION_SIGNAL_BOOST[motion];
  const [expandedCat, setExpandedCat] = useState<SignalCategory | null>(boosted);
  const [selectedSignal, setSelectedSignal] = useState<InsightSignal | null>(null);

  const grouped = useMemo(() => {
    const map: Record<SignalCategory, InsightSignal[]> = { Timing: [], Win: [], Risk: [] };
    blueprintInsights.forEach((s) => map[s.category].push(s));
    return map;
  }, []);

  const totalNew = blueprintInsights.filter((s) => s.isNew).length;

  return (
    <div className="flex flex-col gap-5">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card px-4 py-3">
          <div className="mono-label text-[9px] mb-1" style={{ letterSpacing: "0.08em" }}>Total Signals</div>
          <div className="text-[18px] font-bold tnum text-ink">{blueprintInsights.length}</div>
          <div className="text-[10px] text-muted-2">across 3 categories</div>
        </div>
        <div className="card px-4 py-3">
          <div className="mono-label text-[9px] mb-1" style={{ letterSpacing: "0.08em" }}>New This Month</div>
          <div className="text-[18px] font-bold tnum text-accent">{totalNew}</div>
          <div className="text-[10px] text-muted-2">recently discovered</div>
        </div>
        <div className="card px-4 py-3">
          <div className="mono-label text-[9px] mb-1" style={{ letterSpacing: "0.08em" }}>Boosted Category</div>
          <div className="text-[18px] font-bold text-ink">{boosted}</div>
          <div className="text-[10px] text-muted-2">for {motion}</div>
        </div>
        <div className="card px-4 py-3">
          <div className="mono-label text-[9px] mb-1" style={{ letterSpacing: "0.08em" }}>Avg Impact</div>
          <div className="text-[18px] font-bold tnum text-ink">2.1×</div>
          <div className="text-[10px] text-muted-2">outcome lift</div>
        </div>
      </div>

      <div className="flex gap-5" style={{ minHeight: 480 }}>
        {/* Signal List */}
        <div className="flex-1 flex flex-col gap-3">
          {SIGNAL_CATS.map((cat) => {
            const signals = grouped[cat.key];
            const isOpen = expandedCat === cat.key;
            const isBoosted = cat.key === boosted;
            const Icon = cat.icon;
            const newCount = signals.filter((s) => s.isNew).length;

            return (
              <div key={cat.key} className={`card overflow-hidden ${isBoosted ? "ring-1 ring-accent/30" : ""}`}>
                <button
                  onClick={() => setExpandedCat(isOpen ? null : cat.key)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors"
                >
                  <Icon size={16} style={{ color: cat.color }} />
                  <span className="text-[13px] font-semibold text-ink flex-1 text-left">{cat.label}</span>
                  {isBoosted && (
                    <span className="px-1.5 py-0.5 text-[8px] font-bold rounded-full bg-accent/15 text-accent uppercase tracking-wider">Boosted</span>
                  )}
                  {newCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[8px] font-bold rounded-full bg-accent/15 text-accent tnum">{newCount} new</span>
                  )}
                  <span className="text-[11px] text-muted-2 tnum">{signals.length}</span>
                  <ChevronDown
                    size={14}
                    className="text-muted-2 transition-transform"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-line">
                    {signals.map((signal) => {
                      const isSelected = selectedSignal?.id === signal.id;
                      return (
                        <button
                          key={signal.id}
                          onClick={() => setSelectedSignal(isSelected ? null : signal)}
                          className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-line last:border-b-0 ${
                            isSelected ? "bg-surface-2" : "hover:bg-surface-2/50"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[12px] font-medium text-ink">{signal.title}</span>
                              {signal.isNew && (
                                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-accent/15 text-accent uppercase tracking-wider">New</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[11px] text-muted-2">{signal.dataPoint}</span>
                              <span className="text-[11px] font-medium" style={{ color: cat.color }}>{signal.outcomeMetric}</span>
                            </div>
                          </div>
                          <ChevronRight size={12} className={`mt-1 shrink-0 transition-colors ${isSelected ? "text-accent" : "text-muted-2"}`} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div className="w-[400px] shrink-0 hidden lg:block">
          {selectedSignal ? (
            <SignalDetailPanel signal={selectedSignal} />
          ) : (
            <div className="card p-5 flex flex-col items-center justify-center" style={{ minHeight: 260 }}>
              <Eye size={24} className="text-muted-2 mb-3" />
              <p className="text-[13px] font-medium text-ink mb-1">Signal Detail</p>
              <p className="text-[11px] text-muted-2 text-center">Click any signal to view its full analysis, impact breakdown, and recommended actions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SignalDetailPanel({ signal }: { signal: InsightSignal }) {
  const cat = SIGNAL_CATS.find((c) => c.key === signal.category)!;
  const Icon = cat.icon;
  const impactNum = parseFloat(signal.outcomeMetric.replace(/[^0-9.]/g, "")) || 50;
  const impactPct = Math.min(100, Math.round(impactNum * (signal.outcomeMetric.includes("×") ? 20 : 1)));

  const actions: string[] = [];
  if (signal.category === "Timing") {
    actions.push("Set automated reminders for this timing window");
    actions.push("Add to deal stage exit criteria");
    actions.push("Create agent trigger for overdue deals");
  } else if (signal.category === "Win") {
    actions.push("Prioritize deals exhibiting this pattern");
    actions.push("Build playbook around this signal");
    actions.push("Train reps to identify early indicators");
  } else {
    actions.push("Configure early warning alert for this signal");
    actions.push("Assign recovery play when detected");
    actions.push("Add to manager review checklist");
  }

  return (
    <div className="card p-5 sticky top-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={14} style={{ color: cat.color }} />
          <span className="mono-label text-[9px]" style={{ letterSpacing: "0.08em" }}>{signal.category} Signal</span>
        </div>
        {signal.isNew && (
          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-accent/15 text-accent uppercase tracking-wider">New</span>
        )}
      </div>

      <h3 className="text-[15px] font-bold text-ink leading-tight">{signal.title}</h3>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="px-3 py-2.5 rounded-lg bg-surface-2 border border-line">
          <div className="text-[9px] text-muted-2 uppercase tracking-wider mb-1">Data Point</div>
          <div className="text-[12px] font-semibold text-ink">{signal.dataPoint}</div>
        </div>
        <div className="px-3 py-2.5 rounded-lg bg-surface-2 border border-line">
          <div className="text-[9px] text-muted-2 uppercase tracking-wider mb-1">Outcome</div>
          <div className="text-[12px] font-semibold" style={{ color: cat.color }}>{signal.outcomeMetric}</div>
        </div>
      </div>

      {/* Impact Bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-muted-2">Impact Score</span>
          <span className="text-[10px] font-medium tnum" style={{ color: cat.color }}>{impactPct}%</span>
        </div>
        <div className="h-2 rounded-full bg-bg-deep overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${impactPct}%`, background: cat.color }}
          />
        </div>
      </div>

      {/* Analysis */}
      <div>
        <div className="mono-label text-[9px] mb-2" style={{ letterSpacing: "0.08em" }}>Analysis</div>
        <p className="text-[12px] text-muted leading-relaxed">{signal.detail}</p>
      </div>

      {/* Recommended Actions */}
      <div>
        <div className="mono-label text-[9px] mb-2" style={{ letterSpacing: "0.08em" }}>Recommended Actions</div>
        <div className="space-y-1.5">
          {actions.map((action, i) => (
            <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg border border-line hover:bg-surface-2 transition-colors cursor-pointer">
              <Lightbulb size={11} className="text-accent mt-0.5 shrink-0" />
              <span className="text-[11px] text-ink">{action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Related Deals */}
      <div>
        <div className="mono-label text-[9px] mb-2" style={{ letterSpacing: "0.08em" }}>Active Deals Affected</div>
        <div className="flex items-center gap-2">
          <span className="text-[18px] font-bold tnum text-ink">
            {Math.floor(Math.random() * 6 + 3)}
          </span>
          <span className="text-[10px] text-muted-2">deals currently match this signal pattern</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Process Tab
   ═══════════════════════════════════════════════════════════════════ */

const NODE_ICON: Record<FlowNodeType, typeof Bot> = {
  agent: Bot,
  email: Mail,
  meeting: UsersIcon,
  decision: GitBranch,
  milestone: CircleDot,
  manual: Wrench,
};

const NODE_COLOR: Record<FlowNodeType, string> = {
  agent: "var(--accent)",
  email: "#60A5FA",
  meeting: "#A78BFA",
  decision: "#FBBF24",
  milestone: "var(--pos)",
  manual: "var(--muted)",
};

const AVG_DAYS: Record<string, number> = {
  Qualification: 8, Discovery: 14, Demo: 10, Proposal: 12, Negotiation: 18,
};

function ProcessTab() {
  const [stageIdx, setStageIdx] = useState(0);
  const [expandedNode, setExpandedNode] = useState<string | null>(null);
  const stage = blueprintStages[stageIdx];

  return (
    <div className="flex flex-col gap-5">
      {/* Stage Progress Bar */}
      <div className="card p-4">
        <div className="flex items-center gap-1">
          {blueprintStages.map((s, i) => {
            const isActive = i === stageIdx;
            const isPast = i < stageIdx;
            return (
              <div key={s.name} className="flex items-center flex-1">
                <button
                  onClick={() => { setStageIdx(i); setExpandedNode(null); }}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-2 px-2 rounded-lg transition-colors ${
                    isActive ? "bg-accent/10" : "hover:bg-surface-2"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full grid place-items-center text-[11px] font-bold border-2 transition-colors ${
                      isActive ? "border-accent bg-accent text-bg" :
                      isPast ? "border-pos bg-pos/10 text-pos" :
                      "border-line bg-surface text-muted-2"
                    }`}
                  >
                    {isPast ? "✓" : i + 1}
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? "text-accent" : isPast ? "text-pos" : "text-muted-2"}`}>{s.name}</span>
                  <span className="text-[9px] text-muted-2 tnum">{s.conversionRate}% conv</span>
                </button>
                {i < blueprintStages.length - 1 && (
                  <div className={`w-8 h-0.5 shrink-0 ${isPast ? "bg-pos" : "bg-line"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card px-4 py-3">
          <div className="mono-label text-[9px] mb-1" style={{ letterSpacing: "0.08em" }}>Conversion Rate</div>
          <div className="text-[20px] font-bold tnum text-ink">{stage.conversionRate}%</div>
          <div className="text-[10px] text-muted-2">stage entry → exit</div>
        </div>
        <div className="card px-4 py-3">
          <div className="mono-label text-[9px] mb-1" style={{ letterSpacing: "0.08em" }}>Win Rate</div>
          <div className="text-[20px] font-bold tnum text-ink">{stage.winRate}%</div>
          <div className="text-[10px] text-muted-2">from this stage</div>
        </div>
        <div className="card px-4 py-3">
          <div className="mono-label text-[9px] mb-1" style={{ letterSpacing: "0.08em" }}>Avg Days</div>
          <div className="text-[20px] font-bold tnum text-ink">{AVG_DAYS[stage.name] ?? 10}</div>
          <div className="text-[10px] text-muted-2">in stage</div>
        </div>
        <div className="card px-4 py-3">
          <div className="mono-label text-[9px] mb-1" style={{ letterSpacing: "0.08em" }}>Exit Criteria</div>
          <div className="text-[20px] font-bold tnum text-ink">{stage.criteriaCount}</div>
          <div className="text-[10px] text-muted-2">required to advance</div>
        </div>
      </div>

      {/* Flowchart */}
      <div className="card p-5 overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="mono-label text-[9px]" style={{ letterSpacing: "0.08em" }}>Stage Flow — {stage.name}</span>
          <span className="text-[10px] text-muted-2">{stage.nodes.length} steps</span>
        </div>
        <div className="flex flex-col gap-0 min-w-[600px]">
          {stage.nodes.map((node, ni) => {
            const Icon = NODE_ICON[node.type];
            const color = NODE_COLOR[node.type];
            const isExpanded = expandedNode === node.id;
            const isLast = ni === stage.nodes.length - 1;
            const isMilestone = node.type === "milestone";
            const isDecision = node.type === "decision";

            return (
              <div key={node.id}>
                <button
                  onClick={() => setExpandedNode(isExpanded ? null : node.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors group text-left ${
                    isMilestone ? "bg-pos/5 hover:bg-pos/10" :
                    isDecision ? "bg-yellow-500/5 hover:bg-yellow-500/10" :
                    "hover:bg-surface-2"
                  }`}
                >
                  <div className="relative">
                    <div
                      className={`w-10 h-10 flex items-center justify-center shrink-0 ${
                        isDecision ? "rounded-lg rotate-45" : "rounded-xl"
                      }`}
                      style={{ background: `color-mix(in srgb, ${color} 15%, transparent)` }}
                    >
                      <Icon size={16} style={{ color, transform: isDecision ? "rotate(-45deg)" : undefined }} />
                    </div>
                    {/* Step number */}
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-bg-deep border border-line grid place-items-center">
                      <span className="text-[8px] font-bold text-muted-2 tnum">{ni + 1}</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[12px] font-medium ${isMilestone ? "text-pos" : "text-ink"}`}>{node.label}</span>
                      {node.actor && (
                        <span className="px-1.5 py-0.5 text-[9px] rounded-full border border-line text-muted-2">{node.actor}</span>
                      )}
                    </div>
                    {isExpanded && (
                      <p className="text-[11px] text-muted leading-relaxed mt-1">{node.description}</p>
                    )}
                  </div>

                  <span className={`px-2 py-0.5 text-[9px] rounded-full border shrink-0 capitalize ${
                    isMilestone ? "border-pos/30 text-pos bg-pos/5" :
                    isDecision ? "border-yellow-500/30 text-yellow-500 bg-yellow-500/5" :
                    "border-line text-muted-2"
                  }`}>{node.type}</span>

                  <ChevronDown
                    size={14}
                    className="text-muted-2 transition-transform shrink-0"
                    style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>

                {/* Connector */}
                {!isLast && (
                  <div className="ml-[38px] flex items-center" style={{ height: isDecision ? 28 : 20 }}>
                    <div className="w-0.5 h-full rounded-full" style={{ background: isDecision ? "#FBBF24" : "var(--line)" }} />
                    {isDecision && (
                      <span className="ml-3 text-[9px] text-yellow-500 italic">Yes →</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 px-1">
        {(Object.keys(NODE_ICON) as FlowNodeType[]).map((type) => {
          const Icon = NODE_ICON[type];
          const color = NODE_COLOR[type];
          return (
            <div key={type} className="flex items-center gap-1.5">
              <Icon size={12} style={{ color }} />
              <span className="text-[10px] text-muted-2 capitalize">{type}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Plays Tab
   ═══════════════════════════════════════════════════════════════════ */

type PlaySort = "recovery" | "deals" | "title";
type PlayFilter = "all" | "high" | "mid" | "low";

const PLAY_FILTERS: { key: PlayFilter; label: string }[] = [
  { key: "all", label: "All Plays" },
  { key: "high", label: "High Recovery (60%+)" },
  { key: "mid", label: "Medium (50–59%)" },
  { key: "low", label: "Needs Iteration (<50%)" },
];

const PLAY_SORTS: { key: PlaySort; label: string }[] = [
  { key: "recovery", label: "Recovery Rate" },
  { key: "deals", label: "Deal Count" },
  { key: "title", label: "Alphabetical" },
];

function PlaysTab() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<PlayFilter>("all");
  const [sort, setSort] = useState<PlaySort>("recovery");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...blueprintPlays];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || p.trigger.toLowerCase().includes(q));
    }
    if (filter === "high") list = list.filter((p) => p.recoveryRate >= 60);
    if (filter === "mid") list = list.filter((p) => p.recoveryRate >= 50 && p.recoveryRate < 60);
    if (filter === "low") list = list.filter((p) => p.recoveryRate < 50);

    if (sort === "recovery") list.sort((a, b) => b.recoveryRate - a.recoveryRate);
    if (sort === "deals") list.sort((a, b) => b.dealCount - a.dealCount);
    if (sort === "title") list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [search, filter, sort]);

  const summary = useMemo(() => {
    const avgRecovery = Math.round(blueprintPlays.reduce((s, p) => s + p.recoveryRate, 0) / blueprintPlays.length);
    const totalDeals = blueprintPlays.reduce((s, p) => s + p.dealCount, 0);
    const highCount = blueprintPlays.filter((p) => p.recoveryRate >= 60).length;
    return { avgRecovery, totalDeals, highCount };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card px-4 py-3">
          <div className="mono-label text-[9px] mb-1" style={{ letterSpacing: "0.08em" }}>Avg Recovery</div>
          <div className="text-[18px] font-bold tnum text-ink">{summary.avgRecovery}%</div>
          <div className="text-[10px] text-muted-2">across all plays</div>
        </div>
        <div className="card px-4 py-3">
          <div className="mono-label text-[9px] mb-1" style={{ letterSpacing: "0.08em" }}>Deals Covered</div>
          <div className="text-[18px] font-bold tnum text-ink">{summary.totalDeals}</div>
          <div className="text-[10px] text-muted-2">total usage</div>
        </div>
        <div className="card px-4 py-3">
          <div className="mono-label text-[9px] mb-1" style={{ letterSpacing: "0.08em" }}>High Performers</div>
          <div className="text-[18px] font-bold tnum text-pos">{summary.highCount}</div>
          <div className="text-[10px] text-muted-2">60%+ recovery</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plays..."
            className="h-9 w-full pl-9 pr-3 text-[12px] rounded-lg border border-line bg-surface text-ink placeholder:text-muted-2 focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div className="flex gap-1">
          {PLAY_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 text-[10px] font-medium rounded-lg transition-colors whitespace-nowrap ${
                filter === f.key
                  ? "bg-accent/15 text-accent border border-accent/30"
                  : "bg-surface border border-line text-muted-2 hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as PlaySort)}
          className="h-9 px-3 text-[11px] rounded-lg border border-line bg-surface text-ink focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {PLAY_SORTS.map((s) => (
            <option key={s.key} value={s.key}>Sort: {s.label}</option>
          ))}
        </select>
      </div>

      <div className="text-[10px] text-muted-2">{filtered.length} plays</div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((play) => {
          const isExpanded2 = expanded === play.id;
          return (
            <div key={play.id} className="card flex flex-col hover:shadow-md transition-shadow overflow-hidden">
              <button
                onClick={() => setExpanded(isExpanded2 ? null : play.id)}
                className="p-4 flex flex-col gap-3 text-left flex-1"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[13px] font-semibold text-ink leading-tight">{play.title}</h3>
                  <ChevronDown
                    size={12}
                    className="text-muted-2 shrink-0 mt-0.5 transition-transform"
                    style={{ transform: isExpanded2 ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </div>
                <p className="text-[11px] text-muted-2 leading-relaxed">{play.trigger}</p>

                {/* Recovery bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-muted-2">Recovery Rate</span>
                    <span className="text-[10px] font-bold tnum" style={{
                      color: play.recoveryRate >= 60 ? "var(--pos)" : play.recoveryRate >= 50 ? "var(--accent)" : "var(--warn)"
                    }}>{play.recoveryRate}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-bg-deep overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${play.recoveryRate}%`,
                        background: play.recoveryRate >= 60 ? "var(--pos)" : play.recoveryRate >= 50 ? "var(--accent)" : "var(--warn)",
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2 border-t border-line">
                  <div className="flex items-center gap-1">
                    <Hash size={10} className="text-muted-2" />
                    <span className="text-[10px] tnum text-muted-2">{play.dealCount} deals</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Layers size={10} className="text-muted-2" />
                    <span className="text-[10px] tnum text-muted-2">{play.stepCount} steps</span>
                  </div>
                </div>
              </button>

              {/* Expanded Steps */}
              {isExpanded2 && (
                <div className="px-4 pb-4 border-t border-line pt-3">
                  <div className="mono-label text-[8px] mb-2" style={{ letterSpacing: "0.08em" }}>Play Steps</div>
                  <div className="space-y-1.5">
                    {Array.from({ length: play.stepCount }, (_, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-2 border border-line">
                        <div className="w-5 h-5 rounded-full bg-bg-deep border border-line grid place-items-center shrink-0">
                          <span className="text-[8px] font-bold text-muted-2 tnum">{i + 1}</span>
                        </div>
                        <span className="text-[11px] text-ink">
                          {getPlayStep(play.title, i)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-[12px] text-muted-2">No plays matching your filters</p>
        </div>
      )}
    </div>
  );
}

function getPlayStep(title: string, idx: number): string {
  const steps: Record<string, string[]> = {
    "Pricing Concession Push": ["Acknowledge budget concern", "Reframe value vs. cost", "Present tiered pricing options", "Share ROI case study", "Propose pilot / phased rollout", "Set 48h decision window"],
    "Competitor Displacement": ["Identify competitor weaknesses", "Prepare battlecard talking points", "Share head-to-head comparison", "Arrange reference call", "Highlight switching costs of staying", "Present migration support plan"],
    "Technical De-risking": ["Surface specific technical concern", "Arrange SE deep-dive session", "Offer sandbox / POC environment", "Provide security documentation"],
    "Closing The Loop Sequence": ["Send value recap email", "Share new case study or feature", "Propose modified timeline", "Offer executive sponsor call", "Present limited-time incentive", "Final check-in before close-out"],
    "Business Case Reset": ["Identify ROI gap", "Rebuild business case with new data", "Align metrics to buyer KPIs", "Present to economic buyer"],
    "Customer Reference Drop": ["Send curated reference list"],
    "New Exec Bridge": ["Research new exec background", "Prepare personalized outreach", "Schedule intro meeting", "Re-present tailored value prop"],
    "Reschedule Recovery": ["Send empathetic follow-up", "Propose 2–3 alternative times", "Include meeting value summary", "Confirm commitment"],
    "Internal Review Enablement": ["Create internal pitch deck", "Provide ROI calculator", "Draft executive email template", "Prepare FAQ document", "Offer to join internal meeting", "Share customer testimonial video"],
    "Procurement / Security Unblock": ["Identify blockers", "Pre-fill security questionnaire", "Engage legal early", "Provide compliance documentation"],
    "Multi-threading Push": ["Map stakeholder org chart", "Identify 3+ key contacts", "Personalize outreach per persona", "Create multi-thread email sequence", "Schedule group demo", "Track engagement across threads"],
    "Use-case Reposition": ["Assess current priority shift", "Map to alternative use case", "Present updated ROI", "Align with new business objectives"],
    "Urgency Create": ["Tie to upcoming budget cycle", "Highlight competitive movement", "Present time-sensitive offer", "Share market timing data"],
    "Build-vs-buy Rebuttal": ["Calculate true build cost", "Present total cost of ownership", "Highlight hidden engineering costs", "Share time-to-value comparison", "Present integration complexity", "Offer pilot period"],
    "Champion Succession": ["Identify successor / new champion", "Research their priorities", "Re-engage with personalized message", "Rebuild relationship from discovery", "Transfer institutional context", "Secure new champion commitment"],
    "Executive Approval Push": ["Identify C-suite decision maker", "Prepare executive briefing", "Arrange exec-to-exec meeting", "Present board-ready business case"],
    "Feature Update Re-engagement": ["Identify relevant new feature", "Prepare personalized demo", "Show impact on original objection", "Propose updated evaluation"],
    "Gift Re-engagement": ["Send thoughtful, personalized gift"],
  };
  const list = steps[title] || ["Execute step " + (idx + 1)];
  return list[idx] || "Execute step " + (idx + 1);
}

/* ═══════════════════════════════════════════════════════════════════
   Deal Comparison Tab
   ═══════════════════════════════════════════════════════════════════ */

function ComparisonTab() {
  const [sortKey, setSortKey] = useState<"amount" | "health" | "stage" | "forecastProb" | "closeDate">("amount");
  const [sortAsc, setSortAsc] = useState(false);
  const [healthFilter, setHealthFilter] = useState<"all" | "high" | "medium" | "low">("all");

  const activDeals = useMemo(
    () => deals.filter((d) => d.stage !== "Closed Won" && d.stage !== "Closed Lost"),
    []
  );

  const filteredDeals = useMemo(() => {
    if (healthFilter === "all") return activDeals;
    return activDeals.filter((d) => d.health === healthFilter);
  }, [activDeals, healthFilter]);

  const kpis = useMemo(() => {
    const total = activDeals.reduce((s, d) => s + d.amount, 0);
    const avgHealth = activDeals.reduce((s, d) => s + (d.health === "high" ? 3 : d.health === "medium" ? 2 : 1), 0) / (activDeals.length || 1);
    const avgMeddpicc = activDeals.reduce((s, d) => s + d.meddpicc.reduce((a, b) => a + b, 0), 0) / (activDeals.length || 1);
    const avgProb = activDeals.reduce((s, d) => s + d.forecastProb, 0) / (activDeals.length || 1);
    const atRisk = activDeals.filter((d) => d.health === "low" || d.closeAtRisk).length;
    return { total, avgHealth, avgMeddpicc, avgProb, atRisk };
  }, [activDeals]);

  const sorted = useMemo(() => {
    const healthVal = (h: string) => h === "high" ? 3 : h === "medium" ? 2 : 1;
    return [...filteredDeals].sort((a, b) => {
      let diff = 0;
      if (sortKey === "amount") diff = a.amount - b.amount;
      else if (sortKey === "health") diff = healthVal(a.health) - healthVal(b.health);
      else if (sortKey === "stage") diff = a.stageProgress.done / a.stageProgress.total - b.stageProgress.done / b.stageProgress.total;
      else if (sortKey === "forecastProb") diff = a.forecastProb - b.forecastProb;
      else if (sortKey === "closeDate") diff = new Date(a.closeDate).getTime() - new Date(b.closeDate).getTime();
      return sortAsc ? diff : -diff;
    });
  }, [filteredDeals, sortKey, sortAsc]);

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  }

  const SortArrow = ({ k }: { k: typeof sortKey }) => (
    sortKey === k ? (
      <span className="text-[9px] ml-0.5">{sortAsc ? "▲" : "▼"}</span>
    ) : null
  );

  return (
    <div className="flex flex-col gap-5">
      {/* KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="card px-4 py-3">
          <div className="mono-label text-[9px] mb-1" style={{ letterSpacing: "0.08em" }}>Active Pipeline</div>
          <div className="text-[18px] font-bold tnum text-ink">{fmtMoney(kpis.total)}</div>
          <div className="text-[10px] text-muted-2 tnum">{activDeals.length} deals</div>
        </div>
        <div className="card px-4 py-3">
          <div className="mono-label text-[9px] mb-1" style={{ letterSpacing: "0.08em" }}>Avg Health</div>
          <div className="text-[18px] font-bold tnum text-ink">{kpis.avgHealth.toFixed(1)}</div>
          <div className="text-[10px] text-muted-2">of 3.0</div>
        </div>
        <div className="card px-4 py-3">
          <div className="mono-label text-[9px] mb-1" style={{ letterSpacing: "0.08em" }}>Avg MEDDPICC</div>
          <div className="text-[18px] font-bold tnum text-ink">{kpis.avgMeddpicc.toFixed(1)}</div>
          <div className="text-[10px] text-muted-2">of 8</div>
        </div>
        <div className="card px-4 py-3">
          <div className="mono-label text-[9px] mb-1" style={{ letterSpacing: "0.08em" }}>Avg Probability</div>
          <div className="text-[18px] font-bold tnum text-ink">{Math.round(kpis.avgProb)}%</div>
          <div className="text-[10px] text-muted-2">forecast</div>
        </div>
        <div className="card px-4 py-3">
          <div className="mono-label text-[9px] mb-1" style={{ letterSpacing: "0.08em" }}>At Risk</div>
          <div className="text-[18px] font-bold tnum text-neg">{kpis.atRisk}</div>
          <div className="text-[10px] text-muted-2">need attention</div>
        </div>
      </div>

      {/* Health Filter */}
      <div className="flex gap-1">
        {(["all", "high", "medium", "low"] as const).map((h) => (
          <button
            key={h}
            onClick={() => setHealthFilter(h)}
            className={`px-3 py-1.5 text-[10px] font-medium rounded-lg transition-colors capitalize ${
              healthFilter === h
                ? "bg-accent/15 text-accent border border-accent/30"
                : "bg-surface border border-line text-muted-2 hover:text-ink"
            }`}
          >
            {h === "all" ? "All Health" : h}
          </button>
        ))}
        <span className="text-[10px] text-muted-2 self-center ml-2">{sorted.length} deals</span>
      </div>

      {/* Deal Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line">
              <th className="px-4 py-3 text-[10px] font-medium text-muted-2 uppercase tracking-wider">Deal</th>
              <th className="px-4 py-3 text-[10px] font-medium text-muted-2 uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleSort("amount")}>
                Amount <SortArrow k="amount" />
              </th>
              <th className="px-4 py-3 text-[10px] font-medium text-muted-2 uppercase tracking-wider">Stage</th>
              <th className="px-4 py-3 text-[10px] font-medium text-muted-2 uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleSort("health")}>
                Health <SortArrow k="health" />
              </th>
              <th className="px-4 py-3 text-[10px] font-medium text-muted-2 uppercase tracking-wider">MEDDPICC</th>
              <th className="px-4 py-3 text-[10px] font-medium text-muted-2 uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleSort("forecastProb")}>
                Prob <SortArrow k="forecastProb" />
              </th>
              <th className="px-4 py-3 text-[10px] font-medium text-muted-2 uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleSort("closeDate")}>
                Close <SortArrow k="closeDate" />
              </th>
              <th className="px-4 py-3 text-[10px] font-medium text-muted-2 uppercase tracking-wider">Next Step</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((deal) => {
              const mScore = deal.meddpicc.reduce((a, b) => a + b, 0);
              const mPct = Math.round((mScore / 8) * 100);
              const hColor = deal.health === "high" ? "var(--pos)" : deal.health === "medium" ? "var(--accent)" : "var(--neg)";
              const closeDate = new Date(deal.closeDate);
              const isOverdue = closeDate < new Date();

              return (
                <tr key={deal.id} className="border-b border-line last:border-b-0 hover:bg-surface-2/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/deals`} className="group">
                      <div className="text-[12px] font-medium text-ink group-hover:text-accent transition-colors">{deal.name}</div>
                      <div className="text-[10px] text-muted-2">{deal.owner}</div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[12px] font-medium text-ink tnum">{fmtMoney(deal.amount)}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 text-[10px] rounded-full border border-line text-ink bg-surface-2">{deal.stage}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: hColor }} />
                      <span className="text-[11px] capitalize text-ink">{deal.health}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-bg-deep overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${mPct}%`,
                            background: mPct >= 75 ? "var(--pos)" : mPct >= 50 ? "var(--accent)" : "var(--neg)",
                          }}
                        />
                      </div>
                      <span className="text-[10px] tnum text-muted-2">{mScore}/8</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] tnum text-ink">{deal.forecastProb}%</td>
                  <td className="px-4 py-3">
                    <div className={`flex items-center gap-1 text-[11px] tnum ${isOverdue ? "text-neg" : deal.closeAtRisk ? "text-warn" : "text-muted-2"}`}>
                      <Calendar size={10} />
                      {closeDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {deal.closeAtRisk && <AlertTriangle size={9} className="text-warn" />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] text-muted-2 truncate block max-w-[160px]">{deal.nextStep}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
