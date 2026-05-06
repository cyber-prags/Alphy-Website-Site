"use client";

import { useState } from "react";
import {
  Shield, Activity, Mail, Calendar, Check, Sparkles, BarChart3,
  Users, Heart, FileBarChart2, MessageSquareText, ArrowUp, ArrowDown, Minus, Headphones, Rocket,
  Target, TrendingUp, ChevronRight, Zap, ExternalLink, X,
} from "lucide-react";
import Link from "next/link";
import { myNumber, fmtMoney, fmtDate, expansionOpportunities, EXPANSION_STAGES, type Persona, type ExpansionOpportunity, type ExpansionStage } from "@/lib/mock";
import { AlertTriangle as AlertTri, Clock as ClockIcon, CheckCircle2, User, Calendar as CalIcon } from "lucide-react";
import { Logo } from "./Logo";

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
// AM: expansion-primary scoreboard — top 5 ranked by score
// ---------------------------------------------------------------------
function expansionSummary(opp: ExpansionOpportunity): string {
  const top = [...opp.factors].sort((a, b) => b.score - a.score).slice(0, 2);
  const strong = top.map((f) => f.label.toLowerCase()).join(" and ");
  return `${opp.accountName} shows strong expansion potential for ${opp.productName} (score ${opp.score}/100). The strongest signals are ${strong}. ${opp.evidence}`;
}

function scoreGradient(score: number): [string, string] {
  if (score >= 80) return ["#266DF0", "#1A5AD4"];
  if (score >= 70) return ["#538BF3", "#266DF0"];
  return ["#F5B900", "#E5A800"];
}

const STAGE_LABEL: Record<ExpansionStage, string> = {
  identified: "Identified", qualified: "Qualified", proposal: "Proposal", negotiation: "Negotiation", closed: "Closed",
};

