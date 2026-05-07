"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, Sparkles, Flame, Briefcase, Users, LifeBuoy, BarChart3,
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
  Icon: any;
};

const ROLES: RoleOption[] = [
  {
    id: "am",
    label: "Account Manager",
    blurb: "Run expansion across a book of customers.",
    Icon: Briefcase,
  },
  {
    id: "csm",
    label: "Customer Success",
    blurb: "Drive adoption, retention, and saves.",
    Icon: LifeBuoy,
  },
  {
    id: "ae",
    label: "Account Executive",
    blurb: "Close net-new pipeline.",
    Icon: Flame,
  },
  {
    id: "manager",
    label: "Sales / CS Leader",
    blurb: "Manage a team — capacity, forecast, roll-ups.",
    Icon: BarChart3,
  },
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
    // pre-select the last persona they used
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

    // Fire-and-forget contact sync to Resend so we capture every demo signup.
    // Errors are swallowed — the user shouldn't wait on third-party calls.
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    void fetch(`${basePath}/api/collect-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: trimmedEmail,
        name: trimmedName,
        company: trimmedCompany,
        role,
        source: "signin_demo",
      }),
    }).catch(() => {});

    // Identify the user in PostHog so funnel analytics + email outreach work
    if (typeof window !== "undefined" && (window as any).posthog) {
      try {
        (window as any).posthog.identify(trimmedEmail, {
          email: trimmedEmail,
          name: trimmedName,
          company: trimmedCompany,
          role,
        });
        (window as any).posthog.capture("demo_started", {
          name: trimmedName,
          company: trimmedCompany,
          role,
        });
      } catch {}
    }
    setTimeout(() => router.push("/onboarding"), 600);
  };

  return (
    <div className={`${inter.className} min-h-screen flex items-center justify-center px-6 py-12`}
      style={{ background: "#FAFAFB", color: "#0F1218" }}>

      {/* Ambient gradient */}
      <div aria-hidden className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(38,109,240,0.10) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(124,58,237,0.06) 0%, transparent 60%)",
        }} />
      <div aria-hidden className="absolute inset-0 pointer-events-none opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,18,24,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,18,24,0.04) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "linear-gradient(to bottom, black 0%, transparent 90%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 90%)",
        }} />

      <div className="relative z-10 w-full max-w-[540px]">
        {/* Logo + back link */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.push("/")} className="flex items-center group" aria-label="Alphard">
            <AlphardLogo variant="full" size={20} fill="#0F1218" />
          </button>
          <span className="inline-flex items-center gap-1.5 text-[10.5px] font-medium tracking-[0.12em] uppercase"
            style={{ color: "rgba(15,18,24,0.55)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#0FC27B" }} />
            Live demo
          </span>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-7 md:p-9 bg-white"
          style={{ border: "1px solid rgba(15,18,24,0.08)", boxShadow: "0 1px 2px rgba(15,18,24,0.04), 0 18px 60px -16px rgba(15,18,24,0.10)" }}>
          <h1 className="text-[26px] md:text-[30px] font-semibold mb-2 leading-tight"
            style={{ letterSpacing: "-0.02em" }}>
            Let's personalize your demo.
          </h1>
          <p className="text-[14px] mb-7" style={{ color: "rgba(15,18,24,0.62)" }}>
            We'll set up the workspace as if it were your book of business — with your name on it.
          </p>

          <form onSubmit={submit} className="space-y-5">
            {/* Name + Email row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium mb-1.5">Your name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Chen"
                  autoFocus
                  autoComplete="name"
                  className="w-full h-11 px-4 rounded-xl text-[14px] focus:outline-none focus:ring-2 transition-all"
                  style={{
                    background: "white",
                    border: "1px solid rgba(15,18,24,0.12)",
                    color: "#0F1218",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}1A`; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(15,18,24,0.12)"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1.5">Work email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  className="w-full h-11 px-4 rounded-xl text-[14px] focus:outline-none focus:ring-2 transition-all"
                  style={{
                    background: "white",
                    border: "1px solid rgba(15,18,24,0.12)",
                    color: "#0F1218",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}1A`; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(15,18,24,0.12)"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="block text-[12px] font-medium mb-1.5">
                Your company <span className="font-normal" style={{ color: "rgba(15,18,24,0.45)" }}>· optional</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Cloudflare"
                autoComplete="organization"
                className="w-full h-11 px-4 rounded-xl text-[14px] focus:outline-none focus:ring-2 transition-all"
                style={{
                  background: "white",
                  border: "1px solid rgba(15,18,24,0.12)",
                  color: "#0F1218",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}1A`; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(15,18,24,0.12)"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>

            {/* Role picker */}
            <div>
              <label className="block text-[12px] font-medium mb-2">
                What's your role?
                <span className="font-normal ml-1.5" style={{ color: "rgba(15,18,24,0.45)" }}>
                  · we'll tailor the workspace
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ROLES.map((r) => {
                  const active = role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className="text-left rounded-xl p-3 transition-all"
                      style={{
                        background: active ? `${ACCENT}0D` : "white",
                        border: `1px solid ${active ? ACCENT : "rgba(15,18,24,0.12)"}`,
                        boxShadow: active ? `0 0 0 3px ${ACCENT}1A` : "none",
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg grid place-items-center shrink-0"
                          style={{
                            background: active ? ACCENT : "rgba(15,18,24,0.05)",
                          }}>
                          <r.Icon size={14} strokeWidth={2}
                            style={{ color: active ? "white" : "rgba(15,18,24,0.65)" }} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[12.5px] font-semibold leading-tight"
                            style={{ color: active ? ACCENT : "#0F1218" }}>
                            {r.label}
                          </div>
                          <div className="text-[11px] mt-0.5 leading-snug"
                            style={{ color: "rgba(15,18,24,0.55)" }}>
                            {r.blurb}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <p className="text-[12px]" style={{ color: "#FF5B59" }}>{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full h-11 rounded-xl font-semibold text-[14px] inline-flex items-center justify-center gap-2 transition-all disabled:opacity-70 text-white"
              style={{
                background: "#0F1218",
                boxShadow: "0 10px 30px -10px rgba(15,18,24,0.30)",
              }}>
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles size={14} strokeWidth={2.2} />
                  Personalize and launch
                  <ArrowRight size={14} strokeWidth={2.2} />
                </>
              )}
            </button>
          </form>

          <p className="text-[11.5px] mt-6" style={{ color: "rgba(15,18,24,0.45)" }}>
            No password, no credit card. We'll use your email to follow up about the trial and improvements — never share it.
          </p>
        </div>

        <p className="text-center text-[11.5px] mt-6" style={{ color: "rgba(15,18,24,0.55)" }}>
          Already explored?{" "}
          <button onClick={() => router.push("/home")}
            className="font-semibold hover:underline" style={{ color: "#0F1218" }}>
            Skip to the workspace →
          </button>
        </p>
      </div>
    </div>
  );
}
