"use client";

import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import { MarketingNav } from "@/components/MarketingNav";
import {
  BookOpen, Rocket, Plug, Bot, Code2, ShieldCheck,
  Search, ArrowRight,
} from "lucide-react";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"], display: "swap" });

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4";

const CATEGORIES = [
  { icon: Rocket,      title: "Getting started",     body: "Install Alphy in 10 minutes. Connect your CRM, calendar, and call recorder." },
  { icon: Plug,        title: "Integrations",        body: "Salesforce, HubSpot, Gong, Chorus, Slack, Gmail, Outlook, Snowflake, Zendesk." },
  { icon: Bot,         title: "Agents & playbooks",  body: "Configure Renewal Sentry, QBR Composer, Multithreader, and custom agents." },
  { icon: Code2,       title: "API & webhooks",      body: "REST + GraphQL. Webhooks for signals, deal updates, and agent outcomes." },
  { icon: ShieldCheck, title: "Security & admin",    body: "SSO, SCIM, audit logs, field-level permissions, data retention controls." },
  { icon: BookOpen,    title: "Concepts",            body: "Account graph, signal taxonomy, forecast model, MEDDPICC scoring." },
];

const POPULAR = [
  { title: "Connect Salesforce in 5 minutes",      tag: "Getting started" },
  { title: "Building a custom renewal playbook",   tag: "Agents" },
  { title: "Pushing forecast deltas back to your CRM", tag: "API" },
  { title: "Setting up SCIM with Okta",            tag: "Admin" },
  { title: "Webhooks for signal events",           tag: "API" },
  { title: "Field mapping reference",              tag: "Integrations" },
];

export default function DocsPage() {
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
        <MarketingNav active="Docs" />

        {/* Hero */}
        <section className="pt-20 pb-12 max-w-4xl">
          <div className="liquid-glass border border-white/20 inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6">
            <BookOpen size={12} />
            <span className="text-[11px] font-medium tracking-widest uppercase text-white/80">
              Documentation
            </span>
          </div>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-normal mb-5"
            style={{ letterSpacing: "-0.04em" }}
          >
            Build with Alphy.
          </h1>
          <p className="text-base md:text-lg text-gray-300 max-w-2xl mb-8">
            Guides, API references, and operator playbooks for getting Alphy running across your revenue org.
          </p>

          {/* Search */}
          <div className="liquid-glass border border-white/20 rounded-xl flex items-center gap-3 px-4 py-3 max-w-xl">
            <Search size={16} className="text-white/60" strokeWidth={1.7} />
            <input
              type="search"
              placeholder="Search the docs…"
              className="bg-transparent border-0 outline-none text-[14px] text-white placeholder:text-white/45 flex-1"
            />
            <kbd className="text-[10px] font-mono text-white/45 border border-white/20 rounded px-1.5 py-0.5">
              ⌘K
            </kbd>
          </div>
        </section>

        {/* Categories */}
        <section className="mb-16">
          <div className="mb-8">
            <p className="text-[11px] font-medium tracking-widest uppercase text-white/50 mb-2">
              Browse by topic
            </p>
            <h2 className="text-3xl md:text-4xl font-normal" style={{ letterSpacing: "-0.03em" }}>
              What do you want to do?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {CATEGORIES.map((c) => (
              <a
                key={c.title}
                href="#"
                className="liquid-glass border border-white/15 rounded-2xl p-6 hover:border-white/40 transition-colors block group"
              >
                <c.icon size={18} className="text-white/80 mb-4" strokeWidth={1.6} />
                <h3 className="text-[16px] font-medium mb-1.5 flex items-center gap-2">
                  {c.title}
                  <ArrowRight size={13} className="text-white/40 group-hover:translate-x-0.5 transition-transform" />
                </h3>
                <p className="text-[13px] text-white/65 leading-relaxed">{c.body}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Popular articles */}
        <section className="mb-16">
          <div className="mb-6">
            <p className="text-[11px] font-medium tracking-widest uppercase text-white/50 mb-2">
              Popular
            </p>
            <h2 className="text-2xl md:text-3xl font-normal" style={{ letterSpacing: "-0.03em" }}>
              Most-read articles this week.
            </h2>
          </div>

          <div className="liquid-glass border border-white/15 rounded-2xl divide-y divide-white/10 overflow-hidden">
            {POPULAR.map((p, i) => (
              <a
                key={p.title}
                href="#"
                className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-mono text-white/40 w-6">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[14px] font-medium">{p.title}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10.5px] tracking-widest uppercase text-white/45">{p.tag}</span>
                  <ArrowRight size={14} className="text-white/40" />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="liquid-glass border border-white/20 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-normal mb-1.5" style={{ letterSpacing: "-0.03em" }}>
              Need a hand?
            </h3>
            <p className="text-white/70 text-[14px]">
              Talk to a solutions engineer or join our community Slack.
            </p>
          </div>
          <button
            onClick={() => router.push("/signin")}
            className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2 whitespace-nowrap"
          >
            Open the app <ArrowRight size={15} />
          </button>
        </section>
      </div>
    </div>
  );
}
