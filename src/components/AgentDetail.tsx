"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X, Bot, Sparkles, Check, Play, Pause, ArrowRight, Mail, Calendar,
  Users, Database, Zap, Crown, FileText, ShieldCheck, Settings,
  TrendingDown, AlertTriangle, MessageSquare, Search, ArrowUpRight,
} from "lucide-react";
import { Logo } from "./Logo";
import type { Agent } from "@/lib/mock";

const ACCENT = "#266DF0";

// ─────────────────────────────────────────────────────────────────────
// AgentDetail — slide-in panel showing what an agent does, an animated
// run, and a sample output artifact.
// ─────────────────────────────────────────────────────────────────────

type Step = {
  label: string;
  detail: string;
  Icon: any;
  durationMs: number;
};

type SampleOutput =
  | { kind: "email"; from: string; to: string; subject: string; body: string }
  | { kind: "brief"; title: string; bullets: string[] }
  | { kind: "alert"; title: string; rows: { label: string; value: string; tone?: string }[] }
  | { kind: "list"; title: string; rows: string[] }
  | { kind: "deck"; title: string; slides: string[] };

type Workflow = {
  trigger: string;
  steps: Step[];
  sample: SampleOutput;
  recentRuns: { account: string; outcome: string; ago: string }[];
};

// ─────────────────────────────────────────────────────────────────────
// Per-agent workflow fixtures
// ─────────────────────────────────────────────────────────────────────
const WORKFLOWS: Record<string, Workflow> = {
  // Sales agents
  a1: { // Dylan, the Multithreader
    trigger: "When an opportunity reaches Proposal stage",
    steps: [
      { label: "Scan account org chart",     detail: "Pull current contacts from Salesforce, ZoomInfo, and LinkedIn",                  Icon: Database,  durationMs: 1100 },
      { label: "Identify multithread gaps",  detail: "Find roles missing from buying committee — typically Economic and Procurement",   Icon: Search,    durationMs: 1300 },
      { label: "Score by buying potential",  detail: "Rank net-new contacts by seniority, scope match, and recent activity",            Icon: Zap,       durationMs: 1100 },
      { label: "Draft personalised outreach",detail: "Generate first-touch emails referencing the active opp and their role",          Icon: Mail,      durationMs: 1500 },
    ],
    sample: {
      kind: "email",
      from: "Pragyan",
      to: "Lara Ng (VP Data, Tableau)",
      subject: "Quick intro — Tableau ML governance",
      body: "Hi Lara,\n\nWe've been working with Owen on the ML governance pilot at Tableau. Given your role and the team you're scaling, wanted to introduce myself before our next sync. Worth 15 minutes?",
    },
    recentRuns: [
      { account: "Snowflake",  outcome: "Surfaced 3 new contacts · 2 replied", ago: "1d" },
      { account: "Cloudflare", outcome: "Identified Procurement gap",          ago: "2d" },
      { account: "Tableau",    outcome: "Drafted 2 outreach emails",          ago: "4d" },
    ],
  },
  a2: { // Max, the Momentum Reviver
    trigger: "When a deal stalls 14+ days at the same stage",
    steps: [
      { label: "Detect stalled opportunities", detail: "Scan all open deals for stage stagnation",                          Icon: AlertTriangle, durationMs: 1100 },
      { label: "Cross-reference budget signals", detail: "Watch for funding announcements, hiring sprees, RFP postings",     Icon: TrendingDown,  durationMs: 1300 },
      { label: "Compose revival message",      detail: "Draft a re-engagement note tied to fresh budget context",            Icon: Mail,          durationMs: 1500 },
      { label: "Schedule follow-up",           detail: "Place a calendar nudge if no reply within 48h",                       Icon: Calendar,      durationMs: 1100 },
    ],
    sample: {
      kind: "email",
      from: "Pragyan",
      to: "Brad Wallace (Snowflake)",
      subject: "Saw the news on your Series E — quick thought",
      body: "Hi Brad,\n\nCongrats on the funding. With the new headcount plan you announced, the original 80-seat scope we discussed in March may already be undersized. Worth a 20-min reset?",
    },
    recentRuns: [
      { account: "Stripe",   outcome: "Revived deal · moved to Negotiation", ago: "3d" },
      { account: "Datadog",  outcome: "Drafted follow-up · awaiting reply", ago: "5d" },
    ],
  },
  a3: { // Jackie, the Pre-Meeting Prepper
    trigger: "30 minutes before any external meeting",
    steps: [
      { label: "Pull calendar context",       detail: "Identify meeting purpose, attendees, prior thread",       Icon: Calendar,      durationMs: 1100 },
      { label: "Match attendees to CRM",      detail: "Cross-reference with Salesforce contacts and roles",      Icon: Users,         durationMs: 1100 },
      { label: "Scan LinkedIn for updates",   detail: "Check for promotions, new hires, content shared",         Icon: Search,        durationMs: 1300 },
      { label: "Draft 90-second brief",       detail: "Compose 3-bullet brief with talking points and risks",    Icon: FileText,      durationMs: 1500 },
    ],
    sample: {
      kind: "brief",
      title: "Brief · Cloudflare sync · 10:30 AM",
      bullets: [
        "Maya Chen was promoted to VP Eng on Apr 26 — budget now spans Networking + Security ($4.2M, +75%).",
        "She replied 4h on average across last 6 threads. Hot signal: hit 92% on Networking limits 3× this quarter.",
        "Open thread: ROI deck delivered Mon — flag the procurement-simplification angle before she does.",
      ],
    },
    recentRuns: [
      { account: "Cloudflare", outcome: "Brief delivered · 30 min pre-call", ago: "2h" },
      { account: "Akamai",     outcome: "Brief delivered · highlighted QBR slip", ago: "1d" },
    ],
  },
  a4: { // Eli, the Enrichment Agent
    trigger: "When a new lead or contact lands in CRM",
    steps: [
      { label: "Detect new record",        detail: "Trigger on Salesforce contact/lead creation",          Icon: Database,  durationMs: 900 },
      { label: "Fetch firmographics",      detail: "Pull industry, size, funding from data partners",       Icon: Search,    durationMs: 1300 },
      { label: "De-dupe against existing", detail: "Match against existing accounts using fuzzy logic",     Icon: ShieldCheck, durationMs: 1100 },
      { label: "Fill CRM fields",          detail: "Populate role, seniority, region, industry tags",       Icon: Zap,       durationMs: 1100 },
    ],
    sample: {
      kind: "list",
      title: "Enriched · last 24 hours",
      rows: [
        "Maya Chen · VP Engineering · Cloudflare · 3,800 employees · Series E",
        "Lara Ng · VP Data · Tableau · 4,200 employees · Public",
        "Brad Wallace · VP Sales Ops · Snowflake · 7,100 employees · Public",
      ],
    },
    recentRuns: [
      { account: "—", outcome: "12 contacts enriched · 0 dupes", ago: "today" },
      { account: "—", outcome: "8 contacts enriched", ago: "1d" },
    ],
  },
  // CSM agents
  cs1: { // Renewal Risk Monitor
    trigger: "Daily at 8am · across full customer book",
    steps: [
      { label: "Score every customer's renewal health",   detail: "Composite of usage, sponsor cadence, ticket burden, NPS", Icon: ShieldCheck,    durationMs: 1300 },
      { label: "Detect score deltas >8 points",            detail: "Flag accounts whose health dropped sharply this week",   Icon: TrendingDown,   durationMs: 1100 },
      { label: "Check sponsor activity",                   detail: "Identify champions silent for 7+ days",                  Icon: Users,          durationMs: 1100 },
      { label: "Surface as save plays on home",            detail: "Push top risks into Today's saves on the CSM home",      Icon: AlertTriangle,  durationMs: 1100 },
    ],
    sample: {
      kind: "alert",
      title: "3 renewals at risk this morning",
      rows: [
        { label: "Snowflake · 47d to renewal",   value: "Health 41 ↓ from 49",            tone: "var(--neg)" },
        { label: "GitLab · 64d to renewal",      value: "WAU/MAU 0.48 · 3 teams idle",   tone: "var(--neg)" },
        { label: "Akamai · QBR overdue 14d",     value: "New champion · narrative stale", tone: "var(--warn)" },
      ],
    },
    recentRuns: [
      { account: "Snowflake", outcome: "Flagged · save play assigned to Brad", ago: "today" },
      { account: "GitLab",    outcome: "Flagged · adoption recovery in flight", ago: "1d" },
      { account: "Stripe",    outcome: "Recovered · health back to 78",         ago: "5d" },
    ],
  },
  cs2: { // Adoption Watchdog
    trigger: "Continuous · usage telemetry monitoring",
    steps: [
      { label: "Watch WAU/MAU trends",         detail: "Track active-user ratio per account, per team, per feature",      Icon: TrendingDown,  durationMs: 1300 },
      { label: "Compare to expected trajectory", detail: "Onboarding peers' typical curve at this stage",                 Icon: ShieldCheck,    durationMs: 1100 },
      { label: "Identify dormant teams",        detail: "Find user cohorts with no logins in 14+ days",                    Icon: Users,          durationMs: 1100 },
      { label: "Recommend recovery play",       detail: "Auto-pick from the playbook based on adoption pattern",           Icon: Sparkles,       durationMs: 1300 },
    ],
    sample: {
      kind: "alert",
      title: "GitLab · adoption decay detected",
      rows: [
        { label: "WAU/MAU",          value: "0.48 (was 0.74)", tone: "var(--neg)" },
        { label: "Inactive teams",   value: "3 of 7" },
        { label: "Pattern match",    value: "Stripe Q3 '24 (recovered)" },
        { label: "Recommended play", value: "Value snapshot + training",  tone: ACCENT },
      ],
    },
    recentRuns: [
      { account: "GitLab",  outcome: "Flagged · recovery play running", ago: "today" },
      { account: "Tableau", outcome: "Adoption healthy · ML team grew", ago: "2d" },
    ],
  },
  cs3: { // Outcomes Tracker
    trigger: "Weekly · pre-QBR sweep",
    steps: [
      { label: "Pull committed outcomes",    detail: "From success plans signed at onboarding",                     Icon: FileText,    durationMs: 1100 },
      { label: "Correlate with usage data",  detail: "Map outcomes to product telemetry and milestones",            Icon: Database,    durationMs: 1300 },
      { label: "Compute progress per outcome", detail: "Score 0-100% against committed timeline",                    Icon: ShieldCheck, durationMs: 1100 },
      { label: "Flag gaps before QBR",       detail: "Surface outcomes <50% with 2 weeks to QBR",                    Icon: AlertTriangle, durationMs: 1100 },
    ],
    sample: {
      kind: "list",
      title: "Outcome gaps · this week",
      rows: [
        "Cloudflare · ML governance — 32% (target 60% by Q3)",
        "Snowflake · API consolidation — 56% (target 80% by Q3)",
        "GitLab · onboarding — 18% (target 90% by Q3)",
      ],
    },
    recentRuns: [
      { account: "Snowflake",  outcome: "Outcome gap surfaced · pre-QBR",       ago: "today" },
      { account: "Cloudflare", outcome: "All outcomes on track · QBR ready",   ago: "1d" },
    ],
  },
  cs4: { // QBR Composer
    trigger: "On-demand · before any scheduled QBR",
    steps: [
      { label: "Pull last 90 days of activity", detail: "Mixpanel, Zendesk, calls, emails, outcomes",                 Icon: Database,   durationMs: 1300 },
      { label: "Build the value narrative",     detail: "ROI numbers, adoption wins, where you're delivering",        Icon: Sparkles,   durationMs: 1500 },
      { label: "Surface risks honestly",         detail: "Outcome gaps, adoption decay, sponsor coverage shifts",      Icon: AlertTriangle, durationMs: 1100 },
      { label: "Generate exec deck",            detail: "10-slide deck — branded, exportable, ready to send",         Icon: FileText,   durationMs: 1500 },
    ],
    sample: {
      kind: "deck",
      title: "Cloudflare · Q2 QBR · 10 slides",
      slides: [
        "Cover · Q2 2025",
        "Executive summary · 3 wins, 1 risk",
        "Adoption · WAU/MAU 0.74 (top decile)",
        "ROI realised · 3.4× · 312 tickets resolved",
        "Outcomes · 4/5 on track",
        "Stakeholder coverage · all 5 roles covered",
        "Q3 expansion · Networking + Security bundle",
        "Risks · procurement timeline",
        "Asks · pilot extension, exec sponsor",
        "Next steps · renewal kickoff May 22",
      ],
    },
    recentRuns: [
      { account: "Cloudflare", outcome: "QBR deck composed · sent to Maya", ago: "today" },
      { account: "Tableau",    outcome: "QBR deck composed · 12 slides",   ago: "3d" },
    ],
  },
  cs5: { // Signals Scout
    trigger: "Continuous · LinkedIn, news, job boards, calls",
    steps: [
      { label: "Scan LinkedIn for org changes", detail: "Promotions, departures, role title changes across champions", Icon: Search,        durationMs: 1300 },
      { label: "Watch hiring signals",          detail: "Job postings that hint at expansion or new use cases",         Icon: Users,         durationMs: 1100 },
      { label: "Listen to call transcripts",    detail: "Detect sentiment shifts and competitive mentions",             Icon: MessageSquare, durationMs: 1300 },
      { label: "Surface to activity feed",      detail: "Push relevant signals into the home page in real time",        Icon: Zap,           durationMs: 1100 },
    ],
    sample: {
      kind: "list",
      title: "Champion changes · last 7 days",
      rows: [
        "Maya Chen · promoted to VP Eng at Cloudflare · Apr 26",
        "James Whitfield · left Snowflake (joined Databricks) · May 1",
        "Priya Sharma · joined Akamai as Head of RevOps · Apr 28",
        "Tableau · hiring 4 ML engineers (governance gap forming)",
      ],
    },
    recentRuns: [
      { account: "Cloudflare", outcome: "Detected Maya's promotion · alerted AM",  ago: "today" },
      { account: "Snowflake",  outcome: "Detected James's departure · save play", ago: "2d" },
    ],
  },
};

