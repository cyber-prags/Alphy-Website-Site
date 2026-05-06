"use client";

import { useState } from "react";
import { Target, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import {
  expansionOpportunities, fmtMoney,
  type ExpansionOpportunity, type ExpansionFactor,
} from "@/lib/mock";

export function ExpansionScoreCard({ accountSlug }: { accountSlug?: string }) {
  const items = accountSlug
    ? expansionOpportunities.filter((o) => o.accountSlug === accountSlug)
    : expansionOpportunities;

  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      {items.map((opp) => (
        <OpportunityRow key={opp.id} opp={opp} />
      ))}
    </div>
  );
}

function OpportunityRow({ opp }: { opp: ExpansionOpportunity }) {
  const [open, setOpen] = useState(false);
  const scoreColor = opp.score >= 80 ? "var(--pos)" : opp.score >= 60 ? "var(--warn)" : "var(--muted)";

  return (
    <div className="rounded-xl border border-line overflow-hidden" style={{ background: "var(--surface)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-bg-deep/50 transition-colors"
      >
        {/* Score circle */}
        <div className="w-10 h-10 rounded-full border-2 grid place-items-center shrink-0"
          style={{ borderColor: scoreColor }}>
          <span className="text-[14px] font-bold tnum" style={{ color: scoreColor }}>{opp.score}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-semibold text-ink truncate">{opp.accountName}</span>
            <span className="text-[10px] text-muted">·</span>
            <span className="text-[11px] text-muted truncate">{opp.productName}</span>
          </div>
          <div className="text-[10.5px] text-muted truncate mt-0.5">{opp.play}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[13px] font-bold tnum text-ink">{fmtMoney(opp.estimatedArr)}</div>
        </div>
        <ChevronRight size={14} className={`text-muted transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      {open && (
        <div className="px-3 pb-3 border-t border-line pt-3" style={{ background: "var(--bg-deep)" }}>
          {/* Factor breakdown */}
          <div className="space-y-2 mb-3">
            {opp.factors.map((f) => (
              <FactorBar key={f.label} factor={f} />
            ))}
          </div>
          <div className="text-[10.5px] text-muted mb-3">{opp.evidence}</div>
          <button className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-lg transition-colors"
            style={{ background: "var(--accent)", color: "var(--bg)" }}>
            <Sparkles size={12} strokeWidth={2} /> {opp.play.split("—")[0].trim()} <ArrowRight size={11} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}

function FactorBar({ factor }: { factor: ExpansionFactor }) {
  const color = factor.score >= 80 ? "var(--pos)" : factor.score >= 60 ? "var(--warn)" : "var(--neg)";
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted w-[100px] shrink-0 truncate">{factor.label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${factor.score}%`, background: color }} />
      </div>
      <span className="text-[10px] font-mono font-semibold tnum w-7 text-right" style={{ color }}>{factor.score}</span>
    </div>
  );
}
