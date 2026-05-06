"use client";

import { useState } from "react";
import {
  Grid3X3, ArrowRight, TrendingUp, Target, ChevronRight,
  Sparkles, X,
} from "lucide-react";
import {
  productCatalog, whiteSpaceData, crossSellRecommendations, fmtMoney,
  type WhiteSpaceAnalysis, type WhiteSpaceCell, type ProductLine, type CrossSellRecommendation,
  type AccountDetail,
} from "@/lib/mock";

const STATUS_META: Record<WhiteSpaceCell["status"], { label: string; bg: string; ink: string; border: string }> = {
  "active":            { label: "Active",    bg: "var(--pos)",       ink: "#fff",            border: "var(--pos)" },
  "trial":             { label: "Trial",     bg: "var(--info)",      ink: "#fff",            border: "var(--info)" },
  "expansion-target":  { label: "Target",    bg: "var(--accent)",    ink: "var(--bg)",       border: "var(--accent)" },
  "not-sold":          { label: "Gap",       bg: "var(--bg-deep)",   ink: "var(--muted)",    border: "var(--line)" },
};

export function WhiteSpaceMatrix({ account, slug }: { account: AccountDetail; slug: string }) {
  const ws = whiteSpaceData[slug];

  if (!ws) {
    return (
      <div className="card p-8 text-center text-muted">
        <Grid3X3 size={24} className="mx-auto mb-2 opacity-40" />
        <div className="text-[13px]">No white space data available for this account.</div>
      </div>
    );
  }

  const departments = Array.from(new Set(ws.cells.map((c) => c.department)));
  const productsInUse = Array.from(new Set(ws.cells.map((c) => c.productId)));
  const products = productCatalog.filter((p) => productsInUse.includes(p.id));

  const cellMap = new Map<string, WhiteSpaceCell>();
  ws.cells.forEach((c) => cellMap.set(`${c.productId}::${c.department}`, c));

  const recommendations = crossSellRecommendations.filter((r) => r.accountSlug === ws.accountSlug);

  const activeCount = ws.cells.filter((c) => c.status === "active").length;
  const trialCount = ws.cells.filter((c) => c.status === "trial").length;
  const targetCount = ws.cells.filter((c) => c.status === "expansion-target").length;
  const gapCount = ws.cells.filter((c) => c.status === "not-sold").length;

  return (
    <div className="space-y-5">
      {/* Summary strip */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg grid place-items-center" style={{ background: "var(--accent-soft)" }}>
              <Grid3X3 size={13} strokeWidth={1.8} style={{ color: "var(--accent-ink)" }} />
            </div>
            <div className="mono-label" style={{ color: "var(--accent-ink)" }}>product penetration</div>
          </div>
          <div className="text-[11.5px] text-muted [&_strong]:tnum [&_strong]:text-ink [&_strong]:font-semibold">
            <strong>{ws.adoptionPct}%</strong> catalog adopted
            <span className="mx-1.5 text-muted-2">·</span>
            <strong style={{ color: "var(--accent-ink)" }}>{fmtMoney(ws.totalWhiteSpace)}</strong> white space
            <span className="mx-1.5 text-muted-2">·</span>
            Top gap: <strong>{ws.topOpportunity.replace("Alphard · ", "")}</strong>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-[10px] font-mono text-muted">
          {(["active", "trial", "expansion-target", "not-sold"] as const).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-[3px] inline-block border" style={{
                background: STATUS_META[s].bg,
                borderColor: STATUS_META[s].border,
                opacity: s === "not-sold" ? 0.5 : 1,
              }} />
              {STATUS_META[s].label}
              <span className="text-ink font-semibold">
                {s === "active" ? activeCount : s === "trial" ? trialCount : s === "expansion-target" ? targetCount : gapCount}
              </span>
            </span>
          ))}
        </div>

        {/* Matrix grid */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left text-[10px] font-mono uppercase tracking-[0.06em] text-muted p-2 w-[140px]">Product</th>
                {departments.map((d) => (
                  <th key={d} className="text-center text-[10px] font-mono uppercase tracking-[0.06em] text-muted p-2">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <MatrixRow key={product.id} product={product} departments={departments} cellMap={cellMap} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <RecommendationsSection recommendations={recommendations} />
      )}
    </div>
  );
}

