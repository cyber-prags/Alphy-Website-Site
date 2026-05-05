"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, ArrowUp, Sparkles, Clock, MessageSquare, Plus, ExternalLink, ChevronRight, ChevronDown, Copy, Check, ThumbsUp, ThumbsDown, Building2, BarChart3, Zap, Send } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useToast } from "@/components/Toast";
import { usePersona } from "@/components/PersonaContext";

type Citation = { label: string; href: string; source: string };
type Msg = { role: "user" | "ai"; text: string; citations?: Citation[]; typing?: boolean };

const SUGGESTIONS_BY_PERSONA: Record<string, { text: string; icon: string }[]> = {
  ae: [
    { text: "Which deals are at risk of slipping this quarter?", icon: "alert" },
    { text: "Show me my top 5 deals by Most Likely forecast", icon: "chart" },
    { text: "Summarize what's blocking the Stripe deal", icon: "deal" },
    { text: "Which reps need coaching on objection handling?", icon: "coach" },
  ],
  am: [
    { text: "Which accounts have the strongest expansion signal right now?", icon: "signal" },
    { text: "Where is Cloudflare in the expansion motion?", icon: "account" },
    { text: "Which customers have hiring signals that point to a new use case?", icon: "signal" },
    { text: "Build me an expansion case for Tableau Software", icon: "deal" },
  ],
  csm: [
    { text: "Which accounts are at renewal risk in the next 60 days?", icon: "alert" },
    { text: "Why is GitLab's WAU/MAU dropping?", icon: "chart" },
    { text: "Show me adoption health across my full book", icon: "account" },
    { text: "Which customers haven't had a QBR in over 90 days?", icon: "coach" },
  ],
  manager: [
    { text: "Which deals are at risk of slipping this quarter?", icon: "alert" },
    { text: "Give me a forecast roll-up by manager", icon: "chart" },
    { text: "Which reps need coaching on objection handling?", icon: "coach" },
    { text: "Compare pipeline coverage across regions", icon: "deal" },
  ],
};

const HISTORY: { title: string; preview: string; time: string }[] = [
  { title: "Pipeline risk analysis", preview: "Three deals showing slip risk this quarter...", time: "2h ago" },
  { title: "Cloudflare expansion signals", preview: "Maya Chen promoted to VP Eng, expansion door opens...", time: "Yesterday" },
  { title: "Q2 forecast summary", preview: "Pipeline coverage at 3.2x against $4.2M target...", time: "Yesterday" },
  { title: "Snowflake renewal strategy", preview: "Sponsor silent 24 days, health score 41...", time: "2d ago" },
  { title: "GitLab adoption deep-dive", preview: "WAU/MAU dropped from 0.62 to 0.48 in 14 days...", time: "3d ago" },
  { title: "Coaching report — Brad Allen", preview: "Pricing & ROI score 2/5 across last 4 calls...", time: "4d ago" },
  { title: "Competitive landscape vs Gong", preview: "Three differentiators in autonomous action...", time: "1w ago" },
];

