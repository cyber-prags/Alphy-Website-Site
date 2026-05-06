"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2, Calendar, Mail, Phone, Globe, MapPin, Users, ChevronLeft,
  Sparkles, Heart, AlertTriangle, TrendingUp, Activity, Globe2, Video, FileText,
  Plus, Star, Pin, Target, Network, Presentation, Download, ArrowRight, Check, X, Send, Hash,
  Clock, Zap, DollarSign, BarChart3, Play, Pause, ChevronRight, ExternalLink,
  MessageSquare, Milestone, Eye, ThumbsUp, ThumbsDown, Handshake, Award, Flag, Shield,
  Crown, CheckCircle2, Circle,
} from "lucide-react";
import { OrgChart } from "@/components/OrgChart";
import { Popover, MenuItem } from "@/components/Popover";
import { DraftDeckModal, type DeckTemplate } from "@/components/DraftDeckModal";
import { AdoptionPanel } from "@/components/AdoptionPanel";
import { accountAdoption, expansionOpportunities, championChanges, fmtMoney as fmtMoneyShort, slugify as slugifyMock } from "@/lib/mock";
import { useUser } from "@/components/UserContext";
import { Flame } from "lucide-react";
import { SourceChip } from "@/components/SourceChip";
import { StakeholderEditor } from "@/components/StakeholderEditor";
import { WhiteSpaceMatrix } from "@/components/WhiteSpaceMatrix";
import { SuccessPlanBuilder } from "@/components/SuccessPlanBuilder";
import { AppShell } from "@/components/AppShell";
import { Logo, getBrand } from "@/components/Logo";
import {
  accountDetails, accounts, outcomes, deals, workflows as allWorkflows, fmtMoney, fmtFullMoney, fmtDate, slugify,
  activityComments, successPlans, accountPlans, accountDocs, type ActivityComment as ActivityCommentType,
  type AccountDetail, type Stakeholder, type AccountSignal, type WorkflowRow,
  type AccountPlan, type PlanTask, type PlanMilestone, type TaskStatus, type DocNode,
} from "@/lib/mock";
import { MentionInput } from "@/components/MentionInput";
import { useToast } from "@/components/Toast";

const TABS = [
  { id: "brief"      as const, label: "Brief" },
  { id: "growth"     as const, label: "Growth Plan" },
  { id: "notes"      as const, label: "Notes" },
  { id: "analytics"  as const, label: "Analytics" },
  { id: "whitespace" as const, label: "White Space" },
  { id: "journey"    as const, label: "Journey" },
  { id: "outcomes"   as const, label: "Outcomes" },
  { id: "people"     as const, label: "People" },
  { id: "activity"   as const, label: "Activity" },
  { id: "deals"      as const, label: "Deals" },
  { id: "plans"      as const, label: "Plans" },
  { id: "docs"       as const, label: "Docs" },
  { id: "workflows"  as const, label: "Workflows" },
];

type TabId = typeof TABS[number]["id"];

export default function AccountSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();

  // Try detail map first, then trim trailing hyphens (common typo), then match by slugified name.
  const trimmedSlug = slug.replace(/^-+|-+$/g, "");
  const detail = accountDetails[slug] ?? accountDetails[trimmedSlug];
  const fallback = accounts.find((a) => slugify(a.name) === slug || slugify(a.name) === trimmedSlug);
  const resolvedSlug = detail ? (accountDetails[slug] ? slug : trimmedSlug) : (fallback ? slugify(fallback.name) : slug);

  if (!detail && !fallback) {
    return (
      <AppShell>
        <div className="card p-8 text-center">
          <div className="text-[14px] font-semibold text-ink">Account not found</div>
          <div className="text-[12px] text-muted mt-1">slug: {slug}</div>
          <Link href="/accounts" className="inline-block mt-4 text-[12px] text-ink underline">Back to Accounts</Link>
        </div>
      </AppShell>
    );
  }

  const a: AccountDetail = detail ?? buildFallback(fallback!);
  return <AccountWorkspace account={a} slug={resolvedSlug} backHref="/accounts" />;
}

function buildFallback(a: typeof accounts[number]): AccountDetail {
  return {
    name: a.name, domain: a.domain, segment: a.segment, arr: a.arr, status: a.status,
    owner: a.owner, ownerInitials: a.ownerInitials, health: a.health, healthScore: 75,
    renewalDays: 180, nrr: 110, lastQbrDays: 45,
    hq: a.hq, industry: a.industry, employees: a.employees,
    stakeholders: [], signals: [],
  };
}

function AccountWorkspace({ account, slug, backHref }: { account: AccountDetail; slug: string; backHref: string }) {
  const toast = useToast();
  const [tab, setTab] = useState<TabId>("brief");
  const [pinned, setPinned] = useState(false);
  const [deckOpen, setDeckOpen] = useState(false);
  const [deckTemplate, setDeckTemplate] = useState<DeckTemplate>("qbr");
  // Editable stakeholders (so add/edit/delete persist while on this page)
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(account.stakeholders);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Stakeholder | null>(null);

  const accountOutcomes = outcomes.filter((o) => o.account === account.name);
  const accountDeals = deals.filter((d) => d.account === account.name || d.name === account.name);
  const adoption = accountAdoption[slug];

  const openDeck = (t: DeckTemplate) => { setDeckTemplate(t); setDeckOpen(true); };
  const openAddStakeholder = () => { setEditing(null); setEditorOpen(true); };
  const openEditStakeholder = (s: Stakeholder) => { setEditing(s); setEditorOpen(true); };
  const saveStakeholder = (next: Stakeholder) => {
    setStakeholders((prev) => {
      const existing = prev.findIndex((s) => s.name === editing?.name);
      if (existing >= 0) { const copy = [...prev]; copy[existing] = next; return copy; }
      return [...prev, next];
    });
    toast({ tone: "success", title: editing ? "Stakeholder updated" : "Stakeholder added", body: next.name });
    setEditorOpen(false);
  };
  const deleteStakeholder = (name: string) => {
    setStakeholders((prev) => prev
      .filter((s) => s.name !== name)
      .map((s) => s.reportsTo === name ? { ...s, reportsTo: undefined } : s));
    toast({ tone: "success", title: "Stakeholder removed", body: name });
  };
  const liveAccount: AccountDetail = { ...account, stakeholders };

  return (
    <AppShell>
      {/* Notion-style page header */}
      <NotionAccountHeader
        account={liveAccount}
        backHref={backHref}
        pinned={pinned}
        onPin={() => { setPinned(!pinned); toast({ tone: "success", title: pinned ? "Unpinned" : "Pinned to rail", body: account.name }); }}
        onBuildDeck={() => openDeck("qbr")}
      />

      {/* Tab strip */}
      <div className="flex gap-1 mb-3 border-b border-line">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`text-[12.5px] font-medium px-3 py-2 -mb-px ${
              tab === t.id ? "text-ink border-b-2 border-ink" : "text-muted hover:text-ink"
            }`}>
            {t.label}
            {t.id === "outcomes" && accountOutcomes.length > 0 && (
              <span className="ml-1 text-[10px] font-mono tnum text-muted">{accountOutcomes.length}</span>
            )}
            {t.id === "people" && account.stakeholders.length > 0 && (
              <span className="ml-1 text-[10px] font-mono tnum text-muted">{account.stakeholders.length}</span>
            )}
            {t.id === "activity" && account.signals.length > 0 && (
              <span className="ml-1 text-[10px] font-mono tnum text-muted">{account.signals.length}</span>
            )}
            {t.id === "deals" && accountDeals.length > 0 && (
              <span className="ml-1 text-[10px] font-mono tnum text-muted">{accountDeals.length}</span>
            )}
            {t.id === "plans" && accountPlans.filter(p => p.accountSlug === slug).length > 0 && (
              <span className="ml-1 text-[10px] font-mono tnum text-muted">{accountPlans.filter(p => p.accountSlug === slug).length}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "brief"      && <BriefPanel account={liveAccount} outcomes={accountOutcomes} deals={accountDeals} adoption={adoption} onJumpTab={setTab} />}
      {tab === "growth"     && <GrowthPlanPanel account={liveAccount} slug={slug} />}
      {tab === "notes"      && <NotesPanel slug={slug} accountName={liveAccount.name} />}
      {tab === "analytics"  && <AnalyticsPanel account={liveAccount} adoption={adoption} />}
      {tab === "whitespace" && <WhiteSpaceMatrix account={liveAccount} slug={slug} />}
      {tab === "journey"    && <JourneyPanel account={liveAccount} />}
      {tab === "outcomes"  && <OutcomesPanel account={liveAccount} outcomes={accountOutcomes} slug={slug} />}
      {tab === "people"    && <PeoplePanel account={liveAccount} onAdd={openAddStakeholder} onEdit={openEditStakeholder} />}
      {tab === "activity"  && <ActivityPanel account={liveAccount} slug={slug} />}
      {tab === "deals"     && <DealsPanel deals={accountDeals} account={liveAccount} />}
      {tab === "plans"     && <PlansPanel slug={slug} />}
      {tab === "docs"      && <DocumentsPanel slug={slug} />}
      {tab === "workflows" && <AccountWorkflowsPanel slug={slug} />}

      <DraftDeckModal open={deckOpen} account={liveAccount} template={deckTemplate} onClose={() => setDeckOpen(false)} />
      <StakeholderEditor open={editorOpen} onClose={() => setEditorOpen(false)}
        existing={editing} onSave={saveStakeholder} onDelete={deleteStakeholder}
        allStakeholders={stakeholders} />
    </AppShell>
  );
}

function healthTone(score: number) {
  if (score >= 80) return "var(--pos)";
  if (score >= 60) return "var(--warn)";
  return "var(--neg)";
}

// ---------------------------------------------------------------------
// NOTION-STYLE PAGE HEADER
// Slim breadcrumb, large title with logo as page icon, properties block
// (icon + label + value rows), description, then quick actions on the
// right. Replaces the previous brand-stripe + KPI-card header.
// ---------------------------------------------------------------------
function NotionAccountHeader({
  account, backHref, pinned, onPin, onBuildDeck,
}: {
  account: AccountDetail;
  backHref: string;
  pinned: boolean;
  onPin: () => void;
  onBuildDeck: () => void;
}) {
  const isCustomer = account.status === "Customer";
  const renewalLabel = !isCustomer
    ? "—"
    : account.renewalDays > 0 ? `${account.renewalDays} days`
    : account.renewalDays < 0 ? `${Math.abs(account.renewalDays)} days ago`
    : "Today";
  const renewalTone = !isCustomer
    ? "var(--muted-2)"
    : account.renewalDays > 60 ? "var(--ink)"
    : account.renewalDays > 0 ? "var(--warn)"
    : "var(--neg)";

  return (
    <div className="mb-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[11.5px] text-muted mb-5">
        <Link href={backHref} className="hover:text-ink inline-flex items-center gap-1">
          <ChevronLeft size={12} strokeWidth={1.6} />Accounts
        </Link>
        <span className="text-muted-2">/</span>
        <span className="text-ink-2">{account.name}</span>
      </div>

      {/* Title row — logo as page icon, title, actions */}
      <div className="flex items-start gap-4 mb-2">
        <div className="shrink-0 mt-1">
          <Logo name={account.name} size={48} rounded={10} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-[34px] font-bold text-ink leading-tight tracking-tight">{account.name}</h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <StatusChip status={account.status} />
            <SegmentChip segment={account.segment} />
            <span className="text-[11.5px] text-muted">{account.industry}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={onBuildDeck}
            className="text-[11.5px] font-semibold inline-flex items-center gap-1.5 h-8 px-3 rounded-lg shadow-[0_4px_12px_-4px_rgba(168,224,32,0.45)]"
            style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
            <Presentation size={11} strokeWidth={1.8} />
            Build a deck
          </button>
          <button onClick={onPin}
            className="text-[11.5px] font-medium inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-line bg-surface hover:bg-bg-deep">
            <Pin size={11} strokeWidth={1.8} fill={pinned ? "currentColor" : "transparent"} />
            {pinned ? "Pinned" : "Pin"}
          </button>
        </div>
      </div>

      {/* Properties block — Notion-style stacked rows */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 max-w-3xl">
        <PropertyRow icon={<Heart size={12} strokeWidth={1.7} />} label="Health">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold tnum" style={{ color: healthTone(account.healthScore) }}>
              {account.healthScore}/100
            </span>
            <div className="w-20 h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-deep)" }}>
              <div style={{ width: `${account.healthScore}%`, height: "100%", background: healthTone(account.healthScore) }} />
            </div>
          </div>
        </PropertyRow>
        {(() => {
          const opps = expansionOpportunities.filter(o => o.accountName === account.name);
          if (opps.length === 0) return null;
          const topScore = Math.max(...opps.map(o => o.score));
          const pipeline = opps.reduce((s, o) => s + o.estimatedArr, 0);
          const sc = topScore >= 85 ? "#F5360F" : topScore >= 75 ? "#F5B900" : "var(--accent)";
          return (
            <PropertyRow icon={<Flame size={12} strokeWidth={1.7} />} label="Expansion">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold tnum" style={{ color: sc }}>
                  {topScore}/100
                </span>
                <div className="w-20 h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-deep)" }}>
                  <div style={{ width: `${topScore}%`, height: "100%", background: sc }} />
                </div>
                <span className="text-[10.5px] font-mono tnum text-muted ml-1">
                  {fmtMoneyShort(pipeline)} pipeline
                </span>
              </div>
            </PropertyRow>
          );
        })()}
        <PropertyRow icon={<Users size={12} strokeWidth={1.7} />} label="Owner">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-ink text-white grid place-items-center text-[7.5px] font-semibold">
              {account.ownerInitials}
            </div>
            <span className="text-[12px] text-ink">{account.owner}</span>
          </div>
        </PropertyRow>
        <PropertyRow icon={<TrendingUp size={12} strokeWidth={1.7} />} label={isCustomer ? "ARR" : "Pipeline"}>
          <span className="text-[12px] font-semibold tnum text-ink">
            {account.arr ? fmtMoney(account.arr) : "—"}
          </span>
        </PropertyRow>
        <PropertyRow icon={<Activity size={12} strokeWidth={1.7} />} label="NRR">
          <span className="text-[12px] font-semibold tnum"
            style={{ color: isCustomer && account.nrr >= 100 ? "var(--pos)" : isCustomer && account.nrr > 0 ? "var(--neg)" : "var(--muted-2)" }}>
            {isCustomer && account.nrr ? `${account.nrr}%` : "—"}
          </span>
        </PropertyRow>
        <PropertyRow icon={<Calendar size={12} strokeWidth={1.7} />} label="Renewal">
          <span className="text-[12px] font-semibold tnum" style={{ color: renewalTone }}>
            {renewalLabel}
          </span>
        </PropertyRow>
        <PropertyRow icon={<Building2 size={12} strokeWidth={1.7} />} label="Employees">
          <span className="text-[12px] text-ink tnum">{account.employees.toLocaleString()}</span>
        </PropertyRow>
        <PropertyRow icon={<Globe size={12} strokeWidth={1.7} />} label="Domain">
          <span className="text-[12px] text-ink">{account.domain}</span>
        </PropertyRow>
        <PropertyRow icon={<MapPin size={12} strokeWidth={1.7} />} label="HQ">
          <span className="text-[12px] text-ink">{account.hq}</span>
        </PropertyRow>
      </div>

      {/* Live signal — like Notion's page description */}
      {account.signals[0] && (
        <div className="mt-5 flex items-start gap-2 max-w-3xl">
          <Sparkles size={12} strokeWidth={1.7} className="mt-0.5 shrink-0" style={{ color: "var(--accent-deep)" }} />
          <p className="text-[12.5px] text-ink-2 leading-relaxed">{account.signals[0].body}</p>
        </div>
      )}

      <div className="mt-6 border-b border-line" />
    </div>
  );
}

function PropertyRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-1.5 group">
      <div className="flex items-center gap-1.5 w-28 shrink-0 text-muted">
        <span className="opacity-70">{icon}</span>
        <span className="text-[11px]">{label}</span>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// BRIEF PANEL — single-scroll account brief, optimised for live calls
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// BRIEF PANEL — three-column layout: how they're feeling | calls + tickets | internal activity
// ---------------------------------------------------------------------
function BriefPanel({ account, outcomes, deals, adoption, onJumpTab }: {
  account: AccountDetail; outcomes: any[]; deals: any[]; adoption: any;
  onJumpTab: (t: TabId) => void;
}) {
  const [openCall, setOpenCall] = useState<CallRecording | null>(null);
  return (
    <div className="space-y-4">
      {/* AI Overview — generative account summary */}
      <AIOverviewCard account={account} adoption={adoption} />

      {/* Lifecycle baton — who owns the account at each phase */}
      <LifecycleBaton account={account} />

      {account.status === "Customer" && account.renewalDays > 0 && account.renewalDays <= 90 && (
        <HandoffCard account={account} />
      )}
      {(account.status === "Prospect" || (account.status === "Customer" && account.lastQbrDays >= 60)) && (
        <OnboardingFollowupCard account={account} />
      )}

      <div className="grid grid-cols-12 gap-4">
        {/* LEFT — how they're feeling */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <CustomerSideCard account={account} adoption={adoption} />
          <FieldsPanelCard account={account} adoption={adoption} />
        </div>

        {/* MIDDLE — call recordings + tickets (replaces video + reviews) */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <CallRecordingsCard account={account} onOpen={setOpenCall} />
          <TicketsCard account={account} />
        </div>

        {/* RIGHT — internal activity */}
        <div className="col-span-12 lg:col-span-3">
          <InternalActivityCard account={account} />
        </div>
      </div>

      <CallDetailDrawer call={openCall} onClose={() => setOpenCall(null)} account={account} />
    </div>
  );
}

// ---------------------------------------------------------------------
// USAGE BLOCK — Userflow-inspired summary
// Active users sparkline · activation funnel · main features · 14-day grid
// ---------------------------------------------------------------------
function UsageBlock({ account, adoption, onSeeMore }: { account: AccountDetail; adoption: any; onSeeMore: () => void }) {
  // Activation funnel — derive from health score so it reflects account state
  const h = account.healthScore;
  const funnel = [
    { label: "Signed up",   pct: 100,                                  emoji: "👋" },
    { label: "Setup",       pct: clamp(h + 10, 60, 100),               emoji: "⚙️" },
    { label: "Aha moment",  pct: clamp(h + 5, 50, 100),                emoji: "✨" },
    { label: "Activated",   pct: clamp(h - 5, 30, 100),                emoji: "🚀" },
    { label: "Power user",  pct: clamp(h - 25, 10, 90),                emoji: "🏆" },
  ];

  const activeUsers = Math.round(adoption.monthlyActiveUsers * 0.36); // weekly active estimate
  const seatUtilPct = Math.round((adoption.monthlyActiveUsers / adoption.totalSeats) * 100);

  // Main features — derived from adoption data, formatted as count + users
  const topFeatures = adoption.features.slice(0, 4).map((f: any) => ({
    name:  f.name,
    usage: Math.round(f.adoptionPct * adoption.totalSeats * 0.6),
    users: Math.round(f.adoptionPct * adoption.totalSeats / 100),
    trend: f.trend,
    trendPct: f.trendPct,
  }));

  // Per-user 14-day activity rows — synthesized so the grid feels alive
  const sampleUsers = topUsersFor(account, adoption);

  return (
    <div className="rounded-xl border border-line bg-surface overflow-hidden">
      <div className="px-5 py-3 border-b border-line flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={13} strokeWidth={1.7} style={{ color: "var(--accent-deep)" }} />
          <span className="text-[13px] font-semibold text-ink">Product usage</span>
          <span className="text-[10.5px] text-muted">last 30 days</span>
        </div>
        <button onClick={onSeeMore} className="text-[11px] text-muted hover:text-ink inline-flex items-center gap-0.5">
          See full adoption <ArrowRight size={11} strokeWidth={1.6} />
        </button>
      </div>

      <div className="grid grid-cols-12 gap-px" style={{ background: "var(--line)" }}>
        {/* Active users */}
        <div className="col-span-12 md:col-span-4 p-5 bg-surface">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10.5px] font-mono uppercase tracking-[0.06em] text-muted">Active users</span>
            <span className="text-[10px] text-muted">7d</span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-[34px] font-bold text-ink leading-none tnum">{activeUsers}</span>
            <span className={`text-[10.5px] font-mono font-semibold tnum`}
              style={{ color: adoption.wauMauDelta >= 0 ? "var(--pos)" : "var(--neg)" }}>
              {adoption.wauMauDelta >= 0 ? "+" : ""}{adoption.wauMauDelta}%
            </span>
          </div>
          <ActiveUsersChart values={adoption.wauMauTrend} positive={adoption.wauMauDelta >= 0} />
          <div className="flex items-center justify-between mt-3 text-[10.5px] text-muted">
            <span>{adoption.monthlyActiveUsers} MAU</span>
            <span>{seatUtilPct}% of {adoption.totalSeats} seats</span>
          </div>
        </div>

        {/* Activation funnel */}
        <div className="col-span-12 md:col-span-4 p-5 bg-surface">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10.5px] font-mono uppercase tracking-[0.06em] text-muted">User activation</span>
            <span className="text-[10px] font-semibold tnum text-ink">{funnel[3].pct}% activated</span>
          </div>
          <div className="space-y-2">
            {funnel.map((step) => (
              <div key={step.label} className="flex items-center gap-2.5">
                <span className="text-[12px] w-4 text-center">{step.emoji}</span>
                <span className="text-[11.5px] text-ink-2 w-20 shrink-0">{step.label}</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-deep)" }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${step.pct}%`, background: "var(--accent-deep)" }} />
                </div>
                <span className="text-[10.5px] font-mono tnum text-ink-2 w-9 text-right shrink-0">{step.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main features */}
        <div className="col-span-12 md:col-span-4 p-5 bg-surface">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10.5px] font-mono uppercase tracking-[0.06em] text-muted">Main features</span>
            <span className="text-[10px] text-muted">14d</span>
          </div>
          <div className="space-y-2.5">
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 text-[10px] font-mono uppercase tracking-wider text-muted-2 pb-1">
              <span>Feature</span>
              <span className="text-right">Usage</span>
              <span className="text-right w-9">Users</span>
            </div>
            {topFeatures.map((f: any) => {
              const dotColor = f.trend === "up" ? "var(--pos)" : f.trend === "down" ? "var(--neg)" : "var(--muted-2)";
              return (
                <div key={f.name} className="grid grid-cols-[1fr_auto_auto] gap-x-3 items-center">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dotColor }} />
                    <span className="text-[11.5px] text-ink truncate">{f.name}</span>
                  </div>
                  <span className="text-[11px] tnum text-ink-2 text-right">{f.usage.toLocaleString()}</span>
                  <span className="text-[11px] tnum text-accent-deep text-right w-9" style={{ color: "var(--accent-deep)" }}>
                    {f.users}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 14-day per-user grid */}
      <div className="border-t border-line p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10.5px] font-mono uppercase tracking-[0.06em] text-muted mb-0.5">Product usage · last 14 days</div>
            <div className="text-[11.5px] text-muted">Per-user activity — each dot is a day with at least one session</div>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-2">
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "var(--accent-deep)" }} /> Active</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "var(--bg-deep)" }} /> Idle</span>
          </div>
        </div>
        <div className="space-y-1.5">
          {sampleUsers.map((u) => (
            <div key={u.email} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full grid place-items-center text-white text-[9.5px] font-semibold shrink-0"
                style={{ background: u.avatarBg }}>
                {u.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11.5px] text-ink truncate">{u.email}</div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {u.days.map((active, i) => (
                  <span key={i} className="w-2.5 h-2.5 rounded-full"
                    style={{ background: active ? "var(--accent-deep)" : "var(--bg-deep)" }} />
                ))}
              </div>
              <span className="text-[10px] font-mono tnum text-muted-2 w-12 text-right shrink-0">
                {u.days.filter(Boolean).length} / 14
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function ActiveUsersChart({ values, positive }: { values: number[]; positive: boolean }) {
  const w = 220, h = 50;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    return [x, y] as const;
  });
  const linePts = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const fillPath = `M${pts[0][0].toFixed(1)},${h} L${linePts.split(" ").join(" L")} L${pts[pts.length - 1][0].toFixed(1)},${h} Z`;
  const stroke = positive ? "var(--accent-deep)" : "var(--neg)";
  const fill = positive ? "var(--accent-soft)" : "var(--neg-soft)";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: h }} preserveAspectRatio="none">
      <path d={fillPath} fill={fill} opacity={0.6} />
      <polyline points={linePts} fill="none" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={3} fill={stroke} />
    </svg>
  );
}

// Synthesize a deterministic 14-day grid per user, weighted by account health.
function topUsersFor(account: AccountDetail, adoption: any) {
  const palette = ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EC4899"];
  const seedSeats = adoption.teams[0]?.team ?? "Team";
  const domain = account.domain.replace(/^www\./, "");
  const namesByDomain: { name: string; first: string; last: string }[] = [
    { name: "Eoin Murphy",   first: "eoin",  last: "murphy" },
    { name: "Desmond Lee",   first: "des",   last: "lee" },
    { name: "Wile Tanaka",   first: "wile",  last: "tanaka" },
    { name: "Ruud Janssen",  first: "ruud",  last: "janssen" },
    { name: "Maya Chen",     first: "maya",  last: "chen" },
  ];
  // Activity probability scales with health
  const baseProb = clamp(account.healthScore / 100, 0.25, 0.92);

  return namesByDomain.map((u, i) => {
    const prob = clamp(baseProb - i * 0.08, 0.15, 0.95);
    const days: boolean[] = [];
    for (let d = 0; d < 14; d++) {
      // Deterministic pseudo-random based on user idx + day idx
      const hash = (i * 31 + d * 7 + account.healthScore) % 100;
      days.push(hash / 100 < prob);
    }
    return {
      name: u.name,
      email: `${u.first}@${domain}`,
      initials: (u.first[0] + u.last[0]).toUpperCase(),
      avatarBg: palette[i % palette.length],
      days,
    };
  });
}

