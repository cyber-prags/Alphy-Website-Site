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
import { useUser } from "@/components/UserContext";
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
// AM HOME — calm, expansion-first workspace
// One narrative: what changed → what to do → what's in the pipeline
// ════════════════════════════════════════════════════════════════════════

type CoPilotPlay = {
  id: string;
  action: string;
  person: string;
  personTitle: string;
  context: string;
  account: string;
  accountSlug: string;
  arr?: number;
  staleDays?: number;
  detail?: string;
  suggestedReply?: string;
};

const COPILOT_PLAYS: CoPilotPlay[] = [
  {
    id: "p1",
    action: "Follow up with Maya Chen",
    person: "Maya Chen",
    personTitle: "VP Engineering",
    context: "Hasn't replied to the Revenue Intel proposal you sent 5 days ago. She just got promoted — her budget scope expanded into Networking + Security.",
    account: "Cloudflare",
    accountSlug: "cloudflare-inc",
    arr: 120_000,
    staleDays: 5,
    detail: "Maya was promoted to VP Eng 12 days ago. The proposal you sent on May 1 covered Revenue Intel only — there's an opening to bundle Networking that fits her new mandate and may simplify procurement.",
    suggestedReply: "Hi Maya — congrats on the promotion. Wanted to check in on the Revenue Intel proposal. Given your expanded scope, I have a few thoughts on bundling Networking that could simplify procurement…",
  },
  {
    id: "p2",
    action: "Convert Cloudflare AI Copilot trial",
    person: "Maya Chen",
    personTitle: "VP Engineering",
    context: "Trial ends May 28. 10 active seats, 60% weekly engagement. Send the usage report and a conversion proposal before it expires.",
    account: "Cloudflare",
    accountSlug: "cloudflare-inc",
    arr: 95_000,
    staleDays: 3,
  },
  {
    id: "p3",
    action: "Send governance gap analysis to Priya Sharma",
    person: "Priya Sharma",
    personTitle: "Head of Revenue Operations",
    context: "She asked for it on Apr 28 — 8 days waiting. Tableau is hiring 4 ML engineers; the governance gap is widening.",
    account: "Tableau",
    accountSlug: "tableau-software",
    arr: 90_000,
    staleDays: 8,
  },
  {
    id: "p4",
    action: "Re-engage Brad Wallace",
    person: "Brad Wallace",
    personTitle: "VP Sales Ops",
    context: "Snowflake renewal in 47 days. James Whitfield (your other sponsor) just left — Brad is your only path in. He's been silent 14 days.",
    account: "Snowflake",
    accountSlug: "snowflake-inc",
    arr: 480_000,
    staleDays: 14,
  },
];

// Activity feed signals — chronological, mixed types
type ActivityKind = "champion" | "departure" | "usage" | "deal" | "renewal" | "note";
type ActivityItem = {
  id: string;
  kind: ActivityKind;
  account: string;
  accountSlug: string;
  text: string;
  ago: string;            // "12h", "2d", etc.
  bucket: "today" | "yesterday" | "earlier";
};

