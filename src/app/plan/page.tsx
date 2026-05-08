"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  LayoutGrid, LineChart, TrendingUp, UserCog, Target, FileBarChart2,
  Mail, RefreshCw, Briefcase, ArrowUpRight, Telescope, Radio,
  TrendingDown, Smile, Frown, Calendar, Users, AlertTriangle,
  ShieldCheck, Eye, Sparkles, ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { usePersona, PERSONA_LABEL } from "@/components/PersonaContext";
import { useUser } from "@/components/UserContext";
import { Logo } from "@/components/Logo";
import {
  accounts, csmWorkloads, expansionOpportunities, outcomes, myNumber, fmtMoney,
  EXPANSION_STAGES,
  type Persona,
} from "@/lib/mock";

const ACCENT = "#266DF0";

// ─────────────────────────────────────────────────────────────────────
// PLAN HUB — bento dashboard.
// Each tile is a mini-dashboard preview, not a generic nav card.
// Click anywhere to drill in.
// ─────────────────────────────────────────────────────────────────────

type Size = "sm" | "lg";
type TileId =
  | "renewal-runway" | "health-dist" | "nps" | "outcomes"
  | "portfolio" | "signals" | "campaigns" | "forecast"
  | "revenue" | "capacity" | "deals";

const LAYOUT: Record<Persona, { id: TileId; size: Size }[]> = {
  csm: [
    { id: "renewal-runway", size: "lg" },
    { id: "health-dist",    size: "sm" },
    { id: "nps",            size: "sm" },
    { id: "outcomes",       size: "sm" },
    { id: "portfolio",      size: "lg" },
    { id: "signals",        size: "sm" },
    { id: "campaigns",      size: "sm" },
  ],
  am: [
    { id: "portfolio",      size: "lg" },
    { id: "forecast",       size: "sm" },
    { id: "renewal-runway", size: "lg" },
    { id: "outcomes",       size: "sm" },
    { id: "signals",        size: "sm" },
    { id: "deals",          size: "sm" },
  ],
  manager: [
    { id: "revenue",        size: "lg" },
    { id: "capacity",       size: "sm" },
    { id: "forecast",       size: "sm" },
    { id: "portfolio",      size: "lg" },
    { id: "renewal-runway", size: "sm" },
    { id: "outcomes",       size: "sm" },
    { id: "nps",            size: "sm" },
    { id: "signals",        size: "sm" },
  ],
  ae: [
    { id: "forecast",       size: "lg" },
    { id: "deals",          size: "sm" },
    { id: "portfolio",      size: "lg" },
    { id: "signals",        size: "sm" },
  ],
};

