"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  X, Send, Sparkles, FileText, BarChart3, Mail, ListChecks, Database,
  ShieldCheck, AlertTriangle, Crown, Calendar, ArrowUpRight, Check,
  TrendingUp, TrendingDown, Building2, Target, Users, Zap, RefreshCw,
  Maximize2, Minimize2, Plus, MessageSquare as ChatIcon, Pin, Search as SearchIcon,
  MoreHorizontal, ChevronDown, FolderOpen, Workflow,
} from "lucide-react";
import { Logo } from "./Logo";
import { AlphyMark } from "./AlphyMark";
import { useUser } from "./UserContext";
import { accounts, expansionOpportunities, csmWorkloads, fmtMoney } from "@/lib/mock";

const ACCENT = "#266DF0";

// ─────────────────────────────────────────────────────────────────────
// AlphyPanel — multi-modal agentic assistant.
// Renders the right output type per intent: text · report · chart ·
// table · email · CRM action · list · playbook.
// ─────────────────────────────────────────────────────────────────────

type Output =
  | { kind: "text"; body: string }
  | { kind: "report"; account: string; sections: { label: string; body: string; tone?: string }[]; metrics: { label: string; value: string; tone?: string }[] }
  | { kind: "chart"; chartKind: "bar" | "line" | "donut"; title: string; series: { label: string; value: number; tone?: string }[]; footer?: string }
  | { kind: "table"; title: string; columns: string[]; rows: string[][]; footer?: string }
  | { kind: "email"; to: string; account: string; subject: string; body: string }
  | { kind: "action"; verb: string; entity: string; field: string; from: string; to: string; impact: string }
  | { kind: "list"; title: string; items: { logo?: string; primary: string; secondary?: string; meta?: string; tone?: string }[] }
  | { kind: "playbook"; title: string; trigger: string; steps: string[] };

type Message = {
  role: "user" | "alphy";
  text?: string;
  output?: Output;
  thinking?: boolean;
  status?: "thinking" | "writing" | "done" | "executed";
};

// ─────────────────────────────────────────────────────────────────────
// Sample prompts shown when the conversation is empty
// ─────────────────────────────────────────────────────────────────────

type Suggestion = {
  prompt: string;
  Icon: any;
  hint: string;
};

const SUGGESTIONS: Suggestion[] = [
  { prompt: "Make me a report on Cloudflare",                Icon: FileText,    hint: "Account brief" },
  { prompt: "Show me ARR by quarter",                         Icon: BarChart3,   hint: "Chart" },
  { prompt: "Who's at risk this week?",                      Icon: AlertTriangle, hint: "Risk list" },
  { prompt: "Draft a renewal email to Brad at Snowflake",    Icon: Mail,         hint: "Email draft" },
  { prompt: "Update Snowflake renewal stage to Negotiation", Icon: Database,    hint: "CRM update" },
  { prompt: "What changed today?",                            Icon: Zap,         hint: "Daily brief" },
];

// ─────────────────────────────────────────────────────────────────────
// Intent classifier + output generator
// ─────────────────────────────────────────────────────────────────────

