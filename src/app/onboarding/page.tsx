"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, ArrowLeft, Check, Flame, LayoutGrid, TrendingUp,
  Activity, Sparkles, ShieldCheck, Calendar, Heart, Users, BarChart3,
  Briefcase, LifeBuoy, Network, Target, FileText, Layers,
} from "lucide-react";
import { Inter } from "next/font/google";
import { AlphardLogo } from "@/components/AlphardLogo";
import { useUser } from "@/components/UserContext";
import { usePersona, PERSONA_LABEL } from "@/components/PersonaContext";
import type { Persona } from "@/lib/mock";
import { asset } from "@/lib/asset";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], display: "swap" });

const ACCENT = "#266DF0";

// =====================================================================
// Onboarding intro — quick visual tour of the platform's core surfaces
// =====================================================================

type Step = {
  id: string;
  Icon: any;
  iconBg: string;
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  screenshot: string;
};

// Persona-aware step decks. Each persona gets a 4-step tour highlighting
// the surfaces most relevant to their daily workflow.

const STEPS_AM: Step[] = [
  {
    id: "hot-list",
    Icon: Flame, iconBg: "#0F1218",
    eyebrow: "Today · the queue",
    title: "Open at 8am — your day is already prioritised.",
    body: "Every signal in your book — usage spikes, champion moves, ticket velocity, renewal proximity — fused into one ranked list. The top card is always the highest-leverage move you can make today.",
    bullets: [
      "Outcome: cut prep from 30 min/account to 3 min — Alphy drafts the email in your voice",
      "\"Why now\" chips show the evidence chain (LinkedIn move + usage data + email)",
      "Stale-detection nudges accounts you've gone silent on",
    ],
    screenshot: "/screenshots/home-am.png",
  },
  {
    id: "account-workspace",
    Icon: Layers, iconBg: "#0F1218",
    eyebrow: "Account workspace",
    title: "Every account, ten clean tabs deep.",
    body: "Click into any account: Overview · Signals · Journey · People · Deals · Tasks · White Space · Analytics · Docs · Agent. Real stakeholders, real signals, lifecycle stage chips, intent-curve hover, journey timeline with hover insights.",
    bullets: [
      "Outcome: walk into every conversation with receipts — full evidence chain on every signal",
      "Journey timeline merges domain + anonymous + champion identities",
      "White Space analysis surfaces uncovered SKUs and buying centres",
    ],
    screenshot: "/screenshots/account-detail.png",
  },
  {
    id: "expansion-scorecard",
    Icon: Target, iconBg: "#0F1218",
    eyebrow: "Expansion scorecard",
    title: "Target attainment in one bento board.",
    body: "Click your scorecard chip in the top bar — see your target, achieved, in-motion ARR, and a probability-weighted pipe in one screen. Stage funnel + likelihood mix + per-deal next-best-action chips.",
    bullets: [
      "Outcome: tell your manager exactly where the gap is — without a spreadsheet",
      "Weekly attainment sparkline with pace line",
      "Left-out section flags customers with no expansion play",
    ],
    screenshot: "/screenshots/forecast.png",
  },
  {
    id: "org-chart",
    Icon: Network, iconBg: "#0F1218",
    eyebrow: "Org chart · Relationship Hub",
    title: "Map the buying committee, find the gap.",
    body: "Per-account org chart with influence lines, decay alerts, C-suite coverage meter, white-space detection. Click any node for the Relationship Hub: notes, recent activity, action shortcuts.",
    bullets: [
      "Outcome: stop losing deals to a single-thread champion — multi-thread before it breaks",
      "Buying-committee filter highlights only deal participants",
      "Suggested next contact powered by your historical wins",
    ],
    screenshot: "/screenshots/account-detail.png",
  },
  {
    id: "ai-co-pilot",
    Icon: Sparkles, iconBg: "#0F1218",
    eyebrow: "Alphy · your AI co-pilot",
    title: "Spot · explain · draft · approve · plan.",
    body: "Click the rocket in the top bar to launch the guided tour. Alphy spots the play, explains the evidence, drafts the email in your voice, opens the deal workspace, and builds a one-page business case ready to attach.",
    bullets: [
      "Outcome: from signal at 8am to drafted email + business case before stand-up",
      "Personalised tour walks you through Cloudflare/Maya scenario end-to-end",
      "Approve in chat — Alphy never sends without you",
    ],
    screenshot: "/screenshots/home-am.png",
  },
];

