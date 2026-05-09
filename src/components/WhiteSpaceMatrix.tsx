"use client";

import { useState } from "react";
import {
  Grid3X3, ArrowRight, TrendingUp, Target, ChevronRight,
  Sparkles, X, Zap, AlertTriangle, Crown, Users, Mail,
} from "lucide-react";
import {
  productCatalog, whiteSpaceData, crossSellRecommendations, fmtMoney,
  type WhiteSpaceAnalysis, type WhiteSpaceCell, type ProductLine, type CrossSellRecommendation,
  type AccountDetail, type Stakeholder,
} from "@/lib/mock";
import { useToast } from "@/components/Toast";
import { PersonAvatar } from "@/components/PersonAvatar";

const ACCENT = "#266DF0";

const STATUS_META: Record<WhiteSpaceCell["status"], { label: string; color: string; bg: string; ring: string }> = {
  "active":            { label: "Active",  color: "var(--pos)",         bg: "var(--pos-soft)",     ring: "var(--pos)"          },
  "trial":             { label: "Trial",   color: "var(--info)",        bg: "var(--info-soft)",    ring: "var(--info)"         },
  "expansion-target":  { label: "Target",  color: "var(--accent-deep)", bg: "var(--accent-soft)",  ring: "var(--accent-deep)"  },
  "not-sold":          { label: "Gap",     color: "var(--muted)",       bg: "var(--bg-deep)",      ring: "var(--line)"         },
};

