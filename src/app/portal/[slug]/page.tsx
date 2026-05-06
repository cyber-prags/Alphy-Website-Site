"use client";

import { use } from "react";
import { Check, Clock, AlertTriangle, Loader2, Target, MessageSquare, Inbox } from "lucide-react";
import { successPlans, slugify, type SuccessMilestone } from "@/lib/mock";
import { AlphardLogo } from "@/components/AlphardLogo";
import { REQUEST_SEED, REQUEST_STATUS_META, type FeatureRequest } from "@/app/requests/page";

const STATUS_META: Record<SuccessMilestone["status"], { icon: typeof Check; color: string; label: string }> = {
  completed:     { icon: Check,         color: "#0FC27B", label: "Done" },
  "in-progress": { icon: Loader2,      color: "#538BF3", label: "In Progress" },
  upcoming:      { icon: Clock,         color: "#6b7280", label: "Upcoming" },
  "at-risk":     { icon: AlertTriangle, color: "#ef4444", label: "At Risk" },
};

const REQ_STATUS_COLOR: Record<FeatureRequest["status"], string> = {
  "submitted":    "#9CA3AF",
  "under-review": "#538BF3",
  "planned":      "#266DF0",
  "in-progress":  "#F5B900",
  "shipped":      "#0FC27B",
  "wont-do":      "#EF4444",
};

const REQ_STATUS_BLURB: Record<FeatureRequest["status"], string> = {
  "submitted":    "We've logged this with product. You'll hear back from us when it's reviewed.",
  "under-review": "Product is evaluating this against the roadmap. Decision coming soon.",
  "planned":      "On the roadmap. We'll share a target ship window.",
  "in-progress":  "Engineering is actively building this.",
  "shipped":      "Live in production. Thanks for the ask.",
  "wont-do":      "We've decided not to build this. The reason is in the comments.",
};

export default function PortalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const plan = successPlans.find((p) => p.accountSlug === slug);
  const accountName = plan?.accountName ?? "Account";

  // Pull requests for this account by name match (requests use full account name)
  const accountRequests = REQUEST_SEED.filter((r) => slugify(r.account) === slug);
  // Sort: in-progress + planned first, then submitted/under-review, then shipped/won't-do
  const order: FeatureRequest["status"][] = ["in-progress", "planned", "under-review", "submitted", "shipped", "wont-do"];
  accountRequests.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));

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
          <AlphardLogo variant="full" fill="#fff" />
          <span className="text-[#555] mx-2">·</span>
          <span className="text-[15px] font-semibold">{plan.accountName}</span>
        </div>
        <span className="text-[12px] text-[#666] font-mono">Customer Portal</span>
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

        {/* Your requests — closure tracking visible to the customer */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-[13px] font-mono uppercase tracking-wider text-[#888]">Your requests</h2>
            </div>
            <span className="text-[12px] font-mono text-[#666]">
              {accountRequests.length === 0 ? "None yet" : `${accountRequests.length} tracked`}
            </span>
          </div>
          <p className="text-[12px] text-[#888] mb-4 leading-relaxed">
            Things you've asked us to build. We'll update each one as it moves through review,
            roadmap, build, and ship — so you never have to chase.
          </p>

          {accountRequests.length === 0 ? (
            <div className="px-5 py-8 rounded-xl border border-dashed border-[#222] bg-[#0f0f0f] text-center">
              <Inbox size={18} strokeWidth={1.6} className="mx-auto text-[#444] mb-2" />
              <div className="text-[13px] text-[#aaa]">Nothing logged yet.</div>
              <div className="text-[11.5px] text-[#666] mt-1">
                When you flag a feature request to your AM, it'll appear here with status updates.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {accountRequests.map((r) => {
                const color = REQ_STATUS_COLOR[r.status];
                const label = REQUEST_STATUS_META[r.status].label;
                const blurb = REQ_STATUS_BLURB[r.status];
                const lastComment = r.comments[r.comments.length - 1];
                return (
                  <div key={r.id} className="rounded-xl border border-[#222] bg-[#111] p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-semibold text-[#eee] leading-snug">{r.title}</div>
                        <div className="text-[11px] text-[#777] mt-1">
                          Submitted {new Date(r.capturedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          {r.customerContact && <span> · by {r.customerContact.split(" · ")[0]}</span>}
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase px-2 py-1 rounded-md shrink-0"
                        style={{ background: `${color}18`, color }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                        {label}
                      </span>
                    </div>

                    {/* Status pipeline */}
                    <div className="flex items-center gap-1 mt-3 mb-3">
                      {(["submitted", "under-review", "planned", "in-progress", "shipped"] as const).map((s, idx, arr) => {
                        const stageOrder = ["submitted", "under-review", "planned", "in-progress", "shipped"];
                        const currentIdx = stageOrder.indexOf(r.status);
                        const stepIdx = stageOrder.indexOf(s);
                        const isPast = stepIdx <= currentIdx;
                        const isCurrent = stepIdx === currentIdx;
                        const stepColor = isPast ? color : "#2a2a2a";
                        return (
                          <div key={s} className="flex items-center gap-1 flex-1 last:flex-none">
                            <div className={`h-1 rounded-full flex-1 ${isCurrent ? "" : ""}`}
                              style={{ background: stepColor, opacity: isPast ? 1 : 0.4 }} />
                            {idx === arr.length - 1 && (
                              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: stepColor, opacity: isPast ? 1 : 0.3 }} />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-[12px] text-[#bbb] leading-relaxed">{blurb}</div>

                    {lastComment && (
                      <div className="mt-3 pt-3 border-t border-[#1f1f1f] flex items-start gap-2 text-[11.5px]">
                        <MessageSquare size={11} strokeWidth={2} className="text-[#555] mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[#888]">
                            <span className="font-semibold text-[#bbb]">{lastComment.by}</span>
                            <span className="mx-1.5">·</span>
                            {new Date(lastComment.at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </div>
                          <div className="text-[#aaa] mt-0.5 leading-relaxed">{lastComment.text}</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#222] px-8 py-4 text-center">
        <span className="text-[11px] text-[#555]">Powered by Alphard</span>
      </footer>
    </div>
  );
}
