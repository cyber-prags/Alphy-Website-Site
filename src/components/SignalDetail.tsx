"use client";

import { useMemo } from "react";
import {
  ArrowRight, ArrowUpRight, Calendar, Crown, Mail, MessageSquare,
  Sparkles, TrendingDown, TrendingUp, AlertTriangle, ShieldCheck,
  Users, Activity as ActivityIcon, Zap, FileText, Eye, Star,
  CheckCircle2, ExternalLink, Clock, Layers, BarChart3,
} from "lucide-react";

const ACCENT = "#266DF0";

// ─────────────────────────────────────────────────────────────────────
// Types — must match the host's ActivityItem shape.
// ─────────────────────────────────────────────────────────────────────

export type SignalKind =
  | "champion"
  | "departure"
  | "usage"
  | "deal"
  | "renewal"
  | "note";

export type SignalAction = {
  id: string;
  label: string;
  Icon: any;
  primary?: boolean;
};

export type SignalDetailItem = {
  id: string;
  kind: SignalKind;
  account: string;
  accountSlug: string;
  text: string;
  ago: string;
};

type ActionHandler = (id: string, account: string) => void;

// ─────────────────────────────────────────────────────────────────────
// Per-signal fixtures — keyed on activity id. Falls back to the kind
// default if a specific id isn't found.
// ─────────────────────────────────────────────────────────────────────

type Fixture = {
  evidence?: string;        // top-line evidence string
  body: React.ReactNode;    // kind-specific content body
  actions: SignalAction[];
};

// ───── Fixture component primitives (don't render unless invoked) ─────

