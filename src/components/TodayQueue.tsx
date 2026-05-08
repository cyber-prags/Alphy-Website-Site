"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, Calendar, TrendingUp, Activity, Sparkles, Mail,
  Clock, X, ChevronRight, Briefcase, MoreHorizontal, CheckCircle2,
} from "lucide-react";
import { queueItems, type QueueItem, type QueueKind, type Persona, deals } from "@/lib/mock";
import { Logo } from "./Logo";
import { DealDetailDrawer } from "./DealDetailDrawer";
import { QuickActionModal, type QuickActionKind } from "./QuickActionModal";
import { TaskDetailDrawer } from "./TaskDetailDrawer";
import { ClosureBadge, useClosure, type ClosureStatus } from "./ClosureContext";
import { Popover, MenuItem, MenuLabel, MenuSeparator } from "./Popover";

// Map a queue item's primary action label → composer kind.
// AE-specific labels (questionnaire, discovery, multithread) hit dedicated
// kinds with deal-flavoured drafts and steps — not generic email/QBR fall-throughs.
const PRIMARY_TO_KIND: Record<string, QuickActionKind> = {
  "Send re-engage":          "email",
  "Build case":              "case",
  "Schedule QBR":            "qbr",
  "Run escalation":          "escalation",
  "Approve & send":          "approve",
  "Validate case":           "case",
  "Open usage drill-down":   "drilldown",
  "Open deal":               "deal-update",
  "Send questionnaire":      "questionnaire",
  "Schedule discovery":      "discovery",
  "Multithread":             "multithread",
  "Update deal":             "deal-update",
};

type Filter = "all" | QueueKind;

const ME = "Walid";

const KIND_META: Record<QueueKind, { label: string; tone: string; soft: string; Icon: typeof Mail }> = {
  risk:      { label: "At-risk",   tone: "var(--neg)",     soft: "var(--neg-soft)",   Icon: AlertTriangle },
  renewal:   { label: "Renewal",   tone: "var(--warn)",    soft: "var(--warn-soft)",  Icon: Calendar },
  expansion: { label: "Expansion", tone: "var(--accent)",  soft: "var(--accent-soft)",Icon: TrendingUp },
  adoption:  { label: "Adoption",  tone: "var(--info)",    soft: "var(--info-soft)",  Icon: Activity },
  prep:      { label: "Prep",      tone: "var(--ink-2)",   soft: "var(--bg-deep)",    Icon: Sparkles },
  deal:      { label: "Deal",      tone: "var(--accent)",  soft: "var(--accent-soft)",Icon: Briefcase },
};

