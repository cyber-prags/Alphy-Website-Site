"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus, Search, X, ArrowRight, Check, ChevronDown, ChevronRight,
  User2, Flag, CircleCheckBig, LayoutGrid, List, Clock,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  outcomes as initialOutcomes, slugify, accounts,
  type CustomerOutcome, type OutcomeStatus, type OutcomeAction, type OutcomePriority,
} from "@/lib/mock";
import { Logo } from "@/components/Logo";
import { useToast } from "@/components/Toast";
import { Modal, ModalButton, FormField, TextInput, SelectInput } from "@/components/Modal";

const STATUS_META: Record<OutcomeStatus, { label: string; tone: string; soft: string }> = {
  ahead:      { label: "Ahead",    tone: "var(--accent)", soft: "var(--accent-soft)" },
  "on-track": { label: "On track", tone: "var(--pos)",    soft: "var(--pos-soft)" },
  watch:      { label: "Watch",    tone: "var(--warn)",   soft: "var(--warn-soft)" },
  "at-risk":  { label: "At risk",  tone: "var(--neg)",    soft: "var(--neg-soft)" },
};

const PRIORITY_META: Record<OutcomePriority, { label: string; tone: string; soft: string }> = {
  high:   { label: "High",   tone: "var(--neg)",  soft: "var(--neg-soft)" },
  medium: { label: "Medium", tone: "var(--warn)", soft: "var(--warn-soft)" },
  low:    { label: "Low",    tone: "var(--muted)",soft: "var(--bg-deep)" },
};

type View = "table" | "board";

