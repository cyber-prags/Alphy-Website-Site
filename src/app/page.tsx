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
// Persona-aware preview panel — adapts to the role they pick
// ─────────────────────────────────────────────────────────────────────────────
function PreviewPanel({ role, name, company }: { role: RoleOption; name: string; company: string }) {
  // Tile data adapts per persona
  const tiles = ((): { Icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>; label: string; value: string; sub: string; tone: string }[] => {
    if (role.id === "am") return [
      { Icon: Target,    label: "Q4 expansion target", value: "$600K", sub: "$480K achieved · 80%", tone: ACCENT },
      { Icon: Crown,     label: "Champion promoted",   value: "Maya Chen", sub: "Cloudflare · 14h ago", tone: "#9333EA" },
      { Icon: TrendingUp,label: "Hottest signal",      value: "+38% WoW",  sub: "Networking SKU usage", tone: "#F59E0B" },
      { Icon: Network,   label: "Buying committee",    value: "14",        sub: "6 attractors · 1 detractor", tone: "#16A34A" },
    ];
    if (role.id === "csm") return [
      { Icon: ShieldCheck,label: "NRR projection",      value: "112%",     sub: "Q4 trending +2pp",         tone: "#16A34A" },
      { Icon: Activity,   label: "At risk ARR",         value: "$480K",    sub: "Snowflake · sponsor silent", tone: "#EF4444" },
      { Icon: Target,     label: "Renewals next 90d",   value: "5",        sub: "$760K at stake",           tone: ACCENT },
      { Icon: Sparkles,   label: "Save plays in flight",value: "6",        sub: "3 awaiting approval",      tone: "#9333EA" },
    ];
    if (role.id === "ae") return [
      { Icon: Target,     label: "Quota · Q4",          value: "$1.2M",    sub: "$540K closed-won · 45%",   tone: ACCENT },
      { Icon: Activity,   label: "Pipeline coverage",   value: "1.22×",    sub: "+12% pace vs last Q",      tone: "#16A34A" },
      { Icon: Flame,      label: "Hottest deal",        value: "Shopify",  sub: "Negotiation · 88° · $350K",tone: "#F59E0B" },
      { Icon: TrendingUp, label: "Win rate cohort",     value: "32%",      sub: "vs team avg 28%",          tone: "#9333EA" },
    ];
    return [
      { Icon: BarChart3,  label: "Team commit",         value: "$5.30M",   sub: "$9.60M target · 55%",      tone: ACCENT },
      { Icon: Target,     label: "Forecast variance",   value: "±5%",      sub: "vs ±15% pre-Alphard",      tone: "#16A34A" },
      { Icon: ShieldCheck,label: "Reps below 70%",      value: "2",        sub: "needs 1:1 air cover",      tone: "#EF4444" },
      { Icon: TrendingUp, label: "Coverage multiplier", value: "3.0×",     sub: "healthy across segments",  tone: "#9333EA" },
    ];
  })();

  const co = company.trim() || "your company";
  const greeting = name.trim() ? name.trim().split(/\s+/)[0] : "—";

  return (
    <div className="rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #F4F6FA 100%)",
        border: "1px solid rgba(15,18,24,0.08)",
        boxShadow: "0 32px 80px -28px rgba(15,18,24,0.18), 0 4px 12px -4px rgba(15,18,24,0.06)",
      }}>
      {/* Faux app chrome */}
      <div className="px-5 py-3 flex items-center gap-2"
        style={{ borderBottom: "1px solid rgba(15,18,24,0.06)", background: "rgba(255,255,255,0.6)" }}>
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#FF5F57" }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#FFBD2E" }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#28C840" }} />
        <span className="ml-3 text-[10.5px] font-medium font-mono"
          style={{ color: "rgba(15,18,24,0.55)" }}>
          alphard.com / home
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: "rgba(15,18,24,0.55)" }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: ACCENT }} />
          {role.label}
        </span>
      </div>

      <div className="p-7 md:p-9">
        {/* Greeting */}
        <div className="mb-5">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] mb-1"
            style={{ color: "rgba(15,18,24,0.45)" }}>
            Good morning
          </div>
          <h2 className="text-[26px] md:text-[30px] font-semibold leading-[1.05]"
            style={{ letterSpacing: "-0.022em" }}>
            {greeting}, here&rsquo;s your {role.id === "ae" ? "pipeline" : role.id === "csm" ? "saves queue" : "book"} at {co}.
          </h2>
        </div>

        {/* Tiles */}
        <div className="grid grid-cols-2 gap-3">
          {tiles.map((t, i) => (
            <div key={i} className="rounded-xl p-4 transition-all"
              style={{
                background: "white",
                border: "1px solid rgba(15,18,24,0.07)",
                boxShadow: "0 1px 2px rgba(15,18,24,0.04)",
              }}>
              <div className="flex items-center gap-1.5 mb-2">
                <t.Icon size={11} strokeWidth={1.8} style={{ color: "rgba(15,18,24,0.55)" }} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: "rgba(15,18,24,0.45)" }}>{t.label}</span>
              </div>
              <div className="text-[22px] font-bold tnum"
                style={{ color: t.tone, letterSpacing: "-0.018em" }}>{t.value}</div>
              <div className="text-[11px] mt-0.5"
                style={{ color: "rgba(15,18,24,0.55)" }}>{t.sub}</div>
            </div>
          ))}
        </div>

        {/* Outcome ribbon */}
        <div className="mt-5 rounded-xl px-4 py-3 flex items-start gap-3"
          style={{
            background: "linear-gradient(135deg, rgba(38,109,240,0.06), rgba(124,58,237,0.04))",
            border: "1px solid rgba(38,109,240,0.16)",
          }}>
          <div className="w-7 h-7 rounded-lg grid place-items-center flex-shrink-0"
            style={{ background: ACCENT }}>
            <Sparkles size={13} strokeWidth={2.2} color="white" />
          </div>
          <div className="text-[12px] leading-relaxed"
            style={{ color: "rgba(15,18,24,0.78)" }}>
            <span className="font-semibold" style={{ color: "#0F1218" }}>Outcome:</span>{" "}
            {role.outcome}
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-5 pt-5 grid grid-cols-3 gap-2 text-center"
          style={{ borderTop: "1px solid rgba(15,18,24,0.06)" }}>
          <Fact value="500+"   label="Companies onboarded" />
          <Fact value="3 min"  label="Avg time-to-value" />
          <Fact value="±5%"    label="Forecast accuracy" />
        </div>
      </div>
    </div>
  );
}

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-[15px] font-bold tnum text-ink"
        style={{ color: "#0F1218", letterSpacing: "-0.018em" }}>{value}</div>
      <div className="text-[10.5px] mt-0.5"
        style={{ color: "rgba(15,18,24,0.55)" }}>{label}</div>
    </div>
  );
}
