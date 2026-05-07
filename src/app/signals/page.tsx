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

const ACCENT = "#266DF0";

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
          The events that move expansion. Each signal has the evidence behind it and the next move you should make.
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

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-1 p-1 rounded-lg"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          <button onClick={() => setFilter("all")}
            className="text-[11.5px] font-medium px-2.5 py-1.5 rounded transition-colors"
            style={{
              background: filter === "all" ? "var(--ink)" : "transparent",
              color: filter === "all" ? "white" : "var(--muted)",
            }}>
            All
          </button>
          {categories.map((c) => (
            <button key={c} onClick={() => setFilter(c)}
              className="text-[11.5px] font-medium px-2.5 py-1.5 rounded transition-colors"
              style={{
                background: filter === c ? "var(--ink)" : "transparent",
                color: filter === c ? "white" : "var(--muted)",
              }}>
              {c}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1.5 h-9 w-72 px-2.5 rounded-lg"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          <Search size={12} strokeWidth={1.8} className="text-muted-2" />
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

  // Tone colour for the left rail accent — picks up the signal severity
  const railColor = signal.tone === "neg"  ? "var(--neg)"
                  : signal.tone === "warn" ? "var(--warn)"
                  : signal.tone === "pos"  ? "var(--pos)"
                  : "var(--info)";

  const isClosed = status === "acted" || status === "resolved" || status === "dismissed";

  return (
    <div
      onMouseEnter={onCardEnter}
      className="rounded-xl overflow-hidden transition-all hover:-translate-y-px hover:shadow-md group relative"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
      }}
    >
      {/* Tone-tinted left rail */}
      <span className="absolute left-0 top-0 bottom-0 w-[3px] transition-opacity"
        style={{ background: railColor, opacity: status === "new" ? 1 : 0.5 }} />

      <div className="p-5 pl-6 flex flex-col gap-3.5">
        {/* Header — account + status + category */}
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={openAccount}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <Logo name={signal.account} size={20} rounded={5} />
            <span className="text-[12.5px] font-semibold text-ink"
              style={{ letterSpacing: "-0.005em" }}>
              {signal.account}
            </span>
          </button>
          <ClosureBadge status={status} size="xs" />
          <span className="inline-flex items-center text-[9.5px] font-semibold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded ml-auto"
            style={{ background: tone.bg, color: tone.ink }}>
            {signal.category}
          </span>
        </div>

        {/* Body — the signal copy */}
        <div className="text-[13.5px] text-ink leading-[1.55]"
          style={{ letterSpacing: "-0.005em" }}>
          {signal.body}
        </div>

        {/* Suggested play card — accent treatment */}
        <div className="rounded-xl px-4 py-3.5 flex items-center gap-3"
          style={{
            background: "linear-gradient(135deg, rgba(38,109,240,0.04), rgba(124,58,237,0.02))",
            border: "1px solid rgba(38,109,240,0.18)",
          }}>
          <div className="w-7 h-7 rounded-md grid place-items-center shrink-0"
            style={{
              background: ACCENT,
              boxShadow: "0 4px 10px -4px rgba(38,109,240,0.4)",
            }}>
            <Zap size={12} strokeWidth={2.2} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] mb-0.5"
              style={{ color: ACCENT }}>
              Suggested play
            </div>
            <div className="text-[12.5px] font-semibold text-ink leading-snug truncate">
              {play.label}
            </div>
          </div>
          {!isClosed && (
            <button onClick={runPlay}
              className="text-[11px] font-semibold h-8 px-3 rounded-lg inline-flex items-center gap-1.5 shrink-0 transition-transform hover:scale-[1.03] text-white"
              style={{
                background: "var(--ink)",
                boxShadow: "0 4px 10px -4px rgba(15,18,24,0.30)",
              }}>
              {play.cta}<ArrowRight size={11} strokeWidth={2.2} />
            </button>
          )}
        </div>

        {/* Evidence rail */}
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-2">
              Evidence · from
            </span>
            {Array.from(sources).map((s) => (
              <SourceChip key={s} source={s as any} size="xs" />
            ))}
          </div>
          <div className="rounded-lg overflow-hidden"
            style={{ background: "var(--bg-deep)", border: "1px solid var(--line)" }}>
            {signal.evidence.map((e, i) => {
              const Icon = e.kind === "email" ? Mail : e.kind === "call" ? Phone
                         : e.kind === "linkedin" ? Globe2 : e.kind === "transcript" ? Video
                         : FileText;
              return (
                <div key={i}
                  className="flex items-center gap-2.5 px-3 py-2 text-[11px]"
                  style={{ borderTop: i === 0 ? "none" : "1px solid var(--line)" }}>
                  <Icon size={11} strokeWidth={1.6} className="text-muted-2 shrink-0" />
                  <span className="text-ink-2 truncate flex-1">{e.title}</span>
                  <span className="text-muted-2 font-mono tnum text-[10px] shrink-0">{e.meta}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Closure footer */}
        <div className="flex items-center justify-between text-[10.5px] pt-2.5"
          style={{ borderTop: "1px solid var(--line)", color: "var(--muted-2)" }}>
          <span>
            {signal.ago}
            {lastEvent && status !== "new" && (
              <>
                <span className="mx-1.5">·</span>
                <span>
                  <span className="text-ink-2 font-medium">{lastEvent.by}</span>{" "}
                  {labelFor(lastEvent.type)}
                </span>
              </>
            )}
          </span>
          <div className="flex items-center gap-1">
            {status === "new" && (
              <button onClick={() => closure.see(closureId, ME)}
                className="text-[10.5px] text-muted hover:text-ink h-6 px-2 rounded inline-flex items-center gap-1 hover:bg-bg-deep transition-colors">
                <Eye size={10} /> Mark seen
              </button>
            )}
            {status === "acted" && (
              <button onClick={() => closure.resolve(closureId, ME)}
                className="text-[10.5px] font-medium h-6 px-2 rounded inline-flex items-center gap-1 transition-colors"
                style={{ color: "var(--pos)", background: "var(--pos-soft)" }}>
                <CheckCircle2 size={10} /> Resolve
              </button>
            )}
            <Popover align="right" width={200}
              trigger={(_, t) => (
                <button onClick={t}
                  className="text-muted-2 hover:text-ink h-6 w-6 rounded grid place-items-center hover:bg-bg-deep transition-colors">
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
