"use client";

import { useEffect, useRef, useState } from "react";
import {
  X, Check, ArrowRight, Send, Calendar, Clock, Crown, Zap, FileText,
  TrendingUp, Mail, Sparkles, ChevronRight, Activity, Users, Database,
  ShieldCheck, AlertTriangle, Phone, MessageSquare,
} from "lucide-react";
import { Logo } from "./Logo";

const ACCENT = "#266DF0";

// ═══════════════════════════════════════════════════════════════════════
// EXECUTION DRAWER — animated multi-step flows for any action
// ═══════════════════════════════════════════════════════════════════════
//
// Powers: handoff, email drafting, brief generation, business case prep,
// QBR scheduling, recovery plays, and generic action flows. Each flow
// animates through real-feeling steps (counter increments, card slide-ins,
// typewriter text, progress bars) and lands on a final "result" state
// with action buttons that close the drawer or fire side effects.
//
// Usage:
//   const [open, setOpen] = useState<DrawerConfig | null>(null);
//   <ExecutionDrawer config={open} onClose={() => setOpen(null)} />
//   ...
//   <button onClick={() => setOpen({ flow: "handoff", account: "Cloudflare" })}>...</button>
// ═══════════════════════════════════════════════════════════════════════

export type DrawerFlow =
  | "handoff"
  | "email-draft"
  | "brief"
  | "business-case"
  | "schedule-qbr"
  | "recovery-play"
  | "share-metrics"
  | "build-case"
  | "generic";

export type DrawerConfig = {
  flow: DrawerFlow;
  /** Account context for the flow */
  account?: string;
  /** Person involved (e.g., champion, recipient) */
  person?: string;
  /** Custom title override */
  title?: string;
  /** Custom action label (for generic) */
  actionLabel?: string;
  /** Generic flow custom steps */
  customSteps?: Array<{ label: string; durationMs?: number }>;
  /** Optional handoff target */
  handoffTo?: { name: string; role: "AE" | "AM" | "CSM"; initials: string };
};

type FlowConfig = {
  title: string;
  subtitle: string;
  Icon: any;
  steps: Step[];
  finalState: {
    title: string;
    body: string;
    primaryLabel: string;
    secondaryLabel?: string;
  };
};

type Step = {
  label: string;
  duration: number;
  render: (ctx: DrawerConfig) => React.ReactNode;
};

