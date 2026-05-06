"use client";

import { useState, useMemo, useRef, useCallback } from "react";
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

  const [zoom, setZoom] = useState(1);
  const [sidePanel, setSidePanel] = useState<SidePanel>(null);
  const [selectedNode, setSelectedNode] = useState<WfCanvasNode | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.15, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.4));
  const handleFit = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

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
      <div className="flex flex-col h-[calc(100vh-56px)]">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-12 px-4 border-b border-line bg-surface shrink-0">
          <div className="flex items-center gap-2">
            <Link href="/workflows" className="text-[11px] text-muted-2 hover:text-ink transition-colors">Workflows</Link>
            <ChevronRight size={11} className="text-muted-2" />
            <span className="text-[12px] font-semibold text-ink truncate max-w-[300px]">{def.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setSidePanel(sidePanel === "history" ? null : "history"); setSelectedNode(null); }}
              className={`h-7 px-2.5 text-[11px] rounded-lg border flex items-center gap-1.5 transition-colors ${
                sidePanel === "history" ? "border-accent/30 bg-accent/10 text-accent" : "border-line text-muted-2 hover:text-ink"
              }`}
            >
              <History size={12} />
              History
            </button>
            <button onClick={() => toast({ tone: "info", title: "Workflow run queued", body: "First execution will start within 30 seconds." })}
              className="h-7 px-2.5 text-[11px] rounded-lg border border-line text-muted-2 hover:text-ink flex items-center gap-1.5 transition-colors">
              <Play size={12} />
              Run
            </button>
            <button onClick={() => toast({ tone: "info", title: "Workflow saved", body: "Changes are live on the next run." })}
              className="h-7 px-2.5 text-[11px] rounded-lg bg-accent text-bg font-medium flex items-center gap-1.5">
              <Save size={12} />
              Save
            </button>
          </div>
        </div>

        {/* Canvas + Side Panel */}
        <div className="flex flex-1 overflow-hidden">
          {/* Canvas */}
          <div
            ref={canvasRef}
            className="flex-1 relative overflow-hidden bg-bg-deep cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: "radial-gradient(circle, var(--ink) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }} />

            {/* Transformed canvas */}
            <div
              className="absolute inset-0"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "0 0",
              }}
            >
              {/* Edges as SVG */}
              <CanvasEdges nodes={def.nodes} edges={def.edges} />

              {/* Nodes */}
              {def.nodes.map((node) => (
                <CanvasNode
                  key={node.id}
                  node={node}
                  selected={selectedNode?.id === node.id}
                  onClick={() => {
                    setSelectedNode(node);
                    setSidePanel("config");
                  }}
                />
              ))}
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-surface border border-line rounded-lg p-1 shadow-sm">
              <button onClick={handleZoomOut} className="w-7 h-7 grid place-items-center rounded hover:bg-surface-2 text-muted-2 hover:text-ink transition-colors">
                <ZoomOut size={14} />
              </button>
              <span className="text-[10px] text-muted-2 tnum w-10 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={handleZoomIn} className="w-7 h-7 grid place-items-center rounded hover:bg-surface-2 text-muted-2 hover:text-ink transition-colors">
                <ZoomIn size={14} />
              </button>
              <div className="w-px h-4 bg-line" />
              <button onClick={handleFit} className="w-7 h-7 grid place-items-center rounded hover:bg-surface-2 text-muted-2 hover:text-ink transition-colors">
                <Maximize2 size={14} />
              </button>
            </div>
          </div>

          {/* Side Panel */}
          {sidePanel && (
            <div className="w-[320px] shrink-0 border-l border-line bg-surface overflow-y-auto">
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

function CanvasEdges({ nodes, edges }: { nodes: WfCanvasNode[]; edges: WfCanvasEdge[] }) {
  const nodeMap = useMemo(() => {
    const m = new Map<string, WfCanvasNode>();
    nodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [nodes]);

  const nodeW = 200;
  const nodeH = 60;

  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ width: 2000, height: 600 }}>
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" fill="none" stroke="var(--muted)" strokeWidth="1" />
        </marker>
      </defs>
      {edges.map((edge, i) => {
        const fromNode = nodeMap.get(edge.from);
        const toNode = nodeMap.get(edge.to);
        if (!fromNode || !toNode) return null;

        const x1 = fromNode.x + nodeW;
        const y1 = fromNode.y + nodeH / 2;
        const x2 = toNode.x;
        const y2 = toNode.y + nodeH / 2;
        const mx = (x1 + x2) / 2;

        return (
          <path
            key={i}
            d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
            fill="none"
            stroke="var(--line)"
            strokeWidth="1.5"
            markerEnd="url(#arrow)"
          />
        );
      })}
    </svg>
  );
}

