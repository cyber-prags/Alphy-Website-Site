"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { AlphardLogo } from "@/components/AlphardLogo";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"], display: "swap" });

const VIDEO_SRC = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    setError("");
    setLoading(true);
    // Any credentials work — simulate a brief auth delay
    setTimeout(() => router.push("/onboarding"), 900);
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      {/* ── Left panel: login form ── */}
      <div className="flex flex-col justify-center w-full max-w-[480px] px-10 md:px-14 py-12 shrink-0">
        {/* Logo */}
        <div className="mb-10">
          <AlphardLogo variant="full" size={24} />
        </div>

        <div className="mb-8">
          <h1 className="text-[28px] font-bold tracking-tight text-ink leading-tight mb-1.5">
            Welcome back
          </h1>
          <p className="text-[14px] text-muted">
            Sign in to your Alphy workspace.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-ink mb-1.5">Work email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="walid@company.com"
              autoComplete="email"
              className="w-full h-11 px-4 rounded-xl border border-line bg-surface text-[13.5px] text-ink placeholder:text-muted-2 focus:outline-none focus:border-accent-deep focus:ring-2 focus:ring-accent/20 transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[12px] font-medium text-ink">Password</label>
              <button type="button" className="text-[11.5px] text-muted hover:text-ink transition-colors">
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full h-11 px-4 pr-11 rounded-xl border border-line bg-surface text-[13.5px] text-ink placeholder:text-muted-2 focus:outline-none focus:border-accent-deep focus:ring-2 focus:ring-accent/20 transition-all"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors">
                {showPw ? <EyeOff size={15} strokeWidth={1.7} /> : <Eye size={15} strokeWidth={1.7} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-[12px] text-neg">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="w-full h-11 rounded-xl font-semibold text-[14px] inline-flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            style={{ background: "var(--ink)", color: "white" }}>
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><ArrowRight size={15} strokeWidth={2} /> Sign in</>
            )}
          </button>

          <div className="relative flex items-center gap-3 py-1">
            <hr className="flex-1 hairline" />
            <span className="text-[11px] text-muted-2 font-mono">or</span>
            <hr className="flex-1 hairline" />
          </div>

          <button type="button"
            onClick={() => { setLoading(true); setTimeout(() => router.push("/onboarding"), 900); }}
            className="w-full h-11 rounded-xl border border-line bg-surface text-[13.5px] font-medium text-ink-2 inline-flex items-center justify-center gap-2.5 hover:bg-bg-deep transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" className="shrink-0">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </form>

        <p className="text-[12px] text-muted text-center mt-8">
          No account?{" "}
          <button onClick={() => router.push("/onboarding")}
            className="text-ink font-medium hover:underline">
            Set up your workspace
          </button>
        </p>

        <p className="text-[10.5px] text-muted-2 text-center mt-6">
          By signing in you agree to Alphy's{" "}
          <span className="underline cursor-pointer">Terms</span> and{" "}
          <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>

      {/* ── Right panel: same video + liquid-glass theme ── */}
      <div className={`hidden md:flex flex-1 relative overflow-hidden bg-black text-white ${inter.className}`}>

        {/* Background video — raw, no overlay */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src={VIDEO_SRC}
          autoPlay loop muted playsInline
        />

        {/* Content sits above video */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full"
          style={{ WebkitFontSmoothing: "antialiased" } as React.CSSProperties}>

          {/* Top: logo + tagline */}
          <div>
            <div className="liquid-glass border border-white/20 inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
              <span className="text-[11px] font-medium tracking-widest uppercase text-white/80">
                AI Revenue Intelligence
              </span>
            </div>

            <h2 className="text-[36px] md:text-[44px] font-normal leading-[1.08] mb-4"
              style={{ letterSpacing: "-0.03em" }}>
              The workspace your<br />
              revenue team<br />
              actually uses.
            </h2>
            <p className="text-[15px] font-light text-gray-300 max-w-[380px] leading-relaxed">
              Real-time signals, AI agents, and full account context — so you never miss a renewal or close.
            </p>
          </div>

          {/* Middle: liquid-glass metric cards */}
          <div className="flex flex-col gap-3 my-10">
            {[
              { label: "Renewal risk",     value: "3 accounts",  sub: "47 · 90 · 64 days out"       },
              { label: "Champion signal",  value: "Cloudflare",  sub: "Maya Chen → VP Engineering"  },
              { label: "AI Forecast",      value: "$6.1M",       sub: "Most likely · +2% vs last"   },
            ].map((c) => (
              <div key={c.label}
                className="liquid-glass border border-white/15 flex items-center gap-4 px-4 py-3 rounded-2xl">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-medium uppercase tracking-widest text-white/40 mb-0.5">
                    {c.label}
                  </div>
                  <div className="text-[15px] font-medium text-white">{c.value}</div>
                </div>
                <div className="text-[11px] font-light text-white/50 text-right">{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Bottom: tag pill (mirrors landing page) */}
          <div>
            <div className="liquid-glass border border-white/20 inline-block px-6 py-3 rounded-xl mb-4">
              <span className="text-lg font-light">Investing. Building. Advisory.</span>
            </div>
            <p className="text-[12px] font-light text-white/40 italic">
              "Alphy cut our QBR prep from 2 hours to 8 minutes."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
