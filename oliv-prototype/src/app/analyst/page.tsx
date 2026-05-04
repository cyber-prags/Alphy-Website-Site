"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff, ArrowUp, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useToast } from "@/components/Toast";
import { usePersona } from "@/components/PersonaContext";

const SUGGESTIONS_BY_PERSONA: Record<string, string[]> = {
  ae: [
    "Which deals are at risk of slipping this quarter?",
    "Show me my top 5 deals by Most Likely forecast",
    "Summarize what's blocking the Stripe deal",
    "Which reps need coaching on objection handling?",
  ],
  am: [
    "Which accounts have the strongest expansion signal right now?",
    "Where is Cloudflare in the expansion motion?",
    "Which customers have hiring signals that point to a new use case?",
    "Build me an expansion case for Tableau Software",
  ],
  csm: [
    "Which accounts are at renewal risk in the next 60 days?",
    "Why is GitLab's WAU/MAU dropping?",
    "Show me adoption health across my full book",
    "Which customers haven't had a QBR in over 90 days?",
  ],
  manager: [
    "Which deals are at risk of slipping this quarter?",
    "Give me a forecast roll-up by manager",
    "Which reps need coaching on objection handling?",
    "Compare pipeline coverage across regions",
  ],
};

export default function AnalystPage() {
  const toast = useToast();
  const { persona } = usePersona();
  const SUGGESTIONS = SUGGESTIONS_BY_PERSONA[persona] ?? SUGGESTIONS_BY_PERSONA.ae;
  const [q, setQ] = useState("");
  const [listening, setListening] = useState(false);
  const [msgs, setMsgs] = useState<{ role: "user" | "ai"; text: string; cite?: string[] }[]>([]);

  // Simulated voice transcript while "listening"
  useEffect(() => {
    if (!listening) return;
    const phrases = [
      "what changed in",
      "what changed in pipeline",
      "what changed in pipeline overnight",
    ];
    let i = 0;
    const id = window.setInterval(() => {
      setQ(phrases[i]); i++;
      if (i >= phrases.length) window.clearInterval(id);
    }, 700);
    return () => window.clearInterval(id);
  }, [listening]);

  const ask = (text: string) => {
    if (!text.trim()) return;
    const reply: { role: "ai"; text: string; cite: string[] } = {
      role: "ai",
      text: synth(text),
      cite: ["Stripe · Health > Forecast", "Latham & Watkins · Stages > Demo", "Raytheon Technologies · Action Plan"],
    };
    setMsgs((m) => [...m, { role: "user", text }, reply]);
    setQ("");
    setListening(false);
  };

  const toggleMic = () => {
    if (listening) {
      setListening(false);
    } else {
      setListening(true);
      toast({ tone: "info", title: "Listening…", body: "Voice mode on (mock transcription)." });
    }
  };

  return (
    <AppShell>
      {msgs.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-12 h-12 rounded-md grid place-items-center mb-4"
               style={{ background: "var(--accent-soft)", border: "1px solid #DDDDFD" }}>
            <Sparkles size={20} strokeWidth={1.6} style={{ color: "var(--accent)" }} />
          </div>
          <h1 className="display text-center" style={{ fontSize: 22 }}>Hi Walid — what would you like to know?</h1>
          <div className="text-[12.5px] text-muted mt-1.5 mb-6">Ask anything about your deals, calls, emails, or pipeline.</div>

          <div className="w-full max-w-2xl card p-2 flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") ask(q); }}
              placeholder="Ask Alphy anything…"
              className="flex-1 bg-transparent outline-none text-[14px] px-3 placeholder:text-muted-2"
            />
            <button onClick={toggleMic}
              className={`w-9 h-9 rounded-lg grid place-items-center transition-colors ${
                listening ? "text-white" : "text-muted hover:text-ink hover:bg-surface-2"
              }`}
              style={listening ? { background: "var(--neg)" } : undefined}>
              {listening ? <MicOff size={15} strokeWidth={1.6} /> : <Mic size={15} strokeWidth={1.6} />}
            </button>
            <button onClick={() => ask(q)} className="w-9 h-9 rounded-lg grid place-items-center bg-ink text-white hover:bg-ink-2"><ArrowUp size={15} strokeWidth={1.8} /></button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 w-full max-w-2xl">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => ask(s)} className="card px-4 py-3 text-left text-[12.5px] text-ink-2 hover:bg-surface-2">
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4 mb-4">
            {msgs.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-sm bg-ink text-white text-[13.5px]">{m.text}</div>
                </div>
              ) : (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-md grid place-items-center mt-1"
                       style={{ background: "var(--accent-soft)", border: "1px solid #DDDDFD" }}>
                    <Sparkles size={12} strokeWidth={1.8} style={{ color: "var(--accent)" }} />
                  </div>
                  <div className="flex-1">
                    <div className="card p-4">
                      <div className="text-[13.5px] text-ink-2 leading-relaxed whitespace-pre-line">{m.text}</div>
                      {m.cite && (
                        <div className="mt-3 pt-3 border-t border-line">
                          <div className="mono-label mb-1.5">Sources</div>
                          <div className="flex flex-wrap gap-1.5">
                            {m.cite.map((c) => (
                              <span key={c} className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-full bg-bg-deep text-ink-2">
                                <Sparkles size={9} strokeWidth={1.8} style={{ color: "var(--accent-deep)" }} /> {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
          <div className="card p-2 flex items-center gap-2 sticky bottom-4">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") ask(q); }}
              placeholder="Ask a follow-up…"
              className="flex-1 bg-transparent outline-none text-[14px] px-3 placeholder:text-muted-2"
            />
            <button onClick={() => ask(q)} className="w-9 h-9 rounded-lg grid place-items-center bg-ink text-white"><ArrowUp size={15} /></button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function synth(q: string): string {
  const lower = q.toLowerCase();
  // CSM-specific responses
  if (lower.includes("renewal risk") || lower.includes("renewal") && lower.includes("60")) {
    return "Three accounts face renewal risk in the next 60 days:\n\n• Snowflake — renewal in 47 days; sponsor silent 24 days, health score 41.\n• GitLab Inc. — renewal in 64 days; WAU/MAU dropped 0.62 → 0.48 in 14 days.\n• Akamai — renewal in 64 days; QBR 14 days overdue, narrative not reset.\n\nCombined at-risk ARR: ~$1.3M. Recommend an exec touchpoint on Snowflake this week.";
  }
  if (lower.includes("wau") || lower.includes("gitlab") && lower.includes("drop")) {
    return "GitLab's WAU/MAU dropped from 0.62 to 0.48 in the last 14 days:\n\n• Three teams stopped using AI features last week — pattern matches a training gap, not a product bug.\n• Champion (Molly Müller) is still active, but the CFO (Stefan Becker) has been silent 21 days.\n• Support tickets increased 84% vs baseline — indicating friction, not disengagement.\n\nRecommend: schedule a 30-min re-engagement session with the team leads, and draft a QBR summary showing the pre-decline ROI narrative.";
  }
  if (lower.includes("adoption health") || lower.includes("health across")) {
    return "Adoption health across your 5 customers:\n\n• Cloudflare (88) — Healthy. Maya Chen promoted, champion strong. WAU growing.\n• Tableau (90) — Healthy. ML pilot converting to GA, 4 new engineers onboarding.\n• Akamai (86) — Healthy. QBR 14d overdue — book it before the narrative cools.\n• GitLab (64) — Watch. WAU/MAU declining, renewal in 64 days. Act this week.\n• Snowflake (42) — At risk. Sponsor silent, renewal in 47 days.\n\nBook Cloudflare expansion conversation before the Akamai QBR.";
  }
  if (lower.includes("qbr") && (lower.includes("90 days") || lower.includes("overdue"))) {
    return "Two customers haven't had a QBR in over 90 days:\n\n• Snowflake — last QBR 95 days ago. Renewal in 47 days. Critical to deliver one this week.\n• Akamai — QBR 14 days overdue (last was Jan 14). Q2 narrative not yet set.\n\nFor Snowflake, frame the QBR around re-engagement: send a 'what's changed' note before scheduling.";
  }
  if (lower.includes("expansion") && (lower.includes("signal") || lower.includes("strongest"))) {
    return "Top expansion signals in your book:\n\n• Cloudflare — Maya Chen promoted to VP Eng (budget spans Networking + Security). Pattern matches 3 prior $180K avg expansions.\n• Tableau — Hiring 4 ML engineers, governance gap flagged on last call.\n\nCloudflare is higher confidence. Recommend building the case this week before their Q2 planning locks.";
  }
  // AE/Manager responses
  if (lower.includes("at risk") || lower.includes("slipping")) {
    return "Three deals are showing slip risk this quarter:\n\n• Stripe (Apr 28) — Economic Buyer hasn't engaged in 14 days; legal redlines pending.\n• Rivian Automotive (Jun 26) — CFO unavailable; demo workshop deferred twice.\n• Telstra (Jul 13) — Security review in flight; no acceptance criteria documented.\n\nCombined exposure: ~$420K. Recommend an exec touchpoint on Stripe within 48h.";
  }
  if (lower.includes("top") && lower.includes("forecast")) {
    return "Top 5 by Most Likely forecast:\n\n1. Akamai · $450K · Closed Won\n2. Shopify · $350K · Negotiation\n3. Tableau Software · $300K · Closed Won\n4. Raytheon Technologies · $300K · Qualification\n5. Siemens · $250K · Negotiation\n\nFour of five sit in Enterprise; coverage in Mid-Market is thin against the H1 target.";
  }
  if (lower.includes("dunder") || lower.includes("stripe") && lower.includes("block")) {
    return "Two blockers on Stripe:\n\n• Procedural — Legal, Finance, and references are all pending; the proposal is in review but no decision criteria have been signed off.\n• Stakeholder — David Wallace (Economic Buyer) hasn't replied to the last two threads. Champion Christine Pettett is still active.\n\nNext best move: schedule a 30-min Executive Alignment with David before the Q1 budget lock.";
  }
  if (lower.includes("coaching")) {
    return "Two reps stand out for objection-handling coaching:\n\n• Brad Allen — Pricing & ROI score 2/5 across the last 4 calls; tends to concede on discount before exploring value.\n• Derek Evans — Competitive landscape score 3/5; misses opportunities to differentiate vs. Gong on autonomous action.\n\nSuggest pairing Brad with Lisa Park's discovery deck and giving Derek the Lena battlecard agent for two weeks.";
  }
  return "I would normally retrieve evidence from your accounts, calls, and emails to answer this. In this prototype the response is canned, but the citations panel below shows what would have been used.";
}
