"use client";

import { useState } from "react";
import {
  Check, Clock, AlertTriangle, Loader2, Plus, Share2, Target,
} from "lucide-react";
import { type SuccessPlan, type SuccessMilestone } from "@/lib/mock";
import { useToast } from "./Toast";

const STATUS_META: Record<SuccessMilestone["status"], { icon: typeof Check; color: string; label: string }> = {
  completed:    { icon: Check,          color: "var(--pos)",    label: "Done" },
  "in-progress": { icon: Loader2,       color: "var(--accent)", label: "In Progress" },
  upcoming:     { icon: Clock,          color: "var(--muted)",  label: "Upcoming" },
  "at-risk":    { icon: AlertTriangle,  color: "var(--neg)",    label: "At Risk" },
};

export function SuccessPlanBuilder({ plan }: { plan: SuccessPlan }) {
  const toast = useToast();
  const [milestones, setMilestones] = useState(plan.milestones);

  const completed = milestones.filter((m) => m.status === "completed").length;
  const pct = Math.round((completed / milestones.length) * 100);

  return (
    <div className="card p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg grid place-items-center" style={{ background: "var(--accent-soft)" }}>
            <Target size={13} strokeWidth={1.8} style={{ color: "var(--accent-ink)" }} />
          </div>
          <div>
            <div className="mono-label" style={{ color: "var(--accent-ink)" }}>success plan</div>
            <div className="text-[10.5px] text-muted">Updated {plan.lastUpdated}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {plan.sharedWithCustomer && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-pos-soft text-pos font-medium inline-flex items-center gap-1">
              <Share2 size={9} /> Shared
            </span>
          )}
          <button
            onClick={() => toast({ tone: "success", title: "Portal link copied", body: `/portal/${plan.accountSlug}` })}
            className="text-[11px] font-medium h-7 px-2.5 rounded-md border border-line hover:bg-bg-deep inline-flex items-center gap-1.5"
          >
            <Share2 size={10} strokeWidth={2} /> Share
          </button>
        </div>
      </div>

      {/* Goals */}
      <div className="mb-4">
        <div className="text-[11px] font-mono uppercase text-muted mb-2">Goals</div>
        <ul className="space-y-1.5">
          {plan.goals.map((g, i) => (
            <li key={i} className="flex items-start gap-2 text-[12px] text-ink-2">
              <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "var(--accent)" }} />
              {g}
            </li>
          ))}
        </ul>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-deep)" }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--pos)" }} />
        </div>
        <span className="text-[10.5px] font-mono tnum text-muted">{completed}/{milestones.length}</span>
      </div>

      {/* Milestones */}
      <div className="space-y-2">
        {milestones.map((m) => {
          const meta = STATUS_META[m.status];
          const Icon = meta.icon;
          return (
            <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-line">
              <div className="w-6 h-6 rounded-full grid place-items-center shrink-0"
                style={{ background: `color-mix(in srgb, ${meta.color} 15%, transparent)` }}>
                <Icon size={12} strokeWidth={2} style={{ color: meta.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-ink truncate">{m.title}</div>
                <div className="text-[10px] text-muted">Due {m.dueDate} · {m.ownerName}</div>
              </div>
              <span className="text-[9.5px] font-mono uppercase px-1.5 py-0.5 rounded"
                style={{ background: `color-mix(in srgb, ${meta.color} 15%, transparent)`, color: meta.color }}>
                {meta.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
