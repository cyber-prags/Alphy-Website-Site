"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Filter, Plus, Inbox as InboxIcon, Mail, MessageSquare, Phone, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useToast } from "@/components/Toast";
import { Logo } from "@/components/Logo";
import { slugify } from "@/lib/mock";

type Item = {
  id: string;
  account: string;
  subject: string;
  preview: string;
  channel: "email" | "chat" | "ticket" | "call";
  type: "Onboarding" | "Adoption" | "Support" | "Renewal" | "Expansion";
  owner: string;
  ownerInitials: string;
  ago: string;
  unread: boolean;
  overdue?: boolean;
};

const INBOX: Item[] = [
  { id: "i1",  account: "GitLab Inc.",   subject: "Onboarding session 1",      preview: "This is where we make Alphard speak your language. We'll customise your tenant to your needs and terminology.", channel: "ticket", type: "Onboarding", owner: "Sarah Chen", ownerInitials: "SC", ago: "an hour ago", unread: true },
  { id: "i2",  account: "GitLab Inc.",   subject: "Kick off call",            preview: "We use our Kick Off call to ensure we are aligned on objectives, timeline and responsibilities.",                  channel: "ticket", type: "Onboarding", owner: "Sarah Chen", ownerInitials: "SC", ago: "an hour ago", unread: true },
  { id: "i3",  account: "Tableau Software", subject: "Onboarding session 2",      preview: "With the basics in place, we move on to the fun stuff. Customer Success 101 is being proactive.",                 channel: "ticket", type: "Onboarding", owner: "Paul Acker", ownerInitials: "PA", ago: "an hour ago", unread: false },
  { id: "i4",  account: "Tableau Software", subject: "Post Onboarding session 2 actions", preview: "Please find your homework in the checklist below and check it off as you go. Here are some articles…",       channel: "email",  type: "Onboarding", owner: "Paul Acker", ownerInitials: "PA", ago: "an hour ago", unread: false },
  { id: "i5",  account: "Cloudflare",        subject: "Onboarding session 3",      preview: "At this stage we hope to have enough available data to start making our first HealthScores and dashboards…",         channel: "ticket", type: "Onboarding", owner: "Brad Allen", ownerInitials: "BA", ago: "an hour ago", unread: true },
  { id: "i6",  account: "Cloudflare",        subject: "Training session",          preview: "Next steps: Depending on the size of your team this can be done in different ways, but at a high level…",            channel: "ticket", type: "Adoption",   owner: "Brad Allen", ownerInitials: "BA", ago: "an hour ago", unread: false },
  { id: "i7",  account: "Akamai",    subject: "Complete certification",    preview: "Following our training session, running the certification course will let you hit the ground running.",                channel: "ticket", type: "Adoption",   owner: "Mike Torres", ownerInitials: "MT", ago: "an hour ago", unread: true, overdue: true },
  { id: "i8",  account: "Snowflake",     subject: "Sponsor re-engagement",     preview: "Tom Reilly hasn't replied in 24 days. Drafted a re-engage note ready to send.",                                          channel: "email",  type: "Renewal",    owner: "Brad Allen", ownerInitials: "BA", ago: "1h ago",     unread: true, overdue: true },
  { id: "i9",  account: "GitLab Inc.",   subject: "Usage drop investigation",  preview: "WAU/MAU dropped 0.62 → 0.48 in 14 days. Three teams stopped using AI features last week.",                              channel: "chat",   type: "Adoption",   owner: "Sarah Chen", ownerInitials: "SC", ago: "1h ago",     unread: true },
  { id: "i10", account: "Akamai",    subject: "QBR scheduling",            preview: "QBR overdue 14d. Reviewed adoption metrics; agreed on three Q2 priorities.",                                             channel: "email",  type: "Renewal",    owner: "Mike Torres", ownerInitials: "MT", ago: "2h ago",    unread: false },
  { id: "i11", account: "Cloudflare",        subject: "Expansion play — Identity v2", preview: "Pattern matches 3 prior champion-promotion conversions. Drafted business case ready for review.",                  channel: "chat",   type: "Expansion",  owner: "Brad Allen", ownerInitials: "BA", ago: "Yesterday",  unread: false },
];

const TYPE_TONE: Record<Item["type"], { bg: string; ink: string }> = {
  Onboarding: { bg: "var(--info-soft)",  ink: "var(--info)"  },
  Adoption:   { bg: "var(--warn-soft)",  ink: "var(--warn)"  },
  Support:    { bg: "var(--bg-deep)",    ink: "var(--muted)" },
  Renewal:    { bg: "var(--neg-soft)",   ink: "var(--neg)"   },
  Expansion:  { bg: "var(--accent-soft)",ink: "var(--accent-deep)" },
};

