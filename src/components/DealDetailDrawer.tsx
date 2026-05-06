"use client";

import { useState, useEffect } from "react";
import {
  X, ChevronRight, Sparkles, RefreshCw, History, Trash2, Calendar,
  DollarSign, User, Building2, Video, Mail, Phone, FileText,
  CheckCircle2, AlertTriangle, ArrowRight, Wand2, Heart, Pin, Loader2,
  FileSpreadsheet, Presentation, Download, Plus,
} from "lucide-react";
import {
  type DealRow, dealDetail, fmtFullMoney, fmtDate,
  meddpiccFullLabels,
} from "@/lib/mock";
import { useToast } from "./Toast";
import { Modal, ModalButton } from "./Modal";

type TabId =
  | "overview" | "details" | "stages" | "health"
  | "timeline" | "actions" | "coaching" | "crm" | "assets";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "details",  label: "Details"  },
  { id: "stages",   label: "Stages"   },
  { id: "health",   label: "Health"   },
  { id: "timeline", label: "Timeline" },
  { id: "actions",  label: "Action Plan" },
  { id: "coaching", label: "Coaching" },
  { id: "crm",      label: "CRM Updates" },
  { id: "assets",   label: "Assets" },
];

export function DealDetailDrawer({ deal, onClose }: { deal: DealRow | null; onClose: () => void }) {
  const toast = useToast();
  const [tab, setTab] = useState<TabId>("overview");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [askAIOpen, setAskAIOpen] = useState(false);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    if (!deal) return;
    setTab("overview");
    setHistoryOpen(false); setAskAIOpen(false); setArchiveConfirmOpen(false);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deal, onClose]);

  if (!deal) return null;

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLastSync(new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }));
      toast({ tone: "success", title: "Synced to Salesforce", body: `4 fields written for ${deal.name}.` });
    }, 900);
  };

  const handleArchive = () => {
    setArchiveConfirmOpen(false);
    onClose();
    toast({ tone: "success", title: "Deal archived", body: `${deal.name} moved to Archived. Undo available for 30 days.` });
  };

  return (
    <>
      <div className="fixed inset-0 bg-ink/30 z-40 fade-in" onClick={onClose} />
      <aside
        className="fixed top-0 right-0 h-screen w-full md:w-[min(1180px,86vw)] bg-bg z-50 drawer-anim shadow-[0_8px_32px_-12px_rgba(28,40,64,0.18)] border-l border-line flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer header */}
        <div className="px-6 pt-5 pb-3 border-b border-line">
          <div className="flex items-start gap-3">
            <button onClick={onClose} className="mt-1 w-8 h-8 rounded-lg grid place-items-center text-muted hover:text-ink hover:bg-surface-2">
              <ChevronRight size={16} strokeWidth={1.6} />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Building2 size={16} strokeWidth={1.6} className="text-muted" />
                <h2 className="display" style={{ fontSize: 26 }}>
                  {deal.name}
                </h2>
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Pill icon={<Building2 size={11} />}>{deal.segment}</Pill>
                <Pill icon={<span className="w-2 h-2 rounded-full" style={{ background: "var(--warn)" }} />}>{deal.stage}</Pill>
                <Pill icon={<DollarSign size={11} />}>{fmtFullMoney(deal.amount)}</Pill>
                <Pill icon={<Calendar size={11} />}>{fmtDate(deal.closeDate)}</Pill>
                <Pill icon={<User size={11} />}>{deal.owner}</Pill>
                <button onClick={handleSync} disabled={syncing}
                  className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border border-line bg-surface text-[11.5px] font-medium hover:bg-surface-2 disabled:opacity-60">
                  {syncing
                    ? <Loader2 size={11} strokeWidth={1.8} className="text-muted animate-spin" />
                    : <RefreshCw size={11} strokeWidth={1.6} className="text-muted" />}
                  {syncing ? "Syncing…" : lastSync ? `Synced · ${lastSync}` : "Sync to Salesforce"}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <IconAction icon={<Sparkles size={14} strokeWidth={1.6} />} label="Ask AI" onClick={() => setAskAIOpen(true)} />
              <IconAction icon={<History size={14} strokeWidth={1.6} />} label="History" onClick={() => setHistoryOpen(true)} />
              <IconAction icon={<Trash2 size={14} strokeWidth={1.6} />} label="Archive" tone="danger" onClick={() => setArchiveConfirmOpen(true)} />
            </div>
          </div>

          {/* Tab strip */}
          <div className="mt-4 flex items-center gap-0.5 -mb-px overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`pill-nav-item ${tab === t.id ? "active" : ""} flex-shrink-0`}
                style={{ padding: "6px 14px" }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {tab === "overview" && <OverviewTab />}
          {tab === "details"  && <DetailsTab deal={deal} />}
          {tab === "stages"   && <StagesTab />}
          {tab === "health"   && <HealthTab />}
          {tab === "timeline" && <TimelineTab />}
          {tab === "actions"  && <ActionPlanTab />}
          {tab === "coaching" && <CoachingTab />}
          {tab === "crm"      && <CrmTab />}
          {tab === "assets"   && <AssetsTab dealName={deal.name} />}
        </div>
      </aside>

      {/* Side panels & modals */}
      <DealAskAIPanel open={askAIOpen} onClose={() => setAskAIOpen(false)} dealName={deal.name} />
      <DealHistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} dealName={deal.name} />
      <Modal
        open={archiveConfirmOpen}
        onClose={() => setArchiveConfirmOpen(false)}
        title={`Archive "${deal.name}"?`}
        description="The deal stays accessible from the Archived view. You can restore it within 30 days."
        width={420}
        footer={
          <>
            <ModalButton onClick={() => setArchiveConfirmOpen(false)}>Cancel</ModalButton>
            <ModalButton danger onClick={handleArchive}>Archive deal</ModalButton>
          </>
        }
      >
        <div className="recessed p-3 text-[12px] text-ink-2">
          {deal.account} · <span className="tnum">{fmtFullMoney(deal.amount)}</span> · {deal.stage} · close {fmtDate(deal.closeDate)}
        </div>
      </Modal>
    </>
  );
}

