"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ZoomIn, ZoomOut, Maximize2, Play, History, Save, ChevronRight,
  Bot, Mail, Users as UsersIcon, GitBranch, Search, Filter,
  Database, Shuffle, ArrowRight, Plug, MessageSquare, BarChart3,
  CheckCircle2, AlertTriangle, XCircle, Clock, X, Settings,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useToast } from "@/components/Toast";
import { PersonAvatar as PersonAvatarComponent } from "@/components/PersonAvatar";
import {
  workflowDefinitions, workflows, workflowRuns,
  type WfCanvasNode, type WfCanvasEdge, type WorkflowDefinition,
  type WorkflowRun, type WorkflowStatus,
} from "@/lib/mock";

type SidePanel = "config" | "history" | null;

const NODE_ICONS: Record<string, typeof Bot> = {
  source: Database,
  "contact-discovery": Search,
  "contact-enrichment": BarChart3,
  branching: GitBranch,
  filter: Filter,
  linkedin: UsersIcon,
  salesforce: Database,
  outreach: Mail,
  slack: MessageSquare,
  "ai-research": Bot,
};

const CATEGORY_COLORS: Record<string, string> = {
  source: "#60A5FA",
  destination: "#34D399",
  transformation: "#A78BFA",
  logic: "#FBBF24",
};

const STATUS_CFG: Record<WorkflowStatus, { color: string; icon: typeof CheckCircle2 }> = {
  Completed: { color: "var(--pos)", icon: CheckCircle2 },
  Stalled:   { color: "var(--warn)", icon: AlertTriangle },
  Failed:    { color: "var(--neg)", icon: XCircle },
};

