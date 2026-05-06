"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, Filter, ArrowUpDown, RefreshCw, Settings2, Plus, ChevronDown, Check, X,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  accounts as initialAccounts, slugify, fmtMoney, type Account, type AIHealth, type Tier, type Watchlist,
  expansionOpportunities, championChanges,
} from "@/lib/mock";
import { Logo } from "@/components/Logo";
import { MiniTimeline } from "@/components/EventTimeline";
import { Popover, MenuItem, MenuLabel } from "@/components/Popover";
import { Modal, ModalButton, FormField, TextInput, SelectInput } from "@/components/Modal";
import { useToast } from "@/components/Toast";

type SortKey =
  | "arr-desc" | "arr-asc"
  | "health-desc" | "health-asc"
  | "renewal-asc" | "name-asc";

const SORT_OPTIONS: { key: SortKey; label: string; short: string }[] = [
  { key: "arr-desc",     label: "ARR · high to low",          short: "ARR ↓" },
  { key: "arr-asc",      label: "ARR · low to high",          short: "ARR ↑" },
  { key: "health-desc",  label: "Health · best first",        short: "Health ↓" },
  { key: "health-asc",   label: "Health · worst first",       short: "Health ↑" },
  { key: "renewal-asc",  label: "Renewal · soonest first",    short: "Renewal ↑" },
  { key: "name-asc",     label: "Name · A → Z",               short: "A → Z" },
];

const aiHealthChip = (h: AIHealth) => {
  if (h === "Healthy")    return { bg: "var(--pos-soft)",  ink: "var(--pos)" };
  if (h === "Concerning") return { bg: "var(--neg-soft)",  ink: "var(--neg)" };
  if (h === "Cold")       return { bg: "var(--bg-deep)",   ink: "var(--muted)" };
  return                       { bg: "var(--bg-deep)",   ink: "var(--muted-2)" };
};

const watchChip = (w?: Watchlist) => {
  if (!w) return null;
  if (w === "Renewal Likely") return { bg: "var(--pos-soft)",     ink: "var(--pos)" };
  if (w === "Upsell Likely")  return { bg: "var(--accent-soft)",  ink: "var(--accent)" };
  return                            { bg: "var(--neg-soft)",     ink: "var(--neg)" };
};

const healthDot = (h: Account["health"]) =>
  h === "high" ? "var(--pos)" : h === "medium" ? "var(--warn)" : "var(--neg)";