export function TodayQueue({ persona }: { persona: Persona }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [openDealId, setOpenDealId] = useState<string | null>(null);
  const [quickAction, setQuickAction] = useState<{ id: string; kind: QuickActionKind; account: string; context: string } | null>(null);
  const [taskDetail, setTaskDetail] = useState<QueueItem | null>(null);
  const closure = useClosure();

  const personalised = useMemo(() => queueItems.filter((q) => q.personas.includes(persona)), [persona]);

  // "Visible" = not resolved / dismissed / snoozed. New / seen / acted stay in the active list.
  const visibleAll = useMemo(
    () => personalised.filter((q) => {
      const s = closure.status(q.id);
      return s !== "resolved" && s !== "dismissed" && s !== "snoozed";
    }),
    [personalised, closure.records]
  );

  // Build filter list dynamically based on which kinds appear for this persona
  const presentKinds = Array.from(new Set(personalised.map((q) => q.kind)));
  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    ...presentKinds.map((k) => ({ key: k as Filter, label: KIND_META[k].label })),
  ];

  const counts: Record<string, number> = { all: visibleAll.length };
  presentKinds.forEach((k) => { counts[k] = visibleAll.filter((q) => q.kind === k).length; });
  const visible = filter === "all" ? visibleAll : visibleAll.filter((q) => q.kind === filter);

  const overdue = visibleAll.filter((q) => q.overdue).length;
  const closed = personalised.length - visibleAll.length;

  const openDeal = openDealId ? deals.find((d) => d.id === openDealId) ?? null : null;

  // Build columns for Kanban — only kinds that have items appear (after filter)
  const visibleKinds = filter === "all" ? presentKinds : (presentKinds.includes(filter as QueueKind) ? [filter as QueueKind] : []);
  const columns = visibleKinds.map((kind) => ({
    kind,
    items: visible.filter((q) => q.kind === kind),
  })).filter((c) => c.items.length > 0);

  const fireQuickAction = (q: QueueItem) => {
    const kind = PRIMARY_TO_KIND[q.primary] ?? "note";
    setQuickAction({ id: q.id, kind, account: q.account, context: q.headline });
  };

  return (
    <section className="card p-5 mb-6">
      <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="mono-label mb-2">Today · your queue</div>
          <h2 className="text-ink" style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 600 }}>
            {visibleAll.length} action{visibleAll.length === 1 ? "" : "s"}
            {overdue > 0 && (
              <span className="text-muted font-normal"> · <span style={{ color: "var(--neg)" }}>{overdue} overdue</span></span>
            )}
            {closed > 0 && <span className="text-muted font-normal"> · {closed} cleared today</span>}
          </h2>
        </div>

        <div className="recessed flex items-center p-0.5 gap-0.5">
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`text-[11.5px] font-medium px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 transition-colors ${
                filter === f.key ? "bg-ink text-white" : "text-muted hover:text-ink"
              }`}>
              {f.label}
              <span className="text-[10.5px] font-mono tnum" style={{ opacity: filter === f.key ? 0.7 : 0.5 }}>
                {counts[f.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {columns.length === 0 ? (
        <EmptyState filter={filter} closed={closed} />
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollSnapType: "x mandatory" }}>
          {columns.map((col) => (
            <KanbanColumn
              key={col.kind}
              kind={col.kind}
              items={col.items}
              onPrimary={fireQuickAction}
              onOpenDeal={(id) => setOpenDealId(id)}
              onOpenTask={(q) => setTaskDetail(q)}
            />
          ))}
        </div>
      )}

      {/* Cleared today section */}
      {closed > 0 && <ClearedToday items={personalised} />}

      <DealDetailDrawer deal={openDeal} onClose={() => setOpenDealId(null)} />
      <TaskDetailDrawer
        item={taskDetail}
        onClose={() => setTaskDetail(null)}
        onDone={(id) => { closure.resolve(id, ME, "Marked done"); setTaskDetail(null); }}
        onDismiss={(id) => { closure.dismiss(id, ME, "Dismissed"); setTaskDetail(null); }}
      />
      {quickAction && (
        <QuickActionModal
          open={!!quickAction}
          kind={quickAction.kind}
          account={quickAction.account}
          context={quickAction.context}
          onClose={() => setQuickAction(null)}
          onComplete={() => closure.act(quickAction.id, ME, `Sent ${quickAction.kind}`)}
        />
      )}
    </section>
  );
}

// =====================================================================
// Kanban column + card
// =====================================================================

function KanbanColumn({
  kind, items, onPrimary, onOpenDeal, onOpenTask,
}: {
  kind: QueueKind;
  items: QueueItem[];
  onPrimary: (q: QueueItem) => void;
  onOpenDeal: (id: string) => void;
  onOpenTask: (q: QueueItem) => void;
}) {
  const m = KIND_META[kind];
  const Icon = m.Icon;

  return (
    <div
      className="shrink-0 flex flex-col gap-2.5 rounded-2xl p-3"
      style={{
        width: 310,
        scrollSnapAlign: "start",
        background: "var(--bg-deep)",
        border: "1px solid var(--line)",
      }}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-1.5 pt-1 pb-1.5 border-b border-line/70">
        <div className="inline-flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: m.tone }} />
          <span className="text-[11.5px] font-semibold text-ink uppercase tracking-wider" style={{ letterSpacing: "0.06em" }}>
            {m.label}
          </span>
        </div>
        <span className="text-[11px] font-mono tnum text-muted bg-surface px-1.5 py-0.5 rounded">{items.length}</span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2">
        {items.map((q) => (
          <KanbanCard
            key={q.id}
            item={q}
            kindMeta={m}
            Icon={Icon}
            onPrimary={() => onPrimary(q)}
            onOpenDeal={onOpenDeal}
            onOpenTask={() => onOpenTask(q)}
          />
        ))}
      </div>
    </div>
  );
}

