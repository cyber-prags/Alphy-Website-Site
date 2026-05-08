"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  X, ArrowRight, ArrowUpRight, Calendar, Activity, AlertTriangle,
  ShieldCheck, Crown, User, Wrench, Briefcase, Sparkles, Mail,
  TrendingUp, TrendingDown, Minus, ChevronRight, ChevronLeft, Eye,
} from "lucide-react";
import { Logo } from "./Logo";
import { fmtMoney, slugify, type Account } from "@/lib/mock";

const ACCENT = "#266DF0";

// ─────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────

export type PeekActivity = {
  id: string;
  text: string;
  ago: string;
  tone: "neg" | "warn" | "pos" | "info" | "neutral";
};

export type PeekConfig = {
  account: Account;
  /** Entry context — affects which section is emphasised. */
  source?: "renewal" | "health" | "default";
  /** Recent activity items pre-filtered for this account. */
  activity?: PeekActivity[];
};

// ─────────────────────────────────────────────────────────────────────
// Per-account fixtures — stakeholder map and health driver weights.
// Anything not pre-defined falls back to derived defaults.
// ─────────────────────────────────────────────────────────────────────

type Stakeholder = { role: string; Icon: any; name?: string; status: "covered" | "weak" | "gap" };
type HealthDriver = { label: string; score: number; tone: string; sub?: string };
type ForecastTone = "on-track" | "at-risk" | "slipping";

type Fixture = {
  forecast: { tone: ForecastTone; confidence: number; note: string };
  stakeholders: Stakeholder[];
  drivers: HealthDriver[];
  recommended: { title: string; body: string };
};

const FALLBACK_DRIVERS: HealthDriver[] = [
  { label: "Sponsor cadence",  score: 50, tone: "var(--warn)",  sub: "—" },
  { label: "Product usage",    score: 50, tone: "var(--info)",  sub: "—" },
  { label: "Support burden",   score: 50, tone: "var(--ink-2)", sub: "—" },
  { label: "QBR cadence",      score: 50, tone: "var(--info)",  sub: "—" },
];