function generateOutput(prompt: string): Output {
  const p = prompt.toLowerCase();

  // Account name resolution helper.
  // Strip punctuation (commas, periods, "Inc.") from the account name so
  // "Cloudflare, Inc." matches a prompt that says "cloudflare".
  const detectAccount = () => {
    return accounts.find((a) => {
      const root = a.name
        .toLowerCase()
        .replace(/(,?\s*inc\.?|,?\s*ltd\.?|,?\s*holdings|,?\s*technologies|software|automotive|energy|group|ag|corporation|paper)$/g, "")
        .replace(/[.,]/g, "")
        .trim();
      const firstWord = root.split(/\s+/)[0];
      // Match either the cleaned root ("cloudflare") or the first word
      return p.includes(root) || p.includes(firstWord);
    });
  };

  // 1. Report on a specific account
  if (/report.*on|brief.*on|summary.*on|tell me about|breakdown of|overview of/.test(p)) {
    const acct = detectAccount() ?? accounts.find((a) => a.status === "Customer");
    if (acct) {
      return {
        kind: "report",
        account: acct.name,
        metrics: [
          { label: "ARR",      value: fmtMoney(acct.arr || 720000) },
          { label: "Health",   value: String(acct.healthScore), tone: acct.healthScore >= 75 ? "var(--pos)" : acct.healthScore >= 60 ? "var(--warn)" : "var(--neg)" },
          { label: "Renewal",  value: acct.renewalDays > 0 ? `${acct.renewalDays}d` : "—" },
          { label: "NRR",      value: acct.nrr ? `${acct.nrr}%` : "—" },
        ],
        sections: [
          { label: "Overview",       body: `${acct.name} is a ${acct.tier} ${acct.segment} customer in ${acct.industry}. ${acct.signal}.` },
          { label: "Health drivers",  body: acct.healthScore >= 75
              ? "Strong sponsor cadence, WAU/MAU stable, support burden low. Hit 92% of plan limits 3× this quarter — expansion signal."
              : "Sponsor coverage thinning. Usage trending sideways. Two power users dormant 14+ days. Worth a value-snapshot reach-out this week.",
          },
          { label: "Expansion thesis", body: acct.watchlist === "Upsell Likely"
              ? "High signal — bundle networking with security ahead of renewal. Comparable accounts converted in ~38 days."
              : "Modest expansion ceiling — focus on protecting existing footprint and surfacing one new use case in next QBR.",
          },
          { label: "Recommended next move", body: acct.healthScore < 60
              ? "Run save play before renewal call. Loop in exec sponsor and schedule emergency check-in."
              : "Build expansion case for next QBR. Draft business case with comparable customer wins.",
            tone: acct.healthScore < 60 ? "var(--neg)" : ACCENT },
        ],
      };
    }
  }

  // 2. Chart / graph
  if (/chart|graph|distribution|breakdown|donut|pie|bar|line|trend|history|over time|by quarter|by stage|by segment|by rep/.test(p) ||
      /show me .*(arr|revenue|nps|score|health|ratio|coverage|usage|adoption)/.test(p)) {
    if (p.includes("arr") || p.includes("revenue")) {
      return {
        kind: "chart",
        chartKind: "bar",
        title: "ARR by quarter — last 4 quarters",
        series: [
          { label: "Q3 '25", value: 6_800_000, tone: "var(--ink-2)" },
          { label: "Q4 '25", value: 7_400_000, tone: "var(--ink-2)" },
          { label: "Q1 '26", value: 8_100_000, tone: "var(--ink-2)" },
          { label: "Q2 '26", value: 8_780_000, tone: ACCENT },
        ],
        footer: "+29% YoY · expansion-led growth",
      };
    }
    if (p.includes("nps") || p.includes("score")) {
      return {
        kind: "chart",
        chartKind: "line",
        title: "NPS · last 7 quarters",
        series: [
          { label: "Q4 '24", value: 28 },
          { label: "Q1 '25", value: 32 },
          { label: "Q2 '25", value: 35 },
          { label: "Q3 '25", value: 38 },
          { label: "Q4 '25", value: 36 },
          { label: "Q1 '26", value: 40 },
          { label: "Q2 '26", value: 42 },
        ],
        footer: "Best in 7 quarters · +14 from baseline",
      };
    }
    return {
      kind: "chart",
      chartKind: "donut",
      title: "Customer health · book distribution",
      series: [
        { label: "Healthy",  value: 62, tone: "var(--pos)" },
        { label: "Watch",    value: 24, tone: "var(--warn)" },
        { label: "At risk",  value: 14, tone: "var(--neg)" },
      ],
      footer: "5 customers · sorted by health score",
    };
  }

  // 3. CRM action / update
  if (/update|change|set|move|reassign|promote/.test(p)) {
    const acct = detectAccount() ?? accounts.find((a) => a.status === "Customer")!;
    if (p.includes("stage") || p.includes("negotiation") || p.includes("proposal")) {
      return {
        kind: "action",
        verb: "Update opportunity stage",
        entity: `${acct.name} renewal`,
        field: "Stage",
        from: "Proposal",
        to: p.includes("negotiation") ? "Negotiation" : "Closed Won",
        impact: "Moves $480K into commit · forecast confidence +6 pts",
      };
    }
    if (p.includes("owner") || p.includes("reassign")) {
      return {
        kind: "action",
        verb: "Reassign account owner",
        entity: acct.name,
        field: "Account owner",
        from: "Brad Allen",
        to: "Derek Evans",
        impact: "Brad's workload score 82 → 71 · Derek's 35 → 47",
      };
    }
    return {
      kind: "action",
      verb: "Update CRM record",
      entity: acct.name,
      field: "Status",
      from: "Active",
      to: "Renewal in flight",
      impact: "Triggers renewal playbook · adds to runway",
    };
  }

  // 4. Email / draft
  if (/email|draft|follow.up|message|reach out|congrats|reply/.test(p)) {
    const acct = detectAccount() ?? accounts.find((a) => a.name.includes("Snowflake"))!;
    const renewal = p.includes("renewal");
    const congrats = p.includes("congrat");
    return {
      kind: "email",
      to: renewal ? "Brad Wallace · VP Sales Ops" : congrats ? "Maya Chen · VP Engineering" : "Sponsor · primary contact",
      account: acct.name,
      subject: renewal ? "Ahead of the renewal — quick check-in"
              : congrats ? "Congrats on the promotion"
              : `Quick note on ${acct.name}`,
      body: renewal ? `Hi Brad,\n\nWith renewal 47 days out, I want to surface a few things ahead of our next sync. Since James left, you're carrying continuity risk on your own — I'd rather flag it now than be surprised later.\n\nWould 20 minutes this week work to walk through the value picture together?\n\nThanks,\nPragyan`
            : congrats ? `Hi Maya,\n\nCongrats on the promotion — well-deserved. With your expanded scope into Networking and Security, there's a bundle that would simplify procurement.\n\nHappy to walk through Tuesday if useful.\n\n— Pragyan`
            : `Hi,\n\nQuick note on ${acct.name} — wanted to make sure we're aligned on the next steps. Worth 20 minutes this week?\n\nThanks,\nPragyan`,
    };
  }

  // 5. Risk list / who's at risk
  if (/at risk|risky|risk this week|churn risk|need attention|silent|stale/.test(p)) {
    const risky = accounts.filter((a) => a.status === "Customer" && a.healthScore < 70).slice(0, 5);
    return {
      kind: "list",
      title: "Accounts needing attention this week",
      items: risky.map((a) => ({
        logo: a.name,
        primary: a.name,
        secondary: a.signal,
        meta: a.renewalDays > 0 ? `${a.renewalDays}d to renewal` : `Health ${a.healthScore}`,
        tone: a.healthScore < 50 ? "var(--neg)" : "var(--warn)",
      })),
    };
  }

  // 6. What changed / daily brief
  if (/what changed|today|brief|happenings|news/.test(p)) {
    return {
      kind: "list",
      title: "What changed since yesterday",
      items: [
        { logo: "Snowflake",   primary: "Brad Wallace silent 14 days",     secondary: "Renewal at risk · sponsor coverage dropped",           meta: "2h",  tone: "var(--neg)" },
        { logo: "GitLab",      primary: "WAU/MAU dropped to 0.48",         secondary: "Three teams now inactive · adoption decay",            meta: "4h",  tone: "var(--warn)" },
        { logo: "Cloudflare",  primary: "Maya Chen promoted to VP Eng",    secondary: "Budget +75% · Networking + Security now in scope",     meta: "12h", tone: "var(--pos)" },
        { logo: "Akamai",      primary: "QBR overdue 14 days",             secondary: "Priya is new to the role · narrative stale",           meta: "1d",  tone: "var(--warn)" },
        { logo: "Tableau",     primary: "12 new seats added",               secondary: "ML team forming · governance gap flagged",            meta: "2d",  tone: "var(--info)" },
      ],
    };
  }

  // 7. Forecast / number / pipeline
  if (/forecast|my number|target|quota|attainment/.test(p)) {
    return {
      kind: "report",
      account: "Q3 forecast",
      metrics: [
        { label: "Target",     value: "$1.80M" },
        { label: "Commit",     value: "$1.24M", tone: "var(--pos)" },
        { label: "Best case",  value: "$1.54M", tone: ACCENT },
        { label: "Plan",       value: "$1.75M" },
      ],
      sections: [
        { label: "Headline",        body: "On pace to hit commit. Best-case lands you at 86% of target. Three deals at $620K combined will get you to plan if they convert in the next 32 days." },
        { label: "Top 3 deals to watch", body: "Cloudflare AI Copilot ($120K, Negotiation, 8d) · Snowflake renewal ($480K, Proposal, 47d) · Tableau ML expansion ($90K, Discovery, 14d)." },
        { label: "Risk",             body: "Pipeline coverage in Mid-Market is at 0.9x. You'll need 2 more qualified opps in the next two weeks to lock plan." },
        { label: "Recommended next move", body: "Book exec re-engagement on Snowflake this week. Multithread Cloudflare with the new VP Eng. Open Boston Dynamics for Mid-Market coverage.", tone: ACCENT },
      ],
    };
  }

  // 8. Capacity / team
  if (/capacity|team|reps|workload|overloaded/.test(p)) {
    return {
      kind: "table",
      title: "Team workload · this week",
      columns: ["Rep", "Accounts", "ARR", "Workload", "Status"],
      rows: csmWorkloads.slice(0, 5).map((c) => [
        c.name,
        String(c.accounts),
        fmtMoney(c.totalArr),
        String(c.workloadScore),
        c.workloadScore >= 75 ? "Overloaded" : c.workloadScore >= 50 ? "On track" : "Has room",
      ]),
      footer: "2 overloaded · 3 on track · 1 has room",
    };
  }

  // 9. Playbook / how do i / next steps
  if (/playbook|how do i|how should i|what.*next steps|recovery/.test(p)) {
    return {
      kind: "playbook",
      title: "Recovery playbook · sponsor silence",
      trigger: "When champion silent 14+ days and renewal in 90 days or less",
      steps: [
        "Loop in exec sponsor — VP CS in #cs-escalations",
        "Schedule emergency check-in this week",
        "Resolve any open P0 tickets — escalate to L2",
        "Re-engage two dormant power users with personal email",
        "Send 30-day adoption recap to champion",
      ],
    };
  }

  // 10. Default fallback — text answer
  return {
    kind: "text",
    body: "I can pull reports, draft emails, build charts, run save plays, and update CRM records. Try one of the suggestions below — or ask anything about your accounts, deals, or signals.",
  };
}

