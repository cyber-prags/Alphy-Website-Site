"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Calendar, Users2, Lock, Play, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { reports as initialReports, fmtDate, type SavedReport } from "@/lib/mock";
import { useToast } from "@/components/Toast";
import { Popover, MenuItem } from "@/components/Popover";
import { Modal, ModalButton, FormField, TextInput, SelectInput } from "@/components/Modal";

const TYPE_COLOR: Record<SavedReport["type"], { bg: string; ink: string }> = {
  Forecast: { bg: "var(--info-soft)", ink: "var(--info)"  },
  Pipeline: { bg: "var(--accent-soft)", ink: "var(--accent)" },
  Coaching: { bg: "var(--warn-soft)", ink: "var(--warn)"  },
  Risk:     { bg: "var(--neg-soft)",  ink: "var(--neg)"   },
  Custom:   { bg: "var(--bg-deep)",   ink: "var(--muted)" },
};

const SCHEDULE_COLOR: Record<SavedReport["schedule"], string> = {
  Manual:  "var(--muted)",
  Daily:   "var(--accent)",
  Weekly:  "var(--info)",
  Monthly: "var(--muted-2)",
};

export default function ReportsPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | SavedReport["type"]>("all");
  const [reports, setReports] = useState<SavedReport[]>(initialReports);
  const [newOpen, setNewOpen] = useState(false);

  const filtered = useMemo(() => {
    const lc = search.trim().toLowerCase();
    return reports
      .filter((r) => type === "all" || r.type === type)
      .filter((r) => !lc || r.title.toLowerCase().includes(lc));
  }, [search, type, reports]);

  return (
    <AppShell>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <div className="mono-label mb-1.5">Analyst · Reports</div>
          <h1 className="display" style={{ fontSize: 22 }}>Saved reports</h1>
          <div className="text-[12.5px] text-muted mt-1">Run on demand or on a schedule.</div>
        </div>
        <Link href="/analyst/reports/builder"
          className="text-[12px] font-medium h-8 px-3 rounded-md bg-ink text-white inline-flex items-center gap-1.5 hover:bg-ink-2">
          <Plus size={12} strokeWidth={2} /> New report
        </Link>
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {(["all", "Forecast", "Pipeline", "Coaching", "Risk", "Custom"] as const).map((t) => (
          <button key={t} onClick={() => setType(t)}
            className={`pill-nav-item ${type === t ? "active" : ""}`}>
            {t === "all" ? "All" : t}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 h-8 w-72 px-2.5 rounded-md border border-line bg-surface">
          <Search size={12} strokeWidth={1.6} className="text-muted-2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reports…"
                 className="flex-1 bg-transparent outline-none text-[12px] placeholder:text-muted-2" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-deep border-b border-line">
              {["Report", "Type", "Owner", "Schedule", "Last Run", "Sharing", ""].map((h, i) => (
                <th key={i} className="text-left px-3 py-2 text-[10.5px] font-semibold text-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const tc = TYPE_COLOR[r.type];
              return (
                <tr key={r.id} className="border-b border-line hover:bg-surface-2">
                  <td className="px-3 py-2.5 text-[12.5px] font-semibold text-ink">{r.title}</td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center h-5 px-1.5 rounded text-[10.5px] font-medium" style={{ background: tc.bg, color: tc.ink }}>
                      {r.type}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[12px] text-ink-2">{r.owner}</td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: SCHEDULE_COLOR[r.schedule] }} />
                      {r.schedule}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[12px] text-muted tnum">{fmtDate(r.lastRun)}</td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1 text-[11.5px] text-muted">
                      {r.shared ? <><Users2 size={11} strokeWidth={1.6} /> Team</> : <><Lock size={11} strokeWidth={1.6} /> Private</>}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 w-24">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => toast({ tone: "success", title: `Running "${r.title}"`, body: "Report will appear in your inbox shortly." })}
                        className="text-[11px] font-medium h-7 px-2 rounded-md border border-line bg-surface hover:bg-bg-deep inline-flex items-center gap-1">
                        <Play size={10} strokeWidth={1.8} /> Run
                      </button>
                      <Popover
                        align="right" width={160}
                        trigger={(_, t) => (
                          <button onClick={t} className="w-7 h-7 rounded-md grid place-items-center text-muted hover:text-ink hover:bg-bg-deep">
                            <MoreHorizontal size={13} strokeWidth={1.6} />
                          </button>
                        )}
                      >
                        {(close) => (
                          <>
                            <MenuItem onClick={() => { toast({ tone: "info", title: "Edit report" }); close(); }}>Edit</MenuItem>
                            <MenuItem onClick={() => { toast({ tone: "info", title: "Duplicate report" }); close(); }}>Duplicate</MenuItem>
                            <MenuItem onClick={() => { toast({ tone: "info", title: "Schedule changed" }); close(); }}>
                              <span className="inline-flex items-center gap-2"><Calendar size={11} className="text-muted" />Schedule</span>
                            </MenuItem>
                            <MenuItem danger onClick={() => { toast({ tone: "info", title: "Report deleted" }); close(); }}>Delete</MenuItem>
                          </>
                        )}
                      </Popover>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <NewReportModal open={newOpen} onClose={() => setNewOpen(false)}
        onCreate={(r) => { setReports((s) => [r, ...s]); toast({ tone: "success", title: "Report created", body: r.title }); setNewOpen(false); }} />
    </AppShell>
  );
}

function NewReportModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (r: SavedReport) => void }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<SavedReport["type"]>("Pipeline");
  const [schedule, setSchedule] = useState<SavedReport["schedule"]>("Manual");
  const [shared, setShared] = useState(false);
  const [owner, setOwner] = useState("Walid Qayoumi");
  const reset = () => setTitle("");
  const submit = () => {
    if (!title.trim()) return;
    onCreate({
      id: `r${Math.floor(Math.random() * 100000)}`,
      title: title.trim(), type, owner, schedule, shared,
      lastRun: new Date().toISOString().slice(0, 10),
    });
    reset();
  };
  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }}
      title="Create new report" description="A saved query that runs on demand or on a schedule."
      width={520}
      footer={
        <>
          <ModalButton onClick={() => { reset(); onClose(); }}>Cancel</ModalButton>
          <ModalButton primary onClick={submit} disabled={!title.trim()}>Create report</ModalButton>
        </>
      }>
      <FormField label="Title">
        <TextInput value={title} onChange={setTitle} placeholder="At-risk renewals · Q3" />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Type">
          <SelectInput<SavedReport["type"]> value={type} onChange={setType}
            options={[
              { value: "Forecast", label: "Forecast" },
              { value: "Pipeline", label: "Pipeline" },
              { value: "Coaching", label: "Coaching" },
              { value: "Risk",     label: "Risk" },
              { value: "Custom",   label: "Custom" },
            ]} />
        </FormField>
        <FormField label="Schedule">
          <SelectInput<SavedReport["schedule"]> value={schedule} onChange={setSchedule}
            options={[
              { value: "Manual",  label: "Manual" },
              { value: "Daily",   label: "Daily" },
              { value: "Weekly",  label: "Weekly" },
              { value: "Monthly", label: "Monthly" },
            ]} />
        </FormField>
        <FormField label="Owner">
          <SelectInput value={owner} onChange={setOwner}
            options={["Walid Qayoumi", "Adriana Smith"].map((o) => ({ value: o, label: o }))} />
        </FormField>
        <FormField label="Sharing">
          <SelectInput<"private" | "team"> value={shared ? "team" : "private"}
            onChange={(v) => setShared(v === "team")}
            options={[{ value: "private", label: "Private" }, { value: "team", label: "Team" }]} />
        </FormField>
      </div>
    </Modal>
  );
}