export default function AnalystPage() {
  const toast = useToast();
  const { persona } = usePersona();
  const SUGGESTIONS = SUGGESTIONS_BY_PERSONA[persona] ?? SUGGESTIONS_BY_PERSONA.ae;
  const [q, setQ] = useState("");
  const [listening, setListening] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [view, setView] = useState<"chat" | "history">("chat");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs]);

  useEffect(() => {
    if (!listening) return;
    const phrases = ["what changed in", "what changed in pipeline", "what changed in pipeline overnight"];
    let i = 0;
    const id = window.setInterval(() => { setQ(phrases[i]); i++; if (i >= phrases.length) window.clearInterval(id); }, 700);
    return () => window.clearInterval(id);
  }, [listening]);

  const ask = useCallback((text: string) => {
    if (!text.trim()) return;
    const { response, citations } = synthWithCitations(text);
    setMsgs(m => [...m, { role: "user", text }, { role: "ai", text: "", typing: true }]);
    setQ("");
    setListening(false);
    setView("chat");

    let charIndex = 0;
    const id = setInterval(() => {
      charIndex += 2 + Math.floor(Math.random() * 3);
      if (charIndex >= response.length) {
        clearInterval(id);
        setMsgs(m => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "ai", text: response, citations, typing: false };
          return copy;
        });
      } else {
        setMsgs(m => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "ai", text: response.slice(0, charIndex), typing: true };
          return copy;
        });
      }
    }, 18);
  }, []);

  const toggleMic = () => {
    if (listening) { setListening(false); } else {
      setListening(true);
      toast({ tone: "info", title: "Listening…", body: "Voice mode on (mock transcription)." });
    }
  };

  const PERSONA_NAMES: Record<string, string> = { ae: "Account Executive", am: "Account Manager", csm: "Customer Success Manager", manager: "Sales Manager" };
  const userName = persona === "am" ? "Pragyan" : persona === "csm" ? "Brad" : persona === "manager" ? "Walid" : "Alex";
  const [historyOpen, setHistoryOpen] = useState(true);

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar — History only */}
        <div className="w-[220px] shrink-0 border-r border-line flex flex-col">
          <div className="p-3 border-b border-line">
            <button onClick={() => { setMsgs([]); }}
              className="w-full h-9 rounded-lg text-[12px] font-medium inline-flex items-center justify-center gap-2 border border-line bg-surface hover:bg-bg-deep transition-colors">
              <Plus size={13} strokeWidth={2} /> New conversation
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-2 px-2.5 py-2">History</div>
            <div className="space-y-0.5">
              {HISTORY.map((h, i) => (
                <button key={i} onClick={() => {
                  const { response, citations } = synthWithCitations(h.title);
                  setMsgs([{ role: "user", text: h.title }, { role: "ai", text: response, citations }]);
                  setView("chat");
                }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-bg-deep transition-colors group">
                  <div className="text-[11.5px] font-medium text-ink truncate group-hover:text-accent-deep transition-colors">{h.title}</div>
                  <div className="text-[10px] text-muted-2 mt-0.5">{h.time}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {msgs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              <div className="flex items-center gap-3 mb-8">
                <Sparkles size={32} strokeWidth={1.4} style={{ color: "var(--ink)" }} />
                <h1 className="text-[28px] font-semibold text-ink" style={{ letterSpacing: "-0.025em" }}>
                  Hi, {userName}
                </h1>
              </div>

              <div className="w-full max-w-[680px]">
                <div className="rounded-2xl border border-line bg-surface overflow-hidden" style={{ boxShadow: "0 2px 16px -4px rgba(28,40,64,0.08)" }}>
                  <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(q); } }}
                    placeholder="Ask a question about your accounts..."
                    className="w-full bg-transparent outline-none text-[14px] px-5 pt-4 pb-2 placeholder:text-muted-2" />
                  <div className="flex items-center justify-between px-4 pb-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => ask("Show me my accounts")}
                        className="inline-flex items-center gap-1 text-[11.5px] text-muted hover:text-ink px-2 py-1 rounded-md hover:bg-bg-deep transition-colors">
                        <Plus size={11} strokeWidth={2} /> Accounts
                      </button>
                      <button onClick={() => ask("Show me my deals")}
                        className="inline-flex items-center gap-1 text-[11.5px] text-muted hover:text-ink px-2 py-1 rounded-md hover:bg-bg-deep transition-colors">
                        <BarChart3 size={11} strokeWidth={1.6} /> Deals
                      </button>
                      <button onClick={() => ask("What are today's signals?")}
                        className="inline-flex items-center gap-1 text-[11.5px] text-muted hover:text-ink px-2 py-1 rounded-md hover:bg-bg-deep transition-colors">
                        <Zap size={11} strokeWidth={1.6} /> Signals
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-pos" />
                        Alphy AI
                      </span>
                      <button onClick={() => ask(q)}
                        className={`w-8 h-8 rounded-full grid place-items-center transition-all ${
                          q.trim() ? "bg-ink text-white" : "bg-bg-deep text-muted-2"
                        }`}
                        disabled={!q.trim()}>
                        <Send size={13} strokeWidth={1.8} />
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-muted-2 text-center mt-3">
                  Alphy can make mistakes. Verify important information.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
                  {msgs.map((m, i) =>
                    m.role === "user" ? (
                      <UserBubble key={i} text={m.text} />
                    ) : (
                      <AiBubble key={i} msg={m} />
                    )
                  )}
                </div>
              </div>
              <div className="border-t border-line bg-surface/80 backdrop-blur-md px-6 py-3">
                <div className="max-w-3xl mx-auto">
                  <div className="rounded-2xl border border-line bg-surface overflow-hidden" style={{ boxShadow: "0 2px 12px -4px rgba(28,40,64,0.06)" }}>
                    <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(q); } }}
                      placeholder="Ask a follow-up..."
                      className="w-full bg-transparent outline-none text-[13.5px] px-4 pt-3 pb-1.5 placeholder:text-muted-2" />
                    <div className="flex items-center justify-between px-3 pb-2.5">
                      <div className="flex items-center gap-1">
                        <button className="inline-flex items-center gap-1 text-[10.5px] text-muted hover:text-ink px-1.5 py-0.5 rounded hover:bg-bg-deep transition-colors">
                          <Plus size={10} strokeWidth={2} /> Accounts
                        </button>
                        <button className="inline-flex items-center gap-1 text-[10.5px] text-muted hover:text-ink px-1.5 py-0.5 rounded hover:bg-bg-deep transition-colors">
                          <BarChart3 size={10} strokeWidth={1.6} /> Deals
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9.5px] text-muted-2 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-pos" /> Alphy AI
                        </span>
                        <button onClick={() => ask(q)}
                          className={`w-7 h-7 rounded-full grid place-items-center transition-all ${
                            q.trim() ? "bg-ink text-white" : "bg-bg-deep text-muted-2"
                          }`}
                          disabled={!q.trim()}>
                          <Send size={12} strokeWidth={1.8} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-2 text-center mt-2">
                    Alphy can make mistakes. Verify important information.
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}


