"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, AlertTriangle, Sparkles, ArrowRight, ChevronRight,
  Zap, Shield, Flame, RefreshCw, Crown, Calendar, Target, Eye,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Logo } from "@/components/Logo";
import {
  accounts, expansionOpportunities, championChanges, fmtMoney, slugify,
  type Account,
} from "@/lib/mock";

// ─────────────────────────────────────────────────────────────────────
// Quadrant model
// X axis: Expansion potential (0-100)
// Y axis: Account health        (0-100)
//
//   Y↑  ┌──────────────────────┬──────────────────────┐
//       │   STEADY STATE        │  STRATEGIC GROWTH   │
//       │   "milk & defend"     │  "expand aggressively" │
//   50  ├──────────────────────┼──────────────────────┤
//       │   REASSESS            │  SAVE & GROW        │
//       │   "minimize effort"   │  "triage then expand"│
//       └──────────────────────┴──────────────────────┘
//        0          50          → X (expansion)        100
// ─────────────────────────────────────────────────────────────────────

type Segment = "strategic" | "steady" | "save" | "reassess";

type AccountPoint = {
  id: string;
  name: string;
  slug: string;
  arr: number;
  health: number;
  expansion: number;       // 0-100
  pipeline: number;
  hotSignals: number;
  segment: Segment;
  signal: string;
  topPlay?: string;
};

const SEGMENT_META: Record<Segment, {
  label: string;
  tagline: string;
  color: string;
  bg: string;
  ring: string;
  recommendation: string;
}> = {
  strategic: {
    label: "Strategic growth",
    tagline: "Expand aggressively",
    color: "#0FC27B",
    bg:    "rgba(15, 194, 123, 0.06)",
    ring:  "rgba(15, 194, 123, 0.20)",
    recommendation: "These accounts are healthy AND showing strong expansion signals. Build the case, secure exec sponsor, push to close.",
  },
  steady: {
    label: "Steady state",
    tagline: "Milk & defend",
    color: "#266DF0",
    bg:    "rgba(38, 109, 240, 0.05)",
    ring:  "rgba(38, 109, 240, 0.18)",
    recommendation: "Healthy accounts with limited expansion runway right now. Protect the renewal, deepen adoption, surface white space quietly.",
  },
  save: {
    label: "Save & grow",
    tagline: "Triage then expand",
    color: "#F5B900",
    bg:    "rgba(245, 185, 0, 0.06)",
    ring:  "rgba(245, 185, 0, 0.22)",
    recommendation: "Health is shaky but there's expansion appetite. Stabilize the relationship first — bundle expansion into renewal as a value play.",
  },
  reassess: {
    label: "Reassess",
    tagline: "Minimize effort",
    color: "#FF5B59",
    bg:    "rgba(255, 91, 89, 0.05)",
    ring:  "rgba(255, 91, 89, 0.20)",
    recommendation: "Low health, low expansion potential. Decide: fight to save or de-prioritize. Don't waste cycles trying to expand a sinking account.",
  },
};

function classify(health: number, expansion: number): Segment {
  const hi_h = health >= 60;
  const hi_e = expansion >= 60;
  if (hi_h && hi_e)  return "strategic";
  if (hi_h && !hi_e) return "steady";
  if (!hi_h && hi_e) return "save";
  return "reassess";
}

