"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, Sparkles, Mail, Phone, Globe2, Video, FileText, ArrowRight,
  CheckCircle2, X, Eye, MessageSquare, Zap,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { accountDetails, type AccountSignal } from "@/lib/mock";
import { usePersona } from "@/components/PersonaContext";
import { Logo } from "@/components/Logo";
import { SourceChip, DataFreshness } from "@/components/SourceChip";
import { ClosureBadge, useClosure, type ClosureStatus } from "@/components/ClosureContext";
import { Popover, MenuItem, MenuLabel, MenuSeparator } from "@/components/Popover";

type FlatSignal = AccountSignal & { account: string; accountSlug: string };

const TONE: Record<AccountSignal["tone"], { bg: string; ink: string }> = {
  pos:  { bg: "var(--pos-soft)",  ink: "var(--pos)"  },
  neg:  { bg: "var(--neg-soft)",  ink: "var(--neg)"  },
  warn: { bg: "var(--warn-soft)", ink: "var(--warn)" },
  info: { bg: "var(--info-soft)", ink: "var(--info)" },
};

const ME = "Walid";

// Derive a "primary source" attribution from the evidence array
function primarySourceFor(s: AccountSignal): string {
  const counts: Record<string, number> = {};
  s.evidence.forEach((e) => {
    const src =
      e.kind === "linkedin"        ? "LinkedIn Sales Nav" :
      e.kind === "call"            ? "Gong" :
      e.kind === "transcript"      ? "Gong" :
      e.kind === "email"           ? "Gmail" :
      "Salesforce";
    counts[src] = (counts[src] ?? 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
}

// Derive a suggested play from category + tone
function suggestedPlayFor(s: AccountSignal): { label: string; cta: string } {
  const { category, tone } = s;
  if (category === "Renewal"      && tone === "neg")  return { label: "Schedule exec touchpoint",  cta: "Book exec call" };
  if (category === "Renewal"      && tone === "warn") return { label: "Send renewal heads-up",     cta: "Draft email" };
  if (category === "Renewal"      && tone === "pos")  return { label: "Confirm auto-renewal",      cta: "Confirm" };
  if (category === "Expansion"    && tone === "pos")  return { label: "Send expansion case",       cta: "Build case" };
  if (category === "Expansion"    && tone === "info") return { label: "Validate expansion thesis", cta: "Validate" };
  if (category === "Hiring & Org" && tone === "info") return { label: "Map contact + intro",       cta: "Run play" };
  if (category === "Hiring & Org" && tone === "pos")  return { label: "Engage new champion",       cta: "Draft outreach" };
  if (category === "Hiring & Org" && tone === "neg")  return { label: "Re-engage replacement",     cta: "Draft outreach" };
  if (category === "Usage"        && tone === "neg")  return { label: "Open adoption drill-down",  cta: "Investigate" };
  if (category === "Usage"        && tone === "warn") return { label: "Schedule training session", cta: "Schedule" };
  if (category === "Usage"        && tone === "pos")  return { label: "Surface success in QBR",    cta: "Add to QBR" };
  if (category === "Competitive")                         return { label: "Run competitive battle card",   cta: "Run play" };
  if (category === "Champion Change" && tone === "pos")   return { label: "Expansion outreach",             cta: "Build case" };
  if (category === "Champion Change" && tone === "neg")   return { label: "Succession recovery",            cta: "Run play" };
  if (category === "Champion Change" && tone === "info")  return { label: "Introductory outreach",          cta: "Draft outreach" };
  return { label: "Capture in brief", cta: "Pin to account" };
}

type StatusFilter = "all" | "open" | "acted" | "resolved";

export default function SignalsPage() {
  const closure = useClosure();
  const { persona } = usePersona();
  const allSignals: FlatSignal[] = useMemo(
    () => Object.entries(accountDetails)
      // CSMs only see signals from their customer book
      .filter(([, d]) => persona !== "csm" || d.status === "Customer")
      .flatMap(([slug, d]) =>
        d.signals.map((s) => ({ ...s, account: d.name, accountSlug: slug }))
      ),
    [persona]
  );

  const [filter, setFilter] = useState<"all" | AccountSignal["category"]>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const matchesStatus = (id: string): boolean => {
    if (statusFilter === "all") return true;
    const s = closure.status(id);
    if (statusFilter === "open")     return s === "new" || s === "seen";
    if (statusFilter === "acted")    return s === "acted";
    if (statusFilter === "resolved") return s === "resolved";
    return true;
  };

  const filtered = useMemo(() => {
    const lc = search.trim().toLowerCase();
    return allSignals
      .filter((s) => filter === "all" || s.category === filter)
      .filter((s) => !lc || `${s.body} ${s.account} ${s.category}`.toLowerCase().includes(lc))
      .filter((s) => matchesStatus(`signal:${s.accountSlug}:${s.id}`));
  }, [allSignals, filter, search, statusFilter, closure.records]);

  const categories = Array.from(new Set(allSignals.map((s) => s.category)));

  // Closure stats across all signals — what managers want
  const stats = useMemo(() => {
    const t = { total: allSignals.length, new: 0, seen: 0, acted: 0, resolved: 0 };
    allSignals.forEach((s) => {
      const st = closure.status(`signal:${s.accountSlug}:${s.id}`);
      if (st === "new")      t.new += 1;
      if (st === "seen")     t.seen += 1;
      if (st === "acted")    t.acted += 1;
      if (st === "resolved") t.resolved += 1;
    });
    return t;
  }, [allSignals, closure.records]);

  return (
    <AppShell>
      <div className="mb-5">
        <div className="mono-label mb-2">Signals</div>
        <h1 className="display ink-gradient" style={{ fontSize: 36, lineHeight: 1.05 }}>
          What changed across <span className="italic-emph">your book</span>
        </h1>
        <div className="text-[12.5px] text-muted mt-1.5 mb-3 max-w-2xl">
          Every Risk, Strength, and Opportunity is a signal with an evidence chain. Closure status tracks whether the receiving human acted.
        </div>
        <DataFreshness minutesAgo={9} sources={["Gong", "Salesforce", "LinkedIn", "Mixpanel"]} />
      </div>

      {/* Closure stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
        <ClosureStat label="Total"     value={stats.total}    onClick={() => setStatusFilter("all")}      active={statusFilter === "all"} />
        <ClosureStat label="Open"      value={stats.new + stats.seen} onClick={() => setStatusFilter("open")} active={statusFilter === "open"} tone="var(--info)" />
        <ClosureStat label="New"       value={stats.new}      muted />
        <ClosureStat label="Acted"     value={stats.acted}    onClick={() => setStatusFilter("acted")}    active={statusFilter === "acted"} tone="var(--ink)" />
        <ClosureStat label="Resolved"  value={stats.resolved} onClick={() => setStatusFilter("resolved")} active={statusFilter === "resolved"} tone="var(--pos)" />
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button onClick={() => setFilter("all")} className={`pill-nav-item ${filter === "all" ? "active" : ""}`}>All</button>
        {categories.map((c) => (
          <button key={c} onClick={() => setFilter(c)}
            className={`pill-nav-item ${filter === c ? "active" : ""}`}>{c}</button>
        ))}
        <div className="ml-auto flex items-center gap-2 h-8 w-72 px-2.5 rounded-md border border-line bg-surface">
          <Search size={12} strokeWidth={1.6} className="text-muted-2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search signals…"
            className="flex-1 bg-transparent outline-none text-[12px] placeholder:text-muted-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((s) => <SignalCard key={`${s.accountSlug}-${s.id}`} signal={s} />)}
        {filtered.length === 0 && (
          <div className="md:col-span-2 card p-8 text-center text-[12.5px] text-muted">No signals match.</div>
        )}
      </div>
    </AppShell>
  );
}

function ClosureStat({ label, value, tone, onClick, active, muted }: {
  label: string; value: number; tone?: string; onClick?: () => void; active?: boolean; muted?: boolean;
}) {
  const Wrapper: any = onClick ? "button" : "div";
  return (
    <Wrapper onClick={onClick}
      className={`text-left rounded-xl border bg-surface px-3.5 py-3 transition-colors ${
        onClick ? "hover:bg-surface-2 cursor-pointer" : ""
      } ${active ? "border-ink/40 bg-surface-2" : "border-line"}`}>
      <div className="mono-label">{label}</div>
      <div className="hero-num mt-1.5" style={{ fontSize: 22, color: muted ? "var(--muted)" : tone ?? "var(--ink)" }}>
        {value}
      </div>
    </Wrapper>
  );
}

function SignalCard({ signal }: { signal: FlatSignal }) {
  const router = useRouter();
  const closure = useClosure();
  const closureId = `signal:${signal.accountSlug}:${signal.id}`;
  const status = closure.status(closureId);
  const record = closure.get(closureId);
  const tone = TONE[signal.tone];

  // Aggregate evidence kinds → source chips for evidence rail
  const sources = new Set<string>();
  signal.evidence.forEach((e) => {
    if (e.kind === "linkedin")        sources.add("LinkedIn");
    else if (e.kind === "call")       sources.add("Gong");
    else if (e.kind === "transcript") sources.add("Gong");
    else if (e.kind === "email")      sources.add("Google Workspace");
    else if (e.kind === "internal")   sources.add("Snowflake");
  });

  const primarySource = primarySourceFor(signal);
  const play          = suggestedPlayFor(signal);

  const lastEvent = record?.events[record.events.length - 1];

  const onCardEnter = () => { if (status === "new") closure.see(closureId, ME); };

  const openAccount = () => router.push(`/accounts/${signal.accountSlug}`);
  const runPlay = () => closure.act(closureId, ME, `Ran play: ${play.label}`);

  return (
    <div onMouseEnter={onCardEnter}
      className="card card-lift p-4 transition-colors flex flex-col gap-3 group">
      {/* Header */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={openAccount} className="flex items-center gap-1.5 hover:underline">
          <Logo name={signal.account} size={20} rounded={5} />
          <span className="text-[12.5px] font-semibold text-ink">{signal.account}</span>
        </button>
        <ClosureBadge status={status} size="xs" />
        <span className="inline-flex items-center text-[9.5px] font-mono uppercase tracking-[0.06em] px-1.5 py-0.5 rounded ml-auto"
          style={{ background: tone.bg, color: tone.ink }}>
          {signal.category}
        </span>
      </div>

      {/* Body */}
      <div className="text-[13px] text-ink-2 leading-relaxed">{signal.body}</div>

      {/* Source attribution + suggested play */}
      <div className="rounded-xl bg-surface-2 border border-line px-3 py-2.5 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={11} strokeWidth={1.8} style={{ color: "var(--accent-deep)" }} />
            <span className="text-[10.5px] mono-label" style={{ color: "var(--accent-ink)" }}>Suggested play</span>
          </div>
          <div className="text-[12.5px] font-semibold text-ink leading-snug">{play.label}</div>
          <div className="text-[10.5px] text-muted-2 mt-0.5">From <span className="text-ink-2 font-medium">{primarySource}</span> · {sources.size} source{sources.size === 1 ? "" : "s"}</div>
        </div>
        {status !== "acted" && status !== "resolved" && status !== "dismissed" && (
          <button onClick={runPlay}
            className="text-[11px] font-semibold h-7 px-2.5 rounded-md inline-flex items-center gap-1 shrink-0 shadow-[0_4px_10px_-4px_rgba(168,224,32,0.4)]"
            style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
            {play.cta}<ArrowRight size={11} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Evidence rail */}
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[10px] text-muted-2">Evidence chain · from</span>
          {Array.from(sources).map((s) => (
            <SourceChip key={s} source={s as any} size="xs" />
          ))}
        </div>
        <div className="space-y-1">
          {signal.evidence.map((e, i) => {
            const Icon = e.kind === "email" ? Mail : e.kind === "call" ? Phone : e.kind === "linkedin" ? Globe2 : e.kind === "transcript" ? Video : FileText;
            return (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <Icon size={10} strokeWidth={1.6} className="text-muted-2" />
                <span className="text-ink-2 truncate flex-1">{e.title}</span>
                <span className="text-muted-2">{e.meta}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Closure footer */}
      <div className="flex items-center justify-between text-[10.5px] text-muted-2 pt-2 border-t border-line">
        <span>
          {signal.ago}
          {lastEvent && status !== "new" && (
            <>
              <span className="text-muted-2"> · </span>
              <span><span className="text-ink-2 font-medium">{lastEvent.by}</span> {labelFor(lastEvent.type)}</span>
            </>
          )}
        </span>
        <div className="flex items-center gap-1">
          {status === "new" && (
            <button onClick={() => closure.see(closureId, ME)}
              className="text-[10.5px] text-muted hover:text-ink h-6 px-2 rounded inline-flex items-center gap-1 hover:bg-bg-deep">
              <Eye size={10} /> Mark seen
            </button>
          )}
          {(status === "acted") && (
            <button onClick={() => closure.resolve(closureId, ME)}
              className="text-[10.5px] text-muted hover:text-ink h-6 px-2 rounded inline-flex items-center gap-1 hover:bg-bg-deep">
              <CheckCircle2 size={10} /> Resolve
            </button>
          )}
          <Popover align="right" width={200}
            trigger={(_, t) => (
              <button onClick={t} className="text-muted-2 hover:text-ink h-6 w-6 rounded grid place-items-center hover:bg-bg-deep">
                ⋯
              </button>
            )}>
            {(close) => (
              <>
                <MenuLabel>Closure</MenuLabel>
                {status === "new" && <MenuItem onClick={() => { closure.see(closureId, ME); close(); }}>Mark seen</MenuItem>}
                {status !== "acted" && status !== "resolved" && <MenuItem onClick={() => { closure.act(closureId, ME, `Ran play: ${play.label}`); close(); }}>Mark acted</MenuItem>}
                {status !== "resolved" && <MenuItem onClick={() => { closure.resolve(closureId, ME); close(); }}>Resolve</MenuItem>}
                <MenuSeparator />
                <MenuItem onClick={() => { closure.dismiss(closureId, ME, "Not relevant"); close(); }} danger>
                  <span className="inline-flex items-center gap-1"><X size={10} /> Dismiss</span>
                </MenuItem>
                <MenuSeparator />
                <MenuItem onClick={openAccount}>
                  <span className="inline-flex items-center gap-1"><ArrowRight size={10} /> Open account</span>
                </MenuItem>
              </>
            )}
          </Popover>
        </div>
      </div>
    </div>
  );
}

function labelFor(t: string): string {
  if (t === "seen")       return "saw";
  if (t === "acted")      return "acted";
  if (t === "resolved")   return "resolved";
  if (t === "dismissed")  return "dismissed";
  if (t === "snoozed")    return "snoozed";
  if (t === "commented")  return "commented";
  if (t === "assigned")   return "assigned";
  return t;
}