function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="flex items-start gap-3 max-w-[80%]">
        <div className="px-4 py-3 rounded-2xl rounded-tr-md text-[13.5px] leading-relaxed"
          style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
          {text}
        </div>
      </div>
    </div>
  );
}

function renderMarkdown(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function AiBubble({ msg }: { msg: Msg }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(msg.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-xl grid place-items-center shrink-0 mt-0.5"
        style={{ background: "var(--accent)", boxShadow: "0 4px 12px -4px rgba(38,109,240,0.25)" }}>
        <Sparkles size={14} strokeWidth={1.8} style={{ color: "var(--accent-ink)" }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] text-ink leading-[1.7] whitespace-pre-line">
          {renderMarkdown(msg.text)}
          {msg.typing && <span className="inline-block w-0.5 h-4 bg-accent-deep ml-0.5 animate-pulse align-text-bottom" />}
        </div>

        {!msg.typing && msg.citations && msg.citations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-line">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-2 mb-2">Sources</div>
            <div className="flex flex-wrap gap-1.5">
              {msg.citations.map((c, i) => (
                <Link key={i} href={c.href}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium pl-2 pr-2.5 py-1 rounded-lg border border-line bg-bg-deep hover:border-accent/30 hover:bg-accent-soft/30 transition-all group">
                  <span className="w-4 h-4 rounded grid place-items-center shrink-0"
                    style={{ background: "var(--accent-soft)" }}>
                    <Sparkles size={8} strokeWidth={2} style={{ color: "var(--accent-deep)" }} />
                  </span>
                  <span className="text-ink-2 group-hover:text-accent-deep transition-colors">{c.label}</span>
                  <span className="text-[9px] text-muted-2">· {c.source}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!msg.typing && (
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-opacity"
            style={{ opacity: 1 }}>
            <button onClick={handleCopy}
              className="w-7 h-7 rounded-lg grid place-items-center text-muted-2 hover:text-ink hover:bg-bg-deep transition-colors"
              title="Copy">
              {copied ? <Check size={12} strokeWidth={2} className="text-pos" /> : <Copy size={12} strokeWidth={1.6} />}
            </button>
            <button className="w-7 h-7 rounded-lg grid place-items-center text-muted-2 hover:text-ink hover:bg-bg-deep transition-colors" title="Good response">
              <ThumbsUp size={12} strokeWidth={1.6} />
            </button>
            <button className="w-7 h-7 rounded-lg grid place-items-center text-muted-2 hover:text-ink hover:bg-bg-deep transition-colors" title="Bad response">
              <ThumbsDown size={12} strokeWidth={1.6} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function synthWithCitations(q: string): { response: string; citations: Citation[] } {
  const lower = q.toLowerCase();

  if (lower.includes("renewal risk") || (lower.includes("renewal") && lower.includes("60"))) {
    return {
      response: "Three accounts face renewal risk in the next 60 days:\n\n**Snowflake** — renewal in 47 days; sponsor silent 24 days, health score 41. The last meaningful engagement was a QBR 95 days ago. Brad Wallace hasn't responded to three outreach attempts.\n\n**GitLab Inc.** — renewal in 64 days; WAU/MAU dropped 0.62 → 0.48 in 14 days. Three teams fully inactive. Champion Molly Müller is still engaged but escalation path to CFO is cold.\n\n**Akamai** — renewal in 64 days; QBR 14 days overdue, Q2 narrative not reset. Expansion conversation stale since January.\n\nCombined at-risk ARR: ~$1.3M. Recommend an exec touchpoint on Snowflake this week.",
      citations: [
        { label: "Snowflake · Health Score", href: "/accounts/snowflake-inc", source: "Mixpanel" },
        { label: "GitLab · Adoption Metrics", href: "/accounts/gitlab-inc", source: "Mixpanel" },
        { label: "Akamai · QBR History", href: "/accounts/akamai-technologies", source: "Salesforce" },
      ],
    };
  }

  if (lower.includes("wau") || (lower.includes("gitlab") && lower.includes("drop"))) {
    return {
      response: "GitLab's WAU/MAU dropped from 0.62 to 0.48 in the last 14 days:\n\n• Three teams stopped using AI features last week — pattern matches a training gap, not a product bug.\n• Champion (Molly Müller) is still active, but the CFO (Stefan Becker) has been silent 21 days.\n• Support tickets increased 84% vs baseline — indicating friction, not disengagement.\n\nRecommend: schedule a 30-min re-engagement session with the team leads, and draft a QBR summary showing the pre-decline ROI narrative.",
      citations: [
        { label: "GitLab · Feature Adoption", href: "/accounts/gitlab-inc", source: "Mixpanel" },
        { label: "GitLab · Support Tickets", href: "/accounts/gitlab-inc", source: "Zendesk" },
        { label: "Stefan Becker · Activity", href: "/accounts/gitlab-inc", source: "Gong" },
      ],
    };
  }

  if (lower.includes("adoption health") || lower.includes("health across")) {
    return {
      response: "Adoption health across your 5 accounts:\n\n• **Cloudflare** (88/100) — Healthy. Maya Chen promoted, champion strong. WAU growing.\n• **Tableau** (90/100) — Healthy. ML pilot converting to GA, 4 new engineers onboarding.\n• **Akamai** (86/100) — Healthy but QBR 14d overdue. Book before narrative cools.\n• **GitLab** (64/100) — Watch. WAU/MAU declining, renewal in 64 days. Act this week.\n• **Snowflake** (42/100) — At risk. Sponsor silent, renewal in 47 days.\n\nPrioritize: Snowflake exec touchpoint → GitLab re-engagement → Akamai QBR → Cloudflare expansion.",
      citations: [
        { label: "Portfolio Health Overview", href: "/home", source: "Alphy AI" },
        { label: "Cloudflare · Health", href: "/accounts/cloudflare-inc", source: "Mixpanel" },
        { label: "Snowflake · Health", href: "/accounts/snowflake-inc", source: "Mixpanel" },
      ],
    };
  }

  if (lower.includes("expansion") && (lower.includes("signal") || lower.includes("strongest"))) {
    return {
      response: "Top expansion signals in your book:\n\n**Cloudflare** — Maya Chen promoted to VP Eng (budget spans Networking + Security). Pattern matches 3 prior expansions averaging $180K. Discovery call scheduled May 10.\n\n**Tableau** — Hiring 4 ML engineers, governance gap flagged on last call with Priya Sharma (new Head of RevOps). AI Copilot pilot shows 2.3x rep productivity lift.\n\nCloudflare is higher confidence (88 health score, active champion). Recommend building the business case this week before their Q2 planning locks.",
      citations: [
        { label: "Cloudflare · Expansion Plan", href: "/accounts/cloudflare-inc", source: "Salesforce" },
        { label: "Maya Chen · Promotion Signal", href: "/accounts/cloudflare-inc", source: "LinkedIn" },
        { label: "Tableau · Hiring Signal", href: "/accounts/tableau-software", source: "LinkedIn" },
        { label: "Priya Sharma · Call Notes", href: "/accounts/tableau-software", source: "Gong" },
      ],
    };
  }

  if (lower.includes("cloudflare") && lower.includes("expansion")) {
    return {
      response: "Cloudflare is in the **Discovery & Validation** phase of the expansion motion:\n\n**What's happened:**\n• Maya Chen promoted to VP Eng — budget now spans Networking + Security BUs\n• Discovery call completed May 10, use case validated with Security team lead\n• 2 of 4 milestones complete in the expansion plan\n\n**What's next:**\n• Build ROI model with usage data (due May 22)\n• Draft expansion proposal deck (due May 28)\n• Present to Maya Chen + Finance Ops (due Jun 6)\n\n**Target:** $180K incremental ARR by end of Q3. Current progress: 18% of plan complete.",
      citations: [
        { label: "Cloudflare · Expansion Plan", href: "/accounts/cloudflare-inc", source: "Plans" },
        { label: "Maya Chen · Discovery Call", href: "/accounts/cloudflare-inc", source: "Gong" },
        { label: "Networking BU · White Space", href: "/accounts/cloudflare-inc", source: "Salesforce" },
      ],
    };
  }

  if (lower.includes("at risk") || lower.includes("slipping")) {
    return {
      response: "Three deals are showing slip risk this quarter:\n\n**Stripe** (Apr 28) — Economic Buyer hasn't engaged in 14 days; legal redlines pending. MEDDPICC score 6/8, missing Decision Criteria and Paper Process.\n\n**Rivian Automotive** (Jun 26) — CFO unavailable; demo workshop deferred twice. Competitive threat from Gong identified on last call.\n\n**Telstra** (Jul 13) — Security review in flight; no acceptance criteria documented. Deal champion on vacation until May 12.\n\nCombined exposure: ~$420K. Recommend an exec touchpoint on Stripe within 48h.",
      citations: [
        { label: "Stripe · Deal Health", href: "/deals", source: "Salesforce" },
        { label: "Stripe · Last Call", href: "/deals", source: "Gong" },
        { label: "Rivian · Pipeline", href: "/deals", source: "Salesforce" },
      ],
    };
  }

  if (lower.includes("coaching") || lower.includes("brad")) {
    return {
      response: "Two reps stand out for objection-handling coaching:\n\n**Brad Allen** — Pricing & ROI score 2/5 across the last 4 calls. Tends to concede on discount before exploring value. Lost $45K in potential revenue from premature discounting.\n\n**Derek Evans** — Competitive landscape score 3/5. Misses opportunities to differentiate vs. Gong on autonomous action capabilities.\n\nRecommend pairing Brad with Lisa Park's discovery deck and giving Derek the competitive battlecard agent for two weeks.",
      citations: [
        { label: "Brad Allen · Call Scores", href: "/home", source: "Gong" },
        { label: "Derek Evans · Coaching", href: "/home", source: "Gong" },
        { label: "Pricing Objections · Playbook", href: "/playbook", source: "Playbook" },
      ],
    };
  }

  if (lower.includes("pipeline") || lower.includes("change") || lower.includes("today") || lower.includes("overnight")) {
    return {
      response: "4 changes in your pipeline overnight:\n\n1. **Stripe** probability dropped 7pts (50% → 43%) — David Wallace hasn't responded to the last two threads. Legal redlines still pending.\n\n2. **Cloudflare** — Maya Chen promoted to VP Engineering. Budget now spans Networking + Security. Expansion door wide open.\n\n3. **NextEra Energy** — Pilot extension confirmed through Q3. ARR locked at $150K.\n\n4. **GitLab** — WAU/MAU dropped further to 0.48. Three teams fully inactive. Renewal risk escalating.\n\nNet pipeline impact: -$14K (Stripe down, NextEra offset). Action needed on Stripe and GitLab.",
      citations: [
        { label: "Stripe · Forecast Change", href: "/deals", source: "Salesforce" },
        { label: "Cloudflare · Champion Signal", href: "/accounts/cloudflare-inc", source: "LinkedIn" },
        { label: "GitLab · Usage Decline", href: "/accounts/gitlab-inc", source: "Mixpanel" },
      ],
    };
  }

  if (lower.includes("forecast") || lower.includes("top 5") || lower.includes("top five")) {
    return {
      response: "Top 5 deals by Most Likely forecast:\n\n1. **Akamai** · $450K · Closed Won ✓\n2. **Shopify** · $350K · Negotiation (85% probability)\n3. **Tableau Software** · $300K · Closed Won ✓\n4. **Raytheon Technologies** · $300K · Qualification (35% probability)\n5. **Siemens** · $250K · Negotiation (70% probability)\n\nFour of five sit in Enterprise; coverage in Mid-Market is thin against the H1 target. Consider accelerating the MongoDB discovery.",
      citations: [
        { label: "Forecast Dashboard", href: "/forecast", source: "Salesforce" },
        { label: "Pipeline Coverage", href: "/deals", source: "Clari" },
      ],
    };
  }

  if (lower.includes("tableau") && lower.includes("expansion")) {
    return {
      response: "Building the expansion case for Tableau Software:\n\n**Opportunity:** AI Copilot + Revenue Intel cross-sell — target $175K incremental ARR.\n\n**Key signals:**\n• Priya Sharma (new Head of RevOps) joined 3 weeks ago — actively evaluating tooling\n• 4 ML engineers hired last month — governance gap flagged in last call\n• Current health score: 90/100, strong adoption\n\n**Plan status:** Stakeholder Alignment phase, 1 of 3 milestones done. Next: get Sales Director buy-in for AI Copilot pilot by May 20.\n\n**Risk:** One competitor (Gong) actively involved. Differentiate on autonomous action and governance capabilities.",
      citations: [
        { label: "Tableau · Expansion Plan", href: "/accounts/tableau-software", source: "Plans" },
        { label: "Priya Sharma · Intro Call", href: "/accounts/tableau-software", source: "Gong" },
        { label: "Competitive Analysis", href: "/playbook", source: "Alphy AI" },
      ],
    };
  }

  return {
    response: "I'd normally pull evidence from your accounts, calls, emails, and CRM to answer this thoroughly. In this prototype the data scope is limited, but here's what I can share based on your current portfolio.\n\nTry asking about specific accounts (Cloudflare, Snowflake, GitLab), pipeline risks, expansion signals, or coaching recommendations — those have the richest data available.",
    citations: [
      { label: "Your Portfolio", href: "/accounts", source: "Salesforce" },
      { label: "Today's Signals", href: "/signals", source: "Alphy AI" },
    ],
  };
}
