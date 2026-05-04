"use client";

import { useState, useMemo } from "react";
import { Search, Filter, Columns3, ArrowUpDown, FileText, Video, Clock, Calendar, X, Sparkles, Play, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { meetings, fmtDate, type Meeting } from "@/lib/mock";
import { useToast } from "@/components/Toast";

const PILL_COLORS: Record<string, { bg: string; ink: string }> = {
  Prospect:  { bg: "var(--info-soft)", ink: "var(--info)" },
  Customer:  { bg: "var(--pos-soft)",  ink: "var(--pos)"  },
  Candidate: { bg: "var(--warn-soft)", ink: "var(--warn)" },
  Colleague: { bg: "var(--bg-deep)",   ink: "var(--muted)"},
};

export default function MeetingsPage() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<Meeting | null>(null);
  const filtered = useMemo(() => {
    const lc = search.trim().toLowerCase();
    if (!lc) return meetings;
    return meetings.filter((m) => `${m.title} ${m.summary}`.toLowerCase().includes(lc));
  }, [search]);

  return (
    <AppShell>
      <div className="mb-5">
        <div className="mono-label mb-1.5">Activities</div>
        <h1 className="display" style={{ fontSize: 22 }}>Meetings</h1>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <button className="pill-nav-item active inline-flex items-center gap-1.5">
          My meetings <span className="text-[10px] font-mono tnum px-1.5 rounded bg-white/15">{filtered.length}</span>
        </button>
        <button className="pill-nav-item">Team meetings</button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 max-w-sm flex items-center gap-2 h-9 px-3 rounded-lg border border-line bg-surface">
          <Search size={13} strokeWidth={1.6} className="text-muted-2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search meetings…"
                 className="flex-1 bg-transparent outline-none text-[12.5px] placeholder:text-muted-2" />
        </div>
        <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-line bg-surface text-[12px] font-medium text-ink-2 hover:bg-surface-2">
          <Columns3 size={13} className="text-muted" /> Group: None
        </button>
        <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-line bg-surface text-[12px] font-medium text-ink-2 hover:bg-surface-2">
          <ArrowUpDown size={13} className="text-muted" /> Sort
        </button>
        <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-line bg-surface text-[12px] font-medium text-ink-2 hover:bg-surface-2">
          <Filter size={13} className="text-muted" /> Filter
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg-deep">
            <tr>
              {["Meeting", "Duration", "Meeting with", "Next Step", "AI Summary"].map((h, i) => (
                <th key={h} className={`text-left px-4 py-3 text-[11px] font-semibold text-muted uppercase tracking-wider ${
                  i === 0 ? "rounded-tl-2xl" : i === 4 ? "rounded-tr-2xl" : ""
                }`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => {
              const c = PILL_COLORS[m.with];
              return (
                <tr key={m.id} onClick={() => setOpen(m)} className="border-b border-line hover:bg-surface-2 transition-colors cursor-pointer">
                  <td className="px-4 py-3.5 max-w-[280px]">
                    <div className="flex items-center gap-2 mb-1">
                      <Video size={13} strokeWidth={1.6} className="text-muted" />
                      <span className="text-[13px] font-semibold text-ink truncate">{m.title}</span>
                    </div>
                    <div className="text-[11px] text-muted inline-flex items-center gap-2">
                      <Calendar size={10} strokeWidth={1.6} /> {fmtDate(m.date)}
                      <span>·</span>
                      <Clock size={10} strokeWidth={1.6} /> {m.time}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-2 tnum">
                      <Clock size={11} strokeWidth={1.6} className="text-muted" /> {m.duration} mins
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center h-6 px-2.5 rounded-full text-[11.5px] font-medium" style={{ background: c.bg, color: c.ink }}>
                      {m.with}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded grid place-items-center bg-bg-deep">
                        <FileText size={10} strokeWidth={1.6} className="text-muted" />
                      </span>
                      <span className="text-[12.5px] text-ink-2">{m.nextStep}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[12.5px] text-ink-2 max-w-[400px]">{m.summary}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <MeetingDetail meeting={open} onClose={() => setOpen(null)} />
    </AppShell>
  );
}

function MeetingDetail({ meeting, onClose }: { meeting: Meeting | null; onClose: () => void }) {
  const toast = useToast();
  if (!meeting) return null;
  return (
    <>
      <div className="fixed inset-0 bg-ink/30 z-[90] fade-in" onClick={onClose} />
      <aside className="fixed top-0 right-0 h-screen w-[520px] bg-bg z-[95] drawer-anim border-l border-line flex flex-col">
        <div className="px-4 h-12 border-b border-line flex items-center justify-between">
          <span className="text-[12.5px] font-semibold text-ink truncate">{meeting.title}</span>
          <button onClick={onClose} className="w-7 h-7 rounded-md grid place-items-center text-muted hover:text-ink hover:bg-bg-deep">
            <X size={13} strokeWidth={1.6} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar size={11} strokeWidth={1.6} className="text-muted" />
                <span className="text-[11.5px] text-muted">{fmtDate(meeting.date)} · {meeting.time} · {meeting.duration} mins</span>
              </div>
              <button onClick={() => toast({ tone: "info", title: "Playing recording (mock)" })}
                className="text-[11px] font-medium inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-line bg-surface hover:bg-bg-deep">
                <Play size={11} strokeWidth={1.8} /> Play recording
              </button>
            </div>
            <div className="recessed p-3">
              <div className="mono-label mb-1" style={{ color: "var(--accent)" }}>AI Summary</div>
              <div className="text-[12.5px] text-ink-2 leading-relaxed">{meeting.summary}</div>
            </div>
          </div>

          <div className="card p-4">
            <div className="mono-label mb-2">Next Step</div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-md bg-bg-deep">
              <div className="w-6 h-6 rounded grid place-items-center bg-surface">
                <FileText size={11} strokeWidth={1.6} className="text-muted" />
              </div>
              <span className="text-[12.5px] text-ink-2 flex-1">{meeting.nextStep}</span>
              <button onClick={() => toast({ tone: "success", title: "Task created", body: meeting.nextStep })}
                className="text-[11px] font-medium inline-flex items-center gap-1 h-7 px-2.5 rounded-md bg-ink text-white">
                <Sparkles size={10} strokeWidth={1.8} /> Add to plan
              </button>
            </div>
          </div>

          <div className="card p-4">
            <div className="mono-label mb-2">Key moments</div>
            {[
              { t: "00:02:14", body: "Champion confirmed Q1 budget exists." },
              { t: "00:08:42", body: "Objection: integration timeline must be < 30 days." },
              { t: "00:18:21", body: "Agreed to add Pam Beasley to next call." },
            ].map((k, i) => (
              <button key={i} onClick={() => toast({ tone: "info", title: `Jumped to ${k.t}` })}
                className="flex items-start gap-2 w-full text-left p-2 rounded-md hover:bg-bg-deep">
                <span className="text-[10.5px] font-mono tnum text-muted mt-0.5">{k.t}</span>
                <span className="text-[12px] text-ink-2 flex-1">{k.body}</span>
              </button>
            ))}
          </div>

          <a href="/deals" className="text-[12px] text-ink-2 hover:text-ink inline-flex items-center gap-1">
            Open linked deal <ArrowRight size={12} />
          </a>
        </div>
      </aside>
    </>
  );
}
