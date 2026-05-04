"use client";

import { useMemo, useState } from "react";
import {
  Search, Filter, ListFilter, Columns3, ArrowUpDown, BarChart3,
  Star, ChevronDown, ChevronRight, AlertCircle, Calendar, FileText, Plus, X, Check,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  deals as initialDeals, fmtMoney, fmtDate, fmtFullMoney,
  type DealRow, type Stage, type ForecastCategory,
  stageConfig,
} from "@/lib/mock";
import { MeddpiccChips } from "@/components/MeddpiccChips";
import { StagePill } from "@/components/StagePill";
import { ForecastPill } from "@/components/ForecastPill";
import { DealDetailDrawer } from "@/components/DealDetailDrawer";
import { Popover, MenuItem, MenuLabel, MenuSeparator } from "@/components/Popover";
import { Modal, ModalButton, FormField, TextInput, SelectInput } from "@/components/Modal";
import { useToast } from "@/components/Toast";

type View = "team" | "stage" | "rep";
const VIEWS: { id: View; label: string; group?: "Stage" | "Owner" }[] = [
  { id: "team",  label: "Team deals" },
  { id: "stage", label: "Deals by Stage", group: "Stage" },
  { id: "rep",   label: "Deals by Rep",   group: "Owner" },
];

const STAGE_ORDER: Stage[] = [
  "Qualification","Discovery","Demo","Proposal","Negotiation","Closed Won","Closed Lost",
];

type SortKey = "amount-desc" | "amount-asc" | "close-asc" | "close-desc" | "name-asc" | "stage-asc";
const SORTS: { k: SortKey; label: string }[] = [
  { k: "amount-desc", label: "Amount · high to low" },
  { k: "amount-asc",  label: "Amount · low to high" },
  { k: "close-asc",   label: "Close date · soonest" },
  { k: "close-desc",  label: "Close date · latest" },
  { k: "name-asc",    label: "Name · A → Z" },
  { k: "stage-asc",   label: "Stage" },
];

const ALL_FIELDS: { id: keyof DealRow | "meddpicc"; label: string; required?: boolean }[] = [
  { id: "name",      label: "Deal Name", required: true },
  { id: "owner",     label: "Owner" },
  { id: "stage",     label: "Stage" },
  { id: "amount",    label: "Amount" },
  { id: "forecast",  label: "Forecast" },
  { id: "closeDate", label: "Close Date" },
  { id: "meddpicc",  label: "MEDDPICC" },
  { id: "nextStep",  label: "Next Step" },
];

const FORECAST_CATS: ForecastCategory[] = ["Pipeline", "Best Case", "Commit", "Won", "Lost", "Omitted"];

