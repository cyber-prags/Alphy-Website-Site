"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Workflow, BookOpen, Plug, Telescope, MessageSquare, MessageSquarePlus,
  CircleUser, KeyRound, Bell, Bot, ArrowUpRight, Sparkles, Check,
  Hash, Database, Activity, FileBarChart2, Layers,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AgentDetail } from "@/components/AgentDetail";
import { BrandLogo } from "@/components/BrandLogo";
import { PersonAvatar } from "@/components/PersonAvatar";
import { useUser } from "@/components/UserContext";
import { usePersona, PERSONA_LABEL } from "@/components/PersonaContext";
import { agents, type Agent, type Persona } from "@/lib/mock";

const ACCENT = "#266DF0";

// ─────────────────────────────────────────────────────────────────────
// SETUP HUB — bento dashboard mirroring /plan.
// Each tile previews live state instead of being a generic nav card.
// ─────────────────────────────────────────────────────────────────────

const INTEGRATIONS = [
  { name: "Salesforce", connected: true,  Icon: Database },
  { name: "Gong",        connected: true,  Icon: Activity },
  { name: "Zendesk",     connected: true,  Icon: Layers },
  { name: "Mixpanel",    connected: true,  Icon: Activity },
  { name: "Slack",       connected: true,  Icon: Hash },
  { name: "LinkedIn",    connected: true,  Icon: Activity },
  { name: "Snowflake",   connected: false, Icon: Database },
  { name: "Looker",      connected: false, Icon: FileBarChart2 },
];

