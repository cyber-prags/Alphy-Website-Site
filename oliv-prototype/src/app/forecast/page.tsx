"use client";

import { useState } from "react";
import { Sparkles, CheckCircle2, ArrowUpRight, ArrowDownRight, Calendar, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { managers, fmtMoney, deals, fmtFullMoney, fmtDate, type DealRow } from "@/lib/mock";
import { useToast } from "@/components/Toast";
import { Popover, MenuItem, MenuLabel } from "@/components/Popover";

export default function ForecastPage() {
  const toast = useToast();
  const [mode, setMode] = useState<"ai" | "seller">("ai");
  const [period, setPeriod] = useState<"Quarterly" | "Monthly">("Quarterly");
  const [quarter, setQuarter] = useState<"Q1" | "Q2" | "Q3" | "Q4">("Q1");
  const [snapshot, setSnapshot] = useState("Today");
  const [approved, setApproved] = useState<Record<string, Set<"commit" | "ml" | "best">>>(() => {
    const init: Record<string, Set<"commit" | "ml" | "best">> = {};
    managers.forEach((m) => init[m.id] = new Set(["commit", "ml", "best"]));
    return init;
  });
  const [drillDown, setDrillDown] = useState<{ manager: string; bucket: "commit" | "ml" | "best" } | null>(null);
  const toggleApprove = (mgrId: string, bucket: "commit" | "ml" | "best") => {
    setApproved((s) => {
      const cur = new Set(s[mgrId] ?? []);
      cur.has(bucket) ? cur.delete(bucket) : cur.add(bucket);
      const next = { ...s, [mgrId]: cur };
      toast({ tone: "success", title: cur.has(bucket) ? "Approved" : "Approval reverted", body: `${managers.find((m) => m.id === mgrId)?.name} · ${bucket}` });
      return next;
    });
  };
  const drillDeals = drillDown ? deals.slice(0, 5) : [];

  return (
    <AppShell>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="mono-label mb-1.5">Forecast</div>
          <h1 className="display" style={{ fontSize: 22 }}>Adriana Smith's team</h1>
        </div>
        <div className="flex items-center gap-3 text-[12px]">
          <span className="text-muted">Forecasting Mode &amp; Role</span>
          <div className="flex bg-bg-deep rounded-full p-0.5">
            <button onClick={() => setMode("ai")}
              className={`text-[11.5px] font-medium px-3 h-7 rounded-full inline-flex items-center gap-1.5 ${mode === "ai" ? "bg-ink text-white" : "text-muted"}`}>
              <Sparkles size={11} strokeWidth={1.8} />AI Assisted
            </button>
            <button onClick={() => setMode("seller")}
              className={`text-[11.5px] font-medium px-3 h-7 rounded-full ${mode === "seller" ? "bg-ink text-white" : "text-muted"}`}>
              Seller
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex bg-bg-deep rounded-full p-0.5">
          {(["Quarterly", "Monthly"] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`text-[11.5px] font-medium px-3 h-7 rounded-full ${period === p ? "bg-ink text-white" : "text-muted"}`}>
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-[12px]">
          <span className="text-muted">Quarter</span>
          <Popover
            width={140}
            trigger={(_, t) => (
              <button onClick={t} className="h-8 px-2.5 rounded-md border border-line bg-surface text-[12px] inline-flex items-center gap-1.5">
                {quarter}
              </button>
            )}
          >
            {(close) => (
              <>
                {(["Q1", "Q2", "Q3", "Q4"] as const).map((q) => (
                  <MenuItem key={q} selected={quarter === q} onClick={() => { setQuarter(q); close(); toast({ tone: "info", title: `Quarter set to ${q}` }); }}>{q}</MenuItem>
                ))}
              </>
            )}
          </Popover>
          <span className="text-muted">Snapshot</span>
          <Popover
            width={300} align="right"
            trigger={(_, t) => (
              <button onClick={t} className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-line bg-surface text-[12px]">
                <Calendar size={12} strokeWidth={1.6} className="text-muted" /> {snapshot}
              </button>
            )}
          >
            {(close) => (
              <SnapshotPicker selected={snapshot}
                onSelect={(s) => { setSnapshot(s); close(); toast({ tone: "info", title: `Snapshot · ${s}` }); }} />
            )}
          </Popover>
        </div>
      </div>

      {/* VP-level KPI strip */}
      <div className="card p-5 mb-4">
        <div className="grid grid-cols-[260px_1fr] items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-ink text-white grid place-items-center text-[12px] font-semibold">AS</div>
            <div>
              <div className="text-[13.5px] font-semibold text-ink">Adriana Smith</div>
              <div className="text-[11px] text-muted">VP of Sales</div>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-3">
            <Stat label="Target Attainment" head="$5.3M" sub="Target: $9.6M" pct={56} />
            <Stat label="Pipeline Coverage" head="3.36x" delta={1} />
            <Stat label="Commit Forecast"   head="$9.3M"  delta={3} />
            <Stat label="Most Likely"       head="$10.3M" delta={2} />
            <Stat label="Best Case"         head="$11.7M" delta={3} />
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-deep">
            <tr>
              {["Managers", "Target Attainment", "Pipeline Coverage", "Commit Forecast", "Most Likely Forecast", "Best Case Forecast"].map((h, i) => (
                <th key={h} className={`text-left px-4 py-3 text-[11px] font-semibold text-muted uppercase tracking-wider ${
                  i === 0 ? "rounded-tl-2xl" : i === 5 ? "rounded-tr-2xl" : ""
                }`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {managers.map((m) => {
              const pct = Math.round((m.attainment / m.target) * 100);
              return (
                <tr key={m.id} className="border-b border-line hover:bg-surface-2">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-bg-deep text-ink grid place-items-center text-[11px] font-semibold">{m.initials}</div>
                      <div>
                        <div className="text-[13px] font-semibold text-ink">{m.name}</div>
                        <div className="text-[11px] text-muted">{m.region}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 min-w-[180px]">
                    <div className="text-[13.5px] font-semibold text-ink tnum">{fmtMoney(m.attainment)}</div>
                    <div className="health-bar my-1.5"><span style={{ width: `${pct}%`, background: pct >= 60 ? "var(--pos)" : "var(--warn)" }} /></div>
                    <div className="flex justify-between text-[10.5px] text-muted tnum"><span>Target: {fmtMoney(m.target)}</span><span>{pct}%</span></div>
                  </td>
                  <td className="px-4 py-4">
                    <DeltaCell head={`${m.coverage}x`} delta={m.coverageDelta} />
                  </td>
                  <td className="px-4 py-4">
                    <DeltaCell head={fmtMoney(m.commit)} delta={m.commitDelta} sub={`${m.commitDeals} deals`}
                      approved={approved[m.id]?.has("commit")}
                      onApprove={() => toggleApprove(m.id, "commit")}
                      onDrill={() => setDrillDown({ manager: m.name, bucket: "commit" })} />
                  </td>
                  <td className="px-4 py-4">
                    <DeltaCell head={fmtMoney(m.mostLikely)} delta={m.mostLikelyDelta} sub={`${m.commitDeals} deals`}
                      approved={approved[m.id]?.has("ml")}
                      onApprove={() => toggleApprove(m.id, "ml")}
                      onDrill={() => setDrillDown({ manager: m.name, bucket: "ml" })} />
                  </td>
                  <td className="px-4 py-4">
                    <DeltaCell head={fmtMoney(m.bestCase)} delta={m.bestCaseDelta} sub={`${m.commitDeals} deals`}
                      approved={approved[m.id]?.has("best")}
                      onApprove={() => toggleApprove(m.id, "best")}
                      onDrill={() => setDrillDown({ manager: m.name, bucket: "best" })} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Drill-down side panel */}
      {drillDown && (
        <>
          <div className="fixed inset-0 bg-ink/30 z-[90] fade-in" onClick={() => setDrillDown(null)} />
          <aside className="fixed top-0 right-0 h-screen w-[460px] bg-bg z-[95] drawer-anim border-l border-line flex flex-col">
            <div className="px-4 h-12 border-b border-line flex items-center justify-between">
              <div>
                <div className="mono-label">Forecast drilldown</div>
                <div className="text-[12.5px] font-semibold text-ink">
                  {drillDown.manager} · {drillDown.bucket === "commit" ? "Commit" : drillDown.bucket === "ml" ? "Most Likely" : "Best Case"}
                </div>
              </div>
              <button onClick={() => setDrillDown(null)} className="w-7 h-7 rounded-md grid place-items-center text-muted hover:text-ink hover:bg-bg-deep">
                <X size={13} strokeWidth={1.6} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {drillDeals.map((d: DealRow) => (
                <div key={d.id} className="card p-3 hover:bg-bg-deep cursor-pointer">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-[12.5px] font-semibold text-ink">{d.name}</div>
                    <div className="text-[12.5px] font-semibold tnum">{fmtFullMoney(d.amount)}</div>
                  </div>
                  <div className="flex items-center justify-between text-[10.5px] text-muted">
                    <span>{d.stage} · {d.owner}</span>
                    <span className="tnum">close {fmtDate(d.closeDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </>
      )}
    </AppShell>
  );
}

function Stat({ label, head, sub, delta, pct }: { label: string; head: string; sub?: string; delta?: number; pct?: number }) {
  return (
    <div>
      <div className="text-[11px] text-muted mb-1">{label}</div>
      <div className="display tnum" style={{ fontSize: 22 }}>{head}</div>
      {pct !== undefined && (
        <>
          <div className="health-bar my-1.5"><span style={{ width: `${pct}%`, background: "var(--pos)" }} /></div>
          <div className="flex justify-between text-[10.5px] text-muted tnum"><span>{sub}</span><span>{pct}%</span></div>
        </>
      )}
      {delta !== undefined && (
        <span className="inline-flex items-center gap-0.5 text-[10.5px] font-medium mt-1" style={{ color: delta >= 0 ? "var(--pos)" : "var(--neg)" }}>
          {delta >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}{Math.abs(delta)}%
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Snapshot picker — presets + 21-day calendar grid
// ---------------------------------------------------------------------
function SnapshotPicker({ selected, onSelect }: { selected: string; onSelect: (s: string) => void }) {
  const today = new Date();
  const days: { date: Date; label: string }[] = [];
  for (let i = 20; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    days.push({ date: d, label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) });
  }
  const PRESETS = [
    { id: "Today",            label: "Today" },
    { id: "Yesterday",        label: "Yesterday" },
    { id: "Last week",        label: "Last week" },
    { id: "Start of quarter", label: "Start of quarter" },
  ];
  return (
    <div className="p-2">
      <MenuLabel>Compare to</MenuLabel>
      {PRESETS.map((p) => (
        <MenuItem key={p.id} selected={selected === p.id} onClick={() => onSelect(p.id)}>{p.label}</MenuItem>
      ))}
      <hr className="hairline my-1.5" />
      <MenuLabel>Or pick a date</MenuLabel>
      <div className="grid grid-cols-7 gap-1 px-1.5 pb-1">
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <div key={i} className="text-[9px] font-mono text-muted-2 text-center py-0.5">{d}</div>
        ))}
        {/* leading blanks to align Sunday */}
        {Array.from({ length: days[0].date.getDay() }).map((_, i) => <div key={`b${i}`} />)}
        {days.map((d) => {
          const label = d.label;
          const isSelected = selected === label;
          const isToday = d.date.toDateString() === today.toDateString();
          return (
            <button key={label} onClick={() => onSelect(label)}
              className={`text-[10.5px] tnum h-7 rounded transition-colors ${
                isSelected ? "bg-ink text-white"
                  : isToday ? "bg-bg-deep text-ink font-semibold"
                  : "text-ink-2 hover:bg-bg-deep"
              }`}
              title={d.date.toDateString()}>
              {d.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DeltaCell({ head, delta, sub, approved, onApprove, onDrill }: { head: string; delta: number; sub?: string; approved?: boolean; onApprove?: () => void; onDrill?: () => void }) {
  const positive = delta >= 0;
  return (
    <div className="flex items-center justify-between gap-3">
      <button onClick={onDrill} className="text-left flex-1 hover:underline decoration-dotted underline-offset-2">
        <div className="flex items-baseline gap-2">
          <div className="text-[13.5px] font-semibold text-ink tnum">{head}</div>
          <span className="inline-flex items-center gap-0.5 text-[10.5px] font-medium" style={{ color: positive ? "var(--pos)" : "var(--neg)" }}>
            {positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}{Math.abs(delta)}%
          </span>
        </div>
        {sub && <div className="text-[10.5px] text-muted tnum">{sub}</div>}
      </button>
      <button onClick={onApprove} title={approved ? "Approved · click to revert" : "Approve"}
        className="w-5 h-5 rounded-full grid place-items-center transition-colors"
        style={{
          background: approved ? "var(--pos-soft)" : "transparent",
          color:      approved ? "var(--pos)"      : "var(--muted-2)",
          border:     approved ? "0"               : "1px solid var(--line)",
        }}>
        <CheckCircle2 size={11} strokeWidth={approved ? 2 : 1.6} />
      </button>
    </div>
  );
}
