"use client";

import { useMemo, useState } from "react";
import { X, Mail, Phone, Calendar, Heart } from "lucide-react";
import type { Stakeholder } from "@/lib/mock";
import { useToast } from "./Toast";

type Layout = {
  node: Stakeholder;
  x: number;
  y: number;
  children: Layout[];
};

const NODE_W = 180;
const NODE_H = 64;
const GAP_X = 24;
const GAP_Y = 50;

const ROLE_TONE: Record<Stakeholder["role"], { bg: string; ink: string; chip: string }> = {
  Champion:        { bg: "var(--accent-soft)", ink: "var(--accent-ink)", chip: "var(--accent)"     },
  "Decision Maker":{ bg: "var(--surface)",     ink: "var(--ink)",        chip: "var(--ink)"        },
  Influencer:      { bg: "var(--info-soft)",   ink: "var(--info)",       chip: "var(--info)"       },
  Detractor:       { bg: "var(--neg-soft)",    ink: "var(--neg)",        chip: "var(--neg)"        },
  User:            { bg: "var(--bg-deep)",     ink: "var(--ink-2)",      chip: "var(--muted)"      },
};

function buildForest(stakeholders: Stakeholder[]): Layout[] {
  const byName = new Map<string, Stakeholder>(stakeholders.map((s) => [s.name, s]));
  const childrenOf = new Map<string, Stakeholder[]>();
  const roots: Stakeholder[] = [];
  stakeholders.forEach((s) => {
    if (s.reportsTo && byName.has(s.reportsTo)) {
      const arr = childrenOf.get(s.reportsTo) ?? [];
      arr.push(s);
      childrenOf.set(s.reportsTo, arr);
    } else {
      roots.push(s);
    }
  });

  // First pass: layout children, compute subtree width
  const buildNode = (s: Stakeholder, depth = 0): Layout & { width: number } => {
    const kids = (childrenOf.get(s.name) ?? []).map((c) => buildNode(c, depth + 1));
    const childTotalW = kids.length === 0
      ? NODE_W
      : kids.reduce((sum, k) => sum + k.width, 0) + GAP_X * (kids.length - 1);
    return { node: s, x: 0, y: depth * (NODE_H + GAP_Y), children: kids, width: Math.max(NODE_W, childTotalW) };
  };

  const tagged = roots.map((r) => buildNode(r));

  // Second pass: assign x given offset
  const assignX = (node: Layout & { width: number }, offsetX: number) => {
    node.x = offsetX + (node.width - NODE_W) / 2;
    let cursor = offsetX;
    node.children.forEach((c) => {
      assignX(c as Layout & { width: number }, cursor);
      cursor += (c as Layout & { width: number }).width + GAP_X;
    });
  };

  let cursor = 0;
  tagged.forEach((t) => {
    assignX(t, cursor);
    cursor += t.width + GAP_X;
  });
  return tagged;
}

function flatten(forest: Layout[]): Layout[] {
  const out: Layout[] = [];
  const walk = (n: Layout) => { out.push(n); n.children.forEach(walk); };
  forest.forEach(walk);
  return out;
}

type OrgChartProps = {
  stakeholders: Stakeholder[];
  onEdit?: (s: Stakeholder) => void;
  onReportsToChange?: (name: string, newManager: string | null) => void;
};

