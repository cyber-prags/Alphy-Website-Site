"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Root route → Enhanced sign-in.
// The marketing landing page has been removed; `/` now lands on the sign-in
// experience. This is a *demo* sign-in — no real auth — it captures the
// user's name + company + persona, identifies the session in PostHog, then
// hands off to /onboarding which spins up the persona-aware sandbox.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, Sparkles, Flame, Briefcase, LifeBuoy, BarChart3,
  Crown, ShieldCheck, Activity, TrendingUp, Target, Network,
} from "lucide-react";
import { Inter } from "next/font/google";
import { AlphardLogo } from "@/components/AlphardLogo";
import { useUser } from "@/components/UserContext";
import { usePersona } from "@/components/PersonaContext";
import type { Persona } from "@/lib/mock";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], display: "swap" });

const ACCENT = "#266DF0";

type RoleOption = {
  id: Persona;
  label: string;
  blurb: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
  outcome: string;
};

const ROLES: RoleOption[] = [
  { id: "am",      label: "Account Manager",     blurb: "Run expansion across a book of customers.", Icon: Briefcase, outcome: "Cut deal-prep time from 30 min → 3 min · expansion ARR up 40%" },
  { id: "csm",     label: "Customer Success",    blurb: "Drive adoption, retention, and saves.",      Icon: LifeBuoy,  outcome: "Catch at-risk renewals 30+ days earlier · NRR variance ±2%" },
  { id: "ae",      label: "Account Executive",   blurb: "Close net-new pipeline.",                   Icon: Flame,     outcome: "Pipeline coverage up 1.4× · win rate +5pp on signal-hot deals" },
  { id: "manager", label: "Sales / CS Leader",   blurb: "Manage a team — capacity, forecast, roll-ups.", Icon: BarChart3, outcome: "Forecast variance ±5% · rebalance the book in 5 minutes" },
];