export default function SetupPage() {
  const { persona } = usePersona();
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const myAgents = useMemo(() => agents.filter((a) => a.installed), []);
  const featuredAgent = useMemo(
    () =>
      agents.find((a) =>
        persona === "csm" ? a.role === "Customer Success" :
        persona === "ae" || persona === "am" ? a.role === "Sales" :
        a.role === "Revenue Operations"
      ) ?? agents[0],
    [persona]
  );

  return (
    <AppShell>
      <header className="mb-7">
        <div className="flex items-baseline justify-between flex-wrap gap-3 mb-1.5">
          <h1 className="text-[24px] font-semibold text-ink"
            style={{ letterSpacing: "-0.022em" }}>
            Setup
          </h1>
          <span className="text-[11px] text-muted-2 font-mono">
            All systems · operational
          </span>
        </div>
        <p className="text-[13px] text-muted leading-relaxed max-w-2xl">
          Configure once and forget. Tailored for{" "}
          <span className="font-semibold text-ink-2">{PERSONA_LABEL[persona]}</span>.
        </p>
      </header>

      {/* AUTOMATION row */}
      <SectionHeader
        label="Automation"
        sub="Rules, plays, agents — set once, run forever."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-[minmax(220px,auto)] mb-10">
        <div className="lg:col-span-2">
          <FeaturedAgentTile
            agent={featuredAgent}
            installedCount={myAgents.length}
            onOpen={() => setActiveAgent(featuredAgent)}
          />
        </div>
        <WorkflowsTile />
        <PlaybooksTile />
        <BlueprintsTile />
      </div>

      {/* DATA row */}
      <SectionHeader
        label="Data"
        sub="Where Alphard reads from and answers."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-[minmax(220px,auto)] mb-10">
        <div className="lg:col-span-2">
          <IntegrationsTile />
        </div>
        <ChatTile />
        {persona === "csm" && <RequestsTile />}
      </div>

      {/* ACCOUNT row */}
      <SectionHeader
        label="Account"
        sub="Your profile and preferences."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-[minmax(180px,auto)]">
        <ProfileTile />
        <NotificationsTile />
        <ApiKeysTile />
      </div>

      <AgentDetail
        agent={activeAgent}
        onClose={() => setActiveAgent(null)}
      />
    </AppShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Section header
// ─────────────────────────────────────────────────────────────────────
function SectionHeader({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="mb-4">
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1">
        {label}
      </div>
      <div className="text-[12.5px] text-muted">{sub}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Tile shell
// ─────────────────────────────────────────────────────────────────────
function TileShell({
  href, onClick, eyebrow, title, headerRight, footer, children,
}: {
  href?: string;
  onClick?: () => void;
  eyebrow: string;
  title: string;
  headerRight?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const className =
    "group relative block h-full rounded-xl overflow-hidden transition-all hover:shadow-sm hover:-translate-y-px text-left w-full";
  const style = { background: "var(--surface)", border: "1px solid var(--line)" } as const;
  const inner = (
    <div className="p-5 h-full flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1">
            {eyebrow}
          </div>
          <div className="text-[14.5px] font-semibold text-ink leading-tight"
            style={{ letterSpacing: "-0.012em" }}>
            {title}
          </div>
        </div>
        {headerRight}
        <ArrowUpRight
          size={13}
          strokeWidth={1.8}
          className="text-muted-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2"
        />
      </div>
      <div className="flex-1 min-h-0">{children}</div>
      {footer && (
        <div className="mt-3 pt-3 border-t border-line text-[11px] text-muted">
          {footer}
        </div>
      )}
    </div>
  );
  if (href) return <Link href={href} className={className} style={style}>{inner}</Link>;
  return (
    <button type="button" onClick={onClick} className={className} style={style}>{inner}</button>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Featured agent (large) — invites the user to click and see what it does
// ─────────────────────────────────────────────────────────────────────
function FeaturedAgentTile({
  agent, installedCount, onOpen,
}: {
  agent: Agent; installedCount: number; onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative w-full h-full rounded-xl overflow-hidden text-left transition-all hover:shadow-sm hover:-translate-y-px"
      style={{
        background: "linear-gradient(135deg, rgba(38,109,240,0.08) 0%, rgba(124,58,237,0.04) 60%, rgba(38,109,240,0.02) 100%)",
        border: "1px solid rgba(38,109,240,0.18)",
      }}>
      <div className="p-5 h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: ACCENT }}>
            Agent · spotlight
          </div>
          <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold px-2 py-0.5 rounded"
            style={{ background: "var(--surface)", color: "var(--ink-2)", border: "1px solid var(--line)" }}>
            <Bot size={10} strokeWidth={2} />
            {installedCount} installed
          </span>
        </div>

        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl grid place-items-center shrink-0 relative"
            style={{
              background: "linear-gradient(135deg, rgba(38,109,240,0.18), rgba(38,109,240,0.06))",
              border: "1px solid rgba(38,109,240,0.22)",
            }}>
            <Bot size={20} strokeWidth={1.8} style={{ color: ACCENT }} />
          </div>
          <div className="min-w-0">
            <div className="text-[16px] font-semibold text-ink leading-tight mb-1"
              style={{ letterSpacing: "-0.014em" }}>
              {agent.name}
            </div>
            <div className="text-[11.5px] text-muted">{agent.role}</div>
          </div>
        </div>

        <p className="text-[12.5px] text-ink-2 leading-relaxed mb-4 max-w-xl">
          {agent.description}
        </p>

        <div className="mt-auto flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-2 rounded-lg text-white transition-transform group-hover:scale-[1.02]"
            style={{ background: ACCENT, boxShadow: "0 4px 12px -4px rgba(38,109,240,0.4)" }}>
            <Sparkles size={11} strokeWidth={2.2} />
            See it work
          </span>
          <span className="text-[11px] text-muted">Click to view the workflow + sample output</span>
        </div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Workflows tile
// ─────────────────────────────────────────────────────────────────────
function WorkflowsTile() {
  const items = [
    { name: "On champion change",  status: "Active", tone: "var(--pos)" },
    { name: "Renewal 60-day brief", status: "Active", tone: "var(--pos)" },
    { name: "Stalled deal nudge",  status: "Paused", tone: "var(--muted-2)" },
  ];
  return (
    <TileShell
      href="/workflows"
      eyebrow="Workflows"
      title="Automation rules"
      footer={`${items.filter((i) => i.status === "Active").length} active · ${items.filter((i) => i.status !== "Active").length} paused`}
    >
      <div className="space-y-1.5">
        {items.map((w) => (
          <div key={w.name}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md"
            style={{ background: "var(--bg-deep)" }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: w.tone }} />
            <span className="text-[11.5px] font-medium text-ink truncate flex-1">{w.name}</span>
            <span className="text-[10px] font-mono uppercase tracking-[0.06em] text-muted-2">{w.status}</span>
          </div>
        ))}
      </div>
    </TileShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Playbooks tile
// ─────────────────────────────────────────────────────────────────────
function PlaybooksTile() {
  const items = [
    { name: "Save play · sponsor silence", uses: 28 },
    { name: "Expansion · post-promotion",   uses: 19 },
    { name: "QBR recovery",                  uses: 12 },
  ];
  return (
    <TileShell
      href="/playbook"
      eyebrow="Playbooks"
      title="Templates"
      footer={`${items.length} live templates · ${items.reduce((s, i) => s + i.uses, 0)} runs`}
    >
      <div className="space-y-1.5">
        {items.map((p) => (
          <div key={p.name}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md"
            style={{ background: "var(--bg-deep)" }}>
            <BookOpen size={11} strokeWidth={1.8} className="text-muted-2 shrink-0" />
            <span className="text-[11.5px] font-medium text-ink truncate flex-1">{p.name}</span>
            <span className="text-[10px] font-mono tnum text-muted-2 shrink-0">{p.uses}×</span>
          </div>
        ))}
      </div>
    </TileShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Blueprints tile
// ─────────────────────────────────────────────────────────────────────
function BlueprintsTile() {
  return (
    <TileShell
      href="/blueprints"
      eyebrow="Blueprints"
      title="Account plan templates"
      footer="3 in use across segments"
    >
      <div className="space-y-1.5 h-full">
        {[
          { name: "Strategic Enterprise",  segments: "12 accts" },
          { name: "Mid-Market growth",      segments: "27 accts" },
          { name: "SMB onboarding",         segments: "44 accts" },
        ].map((b) => (
          <div key={b.name}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md"
            style={{ background: "var(--bg-deep)" }}>
            <Telescope size={11} strokeWidth={1.8} className="text-muted-2 shrink-0" />
            <span className="text-[11.5px] font-medium text-ink truncate flex-1">{b.name}</span>
            <span className="text-[10px] font-mono text-muted-2 shrink-0">{b.segments}</span>
          </div>
        ))}
      </div>
    </TileShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Integrations tile (large)
// ─────────────────────────────────────────────────────────────────────
function IntegrationsTile() {
  const connected = INTEGRATIONS.filter((i) => i.connected).length;
  return (
    <TileShell
      href="/integrations"
      eyebrow="Integrations"
      title="Connected systems"
      headerRight={
        <span className="text-[11px] font-mono tnum text-pos font-semibold"
          style={{ color: "var(--pos)" }}>
          {connected}/{INTEGRATIONS.length}
        </span>
      }
      footer={`${connected} connected · syncing every 5 min`}
    >
      <div className="grid grid-cols-4 gap-2 h-full content-start">
        {INTEGRATIONS.map((it) => (
          <div key={it.name}
            className="rounded-lg p-2.5 text-center"
            style={{
              background: it.connected ? "var(--surface)" : "var(--bg-deep)",
              border: "1px solid var(--line)",
              opacity: it.connected ? 1 : 0.55,
            }}>
            <div className="relative w-7 h-7 mx-auto mb-1.5">
              <BrandLogo name={it.name} size={28} />
              {it.connected && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                  style={{ background: "var(--pos)", boxShadow: "0 0 0 1.5px var(--surface)" }} />
              )}
            </div>
            <div className="text-[10px] font-medium text-ink-2 truncate">{it.name}</div>
          </div>
        ))}
      </div>
    </TileShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Chat tile
// ─────────────────────────────────────────────────────────────────────
function ChatTile() {
  return (
    <TileShell
      href="/analyst"
      eyebrow="Chat"
      title="Ask Alphard"
      footer="Natural-language queries · cited"
    >
      <div className="space-y-1.5 h-full">
        {[
          "Which accounts are silent this week?",
          "Top 3 expansion opportunities by ARR",
          "Forecast accuracy by rep",
        ].map((q) => (
          <div key={q}
            className="flex items-center gap-2 px-3 py-2 rounded-md"
            style={{ background: "var(--bg-deep)" }}>
            <MessageSquare size={10} strokeWidth={1.8} className="text-muted-2 shrink-0" />
            <span className="text-[11.5px] text-ink-2 truncate flex-1">"{q}"</span>
          </div>
        ))}
      </div>
    </TileShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Requests tile (CSM-only)
// ─────────────────────────────────────────────────────────────────────
function RequestsTile() {
  return (
    <TileShell
      href="/requests"
      eyebrow="Requests"
      title="Customer-initiated"
      footer="3 open · 2 in progress · 5 resolved this week"
    >
      <div className="space-y-1.5 h-full">
        {[
          { account: "Cloudflare", title: "API rate-limit increase", status: "Open" },
          { account: "GitLab",     title: "SSO with Okta",            status: "In progress" },
          { account: "Tableau",    title: "ML governance docs",       status: "Open" },
        ].map((r) => (
          <div key={r.title}
            className="flex items-center gap-2 px-3 py-2 rounded-md"
            style={{ background: "var(--bg-deep)" }}>
            <MessageSquarePlus size={10} strokeWidth={1.8} className="text-muted-2 shrink-0" />
            <span className="text-[11px] font-semibold text-ink-2 shrink-0">{r.account}</span>
            <span className="text-[11px] text-muted truncate flex-1">{r.title}</span>
            <span className="text-[9.5px] font-medium px-1.5 py-0.5 rounded shrink-0"
              style={{
                background: r.status === "Open" ? "var(--warn-soft)" : "var(--info-soft)",
                color: r.status === "Open" ? "var(--warn)" : "var(--info)",
              }}>
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </TileShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Profile tile
// ─────────────────────────────────────────────────────────────────────
function ProfileTile() {
  const { user } = useUser();
  return (
    <TileShell
      href="/settings"
      eyebrow="Profile"
      title="You & your workspace"
      footer="Sign-in & sign-out controls"
    >
      <div className="flex items-center gap-3 h-full">
        <PersonAvatar name={user.name} size={48} />
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-ink truncate">{user.name}</div>
          <div className="text-[11.5px] text-muted truncate">{user.email || "demo@alphard.global"}</div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{ background: "var(--bg-deep)", color: "var(--ink-2)" }}>
              Light theme
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{ background: "var(--bg-deep)", color: "var(--ink-2)" }}>
              English
            </span>
          </div>
        </div>
      </div>
    </TileShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Notifications tile
// ─────────────────────────────────────────────────────────────────────
function NotificationsTile() {
  return (
    <TileShell
      href="/settings"
      eyebrow="Notifications"
      title="Where alerts land"
      footer="3 channels active"
    >
      <div className="space-y-2 h-full justify-center flex flex-col">
        {[
          { label: "In-app",        on: true },
          { label: "Slack DM",      on: true },
          { label: "Email digest",  on: true },
          { label: "Mobile push",   on: false },
        ].map((c) => (
          <div key={c.label} className="flex items-center justify-between">
            <span className="text-[11.5px] text-ink-2">{c.label}</span>
            <span
              className="w-7 h-4 rounded-full relative transition-colors shrink-0"
              style={{ background: c.on ? ACCENT : "var(--bg-deep)" }}>
              <span className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all"
                style={{ left: c.on ? "calc(100% - 14px)" : "2px" }} />
            </span>
          </div>
        ))}
      </div>
    </TileShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// API keys tile
// ─────────────────────────────────────────────────────────────────────
function ApiKeysTile() {
  return (
    <TileShell
      href="/settings"
      eyebrow="API"
      title="Programmatic access"
      footer="2 keys · last rotated 14 days ago"
    >
      <div className="space-y-1.5 h-full">
        {[
          { name: "Production", scope: "read · write" },
          { name: "Webhook",    scope: "events" },
        ].map((k) => (
          <div key={k.name}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md"
            style={{ background: "var(--bg-deep)" }}>
            <KeyRound size={11} strokeWidth={1.8} className="text-muted-2 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[11.5px] font-semibold text-ink truncate">{k.name}</div>
              <div className="text-[10px] font-mono text-muted-2 truncate">sk_live_•••••••</div>
            </div>
            <span className="text-[9.5px] font-medium px-1.5 py-0.5 rounded shrink-0"
              style={{ background: "var(--surface)", color: "var(--ink-2)", border: "1px solid var(--line)" }}>
              {k.scope}
            </span>
          </div>
        ))}
      </div>
    </TileShell>
  );
}
