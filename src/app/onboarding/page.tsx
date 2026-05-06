"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, ArrowLeft, Check, Sparkles, Bot, Rocket,
  Users, LineChart, Briefcase, Activity, Target, Plug,
  Loader2, ShieldCheck, Database, MessageSquare, Phone,
  Calendar, BarChart3, Brain, AlertTriangle, TrendingUp,
  ChevronRight, Heart,
} from "lucide-react";
import { AlphardLogo } from "@/components/AlphardLogo";
import { Logo } from "@/components/Logo";
import { usePersona, PERSONA_LABEL } from "@/components/PersonaContext";
import { useGoals } from "@/components/GoalsContext";
import type { Persona } from "@/lib/mock";
import { fmtMoney } from "@/lib/mock";

// =====================================================================
// Constants
// =====================================================================

type PersonaCard = {
  id: Persona; title: string; role: string; blurb: string;
  Icon: typeof Briefcase; highlights: string[];
};

const PERSONAS: PersonaCard[] = [
  {
    id: "ae", title: "Account Executive", role: "Closing motion",
    blurb: "Your day is the pipeline. You sell, you forecast, you close.",
    Icon: Briefcase,
    highlights: [
      "Today queue ranks every active deal by risk + stage exit",
      "MEDDPICC scores roll up automatically from calls and emails",
      "Forecast assistant pre-fills your weekly commit",
    ],
  },
  {
    id: "am", title: "Account Manager", role: "Expansion motion",
    blurb: "Your day is growing the book — champions, expansion plays, cross-sell.",
    Icon: TrendingUp,
    highlights: [
      "Expansion spotter watches champion promotions and hiring signals",
      "Multithreader maps stakeholders into expansion-ready org charts",
      "Co-owned forecast with the AE on every active deal",
    ],
  },
  {
    id: "csm", title: "Customer Success", role: "Retention motion",
    blurb: "Your day is the health of the book — adoption, renewals, support.",
    Icon: Heart,
    highlights: [
      "Renewal cockpit with 90-day risk windows on every contract",
      "Adoption watchdog flags WAU/MAU drops and blocked playbooks",
      "QBR composer drafts narratives from product + ticket signals",
    ],
  },
  {
    id: "manager", title: "Sales Manager", role: "Team motion",
    blurb: "Your day is the team — forecast roll-up, rep coaching, pipeline hygiene.",
    Icon: Users,
    highlights: [
      "AI-Assisted vs Seller forecast side-by-side",
      "Per-rep skill scores from call transcripts",
      "1-on-1 agendas drafted from the past 7 days of activity",
    ],
  },
];

type Source = { id: string; name: string; category: string; required: boolean; recommendedFor: Persona[] };
const SOURCES: Source[] = [
  { id: "salesforce",    name: "Salesforce",          category: "CRM",               required: true,  recommendedFor: ["ae","am","csm","manager"] },
  { id: "slack",         name: "Slack",               category: "Comms",             required: false, recommendedFor: ["ae","am","csm","manager"] },
  { id: "gmail",         name: "Gmail",               category: "Email",             required: false, recommendedFor: ["ae","am","csm","manager"] },
  { id: "outlook",       name: "Outlook",             category: "Email",             required: false, recommendedFor: ["ae","am","csm","manager"] },
  { id: "googlecalendar",name: "Google Calendar",     category: "Calendar",          required: false, recommendedFor: ["ae","am","csm","manager"] },
  { id: "zoom",          name: "Zoom",                category: "Calls",             required: false, recommendedFor: ["ae","am","csm","manager"] },
  { id: "mixpanel",      name: "Mixpanel",            category: "Product analytics", required: false, recommendedFor: ["csm","am"] },
  { id: "amplitude",     name: "Amplitude",           category: "Product analytics", required: false, recommendedFor: ["csm","am"] },
  { id: "datadog",       name: "Datadog",             category: "Reliability",       required: false, recommendedFor: ["csm"] },
  { id: "zendesk",       name: "Zendesk",             category: "Support",           required: false, recommendedFor: ["csm"] },
  { id: "intercom",      name: "Intercom",            category: "Support",           required: false, recommendedFor: ["csm"] },
  { id: "linkedin",      name: "LinkedIn Sales Nav",  category: "Signals",           required: false, recommendedFor: ["ae","am","manager"] },
];

