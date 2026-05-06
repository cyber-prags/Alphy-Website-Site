"use client";

import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import { MarketingNav } from "@/components/MarketingNav";
import {
  Sparkles, Activity, Users, Target, Bot, FileSearch,
  ArrowRight, MessageSquare, Calendar, TrendingUp, Shield,
} from "lucide-react";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"], display: "swap" });

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4";

const PILLARS = [
  {
    icon: Activity,
    title: "Real-time signals",
    body: "Champion job changes, exec calendar slips, intent spikes, deal pattern breaks — all stitched into a single timeline per account.",
  },
  {
    icon: Bot,
    title: "AI agents that act",
    body: "Renewal Sentry, QBR Composer, Multithreader, Forecast Auditor. Each agent owns a recurring outcome, not a one-off prompt.",
  },
  {
    icon: FileSearch,
    title: "Full account context",
    body: "Calls, emails, notes, contracts, support tickets, NRR — pulled into a single graph the moment you open an account.",
  },
];

const FEATURES = [
  { icon: Target,        title: "Pipeline & deal intelligence", body: "MEDDPICC scoring, stage hygiene, slip risk and momentum — for every deal, every day." },
  { icon: Users,         title: "Stakeholder graph",            body: "Org charts, champion strength, multithreading gaps and ghost detection out-of-the-box." },
  { icon: TrendingUp,    title: "AI forecast",                  body: "Most-likely number with audit trail. Every commit traces to signals you can defend." },
  { icon: MessageSquare, title: "Call intelligence",            body: "Auto-recap, MEDDPICC extraction, next-step drafts pushed back to your CRM." },
  { icon: Calendar,      title: "Renewal cockpit",              body: "Risk scoring 90+ days out. Playbooks fire automatically when a champion churns." },
  { icon: Shield,        title: "Built for revenue ops",        body: "SOC 2 Type II. Granular field-level permissions. CRM stays the system of record." },
];

export default function ProductPage() {
  const router = useRouter();

  return (
    <div
      className={`${inter.className} relative min-h-screen bg-black text-white`}
      style={{ WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale" } as React.CSSProperties}
    >
      <video
        className="fixed inset-0 w-full h-full object-cover z-0"
        src={VIDEO_SRC}
        autoPlay loop muted playsInline
      />
      <div className="fixed inset-0 bg-black/40 z-0" />

      <div className="relative z-10 px-6 md:px-12 lg:px-16 pb-24">
        <MarketingNav active="Product" />

        {/* Hero */}
        <section className="pt-20 pb-16 max-w-5xl">
          <div className="liquid-glass border border-white/20 inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6">
            <Sparkles size={12} />
            <span className="text-[11px] font-medium tracking-widest uppercase text-white/80">
              Product
            </span>
          </div>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-normal mb-5 text-white"
            style={{ letterSpacing: "-0.04em" }}
          >
            One workspace for every<br />account, every signal, every play.
          </h1>
          <p className="text-base md:text-lg text-gray-300 max-w-2xl mb-8">
            Alphy unifies your CRM, calls, calendar, and product usage into a single revenue graph — then runs AI agents on top so your team always knows what to do next.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/signin")}
              className="bg-white text-black px-7 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
            >
              Try the workspace <ArrowRight size={16} />
            </button>
            <button
              onClick={() => router.push("/customers")}
              className="liquid-glass border border-white/20 text-white px-7 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-colors"
            >
              See customer stories
            </button>
          </div>
        </section>

        {/* Three pillars */}
        <section className="grid md:grid-cols-3 gap-4 mb-20">
          {PILLARS.map((p) => (
            <div key={p.title} className="liquid-glass border border-white/15 rounded-2xl p-6">
              <p.icon size={18} className="text-white/80 mb-4" strokeWidth={1.6} />
              <h3 className="text-[18px] font-medium mb-2">{p.title}</h3>
              <p className="text-[13.5px] text-white/70 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </section>

        {/* Feature grid */}
        <section className="mb-16">
          <div className="mb-8">
            <p className="text-[11px] font-medium tracking-widest uppercase text-white/50 mb-2">
              Capabilities
            </p>
            <h2 className="text-3xl md:text-4xl font-normal" style={{ letterSpacing: "-0.03em" }}>
              Everything a revenue team runs on.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="liquid-glass border border-white/10 rounded-2xl p-5">
                <f.icon size={16} className="text-white/70 mb-3" strokeWidth={1.6} />
                <h4 className="text-[15px] font-medium mb-1.5">{f.title}</h4>
                <p className="text-[13px] text-white/65 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA strip */}
        <section className="liquid-glass border border-white/20 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-normal mb-1.5" style={{ letterSpacing: "-0.03em" }}>
              See Alphy on your accounts.
            </h3>
            <p className="text-white/70 text-[14px]">
              Connect your CRM and we'll surface live signals on day one.
            </p>
          </div>
          <button
            onClick={() => router.push("/signin")}
            className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2 whitespace-nowrap"
          >
            Get started <ArrowRight size={15} />
          </button>
        </section>
      </div>
    </div>
  );
}
