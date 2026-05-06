"use client";

import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import { MarketingNav } from "@/components/MarketingNav";
import { ArrowRight, Quote, TrendingUp, Clock, Target } from "lucide-react";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"], display: "swap" });

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4";

const LOGOS = [
  "Cloudflare", "Snowflake", "Datadog", "Notion", "Ramp", "Vercel",
  "Figma", "Linear", "Retool", "Plaid", "Mercury", "Brex",
];

const STORIES = [
  {
    company: "Cloudflare",
    role: "RVP, Enterprise",
    name: "Maya Chen",
    quote:
      "Alphy cut our QBR prep from two hours to eight minutes. The renewal sentry caught two churn risks our forecast totally missed.",
    metric: { label: "QBR prep time", value: "−93%" },
  },
  {
    company: "Snowflake",
    role: "VP Customer Success",
    name: "Jordan Park",
    quote:
      "Every CSM walks into a renewal call already knowing the room. The stakeholder graph alone is worth the seat.",
    metric: { label: "Gross retention lift", value: "+4.2pt" },
  },
  {
    company: "Datadog",
    role: "Director, RevOps",
    name: "Priya Subramanian",
    quote:
      "We replaced three tools with Alphy. The forecast actually traces back to signals — finance stopped questioning the call.",
    metric: { label: "Forecast accuracy", value: "94%" },
  },
];

const STATS = [
  { icon: Clock,      value: "8 min",  label: "Average QBR prep with Alphy" },
  { icon: TrendingUp, value: "+12%",   label: "Lift in net revenue retention" },
  { icon: Target,     value: "94%",    label: "Forecast accuracy at quarter close" },
];

export default function CustomersPage() {
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
        <MarketingNav active="Customers" />

        {/* Hero */}
        <section className="pt-20 pb-16 max-w-4xl">
          <div className="liquid-glass border border-white/20 inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
            <span className="text-[11px] font-medium tracking-widest uppercase text-white/80">
              Customers
            </span>
          </div>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-normal mb-5"
            style={{ letterSpacing: "-0.04em" }}
          >
            Revenue teams that<br />ship every quarter.
          </h1>
          <p className="text-base md:text-lg text-gray-300 max-w-2xl">
            From hyperscale infra to fast-moving fintech, the operators below run their accounts on Alphy.
          </p>
        </section>

        {/* Logo wall */}
        <section className="mb-16">
          <div className="liquid-glass border border-white/15 rounded-2xl p-8">
            <p className="text-[10px] font-medium tracking-widest uppercase text-white/50 mb-5">
              Trusted by revenue teams at
            </p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-x-6 gap-y-5">
              {LOGOS.map((l) => (
                <div key={l} className="text-center text-white/75 text-[15px] font-medium tracking-tight">
                  {l}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="grid md:grid-cols-3 gap-4 mb-16">
          {STATS.map((s) => (
            <div key={s.label} className="liquid-glass border border-white/15 rounded-2xl p-6">
              <s.icon size={18} className="text-white/70 mb-3" strokeWidth={1.6} />
              <div className="text-[32px] font-medium leading-none mb-2 tracking-tight">{s.value}</div>
              <div className="text-[13px] text-white/65">{s.label}</div>
            </div>
          ))}
        </section>

        {/* Customer stories */}
        <section className="mb-16">
          <div className="mb-8">
            <p className="text-[11px] font-medium tracking-widest uppercase text-white/50 mb-2">
              Stories
            </p>
            <h2 className="text-3xl md:text-4xl font-normal" style={{ letterSpacing: "-0.03em" }}>
              How they use Alphy.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {STORIES.map((s) => (
              <article key={s.company} className="liquid-glass border border-white/15 rounded-2xl p-6 flex flex-col">
                <Quote size={18} className="text-white/40 mb-4" strokeWidth={1.6} />
                <p className="text-[14.5px] text-white/85 leading-relaxed mb-5 flex-1">
                  "{s.quote}"
                </p>
                <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                  <div>
                    <div className="text-[13.5px] font-medium">{s.name}</div>
                    <div className="text-[11.5px] text-white/55">{s.role} · {s.company}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] tracking-widest uppercase text-white/40">{s.metric.label}</div>
                    <div className="text-[15px] font-medium">{s.metric.value}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="liquid-glass border border-white/20 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-normal mb-1.5" style={{ letterSpacing: "-0.03em" }}>
              Want to be the next story?
            </h3>
            <p className="text-white/70 text-[14px]">
              Book a 30-minute working session with the Alphy team.
            </p>
          </div>
          <button
            onClick={() => router.push("/signin")}
            className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2 whitespace-nowrap"
          >
            Talk to us <ArrowRight size={15} />
          </button>
        </section>
      </div>
    </div>
  );
}