export default function SignInPage() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const { persona, setPersona } = usePersona();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState<Persona>("am");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(user.name === "Walid Qayoumi" ? "" : user.name);
    setCompany(user.company === "Alphard" ? "" : user.company);
    setEmail(user.email || "");
    setRole(persona);
  }, [user.name, user.company, user.email, persona]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please share your name so the demo feels right.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please share a work email — we'll only use it to reach out about your trial.");
      return;
    }
    setError("");
    setLoading(true);
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedCompany = company.trim() || undefined;

    setUser(trimmedName, trimmedCompany, trimmedEmail);
    setPersona(role);

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    void fetch(`${basePath}/api/collect-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: trimmedEmail, name: trimmedName, company: trimmedCompany, role, source: "signin_demo",
      }),
    }).catch(() => {});

    if (typeof window !== "undefined" && (window as { posthog?: { identify: (id: string, props: Record<string, unknown>) => void; capture: (event: string, props: Record<string, unknown>) => void } }).posthog) {
      try {
        const ph = (window as unknown as { posthog: { identify: (id: string, props: Record<string, unknown>) => void; capture: (event: string, props: Record<string, unknown>) => void } }).posthog;
        ph.identify(trimmedEmail, { email: trimmedEmail, name: trimmedName, company: trimmedCompany, role });
        ph.capture("demo_started", { name: trimmedName, company: trimmedCompany, role });
      } catch {}
    }
    setTimeout(() => router.push("/onboarding"), 600);
  };

  const activeRole = ROLES.find((r) => r.id === role) ?? ROLES[0];

  return (
    <div className={`${inter.className} min-h-screen relative overflow-hidden`}
      style={{ background: "#FAFAFB", color: "#0F1218" }}>

      {/* Ambient background */}
      <div aria-hidden className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(38,109,240,0.10) 0%, transparent 60%), " +
            "radial-gradient(ellipse 60% 50% at 100% 100%, rgba(124,58,237,0.07) 0%, transparent 65%), " +
            "radial-gradient(ellipse 50% 40% at 0% 50%, rgba(15,194,123,0.04) 0%, transparent 60%)",
        }} />
      <div aria-hidden className="absolute inset-0 pointer-events-none opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,18,24,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,18,24,0.04) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "linear-gradient(to bottom, black 0%, transparent 90%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 90%)",
        }} />

      {/* Top bar */}
      <header className="relative z-10 px-6 md:px-10 py-5 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(15,18,24,0.06)" }}>
        <div className="flex items-center gap-3">
          <AlphardLogo variant="full" size={20} fill="#0F1218" />
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline-flex items-center gap-1.5 text-[10.5px] font-medium tracking-[0.12em] uppercase"
            style={{ color: "rgba(15,18,24,0.55)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#0FC27B", boxShadow: "0 0 6px rgba(15,194,123,0.6)" }} />
            Live demo
          </span>
          <button onClick={() => router.push("/home")}
            className="text-[12px] font-medium hover:underline"
            style={{ color: "rgba(15,18,24,0.55)" }}>
            Skip to workspace →
          </button>
        </div>
      </header>

      {/* Main split */}
      <main className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-10 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">

        {/* LEFT — form */}
        <div className="lg:col-span-5">
          <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold tracking-[0.14em] uppercase px-3 py-1 rounded-full mb-5"
            style={{ background: "rgba(38,109,240,0.10)", color: "#266DF0" }}>
            <Sparkles size={11} strokeWidth={2.4} />
            Personalised sandbox
          </span>
          <h1 className="text-[36px] md:text-[44px] font-semibold mb-2 leading-[1.04]"
            style={{ letterSpacing: "-0.024em" }}>
            Make Alphard yours <br className="hidden md:block" />
            in 60 seconds.
          </h1>
          <p className="text-[15px] mb-7 leading-relaxed max-w-[440px]"
            style={{ color: "rgba(15,18,24,0.62)" }}>
            We&rsquo;ll spin up a sandbox book of business with your name on it — real accounts, real signals, real plays. No password. No credit card.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Your name" placeholder="e.g. Maya Chen" value={name} onChange={setName} type="text" autoComplete="name" autoFocus />
              <Field label="Work email" placeholder="you@company.com" value={email} onChange={setEmail} type="email" autoComplete="email" />
            </div>
            <Field label="Your company" hint="optional" placeholder="e.g. Cloudflare" value={company} onChange={setCompany} type="text" autoComplete="organization" />

            <div>
              <label className="block text-[12px] font-medium mb-2">
                What&rsquo;s your role?
                <span className="font-normal ml-1.5" style={{ color: "rgba(15,18,24,0.45)" }}>
                  · we tailor the workspace to you
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ROLES.map((r) => {
                  const active = role === r.id;
                  return (
                    <button key={r.id} type="button" onClick={() => setRole(r.id)}
                      className="text-left rounded-xl p-3 transition-all"
                      style={{
                        background: active ? `${ACCENT}0D` : "white",
                        border: `1px solid ${active ? ACCENT : "rgba(15,18,24,0.10)"}`,
                        boxShadow: active ? `0 0 0 3px ${ACCENT}1A` : "0 1px 2px rgba(15,18,24,0.04)",
                      }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg grid place-items-center flex-shrink-0"
                          style={{ background: active ? ACCENT : "rgba(15,18,24,0.05)" }}>
                          <r.Icon size={14} strokeWidth={2}
                            style={{ color: active ? "white" : "rgba(15,18,24,0.65)" }} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[12.5px] font-semibold leading-tight"
                            style={{ color: active ? ACCENT : "#0F1218" }}>{r.label}</div>
                          <div className="text-[11px] mt-0.5 leading-snug"
                            style={{ color: "rgba(15,18,24,0.55)" }}>{r.blurb}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && <p className="text-[12px]" style={{ color: "#FF5B59" }}>{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full h-12 rounded-xl font-semibold text-[14px] inline-flex items-center justify-center gap-2 transition-all disabled:opacity-70 text-white mt-2"
              style={{ background: "#0F1218", boxShadow: "0 12px 36px -12px rgba(15,18,24,0.40)" }}>
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles size={14} strokeWidth={2.2} />
                  Personalise &amp; launch
                  <ArrowRight size={14} strokeWidth={2.2} />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 mt-6 text-[10.5px]" style={{ color: "rgba(15,18,24,0.45)" }}>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={11} strokeWidth={2} /> SOC 2 Type II
            </span>
            <span>·</span>
            <span>GDPR · CCPA</span>
            <span>·</span>
            <span>No credit card</span>
          </div>
        </div>

        {/* RIGHT — persona-aware preview */}
        <div className="lg:col-span-7">
          <PreviewPanel role={activeRole} name={name} company={company} />
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Form field
// ─────────────────────────────────────────────────────────────────────────────
function Field({
  label, hint, placeholder, value, onChange, type, autoComplete, autoFocus,
}: {
  label: string; hint?: string; placeholder: string;
  value: string; onChange: (v: string) => void;
  type: string; autoComplete?: string; autoFocus?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-[12px] font-medium mb-1.5">
        {label}
        {hint && <span className="font-normal ml-1" style={{ color: "rgba(15,18,24,0.45)" }}>· {hint}</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full h-11 px-4 rounded-xl text-[14px] focus:outline-none transition-all"
        style={{
          background: "white",
          border: `1px solid ${focused ? ACCENT : "rgba(15,18,24,0.10)"}`,
          boxShadow: focused ? `0 0 0 3px ${ACCENT}1A` : "0 1px 2px rgba(15,18,24,0.04)",
          color: "#0F1218",
        }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Persona-aware preview panel — adapts to the role the user picks.
// Hero: big circular-ring metric with the persona's primary KPI, two
// supporting stat chips, and a live "Alphy is doing..." signal feed.
// ─────────────────────────────────────────────────────────────────────────────

type PreviewSpec = {
  hero: { label: string; primary: string; secondary: string; pct: number };
  stats: { label: string; value: string; tone: string }[];
  feed: { Icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>; ts: string; title: string; sub: string; tone: string }[];
};

function PreviewPanel({ role, name, company }: { role: RoleOption; name: string; company: string }) {
  const spec: PreviewSpec = (() => {
    if (role.id === "am") return {
      hero:  { label: "Q4 Expansion attainment", primary: "$480K", secondary: "of $600K target", pct: 80 },
      stats: [
        { label: "Plays in motion",  value: "5",       tone: ACCENT },
        { label: "Hottest account",  value: "Cloudflare",  tone: "#F38020" },
      ],
      feed: [
        { Icon: Crown,      ts: "12m", title: "Champion promoted",       sub: "Maya Chen → VP Eng at Cloudflare",                  tone: "#9333EA" },
        { Icon: TrendingUp, ts: "1h",  title: "Networking SKU +38% WoW", sub: "Cloudflare · usage spike crossed expansion-trigger", tone: "#F59E0B" },
        { Icon: Sparkles,   ts: "2h",  title: "Expansion case drafted",  sub: "Cloudflare · $215K bundle · attached to email",     tone: ACCENT },
        { Icon: Network,    ts: "3h",  title: "Buying committee mapped", sub: "14 stakeholders · 6 attractors · 1 detractor",      tone: "#16A34A" },
      ],
    };
    if (role.id === "csm") return {
      hero:  { label: "Net Revenue Retention", primary: "112%", secondary: "Q4 projection · +2pp", pct: 91 },
      stats: [
        { label: "Renewals · 90d",  value: "5 · $760K",  tone: ACCENT },
        { label: "Save plays",      value: "6 in flight", tone: "#9333EA" },
      ],
      feed: [
        { Icon: ShieldCheck,ts: "8m", title: "At-risk renewal flagged", sub: "Snowflake · sponsor silent 14d · $480K at stake", tone: "#EF4444" },
        { Icon: Sparkles,   ts: "1h", title: "Save play drafted",       sub: "Snowflake · 5-step recovery · queued for approval", tone: ACCENT },
        { Icon: Activity,   ts: "2h", title: "Adoption inflection",     sub: "Cloudflare · WAU/MAU 0.71 → 0.84",                  tone: "#16A34A" },
        { Icon: Crown,      ts: "3h", title: "New stakeholder added",   sub: "Atlassian · Hannah Mortimer (Head of CS)",          tone: "#9333EA" },
      ],
    };
    if (role.id === "ae") return {
      hero:  { label: "Q4 Quota attainment", primary: "$540K", secondary: "of $1.2M · 45%", pct: 45 },
      stats: [
        { label: "Pipeline coverage", value: "1.22×",   tone: "#16A34A" },
        { label: "Win rate cohort",   value: "32%",      tone: "#9333EA" },
      ],
      feed: [
        { Icon: Flame,      ts: "9m",  title: "Shopify · Negotiation",     sub: "MSA redlines returned — 3 changes, no blockers",     tone: "#F59E0B" },
        { Icon: Target,     ts: "1h",  title: "Lockheed · FedRAMP signed", sub: "Compliance accepted final attestation today",       tone: ACCENT },
        { Icon: Sparkles,   ts: "2h",  title: "Discovery brief built",     sub: "ServiceNow · Mateusz Jankowski · 4-page brief",     tone: "#16A34A" },
        { Icon: Activity,   ts: "3h",  title: "Next-best-action queued",   sub: "Datadog · multi-thread CFO · awaiting your approval", tone: "#9333EA" },
      ],
    };
    return {
      hero:  { label: "Team commit · Q4", primary: "$5.30M", secondary: "of $9.60M target · 55%", pct: 55 },
      stats: [
        { label: "Forecast variance",  value: "±5%",   tone: "#16A34A" },
        { label: "Reps below 70%",     value: "2",     tone: "#EF4444" },
      ],
      feed: [
        { Icon: BarChart3,  ts: "20m", title: "Forecast snapshot saved", sub: "Q4 commit submitted · $5.30M · 87% confidence",     tone: ACCENT },
        { Icon: Activity,   ts: "1h",  title: "Brad Allen · 12 accounts",sub: "Workload score 82 — overloaded · reassign 3 deals", tone: "#EF4444" },
        { Icon: Sparkles,   ts: "2h",  title: "Coaching brief built",    sub: "Mike Torres 1:1 · 3 deals stuck >14d",              tone: "#9333EA" },
        { Icon: TrendingUp, ts: "3h",  title: "Pipeline coverage rolled","sub":"Mid-Market 0.9× — pulling discos forward",          tone: "#F59E0B" },
      ],
    };
  })();

  const co = company.trim() || "your company";
  const greeting = name.trim() ? name.trim().split(/\s+/)[0] : null;

  // Ring math
  const SIZE = 124;
  const STROKE = 8;
  const r = (SIZE - STROKE) / 2;
  const C = 2 * Math.PI * r;
  const dashOffset = C - (spec.hero.pct / 100) * C;

  return (
    <div className="rounded-3xl overflow-hidden relative"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #FAFBFD 100%)",
        border: "1px solid rgba(15,18,24,0.07)",
        boxShadow: "0 40px 100px -32px rgba(15,18,24,0.20), 0 4px 12px -4px rgba(15,18,24,0.04)",
      }}>
      {/* Top accent stripe */}
      <div aria-hidden style={{
        height: 3,
        background: `linear-gradient(90deg, ${ACCENT}, #9333EA, #16A34A)`,
      }} />

      <div className="p-7 md:p-8">
        {/* Header — persona pill + greeting */}
        <div className="flex items-center justify-between mb-6">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] px-2 py-1 rounded-md"
            style={{ background: `${ACCENT}10`, color: ACCENT, border: `1px solid ${ACCENT}22` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: ACCENT }} />
            {role.label}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10.5px] font-medium"
            style={{ color: "rgba(15,18,24,0.55)" }}>
            <span className="relative inline-flex w-1.5 h-1.5">
              <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "#0FC27B", opacity: 0.4 }} />
              <span className="relative w-1.5 h-1.5 rounded-full" style={{ background: "#0FC27B" }} />
            </span>
            Live preview · {co}
          </span>
        </div>

        {/* Hero — ring + primary metric */}
        <div className="rounded-2xl p-5 flex items-center gap-5 mb-3"
          style={{ background: "white", border: "1px solid rgba(15,18,24,0.06)" }}>
          <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
            <svg width={SIZE} height={SIZE} style={{ transform: "rotate(-90deg)" }}>
              <defs>
                <linearGradient id="ringFill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%"   stopColor={ACCENT} />
                  <stop offset="100%" stopColor="#9333EA" />
                </linearGradient>
              </defs>
              <circle cx={SIZE/2} cy={SIZE/2} r={r}
                stroke="rgba(15,18,24,0.06)" strokeWidth={STROKE} fill="none" />
              <circle cx={SIZE/2} cy={SIZE/2} r={r}
                stroke="url(#ringFill)" strokeWidth={STROKE} fill="none"
                strokeDasharray={C} strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 800ms cubic-bezier(0.32, 0.72, 0, 1)" }} />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-[22px] font-bold tnum" style={{ color: "#0F1218", letterSpacing: "-0.022em" }}>
                {spec.hero.pct}%
              </div>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] mb-1"
              style={{ color: "rgba(15,18,24,0.45)" }}>{spec.hero.label}</div>
            <div className="text-[28px] font-bold tnum mb-0.5"
              style={{ color: "#0F1218", letterSpacing: "-0.022em" }}>{spec.hero.primary}</div>
            <div className="text-[12.5px]" style={{ color: "rgba(15,18,24,0.62)" }}>{spec.hero.secondary}</div>
          </div>
        </div>

        {/* Two stat chips */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {spec.stats.map((s, i) => (
            <div key={i} className="rounded-xl px-4 py-3"
              style={{ background: "white", border: "1px solid rgba(15,18,24,0.06)" }}>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-1"
                style={{ color: "rgba(15,18,24,0.45)" }}>{s.label}</div>
              <div className="text-[16px] font-bold tnum" style={{ color: s.tone, letterSpacing: "-0.018em" }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Live signal feed */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "white", border: "1px solid rgba(15,18,24,0.06)" }}>
          <div className="px-4 py-2.5 flex items-center justify-between"
            style={{ borderBottom: "1px solid rgba(15,18,24,0.05)", background: "rgba(15,18,24,0.015)" }}>
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: "rgba(15,18,24,0.55)" }}>What Alphy is doing now</span>
            <span className="text-[10px] font-mono" style={{ color: "rgba(15,18,24,0.45)" }}>{spec.feed.length} events</span>
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(15,18,24,0.05)" }}>
            {spec.feed.map((row, i) => (
              <div key={i} className="px-4 py-3 flex items-start gap-3 hover:bg-[rgba(15,18,24,0.015)] transition-colors">
                <div className="w-7 h-7 rounded-lg grid place-items-center flex-shrink-0"
                  style={{ background: `${row.tone}12`, border: `1px solid ${row.tone}22` }}>
                  <row.Icon size={11} strokeWidth={2} style={{ color: row.tone }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-semibold leading-tight"
                    style={{ color: "#0F1218" }}>{row.title}</div>
                  <div className="text-[11px] leading-snug mt-0.5"
                    style={{ color: "rgba(15,18,24,0.55)" }}>{row.sub}</div>
                </div>
                <span className="text-[10px] font-mono tnum flex-shrink-0"
                  style={{ color: "rgba(15,18,24,0.40)" }}>{row.ts}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Outcome ribbon */}
        <div className="mt-5 rounded-xl px-4 py-3 flex items-center gap-3"
          style={{
            background: `linear-gradient(135deg, ${ACCENT}0D, rgba(124,58,237,0.05))`,
            border: `1px solid ${ACCENT}26`,
          }}>
          <div className="w-7 h-7 rounded-lg grid place-items-center flex-shrink-0"
            style={{ background: ACCENT }}>
            <Sparkles size={13} strokeWidth={2.2} color="white" />
          </div>
          <div className="text-[12px] leading-snug" style={{ color: "rgba(15,18,24,0.78)" }}>
            <span className="font-semibold" style={{ color: "#0F1218" }}>
              {greeting ? `${greeting}, you'll` : "You'll"} ship this with Alphard:
            </span>{" "}
            {role.outcome}
          </div>
        </div>
      </div>
    </div>
  );
}
