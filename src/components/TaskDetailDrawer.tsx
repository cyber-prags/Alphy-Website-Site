"use client";

import { useState } from "react";
import {
  X, Check, Phone, Sparkles, ChevronDown, ChevronUp, ArrowUp,
  ListChecks, MessageSquare, FileText,
} from "lucide-react";
import { type QueueItem, type Subtask, type TaskComment, taskTemplates } from "@/lib/mock";
import { Logo } from "./Logo";
import { SubtaskList } from "./SubtaskList";
import { CommentThread } from "./CommentThread";
import { Popover, MenuItem, MenuLabel } from "./Popover";

// ---------------------------------------------------------------------
// Per-account synthetic contacts
// ---------------------------------------------------------------------
const CONTACT_MAP: Record<string, { name: string; title: string }> = {
  "Snowflake":             { name: "Brad Wallace",    title: "Sr. VP Revenue Operations" },
  "GitLab Inc.":           { name: "Priya Anand",     title: "Director of Engineering" },
  "Akamai":                { name: "Lin Park",         title: "VP Engineering & Security" },
  "Cloudflare, Inc.":      { name: "Maya Chen",        title: "VP Engineering (promoted)" },
  "Tableau Software":      { name: "Jordan Lee",       title: "Head of Data Science" },
  "Stripe":                { name: "David Wallace",    title: "Head of Procurement" },
  "Shopify":               { name: "Daniel O'Connor",  title: "VP Engineering" },
  "Raytheon Technologies": { name: "Alex Kim",          title: "Director of Revenue Ops" },
};

// ---------------------------------------------------------------------
// Per-kind talking points
// ---------------------------------------------------------------------
const PREP_MAP: Record<string, string[]> = {
  renewal: [
    "\"[Name], I wanted to check in directly — are you running into anything on the contract side I can help unblock?\"",
    "Offer to get your legal on a joint call with their legal to remove the back-and-forth",
    "If terms are the issue, propose a simplified 6-month pilot extension to de-risk their side",
    "Ask if the champion is still the internal driver or if someone else has taken point on procurement",
    "Mention health trajectory has improved — share the updated dashboard link",
  ],
  adoption: [
    "Review the WAU/MAU drop with the champion — ask what changed in their workflow 2 weeks ago",
    "Identify which teams went dark and send targeted re-engagement to team leads",
    "Offer a live office-hours session focused on their highest-value use cases",
    "Ask about competing tools or internal blockers that may be pulling usage away",
    "Propose a 30-day re-engagement plan with weekly check-ins",
  ],
  prep: [
    "Open with business outcomes achieved since last QBR — cite specific metrics",
    "Review AI usage health score trend and explain what drove changes",
    "Present the Q3 success plan with 3 prioritised initiatives",
    "Ask about new strategic priorities from their side going into H2",
    "Close by confirming renewal timeline and next steps",
  ],
  expansion: [
    "\"Congratulations on the promotion — I wanted to reach out about something relevant to your new scope\"",
    "Reference the adoption gap in the new area and the unrealised value opportunity",
    "Show ROI pattern from 3 similar customers who expanded into this area",
    "Present a phased rollout plan that minimises procurement friction",
    "Ask about budget cycle and internal sign-off process for the expanded scope",
  ],
  risk: [
    "\"I noticed we haven't connected recently — wanted to make sure you have everything you need\"",
    "Reference the specific drop or concern without being alarmist",
    "Bring a concrete recovery proposal, not just an inquiry",
    "Ask who else in their organisation is now involved in the evaluation",
    "Set a clear follow-up commitment before ending the call",
  ],
  deal: [
    "Review last call notes and email thread before connecting",
    "Confirm the key decision criteria they shared in the last touchpoint",
    "Have ROI data and competitive differentiation ready to share",
    "Propose a clear next step and timeline before ending the conversation",
    "Ask if there are any new stakeholders who should be in the room",
  ],
};

