"use client";

import { useState } from "react";
import { Users, AlertTriangle, Calendar, Activity, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { csmWorkloads, fmtMoney, type CSMWorkload } from "@/lib/mock";

function workloadColor(score: number): string {
  if (score >= 75) return "var(--neg)";
  if (score >= 50) return "var(--warn)";
  return "var(--pos)";
}

export default function CapacityPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const totalCSMs = csmWorkloads.length;
  const avgWorkload = Math.round(csmWorkloads.reduce((s, c) => s + c.workloadScore, 0) / totalCSMs);
  const atRiskAccounts = csmWorkloads.reduce((s, c) => s + c.healthMix.atRisk, 0);
  const renewals90 = csmWorkloads.reduce((s, c) => s + c.renewalsNext90, 0);

  const weeks = ["W1", "W2", "W3", "W4", "W5", "W6"];

  return (
    <AppShell>
      <div className="mb-5">
        <div className="mono-label mb-1.5">Capacity</div>
        <h1 className="display" style={{ fontSize: 22 }}>CSM Workload Planning</h1>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <KPI label="Total CSMs" value={String(totalCSMs)} icon={<Users size={14} />} />
        <KPI label="Avg Workload" value={`${avgWorkload}%`} icon={<Activity size={14} />} color={workloadColor(avgWorkload)} />
        <KPI label="At-Risk Accounts" value={String(atRiskAccounts)} icon={<AlertTriangle size={14} />} color="var(--neg)" />
        <KPI label="Renewals Next 90d" value={String(renewals90)} icon={<Calendar size={14} />} />
      </div>

      {/* Workload Heatmap */}
      <div className="card p-5 mb-5">
        <div className="mono-label mb-4">Workload Heatmap</div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left px-3 py-2 text-[10.5px] font-semibold text-muted uppercase w-32">CSM</th>
                {weeks.map((w) => (
                  <th key={w} className="text-center px-2 py-2 text-[10.5px] font-semibold text-muted uppercase">{w}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csmWorkloads.map((csm) => (
                <tr key={csm.id} className="border-t border-line/50">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full grid place-items-center text-[9px] font-semibold shrink-0"
                        style={{ background: "var(--bg-deep)" }}>{csm.initials}</span>
                      <span className="text-[12px] font-medium text-ink">{csm.name}</span>
                    </div>
                  </td>
                  {csm.weeklyHeatmap.map((score, i) => (
                    <td key={i} className="px-2 py-2.5 text-center">
                      <span
                        className="inline-block w-8 h-8 rounded-lg grid place-items-center text-[10px] font-mono font-bold text-white"
                        style={{ background: workloadColor(score), opacity: 0.85 }}
                      >
                        {score}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-line text-[10px] text-muted">
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "var(--pos)" }} />&lt;50 Light</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "var(--warn)" }} />50-75 Moderate</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "var(--neg)" }} />&gt;75 Overloaded</span>
        </div>
      </div>

      {/* CSM Roster */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-deep border-b border-line">
              {["CSM", "Accounts", "ARR", "Health", "Renewals 90d", "Workload", ""].map((h) => (
                <th key={h} className="text-left px-3 py-2 text-[10.5px] font-semibold text-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {csmWorkloads.map((csm) => (
              <tr key={csm.id} className="border-b border-line hover:bg-surface-2 cursor-pointer"
                onClick={() => setExpanded(expanded === csm.id ? null : csm.id)}>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full grid place-items-center text-[9px] font-semibold"
                      style={{ background: "var(--bg-deep)" }}>{csm.initials}</span>
                    <span className="text-[12.5px] font-semibold text-ink">{csm.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-[12px] font-mono tnum text-ink">{csm.accounts}</td>
                <td className="px-3 py-2.5 text-[12px] font-mono tnum text-ink">{fmtMoney(csm.totalArr)}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1">
                    {Array(csm.healthMix.healthy).fill(0).map((_, i) => <span key={`h${i}`} className="w-2 h-2 rounded-full" style={{ background: "var(--pos)" }} />)}
                    {Array(csm.healthMix.watch).fill(0).map((_, i) => <span key={`w${i}`} className="w-2 h-2 rounded-full" style={{ background: "var(--warn)" }} />)}
                    {Array(csm.healthMix.atRisk).fill(0).map((_, i) => <span key={`r${i}`} className="w-2 h-2 rounded-full" style={{ background: "var(--neg)" }} />)}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-[12px] font-mono tnum text-ink">{csm.renewalsNext90}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-deep)" }}>
                      <div className="h-full rounded-full" style={{ width: `${csm.workloadScore}%`, background: workloadColor(csm.workloadScore) }} />
                    </div>
                    <span className="text-[11px] font-mono tnum" style={{ color: workloadColor(csm.workloadScore) }}>{csm.workloadScore}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <ChevronRight size={12} className={`text-muted transition-transform ${expanded === csm.id ? "rotate-90" : ""}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

function KPI({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color?: string }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="opacity-60" style={{ color: color ?? "var(--muted)" }}>{icon}</span>
        <span className="text-[10.5px] font-mono uppercase text-muted">{label}</span>
      </div>
      <div className="text-[22px] font-bold tnum text-ink">{value}</div>
    </div>
  );
}
