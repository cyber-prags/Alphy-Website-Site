"use client";

import { useState, useMemo } from "react";
import {
  Search, Plus, Settings2, MoreHorizontal, ExternalLink, Check, AlertTriangle, Loader2, Power,
  X, RefreshCw, Clock, Database, ArrowRight, Shield, Zap, Activity,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { integrations, type Integration, type IntegrationStatus, type IntegrationCategory } from "@/lib/mock";
import { Logo } from "@/components/Logo";
import { BrandLogo } from "@/components/BrandLogo";
import { useToast } from "@/components/Toast";

const STATUS_META: Record<IntegrationStatus, { label: string; bg: string; ink: string; Icon: typeof Check }> = {
  connected: { label: "Connected", bg: "var(--pos-soft)",  ink: "var(--pos)",  Icon: Check },
  syncing:   { label: "Syncing",   bg: "var(--accent-soft)",ink: "var(--accent-deep)", Icon: Loader2 },
  error:     { label: "Error",     bg: "var(--neg-soft)",  ink: "var(--neg)",  Icon: AlertTriangle },
  disabled:  { label: "Disabled",  bg: "var(--bg-deep)",   ink: "var(--muted)",Icon: Power },
};

const TAB_CATEGORIES: { label: string; match: IntegrationCategory[] }[] = [
  { label: "All", match: [] },
  { label: "Calendar & Email", match: ["Calendar & Email"] },
  { label: "CRM", match: ["CRM"] },
  { label: "Conversations", match: ["Conversations"] },
  { label: "Analytics", match: ["Product Analytics"] },
  { label: "Communication", match: ["Messaging"] },
  { label: "Support", match: ["Support"] },
  { label: "Infrastructure", match: ["Warehouse", "SSO", "Hiring & Org"] },
];

const AVAILABLE_CONNECTORS = [
  { name: "Jira",        vendor: "Jira",        category: "Project & Task",   description: "Sync issues, sprints, and project boards." },
  { name: "Asana",       vendor: "Asana",       category: "Project & Task",   description: "Task and project management integration." },
  { name: "Notion",      vendor: "Notion",      category: "Project & Task",   description: "Sync docs, databases, and wikis." },
  { name: "Zoom",        vendor: "Zoom",        category: "Online Meeting",   description: "AI-powered meeting transcriptions & summaries." },
  { name: "GitHub",      vendor: "GitHub",      category: "Development",      description: "Repository activity, PRs, and deployment signals." },
  { name: "Segment",     vendor: "Segment",     category: "Data Platform",    description: "Customer data platform with event streaming." },
  { name: "Datadog",     vendor: "Datadog",     category: "Monitoring",       description: "Infrastructure monitoring and alerting." },
  { name: "Airtable",    vendor: "Airtable",    category: "Data Platform",    description: "Flexible database and spreadsheet hybrid." },
];

const DETAIL_SYNC_LOG = [
  { time: "2 min ago",  status: "success", records: 142,  duration: "3.2s" },
  { time: "17 min ago", status: "success", records: 89,   duration: "2.1s" },
  { time: "32 min ago", status: "success", records: 216,  duration: "4.8s" },
  { time: "47 min ago", status: "warning", records: 31,   duration: "1.4s" },
  { time: "1h ago",     status: "success", records: 178,  duration: "3.9s" },
];

export default function IntegrationsPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [detailOpen, setDetailOpen] = useState<Integration | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    const lc = search.trim().toLowerCase();
    const tab = TAB_CATEGORIES.find(t => t.label === activeTab);
    return integrations
      .filter(i => activeTab === "All" || (tab?.match ?? []).includes(i.category))
      .filter(i => !lc || `${i.name} ${i.vendor} ${i.category} ${i.description}`.toLowerCase().includes(lc));
  }, [search, activeTab]);

  return (
    <AppShell>
      <div className="mb-6">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-[22px] font-semibold text-ink" style={{ letterSpacing: "-0.02em" }}>Integrations</h1>
            <p className="text-[13px] text-muted mt-1.5 max-w-md">
              Seamlessly sync your meeting notes, action items, and insights with your favorite tools.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 h-10 px-3.5 rounded-xl border border-line bg-surface w-[240px]">
              <Search size={14} strokeWidth={1.6} className="text-muted-2 shrink-0" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search integrations..."
                className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-muted-2" />
            </div>
            <button onClick={() => setAddOpen(true)}
              className="text-[12.5px] font-semibold h-10 px-5 rounded-xl inline-flex items-center gap-2 whitespace-nowrap"
              style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
              Add a custom integration <Plus size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-6 border-b border-line pb-px overflow-x-auto">
        {TAB_CATEGORIES.map(tab => (
          <button key={tab.label} onClick={() => setActiveTab(tab.label)}
            className={`text-[13px] font-medium px-4 py-2.5 whitespace-nowrap transition-colors relative ${
              activeTab === tab.label ? "text-accent-deep" : "text-muted hover:text-ink"
            }`}>
            {tab.label}
            {activeTab === tab.label && (
              <span className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full" style={{ background: "var(--accent-deep)" }} />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(i => (
          <IntegrationCard key={i.id} integration={i} onDetail={() => setDetailOpen(i)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-10 text-center text-[12.5px] text-muted mt-4">
          No integrations match. <button onClick={() => { setActiveTab("All"); setSearch(""); }} className="text-ink underline">Clear filters</button>
        </div>
      )}

      {detailOpen && <DetailModal integration={detailOpen} onClose={() => setDetailOpen(null)} />}
      {addOpen && <AddIntegrationModal onClose={() => setAddOpen(false)} />}
    </AppShell>
  );
}

function IntegrationCard({ integration, onDetail }: { integration: Integration; onDetail: () => void }) {
  const toast = useToast();
  const [enabled, setEnabled] = useState(integration.status === "connected" || integration.status === "syncing");
  const m = STATUS_META[integration.status];

  return (
    <div className="rounded-xl border border-line bg-surface p-5 flex flex-col transition-colors hover:border-line-strong">
      <div className="flex items-start justify-between mb-4">
        <div className="shrink-0">
          <BrandLogo name={integration.vendor} size={44} />
        </div>
        <button onClick={() => toast({ tone: "info", title: `${integration.name} options` })}
          className="w-8 h-8 rounded-lg grid place-items-center text-muted-2 hover:text-ink hover:bg-bg-deep transition-colors">
          <MoreHorizontal size={16} strokeWidth={1.6} />
        </button>
      </div>

      <h3 className="text-[14px] font-semibold text-ink mb-1">{integration.name}</h3>
      <p className="text-[12px] text-muted leading-relaxed mb-4 line-clamp-2 flex-1">{integration.description}</p>

      {integration.status === "error" && (
        <div className="flex items-center gap-1.5 mb-3">
          <span className="inline-flex items-center gap-1 h-5 px-1.5 rounded text-[9.5px] font-semibold"
            style={{ background: m.bg, color: m.ink }}>
            <m.Icon size={9} strokeWidth={2} /> {m.label}
          </span>
          <button onClick={() => toast({ tone: "success", title: `Reconnected ${integration.name}` })}
            className="text-[10.5px] font-semibold underline" style={{ color: "var(--accent-deep)" }}>
            Reconnect
          </button>
        </div>
      )}
      {integration.status === "syncing" && (
        <div className="flex items-center gap-1.5 mb-3">
          <span className="inline-flex items-center gap-1 h-5 px-1.5 rounded text-[9.5px] font-semibold"
            style={{ background: m.bg, color: m.ink }}>
            <m.Icon size={9} strokeWidth={2} className="animate-spin" /> {m.label}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-line mt-auto">
        <button onClick={onDetail}
          className="inline-flex items-center gap-2 h-8 px-3 rounded-lg border border-line bg-surface text-[12px] font-medium text-ink-2 hover:bg-bg-deep transition-colors">
          <Settings2 size={12} strokeWidth={1.6} className="text-muted" /> Details
        </button>
        <button onClick={() => {
          setEnabled(!enabled);
          toast({ tone: "success", title: enabled ? `Disconnected ${integration.name}` : `Connected ${integration.name}` });
        }}>
          <ToggleSwitch on={enabled} />
        </button>
      </div>
    </div>
  );
}

function ToggleSwitch({ on }: { on: boolean }) {
  return (
    <div className="w-11 h-6 rounded-full p-[3px] transition-colors cursor-pointer"
      style={{ background: on ? "var(--accent-deep)" : "var(--bg-deep)", border: on ? "none" : "1px solid var(--line)" }}>
      <div className={`w-[18px] h-[18px] rounded-full shadow-sm transition-transform ${on ? "translate-x-[18px]" : "translate-x-0"}`}
        style={{ background: on ? "#fff" : "var(--muted)" }} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail Modal — realistic integration settings page
// ---------------------------------------------------------------------------
function DetailModal({ integration, onClose }: { integration: Integration; onClose: () => void }) {
  const toast = useToast();
  const m = STATUS_META[integration.status];
  const isActive = integration.status === "connected" || integration.status === "syncing";
  const [activeSection, setActiveSection] = useState<"overview" | "sync" | "settings">("overview");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-surface rounded-2xl border border-line shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        style={{ boxShadow: "0 24px 80px -12px rgba(28,40,64,0.25)" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center gap-4 p-6 pb-0">
          <div className="shrink-0">
            <BrandLogo name={integration.vendor} size={48} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[18px] font-semibold text-ink">{integration.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1 h-5 px-1.5 rounded text-[9.5px] font-semibold"
                style={{ background: m.bg, color: m.ink }}>
                <m.Icon size={9} strokeWidth={2} className={integration.status === "syncing" ? "animate-spin" : ""} />
                {m.label}
              </span>
              <span className="text-[11px] text-muted">{integration.category}</span>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg grid place-items-center text-muted hover:text-ink hover:bg-bg-deep transition-colors">
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        {/* Section tabs */}
        <div className="flex items-center gap-1 px-6 mt-4 border-b border-line">
          {(["overview", "sync", "settings"] as const).map(s => (
            <button key={s} onClick={() => setActiveSection(s)}
              className={`text-[12.5px] font-medium px-3 py-2.5 capitalize relative transition-colors ${
                activeSection === s ? "text-accent-deep" : "text-muted hover:text-ink"
              }`}>
              {s === "sync" ? "Sync History" : s}
              {activeSection === s && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full" style={{ background: "var(--accent-deep)" }} />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSection === "overview" && (
            <div className="space-y-5">
              <p className="text-[13px] text-muted leading-relaxed">{integration.description}</p>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3">
                <StatCard icon={<Database size={14} />} label="Records synced" value={isActive ? integration.recordCount.toLocaleString() : "—"} />
                <StatCard icon={<Clock size={14} />} label="Last sync" value={integration.lastSync} />
                <StatCard icon={<Activity size={14} />} label="Sync frequency" value={isActive ? "Every 15 min" : "—"} />
              </div>

              {/* Feeds */}
              {integration.feeds.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-2 mb-2">Powers these surfaces</div>
                  <div className="flex flex-wrap gap-1.5">
                    {integration.feeds.map(f => (
                      <span key={f} className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-bg-deep text-ink-2 border border-line">{f}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Permissions */}
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-2 mb-2">Permissions</div>
                <div className="space-y-2">
                  {[
                    { label: "Read contacts & accounts", granted: true },
                    { label: "Read deals & opportunities", granted: true },
                    { label: "Write activity timeline", granted: isActive },
                    { label: "Webhook notifications", granted: isActive },
                  ].map(p => (
                    <div key={p.label} className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded grid place-items-center ${p.granted ? "" : ""}`}
                        style={{ background: p.granted ? "var(--pos-soft)" : "var(--bg-deep)" }}>
                        {p.granted
                          ? <Check size={10} strokeWidth={2.5} style={{ color: "var(--pos)" }} />
                          : <X size={10} strokeWidth={2} className="text-muted-2" />
                        }
                      </div>
                      <span className="text-[12px] text-ink-2">{p.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                {isActive && (
                  <button onClick={() => toast({ tone: "info", title: `Syncing ${integration.name}...` })}
                    className="text-[12px] font-medium h-9 px-4 rounded-lg inline-flex items-center gap-2 border border-line bg-surface hover:bg-bg-deep transition-colors">
                    <RefreshCw size={12} strokeWidth={1.8} /> Sync now
                  </button>
                )}
                {integration.status === "error" && (
                  <button onClick={() => toast({ tone: "success", title: `Reconnected ${integration.name}` })}
                    className="text-[12px] font-semibold h-9 px-4 rounded-lg inline-flex items-center gap-2"
                    style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
                    Reconnect
                  </button>
                )}
                {integration.status === "disabled" && (
                  <button onClick={() => toast({ tone: "success", title: `Connecting ${integration.name}...` })}
                    className="text-[12px] font-semibold h-9 px-4 rounded-lg inline-flex items-center gap-2"
                    style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
                    <Zap size={12} strokeWidth={2} /> Connect
                  </button>
                )}
                <button className="text-[12px] font-medium h-9 px-4 rounded-lg inline-flex items-center gap-2 text-muted hover:text-ink transition-colors">
                  <ExternalLink size={12} strokeWidth={1.8} /> View docs
                </button>
              </div>
            </div>
          )}

          {activeSection === "sync" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-2">Recent sync activity</div>
                {isActive && (
                  <button onClick={() => toast({ tone: "info", title: "Syncing..." })}
                    className="text-[11px] font-medium px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 border border-line hover:bg-bg-deep transition-colors">
                    <RefreshCw size={10} strokeWidth={1.8} /> Sync now
                  </button>
                )}
              </div>
              {!isActive ? (
                <div className="text-[12.5px] text-muted py-8 text-center">Integration is not active. Connect to see sync history.</div>
              ) : (
                <div className="rounded-xl border border-line overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-bg-deep text-[10.5px] font-semibold uppercase tracking-wider text-muted-2">
                        <th className="text-left px-4 py-2.5">Time</th>
                        <th className="text-left px-4 py-2.5">Status</th>
                        <th className="text-right px-4 py-2.5">Records</th>
                        <th className="text-right px-4 py-2.5">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DETAIL_SYNC_LOG.map((log, i) => (
                        <tr key={i} className="border-t border-line text-[12px]">
                          <td className="px-4 py-2.5 text-ink-2">{log.time}</td>
                          <td className="px-4 py-2.5">
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold"
                              style={{ color: log.status === "success" ? "var(--pos)" : "var(--warn)" }}>
                              {log.status === "success"
                                ? <Check size={10} strokeWidth={2.5} />
                                : <AlertTriangle size={10} strokeWidth={2} />
                              }
                              {log.status === "success" ? "Success" : "Partial"}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono tnum text-ink-2">{log.records}</td>
                          <td className="px-4 py-2.5 text-right font-mono tnum text-muted">{log.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeSection === "settings" && (
            <div className="space-y-5">
              <SettingRow label="Sync direction" description="Choose how data flows between systems.">
                <select className="h-8 px-3 rounded-lg border border-line bg-surface text-[12px] text-ink outline-none">
                  <option>Bidirectional</option>
                  <option>Import only</option>
                  <option>Export only</option>
                </select>
              </SettingRow>
              <SettingRow label="Sync frequency" description="How often data should be synced.">
                <select className="h-8 px-3 rounded-lg border border-line bg-surface text-[12px] text-ink outline-none">
                  <option>Every 15 minutes</option>
                  <option>Every hour</option>
                  <option>Every 6 hours</option>
                  <option>Daily</option>
                </select>
              </SettingRow>
              <SettingRow label="Field mapping" description="Control which fields are synced.">
                <button onClick={() => toast({ tone: "info", title: "Field mapping", body: "Field-mapping editor opens — coming soon" })}
                  className="text-[11.5px] font-medium px-3 py-1.5 rounded-lg border border-line hover:bg-bg-deep transition-colors inline-flex items-center gap-1.5">
                  Configure <ArrowRight size={10} strokeWidth={2} />
                </button>
              </SettingRow>
              <SettingRow label="Error notifications" description="Get alerted when sync fails.">
                <ToggleSwitch on={true} />
              </SettingRow>
              <SettingRow label="Auto-retry on failure" description="Automatically retry failed syncs up to 3 times.">
                <ToggleSwitch on={true} />
              </SettingRow>

              <div className="pt-4 border-t border-line">
                <button onClick={() => toast({ tone: "info", title: "This would disconnect the integration." })}
                  className="text-[12px] font-medium h-9 px-4 rounded-lg inline-flex items-center gap-2 border transition-colors"
                  style={{ borderColor: "var(--neg)", color: "var(--neg)" }}>
                  <Power size={12} strokeWidth={1.8} /> Disconnect integration
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-bg-deep p-3">
      <div className="flex items-center gap-1.5 text-muted mb-1.5">{icon}<span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span></div>
      <div className="text-[15px] font-semibold text-ink">{value}</div>
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-[13px] font-medium text-ink">{label}</div>
        <div className="text-[11.5px] text-muted mt-0.5">{description}</div>
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add Integration Modal — connector marketplace
// ---------------------------------------------------------------------------
function AddIntegrationModal({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const [search, setSearch] = useState("");

  const existing = new Set(integrations.map(i => i.vendor.toLowerCase()));
  const available = AVAILABLE_CONNECTORS.filter(c =>
    !existing.has(c.vendor.toLowerCase()) &&
    (!search || `${c.name} ${c.category} ${c.description}`.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-surface rounded-2xl border border-line shadow-2xl w-full max-w-xl max-h-[80vh] overflow-hidden flex flex-col"
        style={{ boxShadow: "0 24px 80px -12px rgba(28,40,64,0.25)" }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h2 className="text-[18px] font-semibold text-ink">Add Integration</h2>
            <p className="text-[12.5px] text-muted mt-0.5">Connect a new tool to your workspace</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg grid place-items-center text-muted hover:text-ink hover:bg-bg-deep transition-colors">
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 h-10 px-3.5 rounded-xl border border-line bg-bg-deep">
            <Search size={14} strokeWidth={1.6} className="text-muted-2 shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search available connectors..."
              className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-muted-2" autoFocus />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {available.length === 0 ? (
            <div className="text-[12.5px] text-muted text-center py-8">No connectors found.</div>
          ) : (
            <div className="space-y-2">
              {available.map(c => (
                <div key={c.name}
                  className="flex items-center gap-3.5 p-3.5 rounded-xl border border-line hover:border-line-strong hover:bg-bg-deep transition-all cursor-pointer group"
                  onClick={() => { toast({ tone: "success", title: `${c.name} connected!`, body: "Integration is now syncing data." }); onClose(); }}>
                  <div className="shrink-0">
                    <BrandLogo name={c.vendor} size={40} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-ink">{c.name}</span>
                      <span className="text-[9.5px] font-medium px-1.5 py-0.5 rounded-md bg-bg-deep text-muted">{c.category}</span>
                    </div>
                    <div className="text-[11.5px] text-muted mt-0.5 truncate">{c.description}</div>
                  </div>
                  <button className="text-[11px] font-semibold h-8 px-3.5 rounded-lg inline-flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
                    Connect <ArrowRight size={11} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-line">
            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-dashed border-line hover:border-line-strong hover:bg-bg-deep transition-all cursor-pointer"
              onClick={() => { toast({ tone: "info", title: "Custom connector builder", body: "This would open the API connector builder." }); onClose(); }}>
              <div className="w-10 h-10 rounded-xl grid place-items-center shrink-0"
                style={{ background: "var(--bg-deep)", border: "1px solid var(--line)" }}>
                <Plus size={18} strokeWidth={1.6} className="text-muted" />
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-ink">Build custom connector</div>
                <div className="text-[11.5px] text-muted mt-0.5">Use our API to connect any tool via webhooks or REST</div>
              </div>
              <ArrowRight size={14} strokeWidth={1.8} className="text-muted-2 shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
