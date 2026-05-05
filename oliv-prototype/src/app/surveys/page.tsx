"use client";

import { useState } from "react";
import { BarChart3, TrendingUp, Users2, ThumbsUp, ThumbsDown, Send } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { surveys, type Survey } from "@/lib/mock";
import { useToast } from "@/components/Toast";
import { Modal, ModalButton, FormField, SelectInput } from "@/components/Modal";

const STATUS_STYLE: Record<Survey["status"], { bg: string; ink: string }> = {
  active: { bg: "var(--pos-soft)", ink: "var(--pos)" },
  closed: { bg: "var(--bg-deep)", ink: "var(--muted)" },
  draft:  { bg: "var(--warn-soft)", ink: "var(--warn)" },
};

export default function SurveysPage() {
  const toast = useToast();
  const [sendOpen, setSendOpen] = useState(false);

  const allResponses = surveys.flatMap((s) => s.responses);
  const npsScores = allResponses.filter((r) => {
    const survey = surveys.find((s) => s.responses.includes(r));
    return survey?.kind === "nps";
  });
  const promoters = npsScores.filter((r) => r.score >= 9).length;
  const detractors = npsScores.filter((r) => r.score <= 6).length;
  const npsScore = npsScores.length > 0 ? Math.round(((promoters - detractors) / npsScores.length) * 100) : 0;
  const responseRate = surveys.filter((s) => s.sentCount > 0).reduce((sum, s) => sum + s.responseCount, 0) /
    Math.max(1, surveys.filter((s) => s.sentCount > 0).reduce((sum, s) => sum + s.sentCount, 0)) * 100;

  return (
    <AppShell>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <div className="mono-label mb-1.5">Surveys</div>
          <h1 className="display" style={{ fontSize: 22 }}>NPS & Satisfaction</h1>
        </div>
        <button onClick={() => setSendOpen(true)}
          className="h-8 px-4 rounded-lg text-[12px] font-semibold inline-flex items-center gap-1.5"
          style={{ background: "var(--accent)", color: "var(--bg)" }}>
          <Send size={12} strokeWidth={2} /> Send Survey
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <KPICard label="NPS Score" value={`+${npsScore}`} icon={<BarChart3 size={14} />} color="var(--accent)" />
        <KPICard label="Response Rate" value={`${Math.round(responseRate)}%`} icon={<TrendingUp size={14} />} color="var(--pos)" />
        <KPICard label="Promoters" value={`${npsScores.length > 0 ? Math.round((promoters / npsScores.length) * 100) : 0}%`} icon={<ThumbsUp size={14} />} color="var(--pos)" />
        <KPICard label="Detractors" value={`${npsScores.length > 0 ? Math.round((detractors / npsScores.length) * 100) : 0}%`} icon={<ThumbsDown size={14} />} color="var(--neg)" />
      </div>

      {/* NPS Heatmap */}
      <div className="card p-5 mb-5">
        <div className="mono-label mb-4">NPS by Account</div>
        <div className="space-y-2">
          {Array.from(new Set(npsScores.map((r) => r.accountName))).map((acct) => {
            const scores = npsScores.filter((r) => r.accountName === acct);
            return (
              <div key={acct} className="flex items-center gap-3">
                <span className="text-[12px] text-ink w-28 shrink-0 font-medium">{acct}</span>
                <div className="flex gap-1.5">
                  {scores.map((r) => (
                    <span
                      key={r.id}
                      className="w-8 h-8 rounded-lg grid place-items-center text-[11px] font-bold text-white"
                      style={{
                        background: r.score >= 9 ? "var(--pos)" : r.score >= 7 ? "var(--warn)" : "var(--neg)",
                      }}
                      title={`${r.respondent}: ${r.score}`}
                    >
                      {r.score}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Survey list */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-deep border-b border-line">
              {["Survey", "Type", "Status", "Sent", "Responses", "Created"].map((h) => (
                <th key={h} className="text-left px-3 py-2 text-[10.5px] font-semibold text-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {surveys.map((s) => {
              const st = STATUS_STYLE[s.status];
              return (
                <tr key={s.id} className="border-b border-line hover:bg-surface-2">
                  <td className="px-3 py-2.5 text-[12.5px] font-semibold text-ink">{s.title}</td>
                  <td className="px-3 py-2.5 text-[12px] text-ink-2 uppercase">{s.kind}</td>
                  <td className="px-3 py-2.5">
                    <span className="text-[10.5px] font-medium px-2 py-0.5 rounded" style={{ background: st.bg, color: st.ink }}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[12px] font-mono tnum text-ink-2">{s.sentCount}</td>
                  <td className="px-3 py-2.5 text-[12px] font-mono tnum text-ink-2">{s.responseCount}</td>
                  <td className="px-3 py-2.5 text-[12px] text-muted">{s.createdAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <SendSurveyModal open={sendOpen} onClose={() => setSendOpen(false)} onSend={() => {
        setSendOpen(false);
        toast({ tone: "success", title: "Survey sent", body: "Recipients will receive the survey shortly." });
      }} />
    </AppShell>
  );
}

function KPICard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color }} className="opacity-70">{icon}</span>
        <span className="text-[10.5px] font-mono uppercase text-muted">{label}</span>
      </div>
      <div className="text-[24px] font-bold tnum text-ink">{value}</div>
    </div>
  );
}

function SendSurveyModal({ open, onClose, onSend }: { open: boolean; onClose: () => void; onSend: () => void }) {
  const [kind, setKind] = useState<"nps" | "csat" | "ces">("nps");
  return (
    <Modal open={open} onClose={onClose} title="Send Survey" description="Select template and audience" width={440}
      footer={<><ModalButton onClick={onClose}>Cancel</ModalButton><ModalButton primary onClick={onSend}>Send</ModalButton></>}>
      <FormField label="Survey Type">
        <SelectInput value={kind} onChange={(v) => setKind(v as "nps" | "csat" | "ces")}
          options={[{ value: "nps", label: "NPS" }, { value: "csat", label: "CSAT" }, { value: "ces", label: "CES" }]} />
      </FormField>
      <FormField label="Audience">
        <div className="space-y-1.5">
          {["Cloudflare", "Snowflake", "Akamai", "Tableau", "GitLab"].map((a) => (
            <label key={a} className="flex items-center gap-2 text-[12px] text-ink cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded" />{a}
            </label>
          ))}
        </div>
      </FormField>
    </Modal>
  );
}