export function WhiteSpaceMatrix({ account, slug }: { account: AccountDetail; slug: string }) {
  const ws = whiteSpaceData[slug];

  if (!ws) {
    return (
      <div className="rounded-2xl p-10 text-center"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
        <div className="w-12 h-12 rounded-xl grid place-items-center mx-auto mb-3"
          style={{ background: "var(--accent-soft)" }}>
          <Grid3X3 size={20} strokeWidth={1.6} style={{ color: ACCENT }} />
        </div>
        <div className="text-[14px] font-semibold text-ink mb-1">No white space data yet</div>
        <div className="text-[12px] text-muted max-w-sm mx-auto leading-relaxed">
          Connect product usage data on the Integrations page to map adoption gaps and surface expansion opportunities.
        </div>
      </div>
    );
  }

  const departments = Array.from(new Set(ws.cells.map((c) => c.department)));
  const productsInUse = Array.from(new Set(ws.cells.map((c) => c.productId)));
  const products = productCatalog.filter((p) => productsInUse.includes(p.id));

  const cellMap = new Map<string, WhiteSpaceCell>();
  ws.cells.forEach((c) => cellMap.set(`${c.productId}::${c.department}`, c));

  const recommendations = crossSellRecommendations.filter((r) => r.accountSlug === ws.accountSlug);

  const counts = {
    active: ws.cells.filter((c) => c.status === "active").length,
    trial: ws.cells.filter((c) => c.status === "trial").length,
    target: ws.cells.filter((c) => c.status === "expansion-target").length,
    gap: ws.cells.filter((c) => c.status === "not-sold").length,
  };

  // Highest-confidence target → "best play" headline number
  const bestTarget = ws.cells
    .filter((c) => c.status === "expansion-target" && c.confidence != null)
    .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))[0];

  return (
    <div className="space-y-4">
      {/* ─── KPI strip ───────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <Kpi label="Catalog adopted"  value={`${ws.adoptionPct}%`}              tone="var(--ink)" />
        <Kpi label="White space"      value={fmtMoney(ws.totalWhiteSpace)}      tone={ACCENT} />
        <Kpi label="Top gap"          value={ws.topOpportunity.replace("Alphard · ", "")} tone="var(--ink)" mono />
        <Kpi label="Best confidence"  value={bestTarget?.confidence ? `${bestTarget.confidence}%` : "—"} tone="var(--pos)" />
      </div>

      {/* ─── Matrix card ─────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
        <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3"
          style={{ borderBottom: "1px solid var(--line)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg grid place-items-center"
              style={{ background: "var(--accent-soft)" }}>
              <Grid3X3 size={14} strokeWidth={1.8} style={{ color: ACCENT }} />
            </div>
            <div>
              <div className="text-[13.5px] font-semibold text-ink"
                style={{ letterSpacing: "-0.005em" }}>
                Product × Department
              </div>
              <div className="text-[11px] text-muted">
                {products.length} products · {departments.length} departments · {ws.cells.length} cells
              </div>
            </div>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(["active", "trial", "expansion-target", "not-sold"] as const).map((s) => (
              <span key={s}
                className="inline-flex items-center gap-1.5 text-[10.5px] font-medium px-2 py-1 rounded-md"
                style={{ background: STATUS_META[s].bg, color: STATUS_META[s].color }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_META[s].ring }} />
                {STATUS_META[s].label}
                <span className="font-mono tnum" style={{ opacity: 0.75 }}>
                  {s === "active" ? counts.active : s === "trial" ? counts.trial : s === "expansion-target" ? counts.target : counts.gap}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Matrix grid */}
        <div className="overflow-x-auto p-4">
          <table className="w-full border-separate" style={{ borderSpacing: "6px" }}>
            <thead>
              <tr>
                <th className="text-left text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 pl-3 pr-4 pb-2 w-[160px]">
                  Product
                </th>
                {departments.map((d) => (
                  <th key={d}
                    className="text-center text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 px-2 pb-2">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <MatrixRow key={product.id} product={product} departments={departments} cellMap={cellMap} account={account} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Recommendations ──────────────────────────── */}
      {recommendations.length > 0 && (
        <RecommendationsSection recommendations={recommendations} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// KPI tile
// ─────────────────────────────────────────────────────────────────────
function Kpi({ label, value, tone, mono }: { label: string; value: string; tone: string; mono?: boolean }) {
  return (
    <div className="rounded-xl px-4 py-3"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
      <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1">
        {label}
      </div>
      <div
        className={`text-[20px] font-bold leading-none truncate ${mono ? "" : "tnum"}`}
        style={{ color: tone, letterSpacing: "-0.02em", fontSize: mono && value.length > 14 ? "14px" : undefined }}
        title={value}>
        {value}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Matrix row — modernized cells
// ─────────────────────────────────────────────────────────────────────
// Map a white-space department label to the closest stakeholder
// `department` value so we can pull the right people from the org.
function mapDept(d: string): Stakeholder["department"] | undefined {
  const lc = d.toLowerCase();
  if (/eng|platform|sre|infra/.test(lc))      return "Engineering";
  if (/finance|fp&a|treasury|account/.test(lc)) return "Finance";
  if (/sales|revenue|gtm/.test(lc))            return "Sales";
  if (/product|design|pm/.test(lc))            return "Product";
  if (/exec|ceo|cto|cfo|chief/.test(lc))       return "Executive";
  if (/ops|operations|security|compliance/.test(lc)) return "Operations";
  return "Other";
}

function MatrixRow({
  product, departments, cellMap, account,
}: {
  product: ProductLine;
  departments: string[];
  cellMap: Map<string, WhiteSpaceCell>;
  account: AccountDetail;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <>
      <tr>
        <td className="pl-3 pr-4 py-1.5 align-middle">
          <div className="text-[12px] font-semibold text-ink truncate"
            style={{ letterSpacing: "-0.005em" }}>
            {product.name.replace("Alphard · ", "")}
          </div>
          <div className="text-[10px] text-muted-2 truncate mt-0.5">{product.category}</div>
        </td>
        {departments.map((dept) => {
          const cell = cellMap.get(`${product.id}::${dept}`);
          if (!cell) {
            return (
              <td key={dept} className="px-1 py-1 text-center">
                <div className="w-full h-[52px] rounded-lg grid place-items-center"
                  style={{
                    background: "transparent",
                    border: "1px dashed var(--line)",
                    opacity: 0.45,
                  }}>
                  <span className="text-[10px] text-muted-2">—</span>
                </div>
              </td>
            );
          }
          const meta = STATUS_META[cell.status];
          const isClickable = true; // every cell now opens a drilldown
          const isExpanded = expanded === `${product.id}::${dept}`;
          // People owners — for tooltip + drilldown
          const deptKey = mapDept(dept);
          const owners = account.stakeholders.filter((s) => s.department === deptKey);
          const champion = owners.find((s) => s.role === "Champion");
          const detractor = owners.find((s) => s.role === "Detractor");
          const tooltip = `${cell.status === "active" ? "Active · " : cell.status === "trial" ? "Trial · " : cell.status === "expansion-target" ? "Target · " : "Gap · "}${dept}\n${owners.length} stakeholders${champion ? ` · ${champion.name} (Champion)` : ""}${detractor ? ` · ${detractor.name} (Detractor)` : ""}`;

          return (
            <td key={dept} className="px-1 py-1 text-center">
              <button
                title={tooltip}
                onClick={() => isClickable ? setExpanded(isExpanded ? null : `${product.id}::${dept}`) : undefined}
                className={`w-full h-[52px] rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all relative ${
                  isClickable ? "cursor-pointer hover:-translate-y-px hover:shadow-sm" : "cursor-default"
                }`}
                style={{
                  background: meta.bg,
                  border: `1px solid ${cell.status === "not-sold" ? "var(--line)" : meta.ring + "55"}`,
                  color: meta.color,
                  boxShadow: isExpanded ? `0 0 0 2px ${meta.ring}` : undefined,
                }}
              >
                {/* Tiny owner badge (Champion crown / detractor dot) — overlaid top-right */}
                {champion && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center"
                    title={`${champion.name} owns this department`}>
                    <Crown size={9} strokeWidth={2.4} style={{ color: "#9333EA" }} />
                  </span>
                )}
                {!champion && detractor && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                    style={{ background: "#EF4444" }} title={`${detractor.name} flagged as detractor`} />
                )}
                {cell.status === "active" && cell.arr ? (
                  <>
                    <span className="text-[11.5px] font-bold tnum">{fmtMoney(cell.arr)}</span>
                    {cell.seats && <span className="text-[9px] opacity-80">{cell.seats} seats</span>}
                  </>
                ) : cell.status === "trial" ? (
                  <>
                    <span className="text-[10.5px] font-semibold">Trial</span>
                    {cell.seats && <span className="text-[9px] opacity-80">{cell.seats} seats</span>}
                  </>
                ) : cell.status === "expansion-target" ? (
                  <>
                    <Target size={11} strokeWidth={2.2} />
                    <span className="text-[10px] font-semibold tnum">{fmtMoney(cell.estimatedArr ?? 0)}</span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-medium">Gap</span>
                    {cell.estimatedArr && <span className="text-[9.5px] tnum">{fmtMoney(cell.estimatedArr)}</span>}
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
              department={expanded.split("::")[1]}
              account={account}
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

// ─────────────────────────────────────────────────────────────────────
// Cell detail — modernized opportunity drill-down
// ─────────────────────────────────────────────────────────────────────
function CellDetail({
  cell, product, department, account, onClose,
}: {
  cell: WhiteSpaceCell; product: ProductLine; department: string; account: AccountDetail; onClose: () => void;
}) {
  const toast = useToast();
  const isTarget = cell.status === "expansion-target";
  const deptKey = mapDept(department);
  const deptPeople = account.stakeholders.filter((s) => s.department === deptKey);
  const champion = deptPeople.find((s) => s.role === "Champion");
  const detractor = deptPeople.find((s) => s.role === "Detractor");
  const decisionMakers = deptPeople.filter((s) => s.role === "Decision Maker");
  const productClean = product.name.replace("Alphard · ", "");

  const onBuildCase = () =>
    toast({ tone: "success", title: `Building case · ${productClean} → ${department}`,
      body: `${champion ? `Will be tailored around ${champion.name} as champion. ` : ""}Estimated ${fmtMoney(cell.estimatedArr ?? 0)} · ${cell.confidence ?? "—"}% confidence.` });
  const onViewComparables = () =>
    toast({ tone: "info", title: "Comparable wins", body: `${cell.patternMatches ?? 3} prior accounts ran the same play. Datadog landed within 14 weeks at comparable scale.` });
  const onDraftOutreach = () =>
    toast({ tone: "info", title: `Drafting outreach · ${champion?.name ?? department}`,
      body: `Multi-thread plan ready. Anchored to ${decisionMakers[0]?.name ?? "the decision maker"} for commercial signal.` });

  return (
    <div className="rounded-xl p-4 my-1.5 mx-1"
      style={{
        background: "linear-gradient(135deg, rgba(38,109,240,0.04), rgba(124,58,237,0.02))",
        border: "1px solid rgba(38,109,240,0.18)",
      }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg grid place-items-center shrink-0"
            style={{ background: ACCENT, boxShadow: "0 4px 12px -4px rgba(38,109,240,0.4)" }}>
            <Sparkles size={14} strokeWidth={2.2} className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] mb-0.5"
              style={{ color: ACCENT }}>
              {isTarget ? "Expansion target" : cell.status === "active" ? "Active footprint" : cell.status === "trial" ? "Live trial" : "White-space gap"}
            </div>
            <div className="text-[13.5px] font-semibold text-ink leading-tight"
              style={{ letterSpacing: "-0.005em" }}>
              {productClean} → {department}
            </div>
          </div>
        </div>
        <button onClick={onClose}
          className="w-7 h-7 rounded-lg grid place-items-center text-muted-2 hover:text-ink hover:bg-bg-deep transition-colors shrink-0">
          <X size={13} strokeWidth={1.8} />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2.5 mb-3">
        {cell.estimatedArr !== undefined && (
          <DetailStat label={isTarget || cell.status === "not-sold" ? "Est. ARR" : "Current ARR"}
            value={fmtMoney(cell.arr ?? cell.estimatedArr)} tone="var(--ink)" />
        )}
        {cell.confidence !== undefined && (
          <DetailStat
            label="Confidence"
            value={`${cell.confidence}%`}
            tone={cell.confidence >= 70 ? "var(--pos)" : cell.confidence >= 50 ? "var(--warn)" : "var(--muted)"}
          />
        )}
        {cell.patternMatches !== undefined && (
          <DetailStat label="Pattern matches" value={String(cell.patternMatches)} tone="var(--ink)" />
        )}
        <DetailStat label="People in dept" value={String(deptPeople.length)} tone="var(--ink)" />
      </div>

      {/* People threading — pulled from the org chart */}
      {deptPeople.length > 0 && (
        <div className="rounded-lg p-3 mb-3"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Users size={11} strokeWidth={1.8} className="text-muted-2" />
            <span className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-2">
              People in {department} · pull from org chart
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {deptPeople.slice(0, 5).map((s) => (
              <div key={s.name} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md"
                style={{ background: "var(--bg-deep)", border: "1px solid var(--line)" }}>
                <PersonAvatar name={s.name} size={18} />
                <div className="leading-tight">
                  <div className="flex items-center gap-1">
                    <span className="text-[10.5px] font-semibold text-ink">{s.name}</span>
                    {s.role === "Champion" && <Crown size={9} strokeWidth={2.2} className="text-purple-500" />}
                    {s.role === "Detractor" && <span className="w-1 h-1 rounded-full" style={{ background: "#EF4444" }} />}
                  </div>
                  <div className="text-[9.5px] text-muted-2">{s.title}</div>
                </div>
              </div>
            ))}
            {deptPeople.length > 5 && (
              <span className="text-[10px] text-muted-2">+{deptPeople.length - 5} more</span>
            )}
          </div>
          {/* Insight line — derived from the people */}
          <div className="text-[11px] text-ink-2 mt-2.5 leading-relaxed">
            {champion ? (
              <><b className="text-ink">{champion.name}</b> is the natural champion for this play — they already lead the {department} buying centre.</>
            ) : decisionMakers.length > 0 ? (
              <>No champion yet — {decisionMakers[0]!.name} ({decisionMakers[0]!.title}) is the highest-authority decision-maker to anchor the conversation around.</>
            ) : (
              <>No coverage in {department} yet — adding a contact here is the unlock for this play.</>
            )}
            {detractor && (
              <> <span className="text-[#EF4444] font-semibold">Watch:</span> {detractor.name} flagged as detractor — neutralise before steering.</>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={onBuildCase}
          className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-3.5 py-2 rounded-lg text-white transition-transform hover:scale-[1.02]"
          style={{ background: "var(--ink)", boxShadow: "0 4px 10px -4px rgba(15,18,24,0.30)" }}>
          <Sparkles size={11} strokeWidth={2.2} /> Build expansion case
          <ArrowRight size={11} strokeWidth={2.2} />
        </button>
        <button onClick={onViewComparables}
          className="inline-flex items-center gap-1.5 text-[11.5px] font-medium px-3 py-2 rounded-lg transition-colors hover:bg-bg-deep"
          style={{ background: "var(--surface)", color: "var(--ink-2)", border: "1px solid var(--line)" }}>
          View comparables
        </button>
        {champion && (
          <button onClick={onDraftOutreach}
            className="inline-flex items-center gap-1.5 text-[11.5px] font-medium px-3 py-2 rounded-lg transition-colors hover:bg-bg-deep"
            style={{ background: "var(--surface)", color: "var(--ink-2)", border: "1px solid var(--line)" }}>
            <Mail size={11} strokeWidth={1.8} /> Draft outreach to {champion.name.split(" ")[0]}
          </button>
        )}
      </div>
    </div>
  );
}

function DetailStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-lg px-3 py-2.5"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
      <div className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted-2 mb-1">{label}</div>
      <div className="text-[15px] font-bold tnum" style={{ color: tone, letterSpacing: "-0.018em" }}>
        {value}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Recommendations — modernized expansion cards
// ─────────────────────────────────────────────────────────────────────
function RecommendationsSection({ recommendations }: { recommendations: CrossSellRecommendation[] }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
      <div className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg grid place-items-center"
            style={{ background: "var(--pos-soft)" }}>
            <TrendingUp size={14} strokeWidth={1.8} style={{ color: "var(--pos)" }} />
          </div>
          <div>
            <div className="text-[13.5px] font-semibold text-ink"
              style={{ letterSpacing: "-0.005em" }}>
              Recommended expansions
            </div>
            <div className="text-[11px] text-muted">
              {recommendations.length} opportunit{recommendations.length === 1 ? "y" : "ies"} ranked by confidence
            </div>
          </div>
        </div>
      </div>
      <div className="p-3 space-y-2">
        {recommendations.map((rec) => (
          <RecommendationRow key={rec.id} rec={rec} />
        ))}
      </div>
    </div>
  );
}

function RecommendationRow({ rec }: { rec: CrossSellRecommendation }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const confidenceTone = rec.confidence >= 70 ? "var(--pos)" : rec.confidence >= 50 ? "var(--warn)" : "var(--muted)";

  return (
    <div className="rounded-xl overflow-hidden transition-all hover:-translate-y-px hover:shadow-sm"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className="w-9 h-9 rounded-lg grid place-items-center shrink-0"
          style={{
            background: "linear-gradient(135deg, rgba(38,109,240,0.12), rgba(124,58,237,0.06))",
            border: "1px solid rgba(38,109,240,0.18)",
          }}>
          <Target size={14} strokeWidth={1.8} style={{ color: ACCENT }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-ink truncate"
            style={{ letterSpacing: "-0.005em" }}>
            {rec.productName}
          </div>
          <div className="text-[11px] text-muted truncate mt-0.5">{rec.suggestedPlay}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[14px] font-bold tnum text-ink"
            style={{ letterSpacing: "-0.012em" }}>
            {fmtMoney(rec.estimatedArr)}
          </div>
          <div className="text-[10px] font-mono tnum mt-0.5" style={{ color: confidenceTone }}>
            {rec.confidence}% confidence
          </div>
        </div>
        <ChevronRight size={13} strokeWidth={1.8}
          className="text-muted-2 transition-transform shrink-0"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }} />
      </button>

      {open && (
        <div className="px-4 pb-4 pt-3"
          style={{ borderTop: "1px solid var(--line)", background: "var(--bg-deep)" }}>
          <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-2">
            Evidence
          </div>
          <ul className="space-y-1.5 mb-3">
            {rec.evidence.map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-[11.5px] text-ink-2 leading-snug">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "var(--pos)" }} />
                {e}
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toast({ tone: "info", title: "Building case", body: `${rec.productName} business case for ${rec.accountName}.` });
              }}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-3.5 py-2 rounded-lg text-white transition-transform hover:scale-[1.02]"
              style={{ background: "var(--ink)", boxShadow: "0 4px 10px -4px rgba(15,18,24,0.30)" }}>
              <Sparkles size={11} strokeWidth={2.2} /> Build case
              <ArrowRight size={11} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