export default function AccountsPage() {
  const router = useRouter();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [sort, setSort] = useState<SortKey>("arr-desc");
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [newOpen, setNewOpen] = useState(false);

  const sorted = useMemo(() => {
    const lc = search.trim().toLowerCase();
    const filtered = accounts.filter((a) => {
      if (lc && !`${a.name} ${a.domain} ${a.tier} ${a.signal}`.toLowerCase().includes(lc)) return false;
      const tierF = filters.tier ?? [];
      if (tierF.length && !tierF.includes(a.tier)) return false;
      const healthF = filters.health ?? [];
      if (healthF.length && !healthF.includes(a.health)) return false;
      const aiF = filters.ai ?? [];
      if (aiF.length && !aiF.includes(a.aiHealth)) return false;
      const watchF = filters.watch ?? [];
      if (watchF.length && !watchF.includes(a.watchlist ?? "")) return false;
      return true;
    });
    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "arr-desc":    return b.arr - a.arr;
        case "arr-asc":     return a.arr - b.arr;
        case "health-desc": return b.healthScore - a.healthScore;
        case "health-asc":  return a.healthScore - b.healthScore;
        case "renewal-asc": return a.renewalDays - b.renewalDays;
        case "name-asc":    return a.name.localeCompare(b.name);
      }
    });
  }, [search, filters, sort]);

  // Active filter chip strip
  const activeChips: { groupKey: string; value: string }[] = [];
  Object.entries(filters).forEach(([k, vs]) => vs.forEach((v) => activeChips.push({ groupKey: k, value: v })));
  const removeChip = (groupKey: string, value: string) =>
    setFilters((all) => ({ ...all, [groupKey]: (all[groupKey] ?? []).filter((v) => v !== value) }));

  const clearAll = () => setFilters({});

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="mono-label mb-2">Accounts</div>
          <h1 className="display ink-gradient" style={{ fontSize: 36, lineHeight: 1.05 }}>
            Your <span className="italic-emph">book of business</span>
          </h1>
          <div className="flex items-center gap-3 mt-2 text-[11.5px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--pos)" }} />
              {accounts.filter((a) => a.status === "Customer").length} customers
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--info)" }} />
              {accounts.filter((a) => a.status === "Prospect").length} prospects
            </span>
            <span className="text-muted-2">·</span>
            <span className="tnum">
              {fmtMoney(accounts.reduce((sum, a) => sum + (a.arr || 0), 0))} ARR under management
            </span>
          </div>
        </div>
        <button onClick={() => setNewOpen(true)}
          className="text-[12.5px] font-semibold h-9 px-4 rounded-lg bg-ink text-white inline-flex items-center gap-1.5 hover:bg-ink-2 shadow-[0_4px_12px_-4px_rgba(28,40,64,0.3)]">
          <Plus size={13} strokeWidth={2} /> New account
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="flex-1 min-w-[240px] max-w-sm flex items-center gap-2 bg-transparent border-b border-line h-9 px-1">
          <Search strokeWidth={1.6} size={13} className="text-muted-2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search accounts…"
            className="bg-transparent outline-none text-[12.5px] flex-1 placeholder:text-muted-2" />
        </div>

        <FilterPopover
          value={filters}
          onChange={setFilters}
          groups={[
            { key: "tier",   label: "Tier",   options: [
              { value: "Strategic",  label: "Strategic"  },
              { value: "Enterprise", label: "Enterprise" },
              { value: "Growth",     label: "Growth"     },
            ]},
            { key: "health", label: "Health", options: [
              { value: "high",   label: "Healthy" },
              { value: "medium", label: "Watch" },
              { value: "low",    label: "At risk" },
            ]},
            { key: "ai",     label: "AI usage health", options: [
              { value: "Healthy",    label: "Healthy" },
              { value: "Concerning", label: "Concerning" },
              { value: "Cold",       label: "Cold" },
            ]},
            { key: "watch",  label: "Watchlist", options: [
              { value: "Upsell Likely",  label: "Upsell likely" },
              { value: "Renewal Likely", label: "Renewal likely" },
              { value: "Watchlist",      label: "Watchlist" },
            ]},
          ]}
        />

        {activeChips.map((c) => (
          <button key={`${c.groupKey}-${c.value}`} onClick={() => removeChip(c.groupKey, c.value)}
            className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-bg-deep text-ink-2 inline-flex items-center gap-1.5 hover:bg-line">
            {c.value} <span className="text-muted-2">×</span>
          </button>
        ))}
        {activeChips.length > 0 && (
          <button onClick={clearAll} className="text-[10.5px] text-muted hover:text-ink ml-1">Clear all</button>
        )}

        {/* Sort */}
        <Popover
          width={200}
          align="right"
          trigger={(_, t) => (
            <button onClick={t} className="text-[11.5px] font-mono text-muted hover:text-ink h-9 px-2 inline-flex items-center gap-1.5 ml-auto">
              Sort by <span className="text-ink font-medium">{SORT_OPTIONS.find((o) => o.key === sort)?.short}</span>
              <ChevronDown size={11} strokeWidth={1.6} />
            </button>
          )}
        >
          {(close) => (
            <>
              {SORT_OPTIONS.map((o) => (
                <MenuItem key={o.key} selected={sort === o.key} onClick={() => { setSort(o.key); close(); }}>
                  {o.label}
                </MenuItem>
              ))}
            </>
          )}
        </Popover>

        <span className="text-[10.5px] font-mono text-muted-2 tnum">{sorted.length} / {accounts.length}</span>

        <button onClick={() => toast({ tone: "info", title: "Refreshed", body: "Account data is up to date" })}
          className="text-[11.5px] font-medium text-muted hover:text-ink h-8 px-2.5 rounded-md inline-flex items-center gap-1.5">
          <RefreshCw size={11} strokeWidth={1.6} /> Refresh
        </button>
        <button onClick={() => toast({ tone: "info", title: "Column settings", body: "Column visibility editor coming soon" })}
          className="text-[11.5px] font-medium text-muted hover:text-ink h-8 px-2.5 rounded-md inline-flex items-center gap-1.5">
          <Settings2 size={11} strokeWidth={1.6} /> Columns
        </button>
      </div>

      {/* Subscription strip — horizontal scroll */}
      <div className="card p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="mono-label">Customer subscriptions</div>
            <span className="text-[10.5px] font-mono text-muted">Showing {sorted.length} of {accounts.length}</span>
          </div>
          <div className="text-[10.5px] font-mono text-muted">
            Sorted by <span className="text-ink font-medium">{SORT_OPTIONS.find((o) => o.key === sort)?.short}</span>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
          {sorted.map((a) => {
            const watch = watchChip(a.watchlist);
            // Show ARR for customers, pipeline value for prospects — never show "—"
            const displayVal   = a.arr > 0 ? fmtMoney(a.arr) : a.pipelineValue > 0 ? fmtMoney(a.pipelineValue) : null;
            const isPipeline   = a.arr === 0 && a.pipelineValue > 0;
            return (
              <Link key={a.id} href={`/accounts/${slugify(a.name)}`}
                className="shrink-0 w-[120px] flex flex-col items-center text-center group">
                <div className="flex items-center gap-1 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: healthDot(a.health) }} />
                  {displayVal ? (
                    <span className="text-[10.5px] font-mono tnum font-bold text-ink px-1.5 py-0.5 rounded-full border bg-surface leading-none"
                      style={{ borderColor: isPipeline ? "var(--info)" : "var(--line-strong)", color: isPipeline ? "var(--info)" : "var(--ink)" }}>
                      {displayVal}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-muted-2">—</span>
                  )}
                </div>
                <div className="rounded-full p-1 bg-surface border border-line group-hover:bg-bg-deep transition-colors">
                  <Logo name={a.name} size={56} rounded={9999} />
                </div>
                <div className="text-[11.5px] font-semibold text-ink mt-2 w-full leading-tight"
                  style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {a.name}
                </div>
                {watch && (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.04em] mt-1 px-1.5 py-0.5 rounded"
                    style={{ background: watch.bg, color: watch.ink }}>
                    {a.watchlist}
                  </span>
                )}
              </Link>
            );
          })}
          {sorted.length === 0 && (
            <div className="text-[12px] text-muted py-6 px-2">No accounts match these filters.</div>
          )}
        </div>
      </div>

      <NewAccountModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreate={(a) => {
          setAccounts((s) => [a, ...s]);
          toast({ tone: "success", title: "Account created", body: `${a.name} added to your book.` });
          setNewOpen(false);
          router.push(`/accounts/${slugify(a.name)}`);
        }}
      />

      {/* Userlens-style table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="text-left">
                {[
                  { label: "Account",           w: 230 },
                  { label: "Activity",          w: 170 },
                  { label: "Hottest signal",    w: 240 },
                  { label: "ARR",               w: 110 },
                  { label: "Pipeline",          w: 110 },
                  { label: "Hot signals",       w: 100 },
                  { label: "Expansion score",   w: 140 },
                ].map((c) => (
                  <th key={c.label} style={{ width: c.w }}
                    className="mono-label !text-[10px] font-medium px-4 py-2.5 border-b border-line bg-surface-2/40">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((a) => {
                const slug = slugify(a.name);
                // Expansion-coded derived metrics
                const accountOpps = expansionOpportunities.filter((o) => o.accountSlug === slug);
                const pipeline    = accountOpps.reduce((s, o) => s + o.estimatedArr, 0);
                const topScore    = accountOpps.reduce((m, o) => Math.max(m, o.score), 0);
                const hotSignals  = (accountOpps.filter((o) => o.daysInStage <= 14).length)
                                  + (championChanges.filter((c) => c.accountSlug === slug).length);
                const scoreColor  = topScore >= 85 ? "#F5360F" : topScore >= 75 ? "#F5B900" : topScore >= 60 ? "var(--accent)" : "var(--muted)";
                return (
                  <tr key={a.id} onClick={() => router.push(`/accounts/${slug}`)}
                    className="hover:bg-surface-2 transition-colors group cursor-pointer">
                    {/* Account */}
                    <td className="px-4 py-3 border-b border-line">
                      <div className="flex items-center gap-2.5">
                        <Logo name={a.name} size={26} rounded={5} />
                        <div className="min-w-0">
                          <div className="text-[12.5px] font-semibold text-ink group-hover:underline truncate">{a.name}</div>
                          <div className="text-[10px] font-mono text-muted">{a.tier} · {a.domain}</div>
                        </div>
                      </div>
                    </td>
                    {/* Activity sparkline */}
                    <td className="px-4 py-3 border-b border-line">
                      <MiniTimeline data={a.eventTimeline} cellSize={8} gap={2} />
                    </td>
                    {/* Hottest signal */}
                    <td className="px-4 py-3 border-b border-line">
                      <div className="flex items-center gap-2 max-w-[230px]">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: healthDot(a.health) }} />
                        <span className="text-[11.5px] text-ink-2 truncate">{a.signal}</span>
                      </div>
                    </td>
                    {/* ARR */}
                    <td className="px-4 py-3 border-b border-line">
                      <span className="text-[13px] font-medium text-ink tnum">
                        {a.arr ? `$${a.arr.toLocaleString()}` : "—"}
                      </span>
                    </td>
                    {/* Pipeline ($ in motion) */}
                    <td className="px-4 py-3 border-b border-line">
                      {pipeline > 0
                        ? <span className="text-[12.5px] font-semibold tnum" style={{ color: "var(--accent-deep)" }}>{fmtMoney(pipeline)}</span>
                        : <span className="text-[11.5px] tnum text-muted-2">—</span>
                      }
                    </td>
                    {/* Hot signals count */}
                    <td className="px-4 py-3 border-b border-line">
                      {hotSignals > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: "var(--accent-soft)", color: "var(--accent-deep)" }}>
                          ⚡ {hotSignals}
                        </span>
                      ) : (
                        <span className="text-[11.5px] tnum text-muted-2">—</span>
                      )}
                    </td>
                    {/* Expansion score */}
                    <td className="px-4 py-3 border-b border-line">
                      {topScore > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-deep)" }}>
                            <div className="h-full rounded-full" style={{ width: `${topScore}%`, background: scoreColor }} />
                          </div>
                          <span className="text-[11px] font-bold tnum" style={{ color: scoreColor }}>{topScore}</span>
                        </div>
                      ) : (
                        <span className="text-[11.5px] tnum text-muted-2">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

// ---------------------------------------------------------------------
// Compact filter popover (multi-group, multi-select)
// ---------------------------------------------------------------------
function FilterPopover({
  value, onChange, groups,
}: {
  value: Record<string, string[]>;
  onChange: (v: Record<string, string[]>) => void;
  groups: { key: string; label: string; options: { value: string; label: string }[] }[];
}) {
  const total = Object.values(value).reduce((s, vs) => s + vs.length, 0);
  return (
    <Popover
      width={260}
      trigger={(_, t) => (
        <button onClick={t} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[11.5px] font-medium text-muted hover:text-ink hover:bg-bg-deep">
          <Filter size={11} strokeWidth={1.6} />
          {total ? `Filter (${total})` : "Filter"}
        </button>
      )}
    >
      {() => (
        <div className="p-1 max-h-96 overflow-y-auto">
          {groups.map((g) => {
            const selected = value[g.key] ?? [];
            return (
              <div key={g.key} className="mb-2">
                <MenuLabel>{g.label}</MenuLabel>
                {g.options.map((o) => {
                  const on = selected.includes(o.value);
                  return (
                    <button key={o.value}
                      onClick={() => {
                        const next = on ? selected.filter((v) => v !== o.value) : [...selected, o.value];
                        onChange({ ...value, [g.key]: next });
                      }}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12px] text-left ${
                        on ? "bg-bg-deep text-ink font-medium" : "text-ink-2 hover:bg-bg-deep"
                      }`}>
                      <span className="w-3.5 h-3.5 rounded grid place-items-center"
                        style={{ background: on ? "var(--ink)" : "transparent", border: on ? "0" : "1px solid var(--line)" }}>
                        {on && <Check size={9} strokeWidth={2.5} style={{ color: "white" }} />}
                      </span>
                      <span className="flex-1">{o.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </Popover>
  );
}

// ---------------------------------------------------------------------
// New Account modal
// ---------------------------------------------------------------------
function NewAccountModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (a: Account) => void }) {
  const [name, setName]     = useState("");
  const [domain, setDomain] = useState("");
  const [segment, setSegment] = useState<Account["segment"]>("Enterprise");
  const [tier, setTier]       = useState<Tier>("Strategic");
  const [industry, setIndustry] = useState("Software");
  const [hq, setHq] = useState("");
  const [owner, setOwner]     = useState("Sarah Chen");
  const [arr, setArr]         = useState("");
  const [status, setStatus]   = useState<Account["status"]>("Prospect");
  const reset = () => { setName(""); setDomain(""); setHq(""); setArr(""); };

  const submit = () => {
    if (!name.trim() || !domain.trim()) return;
    const id = `ac${Math.floor(Math.random() * 100000)}`;
    const initials = owner.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    const a: Account = {
      id, name: name.trim(), domain: domain.trim(),
      segment, tier, industry, employees: 0,
      arr: parseInt(arr, 10) || 0, status,
      owner, ownerInitials: initials,
      openDeals: 0, pipelineValue: 0, lastTouch: new Date().toISOString().slice(0, 10),
      health: "high", healthScore: 80, nrr: status === "Customer" ? 110 : 0,
      renewalDays: status === "Customer" ? 180 : 0,
      signal: "—", qbrInDays: 30, agendas1to1: 0, aiChat14d: 0,
      aiHealth: "Healthy",
      eventTimeline: [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]],
      hq: hq.trim() || "—",
    };
    onCreate(a); reset();
  };

  return (
    <Modal
      open={open} onClose={() => { reset(); onClose(); }}
      title="Create new account" description="Add an account to your book."
      width={520}
      footer={
        <>
          <ModalButton onClick={() => { reset(); onClose(); }}>Cancel</ModalButton>
          <ModalButton primary onClick={submit} disabled={!name.trim() || !domain.trim()}>Create account</ModalButton>
        </>
      }>
      <FormField label="Account name">
        <TextInput value={name} onChange={setName} placeholder="e.g. Boston Dynamics" />
      </FormField>
      <FormField label="Domain">
        <TextInput value={domain} onChange={setDomain} placeholder="acme.com" />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Status">
          <SelectInput<Account["status"]> value={status} onChange={setStatus}
            options={[{ value: "Prospect", label: "Prospect" }, { value: "Customer", label: "Customer" }, { value: "Churned", label: "Churned" }]} />
        </FormField>
        <FormField label="Segment">
          <SelectInput<Account["segment"]> value={segment} onChange={setSegment}
            options={[{ value: "Enterprise", label: "Enterprise" }, { value: "Mid-Market", label: "Mid-Market" }, { value: "SMB", label: "SMB" }]} />
        </FormField>
        <FormField label="Tier">
          <SelectInput<Tier> value={tier} onChange={setTier}
            options={[{ value: "Strategic", label: "Strategic" }, { value: "Enterprise", label: "Enterprise" }, { value: "Growth", label: "Growth" }]} />
        </FormField>
        <FormField label="Industry">
          <TextInput value={industry} onChange={setIndustry} />
        </FormField>
        <FormField label="HQ">
          <TextInput value={hq} onChange={setHq} placeholder="City, Country" />
        </FormField>
        <FormField label="Owner">
          <SelectInput value={owner} onChange={setOwner}
            options={["Sarah Chen", "Brad Allen", "Paul Acker", "Mike Torres", "Lisa Park", "Rachel Kim"].map((o) => ({ value: o, label: o }))} />
        </FormField>
        <FormField label="ARR (USD)" hint={status === "Customer" ? "current annual recurring revenue" : "leave blank for prospect"}>
          <TextInput type="number" value={arr} onChange={setArr} placeholder="0" />
        </FormField>
      </div>
    </Modal>
  );
}