// ─────────────────────────────────────────────────────────────────────
// Shared chat hook + render — used by both AlphyPanel and AlphyPage.
// ─────────────────────────────────────────────────────────────────────

function useAlphyChat(initialMessages: Message[] = []) {
  const [q, setQ] = useState("");
  // If the only initial message is a user prompt with no Alphy response,
  // skip seeding `msgs` directly — we'll fire `ask()` on mount instead so
  // the user sees the same thinking → output animation as a fresh send.
  const seedAsAsk =
    initialMessages.length === 1 &&
    initialMessages[0].role === "user" &&
    !!initialMessages[0].text;
  const [msgs, setMsgs] = useState<Message[]>(seedAsAsk ? [] : initialMessages);

  const ask = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", text: text.trim() };
    setMsgs((m) => [...m, userMsg, { role: "alphy", thinking: true, status: "thinking" }]);
    setQ("");
    setTimeout(() => {
      setMsgs((m) => {
        const c = [...m];
        c[c.length - 1] = { role: "alphy", thinking: false, status: "writing" };
        return c;
      });
    }, 600);
    setTimeout(() => {
      const output = generateOutput(text);
      setMsgs((m) => {
        const c = [...m];
        c[c.length - 1] = {
          role: "alphy",
          output,
          status: output.kind === "action" ? "writing" : "done",
        };
        return c;
      });
    }, 1300);
  };

  // Auto-fire on mount if seeded with a user prompt.
  // Use a ref guard so React 18 StrictMode doesn't fire the seed twice
  // (which would create duplicate user messages).
  const seededRef = useRef(false);
  useEffect(() => {
    if (seedAsAsk && !seededRef.current) {
      seededRef.current = true;
      ask(initialMessages[0].text!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { q, setQ, msgs, ask };
}

// Inner conversation surface (header / scroll area / composer) — no chrome
export function AlphyChat({
  variant,
  initialMessages,
  onMinimize,
  onExpand,
  onClose,
}: {
  variant: "panel" | "page";
  initialMessages?: Message[];
  onMinimize?: () => void;
  onExpand?: () => void;
  onClose?: () => void;
}) {
  const { q, setQ, msgs, ask } = useAlphyChat(initialMessages);
  const { user } = useUser();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Selected model — visual only
  const [model, setModel] = useState<string>("Claude Opus 4.7");
  const [modelOpen, setModelOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [msgs]);

  const isPage = variant === "page";
  const empty = msgs.length === 0;

  // Composer block — reused in both empty-state (Harvey-style centred) and
  // post-send (pinned to bottom) layouts.
  const Composer = (
    <div className="rounded-2xl overflow-hidden transition-all focus-within:shadow-md"
      style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
      <textarea
        ref={inputRef}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            ask(q);
          }
        }}
        rows={empty ? 2 : 1}
        placeholder="Ask Alphy anything — draft, query, update, build…"
        className="w-full bg-transparent text-[14px] px-5 pt-4 pb-2 outline-none placeholder:text-muted-2 resize-none"
        style={{ minHeight: empty ? 60 : 44, maxHeight: 200, fontFamily: "inherit" }}
      />
      <div className="flex items-center justify-between gap-2 px-3 pb-2.5">
        <div className="flex items-center gap-0.5 flex-wrap">
          <ToolChip Icon={Plus}        label="Add"      />
          <ToolChip Icon={Building2}   label="Accounts" />
          <ToolChip Icon={Database}    label="CRM"      />
          <ToolChip Icon={FolderOpen}  label="Projects" />
          <ToolChip Icon={Workflow}    label="Workflows" />
        </div>
        <div className="flex items-center gap-1.5 shrink-0 relative">
          <button
            onClick={() => setModelOpen(!modelOpen)}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-md transition-colors hover:bg-bg-deep"
            style={{ color: "var(--ink-2)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--pos)" }} />
            {model}
            <ChevronDown size={11} strokeWidth={1.8}
              className="transition-transform"
              style={{ transform: modelOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
          </button>
          {modelOpen && (
            <div className="absolute bottom-full right-0 mb-1.5 rounded-lg overflow-hidden z-10 min-w-[200px]"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                boxShadow: "0 8px 24px -8px rgba(15,18,24,0.18)",
              }}>
              {[
                { name: "Claude Opus 4.7",  hint: "Highest quality · slower" },
                { name: "Claude Sonnet 4.7",hint: "Balanced · default" },
                { name: "Claude Haiku 4.7", hint: "Fastest · simpler tasks" },
                { name: "GPT-5",            hint: "Cross-check / second opinion" },
              ].map((m) => (
                <button
                  key={m.name}
                  onClick={() => { setModel(m.name); setModelOpen(false); }}
                  className="w-full text-left px-3 py-2 transition-colors hover:bg-bg-deep flex items-center gap-2.5"
                >
                  {m.name === model ? (
                    <Check size={11} strokeWidth={2.4} style={{ color: ACCENT }} />
                  ) : (
                    <span className="w-[11px]" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-medium text-ink truncate">{m.name}</div>
                    <div className="text-[10.5px] text-muted-2 truncate">{m.hint}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
          <button onClick={() => ask(q)} disabled={!q.trim()}
            className="w-8 h-8 rounded-md grid place-items-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: q.trim() ? "var(--ink)" : "var(--bg-deep)", color: q.trim() ? "white" : "var(--muted-2)" }}>
            <Send size={12} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header — only show in panel mode (page mode uses centred empty state) */}
      {(!empty || !isPage) && (
        <header
          className={`flex items-center justify-between shrink-0 ${isPage ? "px-8 py-5" : "px-6 py-4"}`}
          style={{ borderBottom: "1px solid var(--line)" }}
        >
          <div className="flex items-center gap-2.5">
            <div className={`rounded-xl grid place-items-center relative overflow-hidden ${isPage ? "w-10 h-10" : "w-8 h-8"}`}
              style={{
                background: "linear-gradient(135deg, rgba(38,109,240,0.14), rgba(124,58,237,0.08))",
                border: "1px solid rgba(38,109,240,0.20)",
              }}>
              <AlphyMark size={isPage ? 18 : 14} color={ACCENT} strokeWidth={1.6} />
            </div>
            <div>
              <div className={`font-semibold text-ink leading-tight ${isPage ? "text-[16px]" : "text-[14px]"}`}
                style={{ letterSpacing: "-0.012em" }}>
                Alphy
              </div>
              <div className="text-[10px] text-muted inline-flex items-center gap-1 mt-0.5">
                <span className="w-1 h-1 rounded-full" style={{ background: "var(--pos)" }} />
                Online · {model}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onExpand && (
              <button onClick={onExpand}
                title="Open as page"
                className="w-7 h-7 rounded-lg grid place-items-center text-muted hover:text-ink hover:bg-bg-deep transition-colors">
                <Maximize2 size={12} strokeWidth={1.8} />
              </button>
            )}
            {onMinimize && (
              <button onClick={onMinimize}
                title="Minimize to sidebar"
                className="w-7 h-7 rounded-lg grid place-items-center text-muted hover:text-ink hover:bg-bg-deep transition-colors">
                <Minimize2 size={12} strokeWidth={1.8} />
              </button>
            )}
            {onClose && (
              <button onClick={onClose}
                className="w-7 h-7 rounded-lg grid place-items-center text-muted hover:text-ink hover:bg-bg-deep transition-colors">
                <X size={13} strokeWidth={1.8} />
              </button>
            )}
          </div>
        </header>
      )}

      {/* Body */}
      {empty && isPage ? (
        // ── Harvey-style centred empty state (page only) ─────────────
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
          <div className="w-full max-w-[720px]">
            {/* Greeting */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <AlphyMark size={36} color="var(--ink)" strokeWidth={1.4} />
              <h1
                className="text-[34px] md:text-[40px] text-ink leading-none"
                style={{
                  fontFamily: "ui-serif, Georgia, 'Times New Roman', serif",
                  fontWeight: 400,
                  letterSpacing: "-0.022em",
                }}
              >
                Hi, {user.firstName}
              </h1>
            </div>

            {/* Composer */}
            {Composer}

            {/* Sample prompts — small chips below the input */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
              {SUGGESTIONS.slice(0, 4).map((s) => (
                <button
                  key={s.prompt}
                  onClick={() => ask(s.prompt)}
                  className="inline-flex items-center gap-1.5 text-[11.5px] font-medium px-3 py-1.5 rounded-full transition-colors hover:bg-bg-deep"
                  style={{ background: "var(--surface)", color: "var(--ink-2)", border: "1px solid var(--line)" }}>
                  <s.Icon size={11} strokeWidth={1.8} className="text-muted-2" />
                  {s.prompt}
                </button>
              ))}
            </div>

            <div className="text-[10.5px] text-muted-2 text-center mt-6">
              Alphy can draft, query, and execute. Always review CRM updates before approving.
            </div>
          </div>
        </div>
      ) : (
        // ── Standard chat layout — body + bottom composer ───────────
        <>
          <div
            ref={scrollRef}
            className={`flex-1 overflow-y-auto ${isPage ? "px-8 py-7" : "px-6 py-5"}`}
          >
            {empty ? (
              <div className={isPage ? "max-w-[760px] mx-auto" : ""}>
                <EmptyState onPick={ask} variant={variant} />
              </div>
            ) : (
              <div className={`space-y-5 ${isPage ? "max-w-[760px] mx-auto" : ""}`}>
                {msgs.map((m, i) => (
                  <MessageBlock key={i} message={m} />
                ))}
              </div>
            )}
          </div>

          {/* Composer pinned to bottom */}
          <div className={`${isPage ? "px-8 py-5" : "px-5 py-4"} shrink-0`}
            style={{ borderTop: "1px solid var(--line)" }}>
            <div className={isPage ? "max-w-[760px] mx-auto" : ""}>
              {Composer}
              <div className="text-[10px] text-muted-2 mt-2 text-center">
                Alphy can draft, query, and execute. Always review CRM updates before approving.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Slide-in panel wrapper
// ─────────────────────────────────────────────────────────────────────

export function AlphyPanel({ open, onClose, onExpand }: {
  open: boolean;
  onClose: () => void;
  onExpand?: () => void;
}) {
  // Optional preloaded conversation — set by the AM tour via the
  // `alphard:alphy-run` event with `{ prompt, artifact }`.
  const [seed, setSeed] = useState<{ messages: Message[]; key: number } | null>(null);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Listen for tour-driven artifact requests
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { prompt?: string; artifact?: string } | undefined;
      if (!detail) return;
      if (detail.artifact === "expansion-case") {
        setSeed({
          key: Date.now(),
          messages: [
            { role: "user", text: detail.prompt ?? "Build expansion business case for Cloudflare" },
            {
              role: "alphy",
              status: "done",
              output: {
                kind: "report",
                account: "Cloudflare",
                sections: [
                  { label: "Executive Summary",
                    body: "Cloudflare is at $720K ARR, 124% NRR, renewal in 178 days. Champion Maya Chen was just promoted to VP Engineering — her budget now spans Networking + Security. Bundling the two SKUs into a single 12-month contract maps to her new scope and unlocks $215K expansion before procurement consolidates with another vendor.",
                    tone: "neutral" },
                  { label: "ROI Math",
                    body: "Networking SKU usage up +38% WoW — under-provisioned at current tier. Combined Networking + Security bundle: $215K incremental ARR, 14-month payback. Avoided cost of single-vendor consolidation: $420K over 3 years. Time-to-value for Security: 11 days.",
                    tone: "pos" },
                  { label: "Comparable Win — Datadog",
                    body: "Datadog landed the same combined-tier bundle at comparable scale (3,400 employees, $720K starting ARR) in Q4 2025. Result: 3.2× pipeline visibility and the largest single-quarter NRR contribution that year. Champion was also a newly promoted VP Eng — pattern is a near-mirror.",
                    tone: "pos" },
                  { label: "Risks",
                    body: "InfoSec review with Owen Mitchell still scheduling. Procurement (Priya Sharma) silent 11d. VP Sales Rebecca Chu flagged as detractor — neutralise before steering.",
                    tone: "warn" },
                  { label: "Recommended Next Steps",
                    body: "1) Reply to Maya with this case attached today.  2) Combined-tier walkthrough with Maya + Owen Mitchell by Friday.  3) Avoided-cost story to Naomi Walker (CFO) Monday.  4) Pull Datadog reference call within 7 days.",
                    tone: "neutral" },
                ],
                metrics: [
                  { label: "Incremental ARR", value: "$215K",   tone: "pos" },
                  { label: "Payback",          value: "14 mo",  tone: "neutral" },
                  { label: "TTV",              value: "11 d",   tone: "pos" },
                  { label: "Confidence",       value: "High",   tone: "pos" },
                ],
              },
            },
          ],
        });
      }
    };
    window.addEventListener("alphard:alphy-run", handler);
    return () => window.removeEventListener("alphard:alphy-run", handler);
  }, []);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-ink/30 backdrop-blur-[2px] z-[90] alphy-fade" onClick={onClose} />
      <aside
        className="fixed top-3 right-3 bottom-3 w-full md:w-[600px] z-[95] alphy-anim rounded-2xl overflow-hidden"
        style={{
          maxWidth: "calc(100vw - 24px)",
          background: "var(--bg)",
          border: "1px solid var(--line)",
          boxShadow: "0 24px 60px -16px rgba(15,18,24,0.30), -22px 0 60px -22px rgba(15,18,24,0.18)",
        }}
      >
        <AlphyChat
          key={seed?.key ?? "default"}
          variant="panel"
          initialMessages={seed?.messages}
          onClose={() => { setSeed(null); onClose(); }}
          onExpand={onExpand}
        />
        <style jsx>{`
          @keyframes alphyIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          .alphy-anim { animation: alphyIn 360ms cubic-bezier(0.22, 1, 0.36, 1); }
          @keyframes alphyFade { from { opacity: 0; } to { opacity: 1; } }
          .alphy-fade { animation: alphyFade 220ms ease-out; }
        `}</style>
      </aside>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────────
function EmptyState({ onPick, variant = "panel" }: { onPick: (s: string) => void; variant?: "panel" | "page" }) {
  const isPage = variant === "page";
  return (
    <div className={isPage ? "pt-12" : "pt-6"}>
      <div className={`mb-7 ${isPage ? "max-w-2xl text-center mx-auto" : "max-w-sm"}`}>
        <div className={`rounded-xl grid place-items-center mb-4 ${isPage ? "w-14 h-14 mx-auto" : "w-10 h-10"}`}
          style={{
            background: "linear-gradient(135deg, rgba(38,109,240,0.18), rgba(124,58,237,0.10))",
            border: "1px solid rgba(38,109,240,0.22)",
          }}>
          <AlphyMark size={isPage ? 22 : 18} color={ACCENT} strokeWidth={1.6} />
        </div>
        <h2 className={`font-semibold text-ink leading-tight mb-2 ${isPage ? "text-[28px]" : "text-[20px]"}`}
          style={{ letterSpacing: "-0.022em" }}>
          What should I do for you?
        </h2>
        <p className={`text-muted leading-relaxed ${isPage ? "text-[14px]" : "text-[12.5px]"}`}>
          Alphy can draft messages, build reports, query your data, run save plays, and update records — all from natural language.
        </p>
      </div>

      <div className={`text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-2.5 ${isPage ? "text-center" : ""}`}>
        Try one of these
      </div>
      <div className={`grid gap-2 ${isPage ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
        {SUGGESTIONS.map((s) => (
          <button
            key={s.prompt}
            type="button"
            onClick={() => onPick(s.prompt)}
            className="text-left rounded-lg p-3 transition-all hover:shadow-sm hover:-translate-y-px hover:border-line-strong"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          >
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-md grid place-items-center shrink-0"
                style={{ background: "var(--bg-deep)" }}>
                <s.Icon size={12} strokeWidth={1.8} className="text-ink-2" />
              </div>
              <div className="min-w-0">
                <div className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-muted-2 mb-0.5">
                  {s.hint}
                </div>
                <div className="text-[12px] text-ink leading-snug">{s.prompt}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ToolChip({ Icon, label }: { Icon: any; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-muted px-1.5 py-0.5 rounded transition-colors hover:bg-bg-deep">
      <Icon size={9} strokeWidth={1.8} /> {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Message rendering
// ─────────────────────────────────────────────────────────────────────

function MessageBlock({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end animate-msg-in">
        <div className="max-w-[80%] px-3.5 py-2.5 rounded-2xl rounded-tr-md text-[12.5px] leading-relaxed"
          style={{ background: "var(--ink)", color: "white" }}>
          {message.text}
        </div>
        <style jsx>{`
          @keyframes msgIn {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-msg-in { animation: msgIn 220ms ease-out; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 animate-msg-in">
      <div className="w-7 h-7 rounded-lg grid place-items-center shrink-0 mt-0.5 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(38,109,240,0.14), rgba(124,58,237,0.08))",
          border: "1px solid rgba(38,109,240,0.20)",
        }}>
        <AlphyMark size={12} color={ACCENT} strokeWidth={1.6} />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        {message.thinking ? (
          <ThinkingDots />
        ) : message.output ? (
          <OutputBlock output={message.output} />
        ) : message.text ? (
          <div className="text-[12.5px] text-ink leading-relaxed">{message.text}</div>
        ) : null}
      </div>
      <style jsx>{`
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-msg-in { animation: msgIn 220ms ease-out; }
      `}</style>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="inline-flex items-center gap-1.5 py-2">
      <span className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse" style={{ animationDelay: "0ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse" style={{ animationDelay: "200ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse" style={{ animationDelay: "400ms" }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Output renderers — one per kind
// ─────────────────────────────────────────────────────────────────────

function OutputBlock({ output }: { output: Output }) {
  switch (output.kind) {
    case "text":     return <TextOut out={output} />;
    case "report":   return <ReportOut out={output} />;
    case "chart":    return <ChartOut out={output} />;
    case "table":    return <TableOut out={output} />;
    case "email":    return <EmailOut out={output} />;
    case "action":   return <ActionOut out={output} />;
    case "list":     return <ListOut out={output} />;
    case "playbook": return <PlaybookOut out={output} />;
  }
}

function TextOut({ out }: { out: Extract<Output, { kind: "text" }> }) {
  return <Typewriter text={out.body} />;
}

function Typewriter({ text }: { text: string }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [text]);
  return (
    <div className="text-[12.5px] text-ink leading-relaxed">
      {shown}
      {shown.length < text.length && (
        <span className="inline-block w-[2px] h-[12px] ml-0.5 align-middle animate-pulse"
          style={{ background: ACCENT }} />
      )}
    </div>
  );
}

function ReportOut({ out }: { out: Extract<Output, { kind: "report" }> }) {
  return (
    <div className="rounded-xl overflow-hidden output-fade"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--line)", background: "var(--bg-deep)" }}>
        <div className="flex items-center gap-2 mb-2.5">
          {out.account.length < 30 && <Logo name={out.account} size={18} rounded={4} />}
          <div className="text-[13px] font-semibold text-ink"
            style={{ letterSpacing: "-0.01em" }}>
            {out.account}
          </div>
          <span className="ml-auto text-[9.5px] font-mono uppercase tracking-[0.08em] text-muted-2">Report</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {out.metrics.map((m, i) => (
            <div key={i}>
              <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-2 mb-0.5">{m.label}</div>
              <div className="text-[14px] font-bold tnum" style={{ color: m.tone ?? "var(--ink)", letterSpacing: "-0.01em" }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 py-3 space-y-3">
        {out.sections.map((s, i) => (
          <div key={i} className="output-fade" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1">{s.label}</div>
            <p className="text-[12px] leading-relaxed" style={{ color: s.tone ?? "var(--ink-2)" }}>{s.body}</p>
          </div>
        ))}
      </div>
      <OutputFooterActions />
      <style jsx>{`
        @keyframes outputFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .output-fade { animation: outputFade 460ms ease-out backwards; }
      `}</style>
    </div>
  );
}

function ChartOut({ out }: { out: Extract<Output, { kind: "chart" }> }) {
  return (
    <div className="rounded-xl p-4 output-fade"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[13px] font-semibold text-ink" style={{ letterSpacing: "-0.01em" }}>
          {out.title}
        </div>
        <span className="text-[9.5px] font-mono uppercase tracking-[0.08em] text-muted-2">{out.chartKind} chart</span>
      </div>

      {out.chartKind === "bar" && <BarChart series={out.series} />}
      {out.chartKind === "line" && <LineChart series={out.series} />}
      {out.chartKind === "donut" && <DonutChart series={out.series} />}

      {out.footer && (
        <div className="text-[11px] text-muted mt-3 pt-3 border-t border-line">{out.footer}</div>
      )}
      <style jsx>{`
        @keyframes outputFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .output-fade { animation: outputFade 460ms ease-out; }
      `}</style>
    </div>
  );
}

function BarChart({ series }: { series: Extract<Output, { kind: "chart" }>["series"] }) {
  const max = Math.max(...series.map((s) => s.value));
  const fmtVal = (v: number) =>
    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
    : v >= 1_000   ? `${(v / 1_000).toFixed(0)}K`
    : `${v}`;

  return (
    <div className="bar-chart">
      {/* Plot — fixed-height flex row with full-height columns so bar % resolves correctly */}
      <div className="relative h-[150px]"
        style={{ borderBottom: "1px solid var(--line)" }}>
        {/* Subtle gridlines */}
        {[0.25, 0.5, 0.75].map((t) => (
          <div key={t} className="absolute left-0 right-0 pointer-events-none"
            style={{
              bottom: `${t * 100}%`,
              borderTop: "1px dashed var(--line)",
              opacity: 0.4,
            }} />
        ))}
        <div className="flex items-end gap-3 h-full px-1">
          {series.map((s, i) => {
            const heightPct = max > 0 ? (s.value / max) * 100 : 0;
            const tone = s.tone ?? "var(--ink-2)";
            return (
              <div key={i} className="flex-1 h-full flex flex-col items-center justify-end gap-1.5 group">
                <div className="text-[10.5px] font-mono tnum text-ink-2 font-semibold leading-none">
                  {fmtVal(s.value)}
                </div>
                <div
                  className="w-full rounded-t-md transition-all bar-grow relative overflow-hidden"
                  style={{
                    height: `${heightPct}%`,
                    background: `linear-gradient(180deg, ${tone}, ${tone}dd)`,
                    boxShadow: `0 1px 0 ${tone}`,
                    animationDelay: `${i * 90}ms`,
                  }}
                >
                  {/* Soft top sheen */}
                  <span className="absolute inset-x-0 top-0 h-[40%]"
                    style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.12), transparent)" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* X-axis labels */}
      <div className="flex gap-3 mt-2.5 px-1">
        {series.map((s, i) => (
          <div key={i} className="flex-1 text-[10px] font-mono uppercase tracking-[0.08em] text-muted-2 text-center">
            {s.label}
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes barGrow { from { height: 0; opacity: 0; } to { opacity: 1; } }
        .bar-grow { animation: barGrow 700ms cubic-bezier(0.22, 1, 0.36, 1) backwards; }
      `}</style>
    </div>
  );
}

function LineChart({ series }: { series: Extract<Output, { kind: "chart" }>["series"] }) {
  const max = Math.max(...series.map((s) => s.value));
  const min = Math.min(...series.map((s) => s.value));
  const w = 480, h = 110, pad = 8;
  const points = series.map((s, i) => {
    const x = pad + (i / (series.length - 1)) * (w - 2 * pad);
    const y = h - pad - ((s.value - min) / (max - min || 1)) * (h - 2 * pad);
    return { x, y, ...s };
  });
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L ${w - pad},${h - pad} L ${pad},${h - pad} Z`;
  return (
    <div className="overflow-hidden">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-[110px]">
        <defs>
          <linearGradient id="linefill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.25" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#linefill)" />
        <path d={linePath} fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill={ACCENT} stroke="var(--bg)" strokeWidth="1.5" />
        ))}
      </svg>
      <div className="flex justify-between text-[9.5px] font-mono text-muted-2 mt-1.5 px-1">
        {series.map((s, i) => (
          <span key={i} className={i === 0 || i === series.length - 1 ? "" : "hidden sm:inline"}>{s.label}</span>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ series }: { series: Extract<Output, { kind: "chart" }>["series"] }) {
  const total = series.reduce((s, x) => s + x.value, 0);
  const r = 38;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 100 100" className="w-[100px] h-[100px] shrink-0 -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--bg-deep)" strokeWidth="12" />
        {series.map((s, i) => {
          const len = (s.value / total) * c;
          const dasharray = `${len} ${c}`;
          const dashoffset = -offset;
          offset += len;
          return (
            <circle key={i} cx="50" cy="50" r={r} fill="none"
              stroke={s.tone ?? ACCENT} strokeWidth="12"
              strokeDasharray={dasharray} strokeDashoffset={dashoffset} />
          );
        })}
      </svg>
      <div className="flex-1 space-y-1.5">
        {series.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.tone ?? ACCENT }} />
            <span className="text-[11.5px] text-ink-2 flex-1">{s.label}</span>
            <span className="text-[12px] font-semibold tnum" style={{ color: s.tone ?? "var(--ink)" }}>{s.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableOut({ out }: { out: Extract<Output, { kind: "table" }> }) {
  return (
    <div className="rounded-xl overflow-hidden output-fade"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--line)", background: "var(--bg-deep)" }}>
        <div className="text-[13px] font-semibold text-ink" style={{ letterSpacing: "-0.01em" }}>{out.title}</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {out.columns.map((col, i) => (
                <th key={i} className="text-left text-[9.5px] font-semibold uppercase tracking-[0.08em] text-muted-2 px-4 py-2"
                  style={{ borderBottom: "1px solid var(--line)" }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {out.rows.map((row, i) => (
              <tr key={i} className="row-fade" style={{ animationDelay: `${i * 60}ms` }}>
                {row.map((cell, j) => (
                  <td key={j} className="text-[11.5px] text-ink-2 px-4 py-2 tnum"
                    style={{ borderBottom: i === out.rows.length - 1 ? "none" : "1px solid var(--line)" }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {out.footer && (
        <div className="px-4 py-2.5 text-[11px] text-muted"
          style={{ borderTop: "1px solid var(--line)", background: "var(--bg-deep)" }}>
          {out.footer}
        </div>
      )}
      <style jsx>{`
        @keyframes outputFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .output-fade { animation: outputFade 460ms ease-out; }
        @keyframes rowFade { from { opacity: 0; transform: translateX(-4px); } to { opacity: 1; transform: translateX(0); } }
        .row-fade { animation: rowFade 360ms ease-out backwards; }
      `}</style>
    </div>
  );
}

function EmailOut({ out }: { out: Extract<Output, { kind: "email" }> }) {
  const [sent, setSent] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden output-fade"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
      <div className="px-4 py-3 grid grid-cols-[60px_1fr] gap-y-2 gap-x-3 items-center"
        style={{ borderBottom: "1px solid var(--line)" }}>
        <span className="text-[10.5px] text-muted-2 font-medium">To</span>
        <span className="text-[11.5px] text-ink-2 truncate">{out.to} · {out.account}</span>
        <span className="text-[10.5px] text-muted-2 font-medium">Subject</span>
        <span className="text-[12px] font-semibold text-ink truncate">{out.subject}</span>
      </div>
      <div className="px-4 py-3 text-[12px] text-ink leading-[1.65] whitespace-pre-wrap">
        {out.body}
      </div>
      <div className="px-4 py-3 flex items-center justify-end gap-2"
        style={{ borderTop: "1px solid var(--line)", background: "var(--bg-deep)" }}>
        {sent ? (
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-pos"
            style={{ color: "var(--pos)" }}>
            <Check size={12} strokeWidth={2.4} /> Sent
          </span>
        ) : (
          <>
            <button className="text-[11.5px] font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-bg-deep"
              style={{ background: "var(--surface)", color: "var(--ink-2)", border: "1px solid var(--line)" }}>
              Edit
            </button>
            <button onClick={() => setSent(true)}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1.5 rounded-lg text-white transition-transform hover:scale-[1.02]"
              style={{ background: "var(--ink)" }}>
              <Send size={11} strokeWidth={2.2} /> Approve &amp; send
            </button>
          </>
        )}
      </div>
      <style jsx>{`
        @keyframes outputFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .output-fade { animation: outputFade 460ms ease-out; }
      `}</style>
    </div>
  );
}

function ActionOut({ out }: { out: Extract<Output, { kind: "action" }> }) {
  const [executed, setExecuted] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden output-fade"
      style={{
        background: "var(--surface)",
        border: `1px solid ${executed ? "var(--pos)" : "rgba(38,109,240,0.22)"}`,
      }}>
      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--line)", background: executed ? "var(--pos-soft)" : "var(--bg-deep)" }}>
        <div className="flex items-center gap-2">
          {executed ? (
            <Check size={13} strokeWidth={2.4} style={{ color: "var(--pos)" }} />
          ) : (
            <Database size={13} strokeWidth={1.8} style={{ color: ACCENT }} />
          )}
          <div className="text-[12.5px] font-semibold text-ink"
            style={{ letterSpacing: "-0.01em" }}>
            {executed ? "Update applied" : out.verb}
          </div>
          <span className="ml-auto text-[9.5px] font-mono uppercase tracking-[0.08em] text-muted-2">
            {executed ? "executed" : "pending"}
          </span>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1.5">
          Target
        </div>
        <div className="text-[12.5px] font-semibold text-ink mb-3.5">{out.entity}</div>

        <div className="rounded-lg overflow-hidden"
          style={{ background: "var(--bg-deep)", border: "1px solid var(--line)" }}>
          <div className="grid grid-cols-[80px_1fr] gap-y-2 gap-x-4 px-3 py-2.5 text-[11.5px]">
            <span className="text-muted-2">Field</span>
            <span className="text-ink-2 font-medium">{out.field}</span>
            <span className="text-muted-2">From</span>
            <span className="text-ink-2 line-through opacity-60">{out.from}</span>
            <span className="text-muted-2">To</span>
            <span className="font-semibold" style={{ color: executed ? "var(--pos)" : ACCENT }}>{out.to}</span>
          </div>
        </div>

        <div className="text-[11px] text-muted mt-3 leading-relaxed">
          <span className="font-semibold text-ink-2">Impact: </span>
          {out.impact}
        </div>
      </div>

      <div className="px-4 py-3 flex items-center justify-end gap-2"
        style={{ borderTop: "1px solid var(--line)", background: "var(--surface)" }}>
        {executed ? (
          <span className="text-[11px] text-muted">Synced to Salesforce · 2 systems updated</span>
        ) : (
          <>
            <button className="text-[11.5px] font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-bg-deep"
              style={{ background: "var(--bg)", color: "var(--ink-2)", border: "1px solid var(--line)" }}>
              Cancel
            </button>
            <button onClick={() => setExecuted(true)}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1.5 rounded-lg text-white transition-transform hover:scale-[1.02]"
              style={{ background: "var(--ink)" }}>
              <Database size={11} strokeWidth={2.2} /> Approve &amp; execute
            </button>
          </>
        )}
      </div>
      <style jsx>{`
        @keyframes outputFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .output-fade { animation: outputFade 460ms ease-out; }
      `}</style>
    </div>
  );
}

function ListOut({ out }: { out: Extract<Output, { kind: "list" }> }) {
  return (
    <div className="rounded-xl overflow-hidden output-fade"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
      <div className="px-4 py-3 text-[13px] font-semibold text-ink"
        style={{ borderBottom: "1px solid var(--line)", background: "var(--bg-deep)", letterSpacing: "-0.01em" }}>
        {out.title}
      </div>
      <div className="divide-y divide-line">
        {out.items.map((it, i) => (
          <div key={i} className="px-4 py-2.5 flex items-center gap-3 row-fade"
            style={{ animationDelay: `${i * 60}ms` }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: it.tone ?? "var(--muted)" }} />
            {it.logo && <Logo name={it.logo} size={20} rounded={4} />}
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-ink truncate">{it.primary}</div>
              {it.secondary && <div className="text-[11px] text-muted truncate">{it.secondary}</div>}
            </div>
            {it.meta && (
              <span className="text-[10.5px] font-mono tnum shrink-0" style={{ color: it.tone ?? "var(--muted-2)" }}>
                {it.meta}
              </span>
            )}
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes outputFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .output-fade { animation: outputFade 460ms ease-out; }
        @keyframes rowFade { from { opacity: 0; transform: translateX(-4px); } to { opacity: 1; transform: translateX(0); } }
        .row-fade { animation: rowFade 360ms ease-out backwards; }
      `}</style>
    </div>
  );
}

function PlaybookOut({ out }: { out: Extract<Output, { kind: "playbook" }> }) {
  return (
    <div className="rounded-xl overflow-hidden output-fade"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--line)", background: "var(--bg-deep)" }}>
        <div className="text-[13px] font-semibold text-ink" style={{ letterSpacing: "-0.01em" }}>{out.title}</div>
        <div className="text-[10.5px] text-muted mt-1">
          <span className="font-semibold text-muted-2 uppercase tracking-[0.08em]">Trigger:</span> {out.trigger}
        </div>
      </div>
      <div className="divide-y divide-line">
        {out.steps.map((step, i) => (
          <div key={i} className="px-4 py-2.5 flex items-center gap-3 row-fade"
            style={{ animationDelay: `${i * 80}ms` }}>
            <span className="w-5 h-5 rounded-full grid place-items-center text-[10px] font-bold text-white shrink-0"
              style={{ background: ACCENT }}>{i + 1}</span>
            <span className="text-[12px] text-ink-2 flex-1">{step}</span>
          </div>
        ))}
      </div>
      <OutputFooterActions />
      <style jsx>{`
        @keyframes outputFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .output-fade { animation: outputFade 460ms ease-out; }
        @keyframes rowFade { from { opacity: 0; transform: translateX(-4px); } to { opacity: 1; transform: translateX(0); } }
        .row-fade { animation: rowFade 360ms ease-out backwards; }
      `}</style>
    </div>
  );
}

function OutputFooterActions() {
  return (
    <div className="px-4 py-2.5 flex items-center justify-between gap-2"
      style={{ borderTop: "1px solid var(--line)", background: "var(--bg-deep)" }}>
      <span className="text-[10.5px] text-muted-2">Sourced from CRM, calls, support, and product telemetry</span>
      <div className="flex items-center gap-1">
        <button className="text-[10.5px] text-muted hover:text-ink px-2 py-1 rounded transition-colors hover:bg-surface">
          Copy
        </button>
        <button className="text-[10.5px] text-muted hover:text-ink px-2 py-1 rounded transition-colors hover:bg-surface">
          Pin
        </button>
      </div>
    </div>
  );
}
