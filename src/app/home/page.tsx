"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Sparkles, AlertTriangle, Bell, Target, Plus, CheckCircle2, Circle, Clock, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TodayQueue } from "@/components/TodayQueue";
import { MyNumber } from "@/components/MyNumber";
import { Logo } from "@/components/Logo";
import { DataFreshness } from "@/components/SourceChip";
import { usePersona, PERSONA_LABEL } from "@/components/PersonaContext";
import { pinnedAccounts, accountDetails, deals, fmtMoney, outcomes, accounts, myNumber, slugify, championChanges, csmWorkloads, accountPlans, type PlanTask } from "@/lib/mock";

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
      {/* ─── Welcome banner ─── */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6 pb-5 border-b border-line">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-[22px] font-semibold text-ink" style={{ letterSpacing: "-0.02em" }}>
              {greeting}, Walid
            </h1>
            <span className="persona-chip">
              <span className="dot" />
              {PERSONA_LABEL[persona]}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-muted">
            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
            <span className="text-muted-2">·</span>
            <DataFreshness minutesAgo={3} sources={sources as any} />
          </div>
        </div>
      </div>

      {/* ─── Portfolio health ─── */}
      <MyNumber persona={persona} />

      {/* ─── Queue (left) + Risks / Alerts (right) ─── */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <TodayQueue persona={persona} />
        </div>
        <div className="col-span-12 lg:col-span-4 space-y-5">
          <RisksPanel />
          <AlertsPanel />
        </div>
      </div>

      {/* ─── My Tasks ─── */}
      <MyTasksSection />

      {/* ─── Capacity (manager only) ─── */}
      {persona === "manager" && <CapacitySummary />}

      {/* ─── Goals ─── */}
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
  { account: "Snowflake",    slug: "snowflake-inc",       body: "Champion Brad Wallace silent for 14 days — renewal risk escalating",               ago: "2h ago",      tone: "neg",  kind: "signal" as const },
  { account: "Snowflake",    slug: "snowflake-inc",       body: "⚑ Champion change: James Whitfield (VP Sales Ops) left company — succession needed", ago: "2d ago",      tone: "neg",  kind: "champion" as const },
  { account: "GitLab Inc.",  slug: "gitlab-inc",          body: "WAU/MAU declined further to 0.48 — three teams fully inactive",                    ago: "4h ago",      tone: "neg",  kind: "signal" as const },
  { account: "Cloudflare",   slug: "cloudflare-inc",      body: "⚑ Champion change: Maya Chen promoted to VP Engineering — expansion door opens",    ago: "12h ago",     tone: "pos",  kind: "champion" as const },
  { account: "Akamai",       slug: "akamai-technologies", body: "QBR now 14 days overdue — expansion narrative stale, Q2 risk",                     ago: "Yesterday",   tone: "warn", kind: "signal" as const },
  { account: "Tableau",      slug: "tableau-software",    body: "⚑ New hire: Priya Sharma joined as Head of Revenue Operations",                    ago: "3d ago",      tone: "info", kind: "champion" as const },
];

// ---------------------------------------------------------------------
// Risks panel — narrow, fits beside the queue
// ---------------------------------------------------------------------
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

// ---------------------------------------------------------------------
// Alerts panel — newest first
// ---------------------------------------------------------------------
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
              <div
                onClick={() => setExpanded(isOpen ? null : i)}
                className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-bg-deep cursor-pointer transition-colors"
                style={isOpen ? { background: "var(--bg-deep)" } : undefined}
              >
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

const GOALS_AM_X: EnhancedGoal[] = [
  { text: "Validate Cloudflare expansion case — $180K",   category: "Expansion",  owner: { name: "Walid",  initials: "WQ", bg: "#374151" }, due: "May 09", daysLeft: 5, progress: 60, recent: false },
  { text: "Build Tableau ML governance business case",    category: "Expansion",  owner: { name: "Marcus", initials: "MW", bg: "#1E40AF" }, due: "May 12", daysLeft: 8, progress: 40, recent: true  },
  { text: "Loop AE into Cloudflare VP Eng outreach",      category: "Renewal",    owner: { name: "Walid",  initials: "WQ", bg: "#374151" }, due: "Today",  daysLeft: 0, progress: 90, recent: false },
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
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  return (
    <div className="card p-6 mt-6">
      {/* Header */}
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

      {/* Three buckets */}
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
        {count > 0 && (
          <span className="text-[10px] font-mono text-muted ml-auto">{count}</span>
        )}
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
          <div className={`w-[18px] h-[18px] rounded-full border-2 shrink-0 mt-0.5 transition-colors ${isExpanded ? "border-accent-deep" : "border-line group-hover:border-accent-deep"}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-2">
              <span className="text-[12.5px] font-medium text-ink leading-snug flex-1 min-w-0">{goal.text}</span>
              <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md shrink-0"
                style={{ background: cat.bg, color: cat.color }}>
                {goal.category}
              </span>
            </div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-deep)" }}>
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${goal.progress}%`, background: "var(--accent-deep)" }} />
              </div>
              <span className="text-[10px] font-mono tnum text-muted font-semibold">{goal.progress}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full text-white grid place-items-center text-[8px] font-semibold"
                  style={{ background: goal.owner.bg }}>
                  {goal.owner.initials}
                </div>
                <span className="text-[10.5px] text-muted">{goal.owner.name}</span>
              </div>
              <span className="text-[10.5px] font-mono tnum font-medium" style={{ color: dueTone }}>
                {goal.due}
              </span>
            </div>
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="px-3.5 pb-3 pt-0 border-t border-line mx-2 mt-0">
          <div className="pt-2.5 space-y-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-2 mb-1.5">Suggested next steps</div>
            {actions.map((a, i) => (
              <button key={i} className="flex items-center gap-2 w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-bg-deep transition-colors group/act">
                <Circle size={10} strokeWidth={2} className="text-muted-2 group-hover/act:text-accent-deep shrink-0" />
                <span className="text-[11.5px] text-ink-2 group-hover/act:text-ink">{a}</span>
              </button>
            ))}
            <div className="flex items-center gap-2 pt-1.5">
              <button className="text-[10.5px] font-medium px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5"
                style={{ background: "var(--accent-soft)", color: "var(--accent-deep)" }}>
                Update progress <ArrowRight size={10} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// My Tasks — tasks assigned to current user across all account plans
// ---------------------------------------------------------------------
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
        {overdue.length > 0 && (
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neg px-3 py-1">Overdue</div>
        )}
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
        <div className="text-[10.5px] text-muted mt-0.5 truncate">
          {task.accountName} · {task.milestone}
        </div>
      </div>
      <span className={`text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${
        task.priority === "high" ? "" : "text-muted"
      }`} style={task.priority === "high" ? { background: "var(--neg-soft)", color: "var(--neg)" } : { background: "var(--bg-deep)" }}>
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