const QUICK_CHIPS: Record<string, string[]> = {
  renewal:   ["Prep me for the call",      "Brief me on the contact", "Likely objections"],
  adoption:  ["Adoption recovery plan",    "Brief me on the contact", "Objection handling"],
  prep:      ["QBR agenda generator",      "Brief me on the account", "Success metrics prep"],
  expansion: ["Build the business case",   "Brief me on the contact", "Expansion ROI estimate"],
  risk:      ["Re-engagement script",      "Brief me on the contact", "Escalation options"],
  deal:      ["Prep me for the call",      "Deal risk assessment",     "Competitive positioning"],
};

function priorityFor(item: QueueItem): { label: string; bg: string; color: string } {
  if (item.overdue)                                  return { label: "Urgent", bg: "#FEE2E2", color: "#DC2626" };
  if (item.kind === "risk" || item.kind === "renewal") return { label: "High",   bg: "#FEF3C7", color: "#D97706" };
  if (item.kind === "expansion" || item.kind === "deal") return { label: "Medium", bg: "#EFF6FF", color: "#2563EB" };
  return { label: "Normal", bg: "#F0FDF4", color: "#16A34A" };
}

function ctaFor(kind: string) {
  if (kind === "renewal" || kind === "risk") return "Start Call";
  if (kind === "expansion")                  return "Build Case";
  if (kind === "prep")                       return "Schedule QBR";
  return "Open Task";
}

function prepTitleFor(kind: string) {
  if (kind === "renewal" || kind === "risk") return "Call prep";
  if (kind === "expansion")                  return "Business case prep";
  if (kind === "prep")                       return "Meeting prep";
  return "Task prep";
}

