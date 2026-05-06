"use client";

import { useState } from "react";
import {
  Mail, Clock, GitBranch, Target, Play, Pause, Plus, ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useToast } from "@/components/Toast";
import { campaigns, type Campaign, type JourneyStep } from "@/lib/mock";

const STATUS_STYLE: Record<Campaign["status"], { bg: string; ink: string }> = {
  active: { bg: "var(--pos-soft)", ink: "var(--pos)" },
  paused: { bg: "var(--warn-soft)", ink: "var(--warn)" },
  draft:  { bg: "var(--bg-deep)", ink: "var(--muted)" },
};

const STEP_ICON: Record<string, typeof Mail> = {
  email: Mail,
  wait: Clock,
  condition: GitBranch,
  goal: Target,
};

export default function CampaignsPage() {
  const toast = useToast();
  const [expanded, setExpanded] = useState<string | null>(campaigns[0].id);

  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const totalEnrolled = campaigns.reduce((s, c) => s + c.enrolled, 0);
  const avgOpen = campaigns.filter((c) => c.metrics.openRate > 0).reduce((s, c) => s + c.metrics.openRate, 0) /
    Math.max(1, campaigns.filter((c) => c.metrics.openRate > 0).length);
  const avgReply = campaigns.filter((c) => c.metrics.replyRate > 0).reduce((s, c) => s + c.metrics.replyRate, 0) /
    Math.max(1, campaigns.filter((c) => c.metrics.replyRate > 0).length);

  return (
    <AppShell>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <div className="mono-label mb-1.5">Campaigns</div>
          <h1 className="display" style={{ fontSize: 22 }}>Journey Orchestration</h1>
        </div>
        <button onClick={() => toast({ tone: "info", title: "New campaign", body: "Campaign builder opens with templates for adoption, expansion, onboarding, and re-engagement." })}
          className="h-8 px-4 rounded-lg text-[12px] font-semibold inline-flex items-center gap-1.5"
          style={{ background: "var(--accent)", color: "var(--bg)" }}>
          <Plus size={12} strokeWidth={2} /> New Campaign
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <KPI label="Active Campaigns" value={String(activeCampaigns)} />
        <KPI label="Total Enrolled" value={String(totalEnrolled)} />
        <KPI label="Avg Open Rate" value={`${Math.round(avgOpen)}%`} />
        <KPI label="Avg Reply Rate" value={`${Math.round(avgReply)}%`} />
      </div>

      {/* Campaign cards */}
      <div className="space-y-3">
        {campaigns.map((camp) => {
          const isExpanded = expanded === camp.id;
          const st = STATUS_STYLE[camp.status];
          return (
            <div key={camp.id} className="card overflow-hidden">
              <button
                onClick={() => setExpanded(isExpanded ? null : camp.id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-surface-2 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13.5px] font-semibold text-ink">{camp.name}</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ background: st.bg, color: st.ink }}>
                      {camp.status}
                    </span>
                  </div>
                  {/* Inline step preview */}
                  <div className="flex items-center gap-1">
                    {camp.steps.map((step, i) => {
                      const Icon = STEP_ICON[step.kind];
                      return (
                        <span key={step.id} className="inline-flex items-center">
                          <span className="w-5 h-5 rounded-full grid place-items-center" style={{ background: "var(--bg-deep)" }}>
                            <Icon size={9} strokeWidth={2} className="text-muted" />
                          </span>
                          {i < camp.steps.length - 1 && <span className="w-2 h-px" style={{ background: "var(--line)" }} />}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[12px] font-mono tnum text-ink">{camp.enrolled} enrolled</div>
                  <div className="text-[10.5px] text-muted">{camp.completed} completed</div>
                </div>
                <ChevronRight size={14} className={`text-muted transition-transform ${isExpanded ? "rotate-90" : ""}`} />
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-line pt-4" style={{ background: "var(--bg-deep)" }}>
                  <JourneyCanvas steps={camp.steps} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-[10.5px] font-mono uppercase text-muted mb-1">{label}</div>
      <div className="text-[22px] font-bold tnum text-ink">{value}</div>
    </div>
  );
}

function JourneyCanvas({ steps }: { steps: JourneyStep[] }) {
  return (
    <div className="flex items-start gap-0 overflow-x-auto pb-2">
      {steps.map((step, i) => {
        const Icon = STEP_ICON[step.kind];
        const isLast = i === steps.length - 1;
        return (
          <div key={step.id} className="flex items-start shrink-0">
            <div className="flex flex-col items-center w-24">
              <div
                className="w-10 h-10 rounded-xl grid place-items-center border"
                style={{
                  background: step.kind === "goal" ? "var(--pos-soft)" : "var(--surface)",
                  borderColor: step.kind === "goal" ? "var(--pos)" : "var(--line)",
                }}
              >
                <Icon
                  size={16}
                  strokeWidth={1.6}
                  style={{ color: step.kind === "goal" ? "var(--pos)" : step.kind === "email" ? "var(--accent-ink)" : "var(--muted)" }}
                />
              </div>
              <div className="text-[10px] font-medium text-ink text-center mt-1.5 leading-tight">{step.label}</div>
              {step.metrics && (
                <div className="mt-1.5 space-y-0.5 w-full px-1">
                  {step.metrics.sent !== undefined && <MetricBar label="Sent" value={step.metrics.sent} max={step.metrics.sent} color="var(--muted)" />}
                  {step.metrics.opened !== undefined && <MetricBar label="Open" value={step.metrics.opened} max={step.metrics.sent ?? 1} color="var(--info)" />}
                  {step.metrics.clicked !== undefined && <MetricBar label="Click" value={step.metrics.clicked} max={step.metrics.sent ?? 1} color="var(--accent)" />}
                  {step.metrics.replied !== undefined && <MetricBar label="Reply" value={step.metrics.replied} max={step.metrics.sent ?? 1} color="var(--pos)" />}
                </div>
              )}
            </div>
            {!isLast && (
              <div className="flex items-center h-10 px-0.5">
                <div className="w-4 h-px" style={{ background: "var(--line)" }} />
                <ChevronRight size={10} className="text-muted -ml-1" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MetricBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-1">
      <span className="text-[8px] text-muted w-7 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-deep)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[8px] font-mono tnum text-muted w-4 text-right">{value}</span>
    </div>
  );
}