function MatrixRow({
  product, departments, cellMap,
}: {
  product: ProductLine;
  departments: string[];
  cellMap: Map<string, WhiteSpaceCell>;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <>
      <tr>
        <td className="p-2">
          <div className="text-[11.5px] font-semibold text-ink truncate">{product.name.replace("Alphard · ", "")}</div>
          <div className="text-[10px] text-muted truncate">{product.category}</div>
        </td>
        {departments.map((dept) => {
          const cell = cellMap.get(`${product.id}::${dept}`);
          if (!cell) {
            return (
              <td key={dept} className="p-1.5 text-center">
                <div className="w-full h-12 rounded-lg border border-dashed flex items-center justify-center"
                  style={{ borderColor: "var(--line)", opacity: 0.3 }}>
                  <span className="text-[9px] text-muted">—</span>
                </div>
              </td>
            );
          }
          const meta = STATUS_META[cell.status];
          const isClickable = cell.status === "not-sold" || cell.status === "expansion-target";
          const isExpanded = expanded === `${product.id}::${dept}`;

          return (
            <td key={dept} className="p-1.5 text-center">
              <button
                onClick={() => isClickable ? setExpanded(isExpanded ? null : `${product.id}::${dept}`) : undefined}
                className={`w-full h-12 rounded-lg border flex flex-col items-center justify-center gap-0.5 transition-all ${
                  isClickable ? "cursor-pointer hover:scale-[1.04]" : "cursor-default"
                } ${isExpanded ? "ring-2 ring-offset-1" : ""}`}
                style={{
                  background: cell.status === "not-sold" ? "var(--surface)" : meta.bg,
                  borderColor: meta.border,
                  color: meta.ink,
                  opacity: cell.status === "not-sold" ? 0.6 : 1,
                  // @ts-expect-error CSS var
                  "--tw-ring-color": meta.border,
                  "--tw-ring-offset-color": "var(--bg)",
                }}
              >
                {cell.status === "active" && cell.arr ? (
                  <>
                    <span className="text-[11px] font-bold tnum">{fmtMoney(cell.arr)}</span>
                    {cell.seats && <span className="text-[9px] opacity-80">{cell.seats} seats</span>}
                  </>
                ) : cell.status === "trial" ? (
                  <>
                    <span className="text-[10px] font-semibold">Trial</span>
                    {cell.seats && <span className="text-[9px] opacity-80">{cell.seats} seats</span>}
                  </>
                ) : cell.status === "expansion-target" ? (
                  <>
                    <Target size={11} strokeWidth={2} />
                    <span className="text-[9px] font-semibold">{fmtMoney(cell.estimatedArr ?? 0)}</span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px]">Gap</span>
                    {cell.estimatedArr && <span className="text-[9px] tnum">{fmtMoney(cell.estimatedArr)}</span>}
                  </>
                )}
              </button>
            </td>
          );
        })}
      </tr>
      {expanded && (
        <tr>
          <td colSpan={departments.length + 1} className="p-0">
            <CellDetail
              cell={cellMap.get(expanded)!}
              product={products_lookup(expanded.split("::")[0])}
              onClose={() => setExpanded(null)}
            />
          </td>
        </tr>
      )}
    </>
  );
}

function products_lookup(id: string): ProductLine {
  return productCatalog.find((p) => p.id === id) ?? productCatalog[0];
}