export default function DealsPage() {
  const toast = useToast();
  const [deals, setDeals] = useState<DealRow[]>(initialDeals);
  const [view, setView] = useState<View>("team");
  const [search, setSearch] = useState("");
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["d1", "d4", "d7"]));
  const [openDeal, setOpenDeal] = useState<DealRow | null>(null);

  const [sort, setSort] = useState<SortKey>("close-asc");
  const [stageFilters, setStageFilters] = useState<Set<Stage>>(new Set());
  const [forecastFilters, setForecastFilters] = useState<Set<ForecastCategory>>(new Set());
  const [ownerFilters, setOwnerFilters] = useState<Set<string>>(new Set());
  const [visibleFields, setVisibleFields] = useState<Set<string>>(
    new Set(ALL_FIELDS.map((f) => f.id as string))
  );
  const [filterRailOpen, setFilterRailOpen] = useState(false);
  const [newDealOpen, setNewDealOpen] = useState(false);

  // Sorting + filtering
  const processed = useMemo(() => {
    const lc = search.trim().toLowerCase();
    const filtered = deals.filter((d) => {
      if (lc && !`${d.name} ${d.account} ${d.owner} ${d.stage}`.toLowerCase().includes(lc)) return false;
      if (stageFilters.size && !stageFilters.has(d.stage)) return false;
      if (forecastFilters.size && !forecastFilters.has(d.forecast)) return false;
      if (ownerFilters.size && !ownerFilters.has(d.owner)) return false;
      return true;
    });
    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "amount-desc": return b.amount - a.amount;
        case "amount-asc":  return a.amount - b.amount;
        case "close-asc":   return a.closeDate.localeCompare(b.closeDate);
        case "close-desc":  return b.closeDate.localeCompare(a.closeDate);
        case "name-asc":    return a.name.localeCompare(b.name);
        case "stage-asc":   return STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage);
      }
    });
  }, [deals, search, stageFilters, forecastFilters, ownerFilters, sort]);

  const groups = useMemo(() => {
    if (view === "team") return [{ label: "All", deals: processed }];
    if (view === "stage") {
      const map = new Map<Stage, DealRow[]>();
      processed.forEach((d) => { if (!map.has(d.stage)) map.set(d.stage, []); map.get(d.stage)!.push(d); });
      return STAGE_ORDER.filter((s) => map.has(s)).map((s) => ({ label: s, deals: map.get(s)! }));
    }
    const map = new Map<string, DealRow[]>();
    processed.forEach((d) => { if (!map.has(d.owner)) map.set(d.owner, []); map.get(d.owner)!.push(d); });
    return Array.from(map.entries()).sort(([, a], [, b]) => b.length - a.length).map(([k, v]) => ({ label: k, deals: v }));
  }, [view, processed]);

  const allOwners = useMemo(() => Array.from(new Set(deals.map((d) => d.owner))).sort(), [deals]);
  const totalActiveFilters = stageFilters.size + forecastFilters.size + ownerFilters.size;
  const favoriteDeals = deals.filter((d) => favorites.has(d.id));

  const toggleFavorite = (id: string) => setFavorites((s) => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const clearFilters = () => { setStageFilters(new Set()); setForecastFilters(new Set()); setOwnerFilters(new Set()); };

  const addDeal = (deal: Omit<DealRow, "id" | "ownerInitials" | "stageProgress" | "meddpicc" | "closeAtRisk" | "health">) => {
    const id = `d${deals.length + 100}`;
    const newRow: DealRow = {
      ...deal,
      id,
      ownerInitials: deal.owner.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase(),
      stageProgress: { done: 0, total: 5 },
      meddpicc: [0,0,0,0,0,0,0,0],
      closeAtRisk: false,
      health: "high",
    };
    setDeals((s) => [newRow, ...s]);
    toast({ tone: "success", title: "Deal created", body: `${deal.name} added to pipeline.` });
  };

  return (
    <AppShell>
      {/* Page header */}
      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="mono-label mb-2 inline-flex items-center gap-2">
            <span className="orb" />
            {processed.length} active opportunities · Wed 29 Apr
          </div>
          <h1 className="display ink-gradient" style={{ fontSize: 36, lineHeight: 1.05 }}>
            Your <span className="italic-emph">deals</span>
          </h1>
          <div className="flex items-center gap-3 mt-2 text-[11.5px] text-muted">
            <span className="tnum">
              {fmtMoney(processed.reduce((s, d) => s + d.amount, 0))} total pipeline
            </span>
            <span className="text-muted-2">·</span>
            <span className="tnum">
              {fmtMoney(processed.filter((d) => d.forecast === "Commit" || d.forecast === "Best Case").reduce((s, d) => s + d.amount, 0))} weighted
            </span>
          </div>
        </div>
        <button onClick={() => setNewDealOpen(true)}
          className="text-[12.5px] font-semibold h-9 px-4 rounded-lg bg-ink text-white inline-flex items-center gap-1.5 hover:bg-ink-2 shadow-[0_4px_12px_-4px_rgba(20,20,15,0.3)]">
          <Plus size={13} strokeWidth={2} /> New deal
        </button>
      </div>

      {/* Favorites + view tabs */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button
          onClick={() => setFavoritesOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-ink text-white text-[12px] font-medium"
        >
          {favoritesOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          <Star size={11} strokeWidth={1.6} fill={favorites.size ? "currentColor" : "transparent"} />
          Favorites <span className="text-[10px] font-mono tnum bg-white/15 rounded px-1">{favorites.size}</span>
        </button>

        {VIEWS.map((v) => (
          <button key={v.id} onClick={() => setView(v.id)}
            className={`pill-nav-item inline-flex items-center gap-1.5 ${view === v.id ? "active" : ""}`}>
            {v.label}
            <span className={`text-[10px] font-mono tnum px-1.5 rounded ${
              view === v.id ? "bg-bg-deep text-ink" : "bg-bg-deep text-muted"
            }`}>{processed.length}</span>
          </button>
        ))}
      </div>

      {/* Favorites strip */}
      {favoritesOpen && (
        <div className="card p-3 mb-3 fade-in">
          {favoriteDeals.length === 0 ? (
            <div className="text-[12.5px] text-muted py-2 px-1">No favorites yet — click the star on any deal row to add one.</div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {favoriteDeals.map((d) => (
                <button key={d.id} onClick={() => setOpenDeal(d)}
                  className="text-left p-2 rounded-md hover:bg-bg-deep flex items-center gap-2.5">
                  <Star size={11} strokeWidth={1.6} style={{ color: "var(--accent)", fill: "var(--accent)" }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-ink truncate">{d.name}</div>
                    <div className="text-[10.5px] text-muted">{d.stage} · {fmtMoney(d.amount)}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button onClick={() => setFilterRailOpen((o) => !o)}
          className={`w-8 h-8 rounded-md grid place-items-center border border-line ${
            filterRailOpen ? "bg-bg-deep text-ink" : "bg-surface text-muted hover:text-ink"
          } relative`}>
          <ListFilter size={12} strokeWidth={1.6} />
          {totalActiveFilters > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-1 rounded-full text-[9px] font-mono tnum text-white grid place-items-center" style={{ background: "var(--accent)" }}>
              {totalActiveFilters}
            </span>
          )}
        </button>

        <div className="flex-1 max-w-sm flex items-center gap-2 h-8 px-2.5 rounded-md border border-line bg-surface">
          <Search size={12} strokeWidth={1.6} className="text-muted-2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search deals…"
            className="flex-1 bg-transparent outline-none text-[12px] placeholder:text-muted-2" />
          {search && (
            <button onClick={() => setSearch("")} className="text-muted-2 hover:text-ink">
              <X size={11} strokeWidth={1.6} />
            </button>
          )}
        </div>

        {/* Group popover */}
        <Popover
          width={200}
          trigger={(_, t) => (
            <ToolbarBtn icon={<Columns3 size={11} />} label={`Group: ${VIEWS.find((v) => v.id === view)?.group ?? "None"}`} onClick={t} />
          )}
        >
          {(close) => (
            <>
              <MenuLabel>Group by</MenuLabel>
              <MenuItem selected={view === "team"}  onClick={() => { setView("team");  close(); }}>None</MenuItem>
              <MenuItem selected={view === "stage"} onClick={() => { setView("stage"); close(); }}>Stage</MenuItem>
              <MenuItem selected={view === "rep"}   onClick={() => { setView("rep");   close(); }}>Owner</MenuItem>
            </>
          )}
        </Popover>

        {/* Fields popover */}
        <Popover
          width={220}
          trigger={(_, t) => <ToolbarBtn icon={<FileText size={11} />} label="Fields" onClick={t} />}
        >
          {() => (
            <>
              <MenuLabel>Visible columns</MenuLabel>
              {ALL_FIELDS.map((f) => (
                <button key={f.id} onClick={() => {
                  if (f.required) return;
                  setVisibleFields((s) => { const n = new Set(s); n.has(f.id as string) ? n.delete(f.id as string) : n.add(f.id as string); return n; });
                }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12.5px] text-left ${f.required ? "opacity-60" : "hover:bg-bg-deep"}`}>
                  <span className="w-3.5 h-3.5 rounded grid place-items-center"
                    style={{ background: visibleFields.has(f.id as string) ? "var(--ink)" : "transparent", border: visibleFields.has(f.id as string) ? "0" : "1px solid var(--line)" }}>
                    {visibleFields.has(f.id as string) && <Check size={9} strokeWidth={2.5} style={{ color: "white" }} />}
                  </span>
                  <span className="flex-1">{f.label}</span>
                  {f.required && <span className="text-[9.5px] text-muted-2">required</span>}
                </button>
              ))}
            </>
          )}
        </Popover>

        {/* Sort popover */}
        <Popover
          width={220}
          trigger={(_, t) => <ToolbarBtn icon={<ArrowUpDown size={11} />} label={`Sort: ${SORTS.find((s) => s.k === sort)?.label.split(" · ")[0]}`} onClick={t} />}
        >
          {(close) => (
            <>
              <MenuLabel>Sort by</MenuLabel>
              {SORTS.map((s) => (
                <MenuItem key={s.k} selected={sort === s.k} onClick={() => { setSort(s.k); close(); }}>{s.label}</MenuItem>
              ))}
            </>
          )}
        </Popover>

        {/* Filter popover */}
        <Popover
          width={260}
          trigger={(_, t) => (
            <ToolbarBtn
              icon={<Filter size={11} />}
              label={totalActiveFilters > 0 ? `Filter (${totalActiveFilters})` : "Filter"}
              onClick={t}
              active={totalActiveFilters > 0}
            />
          )}
        >
          {() => (
            <FilterPanel
              stageFilters={stageFilters} setStageFilters={setStageFilters}
              forecastFilters={forecastFilters} setForecastFilters={setForecastFilters}
              ownerFilters={ownerFilters} setOwnerFilters={setOwnerFilters}
              owners={allOwners}
              clear={clearFilters}
            />
          )}
        </Popover>

        {/* Metrics popover */}
        <Popover
          width={260}
          trigger={(_, t) => <ToolbarBtn icon={<BarChart3 size={11} />} label="Metrics" onClick={t} />}
          align="right"
        >
          {() => {
            const total = processed.reduce((s, d) => s + d.amount, 0);
            const avg = processed.length ? total / processed.length : 0;
            const won = processed.filter((d) => d.stage === "Closed Won").reduce((s, d) => s + d.amount, 0);
            const open = processed.filter((d) => d.stage !== "Closed Won" && d.stage !== "Closed Lost").reduce((s, d) => s + d.amount, 0);
            return (
              <div className="p-1">
                <MenuLabel>Metrics</MenuLabel>
                <Metric label="Total" value={fmtMoney(total)} />
                <Metric label="Average" value={fmtMoney(avg)} />
                <Metric label="Closed Won" value={fmtMoney(won)} tone="pos" />
                <Metric label="Open Pipeline" value={fmtMoney(open)} />
                <Metric label="Count" value={`${processed.length}`} />
              </div>
            );
          }}
        </Popover>
      </div>

      {/* Active filter chip strip */}
      {totalActiveFilters > 0 && (
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <span className="mono-label">Filters</span>
          {[...stageFilters].map((s) => <Chip key={`s-${s}`} onRemove={() => setStageFilters((set) => { const n = new Set(set); n.delete(s); return n; })}>Stage: {s}</Chip>)}
          {[...forecastFilters].map((f) => <Chip key={`f-${f}`} onRemove={() => setForecastFilters((set) => { const n = new Set(set); n.delete(f); return n; })}>Forecast: {f}</Chip>)}
          {[...ownerFilters].map((o) => <Chip key={`o-${o}`} onRemove={() => setOwnerFilters((set) => { const n = new Set(set); n.delete(o); return n; })}>Owner: {o}</Chip>)}
          <button onClick={clearFilters} className="text-[10.5px] text-muted hover:text-ink ml-1">Clear all</button>
        </div>
      )}

      {/* Layout: optional left filter rail + main table */}
      <div className={`grid gap-4 ${filterRailOpen ? "grid-cols-[260px_1fr]" : "grid-cols-1"}`}>
        {filterRailOpen && (
          <aside className="card p-3 self-start">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-semibold text-ink">Filter</span>
              <button onClick={() => setFilterRailOpen(false)} className="text-muted hover:text-ink">
                <X size={12} strokeWidth={1.6} />
              </button>
            </div>
            <FilterPanel
              stageFilters={stageFilters} setStageFilters={setStageFilters}
              forecastFilters={forecastFilters} setForecastFilters={setForecastFilters}
              ownerFilters={ownerFilters} setOwnerFilters={setOwnerFilters}
              owners={allOwners}
              clear={clearFilters}
              wide
            />
          </aside>
        )}

        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-bg-deep">
              <tr>
                <th className="w-7 px-2 py-2"></th>
                {ALL_FIELDS.filter((f) => visibleFields.has(f.id as string)).map((f) => (
                  <th key={f.id as string} className="text-left px-3 py-2 text-[10.5px] font-semibold text-muted uppercase tracking-wider">
                    {f.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <DealGroup key={g.label} view={view} label={g.label} deals={g.deals}
                  visibleFields={visibleFields} favorites={favorites}
                  onOpen={setOpenDeal} onStar={toggleFavorite} />
              ))}
              {processed.length === 0 && (
                <tr><td colSpan={ALL_FIELDS.length + 1} className="px-4 py-10 text-center text-[12.5px] text-muted">
                  No deals match these filters. <button onClick={clearFilters} className="text-ink underline">Clear filters</button>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DealDetailDrawer deal={openDeal} onClose={() => setOpenDeal(null)} />
      <NewDealModal open={newDealOpen} onClose={() => setNewDealOpen(false)} onSubmit={addDeal} owners={allOwners} />
    </AppShell>
  );
}

// =====================================================================
// UI primitives
// =====================================================================
function ToolbarBtn({ icon, label, onClick, active }: { icon: React.ReactNode; label: string; onClick?: () => void; active?: boolean }) {
  return (
    <button onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-line text-[11.5px] font-medium ${
        active ? "bg-bg-deep text-ink" : "bg-surface text-ink-2 hover:bg-bg-deep"
      }`}>
      <span className="text-muted">{icon}</span>{label}
    </button>
  );
}

function Chip({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <button onClick={onRemove}
      className="inline-flex items-center gap-1 h-6 pl-2 pr-1.5 rounded-full bg-bg-deep text-[10.5px] font-medium text-ink-2 hover:bg-line">
      {children} <X size={10} strokeWidth={1.6} className="text-muted-2" />
    </button>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "pos" | "neg" }) {
  const c = tone === "pos" ? "var(--pos)" : tone === "neg" ? "var(--neg)" : "var(--ink)";
  return (
    <div className="flex items-center justify-between px-2.5 py-1.5 text-[12.5px]">
      <span className="text-ink-2">{label}</span>
      <span className="font-semibold tnum" style={{ color: c }}>{value}</span>
    </div>
  );
}

function FilterPanel({
  stageFilters, setStageFilters, forecastFilters, setForecastFilters,
  ownerFilters, setOwnerFilters, owners, clear, wide,
}: {
  stageFilters: Set<Stage>; setStageFilters: React.Dispatch<React.SetStateAction<Set<Stage>>>;
  forecastFilters: Set<ForecastCategory>; setForecastFilters: React.Dispatch<React.SetStateAction<Set<ForecastCategory>>>;
  ownerFilters: Set<string>; setOwnerFilters: React.Dispatch<React.SetStateAction<Set<string>>>;
  owners: string[]; clear: () => void; wide?: boolean;
}) {
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-2">
      <div className="mono-label px-1 mb-1">{title}</div>
      <div className={wide ? "grid grid-cols-1 gap-0.5" : "grid grid-cols-1 gap-0.5"}>{children}</div>
    </div>
  );
  const Check = ({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) => (
    <button onClick={onClick}
      className={`flex items-center gap-2 w-full px-2 py-1 rounded text-[12px] text-left ${on ? "bg-bg-deep text-ink font-medium" : "text-ink-2 hover:bg-bg-deep"}`}>
      <span className="w-3.5 h-3.5 rounded grid place-items-center" style={{ background: on ? "var(--ink)" : "transparent", border: on ? "0" : "1px solid var(--line)" }}>
        {on && <span className="w-1.5 h-1.5 bg-white rounded-sm" />}
      </span>
      <span className="flex-1">{children}</span>
    </button>
  );
  return (
    <div className="p-1">
      <Section title="Stage">
        {stageConfig.map((s) => (
          <Check key={s.name} on={stageFilters.has(s.name)} onClick={() => setStageFilters((x) => {
            const n = new Set(x); n.has(s.name) ? n.delete(s.name) : n.add(s.name); return n;
          })}>{s.name}</Check>
        ))}
      </Section>
      <hr className="hairline my-2" />
      <Section title="Forecast">
        {FORECAST_CATS.map((f) => (
          <Check key={f} on={forecastFilters.has(f)} onClick={() => setForecastFilters((x) => {
            const n = new Set(x); n.has(f) ? n.delete(f) : n.add(f); return n;
          })}>{f}</Check>
        ))}
      </Section>
      <hr className="hairline my-2" />
      <Section title="Owner">
        {owners.map((o) => (
          <Check key={o} on={ownerFilters.has(o)} onClick={() => setOwnerFilters((x) => {
            const n = new Set(x); n.has(o) ? n.delete(o) : n.add(o); return n;
          })}>{o}</Check>
        ))}
      </Section>
      <button onClick={clear} className="w-full text-[11px] text-muted hover:text-ink py-1.5 mt-1">Clear all</button>
    </div>
  );
}

// =====================================================================
// Group + row
// =====================================================================
function DealGroup({
  view, label, deals, visibleFields, favorites, onOpen, onStar,
}: {
  view: View; label: string; deals: DealRow[]; visibleFields: Set<string>;
  favorites: Set<string>; onOpen: (d: DealRow) => void; onStar: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const sum = deals.reduce((s, d) => s + d.amount, 0);
  if (view === "team") {
    return <>{deals.map((d) => <DealRowEl key={d.id} deal={d} visibleFields={visibleFields} starred={favorites.has(d.id)} onOpen={onOpen} onStar={onStar} />)}</>;
  }
  const cols = visibleFields.size + 1;
  return (
    <>
      <tr>
        <td colSpan={cols} className="px-3 py-2 bg-surface-2 border-y border-line">
          <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-[12px] font-semibold text-ink w-full">
            {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <span>{label}</span>
            <span className="ml-2 text-[10px] font-mono tnum text-muted">Count {deals.length}</span>
            <span className="ml-auto text-[10px] font-mono tnum text-muted">Sum <span className="text-ink-2 font-medium">{fmtMoney(sum)}</span></span>
          </button>
        </td>
      </tr>
      {open && deals.map((d) => <DealRowEl key={d.id} deal={d} visibleFields={visibleFields} starred={favorites.has(d.id)} onOpen={onOpen} onStar={onStar} />)}
    </>
  );
}

function DealRowEl({
  deal, visibleFields, starred, onOpen, onStar,
}: {
  deal: DealRow; visibleFields: Set<string>; starred: boolean; onOpen: (d: DealRow) => void; onStar: (id: string) => void;
}) {
  return (
    <tr className="border-b border-line hover:bg-surface-2 cursor-pointer transition-colors group" onClick={() => onOpen(deal)}>
      <td className="px-2 py-2.5 w-7" onClick={(e) => { e.stopPropagation(); onStar(deal.id); }}>
        <button title={starred ? "Unstar" : "Star"} className="w-5 h-5 grid place-items-center rounded hover:bg-bg-deep">
          <Star size={11} strokeWidth={1.6}
            style={{ color: starred ? "var(--accent)" : "transparent", fill: starred ? "var(--accent)" : "transparent" }}
            className={starred ? "" : "text-muted-2 group-hover:text-muted"} />
        </button>
      </td>
      {visibleFields.has("name") && (
        <td className="px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-bg-deep grid place-items-center text-[9px] font-semibold text-ink">
              {deal.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-[12.5px] font-semibold text-ink">{deal.name}</div>
          </div>
        </td>
      )}
      {visibleFields.has("owner") && (
        <td className="px-3 py-2.5">
          <div className="inline-flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-ink text-white grid place-items-center text-[9px] font-semibold">{deal.ownerInitials}</div>
            <span className="text-[12px] text-ink-2">{deal.owner}</span>
          </div>
        </td>
      )}
      {visibleFields.has("stage") && (
        <td className="px-3 py-2.5"><StagePill stage={deal.stage} done={deal.stageProgress.done} total={deal.stageProgress.total} /></td>
      )}
      {visibleFields.has("amount") && (
        <td className="px-3 py-2.5"><span className="text-[12.5px] font-semibold text-ink tnum">{fmtMoney(deal.amount)}</span></td>
      )}
      {visibleFields.has("forecast") && (
        <td className="px-3 py-2.5"><ForecastPill category={deal.forecast} prob={deal.forecastProb} /></td>
      )}
      {visibleFields.has("closeDate") && (
        <td className="px-3 py-2.5">
          <div className="inline-flex items-center gap-2">
            <Calendar size={11} strokeWidth={1.6} className="text-muted" />
            <span className="text-[12px] text-ink-2 tnum">{fmtDate(deal.closeDate)}</span>
            {deal.closeAtRisk && <span className="w-1 h-3.5 rounded-full" style={{ background: "var(--neg)" }} />}
          </div>
        </td>
      )}
      {visibleFields.has("meddpicc") && (
        <td className="px-3 py-2.5"><MeddpiccChips bits={deal.meddpicc} /></td>
      )}
      {visibleFields.has("nextStep") && (
        <td className="px-3 py-2.5">
          <div className="inline-flex items-center gap-2 max-w-[260px]">
            {deal.nextStep.startsWith("Blocked") ? (
              <AlertCircle size={11} strokeWidth={1.6} style={{ color: "var(--warn)" }} />
            ) : (
              <span className="w-4 h-4 rounded grid place-items-center bg-bg-deep">
                <FileText size={9} strokeWidth={1.6} className="text-muted" />
              </span>
            )}
            <span className="text-[12px] text-ink-2 truncate">{deal.nextStep}</span>
          </div>
        </td>
      )}
    </tr>
  );
}

// =====================================================================
// New Deal modal
// =====================================================================
type NewDealForm = Omit<DealRow, "id" | "ownerInitials" | "stageProgress" | "meddpicc" | "closeAtRisk" | "health">;

function NewDealModal({
  open, onClose, onSubmit, owners,
}: { open: boolean; onClose: () => void; onSubmit: (d: NewDealForm) => void; owners: string[] }) {
  const today = new Date(); today.setMonth(today.getMonth() + 2);
  const [name, setName] = useState("");
  const [account, setAccount] = useState("");
  const [owner, setOwner] = useState(owners[0] || "Sarah Chen");
  const [stage, setStage] = useState<Stage>("Qualification");
  const [amount, setAmount] = useState("100000");
  const [closeDate, setCloseDate] = useState(today.toISOString().slice(0, 10));
  const [forecast, setForecast] = useState<ForecastCategory>("Pipeline");

  const reset = () => { setName(""); setAccount(""); setStage("Qualification"); setAmount("100000"); setForecast("Pipeline"); };

  const submit = () => {
    if (!name.trim() || !account.trim()) return;
    onSubmit({
      name: name.trim(), account: account.trim(), owner,
      pipeline: "Enterprise sales", segment: "Enterprise",
      stage, amount: parseInt(amount, 10) || 0,
      forecast, forecastProb: forecast === "Pipeline" ? 25 : forecast === "Best Case" ? 50 : forecast === "Commit" ? 80 : 100,
      closeDate, nextStep: "Schedule discovery call", priority: "Medium",
    });
    reset(); onClose();
  };

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose(); }}
      title="Create new deal"
      description="Add an opportunity to your pipeline"
      width={520}
      footer={
        <>
          <ModalButton onClick={() => { reset(); onClose(); }}>Cancel</ModalButton>
          <ModalButton primary onClick={submit} disabled={!name.trim() || !account.trim()}>Create deal</ModalButton>
        </>
      }
    >
      <FormField label="Deal name">
        <TextInput value={name} onChange={setName} placeholder="e.g. Boston Dynamics — Phase 1 rollout" />
      </FormField>
      <FormField label="Account">
        <TextInput value={account} onChange={setAccount} placeholder="e.g. Boston Dynamics Inc." />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Owner">
          <SelectInput value={owner} onChange={setOwner} options={owners.map((o) => ({ value: o, label: o }))} />
        </FormField>
        <FormField label="Stage">
          <SelectInput value={stage} onChange={(v) => setStage(v as Stage)} options={STAGE_ORDER.filter((s) => s !== "Closed Won" && s !== "Closed Lost").map((s) => ({ value: s, label: s }))} />
        </FormField>
        <FormField label="Amount" hint="USD">
          <TextInput type="number" value={amount} onChange={setAmount} placeholder="100000" />
        </FormField>
        <FormField label="Forecast Category">
          <SelectInput value={forecast} onChange={(v) => setForecast(v as ForecastCategory)} options={FORECAST_CATS.map((f) => ({ value: f, label: f }))} />
        </FormField>
        <FormField label="Close date">
          <TextInput type="date" value={closeDate} onChange={setCloseDate} />
        </FormField>
      </div>
      <div className="text-[11px] text-muted mt-2">Preview: <span className="text-ink-2 font-medium">{name || "—"}</span> · <span className="tnum">{fmtFullMoney(parseInt(amount, 10) || 0)}</span></div>
    </Modal>
  );
}
