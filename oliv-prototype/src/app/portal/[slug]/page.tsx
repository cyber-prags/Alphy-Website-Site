"use client";

import { use } from "react";
import { Check, Clock, AlertTriangle, Loader2, Target } from "lucide-react";
import { successPlans, type SuccessMilestone } from "@/lib/mock";
import { AlphardLogo } from "@/components/AlphardLogo";

const STATUS_META: Record<SuccessMilestone["status"], { icon: typeof Check; color: string; label: string }> = {
  completed:     { icon: Check,         color: "#0FC27B", label: "Done" },
  "in-progress": { icon: Loader2,      color: "#538BF3", label: "In Progress" },
  upcoming:      { icon: Clock,         color: "#6b7280", label: "Upcoming" },
  "at-risk":     { icon: AlertTriangle, color: "#ef4444", label: "At Risk" },
};

export default function PortalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const plan = successPlans.find((p) => p.accountSlug === slug);

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Plan not found</h1>
          <p className="text-[#888]">No success plan exists for this account.</p>
        </div>
      </div>
    );
  }

  const completed = plan.milestones.filter((m) => m.status === "completed").length;
  const pct = Math.round((completed / plan.milestones.length) * 100);

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white">
      {/* Header */}
      <header className="border-b border-[#222] px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlphardLogo variant="full" />
          <span className="text-[#555] mx-2">·</span>
          <span className="text-[15px] font-semibold">{plan.accountName}</span>
        </div>
        <span className="text-[12px] text-[#666] font-mono">Success Plan</span>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-10">
        {/* Goals */}
        <section className="mb-10">
          <h2 className="text-[13px] font-mono uppercase tracking-wider text-[#888] mb-4">Shared Goals</h2>
          <div className="space-y-2.5">
            {plan.goals.map((g, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl border border-[#222] bg-[#111]">
                <Target size={14} strokeWidth={1.8} className="mt-0.5 text-[#538BF3] shrink-0" />
                <span className="text-[13.5px] text-[#ddd] leading-relaxed">{g}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Progress */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-mono uppercase tracking-wider text-[#888]">Milestones & Timeline</h2>
            <span className="text-[12px] font-mono text-[#666]">{completed}/{plan.milestones.length} complete</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-[#1a1a1a] mb-6">
            <div className="h-full rounded-full bg-[#266DF0]" style={{ width: `${pct}%` }} />
          </div>

          <div className="space-y-3">
            {plan.milestones.map((m) => {
              const meta = STATUS_META[m.status];
              const Icon = meta.icon;
              return (
                <div key={m.id} className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-[#222] bg-[#111]">
                  <div className="w-8 h-8 rounded-full grid place-items-center shrink-0"
                    style={{ background: `${meta.color}20` }}>
                    <Icon size={14} strokeWidth={2} style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[#eee]">{m.title}</div>
                    <div className="text-[11px] text-[#666] mt-0.5">Due {m.dueDate} · {m.ownerName}</div>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-1 rounded-md shrink-0"
                    style={{ background: `${meta.color}15`, color: meta.color }}>
                    {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#222] px-8 py-4 text-center">
        <span className="text-[11px] text-[#555]">Powered by Alphard</span>
      </footer>
    </div>
  );
}