const FIXTURES: Record<string, Fixture> = {
  "Snowflake Inc.": {
    forecast: { tone: "at-risk", confidence: 38, note: "Sponsor coverage dropped to 1. Without exec re-engagement this week, the renewal moves into procurement-led territory." },
    stakeholders: [
      { role: "Champion",    Icon: Crown,     name: "Brad Wallace · VP Sales Ops", status: "weak" },
      { role: "Economic",    Icon: Briefcase, status: "gap" },
      { role: "Technical",   Icon: Wrench,    name: "Ling Wei · Director, Data",   status: "covered" },
      { role: "End-user",    Icon: User,      name: "3 active leads",               status: "covered" },
      { role: "Procurement", Icon: Briefcase, status: "gap" },
    ],
    drivers: [
      { label: "Sponsor cadence", score: 28, tone: "var(--neg)",  sub: "Brad silent 14 days · James departed" },
      { label: "Product usage",   score: 62, tone: "var(--warn)", sub: "WAU/MAU 0.61 — slipping" },
      { label: "Support burden",  score: 75, tone: "var(--pos)",  sub: "0 sev-1, 1 sev-2 open" },
      { label: "QBR cadence",     score: 30, tone: "var(--neg)",  sub: "Last QBR 92 days ago" },
    ],
    recommended: {
      title: "Run save play before renewal call",
      body: "Loop in exec sponsor, schedule emergency check-in, send 30-day adoption recap to Brad.",
    },
  },
  "GitLab Inc.": {
    forecast: { tone: "at-risk", confidence: 44, note: "Three teams fully inactive. Champion engagement decay matches Stripe's 90-day pre-churn pattern." },
    stakeholders: [
      { role: "Champion",    Icon: Crown,     name: "Alex Rivera · Director Eng",  status: "weak" },
      { role: "Economic",    Icon: Briefcase, name: "Priya Gupta · CFO",            status: "covered" },
      { role: "Technical",   Icon: Wrench,    name: "Sam Patel · Eng Manager",     status: "weak" },
      { role: "End-user",    Icon: User,      status: "gap" },
      { role: "Procurement", Icon: Briefcase, status: "covered" },
    ],
    drivers: [
      { label: "Sponsor cadence", score: 50, tone: "var(--warn)", sub: "Alex hasn't replied in 11 days" },
      { label: "Product usage",   score: 22, tone: "var(--neg)",  sub: "WAU/MAU 0.48 · 3 teams dormant" },
      { label: "Support burden",  score: 68, tone: "var(--warn)", sub: "2 escalated tickets last 14d" },
      { label: "QBR cadence",     score: 60, tone: "var(--info)", sub: "Last QBR 45 days ago" },
    ],
    recommended: {
      title: "Restart adoption with a value snapshot",
      body: "One-page recap of working vs slipping, attached to a renewal-aware outreach to Alex.",
    },
  },
  "Akamai Technologies": {
    forecast: { tone: "on-track", confidence: 72, note: "QBR overdue but pipeline cover is healthy. Priya is new — get the QBR back on the books to lock the narrative." },
    stakeholders: [
      { role: "Champion",    Icon: Crown,     name: "Priya Sharma · Head of RevOps", status: "covered" },
      { role: "Economic",    Icon: Briefcase, name: "Mira Cohen · VP Eng",          status: "covered" },
      { role: "Technical",   Icon: Wrench,    name: "Dev Kapoor · Sr Eng",          status: "covered" },
      { role: "End-user",    Icon: User,      name: "12 active",                     status: "covered" },
      { role: "Procurement", Icon: Briefcase, status: "weak" },
    ],
    drivers: [
      { label: "Sponsor cadence", score: 65, tone: "var(--info)", sub: "Priya new to role · 2 wks tenure" },
      { label: "Product usage",   score: 78, tone: "var(--pos)",  sub: "WAU/MAU 0.71 · steady" },
      { label: "Support burden",  score: 82, tone: "var(--pos)",  sub: "0 escalations" },
      { label: "QBR cadence",     score: 38, tone: "var(--warn)", sub: "QBR 14 days overdue" },
    ],
    recommended: {
      title: "Recover the QBR this week",
      body: "Short reset call with Priya, walk through where the account stands and what's planned for Q2.",
    },
  },
  "Cloudflare, Inc.": {
    forecast: { tone: "on-track", confidence: 88, note: "Maya's promotion expanded budget into Networking + Security. Renewal kickoff already booked with procurement for May 22." },
    stakeholders: [
      { role: "Champion",    Icon: Crown,     name: "Maya Chen · VP Engineering",  status: "covered" },
      { role: "Economic",    Icon: Briefcase, name: "Rohan Das · CTO",              status: "covered" },
      { role: "Technical",   Icon: Wrench,    name: "Ben Liu · Principal Eng",     status: "covered" },
      { role: "End-user",    Icon: User,      name: "22 active",                    status: "covered" },
      { role: "Procurement", Icon: Briefcase, name: "Sara Nguyen · Procurement",    status: "covered" },
    ],
    drivers: [
      { label: "Sponsor cadence", score: 88, tone: "var(--pos)",  sub: "Last touch 2 days ago" },
      { label: "Product usage",   score: 84, tone: "var(--pos)",  sub: "Hit 92% Networking limits 3×" },
      { label: "Support burden",  score: 90, tone: "var(--pos)",  sub: "0 escalations" },
      { label: "QBR cadence",     score: 88, tone: "var(--pos)",  sub: "On schedule · next May 22" },
    ],
    recommended: {
      title: "Build the expansion case for Maya",
      body: "Bundle Networking + Security ahead of renewal — match procurement's simplification mandate.",
    },
  },
  "Tableau Software": {
    forecast: { tone: "on-track", confidence: 80, note: "Hiring 4 ML engineers — governance gap flagged. Strong moment to expand the data-platform footprint." },
    stakeholders: [
      { role: "Champion",    Icon: Crown,     name: "Owen Marsh · Dir Analytics",  status: "covered" },
      { role: "Economic",    Icon: Briefcase, name: "Lara Ng · VP Data",            status: "covered" },
      { role: "Technical",   Icon: Wrench,    name: "Jay Patel · Lead Eng",         status: "covered" },
      { role: "End-user",    Icon: User,      name: "ML team forming",              status: "weak" },
      { role: "Procurement", Icon: Briefcase, status: "weak" },
    ],
    drivers: [
      { label: "Sponsor cadence", score: 82, tone: "var(--pos)",  sub: "Owen replied 4h ago" },
      { label: "Product usage",   score: 76, tone: "var(--pos)",  sub: "12 new seats added this week" },
      { label: "Support burden",  score: 58, tone: "var(--warn)", sub: "3 sev-2 tickets · SLA risk" },
      { label: "QBR cadence",     score: 80, tone: "var(--pos)",  sub: "On schedule" },
    ],
    recommended: {
      title: "Surface ML governance to the new team",
      body: "Co-create a 30-min onboarding for the 4 incoming engineers — anchors expansion plus stabilises tickets.",
    },
  },
};

