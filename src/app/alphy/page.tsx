"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Search as SearchIcon, Pin, MoreHorizontal,
  Mail, FileText, BarChart3, Database, AlertTriangle, Zap,
  Calendar, RefreshCw, Users, Target,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AlphyChat } from "@/components/AlphyPanel";
import { AlphyMark } from "@/components/AlphyMark";
import { usePersona } from "@/components/PersonaContext";
import type { Persona } from "@/lib/mock";

const ACCENT = "#266DF0";

// ─────────────────────────────────────────────────────────────────────
// Conversation history fixtures — persona-aware.
// Each item has a `prompt` that re-hydrates the conversation when
// the user clicks it. Alphy's `generateOutput` runs on the prompt
// and produces the same multi-modal artifact.
// ─────────────────────────────────────────────────────────────────────

type HistoryItem = {
  id: string;
  title: string;
  preview: string;
  ago: string;
  bucket: "today" | "yesterday" | "week" | "older";
  pinned?: boolean;
  Icon: any;
  /** The prompt that produced this conversation. Used to re-hydrate when
   *  the user clicks an old chat — feeds back through generateOutput. */
  prompt: string;
};

const HISTORY_BY_PERSONA: Record<Persona, HistoryItem[]> = {
  ae: [
    { id: "ae-1", title: "Pre-call brief on Datadog",         preview: "Buying-committee map + 3 angles",       ago: "2h",  bucket: "today",     pinned: true,  Icon: FileText,      prompt: "Make me a report on Datadog" },
    { id: "ae-2", title: "Update Stripe stage to Negotiation", preview: "Approved · synced to Salesforce",       ago: "4h",  bucket: "today",                  Icon: Database,      prompt: "Update Stripe renewal stage to Negotiation" },
    { id: "ae-3", title: "Q3 forecast — what's at risk?",      preview: "Coverage 0.9x in Mid-Market segment",   ago: "yesterday", bucket: "yesterday",        Icon: BarChart3,     prompt: "Forecast my Q3 number" },
    { id: "ae-4", title: "Draft re-engage to Boston Dynamics", preview: "Sent · awaiting reply",                 ago: "yesterday", bucket: "yesterday",        Icon: Mail,          prompt: "Draft a re-engagement email to Boston Dynamics" },
    { id: "ae-5", title: "Show stalled deals over 14 days",    preview: "8 deals · $1.6M at risk",               ago: "3d",  bucket: "week",                   Icon: AlertTriangle, prompt: "Who's at risk this week?" },
    { id: "ae-6", title: "Build proposal for HSBC",            preview: "Generated 8-slide deck",                ago: "5d",  bucket: "week",                   Icon: FileText,      prompt: "Make me a report on HSBC" },
    { id: "ae-7", title: "ARR by quarter",                     preview: "Bar chart · +29% YoY",                  ago: "Apr 28", bucket: "older",               Icon: BarChart3,     prompt: "Show me ARR by quarter" },
  ],
  am: [
    { id: "am-1", title: "Brief on Cloudflare",                preview: "Maya promotion · expansion thesis",     ago: "1h",  bucket: "today",     pinned: true,  Icon: FileText,      prompt: "Make me a report on Cloudflare" },
    { id: "am-2", title: "Build expansion case for Cloudflare", preview: "Networking + Security bundle",         ago: "3h",  bucket: "today",                  Icon: AlphyMark,     prompt: "Build expansion case for Cloudflare" },
    { id: "am-3", title: "Draft congrats note to Maya",        preview: "Approved · sent",                       ago: "5h",  bucket: "today",                  Icon: Mail,          prompt: "Draft a congrats email to Maya at Cloudflare" },
    { id: "am-4", title: "ARR by quarter — last 4Q",           preview: "Bar chart · +29% YoY",                  ago: "yesterday", bucket: "yesterday",        Icon: BarChart3,     prompt: "Show me ARR by quarter" },
    { id: "am-5", title: "Who's at risk this week?",           preview: "5 accounts · $1.2M",                    ago: "2d",  bucket: "week",                   Icon: AlertTriangle, prompt: "Who's at risk this week?" },
    { id: "am-6", title: "Update Snowflake renewal",           preview: "Stage moved to Negotiation",            ago: "4d",  bucket: "week",                   Icon: Database,      prompt: "Update Snowflake renewal stage to Negotiation" },
    { id: "am-7", title: "Plan Q3 expansion bets",             preview: "4 bets across 3 accounts",              ago: "Apr 30", bucket: "older",               Icon: Target,        prompt: "Forecast my Q3 number" },
  ],
  csm: [
    { id: "csm-1", title: "Save play for Snowflake",           preview: "Sponsor silence playbook · running",    ago: "30m", bucket: "today",     pinned: true,  Icon: AlertTriangle, prompt: "How do I run a recovery playbook?" },
    { id: "csm-2", title: "Draft renewal email to Brad",       preview: "Approved · sent",                       ago: "1h",  bucket: "today",                  Icon: Mail,          prompt: "Draft a renewal email to Brad at Snowflake" },
    { id: "csm-3", title: "GitLab adoption recovery plan",     preview: "Value snapshot + training",             ago: "3h",  bucket: "today",                  Icon: RefreshCw,     prompt: "How do I run a recovery playbook?" },
    { id: "csm-4", title: "Customer health distribution",      preview: "Donut · 3 healthy · 1 at risk",         ago: "yesterday", bucket: "yesterday",        Icon: BarChart3,     prompt: "Show me the customer health distribution" },
    { id: "csm-5", title: "Who's at risk this week?",          preview: "5 accounts · $1.2M",                    ago: "2d",  bucket: "week",                   Icon: AlertTriangle, prompt: "Who's at risk this week?" },
    { id: "csm-6", title: "What changed today?",               preview: "5 signals · 3 need attention",          ago: "3d",  bucket: "week",                   Icon: Zap,           prompt: "What changed today?" },
    { id: "csm-7", title: "Brief on Cloudflare",               preview: "Account brief · expansion thesis",      ago: "Apr 29", bucket: "older",               Icon: FileText,      prompt: "Make me a report on Cloudflare" },
  ],
  manager: [
    { id: "mgr-1", title: "Coaching brief — Sarah Chen",       preview: "Stalled in Negotiation · 3 deals",      ago: "1h",  bucket: "today",     pinned: true,  Icon: Users,         prompt: "Show me the team capacity" },
    { id: "mgr-2", title: "Forecast confidence by rep",        preview: "Heatmap · 2 reps under 70%",            ago: "2h",  bucket: "today",                  Icon: BarChart3,     prompt: "Forecast my number" },
    { id: "mgr-3", title: "Reassign 2 accounts from Brad",     preview: "Approved · Derek picks up",             ago: "4h",  bucket: "today",                  Icon: Database,      prompt: "Reassign owner on Mailchimp" },
    { id: "mgr-4", title: "Show me ARR by quarter",            preview: "+$1.34M net · expansion-led",           ago: "yesterday", bucket: "yesterday",        Icon: BarChart3,     prompt: "Show me ARR by quarter" },
    { id: "mgr-5", title: "Who's at risk this week?",          preview: "5 accounts · $1.2M",                    ago: "2d",  bucket: "week",                   Icon: FileText,      prompt: "Who's at risk this week?" },
    { id: "mgr-6", title: "Team workload heatmap",             preview: "2 overloaded · 3 on track",             ago: "3d",  bucket: "week",                   Icon: AlertTriangle, prompt: "Show me the team capacity" },
    { id: "mgr-7", title: "What changed today?",               preview: "5 signals · 3 need attention",          ago: "5d",  bucket: "week",                   Icon: Calendar,      prompt: "What changed today?" },
  ],
};