const STEPS_CSM: Step[] = [
  {
    id: "saves",
    Icon: ShieldCheck, iconBg: "#0F1218",
    eyebrow: "Today · saves",
    title: "Highest-ARR-at-risk accounts, ranked.",
    body: "Renewal slipping, adoption decaying, champion drifting, ticket spikes. One ranked queue with the suggested save play on each — and a pre-flight modal that shows the 5-step play, owners, ETA before you fire it.",
    bullets: [
      "Outcome: catch the at-risk renewal 30+ days before procurement engages",
      "Save Play pre-flight: 5 numbered steps, owner + ETA + impact per step",
      "One-click escalate to exec sponsor with drafted exec-to-exec note",
    ],
    screenshot: "/screenshots/home-csm.png",
  },
  {
    id: "renewal-runway",
    Icon: Calendar, iconBg: "#0F1218",
    eyebrow: "Renewal runway",
    title: "Every renewal in the next 6 months, in one strip.",
    body: "Six month bars + a Today line + the soonest renewals as cards with day-progress bars. Colour-coded by urgency (red ≤30d / amber ≤60d / blue ≤90d).",
    bullets: [
      "Outcome: zero surprise renewals — every blocker visible 6 months out",
      "Hover any month bar to see the renewal count + ARR at stake",
      "Click any account to open the workspace's Renewing tab",
    ],
    screenshot: "/screenshots/home-csm.png",
  },
  {
    id: "insights-peek",
    Icon: Layers, iconBg: "#0F1218",
    eyebrow: "Insights peek",
    title: "Health drivers + stakeholder coverage in one panel.",
    body: "Click any customer to slide in the rounded insights panel — KPI chips for ARR / Renewal / Health / NRR, renewal forecast with confidence, stakeholder-coverage rows (Champion / Economic / Technical / End-user / Procurement), and a Health-drivers breakdown.",
    bullets: [
      "Outcome: diagnose the at-risk story in under a minute, not a half-hour spreadsheet",
      "Sponsor cadence + product usage + support burden + QBR cadence — colour-coded",
      "Run save play opens a pre-flight modal with the playbook ready to fire",
    ],
    screenshot: "/screenshots/account-detail.png",
  },
  {
    id: "white-space",
    Icon: TrendingUp, iconBg: "#0F1218",
    eyebrow: "White Space analysis",
    title: "What you've sold vs. what they could buy.",
    body: "Per-customer white-space matrix + a deep natural-language analysis: penetration today, validated-but-uncommercial usage, gap by buying centre, competitive displacement, sequencing the sale, estimated impact.",
    bullets: [
      "Outcome: pre-pack the next two quarters of expansion before the QBR",
      "Quantified ARR gap vs. addressable + 14-month payback math",
      "Threaded through real stakeholders (Maya in Eng, Naomi in Finance, etc.)",
    ],
    screenshot: "/screenshots/account-detail.png",
  },
  {
    id: "health-distribution",
    Icon: Heart, iconBg: "#0F1218",
    eyebrow: "Retention bento",
    title: "Your number, surfaced for next QBR.",
    body: "Click your retention chip in the top bar to land on the Retention bento: NRR projection, at-risk ARR, secured ARR, save plays in flight, and a 3-column health board (At risk / Watch / Healthy) — every customer sortable + clickable.",
    bullets: [
      "Outcome: walk into 1:1 with your VP knowing exactly which save plays move the number",
      "At-risk column sorted worst-first; healthy sorted for advocacy",
      "Filters auto-narrow to your scope — CSM-only book by default",
    ],
    screenshot: "/screenshots/portfolio.png",
  },
];

