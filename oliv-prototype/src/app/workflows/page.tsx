"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus, Search, Play, Clock, AlertTriangle, CheckCircle2, XCircle,
  ChevronRight, ExternalLink, X, Workflow, BarChart3, Zap, Hash,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { workflows, workflowRuns, type WorkflowRow, type WorkflowStatus } from "@/lib/mock";

const STATUS_CFG: Record<WorkflowStatus, { color: string; icon: typeof CheckCircle2; bg: string }> = {
  Completed: { color: "var(--pos)", icon: CheckCircle2, bg: "var(--pos)" },
  Stalled:   { color: "var(--warn)", icon: AlertTriangle, bg: "var(--warn)" },
  Failed:    { color: "var(--neg)", icon: XCircle, bg: "var(--neg)" },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function fmtRelative(iso: string) {
  const now = new Date("2026-05-04T12:00:00Z");
  const d = new Date(iso);
  const diff = d.getTime() - now.getTime();
  const days = Math.round(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 0) return `${Math.abs(days)}d ago`;
  return `in ${days}d`;
}

const APP_COLORS: Record<string, string> = {
  LinkedIn: "#0A66C2",
  HubSpot: "#FF7A59",
  Outreach: "#5951FF",
  Salesforce: "#00A1E0",
  Slack: "#4A154B",
};

export default function WorkflowsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "global" | "account">("all");
  const [newOpen, setNewOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = workflows;
    if (filter === "global") list = list.filter((w) => !w.accountSlug);
    if (filter === "account") list = list.filter((w) => !!w.accountSlug);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((w) => w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q));
    }
    return list;
  }, [search, filter]);

  const stats = useMemo(() => {
    const enabled = workflows.filter((w) => w.enabled).length;
    const completed = workflows.filter((w) => w.lastRunStatus === "Completed").length;
    const totalRuns = workflowRuns.length;
    const totalRecords = workflowRuns.reduce((s, r) => s + r.recordsProcessed, 0);
    return { enabled, completed, totalRuns, totalRecords };
  }, []);

  return (
    <AppShell>
      <div className="flex flex-col gap-5 p-6 max-w-[1400px] mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-[20px] font-bold text-ink">Workflows</h1>
            <p className="text-[12px] text-muted-2 mt-0.5">Automated sequences across your sales stack</p>
          </div>
          <button onClick={() => setNewOpen(true)} className="btn-primary h-8 px-3 text-[12px] flex items-center gap-1.5">
            <Plus size={14} />
            New Workflow
          </button>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card px-4 py-3">
            <div className="mono-label text-[9px] mb-1" style={{ letterSpacing: "0.08em" }}>Total Workflows</div>
            <div className="text-[18px] font-bold tnum text-ink">{workflows.length}</div>
            <div className="text-[10px] text-muted-2">{stats.enabled} active</div>
          </div>
          <div className="card px-4 py-3">
            <div className="mono-label text-[9px] mb-1" style={{ letterSpacing: "0.08em" }}>Last Run Health</div>
            <div className="text-[18px] font-bold tnum text-pos">{stats.completed}/{workflows.length}</div>
            <div className="text-[10px] text-muted-2">completed</div>
          </div>
          <div className="card px-4 py-3">
            <div className="mono-label text-[9px] mb-1" style={{ letterSpacing: "0.08em" }}>Total Runs</div>
            <div className="text-[18px] font-bold tnum text-ink">{stats.totalRuns}</div>
            <div className="text-[10px] text-muted-2">all time</div>
          </div>
          <div className="card px-4 py-3">
            <div className="mono-label text-[9px] mb-1" style={{ letterSpacing: "0.08em" }}>Records Processed</div>
            <div className="text-[18px] font-bold tnum text-ink">{stats.totalRecords.toLocaleString()}</div>
            <div className="text-[10px] text-muted-2">across all runs</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workflows..."
              className="h-9 w-full pl-9 pr-3 text-[12px] rounded-lg border border-line bg-surface text-ink placeholder:text-muted-2 focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div className="flex gap-1">
            {(["all", "global", "account"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-colors ${
                  filter === f
                    ? "bg-accent/15 text-accent border border-accent/30"
                    : "bg-surface border border-line text-muted-2 hover:text-ink"
                }`}
              >
                {f === "all" ? `All (${workflows.length})` : f === "global" ? `Global (${workflows.filter(w => !w.accountSlug).length})` : `Account (${workflows.filter(w => !!w.accountSlug).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line">
                <th className="px-4 py-3 text-[10px] font-medium text-muted-2 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-[10px] font-medium text-muted-2 uppercase tracking-wider">Apps</th>
                <th className="px-4 py-3 text-[10px] font-medium text-muted-2 uppercase tracking-wider">Schedule</th>
                <th className="px-4 py-3 text-[10px] font-medium text-muted-2 uppercase tracking-wider">Last Run</th>
                <th className="px-4 py-3 text-[10px] font-medium text-muted-2 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-[10px] font-medium text-muted-2 uppercase tracking-wider">Next Run</th>
                <th className="px-4 py-3 text-[10px] font-medium text-muted-2 uppercase tracking-wider">Enabled</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((wf) => (
                <WorkflowTableRow key={wf.id} wf={wf} />
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-[12px] text-muted-2">No workflows found</p>
            </div>
          )}
        </div>
      </div>

      {/* New Workflow Modal */}
      {newOpen && <NewWorkflowModal onClose={() => setNewOpen(false)} />}
    </AppShell>
  );
}

function WorkflowTableRow({ wf }: { wf: WorkflowRow }) {
  const [enabled, setEnabled] = useState(wf.enabled);
  const [showDesc, setShowDesc] = useState(false);
  const statusCfg = STATUS_CFG[wf.lastRunStatus];
  const StatusIcon = statusCfg.icon;
  const runsForWf = workflowRuns.filter((r) => r.workflowId === wf.id);
  const lastRecords = runsForWf[0]?.recordsProcessed ?? 0;

  return (
    <tr className="border-b border-line last:border-b-0 hover:bg-surface-2/50 transition-colors group">
      <td className="px-4 py-3">
        <Link href={`/workflows/${wf.id}`} className="group/link">
          <div className="text-[12px] font-medium text-ink group-hover/link:text-accent transition-colors">{wf.name}</div>
          {wf.accountSlug && (
            <div className="text-[10px] text-muted-2 mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent/50" />
              {wf.accountSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).replace(/ Inc$/, "")}
            </div>
          )}
        </Link>
        <div className="relative">
          <button
            onClick={() => setShowDesc(!showDesc)}
            className="text-[9px] text-muted-2 hover:text-ink mt-0.5 hidden group-hover:inline-block"
          >
            {showDesc ? "Hide" : "Details"}
          </button>
          {showDesc && (
            <div className="mt-1 text-[10px] text-muted leading-relaxed max-w-[280px]">{wf.description}</div>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1.5 flex-wrap">
          {wf.apps.map((app) => (
            <span
              key={app}
              className="px-2 py-0.5 text-[9px] font-medium rounded-full border"
              style={{
                color: APP_COLORS[app] || "var(--ink)",
                borderColor: `color-mix(in srgb, ${APP_COLORS[app] || "var(--line)"} 40%, transparent)`,
                background: `color-mix(in srgb, ${APP_COLORS[app] || "var(--surface)"} 10%, transparent)`,
              }}
            >
              {app}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <Clock size={11} className="text-muted-2" />
          <span className="text-[11px] text-muted-2">{wf.schedule}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div>
          <span className="text-[11px] text-muted-2 tnum">{fmtDate(wf.lastRunAt)}</span>
          <div className="text-[9px] text-muted-2 tnum">{fmtTime(wf.lastRunAt)} · {lastRecords} records</div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <StatusIcon size={12} style={{ color: statusCfg.color }} />
          <span className="text-[11px] font-medium" style={{ color: statusCfg.color }}>{wf.lastRunStatus}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div>
          <span className="text-[11px] text-muted-2 tnum">{fmtDate(wf.nextScheduledAt)}</span>
          <div className="text-[9px] text-muted-2">{fmtRelative(wf.nextScheduledAt)}</div>
        </div>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => setEnabled(!enabled)}
          className="relative w-8 h-[18px] rounded-full transition-colors"
          style={{ background: enabled ? "var(--accent)" : "var(--bg-deep)" }}
        >
          <div
            className="absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-transform"
            style={{ left: enabled ? "calc(100% - 16px)" : "2px" }}
          />
        </button>
      </td>
      <td className="px-4 py-3">
        <Link href={`/workflows/${wf.id}`} className="text-muted-2 hover:text-ink transition-colors">
          <ChevronRight size={14} />
        </Link>
      </td>
    </tr>
  );
}

/* ─── New Workflow Modal ─── */

const TEMPLATES = [
  { name: "Signal-based Outreach", desc: "Route accounts by signal strength to outreach sequences", apps: ["Outreach", "Salesforce"] },
  { name: "LinkedIn Audience Sync", desc: "Sync intent-scored accounts to LinkedIn ad audiences", apps: ["LinkedIn"] },
  { name: "Slack Alert Pipeline", desc: "Send alerts to Slack channels when signals fire", apps: ["Slack"] },
  { name: "CRM Enrichment Flow", desc: "Discover contacts, enrich data, sync to CRM", apps: ["Salesforce", "HubSpot"] },
  { name: "Blank Canvas", desc: "Start from scratch with an empty workflow", apps: [] },
];

function NewWorkflowModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-surface border border-line rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="text-[15px] font-bold text-ink">New Workflow</h2>
          <button onClick={onClose} className="text-muted-2 hover:text-ink transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="text-[10px] font-medium text-muted-2 uppercase tracking-wider mb-1.5 block">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My workflow..."
              className="h-9 w-full px-3 text-[12px] rounded-lg border border-line bg-surface text-ink placeholder:text-muted-2 focus:outline-none focus:ring-1 focus:ring-accent"
              autoFocus
            />
          </div>

          <div>
            <label className="text-[10px] font-medium text-muted-2 uppercase tracking-wider mb-2 block">Start from a template</label>
            <div className="space-y-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-line hover:border-accent/30 hover:bg-accent/5 transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-surface-2 border border-line grid place-items-center shrink-0 group-hover:border-accent/30">
                    <Workflow size={14} className="text-muted-2 group-hover:text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium text-ink">{t.name}</div>
                    <div className="text-[10px] text-muted-2">{t.desc}</div>
                  </div>
                  {t.apps.length > 0 && (
                    <div className="flex gap-1 shrink-0">
                      {t.apps.map((a) => (
                        <span key={a} className="px-1.5 py-0.5 text-[8px] rounded-full border border-line text-muted-2">{a}</span>
                      ))}
                    </div>
                  )}
                  <ChevronRight size={12} className="text-muted-2 group-hover:text-accent shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