export function OrgChart({ stakeholders, onEdit, onReportsToChange }: OrgChartProps) {
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<Stakeholder | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const forest = useMemo(() => buildForest(stakeholders), [stakeholders]);
  const allNodes = useMemo(() => flatten(forest), [forest]);
  const reportsCount = (name: string) => stakeholders.filter((s) => s.reportsTo === name).length;
  const toast = useToast();

  // Build the set of descendants for a given node — to prevent cycles when dropping.
  const descendantsOf = (rootName: string): Set<string> => {
    const out = new Set<string>();
    const walk = (name: string) => {
      stakeholders.filter((s) => s.reportsTo === name).forEach((c) => {
        out.add(c.name); walk(c.name);
      });
    };
    walk(rootName);
    return out;
  };

  const handleDrop = (sourceName: string, targetName: string | null) => {
    if (!onReportsToChange) return;
    if (sourceName === targetName) return;
    if (targetName && descendantsOf(sourceName).has(targetName)) {
      toast({ tone: "error", title: "Can't move there", body: "That would create a cycle in the org chart." });
      return;
    }
    onReportsToChange(sourceName, targetName);
    toast({ tone: "success", title: "Reporting line updated", body: targetName ? `${sourceName} now reports to ${targetName}` : `${sourceName} is now top of tree` });
  };

  if (allNodes.length === 0) {
    return (
      <div className="recessed-dashed p-8 text-center">
        <div className="text-[12.5px] font-semibold text-ink">No stakeholders yet</div>
        <div className="text-[11.5px] text-muted mt-1">Add contacts on the Stakeholders tab to populate the org chart.</div>
      </div>
    );
  }

  const totalW = forest.reduce((s, t) => Math.max(s, t.x + (t as any).width), 0);
  const totalH = Math.max(...allNodes.map((n) => n.y)) + NODE_H;

  return (
    <div className="overflow-x-auto">
      <svg width={totalW + 40} height={totalH + 40} style={{ display: "block" }}>
        <g transform="translate(20, 20)">
          {/* Connection lines (manager → report) */}
          {allNodes.map((n) =>
            n.children.map((c) => {
              const fromX = n.x + NODE_W / 2;
              const fromY = n.y + NODE_H;
              const toX   = c.x + NODE_W / 2;
              const toY   = c.y;
              const midY  = fromY + GAP_Y / 2;
              return (
                <path key={`${n.node.name}->${c.node.name}`}
                  d={`M ${fromX} ${fromY} L ${fromX} ${midY} L ${toX} ${midY} L ${toX} ${toY}`}
                  stroke="var(--line-strong)" strokeWidth="1.2" fill="none" />
              );
            })
          )}

          {/* Nodes */}
          {allNodes.map((n) => {
            const tone = ROLE_TONE[n.node.role];
            const initials = n.node.name.split(" ").map((p) => p[0]).join("").slice(0, 2);
            const isHover = hover === n.node.name;
            const sentimentDot =
              n.node.sentiment === "supportive" ? "var(--pos)"
              : n.node.sentiment === "negative" ? "var(--neg)"
              : "var(--muted-2)";
            return (
              <g key={n.node.name} transform={`translate(${n.x}, ${n.y})`}
                onMouseEnter={() => { setHover(n.node.name); if (dragging && dragging !== n.node.name) setDropTarget(n.node.name); }}
                onMouseLeave={() => { setHover(null); if (dropTarget === n.node.name) setDropTarget(null); }}
                onMouseDown={(e) => {
                  if (!onReportsToChange) return;
                  // Long-press / drag detection: native HTML5 drag is awkward in SVG, use mousedown + window mousemove
                  const startX = (e as React.MouseEvent).clientX;
                  const startY = (e as React.MouseEvent).clientY;
                  let drag = false;
                  const onMove = (ev: MouseEvent) => {
                    if (!drag && (Math.abs(ev.clientX - startX) > 6 || Math.abs(ev.clientY - startY) > 6)) {
                      drag = true; setDragging(n.node.name);
                    }
                  };
                  const onUp = () => {
                    window.removeEventListener("mousemove", onMove);
                    window.removeEventListener("mouseup", onUp);
                    if (drag) {
                      handleDrop(n.node.name, dropTarget);
                    } else {
                      setSelected(n.node);
                    }
                    setDragging(null); setDropTarget(null);
                  };
                  window.addEventListener("mousemove", onMove);
                  window.addEventListener("mouseup", onUp);
                }}
                style={{ cursor: dragging === n.node.name ? "grabbing" : "pointer", opacity: dragging && dragging !== n.node.name ? 0.55 : 1 }}>
                <rect
                  width={NODE_W} height={NODE_H} rx="10"
                  fill={tone.bg}
                  stroke={dropTarget === n.node.name ? "var(--accent-deep)" : isHover ? "var(--ink)" : "var(--line)"}
                  strokeWidth={dropTarget === n.node.name ? 2 : isHover ? 1.5 : 1}
                  strokeDasharray={dropTarget === n.node.name ? "4 3" : undefined}
                  filter={isHover ? "drop-shadow(0 4px 12px rgba(20,20,15,0.15))" : undefined}
                />
                {/* Initials avatar */}
                <circle cx="20" cy={NODE_H / 2} r="14" fill="var(--ink)" />
                <text x="20" y={NODE_H / 2 + 4} textAnchor="middle"
                  fontSize="10.5" fontWeight="600" fill="white"
                  style={{ fontFamily: "var(--font-sans)" }}>
                  {initials}
                </text>
                {/* Name */}
                <text x="42" y="22" fontSize="11.5" fontWeight="600"
                  fill="var(--ink)" style={{ fontFamily: "var(--font-sans)" }}>
                  {truncate(n.node.name, 20)}
                </text>
                {/* Title */}
                <text x="42" y="36" fontSize="10" fill="var(--muted)"
                  style={{ fontFamily: "var(--font-sans)" }}>
                  {truncate(n.node.title, 22)}
                </text>
                {/* Role chip */}
                <rect x="42" y="44" width={n.node.role.length * 5.5 + 12} height="14" rx="4"
                  fill={tone.chip} opacity="0.18" />
                <text x={42 + (n.node.role.length * 5.5 + 12) / 2} y="54" textAnchor="middle"
                  fontSize="9" fontWeight="600" fill={tone.chip}
                  style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.04em" }}>
                  {n.node.role.toUpperCase()}
                </text>
                {/* Sentiment + silence indicator */}
                <circle cx={NODE_W - 14} cy="14" r="3.5" fill={sentimentDot} />
                {n.node.daysSilent > 7 && (
                  <text x={NODE_W - 8} y={NODE_H - 8} textAnchor="end"
                    fontSize="9" fill="var(--neg)"
                    style={{ fontFamily: "var(--font-sans)" }}>
                    {n.node.daysSilent}d silent
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Drag hint */}
      {onReportsToChange && (
        <div className="text-[10.5px] text-muted-2 mt-2 italic">
          Tip: drag a node onto another to change its reporting line.
        </div>
      )}

      {/* Detail popover */}
      {selected && (
        <StakeholderDetail s={selected} reportsCount={reportsCount(selected.name)}
          onEdit={onEdit ? () => { const s = selected; setSelected(null); onEdit(s); } : undefined}
          onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function StakeholderDetail({ s, reportsCount, onClose, onEdit }: { s: Stakeholder; reportsCount: number; onClose: () => void; onEdit?: () => void }) {
  const toast = useToast();
  const [tracked, setTracked] = useState(false);
  const initials = s.name.split(" ").map((p) => p[0]).join("").slice(0, 2);
  const tone = ROLE_TONE[s.role];
  const sentimentTone = s.sentiment === "supportive" ? "var(--pos)" : s.sentiment === "negative" ? "var(--neg)" : "var(--muted)";
  return (
    <>
      <div className="fixed inset-0 bg-ink/30 z-[80] fade-in" onClick={onClose} />
      <div className="fixed top-[15vh] left-1/2 -translate-x-1/2 z-[90] card p-5 w-[400px] fade-in"
        onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-3 right-3 flex items-center gap-1">
          {onEdit && (
            <button onClick={onEdit} title="Edit"
              className="text-[10.5px] font-medium text-muted hover:text-ink h-6 px-2 rounded hover:bg-bg-deep">
              Edit
            </button>
          )}
          <button onClick={onClose} className="w-6 h-6 rounded grid place-items-center text-muted hover:text-ink hover:bg-bg-deep" aria-label="Close">
            <X size={12} strokeWidth={1.6} />
          </button>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-ink text-white grid place-items-center text-[14px] font-semibold">{initials}</div>
          <div>
            <div className="text-[15px] font-semibold text-ink">{s.name}</div>
            <div className="text-[11.5px] text-muted">{s.title}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="recessed p-2.5">
            <div className="text-[10px] text-muted">Role</div>
            <div className="text-[11.5px] font-semibold mt-0.5" style={{ color: tone.chip }}>{s.role}</div>
          </div>
          <div className="recessed p-2.5">
            <div className="text-[10px] text-muted">Sentiment</div>
            <div className="text-[11.5px] font-semibold mt-0.5 capitalize" style={{ color: sentimentTone }}>{s.sentiment}</div>
          </div>
          <div className="recessed p-2.5">
            <div className="text-[10px] text-muted">Department</div>
            <div className="text-[11.5px] font-semibold mt-0.5 text-ink-2">{s.department ?? "—"}</div>
          </div>
          <div className="recessed p-2.5">
            <div className="text-[10px] text-muted">Direct reports</div>
            <div className="text-[11.5px] font-semibold mt-0.5 text-ink-2 tnum">{reportsCount}</div>
          </div>
        </div>

        <div className="recessed p-3 mb-4">
          <div className="flex items-center gap-2 text-[11.5px]">
            <Calendar size={11} strokeWidth={1.6} className="text-muted" />
            <span className="text-muted">Last touch:</span>
            <span className="text-ink-2 font-medium">{s.lastTouch}</span>
          </div>
          {s.daysSilent > 0 && (
            <div className="text-[10.5px] mt-1.5"
              style={{ color: s.daysSilent > 7 ? "var(--neg)" : "var(--muted)" }}>
              {s.daysSilent}d silent {s.daysSilent > 7 ? "— consider re-engaging" : ""}
            </div>
          )}
          {s.reportsTo && (
            <div className="text-[11px] text-muted mt-1.5">Reports to <span className="text-ink-2 font-medium">{s.reportsTo}</span></div>
          )}
        </div>

        <div className="flex gap-1.5">
          <button onClick={() => { toast({ tone: "success", title: `Email drafted for ${s.name}`, body: "Opens in your default mail client." }); onClose(); }}
            className="flex-1 text-[11.5px] font-medium h-8 rounded-md inline-flex items-center justify-center gap-1.5 bg-ink text-white hover:bg-ink-2">
            <Mail size={11} strokeWidth={1.8} /> Email
          </button>
          <button onClick={() => { toast({ tone: "info", title: `Calling ${s.name}…`, body: "Connecting via your dialer." }); onClose(); }}
            className="flex-1 text-[11.5px] font-medium h-8 rounded-md inline-flex items-center justify-center gap-1.5 border border-line bg-surface hover:bg-bg-deep">
            <Phone size={11} strokeWidth={1.8} /> Call
          </button>
          <button onClick={() => { setTracked(!tracked); toast({ tone: "success", title: tracked ? "Stopped tracking" : `Tracking ${s.name}`, body: tracked ? undefined : "You'll be notified when they engage." }); }}
            className="flex-1 text-[11.5px] font-medium h-8 rounded-md inline-flex items-center justify-center gap-1.5 border border-line hover:bg-bg-deep"
            style={tracked ? { background: "var(--accent)", color: "var(--accent-ink)", borderColor: "var(--accent-deep)" } : { background: "var(--surface)" }}>
            <Heart size={11} strokeWidth={1.8} fill={tracked ? "currentColor" : "transparent"} />
            {tracked ? "Tracking" : "Track"}
          </button>
        </div>
      </div>
    </>
  );
}

function truncate(s: string, n: number) { return s.length > n ? s.slice(0, n - 1) + "…" : s; }