export default function PlanPage() {
  const { persona } = usePersona();
  const { user } = useUser();
  const layout = LAYOUT[persona] ?? LAYOUT.am;

  return (
    <AppShell>
      <header className="mb-7">
        <div className="flex items-baseline justify-between flex-wrap gap-3 mb-1.5">
          <h1 className="text-[24px] font-semibold text-ink"
            style={{ letterSpacing: "-0.022em" }}>
            Plan
          </h1>
          <span className="text-[11px] text-muted-2 font-mono">
            Updated {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </span>
        </div>
        <p className="text-[13px] text-muted leading-relaxed max-w-2xl">
          Your weekly view. Tailored for{" "}
          <span className="font-semibold text-ink-2">{PERSONA_LABEL[persona]}</span>.
          Click any tile to drill in.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-[minmax(220px,auto)]">
        {layout.map(({ id, size }) => (
          <div key={id} className={size === "lg" ? "lg:col-span-2" : ""}>
            <Tile id={id} />
          </div>
        ))}
      </div>
    </AppShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Tile dispatch
// ─────────────────────────────────────────────────────────────────────
function Tile({ id }: { id: TileId }) {
  switch (id) {
    case "renewal-runway": return <RenewalRunwayTile />;
    case "health-dist":    return <HealthDistTile />;
    case "nps":            return <NPSTile />;
    case "outcomes":       return <OutcomesTile />;
    case "portfolio":      return <PortfolioTile />;
    case "signals":        return <SignalsTile />;
    case "campaigns":      return <CampaignsTile />;
    case "forecast":       return <ForecastTile />;
    case "revenue":        return <RevenueTile />;
    case "capacity":       return <CapacityTile />;
    case "deals":          return <DealsTile />;
  }
}

// ─────────────────────────────────────────────────────────────────────
// Shell — every tile uses the same wrapper for consistency.
// ─────────────────────────────────────────────────────────────────────
function TileShell({
  href, eyebrow, title, headerRight, footer, accent, children,
}: {
  href: string;
  eyebrow: string;
  title: string;
  headerRight?: React.ReactNode;
  footer?: React.ReactNode;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative block h-full rounded-xl overflow-hidden transition-all hover:shadow-sm hover:-translate-y-px"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
    >
      {/* Top hairline accent on hover */}
      {accent && (
        <span className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: accent }} />
      )}
      <div className="p-5 h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1">
              {eyebrow}
            </div>
            <div className="text-[14.5px] font-semibold text-ink leading-tight"
              style={{ letterSpacing: "-0.012em" }}>
              {title}
            </div>
          </div>
          {headerRight}
          <ArrowUpRight
            size={13}
            strokeWidth={1.8}
            className="text-muted-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2"
          />
        </div>
        <div className="flex-1 min-h-0">
          {children}
        </div>
        {footer && (
          <div className="mt-3 pt-3 border-t border-line text-[11px] text-muted">
            {footer}
          </div>
        )}
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Renewal runway — sparkline of renewals over time + top 3 upcoming.
// ─────────────────────────────────────────────────────────────────────
function RenewalRunwayTile() {
  const customers = useMemo(() => accounts.filter((a) => a.status === "Customer"), []);
  const renewals = useMemo(
    () => customers
      .filter((a) => a.renewalDays > 0 && a.renewalDays <= 90)
      .sort((a, b) => a.renewalDays - b.renewalDays)
      .slice(0, 3),
    [customers]
  );
  const totalArr = renewals.reduce((s, a) => s + a.arr, 0);
  const buckets = [3, 6, 4, 8, 5, 7]; // Renewals per 30-day bucket; mock
  const max = Math.max(...buckets);

  return (
    <TileShell
      href="/renewals"
      eyebrow="Renewal runway"
      title="Next 90 days"
      headerRight={
        <span className="text-[11px] font-mono tnum text-ink-2 font-semibold">
          {fmtMoney(totalArr)}
        </span>
      }
      footer={`${renewals.length} renewals at risk · ${customers.filter((a) => a.renewalDays > 0 && a.renewalDays <= 365).length} total in next year`}
    >
      <div className="grid grid-cols-5 gap-4 h-full">
        {/* Bar chart with month labels + value tooltips on hover */}
        <div className="col-span-3 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-mono text-muted-2">Next 6 months</div>
            <div className="text-[9.5px] font-mono text-muted-2">renewals / mo</div>
          </div>
          <div className="flex items-end gap-1.5 h-[88px] relative">
            {/* Today line */}
            <div className="absolute left-0 top-0 bottom-0 w-px"
              style={{ background: ACCENT, opacity: 0.4 }}>
              <span className="absolute -top-2.5 -left-3 text-[8px] font-mono uppercase tracking-[0.12em]"
                style={{ color: ACCENT }}>Today</span>
            </div>
            {buckets.map((v, i) => {
              const isHot = i < 2;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 group/bar relative">
                  <span className="text-[9px] font-mono tnum opacity-0 group-hover/bar:opacity-100 transition-opacity"
                    style={{ color: isHot ? ACCENT : "var(--muted)" }}>{v}</span>
                  <div className="w-full rounded-t-md relative cursor-pointer transition-all"
                    style={{
                      height: `${(v / max) * 80}px`,
                      background: isHot ? ACCENT : "var(--bg-deep)",
                      border: isHot ? `1px solid ${ACCENT}` : "1px solid var(--line)",
                    }}
                    title={`${["May","Jun","Jul","Aug","Sep","Oct"][i]}: ${v} renewals`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex gap-1.5 text-[9px] font-mono text-muted-2 mt-1.5">
            {["May","Jun","Jul","Aug","Sep","Oct"].map((m, i) => (
              <span key={m} className="flex-1 text-center"
                style={{ color: i < 2 ? ACCENT : undefined, fontWeight: i < 2 ? 600 : 400 }}>
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Top renewals — denser, with day-bar */}
        <div className="col-span-2 space-y-1.5">
          <div className="text-[10px] font-mono text-muted-2 mb-2">Soonest</div>
          {renewals.map((a) => {
            const tone =
              a.renewalDays <= 30 ? "var(--neg)" :
              a.renewalDays <= 60 ? "var(--warn)" : "var(--info)";
            const pct = Math.max(8, Math.min(100, (a.renewalDays / 90) * 100));
            return (
              <div key={a.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md relative overflow-hidden"
                style={{ background: "var(--bg-deep)" }}>
                {/* day-progress bar (the closer the renewal, the shorter the fill) */}
                <span className="absolute left-0 bottom-0 h-[2px] rounded-full"
                  style={{ width: `${pct}%`, background: tone, opacity: 0.5 }} />
                <Logo name={a.name} size={16} rounded={3} />
                <div className="flex-1 min-w-0">
                  <div className="text-[11.5px] font-semibold text-ink truncate">
                    {a.name.replace(/(, Inc\.?| Inc\.?| Software| Technologies)$/i, "")}
                  </div>
                </div>
                <span className="text-[10px] font-mono tnum shrink-0" style={{ color: tone }}>
                  {a.renewalDays}d
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </TileShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Health distribution — donut + legend.
// ─────────────────────────────────────────────────────────────────────
function HealthDistTile() {
  const customers = useMemo(() => accounts.filter((a) => a.status === "Customer"), []);
  const healthy = customers.filter((a) => a.healthScore >= 75).length;
  const watch = customers.filter((a) => a.healthScore >= 60 && a.healthScore < 75).length;
  const atRisk = customers.filter((a) => a.healthScore < 60).length;
  const total = healthy + watch + atRisk;
  const pHealthy = (healthy / total) * 100;
  const pWatch = (watch / total) * 100;
  const pAtRisk = (atRisk / total) * 100;

  // Donut sizing — circumference 2πr where r = 32
  const r = 32;
  const c = 2 * Math.PI * r;
  const dHealthy = (pHealthy / 100) * c;
  const dWatch = (pWatch / 100) * c;
  const dAtRisk = (pAtRisk / 100) * c;

  return (
    <TileShell
      href="/portfolio"
      eyebrow="Health"
      title="Distribution"
      footer={`${total} customers · sorted by health score`}
    >
      <div className="flex items-center gap-4 h-full">
        <svg viewBox="0 0 80 80" className="w-[88px] h-[88px] shrink-0 -rotate-90">
          <circle cx="40" cy="40" r={r} fill="none" stroke="var(--bg-deep)" strokeWidth="10" />
          <circle cx="40" cy="40" r={r} fill="none" stroke="var(--pos)" strokeWidth="10"
            strokeDasharray={`${dHealthy} ${c}`}
            strokeDashoffset="0" />
          <circle cx="40" cy="40" r={r} fill="none" stroke="var(--warn)" strokeWidth="10"
            strokeDasharray={`${dWatch} ${c}`}
            strokeDashoffset={`-${dHealthy}`} />
          <circle cx="40" cy="40" r={r} fill="none" stroke="var(--neg)" strokeWidth="10"
            strokeDasharray={`${dAtRisk} ${c}`}
            strokeDashoffset={`-${dHealthy + dWatch}`} />
        </svg>
        <div className="flex-1 space-y-1.5 min-w-0">
          <LegendRow tone="var(--pos)" label="Healthy" count={healthy} />
          <LegendRow tone="var(--warn)" label="Watch" count={watch} />
          <LegendRow tone="var(--neg)" label="At risk" count={atRisk} />
        </div>
      </div>
    </TileShell>
  );
}

function LegendRow({ tone, label, count }: { tone: string; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: tone }} />
      <span className="text-[11.5px] text-ink-2 flex-1">{label}</span>
      <span className="text-[12px] font-semibold tnum tabular-nums" style={{ color: tone }}>
        {count}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// NPS — big number + sparkline + split.
// ─────────────────────────────────────────────────────────────────────
function NPSTile() {
  const score = 42;
  const prev = 38;
  const trend = [28, 32, 35, 38, 36, 40, 42];
  const promoters = 64;
  const passives = 24;
  const detractors = 12;
  const max = Math.max(...trend);
  const min = Math.min(...trend);
  const w = 120, h = 36;
  const points = trend.map((v, i) => `${(i / (trend.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * h}`).join(" ");

  return (
    <TileShell
      href="/surveys"
      eyebrow="NPS"
      title="Q2 score"
      footer={`${promoters}% promoters · ${detractors}% detractors`}
    >
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="text-[36px] font-bold tnum leading-none" style={{ color: "var(--pos)", letterSpacing: "-0.025em" }}>
            +{score}
          </div>
          <div className="text-[10.5px] text-muted mt-1.5 inline-flex items-center gap-1">
            <TrendingUp size={10} strokeWidth={2.4} style={{ color: "var(--pos)" }} />
            <span style={{ color: "var(--pos)" }}>+{score - prev}</span>
            <span className="text-muted-2">vs last quarter</span>
          </div>
        </div>
        <svg width={w} height={h} className="shrink-0">
          <defs>
            <linearGradient id="npsfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--pos)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--pos)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline fill="url(#npsfill)" stroke="none" points={`0,${h} ${points} ${w},${h}`} />
          <polyline fill="none" stroke="var(--pos)" strokeWidth={1.5} strokeLinejoin="round" points={points} />
        </svg>
      </div>
      {/* Promoter / passive / detractor split */}
      <div className="flex items-center h-2 rounded-full overflow-hidden"
        style={{ background: "var(--bg-deep)" }}>
        <div style={{ width: `${promoters}%`, background: "var(--pos)" }} />
        <div style={{ width: `${passives}%`, background: "var(--bg-deep)" }} />
        <div style={{ width: `${detractors}%`, background: "var(--neg)" }} />
      </div>
    </TileShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Outcomes — top 3 with progress bars.
// ─────────────────────────────────────────────────────────────────────
function OutcomesTile() {
  // Pull 3 most varied outcomes from the actual data
  const top = useMemo(() => {
    const byProgress = [...outcomes].sort((a, b) => b.progress - a.progress);
    // Pick one ahead-ish, one mid, one behind for visual variety
    const ahead = byProgress.find((o) => o.progress >= 70) ?? outcomes[0];
    const mid = byProgress.find((o) => o.progress >= 40 && o.progress < 70) ?? outcomes[1];
    const behind = byProgress.reverse().find((o) => o.progress < 40) ?? outcomes[2];
    return [ahead, mid, behind].filter(Boolean).slice(0, 3);
  }, []);
  const atRisk = outcomes.filter((o) => o.status === "at-risk").length;
  return (
    <TileShell
      href="/outcomes"
      eyebrow="Outcomes"
      title="Top success criteria"
      footer={`${outcomes.length} active across book · ${atRisk} at risk`}
    >
      <div className="space-y-3 h-full justify-center flex flex-col">
        {top.map((o) => {
          const tone =
            o.status === "ahead" || o.status === "on-track" ? "var(--pos)" :
            o.status === "watch" ? "var(--warn)" : "var(--neg)";
          return (
            <div key={o.id}>
              <div className="flex items-baseline justify-between mb-1 gap-2">
                <span className="text-[11.5px] text-ink-2 truncate pr-2">
                  <span className="font-semibold">{o.account}</span>
                  <span className="text-muted"> · {o.title.length > 40 ? o.title.slice(0, 40) + "…" : o.title}</span>
                </span>
                <span className="text-[10.5px] font-mono tnum shrink-0" style={{ color: tone }}>
                  {o.progress}%
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-deep)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${o.progress}%`, background: tone }} />
              </div>
            </div>
          );
        })}
      </div>
    </TileShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Portfolio quadrant — mini scatter.
// ─────────────────────────────────────────────────────────────────────
function PortfolioTile() {
  const customers = useMemo(() => accounts.filter((a) => a.status === "Customer").slice(0, 14), []);
  // Plot (health, expansion-potential) — derive expansion potential from watchlist + nrr
  const dots = customers.map((a) => {
    const x = a.healthScore / 100; // 0..1 health
    const exp = a.watchlist === "Upsell Likely" ? 0.85
              : a.nrr >= 110 ? 0.65
              : a.watchlist === "Renewal Likely" ? 0.45
              : 0.25;
    return { x, y: exp, name: a.name, arr: a.arr };
  });

  return (
    <TileShell
      href="/portfolio"
      eyebrow="Portfolio"
      title="Health × Expansion"
      footer="Click to plan plays per quadrant"
    >
      {/* Use percent-positioned logos so the plot is real and crisp */}
      <div className="relative w-full h-full" style={{ minHeight: 130 }}>
        {/* Quadrant grid */}
        <span className="absolute top-0 bottom-0 left-1/2 w-px"
          style={{ background: "var(--line)", borderLeft: "1px dashed var(--line)" }} />
        <span className="absolute left-0 right-0 top-1/2 h-px"
          style={{ background: "var(--line)", borderTop: "1px dashed var(--line)" }} />

        {/* Logo dots */}
        {dots.map((d, i) => {
          // Size scaled by ARR — diameter 18-30 px
          const size = Math.round(Math.max(18, Math.min(30, 18 + Math.sqrt(d.arr) / 120)));
          const padding = 12; // px from edges
          return (
            <div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 group/dot"
              style={{
                left: `calc(${d.x * 100}% * (100% - ${padding * 2}px) / 100% + ${padding}px)`,
                top: `calc(${(1 - d.y) * 100}% * (100% - ${padding * 2}px) / 100% + ${padding}px)`,
              }}
              title={`${d.name} · ${fmtMoney(d.arr)}`}
            >
              <div
                className="rounded-md overflow-hidden ring-2 ring-bg shadow-sm transition-transform group-hover/dot:scale-110"
                style={{ width: size, height: size }}
              >
                <Logo name={d.name} size={size} rounded={4} />
              </div>
            </div>
          );
        })}

        {/* Quadrant labels */}
        <span className="absolute top-1 left-1 text-[8.5px] font-mono uppercase tracking-[0.06em] text-muted-2">Save &amp; grow</span>
        <span className="absolute top-1 right-1 text-[8.5px] font-mono uppercase tracking-[0.06em] text-muted-2">Strategic</span>
        <span className="absolute bottom-1 left-1 text-[8.5px] font-mono uppercase tracking-[0.06em] text-muted-2">Reassess</span>
        <span className="absolute bottom-1 right-1 text-[8.5px] font-mono uppercase tracking-[0.06em] text-muted-2">Steady</span>
      </div>
    </TileShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Signals feed — last 3 signals.
// ─────────────────────────────────────────────────────────────────────
function SignalsTile() {
  const items = [
    { tone: "var(--neg)",  text: "Brad silent 14 days",                  ago: "2h", account: "Snowflake" },
    { tone: "var(--warn)", text: "WAU/MAU dropped to 0.48",              ago: "4h", account: "GitLab" },
    { tone: "var(--pos)",  text: "Maya Chen promoted to VP Eng",         ago: "12h", account: "Cloudflare" },
  ];
  return (
    <TileShell
      href="/signals"
      eyebrow="Signals"
      title="Last 24 hours"
      footer="18 signals this week"
    >
      <div className="space-y-1 h-full justify-center flex flex-col">
        {items.map((s, i) => (
          <div key={i} className="flex items-start gap-2 py-1">
            <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: s.tone }} />
            <Logo name={s.account} size={12} rounded={3} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[11px] font-semibold text-ink-2 truncate">{s.account}</span>
                <span className="text-[9.5px] font-mono text-muted-2 ml-auto shrink-0">{s.ago}</span>
              </div>
              <div className="text-[10.5px] text-muted truncate">{s.text}</div>
            </div>
          </div>
        ))}
      </div>
    </TileShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Campaigns — 2 active with metrics.
// ─────────────────────────────────────────────────────────────────────
function CampaignsTile() {
  const items = [
    { name: "Adoption re-engage",      sent: 142, replied: 28, tone: "var(--pos)" },
    { name: "Expansion nurture · Q3",  sent: 84,  replied: 11, tone: "var(--info)" },
  ];
  return (
    <TileShell
      href="/campaigns"
      eyebrow="Campaigns"
      title="Live journeys"
      footer="3 live · 1 paused"
    >
      <div className="space-y-2 h-full justify-center flex flex-col">
        {items.map((c) => (
          <div key={c.name} className="rounded-lg p-3"
            style={{ background: "var(--bg-deep)", border: "1px solid var(--line)" }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.tone }} />
              <span className="text-[11.5px] font-semibold text-ink truncate">{c.name}</span>
            </div>
            <div className="flex items-center gap-3 text-[10.5px] font-mono tnum">
              <span><span className="text-ink-2 font-semibold">{c.sent}</span> <span className="text-muted-2">sent</span></span>
              <span className="text-muted-2">·</span>
              <span><span className="text-ink-2 font-semibold">{c.replied}</span> <span className="text-muted-2">replied</span></span>
              <span className="text-muted-2">·</span>
              <span style={{ color: c.tone }}>{Math.round((c.replied / c.sent) * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </TileShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Forecast — Commit / Best / Plan with confidence.
// ─────────────────────────────────────────────────────────────────────
function ForecastTile() {
  // Pull from the AE myNumber by default; fall back when persona is not AE.
  const ae = myNumber.ae;
  const commit = ae.commit;
  const best = ae.bestCase;
  const plan = ae.bestCase + (ae.pipeline - ae.bestCase) * 0.55;
  const target = ae.quota;
  const confidence = Math.round((commit / target) * 100);

  return (
    <TileShell
      href="/forecast"
      eyebrow="Forecast"
      title="Q3 outlook"
      footer={`${confidence}% confidence · target ${fmtMoney(target)}`}
    >
      <div className="space-y-2.5 h-full justify-center flex flex-col">
        <ForecastBar label="Commit" value={commit} target={target} tone="var(--pos)" />
        <ForecastBar label="Best case" value={best} target={target} tone={ACCENT} />
        <ForecastBar label="Plan" value={plan} target={target} tone="var(--ink-2)" />
      </div>
    </TileShell>
  );
}

function ForecastBar({ label, value, target, tone }: { label: string; value: number; target: number; tone: string }) {
  const pct = Math.min(100, (value / target) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[11px] text-ink-2">{label}</span>
        <span className="text-[11px] font-mono tnum text-ink-2 font-semibold">{fmtMoney(value)}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-deep)" }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: tone }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Revenue waterfall — mini stacked bars.
// ─────────────────────────────────────────────────────────────────────
function RevenueTile() {
  const start = 8_400_000;
  const newBiz = 1_200_000;
  const expansion = 800_000;
  const contraction = 240_000;
  const churn = 420_000;
  const end = start + newBiz + expansion - contraction - churn;
  const max = Math.max(start, end) * 1.1;

  const segs = [
    { label: "Start",    value: start, tone: "var(--ink-2)",     deltaFrom: 0 },
    { label: "+New",     value: newBiz, tone: "var(--pos)",      deltaFrom: start },
    { label: "+Expand",  value: expansion, tone: ACCENT,         deltaFrom: start + newBiz },
    { label: "-Contract",value: contraction, tone: "var(--warn)",deltaFrom: start + newBiz + expansion - contraction },
    { label: "-Churn",   value: churn, tone: "var(--neg)",       deltaFrom: end },
    { label: "End",      value: end, tone: "var(--ink-2)",       deltaFrom: 0 },
  ];

  return (
    <TileShell
      href="/revenue"
      eyebrow="Revenue waterfall"
      title="Q2 movement"
      footer={`${fmtMoney(end - start)} net change · ${end >= start ? "expansion-led" : "contraction-led"}`}
    >
      <div className="grid grid-cols-6 gap-1.5 h-full items-end pt-2">
        {segs.map((s, i) => {
          const isAnchor = i === 0 || i === segs.length - 1;
          const h = (s.value / max) * 100;
          const yOffset = isAnchor ? 0 : (s.deltaFrom / max) * 100;
          return (
            <div key={i} className="relative flex flex-col items-center justify-end"
              style={{ height: "100%" }}>
              <div className="w-full rounded-t-sm"
                style={{
                  height: `${h}%`,
                  marginBottom: `${yOffset}%`,
                  background: s.tone,
                  opacity: isAnchor ? 1 : 0.85,
                }} />
              <div className="text-[8.5px] font-mono uppercase tracking-[0.04em] text-muted-2 mt-1.5 text-center leading-tight">
                {s.label}
              </div>
              <div className="text-[9.5px] font-mono tnum text-ink-2">
                {fmtMoney(s.value).replace(/\.\d+/, "")}
              </div>
            </div>
          );
        })}
      </div>
    </TileShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Capacity — mini heatmap of reps × weeks.
// ─────────────────────────────────────────────────────────────────────
function CapacityTile() {
  return (
    <TileShell
      href="/capacity"
      eyebrow="Capacity"
      title="Team load · 6 weeks"
      footer={`${csmWorkloads.filter((c) => c.workloadScore >= 75).length} overloaded · ${csmWorkloads.filter((c) => c.workloadScore < 50).length} has room`}
    >
      <div className="space-y-1.5 h-full justify-center flex flex-col">
        {csmWorkloads.slice(0, 6).map((rep) => (
          <div key={rep.id} className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-muted-2 w-12 truncate shrink-0">
              {rep.name.split(" ")[0]}
            </span>
            <div className="flex-1 flex gap-0.5">
              {rep.weeklyHeatmap.map((v, i) => {
                const tone = v >= 75 ? "var(--neg)" : v >= 50 ? "var(--pos)" : "var(--info)";
                const opacity = 0.35 + (v / 100) * 0.65;
                return (
                  <span key={i} className="flex-1 h-3 rounded-sm"
                    style={{ background: tone, opacity }} />
                );
              })}
            </div>
            <span className="text-[10px] font-mono tnum w-7 text-right shrink-0"
              style={{ color: rep.workloadScore >= 75 ? "var(--neg)" : "var(--muted)" }}>
              {rep.workloadScore}
            </span>
          </div>
        ))}
      </div>
    </TileShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Deals — mini funnel.
// ─────────────────────────────────────────────────────────────────────
function DealsTile() {
  // Derive from real expansionOpportunities data
  const stages = useMemo(() => {
    const tones: Record<string, string> = {
      identified:  "var(--ink-2)",
      qualified:   "var(--info)",
      proposal:    ACCENT,
      negotiation: "var(--warn)",
    };
    const order: (keyof typeof tones)[] = ["identified", "qualified", "proposal", "negotiation"];
    return order.map((stage) => {
      const opps = expansionOpportunities.filter((o) => o.stage === stage);
      return {
        label: stage.charAt(0).toUpperCase() + stage.slice(1),
        count: opps.length,
        value: opps.reduce((s, o) => s + o.estimatedArr, 0),
        tone: tones[stage],
      };
    });
  }, []);
  const total = stages.reduce((s, x) => s + x.value, 0);
  const totalCount = stages.reduce((s, x) => s + x.count, 0);
  const max = Math.max(1, ...stages.map((s) => s.value));

  return (
    <TileShell
      href="/deals"
      eyebrow="Deals"
      title="Open pipeline"
      footer={`${fmtMoney(total)} across ${totalCount} opps`}
    >
      <div className="space-y-1.5 h-full justify-center flex flex-col">
        {stages.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="text-[10.5px] text-ink-2 w-[88px] truncate shrink-0">{s.label}</span>
            <div className="flex-1 h-3 rounded-sm relative overflow-hidden"
              style={{ background: "var(--bg-deep)" }}>
              <div className="h-full rounded-sm transition-all duration-700"
                style={{ width: `${(s.value / max) * 100}%`, background: s.tone }} />
            </div>
            <span className="text-[10px] font-mono tnum text-muted-2 w-12 text-right shrink-0">
              {fmtMoney(s.value).replace(/\.\d+/, "")}
            </span>
          </div>
        ))}
      </div>
    </TileShell>
  );
}
