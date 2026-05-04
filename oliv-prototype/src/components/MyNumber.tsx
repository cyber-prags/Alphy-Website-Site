"use client";

import {
  Shield, Activity, Mail, Calendar, Check, Sparkles, BarChart3,
  Users, Heart, FileBarChart2, MessageSquareText, ArrowUp, ArrowDown, Minus, Headphones, Rocket,
} from "lucide-react";
import { myNumber, fmtMoney, type Persona } from "@/lib/mock";

export function MyNumber({ persona }: { persona: Persona }) {
  if (persona === "ae")      return <AEScoreboard />;
  if (persona === "am")      return <AMScoreboard />;
  if (persona === "csm")     return <CSMScoreboard />;
  return <ManagerScoreboard />;
}

// ---------------------------------------------------------------------
// AE: this-week activity (quota now lives in the top-right QuotaWidget)
// ---------------------------------------------------------------------
function AEScoreboard() {
  const a = myNumber.ae;
  const lw = a.lastWeek;
  return (
    <ActivityBar
      eyebrow="this week · activity"
      summary={
        <>
          Pipeline coverage <strong>{(a.pipeline / a.quota).toFixed(2)}x</strong>
          <span className="mx-1.5 text-muted-2">·</span>
          <strong style={{ color: "var(--pos)" }}>+{a.deltaPct}%</strong> pace vs last Q
        </>
      }
      stats={[
        { Icon: Calendar, label: "Meetings",        value: a.thisWeek.meetings,        prev: lw.meetings,        accent: "var(--info)"        },
        { Icon: Mail,     label: "Emails sent",     value: a.thisWeek.emailsSent,      prev: lw.emailsSent,      accent: "var(--accent-deep)" },
        { Icon: Activity, label: "Calls connected", value: a.thisWeek.callsConnected,  prev: lw.callsConnected,  accent: "var(--info)"        },
        { Icon: Check,    label: "Deals advanced",  value: a.thisWeek.dealsAdvanced,   prev: lw.dealsAdvanced,   accent: "var(--pos)"         },
      ]}
    />
  );
}

// ---------------------------------------------------------------------
// AM: expansion-primary scoreboard
// ---------------------------------------------------------------------
function AMScoreboard() {
  const e = myNumber.am.expansion;
  const w = myNumber.am.thisWeek;
  const lw = myNumber.am.lastWeek;
  const motionPct = Math.round((e.inMotion / e.target) * 100);
  return (
    <ActivityBar
      eyebrow="this week · expansion motion"
      summary={
        <>
          <strong>{fmtMoney(e.inMotion)}</strong> in motion of <strong>{fmtMoney(e.target)}</strong>
          <span className="mx-1.5 text-muted-2">·</span>
          <strong style={{ color: "var(--accent-deep)" }}>{motionPct}%</strong> of expansion target
        </>
      }
      stats={[
        { Icon: Rocket,     label: "Plays opened",      value: w.expansionPlaysOpened, prev: lw.expansionPlaysOpened, accent: "var(--accent-deep)" },
        { Icon: FileBarChart2, label: "Cases built",    value: w.casesBuilt,           prev: lw.casesBuilt,           accent: "var(--info)"        },
        { Icon: Users,      label: "Champions advocated", value: w.championsAdvocated, prev: lw.championsAdvocated,   accent: "var(--pos)"         },
        { Icon: Check,      label: "Deals advanced",    value: w.dealsAdvanced,        prev: lw.dealsAdvanced,        accent: "var(--ink)"         },
      ]}
    />
  );
}