function CustomerSideCard({ account, adoption }: { account: AccountDetail; adoption: any }) {
  const nps = account.healthScore >= 80 ? 47 : account.healthScore >= 60 ? 18 : -12;
  const openTickets = account.healthScore >= 70 ? 1 : 4;
  const topSignal = account.signals[0];
  const sentimentLabel = account.health === "high" ? "Positive" : account.health === "medium" ? "Neutral" : "At Risk";
  const { bg: sentBg, color: sentColor } = account.health === "high"
    ? { bg: "var(--pos-soft)", color: "var(--pos)" }
    : account.health === "medium"
    ? { bg: "var(--warn-soft)", color: "var(--warn)" }
    : { bg: "var(--neg-soft)", color: "var(--neg)" };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="mono-label">HOW THEY'RE FEELING · CUSTOMER SIDE</div>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
          style={{ background: sentBg, color: sentColor }}>{sentimentLabel}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="rounded-lg bg-bg-deep px-3 py-2.5">
          <div className="mono-label mb-1">LAST LOGIN</div>
          <div className="text-[15px] font-bold text-ink leading-tight">{adoption ? "2h ago" : "—"}</div>
          <div className="text-[10px] text-muted mt-0.5">
            {adoption ? `${adoption.monthlyActiveUsers ?? "?"} active this mo.` : "No telemetry"}
          </div>
        </div>
        <div className="rounded-lg bg-bg-deep px-3 py-2.5">
          <div className="mono-label mb-1">NPS</div>
          <div className="text-[15px] font-bold leading-tight" style={{ color: nps >= 0 ? "var(--pos)" : "var(--neg)" }}>
            {nps >= 0 ? "+" : ""}{nps}
          </div>
          <div className="text-[10px] text-muted mt-0.5">12 responses</div>
        </div>
        <div className="rounded-lg bg-bg-deep px-3 py-2.5">
          <div className="mono-label mb-1">SUPPORT</div>
          <div className="text-[15px] font-bold text-ink leading-tight">{openTickets} open</div>
          <div className="text-[10px] text-muted mt-0.5">6 tickets · 3 resolved</div>
        </div>
      </div>
      {topSignal && (
        <div className="border-t border-line pt-3">
          <div className="mono-label mb-1.5">TOP PAIN</div>
          <div className="text-[12px] text-ink-2 leading-relaxed line-clamp-3">{topSignal.body}</div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Call Recordings — replaces the prior "conversations" card. Each row is
// a tap-target that opens a Notion-style detail drawer with Overview,
// Transcript, Personal notes, and an AI assist column.
// ---------------------------------------------------------------------
type CallRecording = {
  id: string;
  title: string;
  duration: string;
  when: string;
  participants: { name: string; initials: string; bg: string; isHost?: boolean }[];
  summary: string;       // brief description of what was discussed
  topic: "QBR" | "Renewal" | "Discovery" | "Adoption" | "Expansion" | "Health Check";
  sentiment: "pos" | "neutral" | "warn" | "neg";
  transcript: { speaker: string; at: string; text: string }[];
};

const TOPIC_STYLE: Record<CallRecording["topic"], { bg: string; color: string }> = {
  QBR:           { bg: "var(--info-soft)",   color: "var(--info)"        },
  Renewal:       { bg: "var(--warn-soft)",   color: "var(--warn)"        },
  Discovery:     { bg: "var(--accent-soft)", color: "var(--accent-deep)" },
  Adoption:      { bg: "var(--pos-soft)",    color: "var(--pos)"         },
  Expansion:     { bg: "var(--accent-soft)", color: "var(--accent-deep)" },
  "Health Check":{ bg: "var(--bg-deep)",     color: "var(--ink-2)"       },
};

function callsFor(account: AccountDetail, currentUser: { name: string; initials: string; firstName: string }): CallRecording[] {
  const isHealthy = account.healthScore >= 75;
  return [
    {
      id: "c1",
      title: isHealthy ? "Q3 expansion budget alignment" : "Sponsor re-engagement call",
      duration: "32m",
      when: "Yesterday",
      participants: [
        { name: currentUser.name, initials: currentUser.initials, bg: "#374151", isHost: true },
        { name: account.stakeholders[0]?.name ?? "Maya Chen", initials: (account.stakeholders[0]?.name ?? "Maya Chen").split(" ").map(p => p[0]).slice(0,2).join(""), bg: "#3B82F6" },
      ],
      summary: isHealthy
        ? "30-min check-in. Confirmed Q3 expansion budget; Finance Ops meeting set for next week."
        : "Champion responded after 14d gap. Confirmed renewal still on track but procurement is shifting to legal next week.",
      topic: isHealthy ? "Expansion" : "Renewal",
      sentiment: isHealthy ? "pos" : "warn",
      transcript: [
        { speaker: currentUser.firstName,     at: "00:00", text: "Thanks for jumping on. Wanted to walk through where we are on the Q3 motion." },
        { speaker: account.stakeholders[0]?.name ?? "Maya", at: "00:18", text: "Yeah, perfect timing. We just got VP approval to expand into Networking." },
        { speaker: currentUser.firstName,     at: "01:05", text: "Great. Let me show you a quick proof point from a similar customer..." },
        { speaker: account.stakeholders[0]?.name ?? "Maya", at: "12:30", text: "Can we get legal looped in on Wednesday? That's our next blocker." },
      ],
    },
    {
      id: "c2",
      title: "Quarterly business review",
      duration: "45m",
      when: "1w ago",
      participants: [
        { name: currentUser.name, initials: currentUser.initials, bg: "#374151", isHost: true },
        { name: "Marcus Webb",    initials: "MW", bg: "#1E40AF" },
        { name: account.stakeholders[1]?.name ?? "Lin Park", initials: (account.stakeholders[1]?.name ?? "Lin Park").split(" ").map(p => p[0]).slice(0,2).join(""), bg: "#10B981" },
      ],
      summary: "Reviewed adoption gaps, ROI from last quarter, and aligned on success plan for H2. Customer asked for cross-BU reference customers.",
      topic: "QBR",
      sentiment: "pos",
      transcript: [
        { speaker: currentUser.firstName, at: "00:00", text: "Welcome everyone. Today we'll cover Q1 outcomes, current health, and the Q2 plan." },
        { speaker: "Marcus",     at: "02:14", text: "Quick context on expansion — we have three plays open in Networking and Security." },
        { speaker: "Lin Park",   at: "08:22", text: "Can you share which other customers in our segment are running this pattern?" },
      ],
    },
    {
      id: "c3",
      title: isHealthy ? "Adoption review · Networking team" : "Health check · sponsor silent",
      duration: "22m",
      when: "12d ago",
      participants: [
        { name: "Rachel Kim",     initials: "RK", bg: "#7C3AED", isHost: true },
        { name: account.stakeholders[2]?.name ?? "Tom Reilly", initials: (account.stakeholders[2]?.name ?? "Tom Reilly").split(" ").map(p => p[0]).slice(0,2).join(""), bg: "#F59E0B" },
      ],
      summary: isHealthy
        ? "Networking team WAU/MAU at 0.81. Reviewed feature breadth and queued up Playbook Runs onboarding session."
        : "Compliance follow-up on EU data residency. Still waiting on signed addendum — flagged as renewal risk.",
      topic: isHealthy ? "Adoption" : "Health Check",
      sentiment: isHealthy ? "pos" : "warn",
      transcript: [
        { speaker: "Rachel",     at: "00:00", text: "Wanted to share what we're seeing in the dashboard..." },
      ],
    },
  ];
}

function CallRecordingsCard({ account, onOpen }: { account: AccountDetail; onOpen: (c: CallRecording) => void }) {
  const { user } = useUser();
  const calls = callsFor(account, user);
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Video size={13} strokeWidth={1.7} style={{ color: "var(--accent-deep)" }} />
          <span className="text-[13px] font-semibold text-ink">Call recordings</span>
          <span className="text-[10.5px] text-muted">{calls.length} recent</span>
        </div>
        <button className="text-[10.5px] text-muted hover:text-ink inline-flex items-center gap-0.5">
          See all <ArrowRight size={10} strokeWidth={1.6} />
        </button>
      </div>
      <div className="space-y-2">
        {calls.map((c) => {
          const ts = TOPIC_STYLE[c.topic];
          const sentColor = c.sentiment === "pos" ? "var(--pos)" : c.sentiment === "neg" ? "var(--neg)" : c.sentiment === "warn" ? "var(--warn)" : "var(--muted-2)";
          return (
            <button
              key={c.id}
              onClick={() => onOpen(c)}
              className="w-full text-left flex gap-3 p-2.5 rounded-lg border border-line bg-surface hover:bg-surface-2 hover:border-line-strong transition-colors group"
            >
              {/* Thumbnail with play icon + duration */}
              <div className="relative w-24 h-16 rounded-md overflow-hidden shrink-0"
                style={{ background: `linear-gradient(135deg, ${getBrand(account.name)?.bg ?? "#2A2B27"}, #14140F)` }}>
                <div className="absolute inset-0 grid place-items-center">
                  <div className="w-7 h-7 rounded-full grid place-items-center"
                    style={{ background: "rgba(200,255,61,0.9)" }}>
                    <span className="ml-0.5 text-[10px]" style={{ color: "#1A1F08" }}>▶</span>
                  </div>
                </div>
                <span className="absolute bottom-1 right-1 px-1 rounded text-[8.5px] font-mono tnum text-white"
                  style={{ background: "rgba(0,0,0,0.65)" }}>
                  {c.duration}
                </span>
              </div>
              {/* Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-1">
                  <span className="text-[12.5px] font-semibold text-ink leading-snug line-clamp-1 flex-1 min-w-0">{c.title}</span>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                    style={{ background: ts.bg, color: ts.color }}>{c.topic}</span>
                </div>
                <p className="text-[11px] text-muted leading-snug line-clamp-2 mb-1.5">{c.summary}</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center -space-x-1">
                    {c.participants.slice(0, 3).map((p, i) => (
                      <div key={i} className="w-4 h-4 rounded-full text-white grid place-items-center text-[7.5px] font-semibold border border-bg"
                        style={{ background: p.bg }}>{p.initials}</div>
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-2">{c.when}</span>
                  <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-mono"
                    style={{ color: sentColor }}>● {c.sentiment === "pos" ? "Positive" : c.sentiment === "neg" ? "Negative" : c.sentiment === "warn" ? "Concerning" : "Neutral"}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Tickets — recent support tickets raised by the customer
// ---------------------------------------------------------------------
type Ticket = {
  id: string;
  title: string;
  status: "Open" | "In progress" | "Resolved";
  priority: "P0" | "P1" | "P2" | "P3";
  reporter: { name: string; initials: string; bg: string };
  ago: string;
  comments: number;
  rating?: number; // post-resolution CSAT 1-5
};

const TICKET_PRIORITY_STYLE: Record<Ticket["priority"], { bg: string; color: string }> = {
  P0: { bg: "var(--neg-soft)",  color: "var(--neg)"  },
  P1: { bg: "var(--warn-soft)", color: "var(--warn)" },
  P2: { bg: "var(--info-soft)", color: "var(--info)" },
  P3: { bg: "var(--bg-deep)",   color: "var(--muted)" },
};

const TICKET_STATUS_STYLE: Record<Ticket["status"], { bg: string; color: string }> = {
  "Open":        { bg: "var(--neg-soft)",  color: "var(--neg)"   },
  "In progress": { bg: "var(--warn-soft)", color: "var(--warn)"  },
  "Resolved":    { bg: "var(--pos-soft)",  color: "var(--pos)"   },
};

function ticketsFor(account: AccountDetail): Ticket[] {
  const open = account.healthScore < 70 ? 3 : 1;
  const all: Ticket[] = [
    { id: "t1", title: "Webhook retry SLA — events lost during failover window", status: "Open",        priority: "P1", reporter: { name: account.stakeholders[0]?.name ?? "Tom Reilly", initials: "TR", bg: "#3B82F6" }, ago: "2h ago",     comments: 4 },
    { id: "t2", title: "Reviewer assignment latency on integration platform",      status: "In progress",priority: "P2", reporter: { name: account.stakeholders[1]?.name ?? "Priya Anand", initials: "PA", bg: "#8B5CF6" }, ago: "Yesterday",  comments: 7 },
    { id: "t3", title: "EU data residency addendum — pending legal sign-off",      status: "Open",        priority: "P0", reporter: { name: "Jordan Velasquez",                              initials: "JV", bg: "#F59E0B" }, ago: "3d ago",     comments: 12 },
    { id: "t4", title: "Forecast Assist nightly export missing rows",              status: "Resolved",    priority: "P3", reporter: { name: "Lin Park",                                       initials: "LP", bg: "#10B981" }, ago: "1w ago",     comments: 3, rating: 4 },
    { id: "t5", title: "SSO IdP rotation broke API tokens for 3 service accounts",status: "Resolved",    priority: "P1", reporter: { name: "Maya Chen",                                      initials: "MC", bg: "#EC4899" }, ago: "2w ago",     comments: 9, rating: 5 },
  ];
  return all.slice(0, open === 3 ? 5 : 4);
}

function TicketsCard({ account }: { account: AccountDetail }) {
  const tickets = ticketsFor(account);
  const open = tickets.filter(t => t.status !== "Resolved").length;
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText size={13} strokeWidth={1.7} style={{ color: "var(--info)" }} />
          <span className="text-[13px] font-semibold text-ink">Recent tickets</span>
          <span className="text-[10.5px] text-muted">{open} open · {tickets.length - open} resolved</span>
        </div>
        <button className="text-[10.5px] text-muted hover:text-ink inline-flex items-center gap-0.5">
          Open Zendesk <ArrowRight size={10} strokeWidth={1.6} />
        </button>
      </div>
      <div className="space-y-1.5">
        {tickets.map((t) => {
          const ps = TICKET_PRIORITY_STYLE[t.priority];
          const ss = TICKET_STATUS_STYLE[t.status];
          return (
            <div key={t.id} className="flex items-start gap-2.5 px-2 py-2 rounded-md hover:bg-bg-deep cursor-pointer">
              <div className="w-6 h-6 rounded-full text-white grid place-items-center text-[8.5px] font-semibold shrink-0 mt-0.5"
                style={{ background: t.reporter.bg }}>
                {t.reporter.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded shrink-0"
                    style={{ background: ps.bg, color: ps.color }}>{t.priority}</span>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                    style={{ background: ss.bg, color: ss.color }}>{t.status}</span>
                  <span className="text-[10px] text-muted-2 ml-auto shrink-0">{t.ago}</span>
                </div>
                <div className="text-[11.5px] text-ink leading-snug line-clamp-2 font-medium">{t.title}</div>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-muted">
                  <span>{t.reporter.name}</span>
                  <span className="text-muted-2">·</span>
                  <span>{t.comments} comments</span>
                  {t.rating && (
                    <>
                      <span className="text-muted-2">·</span>
                      <span style={{ color: "var(--accent-deep)" }}>{"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Internal Activity — replaces the team thread chat box. This is a
// passive feed: who on the internal team did/said what about this
// account, in chronological order. No composer, no @mentions — just an
// audit trail surfaced where the AE/CSM is already looking.
// ---------------------------------------------------------------------
type InternalEvent = {
  id: string;
  actor: { name: string; team: "Sales" | "CS" | "Marketing" | "Product" | "RevOps" | "Legal"; initials: string; bg: string };
  verb: string;
  target: string;
  detail?: string;
  ago: string;
};

const TEAM_ACCENT: Record<InternalEvent["actor"]["team"], string> = {
  Sales:     "#3B82F6",
  CS:        "#10B981",
  Marketing: "#EC4899",
  Product:   "#8B5CF6",
  RevOps:    "#F59E0B",
  Legal:     "#6B7280",
};

function internalEventsFor(account: AccountDetail): InternalEvent[] {
  const isHealthy = account.healthScore >= 75;
  const e: InternalEvent[] = [
    { id: "e1", actor: { name: "Sam Patel",       team: "Marketing", initials: "SP", bg: TEAM_ACCENT.Marketing }, verb: "asked for", target: "case-study quote",   detail: "Wants permission to use the WAU/MAU lift in the Q3 customer story.", ago: "2h ago" },
    { id: "e2", actor: { name: "Marcus Webb",     team: "Sales",     initials: "MW", bg: TEAM_ACCENT.Sales     }, verb: "updated",   target: "expansion forecast", detail: "Moved $180K Networking expansion to Best Case for Q3.", ago: "Yesterday" },
    { id: "e3", actor: { name: "Rachel Kim",      team: "CS",        initials: "RK", bg: TEAM_ACCENT.CS        }, verb: "logged",    target: "QBR notes",           detail: "Customer asked for cross-BU reference customers — assigned to Jules.", ago: "2d ago" },
    { id: "e4", actor: { name: "Jules Tanaka",    team: "Product",   initials: "JT", bg: TEAM_ACCENT.Product   }, verb: "responded to",  target: "ticket #2147",        detail: "Shared workaround for webhook retry SLA. Engineering pickup ETA Friday.", ago: "3d ago" },
    { id: "e5", actor: { name: "Priya Iyer",      team: "RevOps",    initials: "PI", bg: TEAM_ACCENT.RevOps    }, verb: "updated",       target: "renewal close date",  detail: `Pulled renewal forward by 14 days to align with their procurement cycle.`, ago: "5d ago" },
    { id: "e6", actor: { name: "Daniel O'Connor", team: "Legal",     initials: "DO", bg: TEAM_ACCENT.Legal     }, verb: "drafted",       target: "EU data addendum",    detail: "Sent v2 redlines to customer's Jordan Velasquez — awaiting signature.", ago: "1w ago" },
  ];
  return isHealthy ? e.slice(0, 5) : e;
}

function InternalActivityCard({ account }: { account: AccountDetail }) {
  const events = internalEventsFor(account);
  return (
    <div className="card p-4 flex flex-col" style={{ minHeight: 440 }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Network size={12} strokeWidth={1.8} style={{ color: "var(--accent-deep)" }} />
          <span className="text-[13px] font-semibold text-ink">Internal activity</span>
        </div>
        <span className="text-[10px] text-muted">Across teams</span>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto">
        {events.map((e) => (
          <div key={e.id} className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full text-white grid place-items-center text-[8.5px] font-semibold shrink-0"
              style={{ background: e.actor.bg }}>
              {e.actor.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11.5px] text-ink-2 leading-snug">
                <span className="font-semibold text-ink">{e.actor.name}</span>
                <span className="text-muted"> from </span>
                <span className="font-medium" style={{ color: e.actor.bg }}>{e.actor.team}</span>
                <span className="text-muted"> {e.verb} </span>
                <span className="text-ink">{e.target}</span>
              </div>
              {e.detail && (
                <div className="text-[11px] text-muted leading-snug mt-1">{e.detail}</div>
              )}
              <div className="text-[10px] text-muted-2 mt-1">{e.ago}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// VideoPlayer — dummy video playback with participant thumbnails
// ---------------------------------------------------------------------
function VideoPlayer({ call, accountName }: { call: CallRecording; accountName: string }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const brand = getBrand(accountName);

  // Simulate playback progress
  const [intervalRef, setIntervalRef] = useState<NodeJS.Timeout | null>(null);
  const togglePlay = () => {
    if (playing) {
      if (intervalRef) clearInterval(intervalRef);
      setIntervalRef(null);
      setPlaying(false);
    } else {
      setPlaying(true);
      const id = setInterval(() => {
        setProgress(p => {
          if (p >= 100) { clearInterval(id); setPlaying(false); return 0; }
          return p + 0.5;
        });
      }, 100);
      setIntervalRef(id);
    }
  };

  const elapsed = Math.round(progress * 0.01 * parseInt(call.duration) * 60);
  const elapsedMin = Math.floor(elapsed / 60);
  const elapsedSec = elapsed % 60;

  return (
    <div className="rounded-xl overflow-hidden border border-line">
      {/* Video area with participant thumbnails */}
      <div className="relative aspect-video max-h-[280px]"
        style={{ background: `linear-gradient(135deg, ${brand?.bg ?? "#374151"} 0%, #111827 50%, ${brand?.bg ?? "#374151"}40 100%)` }}>
        {/* Grid of participant "video feeds" */}
        <div className="absolute inset-4 grid gap-2"
          style={{ gridTemplateColumns: call.participants.length <= 2 ? "1fr 1fr" : "1fr 1fr", gridTemplateRows: call.participants.length <= 2 ? "1fr" : "1fr 1fr" }}>
          {call.participants.slice(0, 4).map((p, i) => (
            <div key={i} className="relative rounded-lg overflow-hidden"
              style={{ background: `linear-gradient(145deg, ${p.bg}30, ${p.bg}10)` }}>
              <div className="absolute inset-0 grid place-items-center">
                <div className="w-14 h-14 rounded-full grid place-items-center text-white text-[16px] font-bold"
                  style={{ background: p.bg }}>
                  {p.initials}
                </div>
              </div>
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[9px] font-medium text-white"
                style={{ background: "rgba(0,0,0,0.6)" }}>
                {p.name}{p.isHost ? " (Host)" : ""}
              </div>
              {playing && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </div>
          ))}
        </div>

        {/* Center play/pause overlay */}
        <button onClick={togglePlay}
          className="absolute inset-0 z-10 grid place-items-center group">
          <div className={`w-14 h-14 rounded-full grid place-items-center transition-all ${
            playing ? "opacity-0 group-hover:opacity-100" : "opacity-100"
          }`} style={{ background: "rgba(200,255,61,0.9)" }}>
            {playing
              ? <Pause size={18} strokeWidth={2} style={{ color: "#1A1F08" }} />
              : <Play size={18} strokeWidth={2} style={{ color: "#1A1F08", marginLeft: 2 }} />
            }
          </div>
        </button>
      </div>

      {/* Progress bar + controls */}
      <div className="px-4 py-2.5 bg-surface border-t border-line">
        <div className="flex items-center gap-3">
          <button onClick={togglePlay} className="shrink-0 text-ink hover:text-accent-deep">
            {playing ? <Pause size={14} strokeWidth={2} /> : <Play size={14} strokeWidth={2} />}
          </button>
          <span className="text-[10px] font-mono tnum text-muted w-12 shrink-0">
            {String(elapsedMin).padStart(2, "0")}:{String(elapsedSec).padStart(2, "0")}
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden cursor-pointer" style={{ background: "var(--bg-deep)" }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setProgress(((e.clientX - rect.left) / rect.width) * 100);
            }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "var(--accent-deep)" }} />
          </div>
          <span className="text-[10px] font-mono tnum text-muted w-8 shrink-0">{call.duration}</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// CallDetailDrawer — Notion-styled detail with Overview, Transcript,
// and Personal notes tabs, plus a persistent AI assist column.
// ---------------------------------------------------------------------
function CallDetailDrawer({ call, onClose, account }: {
  call: CallRecording | null; onClose: () => void; account: AccountDetail;
}) {
  const [tab, setTab] = useState<"overview" | "transcript" | "notes">("overview");
  const [note, setNote] = useState("");
  const [chat, setChat] = useState<{ q: string; a: string }[]>([]);
  const [q, setQ] = useState("");

  if (!call) return null;
  const ts = TOPIC_STYLE[call.topic];

  const ask = (text: string) => {
    if (!text.trim()) return;
    const a = text.toLowerCase().includes("summary")
      ? `${call.summary} Key risks: pending procurement step, Q3 timeline alignment. Suggested next step: confirm legal sync on Wednesday.`
      : text.toLowerCase().includes("next")
      ? `Suggested next steps for ${account.name}: (1) confirm Wednesday legal sync, (2) share comparable customer references, (3) schedule expansion follow-up after sign-off.`
      : text.toLowerCase().includes("objection")
      ? `Top objections from this call: (1) procurement timing, (2) cross-BU reference proof, (3) integration cost. Each has a recommended response in the playbook.`
      : `Based on the transcript and account history, ${call.title.toLowerCase()} surfaced positive expansion signals. Citations would link to specific transcript timestamps.`;
    setChat((c) => [...c, { q: text, a }]);
    setQ("");
  };

  return (
    <>
      <div className="fixed inset-0 bg-ink/40 z-[85] fade-in" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-[90] flex flex-col bg-bg border-l border-line shadow-2xl drawer-anim"
        style={{ width: 920 }}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-line flex items-start gap-3 shrink-0">
          <div className="w-10 h-10 rounded-lg grid place-items-center shrink-0"
            style={{ background: getBrand(account.name)?.bg ?? "var(--bg-deep)" }}>
            <Video size={16} strokeWidth={1.7} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10.5px] font-mono uppercase tracking-[0.06em] text-muted">{account.name}</span>
              <span className="text-muted-2">/</span>
              <span className="text-[10.5px] text-muted">Call recordings</span>
            </div>
            <h2 className="text-[18px] font-bold text-ink leading-tight tracking-tight">{call.title}</h2>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted flex-wrap">
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                style={{ background: ts.bg, color: ts.color }}>{call.topic}</span>
              <span>{call.duration}</span>
              <span className="text-muted-2">·</span>
              <span>{call.when}</span>
              <span className="text-muted-2">·</span>
              <div className="flex items-center -space-x-1">
                {call.participants.map((p, i) => (
                  <div key={i} className="w-4 h-4 rounded-full text-white grid place-items-center text-[7.5px] font-semibold border border-bg"
                    style={{ background: p.bg }}>{p.initials}</div>
                ))}
              </div>
              <span>{call.participants.length} participants</span>
            </div>
          </div>
          <button onClick={onClose}
            className="h-8 w-8 rounded-md grid place-items-center text-muted hover:text-ink hover:bg-surface-2 shrink-0">
            <X size={14} strokeWidth={1.8} />
          </button>
        </div>

        {/* Body — left content + right AI assist */}
        <div className="flex flex-1 min-h-0">
          {/* Left — Notion tabs */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="px-5 pt-3 border-b border-line flex gap-1">
              {(["overview", "transcript", "notes"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`text-[12px] font-medium px-3 py-2 -mb-px capitalize ${
                    tab === t ? "text-ink border-b-2 border-ink" : "text-muted hover:text-ink"
                  }`}>
                  {t === "notes" ? "Personal notes" : t}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {tab === "overview" && (
                <div className="max-w-2xl space-y-5">
                  {/* Video playback */}
                  <VideoPlayer call={call} accountName={account.name} />
                  <div>
                    <div className="mono-label mb-2">Summary</div>
                    <p className="text-[13px] text-ink-2 leading-relaxed">{call.summary}</p>
                  </div>
                  <div>
                    <div className="mono-label mb-2">Key moments</div>
                    <ul className="space-y-2">
                      {call.transcript.slice(0, 4).map((t, i) => (
                        <li key={i} className="flex items-start gap-3 text-[12.5px] text-ink-2 leading-relaxed">
                          <span className="text-[10px] font-mono tnum text-muted-2 w-10 shrink-0 mt-0.5">{t.at}</span>
                          <span><strong className="text-ink">{t.speaker}:</strong> {t.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="mono-label mb-2">Action items</div>
                    <ul className="space-y-1.5 text-[12.5px] text-ink-2 leading-relaxed">
                      <li className="flex items-start gap-2"><span className="w-3.5 h-3.5 rounded-sm border border-line mt-0.5 shrink-0" /> Confirm legal sync with their team for Wednesday</li>
                      <li className="flex items-start gap-2"><span className="w-3.5 h-3.5 rounded-sm border border-line mt-0.5 shrink-0" /> Share three comparable customer references</li>
                      <li className="flex items-start gap-2"><span className="w-3.5 h-3.5 rounded-sm border border-line mt-0.5 shrink-0" /> Push updated success plan link to champion</li>
                    </ul>
                  </div>
                  <div>
                    <div className="mono-label mb-2">Sentiment timeline</div>
                    <div className="flex items-center gap-1 h-6">
                      {Array.from({ length: 18 }, (_, i) => {
                        const v = (Math.sin(i * 0.6) + 1) / 2 * (call.sentiment === "pos" ? 0.9 : 0.5) + 0.1;
                        const color = v > 0.6 ? "var(--pos)" : v > 0.4 ? "var(--ink-2)" : "var(--neg)";
                        return <div key={i} className="flex-1 rounded" style={{ height: `${v * 100}%`, background: color }} />;
                      })}
                    </div>
                  </div>
                </div>
              )}
              {tab === "transcript" && (
                <div className="max-w-2xl space-y-3">
                  <div className="mono-label mb-2">Full transcript</div>
                  {call.transcript.map((t, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-[10px] font-mono tnum text-muted-2 w-12 shrink-0 mt-0.5">{t.at}</span>
                      <div className="flex-1">
                        <div className="text-[12px] font-semibold text-ink mb-0.5">{t.speaker}</div>
                        <div className="text-[12.5px] text-ink-2 leading-relaxed">{t.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {tab === "notes" && (
                <div className="max-w-2xl">
                  <div className="mono-label mb-2">Your private notes</div>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Jot down anything from the call. Only you can see this."
                    className="w-full min-h-[260px] p-3.5 rounded-lg border border-line bg-surface text-[13px] text-ink-2 leading-relaxed outline-none resize-y placeholder:text-muted-2"
                  />
                  <div className="text-[10.5px] text-muted-2 mt-2">Notes are stored locally and aren't shared with the team.</div>
                </div>
              )}
            </div>
          </div>

          {/* Right — AI assist column */}
          <div className="w-72 shrink-0 border-l border-line flex flex-col bg-surface">
            <div className="px-4 py-3 border-b border-line flex items-center gap-2">
              <Sparkles size={12} strokeWidth={1.8} style={{ color: "var(--accent-deep)" }} />
              <span className="text-[12px] font-semibold text-ink">Ask about this call</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {["Summarise this call", "What are the next steps?", "What objections came up?"].map((chip) => (
                <button key={chip} onClick={() => ask(chip)}
                  className="w-full text-left text-[11.5px] px-3 py-2 rounded-lg border border-line bg-bg hover:bg-bg-deep transition-colors text-ink-2">
                  {chip}
                </button>
              ))}
              {chat.map((c, i) => (
                <div key={i} className="rounded-lg overflow-hidden border border-line">
                  <div className="px-2.5 py-1.5 bg-bg-deep text-[10px] text-muted">{c.q}</div>
                  <div className="px-2.5 py-2.5 text-[11.5px] text-ink-2 leading-relaxed bg-bg">{c.a}</div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-line">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-line bg-bg">
                <input value={q} onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") ask(q); }}
                  placeholder="Ask Alphy about this call…"
                  className="flex-1 bg-transparent outline-none text-[11.5px] placeholder:text-muted-2" />
                <button onClick={() => ask(q)} disabled={!q.trim()}
                  className="w-6 h-6 rounded grid place-items-center disabled:opacity-40"
                  style={{ background: "var(--accent-deep)", color: "white" }}>
                  <Send size={10} strokeWidth={2.2} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function FieldsPanelCard({ account, adoption }: { account: AccountDetail; adoption: any }) {
  const nps = account.healthScore >= 80 ? "+47" : account.healthScore >= 60 ? "+18" : "–12";
  const healthLabel = account.health === "high" ? "Healthy" : account.health === "medium" ? "Watch" : "At Risk";
  const fields = [
    { label: "ID",           value: slugify(account.name) },
    { label: "DISPLAY NAME", value: account.name },
    { label: "HEALTH",       value: `${healthLabel} · ${account.healthScore}` },
    { label: "STATUS",       value: account.status },
    { label: "FIRST CALL",   value: "Apr 16, 2024" },
    { label: "CONTRACT",     value: account.arr ? fmtFullMoney(account.arr) : "—" },
    { label: "NRR",          value: account.nrr ? `${account.nrr}%` : "—" },
    { label: "NPS",          value: nps },
    { label: "RENEWAL",      value: account.renewalDays > 0 ? `${account.renewalDays}d` : account.renewalDays < 0 ? "Lapsed" : "—" },
    { label: "LAST QBR",     value: account.lastQbrDays > 0 ? `${account.lastQbrDays}d ago` : "None" },
  ];
  return (
    <div className="card p-4 flex flex-col gap-3" style={{ minHeight: 440 }}>
      <div className="flex items-center justify-between">
        <div className="mono-label">FIELDS</div>
        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
          style={{ background: "var(--accent-soft)", color: "var(--accent-deep)" }}>Pinned</span>
      </div>
      <div className="pb-3 border-b border-line">
        <div className="mono-label mb-1">ACCOUNT NOTES</div>
        <div className="text-[11.5px] text-ink-2 leading-relaxed">
          {account.industry}. Health {account.healthScore}. NRR {account.nrr ? `${account.nrr}%` : "—"}.
        </div>
      </div>
      {adoption && (
        <div className="grid grid-cols-2 gap-2 pb-3 border-b border-line">
          <div>
            <div className="mono-label mb-0.5">MAU</div>
            <div className="text-[17px] font-bold text-ink">{adoption.monthlyActiveUsers ?? "—"}</div>
          </div>
          <div>
            <div className="mono-label mb-0.5">WAU/MAU</div>
            <div className="flex items-baseline gap-1">
              <span className="text-[17px] font-bold text-ink">
                {adoption.wauMauCurrent ?? adoption.wauMau ?? "—"}
              </span>
              {adoption.wauMauDelta !== undefined && (
                <span className="text-[10px] font-semibold"
                  style={{ color: adoption.wauMauDelta >= 0 ? "var(--pos)" : "var(--neg)" }}>
                  {adoption.wauMauDelta >= 0 ? "+" : ""}{adoption.wauMauDelta}%
                </span>
              )}
            </div>
          </div>
        </div>
      )}
      <div>
        <div className="mono-label mb-2">NATIVE FIELDS</div>
        <div className="space-y-1.5">
          {fields.map((f) => (
            <div key={f.label} className="flex items-start gap-2 text-[11px]">
              <span className="w-24 shrink-0 text-muted uppercase tracking-[0.05em] leading-relaxed">{f.label}</span>
              <span className="text-ink-2 flex-1 leading-relaxed">{f.value}</span>
            </div>
          ))}
        </div>
      </div>
      <button className="mt-auto text-[11px] text-muted hover:text-ink border border-line rounded-md h-7 w-full transition-colors">
        See all fields
      </button>
    </div>
  );
}

function BriefBox({ title, children, jumpLabel, onJump, className = "" }: {
  title: string; children: React.ReactNode; jumpLabel?: string; onJump?: () => void; className?: string;
}) {
  return (
    <div className={`card p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2.5">
        <div className="mono-label">{title}</div>
        {jumpLabel && onJump && (
          <button onClick={onJump} className="text-[10.5px] text-muted hover:text-ink inline-flex items-center gap-0.5">
            {jumpLabel} <ArrowRight size={10} strokeWidth={1.8} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="text-[12px] text-muted-2 py-3 text-center">{text}</div>;
}

function PulseLine({ account }: { account: AccountDetail }) {
  // last activity from ACCOUNT_EVENTS
  const lastTouch = ACCOUNT_EVENTS[0];
  const isCustomer = account.status === "Customer";

  return (
    <div className="card p-4">
      <div className="mono-label mb-2">Pulse</div>
      <div className="flex items-center gap-2 flex-wrap text-[12.5px]">
        <PulsePill ink="var(--ink)">{account.status}</PulsePill>
        <span className="text-muted-2">·</span>
        <span className="text-ink-2">Owned by <span className="font-semibold text-ink">{account.owner}</span></span>
        <span className="text-muted-2">·</span>
        <span className="text-ink-2">Last touch <span className="font-semibold text-ink">{lastTouch.when}</span> · {lastTouch.type}</span>
        {isCustomer && (
          <>
            <span className="text-muted-2">·</span>
            <PulsePill ink={
              account.renewalDays > 60 ? "var(--ink)" :
              account.renewalDays > 0  ? "var(--warn)" :
              account.renewalDays < 0  ? "var(--neg)" :
              "var(--muted)"
            }>
              {account.renewalDays > 0
                ? `Renews in ${account.renewalDays}d`
                : account.renewalDays < 0
                ? `Lapsed ${Math.abs(account.renewalDays)}d ago`
                : `No renewal scheduled`}
            </PulsePill>
            <span className="text-muted-2">·</span>
            <span className="text-ink-2">
              {account.lastQbrDays > 0
                ? <>Last QBR <span className="font-semibold text-ink">{account.lastQbrDays}d</span> ago</>
                : <span className="text-muted">No QBR scheduled</span>}
            </span>
          </>
        )}
        {!isCustomer && (
          <>
            <span className="text-muted-2">·</span>
            <span className="text-muted">In <span className="font-semibold text-ink-2">{account.industry}</span></span>
            <span className="text-muted-2">·</span>
            <span className="text-muted"><span className="font-semibold text-ink-2 tnum">{account.employees.toLocaleString()}</span> employees</span>
          </>
        )}
      </div>
    </div>
  );
}

function PulsePill({ ink, children }: { ink: string; children: React.ReactNode }) {
  return <span className="inline-flex items-center h-5 px-2 rounded-full text-[11.5px] font-semibold bg-bg-deep" style={{ color: ink }}>{children}</span>;
}

function StakeholderTile({ s }: { s: Stakeholder }) {
  const sentiment = s.sentiment === "supportive" ? "var(--pos)" : s.sentiment === "negative" ? "var(--neg)" : "var(--muted)";
  return (
    <div className="flex items-start gap-2 p-2 rounded-md border border-line bg-surface-2">
      <div className="w-7 h-7 rounded-full bg-ink text-white grid place-items-center text-[9px] font-semibold shrink-0">
        {s.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-semibold text-ink truncate">{s.name}</span>
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sentiment }} title={s.sentiment} />
        </div>
        <div className="text-[10.5px] text-muted truncate">{s.title} · {s.role}</div>
        <div className="text-[10px] text-muted-2 mt-0.5">{s.lastTouch}</div>
      </div>
    </div>
  );
}

function BriefSignalRow({ signal }: { signal: AccountSignal }) {
  const tone = signal.tone === "neg" ? "var(--neg)" : signal.tone === "pos" ? "var(--pos)" : signal.tone === "warn" ? "var(--warn)" : "var(--info)";
  const soft = signal.tone === "neg" ? "var(--neg-soft)" : signal.tone === "pos" ? "var(--pos-soft)" : signal.tone === "warn" ? "var(--warn-soft)" : "var(--info-soft)";
  return (
    <div className="px-2 py-1.5 rounded-md hover:bg-bg-deep">
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="text-[9px] font-mono uppercase tracking-[0.06em] px-1.5 py-0.5 rounded"
          style={{ background: soft, color: tone }}>{signal.category}</span>
        <span className="text-[10px] text-muted-2">{signal.ago}</span>
      </div>
      <div className="text-[12px] text-ink-2 leading-snug line-clamp-2">{signal.body}</div>
    </div>
  );
}

function AdoptionMini({ data }: { data: any }) {
  // adoption mock has waumau, monthlyUsers, topFeatures (array of {name, change})
  const features = (data.topFeatures ?? []).slice(0, 4);
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-lg bg-surface-2 border border-line px-3 py-2">
          <div className="mono-label">WAU/MAU</div>
          <div className="hero-num mt-1" style={{ fontSize: 18 }}>{data.wauMau ?? "—"}</div>
        </div>
        <div className="rounded-lg bg-surface-2 border border-line px-3 py-2">
          <div className="mono-label">Active users</div>
          <div className="hero-num mt-1" style={{ fontSize: 18 }}>{data.monthlyUsers ?? "—"}</div>
        </div>
      </div>
      <div className="space-y-1">
        {features.map((f: any) => (
          <div key={f.name} className="flex items-center gap-2 text-[11.5px]">
            <span className="text-ink-2 flex-1 truncate">{f.name}</span>
            <span className={`trend-pill ${f.change > 0 ? "up" : f.change < 0 ? "down" : "flat"}`}>
              {f.change > 0 ? "+" : ""}{f.change}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// HEALTH OVERRIDE — clickable health KPI with factor breakdown + override
// ---------------------------------------------------------------------

const HEALTH_OVERRIDES_KEY = "alphard:health-overrides";

type HealthOverride = { score: number; reason: string; by: string; at: string };

function loadOverrides(): Record<string, HealthOverride[]> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem(HEALTH_OVERRIDES_KEY) ?? "{}"); }
  catch { return {}; }
}
function saveOverrides(map: Record<string, HealthOverride[]>) {
  try { window.localStorage.setItem(HEALTH_OVERRIDES_KEY, JSON.stringify(map)); } catch {}
}

function healthFactorsFor(account: AccountDetail): { label: string; source: string; value: string; pts: number }[] {
  // Deterministic synthetic factor breakdown from account state.
  const usage = account.healthScore >= 80 ? "Strong (WAU/MAU 0.71)" : account.healthScore >= 60 ? "Steady (WAU/MAU 0.56)" : "Declining (WAU/MAU 0.42)";
  const usagePts = account.healthScore >= 80 ? 28 : account.healthScore >= 60 ? 18 : 8;
  const tickets = account.healthScore >= 70 ? "Low (3 / 90d)" : "Elevated (12 / 90d)";
  const ticketsPts = account.healthScore >= 70 ? 18 : -4;
  const sponsor = account.healthScore >= 70 ? "Active in last 7d" : "Silent 14d+";
  const sponsorPts = account.healthScore >= 70 ? 14 : -8;
  const renewal = account.renewalDays > 90 ? `${account.renewalDays}d out` : account.renewalDays > 0 ? `${account.renewalDays}d (close)` : "Lapsed";
  const renewalPts = account.renewalDays > 90 ? 12 : account.renewalDays > 0 ? 4 : -10;
  const sentiment = account.healthScore >= 75 ? "Positive (call avg 4.1/5)" : "Mixed (3.0/5)";
  const sentPts = account.healthScore >= 75 ? 16 : 6;
  return [
    { label: "Product usage",       source: "Mixpanel",   value: usage,    pts: usagePts },
    { label: "Support tickets",     source: "Zendesk",    value: tickets,  pts: ticketsPts },
    { label: "Sponsor engagement",  source: "Gmail · Gong", value: sponsor, pts: sponsorPts },
    { label: "Renewal proximity",   source: "Salesforce", value: renewal,  pts: renewalPts },
    { label: "Call sentiment 30d",  source: "Gong",       value: sentiment, pts: sentPts },
  ];
}

function HealthOverrideCard({ account }: { account: AccountDetail }) {
  const { user: __hoUser } = useUser();
  const factors = healthFactorsFor(account);
  const aiScore = account.healthScore;
  const slug = slugify(account.name);

  const [allOverrides, setAllOverrides] = useState<Record<string, HealthOverride[]>>({});
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setAllOverrides(loadOverrides()); setHydrated(true); }, []);

  const history = allOverrides[slug] ?? [];
  const current = history[history.length - 1];

  const [editing, setEditing] = useState(false);
  const [score, setScore] = useState<number>(current?.score ?? aiScore);
  const [reason, setReason] = useState<string>(current?.reason ?? "");

  const submit = () => {
    const ov: HealthOverride = { score, reason, by: __hoUser.firstName, at: new Date().toISOString() };
    const next = { ...allOverrides, [slug]: [...history, ov] };
    setAllOverrides(next);
    saveOverrides(next);
    setEditing(false);
  };

  const tone = (s: number) => s >= 80 ? "var(--pos)" : s >= 60 ? "var(--warn)" : "var(--neg)";

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="mono-label">Health · contributing factors</div>
        {!editing && (
          <button onClick={() => setEditing(true)}
            className="text-[10.5px] text-muted hover:text-ink inline-flex items-center gap-0.5">
            Override <ArrowRight size={10} strokeWidth={1.8} />
          </button>
        )}
      </div>

      <div className="flex items-end gap-3 mb-3">
        <div className="rounded-xl bg-surface-2 border border-line px-3.5 py-3 flex-1">
          <div className="mono-label">AI score</div>
          <div className="hero-num mt-1" style={{ fontSize: 28, color: tone(aiScore) }}>{aiScore}<span className="text-muted text-[14px]">/100</span></div>
        </div>
        {hydrated && current && (
          <div className="rounded-xl bg-accent-soft border border-line px-3.5 py-3 flex-1" style={{ background: "var(--accent-soft)" }}>
            <div className="mono-label" style={{ color: "var(--accent-ink)" }}>Your override</div>
            <div className="hero-num mt-1" style={{ fontSize: 28, color: tone(current.score) }}>{current.score}<span className="text-muted text-[14px]">/100</span></div>
          </div>
        )}
      </div>

      {/* Factors */}
      <div className="space-y-1.5">
        {factors.map((f) => (
          <div key={f.label} className="flex items-center gap-2 text-[11.5px]">
            <span className="text-ink-2 flex-1 min-w-0">
              <span className="font-semibold text-ink">{f.label}</span>
              <span className="text-muted"> · {f.value}</span>
              <span className="text-muted-2"> · {f.source}</span>
            </span>
            <span className={`trend-pill ${f.pts > 0 ? "up" : f.pts < 0 ? "down" : "flat"} tnum`}>
              {f.pts > 0 ? "+" : ""}{f.pts} pts
            </span>
          </div>
        ))}
      </div>

      {/* Override editor */}
      {editing && (
        <div className="mt-4 pt-4 border-t border-line space-y-2.5">
          <div className="mono-label" style={{ color: "var(--accent-ink)" }}>Set your override</div>
          <div className="flex items-center gap-3">
            <input type="range" min={0} max={100} value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="flex-1 accent-[var(--accent-deep)]" />
            <span className="hero-num tnum" style={{ fontSize: 22, color: tone(score) }}>{score}</span>
          </div>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder="Why does your score differ? (e.g. ‘Champion is leaving but new sponsor is stronger.’)"
            className="w-full text-[12px] rounded-md border border-line bg-surface px-2.5 py-2 outline-none resize-none placeholder:text-muted-2"
            rows={2} />
          <div className="flex items-center justify-end gap-1.5">
            <button onClick={() => setEditing(false)}
              className="text-[11.5px] h-7 px-2.5 rounded-md text-muted hover:text-ink hover:bg-bg-deep">Cancel</button>
            <button onClick={submit}
              className="text-[11.5px] font-semibold h-7 px-3 rounded-md inline-flex items-center gap-1"
              style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
              <Check size={11} strokeWidth={2.2} /> Save override
            </button>
          </div>
        </div>
      )}

      {/* History */}
      {!editing && hydrated && history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-line">
          <div className="mono-label mb-1.5">Override history</div>
          <div className="space-y-1">
            {history.slice(-3).reverse().map((h, i) => (
              <div key={i} className="text-[11px] text-muted-2 flex items-center gap-2">
                <span className="font-mono tnum text-ink-2">{h.score}</span>
                <span>by {h.by}</span>
                <span className="italic-emph flex-1 truncate">— {h.reason || "no reason"}</span>
                <span className="text-muted-2">{new Date(h.at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// IDENTITY MATRIX — cross-system reconciliation
// ---------------------------------------------------------------------

type IdentityRow = { system: string; status: "matched" | "probable" | "missing"; recordId: string; matchedBy: string; lastSync: string; confidence?: number };

function identityRowsFor(account: AccountDetail): IdentityRow[] {
  // Deterministic generator based on slug
  const seed = account.name.length + account.domain.length;
  const id = (prefix: string, len: number) => prefix + Array.from({ length: len }, (_, i) => (seed * (i + 7) % 36).toString(36)).join("").toUpperCase();
  return [
    { system: "Salesforce",  status: "matched",  recordId: id("0014v00009", 7),     matchedBy: `domain · ${account.domain}`, lastSync: "12 min ago", confidence: 96 },
    { system: "HubSpot",     status: "matched",  recordId: `co-${id("", 9)}`,        matchedBy: "domain + name",              lastSync: "1 hr ago",   confidence: 88 },
    { system: "Mixpanel",    status: account.status === "Customer" ? "matched" : "probable",
                              recordId: `proj_${id("", 8).toLowerCase()}`,           matchedBy: "tracking key + domain",      lastSync: "3 hr ago",   confidence: account.status === "Customer" ? 91 : 62 },
    { system: "Gong",        status: "matched",  recordId: `acc_${id("", 10).toLowerCase()}`, matchedBy: "domain · email recipients",  lastSync: "22 min ago", confidence: 94 },
    { system: "Slack",       status: account.status === "Customer" ? "matched" : "missing",
                              recordId: account.status === "Customer" ? `#cust-${slugify(account.name)}` : "—",
                              matchedBy: account.status === "Customer" ? "channel naming convention" : "no shared channel — invite to launch",
                              lastSync: account.status === "Customer" ? "live" : "—",
                              confidence: account.status === "Customer" ? 78 : undefined },
    { system: "Zendesk",     status: account.status === "Customer" ? "matched" : "missing",
                              recordId: account.status === "Customer" ? `org_${id("", 6).toLowerCase()}` : "—",
                              matchedBy: account.status === "Customer" ? "domain" : "no support tickets — N/A for prospects",
                              lastSync: account.status === "Customer" ? "9 min ago" : "—",
                              confidence: account.status === "Customer" ? 96 : undefined },
  ];
}

function IdentityMatrixCard({ account }: { account: AccountDetail }) {
  const rows = identityRowsFor(account);
  const matched = rows.filter((r) => r.status === "matched").length;
  const probable = rows.filter((r) => r.status === "probable").length;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="mono-label">Identity matrix · cross-system</div>
        <div className="text-[10.5px] text-muted-2">
          <span className="text-ink-2 font-medium">{matched}</span> matched
          {probable > 0 && (<>, <span style={{ color: "var(--warn)" }}>{probable} need confirm</span></>)}
        </div>
      </div>

      <div className="space-y-1">
        {rows.map((r) => <IdentityRow key={r.system} row={r} />)}
      </div>
    </div>
  );
}

function IdentityRow({ row }: { row: IdentityRow }) {
  const tone = row.status === "matched" ? "var(--pos)" : row.status === "probable" ? "var(--warn)" : "var(--muted-2)";
  const soft = row.status === "matched" ? "var(--pos-soft)" : row.status === "probable" ? "var(--warn-soft)" : "var(--bg-deep)";
  const StatusIcon = row.status === "matched" ? Check : row.status === "probable" ? AlertTriangle : X;
  return (
    <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-bg-deep">
      <div className="w-6 h-6 rounded-md grid place-items-center shrink-0" style={{ background: soft }}>
        <StatusIcon size={11} strokeWidth={2} style={{ color: tone }} />
      </div>
      <div className="w-24 shrink-0">
        <SourceChip source={row.system as any} size="xs" />
      </div>
      <div className="flex-1 min-w-0 text-[11.5px]">
        <div className="text-ink font-medium truncate font-mono text-[11px]">{row.recordId}</div>
        <div className="text-muted-2 text-[10.5px] truncate">matched by {row.matchedBy}</div>
      </div>
      {row.confidence !== undefined && (
        <span className="text-[10.5px] tnum font-mono" style={{ color: tone }}>{row.confidence}%</span>
      )}
      <span className="text-[10px] text-muted-2 w-16 text-right">{row.lastSync}</span>
      {row.status === "probable" && (
        <button className="text-[10px] font-semibold h-6 px-2 rounded-md"
          style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
          Confirm
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// NOTES & TASKS — quick free-form notes + checklist per account, persisted
// ---------------------------------------------------------------------

const NOTES_KEY = "alphard:account-notes";
const TASKS_KEY = "alphard:account-tasks";

type AccountTask = { id: string; text: string; done: boolean; createdAt: string };

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(window.localStorage.getItem(key) ?? "null") ?? fallback; }
  catch { return fallback; }
}
function saveJson<T>(key: string, value: T) {
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function NotesCard({ slug }: { slug: string }) {
  const [tab, setTab] = useState<"notes" | "tasks">("notes");
  return (
    <div className="card p-4 h-full flex flex-col min-h-[260px]">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1">
          <button onClick={() => setTab("notes")}
            className={`text-[11px] font-semibold uppercase tracking-[0.06em] px-2 py-1 rounded-md ${tab === "notes" ? "bg-bg-deep text-ink" : "text-muted hover:text-ink"}`}>
            Notes
          </button>
          <button onClick={() => setTab("tasks")}
            className={`text-[11px] font-semibold uppercase tracking-[0.06em] px-2 py-1 rounded-md ${tab === "tasks" ? "bg-bg-deep text-ink" : "text-muted hover:text-ink"}`}>
            Tasks <TaskCount slug={slug} />
          </button>
        </div>
      </div>
      {tab === "notes" ? <NotesPane slug={slug} /> : <TasksPane slug={slug} />}
    </div>
  );
}

function TaskCount({ slug }: { slug: string }) {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    const map = loadJson<Record<string, AccountTask[]>>(TASKS_KEY, {});
    const open = (map[slug] ?? []).filter((t) => !t.done).length;
    setCount(open);
  }, [slug]);
  if (count === null || count === 0) return null;
  return <span className="ml-1 text-[10px] font-mono tnum px-1 rounded text-muted-2">{count}</span>;
}

function NotesPane({ slug }: { slug: string }) {
  const [text, setText] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const map = loadJson<Record<string, string>>(NOTES_KEY, {});
    setText(map[slug] ?? "");
    setHydrated(true);
  }, [slug]);

  useEffect(() => {
    if (!hydrated) return;
    const map = loadJson<Record<string, string>>(NOTES_KEY, {});
    map[slug] = text;
    saveJson(NOTES_KEY, map);
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 800);
    return () => clearTimeout(t);
  }, [text, slug, hydrated]);

  return (
    <div className="flex-1 flex flex-col">
      <textarea value={text} onChange={(e) => setText(e.target.value)}
        placeholder="Free-form notes — what to bring up, who said what, what to follow up on. Markdown-friendly. Persists per account."
        className="flex-1 min-h-[160px] text-[12.5px] rounded-md bg-surface-2 border border-line px-2.5 py-2 outline-none resize-none placeholder:text-muted-2 leading-relaxed" />
      <div className="flex items-center justify-between text-[10.5px] mt-1.5">
        <span className="text-muted-2 italic-emph">Saved locally · synced across devices in production</span>
        {saved && <span className="text-muted-2 inline-flex items-center gap-1"><Check size={10} /> Saved</span>}
      </div>
    </div>
  );
}

function TasksPane({ slug }: { slug: string }) {
  const [tasks, setTasks] = useState<AccountTask[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const map = loadJson<Record<string, AccountTask[]>>(TASKS_KEY, {});
    setTasks(map[slug] ?? []);
    setHydrated(true);
  }, [slug]);

  useEffect(() => {
    if (!hydrated) return;
    const map = loadJson<Record<string, AccountTask[]>>(TASKS_KEY, {});
    map[slug] = tasks;
    saveJson(TASKS_KEY, map);
  }, [tasks, slug, hydrated]);

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    setTasks([{ id: `t_${Date.now()}`, text: t, done: false, createdAt: new Date().toISOString() }, ...tasks]);
    setDraft("");
  };
  const toggle = (id: string) => setTasks((ts) => ts.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  const remove = (id: string) => setTasks((ts) => ts.filter((t) => t.id !== id));

  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center gap-1.5 mb-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") add(); }}
          placeholder="Add a task — Enter to save"
          className="flex-1 text-[12.5px] h-8 px-2.5 rounded-md bg-surface-2 border border-line outline-none placeholder:text-muted-2" />
        <button onClick={add}
          className="text-[11.5px] font-semibold h-8 px-2.5 rounded-md inline-flex items-center gap-1"
          style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
          <Plus size={11} /> Add
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1 max-h-[200px] pr-1">
        {open.map((t) => (
          <TaskRow key={t.id} task={t} onToggle={() => toggle(t.id)} onRemove={() => remove(t.id)} />
        ))}
        {open.length === 0 && tasks.length === 0 && (
          <div className="text-[12px] text-muted-2 py-6 text-center italic-emph">No tasks yet — first one's free.</div>
        )}
        {done.length > 0 && (
          <>
            <div className="mono-label pt-2">Completed · {done.length}</div>
            {done.slice(0, 5).map((t) => (
              <TaskRow key={t.id} task={t} onToggle={() => toggle(t.id)} onRemove={() => remove(t.id)} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function TaskRow({ task, onToggle, onRemove }: { task: AccountTask; onToggle: () => void; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 px-1.5 py-1 rounded-md hover:bg-bg-deep group">
      <button onClick={onToggle}
        className={`w-4 h-4 rounded grid place-items-center border transition-colors shrink-0 ${
          task.done ? "border-transparent" : "border-line-strong hover:border-ink"
        }`}
        style={task.done ? { background: "var(--accent)" } : undefined}>
        {task.done && <Check size={10} strokeWidth={2.4} style={{ color: "var(--accent-ink)" }} />}
      </button>
      <span className={`text-[12px] flex-1 ${task.done ? "text-muted-2 line-through" : "text-ink-2"}`}>
        {task.text}
      </span>
      <button onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded grid place-items-center text-muted-2 hover:text-ink hover:bg-line">
        <X size={10} strokeWidth={1.8} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------
// AnalyticsPanel — combines product usage + adoption telemetry into a
// single tab. Designed for what a CSM actually needs:
// 1. Active users + activation funnel + 14-day per-user grid (Userflow-style)
// 2. Lifecycle health: WAU/MAU trend, feature breadth, time-to-value
// 3. CSM action metrics: outreach delivered, training completed, recovery
//    plays fired, escalations, sponsor cadence
// 4. Existing AdoptionPanel for the deeper drill-down (teams, at-risk
//    users, sequence delays).
// ---------------------------------------------------------------------
function AnalyticsPanel({ account, adoption }: { account: AccountDetail; adoption: any }) {
  if (!adoption) {
    return <AdoptionEmpty status={account.status} />;
  }
  return (
    <div className="space-y-4">
      {/* Userflow-style usage summary at the top */}
      <UsageBlock account={account} adoption={adoption} onSeeMore={() => { /* already on this tab */ }} />

      {/* CSM action metrics — what the CSM team has done for this account */}
      <CSMActionMetrics account={account} adoption={adoption} />

      {/* Full adoption drill-down — teams, at-risk users, sequence delays */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[13px] font-semibold text-ink">Adoption breakdown</div>
            <div className="text-[11.5px] text-muted">Per-team WAU/MAU, blocked sequences, and at-risk users</div>
          </div>
        </div>
        <AdoptionPanel data={adoption} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// CSMActionMetrics — what the CSM team has done for this account this
// quarter. Surfaces the cause-and-effect side of the relationship that
// passive product telemetry can't show.
// ---------------------------------------------------------------------
function CSMActionMetrics({ account, adoption }: { account: AccountDetail; adoption: any }) {
  // All numbers are deterministic-from-health so the demo accounts feel
  // distinct without needing to extend the mock data layer.
  const h = account.healthScore;
  const isHealthy = h >= 75;

  const metrics = [
    {
      group: "Engagement",
      tone: "var(--info)",
      items: [
        { label: "QBRs delivered (Q2)",    value: isHealthy ? 2 : 1,     target: 2,   tone: isHealthy ? "var(--pos)" : "var(--warn)" },
        { label: "Touchpoints last 30d",   value: isHealthy ? 12 : 5,    target: 8,   tone: isHealthy ? "var(--pos)" : "var(--neg)"  },
        { label: "Sponsor reply rate",     value: isHealthy ? "89%" : "42%", target: "75%", tone: isHealthy ? "var(--pos)" : "var(--neg)" },
        { label: "Avg response time",      value: isHealthy ? "3h" : "2.4d", target: "<1d",  tone: isHealthy ? "var(--pos)" : "var(--neg)" },
      ],
    },
    {
      group: "Onboarding & training",
      tone: "var(--accent-deep)",
      items: [
        { label: "Trainings completed",    value: isHealthy ? 7 : 3,     target: 6,   tone: isHealthy ? "var(--pos)" : "var(--warn)" },
        { label: "Time to first value",    value: isHealthy ? "11d" : "28d", target: "<14d", tone: isHealthy ? "var(--pos)" : "var(--neg)" },
        { label: "Champions activated",    value: isHealthy ? 4 : 2,     target: 3,   tone: isHealthy ? "var(--pos)" : "var(--warn)" },
        { label: "Documentation pageviews",value: isHealthy ? 184 : 62,  target: 120, tone: isHealthy ? "var(--pos)" : "var(--warn)" },
      ],
    },
    {
      group: "Recovery & risk",
      tone: "var(--neg)",
      items: [
        { label: "Recovery plays fired",   value: isHealthy ? 0 : 4,     target: 0,   tone: isHealthy ? "var(--pos)" : "var(--warn)"  },
        { label: "Open escalations",       value: isHealthy ? 0 : 2,     target: 0,   tone: isHealthy ? "var(--pos)" : "var(--neg)"   },
        { label: "Tickets opened (30d)",   value: isHealthy ? 4 : 14,    target: 6,   tone: isHealthy ? "var(--pos)" : "var(--neg)"   },
        { label: "Tickets resolved P1+",   value: isHealthy ? "100%" : "78%", target: "95%", tone: isHealthy ? "var(--pos)" : "var(--neg)" },
      ],
    },
  ];

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={13} strokeWidth={1.7} style={{ color: "var(--accent-deep)" }} />
            <span className="text-[13px] font-semibold text-ink">CSM action metrics</span>
            <span className="text-[10.5px] text-muted">Q2 2026 · all teams</span>
          </div>
          <div className="text-[11px] text-muted mt-0.5">What the success team has shipped for this account vs. the playbook target.</div>
        </div>
        <button className="text-[10.5px] text-muted hover:text-ink inline-flex items-center gap-0.5">
          Customise <ArrowRight size={10} strokeWidth={1.6} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: "var(--line)" }}>
        {metrics.map((m) => (
          <div key={m.group} className="bg-surface p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.tone }} />
              <span className="text-[11px] font-semibold text-ink-2">{m.group}</span>
            </div>
            <div className="space-y-2.5">
              {m.items.map((row) => (
                <div key={row.label} className="flex items-baseline gap-3">
                  <span className="text-[11.5px] text-ink-2 flex-1 min-w-0 truncate">{row.label}</span>
                  <span className="text-[12px] font-semibold tnum" style={{ color: row.tone }}>
                    {row.value}
                  </span>
                  <span className="text-[10px] font-mono tnum text-muted-2 w-12 text-right shrink-0">
                    /{row.target}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// AI OVERVIEW — generative account summary at the top of the Brief tab.
// Synthesises health, signals, touchpoints, and adoption into a concise
// narrative the CSM can scan before a call.
// ---------------------------------------------------------------------
function AIOverviewCard({ account, adoption }: { account: AccountDetail; adoption: any }) {
  const toast = useToast();
  const h = account.healthScore;
  const isCustomer = account.status === "Customer";
  const healthLabel = h >= 80 ? "Healthy" : h >= 60 ? "Watch" : "At risk";
  const healthToneColor = h >= 80 ? "var(--pos)" : h >= 60 ? "var(--warn)" : "var(--neg)";
  const healthSoft = h >= 80 ? "var(--pos-soft)" : h >= 60 ? "var(--warn-soft)" : "var(--neg-soft)";

  // Pull rich context from mock
  const accountSlug = slugifyMock(account.name);
  const opps = expansionOpportunities.filter((o) => o.accountName === account.name);
  const champEvents = championChanges.filter((c) => c.accountName === account.name);
  const topOpp = opps.sort((x, y) => y.score - x.score)[0];
  const totalPipeline = opps.reduce((s, o) => s + o.estimatedArr, 0);
  const targetArr = account.arr ? Math.round(account.arr * 1.30) : 0;
  const expansionScore = topOpp?.score ?? Math.max(20, h - 20);
  const expansionTone = expansionScore >= 85 ? "#F5360F" : expansionScore >= 75 ? "#F5B900" : expansionScore >= 60 ? "var(--accent)" : "var(--muted)";

  // Champion derived from top opp or account stakeholders
  const champion = topOpp?.champion ?? account.stakeholders[0]?.name ?? "Unknown";
  const championTitle = topOpp?.championTitle ?? account.stakeholders[0]?.title ?? "—";
  const championStatus: "active" | "silent" | "promoted" = champEvents.find((c) => c.changeType === "promotion")
    ? "promoted"
    : (account.signals.find((s) => /silent/i.test(s.body)) ? "silent" : "active");
  const championStatusMeta: Record<string, { label: string; tone: string; soft: string }> = {
    active:    { label: "Active",    tone: "var(--pos)", soft: "var(--pos-soft)" },
    silent:    { label: "Silent",    tone: "var(--neg)", soft: "var(--neg-soft)" },
    promoted:  { label: "Promoted",  tone: "var(--accent-deep)", soft: "var(--accent-soft)" },
  };
  const champStatusM = championStatusMeta[championStatus];

  // Stakeholder coverage map
  const stakeholderRoles = [
    { role: "Champion",        person: champion,                                      status: championStatus === "silent" ? ("silent" as const) : ("won" as const) },
    { role: "Economic Buyer",  person: isCustomer && h >= 70 ? "VP / CFO aligned"     : "Identifying",        status: isCustomer && h >= 80 ? ("won" as const) : isCustomer ? ("engaging" as const) : ("needed" as const) },
    { role: "Technical Buyer", person: "Eng / Security review",                       status: ("engaging" as const) },
    { role: "End-user",        person: adoption ? `${adoption.monthlyActiveUsers} active users` : "TBD",      status: adoption && adoption.monthlyActiveUsers > 100 ? ("won" as const) : ("engaging" as const) },
  ];

  const narrative = isCustomer
    ? h >= 80
      ? `${account.name} is in strong shape — health ${h}/100 with stable adoption${adoption ? ` (${adoption.monthlyActiveUsers} MAU, WAU/MAU ${adoption.wauMauCurrent ?? "0.71"})` : ""}. Renewal in ${account.renewalDays > 0 ? `${account.renewalDays} days` : "—"}, NRR ${account.nrr}%. ${champEvents.find((c) => c.changeType === "promotion") ? `Champion ${champion} just got promoted — expansion door is open.` : "Champion active, sentiment positive."} ${topOpp ? `Highest-scoring play: ${topOpp.play}` : "Primary opportunity: expansion into adjacent teams."}`
      : h >= 60
      ? `${account.name} needs attention — health ${h}/100 with mixed signals.${adoption ? ` MAU is ${adoption.monthlyActiveUsers}, WAU/MAU dipped ${adoption.wauMauDelta}%.` : ""} Renewal in ${account.renewalDays > 0 ? `${account.renewalDays} days` : "lapsed"}. Sponsor engagement has slowed — re-engagement focused on value realisation is the play.`
      : `${account.name} is at risk — health ${h}/100, trending down.${adoption ? ` Usage dropped: ${adoption.monthlyActiveUsers} MAU, ${adoption.wauMauDelta}%.` : ""} Renewal in ${account.renewalDays > 0 ? `${account.renewalDays} days` : "lapsed"}, NRR ${account.nrr}%. Multiple signals flagged: sponsor silent, P0 tickets, procurement shift. Escalate immediately.`
    : `${account.name} is a ${account.segment} prospect in ${account.industry} (${account.employees.toLocaleString()} employees). Pipeline value: ${account.arr ? fmtMoney(account.arr) : "TBD"}. ${account.signals.length > 0 ? `Latest signal: ${account.signals[0].body.slice(0, 110)}…` : "No signals yet."} Focus: build champion map and validate use case fit.`;

  const actions = isCustomer
    ? h >= 80
      ? ["Prep expansion business case", "Schedule next QBR", "Share success metrics with champion"]
      : h >= 60
      ? ["Re-engage sponsor with value update", "Review adoption gaps", "Confirm renewal timeline"]
      : ["Run recovery play immediately", "Escalate to exec sponsor", "Resolve open P0 tickets", "Schedule emergency check-in"]
    : ["Map buying committee", "Validate use case fit", "Send discovery agenda"];

  // Recent momentum — top 3-4 material events
  const momentum = (() => {
    const items: { Icon: any; tone: string; label: string; ago: string }[] = [];
    champEvents.forEach((c) => {
      const Icon = c.changeType === "promotion" ? TrendingUp : c.changeType === "departure" ? AlertTriangle : Users;
      const tone = c.tone === "pos" ? "var(--pos)" : c.tone === "neg" ? "var(--neg)" : "var(--accent-deep)";
      items.push({ Icon, tone, label: `${c.personName} — ${c.changeType === "promotion" ? `→ ${c.newTitle}` : c.changeType === "departure" ? "left company" : c.newTitle}`, ago: c.detectedAgo });
    });
    if (adoption && adoption.wauMauDelta) {
      items.push({
        Icon: adoption.wauMauDelta > 0 ? TrendingUp : Activity,
        tone: adoption.wauMauDelta > 0 ? "var(--pos)" : "var(--warn)",
        label: `WAU/MAU ${adoption.wauMauDelta > 0 ? "up" : "down"} ${Math.abs(adoption.wauMauDelta)}% in last 14 days`,
        ago: "this wk",
      });
    }
    if (account.signals[0]) {
      items.push({ Icon: Sparkles, tone: "var(--accent-deep)", label: account.signals[0].body.slice(0, 70), ago: "today" });
    }
    if (topOpp && topOpp.daysInStage <= 7) {
      items.push({ Icon: Zap, tone: "var(--accent)", label: `${topOpp.productName} moved to ${topOpp.stage}`, ago: `${topOpp.daysInStage}d` });
    }
    return items.slice(0, 4);
  })();

  // Active risks
  const risks = (() => {
    const r: { label: string; severity: "high" | "med" | "low" }[] = [];
    if (account.renewalDays > 0 && account.renewalDays < 60) r.push({ label: `Renewal in ${account.renewalDays} days`, severity: "high" });
    if (h < 70) r.push({ label: `Health ${h}/100 below threshold`, severity: h < 50 ? "high" : "med" });
    if (championStatus === "silent") r.push({ label: "Champion silent 14+ days", severity: "high" });
    if (topOpp?.risks?.[0]) r.push({ label: topOpp.risks[0], severity: "med" });
    if (adoption && adoption.wauMauDelta && adoption.wauMauDelta < -5) r.push({ label: `Usage dropped ${Math.abs(adoption.wauMauDelta)}%`, severity: "med" });
    return r.slice(0, 4);
  })();

  return (
    <div className="card overflow-hidden">
      {/* Header — clean, no gradient bubble */}
      <div className="px-5 py-3.5 flex items-center justify-between gap-3 border-b border-line">
        <div className="flex items-baseline gap-2.5">
          <span className="text-[13px] font-semibold text-ink">Account brief</span>
          <span className="text-[10.5px] text-muted">Updated just now</span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{ background: healthSoft, color: healthToneColor }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: healthToneColor }} />
          {healthLabel}
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* TL;DR narrative */}
        <p className="text-[13px] text-ink-2 leading-relaxed">{narrative}</p>

        {/* Stat strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-px rounded-lg overflow-hidden"
          style={{ background: "var(--line)" }}>
          <Stat label="Health"     value={`${h}`}                            unit="/100"     tone={healthToneColor} />
          {isCustomer && <Stat label="NRR" value={`${account.nrr}`}          unit="%"        tone={account.nrr >= 100 ? "var(--pos)" : "var(--warn)"} />}
          {isCustomer && <Stat label="ARR" value={fmtMoneyShort(account.arr)} unit=""        tone="var(--ink)" />}
          {isCustomer && <Stat label="Renewal" value={account.renewalDays > 0 ? `${account.renewalDays}` : "—"} unit="d" tone={account.renewalDays > 60 ? "var(--ink)" : account.renewalDays > 0 ? "var(--warn)" : "var(--neg)"} />}
          <Stat label="Expansion" value={`${expansionScore}`}                  unit="/100"   tone={expansionTone} />
        </div>

        {/* 2-col context — no colored backgrounds */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* Stakeholder coverage */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-2">Stakeholder coverage</span>
              <span className="text-[10.5px] tnum text-muted">
                {stakeholderRoles.filter(s => s.status === "won").length}/{stakeholderRoles.length}
              </span>
            </div>
            <div className="space-y-2">
              {stakeholderRoles.map((s) => {
                const tone = s.status === "won" ? "var(--pos)" : s.status === "engaging" ? "var(--warn)" : s.status === "silent" ? "var(--neg)" : "var(--muted-2)";
                return (
                  <div key={s.role} className="flex items-center gap-2.5 text-[12px]">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: tone }} />
                    <span className="font-medium text-ink-2 w-[100px] flex-shrink-0">{s.role}</span>
                    <span className="text-muted truncate flex-1">{s.person}</span>
                  </div>
                );
              })}
            </div>
            {champStatusM && (
              <div className="mt-3 pt-2.5 border-t border-line text-[11px] text-muted">
                Champion <span className="font-medium text-ink-2">{champion}</span>
                <span className="mx-1.5 text-muted-2">·</span>
                {championTitle}
                <span className="mx-1.5 text-muted-2">·</span>
                <span className="font-medium" style={{ color: champStatusM.tone }}>{champStatusM.label.toLowerCase()}</span>
              </div>
            )}
          </div>

          {/* Expansion thesis */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-2">Expansion thesis</span>
              <span className="text-[10.5px] tnum text-muted">{expansionScore}/100</span>
            </div>
            {isCustomer && account.arr ? (
              <>
                <div className="text-[12px] text-ink-2 leading-relaxed mb-3">
                  {fmtMoneyShort(account.arr)} ARR today.
                  {totalPipeline > 0 && <> Path to <span className="font-semibold text-ink">{fmtMoneyShort(targetArr)}</span> via <span className="font-semibold" style={{ color: expansionTone }}>{fmtMoneyShort(totalPipeline)}</span> active pipeline.</>}
                  {totalPipeline === 0 && <> No active expansion plays yet — first move: identify use case widening opportunity.</>}
                </div>
                {totalPipeline > 0 && targetArr > 0 && (
                  <div>
                    <div className="text-[10.5px] text-muted-2 mb-1 flex items-center justify-between">
                      <span>Cover to FY26 target</span>
                      <span className="font-mono tnum">{Math.min(100, Math.round((totalPipeline / Math.max(1, targetArr - account.arr)) * 100))}%</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-deep)" }}>
                      <div className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, Math.round((totalPipeline / Math.max(1, targetArr - account.arr)) * 100))}%`,
                          background: expansionTone,
                        }} />
                    </div>
                  </div>
                )}
                {topOpp && (
                  <div className="mt-3 pt-2.5 border-t border-line text-[11px] text-muted">
                    Top play <span className="text-ink-2">{topOpp.productName}</span>
                    <span className="mx-1.5 text-muted-2">·</span>
                    <span className="font-medium" style={{ color: expansionTone }}>{fmtMoneyShort(topOpp.estimatedArr)}</span>
                    <span className="mx-1.5 text-muted-2">·</span>
                    <span className="capitalize">{topOpp.stage}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-[12px] text-ink-2 leading-relaxed">
                {account.signals[0]?.body.slice(0, 140) ?? "No expansion signals yet — focus on champion mapping and use case validation."}
              </div>
            )}
          </div>
        </div>

        {/* Momentum + Risks — no colored backgrounds */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-5">
          <div>
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-3">Recent momentum</div>
            <div className="space-y-2">
              {momentum.length === 0 ? (
                <div className="text-[11.5px] text-muted-2 py-1">No material changes this week.</div>
              ) : momentum.map((m, i) => (
                <div key={i} className="flex items-baseline gap-2.5 text-[12px]">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 translate-y-[5px]" style={{ background: m.tone }} />
                  <span className="flex-1 text-ink-2 leading-snug truncate">{m.label}</span>
                  <span className="text-[10px] font-mono text-muted-2 shrink-0">{m.ago}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-2">Active risks</span>
              <span className="text-[10.5px] tnum text-muted">{risks.length}</span>
            </div>
            <div className="space-y-2">
              {risks.length === 0 ? (
                <div className="text-[12px] text-muted-2 py-1">Account is clear.</div>
              ) : risks.map((r, i) => {
                const sev = r.severity === "high" ? "var(--neg)" : r.severity === "med" ? "var(--warn)" : "var(--muted)";
                return (
                  <div key={i} className="flex items-baseline gap-2.5 text-[12px]">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 translate-y-[5px]" style={{ background: sev }} />
                    <span className="text-ink-2 leading-snug flex-1">{r.label}</span>
                    <span className="text-[9.5px] font-medium uppercase tracking-[0.12em] shrink-0"
                      style={{ color: sev }}>
                      {r.severity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recommended actions */}
        <div className="border-t border-line pt-4">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-2.5">Recommended next moves</div>
          <div className="flex flex-wrap gap-1.5">
            {actions.map((a) => (
              <button key={a}
                onClick={() => toast({ tone: "info", title: a, body: `Action queued — your AI co-pilot will draft the first step.` })}
                className="text-[11.5px] font-medium px-2.5 py-1.5 rounded-md border border-line bg-surface hover:bg-bg-deep text-ink-2 transition-colors">
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, unit, tone }: { label: string; value: string; unit?: string; tone: string }) {
  return (
    <div className="px-3.5 py-3" style={{ background: "var(--surface)" }}>
      <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-2 mb-1">{label}</div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-[17px] font-semibold tnum" style={{ color: tone, letterSpacing: "-0.015em" }}>{value}</span>
        {unit && <span className="text-[10.5px] tnum text-muted-2">{unit}</span>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// LIFECYCLE BATON — AE → AM → CSM ownership chain
// Addresses Walid R2's point: "expansion is moving from sales to CS"
// Always visible on the Brief panel so the team can see who owns what
// at each phase, with a clear handoff trigger button.
// ═══════════════════════════════════════════════════════════════════════
function LifecycleBaton({ account }: { account: AccountDetail }) {
  const toast = useToast();
  const isCustomer = account.status === "Customer";
  const h = account.healthScore;

  type Phase = {
    role: "AE" | "AM" | "CSM";
    label: string;
    owner: string;
    initials: string;
    status: "done" | "active" | "next" | "later";
    detail: string;
  };

  // Determine current phase from account state
  const currentPhase: "AE" | "AM" | "CSM" =
    !isCustomer ? "AE"
    : isCustomer && account.renewalDays > 0 && account.renewalDays <= 90 ? "CSM"
    : "AM";

  const phases: Phase[] = [
    {
      role: "AE",
      label: "Acquisition",
      owner: !isCustomer ? account.owner : "Brad Allen",
      initials: !isCustomer ? account.ownerInitials : "BA",
      status: !isCustomer ? "active" : "done",
      detail: !isCustomer ? "Driving discovery + MEDDPICC" : `Closed ${account.arr ? fmtMoneyShort(account.arr) : "—"} · Mar 2024`,
    },
    {
      role: "AM",
      label: "Expansion",
      owner: isCustomer ? account.owner : "Sarah Chen",
      initials: isCustomer ? account.ownerInitials : "SC",
      status: !isCustomer ? "next" : currentPhase === "AM" ? "active" : "done",
      detail: !isCustomer ? "Picks up post-close" : currentPhase === "AM" ? `Hunting expansion · ${account.nrr}% NRR` : "Handed renewal to CSM",
    },
    {
      role: "CSM",
      label: "Adoption + Renewal",
      owner: isCustomer ? "Rachel Kim" : "—",
      initials: isCustomer ? "RK" : "—",
      status: currentPhase === "CSM" ? "active" : !isCustomer ? "later" : currentPhase === "AM" ? "next" : "active",
      detail: !isCustomer ? "Engaged post-onboarding"
        : currentPhase === "CSM" ? `Renewal in ${account.renewalDays}d · ${h >= 75 ? "on track" : "at risk"}`
        : `Adoption ${h >= 75 ? "healthy" : "watch"} · last QBR ${account.lastQbrDays}d ago`,
    },
  ];

  const STATUS_LABEL: Record<Phase["status"], string> = {
    done:   "Done",
    active: "Active",
    next:   "Next",
    later:  "Later",
  };
  const STATUS_TONE: Record<Phase["status"], string> = {
    done:   "var(--pos)",
    active: "var(--accent-deep)",
    next:   "var(--warn)",
    later:  "var(--muted-2)",
  };

  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-baseline gap-2.5">
          <span className="text-[13px] font-semibold text-ink">Lifecycle</span>
          <span className="text-[11px] text-muted">AE → AM → CSM ownership</span>
        </div>
        <button onClick={() => toast({ tone: "info", title: "Handoff triggered", body: "Notes, intel, and signals will be packaged and sent to the next owner." })}
          className="text-[11.5px] font-medium px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 transition-colors hover:bg-bg-deep"
          style={{ color: "var(--ink-2)", border: "1px solid var(--line)" }}>
          Trigger handoff <ArrowRight size={11} strokeWidth={2.2} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {phases.map((p, i) => {
          const tone = STATUS_TONE[p.status];
          const isActive = p.status === "active";
          return (
            <div key={p.role} className="relative">
              {/* Connector line to next phase */}
              {i < phases.length - 1 && (
                <div className="absolute top-3 right-[-6px] w-3 h-px"
                  style={{ background: p.status === "done" ? "var(--pos)" : "var(--line)" }} />
              )}
              <div className="relative rounded-lg p-3.5"
                style={{
                  background: "var(--surface)",
                  border: `1px solid ${isActive ? "color-mix(in srgb, var(--accent) 25%, var(--line))" : "var(--line)"}`,
                  boxShadow: isActive ? "0 0 0 3px color-mix(in srgb, var(--accent) 8%, transparent)" : undefined,
                }}>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: tone }}>
                    {p.role}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-medium" style={{ color: tone }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: tone, opacity: p.status === "later" ? 0.4 : 1 }} />
                    {STATUS_LABEL[p.status]}
                  </span>
                </div>
                <div className="text-[13px] font-semibold text-ink mb-2">{p.label}</div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full grid place-items-center text-[8px] font-semibold text-white shrink-0"
                    style={{ background: "var(--ink)" }}>
                    {p.initials}
                  </div>
                  <span className="text-[11px] font-medium text-ink-2 truncate">{p.owner}</span>
                </div>
                <div className="text-[10.5px] text-muted leading-snug">{p.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// JOURNEY PANEL — horizontal timeline + card grid
// Shows all touchpoints in one view with a timeline strip and detail cards.
// -------------------------------------------------------------------------
function JourneyPanel({ account }: { account: AccountDetail }) {
  const { user: __journeyUser } = useUser();
  const userFullName = __journeyUser.name;
  const isCustomer = account.status === "Customer";
  const h = account.healthScore;

  type TouchpointType = "milestone" | "call" | "email" | "meeting" | "signal" | "deal" | "ticket" | "onboarding";
  type Touchpoint = {
    id: string; type: TouchpointType; title: string; description: string;
    date: string; isoDate: string; actor?: string; phase: string;
    tone: "pos" | "warn" | "neg" | "info" | "neutral" | "accent";
  };

  const JOURNEY_ICON: Record<TouchpointType, typeof Milestone> = {
    milestone: Flag, call: Phone, email: Mail, meeting: Video,
    signal: Zap, deal: DollarSign, ticket: AlertTriangle, onboarding: Award,
  };

  const TONE: Record<Touchpoint["tone"], { bg: string; color: string; ring: string }> = {
    pos:     { bg: "var(--pos-soft)",    color: "var(--pos)",        ring: "rgba(34,197,94,0.2)" },
    warn:    { bg: "var(--warn-soft)",   color: "var(--warn)",       ring: "rgba(245,158,11,0.2)" },
    neg:     { bg: "var(--neg-soft)",    color: "var(--neg)",        ring: "rgba(239,68,68,0.2)" },
    info:    { bg: "var(--info-soft)",   color: "var(--info)",       ring: "rgba(59,130,246,0.2)" },
    neutral: { bg: "var(--bg-deep)",     color: "var(--muted)",      ring: "rgba(128,128,128,0.1)" },
    accent:  { bg: "var(--accent-soft)", color: "var(--accent-deep)", ring: "rgba(38,109,240,0.2)" },
  };

  const touchpoints: Touchpoint[] = [
    { id: "j1",  type: "milestone",  phase: "Pre-sale", title: "Account created",       description: `${account.name} added to the platform as a ${account.status.toLowerCase()}.`,  date: "Jan 2024", isoDate: "2024-01-08",  tone: "accent" },
    { id: "j2",  type: "call",       phase: "Pre-sale", title: "Discovery call",        description: "Initial needs assessment — mapped 3 core use cases and identified champion.",   date: "Jan 2024", isoDate: "2024-01-22",  actor: userFullName, tone: "pos" },
    { id: "j3",  type: "email",      phase: "Pre-sale", title: "Proposal sent",         description: "Sent commercial proposal covering Sales Cloud + CS Cloud bundle.",              date: "Feb 2024", isoDate: "2024-02-14",  actor: userFullName, tone: "info" },
    { id: "j4",  type: "deal",       phase: "Pre-sale", title: "Deal closed — Won",     description: `Signed ${account.arr ? fmtMoney(account.arr) : "—"} annual contract. Champion: ${account.stakeholders[0]?.name ?? "TBD"}.`, date: "Mar 2024", isoDate: "2024-03-05", tone: "pos" },
    { id: "j5",  type: "onboarding", phase: "Onboarding", title: "Onboarding kicked off", description: "SSO configured, field mapping complete, sandbox provisioned. 3 training sessions scheduled.", date: "Mar 2024", isoDate: "2024-03-18", actor: "Rachel Kim", tone: "accent" },
    { id: "j6",  type: "milestone",  phase: "Onboarding", title: "First value milestone", description: "Team reached 80% feature breadth within 45 days. Activation confirmed.",       date: "May 2024", isoDate: "2024-05-02",  tone: "pos" },
    { id: "j7",  type: "meeting",    phase: "Adoption",   title: "Q1 QBR",                description: "Reviewed adoption metrics, ROI from first quarter. Customer requested cross-BU references.", date: "Jun 2024", isoDate: "2024-06-12", actor: userFullName, tone: "info" },
    { id: "j8",  type: "signal",     phase: "Adoption",   title: h >= 75 ? "Expansion signal detected" : "Usage decline detected", description: h >= 75 ? "Networking team expressed interest in platform expansion. Budget confirmed by VP." : "WAU/MAU dropped below 0.5. Two key users went dormant.", date: "Aug 2024", isoDate: "2024-08-19", tone: h >= 75 ? "accent" : "warn" },
    { id: "j9",  type: "ticket",     phase: "Adoption",   title: "P1 — Webhook retry SLA", description: "Events lost during failover window. Escalated to engineering. Resolved in 48h.", date: "Sep 2024", isoDate: "2024-09-10", tone: "warn" },
    { id: "j10", type: "meeting",    phase: "Growth",     title: "Q2 QBR",                description: "Presented ROI: 32% efficiency gain. Aligned on H2 success plan with 3 initiatives.", date: "Oct 2024", isoDate: "2024-10-08", actor: userFullName, tone: "pos" },
    { id: "j11", type: "call",       phase: "Growth",     title: h >= 75 ? "Expansion alignment" : "Re-engagement call", description: h >= 75 ? "Confirmed Q3 expansion budget. Finance Ops meeting set for next week." : "Champion responded after 14-day gap. Renewal still on track.", date: "Nov 2024", isoDate: "2024-11-15", actor: userFullName, tone: h >= 75 ? "pos" : "warn" },
    { id: "j12", type: isCustomer ? "deal" : "signal", phase: "Renewal", title: isCustomer ? `Renewal — ${account.renewalDays > 0 ? `${account.renewalDays}d out` : "Due"}` : "Prospect evaluation ongoing", description: isCustomer ? `Annual renewal for ${account.arr ? fmtMoney(account.arr) : "—"}. ${h >= 75 ? "On track — champion aligned." : "At risk — procurement shifting to legal."}` : "Multiple stakeholders engaged. Next step: technical deep-dive.", date: "May 2026", isoDate: "2026-05-04", tone: h >= 75 ? "pos" : "warn" },
  ];

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<TouchpointType | "all">("all");

  const filteredTouchpoints = typeFilter === "all" ? touchpoints : touchpoints.filter(t => t.type === typeFilter);
  const phases = Array.from(new Set(filteredTouchpoints.map(t => t.phase)));
  const PHASE_COLORS: Record<string, string> = { "Pre-sale": "var(--info)", "Onboarding": "var(--accent-deep)", "Adoption": "var(--pos)", "Growth": "var(--warn)", "Renewal": "var(--neg)" };

  const minTs = new Date(touchpoints[0].isoDate).getTime();
  const maxTs = new Date(touchpoints[touchpoints.length - 1].isoDate).getTime();
  const range = maxTs - minTs || 1;
  const pct = (iso: string) => ((new Date(iso).getTime() - minTs) / range) * 100;

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-[15px] font-semibold text-ink">Account Journey</h3>
          <p className="text-[12px] text-muted mt-0.5">{filteredTouchpoints.length} of {touchpoints.length} touchpoints · {account.name}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(["all", "milestone", "call", "meeting", "email", "signal", "deal", "ticket", "onboarding"] as (TouchpointType | "all")[]).map(t => {
            const Icon = t === "all" ? null : JOURNEY_ICON[t];
            const count = t === "all" ? touchpoints.length : touchpoints.filter(tp => tp.type === t).length;
            if (t !== "all" && count === 0) return null;
            const active = typeFilter === t;
            return (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[10.5px] font-medium capitalize transition-all ${
                  active ? "bg-ink text-white shadow-sm" : "text-muted hover:text-ink border border-line hover:border-ink/20"
                }`}>
                {Icon && <Icon size={10} strokeWidth={1.6} />}
                {t === "all" ? "All" : t}
                <span className={`text-[9px] ${active ? "opacity-70" : "opacity-50"}`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Horizontal timeline */}
      <div className="card px-6 py-6">
        <div className="relative" style={{ height: 72 }}>
          {/* Phase segments */}
          {phases.map((phase, pi) => {
            const pts = filteredTouchpoints.filter(t => t.phase === phase);
            if (pts.length === 0) return null;
            const left = pct(pts[0].isoDate);
            const right = pct(pts[pts.length - 1].isoDate);
            const color = PHASE_COLORS[phase] ?? "var(--muted)";
            return (
              <div key={phase}>
                <div className="absolute top-0 text-[9px] font-semibold uppercase tracking-wider" style={{ left: `${left}%`, color }}>{phase}</div>
                <div className="absolute top-[28px] h-[3px] rounded-full" style={{ left: `${left}%`, width: `${Math.max(right - left, 1)}%`, background: color, opacity: 0.35 }} />
              </div>
            );
          })}

          {/* Base track */}
          <div className="absolute left-0 right-0 top-[29px] h-[1px]" style={{ background: "var(--line)" }} />

          {/* Dots */}
          {filteredTouchpoints.map((tp) => {
            const tone = TONE[tp.tone];
            const Icon = JOURNEY_ICON[tp.type];
            const isActive = expandedId === tp.id;
            return (
              <button key={tp.id} onClick={() => setExpandedId(isActive ? null : tp.id)}
                className={`absolute -translate-x-1/2 transition-all duration-200 ${isActive ? "z-10 scale-[1.35]" : "hover:scale-[1.15]"}`}
                style={{ left: `${pct(tp.isoDate)}%`, top: isActive ? 16 : 20 }}
                title={`${tp.title} — ${tp.date}`}>
                <div className="w-[20px] h-[20px] rounded-full grid place-items-center"
                  style={{ background: tone.bg, border: `2px solid ${tone.color}`, boxShadow: isActive ? `0 0 0 4px ${tone.ring}` : "none" }}>
                  <Icon size={8} strokeWidth={2.5} style={{ color: tone.color }} />
                </div>
              </button>
            );
          })}

          {/* Year markers */}
          {[2025, 2026].map(yr => {
            const ts = new Date(`${yr}-01-01`).getTime();
            if (ts < minTs || ts > maxTs) return null;
            const left = ((ts - minTs) / range) * 100;
            return (
              <div key={yr} className="absolute" style={{ left: `${left}%`, top: 44 }}>
                <div className="w-px h-3" style={{ background: "var(--line)" }} />
                <div className="text-[9px] text-muted-2 mt-0.5 -translate-x-1/2">{yr}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vertical timeline with cards */}
      <div className="relative pl-8">
        {/* Vertical connector line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-px" style={{ background: "var(--line)" }} />

        <div className="space-y-3">
          {filteredTouchpoints.map((tp, idx) => {
            const Icon = JOURNEY_ICON[tp.type];
            const tone = TONE[tp.tone];
            const isActive = expandedId === tp.id;
            const showPhaseLabel = idx === 0 || tp.phase !== filteredTouchpoints[idx - 1].phase;

            return (
              <div key={tp.id}>
                {showPhaseLabel && (
                  <div className="flex items-center gap-2 mb-2 -ml-8 pl-8">
                    <span className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: PHASE_COLORS[tp.phase] ?? "var(--muted)" }}>{tp.phase}</span>
                    <div className="flex-1 h-px" style={{ background: "var(--line)" }} />
                  </div>
                )}
                <div className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-8 top-3 w-[22px] h-[22px] rounded-full grid place-items-center z-10 transition-all"
                    style={{ background: isActive ? tone.color : tone.bg, border: `2px solid ${tone.color}`, boxShadow: isActive ? `0 0 0 4px ${tone.ring}` : "none" }}>
                    <Icon size={9} strokeWidth={2} style={{ color: isActive ? "#fff" : tone.color }} />
                  </div>

                  {/* Card */}
                  <button onClick={() => setExpandedId(isActive ? null : tp.id)}
                    className={`w-full text-left card p-0 overflow-hidden transition-all duration-200 ${isActive ? "shadow-md" : "hover:shadow-sm"}`}
                    style={isActive ? { borderColor: tone.color, borderWidth: 1 } : undefined}>
                    <div className="h-[2px]" style={{ background: tone.color }} />
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[12.5px] font-semibold text-ink">{tp.title}</span>
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full capitalize" style={{ background: tone.bg, color: tone.color }}>{tp.type}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10.5px] text-muted">{tp.date}</span>
                            {tp.actor && (
                              <>
                                <span className="text-muted-2">·</span>
                                <span className="text-[10.5px] text-muted">{tp.actor}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-surface grid place-items-center border border-line text-[8px] font-bold text-muted">{idx + 1}</span>
                          <ChevronRight size={12} strokeWidth={2} className={`text-muted transition-transform duration-200 ${isActive ? "rotate-90" : ""}`} />
                        </div>
                      </div>

                      {isActive && (
                        <div className="mt-3 pt-3 border-t border-line">
                          <p className="text-[11.5px] text-ink-2 leading-relaxed">{tp.description}</p>
                          {tp.actor && (
                            <div className="flex items-center gap-2 mt-3">
                              <div className="w-6 h-6 rounded-full grid place-items-center text-[8px] font-bold" style={{ background: tone.bg, color: tone.color }}>
                                {tp.actor.split(" ").map(p => p[0]).join("").slice(0, 2)}
                              </div>
                              <div>
                                <div className="text-[10.5px] font-medium text-ink">{tp.actor}</div>
                                <div className="text-[9px] text-muted capitalize">{tp.type === "call" ? "Call participant" : tp.type === "meeting" ? "Meeting host" : "Owner"}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-4 text-[10.5px] text-muted-2 px-1">
        <span className="flex items-center gap-1.5"><Calendar size={11} strokeWidth={1.5} /> {touchpoints[0].date} – {touchpoints[touchpoints.length - 1].date}</span>
        <span className="w-1 h-1 rounded-full bg-line" />
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-pos" /> {touchpoints.filter(t => t.tone === "pos" || t.tone === "accent").length} positive</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-warn" /> {touchpoints.filter(t => t.tone === "warn" || t.tone === "neg").length} needs attention</span>
      </div>
    </div>
  );
}

function OutcomesPanel({ account, outcomes, slug }: { account: AccountDetail; outcomes: any[]; slug: string }) {
  const toast = useToast();
  const plan = successPlans.find((p) => p.accountSlug === slug);
  return (
    <div>
      {plan && <SuccessPlanBuilder plan={plan} />}
      {outcomes.length === 0 && !plan ? (
        <div className="card p-8 text-center">
          <Target size={20} strokeWidth={1.5} className="mx-auto text-muted-2 mb-2" />
          <div className="text-[13px] font-semibold text-ink">No customer outcomes yet</div>
          <div className="text-[12px] text-muted mt-1">Define measurable success goals — TTFV, retention metrics, expansion targets.</div>
          <button onClick={() => toast({ tone: "info", title: "Add outcome", body: "Outcome editor opens with templates for adoption, expansion, and retention goals." })}
            className="mt-4 text-[12px] font-medium h-8 px-3 rounded-md bg-ink text-white inline-flex items-center gap-1.5">
            <Plus size={11} /> Add outcome
          </button>
        </div>
      ) : outcomes.length > 0 ? (
        <div className="card p-4 space-y-2">
          {outcomes.map((o) => <OutcomeRow key={o.id} outcome={o} />)}
        </div>
      ) : null}
    </div>
  );
}

function AdoptionEmpty({ status }: { status: AccountDetail["status"] }) {
  return (
    <div className="card p-10 text-center">
      <Activity size={20} strokeWidth={1.6} className="mx-auto text-muted-2 mb-2" />
      <div className="text-[13px] font-semibold text-ink">
        {status === "Customer" ? "Adoption telemetry not yet flowing" : "Adoption data is for customers"}
      </div>
      <div className="text-[12px] text-muted mt-1 max-w-md mx-auto">
        {status === "Customer"
          ? "Connect Mixpanel or your warehouse on the Integrations page to populate this view."
          : "This account is in Prospect status. Adoption telemetry shows for accounts after they convert to Customer."}
      </div>
    </div>
  );
}

function engagementLevel(s: Stakeholder): { label: string; color: string; bg: string; score: number } {
  if (s.daysSilent === 0) return { label: "Very active", color: "var(--pos)", bg: "var(--pos-soft)", score: 95 };
  if (s.daysSilent <= 3)  return { label: "Active",      color: "var(--pos)", bg: "var(--pos-soft)", score: 80 };
  if (s.daysSilent <= 7)  return { label: "Moderate",    color: "var(--warn)", bg: "var(--warn-soft)", score: 55 };
  if (s.daysSilent <= 14) return { label: "Low",         color: "var(--neg)", bg: "var(--neg-soft)", score: 30 };
  return { label: "Dormant", color: "var(--neg)", bg: "var(--neg-soft)", score: 10 };
}

function PeoplePanel({ account, onAdd, onEdit }: { account: AccountDetail; onAdd: () => void; onEdit: (s: Stakeholder) => void }) {
  const [view, setView] = useState<"list" | "chart">("list");
  const champions      = account.stakeholders.filter((s) => s.role === "Champion").length;
  const decisionMakers = account.stakeholders.filter((s) => s.role === "Decision Maker").length;
  const silent         = account.stakeholders.filter((s) => s.daysSilent > 7).length;
  const avgEngagement  = account.stakeholders.length > 0
    ? Math.round(account.stakeholders.reduce((sum, s) => sum + engagementLevel(s).score, 0) / account.stakeholders.length)
    : 0;

  return (
    <div className="space-y-4">
      {/* Top-line KPIs */}
      <div className="grid grid-cols-5 gap-3">
        <KpiCard label="People mapped"   value={String(account.stakeholders.length)} />
        <KpiCard label="Champions"       value={String(champions)}        tone="var(--accent-deep)" />
        <KpiCard label="Decision makers" value={String(decisionMakers)} />
        <KpiCard label="Avg engagement"  value={`${avgEngagement}%`} tone={avgEngagement >= 60 ? "var(--pos)" : avgEngagement >= 40 ? "var(--warn)" : "var(--neg)"} />
        <KpiCard label="Silent > 7d"     value={String(silent)} tone={silent > 0 ? "var(--neg)" : "var(--pos)"} />
      </div>

      {/* View toggle + Add */}
      <div className="flex items-center justify-between">
        <div className="recessed flex items-center p-0.5 gap-0.5">
          <button onClick={() => setView("list")}
            className={`text-[11.5px] font-medium px-3 py-1 rounded-full transition-colors ${view === "list" ? "bg-ink text-white" : "text-muted hover:text-ink"}`}>
            List
          </button>
          <button onClick={() => setView("chart")}
            className={`text-[11.5px] font-medium px-3 py-1 rounded-full transition-colors ${view === "chart" ? "bg-ink text-white" : "text-muted hover:text-ink"}`}>
            Org chart
          </button>
        </div>
        <button onClick={onAdd}
          className="text-[11.5px] font-semibold h-8 px-3 rounded-md inline-flex items-center gap-1.5 bg-ink text-white hover:bg-ink-2 shadow-[0_4px_12px_-4px_rgba(28,40,64,0.3)]">
          <Plus size={11} strokeWidth={1.8} /> Add stakeholder
        </button>
      </div>

      {/* Active view */}
      {view === "list" ? (
        account.stakeholders.length === 0 ? (
          <div className="card p-4">
            <div className="recessed-dashed p-8 text-center">
              <div className="text-[12.5px] font-semibold text-ink">No stakeholders yet</div>
              <div className="text-[11.5px] text-muted mt-1">Map the buying committee — Champions, Decision Makers, Influencers, Detractors.</div>
              <button onClick={onAdd} className="mt-3 text-[12px] font-medium h-8 px-3 rounded-md bg-ink text-white inline-flex items-center gap-1.5">
                <Plus size={11} /> Add first stakeholder
              </button>
            </div>
          </div>
        ) : (
          <div className="card p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {account.stakeholders.map((s) => <EnhancedStakeholderCard key={s.name} s={s} domain={account.domain} onEdit={() => onEdit(s)} />)}
            </div>
          </div>
        )
      ) : (
        <div className="card p-4">
          <div className="flex items-center justify-end mb-3">
            <div className="flex items-center gap-3 text-[10.5px] text-muted">
              <Legend swatch="var(--accent)"   label="Champion" />
              <Legend swatch="var(--ink)"       label="Decision maker" />
              <Legend swatch="var(--info)"      label="Influencer" />
              <Legend swatch="var(--neg)"       label="Detractor" />
              <Legend swatch="var(--muted)"     label="User" />
            </div>
          </div>
          <OrgChart stakeholders={account.stakeholders} onEdit={onEdit} onReportsToChange={(name, manager) => {
            const target = account.stakeholders.find((s) => s.name === name);
            if (target) onEdit({ ...target, reportsTo: manager ?? undefined });
          }} />
        </div>
      )}
    </div>
  );
}

function EnhancedStakeholderCard({ s, domain, onEdit }: { s: Stakeholder; domain: string; onEdit: () => void }) {
  const sentiment = s.sentiment === "supportive" ? "var(--pos)" : s.sentiment === "negative" ? "var(--neg)" : "var(--muted)";
  const initials = s.name.split(" ").map((p) => p[0]).join("").slice(0, 2);
  const eng = engagementLevel(s);
  const linkedinSlug = s.name.toLowerCase().replace(/[^a-z]+/g, "-");
  const roleBg = s.role === "Champion" ? "var(--accent-soft)" : s.role === "Decision Maker" ? "var(--info-soft)" : s.role === "Detractor" ? "var(--neg-soft)" : "var(--bg-deep)";
  const roleColor = s.role === "Champion" ? "var(--accent-deep)" : s.role === "Decision Maker" ? "var(--info)" : s.role === "Detractor" ? "var(--neg)" : "var(--muted)";

  const interactions = s.daysSilent <= 3 ? Math.round(12 - s.daysSilent * 2) : Math.round(6 - s.daysSilent * 0.3);
  const emailsSent = Math.max(1, Math.round(interactions * 0.6));
  const callsJoined = Math.max(0, Math.round(interactions * 0.3));

  return (
    <div className="flex gap-3 p-3 rounded-xl border border-line bg-surface hover:bg-surface-2 transition-colors group">
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-full bg-ink text-white grid place-items-center text-[12px] font-semibold">
          {initials}
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-bg" style={{ background: sentiment }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <button onClick={onEdit} className="text-[12.5px] font-semibold text-ink hover:underline truncate">{s.name}</button>
          <a href={`https://linkedin.com/in/${linkedinSlug}`} target="_blank" rel="noopener noreferrer"
            className="text-muted hover:text-[#0A66C2] transition-colors shrink-0" title="View LinkedIn profile">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
          </a>
        </div>
        <div className="text-[10.5px] text-muted truncate mb-2">{s.title}</div>
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ background: roleBg, color: roleColor }}>{s.role}</span>
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ background: eng.bg, color: eng.color }}>{eng.label}</span>
          <span className="text-[10px] text-muted-2">{s.daysSilent === 0 ? "Active today" : `${s.daysSilent}d silent`}</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted">
          <span className="inline-flex items-center gap-1"><Mail size={9} strokeWidth={1.6} /> {emailsSent} emails</span>
          <span className="inline-flex items-center gap-1"><Phone size={9} strokeWidth={1.6} /> {callsJoined} calls</span>
          <span className="inline-flex items-center gap-1"><MessageSquare size={9} strokeWidth={1.6} /> {s.lastTouch}</span>
        </div>
        {/* Engagement bar */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-deep)" }}>
            <div className="h-full rounded-full" style={{ width: `${eng.score}%`, background: eng.color }} />
          </div>
          <span className="text-[9px] font-mono tnum" style={{ color: eng.color }}>{eng.score}%</span>
        </div>
      </div>
    </div>
  );
}

function OrgChartPanel({ account, onAdd, onEdit }: { account: AccountDetail; onAdd: () => void; onEdit: (s: Stakeholder) => void }) {
  const champions     = account.stakeholders.filter((s) => s.role === "Champion").length;
  const decisionMakers = account.stakeholders.filter((s) => s.role === "Decision Maker").length;
  const detractors    = account.stakeholders.filter((s) => s.role === "Detractor").length;
  const silent        = account.stakeholders.filter((s) => s.daysSilent > 7).length;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <KpiCard label="People mapped" value={String(account.stakeholders.length)} />
        <KpiCard label="Champions"     value={String(champions)}      tone="var(--accent-deep)" />
        <KpiCard label="Decision makers" value={String(decisionMakers)} />
        <KpiCard label="Silent > 7d"   value={String(silent)} tone={silent > 0 ? "var(--neg)" : "var(--pos)"} />
      </div>
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="mono-label">Reporting structure</div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 text-[10.5px] text-muted">
              <Legend swatch="var(--accent)"   label="Champion" />
              <Legend swatch="var(--ink)"       label="Decision maker" />
              <Legend swatch="var(--info)"      label="Influencer" />
              <Legend swatch="var(--neg)"       label="Detractor" />
              <Legend swatch="var(--muted)"     label="User" />
            </div>
            <button onClick={onAdd}
              className="text-[11px] font-medium h-7 px-2.5 rounded-md inline-flex items-center gap-1.5 bg-ink text-white hover:bg-ink-2">
              <Plus size={11} strokeWidth={1.8} /> Add
            </button>
          </div>
        </div>
        <OrgChart stakeholders={account.stakeholders} onEdit={onEdit} onReportsToChange={(name, manager) => {
          // Bubble through onEdit by editing locally — handled by onEdit caller in slug page state
          // We just synthesise an edit
          const target = account.stakeholders.find((s) => s.name === name);
          if (target) onEdit({ ...target, reportsTo: manager ?? undefined });
        }} />
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: swatch }} />
      {label}
    </span>
  );
}

function DecksPanel({ account, onBuild }: { account: AccountDetail; onBuild: (t: DeckTemplate) => void }) {
  const toast = useToast();
  const TEMPLATES: { id: DeckTemplate; title: string; blurb: string; icon: typeof Presentation; primary: boolean }[] = [
    { id: "qbr",        title: "Quarterly Business Review",   blurb: "Health, outcomes, expansion, risks, asks. ~7 slides.",          icon: Presentation, primary: true  },
    { id: "expansion",  title: "Expansion Business Case",     blurb: "Pattern-matched ARR forecast with comparable conversions.",     icon: TrendingUp,    primary: false },
    { id: "renewal",    title: "Renewal Narrative",           blurb: "Outcome attainment + sponsor map + price defence.",             icon: Target,        primary: false },
    { id: "exec",       title: "Executive 1-pager",            blurb: "One slide. The number, the ask, the risk.",                    icon: FileText,      primary: false },
  ];
  const RECENT = [
    { name: `${account.name} · Q1 Review.pptx`, when: "2w ago",  size: "1.2 MB" },
    { name: `${account.name} · Renewal v2.pptx`, when: "5w ago", size: "1.4 MB" },
  ];
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 lg:col-span-7 card p-4">
        <div className="mono-label mb-3">Build a deck for this account</div>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => onBuild(t.id)}
              className={`flex items-start gap-3 p-3 rounded-xl text-left transition-colors ${
                t.primary ? "" : "hover:bg-bg-deep"
              }`}
              style={t.primary
                ? { background: "var(--accent)", color: "var(--accent-ink)" }
                : { background: "var(--surface)", border: "1px solid var(--line)" }}
            >
              <div className="w-9 h-9 rounded-lg grid place-items-center"
                style={{ background: t.primary ? "rgba(0,0,0,0.08)" : "var(--bg-deep)" }}>
                <t.icon size={15} strokeWidth={1.6}
                  style={{ color: t.primary ? "var(--accent-ink)" : "var(--muted)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-semibold">{t.title}</div>
                <div className="text-[11px] mt-0.5"
                  style={{ color: t.primary ? "rgba(26,31,8,0.7)" : "var(--muted)" }}>
                  {t.blurb}
                </div>
              </div>
              {t.primary && (
                <div className="text-[10px] font-mono uppercase tracking-[0.06em] px-1.5 py-0.5 rounded"
                  style={{ background: "rgba(0,0,0,0.12)", color: "var(--accent-ink)" }}>
                  Recommended
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="col-span-12 lg:col-span-5 card p-4">
        <div className="mono-label mb-2">Recent decks</div>
        <div className="space-y-1">
          {RECENT.map((d) => (
            <div key={d.name} className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-bg-deep">
              <div className="w-7 h-7 rounded-md grid place-items-center" style={{ background: "var(--warn-soft)" }}>
                <Presentation size={12} strokeWidth={1.6} style={{ color: "var(--warn)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-ink truncate">{d.name}</div>
                <div className="text-[10.5px] text-muted">{d.when} · {d.size}</div>
              </div>
              <button onClick={() => toast({ tone: "info", title: `Downloaded ${d.name}` })}
                className="w-7 h-7 rounded-md grid place-items-center text-muted hover:text-ink hover:bg-surface">
                <Download size={11} strokeWidth={1.6} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StakeholdersPanel({ account, onAdd, onEdit }: { account: AccountDetail; onAdd: () => void; onEdit: (s: Stakeholder) => void }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="mono-label">{account.stakeholders.length} stakeholders mapped</div>
        <button onClick={onAdd}
          className="text-[11.5px] font-medium h-7 px-2.5 rounded-md inline-flex items-center gap-1.5 bg-ink text-white hover:bg-ink-2">
          <Plus size={11} strokeWidth={1.8} /> Add stakeholder
        </button>
      </div>
      {account.stakeholders.length === 0 ? (
        <div className="recessed-dashed p-8 text-center">
          <div className="text-[12.5px] font-semibold text-ink">No stakeholders yet</div>
          <div className="text-[11.5px] text-muted mt-1">Map the buying committee — Champions, Decision Makers, Influencers, Detractors.</div>
          <button onClick={onAdd} className="mt-3 text-[12px] font-medium h-8 px-3 rounded-md bg-ink text-white inline-flex items-center gap-1.5">
            <Plus size={11} /> Add first stakeholder
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {account.stakeholders.map((s) => <StakeholderRow key={s.name} s={s} expanded onEdit={() => onEdit(s)} />)}
        </div>
      )}
    </div>
  );
}

function SignalsPanel({ account }: { account: AccountDetail }) {
  return (
    <div className="card p-4 space-y-2">
      {account.signals.map((s) => <SignalRow key={s.id} signal={s} expanded />)}
    </div>
  );
}

type ActivityEvent = {
  type: "meeting" | "email" | "call" | "note" | "ticket" | "signal";
  title: string;
  when: string;
  body: string;
  source: "Gong" | "Google Workspace" | "Salesforce" | "Mixpanel" | "LinkedIn" | "Slack" | "Zendesk" | "Alphy AI";
  meta?: string;
};

const ACCOUNT_EVENTS: ActivityEvent[] = [
  { type: "meeting", source: "Gong",             title: "QBR · Q2 prep",                       when: "today 10:00 AM",   body: "Reviewed adoption metrics; agreed on three Q2 priorities. Recording auto-linked.", meta: "00:42:18" },
  { type: "email",   source: "Google Workspace", title: "Re: Phase 1 ROI report",              when: "yesterday 4:22 PM", body: "Champion confirmed dollar impact and asked for the deck.", meta: "thread of 8" },
  { type: "call",    source: "Gong",             title: "Discovery — CFO",                     when: "2d ago",            body: "Budget exists for Phase 2; needs approval gate before May.", meta: "00:31:05" },
  { type: "signal",  source: "Alphy AI",         title: "Risk detected · Procedural Delays",   when: "3d ago",            body: "Legal redlines pending 8 days; pattern matches 2 prior slips. Suggested: escalate via exec sponsor." },
  { type: "ticket",  source: "Zendesk",          title: "Support · Onboarding session 2",      when: "3d ago",            body: "Walkthrough on health-score thresholds. Resolved within SLA." },
  { type: "note",    source: "Salesforce",       title: "Owner note · Sponsor map updated",    when: "5d ago",            body: "Christine Pettett added as Champion based on QBR participation." },
  { type: "email",   source: "Google Workspace", title: "Sent · Q1 ROI summary",                when: "1w ago",            body: "Sent to David Wallace (CFO) and Christine Pettett. Read receipts confirmed both opened.", meta: "1.2 MB attached" },
  { type: "signal",  source: "Mixpanel",         title: "Usage milestone · 80% feature breadth", when: "1w ago",          body: "Primary cohort hit 80% feature breadth threshold. Eligible for expansion play." },
  { type: "meeting", source: "Gong",             title: "Working session · Integration design",when: "1w ago",            body: "Two engineers from each side aligned on data residency requirements.", meta: "01:08:22" },
  { type: "call",    source: "Gong",             title: "Outbound · Follow up on demo",          when: "10d ago",           body: "Champion confirmed sponsor sign-off; targeting Phase 1 kickoff in 2 weeks.", meta: "00:18:40" },
];

function ActivityPanel({ account, slug }: { account: AccountDetail; slug: string }) {
  const { user } = useUser();
  const [filter, setFilter] = useState<ActivityEvent["type"] | "all" | "signal-ai" | "comments">("all");
  const [localComments, setLocalComments] = useState<ActivityCommentType[]>(activityComments[slug] ?? []);

  // Account-level AI signals (account.signals) get woven into the activity feed
  // as type "signal-ai" so they share the same surface but stay filterable.
  type Item = ActivityEvent & { _kind: "event" } | { _kind: "signal"; signal: AccountSignal } | { _kind: "comment"; comment: ActivityCommentType };
  const aiSignalItems: Item[] = account.signals.map((s) => ({ _kind: "signal", signal: s }));
  const eventItems: Item[] = ACCOUNT_EVENTS.map((e) => ({ ...e, _kind: "event" }));
  const commentItems: Item[] = localComments.map((c) => ({ _kind: "comment", comment: c }));
  const all: Item[] = [...commentItems, ...aiSignalItems, ...eventItems];

  const filtered = all.filter((it) => {
    if (filter === "all") return true;
    if (filter === "comments") return it._kind === "comment";
    if (filter === "signal-ai") return it._kind === "signal";
    return it._kind === "event" && it.type === filter;
  });

  const handleAddComment = (text: string, mentions: string[]) => {
    const c: ActivityCommentType = {
      id: `ac-${Date.now()}`, accountSlug: slug, author: user.name, authorInitials: user.initials,
      text, at: new Date().toISOString(), mentions,
    };
    setLocalComments((prev) => [c, ...prev]);
  };

  const FILTERS: { id: typeof filter; label: string; count: number }[] = [
    { id: "all",       label: "All",        count: all.length },
    { id: "comments",  label: "Comments",   count: localComments.length },
    { id: "signal-ai", label: "AI signals", count: aiSignalItems.length },
    { id: "meeting",   label: "Meetings",   count: ACCOUNT_EVENTS.filter((e) => e.type === "meeting").length },
    { id: "call",      label: "Calls",      count: ACCOUNT_EVENTS.filter((e) => e.type === "call").length },
    { id: "email",     label: "Emails",     count: ACCOUNT_EVENTS.filter((e) => e.type === "email").length },
    { id: "ticket",    label: "Tickets",    count: ACCOUNT_EVENTS.filter((e) => e.type === "ticket").length },
    { id: "note",      label: "Notes",      count: ACCOUNT_EVENTS.filter((e) => e.type === "note").length },
  ];

  const TYPE_ICON = {
    meeting: Video, email: Mail, call: Phone, note: FileText, ticket: AlertTriangle, signal: Sparkles,
  } as const;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 flex-wrap">
        {FILTERS.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`pill-nav-item inline-flex items-center gap-1.5 ${filter === f.id ? "active" : ""}`}>
            {f.label}
            <span className="text-[10px] font-mono tnum px-1.5 rounded bg-bg-deep text-muted">{f.count}</span>
          </button>
        ))}
      </div>

      <div className="card p-4">
        <div className="space-y-3">
          {filtered.map((it, i) => {
            if (it._kind === "comment") {
              const c = it.comment;
              const renderText = (text: string) => {
                const parts = text.split(/(@[A-Za-z]+ [A-Za-z]+)/g);
                return parts.map((part, idx) =>
                  part.startsWith("@") ? (
                    <span key={idx} className="px-1 py-0.5 rounded text-[11px] font-semibold" style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}>{part}</span>
                  ) : <span key={idx}>{part}</span>
                );
              };
              return (
                <div key={c.id} className="flex items-start gap-2.5 p-2 rounded-md hover:bg-bg-deep">
                  <div className="w-7 h-7 rounded-full grid place-items-center text-[9px] font-semibold shrink-0 mt-0.5"
                    style={{ background: "var(--bg-deep)", color: "var(--ink)" }}>
                    {c.authorInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[12px] font-semibold text-ink">{c.author}</span>
                      <span className="text-[10px] text-muted-2">{new Date(c.at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[12px] text-ink-2 leading-relaxed mt-0.5">{renderText(c.text)}</p>
                  </div>
                </div>
              );
            }
            if (it._kind === "signal") {
              return <SignalRow key={`s-${it.signal.id}`} signal={it.signal} expanded />;
            }
            const e = it;
            const Icon = TYPE_ICON[e.type];
            const accent   = e.type === "signal" ? "var(--accent)" : e.type === "ticket" ? "var(--neg-soft)" : "var(--bg-deep)";
            const iconTone = e.type === "signal" ? "var(--accent-deep)" : e.type === "ticket" ? "var(--neg)" : "var(--muted)";
            return (
              <div key={`e-${i}`} className="flex items-start gap-2.5 p-2 rounded-md hover:bg-bg-deep">
                <div className="w-8 h-8 rounded-md grid place-items-center mt-0.5"
                  style={{ background: accent }}>
                  <Icon size={12} strokeWidth={1.6} style={{ color: iconTone }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[12.5px] font-semibold text-ink">{e.title}</span>
                    <SourceChip source={e.source as any} meta={e.meta} size="xs" />
                  </div>
                  <div className="text-[11.5px] text-muted leading-relaxed mt-0.5">{e.body}</div>
                  <div className="text-[10px] text-muted-2 mt-0.5">{e.when}</div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-[12px] text-muted-2 py-6 text-center">No items match this filter.</div>
          )}
        </div>

        {/* Mention input */}
        <div className="mt-4 pt-3 border-t border-line">
          <MentionInput onSubmit={handleAddComment} />
        </div>
      </div>
    </div>
  );
}

function DealsPanel({ deals, account }: { deals: any[]; account?: AccountDetail }) {
  if (deals.length === 0) {
    return (
      <div className="card p-10 text-center">
        <DollarSign size={20} strokeWidth={1.5} className="mx-auto text-muted-2 mb-2" />
        <div className="text-[13px] font-semibold text-ink">No active deals</div>
        <div className="text-[12px] text-muted mt-1">Create a deal to track pipeline value and close dates for this account.</div>
        <button className="mt-4 text-[12px] font-medium h-8 px-3 rounded-md bg-ink text-white inline-flex items-center gap-1.5">
          <Plus size={11} /> Create deal
        </button>
      </div>
    );
  }

  const totalPipeline = deals.reduce((s, d) => s + (d.amount ?? 0), 0);
  const wonDeals = deals.filter(d => d.stage === "Closed Won").length;
  const openDeals = deals.filter(d => d.stage !== "Closed Won" && d.stage !== "Closed Lost").length;

  const STAGE_STEPS = ["Discovery", "Qualification", "Proposal", "Negotiation", "Closed Won"];
  const stageIndex = (stage: string) => {
    const idx = STAGE_STEPS.findIndex(s => stage.toLowerCase().includes(s.toLowerCase()));
    return idx >= 0 ? idx : stage === "Closed Lost" ? -1 : 2;
  };

  const DEAL_HEALTH: Record<string, { bg: string; color: string; label: string }> = {
    high:   { bg: "var(--pos-soft)",  color: "var(--pos)",  label: "Healthy" },
    medium: { bg: "var(--warn-soft)", color: "var(--warn)", label: "At risk" },
    low:    { bg: "var(--neg-soft)",  color: "var(--neg)",  label: "Critical" },
  };

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-3">
        <KpiCard label="Total pipeline" value={fmtMoney(totalPipeline)} tone="var(--ink)" />
        <KpiCard label="Open deals" value={String(openDeals)} tone="var(--info)" />
        <KpiCard label="Won deals" value={String(wonDeals)} tone="var(--pos)" />
        <KpiCard label="Avg deal size" value={fmtMoney(Math.round(totalPipeline / deals.length))} />
      </div>

      {/* Deal cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {deals.map((d) => {
          const hm = DEAL_HEALTH[d.health] ?? DEAL_HEALTH.medium;
          const idx = stageIndex(d.stage);
          const isClosed = d.stage === "Closed Won" || d.stage === "Closed Lost";
          return (
            <Link key={d.id} href="/deals" className="card p-4 hover:bg-surface-2 transition-colors block">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg grid place-items-center shrink-0"
                  style={{ background: isClosed && d.stage === "Closed Won" ? "var(--pos-soft)" : "var(--bg-deep)" }}>
                  <DollarSign size={15} strokeWidth={1.7}
                    style={{ color: isClosed && d.stage === "Closed Won" ? "var(--pos)" : "var(--muted)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[13px] font-semibold text-ink truncate">{d.name}</span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                      style={{ background: hm.bg, color: hm.color }}>{hm.label}</span>
                  </div>
                  <div className="text-[11px] text-muted">{d.stage} · {d.owner}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[15px] font-bold tnum text-ink">{fmtFullMoney(d.amount)}</div>
                  <div className="text-[10px] text-muted tnum">Close {fmtDate(d.closeDate)}</div>
                </div>
              </div>

              {/* Stage progress */}
              {!isClosed && (
                <div className="mb-3">
                  <div className="flex items-center gap-1">
                    {STAGE_STEPS.map((step, i) => (
                      <div key={step} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full h-1 rounded-full"
                          style={{ background: i <= idx ? "var(--accent-deep)" : "var(--bg-deep)" }} />
                        <span className="text-[8px] text-muted-2">{step.slice(0, 4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deal metadata */}
              <div className="flex items-center gap-3 text-[10px] text-muted pt-2 border-t border-line">
                <span className="inline-flex items-center gap-1"><Calendar size={9} strokeWidth={1.6} /> {fmtDate(d.closeDate)}</span>
                <span className="inline-flex items-center gap-1"><Users size={9} strokeWidth={1.6} /> {d.owner}</span>
                {d.probability && <span className="inline-flex items-center gap-1"><BarChart3 size={9} strokeWidth={1.6} /> {d.probability}% prob</span>}
                <span className="ml-auto text-[9px] font-mono text-muted-2">{d.id}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------
function StatusChip({ status }: { status: AccountDetail["status"] }) {
  const s = status === "Customer" ? { bg: "var(--pos-soft)", ink: "var(--pos)" }
          : status === "Prospect" ? { bg: "var(--info-soft)", ink: "var(--info)" }
          : { bg: "var(--neg-soft)", ink: "var(--neg)" };
  return <span className="inline-flex items-center h-[22px] px-2 rounded-full text-[10.5px] font-semibold" style={{ background: s.bg, color: s.ink }}>{status}</span>;
}

function SegmentChip({ segment }: { segment: AccountDetail["segment"] }) {
  return <span className="inline-flex items-center h-[22px] px-2 rounded-full text-[10.5px] font-semibold bg-bg-deep text-ink-2">{segment}</span>;
}

function KpiCard({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface-2 px-3.5 py-3">
      <div className="mono-label">{label}</div>
      <div className="hero-num mt-1.5" style={{ fontSize: 22, color: tone ?? "var(--ink)" }}>{value}</div>
    </div>
  );
}

function StakeholderRow({ s, expanded, onEdit }: { s: Stakeholder; expanded?: boolean; onEdit?: () => void }) {
  const sentiment = s.sentiment === "supportive" ? "var(--pos)" : s.sentiment === "negative" ? "var(--neg)" : "var(--muted)";
  const initials = s.name.split(" ").map((p) => p[0]).join("").slice(0, 2);
  const Wrapper = onEdit ? "button" : "div";
  return (
    <Wrapper onClick={onEdit}
      className={`group flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-bg-deep w-full text-left transition-colors ${expanded ? "" : ""}`}>
      <div className="w-7 h-7 rounded-full bg-ink text-white grid place-items-center text-[10px] font-semibold">{initials}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-semibold text-ink truncate">{s.name}</div>
        <div className="text-[10.5px] text-muted truncate">{s.title} · {s.role}</div>
      </div>
      <span className="text-[10px] font-medium" style={{ color: sentiment }}>
        {s.daysSilent === 0 ? "today" : `${s.daysSilent}d silent`}
      </span>
    </Wrapper>
  );
}

function SignalRow({ signal, expanded }: { signal: AccountSignal; expanded?: boolean }) {
  const tone = signal.tone === "pos" ? { bg: "var(--pos-soft)", ink: "var(--pos)" }
             : signal.tone === "neg" ? { bg: "var(--neg-soft)", ink: "var(--neg)" }
             : signal.tone === "warn" ? { bg: "var(--warn-soft)", ink: "var(--warn)" }
             : { bg: "var(--info-soft)", ink: "var(--info)" };
  return (
    <div className="rounded-md p-3" style={{ background: "var(--bg-deep)" }}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="inline-flex items-center text-[9.5px] font-mono uppercase tracking-[0.06em] px-1.5 py-0.5 rounded"
          style={{ background: tone.bg, color: tone.ink }}>
          {signal.category}
        </span>
        <span className="text-[10px] text-muted-2 ml-auto">{signal.ago}</span>
      </div>
      <div className="text-[12.5px] text-ink-2 leading-snug">{signal.body}</div>
      {(expanded || signal.evidence.length > 0) && (
        <div className="mt-2.5 pt-2.5 border-t border-line">
          <div className="text-[10px] text-muted-2 mb-1">Evidence</div>
          <div className="space-y-1">
            {signal.evidence.map((e, i) => {
              const Icon = e.kind === "email" ? Mail : e.kind === "call" ? Phone : e.kind === "linkedin" ? Globe2 : e.kind === "transcript" ? Video : FileText;
              return (
                <div key={i} className="flex items-center gap-2 text-[11px]">
                  <Icon size={10} strokeWidth={1.6} className="text-muted-2" />
                  <span className="text-ink-2 truncate">{e.title}</span>
                  <span className="text-muted-2 ml-auto">{e.meta}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function OutcomeRow({ outcome }: { outcome: any }) {
  const tone = outcome.status === "ahead" ? "var(--accent)"
             : outcome.status === "on-track" ? "var(--pos)"
             : outcome.status === "watch" ? "var(--warn)"
             : "var(--neg)";
  const soft = outcome.status === "ahead" ? "var(--accent-soft)"
             : outcome.status === "on-track" ? "var(--pos-soft)"
             : outcome.status === "watch" ? "var(--warn-soft)"
             : "var(--neg-soft)";
  return (
    <div className="flex items-start gap-3 p-3 rounded-md" style={{ background: "var(--bg-deep)" }}>
      <span className="inline-flex items-center text-[9.5px] font-mono uppercase tracking-[0.06em] px-1.5 py-0.5 rounded mt-0.5"
        style={{ background: soft, color: tone }}>
        {outcome.status === "ahead" ? "Ahead" : outcome.status === "on-track" ? "On track" : outcome.status === "watch" ? "Watch" : "At risk"}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-semibold text-ink leading-snug">{outcome.title}</div>
        <div className="text-[11px] text-muted">{outcome.metric} · {outcome.current} → {outcome.target}</div>
        <div className="health-bar mt-2"><span style={{ width: `${outcome.progress}%`, background: tone }} /></div>
        <div className="text-[10px] text-muted-2 mt-1 tnum">{outcome.progress}% · due {outcome.due}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// PRODUCTS — cross-product subscriptions per account
// ---------------------------------------------------------------------

type ProductSub = {
  id: string;
  name: string;
  description: string;
  status: "active" | "trial" | "expansion-target";
  seats?: number;
  arr?: number;
  owner: string;          // CSM/AE owning that product line
  ownerRole: string;
  tone: string;
};

function productsFor(account: AccountDetail): ProductSub[] {
  // Deterministic per-account product mix
  const base: ProductSub[] = [];
  const isCustomer = account.status === "Customer";
  const seed = account.name.length;

  base.push({
    id: "sales",
    name: "Alphard · Sales Cloud",
    description: "Pipeline, forecast, deal hygiene",
    status: isCustomer ? "active" : "trial",
    seats: isCustomer ? 80 + (seed % 40) : undefined,
    arr: isCustomer ? Math.round(account.arr * 0.55) : 0,
    owner: account.owner,
    ownerRole: "AE",
    tone: "var(--info)",
  });

  if (isCustomer && account.arr > 250000) {
    base.push({
      id: "cs",
      name: "Alphard · CS Cloud",
      description: "Health, outcomes, adoption",
      status: "active",
      seats: 12 + (seed % 18),
      arr: Math.round(account.arr * 0.30),
      owner: "Sarah Chen",
      ownerRole: "CSM",
      tone: "var(--pos)",
    });
    base.push({
      id: "insights",
      name: "Alphard · Insights",
      description: "Cross-tenant benchmarks",
      status: seed % 3 === 0 ? "active" : "expansion-target",
      seats: seed % 3 === 0 ? 4 + (seed % 6) : undefined,
      arr: seed % 3 === 0 ? Math.round(account.arr * 0.15) : 0,
      owner: "Paul Acker",
      ownerRole: "Specialist",
      tone: "var(--accent-ink)",
    });
  } else if (isCustomer) {
    base.push({
      id: "cs",
      name: "Alphard · CS Cloud",
      description: "Health, outcomes, adoption",
      status: "expansion-target",
      arr: 0,
      owner: "Sarah Chen",
      ownerRole: "CSM",
      tone: "var(--pos)",
    });
  }
  return base;
}

const PRODUCT_STATUS_META: Record<ProductSub["status"], { label: string; bg: string; ink: string }> = {
  "active":            { label: "Active",            bg: "var(--pos-soft)",    ink: "var(--pos)" },
  "trial":             { label: "Trial",             bg: "var(--info-soft)",   ink: "var(--info)" },
  "expansion-target":  { label: "Expansion target",  bg: "var(--accent-soft)", ink: "var(--accent-ink)" },
};

function ProductsCard({ account }: { account: AccountDetail }) {
  const products = productsFor(account);
  if (products.length === 0) return null;
  const activeArr = products.filter((p) => p.status === "active").reduce((s, p) => s + (p.arr ?? 0), 0);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="mono-label">Products · cross-line</div>
        <div className="text-[10.5px] text-muted-2">
          <span className="text-ink-2 font-medium tnum">{products.filter((p) => p.status === "active").length}</span> active
          {activeArr > 0 && <> · <span className="tnum text-ink-2 font-medium">{fmtMoney(activeArr)}</span> total</>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {products.map((p) => {
          const m = PRODUCT_STATUS_META[p.status];
          return (
            <div key={p.id} className="rounded-xl border border-line bg-surface-2 p-3 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[12.5px] font-semibold text-ink truncate">{p.name}</div>
                  <div className="text-[11px] text-muted leading-snug">{p.description}</div>
                </div>
                <span className="inline-flex items-center text-[9.5px] font-mono uppercase tracking-[0.06em] px-1.5 py-0.5 rounded shrink-0"
                  style={{ background: m.bg, color: m.ink }}>{m.label}</span>
              </div>
              <div className="flex items-center gap-2 text-[10.5px] text-muted">
                {p.seats !== undefined && <span className="tnum"><span className="text-ink-2 font-medium">{p.seats}</span> seats</span>}
                {p.seats !== undefined && p.arr !== undefined && p.arr > 0 && <span>·</span>}
                {p.arr !== undefined && p.arr > 0 && <span className="tnum"><span className="text-ink-2 font-medium">{fmtMoney(p.arr)}</span> ARR</span>}
              </div>
              <div className="flex items-center justify-between text-[10.5px]">
                <span className="text-muted-2">Owner: <span className="text-ink-2 font-medium">{p.owner}</span> · {p.ownerRole}</span>
                {p.status === "expansion-target" && (
                  <span className="inline-flex items-center gap-0.5 font-semibold" style={{ color: "var(--accent-ink)" }}>
                    Run play <ArrowRight size={10} strokeWidth={2} />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// HANDOFF — T-90 renewal handoff workflow
// ---------------------------------------------------------------------

const HANDOFF_KEY = "alphard:handoffs";

type HandoffStatus = "draft" | "sent" | "in-progress" | "closed";
type HandoffData = {
  id: string;
  fromOwner: string;
  toOwner: string;
  toRole: string;
  status: HandoffStatus;
  template: "renewal" | "expansion";
  fields: {
    usage: string;
    sentiment: string;
    expansionSignals: string;
    blockers: string;
    asks: string;
  };
  comments: { id: string; by: string; at: string; text: string }[];
};

const HANDOFF_STATUS_META: Record<HandoffStatus, { label: string; bg: string; ink: string }> = {
  "draft":       { label: "Draft",       bg: "var(--bg-deep)",     ink: "var(--muted)" },
  "sent":        { label: "Sent",        bg: "var(--info-soft)",   ink: "var(--info)" },
  "in-progress": { label: "In progress", bg: "var(--warn-soft)",   ink: "var(--warn)" },
  "closed":      { label: "Closed",      bg: "var(--pos-soft)",    ink: "var(--pos)" },
};

function HandoffCard({ account }: { account: AccountDetail }) {
  const slug = slugify(account.name);
  const [data, setData] = useState<HandoffData | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<HandoffData | null>(null);

  useEffect(() => {
    const map = loadJson<Record<string, HandoffData>>(HANDOFF_KEY, {});
    if (map[slug]) setData(map[slug]);
    setHydrated(true);
  }, [slug]);

  const saveData = (d: HandoffData | null) => {
    const map = loadJson<Record<string, HandoffData>>(HANDOFF_KEY, {});
    if (d) map[slug] = d; else delete map[slug];
    saveJson(HANDOFF_KEY, map);
    setData(d);
  };

  const initiate = (template: "renewal" | "expansion") => {
    const d: HandoffData = {
      id: `ho_${Date.now()}`,
      fromOwner: account.owner,
      toOwner: template === "renewal" ? "Brad Allen" : "Sarah Chen",
      toRole: template === "renewal" ? "AE" : "CSM",
      status: "draft",
      template,
      fields: {
        usage: `WAU/MAU ${account.healthScore >= 75 ? "0.71" : "0.48"} · ${account.healthScore >= 75 ? "stable" : "declining"} 30d`,
        sentiment: account.healthScore >= 75 ? "Positive · sponsor active 7d" : "Mixed · sponsor silent 14d+",
        expansionSignals: account.signals.find((s) => s.category === "Expansion")?.body ?? "—",
        blockers: account.healthScore < 60 ? "Procurement reorg · legal redlines pending" : "—",
        asks: template === "renewal" ? "Confirm pricing, prepare exec touchpoint" : "Map new champion · validate expansion thesis",
      },
      comments: [],
    };
    saveData(d);
    setDraft(d);
    setOpen(true);
  };

  if (!hydrated) return null;

  return (
    <>
      <div className="card p-4" style={{ borderColor: data ? "var(--line)" : "var(--accent-deep)", boxShadow: data ? undefined : "0 0 0 1px var(--accent), 0 8px 24px -14px rgba(168,224,32,0.4)" }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl grid place-items-center shrink-0"
            style={{ background: "var(--accent)" }}>
            <RefreshCwIcon />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-[14px] font-semibold text-ink">Renewal in {account.renewalDays} days · time to hand off</div>
              {data && (
                <span className="inline-flex items-center text-[9.5px] font-mono uppercase tracking-[0.06em] px-1.5 py-0.5 rounded"
                  style={{ background: HANDOFF_STATUS_META[data.status].bg, color: HANDOFF_STATUS_META[data.status].ink }}>
                  {HANDOFF_STATUS_META[data.status].label}
                </span>
              )}
            </div>
            <p className="text-[12px] text-muted mt-0.5 leading-relaxed">
              {data
                ? <>Handoff open from <span className="text-ink-2 font-medium">{data.fromOwner}</span> → <span className="text-ink-2 font-medium">{data.toOwner}</span> ({data.toRole})</>
                : <>Structured T-90 handoff to your AE/AM. We'll prefill usage, sentiment, expansion signals, blockers and asks.</>
              }
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {data ? (
              <button onClick={() => { setDraft(data); setOpen(true); }}
                className="text-[11.5px] font-semibold h-8 px-3 rounded-md border border-line bg-surface hover:bg-bg-deep">
                View handoff
              </button>
            ) : (
              <>
                <button onClick={() => initiate("renewal")}
                  className="text-[11.5px] font-semibold h-8 px-3 rounded-md inline-flex items-center gap-1.5"
                  style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
                  <Send size={11} strokeWidth={1.8} /> Start renewal handoff
                </button>
                <button onClick={() => initiate("expansion")}
                  className="text-[11.5px] font-medium h-8 px-3 rounded-md border border-line bg-surface hover:bg-bg-deep">
                  Expansion handoff
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {open && draft && (
        <HandoffEditor
          handoff={draft}
          accountName={account.name}
          onClose={() => setOpen(false)}
          onSave={(d) => { saveData(d); setOpen(false); }}
          onClear={() => { saveData(null); setOpen(false); }}
        />
      )}
    </>
  );
}

function RefreshCwIcon() {
  return <Sparkles size={18} strokeWidth={1.6} style={{ color: "var(--accent-ink)" }} />;
}

function HandoffEditor({ handoff, accountName, onClose, onSave, onClear }: {
  handoff: HandoffData; accountName: string; onClose: () => void; onSave: (d: HandoffData) => void; onClear: () => void;
}) {
  const { user: __heUser } = useUser();
  const [draft, setDraft] = useState<HandoffData>(handoff);
  const [comment, setComment] = useState("");
  const setField = (k: keyof HandoffData["fields"], v: string) => setDraft((d) => ({ ...d, fields: { ...d.fields, [k]: v } }));
  const setStatus = (s: HandoffStatus) => setDraft((d) => ({ ...d, status: s }));
  const addComment = () => {
    if (!comment.trim()) return;
    setDraft((d) => ({ ...d, comments: [...d.comments, { id: `c_${Date.now()}`, by: __heUser.firstName, at: new Date().toISOString().slice(0, 10), text: comment.trim() }] }));
    setComment("");
  };

  return (
    <>
      <div className="fixed inset-0 bg-ink/30 z-[90] fade-in" onClick={onClose} />
      <aside className="fixed top-0 right-0 h-screen w-full md:w-[560px] bg-bg z-[95] drawer-anim border-l border-line flex flex-col">
        <div className="px-5 h-14 border-b border-line flex items-center justify-between shrink-0">
          <div>
            <div className="text-[12.5px] font-semibold text-ink">Renewal handoff · {accountName}</div>
            <div className="text-[10.5px] text-muted-2">{draft.fromOwner} → {draft.toOwner} ({draft.toRole})</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg grid place-items-center text-muted hover:text-ink hover:bg-surface-2">
            <X size={14} strokeWidth={1.6} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {/* Status */}
          <div>
            <div className="mono-label mb-1.5">Status</div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(Object.keys(HANDOFF_STATUS_META) as HandoffStatus[]).map((s) => {
                const m = HANDOFF_STATUS_META[s];
                return (
                  <button key={s} onClick={() => setStatus(s)}
                    className="text-[10.5px] font-semibold uppercase tracking-[0.06em] px-2 py-1 rounded-full transition-all"
                    style={{
                      background: m.bg, color: m.ink,
                      outline: draft.status === s ? `2px solid ${m.ink}` : "none",
                      outlineOffset: 1,
                    }}>
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {[
            { k: "usage" as const,            label: "Usage",                hint: "WAU/MAU, sequence completion, feature depth" },
            { k: "sentiment" as const,        label: "Sentiment",            hint: "Sponsor engagement, last call sentiment, NPS" },
            { k: "expansionSignals" as const, label: "Expansion signals",    hint: "Headcount changes, product depth, comparable conversions" },
            { k: "blockers" as const,         label: "Blockers",             hint: "Procurement, legal, competitive, technical" },
            { k: "asks" as const,             label: "Asks for receiver",    hint: "What do you want them to do?" },
          ].map((f) => (
            <div key={f.k}>
              <div className="mono-label mb-1.5">{f.label}</div>
              <textarea value={draft.fields[f.k]} onChange={(e) => setField(f.k, e.target.value)}
                placeholder={f.hint}
                rows={2}
                className="w-full text-[12.5px] rounded-md bg-surface border border-line px-2.5 py-2 outline-none resize-none placeholder:text-muted-2 leading-relaxed" />
            </div>
          ))}

          {/* Comments */}
          <div>
            <div className="mono-label mb-1.5">Comments · {draft.comments.length}</div>
            <div className="space-y-1.5">
              {draft.comments.map((c) => (
                <div key={c.id} className="card-soft p-2.5">
                  <div className="flex items-center gap-2 text-[10.5px] mb-0.5">
                    <span className="font-semibold text-ink">{c.by}</span>
                    <span className="text-muted-2">{c.at}</span>
                  </div>
                  <p className="text-[12px] text-ink-2 leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <input value={comment} onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addComment(); }}
                placeholder="Comment — Enter to post"
                className="flex-1 text-[12px] h-8 px-2.5 rounded-md bg-surface border border-line outline-none placeholder:text-muted-2" />
              <button onClick={addComment}
                className="text-[11px] font-semibold h-8 px-2.5 rounded-md inline-flex items-center gap-1"
                style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
                <Send size={11} /> Post
              </button>
            </div>
          </div>
        </div>
        <div className="px-5 py-3 border-t border-line shrink-0 flex items-center justify-between">
          <button onClick={onClear} className="text-[11.5px] text-muted hover:text-ink">Clear handoff</button>
          <button onClick={() => onSave(draft)}
            className="text-[12px] font-semibold h-9 px-4 rounded-lg inline-flex items-center gap-1.5"
            style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
            <Send size={12} strokeWidth={1.8} /> Save & send
          </button>
        </div>
      </aside>
    </>
  );
}

// ---------------------------------------------------------------------
// ONBOARDING FOLLOW-UP — pending customer-side inputs / config
// ---------------------------------------------------------------------

const ONB_KEY = "alphard:onboarding-status";

type OnbItem = { id: string; label: string; status: "pending" | "received" | "skipped"; lastAsked: string };

function defaultOnboardingItems(account: AccountDetail): OnbItem[] {
  const isCustomer = account.status === "Customer";
  return [
    { id: "i1", label: "SSO config screenshot",                    status: isCustomer ? "received" : "pending",            lastAsked: "today" },
    { id: "i2", label: "Field mapping spreadsheet",                status: isCustomer ? "received" : "pending",            lastAsked: "yesterday" },
    { id: "i3", label: "Use-case priority list",                   status: account.healthScore >= 75 ? "received" : "pending", lastAsked: "3d ago" },
    { id: "i4", label: "Sandbox tenant access",                    status: "received", lastAsked: "5d ago" },
    { id: "i5", label: "Procurement contact for renewal",          status: account.lastQbrDays >= 60 ? "pending" : "received", lastAsked: "today" },
    { id: "i6", label: "Executive sponsor introduction",           status: account.healthScore < 60 ? "pending" : "skipped",   lastAsked: "1w ago" },
  ];
}

function OnboardingFollowupCard({ account }: { account: AccountDetail }) {
  const slug = slugify(account.name);
  const [items, setItems] = useState<OnbItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const map = loadJson<Record<string, OnbItem[]>>(ONB_KEY, {});
    setItems(map[slug] ?? defaultOnboardingItems(account));
    setHydrated(true);
  }, [slug, account.name]);

  useEffect(() => {
    if (!hydrated) return;
    const map = loadJson<Record<string, OnbItem[]>>(ONB_KEY, {});
    map[slug] = items;
    saveJson(ONB_KEY, map);
  }, [items, slug, hydrated]);

  const set = (id: string, status: OnbItem["status"]) =>
    setItems((xs) => xs.map((x) => x.id === id ? { ...x, status, lastAsked: status === "pending" ? "just now" : x.lastAsked } : x));

  const sendReminder = (id: string) => {
    setItems((xs) => xs.map((x) => x.id === id ? { ...x, lastAsked: "just now" } : x));
  };

  const pending = items.filter((i) => i.status === "pending").length;
  const received = items.filter((i) => i.status === "received").length;

  if (!hydrated) return null;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="mono-label">
          {account.status === "Customer" ? "Onboarding follow-up" : "Onboarding inputs requested"}
          {pending > 0 && <span className="ml-2 text-[10px] font-mono tnum px-1.5 py-0.5 rounded text-warn" style={{ background: "var(--warn-soft)", color: "var(--warn)" }}>{pending} pending</span>}
        </div>
        <div className="text-[10.5px] text-muted-2">
          <span className="text-ink-2 font-medium tnum">{received}/{items.length}</span> complete
        </div>
      </div>
      <p className="text-[11.5px] text-muted mb-3 leading-relaxed">
        We'll auto-remind your contact for missing inputs · 1 reminder every 3 business days · escalate to your AE after 2 ignored.
      </p>
      <div className="space-y-1.5">
        {items.map((it) => <OnbRow key={it.id} item={it} onSet={(s) => set(it.id, s)} onRemind={() => sendReminder(it.id)} />)}
      </div>
    </div>
  );
}

function OnbRow({ item, onSet, onRemind }: { item: OnbItem; onSet: (s: OnbItem["status"]) => void; onRemind: () => void }) {
  const tone = item.status === "received" ? "var(--pos)" : item.status === "skipped" ? "var(--muted-2)" : "var(--warn)";
  const bg   = item.status === "received" ? "var(--pos-soft)" : item.status === "skipped" ? "var(--bg-deep)" : "var(--warn-soft)";
  const StatusIcon = item.status === "received" ? Check : item.status === "skipped" ? X : AlertTriangle;
  return (
    <div className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-bg-deep">
      <button onClick={() => onSet(item.status === "received" ? "pending" : "received")}
        className="w-6 h-6 rounded-md grid place-items-center shrink-0 hover:opacity-80"
        style={{ background: bg }}>
        <StatusIcon size={11} strokeWidth={2} style={{ color: tone }} />
      </button>
      <div className="flex-1 min-w-0">
        <div className={`text-[12.5px] ${item.status === "received" ? "text-muted-2 line-through" : "text-ink-2 font-medium"}`}>
          {item.label}
        </div>
        <div className="text-[10.5px] text-muted-2">Last asked {item.lastAsked}</div>
      </div>
      {item.status === "pending" && (
        <button onClick={onRemind}
          className="text-[10.5px] font-semibold h-7 px-2 rounded-md inline-flex items-center gap-1 border border-line bg-surface hover:bg-bg-deep">
          <Send size={10} strokeWidth={1.8} /> Remind
        </button>
      )}
      <Popover align="right" width={180}
        trigger={(_, t) => (
          <button onClick={t} className="w-6 h-6 rounded-md grid place-items-center text-muted-2 hover:text-ink hover:bg-line">⋯</button>
        )}>
        {(close) => (
          <>
            <MenuItem onClick={() => { onSet("received"); close(); }}>Mark received</MenuItem>
            <MenuItem onClick={() => { onSet("pending"); close(); }}>Mark pending</MenuItem>
            <MenuItem onClick={() => { onSet("skipped"); close(); }}>Skip</MenuItem>
          </>
        )}
      </Popover>
    </div>
  );
}

/* ─── Plans Panel ─── */

const PRIORITY_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  high:   { bg: "var(--neg-soft)",  color: "var(--neg)",  label: "High" },
  medium: { bg: "var(--warn-soft)", color: "var(--warn)", label: "Med" },
  low:    { bg: "var(--bg-deep)",   color: "var(--muted)", label: "Low" },
};

type KanbanCol = "todo" | "in-progress" | "done" | "blocked";
const KANBAN_COLS: { key: KanbanCol; label: string; color: string; softBg: string }[] = [
  { key: "todo",        label: "To do",       color: "var(--muted)",  softBg: "var(--bg-deep)" },
  { key: "in-progress", label: "In progress", color: "var(--warn)",   softBg: "var(--warn-soft)" },
  { key: "done",        label: "Completed",   color: "var(--pos)",    softBg: "var(--pos-soft)" },
  { key: "blocked",     label: "Blocked",     color: "var(--neg)",    softBg: "var(--neg-soft)" },
];

function PlansPanel({ slug }: { slug: string }) {
  const plans = accountPlans.filter((p) => p.accountSlug === slug);
  const accountName = plans[0]?.accountName ?? slug.replace(/-/g, " ");
  const [tasks, setTasks] = useState<Record<string, TaskStatus>>({});
  const toast = useToast();

  const getStatus = (t: PlanTask): TaskStatus => tasks[t.id] ?? t.status;
  const cycleStatus = (t: PlanTask) => {
    const cur = getStatus(t);
    const next: TaskStatus = cur === "todo" ? "in-progress" : cur === "in-progress" ? "done" : "todo";
    setTasks((s) => ({ ...s, [t.id]: next }));
  };

  const allTasks = plans.flatMap((p) =>
    p.milestones.flatMap((ms) =>
      ms.tasks.map((t) => ({ ...t, planTitle: p.title, planKind: p.kind, milestoneTitle: ms.title }))
    )
  );

  const doneCount = allTasks.filter((t) => getStatus(t) === "done").length;
  const inProgCount = allTasks.filter((t) => getStatus(t) === "in-progress").length;

  const grouped: Record<KanbanCol, typeof allTasks> = { todo: [], "in-progress": [], done: [], blocked: [] };
  allTasks.forEach((t) => {
    const s = getStatus(t);
    if (s in grouped) grouped[s as KanbanCol].push(t);
  });

  if (plans.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="w-12 h-12 rounded-xl grid place-items-center mx-auto mb-3" style={{ background: "var(--accent-soft)" }}>
          <Milestone size={20} strokeWidth={1.6} style={{ color: "var(--accent)" }} />
        </div>
        <h3 className="text-[15px] font-semibold text-ink mb-1">No plans yet</h3>
        <p className="text-[12.5px] text-muted mb-4">Create an expansion or retention plan to track milestones and tasks for this account.</p>
        <button onClick={() => toast({ tone: "info", title: "Create plan", body: "Plan editor opens with expansion / retention / onboarding templates." })}
          className="btn-accent h-9 px-4 text-[12.5px]">
          <Plus size={13} strokeWidth={2} /> Create Plan
        </button>
      </div>
    );
  }

  return (
    <div className="relative" style={{ minHeight: 560 }}>
      {/* Header */}
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-2 mb-1">
            List · {accountName}
          </div>
          <div className="text-[22px] font-bold text-ink leading-tight">
            {allTasks.length} tasks<span className="text-[14px] font-medium text-muted ml-1.5">· {doneCount} done, {inProgCount} in progress</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => toast({ tone: "info", title: "Filters", body: "Filter by assignee, priority, and status — coming soon" })}
            className="h-8 px-3 rounded-lg border border-line text-[11.5px] font-medium text-ink hover:bg-bg-deep transition-colors">Filter</button>
          <button onClick={() => toast({ tone: "info", title: "Group by", body: "Group rows by milestone, owner, or due window — coming soon" })}
            className="h-8 px-3 rounded-lg border border-line text-[11.5px] font-medium text-ink hover:bg-bg-deep transition-colors">Rows: None</button>
          <button onClick={() => toast({ tone: "info", title: "New task" })}
            className="h-8 px-3 rounded-lg text-[11.5px] font-semibold inline-flex items-center gap-1.5"
            style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
            <Plus size={12} strokeWidth={2} /> New task
          </button>
        </div>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-4 gap-3" style={{ minHeight: 460 }}>
        {KANBAN_COLS.map((col) => {
          const items = grouped[col.key];
          return (
            <div key={col.key} className="flex flex-col rounded-xl border border-line overflow-hidden" style={{ background: "var(--surface)" }}>
              {/* Column header */}
              <div className="flex items-center justify-between px-3.5 py-3 border-b border-line">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md grid place-items-center text-[10px] font-bold"
                    style={{ background: col.softBg, color: col.color }}>
                    {items.length}
                  </span>
                  <span className="text-[12.5px] font-semibold text-ink">{col.label}</span>
                </div>
                <button onClick={() => toast({ tone: "info", title: `Add ${col.label} task` })}
                  className="w-5 h-5 rounded grid place-items-center text-muted hover:text-ink hover:bg-bg-deep transition-colors">
                  <Plus size={12} strokeWidth={2} />
                </button>
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto" style={{ maxHeight: 480 }}>
                {items.length === 0 && (
                  <div className="flex items-center justify-center h-24 text-[11.5px] text-muted-2 italic">Nothing {col.key === "blocked" ? "blocked" : "here"}</div>
                )}
                {items.map((t) => {
                  const s = getStatus(t);
                  const isOverdue = s !== "done" && new Date(t.dueDate) < new Date();
                  const pri = PRIORITY_STYLE[t.priority];
                  return (
                    <div key={t.id}
                      className="rounded-lg border border-line p-3 hover:border-line-strong transition-colors cursor-pointer"
                      style={{ background: "var(--bg)" }}>
                      <div className="flex items-start gap-2.5 mb-2">
                        {/* Status indicator */}
                        <button onClick={() => cycleStatus(t)} className="mt-0.5 shrink-0">
                          {s === "done" ? (
                            <div className="w-[18px] h-[18px] rounded-full grid place-items-center" style={{ background: "var(--pos)" }}>
                              <Check size={10} strokeWidth={3} style={{ color: "white" }} />
                            </div>
                          ) : s === "in-progress" ? (
                            <div className="w-[18px] h-[18px] rounded-full border-2 grid place-items-center" style={{ borderColor: "var(--warn)" }}>
                              <div className="w-2 h-2 rounded-full" style={{ background: "var(--warn)" }} />
                            </div>
                          ) : (
                            <div className="w-[18px] h-[18px] rounded-full border-2" style={{ borderColor: "var(--line-strong)" }} />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className={`text-[12.5px] font-medium leading-snug ${s === "done" ? "text-muted line-through" : "text-ink"}`}>
                            {t.title}
                          </div>
                          <div className="text-[10.5px] text-muted mt-0.5 truncate">{t.planTitle}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center -space-x-1.5">
                          <div className="w-6 h-6 rounded-full text-white grid place-items-center text-[8px] font-bold ring-2 ring-bg shrink-0"
                            style={{ background: t.assigneeBg }}>
                            {t.assigneeInitials}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {t.priority === "high" && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: pri.bg, color: pri.color }}>
                              {pri.label}
                            </span>
                          )}
                          <span className={`text-[10.5px] font-mono tnum ${isOverdue ? "font-semibold" : ""}`}
                            style={{ color: isOverdue ? "var(--neg)" : "var(--muted)" }}>
                            {fmtDate(t.dueDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

/* ─── Documents Panel ─── */

function DocumentsPanel({ slug }: { slug: string }) {
  const accountName = accounts.find(a => slugify(a.name) === slug)?.name ?? slug;
  const docs = accountDocs[slug] ?? [];
  const [openDoc, setOpenDoc] = useState<DocNode | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editing, setEditing] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(docs.filter(d => d.kind === "folder").map(d => d.id)));
  const [signalQuery, setSignalQuery] = useState("");
  const toast = useToast();

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const findParentFolder = (target: DocNode, nodes: DocNode[]): DocNode | null => {
    for (const n of nodes) {
      if (n.children?.some(c => c.id === target.id)) return n;
      if (n.children) { const found = findParentFolder(target, n.children); if (found) return found; }
    }
    return null;
  };

  const renderDocContent = (content: string) => {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (line.startsWith("|") && lines[i + 1]?.startsWith("|")) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].startsWith("|")) { tableLines.push(lines[i]); i++; }
        const headers = tableLines[0].split("|").filter(Boolean).map(s => s.trim());
        const rows = tableLines.slice(1).map(r => r.split("|").filter(Boolean).map(s => s.trim()));
        elements.push(
          <div key={`tbl-${i}`} className="my-4 border border-line rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-bg-deep">
                  {headers.map((h, hi) => (
                    <th key={hi} className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri} className="border-t border-line">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-4 py-2.5 text-[13px] text-ink">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
      if (line.startsWith("# ")) { elements.push(<h1 key={i} className="text-[24px] font-bold text-ink mt-6 mb-2 first:mt-0">{line.slice(2)}</h1>); }
      else if (line.startsWith("## ")) { elements.push(<h2 key={i} className="text-[18px] font-semibold text-ink mt-6 mb-2">{line.slice(3)}</h2>); }
      else if (line.startsWith("- ")) { elements.push(<div key={i} className="flex gap-2.5 ml-1 py-0.5"><span className="text-muted mt-0.5">•</span><span className="text-[14px] text-ink leading-relaxed">{line.slice(2)}</span></div>); }
      else if (line.match(/^\d+\./)) { elements.push(<div key={i} className="ml-1 py-0.5 text-[14px] text-ink leading-relaxed">{line}</div>); }
      else if (line.trim() === "") { elements.push(<div key={i} className="h-4" />); }
      else { elements.push(<p key={i} className="text-[14px] text-ink leading-relaxed">{line}</p>); }
      i++;
    }
    return elements;
  };

  const renderSidebarNode = (node: DocNode, depth: number = 0) => {
    const isFolder = node.kind === "folder";
    const isOpen = expandedFolders.has(node.id);
    const isSelected = openDoc?.id === node.id;
    const childCount = node.children?.length ?? 0;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors ${
            isSelected ? "bg-bg-deep" : "hover:bg-bg-deep/60"
          }`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => {
            if (isFolder) toggleFolder(node.id);
            else { setOpenDoc(node); setEditContent(node.content ?? ""); setEditing(false); }
          }}>
          {isFolder ? (
            <ChevronRight size={12} strokeWidth={2} className={`text-muted shrink-0 transition-transform duration-150 ${isOpen ? "rotate-90" : ""}`} />
          ) : (
            <FileText size={13} strokeWidth={1.6} className="text-muted shrink-0" />
          )}
          <span className={`flex-1 min-w-0 truncate text-[12.5px] ${isFolder ? "font-semibold text-ink" : isSelected ? "font-medium text-ink" : "text-ink-2"}`}>
            {node.title}
          </span>
          {isFolder && <span className="text-[10px] font-mono text-muted">{childCount}</span>}
        </div>
        {isFolder && isOpen && node.children && (
          <div>
            {node.children.map(child => {
              const isChildSelected = openDoc?.id === child.id;
              const dateStr = new Date(child.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
              const kindLabel = child.kind === "doc" ? "Strategy" : child.kind === "template" ? "Template" : "Meeting prep";
              return (
                <div key={child.id}
                  className={`flex items-start gap-2 py-2 px-2 rounded-md cursor-pointer transition-colors ${
                    isChildSelected ? "bg-bg-deep" : "hover:bg-bg-deep/60"
                  }`}
                  style={{ paddingLeft: `${24 + depth * 16}px` }}
                  onClick={() => { setOpenDoc(child); setEditContent(child.content ?? ""); setEditing(false); }}>
                  <FileText size={13} strokeWidth={1.6} className="text-muted shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className={`text-[12px] truncate ${isChildSelected ? "font-medium text-ink" : "text-ink-2"}`}>{child.title}</div>
                    <div className="text-[10px] text-muted font-mono">{kindLabel} · {dateStr}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const parentFolder = openDoc ? findParentFolder(openDoc, docs) : null;
  const breadcrumb = parentFolder ? `${accountName} / Spaces / ${openDoc?.title}` : openDoc ? `${accountName} / ${openDoc.title}` : "";
  const lastEdited = openDoc ? new Date(openDoc.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase() : "";

  return (
    <div className="grid grid-cols-12 gap-0 -mx-4 md:-mx-8" style={{ height: 620 }}>
      {/* Sidebar */}
      <div className="col-span-3 border-r border-line px-3 py-3 overflow-y-auto">
        <div className="flex items-center justify-between mb-3 px-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-2">Pages</span>
          <div className="flex items-center gap-1">
            <button onClick={() => toast({ tone: "info", title: "Import document" })}
              className="w-6 h-6 rounded grid place-items-center text-muted hover:text-ink hover:bg-bg-deep">
              <Download size={12} strokeWidth={1.8} />
            </button>
            <button onClick={() => toast({ tone: "info", title: "New page" })}
              className="w-6 h-6 rounded grid place-items-center text-muted hover:text-ink hover:bg-bg-deep">
              <Plus size={13} strokeWidth={2} />
            </button>
          </div>
        </div>
        <div className="space-y-0.5">
          {docs.map(node => renderSidebarNode(node))}
        </div>
      </div>

      {/* Document viewer */}
      <div className="col-span-9 flex flex-col relative min-h-0">
        {openDoc ? (
          <>
            <div className="flex items-center justify-between px-6 py-2.5 border-b border-line">
              <div className="text-[11px] text-muted font-mono truncate">{breadcrumb}</div>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-2">Last edited {lastEdited}</span>
                {!editing ? (
                  <button onClick={() => setEditing(true)}
                    className="text-[12px] font-medium h-7 px-3 rounded-md bg-ink text-white hover:bg-ink-2 transition-colors">
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => { setEditing(false); toast({ tone: "success", title: "Document saved" }); }}
                      className="text-[12px] font-semibold h-7 px-3 rounded-md inline-flex items-center gap-1.5"
                      style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
                      <Check size={11} strokeWidth={2} /> Save
                    </button>
                    <button onClick={() => { setEditing(false); setEditContent(openDoc.content ?? ""); }}
                      className="text-[12px] font-medium h-7 px-3 rounded-md border border-line hover:bg-bg-deep transition-colors">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-6 pb-24">
              {editing ? (
                <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                  className="w-full min-h-[400px] bg-transparent outline-none text-[14px] text-ink leading-relaxed resize-none font-mono"
                  style={{ tabSize: 2 }} />
              ) : (
                <div className="max-w-[720px]">
                  <h1 className="text-[28px] font-bold text-ink mb-4 leading-tight">{openDoc.title}</h1>
                  {renderDocContent(editContent || openDoc.content || "")}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl grid place-items-center mx-auto mb-3" style={{ background: "var(--bg-deep)" }}>
                <FileText size={20} strokeWidth={1.4} className="text-muted" />
              </div>
              <div className="text-[14px] font-medium text-ink mb-1">Select a page</div>
              <div className="text-[12px] text-muted">Choose from the sidebar or create a new page</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Account Workflows Panel ─── */

function AccountWorkflowsPanel({ slug }: { slug: string }) {
  const accountWfs = allWorkflows.filter((w) => w.accountSlug === slug);

  if (accountWfs.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="text-[13px] font-semibold text-ink mb-1">No workflows configured</div>
        <p className="text-[11px] text-muted-2 mb-3">Create account-specific workflows to automate signals, alerts, and sequences.</p>
        <Link href="/workflows" className="inline-flex items-center gap-1.5 text-[11px] font-medium text-accent hover:underline">
          Go to Workflows <ArrowRight size={12} />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="mono-label text-[9px]" style={{ letterSpacing: "0.08em" }}>Account Workflows</span>
        <Link href="/workflows" className="text-[10px] text-accent hover:underline">View all</Link>
      </div>
      {accountWfs.map((wf) => (
        <Link key={wf.id} href={`/workflows/${wf.id}`} className="card px-4 py-3 flex items-center gap-4 hover:shadow-md transition-shadow group">
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-medium text-ink group-hover:text-accent transition-colors">{wf.name}</div>
            <div className="text-[10px] text-muted-2 mt-0.5">{wf.description}</div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] text-muted-2 flex items-center gap-1"><Clock size={10} /> {wf.schedule}</span>
              <span className={`text-[10px] font-medium ${wf.lastRunStatus === "Completed" ? "text-pos" : wf.lastRunStatus === "Stalled" ? "text-warn" : "text-neg"}`}>
                {wf.lastRunStatus}
              </span>
              <div className="flex gap-1">
                {wf.apps.map((app) => (
                  <span key={app} className="px-1.5 py-0.5 text-[9px] rounded-full border border-line text-muted-2">{app}</span>
                ))}
              </div>
            </div>
          </div>
          <ChevronRight size={14} className="text-muted-2 group-hover:text-ink shrink-0" />
        </Link>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// GROWTH PLAN PANEL — quarterly expansion roadmap, target ladder,
// active plays, stakeholder buy-in matrix.
// Inspired by classic key-account-management plans (DemandFarm Growth
// Planner) but built around expansion-first AM workflow.
// ═══════════════════════════════════════════════════════════════════════
function GrowthPlanPanel({ account, slug }: { account: AccountDetail; slug: string }) {
  const opps = expansionOpportunities.filter((o) => o.accountSlug === slug);
  const totalPipeline = opps.reduce((s, o) => s + o.estimatedArr, 0);
  const targetArr = account.arr ? Math.round(account.arr * 1.30) : 0; // 30% growth ambition
  const gap = targetArr - account.arr;
  const progressPct = totalPipeline > 0 ? Math.min(100, Math.round((totalPipeline / gap) * 100)) : 0;

  // Synthetic quarterly bets — mix real opps with placeholder "future bets"
  const quarters: { label: string; window: string; target: number; status: "current" | "next" | "future"; bets: { name: string; arr: number; status: "in-flight" | "planned" | "validated" }[] }[] = [
    {
      label: "Q2 2026", window: "Apr → Jun", target: opps.filter(o => o.stage === "negotiation" || o.stage === "proposal").reduce((s, o) => s + o.estimatedArr, 0),
      status: "current",
      bets: opps.filter(o => o.stage === "negotiation" || o.stage === "proposal").map(o => ({
        name: o.productName, arr: o.estimatedArr, status: "in-flight" as const,
      })),
    },
    {
      label: "Q3 2026", window: "Jul → Sep", target: opps.filter(o => o.stage === "qualified").reduce((s, o) => s + o.estimatedArr, 0),
      status: "next",
      bets: opps.filter(o => o.stage === "qualified").map(o => ({
        name: o.productName, arr: o.estimatedArr, status: "validated" as const,
      })),
    },
    {
      label: "Q4 2026", window: "Oct → Dec", target: opps.filter(o => o.stage === "identified").reduce((s, o) => s + o.estimatedArr, 0),
      status: "future",
      bets: opps.filter(o => o.stage === "identified").map(o => ({
        name: o.productName, arr: o.estimatedArr, status: "planned" as const,
      })),
    },
    {
      label: "Q1 2027", window: "Jan → Mar", target: 0, status: "future",
      bets: [],
    },
  ];

  // Stakeholder buy-in matrix
  const stakeholderRoles: { role: string; needed: string; status: "won" | "engaging" | "needed" }[] = [
    { role: "Executive Champion", needed: opps[0]?.champion ?? "—", status: opps[0] ? "won" : "needed" },
    { role: "Economic Buyer",     needed: "VP / CFO sign-off",     status: account.healthScore >= 80 ? "engaging" : "needed" },
    { role: "Technical Buyer",    needed: "Eng / Security review", status: "engaging" },
    { role: "End-user Sponsor",   needed: "Day-to-day product user", status: "won" },
    { role: "Procurement",        needed: "Contract owner",         status: "needed" },
  ];

  return (
    <div className="space-y-5">
      {/* Hero card — current vs target ARR */}
      <div className="rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 5%, var(--surface)) 0%, var(--surface) 60%)",
          border: "1px solid color-mix(in srgb, var(--accent) 18%, var(--line))",
        }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame size={14} strokeWidth={2.2} style={{ color: "var(--accent-deep)" }} />
                <span className="text-[14px] font-semibold text-ink">Growth plan · {account.name}</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] px-2 py-0.5 rounded ml-1"
                  style={{ background: "var(--accent-soft)", color: "var(--accent-deep)" }}>FY 2026</span>
              </div>
              <div className="text-[12px] text-muted">
                Quarterly expansion bets, stakeholder coverage, and the path to target ARR.
              </div>
            </div>
            <button className="text-[11.5px] font-semibold inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-white"
              style={{ background: "var(--accent-deep)" }}>
              <Sparkles size={11} strokeWidth={2.2} /> Brief me on the plan
            </button>
          </div>

          {/* ARR ladder */}
          <div className="grid grid-cols-3 gap-5 mt-5 mb-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-muted-2 font-semibold mb-1">Current ARR</div>
              <div className="text-[26px] font-bold tnum text-ink" style={{ letterSpacing: "-0.022em" }}>
                {account.arr ? fmtMoneyShort(account.arr) : "—"}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-muted-2 font-semibold mb-1">FY26 target</div>
              <div className="text-[26px] font-bold tnum" style={{ color: "var(--pos)", letterSpacing: "-0.022em" }}>
                {targetArr ? fmtMoneyShort(targetArr) : "—"}
              </div>
              <div className="text-[10.5px] text-muted mt-0.5">+30% growth ambition</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-muted-2 font-semibold mb-1">Pipeline cover</div>
              <div className="flex items-baseline gap-1.5">
                <div className="text-[26px] font-bold tnum" style={{ color: "var(--accent-deep)", letterSpacing: "-0.022em" }}>
                  {totalPipeline ? fmtMoneyShort(totalPipeline) : "$0"}
                </div>
                <div className="text-[12px] font-semibold tnum" style={{ color: progressPct >= 80 ? "var(--pos)" : progressPct >= 50 ? "var(--warn)" : "var(--neg)" }}>
                  {progressPct}%
                </div>
              </div>
              <div className="text-[10.5px] text-muted mt-0.5">of gap-to-target covered</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[10px] text-muted-2 mb-1.5">
              <span>{fmtMoneyShort(account.arr ?? 0)}</span>
              <span>Gap to target: {fmtMoneyShort(gap)}</span>
              <span>{fmtMoneyShort(targetArr)}</span>
            </div>
            <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-deep)" }}>
              <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: "100%", background: "linear-gradient(90deg, var(--accent-soft), var(--accent-soft))" }} />
              <div className="absolute inset-y-0 left-0 rounded-full"
                style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, var(--accent), var(--accent-deep))" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Quarterly roadmap */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Calendar size={14} strokeWidth={2} style={{ color: "var(--accent-deep)" }} />
            <span className="text-[14px] font-semibold text-ink">Quarterly roadmap</span>
          </div>
          <span className="text-[10.5px] text-muted">Drag bets between quarters to re-plan</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {quarters.map((q) => {
            const isCurrent = q.status === "current";
            const accentColor = isCurrent ? "var(--accent-deep)" : q.status === "next" ? "var(--accent)" : "var(--muted-2)";
            return (
              <div key={q.label} className="rounded-xl p-3.5 flex flex-col gap-3"
                style={{
                  background: isCurrent ? "color-mix(in srgb, var(--accent) 4%, var(--bg-deep))" : "var(--bg-deep)",
                  border: `1px solid ${isCurrent ? "color-mix(in srgb, var(--accent) 25%, var(--line))" : "var(--line)"}`,
                }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11.5px] font-semibold text-ink flex items-center gap-1.5">
                      {q.label}
                      {isCurrent && <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-deep)" }} />}
                    </div>
                    <div className="text-[9.5px] text-muted mt-0.5">{q.window}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[12.5px] font-bold tnum" style={{ color: accentColor }}>
                      {q.target ? fmtMoneyShort(q.target) : "—"}
                    </div>
                    <div className="text-[9px] text-muted-2 uppercase tracking-[0.12em] font-semibold">target</div>
                  </div>
                </div>

                {/* Bets in quarter */}
                <div className="flex flex-col gap-1.5 min-h-[60px]">
                  {q.bets.length === 0 && (
                    <div className="text-[10.5px] text-muted-2 italic py-2 text-center rounded border border-dashed"
                      style={{ borderColor: "var(--line)" }}>
                      Open lane · drag bets here
                    </div>
                  )}
                  {q.bets.map((b, i) => {
                    const tone = b.status === "in-flight" ? "var(--pos)" : b.status === "validated" ? "var(--accent)" : "var(--muted)";
                    return (
                      <div key={i} className="rounded-lg px-2.5 py-2 cursor-grab"
                        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-ink truncate">{b.name}</span>
                          <span className="text-[10.5px] font-bold tnum text-ink ml-2 shrink-0">{fmtMoneyShort(b.arr)}</span>
                        </div>
                        <div className="text-[9.5px] font-medium uppercase tracking-[0.12em]" style={{ color: tone }}>
                          {b.status === "in-flight" ? "● In flight" : b.status === "validated" ? "● Validated" : "○ Planned"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stakeholder coverage matrix + Active plays side-by-side */}
      <div className="grid grid-cols-12 gap-5">
        {/* Stakeholder coverage */}
        <div className="col-span-12 lg:col-span-7 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Crown size={14} strokeWidth={2} style={{ color: "#7C3AED" }} />
              <span className="text-[14px] font-semibold text-ink">Stakeholder coverage</span>
            </div>
            <span className="text-[10.5px] text-muted">Who needs to say yes</span>
          </div>
          <div className="space-y-2">
            {stakeholderRoles.map((s) => {
              const tone = s.status === "won" ? "var(--pos)" : s.status === "engaging" ? "var(--warn)" : "var(--muted)";
              const soft = s.status === "won" ? "var(--pos-soft)" : s.status === "engaging" ? "var(--warn-soft)" : "var(--bg-deep)";
              const Icon = s.status === "won" ? CheckCircle2 : s.status === "engaging" ? Clock : Circle;
              return (
                <div key={s.role} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{ border: "1px solid var(--line)" }}>
                  <div className="w-7 h-7 rounded-lg grid place-items-center shrink-0" style={{ background: soft }}>
                    <Icon size={13} strokeWidth={2} style={{ color: tone }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-semibold text-ink">{s.role}</div>
                    <div className="text-[10.5px] text-muted truncate">{s.needed}</div>
                  </div>
                  <span className="text-[9.5px] font-semibold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded shrink-0"
                    style={{ background: soft, color: tone }}>
                    {s.status === "won" ? "Won" : s.status === "engaging" ? "Engaging" : "Needed"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Success criteria / KPIs */}
        <div className="col-span-12 lg:col-span-5 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Target size={14} strokeWidth={2} style={{ color: "var(--pos)" }} />
              <span className="text-[14px] font-semibold text-ink">Success criteria</span>
            </div>
          </div>
          <div className="space-y-2.5">
            {[
              { label: "WAU/MAU ratio",       target: "≥ 0.65",   actual: "0.74",    on: true },
              { label: "Net Promoter Score",  target: "≥ 50",     actual: "+47",     on: true },
              { label: "Champion engagement", target: "Weekly",   actual: "Active",  on: true },
              { label: "Exec sponsor calls",  target: "≥ 1 / qtr", actual: "1 done", on: true },
              { label: "Pricing exposure",    target: "Zero",     actual: "1 flag",  on: false },
            ].map((kpi, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: kpi.on ? "var(--pos)" : "var(--neg)" }} />
                <span className="text-[12px] text-ink-2 flex-1 truncate">{kpi.label}</span>
                <span className="text-[10px] text-muted-2 tnum">{kpi.target}</span>
                <span className="text-[11px] font-mono tnum font-semibold w-14 text-right"
                  style={{ color: kpi.on ? "var(--pos)" : "var(--neg)" }}>{kpi.actual}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// NOTES PANEL — per-account scratchpad with quick templates
// ═══════════════════════════════════════════════════════════════════════

type AccountNote = {
  id: string;
  text: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  template?: string;
};

const NOTE_TEMPLATES = [
  { key: "call",     label: "Call notes",        prefix: "Call · {{date}}\n— Attendees:\n— Topics:\n— Outcomes:\n— Next steps:\n" },
  { key: "qbr",      label: "QBR prep",          prefix: "QBR prep · {{date}}\n— Outcomes since last QBR:\n— What changed:\n— Asks for next quarter:\n" },
  { key: "champ",    label: "Champion intel",    prefix: "Champion · " },
  { key: "blocker",  label: "Blocker",           prefix: "Blocker · " },
  { key: "exec",     label: "Exec summary",      prefix: "Exec summary · " },
];

function NotesPanel({ slug, accountName }: { slug: string; accountName: string }) {
  const storageKey = `alphard:notes:${slug}`;
  const { user } = useUser();
  const toast = useToast();
  const [notes, setNotes] = useState<AccountNote[]>([]);
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState<"all" | "pinned">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setNotes(JSON.parse(raw));
      else {
        setNotes([
          {
            id: "seed-1",
            text: `Maya Chen · 12 May call\n— Confirmed Q3 expansion budget for Networking + Security.\n— Wants ROI deck before next QBR; bring Databricks comparable.\n— Jason Park wants security review before procurement signs.\n— Action: send revised proposal Friday.`,
            pinned: true,
            createdAt: new Date(Date.now() - 86400_000 * 4).toISOString(),
            updatedAt: new Date(Date.now() - 86400_000 * 4).toISOString(),
            template: "call",
          },
        ]);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const persist = (list: AccountNote[]) => {
    setNotes(list);
    try { localStorage.setItem(storageKey, JSON.stringify(list)); } catch {}
  };

  const insertTemplate = (key: string) => {
    const t = NOTE_TEMPLATES.find((x) => x.key === key);
    if (!t) return;
    const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const seed = t.prefix.replace("{{date}}", date);
    setDraft(seed);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(seed.length, seed.length);
      }
    });
  };

  const post = () => {
    const text = draft.trim();
    if (!text) return;
    const now = new Date().toISOString();
    const note: AccountNote = {
      id: `note-${Date.now()}`,
      text,
      pinned: false,
      createdAt: now,
      updatedAt: now,
    };
    persist([note, ...notes]);
    setDraft("");
    toast({ tone: "success", title: "Note saved", body: `Pinned to ${accountName}'s scratchpad.` });
  };

  const remove = (id: string) => persist(notes.filter((n) => n.id !== id));
  const togglePin = (id: string) => persist(notes.map((n) => n.id === id ? { ...n, pinned: !n.pinned } : n));
  const startEdit = (n: AccountNote) => { setEditingId(n.id); setEditingText(n.text); };
  const saveEdit = () => {
    if (!editingId) return;
    persist(notes.map((n) => n.id === editingId ? { ...n, text: editingText, updatedAt: new Date().toISOString() } : n));
    setEditingId(null);
    setEditingText("");
  };

  const filtered = filter === "pinned" ? notes.filter(n => n.pinned) : notes;
  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-baseline gap-2.5 mb-1">
            <span className="text-[14px] font-semibold text-ink">Notes</span>
            <span className="text-[11px] tnum text-muted-2">{notes.length}</span>
          </div>
          <div className="text-[12px] text-muted">
            Free-form scratchpad for {accountName}. Saved locally.
          </div>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: "var(--bg-deep)" }}>
          <button onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded text-[11.5px] font-medium ${filter === "all" ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
            All {notes.length}
          </button>
          <button onClick={() => setFilter("pinned")}
            className={`px-3 py-1.5 rounded text-[11.5px] font-medium ${filter === "pinned" ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
            Pinned {notes.filter(n => n.pinned).length}
          </button>
        </div>
      </div>

      <div className="card p-4">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Type a note about ${accountName}… (Cmd+Enter to save)`}
          className="w-full text-[13px] text-ink bg-transparent outline-none resize-y min-h-[110px] leading-relaxed font-mono placeholder:text-muted-2"
          onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); post(); } }}
        />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-line gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {NOTE_TEMPLATES.map((t) => (
              <button key={t.key} onClick={() => insertTemplate(t.key)}
                className="text-[10.5px] font-medium px-2 py-1 rounded-md inline-flex items-center gap-1 hover:bg-bg-deep transition-colors"
                style={{ border: "1px solid var(--line)", color: "var(--ink-2)" }}>
                <Plus size={9} strokeWidth={2.4} />
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] text-muted-2">⌘ + Enter to save</span>
            <button onClick={post} disabled={!draft.trim()}
              className="text-[12px] font-semibold px-3.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
              style={{ background: "var(--accent-deep)" }}>
              <Plus size={11} strokeWidth={2.4} /> Save note
            </button>
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText size={20} strokeWidth={1.5} className="mx-auto text-muted-2 mb-3" />
          <div className="text-[13px] font-semibold text-ink">No notes yet</div>
          <div className="text-[11.5px] text-muted mt-1">
            Use the composer above or pick a template — call notes, QBR prep, champion intel.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((n) => {
            const isEditing = editingId === n.id;
            return (
              <div key={n.id}
                className="card p-4 transition-colors"
                style={{
                  borderColor: n.pinned ? "color-mix(in srgb, var(--accent) 25%, var(--line))" : "var(--line)",
                  background: n.pinned ? "color-mix(in srgb, var(--accent) 3%, var(--surface))" : "var(--surface)",
                }}>
                <div className="flex items-center justify-between mb-2.5 gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-[10.5px] text-muted">
                    <div className="w-5 h-5 rounded-full grid place-items-center text-[8px] font-bold text-white"
                      style={{ background: "var(--accent-deep)" }}>{user.initials}</div>
                    <span className="font-semibold text-ink-2">{user.firstName}</span>
                    <span className="text-muted-2">·</span>
                    <span>{relativeNote(n.createdAt)}</span>
                    {n.updatedAt !== n.createdAt && (<><span className="text-muted-2">·</span><span className="italic">edited</span></>)}
                    {n.pinned && (
                      <span className="ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-[0.12em]"
                        style={{ background: "var(--accent-soft)", color: "var(--accent-deep)" }}>Pinned</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => togglePin(n.id)}
                      className="text-[10.5px] font-medium px-2 py-1 rounded hover:bg-bg-deep text-muted hover:text-ink transition-colors">
                      {n.pinned ? "Unpin" : "Pin"}
                    </button>
                    {!isEditing && (
                      <button onClick={() => startEdit(n)}
                        className="text-[10.5px] font-medium px-2 py-1 rounded hover:bg-bg-deep text-muted hover:text-ink transition-colors">Edit</button>
                    )}
                    <button onClick={() => remove(n.id)}
                      className="text-[10.5px] font-medium px-2 py-1 rounded hover:bg-bg-deep text-muted hover:text-neg transition-colors">Delete</button>
                  </div>
                </div>
                {isEditing ? (
                  <>
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="w-full text-[12.5px] text-ink bg-transparent outline-none resize-y min-h-[100px] leading-relaxed font-mono"
                    />
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-line">
                      <button onClick={saveEdit}
                        className="text-[11px] font-semibold px-3 py-1.5 rounded text-white"
                        style={{ background: "var(--accent-deep)" }}>Save</button>
                      <button onClick={() => { setEditingId(null); setEditingText(""); }}
                        className="text-[11px] font-medium px-3 py-1.5 rounded text-muted hover:text-ink">Cancel</button>
                    </div>
                  </>
                ) : (
                  <pre className="text-[12.5px] text-ink-2 leading-relaxed whitespace-pre-wrap font-mono">{n.text}</pre>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function relativeNote(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