export default function WorkflowBuilderPage() {
  const toast = useToast();
  const { id } = useParams<{ id: string }>();
  const def = workflowDefinitions.find((d) => d.id === id);
  const wfMeta = workflows.find((w) => w.id === id);
  const runs = workflowRuns.filter((r) => r.workflowId === id);

  const [zoom, setZoom] = useState(0.85);
  // Default the config panel open with the first/AI node selected.
  const initialNode = useMemo(
    () => def?.nodes.find((n) => n.type === "ai-research") ?? def?.nodes[0] ?? null,
    [def]
  );
  const [sidePanel, setSidePanel] = useState<SidePanel>("config");
  const [selectedNode, setSelectedNode] = useState<WfCanvasNode | null>(initialNode);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const NODE_W = 220;
  const NODE_H = 64;
  const H_GAP = 48;  // horizontal spacing between siblings in same layer
  const V_GAP = 56;  // vertical spacing between layers

  // ─── Vertical DAG layout — computed positions per node ────────────
  // Lays out the graph top-to-bottom: roots at the top, each subsequent
  // layer below, siblings spaced horizontally and centred.
  const positions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    if (!def?.nodes.length) return map;

    // 1. Build incoming-edge counts per node
    const incoming = new Map<string, string[]>();
    def.nodes.forEach((n) => incoming.set(n.id, []));
    def.edges.forEach((e) => {
      const list = incoming.get(e.to) ?? [];
      list.push(e.from);
      incoming.set(e.to, list);
    });

    // 2. Topological BFS — each node's layer = max(predecessor) + 1
    const layer = new Map<string, number>();
    const inDegree = new Map<string, number>();
    def.nodes.forEach((n) => {
      const d = (incoming.get(n.id) ?? []).length;
      inDegree.set(n.id, d);
      if (d === 0) layer.set(n.id, 0);
    });
    const queue: string[] = def.nodes.filter((n) => (inDegree.get(n.id) ?? 0) === 0).map((n) => n.id);
    while (queue.length) {
      const id = queue.shift()!;
      const myLayer = layer.get(id) ?? 0;
      def.edges
        .filter((e) => e.from === id)
        .forEach((e) => {
          const cur = layer.get(e.to);
          const nextLayer = Math.max(cur ?? 0, myLayer + 1);
          layer.set(e.to, nextLayer);
          const d = (inDegree.get(e.to) ?? 0) - 1;
          inDegree.set(e.to, d);
          if (d === 0) queue.push(e.to);
        });
    }

    // 3. Group by layer, preserve authored x-order so siblings keep their natural left→right
    const byLayer = new Map<number, WfCanvasNode[]>();
    def.nodes.forEach((n) => {
      const l = layer.get(n.id) ?? 0;
      const arr = byLayer.get(l) ?? [];
      arr.push(n);
      byLayer.set(l, arr);
    });
    byLayer.forEach((arr) => arr.sort((a, b) => a.x - b.x));

    // 4. Compute (x, y) for every node — centred horizontally per layer
    byLayer.forEach((arr, l) => {
      const totalW = arr.length * NODE_W + (arr.length - 1) * H_GAP;
      const startX = -totalW / 2;
      arr.forEach((n, i) => {
        map.set(n.id, {
          x: startX + i * (NODE_W + H_GAP),
          y: l * (NODE_H + V_GAP),
        });
      });
    });

    return map;
  }, [def]);

  // Auto-fit on mount — uses layered positions, not authored ones
  const bbox = useMemo(() => {
    if (!def?.nodes.length || positions.size === 0) return null;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    positions.forEach((p) => {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x + NODE_W);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y + NODE_H);
    });
    return { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY };
  }, [def, positions]);

  useEffect(() => {
    if (!bbox || !canvasRef.current) return;
    const cw = canvasRef.current.clientWidth;
    const ch = canvasRef.current.clientHeight;
    if (!cw || !ch) return;
    // Fit to canvas with 20% padding, cap at 1.0
    const sx = (cw - 80) / bbox.w;
    const sy = (ch - 80) / bbox.h;
    const z = Math.min(1, sx, sy);
    setZoom(z);
    const cx = bbox.minX + bbox.w / 2;
    const cy = bbox.minY + bbox.h / 2;
    setPan({
      x: cw / 2 - cx * z,
      y: ch / 2 - cy * z,
    });
  }, [bbox]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.15, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.4));
  const handleFit = () => {
    if (!bbox || !canvasRef.current) return;
    const cw = canvasRef.current.clientWidth;
    const ch = canvasRef.current.clientHeight;
    const sx = (cw - 80) / bbox.w;
    const sy = (ch - 80) / bbox.h;
    const z = Math.min(1, sx, sy);
    setZoom(z);
    const cx = bbox.minX + bbox.w / 2;
    const cy = bbox.minY + bbox.h / 2;
    setPan({
      x: cw / 2 - cx * z,
      y: ch / 2 - cy * z,
    });
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-node]")) return;
    dragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  }, []);

  const handleMouseUp = useCallback(() => { dragging.current = false; }, []);

  if (!def || !wfMeta) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-[14px] text-muted-2 mb-3">Workflow not found</p>
            <Link href="/workflows" className="btn-secondary h-8 px-3 text-[12px]">Back to Workflows</Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Pull the workflow editor flush — no padding from AppShell main */}
      <div className="-mx-4 -mt-6 md:-mx-8 md:-mt-8 -mb-32 flex flex-col"
        style={{ height: "calc(100vh - 48px)" }}>

        {/* ─── Top bar ──────────────────────────────────────── */}
        <div className="flex items-center justify-between h-14 px-6 shrink-0"
          style={{ borderBottom: "1px solid var(--line)", background: "var(--surface)" }}>
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/workflows"
              className="text-[12px] text-muted hover:text-ink transition-colors">
              Workflows
            </Link>
            <ChevronRight size={11} className="text-muted-2 shrink-0" />
            <span className="text-[13.5px] font-semibold text-ink truncate"
              style={{ letterSpacing: "-0.005em" }}>
              {def.name}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { setSidePanel(sidePanel === "history" ? null : "history"); }}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11.5px] font-medium transition-colors"
              style={{
                background: sidePanel === "history" ? "var(--bg-deep)" : "transparent",
                color: sidePanel === "history" ? "var(--ink)" : "var(--muted)",
                border: "1px solid var(--line)",
              }}>
              <History size={12} strokeWidth={1.8} />
              History
            </button>
            <button onClick={() => toast({ tone: "info", title: "Workflow run queued", body: "First execution will start within 30 seconds." })}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11.5px] font-medium transition-colors hover:bg-bg-deep"
              style={{ color: "var(--ink-2)", border: "1px solid var(--line)" }}>
              <Play size={12} strokeWidth={1.8} />
              Run
            </button>
            <button onClick={() => toast({ tone: "info", title: "Workflow saved", body: "Changes are live on the next run." })}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11.5px] font-semibold text-white transition-transform hover:scale-[1.02]"
              style={{
                background: "var(--ink)",
                boxShadow: "0 4px 10px -4px rgba(15,18,24,0.30)",
              }}>
              <Save size={12} strokeWidth={2} />
              Save
            </button>
          </div>
        </div>

        {/* ─── Canvas + Side Panel ──────────────────────────── */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Canvas */}
          <div
            ref={canvasRef}
            className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
            style={{ background: "var(--bg)" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Soft dotted grid */}
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: "radial-gradient(circle, rgba(15,18,24,0.07) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }} />

            {/* Soft radial vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: "radial-gradient(ellipse at center, transparent 30%, rgba(15,18,24,0.04) 100%)",
            }} />

            {/* Transformed canvas */}
            <div
              className="absolute inset-0"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "0 0",
              }}
            >
              <CanvasEdges nodes={def.nodes} edges={def.edges} positions={positions} nodeW={NODE_W} nodeH={NODE_H} />
              {def.nodes.map((node) => {
                const pos = positions.get(node.id);
                return (
                  <CanvasNode
                    key={node.id}
                    node={node}
                    pos={pos ?? { x: node.x, y: node.y }}
                    width={NODE_W}
                    height={NODE_H}
                    selected={selectedNode?.id === node.id}
                    onClick={() => {
                      setSelectedNode(node);
                      setSidePanel("config");
                    }}
                  />
                );
              })}
            </div>

            {/* Zoom controls — bottom right */}
            <div className="absolute bottom-5 right-5 flex items-center gap-0.5 rounded-lg p-1"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                boxShadow: "0 4px 12px -6px rgba(15,18,24,0.10)",
              }}>
              <button onClick={handleZoomOut}
                className="w-7 h-7 grid place-items-center rounded text-muted-2 hover:text-ink hover:bg-bg-deep transition-colors">
                <ZoomOut size={13} strokeWidth={1.8} />
              </button>
              <span className="text-[10.5px] text-muted-2 tnum w-11 text-center font-mono">
                {Math.round(zoom * 100)}%
              </span>
              <button onClick={handleZoomIn}
                className="w-7 h-7 grid place-items-center rounded text-muted-2 hover:text-ink hover:bg-bg-deep transition-colors">
                <ZoomIn size={13} strokeWidth={1.8} />
              </button>
              <span className="w-px h-4 mx-0.5" style={{ background: "var(--line)" }} />
              <button onClick={handleFit}
                title="Fit to canvas"
                className="w-7 h-7 grid place-items-center rounded text-muted-2 hover:text-ink hover:bg-bg-deep transition-colors">
                <Maximize2 size={12} strokeWidth={1.8} />
              </button>
            </div>
          </div>

          {/* Side panel — wider (380px) for more comfortable reading */}
          {sidePanel && (
            <div className="w-[380px] shrink-0 overflow-y-auto"
              style={{ borderLeft: "1px solid var(--line)", background: "var(--surface)" }}>
              {sidePanel === "config" && selectedNode && (
                <NodeConfigPanel node={selectedNode} onClose={() => { setSidePanel(null); setSelectedNode(null); }} />
              )}
              {sidePanel === "history" && (
                <HistoryPanel runs={runs} onClose={() => setSidePanel(null)} />
              )}
              {sidePanel === "config" && !selectedNode && (
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[13px] font-semibold text-ink">Configuration</span>
                    <button onClick={() => setSidePanel(null)} className="text-muted-2 hover:text-ink transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-[12px] text-muted-2">Select a node to configure</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

/* ─── Canvas Edges ─── */

function CanvasEdges({
  nodes, edges, positions, nodeW, nodeH,
}: {
  nodes: WfCanvasNode[];
  edges: WfCanvasEdge[];
  positions: Map<string, { x: number; y: number }>;
  nodeW: number;
  nodeH: number;
}) {
  return (
    <svg className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ width: "1px", height: "1px" }}>
      <defs>
        <marker id="arrow-down" markerWidth="8" markerHeight="6" refX="4" refY="6" orient="auto">
          <path d="M0,0 L4,6 L8,0" fill="none" stroke="var(--muted-2)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>
      {edges.map((edge, i) => {
        const fromPos = positions.get(edge.from);
        const toPos = positions.get(edge.to);
        if (!fromPos || !toPos) return null;

        // Vertical edge: bottom of source → top of target.
        // Anchor centred horizontally on each node so siblings fan out cleanly.
        const x1 = fromPos.x + nodeW / 2;
        const y1 = fromPos.y + nodeH;
        const x2 = toPos.x + nodeW / 2;
        const y2 = toPos.y;

        const my = (y1 + y2) / 2;

        return (
          <path
            key={i}
            d={`M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`}
            fill="none"
            stroke="var(--muted-2)"
            strokeWidth="1.4"
            strokeOpacity="0.55"
            markerEnd="url(#arrow-down)"
          />
        );
      })}
    </svg>
  );
}

/* ─── Canvas Node ─── */

function CanvasNode({
  node, pos, width, height, selected, onClick,
}: {
  node: WfCanvasNode;
  pos: { x: number; y: number };
  width: number;
  height: number;
  selected: boolean;
  onClick: () => void;
}) {
  const Icon = NODE_ICONS[node.type] || Plug;
  const catColor = CATEGORY_COLORS[node.category] || "var(--muted)";

  return (
    <div
      data-node
      onClick={onClick}
      className="absolute cursor-pointer rounded-xl px-3.5 py-3 transition-all hover:shadow-md"
      style={{
        left: pos.x,
        top: pos.y,
        width,
        height,
        background: "var(--surface)",
        border: `1px solid ${selected ? "var(--accent)" : "var(--line)"}`,
        boxShadow: selected
          ? "0 0 0 3px rgba(38,109,240,0.15), 0 8px 24px -8px rgba(15,18,24,0.12)"
          : "0 1px 2px rgba(15,18,24,0.04)",
      }}
    >
      <div className="flex items-center gap-2.5 h-full">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `color-mix(in srgb, ${catColor} 16%, transparent)` }}
        >
          <Icon size={15} strokeWidth={1.8} style={{ color: catColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold text-ink truncate"
            style={{ letterSpacing: "-0.005em" }}>
            {node.label}
          </div>
          <div className="text-[10px] text-muted-2 capitalize mt-0.5">{node.category}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Node Config Panel ─── */

function NodeConfigPanel({ node, onClose }: { node: WfCanvasNode; onClose: () => void }) {
  const Icon = NODE_ICONS[node.type] || Plug;
  const catColor = CATEGORY_COLORS[node.category] || "var(--muted)";

  // Defaults / fixtures keyed by node category — matches Planhat's structured layout
  const isAi = node.type === "ai-research" || node.type.includes("ai");
  const stepStatus = "Completed";
  const stepRuntime = node.type === "ai-research" ? "2.4s" : node.category === "source" ? "0.8s" : "1.2s";
  const triggeredAt = "28 Aug 2025 at 01:00";
  const triggeredBy = "Pragyan Jyoti Dutta";

  return (
    <div className="flex flex-col h-full">
      {/* Header — node icon + label + close */}
      <div className="px-5 py-4 flex items-start justify-between gap-3 shrink-0"
        style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="flex items-start gap-2.5 min-w-0">
          <div
            className="w-9 h-9 rounded-lg grid place-items-center shrink-0"
            style={{ background: `color-mix(in srgb, ${catColor} 18%, transparent)` }}>
            <Icon size={16} style={{ color: catColor }} />
          </div>
          <div className="min-w-0">
            <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] mb-0.5"
              style={{ color: catColor }}>
              {node.category}
            </div>
            <div className="text-[14px] font-semibold text-ink leading-tight"
              style={{ letterSpacing: "-0.012em" }}>
              {node.label}
            </div>
            <p className="text-[11px] text-muted leading-snug mt-1">
              {node.description}
            </p>
          </div>
        </div>
        <button onClick={onClose}
          className="w-7 h-7 rounded-lg grid place-items-center text-muted-2 hover:text-ink hover:bg-bg-deep transition-colors shrink-0">
          <X size={13} strokeWidth={1.8} />
        </button>
      </div>

      {/* Body — scrollable sections */}
      <div className="flex-1 overflow-y-auto">
        {/* INPUTS */}
        <Section label="Inputs">
          <div className="grid grid-cols-2 gap-2 mb-2.5">
            <SelectField label="Connection" value="Salesforce" />
            <SelectField label={isAi ? "Prompt" : "Action"} value={isAi ? "Prompt" : "Default"} />
          </div>
        </Section>

        {/* PARAMETERS */}
        <Section label="Parameters">
          <div className="space-y-2">
            {isAi ? (
              <>
                <Param label="model" value="o4-mini" />
                <Param label="prompt" value="Generate personalized re-engagement…" mono />
              </>
            ) : node.category === "source" ? (
              <>
                <Param label="filter" value="status = open" mono />
                <Param label="limit" value="500" />
              </>
            ) : node.category === "logic" ? (
              <>
                <Param label="condition" value="priority >= high" mono />
                <Param label="branches" value="2" />
              </>
            ) : (
              <>
                <Param label="channel" value="#cs-escalations" />
                <Param label="message" value="High-priority signal detected" mono />
              </>
            )}
          </div>
        </Section>

        {/* STEP DETAILS */}
        <Section label="Step details">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] text-muted-2 mb-1">Status</div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded"
                style={{ background: "var(--pos-soft)", color: "var(--pos)" }}>
                <CheckCircle2 size={10} strokeWidth={2.2} />
                {stepStatus}
              </span>
            </div>
            <div>
              <div className="text-[10px] text-muted-2 mb-1">Runtime</div>
              <div className="text-[12.5px] font-semibold tnum text-ink">{stepRuntime}</div>
            </div>
          </div>
        </Section>

        {/* TRIGGER INFO */}
        <Section label="">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] text-muted-2 mb-1">Triggered</div>
              <div className="text-[11.5px] text-ink-2 leading-snug">{triggeredAt}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-2 mb-1">Triggered by</div>
              <div className="inline-flex items-center gap-1.5">
                <PersonAvatarSmall name={triggeredBy} />
                <span className="text-[11.5px] text-ink-2 truncate">{triggeredBy}</span>
              </div>
            </div>
          </div>
        </Section>

        {/* SETTINGS — collapsible to keep the panel scannable */}
        <CollapsibleSection label="Settings">
          <div className="space-y-1.5">
            <Toggle label="Retry on failure" on />
            <Toggle label="Log output" on />
            <div className="flex items-center justify-between px-3 py-2 rounded-md"
              style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
              <span className="text-[11px] text-ink-2">Timeout (sec)</span>
              <span className="text-[11px] font-mono tnum text-muted">300</span>
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}

function CollapsibleSection({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="px-5 py-3" style={{ borderBottom: "1px solid var(--line)" }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 hover:text-ink-2 transition-colors py-1">
        <span>{label}</span>
        <ChevronRight size={11} className="transition-transform"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }} />
      </button>
      {open && (
        <div className="mt-2.5">
          {children}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Side-panel primitives — Planhat-style structured sections
// ─────────────────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--line)" }}>
      {label && (
        <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-2.5">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

function SelectField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-muted-2 mb-1">{label}</div>
      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11.5px] text-ink-2 cursor-pointer hover:border-line-strong transition-colors"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
        <span className="truncate">{value}</span>
        <ChevronRight size={11} className="text-muted-2 -rotate-90" />
      </div>
    </div>
  );
}

function Param({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        readOnly
        value={label}
        className="w-20 text-[10.5px] text-muted px-2 py-1.5 rounded-md cursor-default"
        style={{ background: "var(--bg-deep)", border: "1px solid var(--line)", fontFamily: mono ? "ui-monospace, monospace" : "inherit" }}
      />
      <input
        type="text"
        readOnly
        value={value}
        className={`flex-1 text-[11.5px] text-ink-2 px-2 py-1.5 rounded-md truncate cursor-default ${mono ? "font-mono" : ""}`}
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
        title={value}
      />
    </div>
  );
}

function Toggle({ label, on }: { label: string; on: boolean }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-md"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
      <span className="text-[11px] text-ink-2">{label}</span>
      <span className="w-7 h-4 rounded-full relative transition-colors"
        style={{ background: on ? "var(--accent)" : "var(--bg-deep)" }}>
        <span className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all"
          style={{ left: on ? "calc(100% - 14px)" : "2px" }} />
      </span>
    </div>
  );
}

function PersonAvatarSmall({ name }: { name: string }) {
  // Light wrapper — renders the same gender-aware avatar at 18px
  return (
    <span style={{ width: 18, height: 18, display: "inline-block" }}>
      <PersonAvatarComponent name={name} size={18} />
    </span>
  );
}

/* ─── History Panel ─── */

function HistoryPanel({ runs, onClose }: { runs: WorkflowRun[]; onClose: () => void }) {
  return (
    <div className="p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-ink">Run History</span>
        <button onClick={onClose} className="text-muted-2 hover:text-ink transition-colors">
          <X size={14} />
        </button>
      </div>

      {runs.length === 0 ? (
        <p className="text-[12px] text-muted-2">No runs yet</p>
      ) : (
        <div className="flex flex-col gap-2">
          {runs.map((run) => {
            const cfg = STATUS_CFG[run.status];
            const StatusIcon = cfg.icon;
            const d = new Date(run.startedAt);
            return (
              <div key={run.id} className="px-3 py-2.5 rounded-lg border border-line hover:bg-surface-2 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <StatusIcon size={12} style={{ color: cfg.color }} />
                    <span className="text-[11px] font-medium" style={{ color: cfg.color }}>{run.status}</span>
                  </div>
                  <span className="text-[10px] text-muted-2 tnum">{run.duration}s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-2 tnum">
                    {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} {d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </span>
                  <span className="text-[10px] text-muted-2 tnum">{run.recordsProcessed} records</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
