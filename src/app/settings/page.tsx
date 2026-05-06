"use client";

import { useState } from "react";
import {
  User, Building2, Plug, Bot, Bell, Palette, CreditCard,
  Check, ChevronRight, Shield, Globe, Moon, Sun, Zap,
  Briefcase, Activity, Users, ToggleLeft, ToggleRight, Heart, TrendingUp,
  RefreshCw, Trash2, Plus, ArrowUpRight, Info,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Logo } from "@/components/Logo";
import { usePersona, PERSONA_LABEL } from "@/components/PersonaContext";
import { useToast } from "@/components/Toast";
import type { Persona } from "@/lib/mock";

// =====================================================================
// Types & constants
// =====================================================================

type Section =
  | "profile" | "workspace" | "integrations"
  | "agents" | "notifications" | "appearance" | "billing";

const NAV: { key: Section; label: string; Icon: typeof User; badge?: string }[] = [
  { key: "profile",      label: "Profile",        Icon: User },
  { key: "workspace",    label: "Workspace",       Icon: Building2 },
  { key: "integrations", label: "Integrations",    Icon: Plug,   badge: "3 active" },
  { key: "agents",       label: "AI Agents",       Icon: Bot,    badge: "6 on" },
  { key: "notifications",label: "Notifications",   Icon: Bell },
  { key: "appearance",   label: "Appearance",      Icon: Palette },
  { key: "billing",      label: "Billing & Plan",  Icon: CreditCard },
];

const INTEGRATIONS = [
  { id: "salesforce",    name: "Salesforce",         category: "CRM",               connected: true,  lastSync: "2 min ago" },
  { id: "gong",          name: "Gong",               category: "Call intelligence", connected: true,  lastSync: "14 min ago" },
  { id: "gmail",         name: "Gmail",              category: "Email",             connected: true,  lastSync: "1 min ago" },
  { id: "slack",         name: "Slack",              category: "Comms",             connected: false, lastSync: null },
  { id: "outlook",       name: "Outlook",            category: "Email",             connected: false, lastSync: null },
  { id: "googlecal",     name: "Google Calendar",    category: "Calendar",          connected: false, lastSync: null },
  { id: "zoom",          name: "Zoom",               category: "Calls",             connected: false, lastSync: null },
  { id: "mixpanel",      name: "Mixpanel",           category: "Product analytics", connected: false, lastSync: null },
  { id: "amplitude",     name: "Amplitude",          category: "Product analytics", connected: false, lastSync: null },
  { id: "zendesk",       name: "Zendesk",            category: "Support",           connected: false, lastSync: null },
  { id: "intercom",      name: "Intercom",           category: "Support",           connected: false, lastSync: null },
  { id: "linear",        name: "Linear",             category: "Product",           connected: false, lastSync: null },
];

const AGENTS = [
  { id: "jackie",   name: "Jackie",               role: "Pre-Meeting Prepper",  desc: "60-second brief before every call",                enabled: true,  personas: ["ae","am","csm","manager"] },
  { id: "eli",      name: "Eli",                  role: "Account Enricher",     desc: "Firmographics, news, funding into every account",  enabled: true,  personas: ["ae","am","csm","manager"] },
  { id: "sentinel", name: "Deal Hygiene Sentinel",role: "Pipeline Cop",         desc: "Flags missing close dates, stale next steps",      enabled: true,  personas: ["ae","manager"] },
  { id: "forecast", name: "Forecast Assistant",   role: "Commit Builder",       desc: "Pre-fills weekly commit from rep history",         enabled: false, personas: ["ae","am","manager"] },
  { id: "renewal",  name: "Renewal Risk Monitor", role: "Churn Watchdog",       desc: "Flags accounts 90 days pre-renewal",               enabled: true,  personas: ["csm","manager"] },
  { id: "expansion",name: "Expansion Spotter",    role: "Growth Signal",        desc: "Champion promotions, hiring, product depth",       enabled: false, personas: ["am","manager"] },
  { id: "adoption", name: "Adoption Watchdog",    role: "Onboarding Monitor",   desc: "Detects blocked steps and feature drop-offs",      enabled: true,  personas: ["csm"] },
  { id: "coaching", name: "Coaching Insights",    role: "Rep Performance",      desc: "Skills scored from call transcripts",              enabled: false, personas: ["manager"] },
  { id: "signals",  name: "Signals Scout",        role: "Market Intel",         desc: "Job changes, M&A, funding on your accounts",       enabled: true,  personas: ["am","ae","csm"] },
  { id: "outcomes", name: "Outcomes Tracker",     role: "Success Monitor",      desc: "Monitors customer-facing promises vs signals",     enabled: false, personas: ["csm","am"] },
];

