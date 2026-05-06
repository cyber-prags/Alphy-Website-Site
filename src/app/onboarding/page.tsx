"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, ArrowLeft, Check, Flame, LayoutGrid, TrendingUp,
  Activity, Sparkles,
} from "lucide-react";
import { Inter } from "next/font/google";
import { AlphardLogo } from "@/components/AlphardLogo";
import { useUser } from "@/components/UserContext";
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

const STEPS: Step[] = [
  {
    id: "hot-list",
    Icon: Flame,
    iconBg: "#0F1218",
    eyebrow: "The hot list",
    title: "Every signal in your book, ranked daily.",
    body: "Open Alphard at 8am and see exactly which accounts are heating up — usage spikes, champion moves, ticket velocity, renewal proximity, all fused into one ranked list.",
    bullets: [
      "AI co-pilot drafts your follow-ups",
      "Reason chips on every account",
      "Stale detection on accounts you've gone silent on",
    ],
    screenshot: "/screenshots/home-am.png",
  },
  {
    id: "portfolio",
    Icon: LayoutGrid,
    iconBg: "#0F1218",
    eyebrow: "Portfolio quadrant",
    title: "Decide where to push, defend, or walk away.",
    body: "Plot every account on Health × Expansion potential. The Boston-box for AMs — instantly see which segment each account belongs in, and what the right play is.",
    bullets: [
      "Strategic Growth · Steady State · Save & Grow · Reassess",
      "Bubbles sized by ARR, hover for full context",
      "Recommended plays per quadrant",
    ],
    screenshot: "/screenshots/portfolio.png",
  },
  {
    id: "growth",
    Icon: TrendingUp,
    iconBg: "#0F1218",
    eyebrow: "Growth plan",
    title: "Four-quarter expansion plan per account.",
    body: "ARR ladder, quarterly bets, stakeholder coverage matrix, success criteria — replaces the spreadsheet you used to keep on the side. Lives with the account.",
    bullets: [
      "Drag bets between quarters to re-plan",
      "Stakeholder buy-in: champion / economic / technical / end-user / procurement",
      "Pipeline cover percentage to your target",
    ],
    screenshot: "/screenshots/account-detail.png",
  },
  {
    id: "activity",
    Icon: Activity,
    iconBg: "#0F1218",
    eyebrow: "Activity feed",
    title: "What changed overnight on your book.",
    body: "Champion moves, departures, usage spikes, renewal events — chronological feed grouped Today / Yesterday / Earlier this week. Catch up in 60 seconds.",
    bullets: [
      "Champion-change detection from email + calendar + LinkedIn",
      "Cross-account signal aggregation",
      "Click any row to jump to the account",
    ],
    screenshot: "/screenshots/home-am.png",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);

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
function WelcomeScreen({ firstName, company, onNext, onSkip }: {
  firstName: string; company: string; onNext: () => void; onSkip: () => void;
}) {
  return (
    <div className="max-w-[640px] text-center">
      <h1 className="text-[36px] md:text-[52px] font-semibold mb-4 leading-[1.04]"
        style={{ letterSpacing: "-0.04em" }}>
        Welcome, {firstName}.
      </h1>
      <p className="text-[16.5px] md:text-[18px] mb-9 leading-relaxed max-w-[520px] mx-auto"
        style={{ color: "rgba(15,18,24,0.62)" }}>
        We've spun up a sandbox book of business for{" "}
        <span className="font-semibold" style={{ color: "#0F1218" }}>{company}</span> with
        realistic accounts, signals, and expansion opportunities.
        Let's take 60 seconds to show you around.
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