const ACTIVITY: ActivityItem[] = [
  { id: "a1", kind: "champion",  account: "Cloudflare", accountSlug: "cloudflare-inc",      text: "Maya Chen promoted to VP Engineering",                       ago: "12h", bucket: "today" },
  { id: "a2", kind: "departure", account: "Snowflake",  accountSlug: "snowflake-inc",       text: "Brad Wallace silent 14 days — renewal sponsor exposure",      ago: "2h",  bucket: "today" },
  { id: "a3", kind: "usage",     account: "Cloudflare", accountSlug: "cloudflare-inc",      text: "Hit 92% of Networking plan limits — third time this quarter", ago: "4h",  bucket: "today" },
  { id: "a4", kind: "deal",      account: "Cloudflare", accountSlug: "cloudflare-inc",      text: "AI Copilot trial conversion window — 22 days remaining",      ago: "today", bucket: "today" },
  { id: "a5", kind: "renewal",   account: "Akamai",     accountSlug: "akamai-technologies", text: "QBR overdue 14 days — Q2 expansion narrative stale",          ago: "1d",  bucket: "yesterday" },
  { id: "a6", kind: "usage",     account: "GitLab",     accountSlug: "gitlab-inc",          text: "Trial signup detected — Alex Rivera (AI Copilot)",            ago: "1d",  bucket: "yesterday" },
  { id: "a7", kind: "departure", account: "Snowflake",  accountSlug: "snowflake-inc",       text: "James Whitfield (VP Sales Ops) left the company",             ago: "2d",  bucket: "earlier" },
  { id: "a8", kind: "usage",     account: "Tableau",    accountSlug: "tableau-software",    text: "12 new seats added — ML team grew, governance gap widening",  ago: "3d",  bucket: "earlier" },
  { id: "a9", kind: "champion",  account: "Tableau",    accountSlug: "tableau-software",    text: "Priya Sharma joined as Head of Revenue Operations",           ago: "3d",  bucket: "earlier" },
  { id: "a10", kind: "usage",    account: "Snowflake",  accountSlug: "snowflake-inc",       text: "ML Ops team running API in prod — new use case detected",    ago: "4d",  bucket: "earlier" },
];