function getFixture(account: Account): Fixture {
  return FIXTURES[account.name] ?? {
    forecast: {
      tone: account.healthScore >= 75 ? "on-track" : account.healthScore >= 60 ? "on-track" : "at-risk",
      confidence: account.healthScore,
      note: account.signal,
    },
    stakeholders: [
      { role: "Champion",    Icon: Crown,     status: account.healthScore >= 70 ? "covered" : "weak" },
      { role: "Economic",    Icon: Briefcase, status: "weak" },
      { role: "Technical",   Icon: Wrench,    status: "covered" },
      { role: "End-user",    Icon: User,      status: "covered" },
      { role: "Procurement", Icon: Briefcase, status: "weak" },
    ],
    drivers: FALLBACK_DRIVERS,
    recommended: {
      title: "Open the account to plan the next move",
      body: account.signal,
    },
  };
}

const FORECAST_META: Record<ForecastTone, { label: string; tone: string; soft: string; Icon: any }> = {
  "on-track":  { label: "On track",  tone: "var(--pos)",  soft: "var(--pos-soft)",  Icon: ShieldCheck },
  "at-risk":   { label: "At risk",   tone: "var(--neg)",  soft: "var(--neg-soft)",  Icon: AlertTriangle },
  "slipping":  { label: "Slipping",  tone: "var(--warn)", soft: "var(--warn-soft)", Icon: TrendingDown },
};

const STAKEHOLDER_META: Record<Stakeholder["status"], { dot: string; label: string }> = {
  covered: { dot: "var(--pos)",   label: "Covered" },
  weak:    { dot: "var(--warn)",  label: "Weak" },
  gap:     { dot: "var(--neg)",   label: "Gap" },
};

const ACTIVITY_TONE: Record<PeekActivity["tone"], string> = {
  neg:     "var(--neg)",
  warn:    "var(--warn)",
  pos:     "var(--pos)",
  info:    "var(--info)",
  neutral: "var(--muted)",
};

// ─────────────────────────────────────────────────────────────────────
// AccountPeek — focused side panel for a single account.
// Lighter than ExecutionDrawer (no progress bar, faster slide).
// ─────────────────────────────────────────────────────────────────────

