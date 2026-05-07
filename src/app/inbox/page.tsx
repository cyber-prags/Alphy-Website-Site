"use client";

import { useMemo, useState } from "react";
import {
  Search, Filter, Plus, Inbox as InboxIcon, Mail, MessageSquare, Phone,
  AlertTriangle, ArrowUpRight, Reply, Forward, MoreHorizontal, Send,
  Paperclip, Sparkles, ShieldCheck, Crown, Calendar, Star, Archive,
  CheckCircle2, X,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useToast } from "@/components/Toast";
import { Logo } from "@/components/Logo";
import { PersonAvatar } from "@/components/PersonAvatar";
import { accounts, slugify, fmtMoney, type Account } from "@/lib/mock";

const ACCENT = "#266DF0";

// ─────────────────────────────────────────────────────────────────────
// Inbox — three-pane workspace.
// Left: filters + threaded list. Center: selected message + reply.
// Right: account context (resolves the email's account → mini peek).
// User never has to leave Alphard to triage and reply.
// ─────────────────────────────────────────────────────────────────────

type Item = {
  id: string;
  account: string;
  from: { name: string; email: string; initials: string };
  subject: string;
  preview: string;
  body: string;
  channel: "email" | "chat" | "ticket" | "call";
  type: "Onboarding" | "Adoption" | "Support" | "Renewal" | "Expansion";
  ago: string;
  unread: boolean;
  overdue?: boolean;
  ai_label?: { reason: string; confidence: number };
};