function DealAskAIPanel({ open, onClose, dealName }: { open: boolean; onClose: () => void; dealName: string }) {
  const [q, setQ] = useState("");
  const [msgs, setMsgs] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  useEffect(() => { if (!open) return; const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [open, onClose]);
  if (!open) return null;
  const ask = (text: string) => {
    if (!text.trim()) return;
    const ans = `For ${dealName}: ` + (text.toLowerCase().includes("risk") ? "Procurement is the dominant blocker — economic buyer dark for 14 days. Schedule a 30-min exec touch this week." : text.toLowerCase().includes("next") ? "Send the revised proposal with a phased-payment plan and lock the integration deep-dive for May 14." : "Pulled from the deal's transcripts and emails — citations would appear inline.");
    setMsgs((m) => [...m, { role: "user", text }, { role: "ai", text: ans }]);
    setQ("");
  };
  return (
    <>
      <div className="fixed inset-0 bg-ink/30 z-[110] fade-in" onClick={onClose} />
      <aside className="fixed top-0 right-0 h-screen w-[400px] bg-bg z-[120] drawer-anim border-l border-line flex flex-col">
        <div className="px-4 h-12 border-b border-line flex items-center justify-between">
          <span className="text-[13px] font-semibold text-ink">Ask AI · {dealName}</span>
          <button onClick={onClose} className="w-7 h-7 rounded-md grid place-items-center text-muted hover:text-ink hover:bg-bg-deep">
            <X size={13} strokeWidth={1.6} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {msgs.length === 0 && (
            <div className="space-y-1.5">
              {[`What's the biggest risk on ${dealName}?`, "What's the next best move?", "Summarize the last meeting"].map((s) => (
                <button key={s} onClick={() => ask(s)} className="block w-full text-left text-[12px] px-2.5 py-1.5 rounded-md border border-line bg-surface hover:bg-bg-deep">{s}</button>
              ))}
            </div>
          )}
          {msgs.map((m, i) => m.role === "user" ? (
            <div key={i} className="flex justify-end"><div className="max-w-[85%] px-2.5 py-1.5 rounded-md bg-ink text-white text-[12.5px]">{m.text}</div></div>
          ) : (
            <div key={i} className="text-[12.5px] text-ink-2 leading-relaxed">{m.text}</div>
          ))}
        </div>
        <div className="p-3 border-t border-line flex items-center gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") ask(q); }}
            placeholder={`Ask anything about ${dealName}…`}
            className="flex-1 h-8 px-2.5 rounded-md border border-line bg-surface text-[12.5px] outline-none" />
          <button onClick={() => ask(q)} className="h-8 px-3 rounded-md bg-ink text-white text-[11.5px] font-medium">Ask</button>
        </div>
      </aside>
    </>
  );
}

function DealHistoryPanel({ open, onClose, dealName }: { open: boolean; onClose: () => void; dealName: string }) {
  const events = [
    { who: "Alphy",    what: "Updated forecast probability 85% → 78%",        when: "today, 09:14 AM" },
    { who: "Sarah Chen", what: "Changed close date Apr 15 → Apr 28",            when: "yesterday, 04:22 PM" },
    { who: "Alphy",    what: "Detected new risk · Procedural Delays",         when: "yesterday, 11:48 AM" },
    { who: "Alphy",    what: "Synced 3 fields to Salesforce",                  when: "2d ago, 10:01 AM" },
    { who: "Sarah Chen", what: "Moved stage Demo → Proposal",                    when: "3d ago, 02:34 PM" },
    { who: "Alphy",    what: "Auto-linked 2 meetings and 1 email thread",      when: "5d ago, 09:00 AM" },
  ];
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-ink/30 z-[110] fade-in" onClick={onClose} />
      <aside className="fixed top-0 right-0 h-screen w-[420px] bg-bg z-[120] drawer-anim border-l border-line flex flex-col">
        <div className="px-4 h-12 border-b border-line flex items-center justify-between">
          <span className="text-[13px] font-semibold text-ink">Audit log · {dealName}</span>
          <button onClick={onClose} className="w-7 h-7 rounded-md grid place-items-center text-muted hover:text-ink hover:bg-bg-deep">
            <X size={13} strokeWidth={1.6} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {events.map((e, i) => (
            <div key={i} className="flex gap-2.5">
              <div className="w-6 h-6 rounded grid place-items-center mt-0.5"
                style={{ background: e.who === "Alphy" ? "var(--accent-soft)" : "var(--bg-deep)" }}>
                {e.who === "Alphy"
                  ? <Sparkles size={10} strokeWidth={1.8} style={{ color: "var(--accent)" }} />
                  : <User size={10} strokeWidth={1.8} className="text-muted" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] text-ink-2 leading-snug">{e.what}</div>
                <div className="text-[10.5px] text-muted-2 mt-0.5">{e.who} · {e.when}</div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}

// =====================================================================
// Shared mini-components
// =====================================================================
function Pill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border border-line bg-surface text-[11.5px] font-medium text-ink-2">
      <span className="text-muted">{icon}</span>
      {children}
    </span>
  );
}

function IconAction({ icon, label, tone, onClick }: { icon: React.ReactNode; label: string; tone?: "danger"; onClick?: () => void }) {
  return (
    <button
      title={label}
      onClick={onClick}
      className="w-8 h-8 rounded-lg grid place-items-center text-muted hover:text-ink hover:bg-surface-2"
      style={tone === "danger" ? { color: "var(--neg)" } : undefined}
    >
      {icon}
    </button>
  );
}

function SectionHeader({ kicker, title, right }: { kicker?: string; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-3">
      <div>
        {kicker && <div className="mono-label mb-1">{kicker}</div>}
        <h3 className="text-ink" style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 600 }}>{title}</h3>
      </div>
      {right}
    </div>
  );
}

function HealthBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="health-bar"><span style={{ width: `${pct}%`, background: color }} /></div>
  );
}

function EvidenceBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-1 h-5 px-1.5 rounded text-[10px] font-medium text-muted bg-bg-deep">
      <Video size={10} strokeWidth={1.6} />+{n}
    </span>
  );
}

// =====================================================================
// 1. Overview
// =====================================================================
function OverviewTab() {
  const d = dealDetail;
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card p-5">
        <div className="mono-label mb-1.5" style={{ color: "var(--pos)" }}>Strengths</div>
        <div className="space-y-3 mt-3">
          {d.strengths.map((s) => (
            <div key={s.title}>
              <div className="text-[13px] font-semibold text-ink">{s.title}</div>
              <div className="text-[12.5px] text-ink-2 leading-relaxed mt-0.5">{s.body}</div>
            </div>
          ))}
        </div>
        <div className="mt-5"><HealthBar pct={75} color="var(--pos)" /></div>
      </div>

      <div className="card p-5">
        <div className="mono-label mb-1.5" style={{ color: "var(--warn)" }}>Risks &amp; Gaps</div>
        <div className="space-y-3 mt-3">
          {d.risks.map((r) => (
            <div key={r.title}>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-ink">{r.title}</span>
                <EvidenceBadge n={2} />
              </div>
              <div className="text-[12.5px] text-ink-2 leading-relaxed mt-0.5">{r.body}</div>
            </div>
          ))}
        </div>
        <div className="mt-5"><HealthBar pct={55} color="var(--warn)" /></div>
      </div>

      <div className="card p-5 col-span-1">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="mono-label">Forecast</div>
            <div className="text-ink mt-1" style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 700 }}>
              70% <span className="italic-emph font-normal">Commit</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {d.forecastFactors.map((f, i) => (
            <div key={i} className="flex items-start gap-2">
              <span
                className="inline-flex items-center justify-center min-w-[42px] h-5 px-1.5 rounded text-[10.5px] font-mono tnum"
                style={{
                  background: f.dir === "+" ? "var(--pos-soft)" : "var(--neg-soft)",
                  color: f.dir === "+" ? "var(--pos)" : "var(--neg)",
                }}
              >
                {f.dir}{f.weight}%
              </span>
              <span className="text-[12.5px] text-ink-2 leading-snug">{f.body}</span>
            </div>
          ))}
        </div>
      </div>

      <RecommendationsCard />
    </div>
  );
}