// ---------------------------------------------------------------------
// CSM: portfolio health — replaces the misleading "this week · customer
// health" bar. The earlier version showed CSM activity (QBRs delivered,
// tickets resolved, etc.) under a "customer health" eyebrow; those are
// productivity metrics, not health metrics. This bar leads with the
// snapshot of the customer book and tucks activity into a smaller row.
// ---------------------------------------------------------------------
function CSMScoreboard() {
  const r = myNumber.csm.retention;
  const h = myNumber.csm.health;
  const w = myNumber.csm.thisWeek;
  const lw = myNumber.csm.lastWeek;
  const totalAccounts = h.healthy + h.watch + h.atRisk;
  const securedPct = Math.round((r.secured / r.target) * 100);
  const nrr = 112; // derived NRR — keeps mock self-consistent with $2.38M book
  const wauMauAvg = 0.62;
  const healthDelta = +3;

  return (
    <section className="card p-4 mb-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <Heart size={11} strokeWidth={1.8} style={{ color: "var(--pos)" }} />
          <div className="mono-label" style={{ color: "var(--pos)" }}>portfolio health</div>
        </div>
        <div className="text-[11px] text-muted [&_strong]:tnum [&_strong]:text-ink [&_strong]:font-semibold">
          <strong>{fmtMoney(r.target)}</strong> total ARR
          <span className="mx-1.5 text-muted-2">·</span>
          <strong>{totalAccounts}</strong> customers
          <span className="mx-1.5 text-muted-2">·</span>
          NRR <strong style={{ color: nrr >= 100 ? "var(--pos)" : "var(--neg)" }}>{nrr}%</strong>
        </div>
      </div>

      {/* Top row — three big tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {/* Average health */}
        <div className="rounded-xl border border-line p-3.5" style={{ background: "var(--surface)" }}>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.06em] text-muted">Avg health</span>
            <span className="ml-auto text-[10px] font-mono font-semibold tnum inline-flex items-center gap-0.5"
              style={{ color: "var(--pos)" }}>
              <ArrowUp size={9} strokeWidth={2.5} />+{healthDelta} vs 4w
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[34px] font-bold text-ink tnum leading-none" style={{ color: healthToneFor(h.avg) }}>
              {h.avg}
            </span>
            <span className="text-[12px] text-muted-2">/ 100</span>
          </div>
          <div className="mt-3 h-1.5 rounded-full overflow-hidden flex" style={{ background: "var(--bg-deep)" }}>
            <div style={{ width: `${(h.healthy / totalAccounts) * 100}%`, background: "var(--pos)" }} />
            <div style={{ width: `${(h.watch   / totalAccounts) * 100}%`, background: "var(--warn)" }} />
            <div style={{ width: `${(h.atRisk  / totalAccounts) * 100}%`, background: "var(--neg)" }} />
          </div>
          <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-muted">
            <span><span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ background: "var(--pos)"  }} />{h.healthy} healthy</span>
            <span><span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ background: "var(--warn)" }} />{h.watch} watch</span>
            <span><span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ background: "var(--neg)"  }} />{h.atRisk} at-risk</span>
          </div>
        </div>

        {/* Renewal book */}
        <div className="rounded-xl border border-line p-3.5" style={{ background: "var(--surface)" }}>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.06em] text-muted">Renewal book</span>
            <span className="ml-auto text-[10px] font-mono font-semibold tnum text-muted">{securedPct}% secured</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] font-bold text-ink tnum leading-none">{fmtMoney(r.secured)}</span>
            <span className="text-[11px] text-muted-2">of {fmtMoney(r.target)}</span>
          </div>
          <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-deep)" }}>
            <div style={{ width: `${securedPct}%`, background: "var(--pos)", height: "100%" }} />
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-muted">
            <span style={{ color: "var(--pos)" }}>● {fmtMoney(r.secured)} secured</span>
            <span style={{ color: "var(--neg)" }}>● {fmtMoney(r.atRisk)} at-risk</span>
          </div>
        </div>

        {/* Engagement */}
        <div className="rounded-xl border border-line p-3.5" style={{ background: "var(--surface)" }}>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.06em] text-muted">WAU / MAU</span>
            <span className="ml-auto text-[10px] font-mono font-semibold tnum inline-flex items-center gap-0.5"
              style={{ color: "var(--pos)" }}>
              <ArrowUp size={9} strokeWidth={2.5} />+4% vs 4w
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[34px] font-bold text-ink tnum leading-none">{wauMauAvg.toFixed(2)}</span>
            <span className="text-[12px] text-muted-2">portfolio avg</span>
          </div>
          <div className="mt-3 flex items-end gap-0.5 h-6">
            {[0.55, 0.58, 0.60, 0.59, 0.61, 0.63, 0.62, 0.62].map((v, i) => (
              <div key={i} className="flex-1 rounded-sm"
                style={{ height: `${v * 100}%`, background: i === 7 ? "var(--accent-deep)" : "var(--bg-deep)" }} />
            ))}
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-muted">
            <span>8w trend</span>
            <span>{Math.round(wauMauAvg * 100)}% engagement</span>
          </div>
        </div>
      </div>

    </section>
  );
}

function healthToneFor(score: number) {
  if (score >= 80) return "var(--pos)";
  if (score >= 60) return "var(--ink)";
  if (score >= 40) return "var(--warn)";
  return "var(--neg)";
}

