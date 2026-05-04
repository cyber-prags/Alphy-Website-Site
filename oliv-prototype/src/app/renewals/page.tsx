"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search, Download, ChevronDown, ArrowRight, RefreshCw, AlertTriangle,
  Calendar, CheckCircle2, X, MessageSquare, Send, FileSpreadsheet,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Logo } from "@/components/Logo";
import { Popover, MenuItem, MenuLabel, MenuSeparator } from "@/components/Popover";
import { useToast } from "@/components/Toast";
import { ClosureBadge, useClosure } from "@/components/ClosureContext";
import { accounts, slugify, fmtMoney, type Account } from "@/lib/mock";

const ME = "Walid";

// Derive an effective renewal-days value for any customer.
// Real data sets renewalDays explicitly; for customers with 0, derive a deterministic
// "days from now" so the prototype shows a realistic pipeline.
function effectiveRenewalDays(a: Account): number | null {
  if (a.status !== "Customer") return null;
  if (a.renewalDays !== 0) return a.renewalDays;
  let h = 0;
  for (let i = 0; i < a.id.length; i++) h = (h * 31 + a.id.charCodeAt(i)) >>> 0;
  return 30 + (h % 330); // 30..359
}

function formatRenewalDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type Bucket = "all" | "lapsed" | "lt90" | "91to180" | "181to365";
const BUCKETS: { id: Bucket; label: string; test: (d: number) => boolean }[] = [
  { id: "all",      label: "All",         test: () => true },
  { id: "lapsed",   label: "Lapsed",      test: (d) => d < 0 },
  { id: "lt90",     label: "≤ 90 days",   test: (d) => d >= 0 && d <= 90 },
  { id: "91to180",  label: "91–180 days", test: (d) => d > 90 && d <= 180 },
  { id: "181to365", label: "181–365 days",test: (d) => d > 180 && d <= 365 },
];

type SortKey = "arr-desc" | "arr-asc" | "renewal-asc" | "renewal-desc" | "health-asc";
const SORTS: { key: SortKey; label: string; short: string }[] = [
  { key: "arr-desc",     label: "ARR · high to low",        short: "ARR ↓" },
  { key: "arr-asc",      label: "ARR · low to high",        short: "ARR ↑" },
  { key: "renewal-asc",  label: "Renewal · soonest first",  short: "Renewal ↑" },
  { key: "renewal-desc", label: "Renewal · latest first",   short: "Renewal ↓" },
  { key: "health-asc",   label: "Health · worst first",     short: "Health ↑" },
];

const NEXT_ACTIONS_KEY = "alphard:renewal-actions";

type RenewalRecord = {
  account: Account;
  days: number;
  date: string;
};

// ---------------------------------------------------------------------------