/* ─── Canvas Node ─── */

function CanvasNode({ node, selected, onClick }: { node: WfCanvasNode; selected: boolean; onClick: () => void }) {
  const Icon = NODE_ICONS[node.type] || Plug;
  const catColor = CATEGORY_COLORS[node.category] || "var(--muted)";

  return (
    <div
      data-node
      onClick={onClick}
      className={`absolute cursor-pointer rounded-xl border px-3 py-2.5 transition-all hover:shadow-md ${
        selected ? "ring-2 ring-accent shadow-lg" : ""
      }`}
      style={{
        left: node.x,
        top: node.y,
        width: 200,
        background: "var(--surface)",
        borderColor: selected ? "var(--accent)" : "var(--line)",
      }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `color-mix(in srgb, ${catColor} 15%, transparent)` }}
        >
          <Icon size={14} style={{ color: catColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-medium text-ink truncate">{node.label}</div>
          <div className="text-[9px] text-muted-2 capitalize">{node.category}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Node Config Panel ─── */

function NodeConfigPanel({ node, onClose }: { node: WfCanvasNode; onClose: () => void }) {
  const Icon = NODE_ICONS[node.type] || Plug;
  const catColor = CATEGORY_COLORS[node.category] || "var(--muted)";

  return (
    <div className="p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-ink">Node Configuration</span>
        <button onClick={onClose} className="text-muted-2 hover:text-ink transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 border border-line">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `color-mix(in srgb, ${catColor} 15%, transparent)` }}
        >
          <Icon size={16} style={{ color: catColor }} />
        </div>
        <div>
          <div className="text-[12px] font-semibold text-ink">{node.label}</div>
          <div className="text-[10px] text-muted-2 capitalize">{node.category} &middot; {node.type}</div>
        </div>
      </div>

      <div>
        <div className="mono-label text-[9px] mb-2" style={{ letterSpacing: "0.08em" }}>Description</div>
        <p className="text-[12px] text-muted leading-relaxed">{node.description}</p>
      </div>

      <div>
        <div className="mono-label text-[9px] mb-2" style={{ letterSpacing: "0.08em" }}>Position</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="px-3 py-2 rounded-lg bg-bg-deep border border-line">
            <div className="text-[9px] text-muted-2">X</div>
            <div className="text-[12px] font-medium text-ink tnum">{node.x}</div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-bg-deep border border-line">
            <div className="text-[9px] text-muted-2">Y</div>
            <div className="text-[12px] font-medium text-ink tnum">{node.y}</div>
          </div>
        </div>
      </div>

      <div>
        <div className="mono-label text-[9px] mb-2" style={{ letterSpacing: "0.08em" }}>Settings</div>
        <div className="space-y-2">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-line">
            <span className="text-[11px] text-ink">Retry on failure</span>
            <div className="w-8 h-[18px] rounded-full bg-accent relative cursor-pointer">
              <div className="absolute top-[2px] right-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm" />
            </div>
          </div>
          <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-line">
            <span className="text-[11px] text-ink">Log output</span>
            <div className="w-8 h-[18px] rounded-full bg-accent relative cursor-pointer">
              <div className="absolute top-[2px] right-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm" />
            </div>
          </div>
          <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-line">
            <span className="text-[11px] text-ink">Timeout (sec)</span>
            <span className="text-[11px] text-muted-2 tnum">300</span>
          </div>
        </div>
      </div>
    </div>
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