function CellDetail({ cell, product, onClose }: { cell: WhiteSpaceCell; product: ProductLine; onClose: () => void }) {
  return (
    <div className="mx-2 mb-2 rounded-xl border border-line bg-surface p-4 animate-in slide-in-from-top-1" style={{ background: "var(--surface)" }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-[12.5px] font-semibold text-ink">{product.name} · {cell.department}</div>
          <div className="text-[11px] text-muted mt-0.5">
            {cell.status === "expansion-target" ? "Expansion target identified" : "Product not yet deployed in this department"}
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-bg-deep transition-colors">
          <X size={14} className="text-muted" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        {cell.estimatedArr !== undefined && (
          <div className="rounded-lg border border-line p-2.5" style={{ background: "var(--bg-deep)" }}>
            <div className="text-[10px] font-mono uppercase text-muted mb-1">Est. ARR</div>
            <div className="text-[16px] font-bold tnum text-ink">{fmtMoney(cell.estimatedArr)}</div>
          </div>
        )}
        {cell.confidence !== undefined && (
          <div className="rounded-lg border border-line p-2.5" style={{ background: "var(--bg-deep)" }}>
            <div className="text-[10px] font-mono uppercase text-muted mb-1">Confidence</div>
            <div className="text-[16px] font-bold tnum" style={{ color: cell.confidence >= 70 ? "var(--pos)" : cell.confidence >= 50 ? "var(--warn)" : "var(--muted)" }}>
              {cell.confidence}%
            </div>
          </div>
        )}
        {cell.patternMatches !== undefined && (
          <div className="rounded-lg border border-line p-2.5" style={{ background: "var(--bg-deep)" }}>
            <div className="text-[10px] font-mono uppercase text-muted mb-1">Pattern matches</div>
            <div className="text-[16px] font-bold tnum text-ink">{cell.patternMatches}</div>
          </div>
        )}
      </div>

      <button className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-lg transition-colors"
        style={{ background: "var(--accent)", color: "var(--bg)" }}>
        <Sparkles size={12} strokeWidth={2} /> Build expansion case <ArrowRight size={11} strokeWidth={2} />
      </button>
    </div>
  );
}

function RecommendationsSection({ recommendations }: { recommendations: CrossSellRecommendation[] }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg grid place-items-center" style={{ background: "var(--pos-soft)" }}>
          <TrendingUp size={13} strokeWidth={1.8} style={{ color: "var(--pos)" }} />
        </div>
        <div className="mono-label" style={{ color: "var(--pos)" }}>recommended expansions</div>
        <span className="ml-auto text-[10.5px] text-muted font-mono">{recommendations.length} opportunities</span>
      </div>
      <div className="space-y-2.5">
        {recommendations.map((rec) => (
          <RecommendationRow key={rec.id} rec={rec} />
        ))}
      </div>
    </div>
  );
}

function RecommendationRow({ rec }: { rec: CrossSellRecommendation }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-line overflow-hidden" style={{ background: "var(--surface)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-bg-deep/50 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg grid place-items-center shrink-0" style={{ background: "var(--bg-deep)" }}>
          <Target size={14} strokeWidth={1.7} style={{ color: "var(--accent-ink)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-semibold text-ink truncate">{rec.productName}</div>
          <div className="text-[10.5px] text-muted truncate">{rec.suggestedPlay}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[13px] font-bold tnum text-ink">{fmtMoney(rec.estimatedArr)}</div>
          <div className="text-[10px] font-mono tnum" style={{ color: rec.confidence >= 70 ? "var(--pos)" : "var(--warn)" }}>
            {rec.confidence}% confidence
          </div>
        </div>
        <ChevronRight size={14} className={`text-muted transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      {open && (
        <div className="px-3.5 pb-3.5 border-t border-line pt-3" style={{ background: "var(--bg-deep)" }}>
          <div className="text-[10px] font-mono uppercase text-muted mb-2">Evidence</div>
          <ul className="space-y-1.5 mb-3">
            {rec.evidence.map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px] text-ink-2">
                <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: "var(--pos)" }} />
                {e}
              </li>
            ))}
          </ul>
          <button className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-lg transition-colors"
            style={{ background: "var(--accent)", color: "var(--bg)" }}>
            <Sparkles size={12} strokeWidth={2} /> Build case <ArrowRight size={11} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}