// ─────────────────────────────────────────────────────────────────────
function AMHome() {
  const greeting = greetingFor();
  const { user } = useUser();
  const ranked = useMemo(
    () => [...expansionOpportunities].sort((a, b) => b.score - a.score).slice(0, 6),
    []
  );

  // Book stats
  const customers = [
    "Cloudflare", "Snowflake", "Tableau", "Akamai", "GitLab",
  ];
  const bookArr      = 2_380_000;
  const pipelineArr  = expansionOpportunities.reduce((s, o) => s + o.estimatedArr, 0);
  const activeOpps   = expansionOpportunities.filter((o) => o.stage !== "closed" && o.stage !== "identified").length;
  const totalSignals = ACTIVITY.length + 13; // weekly volume

  const featured = COPILOT_PLAYS[0];
  const more = COPILOT_PLAYS.slice(1);

  return (
    <AppShell>
      {/* ─── Header ──────────────────────────────────────────── */}
      <header className="mb-9">
        <div className="flex items-baseline justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-[24px] font-semibold text-ink" style={{ letterSpacing: "-0.022em" }}>
              {greeting}, {user.firstName}
            </h1>
            <div className="flex items-center gap-2 text-[12px] text-muted mt-1.5">
              <span>{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
              <span className="text-muted-2">·</span>
              <span>
                <span className="font-semibold text-ink-2 tnum">{fmtMoney(bookArr)}</span> book
              </span>
              <span className="text-muted-2">·</span>
              <span>
                <span className="font-semibold text-ink-2 tnum">{customers.length}</span> customers
              </span>
              <span className="text-muted-2">·</span>
              <span>
                <span className="font-semibold text-ink-2 tnum">{activeOpps}</span> active plays
              </span>
            </div>
          </div>
          <DataFreshness minutesAgo={3} sources={["Salesforce", "LinkedIn", "Gong", "Alphy AI"] as any} />
        </div>
      </header>

      {/* ─── Today ───────────────────────────────────────────── */}
      <SectionHeader label="Today" detail={`${COPILOT_PLAYS.length} plays`} />
      <FeaturedPlay play={featured} />
      <div className="mt-2 mb-10">
        {more.map((p, i) => <PlayRow key={p.id} play={p} isLast={i === more.length - 1} />)}
      </div>

      {/* ─── Pipeline ────────────────────────────────────────── */}
      <SectionHeader
        label="Pipeline"
        detail={`${fmtMoney(pipelineArr)} across ${ranked.length} plays`}
        right={<Link href="/portfolio" className="text-[11.5px] font-medium text-muted hover:text-ink inline-flex items-center gap-1">View portfolio <ChevronRight size={11} /></Link>}
      />
      <div className="mb-10 -mx-2 overflow-x-auto">
        <div className="flex items-stretch gap-3 px-2 min-w-min">
          {ranked.map((opp) => <PipelineTile key={opp.id} opp={opp} />)}
        </div>
      </div>

      {/* ─── Activity ────────────────────────────────────────── */}
      <SectionHeader
        label="Activity"
        detail={`${totalSignals} signals this week`}
        right={<Link href="/signals" className="text-[11.5px] font-medium text-muted hover:text-ink inline-flex items-center gap-1">All signals <ChevronRight size={11} /></Link>}
      />
      <ActivityFeed items={ACTIVITY} />
    </AppShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
function SectionHeader({ label, detail, right }: { label: string; detail?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-baseline gap-2.5">
        <h2 className="text-[14px] font-semibold text-ink" style={{ letterSpacing: "-0.012em" }}>{label}</h2>
        {detail && <span className="text-[11.5px] text-muted-2 tnum">{detail}</span>}
      </div>
      {right}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Featured Play — the single most important action today
// ─────────────────────────────────────────────────────────────────────
function FeaturedPlay({ play }: { play: CoPilotPlay }) {
  const [open, setOpen] = useState(false);
  const stale = play.staleDays && play.staleDays >= 5;
  return (
    <div className="rounded-2xl overflow-hidden mb-2"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
      }}>
      <div className="grid grid-cols-12 gap-0">
        {/* Left rail accent */}
        <div className="col-span-12 lg:col-span-8 p-6 relative">
          <div className="absolute left-0 top-6 bottom-6 w-[3px] rounded-r-full"
            style={{ background: "var(--accent-deep)" }} />
          <div className="pl-2">
            <div className="flex items-center gap-2 mb-2">
              <Logo name={play.account} size={16} rounded={4} />
              <span className="text-[11px] font-semibold text-ink-2">{play.account}</span>
              {play.arr && (
                <>
                  <span className="text-muted-2">·</span>
                  <span className="text-[11px] font-mono tnum text-muted">{fmtMoney(play.arr)}</span>
                </>
              )}
            </div>
            <h3 className="text-[20px] font-semibold text-ink leading-tight mb-2.5"
              style={{ letterSpacing: "-0.018em" }}>
              {play.action}
            </h3>
            <p className="text-[13.5px] text-muted leading-relaxed max-w-2xl">{play.context}</p>

            {open && play.detail && (
              <div className="mt-4 p-4 rounded-xl"
                style={{ background: "var(--bg-deep)", border: "1px solid var(--line)" }}>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1.5">Why now</div>
                <div className="text-[12.5px] text-ink-2 leading-relaxed mb-3">{play.detail}</div>
                {play.suggestedReply && (
                  <>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1.5 flex items-center gap-1.5">
                      <Sparkles size={10} strokeWidth={2.2} style={{ color: "var(--accent-deep)" }} />
                      Suggested reply
                    </div>
                    <div className="rounded-lg px-3 py-2.5 text-[12px] text-ink-2 leading-relaxed font-mono"
                      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                      {play.suggestedReply}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 mt-5">
              <button className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-2 rounded-lg text-white"
                style={{ background: "var(--accent-deep)" }}>
                <Sparkles size={11} strokeWidth={2.2} /> Draft follow-up
              </button>
              <Link href={`/accounts/${play.accountSlug}`}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3.5 py-2 rounded-lg"
                style={{ background: "var(--surface)", color: "var(--ink-2)", border: "1px solid var(--line)" }}>
                Open account <ArrowRight size={11} strokeWidth={2.2} />
              </Link>
              <button onClick={() => setOpen((v) => !v)}
                className="text-[11.5px] text-muted hover:text-ink ml-1 inline-flex items-center gap-1">
                {open ? "Hide context" : "Why now"} <ChevronDown size={11} strokeWidth={2} className={`transition-transform ${open ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Right side — meta */}
        <div className="col-span-12 lg:col-span-4 p-6 lg:border-l border-line lg:bg-bg-deep/40 flex flex-col gap-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1">Champion</div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full grid place-items-center text-[9px] font-semibold text-white"
                style={{ background: "var(--accent-deep)" }}>
                {play.person.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <div className="text-[12px] font-semibold text-ink">{play.person}</div>
                <div className="text-[10.5px] text-muted">{play.personTitle}</div>
              </div>
            </div>
          </div>
          {play.staleDays !== undefined && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1">Time elapsed</div>
              <div className="text-[14px] font-semibold tnum"
                style={{ color: stale ? "var(--neg)" : "var(--ink)" }}>
                {play.staleDays} {play.staleDays === 1 ? "day" : "days"}
              </div>
              <div className="text-[10.5px] text-muted">since you reached out</div>
            </div>
          )}
          {play.arr && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1">Estimated ARR</div>
              <div className="text-[18px] font-bold tnum text-ink" style={{ letterSpacing: "-0.018em" }}>
                {fmtMoney(play.arr)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// PlayRow — a simple one-liner play
// ─────────────────────────────────────────────────────────────────────
function PlayRow({ play, isLast }: { play: CoPilotPlay; isLast: boolean }) {
  const stale = play.staleDays && play.staleDays >= 5;
  return (
    <Link href={`/accounts/${play.accountSlug}`}
      className="group flex items-center gap-3 px-3 py-3 hover:bg-bg-deep transition-colors rounded-lg"
      style={{ borderBottom: isLast ? "none" : "1px solid var(--line)" }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: stale ? "var(--neg)" : "var(--muted-2)" }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] font-medium text-ink">{play.action}</span>
          <span className="text-muted-2">·</span>
          <Logo name={play.account} size={12} rounded={3} />
          <span className="text-[11.5px] text-muted">{play.account}</span>
          {play.staleDays !== undefined && (
            <>
              <span className="text-muted-2">·</span>
              <span className="text-[11px] tnum" style={{ color: stale ? "var(--neg)" : "var(--muted)" }}>
                {play.staleDays}d
              </span>
            </>
          )}
        </div>
      </div>
      {play.arr && (
        <span className="text-[11.5px] font-mono tnum text-muted-2 shrink-0">{fmtMoney(play.arr)}</span>
      )}
      <ChevronRight size={13} strokeWidth={1.8} className="text-muted-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────
// PipelineTile — single opportunity card in the horizontal pipeline row
// ─────────────────────────────────────────────────────────────────────
const STAGE_LABEL_SHORT: Record<string, string> = {
  identified:  "Identified",
  qualified:   "Qualified",
  proposal:    "Proposal",
  negotiation: "Negotiation",
  closed:      "Closed",
};

function PipelineTile({ opp }: { opp: typeof expansionOpportunities[number] }) {
  const stale = opp.daysInStage >= 14;
  const scoreTone = opp.score >= 85 ? "var(--pos)" : opp.score >= 70 ? "var(--accent)" : "var(--muted)";
  return (
    <Link href={`/accounts/${opp.accountSlug}`}
      className="group rounded-xl p-4 transition-all hover:shadow-sm shrink-0"
      style={{
        width: 200,
        background: "var(--surface)",
        border: "1px solid var(--line)",
      }}>
      <div className="flex items-center gap-2 mb-3">
        <Logo name={opp.accountName} size={22} rounded={5} />
        <div className="min-w-0 flex-1">
          <div className="text-[12.5px] font-semibold text-ink truncate">{opp.accountName}</div>
          <div className="text-[10px] text-muted truncate">{opp.productName}</div>
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-[20px] font-bold tnum text-ink leading-none" style={{ letterSpacing: "-0.018em" }}>
          {fmtMoney(opp.estimatedArr)}
        </span>
        <span className="text-[10.5px] font-semibold tnum" style={{ color: scoreTone }}>
          {opp.score}
        </span>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-line">
        <span className="text-[10.5px] font-medium text-ink-2">{STAGE_LABEL_SHORT[opp.stage]}</span>
        <span className="text-[10px] tnum" style={{ color: stale ? "var(--neg)" : "var(--muted-2)" }}>
          {opp.daysInStage}d
        </span>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────
// ActivityFeed — chronological signal log grouped by recency
// ─────────────────────────────────────────────────────────────────────
function ActivityFeed({ items }: { items: ActivityItem[] }) {
  const buckets: { label: string; items: ActivityItem[] }[] = [
    { label: "Today",              items: items.filter((i) => i.bucket === "today") },
    { label: "Yesterday",          items: items.filter((i) => i.bucket === "yesterday") },
    { label: "Earlier this week",  items: items.filter((i) => i.bucket === "earlier") },
  ];
  return (
    <div className="space-y-6">
      {buckets.map((b) => (
        <div key={b.label}>
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-2">
            {b.label}
          </div>
          <div className="space-y-px">
            {b.items.map((i) => <ActivityRow key={i.id} item={i} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const meta: Record<ActivityKind, { Icon: any; tone: string }> = {
    champion:  { Icon: ArrowUpRight,    tone: "var(--accent-deep)" },
    departure: { Icon: TrendingDown,    tone: "var(--neg)" },
    usage:     { Icon: Zap,             tone: "var(--accent)" },
    deal:      { Icon: Target,          tone: "var(--ink-2)" },
    renewal:   { Icon: Calendar,        tone: "var(--warn)" },
    note:      { Icon: FileText,        tone: "var(--muted)" },
  };
  const m = meta[item.kind];
  return (
    <Link href={`/accounts/${item.accountSlug}`}
      className="group flex items-center gap-3 px-3 py-2.5 -mx-3 rounded-lg hover:bg-bg-deep transition-colors">
      <span className="text-[10.5px] font-mono tnum text-muted-2 w-8 shrink-0 text-right">{item.ago}</span>
      <m.Icon size={12} strokeWidth={2} style={{ color: m.tone }} className="shrink-0" />
      <Logo name={item.account} size={14} rounded={3} />
      <span className="text-[12px] font-semibold text-ink-2 shrink-0">{item.account}</span>
      <span className="text-muted-2">·</span>
      <span className="text-[12px] text-muted-2 truncate flex-1">{item.text}</span>
      <ChevronRight size={11} strokeWidth={1.8} className="text-muted-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </Link>
  );
}


// ════════════════════════════════════════════════════════════════════════
// DEFAULT HOME (non-AM personas) — preserves existing layout
// ════════════════════════════════════════════════════════════════════════
function DefaultHome() {
  const { persona } = usePersona();
  const { user } = useUser();
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
              {greeting}, {user.firstName}
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
  const allGoals = persona === "ae" ? GOALS_AE_X : GOALS_CSM_X;
  const [view, setView] = useState<"live" | "completed">("live");
  // "Completed" = goals with progress >= 100 (none in mock by default — empty state)
  const all = view === "live"
    ? allGoals.filter(g => g.progress < 100)
    : allGoals.filter(g => g.progress >= 100);
  const overdue   = all.filter(g => g.daysLeft <= 1);
  const thisWeek  = all.filter(g => g.daysLeft > 1 && g.daysLeft <= 7);
  const upcoming  = all.filter(g => g.daysLeft > 7);
  const avgProg   = all.length ? Math.round(all.reduce((s, g) => s + g.progress, 0) / all.length) : 0;
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
          <button onClick={() => setView("live")}
            className={`px-3 py-1.5 rounded-lg font-medium ${view === "live" ? "text-ink bg-bg-deep" : "text-muted hover:text-ink"}`}>
            Live goals
          </button>
          <button onClick={() => setView("completed")}
            className={`px-3 py-1.5 rounded-lg ${view === "completed" ? "text-ink bg-bg-deep font-medium" : "text-muted hover:text-ink"}`}>
            Completed
          </button>
          <button onClick={() => alert("Goal creation coming soon — for now, goals are seeded from your active plays.")}
            className="ml-2 h-8 px-3 rounded-lg text-[11.5px] font-medium inline-flex items-center gap-1.5 border border-line bg-surface hover:bg-bg-deep">
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