export function AccountPeek({
  config,
  onClose,
  onAction,
}: {
  config: PeekConfig | null;
  onClose: () => void;
  onAction?: (action: "outreach" | "save-play", account: Account) => void;
}) {
  const open = !!config;
  const [savePlayOpen, setSavePlayOpen] = useState(false);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Reset modal when the panel closes
  useEffect(() => { if (!open) setSavePlayOpen(false); }, [open]);

  if (!open || !config) return null;

  const { account, source = "default", activity = [] } = config;
  const fixture = getFixture(account);
  const forecastMeta = FORECAST_META[fixture.forecast.tone];

  return (
    <>
      <div className="fixed inset-0 bg-ink/20 z-[80] peek-fade" onClick={onClose} />
      <aside
        className="fixed top-3 right-3 bottom-3 w-full md:w-[520px] z-[85] flex flex-col peek-anim overflow-hidden rounded-2xl"
        style={{
          maxWidth: "calc(100vw - 24px)",
          background: "var(--bg)",
          border: "1px solid var(--line)",
          boxShadow: "0 24px 60px -16px rgba(15,18,24,0.30), -22px 0 50px -22px rgba(15,18,24,0.16)",
        }}
      >
        {/* Header */}
        <header className="px-6 py-5 flex items-start justify-between gap-3 shrink-0"
          style={{ borderBottom: "1px solid var(--line)" }}>
          <div className="flex items-start gap-3 min-w-0">
            <Logo name={account.name} size={36} rounded={9} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-[16px] font-semibold text-ink leading-tight truncate"
                  style={{ letterSpacing: "-0.014em" }}>
                  {account.name}
                </h2>
                <span className="text-[10px] font-mono uppercase tracking-[0.08em] px-1.5 py-0.5 rounded text-muted-2"
                  style={{ background: "var(--bg-deep)", border: "1px solid var(--line)" }}>
                  {account.tier}
                </span>
              </div>
              <div className="text-[11.5px] text-muted">
                {account.segment} · {account.industry}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Link
              href={`/accounts/${slugify(account.name)}`}
              className="text-[11px] font-medium text-muted hover:text-ink inline-flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-bg-deep transition-colors"
              title="Open full account workspace"
            >
              Full view
              <ArrowUpRight size={11} strokeWidth={2} />
            </Link>
            <button onClick={onClose}
              className="w-7 h-7 rounded-lg grid place-items-center text-muted hover:text-ink hover:bg-bg-deep transition-colors">
              <X size={13} strokeWidth={1.8} />
            </button>
          </div>
        </header>

        {/* Stats strip — softer dividers + per-tile background so each KPI reads as its own chip */}
        <div className="px-5 py-3 flex gap-2 shrink-0"
          style={{ borderBottom: "1px solid var(--line)" }}>
          <KpiChip label="ARR"     value={fmtMoney(account.arr)} tone="var(--ink)" />
          <KpiChip label="Renewal"
            value={account.renewalDays > 0 ? `${account.renewalDays}d` : account.renewalDays === 0 ? "—" : `${Math.abs(account.renewalDays)}d ago`}
            tone={account.renewalDays > 0 && account.renewalDays <= 30 ? "var(--neg)" : account.renewalDays > 0 && account.renewalDays <= 60 ? "var(--warn)" : "var(--ink)"} />
          <KpiChip label="Health"   value={String(account.healthScore)}
            tone={account.healthScore >= 75 ? "var(--pos)" : account.healthScore >= 60 ? "var(--warn)" : "var(--neg)"} />
          <KpiChip label="NRR"      value={account.nrr ? `${account.nrr}%` : "—"}
            tone={account.nrr >= 110 ? "var(--pos)" : account.nrr >= 90 ? "var(--warn)" : "var(--ink)"} />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Forecast */}
          <Section label="Renewal forecast" emphasis={source === "renewal"}>
            <div className="rounded-xl p-4"
              style={{ background: forecastMeta.soft, border: `1px solid ${forecastMeta.tone}33` }}>
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold"
                  style={{ color: forecastMeta.tone }}>
                  <forecastMeta.Icon size={12} strokeWidth={2.4} />
                  {forecastMeta.label}
                </span>
                <span className="text-[10.5px] font-mono tnum text-muted">
                  {fixture.forecast.confidence}% confidence
                </span>
              </div>
              <p className="text-[12.5px] text-ink-2 leading-relaxed">
                {fixture.forecast.note}
              </p>
              <div className="mt-3 h-1 rounded-full overflow-hidden"
                style={{ background: "rgba(15,18,24,0.06)" }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${fixture.forecast.confidence}%`,
                    background: forecastMeta.tone,
                  }} />
              </div>
            </div>
          </Section>

          {/* Stakeholder coverage */}
          <Section label="Stakeholder coverage">
            <div className="rounded-xl overflow-hidden"
              style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
              {fixture.stakeholders.map((s, i) => {
                const meta = STAKEHOLDER_META[s.status];
                return (
                  <div
                    key={s.role}
                    className="flex items-center gap-3 px-3.5 py-2.5"
                    style={{ borderTop: i === 0 ? "none" : "1px solid var(--line)" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: meta.dot }} />
                    <s.Icon size={12} strokeWidth={1.8} className="text-muted-2 shrink-0" />
                    <span className="text-[12px] font-medium text-ink-2 w-[88px] shrink-0">{s.role}</span>
                    <span className="text-[12px] text-ink truncate flex-1">
                      {s.name ?? <span className="text-muted-2 italic">— {meta.label.toLowerCase()}</span>}
                    </span>
                    {s.status === "gap" && (
                      <span className="text-[9.5px] font-semibold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded shrink-0"
                        style={{ background: "var(--neg-soft)", color: "var(--neg)" }}>
                        Gap
                      </span>
                    )}
                    {s.status === "weak" && (
                      <span className="text-[9.5px] font-semibold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded shrink-0"
                        style={{ background: "var(--warn-soft)", color: "var(--warn)" }}>
                        Weak
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Health drivers */}
          <Section label="Health drivers" emphasis={source === "health"}>
            <div className="rounded-xl p-4 space-y-3"
              style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
              {fixture.drivers.map((d) => (
                <DriverBar key={d.label} driver={d} />
              ))}
            </div>
          </Section>

          {/* Recent activity */}
          {activity.length > 0 && (
            <Section label="Recent activity">
              <div className="space-y-1">
                {activity.slice(0, 5).map((a) => (
                  <div key={a.id}
                    className="flex items-start gap-3 px-3 py-2 -mx-3 rounded-lg hover:bg-bg-deep transition-colors">
                    <span className="text-[10.5px] font-mono tnum text-muted-2 shrink-0 mt-0.5 w-8 text-right">
                      {a.ago}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: ACTIVITY_TONE[a.tone] }} />
                    <span className="text-[12px] text-ink-2 leading-snug flex-1">{a.text}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Recommended next move */}
          <Section label="Recommended next move">
            <div className="rounded-xl p-4 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(38,109,240,0.06) 0%, rgba(38,109,240,0.02) 100%)",
                border: "1px solid rgba(38,109,240,0.18)",
              }}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg grid place-items-center shrink-0"
                  style={{ background: ACCENT, boxShadow: "0 4px 12px -4px rgba(38,109,240,0.4)" }}>
                  <Sparkles size={14} strokeWidth={2.2} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-ink leading-tight mb-1"
                    style={{ letterSpacing: "-0.01em" }}>
                    {fixture.recommended.title}
                  </div>
                  <p className="text-[12px] text-muted leading-relaxed">
                    {fixture.recommended.body}
                  </p>
                </div>
              </div>
            </div>
          </Section>

          <div className="h-4" />
        </div>

        {/* Footer actions */}
        <footer className="px-6 py-4 flex items-center gap-2 shrink-0"
          style={{ borderTop: "1px solid var(--line)", background: "var(--surface)" }}>
          <button
            onClick={() => onAction?.("outreach", account)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-[12.5px] font-medium px-3 py-2 rounded-lg transition-colors hover:bg-bg-deep"
            style={{ background: "var(--bg)", color: "var(--ink-2)", border: "1px solid var(--line)" }}>
            <Mail size={12} strokeWidth={2} /> Draft outreach
          </button>
          <button
            onClick={() => setSavePlayOpen(true)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-[12.5px] font-semibold px-3 py-2 rounded-lg text-white transition-transform hover:scale-[1.02]"
            style={{ background: "var(--ink)" }}>
            <Sparkles size={12} strokeWidth={2.2} /> Run save play
          </button>
        </footer>

        <style jsx>{`
          @keyframes peekIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          .peek-anim { animation: peekIn 320ms cubic-bezier(0.22, 1, 0.36, 1); }
          @keyframes peekFade { from { opacity: 0; } to { opacity: 1; } }
          .peek-fade { animation: peekFade 200ms ease-out; }
        `}</style>
      </aside>

      {/* Save Play preview modal — confirms the play before firing the drawer */}
      {savePlayOpen && (
        <SavePlayPreview
          account={account}
          fixture={fixture}
          onClose={() => setSavePlayOpen(false)}
          onConfirm={() => {
            setSavePlayOpen(false);
            onAction?.("save-play", account);
          }}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Save-play preview modal — rich pre-flight before the drawer animation.
// Shows: trigger summary, the 5-step play, who's assigned, ETA. The user
// can edit assignments inline (visual-only) and confirm.
// ─────────────────────────────────────────────────────────────────────
function SavePlayPreview({ account, fixture, onClose, onConfirm }: {
  account: Account;
  fixture: ReturnType<typeof getFixture>;
  onClose: () => void;
  onConfirm: () => void;
}) {
  // Steps tailored to the play. We use the fixture for context.
  const steps = [
    { label: "Escalate to exec sponsor",            owner: "Brad Allen",   eta: "Today",     impact: "Critical" },
    { label: "Schedule emergency check-in",         owner: "Brad Allen",   eta: "By Friday", impact: "High" },
    { label: "Resolve open P0 ticket",              owner: "Support · L2", eta: "48h",       impact: "High" },
    { label: "Re-engage two dormant power users",   owner: "Maya Wilson",  eta: "This week", impact: "Med" },
    { label: "Re-baseline outcomes for renewal",    owner: "Sarah Chen",   eta: "Next week", impact: "Med" },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6"
      onClick={onClose}>
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[3px]" />
      <div className="relative w-full max-w-[560px] rounded-2xl overflow-hidden bg-bg border border-line"
        style={{ boxShadow: "0 32px 80px -16px rgba(15,18,24,0.45)" }}
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-3 border-b border-line">
          <div className="w-9 h-9 rounded-lg grid place-items-center flex-shrink-0"
            style={{ background: "rgba(38,109,240,0.10)", border: "1px solid rgba(38,109,240,0.20)" }}>
            <Sparkles size={14} strokeWidth={2} style={{ color: "var(--accent)" }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">Save play · pre-flight</div>
            <div className="text-[15.5px] font-semibold text-ink leading-tight"
              style={{ letterSpacing: "-0.014em" }}>{fixture.recommended.title}</div>
          </div>
          <button onClick={onClose}
            className="text-muted hover:text-ink p-1 rounded transition-colors">
            <X size={14} strokeWidth={1.8} />
          </button>
        </div>

        {/* Trigger context */}
        <div className="px-5 py-3.5 border-b border-line"
          style={{ background: "var(--surface)" }}>
          <div className="flex items-center gap-2 mb-1.5">
            <Logo name={account.name} size={18} />
            <span className="text-[12.5px] font-semibold text-ink">{account.name}</span>
            <span className="text-[10px] font-mono uppercase tracking-[0.10em] px-1.5 py-0.5 rounded text-muted-2"
              style={{ background: "var(--bg-deep)", border: "1px solid var(--line)" }}>{account.tier}</span>
          </div>
          <p className="text-[12px] text-ink-2 leading-relaxed">{fixture.recommended.body}</p>
        </div>

        {/* Steps */}
        <div className="px-5 py-4 space-y-2 max-h-[320px] overflow-y-auto">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-2">Playbook · {steps.length} steps</div>
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5"
              style={{ background: "var(--bg-deep)", border: "1px solid var(--line)" }}>
              <span className="w-6 h-6 rounded-full grid place-items-center text-[11px] font-mono tnum text-muted-2 flex-shrink-0"
                style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-semibold text-ink truncate">{s.label}</div>
                <div className="text-[10.5px] text-muted">{s.owner} · {s.eta}</div>
              </div>
              <span className="text-[9.5px] font-semibold uppercase tracking-[0.10em] px-1.5 py-0.5 rounded flex-shrink-0"
                style={{
                  background: s.impact === "Critical" ? "rgba(239,68,68,0.10)" : s.impact === "High" ? "rgba(245,158,11,0.10)" : "rgba(38,109,240,0.10)",
                  color:      s.impact === "Critical" ? "#EF4444"             : s.impact === "High" ? "#D97706"             : "var(--accent)",
                  border:    `1px solid ${s.impact === "Critical" ? "rgba(239,68,68,0.20)" : s.impact === "High" ? "rgba(245,158,11,0.20)" : "rgba(38,109,240,0.20)"}`,
                }}>
                {s.impact}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-line flex items-center justify-between gap-2">
          <span className="text-[11.5px] text-muted">
            ETA · ~3 minutes · 2 approvals required
          </span>
          <div className="flex items-center gap-2">
            <button onClick={onClose}
              className="text-[12px] font-medium px-3 py-2 rounded-lg border border-line bg-surface hover:bg-bg-deep transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm}
              className="text-[12px] font-semibold px-3.5 py-2 rounded-lg text-white inline-flex items-center gap-1.5 transition-transform hover:scale-[1.02]"
              style={{ background: "var(--ink)" }}>
              <Sparkles size={12} strokeWidth={2.2} /> Run play
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────

function Section({ label, emphasis, children }: {
  label: string; emphasis?: boolean; children: React.ReactNode;
}) {
  return (
    <section className="px-6 py-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
          {label}
        </span>
        {emphasis && (
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: ACCENT }} />
        )}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div>
      <div className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted-2 mb-0.5">
        {label}
      </div>
      <div className="text-[16px] font-semibold tnum leading-none"
        style={{ color: tone, letterSpacing: "-0.018em" }}>
        {value}
      </div>
    </div>
  );
}

// Modern KPI chip — soft tinted background, large ink-coloured value, used in
// the peek panel header strip.
function KpiChip({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="flex-1 rounded-xl px-3 py-2.5"
      style={{ background: "var(--bg-deep)", border: "1px solid var(--line)" }}>
      <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1">{label}</div>
      <div className="text-[16px] font-bold tnum leading-none"
        style={{ color: tone, letterSpacing: "-0.018em" }}>
        {value}
      </div>
    </div>
  );
}

function DriverBar({ driver }: { driver: HealthDriver }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[12px] font-medium text-ink-2">{driver.label}</span>
        <span className="text-[11px] font-mono tnum" style={{ color: driver.tone }}>
          {driver.score}
        </span>
      </div>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => {
          const filled = i < Math.round(driver.score / 10);
          return (
            <span
              key={i}
              className="flex-1 h-1.5 rounded-sm transition-colors"
              style={{
                background: filled ? driver.tone : "var(--bg-deep)",
                opacity: filled ? 1 : 1,
              }}
            />
          );
        })}
      </div>
      {driver.sub && (
        <div className="text-[10.5px] text-muted mt-1.5 leading-snug">{driver.sub}</div>
      )}
    </div>
  );
}