const CHANNEL_ICON: Record<Item["channel"], typeof Mail> = {
  email: Mail, chat: MessageSquare, ticket: InboxIcon, call: Phone,
};

export default function InboxPage() {
  const toast = useToast();
  const [view, setView] = useState<"shared" | "open" | "delayed">("shared");
  const [search, setSearch] = useState("");

  const items = INBOX.filter((i) => {
    if (view === "open" && i.unread === false) return false;
    if (view === "delayed" && !i.overdue) return false;
    const lc = search.trim().toLowerCase();
    if (!lc) return true;
    return `${i.account} ${i.subject} ${i.preview}`.toLowerCase().includes(lc);
  });

  const counts = {
    shared:  INBOX.length,
    open:    INBOX.filter((i) => i.unread).length,
    delayed: INBOX.filter((i) => i.overdue).length,
  };

  return (
    <AppShell>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <div className="mono-label mb-1.5">Activities · Inbox</div>
          <h1 className="display" style={{ fontSize: 22 }}>
            Shared <span className="italic-emph">conversations</span>
          </h1>
          <div className="text-[12.5px] text-muted mt-1">Onboarding sessions, kickoff calls, training, and renewal threads — across the team.</div>
        </div>
        <button onClick={() => toast({ tone: "info", title: "New conversation", body: "Compose panel would open here." })}
          className="text-[12px] font-medium h-8 px-3 rounded-md inline-flex items-center gap-1.5"
          style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
          <Plus size={12} /> New
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-2 mb-3">
        {([
          { id: "shared",  label: "Shared Inbox",       count: counts.shared,  Icon: InboxIcon },
          { id: "open",    label: "Open conversations", count: counts.open,    Icon: MessageSquare },
          { id: "delayed", label: "Delayed tickets",    count: counts.delayed, Icon: AlertTriangle },
        ] as const).map((t) => (
          <button key={t.id} onClick={() => setView(t.id)}
            className={`pill-nav-item inline-flex items-center gap-1.5 ${view === t.id ? "active" : ""}`}>
            <t.Icon size={11} strokeWidth={1.8} />
            {t.label}
            <span className="text-[10px] font-mono tnum px-1.5 rounded bg-bg-deep text-muted">{t.count}</span>
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 h-9 w-72 px-2.5 rounded-md border border-line bg-surface">
          <Search size={12} strokeWidth={1.6} className="text-muted-2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search inbox…"
            className="flex-1 bg-transparent outline-none text-[12px] placeholder:text-muted-2" />
        </div>
        <button onClick={() => toast({ tone: "info", title: "Filter inbox", body: "Filter by channel, status, sender, and account — coming soon" })}
          className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-md border border-line bg-surface text-[11.5px] font-medium text-ink-2 hover:bg-bg-deep">
          <Filter size={11} className="text-muted" /> Filter
        </button>
      </div>

      {/* List */}
      <div className="card overflow-hidden">
        {items.length === 0 ? (
          <div className="p-10 text-center text-[12.5px] text-muted">No conversations match.</div>
        ) : items.map((i) => {
          const tone = TYPE_TONE[i.type];
          const ChannelIcon = CHANNEL_ICON[i.channel];
          return (
            <Link key={i.id} href={`/accounts/${slugify(i.account)}`}
              onClick={() => toast({ tone: "info", title: `Opening ${i.account}`, body: "Conversation threads will live in the account workspace." })}
              className="flex items-center gap-3 px-4 py-3 border-b border-line last:border-0 hover:bg-bg-deep transition-colors">
              <div className="w-7 h-7 rounded-md grid place-items-center bg-bg-deep">
                <ChannelIcon size={11} strokeWidth={1.6} className="text-muted" />
              </div>
              <Logo name={i.account} size={22} rounded={4} />
              <div className="w-32 text-[12px] font-semibold text-ink truncate">{i.account}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center text-[10px] font-mono uppercase tracking-[0.06em] px-1.5 py-0.5 rounded"
                    style={{ background: tone.bg, color: tone.ink }}>
                    {i.type}
                  </span>
                  <span className={`text-[12.5px] ${i.unread ? "font-semibold text-ink" : "text-ink-2"}`}>{i.subject}</span>
                  {i.overdue && (
                    <span className="text-[9.5px] font-mono uppercase tracking-[0.06em] px-1 py-px rounded"
                      style={{ background: "var(--neg-soft)", color: "var(--neg)" }}>Overdue</span>
                  )}
                </div>
                <div className="text-[11.5px] text-muted line-clamp-1 mt-0.5">{i.preview}</div>
              </div>
              <div className="w-24 text-right text-[10.5px] text-muted-2 tnum">{i.ago}</div>
              <div className="w-7 h-7 rounded-full bg-ink text-white grid place-items-center text-[9.5px] font-semibold">
                {i.ownerInitials}
              </div>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
