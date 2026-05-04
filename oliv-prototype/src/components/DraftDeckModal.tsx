"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Sparkles, Download, Send, Check, Loader2, FileText } from "lucide-react";
import { Logo } from "./Logo";
import type { AccountDetail } from "@/lib/mock";
import { fmtMoney } from "@/lib/mock";
import { useToast } from "./Toast";

type Slide = {
  title: string;
  body: string;
  bullets?: string[];
  metrics?: { label: string; value: string; tone?: "pos" | "neg" | "neutral" }[];
};

export type DeckTemplate = "qbr" | "expansion" | "renewal" | "exec";

const TEMPLATE_LABEL: Record<DeckTemplate, string> = {
  qbr:       "Quarterly Business Review",
  expansion: "Expansion Business Case",
  renewal:   "Renewal Narrative",
  exec:      "Executive 1-pager",
};

const STEPS_BY_TEMPLATE: Record<DeckTemplate, string[]> = {
  qbr: [
    "Pulling outcome attainment from the warehouse…",
    "Reading 14 days of call transcripts…",
    "Cross-referencing patterns library…",
    "Inheriting Sales handoff context…",
    "Drafting slide narratives…",
    "Compiling deck…",
  ],
  expansion: [
    "Pulling baseline metrics for the cohort…",
    "Looking up 3 prior similar conversions…",
    "Modelling ARR uplift…",
    "Drafting commercial framing…",
    "Compiling business case…",
  ],
  renewal: [
    "Pulling outcome attainment vs commitments…",
    "Mapping sponsor coverage…",
    "Drafting price defence narrative…",
    "Compiling renewal pack…",
  ],
  exec: [
    "Distilling the number…",
    "Distilling the ask…",
    "Distilling the risk…",
    "Compiling 1-pager…",
  ],
};

function slidesFor(a: AccountDetail, template: DeckTemplate): Slide[] {
  if (template === "expansion") return expansionSlides(a);
  if (template === "renewal")   return renewalSlides(a);
  if (template === "exec")      return execSlides(a);
  return qbrSlides(a);
}