function KanbanCard({
  item, kindMeta, Icon, onPrimary, onOpenDeal, onOpenTask,
}: {
  item: QueueItem;
  kindMeta: { label: string; tone: string; soft: string; Icon: typeof Mail };
  Icon: typeof Mail;
  onPrimary: () => void;
  onOpenDeal: (id: string) => void;
  onOpenTask: () => void;
}) {
  const router = useRouter();
  const closure = useClosure();
  const status = closure.status(item.id);
  const record = closure.get(item.id);

  const markSeenOnHover = () => { if (status === "new") closure.see(item.id, ME); };

  const fire = () => {
    if (item.target.type === "deal") onOpenDeal(item.target.id);
    else onPrimary();
  };

  const openTarget = () => {
    if (item.target.type === "deal") onOpenDeal(item.target.id);
    else router.push(`/accounts/${item.target.slug}`);
  };

  const lastEvent = record?.events[record.events.length - 1];

  return (
    <div
      onMouseEnter={markSeenOnHover}
      className="rounded-xl bg-surface border border-line hover:border-line-strong hover:shadow-[0_4px_16px_-6px_rgba(28,40,64,0.10)] transition-all p-3.5 flex flex-col gap-2.5"
      style={{ borderLeft: `3px solid ${kindMeta.tone}` }}
    >
      {/* Top row — account + meta */}
      <div className="flex items-center gap-2 min-w-0">
        <button onClick={openTarget} className="flex items-center gap-2 hover:underline min-w-0">
          <Logo name={item.account} size={18} rounded={5} />
          <span className="text-[12.5px] font-semibold text-ink truncate">{item.account}</span>
        </button>
        <span className="text-[10px] font-mono text-muted-2 ml-auto shrink-0">{item.ago}</span>
      </div>

      {/* Headline — opens detail drawer */}
      <button
        onClick={onOpenTask}
        className="text-left text-[13px] font-semibold text-ink leading-snug hover:underline line-clamp-2"
      >
        {item.headline}
      </button>

      {/* Why */}
      <p className="text-[11px] text-muted leading-relaxed line-clamp-2">{item.why}</p>

      {/* Subtask progress */}
      {item.subtasks && item.subtasks.length > 0 && (() => {
        const done = item.subtasks.filter((s) => s.done).length;
        const pct = Math.round((done / item.subtasks.length) * 100);
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-deep)" }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--accent)" }} />
            </div>
            <span className="text-[9.5px] font-mono tnum text-muted">{done}/{item.subtasks.length}</span>
          </div>
        );
      })()}

      {/* Status row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <ClosureBadge status={status} size="xs" />
        {item.overdue && (
          <span className="text-[9.5px] font-mono uppercase tracking-[0.06em] px-1.5 py-0.5 rounded"
            style={{ background: "var(--neg-soft)", color: "var(--neg)" }}>
            Overdue
          </span>
        )}
        {item.due && !item.overdue && (
          <span className="text-[10px] font-mono text-muted-2">due {item.due}</span>
        )}
      </div>

      {/* Footer — primary action + more */}
      <div className="flex items-center gap-1.5 mt-0.5 pt-2.5 border-t border-line/70">
        {status === "acted" || status === "resolved" ? (
          <button
            onClick={() => closure.resolve(item.id, ME, "Confirmed closed")}
            className="flex-1 text-[11px] font-medium px-3 py-2 rounded-lg inline-flex items-center justify-center gap-1.5 transition-colors border border-line bg-surface text-ink hover:bg-bg-deep"
          >
            <CheckCircle2 size={12} strokeWidth={1.8} style={{ color: "var(--pos)" }} />
            {status === "acted" ? "Mark resolved" : "Resolved"}
          </button>
        ) : (
          <button
            onClick={fire}
            className="flex-1 text-[11px] font-medium px-3 py-2 rounded-lg inline-flex items-center justify-center gap-1.5 transition-colors bg-ink text-white hover:bg-ink-2"
          >
            {item.primary}
            <ChevronRight size={12} strokeWidth={1.8} />
          </button>
        )}
        <Popover align="right" width={200}
          trigger={(_, t) => (
            <button onClick={t}
              className="w-7 h-7 rounded-lg grid place-items-center text-muted hover:text-ink hover:bg-bg-deep border border-line"
              aria-label="More actions">
              <MoreHorizontal size={12} strokeWidth={1.8} />
            </button>
          )}>
          {(close) => (
            <>
              <MenuLabel>Closure</MenuLabel>
              {status === "new" && <MenuItem onClick={() => { closure.see(item.id, ME); close(); }}>Mark seen</MenuItem>}
              {status !== "acted" && status !== "resolved" && <MenuItem onClick={() => { closure.act(item.id, ME, "Manual mark"); close(); }}>Mark acted</MenuItem>}
              {status !== "resolved" && <MenuItem onClick={() => { closure.resolve(item.id, ME); close(); }}>Resolve</MenuItem>}
              <MenuSeparator />
              <MenuItem onClick={() => { closure.snooze(item.id, ME); close(); }}>
                <span className="inline-flex items-center gap-1.5"><Clock size={11} /> Snooze 1 day</span>
              </MenuItem>
              <MenuItem onClick={() => { closure.dismiss(item.id, ME, "Not relevant"); close(); }} danger>
                <span className="inline-flex items-center gap-1.5"><X size={11} /> Dismiss</span>
              </MenuItem>
            </>
          )}
        </Popover>
      </div>

      {lastEvent && status !== "new" && (
        <div className="text-[9.5px] text-muted-2 leading-tight">
          <span className="font-medium text-ink-2">{lastEvent.by}</span> {labelFor(lastEvent.type)} · {timeAgo(lastEvent.at)}
        </div>
      )}
    </div>
  );
}

