"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import {
  ArrowRight, ShieldCheck, Sparkles, TrendingUp, Users, Workflow,
  LineChart, Zap, Eye, Activity, ChevronRight, Check, Star,
} from "lucide-react";
import { MarketingNav } from "@/components/MarketingNav";
import { AlphardLogo } from "@/components/AlphardLogo";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// ──────────────────────────────────────────────────────────────────────
// Reveal — fade + slide on scroll into view
// ──────────────────────────────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  className = "",
  y = 16,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity 800ms ease-out ${delay}ms, transform 800ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Frame — wraps a product screenshot with browser chrome + gradient glow
// ──────────────────────────────────────────────────────────────────────
function ProductFrame({
  src,
  alt,
  glow = true,
  className = "",
}: {
  src: string;
  alt: string;
  glow?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {glow && (
        <>
          <div
            aria-hidden
            className="absolute -inset-12 rounded-[40px] blur-3xl opacity-50 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(38,109,240,0.45) 0%, rgba(38,109,240,0.15) 35%, transparent 70%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 rounded-[18px] pointer-events-none"
            style={{
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.08), 0 30px 80px -20px rgba(0,0,0,0.7), 0 0 60px -10px rgba(38,109,240,0.25)",
            }}
          />
        </>
      )}
      <div
        className="relative rounded-[14px] overflow-hidden"
        style={{
          border: "1px solid rgba(255,255,255,0.10)",
          background: "#0a0b0d",
        }}
      >
        {/* Browser chrome */}
        <div
          className="flex items-center gap-1.5 px-3.5 py-2.5"
          style={{
            background: "rgba(20,22,26,0.95)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#FF5F57" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#FEBC2E" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#28C840" }} />
          <div className="ml-3 text-[10px] text-white/40 font-mono">sandbox.alphard.ai</div>
        </div>
        <img src={src} alt={alt} className="w-full block" />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
const ACCENT = "#266DF0";
const ACCENT_DEEP = "#1A5AD4";

// ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`${inter.className} relative min-h-screen text-white overflow-x-hidden`}
      style={{
        background: "#06070A",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      {/* Ambient gradient backdrop */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 0%, rgba(38,109,240,0.18) 0%, transparent 45%), radial-gradient(circle at 80% 30%, rgba(124,58,237,0.10) 0%, transparent 50%), radial-gradient(circle at 50% 100%, rgba(38,109,240,0.08) 0%, transparent 60%)",
        }}
      />

      {/* Subtle grid pattern */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative z-10 px-6 md:px-10 lg:px-12 max-w-[1320px] mx-auto">
        <MarketingNav />

        {/* ────────────────── HERO ────────────────── */}
        <section className="pt-20 md:pt-28 pb-16 md:pb-24 text-center">
          {/* Badge */}
          <div
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 700ms, transform 700ms",
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-medium mb-7"
          >
            <span
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full"
              style={{
                background: "rgba(38,109,240,0.10)",
                border: "1px solid rgba(38,109,240,0.25)",
                color: "#A4C2FA",
              }}
            >
              <Sparkles size={12} strokeWidth={2} />
              Built for revenue teams who refuse to guess
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 800ms 100ms, transform 800ms 100ms",
              letterSpacing: "-0.045em",
              lineHeight: 1.02,
            }}
            className="text-[44px] md:text-[68px] lg:text-[84px] font-semibold mb-6"
          >
            The revenue OS{" "}
            <span
              style={{
                backgroundImage: `linear-gradient(135deg, #fff 0%, ${ACCENT} 65%, #A4C2FA 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              that thinks ahead.
            </span>
          </h1>

          {/* Subhead */}
          <p
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 800ms 250ms, transform 800ms 250ms",
            }}
            className="text-[17px] md:text-[19px] text-white/65 max-w-[680px] mx-auto mb-9 leading-relaxed"
          >
            Alphard unifies every signal across Salesforce, Gong, email and product usage —
            then turns them into the next move for every account, automatically. The platform
            top revenue orgs trust to retain, expand, and forecast with precision.
          </p>

          {/* CTAs */}
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
              className="group inline-flex items-center gap-2 bg-white text-black px-7 py-3.5 rounded-xl text-[14.5px] font-semibold hover:bg-white/90 transition-all"
              style={{ boxShadow: "0 10px 30px -10px rgba(255,255,255,0.4)" }}
            >
              Launch the demo
              <ArrowRight size={15} strokeWidth={2.4} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => router.push("/product")}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[14.5px] font-semibold transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff",
              }}
            >
              See the platform
            </button>
          </div>

          <div
            style={{
              opacity: heroVisible ? 1 : 0,
              transition: "opacity 800ms 600ms",
            }}
            className="text-[12px] text-white/40 mb-16"
          >
            No credit card · Live demo · Sandbox data
          </div>

          {/* Hero product shot */}
          <Reveal delay={300} y={32}>
            <div className="mt-2 max-w-[1180px] mx-auto px-2 md:px-0">
              <ProductFrame
                src="/screenshots/home-am.png"
                alt="Alphard expansion opportunities dashboard"
              />
            </div>
          </Reveal>
        </section>

        {/* ────────────────── LOGO STRIP ────────────────── */}
        <section className="py-12 md:py-16">
          <Reveal>
            <p className="text-center text-[11.5px] uppercase tracking-[0.18em] text-white/40 mb-8 font-medium">
              The teams shipping with Alphard
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-70">
              {["Cloudflare", "Snowflake", "Tableau", "GitLab", "Akamai", "Datadog"].map((name) => (
                <span
                  key={name}
                  className="text-[18px] md:text-[22px] font-semibold tracking-tight text-white/55"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {name}
                </span>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ────────────────── METRICS ────────────────── */}
        <section className="py-16 md:py-20">
          <Reveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.06)" }}>
              {[
                { v: "112%", l: "Avg net revenue retention", c: "#0FC27B" },
                { v: "3.4x",   l: "Lift in expansion close rate", c: ACCENT },
                { v: "27 hrs", l: "Returned to each rep weekly", c: "#A4C2FA" },
                { v: "92%",   l: "Forecast accuracy at week 8", c: "#0FC27B" },
              ].map((m, i) => (
                <div
                  key={i}
                  className="px-6 py-8 md:py-10 text-center"
                  style={{ background: "#0a0c10" }}
                >
                  <div
                    className="text-[36px] md:text-[44px] font-semibold mb-1.5 tnum"
                    style={{ color: m.c, letterSpacing: "-0.03em" }}
                  >
                    {m.v}
                  </div>
                  <div className="text-[12.5px] text-white/55">{m.l}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ────────────────── FEATURE 1 — Expansion ────────────────── */}
        <section className="py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal>
              <FeatureLabel icon={TrendingUp} text="EXPANSION INTELLIGENCE" />
              <h2 className="text-[34px] md:text-[44px] font-semibold mb-5 leading-[1.05]" style={{ letterSpacing: "-0.03em" }}>
                Find the next million in revenue you didn't know was there.
              </h2>
              <p className="text-[16px] text-white/60 leading-relaxed mb-7">
                Alphard scores every account on five expansion vectors — usage, champion strength, budget signals, timing, and comparable wins. Then it tells you the exact next move and who to bring in.
              </p>
              <ul className="space-y-3.5 mb-8">
                {[
                  "5-factor scoring model trained on real CRM outcomes",
                  "Comparable-deal benchmarks: ARR ranges, days to close",
                  "Champion change detection from email + calendar signal",
                  "Stage-aware next-step recommendations, ranked by impact",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[14.5px] text-white/75">
                    <Check size={16} strokeWidth={2.4} style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => router.push("/home")}
                className="inline-flex items-center gap-2 text-[14px] font-semibold text-white/85 hover:text-white"
              >
                See the expansion engine <ChevronRight size={14} strokeWidth={2.4} />
              </button>
            </Reveal>
            <Reveal delay={120}>
              <ProductFrame src="/screenshots/home-am.png" alt="Expansion opportunities" />
            </Reveal>
          </div>
        </section>

        {/* ────────────────── FEATURE 2 — Account 360 ────────────────── */}
        <section className="py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal delay={120} className="lg:order-2">
              <FeatureLabel icon={Eye} text="ACCOUNT INTELLIGENCE" />
              <h2 className="text-[34px] md:text-[44px] font-semibold mb-5 leading-[1.05]" style={{ letterSpacing: "-0.03em" }}>
                Know every account. Before you're asked.
              </h2>
              <p className="text-[16px] text-white/60 leading-relaxed mb-7">
                Health, NRR, renewal date, sentiment, last touch, success plan, open requests — every fact about every customer, in one continuously-updating view. No more pre-meeting scramble.
              </p>
              <ul className="space-y-3.5 mb-8">
                {[
                  "AI-generated account brief refreshed against live data",
                  "Health score model with explainable factor breakdown",
                  "Kanban success plans, internal @mentions, comment threads",
                  "Linked deals, calls, journey timeline, and white-space matrix",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[14.5px] text-white/75">
                    <Check size={16} strokeWidth={2.4} style={{ color: ACCENT }} className="mt-0.5 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal className="lg:order-1">
              <ProductFrame src="/screenshots/account-detail.png" alt="Account detail view" />
            </Reveal>
          </div>
        </section>

        {/* ────────────────── FEATURE GRID — 3 up ────────────────── */}
        <section className="py-20 md:py-28">
          <Reveal>
            <div className="text-center max-w-[720px] mx-auto mb-14">
              <FeatureLabel icon={Workflow} text="THE FULL OPERATING SYSTEM" center />
              <h2 className="text-[34px] md:text-[48px] font-semibold mb-5 leading-[1.05]" style={{ letterSpacing: "-0.03em" }}>
                One platform. Every motion.
              </h2>
              <p className="text-[16px] text-white/60 leading-relaxed">
                Forecasting, customer journeys, capacity planning, revenue waterfalls, NPS, surveys — everything a modern revenue org needs, designed to feel like one thing.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                title: "Forecast you can stand behind",
                copy: "Roll-up by manager, by segment, by deal — with confidence intervals and pipeline coverage.",
                src: "/screenshots/forecast.png",
              },
              {
                title: "Journey orchestration",
                copy: "Build adoption, onboarding, and expansion campaigns with conditional steps and live metrics.",
                src: "/screenshots/campaigns.png",
              },
              {
                title: "Capacity & coverage",
                copy: "See workload across the team. Spot the overloaded CSM before churn shows up.",
                src: "/screenshots/capacity.png",
              },
              {
                title: "Revenue waterfall",
                copy: "Funnel, waterfall, and account movement views. Where ARR is born and where it leaks.",
                src: "/screenshots/revenue.png",
              },
              {
                title: "Book of business",
                copy: "Every customer, every prospect, every signal — sortable, filterable, defensible.",
                src: "/screenshots/accounts.png",
              },
              {
                title: "Ask Alphy, the analyst",
                copy: "Plain-English answers grounded in your data. Every claim is cited.",
                src: "/screenshots/analyst.png",
              },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 60}>
                <div
                  className="rounded-2xl overflow-hidden h-full transition-all hover:translate-y-[-2px]"
                  style={{
                    background: "rgba(20,22,26,0.6)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <div className="overflow-hidden border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <img src={f.src} alt={f.title} className="w-full block" />
                  </div>
                  <div className="px-5 py-5">
                    <div className="text-[15.5px] font-semibold mb-1.5">{f.title}</div>
                    <div className="text-[13px] text-white/55 leading-relaxed">{f.copy}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ────────────────── WHY ALPHARD — Differentiators ────────────────── */}
        <section className="py-20 md:py-28">
          <Reveal>
            <div className="text-center max-w-[700px] mx-auto mb-14">
              <FeatureLabel icon={Star} text="WHY ALPHARD" center />
              <h2 className="text-[34px] md:text-[48px] font-semibold mb-5 leading-[1.05]" style={{ letterSpacing: "-0.03em" }}>
                The unfair advantage your team has been missing.
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                Icon: Zap,
                title: "AI that explains itself",
                copy: "Every score, every recommendation, every forecast comes with the underlying signals — so your reps can defend the call.",
              },
              {
                Icon: Activity,
                title: "Built on real outcomes",
                copy: "Models trained on real renewals, real expansions, real churn — not generic frameworks.",
              },
              {
                Icon: ShieldCheck,
                title: "Enterprise-grade by default",
                copy: "SOC 2, SSO, granular role-based access, and full data residency control. Yes, even in the demo.",
              },
              {
                Icon: Users,
                title: "Made for the whole revenue org",
                copy: "AE, AM, CSM, manager, analyst — one workspace, four lenses. No more stitching tools.",
              },
              {
                Icon: LineChart,
                title: "Lives where revenue lives",
                copy: "Bi-directional sync with Salesforce, HubSpot, Gong, Outreach, Slack, and your data warehouse.",
              },
              {
                Icon: Sparkles,
                title: "Setup in days, not quarters",
                copy: "Pre-built integrations, persona-aware onboarding, and templates for every revenue motion.",
              },
            ].map((d, i) => (
              <Reveal key={d.title} delay={i * 50}>
                <div
                  className="rounded-2xl p-6 h-full"
                  style={{
                    background: "rgba(20,22,26,0.5)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl grid place-items-center mb-4"
                    style={{
                      background: "rgba(38,109,240,0.12)",
                      border: "1px solid rgba(38,109,240,0.20)",
                    }}
                  >
                    <d.Icon size={17} strokeWidth={1.8} style={{ color: "#A4C2FA" }} />
                  </div>
                  <div className="text-[16px] font-semibold mb-2">{d.title}</div>
                  <div className="text-[13.5px] text-white/55 leading-relaxed">{d.copy}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ────────────────── TESTIMONIAL ────────────────── */}
        <section className="py-20 md:py-28">
          <Reveal>
            <div
              className="relative rounded-3xl px-8 py-14 md:px-16 md:py-20 max-w-[960px] mx-auto text-center overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(38,109,240,0.10) 0%, rgba(20,22,26,0.6) 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                aria-hidden
                className="absolute -top-32 -right-24 w-96 h-96 rounded-full blur-3xl opacity-40"
                style={{ background: "radial-gradient(circle, rgba(38,109,240,0.6), transparent 70%)" }}
              />
              <div className="relative">
                <div className="flex items-center justify-center gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} fill="#FEBC2E" stroke="#FEBC2E" />
                  ))}
                </div>
                <p
                  className="text-[20px] md:text-[26px] font-medium leading-[1.35] mb-8"
                  style={{ letterSpacing: "-0.015em" }}
                >
                  "We replaced three tools with Alphard. Our CSMs walk into every QBR with the
                  exact picture they need. Net retention crossed 120% the same quarter we rolled it out."
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full grid place-items-center text-[12px] font-bold text-white"
                    style={{ background: ACCENT }}
                  >
                    MR
                  </div>
                  <div className="text-left">
                    <div className="text-[14px] font-semibold">Maria Rojas</div>
                    <div className="text-[12.5px] text-white/55">VP Customer Success, Tableau</div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ────────────────── FINAL CTA ────────────────── */}
        <section className="py-24 md:py-32 text-center">
          <Reveal>
            <h2 className="text-[40px] md:text-[64px] font-semibold mb-5 leading-[1.02]" style={{ letterSpacing: "-0.04em" }}>
              Stop reacting.{" "}
              <span
                style={{
                  backgroundImage: `linear-gradient(135deg, #fff 0%, ${ACCENT} 70%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Start running revenue.
              </span>
            </h2>
            <p className="text-[16.5px] text-white/60 max-w-[560px] mx-auto mb-9">
              The platform top revenue teams switched to. Spin up the live sandbox in under 30 seconds.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => router.push("/home")}
                className="group inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-xl text-[15px] font-semibold hover:bg-white/90 transition-all"
                style={{ boxShadow: "0 14px 36px -10px rgba(255,255,255,0.45)" }}
              >
                Launch the demo
                <ArrowRight size={16} strokeWidth={2.4} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => router.push("/pricing")}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-[15px] font-semibold transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#fff",
                }}
              >
                Talk to sales
              </button>
            </div>
          </Reveal>
        </section>

        {/* ────────────────── FOOTER ────────────────── */}
        <footer
          className="pt-12 pb-12 mt-12"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <AlphardLogo variant="icon" size={20} fill="#fff" />
              <span className="text-[15px] font-semibold tracking-tight">Alphard</span>
              <span className="text-[12px] text-white/40 ml-2">© {new Date().getFullYear()} Alphard Analytics</span>
            </div>
            <div className="flex flex-wrap gap-x-7 gap-y-3 text-[13px] text-white/55">
              <a href="/product" className="hover:text-white transition-colors">Platform</a>
              <a href="/pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="/customers" className="hover:text-white transition-colors">Customers</a>
              <a href="/docs" className="hover:text-white transition-colors">Docs</a>
              <a href="/signin" className="hover:text-white transition-colors">Sign in</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
function FeatureLabel({
  icon: Icon,
  text,
  center = false,
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
          background: "rgba(38,109,240,0.10)",
          border: "1px solid rgba(38,109,240,0.20)",
          color: "#A4C2FA",
        }}
      >
        <Icon size={11} strokeWidth={2} style={{ color: "#A4C2FA" }} />
        {text}
      </span>
    </div>
  );
}
