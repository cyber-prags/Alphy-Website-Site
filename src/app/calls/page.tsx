"use client";

import { useMemo, useState } from "react";
import { Search, Filter, Phone, PhoneIncoming, PhoneOutgoing, ArrowUpDown, Play } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useToast } from "@/components/Toast";
import { calls, fmtDate, type Call } from "@/lib/mock";

const fmtDuration = (s: number) => {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r.toString().padStart(2, "0")}s`;
};

const SENTIMENT: Record<Call["sentiment"], { bg: string; ink: string; label: string }> = {
  positive: { bg: "var(--pos-soft)",  ink: "var(--pos)",  label: "Positive" },
  neutral:  { bg: "var(--bg-deep)",   ink: "var(--muted)",label: "Neutral"  },
  negative: { bg: "var(--neg-soft)",  ink: "var(--neg)",  label: "Negative" },
};

const OUTCOME: Record<Call["outcome"], { bg: string; ink: string }> = {
  Connected:    { bg: "var(--pos-soft)",  ink: "var(--pos)"  },
  Voicemail:    { bg: "var(--warn-soft)", ink: "var(--warn)" },
  "No answer":  { bg: "var(--bg-deep)",   ink: "var(--muted)"},
};

export default function CallsPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState<"newest" | "oldest">("newest");

  const filtered = useMemo(() => {
    const lc = search.trim().toLowerCase();
    if (!lc) return calls;
    return calls.filter((c) => `${c.contact} ${c.account} ${c.topic} ${c.rep}`.toLowerCase().includes(lc));
  }, [search]);

  const totalSec = filtered.reduce((s, c) => s + c.duration, 0);

  return (
    <AppShell>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <div className="mono-label mb-1.5">Activities · Calls</div>
          <h1 className="display" style={{ fontSize: 22 }}>Calls</h1>
        </div>
        <div className="flex items-center gap-2 text-[11.5px] text-muted">
          <span><span className="text-ink font-semibold tnum">{filtered.length}</span> calls</span>
          <span className="text-muted-2">·</span>
          <span><span className="text-ink font-semibold tnum">{fmtDuration(totalSec)}</span> total</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <button className="pill-nav-item active inline-flex items-center gap-1.5">
          My calls <span className="text-[10px] font-mono tnum px-1.5 rounded bg-bg-deep text-muted">{filtered.length}</span>
        </button>
        <button className="pill-nav-item">Team calls</button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 max-w-sm flex items-center gap-2 h-8 px-2.5 rounded-md border border-line bg-surface">
          <Search size={12} strokeWidth={1.6} className="text-muted-2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search calls…"
                 className="flex-1 bg-transparent outline-none text-[12px] placeholder:text-muted-2" />
        </div>
        <button onClick={() => { setSortDir(s => s === "newest" ? "oldest" : "newest"); toast({ tone: "info", title: `Sorted by ${sortDir === "newest" ? "oldest" : "newest"} first` }); }}
          className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-line bg-surface text-[11.5px] font-medium text-ink-2 hover:bg-bg-deep">
          <ArrowUpDown size={11} className="text-muted" /> {sortDir === "newest" ? "Newest" : "Oldest"}
        </button>
        <button onClick={() => toast({ tone: "info", title: "Filters", body: "Filter by sentiment, topic, and outcome — coming soon" })}
          className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-line bg-surface text-[11.5px] font-medium text-ink-2 hover:bg-bg-deep">
          <Filter size={11} className="text-muted" /> Filter
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-deep border-b border-line">
              {["", "Contact / Account", "Topic", "Outcome", "Sentiment", "Duration", "Rep", "When"].map((h, i) => (
                <th key={i} className="text-left px-3 py-2 text-[10.5px] font-semibold text-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const oc = OUTCOME[c.outcome];
              const se = SENTIMENT[c.sentiment];
              const PhoneIcon = c.direction === "inbound" ? PhoneIncoming : PhoneOutgoing;
              return (
                <tr key={c.id} className="border-b border-line hover:bg-surface-2 cursor-pointer">
                  <td className="px-3 py-2.5 w-8">
                    <div className="w-6 h-6 rounded-md bg-bg-deep grid place-items-center" title={c.direction}>
                      <PhoneIcon size={11} strokeWidth={1.6} className="text-muted" />
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="text-[12.5px] font-semibold text-ink">{c.contact}</div>
                    <div className="text-[10.5px] text-muted">{c.account}</div>
                  </td>
                  <td className="px-3 py-2.5 text-[12px] text-ink-2 max-w-[280px]">{c.topic}</td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center h-5 px-1.5 rounded text-[10.5px] font-medium" style={{ background: oc.bg, color: oc.ink }}>
                      {c.outcome}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center h-5 px-1.5 rounded text-[10.5px] font-medium" style={{ background: se.bg, color: se.ink }}>
                      {se.label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[12px] text-ink-2 tnum">{fmtDuration(c.duration)}</td>
                  <td className="px-3 py-2.5">
                    <div className="inline-flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-ink text-white grid place-items-center text-[9px] font-semibold">{c.repInitials}</div>
                      <span className="text-[12px] text-ink-2">{c.rep}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-[11.5px] text-muted tnum">
                    <div>{fmtDate(c.date)}</div>
                    <div className="text-[10.5px] text-muted-2">{c.time}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