export default function RenewalsPage() {
  const closure = useClosure();
  const toast = useToast();

  const [bucket, setBucket]   = useState<Bucket>("all");
  const [sort, setSort]       = useState<SortKey>("arr-desc");
  const [search, setSearch]   = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [actions, setActions] = useState<Record<string, string>>({});
  const [hydrated, setHydrated] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft]     = useState("");

  useEffect(() => {
    try { setActions(JSON.parse(window.localStorage.getItem(NEXT_ACTIONS_KEY) ?? "{}")); } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(NEXT_ACTIONS_KEY, JSON.stringify(actions)); } catch {}
  }, [actions, hydrated]);

  // Build pipeline: every customer with an effective renewal date
  const pipeline: RenewalRecord[] = useMemo(() => {
    return accounts
      .map((a) => {
        const d = effectiveRenewalDays(a);
        if (d === null) return null;
        return { account: a, days: d, date: formatRenewalDate(d) };
      })
      .filter((x): x is RenewalRecord => !!x);
  }, []);

  // Apply filters + sort
  const filtered = useMemo(() => {
    const lc = search.trim().toLowerCase();
    const t = BUCKETS.find((b) => b.id === bucket)!.test;
    const arr = pipeline
      .filter((r) => t(r.days))
      .filter((r) => !lc || `${r.account.name} ${r.account.industry} ${r.account.owner}`.toLowerCase().includes(lc));
    const cmp: Record<SortKey, (a: RenewalRecord, b: RenewalRecord) => number> = {
      "arr-desc":     (a, b) => b.account.arr - a.account.arr,
      "arr-asc":      (a, b) => a.account.arr - b.account.arr,
      "renewal-asc":  (a, b) => a.days - b.days,
      "renewal-desc": (a, b) => b.days - a.days,
      "health-asc":   (a, b) => a.account.healthScore - b.account.healthScore,
    };
    return [...arr].sort(cmp[sort]);
  }, [pipeline, bucket, sort, search]);

  // KPIs
  const kpis = useMemo(() => {
    const totalArr      = filtered.reduce((s, r) => s + r.account.arr, 0);
    const lapsed        = filtered.filter((r) => r.days < 0);
    const next90        = filtered.filter((r) => r.days >= 0 && r.days <= 90);
    const atRisk        = filtered.filter((r) => r.account.healthScore < 60);
    return {
      total: filtered.length,
      totalArr,
      lapsedCount: lapsed.length,
      next90Count: next90.length,
      next90Arr: next90.reduce((s, r) => s + r.account.arr, 0),
      atRiskCount: atRisk.length,
      atRiskArr: atRisk.reduce((s, r) => s + r.account.arr, 0),
    };
  }, [filtered]);

  // Selection
  const toggleSelect = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((r) => r.account.id)));
  };

  const exportCsv = () => {
    const header = ["Account","ARR","Renewal date","Days","Health","NRR","Owner","Last touch","Next action","Status"];
    const rows = filtered.map((r) => [
      r.account.name,
      r.account.arr,
      r.date,
      r.days,
      r.account.healthScore,
      r.account.nrr,
      r.account.owner,
      r.account.lastTouch,
      actions[r.account.id] ?? "",
      closure.status(`renewal:${r.account.id}`),
    ]);
    const csv = [header, ...rows].map((row) =>
      row.map((c) => {
        const s = String(c ?? "");
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(",")
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "renewals.csv"; a.click();
    URL.revokeObjectURL(url);
    toast({ tone: "success", title: "Exported", body: `${filtered.length} renewals downloaded as CSV` });
  };

  const bulkMarkReviewed = () => {
    selected.forEach((id) => closure.act(`renewal:${id}`, ME, "Marked reviewed (bulk)"));
    toast({ tone: "success", title: "Marked reviewed", body: `${selected.size} renewals updated` });
    setSelected(new Set());
  };
  const bulkSendCheckin = () => {
    selected.forEach((id) => closure.act(`renewal:${id}`, ME, "Sent check-in email"));
    toast({ tone: "success", title: "Check-ins drafted", body: `${selected.size} emails ready in Gmail` });
    setSelected(new Set());
  };
  const bulkAssign = (owner: string) => {
    selected.forEach((id) => closure.assign(`renewal:${id}`, ME, owner));
    toast({ tone: "info", title: "Reassigned", body: `${selected.size} renewals → ${owner}` });
    setSelected(new Set());
  };

  const owners = Array.from(new Set(accounts.map((a) => a.owner)));

  // Bucket counts (for tab headers)
  const bucketCount = (b: Bucket) => {
    const lc = search.trim().toLowerCase();
    const t = BUCKETS.find((x) => x.id === b)!.test;
    return pipeline
      .filter((r) => t(r.days))
      .filter((r) => !lc || `${r.account.name} ${r.account.industry} ${r.account.owner}`.toLowerCase().includes(lc))
      .length;
  };

  return (
    <AppShell>
      {/* Hero */}
      <div className="mb-5">
        <div className="mono-label mb-2">Renewals</div>
        <h1 className="display ink-gradient" style={{ fontSize: 36, lineHeight: 1.05 }}>
          Renewal <span className="italic-emph">pipeline</span>
        </h1>
        <p className="text-[12.5px] text-muted mt-1.5 max-w-2xl">
          Every customer renewal in one place. Sort by anything, edit next actions inline, bulk-act, export.
          Replaces the personal Excel that every CSM builds.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KpiTile label="Renewals tracked" value={kpis.total.toString()} />
        <KpiTile label="Total ARR"        value={fmtMoney(kpis.totalArr)} />
        <KpiTile label="Next 90 days"     value={`${kpis.next90Count} · ${fmtMoney(kpis.next90Arr)}`} tone="var(--warn)" />
        <KpiTile label="Below health 60"  value={`${kpis.atRiskCount} · ${fmtMoney(kpis.atRiskArr)}`} tone="var(--neg)" />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {BUCKETS.map((b) => (
          <button key={b.id} onClick={() => setBucket(b.id)}
            className={`pill-nav-item inline-flex items-center gap-1.5 ${bucket === b.id ? "active" : ""}`}>
            {b.label}
            <span className="text-[10px] font-mono tnum px-1.5 rounded bg-bg-deep text-muted">{bucketCount(b.id)}</span>
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-2 h-8 w-60 px-2.5 rounded-md border border-line bg-surface">
            <Search size={12} strokeWidth={1.6} className="text-muted-2" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search renewals…"
              className="flex-1 bg-transparent outline-none text-[12px] placeholder:text-muted-2" />
          </div>

          <Popover align="right" width={220}
            trigger={(_, t) => (
              <button onClick={t} className="text-[11.5px] font-mono text-muted hover:text-ink h-9 px-2 inline-flex items-center gap-1.5">
                Sort by <span className="text-ink font-medium">{SORTS.find((s) => s.key === sort)?.short}</span>
                <ChevronDown size={11} strokeWidth={1.6} />
              </button>
            )}>
            {(close) => <>{SORTS.map((s) => (
              <MenuItem key={s.key} selected={sort === s.key} onClick={() => { setSort(s.key); close(); }}>{s.label}</MenuItem>
            ))}</>}
          </Popover>

          <button onClick={exportCsv}
            className="text-[11.5px] font-medium text-muted hover:text-ink h-8 px-2.5 rounded-md inline-flex items-center gap-1.5 border border-line bg-surface hover:bg-surface-2">
            <Download size={11} strokeWidth={1.6} /> Export CSV
          </button>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="card-soft p-3 mb-3 flex items-center gap-3 fade-in"
          style={{ borderColor: "var(--ink)", background: "var(--ink)", color: "white" }}>
          <span className="text-[12.5px] font-semibold tnum">{selected.size} selected</span>
          <span className="text-white/40">·</span>
          <button onClick={bulkMarkReviewed}
            className="text-[11.5px] font-medium h-7 px-2.5 rounded-md inline-flex items-center gap-1.5 hover:bg-white/10">
            <CheckCircle2 size={11} strokeWidth={1.8} /> Mark reviewed
          </button>
          <button onClick={bulkSendCheckin}
            className="text-[11.5px] font-medium h-7 px-2.5 rounded-md inline-flex items-center gap-1.5 hover:bg-white/10">
            <Send size={11} strokeWidth={1.8} /> Draft check-in
          </button>
          <Popover align="right" width={200}
            trigger={(_, t) => (
              <button onClick={t} className="text-[11.5px] font-medium h-7 px-2.5 rounded-md inline-flex items-center gap-1.5 hover:bg-white/10">
                Reassign <ChevronDown size={11} />
              </button>
            )}>
            {(close) => (
              <>
                <MenuLabel>Assign to</MenuLabel>
                {owners.map((o) => (
                  <MenuItem key={o} onClick={() => { bulkAssign(o); close(); }}>{o}</MenuItem>
                ))}
              </>
            )}
          </Popover>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-[11px] text-white/70 hover:text-white">Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="text-left mono-label">
              <th className="px-3 py-3 w-[36px]">
                <input type="checkbox"
                  checked={selected.size > 0 && selected.size === filtered.length}
                  onChange={toggleAll}
                  className="accent-[var(--accent-deep)]"
                  aria-label="Select all" />
              </th>
              <th className="px-3 py-3">Account</th>
              <th className="px-3 py-3 text-right">ARR</th>
              <th className="px-3 py-3">Renewal</th>
              <th className="px-3 py-3 text-right">Health</th>
              <th className="px-3 py-3 text-right">NRR</th>
              <th className="px-3 py-3">Owner</th>
              <th className="px-3 py-3">Next action</th>
              <th className="px-3 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <RenewalRow
                key={r.account.id}
                row={r}
                even={i % 2 === 0}
                isSelected={selected.has(r.account.id)}
                onSelect={() => toggleSelect(r.account.id)}
                action={actions[r.account.id] ?? ""}
                isEditing={editing === r.account.id}
                onStartEdit={() => { setEditing(r.account.id); setDraft(actions[r.account.id] ?? ""); }}
                onCancelEdit={() => setEditing(null)}
                onSaveEdit={() => { setActions({ ...actions, [r.account.id]: draft }); setEditing(null); }}
                draft={draft}
                setDraft={setDraft}
              />
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-3 py-12 text-center text-[12.5px] text-muted">
                No renewals match this view.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

// ---------------------------------------------------------------------------

function KpiTile({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-3.5 py-3">
      <div className="mono-label">{label}</div>
      <div className="hero-num mt-1.5" style={{ fontSize: 22, color: tone ?? "var(--ink)" }}>{value}</div>
    </div>
  );
}

function RenewalRow({
  row, even, isSelected, onSelect,
  action, isEditing, onStartEdit, onCancelEdit, onSaveEdit, draft, setDraft,
}: {
  row: RenewalRecord; even: boolean; isSelected: boolean; onSelect: () => void;
  action: string; isEditing: boolean;
  onStartEdit: () => void; onCancelEdit: () => void; onSaveEdit: () => void;
  draft: string; setDraft: (s: string) => void;
}) {
  const closure = useClosure();
  const a = row.account;
  const closureId = `renewal:${a.id}`;
  const status = closure.status(closureId);

  const healthTone = a.healthScore >= 75 ? "var(--pos)" : a.healthScore >= 55 ? "var(--warn)" : "var(--neg)";
  const daysTone   = row.days < 0 ? "var(--neg)" : row.days <= 90 ? "var(--warn)" : "var(--ink)";

  return (
    <tr className={`border-t border-line ${even ? "" : "bg-surface-2"} ${isSelected ? "bg-accent-soft" : ""}`}
      style={isSelected ? { background: "var(--accent-soft)" } : undefined}>
      <td className="px-3 py-2.5">
        <input type="checkbox" checked={isSelected} onChange={onSelect}
          className="accent-[var(--accent-deep)]" aria-label={`Select ${a.name}`} />
      </td>
      <td className="px-3 py-2.5">
        <Link href={`/accounts/${slugify(a.name)}`} className="flex items-center gap-2 hover:underline">
          <Logo name={a.name} size={22} rounded={5} />
          <div className="min-w-0">
            <div className="text-[12.5px] font-semibold text-ink truncate max-w-[180px]">{a.name}</div>
            <div className="text-[10.5px] text-muted-2 truncate max-w-[180px]">{a.industry}</div>
          </div>
        </Link>
      </td>
      <td className="px-3 py-2.5 text-right tnum font-semibold text-ink">{fmtMoney(a.arr)}</td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Calendar size={11} strokeWidth={1.6} className="text-muted-2" />
          <div>
            <div className="text-[12px] tnum text-ink">{row.date}</div>
            <div className="text-[10.5px] tnum font-mono" style={{ color: daysTone }}>
              {row.days < 0 ? `${Math.abs(row.days)}d lapsed` : row.days === 0 ? "today" : `in ${row.days}d`}
            </div>
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5 text-right">
        <span className="hero-num tnum text-[14px]" style={{ color: healthTone }}>{a.healthScore}</span>
      </td>
      <td className="px-3 py-2.5 text-right">
        <span className="tnum text-[12px]" style={{ color: a.nrr >= 100 ? "var(--pos)" : a.nrr === 0 ? "var(--muted-2)" : "var(--neg)" }}>
          {a.nrr ? `${a.nrr}%` : "—"}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-ink text-white grid place-items-center text-[8.5px] font-semibold">{a.ownerInitials}</span>
          <span className="text-[11.5px] text-ink-2">{a.owner}</span>
        </span>
      </td>
      <td className="px-3 py-2.5">
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <input value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") onSaveEdit(); if (e.key === "Escape") onCancelEdit(); }}
              placeholder="What's next?"
              className="text-[12px] h-7 flex-1 min-w-[180px] px-2 rounded-md border border-line bg-surface outline-none placeholder:text-muted-2" />
            <button onClick={onSaveEdit}
              className="text-[10.5px] font-semibold h-7 px-2 rounded-md inline-flex items-center gap-1"
              style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
              Save
            </button>
            <button onClick={onCancelEdit} className="text-[10.5px] text-muted hover:text-ink">Cancel</button>
          </div>
        ) : (
          <button onClick={onStartEdit}
            className="text-left text-[12px] text-ink-2 hover:text-ink min-w-[200px] px-2 py-1 rounded hover:bg-bg-deep transition-colors">
            {action || <span className="text-muted-2 italic-emph">Click to set next action</span>}
          </button>
        )}
      </td>
      <td className="px-3 py-2.5">
        <ClosureBadge status={status} size="xs" />
      </td>
    </tr>
  );
}
