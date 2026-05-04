"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, Users, AlertTriangle, Zap } from "lucide-react";
import type { AccountAdoption } from "@/lib/mock";
import { DataFreshness } from "./SourceChip";

export function AdoptionPanel({ data }: { data: AccountAdoption }) {
  const [featureTab, setFeatureTab] = useState<"all" | "core" | "advanced" | "new">("all");

  const filteredFeatures = featureTab === "all"
    ? data.features
    : data.features.filter((f) => f.tier === featureTab);

  return (
    <div className="space-y-4">
      <DataFreshness minutesAgo={1} sources={["Mixpanel", "Snowflake", "Salesforce"]} onRefresh={() => {}} />

      {/* ── Row 1: WAU/MAU headline KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          label="WAU / MAU"
          value={data.wauMauCurrent.toFixed(2)}
          delta={data.wauMauDelta}
          deltaLabel="vs 4w ago"
          tone={data.wauMauDelta >= 0 ? "pos" : "neg"}
        />
        <KpiCard
          label="Monthly active users"
          value={data.monthlyActiveUsers.toString()}
          delta={Math.round(((data.monthlyActiveUsers / data.totalSeats) - 1) * 100)}
          deltaLabel={`of ${data.totalSeats} seats`}
          tone="neutral"
        />
        <KpiCard
          label="Seat utilisation"
          value={`${Math.round((data.monthlyActiveUsers / data.totalSeats) * 100)}%`}
          delta={undefined}
          deltaLabel={`${data.totalSeats} seats licensed`}
          tone="neutral"
        />
        <KpiCard
          label="At-risk users"
          value={data.atRiskUsers.length.toString()}
          delta={undefined}
          deltaLabel="inactive 14+ days"
          tone={data.atRiskUsers.length > 3 ? "neg" : data.atRiskUsers.length > 0 ? "warn" : "pos"}
        />
      </div>

      {/* ── Row 2: WAU/MAU trend sparkline + feature heatmap ── */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-5 card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold text-ink">WAU/MAU · 8-week trend</h3>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full`}
              style={{
                background: data.wauMauDelta >= 0 ? "var(--pos-soft)" : "var(--neg-soft)",
                color: data.wauMauDelta >= 0 ? "var(--pos)" : "var(--neg)",
              }}>
              {data.wauMauDelta >= 0 ? "+" : ""}{data.wauMauDelta}% vs 4w
            </span>
          </div>
          <WauMauSparkline values={data.wauMauTrend} weeks={data.wauMauWeeks} />
        </div>

        <div className="col-span-12 lg:col-span-7 card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold text-ink">Feature adoption</h3>
            <div className="flex gap-1">
              {(["all", "core", "advanced", "new"] as const).map((t) => (
                <button key={t} onClick={() => setFeatureTab(t)}
                  className={`text-[10.5px] px-2 h-6 rounded-full font-medium ${featureTab === t ? "bg-ink text-white" : "bg-bg-deep text-muted"}`}>
                  {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <FeatureGrid features={filteredFeatures} />
        </div>
      </div>

      {/* ── Row 3: Per-team heatmap + at-risk users ── */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-6 card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={13} strokeWidth={1.6} className="text-muted" />
            <h3 className="text-[13px] font-semibold text-ink">Adoption by team</h3>
          </div>
          <TeamHeatmap teams={data.teams} />
        </div>

        <div className="col-span-12 lg:col-span-6 card p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={13} strokeWidth={1.6} className="text-muted" />
            <h3 className="text-[13px] font-semibold text-ink">
              At-risk users · {data.atRiskUsers.length} inactive 14+ days
            </h3>
          </div>
          <AtRiskTable users={data.atRiskUsers} />
        </div>
      </div>

      {/* ── Row 4: Deep-dive trend chart (existing) ── */}
      <div className="card p-5">
        <div className="mb-4">
          <h3 className="text-ink font-semibold text-[14px]">Metric trend lines · change vs onboarding baseline</h3>
          <div className="text-[11.5px] text-muted mt-1">Hover any line for the metric label and current delta.</div>
        </div>
        <AdoptionTrendChart metrics={data.metrics} weeks={data.weeks} />
      </div>

      {/* ── Row 5: Sequence delays ── */}
      <div className="card p-5">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="text-ink font-semibold text-[14px]">Sequence delays</h3>
            <div className="text-[11.5px] text-muted mt-1 max-w-2xl">
              Where customer onboarding sequences got blocked across the last 8 days.
            </div>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4 mt-4">
          <div className="col-span-12 lg:col-span-8">
            <div className="recessed p-4 overflow-x-auto">
              <div className="text-[10.5px] text-muted mb-2">Blocked steps on delayed sequences</div>
              <BlockedStepsMatrix delays={data.sequenceDelays} dayLabels={data.delayDays} />
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <div className="recessed p-4 h-full flex flex-col">
              <div className="text-[10.5px] text-muted mb-2">Steps blocking success</div>
              <BlockingDonut data={data.blockingSteps} />
              <div className="space-y-1 mt-3">
                {data.blockingSteps.map((s) => (
                  <div key={s.label} className="flex items-center gap-2 text-[10.5px]">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                    <span className="text-ink-2 flex-1">{s.label}</span>
                    <span className="text-muted tnum">{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------
function KpiCard({ label, value, delta, deltaLabel, tone }: {
  label: string; value: string; delta?: number; deltaLabel: string; tone: "pos" | "neg" | "warn" | "neutral";
}) {
  const toneColor = tone === "pos" ? "var(--pos)" : tone === "neg" ? "var(--neg)" : tone === "warn" ? "var(--warn)" : "var(--muted)";
  const toneSoft = tone === "pos" ? "var(--pos-soft)" : tone === "neg" ? "var(--neg-soft)" : tone === "warn" ? "var(--warn-soft)" : "var(--bg-deep)";
  return (
    <div className="card p-4">
      <div className="mono-label mb-1.5">{label}</div>
      <div className="hero-num" style={{ fontSize: 26 }}>{value}</div>
      <div className="mt-1.5 flex items-center gap-1.5">
        {delta !== undefined && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ background: toneSoft, color: toneColor }}>
            {delta >= 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
            {delta >= 0 ? "+" : ""}{delta}%
          </span>
        )}
        <span className="text-[10.5px] text-muted-2">{deltaLabel}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// WAU/MAU Sparkline
// ---------------------------------------------------------------------
function WauMauSparkline({ values, weeks }: { values: number[]; weeks: string[] }) {
  const W = 400, H = 120, padX = 28, padY = 16;
  const min = Math.min(...values) * 0.9;
  const max = Math.max(...values) * 1.05;
  const range = max - min || 0.01;
  const stepX = (W - padX * 2) / (values.length - 1);
  const yOf = (v: number) => padY + ((max - v) / range) * (H - padY * 2);
  const pts = values.map((v, i) => `${padX + i * stepX},${yOf(v)}`).join(" ");
  const area = `M ${padX} ${H} L ${padX} ${yOf(values[0])} ${values.map((v, i) => `L ${padX + i * stepX} ${yOf(v)}`).join(" ")} L ${padX + (values.length - 1) * stepX} ${H} Z`;
  const last = values[values.length - 1];
  const prev4 = values[Math.max(0, values.length - 5)];
  const up = last >= prev4;

  return (
    <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full" style={{ maxHeight: 160 }}>
      <defs>
        <linearGradient id="wau-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={up ? "#5BB25B" : "#C84B4B"} stopOpacity="0.22" />
          <stop offset="100%" stopColor={up ? "#5BB25B" : "#C84B4B"} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* area fill */}
      <path d={area} fill="url(#wau-grad)" />
      {/* line */}
      <polyline points={pts} fill="none" stroke={up ? "var(--pos)" : "var(--neg)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* dots */}
      {values.map((v, i) => (
        <circle key={i} cx={padX + i * stepX} cy={yOf(v)} r={i === values.length - 1 ? 4 : 2.5}
          fill={up ? "var(--pos)" : "var(--neg)"} />
      ))}
      {/* x-axis labels */}
      {weeks.map((w, i) => (
        <text key={w} x={padX + i * stepX} y={H + 14} textAnchor="middle" fontSize="9" fill="var(--muted)">{w}</text>
      ))}
      {/* y-axis labels */}
      {[min, (min + max) / 2, max].map((v) => (
        <text key={v} x={padX - 4} y={yOf(v) + 3} textAnchor="end" fontSize="8.5" fill="var(--muted-2)">{v.toFixed(2)}</text>
      ))}
      {/* current value callout */}
      <text x={padX + (values.length - 1) * stepX + 6} y={yOf(last) + 4} fontSize="10" fontWeight="700"
        fill={up ? "var(--pos)" : "var(--neg)"}>{last.toFixed(2)}</text>
    </svg>
  );
}

// ---------------------------------------------------------------------
// Feature adoption grid
// ---------------------------------------------------------------------
function FeatureGrid({ features }: { features: AccountAdoption["features"] }) {
  return (
    <div className="space-y-1.5">
      {features.map((f) => {
        const trendIcon = f.trend === "up"
          ? <TrendingUp size={10} style={{ color: "var(--pos)" }} />
          : f.trend === "down"
          ? <TrendingDown size={10} style={{ color: "var(--neg)" }} />
          : <Minus size={10} style={{ color: "var(--muted)" }} />;

        const tierBg = f.tier === "core" ? "var(--pos-soft)" : f.tier === "advanced" ? "var(--info-soft)" : "var(--accent-soft)";
        const tierInk = f.tier === "core" ? "var(--pos)" : f.tier === "advanced" ? "var(--info)" : "var(--accent-ink)";

        const barColor = f.adoptionPct >= 70 ? "var(--pos)" : f.adoptionPct >= 40 ? "var(--warn)" : "var(--neg)";

        return (
          <div key={f.name} className="flex items-center gap-3">
            <div className="w-[130px] shrink-0">
              <div className="text-[11.5px] font-medium text-ink truncate">{f.name}</div>
              <span className="text-[9px] font-mono uppercase tracking-[0.06em] px-1 py-0.5 rounded"
                style={{ background: tierBg, color: tierInk }}>{f.tier}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <div className="flex-1 h-1.5 rounded-full bg-bg-deep overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${f.adoptionPct}%`, background: barColor }} />
                </div>
                <span className="text-[11px] font-semibold tnum w-8 text-right" style={{ color: barColor }}>{f.adoptionPct}%</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-2">
                <span>WAU/MAU {f.wauMau.toFixed(2)}</span>
                <span>·</span>
                {trendIcon}
                <span style={{ color: f.trendPct > 0 ? "var(--pos)" : f.trendPct < 0 ? "var(--neg)" : "var(--muted)" }}>
                  {f.trendPct > 0 ? "+" : ""}{f.trendPct}% WoW
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------
// Per-team heatmap
// ---------------------------------------------------------------------
function TeamHeatmap({ teams }: { teams: AccountAdoption["teams"] }) {
  return (
    <div className="space-y-2">
      {teams.map((t) => {
        const pct = Math.round((t.activeSeats / t.seats) * 100);
        const barColor = t.healthColor === "pos" ? "var(--pos)" : t.healthColor === "warn" ? "var(--warn)" : "var(--neg)";
        const dotColor = t.healthColor === "pos" ? "var(--pos)" : t.healthColor === "warn" ? "var(--warn)" : "var(--neg)";

        return (
          <div key={t.team} className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dotColor }} />
            <div className="w-[160px] shrink-0">
              <div className="text-[11.5px] font-medium text-ink truncate">{t.team}</div>
              <div className="text-[10px] text-muted-2">{t.activeSeats}/{t.seats} active · WAU/MAU {t.wauMau.toFixed(2)}</div>
            </div>
            <div className="flex-1 h-2 rounded-full bg-bg-deep overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
            </div>
            <span className="text-[11px] font-semibold tnum w-8 text-right" style={{ color: barColor }}>{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------
// At-risk users table
// ---------------------------------------------------------------------
function AtRiskTable({ users }: { users: AccountAdoption["atRiskUsers"] }) {
  if (users.length === 0) {
    return <div className="text-[12px] text-muted-2 text-center py-4">No at-risk users — everyone active in 14 days.</div>;
  }
  return (
    <div className="space-y-1.5">
      {users.map((u) => (
        <div key={u.name} className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-surface-2 border border-line">
          <div className="w-7 h-7 rounded-full grid place-items-center text-[10px] font-semibold bg-bg-deep text-muted shrink-0">
            {u.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-ink">{u.name}</div>
            <div className="text-[10.5px] text-muted truncate">{u.team}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[11px] font-mono tnum" style={{ color: u.daysInactive >= 21 ? "var(--neg)" : "var(--warn)" }}>
              {u.daysInactive}d ago
            </div>
            <div className="text-[9.5px] text-muted-2">Last: {u.lastSeen}</div>
          </div>
          <Zap size={10} strokeWidth={1.8} style={{ color: "var(--accent-deep)", flexShrink: 0 }} />
        </div>
      ))}
      <button className="w-full text-[11px] font-semibold h-7 rounded-md border border-line text-muted hover:text-ink hover:bg-bg-deep mt-1">
        Re-engage all · send personalized check-in
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------
// Trend chart (existing, cleaned up)
// ---------------------------------------------------------------------
function AdoptionTrendChart({ metrics, weeks }: { metrics: AccountAdoption["metrics"]; weeks: string[] }) {
  const [hover, setHover] = useState<string | null>(null);
  const W = 720, H = 200, pad = 24;
  const cols = weeks.length;
  const stepX = (W - pad * 2) / (cols - 1);
  const all = metrics.flatMap((m) => m.trend);
  const max = Math.max(100, Math.max(...all));
  const min = Math.min(-250, Math.min(...all));
  const range = max - min;
  const yOf = (v: number) => pad + ((max - v) / range) * (H - pad * 2);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full" style={{ maxHeight: 240 }}>
        {[max, max * 0.5, 0, min * 0.5, min].map((y) => (
          <g key={y}>
            <line x1={pad} x2={W - pad} y1={yOf(y)} y2={yOf(y)} stroke="var(--line)" strokeDasharray="2 4" />
            <text x={pad - 4} y={yOf(y) + 3} textAnchor="end" fontSize="9" fill="var(--muted-2)">{Math.round(y)}</text>
          </g>
        ))}
        {weeks.map((w, i) => (
          <text key={w} x={pad + i * stepX} y={H + 12} textAnchor="middle" fontSize="9.5" fill="var(--muted)">{w} 2026</text>
        ))}
        {metrics.map((m) => {
          const dimmed = hover && hover !== m.label;
          const path = m.trend.map((v, i) => `${i === 0 ? "M" : "L"} ${pad + i * stepX} ${yOf(v)}`).join(" ");
          return (
            <g key={m.label} onMouseEnter={() => setHover(m.label)} onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer", opacity: dimmed ? 0.18 : 1, transition: "opacity 160ms" }}>
              <path d={path} fill="none" stroke={m.color} strokeWidth={hover === m.label ? 2.5 : 1.8}
                strokeLinecap="round" strokeLinejoin="round" />
              {m.trend.map((v, i) => (
                <circle key={i} cx={pad + i * stepX} cy={yOf(v)} r={hover === m.label ? 3.5 : 2.5} fill={m.color} />
              ))}
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
        {metrics.map((m) => (
          <button key={m.label} onMouseEnter={() => setHover(m.label)} onMouseLeave={() => setHover(null)}
            className="inline-flex items-center gap-1.5 text-[10.5px] text-ink-2 hover:text-ink">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />
            {m.label}
            <span className="text-muted-2 tnum">{m.current >= 0 ? "+" : ""}{m.current}%</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Blocked steps matrix heatmap
// ---------------------------------------------------------------------
function BlockedStepsMatrix({ delays, dayLabels }: { delays: { step: string; blocked: number[] }[]; dayLabels: string[] }) {
  const cellSize = 36;
  const gap = 4;
  return (
    <div className="overflow-x-auto">
      <div className="flex">
        <div className="flex flex-col pt-7 mr-2">
          {delays.map((d) => (
            <div key={d.step} className="text-[10.5px] text-ink-2 truncate"
              style={{ height: cellSize, marginBottom: gap, lineHeight: `${cellSize}px` }} title={d.step}>
              {d.step.length > 28 ? d.step.slice(0, 27) + "…" : d.step}
            </div>
          ))}
        </div>
        <div className="flex flex-col">
          <div className="flex" style={{ marginBottom: gap }}>
            {dayLabels.map((l) => (
              <div key={l} className="text-[9.5px] font-mono text-muted-2 text-center"
                style={{ width: cellSize, marginRight: gap, lineHeight: "20px" }}>{l}</div>
            ))}
          </div>
          {delays.map((d) => (
            <div key={d.step} className="flex" style={{ marginBottom: gap }}>
              {d.blocked.map((v, i) => {
                const bg = v === 0 ? "var(--bg-deep)" : v === 1 ? "rgba(224,165,71,0.55)" : "rgba(224,165,71,0.95)";
                return (
                  <div key={i} className="grid place-items-center"
                    style={{ width: cellSize, height: cellSize, marginRight: gap, background: bg, borderRadius: 5 }}
                    title={`${d.step} · ${dayLabels[i]} · ${v} blocked`}>
                    <span className="text-[10.5px] font-mono tnum" style={{ color: v === 0 ? "var(--muted-2)" : "var(--ink)" }}>{v}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Multi-color donut
// ---------------------------------------------------------------------
function BlockingDonut({ data }: { data: { label: string; pct: number; color: string }[] }) {
  const cx = 60, cy = 60, r = 42, innerR = 28;
  let acc = 0;
  const total = data.reduce((s, d) => s + d.pct, 0) || 1;
  return (
    <svg viewBox="0 0 120 120" className="mx-auto" style={{ maxWidth: 140 }}>
      {data.map((d) => {
        const start = (acc / total) * Math.PI * 2;
        acc += d.pct;
        const end = (acc / total) * Math.PI * 2;
        const large = end - start > Math.PI ? 1 : 0;
        const x1 = cx + r * Math.sin(start), y1 = cy - r * Math.cos(start);
        const x2 = cx + r * Math.sin(end),   y2 = cy - r * Math.cos(end);
        const x3 = cx + innerR * Math.sin(end),   y3 = cy - innerR * Math.cos(end);
        const x4 = cx + innerR * Math.sin(start), y4 = cy - innerR * Math.cos(start);
        return (
          <path key={d.label}
            d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${large} 0 ${x4} ${y4} Z`}
            fill={d.color} />
        );
      })}
    </svg>
  );
}
