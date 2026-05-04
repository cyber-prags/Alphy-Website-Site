"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Sparkles, Send, Check, Calendar, Mail, MessageSquare, FileText } from "lucide-react";
import { Logo } from "./Logo";
import { useToast } from "./Toast";

export type QuickActionKind = "email" | "case" | "qbr" | "escalation" | "approve" | "drilldown" | "note";

type Props = {
  open: boolean;
  kind: QuickActionKind;
  account: string;
  context: string;          // headline of the queue item
  onClose: () => void;
  onComplete: () => void;
};

const TITLE: Record<QuickActionKind, string> = {
  email:      "Draft re-engagement email",
  case:       "Build expansion case",
  qbr:        "Schedule QBR",
  escalation: "Run escalation playbook",
  approve:    "Approve & send",
  drilldown:  "Open usage drill-down",
  note:       "Add a note",
};

const ICON: Record<QuickActionKind, typeof Mail> = {
  email: Mail, case: FileText, qbr: Calendar, escalation: Sparkles, approve: Check, drilldown: MessageSquare, note: FileText,
};

export function QuickActionModal({ open, kind, account, context, onClose, onComplete }: Props) {
  const toast = useToast();
  const Icon = ICON[kind];

  // Per-kind body — generated draft based on context
  const draft = useMemo(() => generateDraft(kind, account, context), [kind, account, context]);
  const [body, setBody] = useState(draft);
  const [stepsRun, setStepsRun] = useState<string[]>([]);
  const [building, setBuilding] = useState(false);

  useEffect(() => {
    if (!open) return;
    setBody(draft);
    setStepsRun([]);
    setBuilding(true);
    const steps = STEPS_FOR[kind];
    let i = 0;
    const id = setInterval(() => {
      setStepsRun((s) => [...s, steps[i]]);
      i++;
      if (i >= steps.length) { clearInterval(id); setBuilding(false); }
    }, 380);
    return () => clearInterval(id);
  }, [open, kind, draft]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const send = () => {
    toast({ tone: "success", title: SUCCESS_LABEL[kind], body: SUCCESS_BODY[kind].replace("{account}", account) });
    onComplete();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-ink/40 z-[100] fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-[110] grid place-items-center p-6 pointer-events-none">
        <div className="card pointer-events-auto fade-in flex flex-col" style={{ width: "min(640px, 92vw)", maxHeight: "90vh" }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-line">
            <div className="flex items-center gap-3">
              <Logo name={account} size={28} rounded={6} />
              <div>
                <div className="text-[14px] font-semibold text-ink">{TITLE[kind]}</div>
                <div className="text-[11.5px] text-muted">{account} · {context}</div>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg grid place-items-center text-muted hover:text-ink hover:bg-bg-deep">
              <X size={14} strokeWidth={1.6} />
            </button>
          </div>

          <div className="px-5 py-4 overflow-y-auto flex-1">
            {/* Build steps */}
            <div className="recessed p-3 mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles size={11} strokeWidth={1.8} style={{ color: "var(--accent-deep)" }} />
                <span className="text-[11px] font-semibold text-ink">Alphy is preparing your draft</span>
              </div>
              <div className="space-y-1">
                {STEPS_FOR[kind].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11.5px]"
                    style={{ opacity: stepsRun.length > i ? 1 : 0.35 }}>
                    {stepsRun.length > i
                      ? <Check size={10} strokeWidth={2} style={{ color: "var(--pos)" }} />
                      : <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--bg-deep)", border: "1px solid var(--line)" }} />}
                    <span className={stepsRun.length > i ? "text-ink-2" : "text-muted-2"}>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form-specific body */}
            {(kind === "email" || kind === "approve") && (
              <>
                <FieldLabel>To</FieldLabel>
                <ReadonlyValue>{getRecipient(account, kind)}</ReadonlyValue>

                <FieldLabel>Subject</FieldLabel>
                <ReadonlyValue>{SUBJECT_FOR[kind].replace("{account}", account)}</ReadonlyValue>

                <FieldLabel>Body</FieldLabel>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={9}
                  className="w-full border border-line rounded-md bg-surface p-3 text-[12.5px] text-ink-2 leading-relaxed outline-none focus:border-[color:var(--accent-deep)]"
                />
              </>
            )}

            {kind === "case" && (
              <>
                <FieldLabel>Hypothesis</FieldLabel>
                <ReadonlyValue>{`Champion's promotion + adjacent BU adoption gap → expansion play. Pattern matches 3 prior conversions averaging $182K.`}</ReadonlyValue>
                <FieldLabel>Estimated ARR uplift</FieldLabel>
                <ReadonlyValue>{`$180K within 2 quarters · confidence: High`}</ReadonlyValue>
                <FieldLabel>Suggested next step</FieldLabel>
                <ReadonlyValue>{`30-min cross-BU intro this week with the champion.`}</ReadonlyValue>
              </>
            )}

            {kind === "qbr" && (
              <>
                <FieldLabel>Recommended date</FieldLabel>
                <ReadonlyValue>{`Next Tuesday 2:00 PM — sponsor + economic buyer + champion all available.`}</ReadonlyValue>
                <FieldLabel>Auto-attached deck</FieldLabel>
                <ReadonlyValue>{`Quarterly Business Review (QBR) · auto-built from latest signals.`}</ReadonlyValue>
                <FieldLabel>Attendees</FieldLabel>
                <ReadonlyValue>{`Champion (You), Sponsor (You), Owner: ${getOwner(account)}.`}</ReadonlyValue>
              </>
            )}

            {kind === "escalation" && (
              <>
                <FieldLabel>Severity</FieldLabel>
                <ReadonlyValue>P0 — sponsor departed, annotation throughput down 18%.</ReadonlyValue>
                <FieldLabel>Playbook</FieldLabel>
                <ReadonlyValue>1. Loop in exec sponsor · 2. Schedule emergency QBR · 3. Identify replacement champion.</ReadonlyValue>
                <FieldLabel>Owners</FieldLabel>
                <ReadonlyValue>You (lead) + Adriana Smith (executive sponsor)</ReadonlyValue>
              </>
            )}

            {kind === "drilldown" && (
              <>
                <FieldLabel>Drill-down view</FieldLabel>
                <ReadonlyValue>WAU/MAU 0.62 → 0.48 over 14 days. Three teams stopped using AI features.</ReadonlyValue>
                <FieldLabel>Affected cohorts</FieldLabel>
                <ReadonlyValue>Marketing (12 → 4 active), CX (9 → 3), Eng-Ops (8 → 1).</ReadonlyValue>
              </>
            )}
          </div>

          <div className="px-5 py-3 border-t border-line flex items-center justify-end gap-2">
            <button onClick={onClose}
              className="text-[12px] font-medium h-8 px-3 rounded-md border border-line bg-surface text-ink-2 hover:bg-bg-deep">
              Cancel
            </button>
            <button onClick={send} disabled={building}
              className="text-[12px] font-medium h-8 px-3 rounded-md inline-flex items-center gap-1.5 disabled:opacity-50"
              style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
              <Icon size={12} strokeWidth={1.8} />
              {ACTION_LABEL[kind]}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ----------------------------------------------------------------------
// Templates
// ----------------------------------------------------------------------
function generateDraft(kind: QuickActionKind, account: string, context: string): string {
  if (kind === "email") {
    return `Hi ${getRecipientFirstName(account)},

I noticed it's been a couple of weeks since we last connected, and I wanted to circle back rather than let things drift.

A few things on my side that I think are worth your time:

  · We've shipped two of the items you flagged in March
  · I have a draft of the ROI report that should make next steps easier
  · Renewal is in ${getRenewalDays(account)} days and I'd love a 20-minute call before then

Pasting a Calendly below or happy to follow your team's preference.

— Walid`;
  }
  if (kind === "approve") {
    return `Welcome to the team! I wanted to send a quick intro and walk you through what your colleagues are getting out of Alphard so far.

A few resources that should help you get started:
  · Our shared playbook (link)
  · 20-min walkthrough scheduled for this Thursday
  · Direct line to me if anything's unclear

Looking forward to working with you.

— Walid`;
  }
  return "";
}

const STEPS_FOR: Record<QuickActionKind, string[]> = {
  email: [
    "Reading the last 14 days of correspondence…",
    "Identifying open commitments and tone…",
    "Pulling renewal timeline from Salesforce…",
    "Drafting the body…",
  ],
  case: [
    "Pulling expansion signals from Mixpanel…",
    "Looking up 3 prior similar conversions…",
    "Modelling ARR uplift…",
    "Drafting commercial framing…",
  ],
  qbr: [
    "Checking attendee calendars (Google)…",
    "Pulling latest health & adoption metrics…",
    "Auto-building QBR deck…",
  ],
  escalation: [
    "Detecting churn signals across 14 days of activity…",
    "Looking up the escalation playbook…",
    "Identifying replacement champion candidates…",
  ],
  approve: [
    "Reading the drafted welcome email…",
    "Cross-referencing onboarding playbook…",
  ],
  drilldown: [
    "Loading 14-day usage rollups (Mixpanel)…",
    "Segmenting affected cohorts…",
    "Comparing against baseline…",
  ],
  note: [
    "Saving note to the account log…",
  ],
};

const ACTION_LABEL: Record<QuickActionKind, string> = {
  email:      "Send",
  case:       "Open business case",
  qbr:        "Schedule",
  escalation: "Trigger playbook",
  approve:    "Approve & send",
  drilldown:  "Open drill-down",
  note:       "Save note",
};

const SUCCESS_LABEL: Record<QuickActionKind, string> = {
  email:      "Email sent",
  case:       "Business case opened",
  qbr:        "QBR scheduled",
  escalation: "Escalation triggered",
  approve:    "Email sent",
  drilldown:  "Drill-down opened",
  note:       "Note saved",
};

const SUCCESS_BODY: Record<QuickActionKind, string> = {
  email:      "Re-engagement email queued for {account}.",
  case:       "Business case for {account} added to Decks.",
  qbr:        "QBR booked for next Tuesday at 2:00 PM with the {account} team.",
  escalation: "P0 playbook running for {account}. Adriana looped in.",
  approve:    "Welcome email sent to {account}.",
  drilldown:  "Usage drill-down for {account} is live.",
  note:       "Note attached to {account}.",
};

const SUBJECT_FOR: Record<QuickActionKind, string> = {
  email:      "Following up — quick chat before renewal",
  approve:    "Welcome to {account} — getting you set up",
  case:       "",
  qbr:        "",
  escalation: "",
  drilldown:  "",
  note:       "",
};

function getRecipient(account: string, _kind: QuickActionKind): string {
  // Cheap mapping — first champion-or-DM heuristic
  const map: Record<string, string> = {
    "Snowflake":         "Tom Reilly <tom@snowflake.com>",
    "Cloudflare, Inc.":   "Maya Chen <maya@cloudflare.com>",
    "Cloudflare":            "Maya Chen <maya@cloudflare.com>",
    "GitLab Inc.":       "Molly Müller <molly@gitlab.com>",
    "Akamai":        "Ravi Iyer <ravi@akamai.com>",
    "Tableau Software":    "Aria Montgomery <aria@tableau.com>",
    "Stripe":       "David Wallace <david@stripe.com>",
    "Linear":               "Linear champion",
  };
  return map[account] ?? `${account} champion`;
}

function getRecipientFirstName(account: string) {
  return getRecipient(account, "email").split(" ")[0];
}
function getOwner(account: string) {
  const map: Record<string, string> = {
    "Snowflake": "Brad Allen",
    "Cloudflare, Inc.": "Brad Allen",
    "GitLab Inc.": "Sarah Chen",
    "Akamai": "Mike Torres",
    "Tableau Software": "Paul Acker",
  };
  return map[account] ?? "Sarah Chen";
}
function getRenewalDays(account: string) {
  const map: Record<string, number> = {
    "Snowflake": 47,
    "Cloudflare, Inc.": 178,
    "GitLab Inc.": 64,
    "Akamai": 210,
    "Tableau Software": 220,
  };
  return map[account] ?? 90;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[10.5px] font-semibold text-ink-2 mb-1 mt-3">{children}</div>;
}
function ReadonlyValue({ children }: { children: React.ReactNode }) {
  return <div className="text-[12px] text-ink-2 px-3 py-2 rounded-md bg-bg-deep">{children}</div>;
}