function StageStepper({ current }: { current: ExpansionStage }) {
  const idx = EXPANSION_STAGES.indexOf(current);
  return (
    <div className="flex items-center gap-0">
      {EXPANSION_STAGES.map((s, i) => {
        const done = i <= idx;
        const isCurrent = i === idx;
        return (
          <div key={s} className="flex items-center">
            {i > 0 && <div className="w-4 h-[2px] rounded-full" style={{ background: done ? "var(--accent)" : "var(--line)" }} />}
            <div className="relative group/step">
              <div className={`w-2.5 h-2.5 rounded-full ${isCurrent ? "ring-2 ring-offset-1" : ""}`}
                style={{
                  background: done ? "var(--accent)" : "var(--line)",
                  ringColor: isCurrent ? "var(--accent)" : undefined,
                  ringOffsetColor: "var(--bg)",
                } as any} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AMScoreboard() {
  const a = myNumber.am;
  const top5 = expansionOpportunities.slice(0, 5);
  const totalPipeline = top5.reduce((s, o) => s + o.estimatedArr, 0);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg grid place-items-center" style={{ background: "var(--accent-soft)" }}>
            <TrendingUp size={13} strokeWidth={1.8} style={{ color: "var(--accent)" }} />
          </div>
          <span className="text-[14px] font-semibold text-ink">Expansion Opportunities</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-muted">
          <span><span className="tnum font-semibold" style={{ color: "var(--pos)" }}>{fmtMoney(a.expansion.closed)}</span> closed</span>
          <span><span className="tnum font-semibold text-ink">{fmtMoney(a.expansion.inMotion)}</span> in motion</span>
          <span><span className="tnum font-semibold" style={{ color: "var(--accent)" }}>{fmtMoney(totalPipeline)}</span> pipeline</span>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-2.5">
        {top5.map((opp, i) => {
          const [g1, g2] = scoreGradient(opp.score);
          const isExpanded = expanded === opp.id;
          const C = 2 * Math.PI * 16;
          const offset = C - (opp.score / 100) * C;
          const staleThreshold = 14;
          const isStale = opp.daysInStage >= staleThreshold;

          return (
            <div key={opp.id} className="group">
              <button
                onClick={() => setExpanded(isExpanded ? null : opp.id)}
                className="w-full text-left relative overflow-hidden rounded-xl transition-all duration-200"
                style={{
                  background: "var(--bg)",
                  border: `1px solid ${isExpanded ? g1 + "60" : "var(--line)"}`,
                  boxShadow: isExpanded ? `0 0 24px ${g1}12` : undefined,
                }}
              >
                {/* Left accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl" style={{ background: `linear-gradient(180deg, ${g1}, ${g2})` }} />

                <div className="py-3.5 pl-5 pr-4">
                  {/* Top row: Logo + Name + Stage stepper + Score + ARR */}
                  <div className="flex items-center gap-3.5">
                    <span className="text-[10px] font-mono font-bold w-3 text-center shrink-0" style={{ color: i === 0 ? g1 : "var(--muted)" }}>{i + 1}</span>
                    <Logo name={opp.accountName} size={30} rounded={8} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-semibold text-ink">{opp.accountName}</span>
                        <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>{opp.productName}</span>
                      </div>
                      {/* Stage stepper + label */}
                      <div className="flex items-center gap-2">
                        <StageStepper current={opp.stage} />
                        <span className="text-[10px] font-medium text-muted">{STAGE_LABEL[opp.stage]}</span>
                        {isStale && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "var(--neg-soft)", color: "var(--neg)" }}>
                            {opp.daysInStage}d stale
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Score ring */}
                    <div className="relative shrink-0" style={{ filter: `drop-shadow(0 0 3px ${g1}30)` }}>
                      <svg width="38" height="38" viewBox="0 0 38 38" style={{ transform: "rotate(-90deg)" }}>
                        <defs>
                          <linearGradient id={`sg-${opp.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={g1} />
                            <stop offset="100%" stopColor={g2} />
                          </linearGradient>
                        </defs>
                        <circle cx="19" cy="19" r="16" fill="none" stroke="var(--line)" strokeWidth="2.5" opacity="0.3" />
                        <circle cx="19" cy="19" r="16" fill="none" stroke={`url(#sg-${opp.id})`} strokeWidth="2.5"
                          strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset}
                          style={{ transition: "stroke-dashoffset 800ms cubic-bezier(0.4, 0, 0.2, 1)" }} />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold tnum" style={{ color: g1 }}>{opp.score}</span>
                    </div>

                    {/* ARR */}
                    <div className="text-right shrink-0">
                      <div className="text-[17px] font-bold tnum text-ink leading-none">{fmtMoney(opp.estimatedArr)}</div>
                      <div className="text-[9px] text-muted mt-0.5 uppercase tracking-wider">est. ARR</div>
                    </div>

                    <ChevronRight size={13} strokeWidth={1.8} className={`text-muted shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                  </div>

                  {/* Bottom row: Next action pill + Owner + Close date */}
                  <div className="flex items-center gap-2 mt-2.5 ml-10">
                    <Zap size={10} strokeWidth={2} style={{ color: "var(--accent)" }} />
                    <span className="text-[11px] text-ink-2 truncate flex-1">{opp.play}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="w-5 h-5 rounded-full text-white grid place-items-center text-[8px] font-bold" style={{ background: opp.ownerBg }}>
                        {opp.ownerInitials}
                      </div>
                      <span className="text-[10px] text-muted">{opp.owner.split(" ")[0]}</span>
                    </div>
                    <span className="text-[10px] text-muted-2 mx-1">·</span>
                    <span className="text-[10px] font-mono tnum text-muted">Close {fmtDate(opp.closeDate)}</span>
                  </div>
                </div>
              </button>

              {/* Expanded detail panel */}
              {isExpanded && (
                <div className="mx-3 mt-0 rounded-b-xl border border-t-0 overflow-hidden"
                  style={{
                    borderColor: g1 + "40",
                    background: `linear-gradient(135deg, var(--bg) 0%, color-mix(in srgb, ${g1} 3%, var(--bg)) 100%)`,
                  }}>

                  {/* AI Summary */}
                  <div className="px-5 pt-4 pb-3 border-b border-line">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg grid place-items-center shrink-0 mt-0.5" style={{ background: g1 + "18" }}>
                        <Sparkles size={12} strokeWidth={1.8} style={{ color: g1 }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-2 mb-1">AI Insight</div>
                        <p className="text-[12px] text-ink leading-relaxed">{expansionSummary(opp)}</p>
                      </div>
                    </div>
                  </div>

                  {/* 3-column detail grid */}
                  <div className="grid grid-cols-3 gap-px" style={{ background: "var(--line)" }}>

                    {/* Column 1: Signals + Champion */}
                    <div className="px-4 py-3.5" style={{ background: "var(--bg)" }}>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-2 mb-2.5">Expansion Signals</div>
                      <div className="space-y-2">
                        {opp.factors.map((f) => {
                          const barColor = f.score >= 80 ? "var(--pos)" : f.score >= 60 ? "var(--warn)" : "var(--muted)";
                          return (
                            <div key={f.label}>
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-[10px] text-muted truncate">{f.label}</span>
                                <span className="text-[10px] font-bold tnum ml-1" style={{ color: barColor }}>{f.score}</span>
                              </div>
                              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--line)" }}>
                                <div className="h-full rounded-full" style={{ width: `${f.score}%`, background: barColor }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Champion */}
                      <div className="mt-3.5 pt-3 border-t border-line">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-2 mb-1.5">Champion</div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full grid place-items-center" style={{ background: g1 + "20" }}>
                            <User size={11} strokeWidth={1.8} style={{ color: g1 }} />
                          </div>
                          <div>
                            <div className="text-[11.5px] font-semibold text-ink">{opp.champion}</div>
                            <div className="text-[10px] text-muted">{opp.championTitle}</div>
                          </div>
                        </div>
                      </div>

                      {/* Account context */}
                      <div className="mt-3 flex items-center gap-3 text-[10px] text-muted">
                        <span>Current ARR <strong className="text-ink">{fmtMoney(opp.currentArr)}</strong></span>
                        <span>Usage <strong style={{ color: opp.usageTrend >= 0 ? "var(--pos)" : "var(--neg)" }}>{opp.usageTrend > 0 ? "+" : ""}{opp.usageTrend}%</strong></span>
                      </div>
                    </div>

                    {/* Column 2: Next Steps + Risks */}
                    <div className="px-4 py-3.5" style={{ background: "var(--bg)" }}>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-2 mb-2.5">Next Steps</div>
                      <div className="space-y-1.5">
                        {opp.nextSteps.map((step, si) => (
                          <div key={si} className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded grid place-items-center shrink-0 mt-0.5 text-[9px] font-bold"
                              style={{ background: si === 0 ? g1 : "var(--bg-deep)", color: si === 0 ? "#fff" : "var(--muted)" }}>
                              {si + 1}
                            </span>
                            <span className={`text-[11px] leading-snug ${si === 0 ? "text-ink font-medium" : "text-muted"}`}>{step}</span>
                          </div>
                        ))}
                      </div>

                      {/* Risks */}
                      <div className="mt-3.5 pt-3 border-t border-line">
                        <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--neg)" }}>Risks</div>
                        <div className="space-y-1.5">
                          {opp.risks.map((risk, ri) => (
                            <div key={ri} className="flex items-start gap-2">
                              <AlertTri size={10} strokeWidth={2} className="shrink-0 mt-0.5" style={{ color: "var(--neg)" }} />
                              <span className="text-[10.5px] text-ink-2 leading-snug">{risk}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Timeline + Comparables */}
                    <div className="px-4 py-3.5" style={{ background: "var(--bg)" }}>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-2 mb-2.5">Deal Timeline</div>
                      <div className="space-y-1">
                        {opp.milestones.map((ms, mi) => (
                          <div key={mi} className="flex items-center gap-2 py-0.5">
                            {ms.done ? (
                              <CheckCircle2 size={12} strokeWidth={2} style={{ color: "var(--pos)" }} />
                            ) : (
                              <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: mi === opp.milestones.findIndex(m => !m.done) ? g1 : "var(--line)" }} />
                            )}
                            <span className={`text-[10.5px] flex-1 ${ms.done ? "text-muted line-through" : mi === opp.milestones.findIndex(m => !m.done) ? "text-ink font-medium" : "text-muted"}`}>
                              {ms.label}
                            </span>
                            <span className="text-[9px] font-mono tnum text-muted-2 shrink-0">{fmtDate(ms.date)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Comparables */}
                      <div className="mt-3.5 pt-3 border-t border-line">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-2 mb-2">Comparable Wins</div>
                        <div className="space-y-1.5">
                          {opp.comparables.map((c, ci) => (
                            <div key={ci} className="flex items-center justify-between">
                              <span className="text-[10.5px] text-ink">{c.account}</span>
                              <div className="flex items-center gap-2 text-[10px] tnum">
                                <span className="font-semibold" style={{ color: "var(--pos)" }}>{fmtMoney(c.arr)}</span>
                                <span className="text-muted">{c.daysToClose}d</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-[10px] text-muted">
                          Avg close: <strong className="text-ink">{Math.round(opp.comparables.reduce((s, c) => s + c.daysToClose, 0) / opp.comparables.length)}d</strong>
                          <span className="mx-1 text-muted-2">·</span>
                          Avg ARR: <strong className="text-ink">{fmtMoney(Math.round(opp.comparables.reduce((s, c) => s + c.arr, 0) / opp.comparables.length))}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA footer */}
                  <div className="px-5 py-3 border-t border-line flex items-center gap-3" style={{ background: "var(--bg)" }}>
                    <Link href={`/accounts/${opp.accountSlug}`}
                      className="inline-flex items-center gap-2 text-[11px] font-semibold px-4 py-2 rounded-lg transition-all duration-200 hover:brightness-110"
                      style={{ background: g1, color: "#fff" }}>
                      Open Account <ExternalLink size={11} strokeWidth={2} />
                    </Link>
                    <span className="text-[10px] text-muted">
                      {opp.daysInStage}d in {STAGE_LABEL[opp.stage]}
                      <span className="mx-1.5 text-muted-2">·</span>
                      Target close {fmtDate(opp.closeDate)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
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
    <section className="card p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg grid place-items-center" style={{ background: "var(--pos-soft)" }}>
            <Heart size={13} strokeWidth={1.8} style={{ color: "var(--pos)" }} />
          </div>
          <div className="mono-label" style={{ color: "var(--pos)" }}>portfolio health</div>
        </div>
        <div className="text-[11.5px] text-muted [&_strong]:tnum [&_strong]:text-ink [&_strong]:font-semibold">
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
    <section className="card p-5 mb-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <Header eyebrow={eyebrow} tone="var(--info)" Icon={Activity} />
        <div className="text-[11.5px] text-muted [&_strong]:tnum [&_strong]:text-ink [&_strong]:font-semibold">
          {summary}
        </div>
      </div>
      <div className={`grid gap-3 ${stats.length === 5 ? "grid-cols-2 md:grid-cols-5" : "grid-cols-2 md:grid-cols-4"}`}>
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

  const points = sparkline(prev, value);

  return (
    <div className="rounded-xl border border-line p-3.5 flex items-center gap-3" style={{ background: "var(--surface)" }}>
      <div className="w-9 h-9 rounded-lg grid place-items-center shrink-0" style={{ background: "var(--bg-deep)" }}>
        <Icon size={15} strokeWidth={1.7} style={{ color: accent }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[22px] font-bold text-ink tnum leading-none">{value}</span>
          <span
            className="inline-flex items-center gap-0.5 text-[10px] font-mono font-semibold tnum"
            style={{ color: trendColor }}
          >
            <TrendIcon size={9} strokeWidth={2.5} />
            {direction === "flat" ? "—" : `${trendPct >= 0 ? "+" : ""}${trendPct}%`}
          </span>
        </div>
        <div className="text-[11px] text-muted truncate leading-tight mt-1">{label}</div>
      </div>
      <svg width={40} height={20} className="shrink-0" aria-hidden>
        <polyline
          points={points}
          fill="none"
          stroke={accent}
          strokeWidth={1.4}
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
  const w = 40, h = 20, n = 7;
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