type Agent = { id: string; name: string; desc: string; Icon: typeof Bot; recommendedFor: Persona[] };
const AGENTS: Agent[] = [
  { id: "jackie",    name: "Jackie · Pre-Meeting Prepper",  desc: "60-second brief 30 min before every call.", Icon: Calendar,      recommendedFor: ["ae","am","csm","manager"] },
  { id: "eli",       name: "Eli · Account Enricher",        desc: "Firmographics, news, funding into every record.", Icon: Database,   recommendedFor: ["ae","am","csm","manager"] },
  { id: "sentinel",  name: "Deal Hygiene Sentinel",         desc: "Flags missing close dates, stale next steps daily.", Icon: ShieldCheck, recommendedFor: ["ae","manager"] },
  { id: "forecast",  name: "Forecast Assistant",            desc: "Pre-fills weekly commit from rep history + stage probability.", Icon: BarChart3, recommendedFor: ["ae","am","manager"] },
  { id: "renewal",   name: "Renewal Risk Monitor",          desc: "Flags accounts 90 days pre-renewal from WAU/MAU + tickets.", Icon: AlertTriangle, recommendedFor: ["csm","manager"] },
  { id: "expansion", name: "Expansion Spotter",             desc: "Seeds expansion from champion promotions and hiring signals.", Icon: TrendingUp, recommendedFor: ["am","manager"] },
  { id: "adoption",  name: "Adoption Watchdog",             desc: "Detects blocked onboarding steps and feature drop-offs.", Icon: Activity, recommendedFor: ["csm"] },
  { id: "coaching",  name: "Coaching Insights",             desc: "Scores rep skills from call transcripts across your team.", Icon: Brain, recommendedFor: ["manager"] },
  { id: "signals",   name: "Signals Scout",                 desc: "Job changes, M&A, funding on your accounts in real time.", Icon: MessageSquare, recommendedFor: ["am","ae","csm"] },
  { id: "outcomes",  name: "Outcomes Tracker",              desc: "Monitors customer promises against measurable signals.", Icon: Target, recommendedFor: ["csm","am"] },
];

// =====================================================================
// Hooks
// =====================================================================

function useTypewriter(text: string, speed = 16, trigger = true) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!trigger) { setDisplayed(text); return; }
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, trigger]);
  return displayed;
}

// =====================================================================
// AI chat bubble
// =====================================================================

