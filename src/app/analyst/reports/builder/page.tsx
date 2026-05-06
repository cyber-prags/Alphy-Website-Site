"use client";

import { useState } from "react";
import {
  BarChart3, LineChart, PieChart, Table2, Save, ArrowLeft, Filter, Plus, X,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import {
  type ChartType, type DataSource,
  reportDimensions, reportMetrics, savedReportConfigs,
} from "@/lib/mock";
import { useToast } from "@/components/Toast";

const CHART_OPTIONS: { type: ChartType; label: string; Icon: typeof BarChart3 }[] = [
  { type: "bar", label: "Bar", Icon: BarChart3 },
  { type: "line", label: "Line", Icon: LineChart },
  { type: "donut", label: "Donut", Icon: PieChart },
  { type: "table", label: "Table", Icon: Table2 },
];

const DATA_SOURCES: DataSource[] = ["Deals", "Accounts", "Calls", "Outcomes", "Usage"];

const MOCK_BAR_DATA = [
  { label: "Qualification", value: 34 },
  { label: "Discovery", value: 28 },
  { label: "Demo", value: 22 },
  { label: "Proposal", value: 18 },
  { label: "Negotiation", value: 12 },
  { label: "Closed Won", value: 8 },
];

const MOCK_LINE_DATA = [65, 58, 72, 68, 74, 82, 78, 85, 80, 88, 92, 87];
const MOCK_DONUT_DATA = [
  { label: "Healthy", value: 54, color: "var(--pos)" },
  { label: "Watch", value: 28, color: "var(--warn)" },
  { label: "At-Risk", value: 18, color: "var(--neg)" },
];

export default function ReportBuilderPage() {
  const toast = useToast();
  const [title, setTitle] = useState("Untitled Report");
  const [dataSource, setDataSource] = useState<DataSource>("Deals");
  const [dims, setDims] = useState<string[]>(["Stage"]);
  const [metrics, setMetrics] = useState<string[]>(["Count", "Total Amount"]);
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [filters, setFilters] = useState<{ field: string; op: string; value: string }[]>([]);

  const availableDims = reportDimensions[dataSource];
  const availableMetrics = reportMetrics[dataSource];

  const toggleDim = (d: string) => setDims((p) => p.includes(d) ? p.filter((x) => x !== d) : [...p, d]);
  const toggleMetric = (m: string) => setMetrics((p) => p.includes(m) ? p.filter((x) => x !== m) : [...p, m]);

  const addFilter = () => setFilters((p) => [...p, { field: availableDims[0], op: "equals", value: "" }]);
  const removeFilter = (i: number) => setFilters((p) => p.filter((_, idx) => idx !== i));

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link href="/analyst/reports"
          className="w-8 h-8 rounded-lg grid place-items-center border border-line hover:bg-bg-deep">
          <ArrowLeft size={14} strokeWidth={1.8} className="text-muted" />
        </Link>
        <div className="flex-1">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-[18px] font-semibold text-ink bg-transparent outline-none w-full"
          />
          <div className="text-[11.5px] text-muted mt-0.5">Custom report builder</div>
        </div>
        <button
          onClick={() => toast({ tone: "success", title: "Report saved", body: title })}
          className="h-8 px-4 rounded-lg text-[12px] font-semibold inline-flex items-center gap-1.5"
          style={{ background: "var(--accent)", color: "var(--bg)" }}
        >
          <Save size={12} strokeWidth={2} /> Save report
        </button>
      </div>

      {/* 12-col grid: config (4) + preview (8) */}
      <div className="grid grid-cols-12 gap-5">
        {/* Left config panel */}
        <div className="col-span-4 space-y-4">
          {/* Data Source */}
          <ConfigCard title="Data Source">
            <div className="grid grid-cols-2 gap-1.5">
              {DATA_SOURCES.map((ds) => (
                <button
                  key={ds}
                  onClick={() => { setDataSource(ds); setDims([]); setMetrics([]); }}
                  className={`text-[11.5px] font-medium px-2.5 py-2 rounded-lg border transition-colors ${
                    dataSource === ds
                      ? "border-accent bg-accent/10 text-ink"
                      : "border-line hover:bg-bg-deep text-muted"
                  }`}
                >
                  {ds}
                </button>
              ))}
            </div>
          </ConfigCard>

          {/* Dimensions */}
          <ConfigCard title="Dimensions">
            <div className="flex flex-wrap gap-1.5">
              {availableDims.map((d) => (
                <button
                  key={d}
                  onClick={() => toggleDim(d)}
                  className={`text-[11px] px-2 py-1 rounded-md border transition-colors ${
                    dims.includes(d)
                      ? "border-accent bg-accent/10 text-ink font-semibold"
                      : "border-line text-muted hover:text-ink"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </ConfigCard>

          {/* Metrics */}
          <ConfigCard title="Metrics">
            <div className="flex flex-wrap gap-1.5">
              {availableMetrics.map((m) => (
                <button
                  key={m}
                  onClick={() => toggleMetric(m)}
                  className={`text-[11px] px-2 py-1 rounded-md border transition-colors ${
                    metrics.includes(m)
                      ? "border-info bg-info/10 text-ink font-semibold"
                      : "border-line text-muted hover:text-ink"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </ConfigCard>

          {/* Chart type */}
          <ConfigCard title="Chart Type">
            <div className="grid grid-cols-4 gap-1.5">
              {CHART_OPTIONS.map(({ type, label, Icon }) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg border transition-colors ${
                    chartType === type
                      ? "border-accent bg-accent/10"
                      : "border-line hover:bg-bg-deep"
                  }`}
                >
                  <Icon size={16} strokeWidth={1.5} className={chartType === type ? "text-ink" : "text-muted"} />
                  <span className={`text-[10px] font-medium ${chartType === type ? "text-ink" : "text-muted"}`}>{label}</span>
                </button>
              ))}
            </div>
          </ConfigCard>

          {/* Filters */}
          <ConfigCard title="Filters">
            {filters.map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 mb-2">
                <select
                  value={f.field}
                  onChange={(e) => setFilters((p) => p.map((x, j) => j === i ? { ...x, field: e.target.value } : x))}
                  className="flex-1 text-[11px] px-2 py-1.5 rounded-md border border-line bg-surface outline-none"
                >
                  {availableDims.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <input
                  value={f.value}
                  onChange={(e) => setFilters((p) => p.map((x, j) => j === i ? { ...x, value: e.target.value } : x))}
                  placeholder="value"
                  className="w-24 text-[11px] px-2 py-1.5 rounded-md border border-line bg-surface outline-none"
                />
                <button onClick={() => removeFilter(i)} className="text-muted hover:text-neg">
                  <X size={12} strokeWidth={2} />
                </button>
              </div>
            ))}
            <button onClick={addFilter}
              className="text-[11px] text-muted hover:text-ink inline-flex items-center gap-1">
              <Plus size={11} strokeWidth={2} /> Add filter
            </button>
          </ConfigCard>

          {/* Saved configs */}
          <ConfigCard title="Saved Templates">
            <div className="space-y-1.5">
              {savedReportConfigs.map((cfg) => (
                <button
                  key={cfg.id}
                  onClick={() => {
                    setTitle(cfg.title);
                    setDataSource(cfg.dataSource);
                    setDims(cfg.dimensions);
                    setMetrics(cfg.metrics);
                    setChartType(cfg.chartType);
                    setFilters(cfg.filters);
                  }}
                  className="w-full text-left text-[11.5px] px-2.5 py-2 rounded-lg border border-line hover:bg-bg-deep transition-colors"
                >
                  <span className="font-medium text-ink">{cfg.title}</span>
                  <span className="text-muted ml-2">· {cfg.dataSource}</span>
                </button>
              ))}
            </div>
          </ConfigCard>
        </div>

        {/* Right preview canvas */}
        <div className="col-span-8">
          <div className="card p-6 min-h-[480px]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-[14px] font-semibold text-ink">{title}</div>
                <div className="text-[11px] text-muted mt-0.5">
                  {dataSource} · {dims.join(", ") || "No dimensions"} · {metrics.join(", ") || "No metrics"}
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-bg-deep text-muted uppercase">{chartType}</span>
            </div>

            {dims.length === 0 && metrics.length === 0 ? (
              <div className="h-72 grid place-items-center text-center">
                <div>
                  <Filter size={24} strokeWidth={1.2} className="mx-auto mb-2 text-muted opacity-40" />
                  <div className="text-[13px] text-muted">Select dimensions and metrics to preview</div>
                </div>
              </div>
            ) : chartType === "bar" ? (
              <BarPreview />
            ) : chartType === "line" ? (
              <LinePreview />
            ) : chartType === "donut" ? (
              <DonutPreview />
            ) : (
              <TablePreview dims={dims} metrics={metrics} />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ConfigCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-4">
      <div className="mono-label mb-3">{title}</div>
      {children}
    </div>
  );
}

function BarPreview() {
  const max = Math.max(...MOCK_BAR_DATA.map((d) => d.value));
  return (
    <div className="space-y-3 pt-2">
      {MOCK_BAR_DATA.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="text-[11px] text-muted w-24 text-right shrink-0">{d.label}</span>
          <div className="flex-1 h-7 rounded-md overflow-hidden" style={{ background: "var(--bg-deep)" }}>
            <div
              className="h-full rounded-md transition-all"
              style={{ width: `${(d.value / max) * 100}%`, background: "var(--accent)" }}
            />
          </div>
          <span className="text-[11px] font-mono tnum text-ink w-8">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

function LinePreview() {
  const max = Math.max(...MOCK_LINE_DATA);
  const min = Math.min(...MOCK_LINE_DATA);
  const h = 200;
  const w = 500;
  const points = MOCK_LINE_DATA.map((v, i) => {
    const x = (i / (MOCK_LINE_DATA.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * (h - 20) - 10;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="flex justify-center pt-4">
      <svg width={w} height={h + 30} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {MOCK_LINE_DATA.map((v, i) => {
          const x = (i / (MOCK_LINE_DATA.length - 1)) * w;
          const y = h - ((v - min) / (max - min)) * (h - 20) - 10;
          return <circle key={i} cx={x} cy={y} r={3} fill="var(--accent)" />;
        })}
        {MOCK_LINE_DATA.map((_, i) => {
          const x = (i / (MOCK_LINE_DATA.length - 1)) * w;
          return (
            <text key={i} x={x} y={h + 20} textAnchor="middle" className="text-[9px]" fill="var(--muted)">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i]}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function DonutPreview() {
  const total = MOCK_DONUT_DATA.reduce((s, d) => s + d.value, 0);
  const r = 80;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center justify-center gap-8 pt-4">
      <svg width={200} height={200} viewBox="0 0 200 200">
        {MOCK_DONUT_DATA.map((d) => {
          const dash = (d.value / total) * circ;
          const el = (
            <circle
              key={d.label}
              cx={100} cy={100} r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={24}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <div className="space-y-2">
        {MOCK_DONUT_DATA.map((d) => (
          <div key={d.label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ background: d.color }} />
            <span className="text-[12px] text-ink">{d.label}</span>
            <span className="text-[12px] font-mono tnum text-muted ml-2">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TablePreview({ dims, metrics }: { dims: string[]; metrics: string[] }) {
  const rows = 5;
  const headers = [...dims, ...metrics];
  return (
    <div className="overflow-x-auto pt-2">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} className="text-left px-3 py-2 text-[10.5px] font-semibold text-muted uppercase tracking-wider border-b border-line">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b border-line/50">
              {headers.map((h, j) => (
                <td key={j} className="px-3 py-2.5 text-[12px] text-ink-2">
                  {j < dims.length ? `${h} ${i + 1}` : `${(Math.random() * 100).toFixed(0)}`}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
