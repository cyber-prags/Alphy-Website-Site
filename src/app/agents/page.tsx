"use client";

import { useMemo, useState } from "react";
import {
  Search, ArrowUp, Eye, Copy, Plus, Sparkles,
  // Kind-specific icons
  Network, RefreshCw, Calendar, Database, Mail, MessageSquareWarning,
  FileText, Crown, Sword, Brush, LineChart, Library,
  ShieldCheck, Activity, Target, Presentation, Radio,
  UserCog, UserCheck, Users, TrendingUp, AlertTriangle, Award,
  Rocket,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { agents as initialAgents, type Agent, type AgentKind, type AgentPersona } from "@/lib/mock";
import { useToast } from "@/components/Toast";
import { AgentDetail } from "@/components/AgentDetail";
import { usePersona } from "@/components/PersonaContext";

const ACCENT = "#266DF0";

// ─────────────────────────────────────────────────────────────────────
// Kind → modern icon + tinted bg pair
// ─────────────────────────────────────────────────────────────────────
const KIND_META: Record<AgentKind, { Icon: any; tint: string; soft: string }> = {
  multithread: { Icon: Network,              tint: "#266DF0", soft: "rgba(38,109,240,0.10)" },
  revive:      { Icon: RefreshCw,            tint: "#10B981", soft: "rgba(16,185,129,0.12)" },
  prep:        { Icon: Calendar,             tint: "#7C3AED", soft: "rgba(124,58,237,0.10)" },
  enrich:      { Icon: Database,             tint: "#06B6D4", soft: "rgba(6,182,212,0.10)" },
  followup:    { Icon: Mail,                 tint: "#F59E0B", soft: "rgba(245,158,11,0.12)" },
  objection:   { Icon: MessageSquareWarning, tint: "#EF4444", soft: "rgba(239,68,68,0.10)" },
  proposal:    { Icon: FileText,             tint: "#8B5CF6", soft: "rgba(139,92,246,0.10)" },
  exec:        { Icon: Crown,                tint: "#D97706", soft: "rgba(217,119,6,0.12)" },
  battlecard:  { Icon: Sword,                tint: "#475569", soft: "rgba(71,85,105,0.10)" },
  hygiene:     { Icon: Brush,                tint: "#0EA5E9", soft: "rgba(14,165,233,0.10)" },
  forecast:    { Icon: LineChart,            tint: "#266DF0", soft: "rgba(38,109,240,0.10)" },
  content:     { Icon: Library,              tint: "#0891B2", soft: "rgba(8,145,178,0.10)" },
  renewal:     { Icon: ShieldCheck,          tint: "#10B981", soft: "rgba(16,185,129,0.12)" },
  adoption:    { Icon: Activity,             tint: "#F59E0B", soft: "rgba(245,158,11,0.12)" },
  outcomes:    { Icon: Target,               tint: "#266DF0", soft: "rgba(38,109,240,0.10)" },
  qbr:         { Icon: Presentation,         tint: "#8B5CF6", soft: "rgba(139,92,246,0.10)" },
  signals:     { Icon: Radio,                tint: "#7C3AED", soft: "rgba(124,58,237,0.10)" },
  coaching:    { Icon: UserCog,              tint: "#0891B2", soft: "rgba(8,145,178,0.10)" },
  capacity:    { Icon: Users,                tint: "#475569", soft: "rgba(71,85,105,0.10)" },
  stakeholder: { Icon: Network,              tint: "#266DF0", soft: "rgba(38,109,240,0.10)" },
  expansion:   { Icon: TrendingUp,           tint: "#10B981", soft: "rgba(16,185,129,0.12)" },
  champion:    { Icon: UserCheck,            tint: "#7C3AED", soft: "rgba(124,58,237,0.10)" },
  tickets:     { Icon: AlertTriangle,        tint: "#EF4444", soft: "rgba(239,68,68,0.10)" },
  advocacy:    { Icon: Award,                tint: "#F59E0B", soft: "rgba(245,158,11,0.12)" },
  onboarding:  { Icon: Rocket,               tint: "#06B6D4", soft: "rgba(6,182,212,0.10)" },
};

// ─────────────────────────────────────────────────────────────────────
// Persona filter pills — primary navigation for the marketplace
// ─────────────────────────────────────────────────────────────────────
type FilterId = "all" | "for-you" | AgentPersona | "ours";

const PERSONA_LABEL_FULL: Record<AgentPersona, string> = {
  ae: "Account Executive",
  am: "Account Manager",
  csm: "Customer Success",
  manager: "Sales / CS Leader",
};

export default function AgentsPage() {
  const toast = useToast();
  const { persona } = usePersona();

  const [filter, setFilter] = useState<FilterId>("for-you");
  const [search, setSearch] = useState("");
  const [prompt, setPrompt] = useState("");
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [installState, setInstallState] = useState<Record<string, boolean>>(
    () => Object.fromEntries(initialAgents.map((a) => [a.id, a.installed]))
  );

  const submitPrompt = () => {
    if (!prompt.trim()) return;
    toast({ tone: "success", title: "Agent generated", body: `Drafting "${prompt.slice(0, 60)}…" — review and install.` });
    setPrompt("");
  };

  const filtered = useMemo(() => {
    const lc = search.trim().toLowerCase();
    return initialAgents.filter((a) => {
      if (filter === "ours" && !a.ours) return false;
      if (filter === "for-you" && !a.personas.includes(persona)) return false;
      if (filter === "ae" || filter === "am" || filter === "csm" || filter === "manager") {
        if (!a.personas.includes(filter as AgentPersona)) return false;
      }
      if (lc && !`${a.name} ${a.description} ${a.useCase ?? ""}`.toLowerCase().includes(lc)) return false;
      return true;
    });
  }, [filter, search, persona]);

  // Counts for badges
  const counts = useMemo(() => ({
    all:     initialAgents.length,
    forYou:  initialAgents.filter((a) => a.personas.includes(persona)).length,
    ae:      initialAgents.filter((a) => a.personas.includes("ae")).length,
    am:      initialAgents.filter((a) => a.personas.includes("am")).length,
    csm:     initialAgents.filter((a) => a.personas.includes("csm")).length,
    manager: initialAgents.filter((a) => a.personas.includes("manager")).length,
    ours:    initialAgents.filter((a) => a.ours).length,
  }), [persona]);

  const FILTERS: { id: FilterId; label: string; count: number }[] = [
    { id: "for-you", label: "For you",  count: counts.forYou },
    { id: "all",     label: "All",       count: counts.all },
    { id: "ours",    label: "Native",    count: counts.ours },
    { id: "ae",      label: "AE",        count: counts.ae },
    { id: "am",      label: "AM",        count: counts.am },
    { id: "csm",     label: "CSM",       count: counts.csm },
    { id: "manager", label: "Manager",   count: counts.manager },
  ];

  return (
    <AppShell>
      {/* Header */}
      <header className="mb-6 max-w-3xl">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1.5">
          Agents · marketplace
        </div>
        <h1 className="text-[26px] font-semibold text-ink leading-tight"
          style={{ letterSpacing: "-0.022em" }}>
          A roster of AI agents that work your book while you sleep.
        </h1>
        <p className="text-[13px] text-muted leading-relaxed mt-2">
          Each agent watches a specific surface, fires on its own trigger, and lands its
          output where you'll see it — your home page, inbox, or the right account.
        </p>
      </header>

      {/* Builder card — clean accent gradient instead of pure blue */}
      <div className="rounded-2xl p-5 mb-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(38,109,240,0.10), rgba(124,58,237,0.06))",
          border: "1px solid rgba(38,109,240,0.20)",
        }}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg grid place-items-center shrink-0"
            style={{ background: ACCENT, boxShadow: "0 4px 12px -4px rgba(38,109,240,0.4)" }}>
            <Sparkles size={15} strokeWidth={2} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold text-ink mb-1.5">
              Build a custom agent from a prompt
            </div>
            <div className="rounded-lg flex items-center gap-2 p-1.5"
              style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submitPrompt(); }}
                placeholder="e.g. an agent that nudges me when a champion goes silent for 7+ days…"
                className="flex-1 bg-transparent outline-none text-[12.5px] px-2 placeholder:text-muted-2"
              />
              <button
                onClick={submitPrompt}
                disabled={!prompt.trim()}
                className="w-7 h-7 rounded grid place-items-center transition-all disabled:opacity-40"
                style={{ background: prompt.trim() ? "var(--ink)" : "var(--bg-deep)", color: prompt.trim() ? "white" : "var(--muted-2)" }}>
                <ArrowUp size={12} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter pills + search */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-1 p-1 rounded-lg"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className="text-[11.5px] font-medium px-2.5 py-1.5 rounded transition-colors inline-flex items-center gap-1.5"
                style={{
                  background: active ? "var(--ink)" : "transparent",
                  color: active ? "white" : "var(--muted)",
                }}
              >
                {f.label}
                <span className="text-[10px] font-mono tnum"
                  style={{ opacity: active ? 0.7 : 0.6 }}>
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-1.5 h-9 w-72 px-2.5 rounded-lg"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          <Search size={12} strokeWidth={1.8} className="text-muted-2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents…"
            className="flex-1 bg-transparent outline-none text-[12px] placeholder:text-muted-2"
          />
        </div>
      </div>

      {/* Persona context banner — only when "For you" is active */}
      {filter === "for-you" && (
        <div className="text-[11.5px] text-muted mb-3">
          Showing agents recommended for{" "}
          <span className="font-semibold text-ink-2">{PERSONA_LABEL_FULL[persona]}</span>.
          Switch tabs to browse the full library.
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 auto-rows-fr pb-6">
        {filtered.map((a) => (
          <AgentCard
            key={a.id}
            agent={{ ...a, installed: installState[a.id] ?? a.installed }}
            onView={() => setActiveAgent({ ...a, installed: installState[a.id] ?? a.installed })}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-[12px] text-muted">
          No agents match these filters. <button onClick={() => { setFilter("all"); setSearch(""); }}
            className="text-ink hover:underline">Clear filters</button>
        </div>
      )}

      <div className="text-center text-[11px] text-muted-2 pb-4">
        Showing {filtered.length} of {initialAgents.length} agents
      </div>

      <AgentDetail
        agent={activeAgent}
        onClose={() => setActiveAgent(null)}
        onToggleInstall={(id, installed) => {
          setInstallState((s) => ({ ...s, [id]: installed }));
          setActiveAgent((a) => (a && a.id === id ? { ...a, installed } : a));
          toast({
            tone: "success",
            title: installed ? "Agent installed" : "Agent uninstalled",
            body: installed
              ? "It will start running on the next trigger."
              : "Removed from your roster.",
          });
        }}
      />
    </AppShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Agent card — kind-specific icon, real use case, persona pills
// ─────────────────────────────────────────────────────────────────────
function AgentCard({ agent, onView }: { agent: Agent; onView: () => void }) {
  const meta = KIND_META[agent.kind];
  const Icon = meta.Icon;
  return (
    <button
      type="button"
      onClick={onView}
      className="group rounded-xl p-4 flex flex-col text-left transition-all hover:shadow-sm hover:-translate-y-px"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
      }}>
      {/* Header — icon + native badge */}
      <div className="flex items-start justify-between mb-2.5">
        <div className="w-10 h-10 rounded-lg grid place-items-center relative"
          style={{ background: meta.soft }}>
          <Icon size={17} strokeWidth={1.6} style={{ color: meta.tint }} />
          {agent.installed && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
              style={{ background: "var(--pos)", boxShadow: "0 0 0 2px var(--surface)" }} />
          )}
        </div>
        {agent.ours && (
          <span className="text-[9px] font-semibold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded"
            style={{ background: "var(--accent-soft)", color: "var(--accent-deep)" }}>
            Native
          </span>
        )}
      </div>

      {/* Name */}
      <h3 className="text-[13.5px] font-semibold text-ink leading-tight mb-1"
        style={{ letterSpacing: "-0.005em" }}>
        {agent.name}
      </h3>

      {/* Description */}
      <p className="text-[11.5px] text-muted leading-relaxed flex-1 mb-2.5">
        {agent.description}
      </p>

      {/* Use case (italic, dimmer) */}
      {agent.useCase && (
        <div className="text-[10.5px] text-muted-2 leading-snug mb-3 italic"
          style={{ borderLeft: `2px solid ${meta.tint}33`, paddingLeft: 7 }}>
          {agent.useCase}
        </div>
      )}

      {/* Persona pills */}
      <div className="flex items-center gap-1 flex-wrap mb-3">
        {agent.personas.slice(0, 4).map((p) => (
          <span key={p}
            className="text-[9px] font-mono uppercase tracking-[0.06em] px-1.5 py-0.5 rounded"
            style={{ background: "var(--bg-deep)", color: "var(--ink-2)" }}>
            {p === "ae" ? "AE" : p === "am" ? "AM" : p === "csm" ? "CSM" : "MGR"}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-line">
        <span className="text-[10.5px] font-medium text-muted">{agent.role}</span>
        <span
          className={`text-[11px] font-medium inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md ${
            agent.installed ? "bg-surface text-ink-2" : "text-white"
          }`}
          style={{
            background: agent.installed ? "var(--bg-deep)" : "var(--ink)",
            border: agent.installed ? "1px solid var(--line)" : "none",
          }}
        >
          {agent.installed ? <><Eye size={11} strokeWidth={1.8} /> View</> : <><Copy size={11} strokeWidth={1.8} /> Clone</>}
        </span>
      </div>
    </button>
  );
}
