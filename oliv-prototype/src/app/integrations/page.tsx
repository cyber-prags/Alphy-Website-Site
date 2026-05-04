"use client";

import { useState, useMemo } from "react";
import {
  Search, RefreshCw, Plus, Settings2, ExternalLink, Check, AlertTriangle, Loader2, Power,
  ToggleLeft, ToggleRight,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { integrations, type Integration, type IntegrationStatus, type IntegrationCategory } from "@/lib/mock";
import { Logo } from "@/components/Logo";
import { useToast } from "@/components/Toast";

const STATUS_META: Record<IntegrationStatus, { label: string; bg: string; ink: string; Icon: typeof Check }> = {
  connected: { label: "Connected", bg: "var(--pos-soft)",  ink: "var(--pos)",  Icon: Check },
  syncing:   { label: "Syncing",   bg: "var(--accent-soft)",ink: "var(--accent-deep)", Icon: Loader2 },
  error:     { label: "Error",     bg: "var(--neg-soft)",  ink: "var(--neg)",  Icon: AlertTriangle },
  disabled:  { label: "Disabled",  bg: "var(--bg-deep)",   ink: "var(--muted)",Icon: Power },
};

const CAT_ORDER: IntegrationCategory[] = [
  "CRM", "Calendar & Email", "Conversations", "Product Analytics",
  "Hiring & Org", "Messaging", "Support", "Warehouse", "SSO",
];

const CAT_ICON_BG: Record<string, string> = {
  "CRM": "#3B82F6",
  "Calendar & Email": "#F59E0B",
  "Conversations": "#10B981",
  "Product Analytics": "#8B5CF6",
  "Hiring & Org": "#EC4899",
  "Messaging": "#06B6D4",
  "Support": "#EF4444",
  "Warehouse": "#6366F1",
  "SSO": "#6B7280",
};

export default function IntegrationsPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | IntegrationStatus>("all");

  const filtered = useMemo(() => {
    const lc = search.trim().toLowerCase();
    return integrations
      .filter((i) => filter === "all" || i.status === filter)
      .filter((i) => !lc || `${i.name} ${i.vendor} ${i.category} ${i.description}`.toLowerCase().includes(lc));
  }, [search, filter]);

  const counts = {
    all:        integrations.length,
    connected:  integrations.filter((i) => i.status === "connected").length,
    syncing:    integrations.filter((i) => i.status === "syncing").length,
    error:      integrations.filter((i) => i.status === "error").length,
    disabled:   integrations.filter((i) => i.status === "disabled").length,
  };

  const grouped = useMemo(() => {
    const out: Record<string, Integration[]> = {};
    filtered.forEach((i) => { if (!out[i.category]) out[i.category] = []; out[i.category].push(i); });
    return out;
  }, [filtered]);

  return (
    <AppShell>
      {/* Clean_1 header — minimal, generous spacing */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[24px] font-bold text-ink tracking-tight">Integrations</h1>
            <p className="text-[13px] text-muted mt-1">Connect your tools to power signals, health scores, and automation.</p>
          </div>
          <button onClick={() => toast({ tone: "info", title: "Add integration", body: "Connector marketplace would open here." })}
            className="text-[12px] font-semibold h-9 px-4 rounded-lg inline-flex items-center gap-2 shadow-[0_4px_12px_-4px_rgba(168,224,32,0.45)]"
            style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
            <Plus size={13} strokeWidth={2} /> Add integration
          </button>
        </div>

        {/* Status pills — Clean_1 style minimal counters */}
        <div className="flex items-center gap-2 mb-5">
          {([
            { id: "all" as const,       label: "All",       count: counts.all },
            { id: "connected" as const, label: "Connected", count: counts.connected },
            { id: "syncing" as const,   label: "Syncing",   count: counts.syncing },
            { id: "error" as const,     label: "Errors",    count: counts.error },
            { id: "disabled" as const,  label: "Disabled",  count: counts.disabled },
          ]).map((s) => (
            <button key={s.id} onClick={() => setFilter(s.id)}
              className={`text-[11.5px] font-medium h-8 px-3 rounded-lg inline-flex items-center gap-1.5 transition-all ${
                filter === s.id
                  ? "text-ink bg-surface-2 ring-1 ring-line"
                  : "text-muted hover:text-ink hover:bg-bg-deep"
              }`}>
              {s.label}
              <span className="text-[10px] font-mono tnum px-1.5 py-0.5 rounded-md bg-bg-deep text-muted">{s.count}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="flex-1 max-w-md flex items-center gap-2 h-10 px-3.5 rounded-xl border border-line bg-surface">
            <Search size={14} strokeWidth={1.6} className="text-muted-2" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search integrations..."
              className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-muted-2" />
          </div>
          <button onClick={() => toast({ tone: "info", title: "Refreshing all connectors..." })}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-line bg-surface text-[12px] font-medium text-ink-2 hover:bg-bg-deep transition-colors">
            <RefreshCw size={12} strokeWidth={1.8} className="text-muted" /> Refresh all
          </button>
        </div>
      </div>

      {/* Category-grouped card grids — Clean_1 style */}
      <div className="space-y-8">
        {CAT_ORDER.filter((c) => grouped[c]?.length).map((cat) => (
          <div key={cat}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-6 h-6 rounded-lg grid place-items-center"
                style={{ background: `${CAT_ICON_BG[cat] ?? "#6B7280"}20` }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: CAT_ICON_BG[cat] ?? "#6B7280" }} />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-2">{cat}</span>
              <span className="text-[10px] text-muted-2">{grouped[cat].length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {grouped[cat].map((i) => <IntegrationCard key={i.id} integration={i} />)}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card p-10 text-center text-[12.5px] text-muted">
            No integrations match. <button onClick={() => { setFilter("all"); setSearch(""); }} className="text-ink underline">Clear filters</button>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function IntegrationCard({ integration }: { integration: Integration }) {
  const toast = useToast();
  const m = STATUS_META[integration.status];
  const isActive = integration.status === "connected" || integration.status === "syncing";

  return (
    <div className="rounded-xl border border-line bg-surface p-4 flex flex-col gap-3 hover:bg-surface-2 transition-colors group">
      <div className="flex items-start gap-3">
        {/* Icon with colored background — Clean_1 style */}
        <div className="w-10 h-10 rounded-xl grid place-items-center shrink-0"
          style={{ background: isActive ? `${CAT_ICON_BG[integration.category] ?? "#6B7280"}15` : "var(--bg-deep)" }}>
          <Logo name={integration.vendor} size={24} rounded={4} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-ink truncate">{integration.name}</div>
          <div className="text-[11px] text-muted leading-snug mt-0.5 line-clamp-1">{integration.description}</div>
        </div>

        {/* Toggle switch — Clean_1 style */}
        <button
          onClick={() => toast({ tone: "info", title: isActive ? `Disconnecting ${integration.name}...` : `Connecting ${integration.name}...` })}
          className="shrink-0 mt-0.5"
          title={isActive ? "Disconnect" : "Connect"}>
          {isActive
            ? <ToggleRight size={22} strokeWidth={1.6} style={{ color: "var(--accent-deep)" }} />
            : <ToggleLeft size={22} strokeWidth={1.6} className="text-muted-2" />
          }
        </button>
      </div>

      {/* Status + sync info — minimal row */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 h-5 px-1.5 rounded text-[9.5px] font-semibold"
          style={{ background: m.bg, color: m.ink }}>
          <m.Icon size={9} strokeWidth={2} className={integration.status === "syncing" ? "animate-spin" : ""} />
          {m.label}
        </span>
        {integration.status !== "disabled" && (
          <>
            <span className="text-[10px] text-muted-2">Last sync: {integration.lastSync}</span>
            <span className="text-[10px] text-muted-2 ml-auto tnum">{integration.recordCount.toLocaleString()} records</span>
          </>
        )}
      </div>

      {/* Feeds — what this integration powers */}
      {integration.feeds.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {integration.feeds.map((f) => (
            <span key={f} className="text-[9.5px] font-medium px-1.5 py-0.5 rounded-md bg-bg-deep text-muted">{f}</span>
          ))}
        </div>
      )}

      {/* Actions row — Clean_1 style: subtle, only on hover for connected */}
      <div className="flex items-center gap-1.5 pt-2 mt-auto border-t border-line">
        {integration.status === "error" && (
          <button onClick={() => toast({ tone: "success", title: `Reconnected ${integration.name}` })}
            className="text-[11px] font-semibold h-7 px-3 rounded-lg flex-1 inline-flex items-center justify-center gap-1.5"
            style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
            Reconnect
          </button>
        )}
        {integration.status === "disabled" && (
          <button onClick={() => toast({ tone: "success", title: `Connecting ${integration.name}...` })}
            className="text-[11px] font-semibold h-7 px-3 rounded-lg flex-1 inline-flex items-center justify-center gap-1.5"
            style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
            Connect
          </button>
        )}
        {isActive && (
          <>
            <button onClick={() => toast({ tone: "info", title: `Syncing ${integration.name}...` })}
              className="text-[11px] font-medium h-7 px-2.5 rounded-lg flex-1 inline-flex items-center justify-center gap-1.5 border border-line bg-surface hover:bg-bg-deep transition-colors">
              <RefreshCw size={10} strokeWidth={1.8} /> Sync now
            </button>
            <button onClick={() => toast({ tone: "info", title: `${integration.name} settings` })}
              className="text-[11px] font-medium h-7 w-7 rounded-lg grid place-items-center border border-line bg-surface hover:bg-bg-deep transition-colors">
              <Settings2 size={11} strokeWidth={1.6} />
            </button>
          </>
        )}
        <button onClick={() => toast({ tone: "info", title: `${integration.name} docs` })}
          className="text-[11px] font-medium h-7 w-7 rounded-lg grid place-items-center text-muted hover:text-ink transition-colors">
          <ExternalLink size={11} strokeWidth={1.6} />
        </button>
      </div>
    </div>
  );
}
