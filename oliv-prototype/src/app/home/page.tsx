"use client";

import Link from "next/link";
import { ChevronRight, Sparkles, AlertTriangle, Bell, Target, Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TodayQueue } from "@/components/TodayQueue";
import { MyNumber } from "@/components/MyNumber";
import { Logo } from "@/components/Logo";
import { DataFreshness } from "@/components/SourceChip";
import { usePersona, PERSONA_LABEL } from "@/components/PersonaContext";
import { pinnedAccounts, accountDetails, deals, fmtMoney, outcomes, accounts, myNumber, slugify } from "@/lib/mock";

export default function HomePage() {
  const { persona } = usePersona();
  const greeting = greetingFor();
  const sources = persona === "ae"
    ? (["Salesforce", "Gong", "Google Workspace", "Alphy AI"] as const)
    : persona === "am"
    ? (["Salesforce", "LinkedIn", "Gong", "Alphy AI"] as const)
    : persona === "csm"
    ? (["Salesforce", "Mixpanel", "Zendesk", "Intercom", "Alphy AI"] as const)
    : (["Salesforce", "Clari", "Gong", "Alphy AI"] as const);

  return (
    <AppShell>
      {/* Greeting */}
      <div className="mb-5 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="mono-label mb-2.5 inline-flex items-center gap-2">
            <span className="orb" />
            {greeting} · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="display ink-gradient" style={{ fontSize: 38, lineHeight: 1.05 }}>
              {greeting}, Walid
            </h1>
            <span className="persona-chip">
              <span className="dot" />
              {PERSONA_LABEL[persona]}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <DataFreshness minutesAgo={3} sources={sources as any} />
        </div>
      </div>


      {/* Portfolio health snapshot */}
      <MyNumber persona={persona} />

      {/* Queue (left) + Risks / Alerts (right) */}
      <div className="grid grid-cols-12 gap-4 mt-4">
        <div className="col-span-12 lg:col-span-8">
          <TodayQueue persona={persona} />
        </div>
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <RisksPanel />
          <AlertsPanel />
        </div>
      </div>

      {/* Enhanced Goals section */}
      <GoalsSection persona={persona} />
    </AppShell>
  );
}

function greetingFor() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// ---------------------------------------------------------------------
// Hook.co-inspired overview — shared across all personas
// ---------------------------------------------------------------------

const ALERTS = [
  { account: "Snowflake",    body: "Champion Brad Wallace silent for 14 days — renewal risk escalating",    ago: "2h ago",      tone: "neg"  },
  { account: "GitLab Inc.",  body: "WAU/MAU declined further to 0.48 — three teams fully inactive",         ago: "4h ago",      tone: "neg"  },
  { account: "Akamai",       body: "QBR now 14 days overdue — expansion narrative stale, Q2 risk",          ago: "Yesterday",   tone: "warn" },
  { account: "Cloudflare",   body: "Maya Chen promoted to VP Engineering — new expansion budget unlocked",   ago: "12m ago",     tone: "pos"  },
];

