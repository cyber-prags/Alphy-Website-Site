"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import {
  ArrowRight, ShieldCheck, Sparkles, TrendingUp, Users, LayoutGrid,
  LineChart, Zap, Eye, Crown, ChevronRight, Check, Star, Flame, Activity,
} from "lucide-react";
import { MarketingNav } from "@/components/MarketingNav";
import { AlphardLogo } from "@/components/AlphardLogo";

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
              Expansion intelligence — not another CSM tool
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
            className="text-[44px] md:text-[64px] lg:text-[78px] font-semibold mb-6"
          >
            Pipeline for accounts{" "}
            <span
              style={{
                backgroundImage: `linear-gradient(135deg, ${ACCENT} 0%, #7C3AED 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              you already own.
            </span>
          </h1>

          <p
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 800ms 250ms, transform 800ms 250ms",
              color: "rgba(15,18,24,0.65)",
            }}
            className="text-[17px] md:text-[19px] max-w-[680px] mx-auto mb-9 leading-relaxed"
          >
            Alphard turns every signal in your book — usage, champion moves, ticket velocity, renewal proximity — into one ranked daily list of expansion plays. Built for Account Managers who refuse to lose deals to silence.
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
              onClick={() => router.push("/home")}
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

        {/* ───────────────────── PROBLEM FRAME ───────────────────── */}
        <section className="py-20 md:py-28">
          <Reveal>
            <div className="max-w-[820px] mx-auto text-center mb-14">
              <FeatureLabel icon={Eye} text="THE EXPANSION GAP" center />
              <h2 className="text-[34px] md:text-[48px] font-semibold mb-5 leading-[1.05]" style={{ letterSpacing: "-0.03em" }}>
                CSM tools answer "will they churn?" Forecasts answer "will the deal close?"
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
                { v: "3.4x",  l: "Lift in expansion close rate", c: ACCENT },
                { v: "112%",  l: "Avg net revenue retention",    c: "#0FC27B" },
                { v: "27 hrs",l: "Returned to each AM weekly",   c: "#0F1218" },
                { v: "4 days",l: "Cut from typical deal cycle",  c: "#0FC27B" },
              ].map((m, i) => (
                <div key={i} className="px-6 py-9 md:py-10 text-center bg-white">
                  <div className="text-[36px] md:text-[44px] font-semibold mb-1.5 tnum"
                    style={{ color: m.c, letterSpacing: "-0.03em" }}>{m.v}</div>
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
              { title: "Book of business",      copy: "Every customer with expansion score, hot signals, and pipeline coverage — at a glance.", src: "/screenshots/accounts.png" },
              { title: "Account intelligence",  copy: "Health, NRR, champion, success plan, and expansion bets in one continuously-updating view.", src: "/screenshots/account-detail.png" },
              { title: "Forecast roll-up",      copy: "Pipeline coverage, commit, most-likely, best case — by manager and by segment.", src: "/screenshots/forecast.png" },
              { title: "Journey orchestration", copy: "Adoption, onboarding, and expansion campaigns with conditional steps and live metrics.", src: "/screenshots/campaigns.png" },
              { title: "Capacity planning",     copy: "Workload heatmap across the team. Spot the overloaded AM before churn shows up.", src: "/screenshots/capacity.png" },
              { title: "Revenue waterfall",     copy: "Funnel and ARR movement. Where revenue is born and where it leaks.", src: "/screenshots/revenue.png" },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 60}>
                <div className="rounded-2xl overflow-hidden h-full bg-white transition-all hover:translate-y-[-2px]"
                  style={{
                    border: "1px solid rgba(15,18,24,0.08)",
                    boxShadow: "0 1px 2px rgba(15,18,24,0.04)",
                  }}>
                  <div className="overflow-hidden border-b" style={{ borderColor: "rgba(15,18,24,0.06)" }}>
                    <img src={f.src} alt={f.title} className="w-full block" />
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
              { Icon: Zap,         title: "Built for AMs, not CSMs",          copy: "Every score, every play, every ranking is expansion-coded. No more inheriting tools designed for retention." },
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
                onClick={() => router.push("/home")}
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
            <div className="flex items-center gap-2.5">
              <AlphardLogo variant="icon" size={20} fill="#0F1218" />
              <span className="text-[15px] font-semibold tracking-tight">Alphard</span>
              <span className="text-[12px] ml-2" style={{ color: "rgba(15,18,24,0.45)" }}>© {new Date().getFullYear()} Alphard Analytics</span>
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