const INBOX: Item[] = [
  {
    id: "i1",
    account: "Snowflake Inc.",
    from: { name: "Brad Wallace", email: "brad.wallace@snowflake.com", initials: "BW" },
    subject: "Re: Renewal kickoff",
    preview: "Looks good, will loop back next week with the procurement timeline.",
    body: `Hi Pragyan,\n\nThanks for the proposal — looks good. Will loop back next week with the procurement timeline once I've checked with our finance team.\n\nA few things on my mind:\n• We need to confirm the contract structure given the Series E announcement\n• Want to make sure we're aligned on the Q3 expansion scope\n• James's departure means we'll need to introduce you to whoever picks up his scope\n\nMore soon.\n\nBrad`,
    channel: "email",
    type: "Renewal",
    ago: "2h ago",
    unread: true,
    overdue: true,
    ai_label: { reason: "Renewal · 47 days out · sponsor at risk", confidence: 92 },
  },
  {
    id: "i2",
    account: "GitLab Inc.",
    from: { name: "Alex Rivera", email: "arivera@gitlab.com", initials: "AR" },
    subject: "Catching up on adoption",
    preview: "Quick note — three teams have gone quiet, want to chat about it?",
    body: `Pragyan,\n\nI've been looking at our usage dashboards and noticed three of our teams (Platform Eng, Data, Infra) have all gone quiet on Alphard. Some of that is timing — we're in a sprint cycle and reorgs are a thing — but I want to head off any drift before it becomes a renewal conversation.\n\nWould you have 20 minutes this week to look at it together? Worth pulling Sam in.\n\n— Alex`,
    channel: "email",
    type: "Adoption",
    ago: "4h ago",
    unread: true,
    ai_label: { reason: "WAU/MAU dropped 0.74 → 0.48 · adoption at risk", confidence: 88 },
  },
  {
    id: "i3",
    account: "Cloudflare, Inc.",
    from: { name: "Maya Chen", email: "maya.chen@cloudflare.com", initials: "MC" },
    subject: "Quick thanks + a question on Networking",
    preview: "Thanks for the heads-up earlier. We're hitting plan limits on Networking — want to chat?",
    body: `Pragyan,\n\nThanks for the heads-up earlier today. With my move to VP Eng, I'm now responsible for Networking and Security — and we're already hitting plan limits on Networking three times this quarter.\n\nProcurement is asking us to consolidate where we can. Could we set up 30 minutes to walk through the bundling option you mentioned? We'd want to move quickly given the renewal kickoff is May 22.\n\nThanks,\nMaya`,
    channel: "email",
    type: "Expansion",
    ago: "6h ago",
    unread: true,
    ai_label: { reason: "Champion promotion + usage signal · expansion play", confidence: 95 },
  },
  {
    id: "i4",
    account: "Akamai Technologies",
    from: { name: "Priya Sharma", email: "priya.sharma@akamai.com", initials: "PS" },
    subject: "QBR scheduling — apologies for the delay",
    preview: "I'm new in the role and wanted to reset our QBR cadence. Tuesday or Wednesday afternoon work?",
    body: `Hi Pragyan,\n\nI'm sorry for the delay — I just stepped into the Head of RevOps role two weeks ago and I'm still getting up to speed on existing relationships.\n\nI'd like to reset our QBR cadence. Could we do Tuesday or Wednesday afternoon next week? I'd love to walk through where we are vs the original success plan and what's planned for Q2.\n\nIf you can send a few options, I'll pick what works.\n\nThanks,\nPriya`,
    channel: "email",
    type: "Renewal",
    ago: "1d ago",
    unread: false,
    ai_label: { reason: "QBR overdue 14d · new champion", confidence: 86 },
  },
  {
    id: "i5",
    account: "Tableau Software",
    from: { name: "Owen Marsh", email: "owen.marsh@tableau.com", initials: "OM" },
    subject: "Sev-2 tickets piling up",
    preview: "We've got three sev-2s open in 5 days. Need to talk about ML governance.",
    body: `Pragyan,\n\nThree sev-2 tickets opened this week — all related to v3.4 ML governance. My team is starting to feel the pain and we have a board update next Thursday where we'll need to show roadmap clarity.\n\nI know engineering is on it (saw INC-1041 in the channel) but I want to flag this proactively. Want to make sure we have a clear plan and timeline.\n\nLet me know when you can chat.\n\n— Owen`,
    channel: "ticket",
    type: "Support",
    ago: "1d ago",
    unread: false,
    ai_label: { reason: "3rd sev-2 this week · SLA risk on 2 of 3", confidence: 84 },
  },
  {
    id: "i6",
    account: "Cloudflare, Inc.",
    from: { name: "Sara Nguyen", email: "sara.nguyen@cloudflare.com", initials: "SN" },
    subject: "Renewal paperwork — MSA review",
    preview: "Legal flagged two clauses, attaching the redline.",
    body: `Hi Pragyan,\n\nOur legal team has reviewed the MSA and flagged two clauses they'd like to redline (data residency and SLA carve-outs). Attaching the version with their tracked changes — would appreciate your team's review at the earliest.\n\nWe're aiming to keep the May 22 kickoff date so let me know if there's anything else needed from our side.\n\nBest,\nSara`,
    channel: "email",
    type: "Renewal",
    ago: "2d ago",
    unread: false,
    ai_label: { reason: "Legal redlines returned · renewal track", confidence: 90 },
  },
];

const TYPE_TONE: Record<Item["type"], { bg: string; ink: string; label: string }> = {
  Onboarding: { bg: "var(--info-soft)",   ink: "var(--info)",   label: "Onboarding" },
  Adoption:   { bg: "var(--warn-soft)",   ink: "var(--warn)",   label: "Adoption"   },
  Support:    { bg: "var(--neg-soft)",    ink: "var(--neg)",    label: "Support"    },
  Renewal:    { bg: "var(--neg-soft)",    ink: "var(--neg)",    label: "Renewal"    },
  Expansion:  { bg: "var(--accent-soft)", ink: "var(--accent-deep)", label: "Expansion" },
};

const CHANNEL_ICON: Record<Item["channel"], typeof Mail> = {
  email: Mail, chat: MessageSquare, ticket: InboxIcon, call: Phone,
};

const QUICK_REPLIES = [
  "Acknowledge & schedule a call",
  "Send a one-page recap",
  "Loop in exec sponsor",
  "Forward to support",
];

