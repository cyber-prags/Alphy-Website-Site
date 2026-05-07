"use client";

import { useMemo, useState } from "react";
import { Search, Sparkles, ArrowUp, Eye, Copy, Bot } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { agents as initialAgents, type Agent } from "@/lib/mock";
import { useToast } from "@/components/Toast";
import { AgentDetail } from "@/components/AgentDetail";

const agents = initialAgents;

const FILTERS: { id: "all" | "ours" | "sales" | "ops" | "cs"; label: string }[] = [
  { id: "all",   label: "All" },
  { id: "ours",  label: "Our Agents" },
  { id: "cs",    label: "Customer Success" },
  { id: "sales", label: "Sales" },
  { id: "ops",   label: "Revenue Operations" },
];

export default function AgentsPage() {
  const toast = useToast();
  const [filter, setFilter] = useState<"all" | "ours" | "sales" | "ops" | "cs">("all");
  const [search, setSearch] = useState("");
  const [prompt, setPrompt] = useState("");
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [installState, setInstallState] = useState<Record<string, boolean>>(
    () => Object.fromEntries(agents.map((a) => [a.id, a.installed]))
  );
  const submitPrompt = () => {
    if (!prompt.trim()) return;
    toast({ tone: "success", title: "Agent generated", body: `Drafting "${prompt.slice(0, 60)}…" — review and install.` });
    setPrompt("");
  };

  const filtered = useMemo(() => {
    const lc = search.trim().toLowerCase();
    return agents.filter((a) => {
      if (filter === "ours"  && !a.ours) return false;
      if (filter === "sales" && a.role !== "Sales") return false;
      if (filter === "ops"   && a.role !== "Revenue Operations") return false;
      if (filter === "cs"    && a.role !== "Customer Success") return false;
      if (lc && !`${a.name} ${a.description}`.toLowerCase().includes(lc)) return false;
      return true;
    });
  }, [filter, search]);

  return (
    <AppShell>
      <div className="mb-5">
        <div className="mono-label mb-1.5">Agents</div>
        <h1 className="display" style={{ fontSize: 22 }}>Agents</h1>
        <div className="text-[12.5px] text-muted mt-1">A roster of named AI agents that drive deals forward — and a builder to create your own.</div>
      </div>

      {/* Builder card */}
      <div className="card-accent p-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md grid place-items-center" style={{ background: "var(--accent)", color: "white" }}>
            <Sparkles size={16} strokeWidth={1.8} />
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-semibold text-ink mb-1.5">Build a new agent from a prompt</div>
            <div className="bg-surface border border-line rounded-md flex items-center gap-2 p-1.5">
              <input
                value={prompt} onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submitPrompt(); }}
                placeholder="e.g. an agent that nudges me when a champion goes silent for 7+ days…"
                className="flex-1 bg-transparent outline-none text-[12.5px] px-2 placeholder:text-muted-2" />
              <button onClick={submitPrompt} disabled={!prompt.trim()}
                className="w-7 h-7 rounded grid place-items-center text-white disabled:opacity-50"
                style={{ background: "var(--accent)" }}>
                <ArrowUp size={13} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {FILTERS.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={`pill-nav-item ${filter === f.id ? "active" : ""}`}>
            {f.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 h-9 w-72 px-3 rounded-lg border border-line bg-surface">
          <Search size={13} strokeWidth={1.6} className="text-muted-2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…"
                 className="flex-1 bg-transparent outline-none text-[12.5px] placeholder:text-muted-2" />
        </div>
      </div>

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

      {/* Agent count footer — confirms full library is visible */}
      <div className="text-center text-[11px] text-muted-2 pb-4">
        Showing {filtered.length} of {agents.length} agents
        {filter !== "all" && (
          <> · <button onClick={() => setFilter("all")} className="text-ink-2 hover:text-ink underline">show all</button></>
        )}
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

function AgentCard({ agent, onView }: { agent: Agent; onView: () => void }) {
  return (
    <button
      type="button"
      onClick={onView}
      className="card p-4 flex flex-col hover:bg-surface-2 hover:-translate-y-px hover:shadow-sm transition-all text-left">
      <div className="flex items-start justify-between mb-2.5">
        <div className="w-8 h-8 rounded-md grid place-items-center relative"
             style={{ background: agent.ours ? "var(--accent-soft)" : "var(--bg-deep)" }}>
          <Bot size={14} strokeWidth={1.6} style={{ color: agent.ours ? "var(--accent)" : "var(--muted)" }} />
          {agent.installed && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
              style={{ background: "var(--pos)", boxShadow: "0 0 0 1.5px var(--surface)" }} />
          )}
        </div>
        {agent.ours && (
          <span className="text-[9px] font-semibold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded"
            style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
            Native
          </span>
        )}
      </div>
      <h3 className="text-[13.5px] font-semibold text-ink mb-1 leading-tight">{agent.name}</h3>
      <div className="text-[12px] text-muted leading-relaxed flex-1">{agent.description}</div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-line">
        <span className="text-[10.5px] font-medium text-muted">{agent.role}</span>
        <span
          className={`text-[11px] font-medium inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md ${
            agent.installed ? "border border-line bg-surface text-ink-2" : "bg-ink text-white"
          }`}
        >
          {agent.installed ? <><Eye size={11} strokeWidth={1.8} /> View</> : <><Copy size={11} strokeWidth={1.8} /> Clone</>}
        </span>
      </div>
    </button>
  );
}
