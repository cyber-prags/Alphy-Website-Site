"use client";

import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, X, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { team, fmtMoney, deals, fmtFullMoney, fmtDate, type Rep } from "@/lib/mock";

export default function PeoplePage() {
  const [openRep, setOpenRep] = useState<Rep | null>(null);

  return (
    <AppShell>
      <div className="mb-5">
        <div className="mono-label mb-1.5">People</div>
        <h1 className="display" style={{ fontSize: 22 }}>Team performance</h1>
      </div>

      <div className="card p-5 mb-5">
        <div className="mono-label mb-3">Overview</div>
        <div className="flex items-baseline gap-3 mb-1">
          <div className="display tnum" style={{ fontSize: 30 }}>$1.8<span className="kpi-decimal">M</span></div>
          <span
            className="inline-flex items-center gap-1 text-[11.5px] font-medium px-2 h-6 rounded-full"
            style={{ background: "var(--pos-soft)", color: "var(--pos)" }}
          >
            <ArrowUpRight size={12} strokeWidth={1.8} />$2M MoM
          </span>
        </div>
        <Waterfall />

        <div className="grid grid-cols-4 gap-3 mt-5">
          <KpiCard label="Open Deals" value="226" delta={5} />
          <KpiCard label="Pipeline" value="$6.78M" delta={7} />
          <KpiCard label="Forecast" value="$2.71M" delta={-3} />
          <KpiCard label="Pipeline Coverage" value="2.1x" delta={4} />
        </div>
      </div>

      <div className="mono-label mb-3">My Team</div>
      <div className="grid grid-cols-3 gap-4">
        {team.map((r) => (
          <RepCard key={r.id} rep={r} onClick={() => setOpenRep(r)} />
        ))}
      </div>

      <RepDrillDown rep={openRep} onClose={() => setOpenRep(null)} />
    </AppShell>
  );
}

function RepCard({ rep, onClick }: { rep: Rep; onClick: () => void }) {
  const pct = Math.round((rep.achieved / rep.target) * 100);
  const color = pct >= 60 ? "var(--pos)" : pct >= 40 ? "var(--warn)" : "var(--neg)";
  return (
    <button onClick={onClick} className="card p-5 text-left hover:bg-bg-deep transition-colors w-full">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-ink text-white grid place-items-center text-[12px] font-semibold">{rep.initials}</div>
        <div>
          <div className="text-[13.5px] font-semibold text-ink">{rep.name}</div>
          <div className="text-[11px] text-muted">Account Executive</div>
        </div>
      </div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-semibold text-ink-2">Target Pacing</span>
        <span className="text-[11.5px] font-mono tnum text-ink">{pct}% Achieved</span>
      </div>
      <div className="health-bar mb-2"><span style={{ width: `${pct}%`, background: color }} /></div>
      <div className="flex items-center justify-between text-[11.5px] mb-3">
        <span className="text-muted tnum">{fmtMoney(rep.achieved)}</span>
        <span className="text-ink-2 tnum">{fmtMoney(rep.target)}</span>
      </div>
      <hr className="hairline mb-3" />
      <div className="grid grid-cols-3 gap-2 text-center">
        <SubMetric label="Open Deals" value={String(rep.openDeals)} />
        <SubMetric label="Active Pipeline" value={fmtMoney(rep.pipeline)} />
        <SubMetric label="Forecast" value={fmtMoney(rep.forecast)} />
      </div>
    </button>
  );
}

function SubMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-muted mb-0.5">{label}</div>
      <div className="text-[15px] font-semibold text-ink tnum">{value}</div>
    </div>
  );
}

function Waterfall() {
  const stops = [
    { label: "Closed",     pct: 54,  value: "$2.21M", color: "var(--pos)"  },
    { label: "Commit",     pct: 64,  value: "$2.71M", color: "var(--warn)" },
    { label: "Best Case",  pct: 78,  value: "$3.30M", color: "var(--info)" },
    { label: "Target",     pct: 100, value: "—",      color: "var(--ink)"  },
  ];
  return (
    <div>
      <div className="health-bar mb-3" style={{ height: 8 }}>
        <span style={{ width: "54%", background: "var(--pos)" }} />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {stops.map((s) => (
          <div key={s.label} className="text-[12.5px]">
            <div className="text-ink font-semibold tnum">{s.value}</div>
            <div className="text-muted">{s.label} ({s.pct}%)</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KpiCard({ label, value, delta }: { label: string; value: string; delta: number }) {
  const positive = delta >= 0;
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11.5px] text-muted mb-1">{label}</div>
          <div className="display tnum" style={{ fontSize: 24 }}>{value}</div>
        </div>
        <span
          className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 h-6 rounded-full"
          style={{
            background: positive ? "var(--pos-soft)" : "var(--neg-soft)",
            color: positive ? "var(--pos)" : "var(--neg)",
          }}
        >
          {positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
          {Math.abs(delta)}%
        </span>
      </div>
    </div>
  );
}

function RepDrillDown({ rep, onClose }: { rep: Rep | null; onClose: () => void }) {
  if (!rep) return null;
  const repDeals = deals.filter((d) => d.owner === rep.name);
  return (
    <>
      <div className="fixed inset-0 bg-ink/30 z-[90] fade-in" onClick={onClose} />
      <aside className="fixed top-0 right-0 h-screen w-[520px] bg-bg z-[95] drawer-anim border-l border-line flex flex-col">
        <div className="px-4 h-12 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-ink text-white grid place-items-center text-[10px] font-semibold">{rep.initials}</div>
            <div>
              <div className="text-[12.5px] font-semibold text-ink">{rep.name}</div>
              <div className="text-[10.5px] text-muted">
                {repDeals.length} open deal{repDeals.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-md grid place-items-center text-muted hover:text-ink hover:bg-bg-deep">
            <X size={13} strokeWidth={1.6} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {repDeals.length === 0 ? (
            <div className="text-[12.5px] text-muted px-2 py-4 text-center">No open deals owned by this rep.</div>
          ) : (
            repDeals.map((d) => (
              <div key={d.id} className="card p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[12.5px] font-semibold text-ink">{d.name}</div>
                  <div className="text-[12.5px] font-semibold tnum">{fmtFullMoney(d.amount)}</div>
                </div>
                <div className="flex items-center justify-between text-[10.5px] text-muted">
                  <span>{d.stage} · {d.forecast}</span>
                  <span className="tnum">close {fmtDate(d.closeDate)}</span>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-3 border-t border-line">
          <a href="/deals" className="text-[12px] text-ink-2 hover:text-ink inline-flex items-center gap-1">
            Open in Records <ArrowRight size={12} />
          </a>
        </div>
      </aside>
    </>
  );
}