const STEPS_AE: Step[] = [
  {
    id: "pipeline",
    Icon: Flame, iconBg: "#0F1218",
    eyebrow: "Today · pipeline queue",
    title: "Your hottest open deals, prioritised.",
    body: "Every open deal sorted by what changed today: champion moves, demo scheduled, MSA redlines returned, procurement engaging. Stage chips on every card so you know exactly where each deal sits.",
    bullets: [
      "Outcome: zero forgotten deals — Alphard nudges every stalled opp >7 days silent",
      "Stage chips: Discovery · Demo · Proposal · Negotiation · Closing",
      "Per-deal Send questionnaire / Open deal CTAs — no copy-paste",
    ],
    screenshot: "/screenshots/home-am.png",
  },
  {
    id: "deal-drilldown",
    Icon: Layers, iconBg: "#0F1218",
    eyebrow: "Deal drilldown",
    title: "One workspace per deal, four sub-tabs deep.",
    body: "Open any deal: full touchpoint history, completed tasks, upcoming tasks, and Highest-ROI moves auto-ranked. Stage progress strip + 72% likelihood + ARR + close date all visible at a glance.",
    bullets: [
      "Outcome: walk into every call with the full picture — touchpoints, owners, ROI bars",
      "Highest-ROI tab surfaces the next best action: \"Multi-thread CFO\" / \"Send ROI calc\"",
      "Real-time signal feed: Adyen referenced in procurement note, FedRAMP accepted today",
    ],
    screenshot: "/screenshots/account-detail.png",
  },
  {
    id: "book-of-business",
    Icon: LayoutGrid, iconBg: "#0F1218",
    eyebrow: "Book of business",
    title: "Quick-filter chip row above the strip.",
    body: "AE scope auto-filters to prospects only. Click any stage chip — Discovery 6 · Demo 6 · Proposal 4 · Negotiation 3 — to instantly slice your book. Heat° score chips replace usage dots for prospects.",
    bullets: [
      "Outcome: triage 25 deals in 3 minutes — by stage, by owner, by heat",
      "Each prospect card carries a stage badge + heat° (60s = warming, 80s+ = on fire)",
      "Real brand logos on every account — never see a generic placeholder",
    ],
    screenshot: "/screenshots/accounts.png",
  },
  {
    id: "quota-bento",
    Icon: Target, iconBg: "#0F1218",
    eyebrow: "Quota scorecard",
    title: "Your number with the gap explained.",
    body: "Click your quota chip → bento board with Closed-won, Commit, Pipeline coverage (1.22×), Win rate cohort, quota progress with a stacked bar. Drill into any deal from the table below.",
    bullets: [
      "Outcome: tell your manager the path-to-quota in one sentence, with receipts",
      "Pipeline-heat replaces health-score for non-customers",
      "Search + Stage filter narrows the deal table inline",
    ],
    screenshot: "/screenshots/forecast.png",
  },
  {
    id: "ai-co-pilot-ae",
    Icon: Sparkles, iconBg: "#0F1218",
    eyebrow: "Alphy · your AI co-pilot",
    title: "Auto-prep every meeting, draft every reply.",
    body: "Press ⌘J anywhere to ask Alphy. \"Build me a call brief on Shopify\" or \"Draft a follow-up to Devon\" — Alphy reads CRM, calls, emails, transcripts and produces a structured report you can attach.",
    bullets: [
      "Outcome: cut prep from 30 min/call to 3 min — auto-built briefs",
      "Reports come with citations: which call, which email, which transcript span",
      "Approve before send — Alphy never sends without you",
    ],
    screenshot: "/screenshots/home-am.png",
  },
];

const STEPS_MANAGER: Step[] = [
  {
    id: "capacity",
    Icon: Users, iconBg: "#0F1218",
    eyebrow: "Team capacity",
    title: "Who's overloaded, who has room — instantly.",
    body: "Every rep on one heatmap: ARR managed, accounts in flight, renewals next 90, weekly workload score. Reassign accounts in two clicks with a drawer-animated handoff.",
    bullets: [
      "Outcome: rebalance the book in 5 minutes, not a half-hour spreadsheet review",
      "Workload heatmap: 6 weeks × every rep, colour-coded by intensity",
      "Health mix per rep — healthy / watch / at-risk dots",
    ],
    screenshot: "/screenshots/capacity.png",
  },
  {
    id: "team-commit-bento",
    Icon: Target, iconBg: "#0F1218",
    eyebrow: "Team commit scorecard",
    title: "Your number, per rep, in one bento.",
    body: "Team target · closed-won · team commit · forecast risk (reps below 70% commit). Per-rep table with stacked attainment bars. Click any rep to drill into their book.",
    bullets: [
      "Outcome: walk into the CRO 1:1 knowing exactly which reps need air cover",
      "Stacked bar per rep: closed (green) + commit (blue) — gap to target visible",
      "Coverage multiplier surfaces the cohort that needs more pipe",
    ],
    screenshot: "/screenshots/forecast.png",
  },
  {
    id: "portfolio-mgr",
    Icon: LayoutGrid, iconBg: "#0F1218",
    eyebrow: "Book of business · all reps",
    title: "Every account, every stage, all four personas.",
    body: "Manager scope shows the whole book — 35 accounts across all reps. Quick-filter chip row instantly narrows by stage. Stage badges + heat scores on every row.",
    bullets: [
      "Outcome: spot the at-risk renewal hidden in someone else's book before they do",
      "All filters available — Tier, Health, Stage, Watchlist, Usage health",
      "Click any account → V2 workspace (Overview · Signals · Journey · People · Deals)",
    ],
    screenshot: "/screenshots/accounts.png",
  },
  {
    id: "revenue-mgr",
    Icon: TrendingUp, iconBg: "#0F1218",
    eyebrow: "Revenue waterfall",
    title: "ARR movement, one chart, board-ready.",
    body: "Starting ARR → New → Expansion → Contraction → Churn → Ending ARR. The single chart that explains your quarter to the CRO without a slide deck.",
    bullets: [
      "Outcome: replace the quarterly slide build with a live, drillable chart",
      "Drill any segment to per-account movement",
      "Roll-up across teams or by segment — exec-ready",
    ],
    screenshot: "/screenshots/revenue.png",
  },
  {
    id: "activity-mgr",
    Icon: Activity, iconBg: "#0F1218",
    eyebrow: "Team activity feed",
    title: "What changed across the team overnight.",
    body: "Champion moves, deal stage changes, save plays fired, renewals advanced — one chronological feed. Spot the patterns before the QBR — not after.",
    bullets: [
      "Outcome: cancel the daily stand-up — the feed is the stand-up",
      "Cross-team signal aggregation with rep / account / signal-type filters",
      "Click any row to jump to the account workspace",
    ],
    screenshot: "/screenshots/home-am.png",
  },
];