function buildPoints(): AccountPoint[] {
  // Customers only — expansion is for accounts you already own
  const customers = accounts.filter((a) => a.status === "Customer");
  return customers.map((a) => {
    const slug = slugify(a.name);
    // accountName in expansionOpportunities uses short names ("Cloudflare")
    // while account.name has the legal name ("Cloudflare, Inc."). Match by slug.
    const opps = expansionOpportunities.filter((o) => o.accountSlug === slug);
    const champCount = championChanges.filter((c) => c.accountSlug === slug).length;
    const topOpp = opps.sort((x, y) => y.score - x.score)[0];

    // Synthesize an expansion potential score:
    //   - Real opp score if we have one
    //   - Otherwise a derivation from health + signals
    const expansion = topOpp
      ? topOpp.score
      : Math.min(100, Math.max(20, a.healthScore - 15 + champCount * 8));

    const pipeline = opps.reduce((s, o) => s + o.estimatedArr, 0);
    const hotSignals = opps.filter((o) => o.daysInStage <= 14).length + champCount;
    const segment = classify(a.healthScore, expansion);

    return {
      id: a.id,
      name: a.name.replace(/(, Inc\.| Software| Inc\.| Technologies)$/, ""),
      slug,
      arr: a.arr,
      health: a.healthScore,
      expansion,
      pipeline,
      hotSignals,
      segment,
      signal: a.signal,
      topPlay: topOpp?.play,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────
export default function PortfolioPage() {
  const points = useMemo(buildPoints, []);
  const [activeSegment, setActiveSegment] = useState<Segment | "all">("all");
  const [hovered, setHovered] = useState<string | null>(null);

  const totalArr     = points.reduce((s, p) => s + p.arr, 0);
  const totalPipe    = points.reduce((s, p) => s + p.pipeline, 0);
  const atRiskArr    = points.filter((p) => p.health < 60).reduce((s, p) => s + p.arr, 0);
  const expandReady  = points.filter((p) => p.segment === "strategic" || p.segment === "save").length;

  const segments: Segment[] = ["strategic", "steady", "save", "reassess"];

  return (
    <AppShell>
      {/* ─── Header ─────────────────────────────── */}
      <div className="mb-6 pb-5 border-b border-line">
        <div className="flex items-center gap-3 mb-2">
          <div className="mono-label">Portfolio</div>
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded"
            style={{ background: "var(--accent-soft)", color: "var(--accent-deep)" }}>BETA</span>
        </div>
        <h1 className="text-[26px] font-semibold text-ink mb-1.5" style={{ letterSpacing: "-0.022em" }}>
          Where every account stands today
        </h1>
        <p className="text-[13px] text-muted max-w-3xl leading-relaxed">
          Health and expansion potential, plotted on one map. Use it to decide where to push, where to defend, and where to walk away — before quarterly planning forces the question.
        </p>
      </div>

      {/* ─── KPI strip ──────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPI label="Total ARR"          value={fmtMoney(totalArr)}    color="var(--ink)" />
        <KPI label="Expansion pipeline" value={fmtMoney(totalPipe)}   color="var(--accent-deep)" delta="+18%" />
        <KPI label="Ready to expand"    value={`${expandReady} accts`} color="var(--pos)" />
        <KPI label="ARR at risk"        value={fmtMoney(atRiskArr)}   color="var(--neg)" />
      </div>

      {/* ─── Quadrant ───────────────────────────── */}
      <div className="grid grid-cols-12 gap-5">
        {/* Left: Quadrant matrix */}
        <div className="col-span-12 lg:col-span-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-[14px] font-semibold text-ink">Account map</div>
                <div className="text-[11px] text-muted mt-0.5">Health × Expansion potential. Bubble size = ARR.</div>
              </div>
              <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: "var(--bg-deep)" }}>
                <button onClick={() => setActiveSegment("all")}
                  className={`px-2.5 py-1 rounded text-[10.5px] font-medium ${activeSegment === "all" ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
                  All {points.length}
                </button>
                {segments.map((seg) => {
                  const count = points.filter((p) => p.segment === seg).length;
                  const meta = SEGMENT_META[seg];
                  return (
                    <button key={seg} onClick={() => setActiveSegment(seg)}
                      className={`px-2.5 py-1 rounded text-[10.5px] font-medium inline-flex items-center gap-1 ${activeSegment === seg ? "bg-surface shadow-sm" : "text-muted hover:text-ink"}`}
                      style={{ color: activeSegment === seg ? meta.color : undefined }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
                      {meta.label} {count}
                    </button>
                  );
                })}
              </div>
            </div>

            <Quadrant
              points={points}
              activeSegment={activeSegment}
              hovered={hovered}
              setHovered={setHovered}
            />
          </div>
        </div>

        {/* Right: Segment detail */}
        <div className="col-span-12 lg:col-span-4">
          <SegmentDetail
            points={points}
            activeSegment={activeSegment}
            setActiveSegment={setActiveSegment}
          />
        </div>
      </div>

      {/* ─── Recommended plays per quadrant ──────────────── */}
      <div className="mt-7">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg grid place-items-center"
            style={{ background: "linear-gradient(135deg, #266DF0 0%, #7C3AED 100%)" }}>
            <Sparkles size={13} strokeWidth={2.2} className="text-white" />
          </div>
          <span className="text-[14px] font-semibold text-ink">Recommended plays · by segment</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {segments.map((seg) => {
            const meta = SEGMENT_META[seg];
            const segAccounts = points.filter((p) => p.segment === seg);
            const segArr = segAccounts.reduce((s, p) => s + p.arr, 0);
            return (
              <div key={seg} className="card p-4 h-full"
                style={{ borderColor: meta.ring, background: `linear-gradient(135deg, ${meta.bg} 0%, var(--surface) 100%)` }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                    <span className="text-[12.5px] font-semibold text-ink">{meta.label}</span>
                  </div>
                  <span className="text-[10px] font-mono tnum text-muted">{segAccounts.length}</span>
                </div>
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: meta.color }}>
                  {meta.tagline}
                </div>
                <p className="text-[11.5px] text-ink-2 leading-relaxed mb-3">{meta.recommendation}</p>
                <div className="text-[10.5px] text-muted-2 mb-2">{fmtMoney(segArr)} ARR · {segAccounts.length} accounts</div>
                <button onClick={() => setActiveSegment(seg)}
                  className="text-[10.5px] font-semibold inline-flex items-center gap-1 hover:gap-1.5 transition-all"
                  style={{ color: meta.color }}>
                  See list <ChevronRight size={11} strokeWidth={2.4} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
function KPI({ label, value, color, delta }: { label: string; value: string; color: string; delta?: string }) {
  return (
    <div className="card p-4">
      <div className="text-[10px] uppercase tracking-[0.12em] text-muted-2 font-semibold mb-1">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-[22px] font-bold tnum" style={{ color, letterSpacing: "-0.022em" }}>{value}</span>
        {delta && <span className="text-[10.5px] font-semibold tnum" style={{ color: "var(--pos)" }}>{delta}</span>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Quadrant: SVG-positioned bubbles plotted on a Health × Expansion grid
// ─────────────────────────────────────────────────────────────────────
function Quadrant({
  points, activeSegment, hovered, setHovered,
}: {
  points: AccountPoint[];
  activeSegment: Segment | "all";
  hovered: string | null;
  setHovered: (v: string | null) => void;
}) {
  // bubble size — log scale on ARR
  const maxArr = Math.max(...points.map((p) => p.arr), 1);
  const sizeFor = (arr: number) => {
    const norm = Math.log(arr + 1) / Math.log(maxArr + 1);
    return 28 + norm * 38; // 28-66 px
  };

  const padding = 40;
  const W = 100; // % unit
  const H = 100;

  // Quadrant tints (drawn as background rects)
  const quadrants: { seg: Segment; x: number; y: number; w: number; h: number }[] = [
    { seg: "reassess",  x: 0,  y: 50, w: 50, h: 50 }, // bottom-left
    { seg: "save",      x: 50, y: 50, w: 50, h: 50 }, // bottom-right
    { seg: "steady",    x: 0,  y: 0,  w: 50, h: 50 }, // top-left
    { seg: "strategic", x: 50, y: 0,  w: 50, h: 50 }, // top-right
  ];

  return (
    <div className="relative" style={{ aspectRatio: "1.1 / 1" }}>
      {/* Y-axis label */}
      <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center">
        <span className="-rotate-90 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-muted-2 whitespace-nowrap">
          Health →
        </span>
      </div>
      {/* X-axis label */}
      <div className="absolute bottom-0 left-8 right-0 h-8 flex items-center justify-center">
        <span className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-muted-2">
          Expansion potential →
        </span>
      </div>

      {/* Plot area */}
      <div className="absolute inset-0 pl-8 pb-8 pt-2 pr-2">
        <div className="relative w-full h-full rounded-xl overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>

          {/* Quadrant tints */}
          {quadrants.map((q) => {
            const meta = SEGMENT_META[q.seg];
            const dimmed = activeSegment !== "all" && activeSegment !== q.seg;
            return (
              <div key={q.seg}
                className="absolute transition-opacity duration-200"
                style={{
                  left: `${q.x}%`, top: `${q.y}%`, width: `${q.w}%`, height: `${q.h}%`,
                  background: meta.bg,
                  opacity: dimmed ? 0.3 : 1,
                }}
              />
            );
          })}

          {/* Quadrant divider lines */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ background: "var(--line-strong)", opacity: 0.5 }} />
          <div className="absolute top-1/2 left-0 right-0 h-px" style={{ background: "var(--line-strong)", opacity: 0.5 }} />

          {/* Quadrant labels */}
          {quadrants.map((q) => {
            const meta = SEGMENT_META[q.seg];
            const isActive = activeSegment === "all" || activeSegment === q.seg;
            return (
              <div key={q.seg + "-label"}
                className="absolute pointer-events-none"
                style={{
                  left: `${q.x + 1.5}%`,
                  top: `${q.y + 1.5}%`,
                  opacity: isActive ? 1 : 0.4,
                  transition: "opacity 200ms",
                }}
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: meta.color }}>
                  {meta.label}
                </div>
                <div className="text-[9px] font-medium" style={{ color: meta.color, opacity: 0.7 }}>
                  {meta.tagline}
                </div>
              </div>
            );
          })}

          {/* Bubbles */}
          {points.map((p) => {
            const size = sizeFor(p.arr);
            const meta = SEGMENT_META[p.segment];
            const dimmed = activeSegment !== "all" && activeSegment !== p.segment;
            const isHovered = hovered === p.id;
            return (
              <Link key={p.id}
                href={`/accounts/${p.slug}`}
                className="absolute group cursor-pointer"
                onMouseEnter={() => setHovered(p.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  left: `${p.expansion}%`,
                  bottom: `${p.health}%`,
                  width: size,
                  height: size,
                  transform: "translate(-50%, 50%)",
                  zIndex: isHovered ? 30 : 10,
                  opacity: dimmed ? 0.3 : 1,
                  transition: "opacity 200ms, transform 200ms",
                }}
              >
                <div
                  className="absolute inset-0 rounded-full grid place-items-center"
                  style={{
                    background: "var(--bg)",
                    border: `2px solid ${meta.color}`,
                    boxShadow: isHovered
                      ? `0 8px 28px -6px ${meta.color}80, 0 0 0 4px ${meta.ring}`
                      : `0 2px 8px -2px ${meta.color}40`,
                    transform: isHovered ? "scale(1.08)" : "scale(1)",
                    transition: "transform 200ms, box-shadow 200ms",
                  }}
                >
                  <Logo name={p.name} size={Math.max(20, size * 0.55)} rounded={Math.max(4, size * 0.18)} />
                </div>

                {/* Hover tooltip */}
                {isHovered && (
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-50 pointer-events-none"
                    style={{ top: "100%", minWidth: 220 }}>
                    <div className="rounded-xl px-3.5 py-3 shadow-xl"
                      style={{
                        background: "var(--surface)",
                        border: `1px solid ${meta.ring}`,
                        boxShadow: `0 16px 40px -8px rgba(0,0,0,0.18), 0 0 0 1px ${meta.ring}`,
                      }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[12.5px] font-semibold text-ink">{p.name}</span>
                        <span className="text-[9px] font-semibold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded ml-auto"
                          style={{ background: meta.bg, color: meta.color }}>
                          {meta.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10.5px] mb-2">
                        <div className="flex items-center gap-1 text-muted">Health
                          <span className="ml-auto font-semibold tnum text-ink">{p.health}</span></div>
                        <div className="flex items-center gap-1 text-muted">Expansion
                          <span className="ml-auto font-semibold tnum text-ink">{p.expansion}</span></div>
                        <div className="flex items-center gap-1 text-muted">ARR
                          <span className="ml-auto font-semibold tnum text-ink">{fmtMoney(p.arr)}</span></div>
                        <div className="flex items-center gap-1 text-muted">Pipeline
                          <span className="ml-auto font-semibold tnum" style={{ color: "var(--accent-deep)" }}>{p.pipeline > 0 ? fmtMoney(p.pipeline) : "—"}</span></div>
                      </div>
                      {p.topPlay && (
                        <div className="pt-2 border-t border-line text-[10.5px] text-ink-2 leading-snug">
                          <Zap size={9} strokeWidth={2.4} className="inline mb-0.5 mr-1" style={{ color: meta.color }} />
                          {p.topPlay}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
function SegmentDetail({
  points, activeSegment, setActiveSegment,
}: {
  points: AccountPoint[];
  activeSegment: Segment | "all";
  setActiveSegment: (s: Segment | "all") => void;
}) {
  const filtered = activeSegment === "all"
    ? [...points].sort((a, b) => b.arr - a.arr)
    : points.filter((p) => p.segment === activeSegment).sort((a, b) => b.arr - a.arr);

  const title = activeSegment === "all" ? "All accounts" : SEGMENT_META[activeSegment].label;
  const tagline = activeSegment === "all"
    ? "Sorted by ARR"
    : SEGMENT_META[activeSegment].tagline;
  const titleColor = activeSegment === "all" ? "var(--ink)" : SEGMENT_META[activeSegment].color;

  return (
    <div className="card p-5 h-full">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {activeSegment !== "all" && (
            <span className="w-2 h-2 rounded-full" style={{ background: titleColor }} />
          )}
          <span className="text-[14px] font-semibold" style={{ color: titleColor }}>{title}</span>
          <span className="text-[10.5px] font-mono text-muted-2 bg-bg-deep px-1.5 py-0.5 rounded">{filtered.length}</span>
        </div>
        {activeSegment !== "all" && (
          <button onClick={() => setActiveSegment("all")}
            className="text-[11px] text-muted hover:text-ink">Clear</button>
        )}
      </div>
      <div className="text-[10.5px] text-muted mb-4">{tagline}</div>

      <div className="space-y-2">
        {filtered.map((p) => {
          const meta = SEGMENT_META[p.segment];
          return (
            <Link key={p.id} href={`/accounts/${p.slug}`}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-bg-deep transition-colors"
              style={{ border: "1px solid var(--line)" }}>
              <Logo name={p.name} size={26} rounded={6} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[12.5px] font-semibold text-ink truncate">{p.name}</span>
                  {activeSegment === "all" && (
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: meta.color }} />
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10.5px]">
                  <span className="text-muted">H {p.health}</span>
                  <span className="text-muted-2">·</span>
                  <span className="text-muted">E {p.expansion}</span>
                  {p.hotSignals > 0 && (
                    <>
                      <span className="text-muted-2">·</span>
                      <span style={{ color: "var(--accent-deep)" }} className="font-semibold inline-flex items-center gap-0.5">
                        ⚡ {p.hotSignals}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[12px] font-bold tnum text-ink leading-none">{fmtMoney(p.arr)}</div>
                {p.pipeline > 0 && (
                  <div className="text-[10px] font-mono tnum mt-1" style={{ color: "var(--accent-deep)" }}>
                    +{fmtMoney(p.pipeline)}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