// =====================================================================
// Main page
// =====================================================================

export default function SettingsPage() {
  const [section, setSection] = useState<Section>("profile");

  return (
    <AppShell>
      <div className="mb-6">
        <div className="mono-label mb-2">Settings</div>
        <h1 className="display ink-gradient" style={{ fontSize: 32, lineHeight: 1.05 }}>
          Your <span className="italic-emph">workspace</span>
        </h1>
      </div>

      <div className="flex gap-5 items-start">
        {/* Left nav */}
        <nav className="card p-2 w-[196px] shrink-0 sticky top-4">
          {NAV.map((n) => (
            <button key={n.key} onClick={() => setSection(n.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                section === n.key
                  ? "bg-ink text-white"
                  : "text-ink-2 hover:bg-bg-deep"
              }`}>
              <n.Icon size={14} strokeWidth={1.7}
                style={{ color: section === n.key ? "var(--accent)" : "inherit" }} />
              <span className="flex-1 text-[13px] font-medium">{n.label}</span>
              {n.badge && (
                <span className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded-full ${
                  section === n.key
                    ? "bg-white/15 text-white/80"
                    : "bg-bg-deep text-muted"
                }`}>{n.badge}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Right panel */}
        <div className="flex-1 min-w-0">
          {section === "profile"       && <ProfileSection />}
          {section === "workspace"     && <WorkspaceSection />}
          {section === "integrations"  && <IntegrationsSection />}
          {section === "agents"        && <AgentsSection />}
          {section === "notifications" && <NotificationsSection />}
          {section === "appearance"    && <AppearanceSection />}
          {section === "billing"       && <BillingSection />}
        </div>
      </div>
    </AppShell>
  );
}

// =====================================================================
// Section components
// =====================================================================

function SectionCard({ title, description, children }: {
  title: string; description?: string; children: React.ReactNode;
}) {
  return (
    <div className="card p-5 mb-4">
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {description && <p className="text-[12.5px] text-muted mt-0.5">{description}</p>}
      </div>
      <hr className="hairline mb-4" />
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_1fr] items-start gap-4 py-3 border-b border-line last:border-0">
      <div>
        <div className="text-[12.5px] font-medium text-ink">{label}</div>
        {hint && <div className="text-[11px] text-muted mt-0.5">{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function TextF({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full h-8 px-3 rounded-lg border border-line bg-surface text-[12.5px] text-ink focus:outline-none focus:border-accent-deep transition-colors" />
  );
}

function SelectF<T extends string>({ value, onChange, options }: {
  value: T; onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as T)}
      className="h-8 px-3 rounded-lg border border-line bg-surface text-[12.5px] text-ink focus:outline-none focus:border-accent-deep appearance-none pr-7">
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function SaveButton({ onClick, saved }: { onClick: () => void; saved: boolean }) {
  return (
    <div className="flex justify-end mt-4">
      <button onClick={onClick}
        className={`h-8 px-4 rounded-lg text-[12.5px] font-semibold inline-flex items-center gap-1.5 transition-all ${
          saved ? "bg-pos text-white" : "bg-ink text-white hover:bg-ink-2"
        }`}>
        {saved ? <><Check size={12} strokeWidth={2.5} /> Saved</> : "Save changes"}
      </button>
    </div>
  );
}

// -----------------------------------------------------------------------
// Profile
// -----------------------------------------------------------------------
function ProfileSection() {
  const toast = useToast();
  const [saved, setSaved] = useState(false);
  const [name, setName]   = useState("Walid Qayoumi");
  const [email, setEmail] = useState("walid@alphrd.ai");
  const [title, setTitle] = useState("Account Executive");
  const [phone, setPhone] = useState("+1 415 555 0182");

  const save = () => {
    setSaved(true);
    toast({ tone: "success", title: "Profile saved", body: "Your profile has been updated." });
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <SectionCard title="Personal information" description="Visible to teammates in shared workspaces.">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-line">
          <div className="w-16 h-16 rounded-2xl bg-ink text-white grid place-items-center text-[22px] font-semibold">
            WQ
          </div>
          <div>
            <div className="text-[13px] font-semibold text-ink">Walid Qayoumi</div>
            <div className="text-[11.5px] text-muted mt-0.5">Workspace: Alphard</div>
            <button className="text-[11px] text-accent-deep hover:underline mt-1.5 inline-flex items-center gap-1">
              <Plus size={10} strokeWidth={2} /> Upload photo
            </button>
          </div>
        </div>
        <Field label="Full name">
          <TextF value={name} onChange={setName} />
        </Field>
        <Field label="Work email" hint="Used for notifications">
          <TextF value={email} onChange={setEmail} />
        </Field>
        <Field label="Title / role">
          <TextF value={title} onChange={setTitle} placeholder="e.g. Account Executive" />
        </Field>
        <Field label="Phone">
          <TextF value={phone} onChange={setPhone} placeholder="+1 555 000 0000" />
        </Field>
        <SaveButton onClick={save} saved={saved} />
      </SectionCard>

      <SectionCard title="Security" description="Manage your password and two-factor authentication.">
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-[12.5px] font-medium text-ink">Password</div>
              <div className="text-[11px] text-muted">Last changed 43 days ago</div>
            </div>
            <button className="text-[11.5px] font-medium text-ink hover:underline inline-flex items-center gap-1">
              Change <ChevronRight size={11} strokeWidth={1.6} />
            </button>
          </div>
          <hr className="hairline" />
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-[12.5px] font-medium text-ink flex items-center gap-2">
                Two-factor authentication
                <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded-full bg-pos-soft text-pos">Enabled</span>
              </div>
              <div className="text-[11px] text-muted">Authenticator app · added Feb 14 2026</div>
            </div>
            <button className="text-[11.5px] font-medium text-muted hover:text-ink inline-flex items-center gap-1">
              Manage <ChevronRight size={11} strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </SectionCard>
    </>
  );
}

// -----------------------------------------------------------------------
// Workspace
// -----------------------------------------------------------------------
function WorkspaceSection() {
  const toast = useToast();
  const [saved, setSaved] = useState(false);
  const [wsName, setWsName] = useState("Alphard");
  const [tz, setTz] = useState("America/New_York");
  const [fiscal, setFiscal] = useState("February");
  const [currency, setCurrency] = useState("USD");
  const [lang, setLang] = useState("en");

  const save = () => {
    setSaved(true);
    toast({ tone: "success", title: "Workspace saved", body: "Settings updated for your entire workspace." });
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <SectionCard title="Workspace settings" description="Applies to everyone in your Alphard workspace.">
        <Field label="Workspace name">
          <TextF value={wsName} onChange={setWsName} />
        </Field>
        <Field label="Timezone" hint="Used for scheduled digests">
          <SelectF value={tz} onChange={setTz} options={[
            { value: "America/New_York",    label: "Eastern Time (ET)" },
            { value: "America/Chicago",     label: "Central Time (CT)" },
            { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
            { value: "Europe/London",       label: "GMT / London" },
            { value: "Europe/Berlin",       label: "Central European (CET)" },
            { value: "Asia/Singapore",      label: "Singapore (SGT)" },
          ]} />
        </Field>
        <Field label="Fiscal year start">
          <SelectF value={fiscal} onChange={setFiscal} options={[
            { value: "January",  label: "January" },
            { value: "February", label: "February" },
            { value: "April",    label: "April" },
            { value: "July",     label: "July" },
            { value: "October",  label: "October" },
          ]} />
        </Field>
        <Field label="Currency">
          <SelectF value={currency} onChange={setCurrency} options={[
            { value: "USD", label: "USD — US Dollar" },
            { value: "EUR", label: "EUR — Euro" },
            { value: "GBP", label: "GBP — British Pound" },
            { value: "CAD", label: "CAD — Canadian Dollar" },
          ]} />
        </Field>
        <Field label="Language">
          <SelectF value={lang} onChange={setLang} options={[
            { value: "en", label: "English" },
            { value: "de", label: "Deutsch" },
            { value: "fr", label: "Français" },
          ]} />
        </Field>
        <SaveButton onClick={save} saved={saved} />
      </SectionCard>

      <SectionCard title="Danger zone" description="These actions are irreversible.">
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="text-[12.5px] font-medium text-ink">Delete workspace</div>
            <div className="text-[11px] text-muted">Permanently removes all data, integrations, and agent history.</div>
          </div>
          <button className="text-[11.5px] font-semibold text-neg hover:underline inline-flex items-center gap-1.5">
            <Trash2 size={11} strokeWidth={1.7} /> Delete
          </button>
        </div>
      </SectionCard>
    </>
  );
}

// -----------------------------------------------------------------------
// Integrations
// -----------------------------------------------------------------------
function IntegrationsSection() {
  const toast = useToast();
  const [connected, setConnected] = useState<Set<string>>(
    new Set(INTEGRATIONS.filter((i) => i.connected).map((i) => i.id))
  );

  const toggle = (id: string, name: string) => {
    const wasOn = connected.has(id);
    setConnected((prev) => {
      const next = new Set(prev);
      wasOn ? next.delete(id) : next.add(id);
      return next;
    });
    toast({
      tone: wasOn ? "info" : "success",
      title: wasOn ? `${name} disconnected` : `${name} connected`,
      body: wasOn ? "Data sync paused." : "Syncing now…",
    });
  };

  const categories = [...new Set(INTEGRATIONS.map((i) => i.category))];

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">Integrations</h2>
          <p className="text-[12.5px] text-muted mt-0.5">
            {connected.size} of {INTEGRATIONS.length} connected
          </p>
        </div>
        <span className="text-[10.5px] font-mono text-muted inline-flex items-center gap-1.5">
          <RefreshCw size={10} strokeWidth={1.8} /> All sources sync every 5 min
        </span>
      </div>
      <hr className="hairline mb-4" />

      {categories.map((cat) => {
        const items = INTEGRATIONS.filter((i) => i.category === cat);
        return (
          <div key={cat} className="mb-5 last:mb-0">
            <div className="mono-label mb-2">{cat}</div>
            <div className="space-y-1">
              {items.map((item) => {
                const on = connected.has(item.id);
                return (
                  <div key={item.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-deep transition-colors">
                    <Logo name={item.name} size={32} rounded={8} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-semibold text-ink">{item.name}</div>
                      {on && item.lastSync && (
                        <div className="text-[10.5px] text-muted">Last synced {item.lastSync}</div>
                      )}
                      {!on && (
                        <div className="text-[10.5px] text-muted-2">Not connected</div>
                      )}
                    </div>
                    {on && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-pos-soft text-pos">
                        Active
                      </span>
                    )}
                    <button onClick={() => toggle(item.id, item.name)}
                      className={`h-7 px-3 rounded-lg text-[11.5px] font-medium transition-colors ${
                        on
                          ? "bg-bg-deep text-ink hover:bg-neg-soft hover:text-neg"
                          : "bg-ink text-white hover:bg-ink-2"
                      }`}>
                      {on ? "Disconnect" : "Connect"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// -----------------------------------------------------------------------
// Agents
// -----------------------------------------------------------------------
function AgentsSection() {
  const toast = useToast();
  const { persona } = usePersona();
  const [agentState, setAgentState] = useState<Record<string, boolean>>(
    Object.fromEntries(AGENTS.map((a) => [a.id, a.enabled]))
  );

  const toggle = (id: string, name: string) => {
    const wasOn = agentState[id];
    setAgentState((prev) => ({ ...prev, [id]: !wasOn }));
    toast({
      tone: wasOn ? "info" : "success",
      title: wasOn ? `${name} paused` : `${name} activated`,
      body: wasOn ? "Agent will stop processing." : "Agent is now monitoring.",
    });
  };

  const myAgents  = AGENTS.filter((a) => a.personas.includes(persona));
  const otherAgents = AGENTS.filter((a) => !a.personas.includes(persona));
  const activeCount = Object.values(agentState).filter(Boolean).length;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">AI Agents</h2>
          <p className="text-[12.5px] text-muted mt-0.5">{activeCount} of {AGENTS.length} active</p>
        </div>
        <span className="text-[10.5px] font-mono text-muted bg-bg-deep px-2 py-1 rounded-full">
          Persona: {PERSONA_LABEL[persona]}
        </span>
      </div>
      <hr className="hairline mb-4" />

      <div className="mono-label mb-2">Recommended for your role</div>
      <div className="space-y-1 mb-5">
        {myAgents.map((agent) => (
          <AgentRow key={agent.id} agent={agent} on={agentState[agent.id]} onToggle={() => toggle(agent.id, agent.name)} />
        ))}
      </div>

      {otherAgents.length > 0 && (
        <>
          <div className="mono-label mb-2">Other agents</div>
          <div className="space-y-1">
            {otherAgents.map((agent) => (
              <AgentRow key={agent.id} agent={agent} on={agentState[agent.id]} onToggle={() => toggle(agent.id, agent.name)} dimmed />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function AgentRow({ agent, on, onToggle, dimmed }: {
  agent: typeof AGENTS[0]; on: boolean; onToggle: () => void; dimmed?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-deep transition-colors ${dimmed ? "opacity-60" : ""}`}>
      <div className={`w-9 h-9 rounded-xl grid place-items-center transition-colors ${
        on ? "bg-accent" : "bg-bg-deep"
      }`}>
        <Zap size={15} strokeWidth={1.7} style={{ color: on ? "var(--accent-ink)" : "var(--muted)" }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-semibold text-ink">{agent.name}
          <span className="text-[10.5px] font-normal text-muted ml-1.5">· {agent.role}</span>
        </div>
        <div className="text-[10.5px] text-muted truncate">{agent.desc}</div>
      </div>
      <button onClick={onToggle} className="shrink-0">
        {on
          ? <ToggleRight size={26} strokeWidth={1.5} style={{ color: "var(--accent-deep)" }} />
          : <ToggleLeft  size={26} strokeWidth={1.5} style={{ color: "var(--muted-2)" }} />
        }
      </button>
    </div>
  );
}

// -----------------------------------------------------------------------
// Notifications
// -----------------------------------------------------------------------
function NotificationsSection() {
  const toast = useToast();
  type Channel = "email" | "slack" | "inapp";

  const NOTIF_ROWS: { id: string; label: string; desc: string }[] = [
    { id: "deal_risk",     label: "Deal risk alert",        desc: "When a deal goes overdue or champion goes silent" },
    { id: "renewal_risk",  label: "Renewal risk alert",     desc: "Account flagged 90 days before renewal" },
    { id: "qbr_due",       label: "QBR overdue",            desc: "QBR date passes without logging" },
    { id: "signal_new",    label: "New AI signal",          desc: "Champion change, funding round, job move" },
    { id: "agent_digest",  label: "Daily agent digest",     desc: "What your agents found overnight" },
    { id: "forecast_week", label: "Weekly forecast nudge",  desc: "Commit reminder every Monday" },
    { id: "onboard_stuck", label: "Onboarding stuck",       desc: "Customer onboarding step blocked 48h" },
    { id: "nps_low",       label: "Low NPS alert",          desc: "Customer NPS drops below 6" },
  ];

  const [prefs, setPrefs] = useState<Record<string, Set<Channel>>>(() =>
    Object.fromEntries(NOTIF_ROWS.map((r, i) => [
      r.id,
      new Set<Channel>(i < 4 ? ["email","inapp"] : i < 6 ? ["inapp"] : []),
    ]))
  );

  const toggle = (id: string, ch: Channel) => {
    setPrefs((prev) => {
      const set = new Set(prev[id]);
      set.has(ch) ? set.delete(ch) : set.add(ch);
      return { ...prev, [id]: set };
    });
  };

  const save = () => toast({ tone: "success", title: "Notifications saved", body: "Preferences updated." });

  return (
    <div className="card p-5">
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold text-ink">Notifications</h2>
        <p className="text-[12.5px] text-muted mt-0.5">Choose where each alert fires.</p>
      </div>
      <hr className="hairline mb-0" />

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left mono-label py-3 pr-4 font-medium">Alert type</th>
              <th className="mono-label py-3 w-20 text-center font-medium">Email</th>
              <th className="mono-label py-3 w-20 text-center font-medium">Slack</th>
              <th className="mono-label py-3 w-20 text-center font-medium">In-app</th>
            </tr>
          </thead>
          <tbody>
            {NOTIF_ROWS.map((row) => (
              <tr key={row.id} className="border-t border-line hover:bg-bg-deep/50">
                <td className="py-2.5 pr-4">
                  <div className="text-[12.5px] font-medium text-ink">{row.label}</div>
                  <div className="text-[11px] text-muted">{row.desc}</div>
                </td>
                {(["email","slack","inapp"] as Channel[]).map((ch) => (
                  <td key={ch} className="py-2.5 text-center">
                    <button onClick={() => toggle(row.id, ch)}
                      className="w-5 h-5 mx-auto rounded grid place-items-center transition-colors"
                      style={{
                        background: prefs[row.id]?.has(ch) ? "var(--ink)" : "transparent",
                        border: prefs[row.id]?.has(ch) ? "none" : "1px solid var(--line-strong)",
                      }}>
                      {prefs[row.id]?.has(ch) && <Check size={10} strokeWidth={2.5} style={{ color: "white" }} />}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-4">
        <button onClick={save}
          className="h-8 px-4 rounded-lg text-[12.5px] font-semibold bg-ink text-white hover:bg-ink-2 inline-flex items-center gap-1.5">
          Save preferences
        </button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Appearance
// -----------------------------------------------------------------------
function AppearanceSection() {
  const toast = useToast();
  const { persona, setPersona } = usePersona();
  const [theme, setTheme] = useState<"light" | "system">("light");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [saved, setSaved] = useState(false);

  const PERSONA_OPTIONS: { id: Persona; label: string; desc: string; Icon: typeof Briefcase }[] = [
    { id: "ae",      label: "Account Executive", desc: "Pipeline, deals, forecast",   Icon: Briefcase },
    { id: "am",      label: "Account Manager",   desc: "Expansion, cross-sell, deals",Icon: TrendingUp },
    { id: "csm",     label: "Customer Success",  desc: "Health, renewals, adoption",  Icon: Heart },
    { id: "manager", label: "Sales Manager",     desc: "Team, coaching, roll-ups",    Icon: Users },
  ];

  const save = () => {
    setSaved(true);
    toast({ tone: "success", title: "Appearance saved", body: "Changes take effect immediately." });
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <SectionCard title="Persona" description="Morphs your home view, agents, and signal filters.">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {PERSONA_OPTIONS.map((p) => {
            const active = persona === p.id;
            return (
              <button key={p.id} onClick={() => setPersona(p.id)}
                className="text-left p-3.5 rounded-xl border transition-all relative"
                style={active ? {
                  borderColor: "transparent",
                  boxShadow: "0 0 0 2px var(--accent)",
                  background: "var(--surface)",
                } : {
                  borderColor: "var(--line)",
                  background: "var(--surface-2)",
                }}>
                {active && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-accent grid place-items-center">
                    <Check size={9} strokeWidth={2.5} style={{ color: "var(--accent-ink)" }} />
                  </span>
                )}
                <div className={`w-8 h-8 rounded-lg grid place-items-center mb-2 ${active ? "bg-accent" : "bg-bg-deep"}`}>
                  <p.Icon size={15} strokeWidth={1.7} style={{ color: active ? "var(--accent-ink)" : "var(--muted)" }} />
                </div>
                <div className="text-[12px] font-semibold text-ink">{p.label}</div>
                <div className="text-[10.5px] text-muted mt-0.5">{p.desc}</div>
              </button>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Theme & density">
        <Field label="Color theme">
          <div className="flex gap-2">
            {[
              { key: "light" as const,  label: "Light", Icon: Sun },
              { key: "system" as const, label: "System", Icon: Globe },
            ].map((t) => (
              <button key={t.key} onClick={() => setTheme(t.key)}
                className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border text-[12px] font-medium transition-colors ${
                  theme === t.key ? "border-accent-deep bg-accent-soft text-accent-ink" : "border-line text-muted hover:border-line-strong"
                }`}>
                <t.Icon size={12} strokeWidth={1.7} /> {t.label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Information density">
          <div className="flex gap-2">
            {[
              { key: "comfortable" as const, label: "Comfortable" },
              { key: "compact" as const,     label: "Compact" },
            ].map((d) => (
              <button key={d.key} onClick={() => setDensity(d.key)}
                className={`h-8 px-3 rounded-lg border text-[12px] font-medium transition-colors ${
                  density === d.key ? "border-accent-deep bg-accent-soft text-accent-ink" : "border-line text-muted hover:border-line-strong"
                }`}>
                {d.label}
              </button>
            ))}
          </div>
        </Field>
        <SaveButton onClick={save} saved={saved} />
      </SectionCard>
    </>
  );
}

// -----------------------------------------------------------------------
// Billing
// -----------------------------------------------------------------------
function BillingSection() {
  return (
    <>
      <SectionCard title="Current plan" description="You are on the Growth plan.">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[22px] font-bold text-ink">Growth</span>
              <span className="mono-label text-pos bg-pos-soft px-2 py-0.5 rounded-full">Active</span>
            </div>
            <div className="text-[12.5px] text-muted mt-1">$79 / seat / month · billed annually</div>
          </div>
          <button className="h-8 px-4 rounded-lg border border-line text-[12px] font-medium text-ink hover:bg-bg-deep inline-flex items-center gap-1.5">
            Upgrade <ArrowUpRight size={11} strokeWidth={1.7} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Seats",       value: "4 / 10 used" },
            { label: "Agents",      value: "6 / 10 active" },
            { label: "Data sources",value: "3 / 12 connected" },
          ].map((m) => (
            <div key={m.label} className="recessed p-3">
              <div className="mono-label mb-1">{m.label}</div>
              <div className="text-[14px] font-semibold text-ink">{m.value}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Billing details">
        <Field label="Billing email">
          <TextF value="billing@alphrd.ai" onChange={() => {}} />
        </Field>
        <Field label="Next invoice">
          <div className="text-[12.5px] text-ink font-medium">June 1, 2026 · $316.00</div>
        </Field>
        <Field label="Payment method">
          <div className="flex items-center gap-2 text-[12.5px] text-ink">
            <span className="font-mono bg-bg-deep px-2 py-0.5 rounded">Visa ···· 4242</span>
            <button className="text-[11px] text-muted hover:text-ink">Change</button>
          </div>
        </Field>
      </SectionCard>

      <SectionCard title="Usage this month">
        <div className="space-y-3">
          {[
            { label: "AI calls (GPT-4o)",     used: 4820,  cap: 10000 },
            { label: "Signal scans",           used: 12100, cap: 25000 },
            { label: "Agent runs",             used: 1340,  cap: 5000 },
          ].map((u) => (
            <div key={u.label}>
              <div className="flex justify-between text-[11.5px] mb-1">
                <span className="text-ink-2 font-medium">{u.label}</span>
                <span className="text-muted tnum">{u.used.toLocaleString()} / {u.cap.toLocaleString()}</span>
              </div>
              <div className="health-bar">
                <span style={{ width: `${(u.used / u.cap) * 100}%`, background: u.used / u.cap > 0.85 ? "var(--warn)" : "var(--accent-deep)" }} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}