// ---------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------
export function TaskDetailDrawer({
  item, onClose, onDone, onDismiss,
}: {
  item: QueueItem | null;
  onClose: () => void;
  onDone: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const [whyOpen, setWhyOpen] = useState(true);
  const [q, setQ] = useState("");
  const [answers, setAnswers] = useState<{ q: string; a: string }[]>([]);
  const [localSubtasks, setLocalSubtasks] = useState<Subtask[] | null>(null);
  const [localComments, setLocalComments] = useState<TaskComment[] | null>(null);

  if (!item) return null;

  const subtasks = localSubtasks ?? item.subtasks ?? [];
  const comments = localComments ?? item.comments ?? [];
  const setSubtasks = (s: Subtask[]) => setLocalSubtasks(s);
  const addComment = (c: TaskComment) => setLocalComments([...comments, c]);
  const applyTemplate = (tplId: string) => {
    const tpl = taskTemplates.find((t) => t.id === tplId);
    if (!tpl) return;
    const newSubs = tpl.subtasks.map((label, i) => ({ id: `st-tpl-${Date.now()}-${i}`, label, done: false }));
    setLocalSubtasks(newSubs);
  };
  const relevantTemplates = taskTemplates.filter((t) => t.kinds.includes(item.kind));

  const priority = priorityFor(item);
  const contact  = CONTACT_MAP[item.account] ?? { name: "Primary Contact", title: "Executive Sponsor" };
  const prep     = PREP_MAP[item.kind]        ?? PREP_MAP.deal;
  const chips    = QUICK_CHIPS[item.kind]     ?? QUICK_CHIPS.deal;

  const ask = (text: string) => {
    const lc = text.toLowerCase();
    const a = lc.includes("call")
      ? `Best channel is phone — their calendar shows availability tomorrow at 2pm and 4pm ET. Last email was ${item.ago} ago with no reply.`
      : lc.includes("objection")
      ? `Top 3 likely objections for ${item.account}: (1) budget / procurement delay, (2) internal competing priority, (3) scope uncertainty. Suggested handling available for each.`
      : lc.includes("case") || lc.includes("roi")
      ? `Business case for ${item.account}: projected $120–180K expansion based on 3 comparable accounts. Full model available in the Outcomes tab.`
      : `Based on ${item.account}'s signals and call history — citations would appear here in production.`;
    setAnswers(prev => [...prev, { q: text, a }]);
    setQ("");
  };

  return (
    <>
      <div className="fixed inset-0 bg-ink/40 z-[85] fade-in" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-[90] flex flex-col bg-bg border-l border-line shadow-2xl drawer-anim"
        style={{ width: 860 }}>

        {/* ── Header ── */}
        <div className="h-14 px-5 border-b border-line flex items-center gap-3 shrink-0">
          <div className="w-7 h-7 rounded-lg grid place-items-center shrink-0 bg-bg-deep">
            <Phone size={13} strokeWidth={1.8} className="text-muted" />
          </div>
          <h2 className="flex-1 text-[13.5px] font-semibold text-ink truncate min-w-0">{item.headline}</h2>
          {relevantTemplates.length > 0 && (
            <Popover align="right" width={220}
              trigger={(_, t) => (
                <button onClick={t}
                  className="h-8 px-3 rounded-md border border-line text-[12px] text-muted hover:text-ink hover:bg-surface-2 inline-flex items-center gap-1.5 shrink-0">
                  <FileText size={11} strokeWidth={1.8} /> Template
                </button>
              )}>
              {(close) => (
                <>
                  <MenuLabel>Apply template</MenuLabel>
                  {relevantTemplates.map((tpl) => (
                    <MenuItem key={tpl.id} onClick={() => { applyTemplate(tpl.id); close(); }}>
                      {tpl.name}
                    </MenuItem>
                  ))}
                </>
              )}
            </Popover>
          )}
          <button onClick={() => { onDismiss(item.id); onClose(); }}
            className="h-8 px-3 rounded-md border border-line text-[12px] text-muted hover:text-ink hover:bg-surface-2 inline-flex items-center gap-1.5 shrink-0">
            <X size={11} strokeWidth={1.8} /> Dismiss
          </button>
          <button onClick={() => { onDone(item.id); onClose(); }}
            className="h-8 px-3 rounded-md text-[12px] font-semibold inline-flex items-center gap-1.5 shrink-0"
            style={{ background: "var(--pos)", color: "white" }}>
            <Check size={11} strokeWidth={2} /> Mark as Done
          </button>
        </div>

        {/* ── 3-column body ── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* LEFT: metadata sidebar */}
          <div className="w-52 shrink-0 border-r border-line p-5 overflow-y-auto space-y-4">
            <MetaRow label="Contact">
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="w-6 h-6 rounded-full bg-ink text-white grid place-items-center text-[8.5px] font-semibold shrink-0">
                  {contact.name.split(" ").map(p => p[0]).join("").slice(0, 2)}
                </div>
                <span className="text-[12px] font-semibold text-ink leading-tight">{contact.name}</span>
              </div>
              <div className="text-[10.5px] text-muted pl-7 leading-snug">{contact.title}</div>
            </MetaRow>
            <MetaRow label="Company">
              <div className="flex items-center gap-1.5">
                <Logo name={item.account} size={16} rounded={3} />
                <span className="text-[12px] text-ink">{item.account}</span>
              </div>
            </MetaRow>
            <MetaRow label="Due date">
              <span className="text-[12px] font-semibold" style={{ color: item.overdue ? "var(--neg)" : "var(--warn)" }}>
                {item.due ?? "Today"}{item.overdue ? " · overdue" : ""}
              </span>
            </MetaRow>
            <MetaRow label="Priority">
              <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded"
                style={{ background: priority.bg, color: priority.color }}>{priority.label}</span>
            </MetaRow>
            <MetaRow label="Task owner">
              <span className="text-[12px] text-ink">Walid Qayoumi</span>
            </MetaRow>
            <MetaRow label="Created at">
              <span className="text-[11.5px] text-muted">May 3, 2026</span>
            </MetaRow>
            <MetaRow label="Source">
              <span className="text-[11.5px] text-muted">Deal Agent</span>
            </MetaRow>
            <MetaRow label="Task ID">
              <span className="text-[10.5px] font-mono text-muted">{item.id}</span>
            </MetaRow>
          </div>

          {/* CENTER: why + prep */}
          <div className="flex-1 min-w-0 overflow-y-auto p-5 space-y-4">
            {/* Why this action */}
            <div className="border border-line rounded-xl overflow-hidden">
              <button
                onClick={() => setWhyOpen(!whyOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-surface hover:bg-surface-2 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={13} strokeWidth={1.8} style={{ color: "var(--accent-deep)" }} />
                  <span className="text-[13px] font-semibold text-ink">Why this action</span>
                </div>
                {whyOpen
                  ? <ChevronUp size={14} strokeWidth={1.6} className="text-muted" />
                  : <ChevronDown size={14} strokeWidth={1.6} className="text-muted" />}
              </button>
              {whyOpen && (
                <div className="px-4 py-4 text-[12.5px] text-ink-2 leading-relaxed border-t border-line">
                  {item.why}
                </div>
              )}
            </div>

            {/* Prep section */}
            <div className="border border-line rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-surface border-b border-line">
                <Phone size={12} strokeWidth={1.8} className="text-muted" />
                <span className="text-[13px] font-semibold text-ink">{prepTitleFor(item.kind)}</span>
              </div>
              <div className="px-4 py-4">
                <div className="mono-label mb-3">Talking points</div>
                <ul className="space-y-3">
                  {prep.map((p, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "var(--accent-deep)" }} />
                      <span className="text-[12.5px] text-ink-2 leading-relaxed">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Subtasks */}
            {subtasks.length > 0 && (
              <div className="border border-line rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-surface border-b border-line">
                  <ListChecks size={12} strokeWidth={1.8} className="text-muted" />
                  <span className="text-[13px] font-semibold text-ink">Subtasks</span>
                  <span className="ml-auto text-[10.5px] font-mono tnum text-muted">
                    {subtasks.filter((s) => s.done).length}/{subtasks.length}
                  </span>
                </div>
                <div className="px-4 py-4">
                  <SubtaskList subtasks={subtasks} onChange={setSubtasks} />
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="border border-line rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-surface border-b border-line">
                <MessageSquare size={12} strokeWidth={1.8} className="text-muted" />
                <span className="text-[13px] font-semibold text-ink">Comments</span>
                {comments.length > 0 && (
                  <span className="ml-auto text-[10.5px] font-mono tnum text-muted">{comments.length}</span>
                )}
              </div>
              <div className="px-4 py-4">
                <CommentThread comments={comments} onAdd={addComment} />
              </div>
            </div>
          </div>

          {/* RIGHT: AI assist */}
          <div className="w-56 shrink-0 border-l border-line flex flex-col">
            <div className="p-4 border-b border-line">
              <div className="text-[11.5px] font-semibold text-center text-ink-2">
                Ask questions or improve this task
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {chips.map((chip) => (
                <button key={chip} onClick={() => ask(chip)}
                  className="w-full text-left text-[11.5px] px-3 py-2 rounded-lg border border-line bg-surface hover:bg-surface-2 transition-colors text-ink-2">
                  {chip}
                </button>
              ))}
              {answers.length > 0 && (
                <div className="mt-3 space-y-2">
                  {answers.map((a, i) => (
                    <div key={i} className="rounded-lg overflow-hidden border border-line">
                      <div className="px-2.5 py-1.5 bg-bg-deep text-[10px] text-muted truncate">{a.q}</div>
                      <div className="px-2.5 py-2.5 text-[11px] text-ink-2 leading-relaxed"
                        style={{ background: "var(--accent-soft)" }}>{a.a}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-3 border-t border-line space-y-2">
              <div className="flex items-center justify-center gap-3 text-[10.5px]">
                <button className="font-semibold text-ink-2 hover:text-ink">Ask</button>
                <span className="text-muted">·</span>
                <button className="text-muted hover:text-ink">Improve</button>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-line bg-surface">
                <input value={q} onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") ask(q); }}
                  placeholder="Ask about this task or the deal..."
                  className="flex-1 bg-transparent outline-none text-[11px] placeholder:text-muted-2" />
                <button onClick={() => ask(q)} disabled={!q.trim()}
                  className="w-5 h-5 rounded grid place-items-center disabled:opacity-40"
                  style={{ background: "var(--accent-deep)", color: "white" }}>
                  <ArrowUp size={9} strokeWidth={2.2} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="h-14 px-5 border-t border-line flex items-center gap-3 shrink-0">
          <button className="h-9 px-4 rounded-lg text-[12.5px] font-semibold inline-flex items-center gap-2"
            style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
            <Phone size={13} strokeWidth={1.8} />
            {ctaFor(item.kind)}
          </button>
          <span className="text-[11px] text-muted">
            Created {item.ago} ago · Source: Deal Agent · ID: {item.id}
          </span>
        </div>
      </div>
    </>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mono-label mb-1.5">{label}</div>
      {children}
    </div>
  );
}
