"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Target, Search, X, ArrowRight, Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { outcomes as initialOutcomes, slugify, accounts, type CustomerOutcome, type OutcomeStatus } from "@/lib/mock";
import { Logo } from "@/components/Logo";
import { useToast } from "@/components/Toast";
import { Modal, ModalButton, FormField, TextInput, SelectInput } from "@/components/Modal";

const STATUS_META: Record<OutcomeStatus, { label: string; tone: string; soft: string }> = {
  ahead:      { label: "Ahead",     tone: "var(--accent)", soft: "var(--accent-soft)" },
  "on-track": { label: "On track",  tone: "var(--pos)",    soft: "var(--pos-soft)" },
  watch:      { label: "Watch",     tone: "var(--warn)",   soft: "var(--warn-soft)" },
  "at-risk":  { label: "At risk",   tone: "var(--neg)",    soft: "var(--neg-soft)" },
};

export default function OutcomesPage() {
  const toast = useToast();
  const [filter, setFilter] = useState<"all" | OutcomeStatus>("all");
  const [search, setSearch] = useState("");
  const [outcomes, setOutcomes] = useState<CustomerOutcome[]>(initialOutcomes);
  const [editing, setEditing] = useState<CustomerOutcome | null>(null);
  const [newOpen, setNewOpen] = useState(false);

  const filtered = useMemo(() => {
    const lc = search.trim().toLowerCase();
    return outcomes
      .filter((o) => filter === "all" || o.status === filter)
      .filter((o) => !lc || `${o.title} ${o.account} ${o.metric}`.toLowerCase().includes(lc));
  }, [filter, search, outcomes]);

  const updateStatus = (id: string, status: OutcomeStatus) => {
    setOutcomes((s) => s.map((o) => o.id === id ? { ...o, status } : o));
    toast({ tone: "success", title: "Status updated", body: `Marked as ${STATUS_META[status].label}.` });
    setEditing((prev) => prev && prev.id === id ? { ...prev, status } : prev);
  };
  const updateProgress = (id: string, progress: number) => {
    const clamped = Math.max(0, Math.min(100, progress));
    setOutcomes((s) => s.map((o) => o.id === id ? { ...o, progress: clamped } : o));
    setEditing((prev) => prev && prev.id === id ? { ...prev, progress: clamped } : prev);
  };

  const totals = (["ahead", "on-track", "watch", "at-risk"] as OutcomeStatus[]).map(
    (s) => ({ s, count: outcomes.filter((o) => o.status === s).length })
  );
  const weighted = Math.round(outcomes.reduce((acc, o) => acc + o.progress, 0) / outcomes.length);

  return (
    <AppShell>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <div className="mono-label mb-1.5">Customer Outcomes</div>
          <h1 className="display" style={{ fontSize: 22 }}>What we promised customers</h1>
          <div className="text-[12.5px] text-muted mt-1">Measurable customer-facing goals — not stage exit criteria.</div>
        </div>
        <button onClick={() => setNewOpen(true)}
          className="text-[12px] font-medium h-8 px-3 rounded-md bg-ink text-white inline-flex items-center gap-1.5">
          <Plus size={12} /> New outcome
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        <div className="card p-4 col-span-1">
          <div className="mono-label">Weighted progress</div>
          <div className="display tnum mt-1" style={{ fontSize: 28 }}>{weighted}%</div>
          <div className="health-bar mt-2"><span style={{ width: `${weighted}%`, background: "var(--ink)" }} /></div>
        </div>
        {totals.map(({ s, count }) => {
          const m = STATUS_META[s];
          return (
            <button key={s} onClick={() => setFilter(s)}
              className={`card p-4 text-left transition-colors ${filter === s ? "ring-2 ring-[color:var(--ink)]" : "hover:bg-bg-deep"}`}>
              <div className="mono-label" style={{ color: m.tone }}>{m.label}</div>
              <div className="display tnum mt-1" style={{ fontSize: 28 }}>{count}</div>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3">
        <button onClick={() => setFilter("all")}
          className={`pill-nav-item ${filter === "all" ? "active" : ""}`}>All</button>
        {(["ahead", "on-track", "watch", "at-risk"] as OutcomeStatus[]).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`pill-nav-item ${filter === s ? "active" : ""}`}>{STATUS_META[s].label}</button>
        ))}
        <div className="ml-auto flex items-center gap-2 h-8 w-72 px-2.5 rounded-md border border-line bg-surface">
          <Search size={12} strokeWidth={1.6} className="text-muted-2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search outcomes…"
            className="flex-1 bg-transparent outline-none text-[12px] placeholder:text-muted-2" />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-deep border-b border-line">
              {["Outcome", "Account", "Status", "Progress", "Metric", "Due"].map((h) => (
                <th key={h} className="text-left px-3 py-2 text-[10.5px] font-semibold text-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => <OutcomeRow key={o.id} outcome={o} onClick={() => setEditing(o)} />)}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-[12.5px] text-muted">
                No outcomes match. <button onClick={() => { setFilter("all"); setSearch(""); }} className="text-ink underline">Clear filters</button>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <OutcomeEditor outcome={editing} onClose={() => setEditing(null)} onStatusChange={updateStatus} onProgressChange={updateProgress} />
      <NewOutcomeModal open={newOpen} onClose={() => setNewOpen(false)}
        onCreate={(o) => { setOutcomes((s) => [o, ...s]); toast({ tone: "success", title: "Outcome created", body: o.title }); setNewOpen(false); }} />
    </AppShell>
  );
}

function NewOutcomeModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (o: CustomerOutcome) => void }) {
  const [title, setTitle] = useState("");
  const [account, setAccount] = useState("Cloudflare");
  const [metric, setMetric] = useState("");
  const [current, setCurrent] = useState("");
  const [target, setTarget] = useState("");
  const [due, setDue] = useState("Q3");
  const [status, setStatus] = useState<OutcomeStatus>("on-track");
  const reset = () => { setTitle(""); setMetric(""); setCurrent(""); setTarget(""); };
  const submit = () => {
    if (!title.trim()) return;
    onCreate({
      id: `o${Math.floor(Math.random() * 100000)}`,
      account, title: title.trim(), metric: metric.trim() || "—",
      current: current.trim() || "—", target: target.trim() || "—",
      progress: status === "ahead" ? 100 : status === "on-track" ? 60 : status === "watch" ? 35 : 15,
      status, due: due.trim() || "Q3",
    });
    reset();
  };
  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }}
      title="Create new outcome" description="Define a measurable customer goal."
      width={520}
      footer={
        <>
          <ModalButton onClick={() => { reset(); onClose(); }}>Cancel</ModalButton>
          <ModalButton primary onClick={submit} disabled={!title.trim()}>Create outcome</ModalButton>
        </>
      }>
      <FormField label="Title">
        <TextInput value={title} onChange={setTitle} placeholder="Reduce time-to-first-value to under 14 days" />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Account">
          <SelectInput value={account} onChange={setAccount}
            options={Array.from(new Set(accounts.map((a) => a.name))).map((n) => ({ value: n, label: n }))} />
        </FormField>
        <FormField label="Status">
          <SelectInput<OutcomeStatus> value={status} onChange={setStatus}
            options={[{ value: "ahead", label: "Ahead" }, { value: "on-track", label: "On track" }, { value: "watch", label: "Watch" }, { value: "at-risk", label: "At risk" }]} />
        </FormField>
        <FormField label="Metric">
          <TextInput value={metric} onChange={setMetric} placeholder="Days to first activated user" />
        </FormField>
        <FormField label="Due">
          <TextInput value={due} onChange={setDue} placeholder="Q3 / Sep 30 / 2026-09-30" />
        </FormField>
        <FormField label="Current value">
          <TextInput value={current} onChange={setCurrent} placeholder="—" />
        </FormField>
        <FormField label="Target value">
          <TextInput value={target} onChange={setTarget} placeholder="—" />
        </FormField>
      </div>
    </Modal>
  );
}