export default function InboxPage() {
  const toast = useToast();
  const [view, setView] = useState<"all" | "unread" | "overdue">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>(INBOX[0].id);
  const [reply, setReply] = useState("");
  const [showReply, setShowReply] = useState(false);

  const filtered = useMemo(() => {
    return INBOX.filter((i) => {
      if (view === "unread" && !i.unread) return false;
      if (view === "overdue" && !i.overdue) return false;
      const lc = search.trim().toLowerCase();
      if (!lc) return true;
      return `${i.account} ${i.subject} ${i.preview} ${i.from.name}`.toLowerCase().includes(lc);
    });
  }, [view, search]);

  const counts = {
    all:     INBOX.length,
    unread:  INBOX.filter((i) => i.unread).length,
    overdue: INBOX.filter((i) => i.overdue).length,
  };

  const selected = INBOX.find((i) => i.id === selectedId) ?? INBOX[0];
  const linkedAccount = useMemo(
    () => accounts.find((a) => a.name === selected.account || a.name.startsWith(selected.account.split(" ")[0])),
    [selected]
  );

  const sendReply = () => {
    if (!reply.trim()) return;
    toast({ tone: "success", title: "Reply sent", body: `To ${selected.from.name} · ${selected.account}` });
    setReply("");
    setShowReply(false);
  };

  return (
    <AppShell>
      {/* Pull the inbox flush — full-bleed three-pane workspace */}
      <div className="-mx-4 -mt-6 md:-mx-8 md:-mt-8 -mb-32 flex"
        style={{ height: "calc(100vh - 48px)" }}>

        {/* ─── Pane 1: list ─────────────────────────────── */}
        <aside className="w-[340px] flex flex-col shrink-0"
          style={{ borderRight: "1px solid var(--line)", background: "var(--surface)" }}>
          {/* Header */}
          <div className="px-4 pt-4 pb-3 shrink-0" style={{ borderBottom: "1px solid var(--line)" }}>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-[16px] font-semibold text-ink"
                style={{ letterSpacing: "-0.014em" }}>
                Inbox
              </h1>
              <button
                onClick={() => toast({ tone: "info", title: "New conversation", body: "Compose panel would open here." })}
                className="w-7 h-7 rounded-md grid place-items-center text-muted hover:text-ink hover:bg-bg-deep transition-colors">
                <Plus size={13} strokeWidth={1.8} />
              </button>
            </div>
            <div className="flex items-center gap-1.5 h-8 px-2 rounded-md mb-2"
              style={{ background: "var(--bg-deep)", border: "1px solid var(--line)" }}>
              <Search size={11} strokeWidth={1.8} className="text-muted-2 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="flex-1 bg-transparent text-[11.5px] outline-none placeholder:text-muted-2"
              />
            </div>
            <div className="flex items-center gap-1">
              {([
                { id: "all",     label: "All",     n: counts.all },
                { id: "unread",  label: "Unread",  n: counts.unread },
                { id: "overdue", label: "Overdue", n: counts.overdue },
              ] as const).map((t) => (
                <button key={t.id} onClick={() => setView(t.id)}
                  className="text-[10.5px] font-medium px-2 py-1 rounded transition-colors"
                  style={{
                    background: view === t.id ? "var(--ink)" : "transparent",
                    color: view === t.id ? "white" : "var(--muted)",
                  }}>
                  {t.label}
                  <span className="ml-1 font-mono tnum opacity-70">{t.n}</span>
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-[12px] text-muted">No conversations match.</div>
            ) : filtered.map((i) => {
              const tone = TYPE_TONE[i.type];
              const ChannelIcon = CHANNEL_ICON[i.channel];
              const active = i.id === selectedId;
              return (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => { setSelectedId(i.id); setShowReply(false); }}
                  className="w-full text-left flex items-start gap-2.5 px-4 py-3 transition-colors relative"
                  style={{
                    background: active ? "var(--bg-deep)" : "transparent",
                    borderBottom: "1px solid var(--line)",
                  }}>
                  {active && (
                    <span className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r-full"
                      style={{ background: ACCENT }} />
                  )}
                  {i.unread && !active && (
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                      style={{ background: ACCENT }} />
                  )}
                  <Logo name={i.account} size={26} rounded={5} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className={`text-[12px] truncate flex-1 ${i.unread ? "font-semibold text-ink" : "text-ink-2"}`}>
                        {i.from.name}
                      </span>
                      <span className="text-[10px] text-muted-2 font-mono shrink-0">{i.ago}</span>
                    </div>
                    <div className={`text-[11.5px] truncate mb-1 ${i.unread ? "font-medium text-ink-2" : "text-muted"}`}>
                      {i.subject}
                    </div>
                    <div className="text-[11px] text-muted-2 line-clamp-1 mb-1.5">{i.preview}</div>
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[9.5px] font-mono uppercase tracking-[0.06em] px-1.5 py-0.5 rounded"
                        style={{ background: tone.bg, color: tone.ink }}>
                        <ChannelIcon size={8} strokeWidth={2} />
                        {tone.label}
                      </span>
                      {i.overdue && (
                        <span className="text-[9px] font-mono uppercase tracking-[0.06em] px-1 py-0.5 rounded"
                          style={{ background: "var(--neg-soft)", color: "var(--neg)" }}>
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ─── Pane 2: message + reply ──────────────────── */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="h-12 px-5 flex items-center justify-between shrink-0"
            style={{ borderBottom: "1px solid var(--line)" }}>
            <div className="flex items-center gap-1">
              <ToolButton Icon={Reply}  label="Reply"   onClick={() => setShowReply(true)} primary />
              <ToolButton Icon={Forward} label="Forward" onClick={() => toast({ tone: "info", title: "Forward", body: "Compose forward to a teammate." })} />
              <ToolButton Icon={Archive} label="Archive" onClick={() => toast({ tone: "info", title: "Archived", body: `${selected.subject} moved to archive.` })} />
              <ToolButton Icon={Star}    label="Star"    onClick={() => toast({ tone: "info", title: "Starred", body: selected.account })} />
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => toast({ tone: "info", title: "More", body: "More actions coming soon." })}
                className="w-7 h-7 rounded-md grid place-items-center text-muted hover:text-ink hover:bg-bg-deep transition-colors">
                <MoreHorizontal size={14} strokeWidth={1.8} />
              </button>
            </div>
          </div>

          {/* Message body */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="max-w-3xl mx-auto">
              {/* Subject + label */}
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.08em] px-2 py-0.5 rounded-md"
                  style={{ background: TYPE_TONE[selected.type].bg, color: TYPE_TONE[selected.type].ink }}>
                  {TYPE_TONE[selected.type].label}
                </span>
                {selected.overdue && (
                  <span className="text-[10px] font-mono uppercase tracking-[0.08em] px-2 py-0.5 rounded-md"
                    style={{ background: "var(--neg-soft)", color: "var(--neg)" }}>
                    Overdue
                  </span>
                )}
                <span className="text-[10px] font-mono tnum text-muted-2 ml-auto">
                  {selected.ago}
                </span>
              </div>
              <h2 className="text-[20px] font-semibold text-ink leading-tight mb-4"
                style={{ letterSpacing: "-0.018em" }}>
                {selected.subject}
              </h2>

              {/* AI auto-label */}
              {selected.ai_label && (
                <div className="rounded-lg p-3 mb-5 flex items-start gap-2.5"
                  style={{
                    background: "rgba(38,109,240,0.06)",
                    border: "1px solid rgba(38,109,240,0.18)",
                  }}>
                  <Sparkles size={12} strokeWidth={2} style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11.5px] font-semibold text-ink mb-0.5"
                      style={{ letterSpacing: "-0.005em" }}>
                      Alphy auto-labelled this · {selected.ai_label.confidence}% confidence
                    </div>
                    <div className="text-[11.5px] text-muted-2">{selected.ai_label.reason}</div>
                  </div>
                </div>
              )}

              {/* Sender */}
              <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-line">
                <PersonAvatar name={selected.from.name} size={36} />
                <div>
                  <div className="text-[12.5px] font-semibold text-ink">{selected.from.name}</div>
                  <div className="text-[11px] text-muted">{selected.from.email}</div>
                </div>
              </div>

              {/* Body */}
              <div className="text-[13.5px] text-ink leading-[1.65] whitespace-pre-wrap mb-6">
                {selected.body}
              </div>

              {/* Reply composer */}
              {showReply ? (
                <div className="rounded-xl overflow-hidden mt-4"
                  style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                  <div className="px-4 py-2.5 grid grid-cols-[60px_1fr] gap-y-1.5 gap-x-3 items-center"
                    style={{ borderBottom: "1px solid var(--line)" }}>
                    <span className="text-[10.5px] text-muted-2 font-medium">To</span>
                    <span className="text-[11.5px] text-ink-2 truncate">{selected.from.name} · {selected.from.email}</span>
                    <span className="text-[10.5px] text-muted-2 font-medium">Subject</span>
                    <span className="text-[11.5px] font-semibold text-ink truncate">Re: {selected.subject}</span>
                  </div>
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your reply…"
                    className="w-full bg-transparent outline-none text-[13px] px-4 py-3 resize-none"
                    style={{ minHeight: 130, fontFamily: "inherit", lineHeight: 1.6 }}
                  />
                  <div className="px-3 py-2.5 flex items-center justify-between gap-2"
                    style={{ borderTop: "1px solid var(--line)", background: "var(--bg-deep)" }}>
                    <div className="flex items-center gap-1">
                      {QUICK_REPLIES.map((q) => (
                        <button key={q}
                          onClick={() => setReply((r) => r ? `${r}\n\n${q}` : q)}
                          className="text-[10.5px] text-muted-2 hover:text-ink-2 px-2 py-1 rounded transition-colors hover:bg-surface">
                          {q}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setShowReply(false)}
                        className="text-[11.5px] font-medium text-muted hover:text-ink px-2.5 py-1.5 rounded transition-colors">
                        Cancel
                      </button>
                      <button onClick={sendReply} disabled={!reply.trim()}
                        className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1.5 rounded-md text-white transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: "var(--ink)" }}>
                        <Send size={11} strokeWidth={2.2} /> Send
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-4 border-t border-line">
                  <button onClick={() => setShowReply(true)}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-2 rounded-lg text-white transition-transform hover:scale-[1.02]"
                    style={{ background: "var(--ink)" }}>
                    <Reply size={12} strokeWidth={2} />
                    Reply
                  </button>
                  <button onClick={() => { setReply("Hi " + selected.from.name.split(" ")[0] + ",\n\n[Alphy will draft this for you]"); setShowReply(true); }}
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3.5 py-2 rounded-lg transition-colors hover:bg-bg-deep"
                    style={{ background: "var(--surface)", color: "var(--ink-2)", border: "1px solid var(--line)" }}>
                    <Sparkles size={12} strokeWidth={2} style={{ color: ACCENT }} />
                    Draft with Alphy
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* ─── Pane 3: account context ─────────────────── */}
        <aside className="w-[320px] shrink-0 overflow-y-auto"
          style={{ borderLeft: "1px solid var(--line)", background: "var(--surface)" }}>
          {linkedAccount ? (
            <AccountSidebar account={linkedAccount} />
          ) : (
            <div className="p-6 text-[12px] text-muted">
              No matching account record found for "{selected.account}".
            </div>
          )}
        </aside>
      </div>
    </AppShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
function ToolButton({ Icon, label, onClick, primary }: {
  Icon: any; label: string; onClick: () => void; primary?: boolean;
}) {
  return (
    <button onClick={onClick}
      className="inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2.5 py-1.5 rounded-md transition-colors"
      style={
        primary
          ? { background: "var(--ink)", color: "white" }
          : { color: "var(--ink-2)" }
      }
      onMouseEnter={(e) => { if (!primary) e.currentTarget.style.background = "var(--bg-deep)"; }}
      onMouseLeave={(e) => { if (!primary) e.currentTarget.style.background = "transparent"; }}
    >
      <Icon size={11} strokeWidth={1.8} />
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Right-pane account context
// ─────────────────────────────────────────────────────────────────────
function AccountSidebar({ account }: { account: Account }) {
  const tone =
    account.healthScore >= 75 ? "var(--pos)" :
    account.healthScore >= 60 ? "var(--warn)" : "var(--neg)";

  return (
    <div>
      {/* Header */}
      <div className="p-5" style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="flex items-start gap-3 mb-3">
          <Logo name={account.name} size={36} rounded={9} />
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-semibold text-ink leading-tight truncate"
              style={{ letterSpacing: "-0.012em" }}>
              {account.name}
            </div>
            <div className="text-[11px] text-muted mt-0.5">
              {account.tier} · {account.segment} · {account.industry}
            </div>
          </div>
        </div>
        <Link
          href={`/accounts/${slugify(account.name)}`}
          className="inline-flex items-center gap-1 text-[10.5px] font-medium text-muted hover:text-ink transition-colors">
          Open full account
          <ArrowUpRight size={10} strokeWidth={2} />
        </Link>
      </div>

      {/* Stats */}
      <div className="p-5 grid grid-cols-2 gap-3" style={{ borderBottom: "1px solid var(--line)" }}>
        <Stat label="ARR" value={account.arr ? fmtMoney(account.arr) : fmtMoney(account.pipelineValue || 0)} sub={account.arr ? "Customer" : "Pipeline"} />
        <Stat label="Health" value={String(account.healthScore)} tone={tone} sub={account.aiHealth} />
        <Stat
          label="Renewal"
          value={account.renewalDays > 0 ? `${account.renewalDays}d` : account.renewalDays < 0 ? `${Math.abs(account.renewalDays)}d ago` : "—"}
          tone={account.renewalDays > 0 && account.renewalDays <= 60 ? "var(--neg)" : "var(--ink)"}
        />
        <Stat label="NRR" value={account.nrr ? `${account.nrr}%` : "—"} tone={account.nrr >= 110 ? "var(--pos)" : "var(--ink)"} />
      </div>

      {/* Current signal */}
      <div className="p-5" style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-2">
          Current signal
        </div>
        <div className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: tone }} />
          <p className="text-[12px] text-ink-2 leading-relaxed">{account.signal}</p>
        </div>
      </div>

      {/* Watchlist + AI health */}
      <div className="p-5" style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-2">
          Tags
        </div>
        <div className="flex flex-wrap gap-1.5">
          {account.watchlist && (
            <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-md"
              style={{
                background: account.watchlist === "Upsell Likely" ? "var(--accent-soft)"
                  : account.watchlist === "Renewal Likely" ? "var(--pos-soft)" : "var(--warn-soft)",
                color: account.watchlist === "Upsell Likely" ? "var(--accent-deep)"
                  : account.watchlist === "Renewal Likely" ? "var(--pos)" : "var(--warn)",
              }}>
              {account.watchlist}
            </span>
          )}
          <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-md"
            style={{ background: "var(--bg-deep)", color: "var(--ink-2)" }}>
            {account.aiHealth}
          </span>
          <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-md"
            style={{ background: "var(--bg-deep)", color: "var(--ink-2)" }}>
            {account.tier}
          </span>
        </div>
      </div>

      {/* Recent activity (mini) */}
      <div className="p-5">
        <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-3">
          Recent activity
        </div>
        <div className="space-y-2">
          {[
            { Icon: Mail,           text: "Email thread updated",        ago: "2h", tone: "var(--info)" },
            { Icon: ShieldCheck,    text: "Health score recomputed",     ago: "6h", tone: tone },
            { Icon: Crown,          text: "Sponsor activity tracked",    ago: "1d", tone: "var(--accent-deep)" },
            { Icon: Calendar,       text: "QBR cadence reviewed",        ago: "3d", tone: "var(--muted)" },
          ].map((a, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <a.Icon size={11} strokeWidth={1.8} style={{ color: a.tone }} className="mt-0.5 shrink-0" />
              <span className="text-[11px] text-ink-2 flex-1">{a.text}</span>
              <span className="text-[10px] font-mono tnum text-muted-2 shrink-0">{a.ago}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone, sub }: { label: string; value: string; tone?: string; sub?: string }) {
  return (
    <div>
      <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-2 mb-0.5">
        {label}
      </div>
      <div className="text-[15px] font-bold tnum leading-none" style={{ color: tone ?? "var(--ink)", letterSpacing: "-0.018em" }}>
        {value}
      </div>
      {sub && <div className="text-[10px] text-muted mt-1">{sub}</div>}
    </div>
  );
}