function RecommendationsCard() {
  const toast = useToast();
  const d = dealDetail;
  const [done, setDone] = useState<Set<string>>(new Set());
  const triggerAction = (rec: { title: string; action: string }) => {
    setDone((s) => new Set(s).add(rec.title));
    toast({ tone: "success", title: rec.action, body: `"${rec.title}" — queued.` });
  };
  return (
    <div className="card p-5">
      <div className="mono-label mb-3" style={{ color: "var(--accent)" }}>AI Recommendations</div>
      <div className="space-y-1">
        {d.recommendations.map((r) => {
          const isDone = done.has(r.title);
          return (
            <div key={r.title} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-bg-deep">
              <Sparkles size={13} strokeWidth={1.6} style={{ color: "var(--accent)" }} />
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-semibold text-ink">{r.title}</div>
                <div className="text-[11.5px] text-muted truncate">{r.body}</div>
              </div>
              {isDone ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 h-7 rounded-md" style={{ background: "var(--pos-soft)", color: "var(--pos)" }}>
                  <CheckCircle2 size={11} strokeWidth={2} /> Done
                </span>
              ) : (
                <button onClick={() => triggerAction(r)} className="text-[11.5px] font-medium px-2.5 h-7 rounded-md border border-line bg-surface hover:bg-bg-deep">
                  {r.action}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =====================================================================
// 2. Details
// =====================================================================
function DetailsTab({ deal }: { deal: DealRow }) {
  const sections = ["Overview", "Next Steps", "Opportunity and Risks", "Adoption", "Success Plan", "Marketing Opportunity"];
  const [active, setActive] = useState("Overview");
  return (
    <div className="grid grid-cols-[220px_1fr] gap-5">
      <nav className="card p-2 self-start">
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => setActive(s)}
            className={`block w-full text-left text-[12.5px] px-3 py-2 rounded-lg ${
              s === active ? "bg-bg-deep text-ink font-medium" : "text-muted hover:text-ink hover:bg-surface-2"
            }`}
          >
            {s}
          </button>
        ))}
      </nav>
      <div className="card p-5">
        <div className="recessed px-3 py-2 mb-4 text-[12.5px] font-semibold text-ink">{active}</div>
        <div className="space-y-3 max-w-md">
          <Field label="Deal Name" value={`${deal.name} — ${deal.account}`} />
          <Field label="Close Date" value={fmtDate(deal.closeDate)} />
          <Field label="Amount" value={fmtFullMoney(deal.amount)} aiSuggest />
          <Field label="Stage" value={deal.stage} aiSuggest />
          <Field label="Pipeline" value={deal.pipeline} />
          <Field label="Deal Owner" value={deal.owner} />
          <Field label="Priority" value={deal.priority} />
          <Field label="Forecast Category" value={deal.forecast} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, aiSuggest }: { label: string; value: string; aiSuggest?: boolean }) {
  return (
    <div>
      <div className="text-[11px] text-muted mb-1">{label}</div>
      <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-line bg-surface text-[13px] text-ink">
        <span className="flex-1">{value}</span>
        {aiSuggest && <Wand2 size={13} strokeWidth={1.6} style={{ color: "var(--accent-deep)" }} />}
      </div>
    </div>
  );
}

// =====================================================================
// 3. Stages
// =====================================================================
function StagesTab() {
  const toast = useToast();
  const d = dealDetail;
  const [active, setActive] = useState(d.stages[3].name);
  const cur = d.stages.find((s) => s.name === active) || d.stages[0];
  const [outcomes, setOutcomes] = useState(() => d.outcomes.map((o) => ({ ...o })));
  const [suggestedOpen, setSuggestedOpen] = useState(false);
  const toggleOutcome = (i: number) => {
    setOutcomes((s) => s.map((o, idx) => idx === i ? { ...o, done: !o.done } : o));
    if (!outcomes[i].done) toast({ tone: "success", title: "Outcome completed", body: outcomes[i].label });
  };
  const SUGGESTIONS = [
    "Schedule a 30-min Executive Alignment call with David Wallace",
    "Send a phased payment proposal anchored on Q1 budget lock",
    "Share two reference customer case studies with similar rollouts",
    "Open a Digital Sales Room and invite the buying committee",
  ];
  return (
    <div className="grid grid-cols-[260px_1fr] gap-5">
      <div className="card p-5 self-start">
        <div className="mono-label mb-2">Deal Stages</div>
        <div className="flex items-baseline gap-2">
          <span className="display" style={{ fontSize: 32 }}>49</span>
          <span className="text-[12px] text-muted">Days in cycle</span>
        </div>
        <hr className="hairline my-4" />
        <div className="flex flex-col gap-1.5">
          {d.stages.map((s) => {
            const isActive = s.name === active;
            const ratio = s.total > 0 ? s.done / s.total : 0;
            const c = s.status === "complete" ? "var(--pos)" : s.status === "current" ? "var(--warn)" : "var(--muted-2)";
            return (
              <button
                key={s.name}
                onClick={() => setActive(s.name)}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-left ${
                  isActive ? "bg-bg-deep" : "hover:bg-surface-2"
                }`}
              >
                <span className="w-1.5 h-6 rounded-full" style={{ background: c }} />
                <span className="text-[12.5px] font-medium text-ink flex-1">{s.name}</span>
                <span className="text-[10.5px] font-mono tnum text-muted">{s.done}/{s.total}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="card p-5">
          <div className="mono-label mb-2">Summary</div>
          <h3 className="text-ink mb-3" style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 700 }}>
            {cur.name}
          </h3>
          <div className="recessed p-4">
            <div className="mono-label mb-1.5" style={{ color: "var(--pos)" }}>Completed</div>
            <p className="text-[13px] text-ink-2 leading-relaxed">
              First proposal delivered outlining the Alphard Intelligence Platform with Meeting Assistant, CRM Manager,
              Deal Driver, and Forecaster; executives confirmed this as the initial rollout bundle.
            </p>
            <p className="text-[13px] text-ink-2 leading-relaxed mt-2">
              Coach, Analyst, and Researcher flagged for a later decision once phase-one value is proven, and leadership
              acknowledged that budget exists to expand when ready.
            </p>
            <div className="mt-3 flex items-center gap-2"><EvidenceBadge n={2} /></div>
            <div className="mt-3"><HealthBar pct={85} color="var(--pos)" /></div>
          </div>
          <div className="recessed p-4 mt-3">
            <div className="mono-label mb-1.5" style={{ color: "var(--warn)" }}>Focus Areas</div>
            <p className="text-[13px] text-ink-2 leading-relaxed">
              Executives want a detailed plan for Salesforce-first rollout, including owners and dates.
            </p>
            <div className="mt-3 flex items-center gap-2"><EvidenceBadge n={2} /></div>
            <div className="mt-3"><HealthBar pct={45} color="var(--warn)" /></div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="mono-label">Outcomes</div>
              <h4 className="text-ink mt-0.5" style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 600 }}>
                Stage exit criteria
              </h4>
            </div>
            <button onClick={() => setSuggestedOpen(true)}
              className="text-[11.5px] font-medium inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border border-line bg-surface hover:bg-bg-deep">
              <Sparkles size={12} strokeWidth={1.6} style={{ color: "var(--accent)" }} />
              Suggested Activities
            </button>
          </div>
          <div className="space-y-1">
            {outcomes.map((o, i) => (
              <button key={i} onClick={() => toggleOutcome(i)}
                className="flex items-start gap-2.5 w-full text-left p-1 rounded hover:bg-bg-deep">
                <span
                  className={`mt-0.5 w-4 h-4 rounded grid place-items-center flex-shrink-0 ${o.done ? "" : "border border-line"}`}
                  style={{ background: o.done ? "var(--pos)" : "transparent" }}
                >
                  {o.done && <CheckCircle2 size={11} strokeWidth={2} style={{ color: "white" }} />}
                </span>
                <span className={`text-[12.5px] ${o.done ? "text-muted line-through" : "text-ink-2"}`}>
                  {o.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Modal open={suggestedOpen} onClose={() => setSuggestedOpen(false)} title="Suggested activities" description={`AI-recommended next moves for the ${cur.name} stage.`} width={520}
        footer={<ModalButton onClick={() => setSuggestedOpen(false)}>Close</ModalButton>}
      >
        <div className="space-y-1.5">
          {SUGGESTIONS.map((s, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-bg-deep">
              <div className="w-6 h-6 rounded grid place-items-center" style={{ background: "var(--accent-soft)" }}>
                <Sparkles size={11} strokeWidth={1.8} style={{ color: "var(--accent)" }} />
              </div>
              <div className="flex-1 text-[12.5px] text-ink-2">{s}</div>
              <button onClick={() => { toast({ tone: "success", title: "Activity added", body: s }); }}
                className="text-[11px] font-medium px-2.5 h-7 rounded-md border border-line bg-surface hover:bg-bg-deep">Add</button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}

// =====================================================================
// 4. Health (Forecast / Qualification / Risks / Buying Committee)
// =====================================================================
function HealthTab() {
  const [sub, setSub] = useState<"forecast" | "qual" | "risks" | "comm">("forecast");
  return (
    <div>
      <div className="flex gap-1 mb-4 border-b border-line">
        {[
          { id: "forecast" as const, label: "Forecast" },
          { id: "qual"     as const, label: "Qualification" },
          { id: "risks"    as const, label: "Risks" },
          { id: "comm"     as const, label: "Buying Committee" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className={`text-[12.5px] font-medium px-3 py-2 -mb-px ${
              sub === t.id ? "text-ink border-b-2 border-ink" : "text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sub === "forecast" && <HealthForecast />}
      {sub === "qual"     && <HealthQualification />}
      {sub === "risks"    && <HealthRisks />}
      {sub === "comm"     && <HealthCommittee />}
    </div>
  );
}

function HealthForecast() {
  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="mono-label mb-2">Summary</div>
        <ul className="space-y-2 text-[13px] text-ink-2 leading-relaxed list-disc pl-4">
          <li>Tracking at <strong>78% win probability</strong> because we've successfully aligned with the sponsor's vision for
              "people-centric automation". However, the forecaster flagged a potential bottleneck in Legal regarding "Data Liability" clauses.</li>
          <li>A meeting from March 10 indicates that the Technical Validator is concerned about "System Uptime" during a power outage scenario.</li>
          <li>The Economic Buyer has not engaged with the last two email threads. Schedule a brief "Executive Alignment" call before
              the Q1 budget lock on March 25.</li>
        </ul>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <Kpi label="Target Close Date"        value="Apr 15, 2025" tone="warn" />
        <Kpi label="Current Close Probability" value="78%"          tone="pos"  />
        <Kpi label="Forecast Category"        value="Best Case"     tone="warn" />
        <Kpi label="Close Date Slips (8w)"    value="2 Times"       tone="neg"  />
      </div>
      <div className="card p-5">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="mono-label">Probability over time</div>
            <h4 className="text-ink mt-0.5" style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 600 }}>
              Historical (weekly) vs Future (monthly)
            </h4>
          </div>
          <div className="flex gap-3 text-[11px] text-muted">
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-[2px]" style={{ background: "var(--ink)" }}/>Historical</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-[2px] border-t border-dashed" style={{ borderColor: "var(--accent-deep)" }}/>Future</span>
          </div>
        </div>
        <ProbabilityChart />
      </div>
    </div>
  );
}

function ProbabilityChart() {
  const past = [62, 70, 65, 72, 78];
  const future = [78, 82, 80, 85, 88];
  const all = [...past, ...future];
  const min = 50, max = 100;
  const w = 720, h = 160;
  const stepX = w / (all.length - 1);
  const yOf = (v: number) => h - ((v - min) / (max - min)) * h;
  const pastPath = past.map((v, i) => `${i === 0 ? "M" : "L"}${i * stepX},${yOf(v)}`).join(" ");
  const futurePath = future.map((v, i) => `${i === 0 ? "M" : "L"}${(past.length - 1 + i) * stepX},${yOf(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h + 30}`} className="w-full" style={{ maxHeight: 200 }}>
      {[60, 75, 90].map((y) => (
        <line key={y} x1="0" x2={w} y1={yOf(y)} y2={yOf(y)} stroke="var(--line)" strokeWidth="1" strokeDasharray="2 4" />
      ))}
      <path d={pastPath} stroke="var(--ink)" fill="none" strokeWidth="2" />
      <path d={futurePath} stroke="var(--accent-deep)" fill="none" strokeWidth="2" strokeDasharray="6 4" />
      {past.map((v, i) => <circle key={`p${i}`} cx={i * stepX} cy={yOf(v)} r="3" fill="var(--ink)" />)}
      {future.map((v, i) => <circle key={`f${i}`} cx={(past.length - 1 + i) * stepX} cy={yOf(v)} r="3" fill="var(--accent-deep)" />)}
      <text x="0" y={h + 18} fontSize="10" fill="var(--muted)">3/25</text>
      <text x={w / 4} y={h + 18} fontSize="10" fill="var(--muted)">4/15</text>
      <text x={w / 2} y={h + 18} fontSize="10" fill="var(--muted)" textAnchor="middle">Today</text>
      <text x={(3 * w) / 4} y={h + 18} fontSize="10" fill="var(--muted)">Jul</text>
      <text x={w} y={h + 18} fontSize="10" fill="var(--muted)" textAnchor="end">Sep</text>
    </svg>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone: "pos" | "neg" | "warn" }) {
  const c = tone === "pos" ? "var(--pos)" : tone === "neg" ? "var(--neg)" : "var(--warn)";
  return (
    <div className="card p-4">
      <div className="text-ink" style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 700, color: c }}>
        {value}
      </div>
      <div className="text-[11px] text-muted mt-1">{label}</div>
    </div>
  );
}

function HealthQualification() {
  const [pick, setPick] = useState(0);
  const cur = dealDetail.meddpiccScores[pick];
  return (
    <div className="grid grid-cols-[300px_1fr] gap-5">
      <div className="card p-5 self-start">
        <div className="mono-label mb-1">Methodology</div>
        <select className="w-full mt-2 h-9 px-3 rounded-lg border border-line bg-surface text-[13px] text-ink">
          <option>MEDDPICC</option>
          <option>MEDDICC</option>
          <option>BANT</option>
          <option>SPICED</option>
          <option>Custom</option>
        </select>
        <div className="my-4">
          <RadarChart scores={dealDetail.meddpiccScores.map((s) => s.score)} />
        </div>
        <div className="space-y-1">
          {dealDetail.meddpiccScores.map((s, i) => (
            <button
              key={s.dim}
              onClick={() => setPick(i)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[12.5px] ${
                i === pick ? "bg-bg-deep text-ink font-medium" : "text-ink-2 hover:bg-surface-2"
              }`}
            >
              <span>{s.dim}</span>
              <span
                className="text-[10.5px] font-mono tnum px-1.5 rounded"
                style={{
                  background: s.score >= 4 ? "var(--pos-soft)" : s.score >= 3 ? "var(--warn-soft)" : "var(--neg-soft)",
                  color:      s.score >= 4 ? "var(--pos)"      : s.score >= 3 ? "var(--warn)"      : "var(--neg)",
                }}
              >
                {s.score}/5
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} strokeWidth={1.6} style={{ color: "var(--accent-deep)" }} />
            <h3 className="text-ink" style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 700 }}>
              {cur.dim}
            </h3>
            <span className="text-[11px] font-mono tnum text-muted">{cur.score}/5</span>
          </div>
          <p className="text-[13px] text-ink-2">{cur.summary}</p>
        </div>
        <div className="card p-5">
          <div className="mono-label mb-1.5" style={{ color: "var(--pos)" }}>Completed</div>
          <p className="text-[13px] text-ink-2 leading-relaxed">
            <strong>Quantified Impact:</strong> Admin-time savings calculated at 20% per rep and a $150K quarterly pipeline gap tied
            directly to manual updates were presented in the pilot recap to leadership.
          </p>
          <p className="text-[13px] text-ink-2 leading-relaxed mt-2">
            <strong>Win-Rate Lift Modelled:</strong> A data sheet shared with Pam and David projects a 6% increase in win rate once
            MEDDPICC fields are auto-captured and forecasting is fully automated.
          </p>
          <div className="mt-3"><EvidenceBadge n={2} /></div>
          <div className="mt-3"><HealthBar pct={80} color="var(--pos)" /></div>
        </div>
        <div className="card p-5">
          <div className="mono-label mb-1.5" style={{ color: "var(--warn)" }}>Focus Areas</div>
          <p className="text-[13px] text-ink-2 leading-relaxed">
            <strong>Baseline Validation:</strong> Capture current win-rate and cycle-time benchmarks in Salesforce to create a credible
            "before-and-after" ROI dashboard.
          </p>
          <p className="text-[13px] text-ink-2 leading-relaxed mt-2">
            <strong>Post-Launch Tracking Plan:</strong> Align with Finance on a monthly cadence for exporting Alphard metrics into their
            BI tool so ROI can be audited without extra RevOps effort.
          </p>
          <div className="mt-3"><EvidenceBadge n={2} /></div>
          <div className="mt-3"><HealthBar pct={50} color="var(--warn)" /></div>
        </div>
      </div>
    </div>
  );
}

function RadarChart({ scores }: { scores: number[] }) {
  const cx = 110, cy = 110, R = 90;
  const n = scores.length;
  const angle = (i: number) => (-Math.PI / 2) + (i * 2 * Math.PI) / n;
  const point = (i: number, r: number) => [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r];
  const ringPath = (r: number) =>
    Array.from({ length: n })
      .map((_, i) => { const [x, y] = point(i, r); return `${i === 0 ? "M" : "L"}${x},${y}`; })
      .join(" ") + " Z";
  const dataPath = scores
    .map((s, i) => { const [x, y] = point(i, (s / 5) * R); return `${i === 0 ? "M" : "L"}${x},${y}`; })
    .join(" ") + " Z";
  return (
    <svg viewBox="0 0 220 220" className="w-full">
      {[0.25, 0.5, 0.75, 1].map((r) => (
        <path key={r} d={ringPath(R * r)} stroke="var(--line)" strokeWidth="1" fill="none" />
      ))}
      {Array.from({ length: n }).map((_, i) => {
        const [x, y] = point(i, R);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--line)" strokeWidth="1" />;
      })}
      <path d={dataPath} fill="rgba(200,255,61,0.32)" stroke="var(--accent-deep)" strokeWidth="1.5" />
      {meddpiccFullLabels.map((l, i) => {
        const [x, y] = point(i, R + 14);
        return (
          <text key={l} x={x} y={y} textAnchor="middle" fontSize="9" fill="var(--muted)" dominantBaseline="middle">
            {l.length > 14 ? l.split(" ")[0] : l}
          </text>
        );
      })}
    </svg>
  );
}

function HealthRisks() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Kpi label="Overall Deal Risk" value="High" tone="neg" />
        <Kpi label="Competitors in Deal" value="03" tone="warn" />
        <Kpi label="Open Objections" value="04" tone="warn" />
      </div>
      <div className="card p-5">
        <div className="mono-label mb-1.5">Competition</div>
        <h4 className="text-ink mb-4" style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 600 }}>
          Vendors the customer is actively evaluating
        </h4>
        {[
          { name: "Gong",      tag: "Current tool used for deal inspection and conversational intelligence.",
            win: "Established presence as a standard call recorder and transcription service with basic keyword-based coaching.",
            oliv: "Alphard's AI agents don't just record; they act on insights. Where Gong offers \"analytics-first\", Alphard proactively updates the CRM, triggers automated next-step alerts, and supports every revenue role with autonomous task execution.",
            plan: "Offer full white-glove support to migrate historical call data from Gong at no additional cost and help fully sunset Gong within 60 days." },
          { name: "Clari",     tag: "Being evaluated for forecasting and roll-up forecasts.",
            win: "Strong roll-up forecast layer with mature QBR workflows.",
            oliv: "Alphard's forecast is evidence-based per deal — drivers and risks tie back to clip-level evidence rather than rep-submitted gut.",
            plan: "Offer side-by-side forecast accuracy comparison over a 4-week shadow period." },
        ].map((c) => (
          <div key={c.name} className="recessed p-4 mb-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-surface border border-line grid place-items-center text-[11px] font-semibold text-ink-2">
                {c.name[0]}
              </div>
              <div>
                <div className="text-[13.5px] font-semibold text-ink">{c.name}</div>
                <div className="text-[12px] text-muted">{c.tag}</div>
              </div>
            </div>
            <Row label="Where They Win" value={c.win} />
            <Row label="Where Alphy Wins" value={c.oliv} accent />
            <div className="p-3 mt-3 rounded-md" style={{ background: "var(--accent-soft)", border: "1px solid #DDDDFD" }}>
              <div className="text-[11px] font-semibold mb-1" style={{ color: "var(--accent)" }}>Plan of Action</div>
              <div className="text-[12.5px] text-ink-2">
                <strong>Price comparison &amp; fast onramp:</strong> {c.plan}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="mt-2">
      <div className="text-[11px] font-semibold mb-0.5" style={{ color: accent ? "var(--accent-deep)" : "var(--muted)" }}>
        {label}
      </div>
      <div className="text-[12.5px] text-ink-2 leading-relaxed">{value}</div>
    </div>
  );
}

function HealthCommittee() {
  return (
    <div className="space-y-3">
      {dealDetail.buyingCommittee.map((p, i) => (
        <div key={i} className="space-y-2">
          <div className="recessed px-3 py-1.5 inline-flex items-center gap-2">
            <span className="text-[12.5px] font-semibold text-ink">{p.fn}</span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-ink text-white">{p.tag}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ContactCard
              name={p.customer.name}
              title={p.customer.title}
              pills={p.customer.pills}
              score={p.customer.score}
              side="customer"
            />
            {p.internal ? (
              <ContactCard
                name={p.internal.name}
                title={p.internal.title}
                state={p.internal.state}
                lastEngaged={p.internal.lastEngaged}
                side="internal"
              />
            ) : (
              <div className="card p-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-[12.5px] text-ink-2 mb-2">Alphy found relevant contacts that may match this role</div>
                  <button className="text-[11.5px] font-medium px-2.5 h-7 rounded-full border border-line bg-surface hover:bg-surface-2">
                    View Counterparts
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ContactCard({
  name, title, pills, score, state, lastEngaged, side,
}: {
  name: string; title: string;
  pills?: string[]; score?: number;
  state?: string; lastEngaged?: string;
  side: "customer" | "internal";
}) {
  const initials = name.split(" ").map((s) => s[0]).join("").slice(0, 2);
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full grid place-items-center text-[12px] font-semibold"
          style={{
            background: side === "customer" ? "var(--ink)" : "var(--accent)",
            color: side === "customer" ? "white" : "var(--accent-ink)",
          }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-semibold text-ink">{name}</div>
          <div className="text-[11.5px] text-muted">{title}</div>
        </div>
        {score !== undefined && (
          <span
            className="inline-flex items-center gap-1 text-[10.5px] font-mono tnum px-1.5 py-0.5 rounded"
            style={{ background: "var(--neg-soft)", color: "var(--neg)" }}
          >
            <Heart size={10} strokeWidth={1.6} fill="var(--neg)" />
            {score}/5
          </span>
        )}
      </div>
      {pills && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {pills.map((p) => (
            <span key={p} className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-bg-deep text-ink-2">{p}</span>
          ))}
        </div>
      )}
      {state && (
        <div className="mt-2.5 flex items-center gap-3 text-[11px]">
          <span
            className="inline-flex items-center gap-1.5"
            style={{ color: state.includes("No") ? "var(--neg)" : "var(--pos)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "currentColor" }} />
            {state}
          </span>
          <span className="text-muted">Last: {lastEngaged}</span>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// 5. Timeline
// =====================================================================
function TimelineTab() {
  const [view, setView] = useState<"engagement" | "activities">("engagement");
  return (
    <div>
      <div className="flex gap-1 mb-4 border-b border-line">
        <button onClick={() => setView("engagement")}
          className={`text-[12.5px] font-medium px-3 py-2 -mb-px ${view === "engagement" ? "text-ink border-b-2 border-ink" : "text-muted hover:text-ink"}`}>
          Engagement <span className="ml-1 text-[10px] font-mono tnum text-muted">6</span>
        </button>
        <button onClick={() => setView("activities")}
          className={`text-[12.5px] font-medium px-3 py-2 -mb-px ${view === "activities" ? "text-ink border-b-2 border-ink" : "text-muted hover:text-ink"}`}>
          Activities <span className="ml-1 text-[10px] font-mono tnum text-muted">71</span>
        </button>
      </div>

      {(["meeting", "email", "call"] as const).map((kind) => {
        const Icon = kind === "meeting" ? Video : kind === "email" ? Mail : Phone;
        const items = dealDetail.timeline.filter((t) => t.type === kind);
        if (items.length === 0) return null;
        return (
          <div key={kind} className="mb-5">
            <div className="recessed px-3 py-1.5 inline-flex items-center gap-2 mb-2">
              <Icon size={13} strokeWidth={1.6} style={{ color: "var(--ink-2)" }} />
              <span className="text-[12.5px] font-semibold text-ink capitalize">{kind === "meeting" ? "Meetings" : kind === "email" ? "Emails" : "Calls"}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {items.map((t, i) => (
                <div key={i} className="card p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-full grid place-items-center" style={{ background: "var(--bg-deep)" }}>
                      <Icon size={11} strokeWidth={1.6} className="text-muted" />
                    </div>
                    <div className="text-[12.5px] font-semibold text-ink truncate">{t.title}</div>
                  </div>
                  <div className="text-[12.5px] text-ink-2 leading-relaxed">{t.body}</div>
                  <div className="text-[10.5px] text-muted mt-2">{t.when}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =====================================================================
// 6. Action Plan
// =====================================================================
function ActionPlanTab() {
  const toast = useToast();
  const a = dealDetail.actionPlan;
  const [doneMap, setDoneMap] = useState<Set<string>>(() => {
    const init = new Set<string>();
    a.milestones.forEach((m) => m.items.forEach((it, i) => { if (it.done) init.add(`${m.stage}::${i}`); }));
    return init;
  });
  const toggleMilestone = (stage: string, idx: number, label: string) => {
    setDoneMap((s) => {
      const k = `${stage}::${idx}`;
      const n = new Set(s);
      if (n.has(k)) { n.delete(k); }
      else { n.add(k); toast({ tone: "success", title: "Milestone completed", body: label }); }
      return n;
    });
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <ActionCard kicker="Next Meeting"  status="Accepted"          color="var(--pos)"  title={a.nextMeeting.title} sub={a.nextMeeting.when} icon={<Video size={13} />} />
        <ActionCard kicker="Next Action"   status={a.nextAction.status} color="var(--info)" title={a.nextAction.title}  icon={<ArrowRight size={13} />} />
        <ActionCard kicker="Next follow-up" status="Overdue 3 days"    color="var(--warn)" title={a.nextFollowUp.title} icon={<Mail size={13} />} />
      </div>

      <div className="card p-5">
        <SectionHeader kicker="Mutual Action Plan" title="Milestones" right={
          <select className="text-[11.5px] h-7 px-2 rounded border border-line bg-surface text-ink">
            <option>All</option><option>Open</option><option>Done</option>
          </select>
        } />
        <div className="space-y-3">
          {a.milestones.map((m) => {
            const completed = m.items.filter((it, i) => doneMap.has(`${m.stage}::${i}`)).length;
            const pct = m.items.length ? completed / m.items.length : 0;
            return (
              <div key={m.stage} className="rounded-md border border-line bg-surface overflow-hidden">
                <div className="flex items-center px-4 py-2.5">
                  <div className="text-[12.5px] font-semibold text-ink flex-1">{m.stage}</div>
                  <div className="text-[10.5px] font-mono tnum text-muted mr-3">{completed}/{m.items.length}</div>
                  <div className="w-28"><HealthBar pct={pct * 100} color={pct === 1 ? "var(--pos)" : "var(--warn)"} /></div>
                </div>
                <div className="border-t border-line">
                  {m.items.map((it, i) => {
                    const done = doneMap.has(`${m.stage}::${i}`);
                    return (
                      <button key={i} onClick={() => toggleMilestone(m.stage, i, it.label)}
                        className="w-full text-left grid grid-cols-[24px_1fr_140px_120px] items-center gap-3 px-4 py-2 border-b border-line last:border-0 hover:bg-bg-deep">
                        <span
                          className="w-4 h-4 rounded grid place-items-center flex-shrink-0"
                          style={{ background: done ? "var(--pos)" : "transparent", border: done ? "0" : "1px solid var(--line)" }}
                        >
                          {done && <CheckCircle2 size={11} strokeWidth={2} style={{ color: "white" }} />}
                        </span>
                        <span className={`text-[12px] ${done ? "text-muted line-through" : "text-ink-2"}`}>{it.label}</span>
                        <span className="text-[11.5px] text-ink-2">{it.assignee}</span>
                        <span className="text-[11.5px] text-muted">{fmtDate(it.due)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ActionCard({ kicker, status, color, title, sub, icon }: {
  kicker: string; status: string; color: string; title: string; sub?: string; icon: React.ReactNode;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="mono-label inline-flex items-center gap-1.5">
          <span className="text-muted">{icon}</span>{kicker}
        </div>
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{ background: `${color}20`, color }}
        >
          {status}
        </span>
      </div>
      <div className="text-[13px] font-medium text-ink leading-snug">{title}</div>
      {sub && <div className="text-[11.5px] text-muted mt-1">{sub}</div>}
      <div className="mt-3"><HealthBar pct={kicker === "Next Meeting" ? 80 : kicker === "Next Action" ? 50 : 25} color={color} /></div>
    </div>
  );
}

// =====================================================================
// 7. Coaching
// =====================================================================
function CoachingTab() {
  const c = dealDetail.coaching;
  return (
    <div className="grid grid-cols-[300px_1fr] gap-5">
      <div className="card p-4 self-start">
        <div className="space-y-1">
          {c.framework.map((f) => (
            <details key={f.cat} className="group">
              <summary className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-surface-2 cursor-pointer">
                <span className="text-[12.5px] font-medium text-ink">{f.cat}</span>
                <span
                  className="text-[10.5px] font-mono tnum px-1.5 rounded"
                  style={{
                    background: f.score >= 4 ? "var(--pos-soft)" : "var(--warn-soft)",
                    color:      f.score >= 4 ? "var(--pos)"      : "var(--warn)",
                  }}
                >
                  {f.score}/5
                </span>
              </summary>
              <div className="pl-4 space-y-0.5 py-1">
                {f.items.map((it) => (
                  <div key={it} className="text-[11.5px] text-muted py-1">— {it}</div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="card p-5 flex items-center gap-5">
          <CircularScore value={c.overall} />
          <div>
            <div className="mono-label mb-1">Coaching score</div>
            <div className="text-[12.5px] text-ink-2 leading-relaxed">
              <strong>Improvement Required: </strong>{c.summary.improvement}
            </div>
            <div className="text-[12.5px] text-ink-2 leading-relaxed mt-1.5">
              <strong>Strengths: </strong>{c.summary.strength}
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="mono-label mb-2" style={{ color: "var(--pos)" }}>Strengths</div>
          {c.strengths.map((s) => (
            <div key={s.k} className="mb-2.5">
              <span className="text-[13px] font-semibold text-ink">{s.k}: </span>
              <span className="text-[13px] text-ink-2">{s.v}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-2"><EvidenceBadge n={2} /></div>
          <div className="mt-3"><HealthBar pct={75} color="var(--pos)" /></div>
        </div>

        <div className="card p-5">
          <div className="mono-label mb-2" style={{ color: "var(--warn)" }}>Focus Areas</div>
          {c.focusAreas.map((f) => (
            <div key={f.k} className="mb-2.5">
              <span className="text-[13px] font-semibold text-ink">{f.k}: </span>
              <span className="text-[13px] text-ink-2">{f.v}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-2"><EvidenceBadge n={2} /></div>
          <div className="mt-3"><HealthBar pct={45} color="var(--warn)" /></div>
        </div>
      </div>
    </div>
  );
}

function CircularScore({ value }: { value: number }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--line)" strokeWidth="8" />
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--accent-deep)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 50 50)" />
      <text x="50" y="58" textAnchor="middle" fontSize="24" fontWeight="700" fill="var(--ink)">{value}</text>
    </svg>
  );
}

// =====================================================================
// 8. CRM Updates
// =====================================================================
function CrmTab() {
  const [view, setView] = useState<"sug" | "upd" | "hist">("sug");
  const [decisions, setDecisions] = useState<Record<string, "accepted" | "rejected" | undefined>>({});
  return (
    <div className="grid grid-cols-[220px_1fr] gap-5">
      <nav className="card p-2 self-start">
        <button onClick={() => setView("sug")} className={`block w-full text-left text-[12.5px] px-3 py-2 rounded-lg ${view === "sug" ? "bg-bg-deep text-ink font-medium" : "text-muted hover:bg-surface-2 hover:text-ink"}`}>
          AI Suggestions <span className="float-right text-[10px] font-mono tnum">4</span>
        </button>
        <button onClick={() => setView("upd")} className={`block w-full text-left text-[12.5px] px-3 py-2 rounded-lg ${view === "upd" ? "bg-bg-deep text-ink font-medium" : "text-muted hover:bg-surface-2 hover:text-ink"}`}>
          AI Updates <span className="float-right text-[10px] font-mono tnum">3</span>
        </button>
        <button onClick={() => setView("hist")} className={`block w-full text-left text-[12.5px] px-3 py-2 rounded-lg ${view === "hist" ? "bg-bg-deep text-ink font-medium" : "text-muted hover:bg-surface-2 hover:text-ink"}`}>
          Updates History <span className="float-right text-[10px] font-mono tnum">4</span>
        </button>
      </nav>
      <div className="space-y-3">
        <div className="recessed px-4 py-2 inline-flex items-center gap-2">
          <Sparkles size={13} strokeWidth={1.6} style={{ color: "var(--accent-deep)" }} />
          <span className="text-[13px] font-semibold text-ink">
            {view === "sug" ? "AI Suggestions" : view === "upd" ? "AI Updates" : "Updates History"}
          </span>
        </div>
        {dealDetail.crmSuggestions.map((s) => {
          const dec = decisions[s.id];
          return (
            <div key={s.id} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[13px] font-semibold text-ink">{s.field}</div>
                <Sparkles size={13} strokeWidth={1.6} style={{ color: "var(--accent-deep)" }} />
              </div>
              <div className="recessed p-3 mb-2 text-[12.5px] text-ink-2">{s.proposed}</div>
              <div className="text-[11px] text-muted mb-2">Current: {s.current}</div>
              {dec ? (
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full"
                  style={{
                    background: dec === "accepted" ? "var(--pos-soft)" : "var(--neg-soft)",
                    color:      dec === "accepted" ? "var(--pos)"      : "var(--neg)",
                  }}
                >
                  {dec === "accepted" ? "Accepted — synced to CRM" : "Rejected"}
                </span>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setDecisions({ ...decisions, [s.id]: "accepted" })}
                    className="text-[11.5px] font-medium px-3 h-8 rounded-lg inline-flex items-center gap-1.5"
                    style={{ background: "var(--pos)", color: "white" }}
                  >
                    <CheckCircle2 size={12} strokeWidth={2} /> Accept
                  </button>
                  <button
                    onClick={() => setDecisions({ ...decisions, [s.id]: "rejected" })}
                    className="text-[11.5px] font-medium px-3 h-8 rounded-lg border border-line bg-surface hover:bg-surface-2 inline-flex items-center gap-1.5"
                  >
                    <X size={12} strokeWidth={2} /> Reject
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =====================================================================
// 9. Assets
// =====================================================================
function AssetsTab({ dealName }: { dealName: string }) {
  const toast = useToast();
  const [state, setState] = useState<Record<string, "idle" | "generating" | "ready">>({});
  const generate = (name: string) => {
    setState((s) => ({ ...s, [name]: "generating" }));
    setTimeout(() => {
      setState((s) => ({ ...s, [name]: "ready" }));
      toast({ tone: "success", title: `${name} generated`, body: `Tailored to ${dealName}.` });
    }, 1100);
  };
  return (
    <div>
      <div className="recessed p-4 mb-4">
        <div className="mono-label mb-1" style={{ color: "var(--accent)" }}>Instant Assets</div>
        <div className="text-[12.5px] text-ink-2">Ready-to-use templates to accelerate conversations and decision-making.</div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {dealDetail.assets.map((a) => {
          const Icon = a.type === "ppt" ? Presentation : a.type === "xls" ? FileSpreadsheet : FileText;
          const tint = a.type === "xls" ? "var(--pos-soft)" : a.type === "ppt" ? "var(--warn-soft)" : "var(--info-soft)";
          const ink = a.type === "xls" ? "var(--pos)" : a.type === "ppt" ? "var(--warn)" : "var(--info)";
          const st = state[a.name] ?? "idle";
          return (
            <div key={a.name} className="card p-4 flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-md grid place-items-center" style={{ background: tint }}>
                  <Icon size={16} strokeWidth={1.6} style={{ color: ink }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-semibold text-ink">{a.name}</div>
                  <div className="text-[11px] text-muted">{a.body}</div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-line">
                <span className="text-[10px] font-medium text-muted px-1.5 py-0.5 rounded bg-bg-deep">Proposal</span>
                {st === "ready" ? (
                  <button onClick={() => toast({ tone: "info", title: `Downloaded ${a.name}` })}
                    className="text-[11px] font-medium inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-line bg-surface hover:bg-bg-deep">
                    <Download size={10} strokeWidth={1.8} /> Download
                  </button>
                ) : st === "generating" ? (
                  <span className="text-[11px] inline-flex items-center gap-1.5 h-7 px-2.5 text-muted">
                    <Loader2 size={11} strokeWidth={1.8} className="animate-spin" /> Generating…
                  </span>
                ) : (
                  <button onClick={() => generate(a.name)}
                    className="text-[11px] font-medium inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-ink text-white hover:bg-ink-2">
                    <Plus size={10} strokeWidth={2} /> Create
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