// ─────────────────────────────────────────────────────────────────────
export function ExecutionDrawer({
  config,
  onClose,
}: {
  config: DrawerConfig | null;
  onClose: () => void;
}) {
  const open = !!config;
  const [stepIdx, setStepIdx] = useState(0);
  const [phase, setPhase] = useState<"running" | "done">("running");
  const stepStartRef = useRef<number>(0);

  // Reset state when drawer opens with a new config
  useEffect(() => {
    if (open) {
      setStepIdx(0);
      setPhase("running");
      stepStartRef.current = Date.now();
    }
  }, [open, config?.flow]);

  // Auto-advance steps
  const flow = config ? FLOWS[config.flow] : null;
  useEffect(() => {
    if (!open || !flow) return;
    if (phase === "done") return;
    if (stepIdx >= flow.steps.length) {
      setPhase("done");
      return;
    }
    const step = flow.steps[stepIdx];
    const t = setTimeout(() => {
      setStepIdx((i) => i + 1);
    }, step.duration);
    return () => clearTimeout(t);
  }, [open, flow, stepIdx, phase]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !config || !flow) return null;

  const totalSteps = flow.steps.length;
  const currentStep = flow.steps[Math.min(stepIdx, totalSteps - 1)];
  const progress = phase === "done" ? 100 : Math.round((stepIdx / totalSteps) * 100);

  return (
    <>
      <div className="fixed inset-0 bg-ink/30 z-[80] fade-in" onClick={onClose} />
      <aside className="fixed top-0 right-0 h-screen w-full md:w-[560px] z-[85] flex flex-col drawer-anim"
        style={{
          background: "var(--bg)",
          borderLeft: "1px solid var(--line)",
          boxShadow: "-24px 0 60px -20px rgba(15,18,24,0.18)",
        }}>
        {/* Header */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-line shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg grid place-items-center shrink-0"
              style={{ background: "var(--bg-deep)", border: "1px solid var(--line)" }}>
              <flow.Icon size={14} strokeWidth={1.8} style={{ color: "var(--ink-2)" }} />
            </div>
            <div className="min-w-0">
              <div className="text-[14px] font-semibold text-ink truncate">{config.title ?? flow.title}</div>
              <div className="text-[11px] text-muted truncate">
                {config.account ? `${config.account} · ` : ""}{flow.subtitle}
              </div>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg grid place-items-center text-muted hover:text-ink hover:bg-bg-deep transition-colors">
            <X size={14} strokeWidth={1.8} />
          </button>
        </header>

        {/* Progress strip */}
        <div className="px-6 py-3 border-b border-line shrink-0" style={{ background: "var(--surface)" }}>
          <div className="flex items-center justify-between text-[10.5px] mb-2">
            <span className="font-mono text-muted">
              {phase === "done"
                ? "Complete"
                : `Step ${Math.min(stepIdx + 1, totalSteps)} of ${totalSteps}`}
            </span>
            <span className="font-mono tnum text-muted-2">{progress}%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-deep)" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: phase === "done" ? "var(--pos)" : ACCENT }} />
          </div>
        </div>

        {/* Step list rail */}
        <div className="px-6 py-4 border-b border-line shrink-0">
          <ul className="space-y-1.5">
            {flow.steps.map((s, i) => {
              const done = phase === "done" || i < stepIdx;
              const active = phase === "running" && i === stepIdx;
              return (
                <li key={i} className="flex items-center gap-2.5 text-[12px]">
                  <span className="w-4 h-4 rounded-full grid place-items-center shrink-0"
                    style={{
                      background: done ? "var(--pos)" : active ? ACCENT : "var(--bg-deep)",
                      border: done || active ? "none" : "1px solid var(--line)",
                    }}>
                    {done ? (
                      <Check size={9} strokeWidth={3} className="text-white" />
                    ) : active ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    ) : null}
                  </span>
                  <span className={`${done ? "text-muted line-through" : active ? "text-ink font-medium" : "text-muted-2"} truncate`}>
                    {s.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Body — current step content or final state */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {phase === "done" ? (
            <FinalState flow={flow} config={config} onClose={onClose} />
          ) : (
            <div key={stepIdx} className="animate-step-fade">
              {currentStep.render(config)}
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes drawerIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          .drawer-anim { animation: drawerIn 320ms cubic-bezier(0.22, 1, 0.36, 1); }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .fade-in { animation: fadeIn 240ms ease-out; }
          @keyframes stepFade {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-step-fade { animation: stepFade 280ms ease-out; }
        `}</style>
      </aside>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
function FinalState({ flow, config, onClose }: { flow: FlowConfig; config: DrawerConfig; onClose: () => void }) {
  return (
    <div className="text-center max-w-[420px] mx-auto py-6">
      <div className="w-12 h-12 rounded-full grid place-items-center mx-auto mb-4"
        style={{ background: "var(--pos-soft)" }}>
        <Check size={20} strokeWidth={2} style={{ color: "var(--pos)" }} />
      </div>
      <h3 className="text-[18px] font-semibold text-ink mb-2" style={{ letterSpacing: "-0.018em" }}>
        {flow.finalState.title}
      </h3>
      <p className="text-[13px] text-muted leading-relaxed mb-5">
        {flow.finalState.body.replace("{account}", config.account ?? "this account")
                              .replace("{person}", config.person ?? "the team")}
      </p>
      <div className="flex items-center justify-center gap-2">
        {flow.finalState.secondaryLabel && (
          <button onClick={onClose}
            className="text-[12.5px] font-medium px-4 py-2 rounded-lg border border-line bg-surface hover:bg-bg-deep text-ink-2 transition-colors">
            {flow.finalState.secondaryLabel}
          </button>
        )}
        <button onClick={onClose}
          className="text-[12.5px] font-semibold px-4 py-2 rounded-lg text-white"
          style={{ background: "var(--ink)" }}>
          {flow.finalState.primaryLabel}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Step content components
// ═══════════════════════════════════════════════════════════════════════

function Counter({ target, label, color = ACCENT }: { target: number; label: string; color?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let i = 0;
    const tick = () => {
      i = Math.min(target, i + Math.max(1, Math.ceil(target / 30)));
      setVal(i);
      if (i < target) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[20px] font-semibold tnum" style={{ color }}>{val}</span>
      <span className="text-[11px] text-muted">{label}</span>
    </div>
  );
}

function CardSlideIn({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  return (
    <div style={{ animation: `cardIn 320ms ease-out ${delay}ms backwards` }}>
      {children}
      <style jsx>{`
        @keyframes cardIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
}

function StatusRow({ Icon, tone, label, sub }: { Icon: any; tone: string; label: string; sub: string }) {
  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
      <div className="w-7 h-7 rounded-md grid place-items-center shrink-0 mt-0.5"
        style={{ background: `color-mix(in srgb, ${tone} 12%, transparent)` }}>
        <Icon size={12} strokeWidth={2} style={{ color: tone }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-medium text-ink leading-tight">{label}</div>
        <div className="text-[11px] text-muted leading-snug mt-0.5">{sub}</div>
      </div>
    </div>
  );
}

function Typewriter({ text, speed = 18 }: { text: string; speed?: number }) {
  const [out, setOut] = useState("");
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return (
    <pre className="text-[12.5px] text-ink-2 leading-relaxed whitespace-pre-wrap font-mono">
      {out}
      <span className="inline-block w-[2px] h-[12px] ml-0.5 align-middle animate-pulse"
        style={{ background: ACCENT }} />
    </pre>
  );
}

function ScanProgress({ from, to }: { from: number; to: number }) {
  const [v, setV] = useState(from);
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / 1500);
      setV(Math.round(from + (to - from) * t));
      if (t >= 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [from, to]);
  return (
    <div>
      <div className="text-[10.5px] text-muted-2 mb-1.5 flex items-center justify-between">
        <span>Scanning</span>
        <span className="font-mono tnum">{v}%</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-deep)" }}>
        <div className="h-full rounded-full transition-all"
          style={{ width: `${v}%`, background: ACCENT }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// FLOWS
// ═══════════════════════════════════════════════════════════════════════

const FLOWS: Record<DrawerFlow, FlowConfig> = {
  // ────── HANDOFF ──────
  handoff: {
    title: "Trigger handoff",
    subtitle: "Packaging account context for the next owner",
    Icon: ArrowRight,
    steps: [
      {
        label: "Compiling account history",
        duration: 1700,
        render: (c) => (
          <div className="space-y-3">
            <div className="text-[13px] font-medium text-ink mb-2">Pulling everything we know</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg px-3 py-3" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                <Counter target={47} label="emails" />
              </div>
              <div className="rounded-lg px-3 py-3" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                <Counter target={12} label="calls" />
              </div>
              <div className="rounded-lg px-3 py-3" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                <Counter target={18} label="signals" />
              </div>
              <div className="rounded-lg px-3 py-3" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                <Counter target={6} label="QBRs" />
              </div>
            </div>
          </div>
        ),
      },
      {
        label: "Packaging stakeholder map",
        duration: 1500,
        render: () => (
          <div className="space-y-2.5">
            <div className="text-[13px] font-medium text-ink mb-2">Champion intel & decision makers</div>
            <CardSlideIn delay={0}>
              <StatusRow Icon={Crown} tone="var(--accent-deep)"
                label="Maya Chen — VP Engineering"
                sub="Promoted Apr 26 · Budget scope Networking + Security · Active" />
            </CardSlideIn>
            <CardSlideIn delay={120}>
              <StatusRow Icon={ShieldCheck} tone="var(--warn)"
                label="Jason Park — Security Ops Lead"
                sub="Required for procurement sign-off · Engaging" />
            </CardSlideIn>
            <CardSlideIn delay={240}>
              <StatusRow Icon={Users} tone="var(--muted)"
                label="284 active end-users"
                sub="WAU/MAU 0.74 · stable for 8 weeks" />
            </CardSlideIn>
          </div>
        ),
      },
      {
        label: "Indexing comparable wins & pricing memory",
        duration: 1400,
        render: () => (
          <div className="space-y-2.5">
            <div className="text-[13px] font-medium text-ink mb-2">Reference deals & past pricing</div>
            <CardSlideIn delay={0}>
              <StatusRow Icon={TrendingUp} tone="var(--pos)"
                label="Databricks — $135K, 28 days"
                sub="Closest comparable · cited in last QBR" />
            </CardSlideIn>
            <CardSlideIn delay={120}>
              <StatusRow Icon={TrendingUp} tone="var(--pos)"
                label="HashiCorp — $110K, 35 days"
                sub="Same buyer profile, same stage" />
            </CardSlideIn>
            <CardSlideIn delay={240}>
              <StatusRow Icon={Database} tone="var(--accent-deep)"
                label="Last expansion at 18% discount"
                sub="Multi-year preferred · noted in pricing memory" />
            </CardSlideIn>
          </div>
        ),
      },
      {
        label: "Notifying next owner",
        duration: 1400,
        render: (c) => (
          <div className="space-y-3">
            <div className="text-[13px] font-medium text-ink mb-2">Sending packaged context</div>
            <div className="rounded-lg p-4" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full grid place-items-center text-[10px] font-semibold text-white"
                  style={{ background: "var(--ink)" }}>
                  {c.handoffTo?.initials ?? "RK"}
                </div>
                <div>
                  <div className="text-[12.5px] font-semibold text-ink">{c.handoffTo?.name ?? "Rachel Kim"}</div>
                  <div className="text-[10.5px] text-muted">{c.handoffTo?.role ?? "CSM"} · receiving baton</div>
                </div>
              </div>
              <div className="text-[11.5px] text-ink-2 leading-relaxed font-mono px-3 py-2.5 rounded"
                style={{ background: "var(--bg-deep)" }}>
                Handing off {c.account ?? "the account"}. Champion Maya Chen just got promoted —
                expansion door is open. Full context dossier attached: 47 emails, 12 calls,
                comparable wins, pricing memory.
              </div>
            </div>
          </div>
        ),
      },
    ],
    finalState: {
      title: "Baton handed off",
      body: "{person} has been notified. The full account context is now part of {account}'s record — nothing leaves with you.",
      primaryLabel: "Done",
    },
  },

  // ────── EMAIL DRAFT ──────
  "email-draft": {
    title: "Drafting follow-up",
    subtitle: "Pulling context, writing in your voice",
    Icon: Mail,
    steps: [
      {
        label: "Reading account context",
        duration: 1200,
        render: () => (
          <div className="space-y-3">
            <div className="text-[13px] font-medium text-ink mb-2">Last 14 days of activity</div>
            <ScanProgress from={0} to={100} />
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="rounded-md px-2.5 py-2" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                <Counter target={8} label="emails" />
              </div>
              <div className="rounded-md px-2.5 py-2" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                <Counter target={3} label="calls" />
              </div>
              <div className="rounded-md px-2.5 py-2" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                <Counter target={5} label="signals" />
              </div>
            </div>
          </div>
        ),
      },
      {
        label: "Pulling champion history",
        duration: 1100,
        render: (c) => (
          <div className="space-y-2.5">
            <div className="text-[13px] font-medium text-ink mb-2">{c.person ?? "Maya Chen"}</div>
            <CardSlideIn delay={0}>
              <StatusRow Icon={Crown} tone="var(--accent-deep)"
                label="Promoted to VP Engineering"
                sub="Apr 26 · Budget now spans Networking + Security" />
            </CardSlideIn>
            <CardSlideIn delay={120}>
              <StatusRow Icon={Calendar} tone="var(--ink-2)"
                label="Last call Apr 18"
                sub="Discussed governance gap · 3 use cases mapped" />
            </CardSlideIn>
            <CardSlideIn delay={240}>
              <StatusRow Icon={MessageSquare} tone="var(--muted)"
                label="Replied within 4h on average"
                sub="Last 6 threads · responsive channel" />
            </CardSlideIn>
          </div>
        ),
      },
      {
        label: "Drafting body in your voice",
        duration: 2400,
        render: (c) => (
          <div>
            <div className="text-[13px] font-medium text-ink mb-2">Draft</div>
            <div className="rounded-lg p-4" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
              <Typewriter text={`Hi ${(c.person ?? "Maya").split(" ")[0]} —\n\nCongrats on the promotion. Wanted to revisit the proposal we sent on May 1. Given your expanded scope into Networking + Security, there's a bundle that would simplify procurement — happy to walk through Tuesday if useful.\n\nFor reference: Databricks closed a similar deal in 28 days at $135K.\n\n— Joe`} />
            </div>
          </div>
        ),
      },
      {
        label: "Ready to send",
        duration: 800,
        render: () => (
          <div className="space-y-3">
            <div className="text-[13px] font-medium text-ink mb-2">Final check</div>
            <div className="space-y-2">
              <StatusRow Icon={Check} tone="var(--pos)" label="Tone matches your last 10 emails" sub="Confidence 94%" />
              <StatusRow Icon={Check} tone="var(--pos)" label="No stale facts" sub="All references verified against CRM" />
              <StatusRow Icon={Check} tone="var(--pos)" label="ROI calc attached" sub="Cloudflare-specific data" />
            </div>
          </div>
        ),
      },
    ],
    finalState: {
      title: "Ready to send",
      body: "Reviewed and personalized for {person}. One click sends, or open in your inbox to tweak.",
      primaryLabel: "Send now",
      secondaryLabel: "Edit first",
    },
  },

  // ────── BRIEF ──────
  brief: {
    title: "Generating brief",
    subtitle: "Pulling everything you need before the call",
    Icon: FileText,
    steps: [
      {
        label: "Gathering account snapshot",
        duration: 1100,
        render: (c) => (
          <div className="space-y-2.5">
            <div className="text-[13px] font-medium text-ink mb-2">{c.account ?? "Account"} at a glance</div>
            <div className="grid grid-cols-2 gap-3">
              <Stat2 label="Health"   value="88/100"  tone="var(--pos)" />
              <Stat2 label="ARR"      value="$720K"   tone="var(--ink)" />
              <Stat2 label="NRR"      value="124%"    tone="var(--pos)" />
              <Stat2 label="Renewal"  value="178d"    tone="var(--ink)" />
            </div>
          </div>
        ),
      },
      {
        label: "Indexing recent activity",
        duration: 1300,
        render: () => (
          <div className="space-y-2.5">
            <div className="text-[13px] font-medium text-ink mb-2">Last 7 days</div>
            <CardSlideIn delay={0}>
              <StatusRow Icon={Activity} tone="var(--accent-deep)"
                label="Maya Chen promoted to VP Eng"
                sub="12h ago" />
            </CardSlideIn>
            <CardSlideIn delay={120}>
              <StatusRow Icon={Zap} tone="var(--pos)"
                label="Hit 92% of Networking plan limits"
                sub="4h ago · third time this quarter" />
            </CardSlideIn>
            <CardSlideIn delay={240}>
              <StatusRow Icon={Phone} tone="var(--muted)"
                label="Q3 expansion budget alignment call"
                sub="Yesterday · sentiment positive" />
            </CardSlideIn>
          </div>
        ),
      },
      {
        label: "Drafting talking points",
        duration: 1600,
        render: () => (
          <div>
            <div className="text-[13px] font-medium text-ink mb-2">Things to bring up</div>
            <div className="rounded-lg p-4" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
              <Typewriter text={`1. Open with congrats on promotion — note Networking + Security scope.\n2. Reference Databricks at $135K in 28d as the closest comparable.\n3. Ask about Jason Park's security review timeline (procurement gating).\n4. Position Networking bundle as procurement simplifier.\n5. Suggest 30-min Tuesday slot for Finance Ops alignment.`} />
            </div>
          </div>
        ),
      },
    ],
    finalState: {
      title: "Brief is ready",
      body: "Snapshot, recent activity, and 5 talking points for your call with {account}. Saved to your scratchpad too.",
      primaryLabel: "Open scratchpad",
      secondaryLabel: "Close",
    },
  },

  // ────── BUSINESS CASE ──────
  "business-case": {
    title: "Building expansion business case",
    subtitle: "Comparable wins, ROI math, ready-to-share deck",
    Icon: TrendingUp,
    steps: [
      {
        label: "Pulling comparable wins",
        duration: 1300,
        render: () => (
          <div className="space-y-2.5">
            <div className="text-[13px] font-medium text-ink mb-2">3 reference deals</div>
            <CardSlideIn delay={0}>
              <StatusRow Icon={TrendingUp} tone="var(--pos)" label="Databricks — $135K · 28d" sub="Same product mix, same stage" />
            </CardSlideIn>
            <CardSlideIn delay={120}>
              <StatusRow Icon={TrendingUp} tone="var(--pos)" label="HashiCorp — $110K · 35d" sub="Same buyer profile" />
            </CardSlideIn>
            <CardSlideIn delay={240}>
              <StatusRow Icon={TrendingUp} tone="var(--pos)" label="Elastic — $95K · 42d" sub="Adjacent industry" />
            </CardSlideIn>
          </div>
        ),
      },
      {
        label: "Modelling ROI",
        duration: 1500,
        render: () => (
          <div>
            <div className="text-[13px] font-medium text-ink mb-2">Numbers</div>
            <div className="rounded-lg p-4 space-y-2" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
              <Row k="Hours saved per AM per week" v="6.5" />
              <Row k="Loaded cost per AM" v="$155K / yr" />
              <Row k="Annual labor saving (12 AMs)" v="$248K" tone="var(--pos)" />
              <Row k="Expected expansion close-rate lift" v="+34%" tone="var(--pos)" />
              <Row k="Payback period" v="< 5 months" tone="var(--pos)" />
            </div>
          </div>
        ),
      },
      {
        label: "Drafting one-pager",
        duration: 1500,
        render: () => (
          <div>
            <div className="text-[13px] font-medium text-ink mb-2">Sections</div>
            <div className="space-y-1.5">
              {["Executive summary", "Today's state", "Proposed expansion", "Comparable wins", "Investment & ROI", "Implementation timeline"].map((s, i) => (
                <CardSlideIn key={s} delay={i * 80}>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-md"
                    style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                    <Check size={11} strokeWidth={2.4} style={{ color: "var(--pos)" }} />
                    <span className="text-[12px] text-ink-2">{s}</span>
                  </div>
                </CardSlideIn>
              ))}
            </div>
          </div>
        ),
      },
    ],
    finalState: {
      title: "Business case ready",
      body: "Six-section one-pager with comparable wins and ROI math, formatted for the {account} exec team.",
      primaryLabel: "Open in deck builder",
      secondaryLabel: "Close",
    },
  },

  // ────── SCHEDULE QBR ──────
  "schedule-qbr": {
    title: "Scheduling next QBR",
    subtitle: "Pulling availability, drafting agenda",
    Icon: Calendar,
    steps: [
      {
        label: "Cross-checking calendars",
        duration: 1100,
        render: () => (
          <div className="space-y-2.5">
            <div className="text-[13px] font-medium text-ink mb-2">Looking for a 60-min slot in next 3 weeks</div>
            <div className="grid grid-cols-3 gap-2">
              {["Wed May 14", "Thu May 22", "Tue May 27"].map((d, i) => (
                <CardSlideIn key={d} delay={i * 100}>
                  <div className="rounded-md px-2.5 py-3 text-center"
                    style={{ background: "var(--surface)", border: i === 1 ? `1.5px solid ${ACCENT}` : "1px solid var(--line)" }}>
                    <div className="text-[11px] text-muted-2 mb-0.5">{i === 1 ? "Top match" : "Available"}</div>
                    <div className="text-[12px] font-semibold text-ink">{d}</div>
                    <div className="text-[10px] text-muted-2 mt-0.5">10:00–11:00 GMT</div>
                  </div>
                </CardSlideIn>
              ))}
            </div>
          </div>
        ),
      },
      {
        label: "Drafting agenda",
        duration: 1800,
        render: () => (
          <div>
            <div className="text-[13px] font-medium text-ink mb-2">Auto-generated from last QBR + recent signals</div>
            <div className="rounded-lg p-4" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
              <Typewriter text={`1. Outcomes since last QBR — what shipped, what slipped\n2. Health & adoption snapshot (NRR 124%, WAU/MAU 0.74)\n3. Champion update — Maya Chen now VP Eng\n4. Q3 expansion proposal — Networking bundle\n5. Procurement path & security review timeline\n6. Asks for next quarter`} />
            </div>
          </div>
        ),
      },
      {
        label: "Sending invites",
        duration: 1100,
        render: (c) => (
          <div className="space-y-2.5">
            <div className="text-[13px] font-medium text-ink mb-2">Attendees</div>
            <CardSlideIn delay={0}>
              <StatusRow Icon={Users} tone="var(--pos)" label="Maya Chen · Champion" sub="maya.chen@cloudflare.com — confirmed" />
            </CardSlideIn>
            <CardSlideIn delay={120}>
              <StatusRow Icon={Users} tone="var(--warn)" label="Jason Park · Security Ops" sub="jason.park@cloudflare.com — pending" />
            </CardSlideIn>
            <CardSlideIn delay={240}>
              <StatusRow Icon={Users} tone="var(--ink-2)" label="You · Account Manager" sub={c.account ?? "you"} />
            </CardSlideIn>
          </div>
        ),
      },
    ],
    finalState: {
      title: "QBR scheduled",
      body: "Thursday May 22, 10:00 GMT. Agenda + dial-in sent to {account}'s team.",
      primaryLabel: "View in calendar",
      secondaryLabel: "Close",
    },
  },

  // ────── RECOVERY PLAY ──────
  "recovery-play": {
    title: "Running recovery play",
    subtitle: "Stabilizing this account before the renewal slips",
    Icon: AlertTriangle,
    steps: [
      {
        label: "Diagnosing why health is dropping",
        duration: 1400,
        render: () => (
          <div className="space-y-2.5">
            <div className="text-[13px] font-medium text-ink mb-2">Top contributors</div>
            <CardSlideIn delay={0}>
              <StatusRow Icon={AlertTriangle} tone="var(--neg)" label="Champion silent 14+ days" sub="Highest signal weight" />
            </CardSlideIn>
            <CardSlideIn delay={120}>
              <StatusRow Icon={Activity} tone="var(--warn)" label="WAU/MAU dropped 8% in last 14d" sub="Two power users went dormant" />
            </CardSlideIn>
            <CardSlideIn delay={240}>
              <StatusRow Icon={Phone} tone="var(--warn)" label="Last meaningful touchpoint 18 days ago" sub="Below trigger threshold" />
            </CardSlideIn>
          </div>
        ),
      },
      {
        label: "Loading recovery playbook",
        duration: 1300,
        render: () => (
          <div>
            <div className="text-[13px] font-medium text-ink mb-2">5-step playbook</div>
            <div className="space-y-1.5">
              {[
                "Escalate to exec sponsor — VP Sales loop",
                "Schedule emergency check-in this week",
                "Resolve open P0 ticket WB-318",
                "Re-engage two dormant power users",
                "Send 30-day adoption recap to champion",
              ].map((s, i) => (
                <CardSlideIn key={s} delay={i * 80}>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-md"
                    style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                    <span className="w-4 h-4 rounded-full grid place-items-center text-[8.5px] font-bold text-white"
                      style={{ background: ACCENT }}>{i + 1}</span>
                    <span className="text-[12px] text-ink-2 flex-1">{s}</span>
                  </div>
                </CardSlideIn>
              ))}
            </div>
          </div>
        ),
      },
      {
        label: "Notifying owners & exec sponsor",
        duration: 1100,
        render: () => (
          <div className="space-y-2.5">
            <div className="text-[13px] font-medium text-ink mb-2">Pings sent</div>
            <CardSlideIn delay={0}>
              <StatusRow Icon={MessageSquare} tone="var(--accent-deep)" label="Slack · #cs-escalations" sub="Tagged VP CS, AE, manager" />
            </CardSlideIn>
            <CardSlideIn delay={120}>
              <StatusRow Icon={Mail} tone="var(--accent-deep)" label="Email draft to Brad Allen (AE)" sub="Loop in for joint check-in" />
            </CardSlideIn>
          </div>
        ),
      },
    ],
    finalState: {
      title: "Recovery play running",
      body: "Step 1 fired. Owners notified. You'll see a status dot turn green on the account once each step completes.",
      primaryLabel: "Watch progress",
      secondaryLabel: "Close",
    },
  },

  // ────── SHARE METRICS ──────
  "share-metrics": {
    title: "Sharing success metrics with champion",
    subtitle: "Quick numbers that justify the next ask",
    Icon: TrendingUp,
    steps: [
      {
        label: "Pulling champion-relevant KPIs",
        duration: 1200,
        render: () => (
          <div className="space-y-2.5">
            <div className="text-[13px] font-medium text-ink mb-2">Last quarter</div>
            <div className="grid grid-cols-2 gap-3">
              <Stat2 label="Tickets resolved"   value="312"     tone="var(--pos)" />
              <Stat2 label="Time saved per AM" value="6.5h/wk" tone="var(--pos)" />
              <Stat2 label="WAU/MAU"            value="0.74"   tone="var(--pos)" />
              <Stat2 label="ROI realized"       value="3.4×"   tone="var(--pos)" />
            </div>
          </div>
        ),
      },
      {
        label: "Drafting summary message",
        duration: 1700,
        render: (c) => (
          <div>
            <div className="text-[13px] font-medium text-ink mb-2">Draft</div>
            <div className="rounded-lg p-4" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
              <Typewriter text={`${(c.person ?? "Maya").split(" ")[0]} — quick recap of last quarter's impact:\n\n• 312 tickets resolved through Alphard\n• 6.5h/week saved per AM\n• WAU/MAU held at 0.74 — top decile\n• 3.4× ROI realized\n\nUseful for your VP Eng update? Happy to format for the deck.`} />
            </div>
          </div>
        ),
      },
    ],
    finalState: {
      title: "Metrics shared",
      body: "Sent to {person}. They've replied 4h on average — expect a response by tomorrow.",
      primaryLabel: "Done",
    },
  },

  // ────── BUILD CASE (alias used by chips) ──────
  "build-case": {
    title: "Building case",
    subtitle: "Auto-curated from signals + comparable wins",
    Icon: FileText,
    steps: [
      {
        label: "Pulling 8 weeks of signals",
        duration: 1300,
        render: () => (
          <div>
            <div className="text-[13px] font-medium text-ink mb-2">What we know</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-md px-2.5 py-2.5" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                <Counter target={18} label="signals" />
              </div>
              <div className="rounded-md px-2.5 py-2.5" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                <Counter target={3} label="champions" />
              </div>
              <div className="rounded-md px-2.5 py-2.5" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                <Counter target={4} label="comparables" />
              </div>
            </div>
          </div>
        ),
      },
      {
        label: "Indexing comparable wins",
        duration: 1100,
        render: () => (
          <div className="space-y-2">
            <CardSlideIn delay={0}><StatusRow Icon={TrendingUp} tone="var(--pos)" label="Databricks · $135K · 28d" sub="Same buyer + product mix" /></CardSlideIn>
            <CardSlideIn delay={120}><StatusRow Icon={TrendingUp} tone="var(--pos)" label="HashiCorp · $110K · 35d" sub="Adjacent vertical" /></CardSlideIn>
          </div>
        ),
      },
      {
        label: "Writing the case",
        duration: 1500,
        render: () => (
          <div className="rounded-lg p-4" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
            <Typewriter text="Opening hook → current ARR baseline → expansion thesis → comparable proof points → ROI calculation → ask & close." />
          </div>
        ),
      },
    ],
    finalState: {
      title: "Case is ready",
      body: "Drafted six-section case for {account}. Edit, send, or push straight into your deck builder.",
      primaryLabel: "Open case",
      secondaryLabel: "Close",
    },
  },

  // ────── GENERIC ──────
  generic: {
    title: "Running action",
    subtitle: "AI co-pilot is on it",
    Icon: Sparkles,
    steps: [
      {
        label: "Loading context",
        duration: 1100,
        render: () => <ScanProgress from={0} to={100} />,
      },
      {
        label: "Drafting next steps",
        duration: 1500,
        render: (c) => (
          <div className="rounded-lg p-4" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
            <Typewriter text={`Action: ${c.title ?? c.actionLabel ?? "executing"}.\nContext: ${c.account ?? "current account"}.\nGenerating recommended next steps based on the latest signals…`} />
          </div>
        ),
      },
      {
        label: "Ready",
        duration: 700,
        render: () => (
          <div className="space-y-2">
            <CardSlideIn delay={0}>
              <StatusRow Icon={Check} tone="var(--pos)" label="3 next steps drafted" sub="Personalized to this account" />
            </CardSlideIn>
            <CardSlideIn delay={120}>
              <StatusRow Icon={Clock} tone="var(--ink-2)" label="ETA to first send: 5 minutes" sub="Manual review built in" />
            </CardSlideIn>
          </div>
        ),
      },
    ],
    finalState: {
      title: "Done",
      body: "We've queued the action. You'll get a notification when {account} responds.",
      primaryLabel: "Done",
    },
  },
};

// ─────────────────────────────────────────────────────────────────────
// Tiny helpers used by step bodies
// ─────────────────────────────────────────────────────────────────────
function Stat2({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-lg px-3 py-2.5" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
      <div className="text-[10px] uppercase tracking-[0.12em] text-muted-2 mb-0.5">{label}</div>
      <div className="text-[16px] font-semibold tnum" style={{ color: tone, letterSpacing: "-0.012em" }}>{value}</div>
    </div>
  );
}

function Row({ k, v, tone = "var(--ink)" }: { k: string; v: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between text-[12px] py-1">
      <span className="text-muted">{k}</span>
      <span className="font-semibold tnum" style={{ color: tone }}>{v}</span>
    </div>
  );
}