function OutcomeEditor({ outcome, onClose, onStatusChange, onProgressChange }: {
  outcome: CustomerOutcome | null;
  onClose: () => void;
  onStatusChange: (id: string, s: OutcomeStatus) => void;
  onProgressChange: (id: string, p: number) => void;
}) {
  if (!outcome) return null;
  const m = STATUS_META[outcome.status];
  return (
    <>
      <div className="fixed inset-0 bg-ink/30 z-[90] fade-in" onClick={onClose} />
      <aside className="fixed top-0 right-0 h-screen w-[440px] bg-bg z-[95] drawer-anim border-l border-line flex flex-col">
        <div className="px-4 h-14 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo name={outcome.account} size={26} rounded={5} />
            <div>
              <div className="text-[12.5px] font-semibold text-ink">{outcome.account}</div>
              <div className="text-[10.5px] text-muted">Customer outcome</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-md grid place-items-center text-muted hover:text-ink hover:bg-bg-deep">
            <X size={13} strokeWidth={1.6} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <div className="mono-label mb-1.5">Outcome</div>
            <div className="text-[14px] font-semibold text-ink leading-snug">{outcome.title}</div>
            <div className="text-[11.5px] text-muted mt-1">{outcome.metric} · {outcome.current} → {outcome.target} · due {outcome.due}</div>
          </div>

          <div className="card p-4">
            <div className="mono-label mb-2">Status</div>
            <div className="grid grid-cols-2 gap-1.5">
              {(["ahead", "on-track", "watch", "at-risk"] as OutcomeStatus[]).map((s) => {
                const sel = outcome.status === s;
                const sm = STATUS_META[s];
                return (
                  <button key={s} onClick={() => onStatusChange(outcome.id, s)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-md border text-[11.5px] font-medium"
                    style={sel
                      ? { background: sm.soft, color: sm.tone, borderColor: sm.tone }
                      : { background: "var(--surface)", color: "var(--ink-2)", borderColor: "var(--line)" }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: sm.tone }} />
                    {sm.label}
                    {sel && <Check size={11} strokeWidth={2.4} className="ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="mono-label">Progress</span>
              <span className="text-[11.5px] font-mono tnum text-ink">{outcome.progress}%</span>
            </div>
            <div className="health-bar mb-3"><span style={{ width: `${outcome.progress}%`, background: m.tone }} /></div>
            <input type="range" min={0} max={100} value={outcome.progress}
              onChange={(e) => onProgressChange(outcome.id, parseInt(e.target.value))}
              className="w-full" />
            <div className="flex items-center justify-between text-[10.5px] text-muted-2 mt-1">
              <span>0%</span><span>50%</span><span>100%</span>
            </div>
          </div>

          <div className="card p-4">
            <div className="mono-label mb-2">Recent activity</div>
            <div className="space-y-2 text-[11.5px]">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: "var(--accent-deep)" }} />
                <div>
                  <div className="text-ink-2">Progress reading auto-updated from Mixpanel</div>
                  <div className="text-muted-2 text-[10px] mt-0.5">today · 09:14 AM</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: "var(--muted-2)" }} />
                <div>
                  <div className="text-ink-2">Status changed by Walid: on-track → {m.label.toLowerCase()}</div>
                  <div className="text-muted-2 text-[10px] mt-0.5">3 days ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-line">
          <Link href={`/accounts/${slugify(outcome.account)}`}
            className="text-[12px] text-ink-2 hover:text-ink inline-flex items-center gap-1">
            Open {outcome.account} workspace <ArrowRight size={12} />
          </Link>
        </div>
      </aside>
    </>
  );
}

function OutcomeRow({ outcome, onClick }: { outcome: CustomerOutcome; onClick: () => void }) {
  const m = STATUS_META[outcome.status];
  return (
    <tr onClick={onClick} className="border-b border-line hover:bg-surface-2 cursor-pointer">
      <td className="px-3 py-2.5 max-w-[400px]">
        <div className="text-[12.5px] font-semibold text-ink leading-snug">{outcome.title}</div>
        <div className="text-[10.5px] text-muted">{outcome.current} → {outcome.target}</div>
      </td>
      <td className="px-3 py-2.5">
        <Link href={`/accounts/${slugify(outcome.account)}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 hover:underline">
          <Logo name={outcome.account} size={18} rounded={4} />
          <span className="text-[12px] text-ink-2 font-medium">{outcome.account}</span>
        </Link>
      </td>
      <td className="px-3 py-2.5">
        <span className="inline-flex items-center h-5 px-1.5 rounded text-[10.5px] font-medium"
          style={{ background: m.soft, color: m.tone }}>
          {m.label}
        </span>
      </td>
      <td className="px-3 py-2.5 min-w-[140px]">
        <div className="health-bar"><span style={{ width: `${outcome.progress}%`, background: m.tone }} /></div>
        <div className="text-[10px] text-muted-2 mt-0.5 tnum">{outcome.progress}%</div>
      </td>
      <td className="px-3 py-2.5 text-[11.5px] text-ink-2">{outcome.metric}</td>
      <td className="px-3 py-2.5 text-[11.5px] text-muted tnum">{outcome.due}</td>
    </tr>
  );
}