// Generic fallback
function genericWorkflow(agent: Agent): Workflow {
  return {
    trigger: "Configurable · runs on a schedule or signal",
    steps: [
      { label: "Read source signals",       detail: "Pull data from connected systems",     Icon: Database,    durationMs: 1100 },
      { label: "Apply agent logic",          detail: agent.description,                       Icon: Sparkles,    durationMs: 1500 },
      { label: "Compose output",             detail: "Generate the artifact this agent produces", Icon: FileText, durationMs: 1300 },
      { label: "Deliver to your workspace",  detail: "Push into home, account, or inbox",     Icon: Zap,         durationMs: 1100 },
    ],
    sample: {
      kind: "list",
      title: "Sample output",
      rows: [
        agent.description,
        "Output is generated based on real-time signals and your account configuration.",
        "Configurable: pick the trigger, frequency, and delivery channel.",
      ],
    },
    recentRuns: [
      { account: "—", outcome: "No runs yet · install to begin", ago: "—" },
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────
// Main panel
// ─────────────────────────────────────────────────────────────────────

export function AgentDetail({
  agent, onClose, onToggleInstall,
}: {
  agent: Agent | null;
  onClose: () => void;
  onToggleInstall?: (id: string, installed: boolean) => void;
}) {
  const open = !!agent;
  const [tab, setTab] = useState<"overview" | "history" | "settings">("overview");
  const [running, setRunning] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState(false);

  const workflow = useMemo(
    () => (agent ? WORKFLOWS[agent.id] ?? genericWorkflow(agent) : null),
    [agent]
  );

  // Reset when agent changes
  useEffect(() => {
    if (open) {
      setTab("overview");
      setRunning(false);
      setStepIdx(0);
      setDone(false);
    }
  }, [open, agent?.id]);

  // Animate the run
  useEffect(() => {
    if (!running || !workflow) return;
    if (stepIdx >= workflow.steps.length) {
      const t = setTimeout(() => { setDone(true); setRunning(false); }, 600);
      return () => clearTimeout(t);
    }
    const step = workflow.steps[stepIdx];
    const t = setTimeout(() => setStepIdx((i) => i + 1), step.durationMs);
    return () => clearTimeout(t);
  }, [running, stepIdx, workflow]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !agent || !workflow) return null;

  const startRun = () => {
    setRunning(true);
    setStepIdx(0);
    setDone(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-ink/25 z-[80] agent-fade" onClick={onClose} />
      <aside
        className="fixed top-0 right-0 h-screen w-full md:w-[640px] z-[85] flex flex-col agent-anim overflow-hidden"
        style={{
          background: "var(--bg)",
          borderLeft: "1px solid var(--line)",
          boxShadow: "-22px 0 50px -22px rgba(15,18,24,0.16)",
        }}
      >
        {/* Header */}
        <header className="px-7 py-5 flex items-start justify-between gap-3 shrink-0"
          style={{ borderBottom: "1px solid var(--line)" }}>
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl grid place-items-center shrink-0 relative overflow-hidden"
              style={{
                background: agent.ours
                  ? "linear-gradient(135deg, rgba(38,109,240,0.14), rgba(38,109,240,0.04))"
                  : "var(--bg-deep)",
                border: agent.ours ? "1px solid rgba(38,109,240,0.22)" : "1px solid var(--line)",
              }}>
              <Bot size={18} strokeWidth={1.8}
                style={{ color: agent.ours ? ACCENT : "var(--ink-2)" }} />
              {agent.installed && (
                <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full"
                  style={{ background: "var(--pos)", boxShadow: "0 0 0 1.5px var(--bg)" }} />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-[16px] font-semibold text-ink leading-tight"
                  style={{ letterSpacing: "-0.014em" }}>
                  {agent.name}
                </h2>
                {agent.ours && (
                  <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(38,109,240,0.12)", color: ACCENT }}>
                    Native
                  </span>
                )}
              </div>
              <div className="text-[11.5px] text-muted">
                {agent.role} · {agent.installed ? (
                  <span style={{ color: "var(--pos)" }}>● Installed</span>
                ) : (
                  <span className="text-muted-2">Not installed</span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg grid place-items-center text-muted hover:text-ink hover:bg-bg-deep transition-colors shrink-0">
            <X size={13} strokeWidth={1.8} />
          </button>
        </header>

        {/* Tabs */}
        <div className="px-7 flex items-center gap-1 shrink-0"
          style={{ borderBottom: "1px solid var(--line)" }}>
          {(["overview", "history", "settings"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="text-[11.5px] font-medium px-3 py-2.5 -mb-px capitalize transition-colors"
              style={{
                color: tab === t ? "var(--ink)" : "var(--muted)",
                borderBottom: tab === t ? `2px solid ${ACCENT}` : "2px solid transparent",
              }}>
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {tab === "overview" && (
            <OverviewTab
              agent={agent}
              workflow={workflow}
              running={running}
              stepIdx={stepIdx}
              done={done}
              onRun={startRun}
            />
          )}
          {tab === "history" && <HistoryTab workflow={workflow} />}
          {tab === "settings" && <SettingsTab agent={agent} workflow={workflow} />}
        </div>

        {/* Footer */}
        <footer className="px-7 py-4 flex items-center justify-between gap-2 shrink-0"
          style={{ borderTop: "1px solid var(--line)", background: "var(--surface)" }}>
          <div className="text-[11px] text-muted">
            Trigger: <span className="text-ink-2">{workflow.trigger}</span>
          </div>
          <button
            onClick={() => onToggleInstall?.(agent.id, !agent.installed)}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold px-4 py-2 rounded-lg transition-transform hover:scale-[1.02]"
            style={
              agent.installed
                ? { background: "var(--bg)", color: "var(--ink-2)", border: "1px solid var(--line)" }
                : { background: "var(--ink)", color: "white" }
            }
          >
            {agent.installed ? "Uninstall" : "Install agent"}
          </button>
        </footer>

        <style jsx>{`
          @keyframes agentIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          .agent-anim { animation: agentIn 360ms cubic-bezier(0.22, 1, 0.36, 1); }
          @keyframes agentFade { from { opacity: 0; } to { opacity: 1; } }
          .agent-fade { animation: agentFade 220ms ease-out; }
        `}</style>
      </aside>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Overview tab — the workflow + animated run + sample output
// ─────────────────────────────────────────────────────────────────────
function OverviewTab({
  agent, workflow, running, stepIdx, done, onRun,
}: {
  agent: Agent;
  workflow: Workflow;
  running: boolean;
  stepIdx: number;
  done: boolean;
  onRun: () => void;
}) {
  return (
    <div>
      {/* What it does */}
      <section className="px-7 py-6">
        <p className="text-[13px] text-ink-2 leading-relaxed">
          {agent.description}
        </p>
      </section>

      {/* Workflow */}
      <section className="px-7 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
            Workflow
          </div>
          {!running && !done && (
            <button
              onClick={onRun}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1.5 rounded-lg text-white transition-transform hover:scale-[1.03]"
              style={{ background: ACCENT, boxShadow: "0 4px 10px -4px rgba(38,109,240,0.5)" }}>
              <Play size={11} strokeWidth={2.4} fill="white" />
              Run sample
            </button>
          )}
          {running && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: ACCENT }} />
              Running…
            </span>
          )}
          {done && (
            <button
              onClick={onRun}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-bg-deep"
              style={{ background: "var(--bg)", color: "var(--ink-2)", border: "1px solid var(--line)" }}>
              <Play size={11} strokeWidth={2.4} />
              Run again
            </button>
          )}
        </div>

        <div className="space-y-2">
          {workflow.steps.map((step, i) => {
            const isDoneStep = done || i < stepIdx;
            const isActive = running && i === stepIdx;
            const isPending = !running && !done && i > 0;
            return (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg transition-all"
                style={{
                  background: isActive ? "rgba(38,109,240,0.06)"
                    : isDoneStep ? "var(--surface)"
                    : "var(--surface)",
                  border: isActive
                    ? `1px solid ${ACCENT}`
                    : "1px solid var(--line)",
                  opacity: isPending ? 0.6 : 1,
                }}
              >
                <div className="w-8 h-8 rounded-md grid place-items-center shrink-0 relative"
                  style={{
                    background: isDoneStep ? "var(--pos-soft)"
                      : isActive ? "rgba(38,109,240,0.14)"
                      : "var(--bg-deep)",
                  }}>
                  {isDoneStep ? (
                    <Check size={13} strokeWidth={2.4} style={{ color: "var(--pos)" }} />
                  ) : (
                    <step.Icon size={13} strokeWidth={1.8}
                      style={{ color: isActive ? ACCENT : "var(--muted)" }} />
                  )}
                  {isActive && (
                    <span className="absolute inset-0 rounded-md animate-ping opacity-30"
                      style={{ background: ACCENT }} />
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="text-[12.5px] font-semibold text-ink leading-tight mb-0.5">
                    {step.label}
                  </div>
                  <div className="text-[11px] text-muted leading-relaxed">
                    {step.detail}
                  </div>
                </div>
                <div className="text-[9.5px] font-mono text-muted-2 shrink-0 mt-0.5">
                  Step {i + 1}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sample output */}
      {(done || (!running && stepIdx === 0)) && (
        <section className="px-7 pb-7">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-3">
            {done ? "Output · sample" : "What it produces"}
          </div>
          <SampleOutputCard sample={workflow.sample} highlighted={done} />
        </section>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Sample output renderers
// ─────────────────────────────────────────────────────────────────────
function SampleOutputCard({ sample, highlighted }: { sample: SampleOutput; highlighted: boolean }) {
  if (sample.kind === "email") {
    return (
      <div className={`rounded-xl overflow-hidden ${highlighted ? "output-fade" : ""}`}
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
        <div className="px-4 py-3 grid grid-cols-[60px_1fr] gap-y-2 gap-x-3 items-center"
          style={{ borderBottom: "1px solid var(--line)" }}>
          <span className="text-[10.5px] text-muted-2 font-medium">From</span>
          <span className="text-[11.5px] text-ink-2 truncate">{sample.from}</span>
          <span className="text-[10.5px] text-muted-2 font-medium">To</span>
          <span className="text-[11.5px] text-ink-2 truncate">{sample.to}</span>
          <span className="text-[10.5px] text-muted-2 font-medium">Subject</span>
          <span className="text-[12px] font-semibold text-ink truncate">{sample.subject}</span>
        </div>
        <div className="px-4 py-3 text-[12px] text-ink leading-[1.6] whitespace-pre-wrap">
          {sample.body}
        </div>
        <style jsx>{`
          @keyframes outputFade {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .output-fade { animation: outputFade 500ms ease-out; }
        `}</style>
      </div>
    );
  }
  if (sample.kind === "brief") {
    return (
      <div className={`rounded-xl p-4 ${highlighted ? "output-fade" : ""}`}
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
        <div className="text-[12.5px] font-semibold text-ink mb-2.5">{sample.title}</div>
        <ul className="space-y-2">
          {sample.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-[11.5px] text-ink-2 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: ACCENT }} />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <style jsx>{`
          @keyframes outputFade {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .output-fade { animation: outputFade 500ms ease-out; }
        `}</style>
      </div>
    );
  }
  if (sample.kind === "alert") {
    return (
      <div className={`rounded-xl overflow-hidden ${highlighted ? "output-fade" : ""}`}
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
        <div className="px-4 py-2.5 text-[12px] font-semibold text-ink"
          style={{ borderBottom: "1px solid var(--line)", background: "var(--bg-deep)" }}>
          {sample.title}
        </div>
        <div className="divide-y divide-line">
          {sample.rows.map((r, i) => (
            <div key={i} className="px-4 py-2.5 flex items-center justify-between gap-3">
              <span className="text-[11.5px] text-ink-2">{r.label}</span>
              <span className="text-[11px] font-mono tnum shrink-0"
                style={{ color: r.tone ?? "var(--muted)" }}>
                {r.value}
              </span>
            </div>
          ))}
        </div>
        <style jsx>{`
          @keyframes outputFade {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .output-fade { animation: outputFade 500ms ease-out; }
        `}</style>
      </div>
    );
  }
  if (sample.kind === "list") {
    return (
      <div className={`rounded-xl p-4 ${highlighted ? "output-fade" : ""}`}
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
        <div className="text-[12.5px] font-semibold text-ink mb-2.5">{sample.title}</div>
        <ul className="space-y-1.5">
          {sample.rows.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-[11.5px] text-ink-2 leading-relaxed">
              <Check size={11} strokeWidth={2.2} className="mt-1 shrink-0" style={{ color: "var(--pos)" }} />
              <span>{r}</span>
            </li>
          ))}
        </ul>
        <style jsx>{`
          @keyframes outputFade {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .output-fade { animation: outputFade 500ms ease-out; }
        `}</style>
      </div>
    );
  }
  if (sample.kind === "deck") {
    return (
      <div className={`rounded-xl p-4 ${highlighted ? "output-fade" : ""}`}
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
        <div className="text-[12.5px] font-semibold text-ink mb-3">{sample.title}</div>
        <div className="grid grid-cols-2 gap-2">
          {sample.slides.map((s, i) => (
            <div key={i} className="rounded-md aspect-[16/10] p-3 flex flex-col justify-between"
              style={{ background: "var(--bg-deep)", border: "1px solid var(--line)" }}>
              <span className="text-[8.5px] font-mono text-muted-2">Slide {i + 1}</span>
              <span className="text-[10px] font-medium text-ink-2 leading-tight">{s}</span>
            </div>
          ))}
        </div>
        <style jsx>{`
          @keyframes outputFade {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .output-fade { animation: outputFade 500ms ease-out; }
        `}</style>
      </div>
    );
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────
// History tab
// ─────────────────────────────────────────────────────────────────────
function HistoryTab({ workflow }: { workflow: Workflow }) {
  return (
    <div className="px-7 py-6">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-3">
        Recent runs
      </div>
      <div className="space-y-1.5">
        {workflow.recentRuns.map((r, i) => (
          <div key={i}
            className="flex items-center gap-3 px-4 py-3 rounded-lg"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
            {r.account !== "—" ? (
              <Logo name={r.account} size={20} rounded={4} />
            ) : (
              <div className="w-5 h-5 rounded grid place-items-center"
                style={{ background: "var(--bg-deep)" }}>
                <Bot size={10} strokeWidth={1.8} className="text-muted-2" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {r.account !== "—" && (
                <div className="text-[12px] font-semibold text-ink truncate">{r.account}</div>
              )}
              <div className="text-[11px] text-muted truncate">{r.outcome}</div>
            </div>
            <span className="text-[10px] font-mono tnum text-muted-2 shrink-0">{r.ago}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Settings tab
// ─────────────────────────────────────────────────────────────────────
function SettingsTab({ agent, workflow }: { agent: Agent; workflow: Workflow }) {
  return (
    <div className="px-7 py-6 space-y-5">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-2">
          Trigger
        </div>
        <div className="rounded-lg p-3 text-[12px] text-ink-2"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          {workflow.trigger}
        </div>
      </div>

      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-2">
          Channels
        </div>
        <div className="space-y-1.5">
          {[
            { label: "Home page · activity feed", on: true },
            { label: "Slack DM",                  on: agent.role === "Customer Success" },
            { label: "Email digest · daily 8am",  on: false },
            { label: "Push to mobile",            on: false },
          ].map((c) => (
            <div key={c.label}
              className="flex items-center justify-between px-3 py-2 rounded-lg"
              style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
              <span className="text-[11.5px] text-ink-2">{c.label}</span>
              <span
                className="w-7 h-4 rounded-full relative transition-colors"
                style={{ background: c.on ? ACCENT : "var(--bg-deep)" }}>
                <span className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all"
                  style={{ left: c.on ? "calc(100% - 14px)" : "2px" }} />
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-2">
          Connected systems
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["Salesforce", "Gong", "Zendesk", "Mixpanel", "Slack", "LinkedIn"].map((s) => (
            <span key={s}
              className="text-[10.5px] font-medium px-2 py-1 rounded-md"
              style={{ background: "var(--bg-deep)", color: "var(--ink-2)", border: "1px solid var(--line)" }}>
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
