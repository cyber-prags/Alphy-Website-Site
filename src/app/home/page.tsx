"use client";

import { createContext, useContext, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight, Sparkles, AlertTriangle, Bell, Target, Plus, CheckCircle2,
  Circle, Clock, ArrowRight, ChevronDown, ChevronUp, Zap, TrendingUp,
  TrendingDown, Crown, Calendar, Flame, ArrowUpRight, Users, FileText,
  AlertCircle, MoveRight, ExternalLink, Eye, ShieldCheck, LifeBuoy,
  Activity as ActivityIcon, MessageSquare, RefreshCw, Mail,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TodayQueue } from "@/components/TodayQueue";
import { MyNumber } from "@/components/MyNumber";
import { Logo } from "@/components/Logo";
import { DataFreshness } from "@/components/SourceChip";
import { usePersona, PERSONA_LABEL } from "@/components/PersonaContext";
import { useUser } from "@/components/UserContext";
import { ExecutionDrawer, type DrawerConfig, type DrawerFlow } from "@/components/ExecutionDrawer";
import { AccountPeek, type PeekConfig, type PeekActivity } from "@/components/AccountPeek";
import { SignalDetail, type SignalDetailItem } from "@/components/SignalDetail";
import { PersonAvatar } from "@/components/PersonAvatar";
import { AmGuidedTour, useAmTourEligible } from "@/components/AmGuidedTour";

// Drawer context — any sub-component can open the animated execution drawer
const DrawerCtx = createContext<{ open: (cfg: DrawerConfig) => void }>({ open: () => {} });
const useDrawer = () => useContext(DrawerCtx);

// Peek context — any sub-component can open the AccountPeek side panel.
// Sub-components don't have to know how the peek is constructed; they
// just hand over an account name + the source (renewal / health / default).
type PeekOpener = (accountName: string, source?: PeekConfig["source"]) => void;
const PeekCtx = createContext<{ open: PeekOpener }>({ open: () => {} });
const usePeek = () => useContext(PeekCtx);

// Map a display-name (e.g. "Cloudflare") to a real Account record.
// Tries exact match, then prefix, then case-insensitive.
function resolveAccountByName(name: string): import("@/lib/mock").Account | undefined {
  const lc = name.toLowerCase();
  return (
    accounts.find((a) => a.name === name) ??
    accounts.find((a) => a.name.toLowerCase() === lc) ??
    accounts.find((a) => a.name.toLowerCase().startsWith(lc)) ??
    accounts.find((a) => lc.startsWith(a.name.toLowerCase().split(" ")[0]))
  );
}
import {
  pinnedAccounts, accountDetails, fmtMoney, outcomes, accounts, myNumber,
  slugify, championChanges, csmWorkloads, accountPlans,
  expansionOpportunities, EXPANSION_STAGES,
  type Account, type PlanTask, type ExpansionOpportunity, type ExpansionStage, type ChampionChange,
} from "@/lib/mock";

// ════════════════════════════════════════════════════════════════════════
// HOME PAGE — persona switch
// ════════════════════════════════════════════════════════════════════════
export default function HomePage() {
  const { persona } = usePersona();

  // The AM persona gets the expansion-first home.
  // The CSM persona gets the retention/save-first home.
  // The Manager persona gets the team-performance home.
  // Other personas keep the previous layout for now.
  if (persona === "am") return <AMHome />;
  if (persona === "csm") return <CSMHome />;
  if (persona === "manager") return <ManagerHome />;

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
  const [drawerCfg, setDrawerCfg] = useState<DrawerConfig | null>(null);
  const [peekCfg, setPeekCfg] = useState<PeekConfig | null>(null);
  // AM tour is rendered + managed at the AppShell level; auto-open happens there.

  const openPeek: PeekOpener = (accountName, source = "default") => {
    const acct = resolveAccountByName(accountName);
    if (!acct) return;
    const activity: PeekActivity[] = ACTIVITY
      .filter((a) => a.account === accountName || a.account.toLowerCase() === accountName.toLowerCase())
      .map((a) => ({ id: a.id, text: a.text, ago: a.ago, tone: amActivityTone(a.kind) }));
    setPeekCfg({ account: acct, source, activity });
  };

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
    <DrawerCtx.Provider value={{ open: setDrawerCfg }}>
    <PeekCtx.Provider value={{ open: openPeek }}>
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
      <CollapsibleSection
        storageKey="am-today"
        label="Today"
        detail={`${COPILOT_PLAYS.length} plays`}
      >
        <FeaturedPlay play={featured} />
        <div className="mt-2">
          {more.map((p, i) => <PlayRow key={p.id} play={p} isLast={i === more.length - 1} />)}
        </div>
      </CollapsibleSection>
      <div className="mb-6" />

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
      <ActivityFeed
        items={ACTIVITY}
        onSignalAction={(actionId, accountName, item) => {
          if (actionId === "open") {
            openPeek(accountName, "default");
            return;
          }
          const flowMap: Record<string, DrawerFlow> = {
            "draft-email":   "email-draft",
            "build-case":    "build-case",
            "schedule-qbr":  "schedule-qbr",
            "value-snap":    "share-metrics",
            "loop-exec":     "recovery-play",
            "escalate":      "recovery-play",
          };
          const flow = flowMap[actionId] ?? "email-draft";
          setDrawerCfg({
            flow,
            account: accountName,
            title: item.text,
          });
        }}
      />
      <ExecutionDrawer config={drawerCfg} onClose={() => setDrawerCfg(null)} />
      <AccountPeek
        config={peekCfg}
        onClose={() => setPeekCfg(null)}
        onAction={(action, account) => {
          setPeekCfg(null);
          const flow = action === "outreach" ? "email-draft" : "recovery-play";
          setDrawerCfg({
            flow,
            account: account.name,
            title: action === "outreach"
              ? `Outreach to ${account.name}`
              : `Save play for ${account.name}`,
          });
        }}
      />
    </AppShell>
    </PeekCtx.Provider>
    </DrawerCtx.Provider>
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
// CollapsibleSection — wraps a section's content in a collapsible region.
// The header chevron rotates and the content slides on toggle.
// Persists open/closed in localStorage via a per-key flag so the user's
// preference sticks across reloads.
// ─────────────────────────────────────────────────────────────────────
function CollapsibleSection({
  storageKey, label, detail, right, defaultOpen = true, children,
}: {
  storageKey: string;
  label: string;
  detail?: string;
  right?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState<boolean>(defaultOpen);
  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(`alphard:section:${storageKey}`);
      if (raw === "open")  setOpen(true);
      if (raw === "closed") setOpen(false);
    } catch {}
  }, [storageKey]);
  const toggle = () => {
    setOpen((v) => {
      const next = !v;
      try { window.localStorage.setItem(`alphard:section:${storageKey}`, next ? "open" : "closed"); } catch {}
      return next;
    });
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={toggle}
          className="flex items-baseline gap-2.5 group/section"
        >
          <ChevronDown
            size={13}
            strokeWidth={2}
            className="text-muted-2 transition-transform shrink-0 mt-1"
            style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
          />
          <h2 className="text-[14px] font-semibold text-ink group-hover/section:text-ink-2 transition-colors"
            style={{ letterSpacing: "-0.012em" }}>
            {label}
          </h2>
          {detail && <span className="text-[11.5px] text-muted-2 tnum">{detail}</span>}
        </button>
        {right}
      </div>
      <div
        className="grid transition-[grid-template-rows] ease-out"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          transitionDuration: "320ms",
        }}
      >
        <div className="overflow-hidden">
          <div className="pb-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Featured Play — the single most important action today
