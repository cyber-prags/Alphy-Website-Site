"use client";

// ─────────────────────────────────────────────────────────────────────────────
// AccountWorkspaceV2 — clean modern redesign of /accounts/[slug]
//
// 6 flat tabs (not nested groups):
//   Overview · Signals · Journey · People · Deals · Tasks · Agent
//
// Visual language:
//   - Generous whitespace, soft borders, subtle elevation
//   - Inline insight bullets with stakeholder name pills
//   - Intent line chart with gradient fill + strong score badge
//   - Scoring factors ranked by signed impact, colour-coded bars
//   - Two-column collapsible signal/research cards
//   - Multi-identity journey timeline with month gutters and channel logos
//   - People list with engagement chips, role badges, attractor / detractor
//     score, and a one-click switch to an org-chart visualisation
//   - Deal drilldown with 4 sub-tabs (Touchpoints, Completed, Upcoming, ROI)
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2, Activity, Compass, Users, DollarSign, ListChecks, Sparkles,
  ChevronDown, ChevronRight, ChevronUp, Search, Filter, ArrowRight,
  TrendingUp, TrendingDown, Flame, ThumbsUp, ThumbsDown, ShieldAlert,
  Calendar, Target, CheckCircle2, Circle, AlertCircle, Mail,
  ExternalLink, Globe, MessageSquare, FileText, Zap, ArrowUpRight,
  ArrowDownRight, Crown, UserPlus, UserCheck, Network, List, Layers,
  AtSign, X, Briefcase, Clock, StickyNote, Bell, Wand2, Plus,
} from "lucide-react";
import { useToast } from "./Toast";
import type {
  AccountDetail, Stakeholder, AccountSignal, DealRow,
} from "@/lib/mock";
import { BrandLogo } from "./BrandLogo";

// Inline brand glyphs (lucide-react doesn't ship Linkedin/Twitter in this version)
function Linkedin({ size = 14, ...rest }: { size?: number; strokeWidth?: number; className?: string; style?: React.CSSProperties }) {
  void rest;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...rest}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14ZM8.5 18v-8H6v8h2.5ZM7.25 8.75a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM18 18v-4.6c0-2.4-1.3-3.5-3-3.5-1.4 0-2 .8-2.4 1.4V10H10v8h2.5v-4.4c0-1.2.6-1.9 1.6-1.9.9 0 1.4.6 1.4 1.9V18H18Z"/>
    </svg>
  );
}
function Twitter({ size = 14, ...rest }: { size?: number; strokeWidth?: number; className?: string; style?: React.CSSProperties }) {
  void rest;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...rest}>
      <path d="M18.244 2H21l-6.52 7.45L22 22h-6.18l-4.84-6.32L5.4 22H2.65l6.97-7.96L2 2h6.34l4.36 5.78L18.244 2Zm-1.08 18h1.7L7.92 4H6.1l11.06 16Z"/>
    </svg>
  );
}
import { PersonAvatar } from "./PersonAvatar";

// ── tokens ────────────────────────────────────────────────────────────────
const cardClass = "rounded-2xl border border-line bg-surface";
const subCardClass = "rounded-xl border border-line bg-bg-deep";
const sectionTitleClass = "text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-2";

const fmtMoney = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `$${(n / 1_000).toFixed(0)}K` : `$${n}`;

// ─────────────────────────────────────────────────────────────────────────────
// Public entry
// ─────────────────────────────────────────────────────────────────────────────
type V2Tab = "overview" | "signals" | "journey" | "people" | "deals" | "tasks" | "whitespace" | "analytics" | "docs" | "agent";

// 5 top-level groups → each opens a sub-tab strip below the main row.
type V2Group = "overview" | "intel" | "people" | "pipeline" | "workspace";
const GROUPS: { id: V2Group; label: string; tabs: V2Tab[] }[] = [
  { id: "overview",  label: "Overview",  tabs: ["overview"] },
  { id: "intel",     label: "Intel",     tabs: ["signals", "journey", "analytics"] },
  { id: "people",    label: "People",    tabs: ["people"] },
  { id: "pipeline",  label: "Pipeline",  tabs: ["deals", "tasks", "whitespace"] },
  { id: "workspace", label: "Workspace", tabs: ["docs", "agent"] },
];
const SUB_LABEL: Record<V2Tab, string> = {
  overview:   "Overview",
  signals:    "Signals",
  journey:    "Journey",
  analytics:  "Analytics",
  people:     "People",
  deals:      "Deals",
  tasks:      "Tasks",
  whitespace: "White Space",
  docs:       "Docs",
  agent:      "Agent",
};
function groupForTab(t: V2Tab): V2Group {
  for (const g of GROUPS) if (g.tabs.includes(t)) return g.id;
  return "overview";
}

export function AccountWorkspaceV2({
  account, slug, deals,
  renderCallRecordings,
  renderWhitespace,
  renderAnalytics,
  renderDocs,
  showOwnHeader = true,
}: {
  account: AccountDetail;
  slug: string;
  deals: DealRow[];
  /** Optional slot — rendered inside the Overview tab, above the Intent chart. */
  renderCallRecordings?: () => React.ReactNode;
  /** Optional slot — rendered inside the White Space tab. */
  renderWhitespace?: () => React.ReactNode;
  /** Optional slot — rendered inside the Analytics tab. */
  renderAnalytics?: () => React.ReactNode;
  /** Optional slot — rendered inside the Docs tab. */
  renderDocs?: () => React.ReactNode;
  /** When the parent already renders a richer header (e.g. NotionAccountHeader),
   *  pass false to suppress V2's slim breadcrumb header. */
  showOwnHeader?: boolean;
}) {
  const [tab, setTab] = useState<V2Tab>("overview");

  return (
    <div className="space-y-4">
      {showOwnHeader && <V2Header account={account} />}
      <V2Tabs current={tab} onChange={setTab} counts={{
        signals: account.signals.length,
        people: account.stakeholders.length,
        deals: deals.length,
      }} />
      <div className="pt-1">
        {tab === "overview"   && <OverviewPanel account={account} renderCallRecordings={renderCallRecordings} />}
        {tab === "signals"    && <SignalsPanel account={account} />}
        {tab === "journey"    && <JourneyPanel account={account} />}
        {tab === "people"     && <PeoplePanel stakeholders={account.stakeholders} />}
        {tab === "deals"      && <DealsPanel account={account} deals={deals} />}
        {tab === "tasks"      && <TasksPanel slug={slug} />}
        {tab === "whitespace" && (renderWhitespace ? renderWhitespace() : <Placeholder label="White Space matrix" />)}
        {tab === "analytics"  && (renderAnalytics ? renderAnalytics() : <Placeholder label="Analytics" />)}
        {tab === "docs"       && (renderDocs ? renderDocs() : <Placeholder label="Documents" />)}
        {tab === "agent"      && <AgentPanel account={account} />}
      </div>
    </div>
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className={`${cardClass} p-8 text-center text-[13px] text-muted`}>{label} coming soon.</div>
  );
}