function qbrSlides(a: AccountDetail): Slide[] {
  const arrK = a.arr ? fmtMoney(a.arr) : "—";
  const champion = a.stakeholders.find((s) => s.role === "Champion")?.name ?? "your champion";
  return [
    {
      title: `${a.name} · Q2 2026 Business Review`,
      body: `Prepared by ${a.owner} · ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
      bullets: [
        `${a.segment} tier · ${arrK} ARR · NRR ${a.nrr}%`,
        `Champion — ${champion}`,
        `Renewal · ${a.renewalDays > 0 ? `in ${a.renewalDays} days` : a.renewalDays < 0 ? "lapsed" : "TBD"}`,
      ],
    },
    {
      title: "Where we are",
      body: `Health ${a.healthScore}/100. Three storylines worth your attention this quarter.`,
      bullets: [
        a.signals[0]?.body ?? "Engagement steady across the primary cohort.",
        a.signals[1]?.body ?? "Adoption trending up; wider reach is the next move.",
        "One outstanding compliance concern — addressed in slide 5.",
      ],
    },
    {
      title: "Outcomes attainment",
      body: "Customer-defined success metrics, mapped to evidence.",
      metrics: [
        { label: "Throughput cohort",      value: "+38%", tone: "pos" },
        { label: "Inter-rater agreement",   value: "94%",  tone: "pos" },
        { label: "Adoption — primary org",  value: "71%",  tone: "pos" },
      ],
    },
    {
      title: "Expansion opportunity",
      body: "Pattern matches three prior champion-promotion conversions. Estimated net new $180K ARR within two quarters.",
      bullets: [
        "Champion now spans two BUs — adoption gap in adjacent BU is 0%.",
        "Roadmap for adjacent BU launches Q3.",
        "Drafted business case ready for review.",
      ],
    },
    {
      title: "Open risks",
      body: "Two items. The first is owned. The second needs your decision.",
      bullets: [
        "SOC 2 / data residency — Compliance asked for written commitment. Owned, drafting.",
        "Sponsor silence on the secondary stakeholder. Recommend exec route.",
      ],
    },
    {
      title: "Asks",
      body: "Three things. All low-friction.",
      bullets: [
        "30-min cross-BU intro — adjacent product team",
        "Reference-logo placement on the case study landing page",
        "Renewal kickoff in 60 days — same scope, expanded seat tier",
      ],
    },
    {
      title: "Appendix · what's behind every number",
      body: "Sources: memory layer (call transcripts), product analytics (live events), Hiring & Org agent (LinkedIn signals), and your logbook entries.",
    },
  ];
}

function expansionSlides(a: AccountDetail): Slide[] {
  const champion = a.stakeholders.find((s) => s.role === "Champion")?.name ?? "your champion";
  return [
    {
      title: `${a.name} · Expansion Business Case`,
      body: `Pattern-matched ARR forecast with three comparable conversions. Champion: ${champion}.`,
      bullets: [`Current ARR ${a.arr ? fmtMoney(a.arr) : "—"}`, `Estimated net new $180K within 2 quarters`, "Confidence: High"],
    },
    {
      title: "Why now", body: "Three trigger signals converge.",
      bullets: ["Champion just promoted — budget authority expanded", "Adoption gap in adjacent BU is 0%", "Roadmap launches the BU's hot-spot in Q3"],
    },
    {
      title: "Comparable conversions",
      body: "Three accounts with identical signal patterns converted within 90 days.",
      metrics: [
        { label: "Avg uplift",     value: "$182K", tone: "pos" },
        { label: "Time-to-close",  value: "67 days", tone: "pos" },
        { label: "Win rate",       value: "82%", tone: "pos" },
      ],
    },
    {
      title: "Commercial framing",
      body: "Price-anchor against existing usage; remove friction with phased payment.",
      bullets: ["Anchor: 1.4× current MRR baseline", "Phase 1: 3-month pilot at 60% list", "Phase 2: full deployment at standard list"],
    },
    {
      title: "Asks",
      body: "Two things, both low-friction.",
      bullets: ["30-min cross-BU intro this week", "Email confirmation that adjacent BU is in scope for Q3"],
    },
  ];
}

function renewalSlides(a: AccountDetail): Slide[] {
  return [
    {
      title: `${a.name} · Renewal Narrative`,
      body: `Renewal in ${a.renewalDays > 0 ? `${a.renewalDays} days` : "lapsed"}. Outcome attainment + sponsor map + price defence.`,
      bullets: [`Current ARR ${a.arr ? fmtMoney(a.arr) : "—"}`, `NRR ${a.nrr}% this period`, `Health ${a.healthScore}/100`],
    },
    {
      title: "What we promised — and delivered",
      body: "Outcomes mapped to evidence.",
      metrics: [
        { label: "TTFV target",     value: "11d / 14d", tone: "pos" },
        { label: "Adoption target", value: "71% / 70%", tone: "pos" },
        { label: "MTTR target",     value: "6.2h / 4h", tone: "neg" },
      ],
    },
    {
      title: "Price defence",
      body: "Three reference points anchor the renewal.",
      bullets: ["Comparable account in same vertical: 14% YoY uplift", "Cost-per-active-user dropped 22% on our side this year", "Switching cost (CSM concierge): 11 weeks"],
    },
    {
      title: "Open risks",
      body: "What we'd flag before signature.",
      bullets: ["Sponsor changeover coming up", "Two stakeholders silent for 9+ days"],
    },
    {
      title: "Asks",
      body: "Confirm and counter.",
      bullets: ["Lock the renewal kickoff for 60 days out", "Same scope, expanded seat tier"],
    },
  ];
}

function execSlides(a: AccountDetail): Slide[] {
  const champion = a.stakeholders.find((s) => s.role === "Champion")?.name ?? "—";
  return [
    {
      title: `${a.name} · Exec 1-pager`,
      body: "One slide. The number, the ask, the risk.",
      metrics: [
        { label: "Health",    value: `${a.healthScore}/100`, tone: a.healthScore >= 80 ? "pos" : a.healthScore >= 60 ? "neutral" : "neg" },
        { label: "ARR",       value: a.arr ? fmtMoney(a.arr) : "—" },
        { label: "Renewal",   value: a.renewalDays > 0 ? `${a.renewalDays}d` : "lapsed", tone: a.renewalDays > 60 ? "pos" : a.renewalDays > 0 ? "neutral" : "neg" },
      ],
      bullets: [`Champion · ${champion}`, `One ask: 30-min cross-BU intro this week`, `One risk: sponsor silence on the secondary stakeholder`],
    },
  ];
}

export function DraftDeckModal({ open, account, onClose, template = "qbr" }: { open: boolean; account: AccountDetail | null; onClose: () => void; template?: DeckTemplate }) {
  const toast = useToast();
  const slides = useMemo(() => account ? slidesFor(account, template) : [], [account, template]);
  const STEPS = STEPS_BY_TEMPLATE[template];
  const [phase, setPhase] = useState<"building" | "review">("building");
  const [stepIdx, setStepIdx] = useState(0);
  const [revealed, setRevealed] = useState(-1);

  useEffect(() => {
    if (!open) return;
    setPhase("building");
    setRevealed(-1);
    setStepIdx(0);
  }, [open, account?.name]);

  // Drive build animation
  useEffect(() => {
    if (!open || phase !== "building") return;
    if (revealed >= slides.length - 1) {
      const t = setTimeout(() => setPhase("review"), 550);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setRevealed((r) => r + 1);
      setStepIdx((s) => Math.min(s + 1, STEPS.length - 1));
    }, 480);
    return () => clearTimeout(t);
  }, [open, phase, revealed, slides.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !account) return null;

  return (
    <>
      <div className="fixed inset-0 bg-ink/40 z-[100] fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-[110] grid place-items-center p-6 pointer-events-none">
        <div className="card pointer-events-auto fade-in flex flex-col" style={{ width: "min(880px, 92vw)", maxHeight: "90vh" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-line">
            <div className="flex items-center gap-3">
              <Logo name={account.name} size={32} rounded={8} />
              <div>
                <div className="text-[14px] font-semibold text-ink">{TEMPLATE_LABEL[template]} · {account.name}</div>
                <div className="text-[11.5px] text-muted">
                  {phase === "building" ? "Alphy is drafting your business review…" : `${slides.length} slides ready for review`}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg grid place-items-center text-muted hover:text-ink hover:bg-bg-deep">
              <X size={14} strokeWidth={1.6} />
            </button>
          </div>

          {/* Building phase */}
          {phase === "building" && (
            <div className="px-5 py-6 space-y-3">
              <div className="recessed p-4 flex items-center gap-3">
                <Loader2 size={16} strokeWidth={1.6} className="animate-spin text-muted" />
                <div className="flex-1">
                  <div className="text-[12.5px] font-semibold text-ink">{STEPS[stepIdx]}</div>
                  <div className="text-[10.5px] text-muted-2 mt-0.5">Step {stepIdx + 1} of {STEPS.length}</div>
                </div>
              </div>
              <div className="flex gap-1">
                {STEPS.map((_, i) => (
                  <span key={i} className="h-1 flex-1 rounded-full"
                    style={{ background: i <= stepIdx ? "var(--accent)" : "var(--bg-deep)" }} />
                ))}
              </div>

              {/* Slide reveal preview during build */}
              <div className="grid grid-cols-2 gap-2 mt-4 max-h-[40vh] overflow-y-auto">
                {slides.map((s, i) => (
                  <SlidePreview key={i} slide={s} index={i} dim={i > revealed} />
                ))}
              </div>
            </div>
          )}

          {/* Review phase */}
          {phase === "review" && (
            <>
              <div className="px-5 py-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-3">
                  {slides.map((s, i) => <SlidePreview key={i} slide={s} index={i} />)}
                </div>
              </div>
              <div className="px-5 py-3 border-t border-line flex items-center justify-end gap-2">
                <button onClick={onClose}
                  className="text-[12px] font-medium h-8 px-3 rounded-md border border-line bg-surface text-ink-2 hover:bg-bg-deep">
                  Cancel
                </button>
                <button onClick={() => toast({ tone: "success", title: "Deck downloaded", body: `${account.name} Q2 2026 Business Review.pptx` })}
                  className="text-[12px] font-medium h-8 px-3 rounded-md border border-line bg-surface text-ink-2 hover:bg-bg-deep inline-flex items-center gap-1.5">
                  <Download size={12} strokeWidth={1.8} /> Download .pptx
                </button>
                <button onClick={() => { toast({ tone: "success", title: "Deck shared", body: "Sent to the buying committee." }); onClose(); }}
                  className="text-[12px] font-medium h-8 px-3 rounded-md inline-flex items-center gap-1.5"
                  style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
                  <Send size={12} strokeWidth={1.8} /> Share with team
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function SlidePreview({ slide, index, dim }: { slide: Slide; index: number; dim?: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3 transition-opacity"
      style={{ opacity: dim ? 0.35 : 1 }}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-[9px] font-mono text-muted-2 tracking-[0.06em]">SLIDE {String(index + 1).padStart(2, "0")}</span>
        {!dim && <Check size={10} strokeWidth={2} style={{ color: "var(--accent-deep)" }} />}
      </div>
      <div className="text-[12px] font-semibold text-ink leading-snug">{slide.title}</div>
      <div className="text-[10.5px] text-muted leading-relaxed mt-1">{slide.body}</div>
      {slide.bullets && (
        <ul className="text-[10.5px] text-ink-2 mt-2 list-disc pl-3.5 space-y-0.5">
          {slide.bullets.slice(0, 2).map((b, i) => <li key={i} className="line-clamp-1">{b}</li>)}
        </ul>
      )}
      {slide.metrics && (
        <div className="grid grid-cols-3 gap-2 mt-2">
          {slide.metrics.map((m) => (
            <div key={m.label} className="recessed p-1.5">
              <div className="text-[10px] font-semibold tnum"
                style={{ color: m.tone === "pos" ? "var(--pos)" : m.tone === "neg" ? "var(--neg)" : "var(--ink)" }}>
                {m.value}
              </div>
              <div className="text-[9px] text-muted truncate">{m.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
