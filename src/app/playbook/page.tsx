"use client";

import { useState } from "react";
import {
  BookOpen, Target, Award, Building2, Ruler, Film, Workflow, Plus, Lock, Unlock,
  CheckCircle2, ArrowRight, Database, Pencil, RefreshCw, Users, GripVertical,
  ChevronDown, ChevronRight, Star, Play, Clock, Tag, Search, Filter,
  Globe, Briefcase, Heart, Zap, BarChart3, TrendingUp, AlertTriangle,
  MessageSquare, ThumbsUp, ThumbsDown, Pause, Eye, Copy, Share2,
  Mic, Phone, Video, Calendar, Shield, UserCheck, DollarSign, Layers,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { stageConfig, csStageConfig, accounts, team, type Pipeline, type StageConfig, type ForecastCategory } from "@/lib/mock";
import { Modal, ModalButton, FormField, TextInput, SelectInput } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { Logo } from "@/components/Logo";

const SECTIONS = [
  { id: "process",  label: "Revenue Process",        desc: "Step-by-step process from first contact to closed deal.",        Icon: Workflow },
  { id: "qual",     label: "Qualification framework", desc: "Help reps prioritize high-potential deals and reduce wasted effort.", Icon: Target },
  { id: "coaching", label: "Coaching scorecard",     desc: "AI-powered scores highlight what's working and what's not.",     Icon: Award },
  { id: "targets",  label: "Targets",                 desc: "Set targets for your team.",                                     Icon: ArrowRight },
  { id: "company",  label: "Company Profile",         desc: "Centralized view of your company's core details for agents.",   Icon: Building2 },
  { id: "measure",  label: "Measurement",             desc: "Set measurements for your team.",                                Icon: Ruler },
  { id: "clips",    label: "Clip Library",            desc: "Browse and share curated moments from your sales calls.",        Icon: Film },
] as const;

type SectionId = typeof SECTIONS[number]["id"];

const PIPELINES: Pipeline[] = ["Enterprise sales", "Mid-Market sales", "Customer Success"];

export default function PlaybookPage() {
  const [section, setSection] = useState<SectionId>("process");

  return (
    <AppShell>
      <div className="mb-5">
        <div className="mono-label mb-1.5 inline-flex items-center gap-2"><BookOpen size={11} /> Playbook</div>
        <h1 className="display" style={{ fontSize: 22 }}>Configuration</h1>
        <div className="text-[12.5px] text-muted mt-1">Stage definitions, methodology, coaching rubrics, and brand assets — all in one place.</div>
      </div>

      <div className="grid grid-cols-[280px_1fr] gap-5">
        <nav className="card p-2 self-start">
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => setSection(s.id)}
              className={`w-full text-left flex items-start gap-2.5 px-3 py-2.5 rounded-lg ${
                section === s.id ? "bg-bg-deep" : "hover:bg-surface-2"
              }`}>
              <s.Icon size={15} strokeWidth={1.6} className="mt-0.5 text-muted" />
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-semibold text-ink">{s.label}</div>
                <div className="text-[11px] text-muted leading-snug">{s.desc}</div>
              </div>
            </button>
          ))}
        </nav>

        <div>
          {section === "process"  && <RevenueProcess />}
          {section === "qual"     && <QualificationFramework />}
          {section === "coaching" && <CoachingScorecard />}
          {section === "targets"  && <TargetsSection />}
          {section === "company"  && <CompanyProfile />}
          {section === "measure"  && <MeasurementSection />}
          {section === "clips"    && <ClipLibrary />}
        </div>
      </div>
    </AppShell>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   REVENUE PROCESS (existing, unchanged)
   ═══════════════════════════════════════════════════════════════════════ */