export default function OutcomesPage() {
  const toast = useToast();
  const [filter, setFilter] = useState<"all" | OutcomeStatus>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [outcomes, setOutcomes] = useState<CustomerOutcome[]>(initialOutcomes);
  const [editing, setEditing] = useState<CustomerOutcome | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [view, setView] = useState<View>("table");
  const [newOpen, setNewOpen] = useState(false);

  const allOwners = useMemo(() =>
    Array.from(new Set(outcomes.map((o) => o.owner))).sort(), [outcomes]);

  const filtered = useMemo(() => {
    const lc = search.trim().toLowerCase();
    return outcomes
      .filter((o) => filter === "all" || o.status === filter)
      .filter((o) => ownerFilter === "all" || o.owner === ownerFilter)
      .filter((o) => !lc || `${o.title} ${o.account} ${o.metric} ${o.owner}`.toLowerCase().includes(lc));
  }, [filter, ownerFilter, search, outcomes]);

  const toggleAction = (outcomeId: string, actionId: string) => {
    setOutcomes((s) => s.map((o) => {
      if (o.id !== outcomeId) return o;
      const actions = o.actions.map((a) => a.id === actionId ? { ...a, done: !a.done } : a);
      const doneCount = actions.filter((a) => a.done).length;
      const progress = Math.round((doneCount / actions.length) * 100);
      return { ...o, actions, progress };
    }));
  };

  const updateStatus = (id: string, status: OutcomeStatus) => {
    setOutcomes((s) => s.map((o) => o.id === id ? { ...o, status } : o));
    toast({ tone: "success", title: "Status updated", body: `Marked as ${STATUS_META[status].label}.` });
    setEditing((prev) => prev && prev.id === id ? { ...prev, status } : prev);
  };

  const toggleExpand = (id: string) => {
    setExpanded((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const totals = (["ahead", "on-track", "watch", "at-risk"] as OutcomeStatus[]).map(
    (s) => ({ s, count: outcomes.filter((o) => o.status === s).length })
  );
  const weighted = Math.round(outcomes.reduce((acc, o) => acc + o.progress, 0) / outcomes.length);
  const totalActions = outcomes.reduce((s, o) => s + o.actions.length, 0);
  const doneActions = outcomes.reduce((s, o) => s + o.actions.filter((a) => a.done).length, 0);

  return (
    <AppShell>
      <div className="mb-5 flex items-end justify-between flex-wrap gap-4">
        <div className="flex-1 min-w-0">
          <div className="mono-label mb-1.5">Customer Outcomes</div>
          <h1 className="display" style={{ fontSize: 22 }}>What we promised customers</h1>
          <div className="text-[12.5px] text-muted mt-1">Measurable customer-facing goals with task tracking and ownership.</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-bg-deep rounded-lg p-0.5">
            <button onClick={() => setView("table")}
              className={`w-8 h-7 rounded-md grid place-items-center ${view === "table" ? "bg-ink text-white" : "text-muted"}`}>
              <List size={13} strokeWidth={1.6} />
            </button>
            <button onClick={() => setView("board")}
              className={`w-8 h-7 rounded-md grid place-items-center ${view === "board" ? "bg-ink text-white" : "text-muted"}`}>
              <LayoutGrid size={13} strokeWidth={1.6} />
            </button>
          </div>
          <button onClick={() => setNewOpen(true)}
            className="text-[12px] font-medium h-8 px-3 rounded-md bg-ink text-white inline-flex items-center gap-1.5">
            <Plus size={12} /> New outcome
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-6 gap-3 mb-4">
        <div className="card p-4">
          <div className="mono-label">Weighted progress</div>
          <div className="display tnum mt-1" style={{ fontSize: 28 }}>{weighted}%</div>
          <div className="health-bar mt-2"><span style={{ width: `${weighted}%`, background: "var(--ink)" }} /></div>
        </div>
        <div className="card p-4">
          <div className="mono-label">Actions</div>
          <div className="display tnum mt-1" style={{ fontSize: 28 }}>{doneActions}/{totalActions}</div>
          <div className="health-bar mt-2"><span style={{ width: `${totalActions ? (doneActions / totalActions) * 100 : 0}%`, background: "var(--pos)" }} /></div>
        </div>
        {totals.map(({ s, count }) => {
          const m = STATUS_META[s];
          return (
            <button key={s} onClick={() => setFilter(filter === s ? "all" : s)}
              className={`card p-4 text-left transition-colors ${filter === s ? "ring-2 ring-[color:var(--ink)]" : "hover:bg-bg-deep"}`}>
              <div className="mono-label" style={{ color: m.tone }}>{m.label}</div>
              <div className="display tnum mt-1" style={{ fontSize: 28 }}>{count}</div>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button onClick={() => setFilter("all")}
          className={`pill-nav-item ${filter === "all" ? "active" : ""}`}>All</button>
        {(["ahead", "on-track", "watch", "at-risk"] as OutcomeStatus[]).map((s) => (
          <button key={s} onClick={() => setFilter(filter === s ? "all" : s)}
            className={`pill-nav-item ${filter === s ? "active" : ""}`}>{STATUS_META[s].label}</button>
        ))}

        <span className="w-px h-5 bg-line mx-1" />

        <div className="flex items-center gap-1.5">
          <User2 size={11} strokeWidth={1.6} className="text-muted" />
          <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)}
            className="text-[11.5px] font-medium bg-transparent text-ink outline-none cursor-pointer">
            <option value="all">All owners</option>
            {allOwners.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2 h-8 w-72 px-2.5 rounded-md border border-line bg-surface">
          <Search size={12} strokeWidth={1.6} className="text-muted-2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search outcomes…"
            className="flex-1 bg-transparent outline-none text-[12px] placeholder:text-muted-2" />
          {search && <button onClick={() => setSearch("")} className="text-muted-2 hover:text-ink"><X size={11} /></button>}
        </div>
      </div>

      {/* Table view */}
      {view === "table" && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-deep border-b border-line">
                {["", "Outcome", "Owner", "Account", "Priority", "Status", "Progress", "Actions", "Due"].map((h) => (
                  <th key={h} className="text-left px-3 py-2 text-[10.5px] font-semibold text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const isExpanded = expanded.has(o.id);
                const m = STATUS_META[o.status];
                const pm = PRIORITY_META[o.priority];
                const doneCt = o.actions.filter((a) => a.done).length;
                return (
                  <OutcomeTableRow
                    key={o.id} outcome={o} isExpanded={isExpanded}
                    m={m} pm={pm} doneCt={doneCt}
                    onToggle={() => toggleExpand(o.id)}
                    onEdit={() => setEditing(o)}
                    onToggleAction={(actionId) => toggleAction(o.id, actionId)}
                  />
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-[12.5px] text-muted">
                  No outcomes match. <button onClick={() => { setFilter("all"); setOwnerFilter("all"); setSearch(""); }} className="text-ink underline">Clear filters</button>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Board view */}
      {view === "board" && (
        <div className="grid grid-cols-4 gap-3">
          {(["ahead", "on-track", "watch", "at-risk"] as OutcomeStatus[]).map((s) => {
            const m = STATUS_META[s];
            const cards = filtered.filter((o) => o.status === s);
            return (
              <div key={s} className="min-h-[200px]">
                <div className="flex items-center gap-2 mb-2.5 px-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: m.tone }} />
                  <span className="text-[12px] font-semibold text-ink">{m.label}</span>
                  <span className="text-[10px] font-mono tnum text-muted bg-bg-deep rounded px-1.5 py-0.5">{cards.length}</span>
                </div>
                <div className="space-y-2">
                  {cards.map((o) => {
                    const doneCt = o.actions.filter((a) => a.done).length;
                    const pm = PRIORITY_META[o.priority];
                    return (
                      <button key={o.id} onClick={() => setEditing(o)}
                        className="card p-3 w-full text-left hover:bg-bg-deep transition-colors">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="text-[12px] font-semibold text-ink leading-snug">{o.title}</div>
                          <span className="shrink-0 inline-flex items-center h-4 px-1.5 rounded text-[9px] font-semibold"
                            style={{ background: pm.soft, color: pm.tone }}>{pm.label}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Logo name={o.account} size={14} rounded={3} />
                          <span className="text-[10.5px] text-muted">{o.account}</span>
                        </div>
                        <div className="health-bar mb-1.5"><span style={{ width: `${o.progress}%`, background: m.tone }} /></div>
                        <div className="flex items-center justify-between text-[10px] text-muted">
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-full bg-ink text-white grid place-items-center text-[7px] font-semibold">{o.ownerInitials}</div>
                            <span>{o.owner.split(" ")[0]}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-0.5">
                              <CircleCheckBig size={9} strokeWidth={1.6} /> {doneCt}/{o.actions.length}
                            </span>
                            <span className="inline-flex items-center gap-0.5">
                              <Clock size={9} strokeWidth={1.6} /> {o.due}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {cards.length === 0 && (
                    <div className="text-[11px] text-muted-2 text-center py-6 border border-dashed border-line rounded-lg">No outcomes</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <OutcomeEditor
        outcome={editing} onClose={() => setEditing(null)}
        onStatusChange={updateStatus}
        onToggleAction={(actionId) => { if (editing) toggleAction(editing.id, actionId); }}
        outcomes={outcomes}
      />
      <NewOutcomeModal open={newOpen} onClose={() => setNewOpen(false)}
        owners={allOwners}
        onCreate={(o) => { setOutcomes((s) => [o, ...s]); toast({ tone: "success", title: "Outcome created", body: o.title }); setNewOpen(false); }} />
    </AppShell>
  );
}

function OutcomeTableRow({ outcome: o, isExpanded, m, pm, doneCt, onToggle, onEdit, onToggleAction }: {
  outcome: CustomerOutcome;
  isExpanded: boolean;
  m: { label: string; tone: string; soft: string };
  pm: { label: string; tone: string; soft: string };
  doneCt: number;
  onToggle: () => void;
  onEdit: () => void;
  onToggleAction: (actionId: string) => void;
}) {
  return (
    <>
      <tr className="border-b border-line hover:bg-surface-2 cursor-pointer transition-colors" onClick={onEdit}>
        <td className="px-2 py-2.5 w-7" onClick={(e) => { e.stopPropagation(); onToggle(); }}>
          <button className="w-5 h-5 grid place-items-center rounded hover:bg-bg-deep text-muted">
            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        </td>
        <td className="px-3 py-2.5 max-w-[320px]">
          <div className="text-[12.5px] font-semibold text-ink leading-snug">{o.title}</div>
          <div className="text-[10.5px] text-muted">{o.current} → {o.target}</div>
        </td>
        <td className="px-3 py-2.5">
          <div className="inline-flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-ink text-white grid place-items-center text-[8px] font-semibold">{o.ownerInitials}</div>
            <span className="text-[11.5px] text-ink-2">{o.owner.split(" ")[0]}</span>
          </div>
        </td>
        <td className="px-3 py-2.5">
          <Link href={`/accounts/${slugify(o.account)}`} onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 hover:underline">
            <Logo name={o.account} size={18} rounded={4} />
            <span className="text-[11.5px] text-ink-2">{o.account}</span>
          </Link>
        </td>
        <td className="px-3 py-2.5">
          <span className="inline-flex items-center gap-1 h-5 px-1.5 rounded text-[10px] font-semibold"
            style={{ background: pm.soft, color: pm.tone }}>
            <Flag size={8} strokeWidth={2} />{pm.label}
          </span>
        </td>
        <td className="px-3 py-2.5">
          <span className="inline-flex items-center h-5 px-1.5 rounded text-[10.5px] font-medium"
            style={{ background: m.soft, color: m.tone }}>{m.label}</span>
        </td>
        <td className="px-3 py-2.5 min-w-[120px]">
          <div className="health-bar"><span style={{ width: `${o.progress}%`, background: m.tone }} /></div>
          <div className="text-[10px] text-muted-2 mt-0.5 tnum">{o.progress}%</div>
        </td>
        <td className="px-3 py-2.5">
          <span className="inline-flex items-center gap-1 text-[11px] tnum text-ink-2">
            <CircleCheckBig size={11} strokeWidth={1.6} style={{ color: doneCt === o.actions.length ? "var(--pos)" : "var(--muted)" }} />
            {doneCt}/{o.actions.length}
          </span>
        </td>
        <td className="px-3 py-2.5 text-[11.5px] text-muted tnum">{o.due}</td>
      </tr>
      {isExpanded && (
        <tr className="bg-surface-2">
          <td colSpan={9} className="px-6 py-3">
            <div className="space-y-1">
              {o.actions.map((a) => (
                <div key={a.id} className="flex items-center gap-2.5 py-1"
                  onClick={(e) => { e.stopPropagation(); onToggleAction(a.id); }}>
                  <button className="w-4 h-4 rounded grid place-items-center shrink-0"
                    style={{
                      background: a.done ? "var(--pos)" : "transparent",
                      border: a.done ? "0" : "1.5px solid var(--line-strong)",
                    }}>
                    {a.done && <Check size={10} strokeWidth={2.5} style={{ color: "white" }} />}
                  </button>
                  <span className={`flex-1 text-[12px] ${a.done ? "line-through text-muted" : "text-ink"}`}>{a.label}</span>
                  <div className="inline-flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-bg-deep grid place-items-center text-[7px] font-semibold text-ink">{a.assigneeInitials}</div>
                    <span className="text-[10px] text-muted">{a.assignee.split(" ")[0]}</span>
                  </div>
                  {a.dueDate && (
                    <span className="text-[10px] text-muted tnum">{a.dueDate}</span>
                  )}
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function OutcomeEditor({ outcome, onClose, onStatusChange, onToggleAction, outcomes }: {
  outcome: CustomerOutcome | null;
  onClose: () => void;
  onStatusChange: (id: string, s: OutcomeStatus) => void;
  onToggleAction: (actionId: string) => void;
  outcomes: CustomerOutcome[];
}) {
  if (!outcome) return null;
  const live = outcomes.find((o) => o.id === outcome.id) ?? outcome;
  const m = STATUS_META[live.status];
  const doneCt = live.actions.filter((a) => a.done).length;
  return (
    <>
      <div className="fixed inset-0 bg-ink/30 z-[90] fade-in" onClick={onClose} />
      <aside className="fixed top-0 right-0 h-screen w-[480px] bg-bg z-[95] drawer-anim border-l border-line flex flex-col">
        <div className="px-4 h-14 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo name={live.account} size={26} rounded={5} />
            <div>
              <div className="text-[12.5px] font-semibold text-ink">{live.account}</div>
              <div className="text-[10.5px] text-muted">Customer outcome</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-md grid place-items-center text-muted hover:text-ink hover:bg-bg-deep">
            <X size={13} strokeWidth={1.6} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <div className="text-[14px] font-semibold text-ink leading-snug mb-1">{live.title}</div>
            <div className="text-[11.5px] text-muted">{live.metric} · {live.current} → {live.target} · due {live.due}</div>
            <div className="flex items-center gap-3 mt-2">
              <div className="inline-flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-ink text-white grid place-items-center text-[8px] font-semibold">{live.ownerInitials}</div>
                <span className="text-[11.5px] text-ink-2">{live.owner}</span>
              </div>
              <span className="inline-flex items-center gap-1 h-5 px-1.5 rounded text-[10px] font-semibold"
                style={{ background: PRIORITY_META[live.priority].soft, color: PRIORITY_META[live.priority].tone }}>
                <Flag size={8} strokeWidth={2} />{PRIORITY_META[live.priority].label}
              </span>
            </div>
          </div>

          {/* Status */}
          <div className="card p-4">
            <div className="mono-label mb-2">Status</div>
            <div className="grid grid-cols-2 gap-1.5">
              {(["ahead", "on-track", "watch", "at-risk"] as OutcomeStatus[]).map((s) => {
                const sel = live.status === s;
                const sm = STATUS_META[s];
                return (
                  <button key={s} onClick={() => onStatusChange(live.id, s)}
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

          {/* Progress */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="mono-label">Progress</span>
              <span className="text-[11.5px] font-mono tnum text-ink">{live.progress}%</span>
            </div>
            <div className="health-bar"><span style={{ width: `${live.progress}%`, background: m.tone }} /></div>
            <div className="text-[10.5px] text-muted mt-1.5">{doneCt} of {live.actions.length} actions completed</div>
          </div>

          {/* Action items */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="mono-label">Action items</span>
              <span className="text-[10.5px] font-mono tnum text-muted">{doneCt}/{live.actions.length}</span>
            </div>
            <div className="space-y-1.5">
              {live.actions.map((a) => (
                <div key={a.id} onClick={() => onToggleAction(a.id)}
                  className="flex items-start gap-2.5 p-2 rounded-md hover:bg-bg-deep cursor-pointer">
                  <button className="w-4 h-4 rounded grid place-items-center shrink-0 mt-0.5"
                    style={{
                      background: a.done ? "var(--pos)" : "transparent",
                      border: a.done ? "0" : "1.5px solid var(--line-strong)",
                    }}>
                    {a.done && <Check size={10} strokeWidth={2.5} style={{ color: "white" }} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[12px] leading-snug ${a.done ? "line-through text-muted" : "text-ink"}`}>{a.label}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="inline-flex items-center gap-1">
                        <div className="w-3.5 h-3.5 rounded-full bg-bg-deep grid place-items-center text-[7px] font-semibold text-ink">{a.assigneeInitials}</div>
                        <span className="text-[10px] text-muted">{a.assignee}</span>
                      </div>
                      {a.dueDate && <span className="text-[10px] text-muted tnum">· {a.dueDate}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="card p-4">
            <div className="mono-label mb-2">Recent activity</div>
            <div className="space-y-2 text-[11.5px]">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: "var(--pos)" }} />
                <div>
                  <div className="text-ink-2">Progress auto-updated from completed actions</div>
                  <div className="text-muted-2 text-[10px] mt-0.5">today · 09:14 AM</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: "var(--muted-2)" }} />
                <div>
                  <div className="text-ink-2">{live.owner} updated status to {m.label.toLowerCase()}</div>
                  <div className="text-muted-2 text-[10px] mt-0.5">3 days ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-line">
          <Link href={`/accounts/${slugify(live.account)}`} onClick={onClose}
            className="w-full h-9 rounded-md border border-line bg-surface hover:bg-bg-deep text-[12px] font-medium text-ink inline-flex items-center justify-center gap-1.5 transition-colors">
            Open {live.account} workspace <ArrowRight size={12} />
          </Link>
        </div>
      </aside>
    </>
  );
}

function NewOutcomeModal({ open, onClose, onCreate, owners }: {
  open: boolean; onClose: () => void; onCreate: (o: CustomerOutcome) => void; owners: string[];
}) {
  const [title, setTitle] = useState("");
  const [account, setAccount] = useState("Cloudflare");
  const [metric, setMetric] = useState("");
  const [current, setCurrent] = useState("");
  const [target, setTarget] = useState("");
  const [due, setDue] = useState("Q3");
  const [status, setStatus] = useState<OutcomeStatus>("on-track");
  const [owner, setOwner] = useState(owners[0] || "Sarah Chen");
  const [priority, setPriority] = useState<OutcomePriority>("medium");
  const reset = () => { setTitle(""); setMetric(""); setCurrent(""); setTarget(""); };
  const submit = () => {
    if (!title.trim()) return;
    onCreate({
      id: `o${Math.floor(Math.random() * 100000)}`,
      account, title: title.trim(), metric: metric.trim() || "—",
      current: current.trim() || "—", target: target.trim() || "—",
      progress: 0, status, due: due.trim() || "Q3",
      owner, ownerInitials: owner.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase(),
      priority, actions: [],
    });
    reset();
  };
  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }}
      title="Create new outcome" description="Define a measurable customer goal with ownership."
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
        <FormField label="Owner">
          <SelectInput value={owner} onChange={setOwner}
            options={owners.map((o) => ({ value: o, label: o }))} />
        </FormField>
        <FormField label="Status">
          <SelectInput<OutcomeStatus> value={status} onChange={setStatus}
            options={[{ value: "ahead", label: "Ahead" }, { value: "on-track", label: "On track" }, { value: "watch", label: "Watch" }, { value: "at-risk", label: "At risk" }]} />
        </FormField>
        <FormField label="Priority">
          <SelectInput<OutcomePriority> value={priority} onChange={setPriority}
            options={[{ value: "high", label: "High" }, { value: "medium", label: "Medium" }, { value: "low", label: "Low" }]} />
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
