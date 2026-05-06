"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import {
  ArrowRight, ShieldCheck, Sparkles, TrendingUp, Users, LayoutGrid,
  LineChart, Zap, Eye, Crown, ChevronRight, Check, Star, Flame, Activity,
  Mail, BookOpen, Plus,
} from "lucide-react";
import { MarketingNav } from "@/components/MarketingNav";
import { AlphardLogo } from "@/components/AlphardLogo";
import { AnimatedChat } from "@/components/AnimatedChat";
import { AnimatedEmailDraft } from "@/components/AnimatedEmailDraft";
import { AnimatedPlaybook } from "@/components/AnimatedPlaybook";
import { AnimatedCounter } from "@/components/AnimatedCounter";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// ──────────────────────────────────────────────────────────────────────
const ACCENT = "#266DF0";

// ──────────────────────────────────────────────────────────────────────
function Reveal({
  children, delay = 0, className = "", y = 16,
}: { children: React.ReactNode; delay?: number; className?: string; y?: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.1, rootMargin: "0px 0px -80px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity 800ms ease-out ${delay}ms, transform 800ms ease-out ${delay}ms`,
      }}>
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
function ProductFrame({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div aria-hidden
        className="absolute -inset-8 rounded-[40px] blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(38,109,240,0.08) 0%, transparent 70%)" }} />
      <div className="relative rounded-[14px] overflow-hidden bg-white"
        style={{
          border: "1px solid rgba(15,18,24,0.08)",
          boxShadow:
            "0 1px 2px rgba(15,18,24,0.04), 0 18px 60px -16px rgba(15,18,24,0.18), 0 30px 90px -30px rgba(38,109,240,0.10)",
        }}>
        <div className="flex items-center gap-1.5 px-3.5 py-2.5"
          style={{ background: "#FAFAFB", borderBottom: "1px solid rgba(15,18,24,0.06)" }}>
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#FF5F57" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#FEBC2E" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#28C840" }} />
          <div className="ml-3 text-[10px] text-[rgba(15,18,24,0.45)] font-mono">sandbox.alphard.ai</div>
        </div>
        <img src={src} alt={alt} className="w-full block" />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 80); return () => clearTimeout(t); }, []);

  return (
    <div
      className={`${inter.className} relative min-h-screen overflow-x-hidden`}
      style={{
        background: "#FAFAFB",
        color: "#0F1218",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      {/* Soft ambient gradient behind hero */}
      <div aria-hidden
        className="absolute inset-x-0 top-0 h-[800px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(38,109,240,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 30%, rgba(124,58,237,0.05) 0%, transparent 60%)",
        }} />
      <div aria-hidden
        className="absolute inset-x-0 top-0 h-[800px] pointer-events-none opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,18,24,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,18,24,0.04) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "linear-gradient(to bottom, black 0%, transparent 80%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 80%)",
        }} />

      <div className="relative z-10 px-6 md:px-10 lg:px-12 max-w-[1320px] mx-auto">
        <MarketingNav />

        {/* ───────────────────── HERO ───────────────────── */}
        <section className="pt-20 md:pt-28 pb-14 md:pb-20 text-center">
          <div
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 700ms, transform 700ms",
            }}
            className="inline-flex items-center mb-7"
          >
            <span
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-medium"
              style={{
                background: "rgba(38,109,240,0.06)",
                border: "1px solid rgba(38,109,240,0.20)",
                color: ACCENT,
              }}
            >
              <Flame size={11} strokeWidth={2.4} />
              The Expansion OS for Account Managers
            </span>
          </div>

          <h1
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 800ms 100ms, transform 800ms 100ms",
              letterSpacing: "-0.045em",
              lineHeight: 1.02,
            }}
            className="text-[44px] md:text-[64px] lg:text-[80px] font-semibold mb-6"
          >
            Run{" "}
            <span
              style={{
                backgroundImage: `linear-gradient(135deg, ${ACCENT} 0%, #7C3AED 60%, #F5360F 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Expansion
            </span>{" "}
            like a pipeline.
          </h1>

          <p
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 800ms 250ms, transform 800ms 250ms",
              color: "rgba(15,18,24,0.65)",
            }}
            className="text-[17px] md:text-[19px] max-w-[700px] mx-auto mb-9 leading-relaxed"
          >
            Every signal in your book — usage, champion moves, ticket velocity, renewal proximity — fused into one ranked daily list of expansion plays. Built for Account Managers who treat their book like pipeline, not paperwork.
          </p>

          <div
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 800ms 400ms, transform 800ms 400ms",
            }}
            className="flex flex-wrap items-center justify-center gap-3 mb-3"
          >
            <button
              onClick={() => router.push("/signin")}
              className="group inline-flex items-center gap-2 bg-[#0F1218] text-white px-7 py-3.5 rounded-xl text-[14.5px] font-semibold hover:bg-black transition-all"
              style={{ boxShadow: "0 10px 30px -10px rgba(15,18,24,0.30)" }}
            >
              Launch the demo
              <ArrowRight size={15} strokeWidth={2.4} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => router.push("/portfolio")}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[14.5px] font-semibold transition-all"
              style={{
                background: "white",
                border: "1px solid rgba(15,18,24,0.12)",
                color: "#0F1218",
              }}
            >
              See the portfolio view
            </button>
          </div>

          <div
            style={{
              opacity: heroVisible ? 1 : 0,
              transition: "opacity 800ms 600ms",
              color: "rgba(15,18,24,0.45)",
            }}
            className="text-[12px] mb-16"
          >
            No credit card · Live demo · Sandbox data
          </div>

          <Reveal delay={300} y={32}>
            <div className="mt-2 max-w-[1180px] mx-auto px-2 md:px-0">
              <ProductFrame src="/screenshots/home-am.png" alt="Alphard AM home — today's expansion plays" />
            </div>
          </Reveal>
        </section>

        {/* ───────────────────── INTEGRATIONS ───────────────────── */}
        <IntegrationsStrip />

        {/* ───────────────────── ANIMATED CHAT FEATURE ───────────────────── */}
        <section className="py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal>
              <FeatureLabel icon={Sparkles} text="REVENUE AGENT" />
              <h2 className="text-[34px] md:text-[44px] font-semibold mb-5 leading-[1.05]" style={{ letterSpacing: "-0.03em" }}>
                Ask anything about your book.
                <br />
                <span style={{ color: "rgba(15,18,24,0.55)" }}>Get the answer with the receipts.</span>
              </h2>
              <p className="text-[15.5px] leading-relaxed mb-7" style={{ color: "rgba(15,18,24,0.62)" }}>
                The Revenue Agent reads your CRM, calls, emails, calendar, product usage and ticket data — then answers in plain English with structured next steps. Every claim cites the underlying signal.
              </p>
              <ul className="space-y-3 mb-2">
                {[
                  "Account-aware: knows champions, deals, renewals, history",
                  "Drafts replies, briefs, and proposals you can ship in two clicks",
                  "Cross-account queries: 'which of my Strategic accounts are heating up?'",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[14.5px]" style={{ color: "rgba(15,18,24,0.78)" }}>
                    <Check size={16} strokeWidth={2.4} style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={120}>
              <AnimatedChat />
            </Reveal>
          </div>
        </section>

        {/* ───────────────────── AUTOMATED OUTREACH ───────────────────── */}
        <section className="py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal delay={120} className="lg:order-2">
              <FeatureLabel icon={Mail} text="AUTOMATED OUTREACH" />
              <h2 className="text-[34px] md:text-[44px] font-semibold mb-5 leading-[1.05]" style={{ letterSpacing: "-0.03em" }}>
                Drafted emails that read like you — with the receipts already in.
              </h2>
              <p className="text-[15.5px] leading-relaxed mb-7" style={{ color: "rgba(15,18,24,0.62)" }}>
                Alphard reads your CRM, calls, calendar, product usage, and last week's emails — then drafts the follow-up with the right context, the right tone, the right next ask. You hit send.
              </p>
              <ul className="space-y-3 mb-2">
                {[
                  "Personalized to the prospect's role, history, and last touch",
                  "Context-aware: pulls champion changes, comparable wins, ROI numbers",
                  "Voice-matched to your past emails — no generic AI-speak",
                  "One-click send, schedule, or hand off to a sequence",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[14.5px]" style={{ color: "rgba(15,18,24,0.78)" }}>
                    <Check size={16} strokeWidth={2.4} style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal className="lg:order-1">
              <AnimatedEmailDraft />
            </Reveal>
          </div>
        </section>

        {/* ───────────────────── CUSTOM PLAYBOOKS ───────────────────── */}
        <section className="py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal>
              <FeatureLabel icon={BookOpen} text="ACCOUNT PLAYBOOKS" />
              <h2 className="text-[34px] md:text-[44px] font-semibold mb-5 leading-[1.05]" style={{ letterSpacing: "-0.03em" }}>
                A custom playbook for every account. Auto-curated, always fresh.
              </h2>
              <p className="text-[15.5px] leading-relaxed mb-7" style={{ color: "rgba(15,18,24,0.62)" }}>
                No more generic frameworks. Alphard reads the last 8 weeks of signals on each account and writes a tailored play-by-play — who to call, what to send, what to ask for. Updates the moment something material changes.
              </p>
              <ul className="space-y-3 mb-2">
                {[
                  "Tailored to the account's segment, stage, and active signals",
                  "Auto-refreshed when champions move, usage spikes, or renewals approach",
                  "Plays sequenced in priority order with the right asset attached",
                  "Library of starter plays you can clone and personalize for every customer",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[14.5px]" style={{ color: "rgba(15,18,24,0.78)" }}>
                    <Check size={16} strokeWidth={2.4} style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={120}>
              <AnimatedPlaybook />
            </Reveal>
          </div>
        </section>

        {/* ───────────────────── PROBLEM FRAME ───────────────────── */}
        <section className="py-20 md:py-28">
          <Reveal>
            <div className="max-w-[820px] mx-auto text-center mb-14">
              <FeatureLabel icon={Eye} text="THE EXPANSION GAP" center />
              <h2 className="text-[34px] md:text-[48px] font-semibold mb-5 leading-[1.05]" style={{ letterSpacing: "-0.03em" }}>
                Health tools answer "will they churn?" Forecasts answer "will the deal close?"
                <br />
                <span style={{ color: "rgba(15,18,24,0.55)" }}>Nobody answers the question that pays your number.</span>
              </h2>
              <p className="text-[16.5px] leading-relaxed max-w-[640px] mx-auto" style={{ color: "rgba(15,18,24,0.65)" }}>
                <span className="font-semibold" style={{ color: ACCENT }}>"Which of my 40 accounts is ready to be 2x'd next quarter — and what should I do about it on Tuesday?"</span> Alphard is built around that one question.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5 max-w-[960px] mx-auto">
            {[
              { problem: "Gainsight", coded: "Health-coded", focus: "Tells you who's about to churn." },
              { problem: "Clari", coded: "Forecast-coded", focus: "Tells you which deals will close." },
              { problem: "Spreadsheets", coded: "Memory-coded", focus: "Tells you what you tracked manually." },
            ].map((s) => (
              <div key={s.problem} className="rounded-2xl p-5 bg-white"
                style={{ border: "1px solid rgba(15,18,24,0.08)" }}>
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] mb-1.5" style={{ color: "rgba(15,18,24,0.45)" }}>{s.coded}</div>
                <div className="text-[17px] font-semibold mb-1">{s.problem}</div>
                <div className="text-[13px]" style={{ color: "rgba(15,18,24,0.55)" }}>{s.focus}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ───────────────────── FEATURE 1 — THE HOT LIST ───────────────────── */}
        <section className="py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal>
              <FeatureLabel icon={Flame} text="THE HOT LIST" />
              <h2 className="text-[34px] md:text-[44px] font-semibold mb-5 leading-[1.05]" style={{ letterSpacing: "-0.03em" }}>
                Every signal in your book, fused into one ranked daily list.
              </h2>
              <p className="text-[15.5px] leading-relaxed mb-7" style={{ color: "rgba(15,18,24,0.62)" }}>
                Usage spikes, champion moves, ticket velocity, renewal proximity, hiring signals — all aggregated into one expansion score per account. Re-ranked every morning. Built for the AM who opens their laptop at 8am and asks "what's heating up today?"
              </p>
              <ul className="space-y-3.5 mb-8">
                {[
                  "5-factor scoring trained on real expansion outcomes — not generic frameworks",
                  "Reason chips on every account: usage +40%, champion promoted, renewal in 67d",
                  "AI-drafted next move + suggested reply you can send in two clicks",
                  "Stale detection — accounts you haven't touched in 14+ days that are still growing",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[14.5px]" style={{ color: "rgba(15,18,24,0.78)" }}>
                    <Check size={16} strokeWidth={2.4} style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={120}>
              <ProductFrame src="/screenshots/home-am.png" alt="The Hot List — ranked daily" />
            </Reveal>
          </div>
        </section>

        {/* ───────────────────── FEATURE 2 — PORTFOLIO QUADRANT ───────────────────── */}
        <section className="py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal delay={120} className="lg:order-2">
              <FeatureLabel icon={LayoutGrid} text="PORTFOLIO QUADRANT" />
              <h2 className="text-[34px] md:text-[44px] font-semibold mb-5 leading-[1.05]" style={{ letterSpacing: "-0.03em" }}>
                Where every account stands. Before quarterly planning forces the question.
              </h2>
              <p className="text-[15.5px] leading-relaxed mb-7" style={{ color: "rgba(15,18,24,0.62)" }}>
                Plot every customer on Health × Expansion potential. Decide where to push, where to defend, where to walk away — without spreadsheets, slide decks, or guesswork.
              </p>
              <ul className="space-y-3.5">
                {[
                  "Strategic Growth · Steady State · Save & Grow · Reassess — segments with built-in playbooks",
                  "Bubbles sized by ARR, hover for full account context",
                  "Recommended plays per quadrant — what to do this week, not just where the dot sits",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[14.5px]" style={{ color: "rgba(15,18,24,0.78)" }}>
                    <Check size={16} strokeWidth={2.4} style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal className="lg:order-1">
              <ProductFrame src="/screenshots/portfolio.png" alt="Portfolio quadrant — Boston-box for AMs" />
            </Reveal>
          </div>
        </section>

        {/* ───────────────────── FEATURE 3 — GROWTH PLAN ───────────────────── */}
        <section className="py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal>
              <FeatureLabel icon={TrendingUp} text="GROWTH PLAN" />
              <h2 className="text-[34px] md:text-[44px] font-semibold mb-5 leading-[1.05]" style={{ letterSpacing: "-0.03em" }}>
                A four-quarter expansion plan per account. Not a 50-page slide deck.
              </h2>
              <p className="text-[15.5px] leading-relaxed mb-7" style={{ color: "rgba(15,18,24,0.62)" }}>
                Current ARR vs target. Quarterly bets ranked by stage. Stakeholder coverage matrix. Success criteria with green/red status. Everything you used to keep in a private spreadsheet — now living with the account.
              </p>
              <ul className="space-y-3.5">
                {[
                  "ARR ladder + pipeline cover percentage to target",
                  "Quarterly bet lanes — drag bets between Q2 / Q3 / Q4 / Q1 to re-plan",
                  "Stakeholder buy-in matrix: champion / economic / technical / end-user / procurement",
                  "Success criteria KPIs that turn red before the relationship does",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[14.5px]" style={{ color: "rgba(15,18,24,0.78)" }}>
                    <Check size={16} strokeWidth={2.4} style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={120}>
              <ProductFrame src="/screenshots/account-detail.png" alt="Growth plan per account" />
            </Reveal>
          </div>
        </section>

        {/* ───────────────────── METRICS ───────────────────── */}
        <section className="py-20 md:py-24">
          <Reveal>
            <div className="text-center max-w-[640px] mx-auto mb-12">
              <FeatureLabel icon={Activity} text="THE NUMBERS" center />
              <h2 className="text-[32px] md:text-[44px] font-semibold mb-3 leading-[1.05]" style={{ letterSpacing: "-0.03em" }}>
                What AMs ship after switching to Alphard.
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden"
              style={{ background: "rgba(15,18,24,0.06)" }}>
              {[
                { target: 3.4,  prefix: "", suffix: "x",     decimals: 1, l: "Lift in expansion close rate", c: ACCENT },
                { target: 112,  prefix: "", suffix: "%",     decimals: 0, l: "Avg net revenue retention",    c: "#0FC27B" },
                { target: 27,   prefix: "", suffix: " hrs",  decimals: 0, l: "Returned to each AM weekly",   c: "#0F1218" },
                { target: 4,    prefix: "", suffix: " days", decimals: 0, l: "Cut from typical deal cycle",  c: "#0FC27B" },
              ].map((m, i) => (
                <div key={i} className="px-6 py-9 md:py-10 text-center bg-white">
                  <div className="text-[36px] md:text-[44px] font-semibold mb-1.5"
                    style={{ color: m.c, letterSpacing: "-0.03em" }}>
                    <AnimatedCounter target={m.target} prefix={m.prefix} suffix={m.suffix} decimals={m.decimals} />
                  </div>
                  <div className="text-[12.5px]" style={{ color: "rgba(15,18,24,0.55)" }}>{m.l}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ───────────────────── FEATURE GRID — supporting capabilities ───────────────────── */}
        <section className="py-20 md:py-28">
          <Reveal>
            <div className="text-center max-w-[640px] mx-auto mb-14">
              <h2 className="text-[32px] md:text-[44px] font-semibold mb-3 leading-[1.05]" style={{ letterSpacing: "-0.03em" }}>
                Everything else an AM expects. Just done right.
              </h2>
              <p className="text-[15.5px] leading-relaxed" style={{ color: "rgba(15,18,24,0.65)" }}>
                Account briefs, pipeline forecasting, capacity planning, journey orchestration — all expansion-coded, all expensive elsewhere.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: "Book of business",      outcome: "$215K pipeline surfaced",  copy: "Every customer with expansion score, hot signals, and pipeline coverage — at a glance.",            src: "/screenshots/accounts.png",       tone: ACCENT },
              { title: "Account intelligence",  outcome: "QBR prep cut to 8 minutes", copy: "Health, NRR, champion, success plan, and expansion bets in one continuously-updating view.",     src: "/screenshots/account-detail.png", tone: "#7C3AED" },
              { title: "Forecast roll-up",      outcome: "92% accuracy at week 8",   copy: "Pipeline coverage, commit, most-likely, best case — by manager and by segment.",                  src: "/screenshots/forecast.png",       tone: "#0FC27B" },
              { title: "Journey orchestration", outcome: "3.4× re-engagement lift",  copy: "Adoption, onboarding, and expansion campaigns with conditional steps and live metrics.",          src: "/screenshots/campaigns.png",      tone: ACCENT },
              { title: "Capacity planning",     outcome: "Spot overload 2 weeks early", copy: "Workload heatmap across the team. Catch the at-risk book before churn shows up.",              src: "/screenshots/capacity.png",       tone: "#F5B900" },
              { title: "Revenue waterfall",     outcome: "Stops $480K of leak",      copy: "Funnel and ARR movement. Where revenue is born and where it leaks.",                              src: "/screenshots/revenue.png",        tone: "#0FC27B" },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 60}>
                <div className="group rounded-2xl overflow-hidden h-full bg-white transition-all hover:-translate-y-1 hover:shadow-[0_18px_50px_-18px_rgba(15,18,24,0.18)]"
                  style={{
                    border: "1px solid rgba(15,18,24,0.08)",
                    boxShadow: "0 1px 2px rgba(15,18,24,0.04)",
                  }}>
                  <div className="relative overflow-hidden border-b" style={{ borderColor: "rgba(15,18,24,0.06)" }}>
                    <img src={f.src} alt={f.title} className="w-full block transition-transform duration-700 group-hover:scale-[1.04]" />
                    <span
                      className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold backdrop-blur"
                      style={{
                        background: `color-mix(in srgb, ${f.tone} 12%, white)`,
                        color: f.tone,
                        border: `1px solid ${f.tone}40`,
                      }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: f.tone }} />
                      {f.outcome}
                    </span>
                  </div>
                  <div className="px-5 py-5">
                    <div className="text-[15.5px] font-semibold mb-1.5">{f.title}</div>
                    <div className="text-[13px] leading-relaxed" style={{ color: "rgba(15,18,24,0.58)" }}>{f.copy}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ───────────────────── FOR THE CRO ───────────────────── */}
        <section className="py-20 md:py-28">
          <Reveal>
            <div className="rounded-3xl px-8 py-14 md:px-16 md:py-20 max-w-[1100px] mx-auto"
              style={{
                background: "linear-gradient(135deg, #0F1218 0%, #1a1f2a 100%)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 30px 90px -30px rgba(15,18,24,0.30)",
              }}>
              <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                <div>
                  <FeatureLabelDark icon={Crown} text="FOR THE CRO" />
                  <h2 className="text-[30px] md:text-[40px] font-semibold mb-5 leading-[1.05]" style={{ letterSpacing: "-0.025em" }}>
                    When an AM leaves, the relationship doesn't.
                  </h2>
                  <p className="text-[15.5px] leading-relaxed mb-7" style={{ color: "rgba(255,255,255,0.65)" }}>
                    Today, every AM walks out the door with their Excel, their Slack DMs, their head full of context. Alphard makes the institutional knowledge — champion intel, decision-maker maps, comparable wins, pricing memory — a property of the account, not the person.
                  </p>
                  <ul className="space-y-3 mb-2">
                    {[
                      "Champion + stakeholder maps preserved across owner changes",
                      "Every call recap, email thread, and signal indexed against the account",
                      "Multi-product books: ARR by product, expansion playbook per product",
                      "Cross-channel handoff: AE → AM → CSM with packaged context",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-3 text-[14.5px]" style={{ color: "rgba(255,255,255,0.85)" }}>
                        <Check size={16} strokeWidth={2.4} style={{ color: "#A4C2FA" }} className="mt-0.5 shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual: knowledge persisting across AM changes */}
                <div className="relative">
                  <div aria-hidden className="absolute -inset-12 rounded-[40px] blur-3xl opacity-30 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse at center, rgba(38,109,240,0.5), transparent 70%)" }} />
                  <div className="relative rounded-2xl p-6 space-y-3"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      backdropFilter: "blur(20px)",
                    }}>
                    <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: "rgba(255,255,255,0.50)" }}>
                      Cloudflare · institutional memory
                    </div>
                    {[
                      { label: "Champion intel", value: "Maya Chen — VP Eng promoted Apr 26", color: "#A4C2FA" },
                      { label: "Decision process", value: "Procurement: 3 quotes >$50K · Sec review required", color: "#A4C2FA" },
                      { label: "Comparable wins", value: "Databricks $135K · HashiCorp $110K · Elastic $95K", color: "#0FC27B" },
                      { label: "Pricing memory", value: "Last expansion at 18% discount, multi-year preferred", color: "#FEBC2E" },
                      { label: "Owner history", value: "Walid (current) ← Brad Allen (acquired 2024)", color: "rgba(255,255,255,0.55)" },
                    ].map((row) => (
                      <div key={row.label} className="rounded-lg px-3 py-2.5"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="text-[10px] uppercase tracking-[0.12em] font-semibold mb-0.5"
                          style={{ color: "rgba(255,255,255,0.45)" }}>{row.label}</div>
                        <div className="text-[12.5px] font-medium" style={{ color: row.color }}>{row.value}</div>
                      </div>
                    ))}
                    <div className="text-[10.5px] text-center pt-2" style={{ color: "rgba(255,255,255,0.40)" }}>
                      ↑ Stays with the account when the AM rotates
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ───────────────────── MULTI-PRODUCT ───────────────────── */}
        <section className="py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal>
              <FeatureLabel icon={LayoutGrid} text="MULTI-PRODUCT BOOKS" />
              <h2 className="text-[34px] md:text-[44px] font-semibold mb-5 leading-[1.05]" style={{ letterSpacing: "-0.03em" }}>
                Sell different products into different buyers — at the same customer.
              </h2>
              <p className="text-[15.5px] leading-relaxed mb-7" style={{ color: "rgba(15,18,24,0.62)" }}>
                Modern B2B SaaS sells Product A to RevOps, Product B to Sales, Product C to Engineering — same logo, different buyers, different motions. Alphard handles each product as its own expansion lane, with its own champion, its own comparable wins, its own playbook.
              </p>
              <ul className="space-y-3 mb-2">
                {[
                  "Per-product expansion score, pipeline, and active opportunities",
                  "White-space matrix shows which products live where in the org",
                  "Cross-sell recommendations sourced from comparable accounts",
                  "Each product has its own champion map — not lumped into one account view",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[14.5px]" style={{ color: "rgba(15,18,24,0.78)" }}>
                    <Check size={16} strokeWidth={2.4} style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={120}>
              <MultiProductMatrix />
            </Reveal>
          </div>
        </section>

        {/* ───────────────────── WHY ALPHARD ───────────────────── */}
        <section className="py-20 md:py-28">
          <Reveal>
            <div className="text-center max-w-[700px] mx-auto mb-14">
              <FeatureLabel icon={Star} text="WHY ALPHARD" center />
              <h2 className="text-[32px] md:text-[44px] font-semibold mb-3 leading-[1.05]" style={{ letterSpacing: "-0.03em" }}>
                We're the first tool actually named to the AM expansion job.
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { Icon: Zap,         title: "Expansion-first, retention-aware",  copy: "Every score, every play, every ranking is expansion-coded — and CSMs get a clean view of health and adoption alongside. Both motions, one workspace." },
              { Icon: Crown,       title: "Champion intelligence built-in",   copy: "Promotions, departures, role changes detected from email + calendar + LinkedIn — before they show up in your CRM." },
              { Icon: TrendingUp,  title: "Real outcomes, not frameworks",    copy: "Models trained on real expansion conversions. Comparable-deal benchmarks per industry, segment, and product." },
              { Icon: Users,       title: "One workspace, four lenses",       copy: "AE, AM, CSM, Manager — same data, different surfaces. No more stitching three SaaS tools together." },
              { Icon: ShieldCheck, title: "Enterprise-grade by default",      copy: "SOC 2, SSO, granular role-based access, full data residency. Yes, even in the demo." },
              { Icon: LineChart,   title: "Lives where revenue lives",        copy: "Bi-directional sync with Salesforce, HubSpot, Gong, Outreach, Slack, and your data warehouse." },
            ].map((d, i) => (
              <Reveal key={d.title} delay={i * 50}>
                <div className="rounded-2xl p-6 h-full bg-white"
                  style={{ border: "1px solid rgba(15,18,24,0.08)" }}>
                  <div className="w-10 h-10 rounded-xl grid place-items-center mb-4"
                    style={{ background: "rgba(38,109,240,0.08)", border: "1px solid rgba(38,109,240,0.18)" }}>
                    <d.Icon size={17} strokeWidth={1.8} style={{ color: ACCENT }} />
                  </div>
                  <div className="text-[16px] font-semibold mb-2">{d.title}</div>
                  <div className="text-[13.5px] leading-relaxed" style={{ color: "rgba(15,18,24,0.58)" }}>{d.copy}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ───────────────────── TESTIMONIAL ───────────────────── */}
        <section className="py-16 md:py-24">
          <Reveal>
            <div className="rounded-3xl px-8 py-14 md:px-16 md:py-20 max-w-[960px] mx-auto text-center bg-white relative overflow-hidden"
              style={{ border: "1px solid rgba(15,18,24,0.08)", boxShadow: "0 1px 2px rgba(15,18,24,0.04)" }}>
              <div aria-hidden
                className="absolute -top-32 -right-24 w-96 h-96 rounded-full blur-3xl opacity-30 pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(38,109,240,0.5), transparent 70%)" }} />
              <div className="relative">
                <div className="flex items-center justify-center gap-1 mb-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={15} fill="#FEBC2E" stroke="#FEBC2E" />
                  ))}
                </div>
                <p className="text-[19px] md:text-[24px] font-medium leading-[1.4] mb-7"
                  style={{ letterSpacing: "-0.012em", color: "#0F1218" }}>
                  "We replaced two tools and a spreadsheet with Alphard. Our AMs walk into every call with a ranked list. Net retention crossed 120% the same quarter we rolled it out."
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full grid place-items-center text-[12px] font-bold text-white"
                    style={{ background: ACCENT }}>MR</div>
                  <div className="text-left">
                    <div className="text-[13.5px] font-semibold">Maria Rojas</div>
                    <div className="text-[12px]" style={{ color: "rgba(15,18,24,0.55)" }}>VP Customer Success, Tableau</div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ───────────────────── FINAL CTA ───────────────────── */}
        <section className="py-20 md:py-28 text-center">
          <Reveal>
            <h2 className="text-[40px] md:text-[60px] font-semibold mb-5 leading-[1.02]"
              style={{ letterSpacing: "-0.04em" }}>
              Stop reacting.{" "}
              <span style={{
                backgroundImage: `linear-gradient(135deg, #0F1218 0%, ${ACCENT} 80%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Start running expansion.
              </span>
            </h2>
            <p className="text-[16.5px] max-w-[560px] mx-auto mb-9" style={{ color: "rgba(15,18,24,0.62)" }}>
              The platform AMs switched to. Live sandbox spins up in under 30 seconds.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => router.push("/signin")}
                className="group inline-flex items-center gap-2 bg-[#0F1218] text-white px-8 py-4 rounded-xl text-[15px] font-semibold hover:bg-black transition-all"
                style={{ boxShadow: "0 14px 36px -10px rgba(15,18,24,0.32)" }}
              >
                Launch the demo
                <ArrowRight size={16} strokeWidth={2.4} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => router.push("/pricing")}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-[15px] font-semibold transition-all bg-white"
                style={{ border: "1px solid rgba(15,18,24,0.12)", color: "#0F1218" }}
              >
                Talk to sales
              </button>
            </div>
          </Reveal>
        </section>

        {/* ───────────────────── FOOTER ───────────────────── */}
        <footer className="pt-12 pb-12 mt-12"
          style={{ borderTop: "1px solid rgba(15,18,24,0.08)" }}>
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex items-center gap-3">
              <AlphardLogo variant="full" size={18} fill="#0F1218" />
              <span className="text-[12px] ml-1" style={{ color: "rgba(15,18,24,0.45)" }}>© {new Date().getFullYear()} Alphard Analytics</span>
            </div>
            <div className="flex flex-wrap gap-x-7 gap-y-3 text-[13px]"
              style={{ color: "rgba(15,18,24,0.58)" }}>
              <a
                href="mailto:pragyan@alphard.global?subject=Alphard%20feedback"
                className="hover:text-[#0F1218] transition-colors"
              >
                Send feedback
              </a>
              <a href="/home" className="hover:text-[#0F1218] transition-colors">Launch demo</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
function FeatureLabel({
  icon: Icon, text, center = false,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
  text: string;
  center?: boolean;
}) {
  return (
    <div className={`inline-flex items-center gap-2 mb-5 ${center ? "" : ""}`}>
      <span
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10.5px] font-semibold tracking-[0.14em] uppercase"
        style={{
          background: "rgba(38,109,240,0.06)",
          border: "1px solid rgba(38,109,240,0.18)",
          color: ACCENT,
        }}
      >
        <Icon size={11} strokeWidth={2} style={{ color: ACCENT }} />
        {text}
      </span>
    </div>
  );
}