function MiniSparkline({ values, tone, peakLabel, dipLabel }: {
  values: number[]; tone: string; peakLabel?: string; dipLabel?: string;
}) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 220;
  const h = 44;
  const stepX = w / (values.length - 1);
  const points = values.map((v, i) => `${i * stepX},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <div>
      <svg width={w} height={h} className="block">
        <defs>
          <linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tone} stopOpacity="0.25" />
            <stop offset="100%" stopColor={tone} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          fill="url(#sparkfill)"
          stroke="none"
          points={`0,${h} ${points} ${w},${h}`}
        />
        <polyline
          fill="none"
          stroke={tone}
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
        />
        <circle cx={w} cy={h - ((values[values.length - 1] - min) / range) * h} r={2.5} fill={tone} />
      </svg>
      {(peakLabel || dipLabel) && (
        <div className="flex items-center justify-between text-[10px] text-muted-2 mt-1 font-mono">
          {peakLabel && <span>{peakLabel}</span>}
          {dipLabel && <span style={{ color: tone }}>{dipLabel}</span>}
        </div>
      )}
    </div>
  );
}

function MiniBar({ label, value, prev, tone, sub }: {
  label: string; value: number; prev?: number; tone: string; sub?: string;
}) {
  const pct = Math.min(100, Math.max(0, value));
  const delta = prev !== undefined ? value - prev : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[11.5px] font-medium text-ink-2">{label}</span>
        <span className="text-[10.5px] font-mono tnum text-muted">
          {pct}%{prev !== undefined && (
            <span className={delta < 0 ? "ml-1" : "ml-1"} style={{ color: delta < 0 ? "var(--neg)" : "var(--pos)" }}>
              {delta > 0 ? "↑" : "↓"} from {prev}%
            </span>
          )}
        </span>
      </div>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 16 }).map((_, i) => {
          const filled = i < Math.round(pct / (100 / 16));
          return (
            <span key={i}
              className="flex-1 h-1.5 rounded-sm"
              style={{ background: filled ? tone : "var(--bg-deep)" }} />
          );
        })}
      </div>
      {sub && <div className="text-[10.5px] text-muted mt-1">{sub}</div>}
    </div>
  );
}

function TouchTimeline({ events, gapStart, gapDays }: {
  events: { day: number; label: string; tone: string }[];
  gapStart?: number; gapDays?: number;
}) {
  // Render a 30-day horizontal track. day=0 is "today" on the right.
  // Events are positioned by day-from-today (positive number = days ago).
  const w = 100; // percent
  return (
    <div>
      <div className="relative h-9">
        {/* Track */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px"
          style={{ background: "var(--line)" }} />
        {/* Silence gap */}
        {gapStart !== undefined && gapDays !== undefined && (
          <div className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full"
            style={{
              right: 0,
              width: `${(gapDays / 30) * 100}%`,
              background: "var(--neg)",
              opacity: 0.16,
            }} />
        )}
        {/* Events */}
        {events.map((e, i) => {
          const xPct = ((30 - e.day) / 30) * 100;
          return (
            <div key={i}
              className="absolute -translate-x-1/2 group"
              style={{ left: `${xPct}%`, top: 0 }}>
              <span className="block w-2 h-2 rounded-full mt-3.5"
                style={{ background: e.tone, boxShadow: `0 0 0 2px var(--bg)` }} />
              <span className="absolute left-1/2 -translate-x-1/2 -top-2 whitespace-nowrap text-[9px] text-muted-2 font-mono opacity-0 group-hover:opacity-100 transition-opacity bg-bg-deep px-1.5 py-0.5 rounded shadow-sm">
                {e.label}
              </span>
            </div>
          );
        })}
        {/* Today marker */}
        <div className="absolute right-0 top-0 bottom-0 w-px" style={{ background: ACCENT, opacity: 0.6 }} />
      </div>
      <div className="flex justify-between text-[9.5px] font-mono text-muted-2 mt-1">
        <span>30d ago</span>
        <span>15d</span>
        <span style={{ color: ACCENT }}>today</span>
      </div>
    </div>
  );
}

function StatPill({ label, value, tone, soft }: { label: string; value: string; tone?: string; soft?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md"
      style={{ background: soft ?? "var(--bg-deep)", color: tone ?? "var(--ink-2)" }}>
      <span className="text-muted-2 font-normal">{label}</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-2">
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// The kind-specific layouts.
// ─────────────────────────────────────────────────────────────────────

function getFixture(item: SignalDetailItem): Fixture {
  // Specific overrides keyed by id
  if (item.id === "ca1" || (item.kind === "departure" && item.account === "Snowflake")) {
    return {
      body: (
        <div className="space-y-4">
          <div>
            <SectionLabel>Sponsor activity · last 30 days</SectionLabel>
            <TouchTimeline
              events={[
                { day: 28, label: "Email · Apr 9",    tone: "var(--ink-2)" },
                { day: 22, label: "Call · Apr 15",    tone: "var(--ink-2)" },
                { day: 17, label: "Email · Apr 20",   tone: "var(--ink-2)" },
                { day: 14, label: "Email · Apr 23",   tone: "var(--ink-2)" },
                { day: 13, label: "Last reply · Apr 24", tone: "var(--accent-deep)" },
              ]}
              gapDays={13}
            />
          </div>

          <div>
            <SectionLabel>Last meaningful touch · 13 days ago</SectionLabel>
            <div className="rounded-lg p-3"
              style={{ background: "var(--bg-deep)", border: "1px solid var(--line)" }}>
              <div className="flex items-center gap-2 mb-1">
                <Mail size={11} strokeWidth={1.8} className="text-muted-2" />
                <span className="text-[11.5px] font-medium text-ink-2">Quick reply on renewal kickoff thread</span>
                <span className="text-muted-2 ml-auto text-[10.5px] font-mono">Apr 24</span>
              </div>
              <p className="text-[11.5px] text-muted leading-snug">
                "Looks good, will loop back next week with the procurement timeline." — no follow-up since.
              </p>
            </div>
          </div>

          <div>
            <SectionLabel>Other sponsors</SectionLabel>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--pos)" }} />
                <span className="text-[12px] font-semibold text-ink">Ling Wei</span>
                <span className="text-[11px] text-muted">· Director, Data</span>
                <span className="text-[10px] font-medium ml-auto px-1.5 py-0.5 rounded"
                  style={{ background: "var(--pos-soft)", color: "var(--pos)" }}>Active</span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg opacity-70"
                style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--neg)" }} />
                <span className="text-[12px] font-semibold text-ink line-through">James Whitfield</span>
                <span className="text-[11px] text-muted">· VP Sales Ops</span>
                <span className="text-[10px] font-medium ml-auto px-1.5 py-0.5 rounded"
                  style={{ background: "var(--neg-soft)", color: "var(--neg)" }}>Departed</span>
              </div>
            </div>
          </div>
        </div>
      ),
      actions: [
        { id: "loop-exec",   label: "Loop in exec sponsor", Icon: Crown, primary: true },
        { id: "draft-email", label: "Draft re-engagement", Icon: Mail },
        { id: "open",        label: "Open account",        Icon: ArrowUpRight },
      ],
    };
  }

  if (item.id === "ca2" || (item.kind === "usage" && item.account === "GitLab")) {
    return {
      body: (
        <div className="space-y-4">
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 items-center">
            <MiniSparkline
              values={[74, 73, 72, 71, 69, 67, 64, 60, 58, 55, 52, 50, 48]}
              tone="var(--neg)"
              peakLabel="0.74 peak"
              dipLabel="0.48 today (-35%)"
            />
            <div className="space-y-1.5">
              <StatPill label="Peak" value="0.74" />
              <StatPill label="Today" value="0.48" tone="var(--neg)" soft="var(--neg-soft)" />
              <StatPill label="Δ 90d" value="-35%" tone="var(--neg)" soft="var(--neg-soft)" />
            </div>
          </div>

          <div>
            <SectionLabel>By team</SectionLabel>
            <div className="space-y-2.5 rounded-lg p-3"
              style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
              <MiniBar label="Platform Engineering" value={62} prev={85} tone="var(--warn)" sub="2 power users dormant" />
              <MiniBar label="Data Engineering"     value={48} prev={78} tone="var(--neg)"  sub="Whole team idle 14d" />
              <MiniBar label="Infrastructure"       value={18} prev={62} tone="var(--neg)"  sub="No logins 21d" />
            </div>
          </div>

          <div>
            <SectionLabel>Comparable accounts that recovered</SectionLabel>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--pos)" }} />
                <span className="text-[12px] font-semibold text-ink">Stripe</span>
                <span className="text-[11px] text-muted">· Q3 2024 · 4-week onboarding sprint</span>
                <span className="text-[10.5px] font-mono tnum text-muted-2 ml-auto">0.50 → 0.71</span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--pos)" }} />
                <span className="text-[12px] font-semibold text-ink">HashiCorp</span>
                <span className="text-[11px] text-muted">· Q1 2024 · exec re-engagement</span>
                <span className="text-[10.5px] font-mono tnum text-muted-2 ml-auto">0.47 → 0.68</span>
              </div>
            </div>
          </div>
        </div>
      ),
      actions: [
        { id: "value-snap",   label: "Build value snapshot",  Icon: BarChart3, primary: true },
        { id: "schedule-train", label: "Schedule training",   Icon: Calendar },
        { id: "open",         label: "Open account",          Icon: ArrowUpRight },
      ],
    };
  }

  if (item.id === "ca5" || (item.kind === "champion" && item.account === "Cloudflare")) {
    return {
      body: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg p-3"
              style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
              <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1.5">Before</div>
              <div className="text-[12.5px] font-semibold text-ink">Director of Engineering</div>
              <div className="text-[11px] text-muted mt-0.5">Owned: API Gateway only</div>
              <div className="text-[10.5px] font-mono text-muted-2 mt-2">Budget · ~$2.4M</div>
            </div>
            <div className="rounded-lg p-3 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(38,109,240,0.06) 0%, rgba(38,109,240,0.02) 100%)",
                border: "1px solid rgba(38,109,240,0.18)",
              }}>
              <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] mb-1.5"
                style={{ color: ACCENT }}>After</div>
              <div className="text-[12.5px] font-semibold text-ink">VP Engineering</div>
              <div className="text-[11px] text-muted mt-0.5">Owned: Networking + Security</div>
              <div className="text-[10.5px] font-mono mt-2" style={{ color: "var(--pos)" }}>
                Budget · ~$4.2M (+75%)
              </div>
            </div>
          </div>

          <div>
            <SectionLabel>Scope expansion</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 text-[10.5px] font-medium px-2 py-1 rounded-md"
                style={{ background: "var(--pos-soft)", color: "var(--pos)" }}>
                <TrendingUp size={10} strokeWidth={2.2} /> Now owns Networking
              </span>
              <span className="inline-flex items-center gap-1 text-[10.5px] font-medium px-2 py-1 rounded-md"
                style={{ background: "var(--pos-soft)", color: "var(--pos)" }}>
                <TrendingUp size={10} strokeWidth={2.2} /> Now owns Security
              </span>
              <span className="inline-flex items-center gap-1 text-[10.5px] font-medium px-2 py-1 rounded-md"
                style={{ background: "var(--accent-soft)", color: "var(--accent-deep)" }}>
                <Sparkles size={10} strokeWidth={2.2} /> Procurement simplification mandate
              </span>
            </div>
          </div>

          <div>
            <SectionLabel>Pattern · last 12 months</SectionLabel>
            <div className="rounded-lg p-3"
              style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
              <div className="text-[11.5px] text-ink-2 leading-relaxed">
                Promotions like this typically convert into expansion within{" "}
                <span className="font-semibold">38 days</span> when the AM gets a congrats note out in the first week. Median uplift:{" "}
                <span className="font-semibold" style={{ color: "var(--pos)" }}>+34% ARR</span>.
              </div>
            </div>
          </div>
        </div>
      ),
      actions: [
        { id: "draft-email", label: "Send congrats note",  Icon: Mail, primary: true },
        { id: "build-case",  label: "Build expansion case", Icon: Sparkles },
        { id: "open",        label: "Refresh org chart",    Icon: ArrowUpRight },
      ],
    };
  }

  if (item.id === "ca3" || (item.kind === "renewal" && item.account === "Akamai")) {
    return {
      body: (
        <div className="space-y-4">
          <div>
            <SectionLabel>QBR cadence · last 4 quarters</SectionLabel>
            <div className="rounded-lg p-3 space-y-2"
              style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
              {[
                { label: "Q1 '24", scheduled: true,  delivered: true,  date: "Mar 12" },
                { label: "Q2 '24", scheduled: true,  delivered: true,  date: "Jun 18" },
                { label: "Q3 '24", scheduled: true,  delivered: true,  date: "Sep 22" },
                { label: "Q4 '24", scheduled: true,  delivered: false, date: "Overdue 14d" },
              ].map((q) => (
                <div key={q.label} className="flex items-center gap-2.5">
                  <span className="text-[10.5px] font-mono tnum text-muted-2 w-12">{q.label}</span>
                  <span className="w-3 h-3 rounded-sm grid place-items-center"
                    style={{ background: q.delivered ? "var(--pos)" : "var(--neg-soft)" }}>
                    {q.delivered && <CheckCircle2 size={9} strokeWidth={2.4} className="text-white" />}
                  </span>
                  <span className={`text-[11.5px] flex-1 ${q.delivered ? "text-ink-2" : "font-semibold text-ink"}`}>
                    {q.delivered ? "Delivered" : "Not yet delivered"}
                  </span>
                  <span className="text-[10.5px] font-mono tnum"
                    style={{ color: q.delivered ? "var(--muted)" : "var(--neg)" }}>
                    {q.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>Last QBR · Sep 22 · attendees</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              <StatPill label="Champion" value="Priya (new)" tone="var(--warn)" soft="var(--warn-soft)" />
              <StatPill label="Economic" value="Mira Cohen" />
              <StatPill label="Technical" value="Dev Kapoor" />
              <StatPill label="Outcome" value="3 open action items" tone="var(--info)" soft="var(--info-soft)" />
            </div>
          </div>

          <div>
            <SectionLabel>Open action items from last QBR</SectionLabel>
            <div className="space-y-1.5">
              {[
                "Roll out RevOps playbook to 3 new pods",
                "Enable SSO with Okta integration",
                "Q4 expansion case for ML governance",
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                  style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                  <span className="w-3.5 h-3.5 rounded-full grid place-items-center"
                    style={{ border: "1px solid var(--warn)", background: "var(--warn-soft)" }}>
                    <Clock size={8} strokeWidth={2.4} style={{ color: "var(--warn)" }} />
                  </span>
                  <span className="text-[11.5px] text-ink-2 flex-1">{t}</span>
                  <span className="text-[10px] text-muted-2 font-mono">Open</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
      actions: [
        { id: "schedule-qbr", label: "Schedule QBR this week", Icon: Calendar, primary: true },
        { id: "draft-email",  label: "Draft prep email",       Icon: Mail },
        { id: "open",         label: "Open account",           Icon: ArrowUpRight },
      ],
    };
  }

  if (item.id === "ca4" || (item.kind === "note" && item.account === "Tableau")) {
    return {
      body: (
        <div className="space-y-4">
          <div>
            <SectionLabel>Open tickets · last 7 days</SectionLabel>
            <div className="space-y-1.5">
              {[
                { id: "TBL-318", title: "Dashboard refresh fails on >1M rows", sev: "Sev-2", age: "5d", sla: "breach risk" },
                { id: "TBL-329", title: "ML governance plugin auth loop",      sev: "Sev-2", age: "3d", sla: "breach risk" },
                { id: "TBL-341", title: "Tableau Cloud SSO redirect bug",      sev: "Sev-2", age: "1d", sla: "on track" },
              ].map((t) => (
                <div key={t.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                  style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                  <span className="text-[10px] font-mono tnum text-muted-2 w-14">{t.id}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.06em] px-1.5 py-0.5 rounded shrink-0"
                    style={{ background: "var(--neg-soft)", color: "var(--neg)" }}>
                    {t.sev}
                  </span>
                  <span className="text-[11.5px] text-ink-2 flex-1 truncate">{t.title}</span>
                  <span className="text-[10.5px] font-mono tnum text-muted">{t.age}</span>
                  <span className="text-[9.5px] font-semibold uppercase tracking-[0.06em] px-1.5 py-0.5 rounded"
                    style={{
                      background: t.sla === "breach risk" ? "var(--neg-soft)" : "var(--pos-soft)",
                      color: t.sla === "breach risk" ? "var(--neg)" : "var(--pos)",
                    }}>
                    {t.sla}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>Common theme</SectionLabel>
            <div className="rounded-lg p-3"
              style={{ background: "var(--bg-deep)", border: "1px solid var(--line)" }}>
              <div className="flex items-start gap-2">
                <Layers size={12} strokeWidth={1.8} className="text-muted shrink-0 mt-0.5" />
                <p className="text-[11.5px] text-ink-2 leading-relaxed">
                  All three tickets cluster around the v3.4 ML governance release. Engineering opened internal incident{" "}
                  <span className="font-mono">INC-1041</span> yesterday. Worth flagging that to Owen so he doesn't hear it from his team first.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      actions: [
        { id: "escalate",    label: "Escalate to engineering", Icon: AlertTriangle, primary: true },
        { id: "draft-email", label: "Draft customer update",   Icon: Mail },
        { id: "open",        label: "Open account",            Icon: ArrowUpRight },
      ],
    };
  }

  // Generic fallback by kind
  if (item.kind === "departure") {
    return {
      body: (
        <p className="text-[12px] text-ink-2 leading-relaxed">
          {item.text}. Reach out to the next-best sponsor at this account before the renewal moves.
        </p>
      ),
      actions: [
        { id: "draft-email", label: "Draft outreach", Icon: Mail, primary: true },
        { id: "open",        label: "Open account",   Icon: ArrowUpRight },
      ],
    };
  }
  if (item.kind === "champion") {
    return {
      body: (
        <p className="text-[12px] text-ink-2 leading-relaxed">
          {item.text}. Send a congrats note within 7 days — promotions are the highest-conversion expansion windows.
        </p>
      ),
      actions: [
        { id: "draft-email", label: "Send congrats", Icon: Mail, primary: true },
        { id: "build-case",  label: "Build case",    Icon: Sparkles },
        { id: "open",        label: "Open account",  Icon: ArrowUpRight },
      ],
    };
  }
  if (item.kind === "usage") {
    return {
      body: (
        <p className="text-[12px] text-ink-2 leading-relaxed">
          {item.text}. Worth a value-snapshot reach-out to the champion this week.
        </p>
      ),
      actions: [
        { id: "value-snap",  label: "Build value snapshot", Icon: BarChart3, primary: true },
        { id: "draft-email", label: "Draft outreach",       Icon: Mail },
        { id: "open",        label: "Open account",         Icon: ArrowUpRight },
      ],
    };
  }
  if (item.kind === "renewal") {
    return {
      body: (
        <p className="text-[12px] text-ink-2 leading-relaxed">
          {item.text}. Get the next QBR on the books to recover the cadence.
        </p>
      ),
      actions: [
        { id: "schedule-qbr", label: "Schedule QBR", Icon: Calendar, primary: true },
        { id: "draft-email",  label: "Draft prep",   Icon: Mail },
        { id: "open",         label: "Open account", Icon: ArrowUpRight },
      ],
    };
  }
  return {
    body: <p className="text-[12px] text-ink-2 leading-relaxed">{item.text}</p>,
    actions: [
      { id: "open", label: "Open account", Icon: ArrowUpRight, primary: true },
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────
// SignalDetail — the inline expanded body shown beneath an activity row.
// ─────────────────────────────────────────────────────────────────────

export function SignalDetail({
  item, onAction,
}: {
  item: SignalDetailItem;
  onAction: ActionHandler;
}) {
  const fixture = useMemo(() => getFixture(item), [item]);

  return (
    <div className="px-3 pb-4 pt-1 animate-detail-fade">
      <div className="rounded-xl ml-11"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
        <div className="px-4 pt-4 pb-3">
          {fixture.body}
        </div>
        <div className="px-4 py-3 flex items-center gap-2 flex-wrap"
          style={{ borderTop: "1px solid var(--line)", background: "var(--bg-deep)" }}>
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 mr-1">
            Recommended
          </span>
          {fixture.actions.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={(e) => { e.stopPropagation(); onAction(a.id, item.account); }}
              className={`inline-flex items-center gap-1.5 text-[11.5px] font-medium px-3 py-1.5 rounded-lg transition-all ${
                a.primary
                  ? "text-white hover:scale-[1.02]"
                  : "hover:bg-bg-deep"
              }`}
              style={
                a.primary
                  ? { background: "var(--ink)" }
                  : { background: "var(--surface)", color: "var(--ink-2)", border: "1px solid var(--line)" }
              }
            >
              <a.Icon size={11} strokeWidth={2.2} />
              {a.label}
            </button>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes detailFade {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-detail-fade { animation: detailFade 320ms cubic-bezier(0.22, 1, 0.36, 1); }
      `}</style>
    </div>
  );
}