const BUCKET_LABELS: Record<HistoryItem["bucket"], string> = {
  today:     "Today",
  yesterday: "Yesterday",
  week:      "This week",
  older:     "Earlier",
};

// ─────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────

export default function AlphyPage() {
  const router = useRouter();
  const { persona } = usePersona();
  const history = HISTORY_BY_PERSONA[persona] ?? HISTORY_BY_PERSONA.am;

  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string>("");
  // Bumping `chatKey` remounts AlphyChat with new initialMessages.
  // We pass the picked history item as a seeded user prompt so the
  // chat re-hydrates with the same artifact the user originally saw.
  const [chatKey, setChatKey] = useState(0);
  const [seedPrompt, setSeedPrompt] = useState<string | null>(null);

  const filtered = history.filter((h) =>
    !search.trim() ||
    `${h.title} ${h.preview}`.toLowerCase().includes(search.toLowerCase())
  );
  const pinned = filtered.filter((h) => h.pinned);
  const unpinned = filtered.filter((h) => !h.pinned);

  const byBucket: Record<HistoryItem["bucket"], HistoryItem[]> = {
    today: [], yesterday: [], week: [], older: [],
  };
  unpinned.forEach((h) => byBucket[h.bucket].push(h));

  const newChat = () => {
    setActiveId("");
    setSeedPrompt(null);
    setChatKey((k) => k + 1);
  };

  const openHistory = (item: HistoryItem) => {
    setActiveId(item.id);
    setSeedPrompt(item.prompt);
    // Bump the chat key so AlphyChat re-mounts and runs the seed prompt
    setChatKey((k) => k + 1);
  };

  // Build initial messages from the seed prompt (visual conversation kickoff)
  const initialMessages = useMemo(() => {
    if (!seedPrompt) return undefined;
    return [{ role: "user" as const, text: seedPrompt }];
  }, [seedPrompt]);

  return (
    <AppShell>
      <div className="-mx-4 -mt-6 md:-mx-8 md:-mt-8 -mb-32 flex"
        style={{ height: "calc(100vh - 48px)" }}>

        {/* ─── History pane ─────────────────────────────── */}
        <aside className="w-[260px] shrink-0 flex flex-col"
          style={{ borderRight: "1px solid var(--line)", background: "var(--surface)" }}>
          {/* Header */}
          <div className="px-3 pt-4 pb-3 shrink-0">
            <button
              onClick={newChat}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12.5px] font-semibold transition-all hover:scale-[1.02]"
              style={{
                background: "var(--ink)",
                color: "white",
                boxShadow: "0 4px 12px -4px rgba(15,18,24,0.30)",
              }}>
              <Plus size={12} strokeWidth={2.4} />
              New chat
              <kbd className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded opacity-70"
                style={{ background: "rgba(255,255,255,0.15)" }}>
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Search */}
          <div className="px-3 pb-2 shrink-0">
            <div className="flex items-center gap-1.5 h-8 px-2.5 rounded-md"
              style={{ background: "var(--bg-deep)", border: "1px solid var(--line)" }}>
              <SearchIcon size={11} strokeWidth={1.8} className="text-muted-2 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search history…"
                className="flex-1 bg-transparent text-[11.5px] outline-none placeholder:text-muted-2"
              />
            </div>
          </div>

          {/* History list */}
          <div className="flex-1 overflow-y-auto px-1.5 pb-3">
            {pinned.length > 0 && (
              <Bucket
                label="Pinned"
                Icon={Pin}
                items={pinned}
                activeId={activeId}
                onSelect={openHistory}
              />
            )}
            {(["today", "yesterday", "week", "older"] as const).map((bucket) => (
              byBucket[bucket].length > 0 && (
                <Bucket
                  key={bucket}
                  label={BUCKET_LABELS[bucket]}
                  items={byBucket[bucket]}
                  activeId={activeId}
                  onSelect={openHistory}
                />
              )
            ))}
            {filtered.length === 0 && (
              <div className="text-center text-[11.5px] text-muted-2 py-8">
                No conversations match "{search}".
              </div>
            )}
          </div>

          <div className="px-3 py-2.5 shrink-0 text-[10px] text-muted-2 leading-relaxed"
            style={{ borderTop: "1px solid var(--line)" }}>
            Click a chat to revisit · ⌘J opens Alphy as a side panel anywhere.
          </div>
        </aside>

        {/* ─── Chat pane ─────────────────────────────────── */}
        <main className="flex-1 min-w-0 flex flex-col">
          <AlphyChat
            key={chatKey}
            variant="page"
            initialMessages={initialMessages}
            onMinimize={() => router.back()}
          />
        </main>
      </div>
    </AppShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