// Small one-line context blurb shown above panels — orients the user
// before they dive into filters / charts / lists.
function PanelIntro({ Icon, title, body }: {
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
  title: string; body: string;
}) {
  return (
    <div className="rounded-xl px-4 py-3 flex items-start gap-3"
      style={{
        background: "linear-gradient(135deg, rgba(38,109,240,0.05), rgba(124,58,237,0.03))",
        border: "1px solid rgba(38,109,240,0.16)",
      }}>
      <div className="w-7 h-7 rounded-lg grid place-items-center flex-shrink-0"
        style={{ background: "rgba(38,109,240,0.10)", border: "1px solid rgba(38,109,240,0.20)" }}>
        <Icon size={12} strokeWidth={2} style={{ color: "var(--accent)" }} />
      </div>
      <div className="min-w-0">
        <div className="text-[12.5px] font-semibold text-ink mb-0.5">{title}</div>
        <p className="text-[11.5px] text-muted leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Header — account chip + score badge
// ─────────────────────────────────────────────────────────────────────────────
function V2Header({ account }: { account: AccountDetail }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5 text-[12.5px] text-muted">
        <Link href="/accounts" className="inline-flex items-center gap-1.5 hover:text-ink transition-colors">
          <Building2 size={14} strokeWidth={1.7} />
          Companies
        </Link>
        <span className="text-muted-2">/</span>
        <BrandLogo name={account.name} size={18} />
        <span className="font-semibold text-ink text-[13.5px]">{account.name}</span>
        <span className="text-muted-2 text-[11.5px]">({account.domain})</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={sectionTitleClass}>Score</span>
        <span className="text-[28px] font-bold tnum text-warn"
          style={{ letterSpacing: "-0.018em" }}>
          {account.healthScore}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tabs — flat 7-tab strip
// ─────────────────────────────────────────────────────────────────────────────
function V2Tabs({
  current, onChange, counts,
}: { current: V2Tab; onChange: (t: V2Tab) => void; counts: { signals: number; people: number; deals: number } }) {
  const groupIcon: Record<V2Group, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
    overview:  Layers,
    intel:     Activity,
    people:    Users,
    pipeline:  DollarSign,
    workspace: Sparkles,
  };
  const groupCount = (g: V2Group): number | undefined => {
    if (g === "intel")    return counts.signals;
    if (g === "people")   return counts.people;
    if (g === "pipeline") return counts.deals;
    return undefined;
  };
  const activeGroup = groupForTab(current);
  const activeGroupDef = GROUPS.find((g) => g.id === activeGroup)!;

  const onGroupClick = (g: V2Group) => {
    if (g === activeGroup) return;
    const def = GROUPS.find((x) => x.id === g)!;
    onChange(def.tabs[0]);
  };

  return (
    <div className="space-y-2">
      {/* Top-level pill row — 5 groups */}
      <div className="flex items-center gap-1">
        {GROUPS.map((g) => {
          const Icon = groupIcon[g.id];
          const active = g.id === activeGroup;
          const count = groupCount(g.id);
          return (
            <button key={g.id}
              data-tour={`account-${g.id}-tab`}
              onClick={() => onGroupClick(g.id)}
              className="relative inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors flex-shrink-0 whitespace-nowrap"
              style={{
                background: active ? "var(--ink)" : "transparent",
                color: active ? "white" : "var(--muted)",
              }}>
              <Icon size={14} strokeWidth={active ? 2 : 1.6} />
              {g.label}
              {count !== undefined && count > 0 && (
                <span className="text-[10.5px] font-mono tnum"
                  style={{ opacity: active ? 0.7 : 0.6 }}>{count}</span>
              )}
            </button>
          );
        })}
      </div>
      {/* Sub-tab row — only when the active group has multiple tabs */}
      {activeGroupDef.tabs.length > 1 && (
        <div className="flex items-center gap-1 px-1 border-b border-line">
          {activeGroupDef.tabs.map((sub) => {
            const subActive = current === sub;
            return (
              <button key={sub}
                data-tour={`account-${sub}-tab`}
                onClick={() => onChange(sub)}
                className="relative text-[12px] font-medium px-3 py-2 transition-colors"
                style={{ color: subActive ? "var(--ink)" : "var(--muted)" }}>
                {SUB_LABEL[sub]}
                {subActive && (
                  <span className="absolute left-2 right-2 -bottom-px h-[1.5px] rounded-full"
                    style={{ background: "var(--ink)" }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// OVERVIEW PANEL
// ═════════════════════════════════════════════════════════════════════════════
function OverviewPanel({ account, renderCallRecordings }: { account: AccountDetail; renderCallRecordings?: () => React.ReactNode }) {
  // The NotionAccountHeader already exposes all of the properties (Owner,
  // ARR, NRR, Renewal, Employees, Domain, HQ, Health, Expansion) above the
  // tab strip, so we don't need a second Properties rail in the Overview.
  // The Overview is full-width — bullets · calls · intent · factors.
  return (
    <div className="space-y-5">
      <OverviewBullets account={account} />
      {renderCallRecordings && renderCallRecordings()}
      <IntentChart account={account} />
      <ScoringFactors account={account} />
    </div>
  );
}

function OverviewBullets({ account }: { account: AccountDetail }) {
  // Pull a champion + a technical evaluator from stakeholders to construct
  // the narrative bullets the way the screenshot does.
  const champion = account.stakeholders.find((s) => s.role === "Champion");
  const evaluator = account.stakeholders.find((s) => s.role === "Decision Maker" && s.department !== "Finance")
                 ?? account.stakeholders.find((s) => s.role === "Influencer");

  return (
    <div className={`${cardClass} p-6`}>
      <div className="flex items-center gap-2 mb-4">
        <Layers size={14} strokeWidth={1.8} className="text-muted" />
        <h3 className="text-[15px] font-semibold text-ink" style={{ letterSpacing: "-0.014em" }}>Overview</h3>
      </div>
      <ul className="space-y-2.5 text-[13px] text-ink-2 leading-relaxed">
        <li className="flex gap-2.5">
          <Dot />
          <span>
            This company (<b className="text-ink">{fmtMoney(account.arr || 1_000_000_000)} revenue, {account.employees.toLocaleString()} employees</b>) is in the
            <b className="text-ink"> evaluation phase</b>, with <b className="text-ink">27 high-intent interactions</b> logged over the past 30 days.
          </span>
        </li>
        {champion && (
          <li className="flex gap-2.5">
            <Dot />
            <span>
              <PersonChip name={champion.name} title={champion.title} />
              {" "}visited the pricing and ROI calculator pages multiple times between <b className="text-ink">Apr 8–17</b>, indicating budget validation and business case preparation.
            </span>
          </li>
        )}
        <li className="flex gap-2.5">
          <Dot />
          <span>
            Anonymous keyword searches for <i className="text-muted">&ldquo;account intelligence&rdquo;</i> and <i className="text-muted">&ldquo;ABM&rdquo;</i> and visits to the
            executive overview and security compliance sections on <b className="text-ink">Apr 12</b>, suggesting leadership-level involvement.
          </span>
        </li>
        {evaluator && (
          <li className="flex gap-2.5">
            <Dot />
            <span>
              <PersonChip name={evaluator.name} title={evaluator.title} />
              {" "}explored technical documentation, workflow automation guides, and API integration resources on <b className="text-ink">Apr 9</b> and again on <b className="text-ink">Apr 23</b>.
            </span>
          </li>
        )}
        <li className="flex gap-2.5">
          <Dot />
          <span>
            Multiple users across the revenue and marketing teams accessed demo replays, attribution reporting, and Salesforce integration content,
            highlighting <b className="text-ink">cross-functional interest</b>.
          </span>
        </li>
        <li className="flex gap-2.5">
          <Dot />
          <span>
            Account showed sustained engagement with paid and organic search; intent surging around <i className="text-muted">&ldquo;multi-touch attribution enterprise&rdquo;</i> and <i className="text-muted">&ldquo;AI-led funnel optimisation&rdquo;</i>.
          </span>
        </li>
        <li className="flex gap-2.5">
          <Dot />
          <span>
            Based on these patterns, they are <b className="text-ink">confirmed to be in an evaluation</b>, with decision-makers engaged, technical fit validated, and procurement likely underway.
          </span>
        </li>
      </ul>
    </div>
  );
}

function Dot() {
  return (
    <span className="inline-block w-1.5 h-1.5 rounded-full mt-[7px] flex-shrink-0"
      style={{ background: "var(--muted)" }} />
  );
}

function PersonChip({ name, title }: { name: string; title: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11.5px] font-medium border align-middle"
      style={{ background: "var(--bg-deep)", borderColor: "var(--line)", color: "var(--ink)" }}>
      {name} <span className="text-muted-2">({title})</span>
    </span>
  );
}

// ── Intent chart (interactive, hover tooltip) ──────────────────────────────
function IntentChart({ account }: { account: AccountDetail }) {
  // Synthesised time-series — peaks correlate with the 27 interactions in the bullets above.
  const points = [42, 26, 22, 78, 56, 54, 44, 28, 96, 50, 54, 88, 44, 76];
  const labels = ["May 8", "May 15", "May 22", "May 29", "Jun 5", "Jun 12", "Jun 19", "Jun 26", "Jul 3", "Jul 10", "Jul 17", "Jul 24", "Jul 31", "Aug 7"];
  // Causes that drove each peak — surfaced on hover.
  const insights = [
    "Quiet week — 3 anonymous website visits.",
    "Decline after long weekend.",
    "Lull — single LinkedIn engagement.",
    "Spike: pricing + ROI calculator visited 4 times by named users.",
    "Sustained — security compliance reads.",
    "Demo replay viewed 3 times by Maya Chen.",
    "Stable — outbound emails opened.",
    "Quiet — usual mid-quarter dip.",
    "Surge: full buying committee active. Datadog case study downloaded.",
    "Cooling — proposal under internal review.",
    "Stable — procurement engaged.",
    "Spike: VP RevOps re-engaged after off-site.",
    "Stable — quiet week.",
    "Latest peak: 3 stakeholder demos scheduled this week.",
  ];

  const W = 920, H = 160, padX = 36, padY = 22;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;
  const stepX = innerW / (points.length - 1);
  const xy = points.map((v, i) => ({ x: padX + i * stepX, y: padY + innerH * (1 - v / 100) }));
  const [hover, setHover] = useState<number | null>(null);

  // Smooth path with cubic Bezier
  const path = xy.reduce((acc, p, i, arr) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = arr[i - 1];
    const cx1 = prev.x + (p.x - prev.x) * 0.5, cy1 = prev.y;
    const cx2 = prev.x + (p.x - prev.x) * 0.5, cy2 = p.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p.x} ${p.y}`;
  }, "");
  const areaPath = `${path} L ${xy[xy.length - 1].x} ${padY + innerH} L ${xy[0].x} ${padY + innerH} Z`;

  return (
    <div className={`${cardClass} p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-ink" style={{ letterSpacing: "-0.014em" }}>Intent</h3>
        <div className="flex items-center gap-1.5 text-[24px] font-bold tnum text-warn"
          style={{ letterSpacing: "-0.018em" }}>
          <Flame size={16} strokeWidth={2} className="text-warn" />
          {account.healthScore}
        </div>
      </div>
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[160px]" preserveAspectRatio="none"
          onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => {
            const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
            const xRatio = (e.clientX - rect.left) / rect.width;
            const xInChart = padX + xRatio * innerW;
            // Find nearest point
            let nearest = 0, best = Infinity;
            xy.forEach((p, i) => { const d = Math.abs(p.x - xInChart); if (d < best) { best = d; nearest = i; } });
            setHover(nearest);
          }}>
        <defs>
          <linearGradient id="intentLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
          <linearGradient id="intentArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="rgba(245,158,11,0.30)" />
            <stop offset="100%" stopColor="rgba(245,158,11,0.0)" />
          </linearGradient>
        </defs>
        {/* gridlines */}
        {[0, 25, 50, 75, 100].map((g) => (
          <g key={g}>
            <line x1={padX} x2={W - padX} y1={padY + innerH * (1 - g / 100)} y2={padY + innerH * (1 - g / 100)}
              stroke="var(--line)" strokeWidth="1" strokeDasharray="2 4" />
            <text x={padX - 8} y={padY + innerH * (1 - g / 100) + 3} textAnchor="end"
              className="fill-muted-2" style={{ font: "10px Inter" }}>{g}°</text>
          </g>
        ))}
        {/* Area */}
        <path d={areaPath} fill="url(#intentArea)" />
        {/* Line */}
        <path d={path} fill="none" stroke="url(#intentLine)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Hover guide */}
        {hover !== null && (
          <line x1={xy[hover].x} x2={xy[hover].x} y1={padY} y2={padY + innerH}
            stroke="var(--ink)" strokeWidth="1" strokeDasharray="3 3" opacity={0.4} />
        )}
        {/* Points */}
        {xy.map((p, i) => {
          const v = points[i];
          const colour = v > 75 ? "#EF4444" : v > 45 ? "#F59E0B" : "#3B82F6";
          const isHover = hover === i;
          return <circle key={i} cx={p.x} cy={p.y} r={isHover ? 6 : 4} fill={colour} stroke="var(--surface)" strokeWidth={isHover ? 2 : 1.5}
            style={{ transition: "r 120ms ease-out" }} />;
        })}
        {/* Date labels */}
        {labels.map((l, i) => (
          <text key={l} x={padX + i * stepX} y={H - 6} textAnchor="middle"
            className="fill-muted-2" style={{ font: "10px Inter" }}>{l}</text>
        ))}
        </svg>
        {hover !== null && (
          <div className="absolute pointer-events-none rounded-lg border border-line bg-surface shadow-lg p-3 max-w-xs"
            style={{
              left: `${(xy[hover].x / W) * 100}%`,
              top: `${((xy[hover].y - 16) / H) * 100}%`,
              transform: "translate(-50%, -100%)",
            }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-muted-2 tnum">{labels[hover]}</span>
              <span className="text-[14px] font-bold tnum"
                style={{ color: points[hover] > 75 ? "#EF4444" : points[hover] > 45 ? "#F59E0B" : "#3B82F6" }}>
                {points[hover]}°
              </span>
            </div>
            <div className="text-[11.5px] text-ink-2 leading-snug">{insights[hover]}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Scoring factors ────────────────────────────────────────────────────────
type Factor = { id: string; label: string; tone: "pos-strong" | "pos" | "neutral" | "neg" | "neg-strong" };
function ScoringFactors({ account }: { account: AccountDetail }) {
  void account;
  const factors: Factor[] = [
    { id: "f1", label: "Multiple recent, high-intent demo interactions and recorded meetings within the last 14 days (Salesforce/Gong events and live-demo visits from named emails on Nov 25; Nate visited live-demo pages Nov 19–21).", tone: "pos-strong" },
    { id: "f2", label: "Active, multi-stakeholder opportunity with scheduled stakeholder demos and ongoing CRM activity (deal moved to Stage 3 Stakeholder Demo, multiple Salesforce updates).", tone: "pos-strong" },
    { id: "f3", label: "Strong web/account engagement: pricing page views, ROI calculator usage, and security compliance sections accessed by leadership-mapped IPs.", tone: "pos" },
    { id: "f4", label: "Rejected 6sense in 2024 citing data accuracy concerns — a direct match to our differentiator and a clear unmet need.", tone: "pos" },
    { id: "f5", label: "No champion identified yet on the buying committee; multi-thread coverage limited to the CRO + CTO branch.", tone: "neutral" },
    { id: "f6", label: "Renewal of competing tooling (Marketo + 6sense bundle) is 18 months away — slower than typical replacement window.", tone: "neg" },
    { id: "f7", label: "Procurement has not yet engaged; no Legal or InfoSec touches in the last 30 days.", tone: "neg" },
  ];

  return (
    <div className={`${cardClass} p-6`}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[15px] font-semibold text-ink" style={{ letterSpacing: "-0.014em" }}>Scoring Factors</h3>
      </div>
      <div className="text-[11.5px] text-muted mb-4">{factors.length} signals · last scored 2 hours ago</div>
      <div className="space-y-3">
        {factors.map((f) => <ScoringRow key={f.id} factor={f} />)}
      </div>
    </div>
  );
}

function ScoringRow({ factor }: { factor: Factor }) {
  const meta = {
    "pos-strong": { label: "Strong Positive", colour: "#10B981", icon: <ArrowUpRight size={11} strokeWidth={2.4} /> },
    "pos":        { label: "Positive",        colour: "#22C55E", icon: <TrendingUp size={11} strokeWidth={2} /> },
    "neutral":    { label: "Neutral",         colour: "#9CA3AF", icon: <Circle size={9} strokeWidth={2} /> },
    "neg":        { label: "Negative",        colour: "#F59E0B", icon: <TrendingDown size={11} strokeWidth={2} /> },
    "neg-strong": { label: "Strong Negative", colour: "#EF4444", icon: <ArrowDownRight size={11} strokeWidth={2.4} /> },
  }[factor.tone];

  // Map tone → percentage fill (for the bar)
  const fill = factor.tone === "pos-strong" ? 95
            : factor.tone === "pos" ? 75
            : factor.tone === "neutral" ? 50
            : factor.tone === "neg" ? 30 : 12;

  return (
    <div className={`${subCardClass} p-3.5`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 text-[12.5px] text-ink-2 leading-relaxed">{factor.label}</div>
        <div className="flex items-center gap-1 flex-shrink-0 text-[11.5px] font-semibold whitespace-nowrap"
          style={{ color: meta.colour }}>
          {meta.icon}
          {meta.label}
        </div>
      </div>
      {/* bar */}
      <div className="mt-2.5 h-[3px] rounded-full overflow-hidden" style={{ background: "var(--line)" }}>
        <div className="h-full rounded-full" style={{ width: `${fill}%`, background: meta.colour }} />
      </div>
    </div>
  );
}

// ── Properties rail ────────────────────────────────────────────────────────
function PropertiesPanel({ account }: { account: AccountDetail }) {
  type Row = { Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; label: string; value: string };
  const rows: Row[] = [
    { Icon: Building2, label: "Company Name",  value: account.name },
    { Icon: Users,     label: "Owner",          value: account.owner },
    { Icon: Globe,     label: "Industry",       value: account.industry },
    { Icon: Layers,    label: "Company Type",   value: account.segment },
    { Icon: Globe,     label: "Country",        value: "USA" },
    { Icon: Users,     label: "Employees",      value: account.employees.toLocaleString() },
    { Icon: DollarSign,label: "Annual Revenue", value: account.arr ? fmtMoney(account.arr) : "—" },
    { Icon: Calendar,  label: "Founded",        value: "1888" },
    { Icon: Globe,     label: "Headquarters",   value: account.hq },
    { Icon: Target,    label: "Account List",   value: "Tier 1 NA" },
  ];
  return (
    <div className={`${cardClass} p-5 sticky top-4`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-semibold text-ink">Properties</h3>
        <ChevronRight size={14} strokeWidth={1.7} className="text-muted-2" />
      </div>
      <div className="space-y-2.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-3 py-1.5">
            <div className="flex items-center gap-2 text-[12px] text-muted min-w-0">
              <r.Icon size={12} strokeWidth={1.7} />
              <span className="truncate">{r.label}</span>
            </div>
            <span className="text-[12.5px] font-medium text-ink truncate text-right">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SIGNALS PANEL — accordion research cards in 2-column grid
// ═════════════════════════════════════════════════════════════════════════════
type ResearchCard = {
  id: string;
  title: string;
  badge?: { label: string; tone: "info" | "pos" | "warn" };
  body: React.ReactNode;
};

function SignalsPanel({ account }: { account: AccountDetail }) {
  const champion = account.stakeholders.find((s) => s.role === "Champion");
  const cfo      = account.stakeholders.find((s) => /CFO/i.test(s.title));
  const infosec  = account.stakeholders.find((s) => /InfoSec|Security/i.test(s.title));
  const product  = account.stakeholders.find((s) => /Product/i.test(s.title));
  const detractor = account.stakeholders.find((s) => s.role === "Detractor");
  const arrLabel = account.arr ? fmtMoney(account.arr) : "—";
  const renewal = account.renewalDays;
  const isCustomer = account.status === "Customer";

  const left: ResearchCard[] = [
    {
      id: "win",
      title: "Why We Win Here",
      body: (
        <>
          <p className="mb-3 text-ink-2">{account.name} sits at the intersection of three high-conviction signals:</p>
          <ol className="space-y-2 list-decimal list-inside text-ink-2">
            <li><b className="text-ink">Timing</b> — {champion ? <>{champion.name} ({champion.title}) — recently active and aligned.</> : "Buying centre is in an active evaluation window."} Renewal is in <b className="text-ink">{renewal} days</b>, which compresses the decision timeline.</li>
            <li><b className="text-ink">Gap</b> — {isCustomer
              ? <>Adoption is concentrated in {champion?.department ?? "Engineering"}. Adjacent buying centres are uncovered, leaving an incremental ARR opportunity inside the existing footprint.</>
              : <>No deployed solution today. Internal tooling cannot deliver the integrated cross-funnel signal we lead on.</>
            }</li>
            <li><b className="text-ink">Scale</b> — At <b className="text-ink">{arrLabel}</b> ARR ({account.employees.toLocaleString()} employees, NRR <b className="text-ink">{account.nrr}%</b>), the cost of inaction compounds. Our nearest comparable customer ran the same play and lifted attainment in two quarters.</li>
          </ol>
          <p className="mt-3 text-muted">The competitive window is narrow. Multi-threading into {cfo?.name ?? "the CFO's office"} unlocks a second entry point with independent budget authority — and reduces single-thread risk.</p>
        </>
      ),
    },
    {
      id: "icp",
      title: "ICP Fit Score",
      badge: { label: account.healthScore >= 80 ? "9/10" : account.healthScore >= 65 ? "7/10" : "5/10", tone: account.healthScore >= 80 ? "pos" : account.healthScore >= 65 ? "info" : "warn" },
      body: (
        <ul className="space-y-2 text-ink-2">
          <li><b className="text-ink">Segment</b> — {account.segment}, {arrLabel} ARR, {account.industry} — {account.healthScore >= 80 ? "matches our top win cluster" : "within our supported profile"}.</li>
          <li><b className="text-ink">Stakeholder coverage</b> — {account.stakeholders.length} stakeholders mapped across {[...new Set(account.stakeholders.map(s => s.department).filter(Boolean))].length} departments.</li>
          <li><b className="text-ink">Buying motion</b> — {champion ? "Champion-led" : "Multi-threaded"} ({account.stakeholders.filter(s => s.role === "Decision Maker").length} decision-makers identified).</li>
        </ul>
      ),
    },
    {
      id: "exec",
      title: "Executive & Org Changes",
      badge: champion?.title.includes("just promoted") ? { label: "Yes", tone: "pos" } : undefined,
      body: (
        <ul className="space-y-2 text-ink-2">
          {champion && (
            <li><b className="text-ink">{champion.title.includes("VP") || champion.title.includes("Chief") ? champion.title : "Champion"}</b> — {champion.name}{champion.title.includes("just promoted") ? ", just promoted" : ", actively engaged"}.</li>
          )}
          {cfo && <li><b className="text-ink">CFO</b> — {cfo.name}, {cfo.daysSilent <= 7 ? "engaged" : `silent ${cfo.daysSilent}d`}.</li>}
          {infosec && <li><b className="text-ink">{infosec.title}</b> — {infosec.name}, {infosec.daysSilent <= 7 ? "engaged" : `silent ${infosec.daysSilent}d`}.</li>}
          {product && <li><b className="text-ink">{product.title}</b> — {product.name}.</li>}
          {!champion && !cfo && !infosec && !product && (
            <li className="text-muted">No recent executive movements detected.</li>
          )}
        </ul>
      ),
    },
    {
      id: "industry",
      title: "Industry & Business Context",
      body: (
        <>
          <p className="text-ink-2 mb-2">{account.segment} {account.industry} ({arrLabel} ARR) — {account.employees.toLocaleString()} employees, headquartered in {account.hq || "—"}.</p>
          <ul className="space-y-2 text-ink-2 list-disc list-inside">
            <li>Net Revenue Retention <b className="text-ink">{account.nrr}%</b>{account.nrr >= 110 ? " — top-quartile expansion behaviour" : account.nrr >= 100 ? " — healthy retention" : " — retention pressure"}.</li>
            <li>Health score <b className="text-ink">{account.healthScore}/100</b>{account.healthScore >= 80 ? " — green" : account.healthScore >= 60 ? " — watch" : " — at risk"}.</li>
            <li>Last QBR <b className="text-ink">{account.lastQbrDays}d</b> ago{account.lastQbrDays >= 90 ? " — overdue" : ""}.</li>
          </ul>
        </>
      ),
    },
  ];
  const right: ResearchCard[] = [
    {
      id: "competitive",
      title: "Competitive Positioning",
      badge: account.signals.some((s) => s.category === "Competitive") || !isCustomer ? { label: "Active Evaluation", tone: "info" } : { label: "Locked in", tone: "pos" },
      body: (
        <ul className="space-y-2 text-ink-2">
          {account.signals.filter((s) => s.tone === "neg" || s.category === "Competitive").slice(0, 3).map((s) => (
            <li key={s.id}>{s.body}</li>
          ))}
          {!account.signals.some((s) => s.category === "Competitive") && (
            <>
              <li>No active competitor displacement signals in the last 90 days.</li>
              <li>Bundle commercials structured to lock the contract before the next renewal cycle.</li>
            </>
          )}
        </ul>
      ),
    },
    {
      id: "news",
      title: "Recent News & Trigger Events",
      body: (
        <ul className="space-y-2 text-ink-2 list-disc list-inside">
          {account.signals.slice(0, 4).map((s) => (
            <li key={s.id}>{s.body} <span className="text-muted-2">· {s.ago}</span></li>
          ))}
          {account.signals.length === 0 && <li className="text-muted">No recent triggers ingested.</li>}
        </ul>
      ),
    },
    {
      id: "cases",
      title: "Relevant Case Studies",
      body: (
        <ul className="space-y-3 text-ink-2">
          <li><b className="text-ink">Datadog</b> — 3.2× pipeline visibility lift after deploying combined Networking + Security in a {account.segment} footprint comparable to {account.name}.</li>
          <li><b className="text-ink">MongoDB</b> — 47% faster handoff with the same buying motion ({champion ? "champion-led" : "multi-threaded"}).</li>
          <li><b className="text-ink">Snowflake</b> — identified $14M in misallocated spend within 60 days of activation — directly relevant given NRR {account.nrr}%.</li>
        </ul>
      ),
    },
    {
      id: "stack",
      title: "Stakeholder Risks & Detractors",
      body: (
        <ul className="space-y-2 text-ink-2 list-disc list-inside">
          {detractor && <li><b className="text-ink">{detractor.name}</b> ({detractor.title}) — flagged detractor, silent {detractor.daysSilent}d. Coffee-chat opener recommended before next steering.</li>}
          {account.stakeholders.filter((s) => s.daysSilent >= 14).slice(0, 3).map((s) => (
            <li key={s.name}><b className="text-ink">{s.name}</b> ({s.title}) — {s.daysSilent} days silent. Inactivity decay risk.</li>
          ))}
          {account.stakeholders.filter((s) => s.daysSilent >= 14).length === 0 && !detractor && (
            <li className="text-muted">No stakeholder decay signals in the last 14 days.</li>
          )}
        </ul>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className={sectionTitleClass + " mt-1"}>Research</div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-6 space-y-4">
          {left.map((c) => <Accordion key={c.id} card={c} defaultOpen={c.id === "win"} />)}
        </div>
        <div className="col-span-12 lg:col-span-6 space-y-4">
          {right.map((c) => <Accordion key={c.id} card={c} defaultOpen={c.id === "competitive" || c.id === "news"} />)}
        </div>
      </div>
    </div>
  );
}

function Accordion({ card, defaultOpen }: { card: ResearchCard; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const tone = card.badge?.tone;
  const badgeStyle = tone === "info"
    ? { background: "rgba(38,109,240,0.10)", color: "var(--accent)", border: "1px solid rgba(38,109,240,0.20)" }
    : tone === "pos"
      ? { background: "rgba(34,197,94,0.10)", color: "#16A34A", border: "1px solid rgba(34,197,94,0.20)" }
      : { background: "rgba(245,158,11,0.10)", color: "#D97706", border: "1px solid rgba(245,158,11,0.20)" };
  return (
    <div className={cardClass}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-bg-deep/40 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <h4 className="text-[14px] font-semibold text-ink truncate" style={{ letterSpacing: "-0.012em" }}>{card.title}</h4>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {card.badge && (
            <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md" style={badgeStyle}>{card.badge.label}</span>
          )}
          {open ? <ChevronUp size={14} strokeWidth={1.8} className="text-muted-2" /> : <ChevronDown size={14} strokeWidth={1.8} className="text-muted-2" />}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 text-[13px] leading-relaxed border-t border-line">
          {card.body}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// JOURNEY PANEL — multi-identity touchpoint timeline
// ═════════════════════════════════════════════════════════════════════════════
type Touchpoint = {
  id: string;
  identity: string;            // column key
  identityLabel: string;       // header label
  monthLabel: string;
  dayLabel: string;            // "Apr 28"
  kind: "linkedin" | "salesforce" | "website" | "twitter" | "reddit" | "sales-email" | "marketing-automation" | "call";
  label: string;               // primary text
  meta?: string;               // secondary
  badge?: string;              // e.g. "+1"
  amount?: number;
  /** Rich hover details */
  detail?: string;
  /** Channel attribution */
  source?: string;
};

function buildTouchpoints(account: AccountDetail): Touchpoint[] {
  void account;
  const domain = account.domain;
  const champion = account.stakeholders.find((s) => s.role === "Champion");
  const championEmail = champion ? `${champion.name.toLowerCase().split(" ")[0]}@${domain}` : `dave@${domain}`;
  return [
    { id: "1",  identity: "anon",   identityLabel: "anonymous",        monthLabel: "May 2026",   dayLabel: "May 07", kind: "website",   label: "Website",      meta: "twitter",      badge: "+1",
      detail: "Pricing page · 4 visits in 18 minutes from a Cloudflare-mapped IP. Referrer: Twitter ad campaign Q2-NA-002.", source: "Paid Social" },
    { id: "2",  identity: "domain", identityLabel: domain,             monthLabel: "April 2026", dayLabel: "Apr 28", kind: "linkedin",  label: "LinkedIn Ad Engagement",
      detail: "9 unique impressions, 3 clicks on the \"Cross-funnel attribution at scale\" creative.", source: "Paid Social — LinkedIn Ads" },
    { id: "3",  identity: "domain", identityLabel: domain,             monthLabel: "April 2026", dayLabel: "Apr 24", kind: "salesforce",label: "Closed Won",    amount: 54_000,
      detail: "Networking SKU expansion, 12-month term. Owner: Brad Allen.", source: "Salesforce" },
    { id: "4",  identity: "anon",   identityLabel: "anonymous",        monthLabel: "April 2026", dayLabel: "Apr 19", kind: "website",   label: "Website",      meta: "twitter",
      detail: "Security & compliance section · 2 page reads (avg 3:14). Likely InfoSec evaluator.", source: "Display Advertising" },
    { id: "5",  identity: "domain", identityLabel: domain,             monthLabel: "April 2026", dayLabel: "Apr 12", kind: "salesforce",label: "Proposal Stage",
      detail: "Stage moved Discovery → Proposal by Brad Allen. MEDDPICC 6/8 complete.", source: "Salesforce" },
    { id: "6",  identity: "anon",   identityLabel: "anonymous",        monthLabel: "April 2026", dayLabel: "Apr 12", kind: "website",   label: "Website",      meta: "linkedin",
      detail: "Executive overview + ROI calculator. Session inferred to be a leadership-mapped IP block.", source: "Paid Social" },
    { id: "7",  identity: "anon",   identityLabel: "anonymous",        monthLabel: "April 2026", dayLabel: "Apr 11", kind: "reddit",    label: "Website",      meta: "reddit",
      detail: "Inbound from r/sales — \"alphard vs 6sense\" thread. 1 visit, exited from comparison page.", source: "Organic Social" },
    { id: "8",  identity: "champ",  identityLabel: championEmail,      monthLabel: "April 2026", dayLabel: "Apr 08", kind: "sales-email", label: "Sales Email",
      detail: "Sent ROI calculator + Datadog case study. Open count 4, no reply.", source: "Outbound" },
    { id: "9",  identity: "anon",   identityLabel: "anonymous",        monthLabel: "March 2026", dayLabel: "Mar 31", kind: "website",   label: "Website",      meta: "linkedin",
      detail: "Pricing FAQ · 1 visit, 2:08. Likely procurement.", source: "Paid Social — LinkedIn Ads" },
    { id: "10", identity: "domain", identityLabel: domain,             monthLabel: "March 2026", dayLabel: "Mar 29", kind: "linkedin",  label: "LinkedIn Ad Engagement",
      detail: "InMail from Maya's recruiter network — 2 sponsored impressions.", source: "Paid Social — LinkedIn Ads" },
    { id: "11", identity: "champ",  identityLabel: championEmail,      monthLabel: "March 2026", dayLabel: "Mar 25", kind: "salesforce",label: "SQL",
      detail: "Lead converted to Sales Qualified by SDR Jamie Park.", source: "Salesforce" },
    { id: "12", identity: "champ",  identityLabel: championEmail,      monthLabel: "March 2026", dayLabel: "Mar 23", kind: "call",      label: "Call",         meta: "Let's talk!",
      detail: "32-min discovery call. Sentiment: positive. Next step: send security packet.", source: "Direct" },
    { id: "13", identity: "champ",  identityLabel: championEmail,      monthLabel: "March 2026", dayLabel: "Mar 22", kind: "marketing-automation", label: "Marketing Automation",
      detail: "Enrolled in Adoption Re-engagement nurture, day 0.", source: "Marketo" },
    // Add older history for richer scrolling
    { id: "14", identity: "domain", identityLabel: domain,             monthLabel: "February 2026", dayLabel: "Feb 26", kind: "linkedin", label: "LinkedIn Ad Engagement",
      detail: "First brand impression — \"Stop guessing your funnel\" creative.", source: "Paid Social — LinkedIn Ads" },
    { id: "15", identity: "anon",   identityLabel: "anonymous",        monthLabel: "February 2026", dayLabel: "Feb 18", kind: "website", label: "Website", meta: "linkedin",
      detail: "Solutions overview · 1 visit, 1:42.", source: "Paid Search" },
    { id: "16", identity: "champ",  identityLabel: championEmail,      monthLabel: "February 2026", dayLabel: "Feb 14", kind: "sales-email", label: "Sales Email",
      detail: "Cold outreach — opened twice, no reply.", source: "Outbound" },
    { id: "17", identity: "anon",   identityLabel: "anonymous",        monthLabel: "January 2026", dayLabel: "Jan 30", kind: "twitter", label: "Twitter", meta: "twitter",
      detail: "Brand impression from Q1 Twitter campaign.", source: "Paid Social" },
    { id: "18", identity: "domain", identityLabel: domain,             monthLabel: "January 2026", dayLabel: "Jan 22", kind: "website", label: "Website", meta: "twitter",
      detail: "Blog: \"Cross-funnel attribution for revops\" · referred by Twitter.", source: "Paid Social" },
  ];
}

function JourneyPanel({ account }: { account: AccountDetail }) {
  const tps = useMemo(() => buildTouchpoints(account), [account]);
  const [merge, setMerge] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const allKinds: Touchpoint["kind"][] = ["linkedin", "salesforce", "website", "twitter", "reddit", "sales-email", "marketing-automation", "call"];
  const [enabled, setEnabled] = useState<Set<Touchpoint["kind"]>>(new Set(allKinds));
  void account;

  const filteredTps = useMemo(() => {
    const base = tps.filter((t) => enabled.has(t.kind));
    if (!merge) return base;
    // Merge anonymous touchpoints into the company-domain column so the
    // timeline reads as "the account" instead of "the account + ghosts".
    return base.map((t) =>
      t.identity === "anon"
        ? { ...t, identity: "domain", identityLabel: tps.find((x) => x.identity === "domain")?.identityLabel ?? t.identityLabel }
        : t,
    );
  }, [tps, enabled, merge]);

  // Identities = unique columns
  const identityOrder = ["domain", "anon", "champ"];
  const identities = identityOrder.filter((k) => filteredTps.some((t) => t.identity === k));
  const labelFor = (k: string) => filteredTps.find((t) => t.identity === k)?.identityLabel ?? k;

  // Group by month → identity
  const months = useMemo(() => {
    const seen = new Set<string>();
    const order: string[] = [];
    filteredTps.forEach((t) => { if (!seen.has(t.monthLabel)) { seen.add(t.monthLabel); order.push(t.monthLabel); } });
    return order;
  }, [filteredTps]);

  const allOn = enabled.size === allKinds.length;
  const toggleKind = (k: Touchpoint["kind"]) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Description */}
      <PanelIntro
        Icon={Compass}
        title="Account journey timeline"
        body="Every touchpoint across the buying committee — from anonymous web visits to calls and emails — stitched together over time. Click the touchpoint filter to slice by channel; hover any pill for the full evidence chain. Toggle Merge Anonymous Users to fold ghost visitors into the company column." />

      {/* Filter row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 relative">
          <span className="text-[12px] text-muted">Touchpoint Filter</span>
          <button onClick={() => setFilterOpen(!filterOpen)}
            className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg border border-line bg-surface hover:bg-bg-deep transition-colors">
            {allOn ? "All touchpoints" : `${enabled.size} of ${allKinds.length} touchpoints`}
            <ChevronDown size={12} strokeWidth={1.7} className="text-muted-2" />
          </button>
          {filterOpen && (
            <div className="absolute left-[140px] top-full mt-1 z-20 min-w-[220px] rounded-lg border border-line bg-surface shadow-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-line">
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-2">Filter</span>
                <button onClick={() => setEnabled(allOn ? new Set() : new Set(allKinds))}
                  className="text-[11px] font-medium text-muted hover:text-ink">
                  {allOn ? "Clear" : "Select all"}
                </button>
              </div>
              {allKinds.map((k) => {
                const meta = TP_META[k];
                const on = enabled.has(k);
                return (
                  <button key={k} onClick={() => toggleKind(k)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] hover:bg-bg-deep transition-colors text-left">
                    <span className="w-3.5 h-3.5 rounded grid place-items-center border"
                      style={{ background: on ? "var(--ink)" : "transparent", borderColor: on ? "var(--ink)" : "var(--line)" }}>
                      {on && <CheckCircle2 size={10} strokeWidth={2.6} color="white" />}
                    </span>
                    <meta.Icon size={12} strokeWidth={1.8} style={{ color: meta.color }} />
                    <span className="text-ink-2 capitalize">{k.replace("-", " ")}</span>
                  </button>
                );
              })}
            </div>
          )}
          {!allOn && (
            <button onClick={() => setEnabled(new Set(allKinds))}
              className="text-[11px] font-medium text-muted hover:text-ink underline decoration-dotted underline-offset-2">
              Reset
            </button>
          )}
        </div>
        <label className="flex items-center gap-2 text-[12px] text-ink cursor-pointer">
          <span>Merge Anonymous Users</span>
          <button onClick={() => setMerge(!merge)}
            className="relative w-9 h-5 rounded-full transition-colors"
            style={{ background: merge ? "var(--ink)" : "var(--line)" }}>
            <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
              style={{ transform: merge ? "translateX(16px)" : "translateX(0)" }} />
          </button>
        </label>
      </div>

      {/* Timeline */}
      <div className={`${cardClass} overflow-hidden`}>
        {identities.length === 0 ? (
          <div className="px-5 py-12 text-center text-[12.5px] text-muted">No touchpoints match the selected filters.</div>
        ) : (
          <>
        <div className="grid border-b border-line bg-bg-deep/40"
          style={{ gridTemplateColumns: `120px repeat(${identities.length}, minmax(0,1fr))` }}>
          <div />
          {identities.map((id) => (
            <div key={id} className="px-4 py-3 text-[13px] font-semibold text-ink text-center border-l border-line">
              {labelFor(id)}
            </div>
          ))}
        </div>
        {months.map((m) => {
          const inMonth = filteredTps.filter((t) => t.monthLabel === m);
          return (
            <div key={m} className="grid border-b border-line"
              style={{ gridTemplateColumns: `120px repeat(${identities.length}, minmax(0,1fr))` }}>
              <div className="px-4 py-6 text-[13px] font-semibold text-ink-2">{m}</div>
              {identities.map((id) => {
                const cell = inMonth.filter((t) => t.identity === id);
                return (
                  <div key={id} className="border-l border-line px-3 py-3 space-y-2.5 min-h-[120px]">
                    {cell.map((t) => <TouchpointPill key={t.id} t={t} />)}
                  </div>
                );
              })}
            </div>
          );
        })}
        </>)}
      </div>

      {/* Channel attribution roll-up */}
      <div className={`${cardClass} p-5`}>
        <div className="flex items-center gap-2 mb-3">
          <h4 className="text-[13.5px] font-semibold text-ink">Channels</h4>
          <span className="text-[11px] text-muted">Total Touchpoints: 87 (5 types)</span>
        </div>
        <div className="flex h-7 rounded-md overflow-hidden border border-line">
          {[
            { label: "Paid Social — LinkedIn Ads", pct: 36.8, color: "#5DC3B3" },
            { label: "Display Advertising",        pct: 29.9, color: "#7AB8E5" },
            { label: "Paid Search",                pct: 27.6, color: "#C77B8C" },
            { label: "Organic Search",             pct: 3.4,  color: "#E5C76B" },
            { label: "Organic Social",             pct: 2.3,  color: "#E5856B" },
          ].map((s) => (
            <div key={s.label} className="grid place-items-center text-[10px] font-semibold text-white"
              style={{ width: `${s.pct}%`, background: s.color }}>
              {s.pct >= 8 ? `${s.pct}%` : ""}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-3 text-[11px] text-muted">
          {[
            { l: "Paid Social — LinkedIn Ads", c: "#5DC3B3" },
            { l: "Display Advertising",        c: "#7AB8E5" },
            { l: "Paid Search",                c: "#C77B8C" },
            { l: "Organic Search",             c: "#E5C76B" },
            { l: "Organic Social",             c: "#E5856B" },
          ].map((s) => (
            <span key={s.l} className="inline-flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: s.c }} />
              {s.l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function TouchpointPill({ t }: { t: Touchpoint }) {
  const { Icon, color } = TP_META[t.kind];
  const [hover, setHover] = useState(false);
  return (
    <div className="flex items-center gap-2 text-[12px] relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}>
      <span className="text-[10.5px] text-muted-2 tnum w-12 flex-shrink-0">{t.dayLabel.replace(/^[A-Z][a-z]+ /, "")}</span>
      <div className={`flex-1 inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-line bg-surface transition-all cursor-default`}
        style={{ borderColor: hover ? "var(--ink)" : undefined, transform: hover ? "translateY(-1px)" : undefined }}>
        <Icon size={12} strokeWidth={1.8} style={{ color }} />
        <span className="text-ink truncate">{t.label}</span>
        {t.amount !== undefined && (
          <span className="ml-auto font-mono tnum text-[11px] text-ink">{fmtMoney(t.amount)}</span>
        )}
        {t.meta && (
          <span className="ml-auto inline-flex items-center gap-1">
            {t.meta === "twitter"  && <Twitter size={10} className="text-muted" />}
            {t.meta === "linkedin" && <Linkedin size={10} className="text-muted" />}
            {t.meta === "reddit"   && <MessageSquare size={10} className="text-muted" />}
            {!["twitter","linkedin","reddit"].includes(t.meta) && (
              <span className="text-[10.5px] text-muted truncate">{t.meta}</span>
            )}
          </span>
        )}
        {t.badge && <span className="ml-1 text-[10px] text-muted-2 font-mono">{t.badge}</span>}
      </div>
      {hover && t.detail && (
        <div className="absolute left-12 top-full mt-1 z-30 w-72 rounded-lg border border-line bg-surface shadow-xl p-3 pointer-events-none"
          style={{ boxShadow: "0 12px 32px -12px rgba(15,18,24,0.45)" }}>
          <div className="flex items-center gap-2 mb-1.5">
            <Icon size={11} strokeWidth={2} style={{ color }} />
            <span className="text-[12px] font-semibold text-ink">{t.label}</span>
            <span className="ml-auto text-[10px] font-mono text-muted-2">{t.dayLabel}</span>
          </div>
          <div className="text-[11.5px] text-ink-2 leading-relaxed mb-2">{t.detail}</div>
          {t.source && (
            <div className="text-[10px] uppercase tracking-[0.14em] font-semibold text-muted-2">
              Channel · <span className="text-muted normal-case tracking-normal font-medium">{t.source}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const TP_META: Record<Touchpoint["kind"], { Icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties; className?: string }>; color: string }> = {
  linkedin:              { Icon: Linkedin,        color: "#0A66C2" },
  salesforce:            { Icon: ShieldAlert,     color: "#00A1E0" },
  website:               { Icon: Activity,        color: "#6B7280" },
  twitter:               { Icon: Twitter,         color: "#1DA1F2" },
  reddit:                { Icon: MessageSquare,   color: "#FF4500" },
  "sales-email":         { Icon: Mail,            color: "#3B82F6" },
  "marketing-automation":{ Icon: Zap,             color: "#F59E0B" },
  call:                  { Icon: MessageSquare,   color: "#10B981" },
};

// ═════════════════════════════════════════════════════════════════════════════
// PEOPLE PANEL — list + filters + detractor/attractor + org chart toggle
// ═════════════════════════════════════════════════════════════════════════════
type Engagement = "On Fire" | "Hot" | "Warm" | "Cool" | "Cold";

// Derive a synthetic engagement + attractor/detractor score from the existing
// stakeholder fields. Lower daysSilent + supportive sentiment → higher engagement.
function engagementFor(s: Stakeholder): Engagement {
  if (s.role === "Detractor")        return "Cold";
  if (s.daysSilent === 0)            return "On Fire";
  if (s.daysSilent <= 2)             return "Hot";
  if (s.daysSilent <= 7)             return "Warm";
  if (s.daysSilent <= 21)            return "Cool";
  return "Cold";
}

function attractorScore(s: Stakeholder): number {
  // -100 (strong detractor) … +100 (strong attractor)
  let score = 0;
  if (s.sentiment === "supportive") score += 60;
  if (s.sentiment === "neutral")    score += 0;
  if (s.sentiment === "negative")   score -= 60;
  if (s.role === "Champion")        score += 30;
  if (s.role === "Decision Maker")  score += 10;
  if (s.role === "Detractor")       score -= 50;
  if (s.daysSilent <= 2)            score += 10;
  if (s.daysSilent >= 21)           score -= 20;
  return Math.max(-100, Math.min(100, score));
}

function PeoplePanel({ stakeholders }: { stakeholders: Stakeholder[] }) {
  const [view, setView] = useState<"list" | "org">("list");
  void Compass;
  const [search, setSearch] = useState("");
  const [persona, setPersona] = useState<"any" | "decision-maker" | "champion" | "evaluator" | "user">("any");
  const [department, setDepartment] = useState<"any" | NonNullable<Stakeholder["department"]>>("any");
  const [engagement, setEngagement] = useState<"any" | Engagement>("any");
  const [stance, setStance] = useState<"any" | "attractor" | "detractor" | "neutral">("any");

  const personaMatches = (s: Stakeholder) => {
    if (persona === "any") return true;
    if (persona === "decision-maker") return s.role === "Decision Maker";
    if (persona === "champion") return s.role === "Champion";
    if (persona === "evaluator") return s.role === "Influencer" || s.role === "User";
    if (persona === "user") return s.role === "User";
    return true;
  };

  const filtered = stakeholders.filter((s) => {
    if (!personaMatches(s)) return false;
    if (department !== "any" && s.department !== department) return false;
    if (engagement !== "any" && engagementFor(s) !== engagement) return false;
    const sc = attractorScore(s);
    if (stance === "attractor" && sc < 30) return false;
    if (stance === "detractor" && sc > -10) return false;
    if (stance === "neutral"   && Math.abs(sc) > 30) return false;
    if (search && !(s.name + s.title).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <PanelIntro
        Icon={Users}
        title="Buying committee · stakeholders"
        body="Every contact mapped across the account, with engagement temperature, attractor/detractor stance, and champion crowns. Switch to Org Chart to see reporting structure grouped by team. Use the filters to find a specific role, department, or stance — and click any person to open their Relationship Hub." />

      {/* Header bar */}
      <div className={`${cardClass} p-4`}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Users size={14} strokeWidth={1.7} className="text-muted" />
            <h3 className="text-[15px] font-semibold text-ink" style={{ letterSpacing: "-0.014em" }}>People</h3>
            <span className="text-[11px] font-mono tnum text-muted">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-line p-0.5 bg-bg-deep">
              <button onClick={() => setView("list")}
                className="inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2.5 py-1 rounded-md transition-colors"
                style={{ background: view === "list" ? "var(--surface)" : "transparent", color: view === "list" ? "var(--ink)" : "var(--muted)" }}>
                <List size={11} strokeWidth={1.8} /> List
              </button>
              <button onClick={() => setView("org")}
                className="inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2.5 py-1 rounded-md transition-colors"
                style={{ background: view === "org" ? "var(--surface)" : "transparent", color: view === "org" ? "var(--ink)" : "var(--muted)" }}>
                <Network size={11} strokeWidth={1.8} /> Org Chart
              </button>
            </div>
            <div className="relative">
              <Search size={11} strokeWidth={1.8} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, title…"
                className="text-[12px] bg-bg-deep border border-line rounded-lg pl-7 pr-3 py-1.5 w-56 focus:outline-none focus:border-ink/30" />
            </div>
          </div>
        </div>
        {/* filter row */}
        <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-line">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mr-1">Filters</span>
          <FilterPill label="Personas" value={persona} options={[
            { v: "any", l: "Any" }, { v: "decision-maker", l: "Decision Maker" },
            { v: "champion", l: "Champion" }, { v: "evaluator", l: "Evaluator" }, { v: "user", l: "User" },
          ]} onChange={(v) => setPersona(v as typeof persona)} />
          <FilterPill label="Department" value={department} options={[
            { v: "any", l: "Any" },
            ...["Executive","Engineering","Finance","Operations","Product","Sales","Other"].map((d) => ({ v: d, l: d })),
          ]} onChange={(v) => setDepartment(v as typeof department)} />
          <FilterPill label="Engagement" value={engagement} options={[
            { v: "any", l: "Any" }, { v: "On Fire", l: "On Fire" }, { v: "Hot", l: "Hot" }, { v: "Warm", l: "Warm" }, { v: "Cool", l: "Cool" }, { v: "Cold", l: "Cold" },
          ]} onChange={(v) => setEngagement(v as typeof engagement)} />
          <FilterPill label="Stance" value={stance} options={[
            { v: "any", l: "Any" }, { v: "attractor", l: "Attractors" }, { v: "neutral", l: "Neutral" }, { v: "detractor", l: "Detractors" },
          ]} onChange={(v) => setStance(v as typeof stance)} icon={<Filter size={10} strokeWidth={1.8} />} />
        </div>
      </div>

      {view === "list"
        ? <PeopleList rows={filtered} />
        : <OrgChartView rows={filtered.length ? filtered : stakeholders} />}
    </div>
  );
}

function FilterPill<V extends string>({
  label, value, options, onChange, icon,
}: { label: string; value: V; options: { v: V; l: string }[]; onChange: (v: V) => void; icon?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const display = options.find((o) => o.v === value)?.l ?? "Any";
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2.5 py-1.5 rounded-lg border border-line bg-bg-deep hover:bg-surface transition-colors">
        {icon}
        <span className="text-muted">{label}:</span>
        <span className="text-ink">{display}</span>
        <ChevronDown size={10} strokeWidth={1.8} className="text-muted-2" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-20 min-w-[140px] rounded-lg border border-line bg-surface shadow-lg overflow-hidden">
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

function PeopleList({ rows }: { rows: Stakeholder[] }) {
  // Sort by attractor score descending so champions land on top
  const sorted = [...rows].sort((a, b) => attractorScore(b) - attractorScore(a));
  return (
    <div className={`${cardClass} overflow-hidden`}>
      <div className="grid grid-cols-12 gap-3 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 border-b border-line">
        <div className="col-span-5">Person</div>
        <div className="col-span-2">Stance</div>
        <div className="col-span-2">Engagement</div>
        <div className="col-span-3 text-right">Email</div>
      </div>
      {sorted.map((s) => <PeopleRow key={s.name} s={s} />)}
      {sorted.length === 0 && (
        <div className="px-5 py-8 text-center text-[12.5px] text-muted">No people match those filters.</div>
      )}
    </div>
  );
}

function PeopleRow({ s }: { s: Stakeholder }) {
  const eng = engagementFor(s);
  const score = attractorScore(s);
  const stanceTone =
    score >= 30 ? { label: "Attractor", color: "#16A34A", bg: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.20)", icon: <ThumbsUp size={9} strokeWidth={2.2} /> } :
    score <= -10 ? { label: "Detractor", color: "#EF4444", bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.20)", icon: <ThumbsDown size={9} strokeWidth={2.2} /> } :
    { label: "Neutral", color: "#6B7280", bg: "rgba(107,114,128,0.10)", border: "rgba(107,114,128,0.20)", icon: <Circle size={8} strokeWidth={2.2} /> };

  const engTone =
    eng === "On Fire" ? { color: "#EF4444", icon: <Flame size={9} strokeWidth={2.2} /> } :
    eng === "Hot"     ? { color: "#F59E0B", icon: <Flame size={9} strokeWidth={2.2} /> } :
    eng === "Warm"    ? { color: "#D97706", icon: <Activity size={9} strokeWidth={2.2} /> } :
    eng === "Cool"    ? { color: "#6B7280", icon: <Activity size={9} strokeWidth={2.2} /> } :
    /*Cold*/            { color: "#94A3B8", icon: <Circle size={8} strokeWidth={2.2} /> };

  // Recency badges
  const recency =
    s.daysSilent === 0 ? { label: "Active today", color: "#16A34A" } :
    s.daysSilent >= 30 ? { label: `${s.daysSilent}d silent`, color: "#EF4444" } : null;

  const email = `${s.name.toLowerCase().replace(/\s+/g, ".")}@${"abbott.com"}`;
  return (
    <div className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center border-b border-line last:border-b-0 hover:bg-bg-deep/40 transition-colors">
      <div className="col-span-5 flex items-center gap-3 min-w-0">
        <PersonAvatar name={s.name} size={28} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[13px] font-semibold text-ink truncate">{s.name}</span>
            {s.role === "Champion" && (
              <span className="inline-flex items-center gap-0.5 text-[9.5px] font-semibold uppercase px-1.5 py-0.5 rounded"
                style={{ background: "rgba(168,85,247,0.10)", color: "#9333EA", border: "1px solid rgba(168,85,247,0.20)" }}>
                <Crown size={8} strokeWidth={2.2} /> Champion
              </span>
            )}
            {recency && (
              <span className="text-[9.5px] font-semibold uppercase px-1.5 py-0.5 rounded"
                style={{ color: recency.color, border: `1px solid ${recency.color}33`, background: `${recency.color}10` }}>
                {recency.label}
              </span>
            )}
          </div>
          <div className="text-[11.5px] text-muted truncate">{s.title}{s.role === "Decision Maker" && " · Decision Maker"}{s.role === "Influencer" && " · Influencer"}</div>
        </div>
      </div>
      <div className="col-span-2">
        <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold px-2 py-0.5 rounded-md"
          style={{ background: stanceTone.bg, color: stanceTone.color, border: `1px solid ${stanceTone.border}` }}>
          {stanceTone.icon} {stanceTone.label}
        </span>
      </div>
      <div className="col-span-2">
        <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold" style={{ color: engTone.color }}>
          {engTone.icon} {eng}
        </span>
      </div>
      <div className="col-span-3 flex items-center justify-end gap-2 min-w-0">
        <span className="text-[12px] text-muted truncate">{email}</span>
        <a href={`https://www.linkedin.com/in/${s.name.toLowerCase().replace(/\s+/g, "-")}`} target="_blank" rel="noreferrer"
          className="text-muted hover:text-ink transition-colors">
          <Linkedin size={12} strokeWidth={1.8} />
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Org Chart — DemandFarm-class features:
//   · Click any node → opens a Relationship Hub side panel with full context
//   · Buying-Committee filter (highlight only the people in the active deal)
//   · Coverage-gap mode (pulse stale stakeholders)
//   · C-Suite engagement KPI tile
//   · White-space detection (missing ICP roles surfaced in the toolbar)
//   · Lateral influence badges (informal "↗ name" links beyond reports-to)
//   · AI "suggest next contact to add" — inline action
//
// Visual style intentionally preserved (cards in a tree).
// ─────────────────────────────────────────────────────────────────────

// Mock data — could later come from real CRM enrichment.
// Lateral / influence relationships beyond direct reports.
const INFLUENCE: Record<string, string[]> = {
  "Maya Chen":      ["Anders Holm", "Owen Mitchell"],
  "Naomi Walker":   ["Owen Mitchell"],
  "Anders Holm":    ["Maya Chen"],
  "Priya Sharma":   ["Naomi Walker"],
};

// Buying committee for the active expansion deal.
const BUYING_COMMITTEE = new Set([
  "Maya Chen", "Ricardo Diaz", "Sandra Lewis", "Naomi Walker", "Priya Sharma", "Owen Mitchell",
]);

// Roles the ICP playbook says should exist in a buying committee (for white-space).
const ICP_ROLES = ["Head of Cloud", "Director of FP&A", "VP Marketing"];

function isCSuite(s: Stakeholder) { return /^(C[A-Z]O|CEO|CFO|CTO|CRO|CISO)\b/i.test(s.title); }

function OrgChartView({ rows }: { rows: Stakeholder[] }) {
  const toast = useToast();
  const [committeeOnly, setCommitteeOnly] = useState(false);
  const [decayOn, setDecayOn] = useState(true);
  const [selected, setSelected] = useState<Stakeholder | null>(null);
  const [groupByDept, setGroupByDept] = useState(true);

  // Filter rows down to buying committee if toggled
  const visible = committeeOnly ? rows.filter((s) => BUYING_COMMITTEE.has(s.name)) : rows;

  // Department display order — exec at top, sales/finance/ops, then engineering teams.
  const DEPT_ORDER: NonNullable<Stakeholder["department"]>[] = ["Executive", "Engineering", "Product", "Operations", "Sales", "Finance", "Other"];
  const byDept = (() => {
    const map = new Map<string, Stakeholder[]>();
    visible.forEach((s) => {
      const key = s.department ?? "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });
    // Sort each dept's rows: champions first, then decision makers, then influencers/users, detractors last
    const rolePriority: Record<Stakeholder["role"], number> = {
      "Champion": 0, "Decision Maker": 1, "Influencer": 2, "User": 3, "Detractor": 4,
    };
    map.forEach((list) => list.sort((a, b) => rolePriority[a.role] - rolePriority[b.role]));
    return DEPT_ORDER.map((d) => ({ dept: d, members: map.get(d) ?? [] })).filter((g) => g.members.length > 0);
  })();

  // Build adjacency: name → children (used for the hierarchical view)
  const byManager = new Map<string | undefined, Stakeholder[]>();
  visible.forEach((s) => {
    const key = s.reportsTo && visible.some((r) => r.name === s.reportsTo) ? s.reportsTo : undefined;
    if (!byManager.has(key)) byManager.set(key, []);
    byManager.get(key)!.push(s);
  });
  const roots = byManager.get(undefined) ?? [];

  // KPIs
  const csuite = rows.filter(isCSuite);
  const csuiteCovered = csuite.filter((s) => s.daysSilent <= 14).length;
  const decayed = rows.filter((s) => s.daysSilent >= 14);
  const detractors = rows.filter((s) => attractorScore(s) <= -10);

  // ── Suggest next contact — animated reveal (loading → result) ────────
  const [suggestState, setSuggestState] = useState<"idle" | "loading" | "done">("idle");
  // Pick a contextual suggestion based on the buying committee + ICP gaps
  const suggested = useMemo(() => {
    const present = new Set(rows.map((r) => r.name.toLowerCase()));
    const dept = ICP_ROLES.find((r) => !rows.some((s) => s.title.toLowerCase().includes(r.toLowerCase()))) ?? "Director of FP&A";
    // Try to anchor to an existing manager in the chart for the reportsTo
    const anchor = rows.find((s) => /VP|Chief|Director/i.test(s.title) && !present.has(s.name.toLowerCase().split(" ")[0])) ?? rows[0];
    return {
      name: dept === "Head of Cloud" ? "Connor Wells"
          : dept === "Director of FP&A" ? "Marcus Whittle"
          : "Helena Grossman",
      title: dept,
      reportsTo: anchor?.name ?? "leadership",
      department: dept.includes("FP&A") ? "Finance" : dept.includes("Cloud") ? "Engineering" : "Sales",
      why: "Auto-detected ICP gap. Confirmed via 4 of 5 prior wins where this role was a tie-breaker on commercial timing.",
      confidence: 92,
    };
  }, [rows]);

  const onSuggest = () => {
    if (suggestState === "loading") return;
    setSuggestState("loading");
    setTimeout(() => setSuggestState("done"), 1100);
  };
  const onAddSuggestion = () => {
    setSuggestState("idle");
    toast({ tone: "success", title: `Added · ${suggested.name}`, body: `${suggested.title} now in your buying committee. Drafting an intro request to ${suggested.reportsTo}.` });
  };
  const onDismissSuggestion = () => setSuggestState("idle");

  const onExport = () =>
    toast({ tone: "info", title: "Export queued", body: "Org chart will download as PNG in a moment." });

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className={`col-span-12 ${selected ? "lg:col-span-8" : "lg:col-span-12"} space-y-4`}>
        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiTile Icon={Crown}        label="C-Suite covered"   value={`${csuiteCovered}/${csuite.length}`} hint="last 14 days" tone={csuiteCovered === csuite.length ? "pos" : "warn"} />
          <KpiTile Icon={UserPlus}     label="White-space gaps"  value={String(ICP_ROLES.length)}            hint="missing ICP roles" tone="warn" />
          <KpiTile Icon={Briefcase}    label="Buying committee"  value={`${rows.filter((s) => BUYING_COMMITTEE.has(s.name)).length}`} hint={`of ${rows.length} mapped`} tone="ink" />
          <KpiTile Icon={Bell}         label="Decay alerts"      value={String(decayed.length)}              hint="silent ≥14d" tone={decayed.length > 0 ? "warn" : "neutral"} />
        </div>

        {/* Toolbar */}
        <div className={`${cardClass} p-3 flex items-center gap-2 flex-wrap`}>
          <div className="text-[11.5px] text-muted mr-1">View</div>
          <ToolbarToggle on={committeeOnly} onChange={setCommitteeOnly} icon={<Briefcase size={11} strokeWidth={1.8} />} label="Buying committee only" />
          <ToolbarToggle on={decayOn}     onChange={setDecayOn}     icon={<Clock     size={11} strokeWidth={1.8} />} label="Highlight decay" />
          <ToolbarToggle on={groupByDept} onChange={setGroupByDept} icon={<Layers    size={11} strokeWidth={1.8} />} label="Group by team" />
          <span className="flex-1" />
          <button onClick={onSuggest} disabled={suggestState === "loading"}
            className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1.5 rounded-lg text-white transition-transform hover:scale-[1.02] disabled:opacity-80 disabled:cursor-wait"
            style={{ background: "var(--accent)" }}>
            {suggestState === "loading" ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Searching org…
              </>
            ) : (
              <>
                <Wand2 size={11} strokeWidth={2.2} /> Suggest next contact
              </>
            )}
          </button>
          <button onClick={onExport}
            className="inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2.5 py-1.5 rounded-lg border border-line bg-bg-deep hover:bg-surface transition-colors">
            <ArrowUpRight size={11} strokeWidth={1.8} /> Export
          </button>
        </div>

        {/* Suggested contact card — appears after Suggest is clicked */}
        {(suggestState === "loading" || suggestState === "done") && (
          <div className={`${cardClass} p-4 suggest-pop`}
            style={{
              borderColor: "rgba(38,109,240,0.32)",
              background: "linear-gradient(135deg, rgba(38,109,240,0.05), rgba(124,58,237,0.04))",
            }}>
            {suggestState === "loading" ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full grid place-items-center flex-shrink-0"
                  style={{ background: "rgba(38,109,240,0.12)", border: "1px solid rgba(38,109,240,0.22)" }}>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-accent/30 rounded-full animate-spin"
                    style={{ borderTopColor: "var(--accent)" }} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-semibold text-ink">Scanning the org for your next-best contact…</div>
                  <div className="text-[11px] text-muted">Cross-referencing buying committee · ICP playbook · prior wins</div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <PersonAvatar name={suggested.name} size={42} />
                  <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-white"
                    style={{ background: "var(--accent)", boxShadow: "0 0 0 2px var(--bg)" }}>
                    <Wand2 size={9} strokeWidth={2.4} />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--accent)" }}>
                      Suggested addition · {suggested.confidence}% confidence
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[14px] font-bold text-ink">{suggested.name}</span>
                    <span className="text-[11px] text-muted">·</span>
                    <span className="text-[11.5px] text-ink-2">{suggested.title}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.10em] px-1.5 py-0.5 rounded ml-1"
                      style={{ background: "var(--bg-deep)", color: "var(--muted)" }}>{suggested.department}</span>
                  </div>
                  <div className="text-[11.5px] text-muted leading-snug mb-2">
                    <b className="text-ink-2">Reports to {suggested.reportsTo}.</b> {suggested.why}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={onAddSuggestion}
                      className="text-[11.5px] font-semibold px-3 py-1.5 rounded-lg text-white inline-flex items-center gap-1.5"
                      style={{ background: "var(--ink)" }}>
                      <UserPlus size={11} strokeWidth={2.2} /> Add to committee
                    </button>
                    <button onClick={onDismissSuggestion}
                      className="text-[11.5px] font-medium px-3 py-1.5 rounded-lg border border-line bg-bg-deep hover:bg-surface inline-flex items-center gap-1.5">
                      Dismiss
                    </button>
                    <button onClick={onSuggest}
                      className="text-[11.5px] font-medium text-muted hover:text-ink inline-flex items-center gap-1 ml-auto">
                      <Wand2 size={10} strokeWidth={2} /> Try again
                    </button>
                  </div>
                </div>
              </div>
            )}
            <style jsx>{`
              @keyframes suggestPop {
                from { opacity: 0; transform: translateY(-6px) scale(0.98); }
                to   { opacity: 1; transform: translateY(0) scale(1); }
              }
              .suggest-pop { animation: suggestPop 320ms cubic-bezier(0.22, 1, 0.36, 1); }
            `}</style>
          </div>
        )}

        {/* White-space callout */}
        {ICP_ROLES.length > 0 && (
          <div className={`${subCardClass} p-3 flex items-center gap-3`}>
            <div className="w-7 h-7 rounded-lg grid place-items-center flex-shrink-0"
              style={{ background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.22)" }}>
              <Wand2 size={12} strokeWidth={2} style={{ color: "#D97706" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-ink">White-space detection · {ICP_ROLES.length} missing ICP roles</div>
              <div className="text-[11px] text-muted truncate">
                {ICP_ROLES.map((r, i) => (
                  <span key={r}>
                    <button onClick={() => toast({ tone: "info", title: `Add ${r}`, body: `Search company directory for a ${r}.` })}
                      className="underline decoration-dotted underline-offset-2 hover:text-ink">{r}</button>
                    {i < ICP_ROLES.length - 1 ? "  ·  " : ""}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* The chart — team-grouped OR hierarchical */}
        <div className={`${cardClass} p-6 overflow-x-auto`}>
          {visible.length === 0 ? (
            <div className="text-center text-[12.5px] text-muted py-8">No people to chart with the current filters.</div>
          ) : groupByDept ? (
            <div className="space-y-6 min-w-fit">
              {byDept.map(({ dept, members }) => (
                <div key={dept}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">{dept}</span>
                    <span className="text-[10px] font-mono tnum text-muted-2">·</span>
                    <span className="text-[10px] font-mono tnum text-muted-2">{members.length}</span>
                    <div className="flex-1 h-px ml-2" style={{ background: "var(--line)" }} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {members.map((s) => (
                      <OrgFlatCard key={s.name}
                        node={s}
                        selected={selected}
                        onSelect={setSelected}
                        decayOn={decayOn} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : roots.length === 0 ? (
            <div className="text-center text-[12.5px] text-muted py-8">No reporting structure to chart with the current filters.</div>
          ) : (
            <div className="space-y-6 min-w-fit">
              {roots.map((r) => (
                <OrgNode key={r.name}
                  node={r}
                  byManager={byManager}
                  depth={0}
                  selected={selected}
                  onSelect={setSelected}
                  decayOn={decayOn} />
              ))}
            </div>
          )}
        </div>

        {/* Detractors callout */}
        {detractors.length > 0 && (
          <div className={`${subCardClass} p-3 flex items-center gap-3`}>
            <div className="w-7 h-7 rounded-lg grid place-items-center flex-shrink-0"
              style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.22)" }}>
              <ThumbsDown size={12} strokeWidth={2} style={{ color: "#EF4444" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-ink">Detractors flagged · {detractors.length}</div>
              <div className="text-[11px] text-muted truncate">
                {detractors.map((d) => `${d.name} (${d.title})`).join(" · ")}
              </div>
            </div>
            <button onClick={() => toast({ tone: "info", title: "Detractor playbook", body: "Drafts a coffee-chat opener tailored to each detractor's stated concerns." })}
              className="text-[11px] font-medium text-muted hover:text-ink underline decoration-dotted underline-offset-2">
              Run playbook
            </button>
          </div>
        )}
      </div>

      {/* Side panel — Relationship Hub */}
      {selected && (
        <div className="col-span-12 lg:col-span-4">
          <RelationshipHub stakeholder={selected} onClose={() => setSelected(null)} />
        </div>
      )}
    </div>
  );
}

function KpiTile({ Icon, label, value, hint, tone }: {
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
  label: string; value: string; hint: string; tone: "pos" | "warn" | "ink" | "neutral";
}) {
  const colour = tone === "pos" ? "#16A34A" : tone === "warn" ? "#D97706" : tone === "ink" ? "var(--ink)" : "var(--muted)";
  return (
    <div className={`${cardClass} p-3.5`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={11} strokeWidth={1.8} style={{ color: "var(--muted)" }} />
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">{label}</span>
      </div>
      <div className="text-[20px] font-bold tnum" style={{ color: colour, letterSpacing: "-0.018em" }}>{value}</div>
      <div className="text-[10.5px] text-muted-2 mt-0.5">{hint}</div>
    </div>
  );
}

function ToolbarToggle({ on, onChange, icon, label }: { on: boolean; onChange: (v: boolean) => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={() => onChange(!on)}
      className="inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2.5 py-1.5 rounded-lg border transition-colors"
      style={{
        background: on ? "var(--ink)" : "var(--bg-deep)",
        color: on ? "white" : "var(--muted)",
        borderColor: on ? "var(--ink)" : "var(--line)",
      }}>
      {icon}
      {label}
    </button>
  );
}

// Flat card variant for the team-grouped view — same node visuals,
// no parent/child connectors.
function OrgFlatCard({ node, selected, onSelect, decayOn }: {
  node: Stakeholder;
  selected: Stakeholder | null;
  onSelect: (s: Stakeholder) => void;
  decayOn: boolean;
}) {
  const score = attractorScore(node);
  const ringColour =
    score >= 30 ? "rgba(34,197,94,0.5)" :
    score <= -10 ? "rgba(239,68,68,0.5)" : "var(--line)";
  const isSelected = selected?.name === node.name;
  const isDecayed = decayOn && node.daysSilent >= 14;
  const inCommittee = BUYING_COMMITTEE.has(node.name);
  const influences = INFLUENCE[node.name] ?? [];
  return (
    <button onClick={() => onSelect(node)}
      className="rounded-xl px-4 py-3 bg-surface flex items-center gap-3 transition-all hover:scale-[1.02] text-left relative"
      style={{
        border: `${isSelected ? 2 : 1.5}px solid ${isSelected ? "var(--accent)" : ringColour}`,
        boxShadow: isSelected ? "0 0 0 4px rgba(38,109,240,0.10)" : undefined,
      }}>
      {isDecayed && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
          title={`Silent for ${node.daysSilent} days`}
          style={{ background: "#EF4444", boxShadow: "0 0 0 3px var(--bg)" }} />
      )}
      <PersonAvatar name={node.name} size={32} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[12.5px] font-semibold text-ink truncate">{node.name}</span>
          {node.role === "Champion" && <Crown size={10} className="text-purple-500" strokeWidth={2.2} />}
          {isCSuite(node) && (
            <span className="text-[8.5px] font-bold uppercase tracking-[0.12em] px-1 py-px rounded"
              style={{ background: "rgba(124,58,237,0.10)", color: "#7C3AED", border: "1px solid rgba(124,58,237,0.18)" }}>
              C-Suite
            </span>
          )}
          {inCommittee && (
            <span className="text-[8.5px] font-bold uppercase tracking-[0.12em] px-1 py-px rounded"
              style={{ background: "rgba(38,109,240,0.10)", color: "var(--accent)", border: "1px solid rgba(38,109,240,0.18)" }}>
              BC
            </span>
          )}
        </div>
        <div className="text-[10.5px] text-muted truncate">{node.title}</div>
        {influences.length > 0 && (
          <div className="text-[9.5px] text-muted-2 mt-0.5 truncate">
            ↗ influences {influences.join(", ")}
          </div>
        )}
      </div>
    </button>
  );
}

function OrgNode({ node, byManager, depth, selected, onSelect, decayOn }: {
  node: Stakeholder; byManager: Map<string | undefined, Stakeholder[]>; depth: number;
  selected: Stakeholder | null; onSelect: (s: Stakeholder) => void; decayOn: boolean;
}) {
  const children = byManager.get(node.name) ?? [];
  const score = attractorScore(node);
  const ringColour =
    score >= 30 ? "rgba(34,197,94,0.5)" :
    score <= -10 ? "rgba(239,68,68,0.5)" : "var(--line)";
  const isSelected = selected?.name === node.name;
  const isDecayed = decayOn && node.daysSilent >= 14;
  const inCommittee = BUYING_COMMITTEE.has(node.name);
  const influences = INFLUENCE[node.name] ?? [];

  return (
    <div className="flex flex-col items-center">
      <button onClick={() => onSelect(node)}
        className="rounded-xl px-4 py-3 bg-surface flex items-center gap-3 min-w-[240px] transition-all hover:scale-[1.02] text-left relative"
        style={{
          border: `${isSelected ? 2 : 1.5}px solid ${isSelected ? "var(--accent)" : ringColour}`,
          boxShadow: isSelected ? "0 0 0 4px rgba(38,109,240,0.10)" : undefined,
        }}>
        {isDecayed && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
            title={`Silent for ${node.daysSilent} days`}
            style={{ background: "#EF4444", boxShadow: "0 0 0 3px var(--bg)" }} />
        )}
        <PersonAvatar name={node.name} size={32} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[12.5px] font-semibold text-ink truncate">{node.name}</span>
            {node.role === "Champion" && <Crown size={10} className="text-purple-500" strokeWidth={2.2} />}
            {isCSuite(node) && (
              <span className="text-[8.5px] font-bold uppercase tracking-[0.12em] px-1 py-px rounded"
                style={{ background: "rgba(124,58,237,0.10)", color: "#7C3AED", border: "1px solid rgba(124,58,237,0.18)" }}>
                C-Suite
              </span>
            )}
            {inCommittee && (
              <span className="text-[8.5px] font-bold uppercase tracking-[0.12em] px-1 py-px rounded"
                style={{ background: "rgba(38,109,240,0.10)", color: "var(--accent)", border: "1px solid rgba(38,109,240,0.18)" }}>
                BC
              </span>
            )}
          </div>
          <div className="text-[10.5px] text-muted truncate">{node.title}</div>
          {influences.length > 0 && (
            <div className="text-[9.5px] text-muted-2 mt-0.5 truncate">
              ↗ influences {influences.join(", ")}
            </div>
          )}
        </div>
      </button>
      {children.length > 0 && (
        <>
          <div className="w-px h-5" style={{ background: "var(--line)" }} />
          <div className="flex items-start gap-6 relative">
            <div className="absolute left-0 right-0 top-0 h-px" style={{ background: "var(--line)" }} />
            {children.map((c) => (
              <div key={c.name} className="flex flex-col items-center pt-5">
                <OrgNode node={c} byManager={byManager} depth={depth + 1}
                  selected={selected} onSelect={onSelect} decayOn={decayOn} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function RelationshipHub({ stakeholder, onClose }: { stakeholder: Stakeholder; onClose: () => void }) {
  const toast = useToast();
  const score = attractorScore(stakeholder);
  const eng = engagementFor(stakeholder);
  const stanceTone =
    score >= 30 ? { label: "Attractor", color: "#16A34A" } :
    score <= -10 ? { label: "Detractor", color: "#EF4444" } :
    { label: "Neutral", color: "#6B7280" };
  const inCommittee = BUYING_COMMITTEE.has(stakeholder.name);
  const influences = INFLUENCE[stakeholder.name] ?? [];

  // Mock activity timeline + notes — would be enriched from CRM in production
  const timeline = [
    { ts: "2d ago", kind: "Meeting",       text: "Discovery call — bundling scope, ROI math" },
    { ts: "5d ago", kind: "Email",         text: "Replied to expansion proposal — \"send the case study\"" },
    { ts: "9d ago", kind: "LinkedIn",      text: "Title change · promotion captured" },
    { ts: "14d ago", kind: "Call",         text: "Renewal alignment with Brad Allen" },
  ];
  const notes = stakeholder.role === "Champion"
    ? "Pre-promotion: aligned on Networking. Post-promotion: open on Security; will own bundling decision. Prefers async. Reads Twitter, never reads marketing emails."
    : stakeholder.role === "Detractor"
    ? "Concerned about contract length and consolidation risk. Has past relationship with competitor. Coffee chat recommended before next steering."
    : "Limited touch. Best path: through their manager or a peer-introduction.";

  return (
    <div className={`${cardClass} p-5 sticky top-4 max-h-[calc(100vh-100px)] overflow-y-auto`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <PersonAvatar name={stakeholder.name} size={40} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-semibold text-ink">{stakeholder.name}</span>
              {stakeholder.role === "Champion" && <Crown size={11} className="text-purple-500" strokeWidth={2.2} />}
            </div>
            <div className="text-[11.5px] text-muted">{stakeholder.title}</div>
          </div>
        </div>
        <button onClick={onClose}
          className="text-muted hover:text-ink p-1 rounded transition-colors">
          <X size={14} strokeWidth={1.8} />
        </button>
      </div>

      {/* Chips row */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        <Chip label={stanceTone.label} color={stanceTone.color} />
        <Chip label={eng} color={eng === "On Fire" ? "#EF4444" : eng === "Hot" ? "#F59E0B" : eng === "Warm" ? "#D97706" : "#6B7280"} />
        <Chip label={`Score ${score >= 0 ? "+" : ""}${score}`} color="#3B82F6" />
        {inCommittee && <Chip label="Buying committee" color="var(--accent)" />}
        {stakeholder.daysSilent >= 14 && <Chip label={`${stakeholder.daysSilent}d silent`} color="#EF4444" />}
      </div>

      {/* Decay alert */}
      {stakeholder.daysSilent >= 14 && (
        <div className="rounded-xl p-3 mb-4 flex items-start gap-2"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.20)" }}>
          <AlertCircle size={13} strokeWidth={1.8} style={{ color: "#EF4444" }} className="mt-0.5 flex-shrink-0" />
          <div className="text-[11.5px] text-ink-2">
            <b className="text-ink">Inactivity alert:</b> no touch in {stakeholder.daysSilent} days. Suggested action: warm intro from {stakeholder.reportsTo ?? "their manager"}.
          </div>
        </div>
      )}

      {/* Influence */}
      {influences.length > 0 && (
        <SectionBlock label="Influence map">
          <div className="space-y-1.5">
            {influences.map((n) => (
              <div key={n} className="flex items-center gap-2 text-[12px] text-ink-2">
                <ArrowUpRight size={11} strokeWidth={1.8} className="text-muted-2" />
                <span>Pushes <b className="text-ink">{n}</b> on technical decisions</span>
              </div>
            ))}
          </div>
        </SectionBlock>
      )}

      {/* Notes */}
      <SectionBlock label="Notes">
        <div className="text-[12px] text-ink-2 leading-relaxed">{notes}</div>
        <button onClick={() => toast({ tone: "info", title: "Note editor", body: "Inline note editor would open here." })}
          className="text-[11px] font-medium text-muted hover:text-ink mt-2 inline-flex items-center gap-1">
          <StickyNote size={11} strokeWidth={1.8} /> Add note
        </button>
      </SectionBlock>

      {/* Recent activity */}
      <SectionBlock label="Recent activity">
        <div className="space-y-2">
          {timeline.map((t, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-[10.5px] tnum text-muted-2 w-12 flex-shrink-0 mt-0.5">{t.ts}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">{t.kind}</div>
                <div className="text-[12px] text-ink-2 truncate">{t.text}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionBlock>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => toast({ tone: "success", title: `Touch scheduled · ${stakeholder.name}`, body: "Calendar invite drafted. Review before sending." })}
          className="text-[11.5px] font-semibold px-3 py-2 rounded-lg text-white inline-flex items-center justify-center gap-1.5"
          style={{ background: "var(--ink)" }}>
          <Calendar size={11} strokeWidth={2} /> Schedule touch
        </button>
        <button onClick={() => toast({ tone: "info", title: "Multi-thread", body: `Suggesting peer intros around ${stakeholder.name}.` })}
          className="text-[11.5px] font-medium px-3 py-2 rounded-lg border border-line bg-bg-deep hover:bg-surface inline-flex items-center justify-center gap-1.5">
          <Network size={11} strokeWidth={1.8} /> Multi-thread
        </button>
      </div>
    </div>
  );
}

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold px-2 py-0.5 rounded-md"
      style={{ background: `${color}1A`, color, border: `1px solid ${color}33` }}>
      {label}
    </span>
  );
}

function SectionBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1.5">{label}</div>
      {children}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// DEALS PANEL — list + drilldown with sub-tabs
// ═════════════════════════════════════════════════════════════════════════════
type DealSubTab = "touchpoints" | "completed" | "upcoming" | "roi";

function DealsPanel({ account, deals }: { account: AccountDetail; deals: DealRow[] }) {
  // If there's no real deal, synthesise an expansion deal from the account.
  const expansionDeal: DealRow = deals[0] ?? ({
    id: `${account.name}-exp`,
    account: account.name,
    name: `${account.name} — Expansion (Networking + Security)`,
    owner: account.owner,
    ownerInitials: account.ownerInitials,
    pipeline: "Customer Success" as const,
    segment: account.segment,
    stage: "Proposal" as const,
    stageProgress: { done: 3, total: 5 },
    amount: 320_000,
    forecast: "Best Case" as const,
    forecastProb: 65,
    closeDate: "2026-08-15",
    closeAtRisk: false,
    meddpicc: [1, 1, 1, 0, 0, 1, 1, 0],
    nextStep: "Send commercial proposal",
    priority: "High" as const,
    health: account.health,
  } satisfies DealRow);
  const [active, setActive] = useState<string>(expansionDeal.id);
  const [sub, setSub] = useState<DealSubTab>("touchpoints");

  const list = deals.length > 0 ? deals : [expansionDeal];
  const current = list.find((d) => d.id === active) ?? list[0];

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12 lg:col-span-4 space-y-3">
        <div className={sectionTitleClass}>Deals · {list.length}</div>
        {list.map((d) => (
          <DealCard key={d.id} deal={d} active={d.id === active} onClick={() => setActive(d.id)} />
        ))}
      </div>
      <div className="col-span-12 lg:col-span-8 space-y-4">
        <DealHeader deal={current} />
        <div className="flex items-center gap-1 border-b border-line">
          {[
            { id: "touchpoints" as const, l: "Touchpoints" },
            { id: "completed"   as const, l: "Completed Tasks" },
            { id: "upcoming"    as const, l: "Upcoming Tasks" },
            { id: "roi"         as const, l: "Highest ROI" },
          ].map((s) => (
            <button key={s.id} onClick={() => setSub(s.id)}
              className="relative text-[12.5px] font-medium px-3.5 py-2.5 transition-colors"
              style={{ color: sub === s.id ? "var(--ink)" : "var(--muted)" }}>
              {s.l}
              {sub === s.id && <span className="absolute left-2 right-2 -bottom-px h-[1.5px] rounded-full" style={{ background: "var(--ink)" }} />}
            </button>
          ))}
        </div>
        {sub === "touchpoints" && <DealTouchpoints />}
        {sub === "completed"   && <DealTaskList kind="completed" />}
        {sub === "upcoming"    && <DealTaskList kind="upcoming" />}
        {sub === "roi"         && <DealTaskList kind="roi" />}
      </div>
    </div>
  );
}

function DealCard({ deal, active, onClick }: { deal: DealRow; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`w-full text-left rounded-xl p-4 transition-colors ${active ? "bg-surface" : "bg-bg-deep hover:bg-surface"}`}
      style={{ border: `1px solid ${active ? "var(--ink)" : "var(--line)"}` }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">{deal.stage}</span>
        <span className="text-[14px] font-bold tnum text-ink" style={{ letterSpacing: "-0.018em" }}>{fmtMoney(deal.amount)}</span>
      </div>
      <div className="text-[13px] font-semibold text-ink leading-snug mb-1">{deal.name}</div>
      <div className="flex items-center gap-2 text-[11px] text-muted">
        <Calendar size={10} strokeWidth={1.8} /> Closes {deal.closeDate}
        <span className="text-muted-2">·</span>
        <span className="font-medium" style={{ color: deal.forecast === "Commit" ? "#16A34A" : deal.forecast === "Best Case" ? "#3B82F6" : "var(--muted)" }}>
          {deal.forecast}
        </span>
      </div>
    </button>
  );
}

function DealHeader({ deal }: { deal: DealRow }) {
  // Stages we visualise in the progress strip
  const stages = ["Discover", "Solution", "Proposal", "Negotiation", "Closed Won"];
  const idx = Math.max(0, stages.findIndex((s) => deal.stage.toLowerCase().includes(s.toLowerCase())));
  return (
    <div className={`${cardClass} p-5`}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1">Expansion Deal</div>
          <h3 className="text-[18px] font-semibold text-ink leading-tight" style={{ letterSpacing: "-0.018em" }}>{deal.name}</h3>
          <div className="flex items-center gap-3 text-[11.5px] text-muted mt-1.5">
            <span className="inline-flex items-center gap-1"><DollarSign size={11} strokeWidth={1.8} /> {fmtMoney(deal.amount)} ARR</span>
            <span className="inline-flex items-center gap-1"><Calendar size={11} strokeWidth={1.8} /> Closes {deal.closeDate}</span>
            <span className="inline-flex items-center gap-1"><UserCheck size={11} strokeWidth={1.8} /> Owner {deal.owner}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">Likelihood</div>
          <div className="text-[28px] font-bold tnum text-ink" style={{ letterSpacing: "-0.018em" }}>72%</div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {stages.map((s, i) => {
          const done = i < idx;
          const here = i === idx;
          return (
            <div key={s} className="flex-1 flex flex-col items-start gap-1">
              <div className="w-full h-1 rounded-full"
                style={{ background: done || here ? "var(--ink)" : "var(--line)" }} />
              <span className="text-[10.5px] font-medium" style={{ color: done ? "var(--muted)" : here ? "var(--ink)" : "var(--muted-2)" }}>{s}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DealTouchpoints() {
  const toast = useToast();
  const items = [
    { date: "Apr 24", who: "Maya Chen",      kind: "Email",   label: "Replied to bundling proposal — wants ROI math by Friday" },
    { date: "Apr 22", who: "Pragyan Dutta",  kind: "Meeting", label: "Discovery call — VP Eng + Director of Procurement" },
    { date: "Apr 18", who: "Maya Chen",      kind: "LinkedIn",label: "Promoted to VP Engineering — congrats sent" },
    { date: "Apr 12", who: "Anonymous (Cloudflare)", kind: "Website", label: "Pricing page · Security compliance · 6 visits" },
    { date: "Apr  8", who: "James Park",     kind: "Sales Email", label: "Sent ROI calculator + Datadog case study" },
    { date: "Apr  3", who: "Pragyan Dutta",  kind: "Call",    label: "Renewal alignment with CFO — opened expansion conversation" },
  ];
  return (
    <div className={`${cardClass} divide-y divide-line`}>
      {items.map((t, i) => (
        <button key={i}
          onClick={() => toast({ tone: "info", title: `${t.kind} · ${t.who}`, body: t.label })}
          className="w-full px-5 py-3.5 flex items-center gap-4 text-left hover:bg-bg-deep/40 transition-colors">
          <div className="text-[11px] font-mono tnum text-muted-2 w-14">{t.date}</div>
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 w-24">{t.kind}</div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] text-ink truncate">{t.label}</div>
            <div className="text-[11px] text-muted">{t.who}</div>
          </div>
          <ChevronRight size={12} strokeWidth={1.8} className="text-muted-2" />
        </button>
      ))}
    </div>
  );
}

type Task = { id: string; title: string; due: string; assignee: string; roi: number; status: "done" | "open" };
function DealTaskList({ kind, onOpenTask }: { kind: "completed" | "upcoming" | "roi"; onOpenTask?: (t: Task) => void }) {
  const toast = useToast();
  const handleOpen = onOpenTask ?? ((t: Task) =>
    toast({ tone: "info", title: t.title, body: `Assigned to ${t.assignee} · due ${t.due}` }));
  const all: Task[] = [
    { id: "t1", title: "Send Datadog case study + ROI calculator",                    due: "Apr  8", assignee: "James Park",     roi: 72, status: "done" },
    { id: "t2", title: "Discovery call with VP Engineering + Procurement",            due: "Apr 22", assignee: "Pragyan Dutta",  roi: 88, status: "done" },
    { id: "t3", title: "Reply with bundling proposal + custom ROI math",              due: "Apr 26", assignee: "Pragyan Dutta",  roi: 95, status: "open" },
    { id: "t4", title: "Multi-thread CFO on Networking+Security consolidation",       due: "Apr 30", assignee: "Pragyan Dutta",  roi: 90, status: "open" },
    { id: "t5", title: "Schedule security/compliance review with InfoSec",             due: "May  4", assignee: "James Park",     roi: 64, status: "open" },
    { id: "t6", title: "Run usage-and-savings audit (Q1+Q2)",                          due: "May  7", assignee: "Sarah Williams", roi: 58, status: "open" },
    { id: "t7", title: "Build commercial proposal — 3-year term, multi-product",      due: "May 10", assignee: "Pragyan Dutta",  roi: 92, status: "open" },
  ];
  let rows: Task[];
  if (kind === "completed") rows = all.filter((t) => t.status === "done");
  else if (kind === "upcoming") rows = all.filter((t) => t.status === "open").sort((a, b) => a.due.localeCompare(b.due));
  else rows = [...all].filter((t) => t.status === "open").sort((a, b) => b.roi - a.roi);

  return (
    <div className={`${cardClass} divide-y divide-line`}>
      {rows.map((t) => (
        <div key={t.id} className="px-5 py-3.5 flex items-center gap-4">
          {t.status === "done"
            ? <CheckCircle2 size={14} strokeWidth={1.8} className="flex-shrink-0" style={{ color: "#16A34A" }} />
            : <Circle size={14} strokeWidth={1.8} className="flex-shrink-0 text-muted-2" />}
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] text-ink truncate">{t.title}</div>
            <div className="text-[11px] text-muted">{t.assignee} · due {t.due}</div>
          </div>
          {kind === "roi" && <RoiBar value={t.roi} />}
          {kind === "upcoming" && <span className="text-[11px] text-muted whitespace-nowrap">due {t.due}</span>}
          <button onClick={() => handleOpen(t)}
            className="text-[11.5px] font-medium px-2.5 py-1 rounded-md hover:bg-bg-deep transition-colors text-muted hover:text-ink inline-flex items-center gap-1">
            Open <ArrowRight size={10} strokeWidth={2} />
          </button>
        </div>
      ))}
      {rows.length === 0 && (
        <div className="px-5 py-8 text-center text-[12.5px] text-muted">Nothing here yet.</div>
      )}
    </div>
  );
}

function RoiBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2 w-32">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--line)" }}>
        <div className="h-full rounded-full"
          style={{ width: `${value}%`, background: value > 80 ? "#16A34A" : value > 60 ? "#3B82F6" : "#9CA3AF" }} />
      </div>
      <span className="text-[11px] font-mono tnum text-ink whitespace-nowrap">{value}</span>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TASKS PANEL — flat list of all account tasks (placeholder, simple)
// ═════════════════════════════════════════════════════════════════════════════
// ═════════════════════════════════════════════════════════════════════════════
// TASKS PANEL — Kanban-style board grouped by status
// ═════════════════════════════════════════════════════════════════════════════
type TaskStatus = "todo" | "in-progress" | "blocked" | "done";
type KanbanTask = {
  id: string;
  title: string;
  due: string;
  assignee: string;
  roi: number;
  status: TaskStatus;
  tags?: string[];
};

const ALL_TASKS: KanbanTask[] = [
  { id: "t1", title: "Send Datadog case study + ROI calculator",                 due: "Apr 8",  assignee: "James Park",     roi: 72, status: "done",        tags: ["sent"] },
  { id: "t2", title: "Discovery call with VP Engineering + Procurement",         due: "Apr 22", assignee: "Pragyan Dutta",  roi: 88, status: "done",        tags: ["call"] },
  { id: "t3", title: "Reply with bundling proposal + custom ROI math",           due: "Apr 26", assignee: "Pragyan Dutta",  roi: 95, status: "in-progress", tags: ["urgent"] },
  { id: "t4", title: "Multi-thread CFO on Networking+Security consolidation",    due: "Apr 30", assignee: "Pragyan Dutta",  roi: 90, status: "todo",        tags: ["multi-thread"] },
  { id: "t5", title: "Schedule security/compliance review with InfoSec",         due: "May 4",  assignee: "James Park",     roi: 64, status: "todo",        tags: ["infosec"] },
  { id: "t6", title: "Run usage-and-savings audit (Q1+Q2)",                      due: "May 7",  assignee: "Sarah Williams", roi: 58, status: "blocked",     tags: ["data"] },
  { id: "t7", title: "Build commercial proposal — 3-year term, multi-product",   due: "May 10", assignee: "Pragyan Dutta",  roi: 92, status: "todo",        tags: ["commercial"] },
  { id: "t8", title: "Pull Datadog reference call onto Maya's calendar",         due: "May 12", assignee: "Rachel Kim",     roi: 80, status: "in-progress", tags: ["reference"] },
  { id: "t9", title: "Neutralise Rebecca Chu — coffee-chat opener",              due: "May 14", assignee: "Pragyan Dutta",  roi: 70, status: "todo",        tags: ["detractor"] },
];

const COLUMN_META: Record<TaskStatus, { label: string; tone: string; tint: string }> = {
  "todo":        { label: "To Do",        tone: "var(--muted)",   tint: "rgba(107,114,128,0.06)" },
  "in-progress": { label: "In Progress",  tone: "var(--accent)",  tint: "rgba(38,109,240,0.08)" },
  "blocked":     { label: "Blocked",      tone: "#EF4444",        tint: "rgba(239,68,68,0.06)" },
  "done":        { label: "Done",         tone: "#16A34A",        tint: "rgba(34,197,94,0.06)" },
};

function TasksPanel({ slug }: { slug: string }) {
  void slug;
  const toast = useToast();
  const [tasks, setTasks] = useState<KanbanTask[]>(ALL_TASKS);
  const [search, setSearch] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overCol, setOverCol]       = useState<TaskStatus | null>(null);

  const filteredTasks = tasks.filter(
    (t) => !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.assignee.toLowerCase().includes(search.toLowerCase()) || (t.tags ?? []).some((g) => g.toLowerCase().includes(search.toLowerCase())),
  );

  const cols: TaskStatus[] = ["todo", "in-progress", "blocked", "done"];

  const moveTask = (id: string, to: TaskStatus) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: to } : t));
    const t = tasks.find((x) => x.id === id);
    if (t && t.status !== to) {
      toast({ tone: "success", title: `Moved to ${COLUMN_META[to].label}`, body: t.title });
    }
  };

  const totals = cols.map((c) => filteredTasks.filter((t) => t.status === c).length);
  const totalRoi = filteredTasks.filter((t) => t.status !== "done").reduce((s, t) => s + t.roi, 0);

  return (
    <div className="space-y-4">
      <PanelIntro
        Icon={ListChecks}
        title="Account tasks · Kanban"
        body="Every task across this account, columned by status. Drag any card across columns to update its state. The number on each card is its ROI score — higher means a bigger lever on the deal." />

      {/* Toolbar */}
      <div className={`${cardClass} p-3 flex items-center gap-2 flex-wrap`}>
        <ListChecks size={14} strokeWidth={1.8} className="text-muted ml-1" />
        <span className="text-[11.5px] font-semibold text-ink-2">{filteredTasks.length}</span>
        <span className="text-[11.5px] text-muted">tasks · {totalRoi} pts open</span>
        <span className="flex-1" />
        <div className="relative">
          <Search size={11} strokeWidth={1.8} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className="text-[12px] bg-bg-deep border border-line rounded-lg pl-7 pr-3 py-1.5 w-56 focus:outline-none focus:border-ink/30" />
        </div>
        <button onClick={() => toast({ tone: "info", title: "New task", body: "Inline task creator would slide in here." })}
          className="text-[11.5px] font-semibold px-3 py-1.5 rounded-lg text-white inline-flex items-center gap-1.5"
          style={{ background: "var(--ink)" }}>
          <Plus size={11} strokeWidth={2.2} /> New task
        </button>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {cols.map((col, i) => {
          const meta = COLUMN_META[col];
          const items = filteredTasks.filter((t) => t.status === col).sort((a, b) => b.roi - a.roi);
          const isDragOver = overCol === col;
          return (
            <div key={col}
              onDragOver={(e) => { e.preventDefault(); setOverCol(col); }}
              onDragLeave={() => setOverCol(null)}
              onDrop={(e) => {
                e.preventDefault();
                if (draggingId) moveTask(draggingId, col);
                setDraggingId(null);
                setOverCol(null);
              }}
              className={`rounded-2xl p-3 border min-h-[280px] transition-all`}
              style={{
                background: isDragOver ? meta.tint : "var(--surface)",
                borderColor: isDragOver ? meta.tone : "var(--line)",
              }}>
              <div className="flex items-center justify-between mb-2.5 px-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.tone }} />
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: meta.tone }}>{meta.label}</span>
                </div>
                <span className="text-[10px] font-mono tnum text-muted">{totals[i]}</span>
              </div>
              <div className="space-y-2">
                {items.map((t) => <KanbanCard key={t.id} task={t} onDragStart={() => setDraggingId(t.id)} onMove={moveTask} />)}
                {items.length === 0 && (
                  <div className="text-[11px] text-muted-2 italic text-center py-4 border border-dashed border-line rounded-lg">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KanbanCard({ task, onDragStart, onMove }: {
  task: KanbanTask;
  onDragStart: () => void;
  onMove: (id: string, to: TaskStatus) => void;
}) {
  const meta = COLUMN_META[task.status];
  const roiTone = task.roi >= 80 ? "#16A34A" : task.roi >= 60 ? "var(--accent)" : "#9CA3AF";
  // Suggested next status — used by the "→" quick-move button
  const order: TaskStatus[] = ["todo", "in-progress", "blocked", "done"];
  const nextStatus = task.status === "blocked" ? "in-progress" : order[(order.indexOf(task.status) + 1) % order.length];
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="rounded-xl p-3 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md group"
      style={{
        background: "var(--bg)",
        border: "1px solid var(--line)",
        borderLeft: `3px solid ${meta.tone}`,
      }}>
      <div className="flex items-start gap-2 mb-2">
        <div className="text-[12.5px] font-semibold text-ink leading-snug flex-1 min-w-0">{task.title}</div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <span className="text-[10px] font-mono tnum px-1.5 py-0.5 rounded"
            style={{ background: `${roiTone}15`, color: roiTone, border: `1px solid ${roiTone}33` }}
            title={`ROI score · ${task.roi}`}>
            {task.roi}
          </span>
        </div>
      </div>
      {(task.tags ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags!.slice(0, 2).map((g) => (
            <span key={g} className="text-[9px] font-semibold uppercase tracking-[0.06em] px-1.5 py-0.5 rounded text-muted-2 bg-bg-deep border border-line">
              {g}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 text-[10.5px]">
        <PersonAvatar name={task.assignee} size={18} />
        <span className="text-muted truncate flex-1">{task.assignee}</span>
        <span className="text-muted-2 tnum">{task.due}</span>
      </div>
      {task.status !== "done" && (
        <button onClick={() => onMove(task.id, nextStatus)}
          className="mt-2 text-[10.5px] font-medium text-muted hover:text-ink inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Move to {COLUMN_META[nextStatus].label} <ArrowRight size={10} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// AGENT PANEL — active agents, suggested runs, recent activity, reports
// ═════════════════════════════════════════════════════════════════════════════
type AgentStatus = "running" | "queued" | "done" | "needs-approval";

function AgentPanel({ account }: { account: AccountDetail }) {
  const toast = useToast();
  const [reportOpen, setReportOpen] = useState<{ id: string; title: string; subtitle: string; ts: string } | null>(null);
  // Active agents currently working on this account
  const active: { id: string; name: string; description: string; status: AgentStatus; progress?: number }[] = [
    { id: "a1", name: "Champion Watcher",   description: `Monitoring LinkedIn, calendar, and email for role changes across ${account.stakeholders.length} stakeholders`,            status: "running", progress: 64 },
    { id: "a2", name: "Renewal Sentinel",   description: `Renewal in ${account.renewalDays} days — auto-flags blockers and unsigned procurement steps`,                              status: "running", progress: 38 },
    { id: "a3", name: "Expansion Scout",    description: "Scoring cross-sell signals against the live White Space matrix and historical wins", status: "running", progress: 72 },
    { id: "a4", name: "Buying Committee",   description: "Multi-thread coverage check — 14 stakeholders mapped, 3 still untouched in 30 days",  status: "needs-approval" },
  ];

  // Suggested agents the user can spin up
  const suggested: { id: string; name: string; rationale: string; impact: "high" | "med" | "low" }[] = [
    { id: "s1", name: "InfoSec briefer",          rationale: "Owen Mitchell (Head of InfoSec) silent 16d — auto-prep a security packet + 1-pager", impact: "high" },
    { id: "s2", name: "Detractor neutraliser",    rationale: "Rebecca Chu (VP Sales) flagged as detractor — generate a coffee-chat opener tailored to her stated concerns", impact: "high" },
    { id: "s3", name: "Procurement nudge",        rationale: "Priya Sharma silent 11d — schedule a 15-min walkthrough of bundle commercials", impact: "med" },
    { id: "s4", name: "Reference-call broker",    rationale: "Pull the Datadog reference call onto Maya's calendar inside 7 days", impact: "med" },
  ];

  // Recent agent runs
  const events = [
    { ts: "Today, 9:14am",      label: "Drafted Maya Chen follow-up email",   detail: "Tone match 94%, queued for approval. 1 attachment (ROI snapshot.pdf)." },
    { ts: "Today, 8:02am",      label: "Surfaced champion-promotion signal",  detail: "Maya Chen → VP Engineering. Linked to LinkedIn, last QBR transcript, and email thread." },
    { ts: "Yesterday, 4:21pm",  label: `Refreshed ${account.name} signals`,   detail: "27 new touchpoints ingested across 5 channels. Intent score moved 76 → 88." },
    { ts: "Yesterday, 10:03am", label: "Built expansion business case",       detail: "Datadog comparable, 3.2× pipeline visibility, $215K incremental ARR. Saved to workspace." },
    { ts: "Yesterday, 8:55am",  label: "Multi-thread suggestion",             detail: "CFO Naomi Walker + Head of InfoSec Owen Mitchell identified. Drafts ready." },
    { ts: "2 days ago, 6:30pm", label: "MEDDPICC auto-fill",                  detail: "Filled Decision Criteria + Decision Process from latest call transcript. 6/8 complete." },
    { ts: "3 days ago, 2:14pm", label: "Renewal-risk recompute",              detail: "Renewal score steady at 88. No new blockers." },
  ];

  // Auto-generated reports
  const reports = [
    { id: "r1", title: "Cloudflare Expansion Case · 1-pager", subtitle: "Saved to workspace · attached to Maya draft", ts: "Yesterday" },
    { id: "r2", title: "Q3 QBR Deck — Cloudflare",            subtitle: "8 slides · ARR · adoption · success plan",      ts: "3d ago" },
    { id: "r3", title: "Champion Map — full buying committee", subtitle: "14 stakeholders · 6 attractors · 1 detractor", ts: "5d ago" },
  ];

  const impactTone = (i: "high" | "med" | "low") => i === "high"
    ? { color: "#16A34A", bg: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.22)", label: "High impact" }
    : i === "med"
    ? { color: "#3B82F6", bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.22)", label: "Med impact" }
    : { color: "#6B7280", bg: "rgba(107,114,128,0.10)", border: "rgba(107,114,128,0.22)", label: "Low impact" };

  return (
    <div className="space-y-5">
      {/* Active agents */}
      <div className={`${cardClass} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="relative w-2 h-2 rounded-full"
              style={{ background: "#22C55E", boxShadow: "0 0 8px rgba(34,197,94,0.6)" }} />
            <h3 className="text-[15px] font-semibold text-ink" style={{ letterSpacing: "-0.014em" }}>Active agents</h3>
            <span className="text-[11px] font-mono tnum text-muted">{active.length}</span>
          </div>
          <button onClick={() => toast({ tone: "info", title: "Agent settings", body: "Pause, resume, or reconfigure any agent from this account." })}
            className="text-[11.5px] font-medium text-muted hover:text-ink inline-flex items-center gap-1">
            Manage <ArrowRight size={11} strokeWidth={2} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {active.map((a) => (
            <div key={a.id} className={`${subCardClass} p-4`}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg grid place-items-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(38,109,240,0.10)", border: "1px solid rgba(38,109,240,0.20)" }}>
                  <Sparkles size={12} strokeWidth={2} style={{ color: "var(--accent)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[13px] font-semibold text-ink truncate">{a.name}</span>
                    <AgentStatusChip status={a.status} />
                  </div>
                  <div className="text-[11.5px] text-muted leading-snug mb-2">{a.description}</div>
                  {a.progress !== undefined && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "var(--line)" }}>
                        <div className="h-full rounded-full"
                          style={{ width: `${a.progress}%`, background: "var(--accent)" }} />
                      </div>
                      <span className="text-[10.5px] font-mono tnum text-muted-2">{a.progress}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested next */}
      <div className={`${cardClass} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap size={14} strokeWidth={1.8} className="text-muted" />
            <h3 className="text-[15px] font-semibold text-ink" style={{ letterSpacing: "-0.014em" }}>Suggested next</h3>
            <span className="text-[11px] font-mono tnum text-muted">{suggested.length}</span>
          </div>
          <span className="text-[11px] text-muted-2">Auto-prioritised by likely impact on ARR</span>
        </div>
        <div className="space-y-2.5">
          {suggested.map((s) => {
            const tone = impactTone(s.impact);
            return (
              <div key={s.id} className={`${subCardClass} p-3.5 flex items-center gap-3`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[12.5px] font-semibold text-ink">{s.name}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded-md"
                      style={{ color: tone.color, background: tone.bg, border: `1px solid ${tone.border}` }}>
                      {tone.label}
                    </span>
                  </div>
                  <div className="text-[11.5px] text-muted leading-snug">{s.rationale}</div>
                </div>
                <button onClick={() => toast({ tone: "success", title: `Running · ${s.name}`, body: s.rationale })}
                  className="text-[11.5px] font-medium px-3 py-1.5 rounded-lg text-white transition-transform hover:scale-[1.02] inline-flex items-center gap-1.5"
                  style={{ background: "var(--ink)" }}>
                  Run <ArrowRight size={11} strokeWidth={2.2} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent activity + reports — two-column layout */}
      <div className="grid grid-cols-12 gap-4">
        <div className={`col-span-12 lg:col-span-7 ${cardClass} p-6`}>
          <div className="flex items-center gap-2 mb-4">
            <Activity size={14} strokeWidth={1.8} className="text-muted" />
            <h3 className="text-[15px] font-semibold text-ink" style={{ letterSpacing: "-0.014em" }}>Recent activity</h3>
          </div>
          <div className="space-y-3">
            {events.map((e, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-line last:border-b-0 last:pb-0">
                <div className="w-7 h-7 rounded-lg grid place-items-center flex-shrink-0"
                  style={{ background: "rgba(38,109,240,0.10)", border: "1px solid rgba(38,109,240,0.20)" }}>
                  <Sparkles size={11} strokeWidth={2} style={{ color: "var(--accent)" }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-semibold text-ink">{e.label}</div>
                  <div className="text-[11.5px] text-muted leading-snug">{e.detail}</div>
                </div>
                <span className="text-[10.5px] text-muted-2 whitespace-nowrap flex-shrink-0">{e.ts}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`col-span-12 lg:col-span-5 ${cardClass} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText size={14} strokeWidth={1.8} className="text-muted" />
              <h3 className="text-[15px] font-semibold text-ink" style={{ letterSpacing: "-0.014em" }}>Generated reports</h3>
            </div>
            <button onClick={() => toast({ tone: "info", title: "Reports archive", body: "All auto-generated artifacts for this account." })}
              className="text-[11.5px] font-medium text-muted hover:text-ink inline-flex items-center gap-1">
              See all <ArrowRight size={11} strokeWidth={2} />
            </button>
          </div>
          <div className="space-y-2.5">
            {reports.map((r) => (
              <button key={r.id}
                onClick={() => setReportOpen(r)}
                className={`${subCardClass} p-3.5 flex items-center gap-3 w-full text-left hover:bg-surface transition-colors`}>
                <div className="w-9 h-9 rounded-lg grid place-items-center flex-shrink-0"
                  style={{ background: "rgba(124,58,237,0.10)", border: "1px solid rgba(124,58,237,0.20)" }}>
                  <FileText size={13} strokeWidth={1.8} style={{ color: "#7C3AED" }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-semibold text-ink truncate">{r.title}</div>
                  <div className="text-[11px] text-muted truncate">{r.subtitle}</div>
                </div>
                <span className="text-[10.5px] text-muted-2 whitespace-nowrap">{r.ts}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {reportOpen && (
        <ReportViewer report={reportOpen} account={account} onClose={() => setReportOpen(null)} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// ReportViewer — modal that renders the actual generated report content
// ─────────────────────────────────────────────────────────────────────
function ReportViewer({ report, account, onClose }: {
  report: { id: string; title: string; subtitle: string; ts: string };
  account: AccountDetail;
  onClose: () => void;
}) {
  const toast = useToast();
  // Pick content shape based on report type
  const isExpansion = /Expansion|1-pager/i.test(report.title);
  const isQbr       = /QBR|Quarterly/i.test(report.title);
  const isMap       = /Champion Map|buying committee/i.test(report.title);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-[820px] max-h-[88vh] rounded-2xl overflow-hidden bg-bg border border-line"
        style={{ boxShadow: "0 32px 80px -16px rgba(15,18,24,0.45)" }}
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-line flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg grid place-items-center flex-shrink-0"
            style={{ background: "rgba(124,58,237,0.10)", border: "1px solid rgba(124,58,237,0.20)" }}>
            <FileText size={14} strokeWidth={1.8} style={{ color: "#7C3AED" }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-0.5">Generated report · {report.ts}</div>
            <h2 className="text-[16px] font-bold text-ink leading-tight" style={{ letterSpacing: "-0.014em" }}>{report.title}</h2>
          </div>
          <button onClick={() => toast({ tone: "success", title: "Downloading…", body: report.title })}
            className="text-[11.5px] font-medium px-3 py-1.5 rounded-lg border border-line bg-surface hover:bg-bg-deep inline-flex items-center gap-1.5">
            <ArrowUpRight size={11} strokeWidth={1.8} /> Download
          </button>
          <button onClick={() => toast({ tone: "info", title: "Share link copied", body: "Anyone with the link can view." })}
            className="text-[11.5px] font-semibold px-3 py-1.5 rounded-lg text-white inline-flex items-center gap-1.5"
            style={{ background: "var(--ink)" }}>
            <Mail size={11} strokeWidth={1.8} /> Share
          </button>
          <button onClick={onClose}
            className="text-muted hover:text-ink p-1 rounded transition-colors">
            <X size={14} strokeWidth={1.8} />
          </button>
        </div>

        {/* Body — content varies by report type */}
        <div className="overflow-y-auto px-7 py-6" style={{ maxHeight: "calc(88vh - 80px)" }}>
          {isExpansion && <ExpansionReportBody account={account} />}
          {isQbr       && <QbrReportBody account={account} />}
          {isMap       && <ChampionMapBody account={account} />}
          {!isExpansion && !isQbr && !isMap && (
            <div className="text-[13px] text-muted">{report.subtitle}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1.5">{label}</div>
      <div className="text-[13px] text-ink-2 leading-relaxed">{children}</div>
    </div>
  );
}

function ExpansionReportBody({ account }: { account: AccountDetail }) {
  const champion = account.stakeholders.find(s => s.role === "Champion");
  return (
    <div>
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Incremental ARR", value: "$215K", tone: "#16A34A" },
          { label: "Payback",         value: "14 mo", tone: "var(--ink)" },
          { label: "TTV",             value: "11 d",  tone: "#16A34A" },
          { label: "Confidence",      value: "High",  tone: "#16A34A" },
        ].map((m, i) => (
          <div key={i} className="rounded-xl p-3 border border-line bg-bg-deep">
            <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1">{m.label}</div>
            <div className="text-[18px] font-bold tnum" style={{ color: m.tone, letterSpacing: "-0.018em" }}>{m.value}</div>
          </div>
        ))}
      </div>
      <ReportSection label="Executive Summary">
        {account.name} is at {fmtMoney(account.arr)} ARR, {account.nrr}% NRR, renewal in {account.renewalDays} days. Champion {champion?.name ?? "[Champion]"} was just promoted to {champion?.title ?? "VP"} — budget now spans Networking + Security. Bundling the two SKUs into a single 12-month contract maps to the new scope and unlocks a $215K expansion before procurement consolidates with another vendor.
      </ReportSection>
      <ReportSection label="ROI Math">
        <ul className="space-y-1.5 list-disc list-inside">
          <li>Networking SKU usage up <b className="text-ink">+38% WoW</b> — under-provisioned at current tier.</li>
          <li>Combined Networking + Security bundle: <b className="text-ink">$215K</b> incremental ARR, 14-month payback.</li>
          <li>Avoided cost of single-vendor consolidation: <b className="text-ink">$420K</b> over 3 years.</li>
          <li>Time-to-value for Security module: <b className="text-ink">11 days</b> (existing Networking integration).</li>
        </ul>
      </ReportSection>
      <ReportSection label="Comparable Win — Datadog">
        Datadog landed the same combined-tier bundle at comparable scale (3,400 employees, $720K starting ARR) in Q4 2025. Result: <b className="text-ink">3.2× pipeline visibility</b> and the largest single-quarter NRR contribution that year. Champion was also a newly promoted VP Eng — the pattern is a near-mirror.
      </ReportSection>
      <ReportSection label="Risks">
        <ul className="space-y-1.5 list-disc list-inside">
          <li>InfoSec review on Security module — schedule with Owen Mitchell (Head of InfoSec) inside 48h.</li>
          <li>Procurement (Priya Sharma) is silent for 11 days — multi-thread before they engage a competitor.</li>
          <li>VP Sales (Rebecca Chu) registered as a detractor — neutralise with a 15-min direct convo.</li>
        </ul>
      </ReportSection>
      <ReportSection label="Recommended Next Steps">
        <ol className="space-y-1.5 list-decimal list-inside">
          <li>Reply to {champion?.name.split(" ")[0] ?? "champion"} with this case attached today.</li>
          <li>Combined-tier walkthrough with {champion?.name.split(" ")[0] ?? "champion"} + Owen Mitchell by Friday.</li>
          <li>Avoided-cost story to Naomi Walker (CFO) Monday.</li>
          <li>Pull Datadog reference call within 7 days.</li>
        </ol>
      </ReportSection>
    </div>
  );
}

function QbrReportBody({ account }: { account: AccountDetail }) {
  const slides = [
    { n: "01", title: `${account.name} · Q3 Business Review`, sub: `Prepared by ${account.owner} · ${account.lastQbrDays}d since last QBR` },
    { n: "02", title: "Where we are",                          sub: `Health ${account.healthScore}/100 · NRR ${account.nrr}% · ARR ${fmtMoney(account.arr)}` },
    { n: "03", title: "Outcomes attainment",                   sub: "+38% throughput · 94% inter-rater agreement · 71% adoption" },
    { n: "04", title: "Expansion opportunity",                 sub: "Pattern matches 3 prior champion-promotion conversions · est. $215K within two quarters" },
    { n: "05", title: "Open risks",                            sub: "SOC 2 / data residency · sponsor silence on secondary stakeholder" },
    { n: "06", title: "Asks",                                  sub: "30-min cross-BU intro · reference-logo placement · case study release" },
    { n: "07", title: "Appendix · what's behind every number", sub: "Sources: call transcripts · product analytics · Hiring & Org events" },
    { n: "08", title: "Next 90 days",                          sub: "Bundle proposal · InfoSec review · BFCM-aligned go-live" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {slides.map((s) => (
        <div key={s.n} className="rounded-xl p-4 border border-line bg-bg-deep aspect-[16/10] flex flex-col">
          <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] mb-2"
            style={{ color: "var(--accent)" }}>Slide {s.n}</div>
          <div className="text-[14px] font-bold text-ink mb-1.5 leading-tight">{s.title}</div>
          <div className="text-[11px] text-muted leading-snug flex-1">{s.sub}</div>
          <div className="mt-auto pt-2 border-t border-line flex items-center justify-between">
            <span className="text-[8.5px] font-mono uppercase tracking-[0.14em] text-muted-2">QBR · {account.name}</span>
            <span className="text-[8.5px] font-mono tnum text-muted-2">{s.n} / 08</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ChampionMapBody({ account }: { account: AccountDetail }) {
  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Stakeholders mapped", value: String(account.stakeholders.length), tone: "var(--ink)" },
          { label: "Attractors",          value: String(account.stakeholders.filter(s => s.sentiment === "supportive").length), tone: "#16A34A" },
          { label: "Detractors",          value: String(account.stakeholders.filter(s => s.role === "Detractor").length), tone: "#EF4444" },
        ].map((m, i) => (
          <div key={i} className="rounded-xl p-3 border border-line bg-bg-deep">
            <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1">{m.label}</div>
            <div className="text-[20px] font-bold tnum" style={{ color: m.tone, letterSpacing: "-0.018em" }}>{m.value}</div>
          </div>
        ))}
      </div>
      <ReportSection label="Buying committee">
        <div className="grid grid-cols-1 gap-2">
          {account.stakeholders.slice(0, 12).map((s) => (
            <div key={s.name} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-line bg-bg-deep">
              <PersonAvatar name={s.name} size={28} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-semibold text-ink truncate">{s.name}</span>
                  {s.role === "Champion" && (
                    <span className="text-[8.5px] font-bold uppercase tracking-[0.10em] px-1 py-0.5 rounded"
                      style={{ background: "rgba(168,85,247,0.10)", color: "#9333EA" }}>Champion</span>
                  )}
                  {s.role === "Detractor" && (
                    <span className="text-[8.5px] font-bold uppercase tracking-[0.10em] px-1 py-0.5 rounded"
                      style={{ background: "rgba(239,68,68,0.10)", color: "#EF4444" }}>Detractor</span>
                  )}
                </div>
                <div className="text-[10.5px] text-muted truncate">{s.title} · {s.department}</div>
              </div>
              <span className="text-[10.5px] text-muted-2 whitespace-nowrap">
                {s.daysSilent === 0 ? "Active today" : `${s.daysSilent}d silent`}
              </span>
            </div>
          ))}
        </div>
      </ReportSection>
    </div>
  );
}

function AgentStatusChip({ status }: { status: AgentStatus }) {
  const meta =
    status === "running"        ? { label: "Running",         color: "#16A34A", bg: "rgba(34,197,94,0.10)",  border: "rgba(34,197,94,0.22)",  pulse: true } :
    status === "queued"         ? { label: "Queued",          color: "#9CA3AF", bg: "rgba(107,114,128,0.10)", border: "rgba(107,114,128,0.22)", pulse: false } :
    status === "needs-approval" ? { label: "Needs approval",  color: "#F59E0B", bg: "rgba(245,158,11,0.10)",  border: "rgba(245,158,11,0.22)",  pulse: false } :
    /* done */                    { label: "Done",            color: "#6B7280", bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.18)", pulse: false };
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-md"
      style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }}>
      <span className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ background: meta.color, boxShadow: meta.pulse ? `0 0 6px ${meta.color}` : undefined }} />
      {meta.label}
    </span>
  );
}

// dummy refs to silence unused-import lints if a feature is removed
void UserPlus; void FileText; void AlertCircle; void ExternalLink;
