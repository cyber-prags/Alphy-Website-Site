"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight, Sparkles, Rocket, Target, Activity, Database, Plug } from "lucide-react";
import type { Persona } from "@/lib/mock";
import { PERSONA_LABEL } from "./PersonaContext";

type Step = {
  Icon: typeof Sparkles;
  title: string;
  body: string;
  cta: string;
  href?: string;
};

const TOURS: Record<Persona, Step[]> = {
  ae: [
    { Icon: Rocket,   title: "Welcome, AE",                          body: "Alphard is built around closing motion: pipeline, methodology, forecast, coaching.", cta: "Show me Today" },
    { Icon: Sparkles, title: "Today queue is your morning",          body: "Risk · Renewal · Expansion · Adoption · Prep — sorted by urgency. Click any item to act on it without leaving the queue.", cta: "Open Records", href: "/deals" },
    { Icon: Database, title: "Records is your pipeline view",         body: "25 deals, 3 views (team, by stage, by rep). Click any row to open the deal detail drawer with 9 tabs of evidence.", cta: "Show me Outcomes", href: "/outcomes" },
    { Icon: Target,   title: "Outcomes are your customer promises",   body: "Measurable goals — TTFV, retention, expansion. Different from stage-exit criteria.", cta: "Show me Forecast", href: "/forecast" },
    { Icon: Plug,     title: "Where data comes from",                 body: "Every chart cites its source. Open Integrations to see what's connected and what's syncing.", cta: "Done — let me start", href: "/home" },
  ],
  am: [
    { Icon: Rocket,    title: "Welcome, AM",                          body: "Alphy is built for expansion motion: champion advocacy, cross-sell plays, deal co-ownership with your AE.", cta: "Show me Today" },
    { Icon: Sparkles,  title: "Today queue triages your book",         body: "Expansion plays, champion-promotion signals, prep for QBRs — sorted by upside and urgency.", cta: "Show me an account", href: "/accounts/cloudflare-inc" },
    { Icon: Activity,  title: "Account workspace",                    body: "Overview, Outcomes, Stakeholders, Org Chart, Signals, Deals — everything to build a clean expansion case.", cta: "Show me Deals", href: "/deals" },
    { Icon: Target,    title: "Co-owned deals",                       body: "Every expansion has a forecast slot. Loop the AE in with one click on any case you build.", cta: "Show me Signals", href: "/signals" },
    { Icon: Plug,      title: "Where data comes from",                body: "LinkedIn for org changes, Salesforce for source of truth, Gong for call signals. Configure under Integrations.", cta: "Done — let me start", href: "/home" },
  ],
  csm: [
    { Icon: Rocket,    title: "Welcome, CSM",                         body: "Alphy is built for retention motion: account health, renewals, adoption, support, QBRs.", cta: "Show me Renewals", href: "/renewals" },
    { Icon: Sparkles,  title: "Renewals cockpit",                     body: "Every contract with a 90-day risk window. Health score, ticket volume, exec engagement — one row per account.", cta: "Show me an account", href: "/accounts/cloudflare-inc" },
    { Icon: Activity,  title: "Adoption is your early-warning",        body: "WAU/MAU drops, blocked playbook steps, feature drop-offs — surfaced before churn signals show up.", cta: "Show me Outcomes", href: "/outcomes" },
    { Icon: Target,    title: "Outcomes are your scorecard",          body: "TTFV, retention, expansion outcomes — measurable promises tied to QBR narratives.", cta: "Show me Requests", href: "/requests" },
    { Icon: Plug,      title: "Where data comes from",                body: "Mixpanel for usage, Zendesk + Intercom for support, Salesforce for the source of truth.", cta: "Done — let me start", href: "/home" },
  ],
  manager: [
    { Icon: Rocket,    title: "Welcome, Sales Manager",               body: "You'll spend your time in Forecast, People, and the Today queue's manager view.", cta: "Show me Forecast" },
    { Icon: Sparkles,  title: "Forecast roll-up",                     body: "AI-Assisted vs Seller numbers side-by-side. Approve any cell, drill into the deals behind it, compare to a snapshot.", cta: "Show me People", href: "/people" },
    { Icon: Activity,  title: "Coaching flags",                       body: "Per-rep skill scores. Click a rep card on People to drill into their deals and trends.", cta: "Show me Today", href: "/home" },
    { Icon: Plug,      title: "Where data comes from",                body: "Connect or check integrations under Configure → Integrations.", cta: "Done — let me start", href: "/home" },
  ],
};

export function OnboardingTour({ open, persona, onClose }: { open: boolean; persona: Persona; onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const tour = TOURS[persona];

  useEffect(() => { if (open) setStep(0); }, [open, persona]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const cur = tour[step];
  const isLast = step === tour.length - 1;
  const next = () => {
    if (cur.href) router.push(cur.href);
    if (isLast) { onClose(); return; }
    setStep(step + 1);
  };

  return (
    <>
      <div className="fixed inset-0 bg-ink/50 z-[100] fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-[110] grid place-items-center p-6 pointer-events-none">
        <div className="card pointer-events-auto fade-in" style={{ width: "min(560px, 92vw)" }}>
          {/* Header strip */}
          <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-line">
            <div className="mono-label inline-flex items-center gap-2">
              <Rocket size={11} strokeWidth={1.6} />
              {PERSONA_LABEL[persona]} · Tour
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-md grid place-items-center text-muted hover:text-ink hover:bg-bg-deep" aria-label="Close tour">
              <X size={13} strokeWidth={1.6} />
            </button>
          </div>

          {/* Step body */}
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg grid place-items-center" style={{ background: "var(--accent)" }}>
                <cur.Icon size={18} strokeWidth={1.6} style={{ color: "var(--accent-ink)" }} />
              </div>
              <div>
                <div className="text-[15px] font-semibold text-ink">{cur.title}</div>
                <div className="text-[10.5px] text-muted-2 mt-0.5">Step {step + 1} of {tour.length}</div>
              </div>
            </div>
            <p className="text-[13px] text-ink-2 leading-relaxed">{cur.body}</p>

            {/* Step dots */}
            <div className="flex items-center gap-1.5 mt-5">
              {tour.map((_, i) => (
                <span key={i} className="h-1 flex-1 rounded-full"
                  style={{ background: i <= step ? "var(--accent)" : "var(--bg-deep)" }} />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-line flex items-center justify-between">
            <button onClick={onClose}
              className="text-[11.5px] text-muted hover:text-ink">
              Skip tour
            </button>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button onClick={() => setStep(step - 1)}
                  className="text-[12px] font-medium h-8 px-3 rounded-md border border-line bg-surface text-ink-2 hover:bg-bg-deep">
                  Back
                </button>
              )}
              <button onClick={next}
                className="text-[12px] font-medium h-8 px-3 rounded-md inline-flex items-center gap-1.5"
                style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
                {cur.cta}
                <ArrowRight size={12} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