function AIChatBubble({ text, animate = true, className = "" }: {
  text: string; animate?: boolean; className?: string;
}) {
  const msg = useTypewriter(text, 14, animate);
  const [dots, setDots] = useState("·");
  const pending = msg.length < text.length;

  useEffect(() => {
    if (!pending) return;
    const id = setInterval(() => setDots((d) => d.length < 3 ? d + "·" : "·"), 380);
    return () => clearInterval(id);
  }, [pending]);

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="w-9 h-9 rounded-full bg-ink grid place-items-center shrink-0 mt-0.5">
        <span className="orb" style={{ width: 7, height: 7 }} />
      </div>
      <div className="flex-1">
        <div className="text-[10px] font-mono text-muted uppercase tracking-wider mb-2">Alphy</div>
        <div className="text-[16px] md:text-[18px] text-ink leading-relaxed font-medium tracking-tight">
          {msg || <span className="text-muted-2 text-[15px]">typing{dots}</span>}
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// Stage type + page
// =====================================================================

type Stage = "intro" | "persona" | "sources" | "agents" | "goals" | "provisioning" | "ready";
const STAGE_IDX: Record<Stage, number> = {
  intro: 0, persona: 1, sources: 2, agents: 3, goals: 4, provisioning: 5, ready: 6,
};

export default function OnboardingPage() {
  const router = useRouter();
  const { persona, setPersona } = usePersona();
  const { setQuota } = useGoals();
  const [stage, setStage]   = useState<Stage>("intro");
  const [picked, setPicked] = useState<Persona>(persona);
  const [target, setTarget] = useState<number>(1_200_000);

  const [sources, setSources] = useState<Set<string>>(new Set());
  const [agents,  setAgents]  = useState<Set<string>>(new Set());

  // Default target follows persona — matches lib/mock.ts myNumber defaults.
  useEffect(() => {
    if (picked === "ae")        setTarget(1_200_000);
    else if (picked === "am")   setTarget(600_000);
    else if (picked === "csm")  setTarget(2_380_000);
    else                         setTarget(9_600_000);
  }, [picked]);

  useEffect(() => {
    setSources(new Set(SOURCES.filter((s) => s.required || s.recommendedFor.includes(picked)).map((s) => s.id)));
    setAgents (new Set(AGENTS .filter((a) => a.recommendedFor.includes(picked)).map((a) => a.id)));
  }, [picked]);

  // Provisioning ticker
  const [activated, setActivated] = useState<Set<string>>(new Set());
  const [provLogs,  setProvLogs]  = useState<string[]>([]);
  const orderedAgents = useMemo(() => AGENTS.filter((a) => agents.has(a.id)), [agents]);

  const PROV_LOGS = useMemo(() => [
    "Authenticating with Salesforce CRM…",
    `Indexing ${Math.floor(Math.random() * 400 + 600)} account records…`,
    "Reading last 90 days of activity…",
    "Scanning call transcripts via Gong…",
    "Pulling email metadata from Gmail…",
    "Calculating health scores…",
    ...orderedAgents.map((a) => `Activating ${a.name.split("·")[0].trim()}…`),
    "Generating your first Today queue…",
    "Workspace ready.",
  ], [orderedAgents]);

  useEffect(() => {
    if (stage !== "provisioning") return;
    setActivated(new Set());
    setProvLogs([]);
    let logIdx = 0;
    let agentIdx = 0;

    const tick = () => {
      // add log line
      if (logIdx < PROV_LOGS.length) {
        setProvLogs((prev) => [...prev, PROV_LOGS[logIdx]]);
        logIdx++;
      }
      // activate agents after first few base logs
      if (logIdx > 5 && agentIdx < orderedAgents.length) {
        const snap = agentIdx;
        setActivated((prev) => new Set([...prev, orderedAgents[snap].id]));
        agentIdx++;
      }
      if (logIdx >= PROV_LOGS.length) {
        setTimeout(() => setStage("ready"), 900);
        return;
      }
      setTimeout(tick, 360);
    };
    setTimeout(tick, 300);
  }, [stage, orderedAgents, PROV_LOGS]);

  const finish         = () => { setPersona(picked); setQuota(picked, target); router.push("/home"); };
  const finishWithTour = () => { setPersona(picked); setQuota(picked, target); router.push("/home?tour=1"); };

  const stageIdx = STAGE_IDX[stage];

  return (
    <div className="min-h-screen bg-bg flex flex-col relative overflow-hidden">
      {/* Ambient backdrop — soft lime glow + bone gradient */}
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1100px] h-[640px] rounded-full opacity-70"
          style={{
            background:
              "radial-gradient(closest-side, rgba(200,255,61,0.22), rgba(200,255,61,0.06) 55%, transparent 75%)",
            filter: "blur(8px)",
          }}
        />
        <div
          className="absolute bottom-[-220px] right-[-120px] w-[640px] h-[640px] rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(closest-side, rgba(58,111,181,0.18), transparent 65%)",
            filter: "blur(20px)",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-line/60 px-6 md:px-10 py-4 flex items-center justify-between bg-surface/70 backdrop-blur-md sticky top-0">
        <AlphardLogo variant="full" size={22} />
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5">
            {(["intro","persona","sources","agents","goals","provisioning","ready"] as Stage[]).map((s, i) => (
              <span key={s} className="h-1 rounded-full transition-all"
                style={{
                  width: i === stageIdx ? 28 : 10,
                  background: i <= stageIdx ? "var(--accent)" : "var(--bg-deep)",
                  boxShadow: i === stageIdx ? "0 0 12px rgba(200,255,61,0.65)" : "none",
                }} />
            ))}
          </div>
          <span className="mono-label text-muted-2">
            Step {Math.min(stageIdx + 1, 7)} / 7
          </span>
        </div>
        <button onClick={() => router.push("/home")} className="text-[12px] text-muted hover:text-ink transition-colors">
          Skip
        </button>
      </header>

      <main className="relative z-10 flex-1 flex items-start justify-center py-10 md:py-14 px-5">
        <div className="w-full max-w-[920px]">
          {stage === "intro"        && <IntroStep      onNext={() => setStage("persona")} />}
          {stage === "persona"      && <PersonaStep    picked={picked} onPick={setPicked} onNext={() => setStage("sources")} />}
          {stage === "sources"      && <SourcesStep    picked={picked} sources={sources} setSources={setSources} onBack={() => setStage("persona")} onNext={() => setStage("agents")} />}
          {stage === "agents"       && <AgentsStep     picked={picked} agents={agents} setAgents={setAgents} onBack={() => setStage("sources")} onNext={() => setStage("goals")} />}
          {stage === "goals"        && <GoalsStep      picked={picked} target={target} setTarget={setTarget} onBack={() => setStage("agents")} onNext={() => setStage("provisioning")} />}
          {stage === "provisioning" && <ProvisioningStep picked={picked} orderedAgents={orderedAgents} activated={activated} provLogs={provLogs} connectedSources={SOURCES.filter((s) => sources.has(s.id))} />}
          {stage === "ready"        && <ReadyStep      picked={picked} agentCount={orderedAgents.length} sourceCount={sources.size} target={target} onFinish={finish} onTour={finishWithTour} />}
        </div>
      </main>
    </div>
  );
}

// =====================================================================
// Step 0 — Intro (new)
// =====================================================================