// ---------------------------------------------------------------------
// Manager: team rollup
// ---------------------------------------------------------------------
function ManagerScoreboard() {
  const m = myNumber.manager;
  const commitPct = Math.round((m.teamCommit / m.teamQuota) * 100);
  return (
    <ActivityBar
      eyebrow="this week · team motion"
      summary={
        <>
          <strong>{fmtMoney(m.teamCommit)}</strong> commit ({commitPct}%)
          <span className="mx-1.5 text-muted-2">·</span>
          AI forecast <strong>{fmtMoney(m.teamForecast)}</strong>
          <span className="mx-1.5 text-muted-2">·</span>
          Coverage <strong>{m.coverage}x</strong>
        </>
      }
      stats={[
        { Icon: Activity,         label: "Deals reviewed",   value: m.thisWeek.dealsReviewed,        prev: m.lastWeek.dealsReviewed,        accent: "var(--info)"        },
        { Icon: Sparkles,         label: "Coaching flags",   value: m.thisWeek.coachingFlags,        prev: m.lastWeek.coachingFlags,        accent: "var(--accent-deep)" },
        { Icon: BarChart3,        label: "Forecasts in",     value: m.thisWeek.forecastSubmissions,  prev: m.lastWeek.forecastSubmissions,  accent: "var(--pos)"         },
        { Icon: MessageSquareText,label: "1-on-1s",          value: m.thisWeek.oneOnOnes,            prev: m.lastWeek.oneOnOnes,            accent: "var(--ink)"         },
      ]}
    />
  );
}

// ---------------------------------------------------------------------
// Shared activity bar — used by every persona
// ---------------------------------------------------------------------
type ActivityStat = {
  Icon: typeof Mail;
  label: string;
  value: number;
  prev: number;
  accent: string;
};

function ActivityBar({
  eyebrow, summary, stats,
}: {
  eyebrow: string;
  summary: React.ReactNode;
  stats: ActivityStat[];
}) {
  return (
    <section className="card p-4 mb-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <Header eyebrow={eyebrow} tone="var(--info)" Icon={Activity} />
        <div className="text-[11px] text-muted [&_strong]:tnum [&_strong]:text-ink [&_strong]:font-semibold">
          {summary}
        </div>
      </div>
      <div className={`grid gap-x-4 gap-y-3 ${stats.length === 5 ? "grid-cols-2 md:grid-cols-5" : "grid-cols-2 md:grid-cols-4"}`}>
        {stats.map((s) => <ActivityStat key={s.label} {...s} />)}
      </div>
    </section>
  );
}

function ActivityStat({ Icon, label, value, prev, accent }: ActivityStat) {
  const delta = value - prev;
  const trendPct = prev === 0 ? (value > 0 ? 100 : 0) : Math.round((delta / prev) * 100);
  const direction = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  const TrendIcon = direction === "up" ? ArrowUp : direction === "down" ? ArrowDown : Minus;
  const trendColor = direction === "up" ? "var(--pos)" : direction === "down" ? "var(--neg)" : "var(--muted)";

  // Inline sparkline — derive 7 stops from prev → value
  const points = sparkline(prev, value);

  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg grid place-items-center shrink-0" style={{ background: "var(--bg-deep)" }}>
        <Icon size={14} strokeWidth={1.7} style={{ color: accent }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[18px] font-bold text-ink tnum leading-none">{value}</span>
          <span
            className="inline-flex items-center gap-0.5 text-[10px] font-mono font-semibold tnum"
            style={{ color: trendColor }}
          >
            <TrendIcon size={9} strokeWidth={2.5} />
            {direction === "flat" ? "—" : `${trendPct >= 0 ? "+" : ""}${trendPct}%`}
          </span>
        </div>
        <div className="text-[10.5px] text-muted truncate leading-tight mt-0.5">{label}</div>
      </div>
      <svg width={36} height={18} className="shrink-0" aria-hidden>
        <polyline
          points={points}
          fill="none"
          stroke={accent}
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.7}
        />
      </svg>
    </div>
  );
}

// Deterministic 7-point spark line bridging prev → value.
function sparkline(prev: number, value: number): string {
  const w = 36, h = 18, n = 7;
  const arr: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    // Ease + tiny zigzag for visual interest
    const base = prev + (value - prev) * t;
    const wobble = ((i * 13) % 5 - 2) * 0.08 * Math.max(1, prev);
    arr.push(base + wobble);
  }
  const min = Math.min(...arr), max = Math.max(...arr);
  const range = max - min || 1;
  return arr.map((v, i) => {
    const x = (i / (n - 1)) * (w - 2) + 1;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

// ---------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------
function Header({ eyebrow, tone, Icon }: { eyebrow: string; tone: string; Icon: typeof Mail }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={11} strokeWidth={1.8} style={{ color: tone }} />
      <div className="mono-label" style={{ color: tone }}>{eyebrow}</div>
    </div>
  );
}