// ─────────────────────────────────────────────────────────────────────
function FeaturedPlay({ play }: { play: CoPilotPlay }) {
  const drawer = useDrawer();
  const peek = usePeek();
  const [open, setOpen] = useState(false);
  const stale = play.staleDays && play.staleDays >= 5;
  return (
    <div data-tour="featured-play"
      className="rounded-2xl overflow-hidden mb-2"
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
              <button data-tour="draft-btn"
                onClick={() => drawer.open({ flow: "email-draft", account: play.account, person: play.person, title: play.action })}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-2 rounded-lg text-white"
                style={{ background: "var(--accent-deep)" }}>
                <Sparkles size={11} strokeWidth={2.2} /> Draft follow-up
              </button>
              <button onClick={() => peek.open(play.account, "default")}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3.5 py-2 rounded-lg transition-colors hover:bg-bg-deep"
                style={{ background: "var(--surface)", color: "var(--ink-2)", border: "1px solid var(--line)" }}>
                Open account <ArrowRight size={11} strokeWidth={2.2} />
              </button>
              <button data-tour="why-now-btn"
                onClick={() => setOpen((v) => !v)}
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
              <PersonAvatar name={play.person} size={26} />
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
  const peek = usePeek();
  const stale = play.staleDays && play.staleDays >= 5;
  return (
    <button
      type="button"
      onClick={() => peek.open(play.account, "default")}
      className="group w-full flex items-center gap-3 px-3 py-3 hover:bg-bg-deep transition-colors rounded-lg text-left"
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
    </button>
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
  const peek = usePeek();
  const stale = opp.daysInStage >= 14;
  const scoreTone = opp.score >= 85 ? "var(--pos)" : opp.score >= 70 ? "var(--accent)" : "var(--muted)";
  return (
    <button
      type="button"
      onClick={() => peek.open(opp.accountName, "default")}
      className="group rounded-xl p-4 transition-all hover:shadow-sm hover:border-line-strong shrink-0 text-left"
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
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────
// ActivityFeed — chronological signal log grouped by recency.
// Rows are expandable inline — click reveals a kind-specific detail panel.
// ─────────────────────────────────────────────────────────────────────
function ActivityFeed({
  items,
  onSignalAction,
}: {
  items: ActivityItem[];
  onSignalAction?: (actionId: string, account: string, item: ActivityItem) => void;
}) {
  const [openId, setOpenId] = useState<string>("");
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
          <div>
            {b.items.map((i) => (
              <ActivityRow
                key={i.id}
                item={i}
                isOpen={openId === i.id}
                onToggle={() => setOpenId(openId === i.id ? "" : i.id)}
                onAction={(actionId, account) => onSignalAction?.(actionId, account, i)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityRow({
  item, isOpen, onToggle, onAction,
}: {
  item: ActivityItem;
  isOpen: boolean;
  onToggle: () => void;
  onAction: (actionId: string, account: string) => void;
}) {
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
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="group w-full flex items-center gap-3 px-3 py-2.5 -mx-3 rounded-lg hover:bg-bg-deep transition-colors text-left"
        style={{ background: isOpen ? "var(--bg-deep)" : "transparent" }}
      >
        <span className="text-[10.5px] font-mono tnum text-muted-2 w-8 shrink-0 text-right">{item.ago}</span>
        <m.Icon size={12} strokeWidth={2} style={{ color: m.tone }} className="shrink-0" />
        <Logo name={item.account} size={14} rounded={3} />
        <span className="text-[12px] font-semibold text-ink-2 shrink-0">{item.account}</span>
        <span className="text-muted-2">·</span>
        <span className="text-[12px] text-muted-2 truncate flex-1">{item.text}</span>
        <ChevronDown
          size={12}
          strokeWidth={1.8}
          className={`text-muted-2 shrink-0 transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      <div
        className="grid transition-[grid-template-rows] ease-out -mx-3"
        style={{
          gridTemplateRows: isOpen ? "1fr" : "0fr",
          transitionDuration: "320ms",
        }}
      >
        <div className="overflow-hidden">
          {isOpen && (
            <SignalDetail
              item={item as SignalDetailItem}
              onAction={(actionId, account) => onAction(actionId, account)}
            />
          )}
        </div>
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════
// CSM HOME — retention-first workspace
// One narrative: what's at risk → who needs saving → what's healthy
// ════════════════════════════════════════════════════════════════════════

type SavePlay = {
  id: string;
  action: string;
  person: string;
  personTitle: string;
  context: string;
  account: string;
  accountSlug: string;
  arr: number;
  renewalDays?: number;
  staleDays?: number;
  healthScore: number;
  riskKind: "renewal" | "adoption" | "champion" | "qbr" | "tickets";
  detail?: string;
  suggestedReply?: string;
};

const SAVE_PLAYS: SavePlay[] = [
  {
    id: "s1",
    action: "Stabilise Snowflake before renewal slips",
    person: "Brad Wallace",
    personTitle: "VP Sales Ops",
    context: "Renewal in 47 days. James Whitfield (your other sponsor) just left. Brad has gone silent for 14 days — you have one path in and it's narrowing.",
    account: "Snowflake",
    accountSlug: "snowflake-inc",
    arr: 480_000,
    renewalDays: 47,
    staleDays: 14,
    healthScore: 41,
    riskKind: "renewal",
    detail: "Health score 41. Sponsor coverage dropped from two to one in 9 days. Last meaningful exec touch was on Apr 24. Without an exec re-engagement this week, the renewal call moves into procurement-led territory.",
    suggestedReply: "Hi Brad — wanted to surface a few things ahead of the renewal in 47 days. Given James's departure, I want to make sure your team isn't carrying continuity risk alone. Can I send a 10-min loom that summarises the value picture so you can share it with whoever picks up his scope?",
  },
  {
    id: "s2",
    action: "Restart GitLab adoption — three teams fully inactive",
    person: "Alex Rivera",
    personTitle: "Director, Platform Eng",
    context: "WAU/MAU dropped to 0.48. Three of seven teams haven't logged in for 30+ days. Renewal in 64 days. We've sent two nudges with no reply.",
    account: "GitLab",
    accountSlug: "gitlab-inc",
    arr: 320_000,
    renewalDays: 64,
    staleDays: 11,
    healthScore: 52,
    riskKind: "adoption",
    detail: "Onboarding handoff was light — no enablement session ran for the data and infra teams. Alex hasn't replied since the last QBR. Recommended play is a fast 'value snapshot' tied to the renewal conversation, not another nudge.",
    suggestedReply: "Hi Alex — I've put together a one-page snapshot of what's working on your account vs where adoption has slipped. Worth a 20-min call this week to walk through it ahead of the renewal? I'd rather flag it now than be surprised later.",
  },
  {
    id: "s3",
    action: "Recover the Akamai QBR — overdue 14 days",
    person: "Priya Sharma",
    personTitle: "Head of Revenue Operations",
    context: "QBR overdue 14 days — expansion narrative is stale. Priya is new to the role and hasn't yet been briefed by her predecessor.",
    account: "Akamai",
    accountSlug: "akamai-technologies",
    arr: 560_000,
    healthScore: 64,
    riskKind: "qbr",
  },
  {
    id: "s4",
    action: "Tableau ticket spike — three sev-2s open",
    person: "Owen Marsh",
    personTitle: "Director of Analytics",
    context: "Three sev-2 tickets opened in the last 5 days. SLA breach risk on two. Owen has cc'd his VP on the latest reply.",
    account: "Tableau",
    accountSlug: "tableau-software",
    arr: 410_000,
    healthScore: 68,
    riskKind: "tickets",
  },
  {
    id: "s5",
    action: "Re-engage GitLab champion — usage decay",
    person: "Sam Patel",
    personTitle: "Engineering Manager",
    context: "Sam was your highest-engaged user. His chat usage dropped from 28/14d to 4/14d. No login in 9 days. Feels like a quiet exit.",
    account: "GitLab",
    accountSlug: "gitlab-inc",
    arr: 320_000,
    staleDays: 9,
    healthScore: 52,
    riskKind: "champion",
  },
];

const CSM_ACTIVITY: ActivityItem[] = [
  { id: "ca1", kind: "departure", account: "Snowflake",  accountSlug: "snowflake-inc",       text: "Sponsor Brad Wallace silent 14 days — renewal at risk",        ago: "2h",   bucket: "today" },
  { id: "ca2", kind: "usage",     account: "GitLab",     accountSlug: "gitlab-inc",          text: "WAU/MAU dropped further to 0.48 — three teams now inactive",   ago: "4h",   bucket: "today" },
  { id: "ca3", kind: "renewal",   account: "Akamai",     accountSlug: "akamai-technologies", text: "QBR now 14 days overdue — expansion narrative stale",          ago: "today",bucket: "today" },
  { id: "ca4", kind: "note",      account: "Tableau",    accountSlug: "tableau-software",    text: "3rd sev-2 ticket opened this week — SLA risk on 2 of 3",       ago: "6h",   bucket: "today" },
  { id: "ca5", kind: "champion",  account: "Cloudflare", accountSlug: "cloudflare-inc",      text: "Maya Chen promoted to VP Eng — refresh exec sponsor map",      ago: "12h",  bucket: "today" },
  { id: "ca6", kind: "departure", account: "Snowflake",  accountSlug: "snowflake-inc",       text: "James Whitfield (VP Sales Ops) left — succession needed",      ago: "2d",   bucket: "yesterday" },
  { id: "ca7", kind: "usage",     account: "Tableau",    accountSlug: "tableau-software",    text: "12 new seats added — onboard the ML team this sprint",         ago: "2d",   bucket: "yesterday" },
  { id: "ca8", kind: "note",      account: "GitLab",     accountSlug: "gitlab-inc",          text: "NPS dipped to 28 (was 41 last quarter) — open verbatims",      ago: "3d",   bucket: "earlier" },
  { id: "ca9", kind: "renewal",   account: "Cloudflare", accountSlug: "cloudflare-inc",      text: "Renewal kickoff scheduled with procurement for May 22",        ago: "3d",   bucket: "earlier" },
  { id: "ca10",kind: "usage",     account: "Snowflake",  accountSlug: "snowflake-inc",       text: "ML Ops team running API in prod — new use case to capture",   ago: "4d",   bucket: "earlier" },
];

const RISK_KIND_META: Record<SavePlay["riskKind"], { label: string; tone: string; soft: string; Icon: any }> = {
  renewal:  { label: "Renewal at risk", tone: "var(--neg)",   soft: "var(--neg-soft)",   Icon: RefreshCw },
  adoption: { label: "Adoption decay",  tone: "var(--warn)",  soft: "var(--warn-soft)",  Icon: TrendingDown },
  champion: { label: "Champion drift",  tone: "var(--warn)",  soft: "var(--warn-soft)",  Icon: Users },
  qbr:      { label: "QBR overdue",     tone: "var(--info)",  soft: "var(--info-soft)",  Icon: Calendar },
  tickets:  { label: "Ticket spike",    tone: "var(--neg)",   soft: "var(--neg-soft)",   Icon: LifeBuoy },
};

function healthTone(score: number): string {
  if (score >= 75) return "var(--pos)";
  if (score >= 60) return "var(--warn)";
  return "var(--neg)";
}

// Map an activity item kind into a peek activity tone
function activityToneFor(kind: ActivityKind): PeekActivity["tone"] {
  switch (kind) {
    case "departure": return "neg";
    case "renewal":   return "warn";
    case "champion":  return "pos";
    case "deal":      return "pos";
    case "usage":     return "info";
    case "note":      return "neutral";
    default:          return "neutral";
  }
}
// Same mapping for AM-side activity items (which use the same kind enum)
const amActivityTone = activityToneFor;

function CSMHome() {
  const greeting = greetingFor();
  const { user } = useUser();
  const [drawerCfg, setDrawerCfg] = useState<DrawerConfig | null>(null);
  const [peekCfg, setPeekCfg] = useState<PeekConfig | null>(null);

  const openPeek = (account: Account, source: PeekConfig["source"]) => {
    const activity: PeekActivity[] = CSM_ACTIVITY
      .filter((a) => a.account === account.name.replace(/, Inc\.?$| Inc\.?$| Software$| Technologies$/i, ""))
      .map((a) => ({ id: a.id, text: a.text, ago: a.ago, tone: activityToneFor(a.kind) }));
    setPeekCfg({ account, source, activity });
  };

  // Real customers from accounts data
  const customers = useMemo(() => accounts.filter((a) => a.status === "Customer"), []);
  const myBook = useMemo(() => customers.slice(0, 14), [customers]);
  const bookArr = myBook.reduce((s, a) => s + (a.arr || 0), 0);
  const atRiskCount = myBook.filter((a) => a.healthScore < 60).length;
  const watchCount = myBook.filter((a) => a.healthScore >= 60 && a.healthScore < 75).length;
  const healthyCount = myBook.filter((a) => a.healthScore >= 75).length;

  // Renewals next 90 days from accounts with positive renewalDays <= 90
  const renewals90 = useMemo(
    () =>
      myBook
        .filter((a) => a.renewalDays > 0 && a.renewalDays <= 90)
        .sort((a, b) => a.renewalDays - b.renewalDays)
        .slice(0, 6),
    [myBook]
  );
  // If we don't have enough renewals from the data, derive a few synthetically
  const renewalRow: Array<{ account: typeof customers[number]; days: number }> =
    renewals90.length >= 4
      ? renewals90.map((a) => ({ account: a, days: a.renewalDays }))
      : myBook.slice(0, 6).map((a, i) => ({
          account: a,
          days: a.renewalDays > 0 ? a.renewalDays : 18 + i * 14,
        }));

  const renewalArr = renewalRow.reduce((s, r) => s + (r.account.arr || 0), 0);

  // PeekCtx opener that uses CSMHome's openPeek (which knows about CSM_ACTIVITY).
  const peekOpener: PeekOpener = (accountName, source = "default") => {
    const acct = resolveAccountByName(accountName);
    if (acct) openPeek(acct, source);
  };

  return (
    <DrawerCtx.Provider value={{ open: setDrawerCfg }}>
    <PeekCtx.Provider value={{ open: peekOpener }}>
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
                <span><span className="font-semibold text-ink-2 tnum">{fmtMoney(bookArr)}</span> book</span>
                <span className="text-muted-2">·</span>
                <span><span className="font-semibold text-ink-2 tnum">{myBook.length}</span> customers</span>
                <span className="text-muted-2">·</span>
                <span><span className="font-semibold text-ink-2 tnum">{atRiskCount + watchCount}</span> need attention</span>
              </div>
            </div>
            <DataFreshness minutesAgo={3} sources={["Salesforce", "Mixpanel", "Zendesk", "Intercom", "Alphy AI"] as any} />
          </div>
        </header>

        {/* ─── Today's Saves ──────────────────────────────────────── */}
        <CollapsibleSection
          storageKey="csm-saves"
          label="Today's saves"
          detail={`${SAVE_PLAYS.length} plays · sorted by ARR at risk`}
        >
          <SavesAccordion plays={SAVE_PLAYS} />
        </CollapsibleSection>
        <div className="mb-6" />

        {/* ─── Renewal Runway ─────────────────────────────────────── */}
        <SectionHeader
          label="Renewal runway"
          detail={`${fmtMoney(renewalArr)} across ${renewalRow.length} renewals · next 90 days`}
          right={<Link href="/renewals" className="text-[11.5px] font-medium text-muted hover:text-ink inline-flex items-center gap-1">View all renewals <ChevronRight size={11} /></Link>}
        />
        <div className="mb-10 -mx-2 overflow-x-auto">
          <div className="flex items-stretch gap-3 px-2 min-w-min">
            {renewalRow.map((r) => (
              <RenewalTile
                key={r.account.id}
                account={r.account}
                days={r.days}
              />
            ))}
          </div>
        </div>

        {/* ─── Health Distribution ────────────────────────────────── */}
        <SectionHeader
          label="Health distribution"
          detail={`${myBook.length} customers · ${atRiskCount} at risk · ${watchCount} watch · ${healthyCount} healthy`}
          right={<Link href="/portfolio" className="text-[11.5px] font-medium text-muted hover:text-ink inline-flex items-center gap-1">Open portfolio <ChevronRight size={11} /></Link>}
        />
        <HealthDistribution
          book={myBook}
          atRisk={atRiskCount}
          watch={watchCount}
          healthy={healthyCount}
        />

        {/* ─── Activity ───────────────────────────────────────────── */}
        <SectionHeader
          label="Activity"
          detail={`${CSM_ACTIVITY.length + 8} signals this week`}
          right={<Link href="/signals" className="text-[11.5px] font-medium text-muted hover:text-ink inline-flex items-center gap-1">All signals <ChevronRight size={11} /></Link>}
        />
        <ActivityFeed
          items={CSM_ACTIVITY}
          onSignalAction={(actionId, accountName, item) => {
            // "open" → open the AccountPeek if we can find the matching Account
            if (actionId === "open") {
              const acct = customers.find((a) =>
                a.name === accountName ||
                a.name.startsWith(accountName) ||
                accountName.startsWith(a.name.split(" ")[0])
              );
              if (acct) openPeek(acct, "default");
              return;
            }
            // Map action ids to drawer flows
            const flowMap: Record<string, DrawerFlow> = {
              "loop-exec":     "recovery-play",
              "draft-email":   "email-draft",
              "value-snap":    "share-metrics",
              "schedule-train":"schedule-qbr",
              "build-case":    "build-case",
              "schedule-qbr":  "schedule-qbr",
              "escalate":      "recovery-play",
            };
            const flow = flowMap[actionId] ?? "email-draft";
            setDrawerCfg({
              flow,
              account: accountName,
              title: item.text,
            });
          }}
        />
        <ExecutionDrawer config={drawerCfg} onClose={() => setDrawerCfg(null)} />
        <AccountPeek
          config={peekCfg}
          onClose={() => setPeekCfg(null)}
          onAction={(action, account) => {
            // Close the peek and open the relevant drawer flow
            setPeekCfg(null);
            const flow = action === "outreach" ? "email-draft" : "recovery-play";
            setDrawerCfg({
              flow,
              account: account.name,
              title: action === "outreach"
                ? `Outreach to ${account.name}`
                : `Save play for ${account.name}`,
            });
          }}
        />
      </AppShell>
    </PeekCtx.Provider>
    </DrawerCtx.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SavesAccordion — collapsible list of save plays.
// One play expanded at a time. Default expanded = first.
// ─────────────────────────────────────────────────────────────────────
function SavesAccordion({ plays }: { plays: SavePlay[] }) {
  const [openId, setOpenId] = useState<string>(plays[0]?.id ?? "");
  const [whyOpen, setWhyOpen] = useState<Record<string, boolean>>({});

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
      }}>
      {plays.map((play, i) => {
        const isOpen = play.id === openId;
        return (
          <SaveAccordionRow
            key={play.id}
            play={play}
            isOpen={isOpen}
            isFirst={i === 0}
            isLast={i === plays.length - 1}
            onToggle={() => setOpenId(isOpen ? "" : play.id)}
            whyOpen={!!whyOpen[play.id]}
            onToggleWhy={() => setWhyOpen((prev) => ({ ...prev, [play.id]: !prev[play.id] }))}
          />
        );
      })}
    </div>
  );
}

function SaveAccordionRow({
  play, isOpen, isFirst, isLast, onToggle, whyOpen, onToggleWhy,
}: {
  play: SavePlay;
  isOpen: boolean;
  isFirst: boolean;
  isLast: boolean;
  onToggle: () => void;
  whyOpen: boolean;
  onToggleWhy: () => void;
}) {
  const drawer = useDrawer();
  const peek = usePeek();
  const meta = RISK_KIND_META[play.riskKind];

  return (
    <div style={{ borderTop: isFirst ? "none" : "1px solid var(--line)" }}>
      {/* Header row — always visible */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-bg-deep/40"
        style={{ background: isOpen ? "var(--bg-deep)" : "transparent" }}
      >
        {/* Risk-kind dot */}
        <span className="relative w-2 h-2 rounded-full shrink-0" style={{ background: meta.tone }}>
          {isOpen && (
            <span className="absolute inset-0 rounded-full animate-ping"
              style={{ background: meta.tone, opacity: 0.4 }} />
          )}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[13.5px] ${isOpen ? "font-semibold text-ink" : "font-medium text-ink"}`}>
              {play.action}
            </span>
            <span className="text-muted-2">·</span>
            <Logo name={play.account} size={12} rounded={3} />
            <span className="text-[11.5px] text-muted">{play.account}</span>
            <span className="text-muted-2">·</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{ background: meta.soft, color: meta.tone }}>
              <meta.Icon size={9} strokeWidth={2.2} />
              {meta.label}
            </span>
            {play.renewalDays !== undefined && (
              <>
                <span className="text-muted-2">·</span>
                <span className="text-[11px] tnum text-muted">{play.renewalDays}d to renewal</span>
              </>
            )}
          </div>
        </div>

        <span className="text-[11.5px] font-mono tnum text-muted-2 shrink-0">{fmtMoney(play.arr)}</span>
        <ChevronDown
          size={14}
          strokeWidth={1.8}
          className="text-muted-2 shrink-0 transition-transform duration-300"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Expanded body */}
      <div
        className="grid transition-[grid-template-rows] ease-out"
        style={{
          gridTemplateRows: isOpen ? "1fr" : "0fr",
          transitionDuration: "380ms",
        }}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-12 gap-0 border-t border-line">
            {/* Left side — context, why-now, actions */}
            <div className="col-span-12 lg:col-span-8 px-5 py-5 relative">
              <div className="absolute left-0 top-5 bottom-5 w-[3px] rounded-r-full"
                style={{ background: meta.tone }} />
              <div className="pl-2">
                <p className="text-[13.5px] text-muted leading-relaxed max-w-2xl mb-4">
                  {play.context}
                </p>

                {whyOpen && play.detail && (
                  <div className="mb-4 p-4 rounded-xl"
                    style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1.5">
                      Why now
                    </div>
                    <div className="text-[12.5px] text-ink-2 leading-relaxed mb-3">
                      {play.detail}
                    </div>
                    {play.suggestedReply && (
                      <>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1.5 flex items-center gap-1.5">
                          <Sparkles size={10} strokeWidth={2.2} style={{ color: "var(--accent-deep)" }} />
                          Suggested message
                        </div>
                        <div className="rounded-lg px-3 py-2.5 text-[12px] text-ink-2 leading-relaxed font-mono"
                          style={{ background: "var(--bg)", border: "1px solid var(--line)" }}>
                          {play.suggestedReply}
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      drawer.open({ flow: "recovery-play", account: play.account, person: play.person, title: play.action });
                    }}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-2 rounded-lg text-white transition-transform hover:scale-[1.02]"
                    style={{ background: "var(--accent-deep)" }}>
                    <Sparkles size={11} strokeWidth={2.2} /> Run save play
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      drawer.open({ flow: "email-draft", account: play.account, person: play.person, title: play.action });
                    }}
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3.5 py-2 rounded-lg transition-colors hover:bg-bg-deep"
                    style={{ background: "var(--bg)", color: "var(--ink-2)", border: "1px solid var(--line)" }}>
                    <Mail size={11} strokeWidth={2.2} /> Draft outreach
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); peek.open(play.account, "default"); }}
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3.5 py-2 rounded-lg transition-colors hover:bg-bg-deep"
                    style={{ background: "var(--bg)", color: "var(--ink-2)", border: "1px solid var(--line)" }}>
                    Open account <ArrowRight size={11} strokeWidth={2.2} />
                  </button>
                  {play.detail && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleWhy(); }}
                      className="text-[11.5px] text-muted hover:text-ink ml-1 inline-flex items-center gap-1">
                      {whyOpen ? "Hide context" : "Why now"}
                      <ChevronDown size={11} strokeWidth={2}
                        className="transition-transform"
                        style={{ transform: whyOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right meta */}
            <div className="col-span-12 lg:col-span-4 px-5 py-5 lg:border-l border-line lg:bg-bg-deep/30 flex flex-col gap-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1">Sponsor</div>
                <div className="flex items-center gap-2">
                  <PersonAvatar name={play.person} size={26} ring={meta.tone} />
                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold text-ink truncate">{play.person}</div>
                    <div className="text-[10.5px] text-muted truncate">{play.personTitle}</div>
                  </div>
                </div>
              </div>
              {play.renewalDays !== undefined && (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1">Renewal in</div>
                  <div className="text-[18px] font-bold tnum text-ink" style={{ letterSpacing: "-0.018em" }}>
                    {play.renewalDays} <span className="text-[12px] font-medium text-muted">days</span>
                  </div>
                </div>
              )}
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1">Health</div>
                <div className="flex items-center gap-2">
                  <div className="text-[18px] font-bold tnum" style={{ color: healthTone(play.healthScore), letterSpacing: "-0.018em" }}>
                    {play.healthScore}
                  </div>
                  <div className="flex-1 h-1.5 rounded-full bg-bg-deep overflow-hidden" style={{ border: "1px solid var(--line)" }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${play.healthScore}%`, background: healthTone(play.healthScore) }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// RenewalTile — single renewal in horizontal pipeline
// ─────────────────────────────────────────────────────────────────────
function RenewalTile({ account, days }: { account: Account; days: number }) {
  const peek = usePeek();
  const urgent = days <= 30;
  const tone = urgent ? "var(--neg)" : days <= 60 ? "var(--warn)" : "var(--info)";
  const hTone = healthTone(account.healthScore);
  return (
    <button
      type="button"
      onClick={() => peek.open(account.name, "renewal")}
      className="group rounded-xl p-4 transition-all hover:shadow-sm hover:border-line-strong shrink-0 text-left"
      style={{
        width: 220,
        background: "var(--surface)",
        border: "1px solid var(--line)",
      }}>
      <div className="flex items-center gap-2 mb-3">
        <Logo name={account.name} size={22} rounded={5} />
        <div className="min-w-0 flex-1">
          <div className="text-[12.5px] font-semibold text-ink truncate">{account.name}</div>
          <div className="text-[10px] text-muted truncate">{account.tier} · {account.segment}</div>
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-[20px] font-bold tnum text-ink leading-none" style={{ letterSpacing: "-0.018em" }}>
          {fmtMoney(account.arr)}
        </span>
        <span className="text-[10.5px] font-semibold tnum" style={{ color: hTone }}>
          {account.healthScore}
        </span>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-line">
        <span className="inline-flex items-center gap-1 text-[10.5px] font-medium" style={{ color: tone }}>
          <Calendar size={10} strokeWidth={2} />
          {days}d
        </span>
        <span className="text-[10px] text-muted-2 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Preview <ArrowRight size={9} strokeWidth={2} />
        </span>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────
// HealthDistribution — three columns sorted by health bracket
// ─────────────────────────────────────────────────────────────────────
function HealthDistribution({ book, atRisk, watch, healthy }: {
  book: Account[]; atRisk: number; watch: number; healthy: number;
}) {
  const atRiskList = book.filter((a) => a.healthScore < 60).sort((a, b) => a.healthScore - b.healthScore).slice(0, 5);
  const watchList  = book.filter((a) => a.healthScore >= 60 && a.healthScore < 75).sort((a, b) => a.healthScore - b.healthScore).slice(0, 5);
  const healthyList = book.filter((a) => a.healthScore >= 75).sort((a, b) => b.healthScore - a.healthScore).slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
      <HealthColumn title="At risk" count={atRisk} tone="var(--neg)"  soft="var(--neg-soft)"  Icon={AlertTriangle} list={atRiskList}  cta="Build save plan" />
      <HealthColumn title="Watch"   count={watch}  tone="var(--warn)" soft="var(--warn-soft)" Icon={Eye}           list={watchList}   cta="Add to QBR"      />
      <HealthColumn title="Healthy" count={healthy} tone="var(--pos)" soft="var(--pos-soft)"  Icon={ShieldCheck}   list={healthyList} cta="Surface advocacy" />
    </div>
  );
}

function HealthColumn({ title, count, tone, soft, Icon, list, cta }: {
  title: string; count: number; tone: string; soft: string; Icon: any;
  list: Account[]; cta: string;
}) {
  const peek = usePeek();
  return (
    <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md grid place-items-center" style={{ background: soft }}>
            <Icon size={12} strokeWidth={2} style={{ color: tone }} />
          </div>
          <span className="text-[13px] font-semibold text-ink">{title}</span>
          <span className="text-[10.5px] font-mono text-muted-2 bg-bg-deep px-1.5 py-0.5 rounded">{count}</span>
        </div>
        <span className="text-[10.5px] text-muted-2">{cta}</span>
      </div>
      <div className="space-y-1.5">
        {list.length === 0 ? (
          <div className="text-[11.5px] text-muted-2 py-4 text-center">Nothing here</div>
        ) : list.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => peek.open(a.name, "health")}
            className="group w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-bg-deep transition-colors text-left">
            <Logo name={a.name} size={20} rounded={4} />
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-ink truncate">{a.name}</div>
              <div className="text-[10px] text-muted truncate">{a.signal}</div>
            </div>
            <span className="text-[10.5px] font-semibold tnum shrink-0" style={{ color: tone }}>{a.healthScore}</span>
            <span className="text-[10px] font-mono tnum text-muted-2 shrink-0 w-12 text-right">{fmtMoney(a.arr)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// MANAGER HOME — team performance & escalation workspace
// One narrative: who needs help → how the team is loaded → what changed
// ════════════════════════════════════════════════════════════════════════

type Escalation = {
  id: string;
  reason: "coaching" | "save" | "reassign" | "pipeline" | "qbr";
  title: string;
  rep: string;
  account?: string;
  arr?: number;
  context: string;
  detail?: string;
};

const ESCALATIONS: Escalation[] = [
  {
    id: "e1",
    reason: "save",
    title: "Snowflake renewal slipping — Brad needs leadership air cover",
    rep: "Brad Allen",
    account: "Snowflake",
    arr: 480_000,
    context: "Renewal in 47 days. Sponsor coverage dropped to 1. Brad has tried two re-engagement emails with no reply. Time for an exec-to-exec.",
    detail: "Suggested play: schedule a quick call with their CTO this week and run the recovery playbook with Brad. Forecast confidence at 38%.",
  },
  {
    id: "e2",
    reason: "coaching",
    title: "Sarah is stalling on three Strategic accounts",
    rep: "Sarah Chen",
    context: "Below quota at 62% with 9 days left in the month. Three accounts haven't moved stage in 21+ days. Worth a 30-min coaching review on the deals stuck in Negotiation.",
    detail: "Patterns suggest she's struggling with procurement objections — same root cause across all three.",
  },
  {
    id: "e3",
    reason: "reassign",
    title: "Brad is overloaded — 12 accounts, 5 renewals, 82 workload",
    rep: "Brad Allen",
    context: "Workload score 82 vs team average 59. Two accounts (Mailchimp, Algolia) could move to Derek (35 score, has capacity) without disruption.",
    detail: "Brad's at-risk count is the team's highest. Reassignment would free him to focus on Snowflake renewal.",
  },
  {
    id: "e4",
    reason: "pipeline",
    title: "Pipeline coverage gap — Mid-Market segment at 0.9x",
    rep: "Team-wide",
    context: "Q3 expansion target needs 1.4x coverage; Mid-Market sits at 0.9x. Gap of $480K to fill in 32 days.",
    detail: "Three accounts in your team's book have unactivated White Space — worth surfacing those plays this week.",
  },
  {
    id: "e5",
    reason: "qbr",
    title: "Akamai QBR overdue 14 days — Priya is new to the role",
    rep: "Paul Acker",
    account: "Akamai",
    arr: 540_000,
    context: "Paul mentioned not wanting to push too hard on a new champion, but the QBR cadence is breaking. Worth a leader nudge to get it on the books.",
  },
];

const ESCALATION_META: Record<Escalation["reason"], { label: string; tone: string; soft: string; Icon: any }> = {
  coaching: { label: "Coaching",     tone: "var(--info)",  soft: "var(--info-soft)",  Icon: Users },
  save:     { label: "Save help",    tone: "var(--neg)",   soft: "var(--neg-soft)",   Icon: AlertTriangle },
  reassign: { label: "Reassign",     tone: "var(--warn)",  soft: "var(--warn-soft)",  Icon: ArrowRight },
  pipeline: { label: "Pipeline gap", tone: "var(--accent-deep)", soft: "var(--accent-soft)", Icon: TrendingDown },
  qbr:      { label: "QBR slip",     tone: "var(--warn)",  soft: "var(--warn-soft)",  Icon: Calendar },
};

// Manager-flavoured activity feed
const MANAGER_ACTIVITY: ActivityItem[] = [
  { id: "ma1", kind: "departure", account: "Snowflake",  accountSlug: "snowflake-inc",       text: "Brad's escalation: sponsor silent 14 days — needs exec air cover", ago: "2h",  bucket: "today" },
  { id: "ma2", kind: "deal",      account: "Cloudflare", accountSlug: "cloudflare-inc",      text: "Brad closed Cloudflare AI Copilot expansion · +$120K ARR",        ago: "4h",  bucket: "today" },
  { id: "ma3", kind: "renewal",   account: "Akamai",     accountSlug: "akamai-technologies", text: "Paul flagged Akamai QBR slipping — needs nudge",                  ago: "6h",  bucket: "today" },
  { id: "ma4", kind: "champion",  account: "Cloudflare", accountSlug: "cloudflare-inc",      text: "Maya Chen promoted to VP Eng — Sarah notified",                   ago: "12h", bucket: "today" },
  { id: "ma5", kind: "note",      account: "Tableau",    accountSlug: "tableau-software",    text: "Lisa won the Tableau ML governance pilot — case study queued",    ago: "1d",  bucket: "yesterday" },
  { id: "ma6", kind: "usage",     account: "GitLab",     accountSlug: "gitlab-inc",          text: "Brad assigned recovery playbook on GitLab — running",             ago: "1d",  bucket: "yesterday" },
  { id: "ma7", kind: "deal",      account: "Tableau",    accountSlug: "tableau-software",    text: "Lisa expanded Tableau seats · +12 ML team",                       ago: "2d",  bucket: "earlier" },
  { id: "ma8", kind: "renewal",   account: "Snowflake",  accountSlug: "snowflake-inc",       text: "Snowflake renewal kickoff scheduled with procurement May 22",     ago: "3d",  bucket: "earlier" },
];

function ManagerHome() {
  const greeting = greetingFor();
  const { user } = useUser();
  const [drawerCfg, setDrawerCfg] = useState<DrawerConfig | null>(null);
  const [peekCfg, setPeekCfg] = useState<PeekConfig | null>(null);
  const [openEscalationId, setOpenEscalationId] = useState<string>(ESCALATIONS[0]?.id ?? "");

  const openPeek = (account: Account, source: PeekConfig["source"]) => {
    const activity: PeekActivity[] = MANAGER_ACTIVITY
      .filter((a) => a.account === account.name.replace(/, Inc\.?$| Inc\.?$| Software$| Technologies$/i, ""))
      .map((a) => ({ id: a.id, text: a.text, ago: a.ago, tone: amActivityTone(a.kind) }));
    setPeekCfg({ account, source, activity });
  };

  const peekOpener: PeekOpener = (accountName, source = "default") => {
    const acct = resolveAccountByName(accountName);
    if (acct) openPeek(acct, source);
  };

  // Team stats
  const teamArr = csmWorkloads.reduce((s, c) => s + c.totalArr, 0);
  const teamAccounts = csmWorkloads.reduce((s, c) => s + c.accounts, 0);
  const teamAtRisk = csmWorkloads.reduce((s, c) => s + c.healthMix.atRisk, 0);
  const teamRenewals90 = csmWorkloads.reduce((s, c) => s + c.renewalsNext90, 0);
  const totalSignals = MANAGER_ACTIVITY.length + 14;

  // Performance brackets
  const topPerformers = [...csmWorkloads]
    .filter((c) => c.workloadScore >= 50 && c.workloadScore <= 75 && c.healthMix.atRisk <= 1)
    .sort((a, b) => b.totalArr - a.totalArr).slice(0, 3);
  const overloaded = [...csmWorkloads].filter((c) => c.workloadScore >= 75)
    .sort((a, b) => b.workloadScore - a.workloadScore).slice(0, 3);
  const underutilised = [...csmWorkloads].filter((c) => c.workloadScore < 50)
    .sort((a, b) => a.workloadScore - b.workloadScore).slice(0, 3);

  return (
    <DrawerCtx.Provider value={{ open: setDrawerCfg }}>
    <PeekCtx.Provider value={{ open: peekOpener }}>
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
                <span><span className="font-semibold text-ink-2 tnum">{fmtMoney(teamArr)}</span> team book</span>
                <span className="text-muted-2">·</span>
                <span><span className="font-semibold text-ink-2 tnum">{csmWorkloads.length}</span> reps</span>
                <span className="text-muted-2">·</span>
                <span><span className="font-semibold text-ink-2 tnum">{teamRenewals90}</span> renewals next 90d</span>
              </div>
            </div>
            <DataFreshness minutesAgo={3} sources={["Salesforce", "Clari", "Gong", "Alphy AI"] as any} />
          </div>
        </header>

        {/* ─── Today's escalations ─────────────────────────────── */}
        <CollapsibleSection
          storageKey="manager-escalations"
          label="Today's escalations"
          detail={`${ESCALATIONS.length} need your attention`}
        >
          <EscalationsAccordion
            items={ESCALATIONS}
            openId={openEscalationId}
            onToggle={(id) => setOpenEscalationId(openEscalationId === id ? "" : id)}
          />
        </CollapsibleSection>
        <div className="mb-6" />

        {/* ─── Team workload ───────────────────────────────────── */}
        <SectionHeader
          label="Team workload"
          detail={`${csmWorkloads.length} reps · ${teamAccounts} accounts · ${teamAtRisk} at risk`}
          right={<Link href="/capacity" className="text-[11.5px] font-medium text-muted hover:text-ink inline-flex items-center gap-1">Capacity planning <ChevronRight size={11} /></Link>}
        />
        <div className="mb-10 -mx-2 overflow-x-auto">
          <div className="flex items-stretch gap-3 px-2 min-w-min">
            {csmWorkloads.map((rep) => <RepTile key={rep.id} rep={rep} />)}
          </div>
        </div>

        {/* ─── Performance distribution ────────────────────────── */}
        <SectionHeader
          label="Performance distribution"
          detail={`${overloaded.length} overloaded · ${topPerformers.length} on track · ${underutilised.length} room to grow`}
          right={<Link href="/revenue" className="text-[11.5px] font-medium text-muted hover:text-ink inline-flex items-center gap-1">Revenue waterfall <ChevronRight size={11} /></Link>}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
          <PerfColumn title="Overloaded" count={overloaded.length} tone="var(--neg)" soft="var(--neg-soft)" Icon={AlertTriangle} list={overloaded} cta="Reassign accounts" />
          <PerfColumn title="On track"   count={topPerformers.length} tone="var(--pos)" soft="var(--pos-soft)" Icon={ShieldCheck} list={topPerformers} cta="Surface as advocate" />
          <PerfColumn title="Room to grow" count={underutilised.length} tone="var(--info)" soft="var(--info-soft)" Icon={TrendingUp} list={underutilised} cta="Add accounts" />
        </div>

        {/* ─── Activity ────────────────────────────────────────── */}
        <SectionHeader
          label="Activity"
          detail={`${totalSignals} team signals this week`}
          right={<Link href="/signals" className="text-[11.5px] font-medium text-muted hover:text-ink inline-flex items-center gap-1">All signals <ChevronRight size={11} /></Link>}
        />
        <ActivityFeed
          items={MANAGER_ACTIVITY}
          onSignalAction={(actionId, accountName, item) => {
            if (actionId === "open") {
              peekOpener(accountName, "default");
              return;
            }
            const flowMap: Record<string, DrawerFlow> = {
              "draft-email":    "email-draft",
              "build-case":     "build-case",
              "schedule-qbr":   "schedule-qbr",
              "value-snap":     "share-metrics",
              "loop-exec":      "recovery-play",
              "escalate":       "recovery-play",
            };
            const flow = flowMap[actionId] ?? "email-draft";
            setDrawerCfg({
              flow,
              account: accountName,
              title: item.text,
            });
          }}
        />
        <ExecutionDrawer config={drawerCfg} onClose={() => setDrawerCfg(null)} />
        <AccountPeek
          config={peekCfg}
          onClose={() => setPeekCfg(null)}
          onAction={(action, account) => {
            setPeekCfg(null);
            const flow = action === "outreach" ? "email-draft" : "recovery-play";
            setDrawerCfg({
              flow,
              account: account.name,
              title: action === "outreach"
                ? `Outreach to ${account.name}`
                : `Save play for ${account.name}`,
            });
          }}
        />
      </AppShell>
    </PeekCtx.Provider>
    </DrawerCtx.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Escalations accordion — same visual pattern as SavesAccordion
// ─────────────────────────────────────────────────────────────────────
function EscalationsAccordion({ items, openId, onToggle }: {
  items: Escalation[]; openId: string; onToggle: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
      }}>
      {items.map((e, i) => (
        <EscalationRow
          key={e.id}
          escalation={e}
          isOpen={e.id === openId}
          isFirst={i === 0}
          onToggle={() => onToggle(e.id)}
        />
      ))}
    </div>
  );
}

function EscalationRow({ escalation, isOpen, isFirst, onToggle }: {
  escalation: Escalation; isOpen: boolean; isFirst: boolean; onToggle: () => void;
}) {
  const drawer = useDrawer();
  const peek = usePeek();
  const meta = ESCALATION_META[escalation.reason];

  return (
    <div style={{ borderTop: isFirst ? "none" : "1px solid var(--line)" }}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-bg-deep/40"
        style={{ background: isOpen ? "var(--bg-deep)" : "transparent" }}
      >
        <span className="relative w-2 h-2 rounded-full shrink-0" style={{ background: meta.tone }}>
          {isOpen && (
            <span className="absolute inset-0 rounded-full animate-ping"
              style={{ background: meta.tone, opacity: 0.4 }} />
          )}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[13.5px] ${isOpen ? "font-semibold text-ink" : "font-medium text-ink"}`}>
              {escalation.title}
            </span>
            <span className="text-muted-2">·</span>
            <span className="text-[11.5px] text-muted">{escalation.rep}</span>
            <span className="text-muted-2">·</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{ background: meta.soft, color: meta.tone }}>
              <meta.Icon size={9} strokeWidth={2.2} />
              {meta.label}
            </span>
          </div>
        </div>

        {escalation.arr && (
          <span className="text-[11.5px] font-mono tnum text-muted-2 shrink-0">{fmtMoney(escalation.arr)}</span>
        )}
        <ChevronDown
          size={14}
          strokeWidth={1.8}
          className="text-muted-2 shrink-0 transition-transform duration-300"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      <div
        className="grid transition-[grid-template-rows] ease-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr", transitionDuration: "380ms" }}
      >
        <div className="overflow-hidden">
          <div className="px-5 py-5 border-t border-line relative">
            <div className="absolute left-0 top-5 bottom-5 w-[3px] rounded-r-full"
              style={{ background: meta.tone }} />
            <div className="pl-2">
              <p className="text-[13.5px] text-muted leading-relaxed max-w-2xl mb-3">
                {escalation.context}
              </p>
              {escalation.detail && (
                <div className="mb-4 p-3 rounded-lg"
                  style={{ background: "var(--bg-deep)", border: "1px solid var(--line)" }}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1.5">
                    Coach's note
                  </div>
                  <div className="text-[12.5px] text-ink-2 leading-relaxed">{escalation.detail}</div>
                </div>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                {escalation.account && (
                  <button
                    onClick={(ev) => {
                      ev.stopPropagation();
                      drawer.open({
                        flow: escalation.reason === "save" ? "recovery-play" : "email-draft",
                        account: escalation.account,
                        title: escalation.title,
                      });
                    }}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-2 rounded-lg text-white transition-transform hover:scale-[1.02]"
                    style={{ background: "var(--ink)" }}>
                    <Sparkles size={11} strokeWidth={2.2} /> Run play with {escalation.rep.split(" ")[0]}
                  </button>
                )}
                {escalation.reason === "coaching" && (
                  <button
                    onClick={(ev) => {
                      ev.stopPropagation();
                      drawer.open({ flow: "schedule-qbr", account: escalation.rep, title: `1:1 review with ${escalation.rep}` });
                    }}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-2 rounded-lg text-white transition-transform hover:scale-[1.02]"
                    style={{ background: "var(--ink)" }}>
                    <Calendar size={11} strokeWidth={2.2} /> Schedule 1:1
                  </button>
                )}
                {escalation.reason === "reassign" && (
                  <button
                    onClick={(ev) => { ev.stopPropagation(); window.location.href = "/capacity"; }}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-2 rounded-lg text-white transition-transform hover:scale-[1.02]"
                    style={{ background: "var(--ink)" }}>
                    <ArrowRight size={11} strokeWidth={2.2} /> Open capacity planner
                  </button>
                )}
                {escalation.reason === "pipeline" && (
                  <button
                    onClick={(ev) => { ev.stopPropagation(); window.location.href = "/portfolio"; }}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-2 rounded-lg text-white transition-transform hover:scale-[1.02]"
                    style={{ background: "var(--ink)" }}>
                    <ArrowRight size={11} strokeWidth={2.2} /> Open portfolio
                  </button>
                )}
                {escalation.account && (
                  <button
                    onClick={(ev) => { ev.stopPropagation(); peek.open(escalation.account!, "default"); }}
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3.5 py-2 rounded-lg transition-colors hover:bg-bg-deep"
                    style={{ background: "var(--bg)", color: "var(--ink-2)", border: "1px solid var(--line)" }}>
                    Open account <ArrowRight size={11} strokeWidth={2.2} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// RepTile — single rep card in the team-workload strip
// ─────────────────────────────────────────────────────────────────────
function RepTile({ rep }: { rep: typeof csmWorkloads[number] }) {
  const tone =
    rep.workloadScore >= 75 ? "var(--neg)"
      : rep.workloadScore >= 50 ? "var(--pos)"
      : "var(--info)";
  const label =
    rep.workloadScore >= 75 ? "Overloaded"
      : rep.workloadScore >= 50 ? "On track"
      : "Has room";
  return (
    <div className="rounded-xl p-4 transition-all hover:shadow-sm shrink-0"
      style={{
        width: 220,
        background: "var(--surface)",
        border: "1px solid var(--line)",
      }}>
      <div className="flex items-center gap-2 mb-3">
        <PersonAvatar name={rep.name} size={28} ring={tone} />
        <div className="min-w-0 flex-1">
          <div className="text-[12.5px] font-semibold text-ink truncate">{rep.name}</div>
          <div className="text-[10px] text-muted truncate">{rep.accounts} accounts · {rep.renewalsNext90} renewals</div>
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-2.5">
        <span className="text-[20px] font-bold tnum text-ink leading-none" style={{ letterSpacing: "-0.018em" }}>
          {fmtMoney(rep.totalArr)}
        </span>
        <span className="text-[10.5px] font-semibold tnum" style={{ color: tone }}>
          {rep.workloadScore}
        </span>
      </div>
      {/* Health mix dots */}
      <div className="flex items-center gap-0.5 mb-2.5" title={`Healthy ${rep.healthMix.healthy} · Watch ${rep.healthMix.watch} · At-risk ${rep.healthMix.atRisk}`}>
        {Array.from({ length: rep.healthMix.healthy }).map((_, i) => (
          <span key={`h${i}`} className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--pos)" }} />
        ))}
        {Array.from({ length: rep.healthMix.watch }).map((_, i) => (
          <span key={`w${i}`} className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--warn)" }} />
        ))}
        {Array.from({ length: rep.healthMix.atRisk }).map((_, i) => (
          <span key={`r${i}`} className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--neg)" }} />
        ))}
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-line">
        <span className="text-[10.5px] font-medium" style={{ color: tone }}>{label}</span>
        <span className="text-[10px] tnum text-muted-2">workload</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// PerfColumn — performance bracket column (Manager analogue of HealthColumn)
// ─────────────────────────────────────────────────────────────────────
function PerfColumn({ title, count, tone, soft, Icon, list, cta }: {
  title: string; count: number; tone: string; soft: string; Icon: any;
  list: typeof csmWorkloads; cta: string;
}) {
  return (
    <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md grid place-items-center" style={{ background: soft }}>
            <Icon size={12} strokeWidth={2} style={{ color: tone }} />
          </div>
          <span className="text-[13px] font-semibold text-ink">{title}</span>
          <span className="text-[10.5px] font-mono text-muted-2 bg-bg-deep px-1.5 py-0.5 rounded">{count}</span>
        </div>
        <span className="text-[10.5px] text-muted-2">{cta}</span>
      </div>
      <div className="space-y-1.5">
        {list.length === 0 ? (
          <div className="text-[11.5px] text-muted-2 py-4 text-center">Nothing here</div>
        ) : list.map((rep) => (
          <div key={rep.id}
            className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
            <PersonAvatar name={rep.name} size={26} ring={tone} />
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-ink truncate">{rep.name}</div>
              <div className="text-[10px] text-muted truncate">{rep.accounts} accts · {rep.healthMix.atRisk} at risk</div>
            </div>
            <span className="text-[10.5px] font-semibold tnum shrink-0" style={{ color: tone }}>{rep.workloadScore}</span>
            <span className="text-[10px] font-mono tnum text-muted-2 shrink-0 w-12 text-right">{fmtMoney(rep.totalArr)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// DEFAULT HOME (non-AM, non-CSM, non-Manager personas) — preserves existing layout
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

      <CollapsibleSection
        storageKey={`${persona}-today-queue`}
        label="Today · your queue"
        detail="Highest-leverage actions for the day"
      >
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 lg:col-span-8"><TodayQueue persona={persona} /></div>
          <div className="col-span-12 lg:col-span-4 space-y-5">
            {persona === "ae" ? <AeRisksPanel /> : <RisksPanel />}
            {persona === "ae" ? <AeAlertsPanel /> : <AlertsPanel />}
          </div>
        </div>
      </CollapsibleSection>
      <div className="mb-6" />

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

// ─────────────────────────────────────────────────────────────────────
// AE-specific Risks panel — deal slippage, MEDDPICC gaps, stage stalls
// ─────────────────────────────────────────────────────────────────────
function AeRisksPanel() {
  // Deal-shaped risks. Computed from real deals where available, fall back
  // to deterministic seeds so a fresh demo always has 4–5 items.
  const aeRisks = [
    {
      id: "ar1",
      account: "Stripe",
      slug: "stripe-inc",
      title: "Probability dropped 85% → 78%",
      reason: "Economic Buyer dark 14 days · Negotiation stage",
      tone: "neg" as const,
      label: "Slipping",
      meta: "$280K · close 24 May",
    },
    {
      id: "ar2",
      account: "Boston Dynamics",
      slug: "boston-dynamics",
      title: "MEDDPICC gap · 4 of 7 missing",
      reason: "Champion identified, but no Pain, Metrics, or Decision Process",
      tone: "warn" as const,
      label: "Missing",
      meta: "$175K · Discovery",
    },
    {
      id: "ar3",
      account: "Shopify",
      slug: "shopify-inc",
      title: "Stage exit criteria 4/5 not met",
      reason: "Tech Q&A scheduled but security questionnaire still outstanding",
      tone: "warn" as const,
      label: "Blocked",
      meta: "$350K · Demo",
    },
    {
      id: "ar4",
      account: "Lockheed Martin",
      slug: "lockheed-martin",
      title: "MSA in legal review for 28 days",
      reason: "Customer counsel hasn't responded — escalate to your sponsor",
      tone: "neg" as const,
      label: "Stalled",
      meta: "$140K · Negotiation",
    },
    {
      id: "ar5",
      account: "HSBC",
      slug: "hsbc-holdings",
      title: "Q3 close in jeopardy",
      reason: "Phase 1 buy-in secured, but Phase 2 budget approval slipped 2 weeks",
      tone: "warn" as const,
      label: "Risk",
      meta: "$410K · Proposal",
    },
  ];
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg grid place-items-center" style={{ background: "var(--neg-soft)" }}>
            <AlertTriangle size={13} strokeWidth={1.8} style={{ color: "var(--neg)" }} />
          </div>
          <span className="text-[14px] font-semibold text-ink">Deal risks</span>
          <span className="text-[11px] font-mono text-muted-2 bg-bg-deep px-1.5 py-0.5 rounded">{aeRisks.length}</span>
        </div>
        <Link href="/deals" className="text-[11px] text-muted hover:text-ink inline-flex items-center gap-0.5">
          All <ChevronRight size={11} strokeWidth={1.6} />
        </Link>
      </div>
      <div className="space-y-2">
        {aeRisks.slice(0, 5).map((r) => {
          const tone = r.tone === "neg" ? "var(--neg)" : "var(--warn)";
          const soft = r.tone === "neg" ? "var(--neg-soft)" : "var(--warn-soft)";
          return (
            <Link key={r.id} href={`/accounts/${r.slug}`}
              className="group flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-deep transition-colors"
              style={{ border: "1px solid var(--line)" }}>
              <Logo name={r.account} size={24} rounded={6} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="text-[12px] font-semibold text-ink truncate">{r.account}</div>
                  <span className="text-[9.5px] font-semibold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded shrink-0"
                    style={{ background: soft, color: tone }}>{r.label}</span>
                </div>
                <div className="text-[11px] font-medium text-ink-2 truncate mb-0.5">{r.title}</div>
                <div className="text-[10.5px] text-muted line-clamp-1">{r.reason}</div>
                <div className="text-[10px] font-mono tnum text-muted-2 mt-1">{r.meta}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// AE-specific Alerts panel — buying-committee + forecast moves
// ─────────────────────────────────────────────────────────────────────
function AeAlertsPanel() {
  const aeAlerts = [
    { account: "Datadog",      slug: "datadog-inc",       body: "VP Eng accepted meeting for Tue · pre-call brief ready",                               ago: "1h ago",     tone: "pos",  kind: "buying" as const },
    { account: "Stripe",       slug: "stripe-inc",        body: "Forecast moved Best Case → Commit by manager",                                          ago: "3h ago",     tone: "pos",  kind: "forecast" as const },
    { account: "Lockheed Martin", slug: "lockheed-martin",body: "New stakeholder added: Chief of Staff (Decision Maker) — multithread now",             ago: "6h ago",     tone: "info", kind: "buying" as const },
    { account: "Shopify",      slug: "shopify-inc",       body: "Security review complete · ready to advance to Negotiation",                            ago: "Yesterday",  tone: "pos",  kind: "stage" as const },
    { account: "MongoDB",      slug: "mongodb-inc",       body: "Champion left for Snowflake — succession needed before next call",                      ago: "2d ago",     tone: "neg",  kind: "buying" as const },
    { account: "HSBC",         slug: "hsbc-holdings",     body: "Procurement requested 12% reduction on multi-year",                                     ago: "3d ago",     tone: "warn", kind: "negotiation" as const },
  ];
  const kindLabel: Record<typeof aeAlerts[number]["kind"], string> = {
    buying: "Buying committee",
    forecast: "Forecast",
    stage: "Stage move",
    negotiation: "Negotiation",
  };
  const kindBg: Record<typeof aeAlerts[number]["kind"], string> = {
    buying: "var(--accent-soft)",
    forecast: "var(--pos-soft)",
    stage: "var(--info-soft)",
    negotiation: "var(--warn-soft)",
  };
  const kindFg: Record<typeof aeAlerts[number]["kind"], string> = {
    buying: "var(--accent-deep)",
    forecast: "var(--pos)",
    stage: "var(--info)",
    negotiation: "var(--warn)",
  };
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg grid place-items-center" style={{ background: "var(--accent-soft)" }}>
            <Bell size={13} strokeWidth={1.8} style={{ color: "var(--accent-deep)" }} />
          </div>
          <span className="text-[14px] font-semibold text-ink">Pipeline alerts</span>
          <span className="text-[11px] font-mono text-muted-2 bg-bg-deep px-1.5 py-0.5 rounded">{aeAlerts.length}</span>
        </div>
        <span className="text-[10.5px] text-muted">Newest first</span>
      </div>
      <div className="space-y-1">
        {aeAlerts.map((a, i) => {
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
                    Open deal <ArrowRight size={11} strokeWidth={2} />
                  </Link>
                  <span className="text-[10px] font-medium px-2 py-1.5 rounded-lg"
                    style={{ background: kindBg[a.kind], color: kindFg[a.kind] }}>
                    {kindLabel[a.kind]}
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
  const { user } = useUser();
  // Map any "Walid" owner in seed data to the current user
  const personalize = (g: EnhancedGoal): EnhancedGoal =>
    g.owner.name === "Walid"
      ? { ...g, owner: { ...g.owner, name: user.firstName, initials: user.initials } }
      : g;
  const allGoals = (persona === "ae" ? GOALS_AE_X : GOALS_CSM_X).map(personalize);
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