function RevenueProcess() {
  const toast = useToast();
  const [pipeline, setPipeline] = useState<Pipeline>("Enterprise sales");
  const [stages, setStages] = useState<StageConfig[]>(stageConfig);
  const [editing, setEditing] = useState<StageConfig | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [accountOverride, setAccountOverride] = useState<string>("_global");

  const saveStage = (next: StageConfig) => {
    setStages((s) => s.map((x) => x.name === next.name ? next : x));
    toast({ tone: "success", title: "Stage updated", body: `${next.name} saved.` });
    setEditing(null);
  };

  const customerAccounts = accounts.filter((a) => a.status === "Customer");

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex bg-bg-deep rounded-full p-0.5">
          {PIPELINES.map((p) => (
            <button key={p} onClick={() => setPipeline(p)}
              className={`text-[11.5px] font-medium px-3 h-7 rounded-full ${pipeline === p ? "bg-ink text-white" : "text-muted"}`}>
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {pipeline === "Customer Success" && (
            <div className="flex items-center gap-1.5 h-8 pl-1.5 pr-2.5 rounded-md border border-line bg-surface text-[11.5px]">
              <Users size={12} strokeWidth={1.6} className="text-muted" />
              <select value={accountOverride} onChange={(e) => setAccountOverride(e.target.value)}
                className="bg-transparent outline-none text-[11.5px] text-ink-2 cursor-pointer">
                <option value="_global">Global defaults</option>
                {customerAccounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}
          {pipeline !== "Customer Success" && (
            <button onClick={() => setImportOpen(true)}
              className="text-[11.5px] font-medium inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-ink text-white hover:bg-ink-2">
              <Database size={12} strokeWidth={1.8} /> Import from CRM
            </button>
          )}
        </div>
      </div>

      {pipeline === "Customer Success" ? (
        <CSLifecycle accountId={accountOverride} />
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-bg-deep border-b border-line">
                  {["Stage Name", "Description", "Type", "Probability", "Forecast Category", "Outcomes", "Entry", "Exit", ""].map((h, i) => (
                    <th key={i} className="text-left px-3 py-2 text-[10.5px] font-semibold text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stages.map((s) => (
                  <tr key={s.name} className="border-b border-line hover:bg-surface-2 group">
                    <td className="px-3 py-2.5 text-[12.5px] font-semibold text-ink">{s.name}</td>
                    <td className="px-3 py-2.5 text-[12px] text-ink-2 max-w-[320px]">{s.description}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-medium px-1.5 h-5 rounded"
                            style={{
                              background: s.type === "Open" ? "var(--bg-deep)" : s.type === "Closed/Won" ? "var(--pos-soft)" : "var(--neg-soft)",
                              color:      s.type === "Open" ? "var(--muted)"   : s.type === "Closed/Won" ? "var(--pos)"      : "var(--neg)",
                            }}>
                        {s.type === "Open" ? <Unlock size={9} /> : <Lock size={9} />}
                        {s.type}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[12px] text-ink-2 tnum">{s.probability}%</td>
                    <td className="px-3 py-2.5 text-[12px] text-ink-2">{s.forecastCategory}</td>
                    <td className="px-3 py-2.5"><Counter n={s.outcomes} /></td>
                    <td className="px-3 py-2.5"><Counter n={s.entryCriteria} /></td>
                    <td className="px-3 py-2.5"><Counter n={s.exitCriteria} /></td>
                    <td className="px-3 py-2.5 w-10 text-right">
                      <button onClick={() => setEditing(s)}
                        className="w-7 h-7 rounded grid place-items-center text-muted hover:text-ink hover:bg-bg-deep opacity-0 group-hover:opacity-100">
                        <Pencil size={12} strokeWidth={1.6} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <StageEditor stage={editing} onClose={() => setEditing(null)} onSave={saveStage} />
          <ImportWizard open={importOpen} onClose={() => setImportOpen(false)} onComplete={(crm) => {
            toast({ tone: "success", title: "Pipeline imported", body: `7 stages mapped from ${crm}.` });
            setImportOpen(false);
          }} />
        </>
      )}
    </div>
  );
}

function CSLifecycle({ accountId }: { accountId: string }) {
  const account = accountId !== "_global" ? accounts.find((a) => a.id === accountId) : null;

  const currentStage = account
    ? account.health === "high" ? "Value Realization"
    : account.health === "medium" ? "Adoption"
    : "Renewal Risk"
    : null;

  return (
    <div className="space-y-3">
      {account && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-line bg-surface-2">
          <Logo name={account.name} size={28} rounded={6} />
          <div>
            <div className="text-[13px] font-semibold text-ink">{account.name}</div>
            <div className="text-[11px] text-muted">{account.industry} · ARR ${(account.arr / 1000).toFixed(0)}K · Renewal in {account.renewalDays}d</div>
          </div>
          <div className="ml-auto">
            <span className="text-[10.5px] font-mono uppercase tracking-[0.06em] px-2 py-0.5 rounded"
              style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}>
              Currently: {currentStage}
            </span>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-deep border-b border-line">
              {["Stage", "Description", "Type", "Health Target", "Outcomes", "Exit Criteria", "Playbook Actions"].map((h) => (
                <th key={h} className="text-left px-3 py-2 text-[10.5px] font-semibold text-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {csStageConfig.map((s) => {
              const isCurrent = s.name === currentStage;
              return (
                <tr key={s.name}
                  className={`border-b border-line hover:bg-surface-2 ${isCurrent ? "bg-accent-soft" : ""}`}>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--accent-deep)]" />}
                      <span className="text-[12.5px] font-semibold text-ink">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-[12px] text-ink-2 max-w-[280px]">{s.description}</td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-medium px-1.5 h-5 rounded"
                      style={{
                        background: s.type === "Active" ? "var(--pos-soft)" : s.type === "At Risk" ? "var(--neg-soft)" : "var(--accent-soft)",
                        color:      s.type === "Active" ? "var(--pos)"      : s.type === "At Risk" ? "var(--neg)"      : "var(--accent-ink)",
                      }}>
                      {s.type === "Active" ? <RefreshCw size={9} /> : s.type === "At Risk" ? <Lock size={9} /> : <Unlock size={9} />}
                      {s.type}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[12px] text-ink-2 tnum">
                    {s.healthTarget > 0 ? `≥ ${s.healthTarget}` : "—"}
                  </td>
                  <td className="px-3 py-2.5"><Counter n={s.outcomes} /></td>
                  <td className="px-3 py-2.5"><Counter n={s.exitCriteria} /></td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {s.playbookActions.slice(0, 3).map((a) => (
                        <span key={a} className="text-[9.5px] px-1.5 py-0.5 rounded bg-bg-deep text-muted">{a}</span>
                      ))}
                      {s.playbookActions.length > 3 && (
                        <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-bg-deep text-muted-2">+{s.playbookActions.length - 3}</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {account && (
        <div className="text-[11px] text-muted-2 px-1">
          Playbook actions marked with ● are customized for {account.name}. To override a global default, hover any row and click Edit.
        </div>
      )}
    </div>
  );
}

function StageEditor({ stage, onClose, onSave }: { stage: StageConfig | null; onClose: () => void; onSave: (s: StageConfig) => void }) {
  const [draft, setDraft] = useState<StageConfig | null>(stage);
  if (stage && draft?.name !== stage.name) setDraft(stage);
  if (!stage || !draft) return null;
  return (
    <Modal open={!!stage} onClose={onClose} title={`Edit stage · ${stage.name}`} description="Stage definition is shared across this pipeline."
      width={560}
      footer={
        <>
          <ModalButton onClick={onClose}>Cancel</ModalButton>
          <ModalButton primary onClick={() => onSave(draft)}>Save changes</ModalButton>
        </>
      }
    >
      <FormField label="Description">
        <TextInput value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Probability" hint="0–100">
          <TextInput type="number" value={String(draft.probability)} onChange={(v) => setDraft({ ...draft, probability: Math.min(100, Math.max(0, parseInt(v) || 0)) })} />
        </FormField>
        <FormField label="Forecast Category">
          <SelectInput<ForecastCategory>
            value={draft.forecastCategory}
            onChange={(v) => setDraft({ ...draft, forecastCategory: v })}
            options={(["Pipeline", "Best Case", "Commit", "Won", "Lost", "Omitted"] as ForecastCategory[]).map((f) => ({ value: f, label: f }))}
          />
        </FormField>
        <FormField label="Outcomes count">
          <TextInput type="number" value={String(draft.outcomes)} onChange={(v) => setDraft({ ...draft, outcomes: parseInt(v) || 0 })} />
        </FormField>
        <FormField label="Entry criteria count">
          <TextInput type="number" value={String(draft.entryCriteria)} onChange={(v) => setDraft({ ...draft, entryCriteria: parseInt(v) || 0 })} />
        </FormField>
        <FormField label="Exit criteria count">
          <TextInput type="number" value={String(draft.exitCriteria)} onChange={(v) => setDraft({ ...draft, exitCriteria: parseInt(v) || 0 })} />
        </FormField>
      </div>
    </Modal>
  );
}

function ImportWizard({ open, onClose, onComplete }: { open: boolean; onClose: () => void; onComplete: (crm: string) => void }) {
  const [step, setStep] = useState(0);
  const [crm, setCrm] = useState<"Salesforce" | "HubSpot" | "Pipedrive">("Salesforce");
  const STEPS = ["Select CRM", "Authorize", "Map stages", "Confirm"];

  return (
    <Modal open={open} onClose={() => { onClose(); setStep(0); }}
      title="Import pipeline from CRM" description={`Step ${step + 1} of ${STEPS.length} · ${STEPS[step]}`} width={520}
      footer={
        <>
          {step > 0 && <ModalButton onClick={() => setStep(step - 1)}>Back</ModalButton>}
          <ModalButton primary onClick={() => {
            if (step === STEPS.length - 1) onComplete(crm);
            else setStep(step + 1);
          }}>{step === STEPS.length - 1 ? "Import" : "Next"}</ModalButton>
        </>
      }>
      {step === 0 && (
        <div className="space-y-2">
          {(["Salesforce", "HubSpot", "Pipedrive"] as const).map((c) => (
            <button key={c} onClick={() => setCrm(c)}
              className={`w-full flex items-center gap-3 p-3 rounded-md border ${crm === c ? "border-[color:var(--accent)] bg-accent-soft" : "border-line bg-surface hover:bg-bg-deep"}`}>
              <div className="w-8 h-8 rounded grid place-items-center bg-bg-deep">
                <Database size={14} strokeWidth={1.6} className="text-muted" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-[13px] font-semibold text-ink">{c}</div>
                <div className="text-[11.5px] text-muted">Read pipeline definitions, stages, and probability mappings.</div>
              </div>
              <span className="w-4 h-4 rounded-full grid place-items-center"
                style={{ background: crm === c ? "var(--accent)" : "transparent", border: crm === c ? "0" : "1px solid var(--line)" }}>
                {crm === c && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
            </button>
          ))}
        </div>
      )}
      {step === 1 && (
        <div className="text-[12.5px] text-ink-2 leading-relaxed">
          Alphard will redirect to {crm} to request <strong>read-only</strong> access to pipelines, stages, and field mappings.
          You can revoke access anytime.
        </div>
      )}
      {step === 2 && (
        <div>
          <div className="mono-label mb-2">Suggested mapping</div>
          <div className="rounded-md border border-line overflow-hidden">
            {[
              ["Qualification", "Qualification"],
              ["Discovery",     "Discovery"],
              ["Demo",          "Solutioning"],
              ["Proposal",      "Proposal Sent"],
              ["Negotiation",   "Negotiation"],
              ["Closed Won",    "Closed - Won"],
              ["Closed Lost",   "Closed - Lost"],
            ].map(([a, b]) => (
              <div key={a} className="flex items-center px-3 py-1.5 border-b border-line last:border-0 text-[12px]">
                <span className="text-ink font-medium flex-1">{a}</span>
                <ArrowRight size={11} className="text-muted-2 mx-2" />
                <span className="text-muted-2 flex-1">{b}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="text-[12.5px] text-ink-2 space-y-1.5">
          <div>Importing 7 stages from <strong>{crm}</strong> into <strong>Enterprise sales</strong>.</div>
          <div className="text-muted">Existing deals will keep their stage; nothing is overwritten without confirmation.</div>
        </div>
      )}
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   QUALIFICATION FRAMEWORK (MEDDPICC)
   ═══════════════════════════════════════════════════════════════════════ */

type MeddpiccDim = {
  key: string;
  label: string;
  weight: number;
  description: string;
  questions: string[];
  scoring: { label: string; range: string }[];
};

const MEDDPICC_DIMS: MeddpiccDim[] = [
  { key: "M", label: "Metrics", weight: 15, description: "Quantifiable measures of success the customer will use to evaluate ROI.",
    questions: ["What KPIs will improve?", "How do you measure success today?", "What does 'good' look like in 6 months?"],
    scoring: [{ label: "Identified", range: "1" }, { label: "Validated", range: "2" }, { label: "Agreed", range: "3" }] },
  { key: "E", label: "Economic Buyer", weight: 15, description: "The person with the authority and budget to make or approve the purchase decision.",
    questions: ["Who signs the contract?", "Who controls the budget?", "Have we met them directly?"],
    scoring: [{ label: "Identified", range: "1" }, { label: "Engaged", range: "2" }, { label: "Championing", range: "3" }] },
  { key: "D1", label: "Decision Criteria", weight: 10, description: "The formal and informal criteria the buyer uses to evaluate solutions.",
    questions: ["What are the must-have requirements?", "How are vendors scored?", "Is there a formal RFP/evaluation?"],
    scoring: [{ label: "Unknown", range: "0" }, { label: "Known", range: "1" }, { label: "Influenced", range: "2-3" }] },
  { key: "D2", label: "Decision Process", weight: 10, description: "The steps, timeline, and stakeholders involved in reaching a buying decision.",
    questions: ["What's the approval chain?", "Are there legal/procurement gates?", "When do they need to decide by?"],
    scoring: [{ label: "Unclear", range: "0" }, { label: "Mapped", range: "1" }, { label: "Confirmed", range: "2-3" }] },
  { key: "P1", label: "Paper Process", weight: 10, description: "The procurement, legal, and administrative steps required to execute the deal.",
    questions: ["What's the standard contracting timeline?", "Is there a security review?", "Who signs off on MSA vs SOW?"],
    scoring: [{ label: "Unknown", range: "0" }, { label: "Mapped", range: "1" }, { label: "In-flight", range: "2-3" }] },
  { key: "I", label: "Identified Pain", weight: 15, description: "A critical business problem the customer needs to solve — ideally tied to a strategic initiative.",
    questions: ["What happens if they do nothing?", "What's the cost of the status quo?", "Is there a triggering event?"],
    scoring: [{ label: "Assumed", range: "0" }, { label: "Acknowledged", range: "1" }, { label: "Quantified", range: "2-3" }] },
  { key: "C", label: "Champion", weight: 15, description: "An internal advocate who has influence, credibility, and a vested interest in your solution winning.",
    questions: ["Who benefits most from our solution?", "Can they sell internally?", "Have they shared internal docs/intel?"],
    scoring: [{ label: "Identified", range: "1" }, { label: "Active", range: "2" }, { label: "Mobilized", range: "3" }] },
  { key: "C2", label: "Competition", weight: 10, description: "Other solutions (including do-nothing) the buyer is evaluating or could default to.",
    questions: ["Who else is in the eval?", "What's the incumbent?", "What's our win theme vs each?"],
    scoring: [{ label: "Unknown", range: "0" }, { label: "Known", range: "1" }, { label: "Differentiated", range: "2-3" }] },
];

function QualificationFramework() {
  const toast = useToast();
  const [expanded, setExpanded] = useState<string | null>("M");
  const [dims, setDims] = useState(MEDDPICC_DIMS);

  const totalWeight = dims.reduce((s, d) => s + d.weight, 0);

  const updateWeight = (key: string, delta: number) => {
    setDims(prev => prev.map(d => d.key === key ? { ...d, weight: Math.max(5, Math.min(30, d.weight + delta)) } : d));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[13px] font-semibold text-ink">MEDDPICC Qualification</div>
          <div className="text-[11.5px] text-muted">8 dimensions scored across every deal. Agents auto-fill from calls, emails, and CRM.</div>
        </div>
        <button onClick={() => toast({ tone: "success", title: "Framework saved", body: "Weights updated across all pipelines." })}
          className="btn-primary">
          <CheckCircle2 size={13} /> Save changes
        </button>
      </div>

      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-line bg-surface-2">
        <BarChart3 size={16} strokeWidth={1.6} className="text-muted" />
        <div className="flex-1">
          <div className="text-[12px] font-medium text-ink">Weight distribution</div>
          <div className="text-[11px] text-muted">Total: {totalWeight}% — {totalWeight === 100 ? "balanced" : totalWeight > 100 ? `${totalWeight - 100}% over` : `${100 - totalWeight}% under`}</div>
        </div>
        <div className="flex gap-0.5">
          {dims.map(d => (
            <div key={d.key} className="h-6 rounded-sm" title={`${d.label}: ${d.weight}%`}
              style={{ width: Math.max(8, d.weight * 1.8), background: d.weight >= 15 ? "var(--accent)" : d.weight >= 10 ? "var(--accent-soft)" : "var(--bg-deep)" }} />
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        {dims.map((d) => (
          <div key={d.key} className="card overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors">
              <div className="w-8 h-8 rounded-lg grid place-items-center text-[11px] font-bold"
                style={{ background: "var(--accent-soft)", color: "var(--accent-deep)" }}>
                {d.key}
              </div>
              <button onClick={() => setExpanded(expanded === d.key ? null : d.key)} className="flex-1 text-left">
                <div className="text-[12.5px] font-semibold text-ink">{d.label}</div>
                <div className="text-[11px] text-muted">{d.description}</div>
              </button>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <button onClick={() => updateWeight(d.key, -5)}
                    className="w-5 h-5 rounded grid place-items-center text-muted hover:text-ink hover:bg-bg-deep text-[11px]">−</button>
                  <span className="text-[12px] font-bold tnum w-8 text-center" style={{ color: "var(--accent-deep)" }}>{d.weight}%</span>
                  <button onClick={() => updateWeight(d.key, 5)}
                    className="w-5 h-5 rounded grid place-items-center text-muted hover:text-ink hover:bg-bg-deep text-[11px]">+</button>
                </div>
                <button onClick={() => setExpanded(expanded === d.key ? null : d.key)}>
                  <ChevronDown size={14} className={`text-muted transition-transform ${expanded === d.key ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>

            {expanded === d.key && (
              <div className="px-4 pb-4 border-t border-line pt-3 space-y-3 accord-open">
                <div>
                  <div className="mono-label mb-1.5">Discovery questions</div>
                  <div className="space-y-1">
                    {d.questions.map((q, i) => (
                      <div key={i} className="flex items-start gap-2 text-[12px] text-ink-2">
                        <span className="text-muted-2 mt-0.5">{i + 1}.</span>
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mono-label mb-1.5">Scoring rubric</div>
                  <div className="flex gap-2">
                    {d.scoring.map((s) => (
                      <div key={s.label} className="flex-1 rounded-lg border border-line p-2.5 text-center">
                        <div className="text-[11px] font-semibold text-ink">{s.label}</div>
                        <div className="text-[10px] text-muted mt-0.5">Score: {s.range}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   COACHING SCORECARD
   ═══════════════════════════════════════════════════════════════════════ */

type CoachingCategory = {
  id: string;
  name: string;
  icon: typeof Target;
  skills: { name: string; score: number; trend: "up" | "down" | "flat"; benchmark: number }[];
};

const COACHING_CATEGORIES: CoachingCategory[] = [
  { id: "disc", name: "Discovery", icon: Search, skills: [
    { name: "Open-ended questioning", score: 78, trend: "up", benchmark: 75 },
    { name: "Pain identification", score: 82, trend: "up", benchmark: 70 },
    { name: "Active listening ratio", score: 65, trend: "down", benchmark: 72 },
    { name: "Stakeholder mapping", score: 71, trend: "flat", benchmark: 68 },
  ]},
  { id: "pitch", name: "Pitch & Positioning", icon: Zap, skills: [
    { name: "Value articulation", score: 85, trend: "up", benchmark: 78 },
    { name: "Competitive differentiation", score: 62, trend: "down", benchmark: 70 },
    { name: "Use case relevance", score: 88, trend: "up", benchmark: 75 },
    { name: "ROI framing", score: 70, trend: "flat", benchmark: 72 },
  ]},
  { id: "close", name: "Closing & Negotiation", icon: DollarSign, skills: [
    { name: "Next-step commitment", score: 91, trend: "up", benchmark: 80 },
    { name: "Objection handling", score: 68, trend: "down", benchmark: 74 },
    { name: "Pricing confidence", score: 74, trend: "up", benchmark: 70 },
    { name: "Mutual action plans", score: 66, trend: "flat", benchmark: 72 },
  ]},
  { id: "rel", name: "Relationship Building", icon: Heart, skills: [
    { name: "Rapport & tone", score: 90, trend: "up", benchmark: 82 },
    { name: "Follow-up cadence", score: 76, trend: "flat", benchmark: 75 },
    { name: "Multi-threading", score: 58, trend: "down", benchmark: 68 },
    { name: "Executive presence", score: 72, trend: "up", benchmark: 70 },
  ]},
];

function CoachingScorecard() {
  const [selectedCat, setSelectedCat] = useState("disc");
  const cat = COACHING_CATEGORIES.find(c => c.id === selectedCat)!;
  const teamAvg = Math.round(COACHING_CATEGORIES.flatMap(c => c.skills).reduce((s, sk) => s + sk.score, 0) / COACHING_CATEGORIES.flatMap(c => c.skills).length);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[13px] font-semibold text-ink">Coaching Scorecard</div>
          <div className="text-[11.5px] text-muted">AI-derived skill scores from call transcripts, emails, and deal progression signals.</div>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-muted">Team avg:</span>
          <span className="font-bold tnum" style={{ color: teamAvg >= 75 ? "var(--pos)" : teamAvg >= 60 ? "var(--warn)" : "var(--neg)" }}>{teamAvg}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {COACHING_CATEGORIES.map(c => {
          const avg = Math.round(c.skills.reduce((s, sk) => s + sk.score, 0) / c.skills.length);
          return (
            <button key={c.id} onClick={() => setSelectedCat(c.id)}
              className={`card p-3 text-left transition-all ${selectedCat === c.id ? "border-[color:var(--accent)] bg-accent-soft" : "hover:bg-surface-2"}`}>
              <c.icon size={16} strokeWidth={1.6} className="text-muted mb-2" />
              <div className="text-[12px] font-semibold text-ink">{c.name}</div>
              <div className="text-[20px] font-bold tnum mt-1" style={{ color: avg >= 75 ? "var(--pos)" : avg >= 60 ? "var(--warn)" : "var(--neg)" }}>{avg}</div>
              <div className="text-[10px] text-muted">team average</div>
            </button>
          );
        })}
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-line bg-bg-deep">
          <div className="text-[12px] font-semibold text-ink">{cat.name} — Sub-skills</div>
        </div>
        <div className="divide-y divide-line">
          {cat.skills.map(sk => (
            <div key={sk.name} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-medium text-ink">{sk.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 rounded-full bg-bg-deep overflow-hidden" style={{ maxWidth: 160 }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${sk.score}%`, background: sk.score >= 75 ? "var(--pos)" : sk.score >= 60 ? "var(--warn)" : "var(--neg)" }} />
                  </div>
                  <span className="text-[11px] font-bold tnum w-7" style={{ color: sk.score >= 75 ? "var(--pos)" : sk.score >= 60 ? "var(--warn)" : "var(--neg)" }}>{sk.score}</span>
                </div>
              </div>
              <div className="text-center w-16">
                <div className="text-[10px] text-muted">Benchmark</div>
                <div className="text-[12px] font-medium tnum text-ink-2">{sk.benchmark}</div>
              </div>
              <div className="text-center w-14">
                <span className={`trend-pill ${sk.trend}`}>
                  {sk.trend === "up" ? "↑" : sk.trend === "down" ? "↓" : "→"} {sk.trend}
                </span>
              </div>
              <div className="w-8 text-center">
                {sk.score >= sk.benchmark
                  ? <ThumbsUp size={13} strokeWidth={1.6} style={{ color: "var(--pos)" }} />
                  : <AlertTriangle size={13} strokeWidth={1.6} style={{ color: "var(--warn)" }} />}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <div className="mono-label mb-2">Scoring rubric</div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { range: "80–100", label: "Mastery", desc: "Consistently strong. Mentor-ready.", color: "var(--pos)" },
            { range: "60–79", label: "Developing", desc: "Competent with room for growth.", color: "var(--warn)" },
            { range: "0–59", label: "Focus area", desc: "Needs targeted coaching intervention.", color: "var(--neg)" },
          ].map(r => (
            <div key={r.label} className="rounded-lg border border-line p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                <span className="text-[12px] font-semibold text-ink">{r.label}</span>
                <span className="text-[10px] text-muted ml-auto tnum">{r.range}</span>
              </div>
              <div className="text-[11px] text-muted">{r.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TARGETS
   ═══════════════════════════════════════════════════════════════════════ */

function TargetsSection() {
  const toast = useToast();
  const [period, setPeriod] = useState<"Q2 '26" | "Q3 '26" | "Q4 '26">("Q2 '26");
  const [view, setView] = useState<"reps" | "teams">("reps");

  const fmtK = (n: number) => `$${(n / 1000).toFixed(0)}K`;

  const teamTargets = [
    { name: "North America", manager: "Brian Davis", target: 1500000, attained: 900000, reps: 6 },
    { name: "EMEA", manager: "Maya Chen", target: 1400000, attained: 850000, reps: 5 },
    { name: "LATAM", manager: "Carlos Mendoza", target: 1100000, attained: 550000, reps: 4 },
    { name: "APAC", manager: "Aisha Khan", target: 1600000, attained: 950000, reps: 6 },
  ];

  const totalTarget = view === "reps" ? team.reduce((s, r) => s + r.target, 0) : teamTargets.reduce((s, t) => s + t.target, 0);
  const totalAttained = view === "reps" ? team.reduce((s, r) => s + r.achieved, 0) : teamTargets.reduce((s, t) => s + t.attained, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="text-[13px] font-semibold text-ink">Quota Targets</div>
          <div className="text-[11.5px] text-muted">Set and track quotas per rep and team. Syncs to Forecast and People pages.</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-bg-deep rounded-full p-0.5">
            {(["Q2 '26", "Q3 '26", "Q4 '26"] as const).map(q => (
              <button key={q} onClick={() => setPeriod(q)}
                className={`text-[11px] font-medium px-3 h-6 rounded-full ${period === q ? "bg-ink text-white" : "text-muted"}`}>{q}</button>
            ))}
          </div>
          <div className="flex bg-bg-deep rounded-full p-0.5">
            {(["reps", "teams"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`text-[11px] font-medium px-3 h-6 rounded-full capitalize ${view === v ? "bg-ink text-white" : "text-muted"}`}>{v}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3">
          <div className="text-[10px] text-muted uppercase tracking-wider mb-1">Total target</div>
          <div className="text-[20px] font-bold tnum text-ink">{fmtK(totalTarget)}</div>
          <div className="text-[11px] text-muted">{period}</div>
        </div>
        <div className="card p-3">
          <div className="text-[10px] text-muted uppercase tracking-wider mb-1">Attained</div>
          <div className="text-[20px] font-bold tnum" style={{ color: "var(--pos)" }}>{fmtK(totalAttained)}</div>
          <div className="text-[11px] text-muted">{Math.round(totalAttained / totalTarget * 100)}% of target</div>
        </div>
        <div className="card p-3">
          <div className="text-[10px] text-muted uppercase tracking-wider mb-1">Gap</div>
          <div className="text-[20px] font-bold tnum" style={{ color: "var(--warn)" }}>{fmtK(totalTarget - totalAttained)}</div>
          <div className="text-[11px] text-muted">remaining</div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-deep border-b border-line">
              {view === "reps"
                ? ["Rep", "Target", "Attained", "% Complete", "Gap", "Pipeline", "Coverage"].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-[10.5px] font-semibold text-muted uppercase tracking-wider">{h}</th>
                  ))
                : ["Team", "Manager", "Target", "Attained", "% Complete", "Reps", "Gap"].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-[10.5px] font-semibold text-muted uppercase tracking-wider">{h}</th>
                  ))
              }
            </tr>
          </thead>
          <tbody>
            {view === "reps" ? team.map(r => {
              const pct = Math.round(r.achieved / r.target * 100);
              const cov = (r.pipeline / r.target).toFixed(1);
              return (
                <tr key={r.id} className="border-b border-line hover:bg-surface-2">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full grid place-items-center text-[9px] font-bold"
                        style={{ background: "var(--accent-soft)", color: "var(--accent-deep)" }}>{r.initials}</div>
                      <span className="text-[12.5px] font-semibold text-ink">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-[12px] text-ink-2 tnum">{fmtK(r.target)}</td>
                  <td className="px-3 py-2.5 text-[12px] tnum" style={{ color: "var(--pos)" }}>{fmtK(r.achieved)}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-bg-deep overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, background: pct >= 80 ? "var(--pos)" : pct >= 50 ? "var(--warn)" : "var(--neg)" }} />
                      </div>
                      <span className="text-[11px] font-bold tnum" style={{ color: pct >= 80 ? "var(--pos)" : pct >= 50 ? "var(--warn)" : "var(--neg)" }}>{pct}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-[12px] text-muted-2 tnum">{fmtK(r.target - r.achieved)}</td>
                  <td className="px-3 py-2.5 text-[12px] text-ink-2 tnum">{fmtK(r.pipeline)}</td>
                  <td className="px-3 py-2.5 text-[12px] tnum">
                    <span style={{ color: parseFloat(cov) >= 3 ? "var(--pos)" : parseFloat(cov) >= 2 ? "var(--warn)" : "var(--neg)" }}>{cov}x</span>
                  </td>
                </tr>
              );
            }) : teamTargets.map(t => {
              const pct = Math.round(t.attained / t.target * 100);
              return (
                <tr key={t.name} className="border-b border-line hover:bg-surface-2">
                  <td className="px-3 py-2.5 text-[12.5px] font-semibold text-ink">{t.name}</td>
                  <td className="px-3 py-2.5 text-[12px] text-ink-2">{t.manager}</td>
                  <td className="px-3 py-2.5 text-[12px] text-ink-2 tnum">{fmtK(t.target)}</td>
                  <td className="px-3 py-2.5 text-[12px] tnum" style={{ color: "var(--pos)" }}>{fmtK(t.attained)}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-bg-deep overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, background: pct >= 80 ? "var(--pos)" : pct >= 50 ? "var(--warn)" : "var(--neg)" }} />
                      </div>
                      <span className="text-[11px] font-bold tnum" style={{ color: pct >= 80 ? "var(--pos)" : pct >= 50 ? "var(--warn)" : "var(--neg)" }}>{pct}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-[12px] text-ink-2 tnum">{t.reps}</td>
                  <td className="px-3 py-2.5 text-[12px] text-muted-2 tnum">{fmtK(t.target - t.attained)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-muted-2 px-1">
        Targets sync bi-directionally with Salesforce. Editing here updates the CRM within 15 minutes.
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   COMPANY PROFILE
   ═══════════════════════════════════════════════════════════════════════ */

function CompanyProfile() {
  const [activeTab, setActiveTab] = useState<"overview" | "icp" | "personas" | "voice">("overview");

  const PERSONAS = [
    { role: "VP Sales", seniority: "Executive", pains: ["Pipeline visibility", "Forecast accuracy", "Rep ramp time"], goals: ["Predictable revenue growth", "Data-driven coaching"], channels: ["Email", "LinkedIn"], icon: Briefcase },
    { role: "RevOps Leader", seniority: "Director", pains: ["CRM data hygiene", "Tool sprawl", "Manual reporting"], goals: ["Single source of truth", "Automated workflows"], channels: ["Slack", "Email"], icon: Layers },
    { role: "Account Executive", seniority: "IC", pains: ["Admin overhead", "Missing context", "Stalled deals"], goals: ["More selling time", "Better deal intel"], channels: ["In-app", "Slack"], icon: UserCheck },
    { role: "Customer Success Manager", seniority: "IC", pains: ["Churn risk blindspots", "QBR prep time", "Adoption tracking"], goals: ["Proactive retention", "Expansion signals"], channels: ["Email", "In-app"], icon: Shield },
  ];

  const ICP_CRITERIA = [
    { label: "Industry", value: "B2B SaaS, Cloud Infrastructure, Data & Analytics, Financial Services", match: "strong" },
    { label: "Company size", value: "200 – 10,000 employees", match: "strong" },
    { label: "ARR", value: "$5M – $500M", match: "strong" },
    { label: "Tech stack", value: "Salesforce, Gong/Chorus, Slack, HubSpot", match: "medium" },
    { label: "Sales team size", value: "15+ AEs with dedicated RevOps", match: "strong" },
    { label: "Buying signal", value: "Hiring RevOps/Sales Ops, evaluating conversation intelligence", match: "medium" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[13px] font-semibold text-ink">Company Profile</div>
          <div className="text-[11.5px] text-muted">Brand identity, ICP definition, buyer personas, and voice guidelines. Agents ground every interaction in this.</div>
        </div>
      </div>

      <div className="flex bg-bg-deep rounded-full p-0.5 self-start w-fit">
        {(["overview", "icp", "personas", "voice"] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`text-[11px] font-medium px-3 h-7 rounded-full capitalize ${activeTab === t ? "bg-ink text-white" : "text-muted"}`}>
            {t === "icp" ? "ICP" : t === "voice" ? "Brand voice" : t}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-4 space-y-3">
            <div className="mono-label">Company</div>
            <div className="space-y-2">
              {[
                { label: "Name", value: "Alphard, Inc." },
                { label: "Website", value: "alphard.ai" },
                { label: "Industry", value: "Revenue Intelligence / AI" },
                { label: "Founded", value: "2024" },
                { label: "HQ", value: "San Francisco, CA" },
                { label: "Employees", value: "85" },
              ].map(f => (
                <div key={f.label} className="flex items-center justify-between">
                  <span className="text-[11px] text-muted">{f.label}</span>
                  <span className="text-[12px] font-medium text-ink">{f.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-4 space-y-3">
            <div className="mono-label">Value propositions</div>
            <div className="space-y-2">
              {[
                { title: "Autonomous revenue ops", desc: "AI agents that act on CRM, email, and call signals — not just surface them." },
                { title: "Unified workspace", desc: "One platform for AEs, CSMs, AMs, and managers — no tab-switching." },
                { title: "Real-time coaching", desc: "Per-call skill scoring with actionable rubrics, not just transcripts." },
              ].map(v => (
                <div key={v.title} className="rounded-lg border border-line p-2.5">
                  <div className="text-[12px] font-semibold text-ink">{v.title}</div>
                  <div className="text-[11px] text-muted mt-0.5">{v.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "icp" && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-line bg-bg-deep flex items-center justify-between">
            <div className="text-[12px] font-semibold text-ink">Ideal Customer Profile</div>
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "var(--accent-soft)", color: "var(--accent-deep)" }}>6 criteria</span>
          </div>
          <div className="divide-y divide-line">
            {ICP_CRITERIA.map(c => (
              <div key={c.label} className="flex items-center gap-3 px-4 py-3">
                <div className="w-20 text-[11px] font-medium text-muted shrink-0">{c.label}</div>
                <div className="flex-1 text-[12px] text-ink">{c.value}</div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: c.match === "strong" ? "var(--pos-soft)" : "var(--warn-soft)",
                    color: c.match === "strong" ? "var(--pos)" : "var(--warn)",
                  }}>
                  {c.match === "strong" ? "Strong fit" : "Moderate fit"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "personas" && (
        <div className="grid grid-cols-2 gap-3">
          {PERSONAS.map(p => (
            <div key={p.role} className="card p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl grid place-items-center" style={{ background: "var(--accent-soft)" }}>
                  <p.icon size={18} strokeWidth={1.5} style={{ color: "var(--accent-deep)" }} />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-ink">{p.role}</div>
                  <div className="text-[10.5px] text-muted">{p.seniority}</div>
                </div>
              </div>
              <div className="space-y-2.5">
                <div>
                  <div className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Top pains</div>
                  <div className="flex flex-wrap gap-1">
                    {p.pains.map(pain => (
                      <span key={pain} className="text-[10px] px-2 py-0.5 rounded-full bg-neg-soft" style={{ background: "var(--neg-soft)", color: "var(--neg)" }}>{pain}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Goals</div>
                  <div className="flex flex-wrap gap-1">
                    {p.goals.map(g => (
                      <span key={g} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "var(--pos-soft)", color: "var(--pos)" }}>{g}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Channels</div>
                  <div className="flex gap-1">
                    {p.channels.map(ch => (
                      <span key={ch} className="text-[10px] px-2 py-0.5 rounded-full bg-bg-deep text-muted">{ch}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "voice" && (
        <div className="space-y-3">
          <div className="card p-4 space-y-3">
            <div className="mono-label">Tone attributes</div>
            <div className="grid grid-cols-4 gap-2">
              {["Confident, not arrogant", "Technical, not jargon-heavy", "Concise, not curt", "Warm, not casual"].map(t => (
                <div key={t} className="rounded-lg border border-line p-3 text-center">
                  <div className="text-[12px] font-medium text-ink">{t}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <ThumbsUp size={14} strokeWidth={1.6} style={{ color: "var(--pos)" }} />
                <div className="mono-label" style={{ color: "var(--pos)" }}>Do say</div>
              </div>
              <div className="space-y-1.5">
                {[
                  "\"Revenue workspace\" (not CRM or tool)",
                  "\"Autonomous agents\" (not bots or automation)",
                  "\"Proactive signals\" (not alerts or notifications)",
                  "\"Revenue team\" (not sales team or GTM)",
                ].map(s => (
                  <div key={s} className="text-[12px] text-ink-2 flex items-start gap-1.5">
                    <CheckCircle2 size={11} strokeWidth={1.6} className="mt-0.5 shrink-0" style={{ color: "var(--pos)" }} />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <ThumbsDown size={14} strokeWidth={1.6} style={{ color: "var(--neg)" }} />
                <div className="mono-label" style={{ color: "var(--neg)" }}>Avoid</div>
              </div>
              <div className="space-y-1.5">
                {[
                  "\"AI-powered\" (overused — show don't tell)",
                  "\"Best-in-class\" (generic claim)",
                  "\"Synergy\" or corporate buzzwords",
                  "\"Disruptive\" (let customers decide)",
                ].map(s => (
                  <div key={s} className="text-[12px] text-ink-2 flex items-start gap-1.5">
                    <AlertTriangle size={11} strokeWidth={1.6} className="mt-0.5 shrink-0" style={{ color: "var(--neg)" }} />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MEASUREMENT
   ═══════════════════════════════════════════════════════════════════════ */

type KPI = {
  id: string;
  name: string;
  category: "Pipeline" | "Activity" | "Efficiency" | "Retention";
  formula: string;
  target: string;
  current: string;
  status: "on-track" | "at-risk" | "behind";
  frequency: "Daily" | "Weekly" | "Monthly" | "Quarterly";
};

const KPIS: KPI[] = [
  { id: "k1", name: "Pipeline Coverage", category: "Pipeline", formula: "Open Pipeline / Remaining Quota", target: "≥ 3.0x", current: "2.8x", status: "at-risk", frequency: "Weekly" },
  { id: "k2", name: "Win Rate", category: "Pipeline", formula: "Closed Won / (Closed Won + Closed Lost)", target: "≥ 28%", current: "31%", status: "on-track", frequency: "Monthly" },
  { id: "k3", name: "Average Deal Size", category: "Pipeline", formula: "Sum(Closed Won ARR) / Count(Closed Won)", target: "$180K", current: "$195K", status: "on-track", frequency: "Monthly" },
  { id: "k4", name: "Sales Cycle Length", category: "Efficiency", formula: "Avg days from Qualification to Closed Won", target: "≤ 62 days", current: "58 days", status: "on-track", frequency: "Monthly" },
  { id: "k5", name: "Activity Score", category: "Activity", formula: "(Calls × 1) + (Emails × 0.5) + (Meetings × 3)", target: "≥ 45 / week", current: "52", status: "on-track", frequency: "Weekly" },
  { id: "k6", name: "Connected Call Rate", category: "Activity", formula: "Connected Calls / Total Calls", target: "≥ 35%", current: "29%", status: "behind", frequency: "Weekly" },
  { id: "k7", name: "MEDDPICC Completion", category: "Efficiency", formula: "Avg filled dimensions per active deal", target: "≥ 6.5 / 8", current: "5.8", status: "at-risk", frequency: "Weekly" },
  { id: "k8", name: "Net Revenue Retention", category: "Retention", formula: "(Starting ARR + Expansion − Churn) / Starting ARR", target: "≥ 115%", current: "112%", status: "at-risk", frequency: "Quarterly" },
  { id: "k9", name: "Gross Retention", category: "Retention", formula: "(Starting ARR − Churn) / Starting ARR", target: "≥ 92%", current: "94%", status: "on-track", frequency: "Quarterly" },
  { id: "k10", name: "Time to First Value", category: "Retention", formula: "Days from closed won to first milestone", target: "≤ 30 days", current: "26 days", status: "on-track", frequency: "Monthly" },
];

function MeasurementSection() {
  const [catFilter, setCatFilter] = useState<string>("all");
  const categories = ["all", "Pipeline", "Activity", "Efficiency", "Retention"];
  const filtered = catFilter === "all" ? KPIS : KPIS.filter(k => k.category === catFilter);

  const statusCounts = { "on-track": KPIS.filter(k => k.status === "on-track").length, "at-risk": KPIS.filter(k => k.status === "at-risk").length, "behind": KPIS.filter(k => k.status === "behind").length };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[13px] font-semibold text-ink">Measurement</div>
          <div className="text-[11.5px] text-muted">KPIs and custom metrics that surface across the workspace. Agents reference these targets.</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "On track", count: statusCounts["on-track"], color: "var(--pos)", bg: "var(--pos-soft)" },
          { label: "At risk", count: statusCounts["at-risk"], color: "var(--warn)", bg: "var(--warn-soft)" },
          { label: "Behind", count: statusCounts["behind"], color: "var(--neg)", bg: "var(--neg-soft)" },
        ].map(s => (
          <div key={s.label} className="card p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: s.bg }}>
              <span className="text-[16px] font-bold tnum" style={{ color: s.color }}>{s.count}</span>
            </div>
            <div>
              <div className="text-[12px] font-semibold text-ink">{s.label}</div>
              <div className="text-[10.5px] text-muted">of {KPIS.length} metrics</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex bg-bg-deep rounded-full p-0.5 w-fit">
        {categories.map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={`text-[11px] font-medium px-3 h-6 rounded-full capitalize ${catFilter === c ? "bg-ink text-white" : "text-muted"}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-deep border-b border-line">
              {["Metric", "Category", "Formula", "Target", "Current", "Status", "Frequency"].map(h => (
                <th key={h} className="text-left px-3 py-2 text-[10.5px] font-semibold text-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(k => (
              <tr key={k.id} className="border-b border-line hover:bg-surface-2">
                <td className="px-3 py-2.5 text-[12.5px] font-semibold text-ink">{k.name}</td>
                <td className="px-3 py-2.5">
                  <span className="text-[10.5px] px-1.5 py-0.5 rounded bg-bg-deep text-muted font-medium">{k.category}</span>
                </td>
                <td className="px-3 py-2.5 text-[11.5px] text-muted max-w-[240px]">{k.formula}</td>
                <td className="px-3 py-2.5 text-[12px] text-ink-2 tnum font-medium">{k.target}</td>
                <td className="px-3 py-2.5 text-[12px] tnum font-bold"
                  style={{ color: k.status === "on-track" ? "var(--pos)" : k.status === "at-risk" ? "var(--warn)" : "var(--neg)" }}>
                  {k.current}
                </td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-medium px-1.5 h-5 rounded"
                    style={{
                      background: k.status === "on-track" ? "var(--pos-soft)" : k.status === "at-risk" ? "var(--warn-soft)" : "var(--neg-soft)",
                      color: k.status === "on-track" ? "var(--pos)" : k.status === "at-risk" ? "var(--warn)" : "var(--neg)",
                    }}>
                    {k.status === "on-track" ? <CheckCircle2 size={9} /> : k.status === "at-risk" ? <AlertTriangle size={9} /> : <AlertTriangle size={9} />}
                    {k.status.replace("-", " ")}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-[11.5px] text-muted">{k.frequency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CLIP LIBRARY
   ═══════════════════════════════════════════════════════════════════════ */

type Clip = {
  id: string;
  title: string;
  account: string;
  rep: string;
  repInitials: string;
  duration: number;
  timestamp: string;
  tags: string[];
  rating: number;
  type: "call" | "demo" | "qbr";
  skill: string;
  transcript: string;
};

const CLIPS: Clip[] = [
  { id: "cl1", title: "Perfect objection turnaround on pricing", account: "Shopify", rep: "Sarah Chen", repInitials: "SC", duration: 47, timestamp: "14:22", tags: ["Objection handling", "Pricing"], rating: 5, type: "call", skill: "Closing & Negotiation",
    transcript: "\"I hear you on the investment concern. Let me reframe — our customers typically see 3.2x ROI within the first quarter. What if we structured a phased rollout so you can validate that before the full commitment?\"" },
  { id: "cl2", title: "Multi-threading into VP Engineering", account: "HSBC", rep: "Lisa Park", repInitials: "LP", duration: 62, timestamp: "08:45", tags: ["Multi-threading", "Executive access"], rating: 4, type: "call", skill: "Relationship Building",
    transcript: "\"I noticed your VP Engineering just published that blog about data infrastructure. Our platform directly addresses the scaling challenges she outlined. Would it make sense to loop her in for a 15-minute alignment call?\"" },
  { id: "cl3", title: "ROI framing during QBR presentation", account: "Cloudflare, Inc.", rep: "Brad Allen", repInitials: "BA", duration: 93, timestamp: "22:10", tags: ["ROI", "QBR", "Value realization"], rating: 5, type: "qbr", skill: "Pitch & Positioning",
    transcript: "\"Looking at Q1 outcomes — your team saved 340 hours on CRM entry, which at your blended rate translates to $127K in recovered selling time. That's already 1.8x your annual investment.\"" },
  { id: "cl4", title: "Discovery question uncovers hidden pain", account: "Raytheon Technologies", rep: "Derek Evans", repInitials: "DE", duration: 38, timestamp: "06:30", tags: ["Discovery", "Pain identification"], rating: 5, type: "call", skill: "Discovery",
    transcript: "\"What happens to the deals that stall in your pipeline for more than 30 days? ... And how does that affect your quarterly forecast accuracy?\"" },
  { id: "cl5", title: "Champion coaching for internal sell", account: "Siemens AG", rep: "Lisa Park", repInitials: "LP", duration: 55, timestamp: "31:15", tags: ["Champion enablement", "Internal selling"], rating: 4, type: "call", skill: "Relationship Building",
    transcript: "\"I put together a one-pager that maps our solution directly to each of your CFO's three priorities. Feel free to put your name on it — I want you to look great in that meeting.\"" },
  { id: "cl6", title: "Competitive displacement against Gong", account: "MongoDB, Inc.", rep: "Sarah Chen", repInitials: "SC", duration: 71, timestamp: "18:40", tags: ["Competitive", "Differentiation"], rating: 4, type: "demo", skill: "Pitch & Positioning",
    transcript: "\"Where Gong gives you conversation intelligence, we give you conversation intelligence plus autonomous action. Your reps won't just see insights — the system acts on them. That's the difference between a dashboard and a co-pilot.\"" },
  { id: "cl7", title: "Renewal save — empathy + quick win", account: "Snowflake Inc.", rep: "Mike Torres", repInitials: "MT", duration: 44, timestamp: "03:20", tags: ["Renewal", "Retention", "Quick win"], rating: 5, type: "call", skill: "Closing & Negotiation",
    transcript: "\"I completely understand the frustration. Here's what I want to do — let me personally get your SSO fixed by Friday, and then let's sit down Monday to map the rest of your concerns to a 30-day action plan. Fair?\"" },
  { id: "cl8", title: "Adoption deep-dive surfaces expansion", account: "GitLab Inc.", rep: "Sarah Chen", repInitials: "SC", duration: 82, timestamp: "12:05", tags: ["Adoption", "Expansion", "Usage data"], rating: 4, type: "qbr", skill: "Discovery",
    transcript: "\"I see three teams are at 90%+ adoption, but your DevRel team hasn't onboarded yet. If we got them live, that's roughly 40 more seats — and they'd benefit the most given their external-facing workflow.\"" },
];

function ClipLibrary() {
  const [searchQ, setSearchQ] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  const allTags = [...new Set(CLIPS.flatMap(c => c.tags))].sort();
  const filtered = CLIPS.filter(c => {
    if (searchQ && !c.title.toLowerCase().includes(searchQ.toLowerCase()) && !c.account.toLowerCase().includes(searchQ.toLowerCase()) && !c.rep.toLowerCase().includes(searchQ.toLowerCase())) return false;
    if (tagFilter && !c.tags.includes(tagFilter)) return false;
    return true;
  });

  const fmtDur = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const typeIcon = (t: string) => t === "call" ? Phone : t === "demo" ? Video : Calendar;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[13px] font-semibold text-ink">Clip Library</div>
          <div className="text-[11.5px] text-muted">Curated moments from sales calls — taggable, sharable, and used as evidence in Coaching and onboarding.</div>
        </div>
        <div className="text-[11px] text-muted">{CLIPS.length} clips</div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 h-8 px-3 rounded-lg border border-line bg-surface">
          <Search size={13} strokeWidth={1.6} className="text-muted" />
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
            placeholder="Search clips by title, account, or rep..."
            className="flex-1 bg-transparent outline-none text-[12px] text-ink placeholder:text-muted-2" />
        </div>
        <div className="flex items-center gap-1.5 h-8 pl-2 pr-1 rounded-lg border border-line bg-surface">
          <Tag size={12} strokeWidth={1.6} className="text-muted" />
          <select value={tagFilter ?? ""} onChange={e => setTagFilter(e.target.value || null)}
            className="bg-transparent outline-none text-[11.5px] text-ink-2 cursor-pointer pr-1">
            <option value="">All tags</option>
            {allTags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map(clip => {
          const TypeIcon = typeIcon(clip.type);
          const isPlaying = playing === clip.id;
          return (
            <div key={clip.id} className={`card overflow-hidden transition-all ${isPlaying ? "border-[color:var(--accent)]" : ""}`}>
              <div className="flex items-start gap-3 p-4">
                <button onClick={() => setPlaying(isPlaying ? null : clip.id)}
                  className="w-10 h-10 rounded-xl grid place-items-center shrink-0 transition-colors"
                  style={{ background: isPlaying ? "var(--accent)" : "var(--accent-soft)", color: isPlaying ? "var(--accent-ink)" : "var(--accent-deep)" }}>
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <TypeIcon size={12} strokeWidth={1.6} className="text-muted" />
                    <span className="text-[10px] text-muted uppercase tracking-wider">{clip.type}</span>
                    <span className="text-[10px] text-muted-2">·</span>
                    <span className="text-[10px] text-muted tnum">at {clip.timestamp}</span>
                    <span className="text-[10px] text-muted-2">·</span>
                    <span className="text-[10px] text-muted tnum">{fmtDur(clip.duration)}</span>
                  </div>
                  <div className="text-[13px] font-semibold text-ink mb-1">{clip.title}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full grid place-items-center text-[8px] font-bold"
                        style={{ background: "var(--accent-soft)", color: "var(--accent-deep)" }}>{clip.repInitials}</div>
                      <span className="text-[11px] text-ink-2">{clip.rep}</span>
                    </div>
                    <span className="text-[10px] text-muted-2">·</span>
                    <span className="text-[11px] text-muted">{clip.account}</span>
                    <span className="text-[10px] text-muted-2">·</span>
                    <span className="text-[11px] text-muted">{clip.skill}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {clip.tags.map(t => (
                      <button key={t} onClick={() => setTagFilter(tagFilter === t ? null : t)}
                        className={`text-[9.5px] px-1.5 py-0.5 rounded-full font-medium transition-colors ${
                          tagFilter === t ? "bg-[color:var(--accent)] text-[color:var(--accent-ink)]" : "bg-bg-deep text-muted hover:text-ink"
                        }`}>{t}</button>
                    ))}
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={11} strokeWidth={1.6}
                        style={{ color: i < clip.rating ? "var(--accent)" : "var(--muted-2)" }}
                        fill={i < clip.rating ? "var(--accent)" : "none"} />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button className="btn-icon w-7 h-7" title="Copy link"><Copy size={13} strokeWidth={1.6} /></button>
                  <button className="btn-icon w-7 h-7" title="Share"><Share2 size={13} strokeWidth={1.6} /></button>
                </div>
              </div>

              {isPlaying && (
                <div className="px-4 pb-4 border-t border-line pt-3 accord-open">
                  <div className="mono-label mb-1.5">Transcript excerpt</div>
                  <div className="text-[12px] text-ink-2 leading-relaxed italic-emph rounded-lg bg-bg-deep p-3">
                    {clip.transcript}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1 rounded-full bg-bg-deep overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: "35%", background: "var(--accent)" }} />
                    </div>
                    <span className="text-[10px] text-muted tnum">0:16 / {fmtDur(clip.duration)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="card p-8 text-center">
            <Search size={20} strokeWidth={1.6} className="text-muted mx-auto mb-2" />
            <div className="text-[13px] text-ink font-medium">No clips match your filters</div>
            <div className="text-[11.5px] text-muted mt-1">Try a different search term or clear the tag filter.</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SHARED UTILITIES
   ═══════════════════════════════════════════════════════════════════════ */

function Counter({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-[12px] font-mono tnum px-2 py-0.5 rounded" style={{ background: "var(--bg-deep)", color: "var(--ink-2)" }}>
      <CheckCircle2 size={10} strokeWidth={1.8} className="text-muted" />{n}
    </span>
  );
}