// ---------------------------------------------------------------------
// Risks panel — narrow, fits beside the queue
// ---------------------------------------------------------------------
function RisksPanel() {
  const risks = outcomes.filter(o => o.status === "at-risk" || o.status === "watch").slice(0, 5);
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={12} strokeWidth={1.8} style={{ color: "var(--neg)" }} />
          <span className="text-[13px] font-semibold text-ink">Risks</span>
          <span className="text-[10px] font-mono text-muted-2">{risks.length}</span>
        </div>
        <Link href="/outcomes" className="text-[10.5px] text-muted hover:text-ink inline-flex items-center gap-0.5">
          All <ChevronRight size={10} strokeWidth={1.6} />
        </Link>
      </div>
      <div className="space-y-1.5">
        {risks.map((r) => {
          const isRisk = r.status === "at-risk";
          const tone = isRisk ? "var(--neg)" : "var(--warn)";
          const soft = isRisk ? "var(--neg-soft)" : "var(--warn-soft)";
          const label = isRisk ? "At Risk" : "Watch";
          return (
            <div key={r.id} className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-bg-deep cursor-pointer">
              <Logo name={r.account} size={20} rounded={4} />
              <div className="flex-1 min-w-0">
                <div className="text-[11.5px] font-semibold text-ink truncate">{r.account}</div>
                <div className="text-[10px] text-muted truncate">{r.metric}</div>
              </div>
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                style={{ background: soft, color: tone }}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Alerts panel — newest first
// ---------------------------------------------------------------------
function AlertsPanel() {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell size={12} strokeWidth={1.8} className="text-muted" />
          <span className="text-[13px] font-semibold text-ink">Alerts</span>
          <span className="text-[10px] font-mono text-muted-2">{ALERTS.length}</span>
        </div>
        <span className="text-[10px] text-muted">Newest first</span>
      </div>
      <div className="space-y-2.5">
        {ALERTS.map((a, i) => {
          const dot = a.tone === "neg" ? "var(--neg)" : a.tone === "warn" ? "var(--warn)" : "var(--pos)";
          return (
            <div key={i} className="flex items-start gap-2.5 px-1 py-1.5 rounded-md hover:bg-bg-deep cursor-pointer">
              <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: dot }} />
              <div className="flex-1 min-w-0">
                <div className="text-[11.5px] font-semibold text-ink truncate">{a.account}</div>
                <div className="text-[10.5px] text-muted leading-snug line-clamp-2">{a.body}</div>
                <div className="text-[10px] text-muted-2 mt-0.5">{a.ago}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Goals — enhanced
// Each goal carries a category, owner avatar, due-date pill (tone by
// urgency), and an inline progress bar so the row reads at-a-glance.
// ---------------------------------------------------------------------
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
  { text: "Renew Snowflake — $480K ARR",                  category: "Renewal",    owner: { name: "Walid",  initials: "WQ", bg: "#1A1B17" }, due: "May 22",  daysLeft: 18, progress: 35, recent: false },
  { text: "Complete Akamai QBR overdue 14 days",          category: "QBR",        owner: { name: "Walid",  initials: "WQ", bg: "#1A1B17" }, due: "May 10",  daysLeft: 6,  progress: 60, recent: false },
  { text: "GitLab adoption recovery — re-engage teams",   category: "Adoption",   owner: { name: "Rachel", initials: "RK", bg: "#6B2A6B" }, due: "May 16",  daysLeft: 12, progress: 22, recent: true  },
  { text: "Close GitLab renewal risk before day-64",      category: "Risk",       owner: { name: "Walid",  initials: "WQ", bg: "#1A1B17" }, due: "Jun 02",  daysLeft: 29, progress: 18, recent: true  },
  { text: "Cloudflare expansion case to VP Eng",          category: "Expansion",  owner: { name: "Marcus", initials: "MW", bg: "#2A6B2A" }, due: "May 12",  daysLeft: 8,  progress: 70, recent: false },
];

const GOALS_AE_X: EnhancedGoal[] = [
  { text: "Close Shopify — security questionnaire sent",  category: "Renewal",    owner: { name: "Walid", initials: "WQ", bg: "#1A1B17" }, due: "May 08", daysLeft: 4,  progress: 80, recent: false },
  { text: "Unblock Stripe legal stall",                   category: "Risk",       owner: { name: "Walid", initials: "WQ", bg: "#1A1B17" }, due: "Today",  daysLeft: 0,  progress: 50, recent: false },
  { text: "Schedule Raytheon discovery call",             category: "Onboarding", owner: { name: "Walid", initials: "WQ", bg: "#1A1B17" }, due: "May 12", daysLeft: 8,  progress: 25, recent: true  },
];

const GOALS_AM_X: EnhancedGoal[] = [
  { text: "Validate Cloudflare expansion case — $180K",   category: "Expansion",  owner: { name: "Walid",  initials: "WQ", bg: "#1A1B17" }, due: "May 09", daysLeft: 5, progress: 60, recent: false },
  { text: "Build Tableau ML governance business case",    category: "Expansion",  owner: { name: "Marcus", initials: "MW", bg: "#2A6B2A" }, due: "May 12", daysLeft: 8, progress: 40, recent: true  },
  { text: "Loop AE into Cloudflare VP Eng outreach",      category: "Renewal",    owner: { name: "Walid",  initials: "WQ", bg: "#1A1B17" }, due: "Today",  daysLeft: 0, progress: 90, recent: false },
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
  const all = persona === "ae" ? GOALS_AE_X : persona === "am" ? GOALS_AM_X : GOALS_CSM_X;
  const overdue   = all.filter(g => g.daysLeft <= 1);
  const thisWeek  = all.filter(g => g.daysLeft > 1 && g.daysLeft <= 7);
  const upcoming  = all.filter(g => g.daysLeft > 7);
  const avgProg   = Math.round(all.reduce((s, g) => s + g.progress, 0) / all.length);

  return (
    <div className="card p-5 mt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Target size={13} strokeWidth={1.8} style={{ color: "var(--accent-deep)" }} />
          <span className="text-[13px] font-semibold text-ink">Goals</span>
          <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded"
            style={{ background: "var(--accent-soft)", color: "var(--accent-deep)" }}>BETA</span>
          <span className="ml-1 text-[11px] text-muted">{all.length} active · {avgProg}% avg progress</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <button className="px-2.5 py-1 rounded-md font-medium text-ink bg-bg-deep">Live goals</button>
          <button className="px-2.5 py-1 rounded-md text-muted hover:text-ink">Recently completed</button>
          <button className="ml-2 h-7 px-2.5 rounded-md text-[11px] font-medium inline-flex items-center gap-1 border border-line bg-surface hover:bg-bg-deep">
            <Plus size={11} strokeWidth={2} /> Add goal
          </button>
        </div>
      </div>

      {/* Three buckets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
        <GoalBucket title="Overdue / today"   count={overdue.length}  tone="var(--neg)"  goals={overdue} />
        <GoalBucket title="This week"          count={thisWeek.length} tone="var(--warn)" goals={thisWeek} />
        <GoalBucket title="Upcoming"           count={upcoming.length} tone="var(--info)" goals={upcoming} />
      </div>
    </div>
  );
}

function GoalBucket({ title, count, tone, goals }: { title: string; count: number; tone: string; goals: EnhancedGoal[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: tone }} />
        <span className="text-[11px] font-semibold text-ink-2">{title}</span>
        {count > 0 && (
          <span className="text-[9.5px] font-mono text-muted px-1.5 py-0.5 rounded bg-bg-deep">{count}</span>
        )}
      </div>
      {goals.length === 0 ? (
        <div className="text-[11px] text-muted-2 italic py-2">Nothing here</div>
      ) : (
        <div className="space-y-2.5">
          {goals.map((g, i) => <EnhancedGoalRow key={i} goal={g} />)}
        </div>
      )}
    </div>
  );
}

function EnhancedGoalRow({ goal }: { goal: EnhancedGoal }) {
  const cat = GOAL_CATEGORY_STYLE[goal.category];
  const dueTone = goal.daysLeft <= 1 ? "var(--neg)" : goal.daysLeft <= 7 ? "var(--warn)" : "var(--ink-2)";
  return (
    <div className="group cursor-pointer rounded-lg border border-line bg-surface px-3 py-2.5 hover:bg-surface-2 hover:border-line-strong transition-colors">
      <div className="flex items-start gap-2.5">
        <div className="w-4 h-4 rounded-full border-2 border-line shrink-0 mt-0.5 group-hover:border-accent-deep transition-colors" />
        <div className="flex-1 min-w-0">
          {/* Title + category */}
          <div className="flex items-start gap-2 mb-1.5">
            <span className="text-[12px] font-medium text-ink leading-snug flex-1 min-w-0">{goal.text}</span>
            <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded shrink-0"
              style={{ background: cat.bg, color: cat.color }}>
              {goal.category}
            </span>
          </div>
          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-deep)" }}>
              <div className="h-full rounded-full"
                style={{ width: `${goal.progress}%`, background: "var(--accent-deep)" }} />
            </div>
            <span className="text-[9.5px] font-mono tnum text-muted">{goal.progress}%</span>
          </div>
          {/* Footer: owner + due */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full text-white grid place-items-center text-[7.5px] font-semibold"
                style={{ background: goal.owner.bg }}>
                {goal.owner.initials}
              </div>
              <span className="text-[10px] text-muted">{goal.owner.name}</span>
            </div>
            <span className="text-[10px] font-mono tnum" style={{ color: dueTone }}>
              {goal.due}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------
function SectionHeader({ title, linkHref, linkLabel }: { title: string; linkHref: string; linkLabel: string }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-ink font-semibold text-[13.5px]">{title}</h3>
      <Link href={linkHref} className="text-[11px] text-muted hover:text-ink inline-flex items-center gap-0.5">
        {linkLabel} <ChevronRight size={11} strokeWidth={1.6} />
      </Link>
    </div>
  );
}

function Mini({ label, value, delta }: { label: string; value: string; delta: number }) {
  const trend = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  return (
    <div>
      <div className="mono-label">{label}</div>
      <div className="hero-num text-ink mt-1.5" style={{ fontSize: 26 }}>{value}</div>
      <div className="mt-1.5">
        <span className={`trend-pill ${trend}`}>
          {delta >= 0 ? "+" : ""}{delta}% vs last
        </span>
      </div>
    </div>
  );
}

function PinnedAccounts() {
  return (
    <div className="card p-4">
      <SectionHeader title="Pinned accounts" linkHref="/accounts" linkLabel="See all" />
      <div className="space-y-0.5 mt-2">
        {pinnedAccounts.map((a) => {
          const detail = accountDetails[a.slug];
          const dot = a.health === "high" ? "var(--pos)" : a.health === "medium" ? "var(--warn)" : "var(--neg)";
          return (
            <Link key={a.slug} href={`/accounts/${a.slug}`}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-bg-deep">
              <Logo name={a.name} size={20} rounded={4} />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-ink truncate">{a.name}</div>
                <div className="text-[10px] text-muted truncate">
                  {detail ? `${detail.industry} · ARR ${fmtMoney(detail.arr)}` : ""}
                </div>
              </div>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
              <ChevronRight size={11} className="text-muted-2" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