function IntroStep({ onNext }: { onNext: () => void }) {
  const INTRO_TEXT = "Hi — I'm Alphy, your AI Revenue Partner. I'll set up a workspace tailored to how you actually work. Takes about 2 minutes.";
  const [typed, setTyped] = useState(false);
  useEffect(() => { const t = setTimeout(() => setTyped(true), 200); return () => clearTimeout(t); }, []);

  const FEATURES = [
    { Icon: Activity, label: "Health scores"    },
    { Icon: Brain,    label: "AI coaching"      },
    { Icon: Bot,      label: "Background agents"},
    { Icon: Target,   label: "Deal signals"     },
  ];

  return (
    <div className="fade-in">
      {/* Big logo + orb with halo */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="relative mb-6">
          {/* Outer halo */}
          <div
            className="absolute inset-0 -m-6 rounded-full opacity-60 animate-pulse"
            style={{ background: "radial-gradient(circle, rgba(200,255,61,0.5), transparent 65%)", filter: "blur(14px)" }}
          />
          {/* Spinning conic ring */}
          <div
            className="absolute -inset-1 rounded-3xl opacity-80"
            style={{
              background:
                "conic-gradient(from 0deg, rgba(200,255,61,0.7), transparent 30%, transparent 70%, rgba(200,255,61,0.7))",
              animation: "spin 6s linear infinite",
              filter: "blur(2px)",
            }}
          />
          <div className="relative w-20 h-20 rounded-3xl bg-ink grid place-items-center shadow-[0_20px_60px_-20px_rgba(28,40,64,0.7)]">
            <span className="orb" style={{ width: 14, height: 14 }} />
          </div>
        </div>
        <div className="mono-label text-muted-2 mb-3">Revenue intelligence · v2</div>
        <h1 className="text-[32px] md:text-[40px] font-semibold tracking-tight text-ink leading-[1.05] max-w-[560px] mb-2">
          Welcome to <span className="ink-gradient">Alphy</span>.
        </h1>
        <p className="text-[14px] text-muted max-w-[520px]">
          Let&apos;s tailor your workspace before you step inside.
        </p>
      </div>

      {/* AI chat bubble */}
      <div className="max-w-[640px] mx-auto mb-8">
        <AIChatBubble text={INTRO_TEXT} animate={typed} />
      </div>

      {/* Feature chips */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {FEATURES.map((f, i) => (
          <div
            key={f.label}
            className="inline-flex items-center gap-2 h-8 px-3.5 rounded-full border border-line bg-surface/80 backdrop-blur-sm text-[12px] font-medium text-ink-2 shadow-[0_2px_8px_-4px_rgba(28,40,64,0.08)]"
            style={{ animation: `fadeIn 600ms ${300 + i * 80}ms backwards ease-out` }}
          >
            <f.Icon size={13} strokeWidth={1.6} style={{ color: "var(--accent-deep)" }} />
            {f.label}
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <PrimaryButton onClick={onNext}>
          Let&apos;s set up my workspace <ArrowRight size={14} strokeWidth={2} />
        </PrimaryButton>
      </div>
    </div>
  );
}

// =====================================================================
// Step 1 — Persona
// =====================================================================

function PersonaStep({ picked, onPick, onNext }: {
  picked: Persona; onPick: (p: Persona) => void; onNext: () => void;
}) {
  return (
    <div className="fade-in">
      <AIChatBubble
        text="First question — what does your day actually look like? I'll wire up the right home view, signals, and agents."
        className="mb-8 max-w-[640px]"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {PERSONAS.map((p) => {
          const active = picked === p.id;
          return (
            <button key={p.id} onClick={() => onPick(p.id)}
              className="text-left card card-lift p-5 transition-all relative overflow-hidden"
              style={active ? {
                borderColor: "transparent",
                boxShadow: "0 0 0 2.5px var(--accent), 0 18px 40px -18px rgba(168,224,32,0.45)",
              } : undefined}>
              {active && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent grid place-items-center">
                  <Check size={10} strokeWidth={2.5} style={{ color: "var(--accent-ink)" }} />
                </span>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl grid place-items-center transition-colors"
                  style={{ background: active ? "var(--accent)" : "var(--bg-deep)" }}>
                  <p.Icon size={20} strokeWidth={1.6}
                    style={{ color: active ? "var(--accent-ink)" : "var(--ink)" }} />
                </div>
                <div>
                  <div className="text-[14.5px] font-semibold text-ink">{p.title}</div>
                  <div className="mono-label text-muted-2 mt-0.5">{p.role}</div>
                </div>
              </div>
              <p className="text-[12.5px] text-ink-2 leading-relaxed mb-3">{p.blurb}</p>
              <ul className="space-y-1.5">
                {p.highlights.map((h, i) => (
                  <li key={i} className="text-[11.5px] text-muted flex items-start gap-2 leading-relaxed">
                    <Check size={10} strokeWidth={2} className="mt-[3px] shrink-0"
                      style={{ color: active ? "var(--accent-deep)" : "var(--muted-2)" }} />
                    {h}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <PrimaryButton onClick={onNext}>
          That&apos;s me <ArrowRight size={13} strokeWidth={2} />
        </PrimaryButton>
      </div>
    </div>
  );
}

// =====================================================================
// Step 2 — Sources
// =====================================================================

function SourcesStep({ picked, sources, setSources, onBack, onNext }: {
  picked: Persona; sources: Set<string>; setSources: (s: Set<string>) => void;
  onBack: () => void; onNext: () => void;
}) {
  const toggle = (id: string) => {
    const s = SOURCES.find((x) => x.id === id);
    if (s?.required) return;
    const next = new Set(sources);
    next.has(id) ? next.delete(id) : next.add(id);
    setSources(next);
  };

  const aiMsg = `I've pre-selected the tools ${PERSONA_LABEL[picked].split(" ")[0].toLowerCase()}s use most. Deselect anything you don't have — you can add more later from Settings → Integrations.`;

  return (
    <div className="fade-in">
      <AIChatBubble text={aiMsg} className="mb-8 max-w-[640px]" />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-8">
        {SOURCES.map((s) => {
          const checked = sources.has(s.id);
          return (
            <button key={s.id} onClick={() => toggle(s.id)} disabled={s.required}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                checked
                  ? "border-accent-deep/40 bg-accent-soft/30 shadow-sm"
                  : "border-line bg-surface hover:bg-surface-2"
              } ${s.required ? "cursor-default" : ""}`}>
              <Logo name={s.name} size={32} rounded={8} />
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-medium text-ink truncate">{s.name}</div>
                <div className="text-[10px] text-muted-2">{s.category}{s.required ? " · required" : ""}</div>
              </div>
              <span className="w-4.5 h-4.5 rounded-full grid place-items-center border shrink-0"
                style={checked ? { background: "var(--accent)", borderColor: "transparent" } : { borderColor: "var(--line-strong)" }}>
                {checked && <Check size={10} strokeWidth={2.5} style={{ color: "var(--accent-ink)" }} />}
              </span>
            </button>
          );
        })}
      </div>

      <NavBar onBack={onBack} onNext={onNext}
        nextLabel={`Connect ${sources.size} source${sources.size === 1 ? "" : "s"}`} />
    </div>
  );
}

// =====================================================================
// Step 3 — Agents
// =====================================================================

function AgentsStep({ picked, agents, setAgents, onBack, onNext }: {
  picked: Persona; agents: Set<string>; setAgents: (s: Set<string>) => void;
  onBack: () => void; onNext: () => void;
}) {
  const toggle = (id: string) => {
    const next = new Set(agents);
    next.has(id) ? next.delete(id) : next.add(id);
    setAgents(next);
  };

  const recommended = AGENTS.filter((a) => a.recommendedFor.includes(picked));
  const optional    = AGENTS.filter((a) => !a.recommendedFor.includes(picked));
  const aiMsg = `These are the agents I'd activate for a ${PERSONA_LABEL[picked]}. Each runs silently in the background and surfaces work before you need to ask.`;

  return (
    <div className="fade-in">
      <AIChatBubble text={aiMsg} className="mb-8 max-w-[640px]" />

      <div className="mono-label mb-2.5">Recommended for {PERSONA_LABEL[picked]}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-6">
        {recommended.map((a) => <AgentCard key={a.id} agent={a} on={agents.has(a.id)} onToggle={() => toggle(a.id)} highlighted />)}
      </div>

      {optional.length > 0 && (
        <>
          <div className="mono-label mb-2.5">Also available</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {optional.map((a) => <AgentCard key={a.id} agent={a} on={agents.has(a.id)} onToggle={() => toggle(a.id)} />)}
          </div>
        </>
      )}

      <NavBar onBack={onBack} onNext={onNext}
        nextLabel={`Activate ${agents.size} agent${agents.size === 1 ? "" : "s"}`} />
    </div>
  );
}

function AgentCard({ agent, on, onToggle, highlighted }: {
  agent: Agent; on: boolean; onToggle: () => void; highlighted?: boolean;
}) {
  return (
    <button onClick={onToggle}
      className={`text-left p-4 rounded-xl border transition-all ${
        on ? "border-accent-deep/40 bg-accent-soft/20 shadow-sm" : "border-line bg-surface hover:bg-surface-2"
      }`}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl grid place-items-center shrink-0 transition-colors"
          style={{ background: on ? "var(--accent)" : "var(--bg-deep)" }}>
          <agent.Icon size={15} strokeWidth={1.6}
            style={{ color: on ? "var(--accent-ink)" : "var(--muted)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-semibold text-ink leading-tight">
            {agent.name}
            {highlighted && <span className="text-[9.5px] font-mono text-accent-deep ml-1.5 uppercase tracking-wider">suggested</span>}
          </div>
          <p className="text-[11px] text-muted mt-0.5 leading-relaxed">{agent.desc}</p>
        </div>
        {/* Toggle pill */}
        <div className={`w-9 h-5 rounded-full transition-colors shrink-0 relative mt-0.5`}
          style={{ background: on ? "var(--accent)" : "var(--bg-deep)" }}>
          <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform"
            style={{ transform: on ? "translateX(18px)" : "translateX(2px)" }} />
        </div>
      </div>
    </button>
  );
}

// =====================================================================
// Step 4 — Goals / Targets
// =====================================================================

function GoalsStep({ picked, target, setTarget, onBack, onNext }: {
  picked: Persona; target: number; setTarget: (n: number) => void;
  onBack: () => void; onNext: () => void;
}) {
  const PRESETS: Record<Persona, number[]> = {
    ae:      [   800_000, 1_200_000, 1_500_000, 2_000_000, 3_000_000 ],
    am:      [   400_000,   600_000, 1_000_000, 1_500_000, 2_500_000 ],
    csm:     [ 1_500_000, 2_380_000, 4_000_000, 6_000_000, 10_000_000 ],
    manager: [ 5_000_000, 9_600_000, 14_000_000, 20_000_000, 30_000_000 ],
  };
  const presets = PRESETS[picked];
  const targetLabel: Record<Persona, string> = {
    ae:      "quarterly quota",
    am:      "expansion target",
    csm:     "retention target",
    manager: "team quota",
  };
  const aiMsg = `Last piece — what's your number? I'll calibrate health scores, forecast pacing, and risk thresholds against this ${targetLabel[picked]}.`;

  return (
    <div className="fade-in">
      <AIChatBubble text={aiMsg} className="mb-8 max-w-[640px]" />

      {/* Big target display */}
      <div className="card p-6 md:p-8 mb-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <div className="mono-label text-muted-2 mb-1">Q2 &apos;26 · {targetLabel[picked].toUpperCase()}</div>
            <div className="flex items-baseline gap-2">
              <span
                className="display tnum text-ink"
                style={{ fontSize: 44, lineHeight: 1, letterSpacing: "-0.03em" }}
              >
                {fmtMoney(target)}
              </span>
              <span className="text-[12px] text-muted">target</span>
            </div>
          </div>
          <Target size={42} strokeWidth={1.4} style={{ color: "var(--accent-deep)" }} />
        </div>

        {/* Slider */}
        <div className="mb-5">
          <input
            type="range"
            min={presets[0]}
            max={presets[presets.length - 1]}
            step={50_000}
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="w-full h-2 appearance-none rounded-full cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${((target - presets[0]) / (presets[presets.length - 1] - presets[0])) * 100}%, var(--bg-deep) ${((target - presets[0]) / (presets[presets.length - 1] - presets[0])) * 100}%, var(--bg-deep) 100%)`,
            }}
          />
          <div className="flex items-center justify-between text-[10.5px] font-mono text-muted-2 mt-1.5">
            <span>{fmtMoney(presets[0])}</span>
            <span>{fmtMoney(presets[presets.length - 1])}</span>
          </div>
        </div>

        {/* Preset chips */}
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => {
            const active = target === p;
            return (
              <button
                key={p}
                onClick={() => setTarget(p)}
                className={`text-[12px] font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  active
                    ? "bg-ink text-white border-ink"
                    : "bg-surface text-ink-2 border-line hover:border-line-strong"
                }`}
              >
                {fmtMoney(p)}
              </button>
            );
          })}
        </div>
      </div>

      {/* What changes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-2">
        {[
          { Icon: Activity, title: "Pace tracking",     body: "Alphy compares your weekly throughput against this target." },
          { Icon: Target,   title: "Health scoring",    body: "Pipeline coverage thresholds calibrate to your quota." },
          { Icon: Brain,    title: "Forecast pacing",   body: "Risk windows on commit and best case scale to this number." },
        ].map((c) => (
          <div key={c.title} className="card-soft p-3 rounded-xl">
            <c.Icon size={13} strokeWidth={1.7} className="mb-1.5" style={{ color: "var(--accent-deep)" }} />
            <div className="text-[12px] font-semibold text-ink">{c.title}</div>
            <p className="text-[10.5px] text-muted leading-relaxed mt-0.5">{c.body}</p>
          </div>
        ))}
      </div>

      <NavBar onBack={onBack} onNext={onNext} nextLabel="Lock in target" />
    </div>
  );
}

// =====================================================================
// Step 5 — Provisioning (cinematic terminal)
// =====================================================================

function ProvisioningStep({ picked, orderedAgents, activated, provLogs, connectedSources }: {
  picked: Persona; orderedAgents: Agent[]; activated: Set<string>;
  provLogs: string[]; connectedSources: Source[];
}) {
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [provLogs]);

  const done = provLogs.at(-1) === "Workspace ready.";

  return (
    <div className="fade-in">
      <div className="text-center mb-8">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full mono-label mb-4 transition-colors ${
          done ? "bg-pos-soft text-pos" : "bg-bg-deep"
        }`}>
          {done
            ? <><Check size={11} strokeWidth={2.5} /> Workspace ready</>
            : <><Loader2 size={11} className="animate-spin" /> Setting up your workspace…</>
          }
        </div>
        <h1 className="text-[26px] md:text-[32px] font-semibold tracking-tight text-ink leading-tight">
          Spinning up your <em className="italic-emph">{PERSONA_LABEL[picked]}</em> workspace
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Terminal log */}
        <div className="md:col-span-3 card-dark rounded-[18px] p-5">
          <div className="mono-label text-[10px] mb-3" style={{ color: "rgba(232,231,223,0.5)" }}>
            alphy provision log
          </div>
          <div ref={logRef} className="overflow-y-auto space-y-1.5" style={{ maxHeight: 280 }}>
            {provLogs.map((line, i) => (
              <div key={i} className="flex items-start gap-2 text-[12px] font-mono leading-relaxed"
                style={{ color: line === "Workspace ready." ? "var(--accent)" : "rgba(232,231,223,0.8)" }}>
                <span style={{ color: "rgba(200,255,61,0.5)" }}>›</span>
                <span>{line}</span>
                {i === provLogs.length - 1 && line !== "Workspace ready." && (
                  <span className="inline-block w-1.5 h-4 ml-0.5 bg-accent/70 animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Agent status panel */}
        <div className="md:col-span-2 card p-4">
          <div className="mono-label mb-3">Agents activating</div>
          <div className="space-y-2">
            {orderedAgents.map((a) => {
              const on = activated.has(a.id);
              return (
                <div key={a.id} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg grid place-items-center transition-colors"
                    style={{ background: on ? "var(--accent)" : "var(--bg-deep)" }}>
                    <a.Icon size={13} strokeWidth={1.6}
                      style={{ color: on ? "var(--accent-ink)" : "var(--muted)" }} />
                  </div>
                  <span className="flex-1 text-[11.5px] text-ink-2 truncate">{a.name.split("·")[0].trim()}</span>
                  {on
                    ? <span className="mono-label text-pos inline-flex items-center gap-0.5"><Check size={9} strokeWidth={2.5} /> live</span>
                    : <Loader2 size={11} className="animate-spin text-muted-2" />
                  }
                </div>
              );
            })}
          </div>

          <hr className="hairline my-3" />
          <div className="mono-label mb-2">Sources</div>
          <div className="flex flex-wrap gap-1.5">
            {connectedSources.map((s) => (
              <div key={s.id} className="inline-flex items-center gap-1.5 h-6 px-2 rounded-full border border-line bg-surface-2 text-[10.5px] font-medium text-ink-2">
                <Logo name={s.name} size={12} rounded={3} />
                {s.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// Step 5 — Ready
// =====================================================================

function ReadyStep({ picked, agentCount, sourceCount, target, onFinish, onTour }: {
  picked: Persona; agentCount: number; sourceCount: number; target: number;
  onFinish: () => void; onTour: () => void;
}) {
  const personaShort = PERSONA_LABEL[picked].split(" ")[0];
  const readyMsg = `Done. ${sourceCount} source${sourceCount !== 1 ? "s" : ""} are live, ${agentCount} agent${agentCount !== 1 ? "s" : ""} are running, and your number is ${fmtMoney(target)}. Your workspace is tuned to ${PERSONA_LABEL[picked].toLowerCase()} priorities.`;

  return (
    <div className="fade-in">
      {/* HERO CARD */}
      <div className="relative rounded-[28px] overflow-hidden mb-5 border border-line bg-gradient-to-br from-surface to-surface-2 shadow-[0_30px_80px_-30px_rgba(28,40,64,0.25)]">
        {/* Decorative top gradient strip */}
        <div
          className="absolute inset-x-0 top-0 h-[180px] pointer-events-none"
          style={{
            background:
              "radial-gradient(700px 220px at 50% 0%, rgba(200,255,61,0.32), transparent 70%)",
          }}
        />
        {/* Sparkle dots — micro confetti */}
        <Confetti />

        <div className="relative px-6 md:px-10 pt-12 pb-10">
          {/* Success orb */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div
                className="absolute inset-0 -m-4 rounded-full"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(200,255,61,0.55), transparent 70%)",
                  filter: "blur(8px)",
                  animation: "pulse 2.4s ease-in-out infinite",
                }}
              />
              <div
                className="absolute -inset-1 rounded-3xl opacity-90"
                style={{
                  background:
                    "conic-gradient(from 90deg, rgba(200,255,61,0.9), transparent 35%, transparent 65%, rgba(200,255,61,0.9))",
                  animation: "spin 6s linear infinite",
                  filter: "blur(1.5px)",
                }}
              />
              <div className="relative w-20 h-20 rounded-3xl bg-accent grid place-items-center shadow-[0_22px_60px_-20px_rgba(168,224,32,0.7)]">
                <Sparkles size={26} strokeWidth={1.7} style={{ color: "var(--accent-ink)" }} />
              </div>
            </div>
          </div>

          <div className="text-center mb-7">
            <div className="mono-label text-pos inline-flex items-center gap-1.5 bg-pos-soft px-2.5 py-1 rounded-full mb-4">
              <Check size={10} strokeWidth={2.5} /> Setup complete
            </div>
            <h1 className="text-[28px] md:text-[34px] font-semibold tracking-tight text-ink leading-tight mb-2">
              Your <em className="italic-emph">{PERSONA_LABEL[picked]}</em> workspace<br className="hidden md:inline"/> is ready.
            </h1>
            <p className="text-[13.5px] text-muted max-w-[480px] mx-auto leading-relaxed">
              {readyMsg}
            </p>
          </div>

          {/* Stats row — proper cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 max-w-[640px] mx-auto mb-8">
            {[
              { label: "Sources",  value: String(sourceCount), Icon: Plug,      accent: false },
              { label: "Agents",   value: String(agentCount),  Icon: Bot,       accent: true  },
              { label: "Target",   value: fmtMoney(target),    Icon: Target,    accent: false },
              { label: "Persona",  value: personaShort,         Icon: Briefcase, accent: false },
            ].map((s) => (
              <div
                key={s.label}
                className={`rounded-2xl p-3.5 text-center border ${
                  s.accent
                    ? "bg-accent border-accent-deep/40 shadow-[0_10px_30px_-12px_rgba(168,224,32,0.55)]"
                    : "bg-surface border-line"
                }`}
              >
                <s.Icon size={13} strokeWidth={1.7}
                  className="mx-auto mb-1.5"
                  style={{ color: s.accent ? "var(--accent-ink)" : "var(--muted)" }} />
                <div
                  className="text-[26px] font-bold tracking-tight tnum leading-none mb-1"
                  style={{ color: s.accent ? "var(--accent-ink)" : "var(--ink)" }}
                >
                  {s.value}
                </div>
                <div
                  className="mono-label text-[9.5px]"
                  style={{ color: s.accent ? "rgba(26,31,8,0.65)" : "var(--muted)" }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-3">
            <PrimaryButton onClick={onFinish}>
              <Rocket size={13} strokeWidth={1.8} /> Open my workspace
            </PrimaryButton>
            <button
              onClick={onTour}
              className="h-10 px-5 rounded-xl inline-flex items-center gap-1.5 text-[13px] font-semibold border border-line bg-surface text-ink hover:bg-surface-2 hover:border-line-strong transition-colors shadow-[0_2px_8px_-4px_rgba(28,40,64,0.08)]"
            >
              <LineChart size={13} strokeWidth={1.8} /> Take the 60-second tour
            </button>
          </div>
        </div>
      </div>

      {/* Next-up cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { Icon: Plug,          title: "More integrations", body: "Add 12+ connectors any time from Settings → Integrations.",         color: "var(--info)"  },
          { Icon: Bot,           title: "Agent library",     body: "Browse all 10 agents and toggle them on/off from Settings → AI Agents.", color: "var(--accent-deep)" },
          { Icon: MessageSquare, title: "Ask Alphy anything", body: "The Analyst tab lets you query your whole book in plain English.",    color: "var(--warn)"  },
        ].map((t) => (
          <button
            key={t.title}
            className="card p-4 card-lift group text-left transition-all"
            onClick={onFinish}
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <div
                className="w-7 h-7 rounded-lg grid place-items-center"
                style={{ background: "var(--bg-deep)" }}
              >
                <t.Icon size={13} strokeWidth={1.7} style={{ color: t.color }} />
              </div>
              <div className="text-[12.5px] font-semibold text-ink flex-1">{t.title}</div>
              <ChevronRight size={12} strokeWidth={1.6} className="text-muted-2 group-hover:translate-x-0.5 group-hover:text-ink transition-all" />
            </div>
            <p className="text-[11.5px] text-muted leading-relaxed pl-9">{t.body}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function Confetti() {
  // Deterministic positions so SSR/CSR match
  const dots = [
    { l: "8%",  t: "12%", s: 4, o: 0.55, c: "var(--accent)"      },
    { l: "92%", t: "18%", s: 5, o: 0.50, c: "var(--accent-deep)" },
    { l: "16%", t: "30%", s: 3, o: 0.45, c: "var(--info)"        },
    { l: "84%", t: "40%", s: 4, o: 0.40, c: "var(--accent)"      },
    { l: "6%",  t: "62%", s: 5, o: 0.35, c: "var(--warn)"        },
    { l: "94%", t: "70%", s: 3, o: 0.50, c: "var(--accent-deep)" },
    { l: "20%", t: "78%", s: 4, o: 0.40, c: "var(--accent)"      },
    { l: "78%", t: "84%", s: 3, o: 0.45, c: "var(--info)"        },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none">
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: d.l, top: d.t,
            width: d.s, height: d.s,
            background: d.c, opacity: d.o,
            animation: `pulse ${2 + (i % 4) * 0.4}s ease-in-out infinite`,
            animationDelay: `${i * 0.18}s`,
          }}
        />
      ))}
    </div>
  );
}

// =====================================================================
// Shared
// =====================================================================

function NavBar({ onBack, onNext, nextLabel }: { onBack: () => void; onNext: () => void; nextLabel: string }) {
  return (
    <div className="flex items-center justify-between mt-8">
      <button onClick={onBack}
        className="h-9 px-4 rounded-lg inline-flex items-center gap-1.5 text-[12.5px] font-medium border border-line bg-surface text-ink-2 hover:bg-surface-2">
        <ArrowLeft size={12} strokeWidth={2} /> Back
      </button>
      <PrimaryButton onClick={onNext}>{nextLabel} <ArrowRight size={13} strokeWidth={2} /></PrimaryButton>
    </div>
  );
}

function PrimaryButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className="h-10 px-5 rounded-xl inline-flex items-center gap-2 text-[13.5px] font-semibold shadow-[0_4px_16px_-6px_rgba(168,224,32,0.6)]"
      style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
      {children}
    </button>
  );
}