const STEPS_BY_PERSONA: Record<Persona, Step[]> = {
  am: STEPS_AM,
  csm: STEPS_CSM,
  ae: STEPS_AE,
  manager: STEPS_MANAGER,
};

// Two-part copy so we can inject the company name in the middle.
const ROLE_BLURB: Record<Persona, { lead: string; tail: string }> = {
  am:      { lead: "We've spun up a sandbox book of business for", tail: " with realistic accounts, expansion signals, and growth plays." },
  csm:     { lead: "We've spun up a sandbox book of customers for", tail: " with realistic adoption, renewal, and health signals." },
  ae:      { lead: "We've spun up a sandbox pipeline for",          tail: " with realistic deals, prospect signals, and forecasting context." },
  manager: { lead: "We've spun up a sandbox team for",              tail: " with realistic capacity, portfolio, and revenue-movement signals." },
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const { persona } = usePersona();
  const [step, setStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);

  const STEPS = useMemo(() => STEPS_BY_PERSONA[persona] ?? STEPS_AM, [persona]);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  const next = () => {
    if (showWelcome) { setShowWelcome(false); return; }
    if (isLast) router.push("/home");
    else setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const back = () => {
    if (step === 0) setShowWelcome(true);
    else setStep((s) => Math.max(0, s - 1));
  };

  const skip = () => router.push("/home");

  return (
    <div className={`${inter.className} min-h-screen flex flex-col`}
      style={{ background: "#FAFAFB", color: "#0F1218" }}>

      <div aria-hidden className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 0%, rgba(38,109,240,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(124,58,237,0.06) 0%, transparent 60%)",
        }} />

      <header className="relative z-10 px-6 md:px-10 py-5 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(15,18,24,0.06)" }}>
        <button onClick={() => router.push("/")} className="flex items-center" aria-label="Alphard">
          <AlphardLogo variant="full" size={18} fill="#0F1218" />
        </button>
        <button onClick={skip}
          className="text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors"
          style={{ color: "rgba(15,18,24,0.55)" }}>
          Skip intro →
        </button>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-6 md:px-10 py-10">
        {showWelcome ? (
          <WelcomeScreen
            firstName={user.firstName}
            company={user.company}
            persona={persona}
            onNext={next}
            onSkip={skip}
          />
        ) : (
          <FeatureScreen
            step={step}
            total={STEPS.length}
            data={current}
            onNext={next}
            onBack={back}
            onSkip={skip}
            isLast={isLast}
          />
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
function WelcomeScreen({ firstName, company, persona, onNext, onSkip }: {
  firstName: string; company: string; persona: Persona;
  onNext: () => void; onSkip: () => void;
}) {
  const blurb = ROLE_BLURB[persona] ?? ROLE_BLURB.am;
  return (
    <div className="max-w-[640px] text-center">
      <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold tracking-[0.14em] uppercase px-3 py-1 rounded-full mb-5"
        style={{ background: "rgba(38,109,240,0.10)", color: "#266DF0" }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#266DF0" }} />
        Tour for {PERSONA_LABEL[persona]}
      </span>
      <h1 className="text-[36px] md:text-[52px] font-semibold mb-4 leading-[1.04]"
        style={{ letterSpacing: "-0.04em" }}>
        Welcome, {firstName}.
      </h1>
      <p className="text-[16.5px] md:text-[18px] mb-9 leading-relaxed max-w-[540px] mx-auto"
        style={{ color: "rgba(15,18,24,0.62)" }}>
        {blurb.lead}{" "}
        <span className="font-semibold" style={{ color: "#0F1218" }}>{company}</span>
        {blurb.tail} Let's take 60 seconds to show you around.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button onClick={onNext}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[14.5px] font-semibold text-white transition-all"
          style={{ background: "#0F1218", boxShadow: "0 10px 30px -10px rgba(15,18,24,0.3)" }}>
          Take the tour
          <ArrowRight size={14} strokeWidth={2.2} />
        </button>
        <button onClick={onSkip}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[14.5px] font-semibold transition-all bg-white"
          style={{ border: "1px solid rgba(15,18,24,0.12)", color: "#0F1218" }}>
          Take me to the workspace
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
function FeatureScreen({ step, total, data, onNext, onBack, onSkip, isLast }: {
  step: number;
  total: number;
  data: Step;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  isLast: boolean;
}) {
  return (
    <div className="w-full max-w-[1100px] grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
      <div>
        <div className="flex items-center gap-2 mb-5">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className="h-1.5 rounded-full transition-all"
              style={{
                width: i === step ? 28 : 8,
                background: i <= step ? ACCENT : "rgba(15,18,24,0.15)",
              }} />
          ))}
          <span className="ml-2 text-[10.5px] font-mono tnum"
            style={{ color: "rgba(15,18,24,0.45)" }}>
            {step + 1} of {total}
          </span>
        </div>

        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl grid place-items-center"
            style={{ background: data.iconBg }}>
            <data.Icon size={16} strokeWidth={2} className="text-white" />
          </div>
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: "rgba(15,18,24,0.55)" }}>
            {data.eyebrow}
          </span>
        </div>

        <h2 className="text-[30px] md:text-[40px] font-semibold mb-4 leading-[1.08]"
          style={{ letterSpacing: "-0.025em" }}>
          {data.title}
        </h2>
        <p className="text-[15.5px] mb-6 leading-relaxed"
          style={{ color: "rgba(15,18,24,0.62)" }}>
          {data.body}
        </p>

        <ul className="space-y-2.5 mb-8">
          {data.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-[13.5px]"
              style={{ color: "rgba(15,18,24,0.78)" }}>
              <Check size={15} strokeWidth={2.4} style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
              {b}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13.5px] font-medium transition-all bg-white"
            style={{ border: "1px solid rgba(15,18,24,0.12)", color: "#0F1218" }}>
            <ArrowLeft size={13} strokeWidth={2.2} />
            Back
          </button>
          <button onClick={onNext}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13.5px] font-semibold text-white transition-all"
            style={{ background: "#0F1218", boxShadow: "0 8px 24px -8px rgba(15,18,24,0.30)" }}>
            {isLast ? "Launch the workspace" : "Continue"}
            <ArrowRight size={13} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      <div className="relative">
        <div aria-hidden
          className="absolute -inset-12 rounded-[40px] blur-3xl opacity-40 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(38,109,240,0.30), transparent 70%)" }} />
        <div className="relative rounded-[14px] overflow-hidden bg-white"
          style={{
            border: "1px solid rgba(15,18,24,0.10)",
            boxShadow:
              "0 1px 2px rgba(15,18,24,0.04), 0 22px 70px -16px rgba(15,18,24,0.20), 0 30px 90px -30px rgba(38,109,240,0.15)",
          }}>
          <div className="flex items-center gap-1.5 px-3.5 py-2.5"
            style={{ background: "#FAFAFB", borderBottom: "1px solid rgba(15,18,24,0.06)" }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#FF5F57" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#FEBC2E" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#28C840" }} />
            <div className="ml-3 text-[10px] font-mono"
              style={{ color: "rgba(15,18,24,0.45)" }}>
              sandbox.alphard.ai
            </div>
          </div>
          <img key={data.id} src={asset(data.screenshot)} alt={data.title} className="w-full block" />
        </div>
      </div>
    </div>
  );
}
