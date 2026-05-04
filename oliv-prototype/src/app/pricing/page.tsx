"use client";

import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import { MarketingNav } from "@/components/MarketingNav";
import { Check, ArrowRight } from "lucide-react";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"], display: "swap" });

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4";

const TIERS = [
  {
    name: "Starter",
    price: "$45",
    period: "/seat / month",
    blurb: "For a single AE or CSM exploring Alphy.",
    cta: "Start free",
    highlight: false,
    features: [
      "Up to 25 active accounts",
      "Real-time signal feed",
      "Call recap + MEDDPICC",
      "Slack & email integrations",
      "Community support",
    ],
  },
  {
    name: "Team",
    price: "$95",
    period: "/seat / month",
    blurb: "Most popular — for full revenue teams.",
    cta: "Start a 14-day trial",
    highlight: true,
    features: [
      "Unlimited accounts & deals",
      "All AI agents (Renewal, QBR, Multithreader)",
      "Forecast cockpit & audit trail",
      "Salesforce + HubSpot two-way sync",
      "Org chart + stakeholder graph",
      "Standard SSO, priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    blurb: "For platform teams running global revenue.",
    cta: "Talk to sales",
    highlight: false,
    features: [
      "Dedicated AI tenant + custom agents",
      "Field-level permissions, SCIM, audit logs",
      "Private VPC deployment option",
      "SOC 2 Type II + HIPAA addendum",
      "Solutions architect on-staff",
    ],
  },
];

const FAQ = [
  {
    q: "How is Alphy priced?",
    a: "Per active seat, billed monthly or annually. There's no usage cap on agents, signals, or accounts — you can run Alphy across your whole book.",
  },
  {
    q: "Do you replace my CRM?",
    a: "No. Alphy sits on top of Salesforce, HubSpot, or your home-grown CRM. We push enriched fields back so the system of record stays current.",
  },
  {
    q: "What about data security?",
    a: "Alphy is SOC 2 Type II certified. Your data lives in a single-tenant store, encrypted at rest with customer-managed keys on Enterprise.",
  },
  {
    q: "Can I bring my own LLM?",
    a: "Yes — Enterprise customers can route agent calls through their own Anthropic, Azure OpenAI, or Bedrock account.",
  },
];

export default function PricingPage() {
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
        <MarketingNav active="Pricing" />

        {/* Hero */}
        <section className="pt-20 pb-12 max-w-4xl">
          <div className="liquid-glass border border-white/20 inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
            <span className="text-[11px] font-medium tracking-widest uppercase text-white/80">
              Pricing
            </span>
          </div>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-normal mb-5"
            style={{ letterSpacing: "-0.04em" }}
          >
            Simple seat pricing.<br />Unlimited signals.
          </h1>
          <p className="text-base md:text-lg text-gray-300 max-w-2xl">
            Pick a plan that fits how your revenue team works today. Upgrade as your book grows.
          </p>
        </section>

        {/* Tiers */}
        <section className="grid md:grid-cols-3 gap-4 mb-16">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`relative rounded-2xl p-6 flex flex-col ${
                t.highlight
                  ? "bg-white text-black"
                  : "liquid-glass border border-white/15 text-white"
              }`}
            >
              {t.highlight && (
                <span className="absolute -top-3 left-6 bg-black text-white text-[10px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full">
                  Most popular
                </span>
              )}

              <div className="mb-6">
                <div className={`text-[12px] font-medium tracking-widest uppercase mb-2 ${
                  t.highlight ? "text-black/60" : "text-white/55"
                }`}>
                  {t.name}
                </div>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-[36px] font-medium tracking-tight leading-none">{t.price}</span>
                  {t.period && (
                    <span className={`text-[13px] ${t.highlight ? "text-black/60" : "text-white/60"}`}>
                      {t.period}
                    </span>
                  )}
                </div>
                <p className={`text-[13px] ${t.highlight ? "text-black/70" : "text-white/65"}`}>
                  {t.blurb}
                </p>
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13.5px]">
                    <Check size={14} strokeWidth={2.2} className={`mt-0.5 shrink-0 ${
                      t.highlight ? "text-black" : "text-white/80"
                    }`} />
                    <span className={t.highlight ? "text-black/85" : "text-white/85"}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => router.push("/signin")}
                className={`w-full h-11 rounded-lg font-medium text-[13.5px] inline-flex items-center justify-center gap-2 transition-colors ${
                  t.highlight
                    ? "bg-black text-white hover:bg-zinc-800"
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                {t.cta} <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <div className="mb-8">
            <p className="text-[11px] font-medium tracking-widest uppercase text-white/50 mb-2">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-normal" style={{ letterSpacing: "-0.03em" }}>
              Questions we get a lot.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {FAQ.map((f) => (
              <div key={f.q} className="liquid-glass border border-white/15 rounded-2xl p-6">
                <h4 className="text-[15px] font-medium mb-2">{f.q}</h4>
                <p className="text-[13.5px] text-white/70 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="liquid-glass border border-white/20 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-normal mb-1.5" style={{ letterSpacing: "-0.03em" }}>
              Need procurement details?
            </h3>
            <p className="text-white/70 text-[14px]">
              We'll send your team SOC 2 reports, MSA, and a custom proposal.
            </p>
          </div>
          <button
            onClick={() => router.push("/signin")}
            className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2 whitespace-nowrap"
          >
            Contact sales <ArrowRight size={15} />
          </button>
        </section>
      </div>
    </div>
  );
}
