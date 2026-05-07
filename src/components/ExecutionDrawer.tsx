"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  X, Check, ArrowRight, Send, Calendar, Clock, Crown, Zap, FileText,
  TrendingUp, Mail, Sparkles, ChevronRight, Activity, Users, Database,
  ShieldCheck, AlertTriangle, Phone, MessageSquare, Pencil, Trash2,
  CheckSquare, Square, Paperclip, Inbox, RefreshCw,
} from "lucide-react";
import { Logo } from "./Logo";

const ACCENT = "#266DF0";

type Phase = "running" | "settling" | "review" | "sending" | "done";

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
  /** When true, after running steps the drawer shows a review screen
   *  (rendered via renderReview) with explicit Approve/Discard CTAs.
   *  When false (default), the flow lands straight on finalState. */
  requiresApproval?: boolean;
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
  const [phase, setPhase] = useState<Phase>("running");
  const stepStartRef = useRef<number>(0);

  // Multiplier on every step duration so the flow feels deliberate, not rushed.
  // Tune up/down here without touching individual flows.
  const PACING = 1.55;
  // Settle pause after the last step before transitioning into review or done.
  const SETTLE_MS = 750;
  // "Sending" pause after user approves before showing success state.
  const SENDING_MS = 1100;

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
    if (phase === "done" || phase === "review") return;
    if (phase === "sending") {
      const t = setTimeout(() => setPhase("done"), SENDING_MS);
      return () => clearTimeout(t);
    }
    if (phase === "settling") {
      const t = setTimeout(() => {
        setPhase(flow.requiresApproval ? "review" : "done");
      }, SETTLE_MS);
      return () => clearTimeout(t);
    }
    if (stepIdx >= flow.steps.length) {
      setPhase("settling");
      return;
    }
    const step = flow.steps[stepIdx];
    const t = setTimeout(() => {
      setStepIdx((i) => i + 1);
    }, Math.round(step.duration * PACING));
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
  const progress =
    phase === "done" || phase === "settling" || phase === "review" || phase === "sending"
      ? 100
      : Math.round((stepIdx / totalSteps) * 100);

  // Review/approval state — only used when flow.requiresApproval is true.
  const isCompact = phase === "review" || phase === "sending" || phase === "done";

  return (
    <>
      <div className="fixed inset-0 bg-ink/30 z-[80] fade-in" onClick={onClose} />
      <aside className="fixed top-0 right-0 h-screen w-full md:w-[600px] z-[85] flex flex-col drawer-anim"
        style={{
          background: "var(--bg)",
          borderLeft: "1px solid var(--line)",
          boxShadow: "-24px 0 60px -20px rgba(15,18,24,0.18)",
        }}>
        {/* Header */}
        <header className="px-7 py-5 flex items-center justify-between border-b border-line shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl grid place-items-center shrink-0"
              style={{ background: "var(--bg-deep)", border: "1px solid var(--line)" }}>
              <flow.Icon size={15} strokeWidth={1.8} style={{ color: "var(--ink-2)" }} />
            </div>
            <div className="min-w-0">
              <div className="text-[14.5px] font-semibold text-ink truncate"
                style={{ letterSpacing: "-0.01em" }}>
                {config.title ?? flow.title}
              </div>
              <div className="text-[11.5px] text-muted truncate mt-0.5">
                {config.account ? `${config.account} · ` : ""}
                {phase === "review"
                  ? "Review and approve before sending"
                  : phase === "sending"
                  ? "Sending now…"
                  : phase === "done"
                  ? "Done"
                  : flow.subtitle}
              </div>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg grid place-items-center text-muted hover:text-ink hover:bg-bg-deep transition-colors">
            <X size={14} strokeWidth={1.8} />
          </button>
        </header>

        {/* Progress strip — slimmer once we hit review */}
        {!isCompact && (
          <div className="px-7 py-3 border-b border-line shrink-0" style={{ background: "var(--surface)" }}>
            <div className="flex items-center justify-between text-[10.5px] mb-2">
              <span className="font-mono text-muted">
                {phase === "settling"
                  ? "Finalizing…"
                  : `Step ${Math.min(stepIdx + 1, totalSteps)} of ${totalSteps}`}
              </span>
              <span className="font-mono tnum text-muted-2">{progress}%</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-deep)" }}>
              <div className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%`, background: ACCENT }} />
            </div>
          </div>
        )}

        {/* Step list rail — only while running */}
        {!isCompact && (
          <div className="px-7 py-4 border-b border-line shrink-0">
            <ul className="space-y-2">
              {flow.steps.map((s, i) => {
                const done = phase === "settling" || i < stepIdx;
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
                    <span className={`${done ? "text-muted-2" : active ? "text-ink font-medium" : "text-muted-2"} truncate`}>
                      {s.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Body — current step content, review screen, or final state */}
        <div className="flex-1 overflow-y-auto px-7 py-6">
          {phase === "done" ? (
            <FinalState flow={flow} config={config} onClose={onClose} />
          ) : phase === "sending" ? (
            <SendingState flow={flow} config={config} />
          ) : phase === "review" ? (
            <ReviewScreen
              flow={flow}
              config={config}
              onApprove={() => setPhase("sending")}
              onClose={onClose}
            />
          ) : phase === "settling" ? (
            <div className="flex flex-col items-center justify-center py-10 animate-step-fade">
              <div className="w-10 h-10 rounded-full grid place-items-center mb-3"
                style={{ background: "var(--bg-deep)", border: "1px solid var(--line)" }}>
                <span className="w-4 h-4 rounded-full border-2 border-line border-t-ink animate-spin" />
              </div>
              <div className="text-[12.5px] font-medium text-ink">Finalizing</div>
              <div className="text-[11px] text-muted mt-1">
                {flow.requiresApproval ? "Preparing your draft for review…" : "Saving the result and notifying owners…"}
              </div>
            </div>
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
          .drawer-anim { animation: drawerIn 420ms cubic-bezier(0.22, 1, 0.36, 1); }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .fade-in { animation: fadeIn 320ms ease-out; }
          @keyframes stepFade {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-step-fade { animation: stepFade 460ms cubic-bezier(0.22, 1, 0.36, 1); }
        `}</style>
      </aside>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────
// Review screen — shown after all steps complete, before action fires.
// The user must explicitly Approve (or Edit / Discard).
// ─────────────────────────────────────────────────────────────────────
function ReviewScreen({
  flow, config, onApprove, onClose,
}: {
  flow: FlowConfig;
  config: DrawerConfig;
  onApprove: () => void;
  onClose: () => void;
}) {
  // Currently we render a per-flow review for a few flow types and a
  // generic review for everything else with requiresApproval.
  if (config.flow === "email-draft") {
    return <EmailComposerReview config={config} onApprove={onApprove} onDiscard={onClose} />;
  }
  if (config.flow === "recovery-play") {
    return <PlaybookReview config={config} onApprove={onApprove} onDiscard={onClose} />;
  }
  return <GenericReview flow={flow} config={config} onApprove={onApprove} onDiscard={onClose} />;
}

// ─────────────────────────────────────────────────────────────────────
// Sending state — brief animation between approve and done.
// ─────────────────────────────────────────────────────────────────────
function SendingState({ flow, config }: { flow: FlowConfig; config: DrawerConfig }) {
  const verb =
    config.flow === "email-draft" ? "Sending message"
    : config.flow === "recovery-play" ? "Firing playbook"
    : "Submitting";
  return (
    <div className="flex flex-col items-center justify-center py-12 animate-step-fade">
      <div className="relative w-12 h-12 mb-4">
        <span className="absolute inset-0 rounded-full sending-ping"
          style={{ background: ACCENT, opacity: 0.18 }} />
        <span className="absolute inset-0 rounded-full grid place-items-center"
          style={{ background: ACCENT }}>
          <Send size={16} strokeWidth={2.2} className="text-white" />
        </span>
      </div>
      <div className="text-[14px] font-semibold text-ink" style={{ letterSpacing: "-0.01em" }}>
        {verb}
      </div>
      <div className="text-[11.5px] text-muted mt-1">
        This will only take a moment…
      </div>
      <style jsx>{`
        @keyframes sendingPing {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .sending-ping { animation: sendingPing 1100ms ease-out infinite; }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Email composer review — Attio-style, sans-serif, editable.
// ─────────────────────────────────────────────────────────────────────
function EmailComposerReview({
  config, onApprove, onDiscard,
}: {
  config: DrawerConfig;
  onApprove: () => void;
  onDiscard: () => void;
}) {
  const recipient = config.person ?? "Maya Chen";
  const recipientFirst = recipient.split(" ")[0];
  const recipientHandle = recipient.toLowerCase().replace(/\s+/g, ".");
  const accountDomain = (config.account ?? "company")
    .toLowerCase().replace(/[^a-z0-9]+/g, "");

  // Default draft body — plain prose, no monospace.
  const defaultBody = useMemo(() => {
    if (config.flow === "email-draft" && config.account === "Snowflake") {
      return `Hi ${recipientFirst},\n\nWith renewal 47 days out, I want to surface a few things ahead of our next sync. Since James left, you're carrying continuity risk on your own — that isn't fair, and I'd rather flag it now than be surprised later.\n\nI've put together a 10-minute Loom that walks through the value picture so you can share it with whoever picks up his scope. Would 20 minutes this week work to talk through it together?\n\nThanks,\nPragyan`;
    }
    if (config.flow === "email-draft" && config.account === "GitLab") {
      return `Hi ${recipientFirst},\n\nI've put together a one-page snapshot of what's working on your account vs where adoption has slipped — three teams haven't logged in for 30+ days, and I'd rather discuss it now than at the renewal call.\n\nWorth 20 minutes this week to walk through it together?\n\nThanks,\nPragyan`;
    }
    if (config.flow === "email-draft" && config.account === "Akamai") {
      return `Hi ${recipientFirst},\n\nWelcome to the role — I know your QBR is overdue, and I'd love to get on a 30-minute call this week to walk you through where the account stands and what your predecessor and I had been mapping out for Q2.\n\nWould Tuesday or Wednesday afternoon work?\n\nThanks,\nPragyan`;
    }
    return `Hi ${recipientFirst},\n\nQuick note — I want to surface a few things on ${config.account ?? "your account"} before our next sync. Worth a 20-minute call this week to walk through it together?\n\nThanks,\nPragyan`;
  }, [config.flow, config.account, recipientFirst]);

  const defaultSubject = useMemo(() => {
    if (config.account === "Snowflake") return `Ahead of the renewal — quick check-in`;
    if (config.account === "GitLab") return `Adoption snapshot before our renewal call`;
    if (config.account === "Akamai") return `Welcome to the role — let's reset the QBR`;
    return `Quick check-in on ${config.account ?? "your account"}`;
  }, [config.account]);

  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [editing, setEditing] = useState<"none" | "subject" | "body">("none");

  // Sync if config changes (different recipient / account)
  useEffect(() => {
    setSubject(defaultSubject);
    setBody(defaultBody);
  }, [defaultSubject, defaultBody]);

  return (
    <div className="animate-step-fade">
      {/* Confidence chips */}
      <div className="flex items-center gap-1.5 flex-wrap mb-4">
        <span className="inline-flex items-center gap-1 text-[10.5px] font-medium px-2 py-0.5 rounded-md"
          style={{ background: "var(--pos-soft)", color: "var(--pos)" }}>
          <Sparkles size={9} strokeWidth={2.2} />
          Tone match · 94%
        </span>
        <span className="inline-flex items-center gap-1 text-[10.5px] font-medium px-2 py-0.5 rounded-md"
          style={{ background: "var(--bg-deep)", color: "var(--ink-2)" }}>
          <ShieldCheck size={9} strokeWidth={2.2} />
          Facts verified
        </span>
        <span className="inline-flex items-center gap-1 text-[10.5px] font-medium px-2 py-0.5 rounded-md"
          style={{ background: "var(--bg-deep)", color: "var(--ink-2)" }}>
          <Inbox size={9} strokeWidth={2.2} />
          Avg reply 4h
        </span>
      </div>

      {/* Composer card */}
      <div className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
        {/* Headers */}
        <div className="px-5 py-3 grid grid-cols-[60px_1fr] gap-y-2.5 gap-x-3 items-center"
          style={{ borderBottom: "1px solid var(--line)" }}>
          <span className="text-[11px] text-muted-2 font-medium">From</span>
          <div className="flex items-center gap-2 text-[12.5px] text-ink-2 min-w-0">
            <span className="w-5 h-5 rounded-full grid place-items-center text-[8.5px] font-semibold text-white shrink-0"
              style={{ background: "var(--ink)" }}>P</span>
            <span className="truncate">Pragyan Dutta</span>
            <span className="text-muted-2 truncate">&lt;pragyan@alphard.ai&gt;</span>
          </div>

          <span className="text-[11px] text-muted-2 font-medium">To</span>
          <div className="flex items-center gap-1.5 text-[12.5px] min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md max-w-full"
              style={{ background: "var(--accent-soft)", color: "var(--accent-deep)" }}>
              <span className="w-4 h-4 rounded-full grid place-items-center text-[8px] font-semibold text-white shrink-0"
                style={{ background: ACCENT }}>
                {recipient.split(" ").map((n) => n[0]).join("")}
              </span>
              <span className="truncate">{recipient}</span>
              <span className="text-muted-2 truncate hidden sm:inline">·</span>
              <span className="text-muted-2 truncate hidden sm:inline">{recipientHandle}@{accountDomain}.com</span>
            </span>
          </div>

          <span className="text-[11px] text-muted-2 font-medium">Subject</span>
          {editing === "subject" ? (
            <input
              autoFocus
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onBlur={() => setEditing("none")}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); setEditing("none"); } }}
              className="text-[13.5px] font-semibold text-ink bg-transparent outline-none border-b transition-colors"
              style={{ borderColor: ACCENT }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditing("subject")}
              className="text-[13.5px] font-semibold text-ink text-left truncate hover:bg-bg-deep -mx-1 px-1 py-0.5 rounded transition-colors"
              title="Click to edit subject"
            >
              {subject}
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-5 py-4 relative group">
          {editing === "body" ? (
            <textarea
              autoFocus
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onBlur={() => setEditing("none")}
              className="w-full text-[13.5px] text-ink leading-[1.65] bg-transparent outline-none resize-none"
              style={{ minHeight: 240, fontFamily: "inherit" }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditing("body")}
              className="w-full text-left text-[13.5px] text-ink leading-[1.65] whitespace-pre-wrap hover:bg-bg-deep -mx-2 px-2 py-1 rounded transition-colors"
              title="Click to edit body"
            >
              {body}
            </button>
          )}
          {editing === "none" && (
            <span className="absolute top-3 right-3 text-[10px] text-muted-2 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-bg-deep">
              <Pencil size={9} strokeWidth={2.2} /> Click to edit
            </span>
          )}
        </div>

        {/* Attachment row */}
        <div className="px-5 py-3 flex items-center gap-2 text-[11.5px] text-muted"
          style={{ borderTop: "1px solid var(--line)", background: "var(--bg-deep)" }}>
          <Paperclip size={11} strokeWidth={1.8} />
          <span>1 attachment ·</span>
          <span className="text-ink-2 font-medium">ROI-snapshot.pdf</span>
          <span className="text-muted-2">· 142 KB</span>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between gap-2 mt-5">
        <button
          onClick={onDiscard}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-2 rounded-lg text-muted hover:text-ink hover:bg-bg-deep transition-colors">
          <Trash2 size={11} strokeWidth={1.8} /> Discard
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing("body")}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium px-3.5 py-2 rounded-lg transition-colors hover:bg-bg-deep"
            style={{ background: "var(--surface)", color: "var(--ink-2)", border: "1px solid var(--line)" }}>
            <Pencil size={11} strokeWidth={2} /> Edit
          </button>
          <button
            onClick={onApprove}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold px-4 py-2 rounded-lg text-white transition-transform hover:scale-[1.02]"
            style={{ background: "var(--ink)" }}>
            <Send size={11} strokeWidth={2.2} /> Approve & send
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Recovery-play review — checkable steps, user picks what fires.
// ─────────────────────────────────────────────────────────────────────
function PlaybookReview({
  config, onApprove, onDiscard,
}: {
  config: DrawerConfig;
  onApprove: () => void;
  onDiscard: () => void;
}) {
  const acct = config.account ?? "this account";
  const PLAYBOOK = useMemo(() => [
    { id: "p1", label: "Loop in exec sponsor", detail: "Ping VP CS in #cs-escalations" },
    { id: "p2", label: "Schedule emergency check-in", detail: "Calendly invite for this week, 30 min" },
    { id: "p3", label: "Resolve open P0 ticket", detail: `${acct === "Snowflake" ? "WB-318" : "Highest-priority open ticket"} — assign to L2 with SLA` },
    { id: "p4", label: "Re-engage two dormant users", detail: "Personal email from CSM with usage snapshot" },
    { id: "p5", label: "Send 30-day adoption recap", detail: "ROI snapshot + comparable customer wins" },
  ], [acct]);

  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(PLAYBOOK.map((p) => [p.id, true]))
  );
  const enabledCount = Object.values(enabled).filter(Boolean).length;

  return (
    <div className="animate-step-fade">
      <div className="mb-4">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1">
          Recovery playbook
        </div>
        <div className="text-[14.5px] font-semibold text-ink leading-tight"
          style={{ letterSpacing: "-0.01em" }}>
          {enabledCount} of {PLAYBOOK.length} steps will fire on approval
        </div>
        <p className="text-[12px] text-muted leading-relaxed mt-1.5">
          Uncheck any step you'd rather skip. Each one runs in sequence and you'll see status updates on the account page as they complete.
        </p>
      </div>

      <div className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
        {PLAYBOOK.map((p, i) => {
          const on = enabled[p.id];
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setEnabled((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
              className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-bg-deep transition-colors"
              style={{ borderTop: i === 0 ? "none" : "1px solid var(--line)" }}>
              <span className="mt-0.5 shrink-0 w-4 h-4 rounded-md grid place-items-center transition-colors"
                style={{
                  background: on ? ACCENT : "var(--bg)",
                  border: `1px solid ${on ? ACCENT : "var(--line)"}`,
                }}>
                {on && <Check size={10} strokeWidth={3} className="text-white" />}
              </span>
              <div className="flex-1 min-w-0">
                <div className={`text-[13px] ${on ? "font-semibold text-ink" : "font-medium text-muted line-through"}`}>
                  {p.label}
                </div>
                <div className={`text-[11.5px] mt-0.5 leading-snug ${on ? "text-muted" : "text-muted-2"}`}>
                  {p.detail}
                </div>
              </div>
              <span className="text-[10.5px] font-mono text-muted-2 shrink-0 mt-1">
                Step {i + 1}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 mt-5">
        <button
          onClick={onDiscard}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-2 rounded-lg text-muted hover:text-ink hover:bg-bg-deep transition-colors">
          Cancel
        </button>
        <button
          onClick={onApprove}
          disabled={enabledCount === 0}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold px-4 py-2 rounded-lg text-white transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{ background: "var(--ink)" }}>
          <Sparkles size={11} strokeWidth={2.2} />
          Run {enabledCount} step{enabledCount === 1 ? "" : "s"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Generic review — fallback for flows that opt into approval but don't
// have a custom UI. Just shows a summary and Approve/Discard.
// ─────────────────────────────────────────────────────────────────────
function GenericReview({
  flow, config, onApprove, onDiscard,
}: {
  flow: FlowConfig;
  config: DrawerConfig;
  onApprove: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="animate-step-fade">
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1">
        Review
      </div>
      <div className="text-[14.5px] font-semibold text-ink leading-tight mb-2"
        style={{ letterSpacing: "-0.01em" }}>
        Ready to {flow.finalState.primaryLabel.toLowerCase()}
      </div>
      <p className="text-[12.5px] text-muted leading-relaxed mb-5">
        {flow.finalState.body
          .replace("{account}", config.account ?? "this account")
          .replace("{person}", config.person ?? "the team")}
      </p>
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onDiscard}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-2 rounded-lg text-muted hover:text-ink hover:bg-bg-deep transition-colors">
          Cancel
        </button>
        <button
          onClick={onApprove}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold px-4 py-2 rounded-lg text-white transition-transform hover:scale-[1.02]"
          style={{ background: "var(--ink)" }}>
          {flow.finalState.primaryLabel}
        </button>
      </div>
    </div>
  );
}

function FinalState({ flow, config, onClose }: { flow: FlowConfig; config: DrawerConfig; onClose: () => void }) {
  return (
    <div className="text-center max-w-[420px] mx-auto py-8 final-fade">
      <div className="relative w-14 h-14 mx-auto mb-5">
        <div className="absolute inset-0 rounded-full check-ring" style={{ background: "var(--pos-soft)" }} />
        <div className="absolute inset-0 rounded-full grid place-items-center check-pop"
          style={{ background: "var(--pos-soft)" }}>
          <Check size={22} strokeWidth={2.4} style={{ color: "var(--pos)" }} />
        </div>
      </div>
      <h3 className="text-[18px] font-semibold text-ink mb-2" style={{ letterSpacing: "-0.018em" }}>
        {flow.finalState.title}
      </h3>
      <p className="text-[13px] text-muted leading-relaxed mb-6">
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
          className="text-[12.5px] font-semibold px-4 py-2 rounded-lg text-white transition-transform hover:scale-[1.02]"
          style={{ background: "var(--ink)" }}>
          {flow.finalState.primaryLabel}
        </button>
      </div>
      <style jsx>{`
        @keyframes finalFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .final-fade { animation: finalFade 520ms cubic-bezier(0.22, 1, 0.36, 1); }
        @keyframes checkPop {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.06); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .check-pop { animation: checkPop 460ms cubic-bezier(0.22, 1, 0.36, 1); }
        @keyframes checkRing {
          0% { transform: scale(0.6); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .check-ring { animation: checkRing 900ms ease-out 220ms backwards; }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Step content components
// ═══════════════════════════════════════════════════════════════════════

function Counter({ target, label, color = ACCENT, durationMs = 1200 }: { target: number; label: string; color?: string; durationMs?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[20px] font-semibold tnum" style={{ color }}>{val}</span>
      <span className="text-[11px] text-muted">{label}</span>
    </div>
  );
}

function CardSlideIn({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  return (
    <div style={{ animation: `cardIn 480ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms backwards` }}>
      {children}
      <style jsx>{`
        @keyframes cardIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
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

function Typewriter({ text, speed = 26 }: { text: string; speed?: number }) {
  const [out, setOut] = useState("");
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 1;
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

function ScanProgress({ from, to, durationMs = 2400 }: { from: number; to: number; durationMs?: number }) {
  const [v, setV] = useState(from);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [from, to, durationMs]);
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
    title: "Drafting message",
    subtitle: "Pulling context, writing in your voice",
    Icon: Mail,
    requiresApproval: true,
    steps: [
      {
        label: "Reading account context",
        duration: 1300,
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
        label: "Pulling sponsor history",
        duration: 1200,
        render: (c) => (
          <div className="space-y-2.5">
            <div className="text-[13px] font-medium text-ink mb-2">{c.person ?? "Recipient"}</div>
            <CardSlideIn delay={0}>
              <StatusRow Icon={Crown} tone="var(--accent-deep)"
                label="Last meaningful touchpoint 18 days ago"
                sub="Below trigger threshold · re-engagement justified" />
            </CardSlideIn>
            <CardSlideIn delay={140}>
              <StatusRow Icon={Calendar} tone="var(--ink-2)"
                label="Replies within 4h on average"
                sub="Last 6 threads · responsive channel" />
            </CardSlideIn>
            <CardSlideIn delay={280}>
              <StatusRow Icon={MessageSquare} tone="var(--muted)"
                label="Tone match: 94%"
                sub="Modeled from your last 10 sent emails" />
            </CardSlideIn>
          </div>
        ),
      },
      {
        label: "Drafting in your voice",
        duration: 1400,
        render: () => (
          <div className="space-y-3">
            <div className="text-[13px] font-medium text-ink mb-2">Composing</div>
            <div className="rounded-lg p-4 space-y-2"
              style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
              <div className="h-2.5 rounded skeleton" style={{ width: "85%" }} />
              <div className="h-2.5 rounded skeleton" style={{ width: "92%", animationDelay: "150ms" }} />
              <div className="h-2.5 rounded skeleton" style={{ width: "78%", animationDelay: "300ms" }} />
              <div className="h-2.5 rounded skeleton" style={{ width: "60%", animationDelay: "450ms" }} />
            </div>
            <style jsx>{`
              .skeleton {
                background: linear-gradient(90deg, var(--bg-deep) 0%, var(--line) 50%, var(--bg-deep) 100%);
                background-size: 200% 100%;
                animation: shimmer 1400ms ease-in-out infinite;
              }
              @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
            `}</style>
          </div>
        ),
      },
    ],
    finalState: {
      title: "Sent",
      body: "Your message is on its way to {person}. They reply within 4 hours on average — expect a response by tomorrow.",
      primaryLabel: "Done",
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
    title: "Building recovery playbook",
    subtitle: "Diagnosing risk and assembling your next moves",
    Icon: AlertTriangle,
    requiresApproval: true,
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
        label: "Preparing your review",
        duration: 1000,
        render: () => (
          <div className="space-y-2.5">
            <div className="text-[13px] font-medium text-ink mb-2">Final checks</div>
            <CardSlideIn delay={0}>
              <StatusRow Icon={ShieldCheck} tone="var(--pos)" label="No conflicting plays running" sub="Safe to fire on this account" />
            </CardSlideIn>
            <CardSlideIn delay={140}>
              <StatusRow Icon={Users} tone="var(--ink-2)" label="Owner permissions verified" sub="You can fire all 5 steps" />
            </CardSlideIn>
          </div>
        ),
      },
    ],
    finalState: {
      title: "Playbook running",
      body: "Selected steps are firing in sequence. You'll see status dots turn green on the account page as each one completes.",
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