// Dark variant for the CRO-section label (used on a dark card)
function FeatureLabelDark({
  icon: Icon, text,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
  text: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 mb-5">
      <span
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10.5px] font-semibold tracking-[0.14em] uppercase"
        style={{
          background: "rgba(38,109,240,0.12)",
          border: "1px solid rgba(164,194,250,0.30)",
          color: "#A4C2FA",
        }}
      >
        <Icon size={11} strokeWidth={2} style={{ color: "#A4C2FA" }} />
        {text}
      </span>
    </div>
  );
}

// Multi-product white-space matrix visualization
function MultiProductMatrix() {
  const products = [
    { name: "Revenue Intel",  arr: 120, color: ACCENT,    buyer: "VP Sales" },
    { name: "AI Copilot",     arr: 95,  color: "#7C3AED", buyer: "Sales Mgr" },
    { name: "Insights",       arr: 72,  color: "#0FC27B", buyer: "RevOps" },
    { name: "Data Hub",       arr: 65,  color: "#F5B900", buyer: "Eng Lead" },
  ];
  const accounts = [
    { name: "Cloudflare", presence: [true,  true,  false, false] },
    { name: "Tableau",    presence: [true,  true,  true,  false] },
    { name: "Snowflake",  presence: [false, false, true,  false] },
    { name: "Akamai",     presence: [false, false, false, true]  },
    { name: "GitLab",     presence: [false, true,  false, false] },
  ];
  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-8 rounded-[40px] blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(38,109,240,0.10), transparent 70%)" }} />
      <div className="relative rounded-[14px] overflow-hidden bg-white"
        style={{
          border: "1px solid rgba(15,18,24,0.10)",
          boxShadow: "0 1px 2px rgba(15,18,24,0.04), 0 22px 70px -16px rgba(15,18,24,0.18)",
        }}>
        {/* Header row */}
        <div className="px-5 py-3.5 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(15,18,24,0.06)" }}>
          <div className="flex items-center gap-2">
            <LayoutGrid size={13} strokeWidth={2} style={{ color: ACCENT }} />
            <span className="text-[12.5px] font-semibold" style={{ color: "#0F1218" }}>White-space matrix</span>
          </div>
          <span className="text-[10.5px] font-mono" style={{ color: "rgba(15,18,24,0.45)" }}>
            5 accounts · 4 products
          </span>
        </div>

        {/* Matrix */}
        <div className="p-4">
          <div className="grid" style={{ gridTemplateColumns: `140px repeat(${products.length}, 1fr)`, gap: 8 }}>
            {/* Top row: product headers */}
            <div></div>
            {products.map((p) => (
              <div key={p.name} className="text-center">
                <div className="text-[10.5px] font-semibold mb-0.5" style={{ color: p.color }}>{p.name}</div>
                <div className="text-[9px] uppercase tracking-[0.10em]" style={{ color: "rgba(15,18,24,0.45)" }}>
                  {p.buyer}
                </div>
              </div>
            ))}

            {/* Account rows */}
            {accounts.map((acc) => (
              <React.Fragment key={acc.name}>
                <div className="flex items-center text-[12px] font-medium" style={{ color: "#0F1218" }}>
                  {acc.name}
                </div>
                {acc.presence.map((has, i) => {
                  const p = products[i];
                  return (
                    <div key={i} className="flex items-center justify-center">
                      <div className="w-9 h-9 rounded-lg grid place-items-center transition-all"
                        style={{
                          background: has ? p.color : "rgba(15,18,24,0.04)",
                          border: has ? "none" : "1px dashed rgba(15,18,24,0.15)",
                          boxShadow: has ? `0 4px 12px -4px ${p.color}80` : "none",
                        }}>
                        {has ? (
                          <Check size={13} strokeWidth={2.4} className="text-white" />
                        ) : (
                          <Plus size={11} strokeWidth={2.2} style={{ color: "rgba(15,18,24,0.30)" }} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 flex items-center justify-between text-[10px]"
            style={{ borderTop: "1px solid rgba(15,18,24,0.06)" }}>
            <div className="flex items-center gap-3" style={{ color: "rgba(15,18,24,0.55)" }}>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded" style={{ background: ACCENT }} />
                Adopted
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded border border-dashed" style={{ borderColor: "rgba(15,18,24,0.30)" }} />
                White space
              </span>
            </div>
            <span style={{ color: ACCENT, fontWeight: 600 }}>
              13 expansion plays open
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Integrations strip — shows the data sources Alphard plugs into
// ──────────────────────────────────────────────────────────────────────
const INTEGRATIONS: { name: string; group: string; logo: React.ReactNode }[] = [
  { name: "Salesforce",  group: "CRM",          logo: <SalesforceLogo /> },
  { name: "HubSpot",     group: "CRM",          logo: <HubSpotLogo /> },
  { name: "Gong",        group: "Calls",        logo: <GongLogo /> },
  { name: "Outreach",    group: "Sequences",    logo: <OutreachLogo /> },
  { name: "Salesloft",   group: "Sequences",    logo: <SalesloftLogo /> },
  { name: "Slack",       group: "Comms",        logo: <SlackLogo /> },
  { name: "LinkedIn",    group: "Champions",    logo: <LinkedInLogo /> },
  { name: "Zendesk",     group: "Support",      logo: <ZendeskLogo /> },
  { name: "Mixpanel",    group: "Product",      logo: <MixpanelLogo /> },
  { name: "Snowflake",   group: "Warehouse",    logo: <SnowflakeLogo /> },
  { name: "Google",      group: "Calendar",     logo: <GoogleLogo /> },
  { name: "Microsoft",   group: "Calendar",     logo: <MicrosoftLogo /> },
];

function IntegrationsStrip() {
  return (
    <section className="py-14 md:py-20">
      <div className="text-center mb-10">
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.18em] mb-3" style={{ color: "rgba(15,18,24,0.45)" }}>
          Plugs into the stack you already use
        </p>
        <h3 className="text-[22px] md:text-[26px] font-semibold" style={{ letterSpacing: "-0.02em", color: "#0F1218" }}>
          One platform, every source of signal.
        </h3>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-px rounded-2xl overflow-hidden"
        style={{ background: "rgba(15,18,24,0.06)", border: "1px solid rgba(15,18,24,0.06)" }}>
        {INTEGRATIONS.map((i) => (
          <div key={i.name}
            className="bg-white px-4 py-5 md:px-6 md:py-6 flex flex-col items-center justify-center gap-2 transition-colors hover:bg-[#FAFAFB]">
            <div className="h-7 w-7 md:h-8 md:w-8 grid place-items-center">{i.logo}</div>
            <div className="text-[12px] font-medium" style={{ color: "#0F1218" }}>{i.name}</div>
            <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: "rgba(15,18,24,0.40)" }}>{i.group}</div>
          </div>
        ))}
      </div>
      <p className="text-center text-[12px] mt-6" style={{ color: "rgba(15,18,24,0.50)" }}>
        Plus your data warehouse · webhooks · Zapier · custom API
      </p>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Inline brand marks — simplified geometric versions
// ──────────────────────────────────────────────────────────────────────
function SalesforceLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full" aria-hidden>
      <path d="M13.5 6c-1.5 0-2.8.6-3.7 1.6-1-1-2.4-1.6-3.9-1.6-3 0-5.5 2.4-5.5 5.4 0 .7.1 1.4.4 2-.4.7-.6 1.5-.6 2.4 0 2.8 2.3 5.1 5.1 5.1.5 0 1-.1 1.5-.2.9 1.6 2.7 2.7 4.7 2.7 1.7 0 3.2-.7 4.2-1.9.7.4 1.4.6 2.3.6 2.7 0 4.9-2.2 4.9-4.9 0-.5-.1-1-.2-1.5 1.1-.8 1.8-2.1 1.8-3.5 0-2.5-2-4.5-4.5-4.5-.5 0-1 .1-1.5.2C16.9 7 15.3 6 13.5 6z" fill="#00A1E0"/>
    </svg>
  );
}
function HubSpotLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full" aria-hidden>
      <circle cx="22" cy="22" r="5" fill="none" stroke="#FF7A59" strokeWidth="2.4"/>
      <path d="M22 13V8a3 3 0 1 0-3 3" fill="none" stroke="#FF7A59" strokeWidth="2.4"/>
      <circle cx="19" cy="8" r="2.2" fill="#FF7A59"/>
    </svg>
  );
}
function GongLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full" aria-hidden>
      <circle cx="16" cy="16" r="11" fill="#7C3AED"/>
      <circle cx="16" cy="16" r="5" fill="white"/>
    </svg>
  );
}
function OutreachLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full" aria-hidden>
      <path d="M6 22 L16 6 L26 22 Z" fill="#5951FF"/>
      <circle cx="16" cy="20" r="3" fill="white"/>
    </svg>
  );
}
function SalesloftLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full" aria-hidden>
      <rect x="4" y="14" width="6" height="14" rx="1" fill="#5C5CFF"/>
      <rect x="13" y="8" width="6" height="20" rx="1" fill="#5C5CFF"/>
      <rect x="22" y="4" width="6" height="24" rx="1" fill="#5C5CFF"/>
    </svg>
  );
}
function SlackLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full" aria-hidden>
      <rect x="4" y="13" width="11" height="3" rx="1.5" fill="#36C5F0"/>
      <rect x="13" y="4" width="3" height="11" rx="1.5" fill="#2EB67D"/>
      <rect x="17" y="16" width="11" height="3" rx="1.5" fill="#ECB22E"/>
      <rect x="16" y="17" width="3" height="11" rx="1.5" fill="#E01E5A"/>
    </svg>
  );
}
function LinkedInLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full" aria-hidden>
      <rect width="32" height="32" rx="5" fill="#0A66C2"/>
      <path d="M9 13v10h-3V13h3zm-1.5-4.5a1.7 1.7 0 1 1 0 3.4 1.7 1.7 0 0 1 0-3.4zM11 13h3v1.5c.5-.9 1.7-1.7 3.5-1.7 3.7 0 4.5 2.4 4.5 5.5V23h-3v-4.3c0-1.5-.4-2.7-2-2.7s-2 1.3-2 2.7V23h-3V13z" fill="white"/>
    </svg>
  );
}
function ZendeskLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full" aria-hidden>
      <path d="M3 11 L15 11 L3 25 Z" fill="#03363D"/>
      <path d="M16 11 a6 6 0 0 1 12 0 Z" fill="#03363D"/>
      <path d="M3 7 a6 6 0 0 0 12 0 Z" fill="#03363D"/>
      <path d="M16 25 L29 25 L29 11 Z" fill="#03363D"/>
    </svg>
  );
}
function MixpanelLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full" aria-hidden>
      <circle cx="6" cy="16" r="3" fill="#7856FF"/>
      <circle cx="16" cy="16" r="5" fill="#7856FF"/>
      <circle cx="26" cy="16" r="2" fill="#7856FF"/>
    </svg>
  );
}
function SnowflakeLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full" aria-hidden stroke="#29B5E8" strokeWidth="2" fill="none" strokeLinecap="round">
      <line x1="16" y1="3" x2="16" y2="29"/>
      <line x1="3" y1="16" x2="29" y2="16"/>
      <line x1="6" y1="6" x2="26" y2="26"/>
      <line x1="26" y1="6" x2="6" y2="26"/>
    </svg>
  );
}
function GoogleLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full" aria-hidden>
      <path d="M28 16.3c0-.9-.1-1.7-.2-2.5H16v4.7h6.7c-.3 1.5-1.2 2.8-2.5 3.7v3.1h4c2.4-2.2 3.8-5.4 3.8-9z" fill="#4285F4"/>
      <path d="M16 28c3.4 0 6.2-1.1 8.2-3l-4-3.1c-1.1.7-2.5 1.2-4.2 1.2-3.2 0-6-2.2-7-5.1H4.9v3.2C6.9 24.9 11.1 28 16 28z" fill="#34A853"/>
      <path d="M9 17.9c-.2-.7-.4-1.5-.4-2.4s.1-1.6.4-2.4V9.9H4.9C4.1 11.5 3.6 13.4 3.6 15.5s.5 4 1.3 5.6L9 17.9z" fill="#FBBC05"/>
      <path d="M16 8.7c1.8 0 3.4.6 4.7 1.8l3.5-3.5C22.2 4.9 19.4 3.5 16 3.5 11.1 3.5 6.9 6.6 4.9 11.1l4 3.2c1-2.9 3.8-5.6 7.1-5.6z" fill="#EA4335"/>
    </svg>
  );
}
function MicrosoftLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full" aria-hidden>
      <rect x="3"  y="3"  width="12" height="12" fill="#F25022"/>
      <rect x="17" y="3"  width="12" height="12" fill="#7FBA00"/>
      <rect x="3"  y="17" width="12" height="12" fill="#00A4EF"/>
      <rect x="17" y="17" width="12" height="12" fill="#FFB900"/>
    </svg>
  );
}