function ClearedToday({ items }: { items: QueueItem[] }) {
  const closure = useClosure();
  const cleared = items.filter((q) => {
    const s = closure.status(q.id);
    return s === "resolved" || s === "dismissed" || s === "snoozed";
  });
  const [open, setOpen] = useState(false);
  if (cleared.length === 0) return null;
  return (
    <div className="mt-4 pt-4 border-t border-line">
      <button onClick={() => setOpen(!open)}
        className="text-[11px] text-muted hover:text-ink inline-flex items-center gap-1.5">
        {open ? "▾" : "▸"} Cleared today · {cleared.length}
      </button>
      {open && (
        <div className="space-y-1 mt-2">
          {cleared.map((q) => (
            <div key={q.id} className="flex items-center gap-2.5 px-2 py-1 rounded-md text-[11.5px]">
              <ClosureBadge status={closure.status(q.id)} size="xs" />
              <span className="text-muted line-through truncate flex-1">{q.headline}</span>
              <button onClick={() => closure.reopen(q.id, ME)} className="text-[10.5px] text-muted hover:text-ink underline decoration-dotted underline-offset-2">
                Reopen
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function labelFor(t: string): string {
  if (t === "seen")       return "saw this";
  if (t === "acted")      return "acted";
  if (t === "resolved")   return "resolved";
  if (t === "dismissed")  return "dismissed";
  if (t === "snoozed")    return "snoozed";
  if (t === "commented")  return "commented";
  if (t === "assigned")   return "assigned this";
  return t;
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function EmptyState({ filter, closed }: { filter: Filter; closed: number }) {
  return (
    <div className="recessed-dashed p-8 text-center">
      <div className="w-9 h-9 rounded-md grid place-items-center mx-auto mb-2"
        style={{ background: "var(--accent-soft)" }}>
        <Sparkles size={15} strokeWidth={1.6} style={{ color: "var(--accent)" }} />
      </div>
      <div className="text-[13px] font-semibold text-ink">
        {filter === "all" ? "Inbox zero." : `No ${filter} actions left.`}
      </div>
      <div className="text-[11.5px] text-muted mt-1">
        {closed > 0 ? `You cleared ${closed} action${closed === 1 ? "" : "s"} today. Nice.`
                    : "Nothing on your plate right now."}
      </div>
    </div>
  );
}