function Bucket({
  label, Icon, items, activeId, onSelect,
}: {
  label: string;
  Icon?: any;
  items: HistoryItem[];
  activeId: string;
  onSelect: (item: HistoryItem) => void;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-1.5 px-2 py-1.5">
        {Icon && <Icon size={9} strokeWidth={2} className="text-muted-2" />}
        <span className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted-2">
          {label}
        </span>
      </div>
      <div className="space-y-px">
        {items.map((h) => (
          <HistoryRow
            key={h.id}
            item={h}
            active={h.id === activeId}
            onClick={() => onSelect(h)}
          />
        ))}
      </div>
    </div>
  );
}

function HistoryRow({
  item, active, onClick,
}: { item: HistoryItem; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left px-2 py-1.5 rounded-md transition-colors relative"
      style={{ background: active ? "var(--bg-deep)" : "transparent" }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--bg-deep)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <div className="flex items-start gap-2">
        <div className="w-5 h-5 rounded grid place-items-center shrink-0 mt-0.5"
          style={{ background: active ? "rgba(38,109,240,0.12)" : "transparent" }}>
          <item.Icon size={10} strokeWidth={1.8}
            style={{ color: active ? ACCENT : "var(--muted-2)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11.5px] font-medium text-ink truncate leading-tight">
            {item.title}
          </div>
          <div className="text-[10.5px] text-muted truncate mt-0.5 leading-tight">
            {item.preview}
          </div>
        </div>
        <span className="text-[9.5px] font-mono tnum text-muted-2 shrink-0 mt-0.5">
          {item.ago}
        </span>
      </div>
      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r-full"
          style={{ background: ACCENT }} />
      )}
    </button>
  );
}
