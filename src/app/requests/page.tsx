"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus, Search, MessageSquare, ArrowRight, Send, Filter, X, AlertTriangle,
  CheckCircle2, Clock, Zap, Sparkles, ChevronDown, FileText,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Logo } from "@/components/Logo";
import { Modal, ModalButton, FormField, TextInput, SelectInput } from "@/components/Modal";
import { Popover, MenuItem } from "@/components/Popover";
import { useToast } from "@/components/Toast";
import { accounts, fmtMoney, slugify } from "@/lib/mock";

const ME = "Walid";

export type RequestStatus = "submitted" | "under-review" | "planned" | "in-progress" | "shipped" | "wont-do";

const STATUS_META: Record<RequestStatus, { label: string; bg: string; ink: string }> = {
  "submitted":     { label: "Submitted",    bg: "var(--bg-deep)",     ink: "var(--ink-2)" },
  "under-review":  { label: "Under review", bg: "var(--info-soft)",   ink: "var(--info)" },
  "planned":       { label: "Planned",      bg: "var(--accent-soft)", ink: "var(--accent-ink)" },
  "in-progress":   { label: "In progress",  bg: "var(--warn-soft)",   ink: "var(--warn)" },
  "shipped":       { label: "Shipped",      bg: "var(--pos-soft)",    ink: "var(--pos)" },
  "wont-do":       { label: "Won't do",     bg: "var(--neg-soft)",    ink: "var(--neg)" },
};

export type RequestUrgency = "low" | "medium" | "high" | "blocker";
const URGENCY_META: Record<RequestUrgency, { label: string; ink: string; bg: string }> = {
  "low":     { label: "Low",     ink: "var(--muted)", bg: "var(--bg-deep)" },
  "medium":  { label: "Medium",  ink: "var(--info)",  bg: "var(--info-soft)" },
  "high":    { label: "High",    ink: "var(--warn)",  bg: "var(--warn-soft)" },
  "blocker": { label: "Blocker", ink: "var(--neg)",   bg: "var(--neg-soft)" },
};

type Comment = { id: string; by: string; at: string; text: string };

type Request = {
  id: string;
  title: string;
  problem: string;        // raw problem statement (Lemay's caveat — not packaged solution)
  account: string;        // account name
  arr: number;            // ARR weight
  urgency: RequestUrgency;
  status: RequestStatus;
  capturedFrom: "Call" | "Email" | "Slack" | "Manual";
  capturedAt: string;
  capturedBy: string;
  customerContact?: string;
  upvoteCount: number;    // other accounts asking for the same thing
  comments: Comment[];
};

// ---------------------------------------------------------------------------
// Seed list (mock; persisted via localStorage so demo edits stick)
// ---------------------------------------------------------------------------

const SEED: Request[] = [
  {
    id: "req-1",
    title: "Bulk reassign accounts when reps leave",
    problem: "When a rep leaves, ownership transfer is one-by-one in Salesforce. The CSM ends up doing 30+ clicks per rep. They want a bulk handoff with optional notification email.",
    account: "Cloudflare, Inc.",
    arr: 720000,
    urgency: "high",
    status: "under-review",
    capturedFrom: "Call",
    capturedAt: "2026-04-30",
    capturedBy: "Brad Allen",
    customerContact: "Maya Chen · VP Customer Operations",
    upvoteCount: 4,
    comments: [
      { id: "c1", by: "Sarah Chen",  at: "2026-04-30", text: "Snowflake hit the same thing during their reorg." },
      { id: "c2", by: "Lisa Park",   at: "2026-05-01", text: "+1 from Siemens. Their CRM admin escalated this." },
    ],
  },
  {
    id: "req-2",
    title: "Export health score history to a shared Sheet",
    problem: "VP CS wants every week's health scores to land in a Google Sheet automatically. Currently they screenshot the dashboard and re-enter manually. They've asked for this twice in QBRs.",
    account: "Tableau Software",
    arr: 360000,
    urgency: "medium",
    status: "planned",
    capturedFrom: "Email",
    capturedAt: "2026-04-22",
    capturedBy: "Paul Acker",
    customerContact: "Owen Patel · VP Engineering",
    upvoteCount: 7,
    comments: [
      { id: "c1", by: "Product · Lemay", at: "2026-04-25", text: "Targeting 26.Q3. Will need API throttling design first." },
    ],
  },
  {
    id: "req-3",
    title: "Webhook on health score change",
    problem: "Customer wants to trigger their internal Slack channel when a health score drops below 60. They have an event-driven architecture and don't want to poll our API.",
    account: "Snowflake Inc.",
    arr: 480000,
    urgency: "blocker",
    status: "in-progress",
    capturedFrom: "Slack",
    capturedAt: "2026-04-18",
    capturedBy: "Brad Allen",
    customerContact: "Tom Reilly · Platform Lead",
    upvoteCount: 11,
    comments: [
      { id: "c1", by: "Product · Egor",  at: "2026-04-19", text: "Approved for Q2. Engineering started spec." },
      { id: "c2", by: "Brad Allen",      at: "2026-04-22", text: "Customer informed; they're waiting on the spec doc." },
      { id: "c3", by: "Engineering",     at: "2026-04-29", text: "Spec posted in Linear · WB-318." },
    ],
  },
  {
    id: "req-4",
    title: "Native Outlook plugin",
    problem: "Customer's CSMs work in Outlook all day, not Gmail. They want the same email-to-account linking that the Gmail plugin offers.",
    account: "Akamai Technologies",
    arr: 540000,
    urgency: "high",
    status: "submitted",
    capturedFrom: "Manual",
    capturedAt: "2026-04-15",
    capturedBy: "Mike Torres",
    customerContact: "Christine Pettett · VP CS",
    upvoteCount: 9,
    comments: [],
  },
  {
    id: "req-5",
    title: "Deeper Salesforce field mapping",
    problem: "Our integration only writes to standard SF fields. Customer has 14 custom fields they want updated bidirectionally. Without it they keep dual-entering.",
    account: "GitLab Inc.",
    arr: 280000,
    urgency: "high",
    status: "planned",
    capturedFrom: "Call",
    capturedAt: "2026-04-12",
    capturedBy: "Sarah Chen",
    customerContact: "Molly Müller · CRM Admin",
    upvoteCount: 3,
    comments: [
      { id: "c1", by: "Product · Lemay", at: "2026-04-14", text: "Need raw mapping examples. Asked CSM to capture five real cases." },
      { id: "c2", by: "Sarah Chen",      at: "2026-04-20", text: "Sent five cases to product · two are quote-related." },
    ],
  },
  {
    id: "req-6",
    title: "QBR template export to PowerPoint",
    problem: "Customer's exec team consumes decks in PPT, not our deck builder. They want one-click export with their template applied.",
    account: "Tableau Software",
    arr: 360000,
    urgency: "medium",
    status: "shipped",
    capturedFrom: "Email",
    capturedAt: "2026-03-20",
    capturedBy: "Paul Acker",
    customerContact: "Jim Halpert · CFO",
    upvoteCount: 6,
    comments: [
      { id: "c1", by: "Engineering",   at: "2026-04-10", text: "Shipped in 26.4.0." },
      { id: "c2", by: "Paul Acker",    at: "2026-04-12", text: "Customer confirmed it works for their template." },
    ],
  },
];

const KEY = "alphard:feature-requests";

function loadRequests(): Request[] {
  if (typeof window === "undefined") return SEED;
  try { return JSON.parse(window.localStorage.getItem(KEY) ?? "null") ?? SEED; }
  catch { return SEED; }
}

// ---------------------------------------------------------------------------

const STATUS_FILTERS: ("all" | RequestStatus)[] = ["all", "submitted", "under-review", "planned", "in-progress", "shipped", "wont-do"];

export default function RequestsPage() {
  const toast = useToast();
  const [requests, setRequests] = useState<Request[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | RequestStatus>("all");
  const [openNew, setOpenNew] = useState(false);
  const [openDetail, setOpenDetail] = useState<string | null>(null);

  useEffect(() => { setRequests(loadRequests()); setHydrated(true); }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(KEY, JSON.stringify(requests)); } catch {}
  }, [requests, hydrated]);

  const filtered = useMemo(() => {
    const lc = search.trim().toLowerCase();
    return requests
      .filter((r) => statusFilter === "all" || r.status === statusFilter)
      .filter((r) => !lc || `${r.title} ${r.account} ${r.problem}`.toLowerCase().includes(lc));
  }, [requests, search, statusFilter]);

  const stats = useMemo(() => {
    const open = requests.filter((r) => r.status !== "shipped" && r.status !== "wont-do");
    const arrTotal = open.reduce((s, r) => s + r.arr, 0);
    const blockers = open.filter((r) => r.urgency === "blocker").length;
    const shipped30 = requests.filter((r) => r.status === "shipped").length;
    return { open: open.length, arr: arrTotal, blockers, shipped30 };
  }, [requests]);

  const addRequest = (r: Request) => {
    setRequests([r, ...requests]);
    toast({ tone: "success", title: "Request captured", body: `${r.title} · routed to product` });
  };
  const updateStatus = (id: string, status: RequestStatus) => {
    setRequests((rs) => rs.map((r) => r.id === id ? { ...r, status } : r));
    toast({ tone: "info", title: "Status updated", body: STATUS_META[status].label });
  };
  const addComment = (id: string, text: string) => {
    setRequests((rs) => rs.map((r) => r.id === id
      ? { ...r, comments: [...r.comments, { id: `c_${Date.now()}`, by: ME, at: new Date().toISOString().slice(0, 10), text }] }
      : r
    ));
  };

  const detail = requests.find((r) => r.id === openDetail) ?? null;

  return (
    <AppShell>
      <div className="mb-5 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="mono-label mb-2">Feature requests</div>
          <h1 className="display ink-gradient" style={{ fontSize: 36, lineHeight: 1.05 }}>
            What customers <span className="italic-emph">are asking for</span>
          </h1>
          <p className="text-[12.5px] text-muted mt-1.5 max-w-2xl">
            Capture the problem (not your solution). We weight by ARR + urgency, route to product, and surface status back to you so you can close the loop with the customer.
          </p>
        </div>
        <button onClick={() => setOpenNew(true)}
          className="text-[12.5px] font-semibold h-9 px-4 rounded-lg inline-flex items-center gap-1.5 shadow-[0_4px_12px_-4px_rgba(168,224,32,0.45)]"
          style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
          <Plus size={13} strokeWidth={2} /> Capture request
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KpiTile label="Open requests"   value={stats.open.toString()} />
        <KpiTile label="ARR weighted"    value={fmtMoney(stats.arr)} />
        <KpiTile label="Blockers"        value={stats.blockers.toString()} tone={stats.blockers > 0 ? "var(--neg)" : "var(--ink)"} />
        <KpiTile label="Shipped this Q"  value={stats.shipped30.toString()} tone="var(--pos)" />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {STATUS_FILTERS.map((s) => {
          const count = s === "all" ? requests.length : requests.filter((r) => r.status === s).length;
          const label = s === "all" ? "All" : STATUS_META[s].label;
          return (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`pill-nav-item inline-flex items-center gap-1.5 ${statusFilter === s ? "active" : ""}`}>
              {label}
              <span className="text-[10px] font-mono tnum px-1.5 rounded bg-bg-deep text-muted">{count}</span>
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-2 h-8 w-72 px-2.5 rounded-md border border-line bg-surface">
          <Search size={12} strokeWidth={1.6} className="text-muted-2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, account, problem…"
            className="flex-1 bg-transparent outline-none text-[12px] placeholder:text-muted-2" />
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map((r) => (
          <RequestCard key={r.id} request={r} onOpen={() => setOpenDetail(r.id)} />
        ))}
        {filtered.length === 0 && (
          <div className="lg:col-span-2 card p-8 text-center text-[12.5px] text-muted">No requests match this view.</div>
        )}
      </div>

      <NewRequestModal open={openNew} onClose={() => setOpenNew(false)} onSubmit={addRequest} />
      {detail && (
        <RequestDetailDrawer
          request={detail}
          onClose={() => setOpenDetail(null)}
          onStatusChange={(s) => updateStatus(detail.id, s)}
          onComment={(t) => addComment(detail.id, t)}
        />
      )}
    </AppShell>
  );
}

// ---------------------------------------------------------------------------

function KpiTile({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-3.5 py-3">
      <div className="mono-label">{label}</div>
      <div className="hero-num mt-1.5" style={{ fontSize: 22, color: tone ?? "var(--ink)" }}>{value}</div>
    </div>
  );
}

function RequestCard({ request, onOpen }: { request: Request; onOpen: () => void }) {
  const sm = STATUS_META[request.status];
  const um = URGENCY_META[request.urgency];
  return (
    <button onClick={onOpen} className="card card-lift p-4 text-left flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Logo name={request.account} size={20} rounded={5} />
        <span className="text-[12.5px] font-semibold text-ink">{request.account}</span>
        <span className="text-[10.5px] tnum text-muted-2">· {fmtMoney(request.arr)} ARR</span>
        <span className="ml-auto inline-flex items-center text-[9.5px] font-mono uppercase tracking-[0.06em] px-1.5 py-0.5 rounded"
          style={{ background: sm.bg, color: sm.ink }}>{sm.label}</span>
      </div>

      <div>
        <div className="text-[14px] font-semibold text-ink leading-snug">{request.title}</div>
        <p className="text-[12px] text-muted mt-1 leading-relaxed line-clamp-2">{request.problem}</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap text-[10.5px]">
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono uppercase tracking-[0.06em]"
          style={{ background: um.bg, color: um.ink }}>
          <AlertTriangle size={9} strokeWidth={2} /> {um.label}
        </span>
        <span className="text-muted-2">From {request.capturedFrom.toLowerCase()}</span>
        <span className="text-muted-2">·</span>
        <span className="text-muted-2">By {request.capturedBy}</span>
        {request.upvoteCount > 0 && (
          <>
            <span className="text-muted-2">·</span>
            <span className="text-ink-2 font-medium">{request.upvoteCount} other accounts asking</span>
          </>
        )}
        <span className="ml-auto inline-flex items-center gap-1 text-muted-2">
          <MessageSquare size={10} strokeWidth={1.6} /> {request.comments.length}
        </span>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------

function NewRequestModal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (r: Request) => void }) {
  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [account, setAccount] = useState(accounts[0]?.name ?? "");
  const [urgency, setUrgency] = useState<RequestUrgency>("medium");
  const [capturedFrom, setCapturedFrom] = useState<Request["capturedFrom"]>("Call");
  const [contact, setContact] = useState("");

  useEffect(() => {
    if (!open) {
      setTitle(""); setProblem(""); setUrgency("medium"); setCapturedFrom("Call"); setContact("");
    }
  }, [open]);

  const submit = () => {
    if (!title.trim() || !problem.trim()) return;
    const a = accounts.find((x) => x.name === account);
    const r: Request = {
      id: `req_${Date.now()}`,
      title: title.trim(),
      problem: problem.trim(),
      account: account || "—",
      arr: a?.arr ?? 0,
      urgency,
      status: "submitted",
      capturedFrom,
      capturedAt: new Date().toISOString().slice(0, 10),
      capturedBy: ME,
      customerContact: contact.trim() || undefined,
      upvoteCount: 0,
      comments: [],
    };
    onSubmit(r);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}
      title="Capture a customer request"
      description="Describe the problem in their words. Avoid prescribing a solution — product wants raw signal."
      footer={
        <>
          <ModalButton onClick={onClose}>Cancel</ModalButton>
          <ModalButton primary onClick={submit}>
            <span className="inline-flex items-center gap-1.5"><Send size={11} strokeWidth={1.8} /> Capture & route</span>
          </ModalButton>
        </>
      }>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Account">
          <SelectInput value={account} onChange={setAccount}
            options={accounts.map((a) => ({ value: a.name, label: a.name }))} />
        </FormField>
        <FormField label="Captured from">
          <SelectInput value={capturedFrom} onChange={(v) => setCapturedFrom(v)}
            options={[
              { value: "Call",   label: "Call" },
              { value: "Email",  label: "Email" },
              { value: "Slack",  label: "Slack" },
              { value: "Manual", label: "Manual" },
            ]} />
        </FormField>
        <FormField label="Urgency">
          <SelectInput value={urgency} onChange={(v) => setUrgency(v)}
            options={[
              { value: "low",     label: "Low" },
              { value: "medium",  label: "Medium" },
              { value: "high",    label: "High" },
              { value: "blocker", label: "Blocker" },
            ]} />
        </FormField>
        <FormField label="Customer contact">
          <TextInput value={contact} onChange={setContact} placeholder="Name · role" />
        </FormField>
      </div>
      <FormField label="One-line title">
        <TextInput value={title} onChange={setTitle} placeholder="What's the ask in one line?" />
      </FormField>
      <FormField label="The problem">
        <textarea value={problem} onChange={(e) => setProblem(e.target.value)} rows={4}
          placeholder="What's broken or missing? What does the customer do today? What's the workaround?"
          className="w-full text-[12.5px] rounded-md border border-line bg-surface px-2.5 py-2 outline-none resize-none placeholder:text-muted-2 leading-relaxed" />
      </FormField>
      <div className="text-[10.5px] text-muted-2 italic-emph">
        Tip: Don't write the spec. Write what the customer told you. Product wants the raw signal with commercial weight attached.
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------

function RequestDetailDrawer({ request, onClose, onStatusChange, onComment }:
  { request: Request; onClose: () => void; onStatusChange: (s: RequestStatus) => void; onComment: (t: string) => void }) {

  const toast = useToast();
  const sm = STATUS_META[request.status];
  const um = URGENCY_META[request.urgency];
  const [draft, setDraft] = useState("");
  const slug = slugify(request.account);

  return (
    <>
      <div className="fixed inset-0 bg-ink/30 z-[90] fade-in" onClick={onClose} />
      <aside className="fixed top-0 right-0 h-screen w-full md:w-[560px] bg-bg z-[95] drawer-anim border-l border-line flex flex-col">
        <div className="px-5 h-14 border-b border-line flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Logo name={request.account} size={22} rounded={5} />
            <div className="min-w-0">
              <div className="text-[12.5px] font-semibold text-ink truncate">{request.account}</div>
              <div className="text-[10.5px] text-muted-2">{fmtMoney(request.arr)} ARR · {request.upvoteCount} other accounts asking</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg grid place-items-center text-muted hover:text-ink hover:bg-surface-2">
            <X size={14} strokeWidth={1.6} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <h2 className="display ink-gradient" style={{ fontSize: 22, lineHeight: 1.15 }}>{request.title}</h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap text-[10.5px]">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full font-semibold tracking-[0.05em] uppercase"
                style={{ background: sm.bg, color: sm.ink, fontSize: 10 }}>{sm.label}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold tracking-[0.05em] uppercase"
                style={{ background: um.bg, color: um.ink, fontSize: 10 }}>
                <AlertTriangle size={9} strokeWidth={2} /> {um.label}
              </span>
              <span className="text-muted-2">Captured from {request.capturedFrom.toLowerCase()} · {request.capturedAt}</span>
            </div>
          </div>

          <div className="card-soft p-3.5">
            <div className="mono-label mb-1.5">The problem</div>
            <p className="text-[13px] text-ink-2 leading-relaxed">{request.problem}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Captured by"      value={request.capturedBy} />
            <Field label="Customer contact" value={request.customerContact ?? "—"} />
            <Field label="ARR"              value={fmtMoney(request.arr)} />
            <Field label="Upvotes"          value={`${request.upvoteCount} other accounts`} />
          </div>

          <div>
            <div className="mono-label mb-2">Set status</div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(Object.keys(STATUS_META) as RequestStatus[]).map((s) => {
                const m = STATUS_META[s];
                const active = s === request.status;
                return (
                  <button key={s} onClick={() => onStatusChange(s)}
                    className="text-[10.5px] font-semibold uppercase tracking-[0.06em] px-2 py-1 rounded-full transition-all"
                    style={{
                      background: m.bg,
                      color: m.ink,
                      outline: active ? `2px solid ${m.ink}` : "none",
                      outlineOffset: 1,
                    }}>
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mono-label mb-2">Discussion · {request.comments.length}</div>
            <div className="space-y-2">
              {request.comments.map((c) => (
                <div key={c.id} className="card-soft p-3">
                  <div className="flex items-center gap-2 text-[11px] mb-1">
                    <span className="font-semibold text-ink">{c.by}</span>
                    <span className="text-muted-2">{c.at}</span>
                  </div>
                  <p className="text-[12.5px] text-ink-2 leading-relaxed">{c.text}</p>
                </div>
              ))}
              {request.comments.length === 0 && (
                <div className="text-[12px] text-muted-2 italic-emph py-2">No comments yet.</div>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-2.5">
              <input value={draft} onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && draft.trim()) { onComment(draft.trim()); setDraft(""); } }}
                placeholder="Add a comment — Enter to post"
                className="flex-1 text-[12.5px] h-8 px-2.5 rounded-md bg-surface border border-line outline-none placeholder:text-muted-2" />
              <button onClick={() => { if (draft.trim()) { onComment(draft.trim()); setDraft(""); } }}
                className="text-[11.5px] font-semibold h-8 px-3 rounded-md inline-flex items-center gap-1"
                style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
                <Send size={11} strokeWidth={1.8} /> Post
              </button>
            </div>
          </div>

          {request.status === "shipped" && (
            <div className="card p-3.5" style={{ background: "var(--accent-soft)", borderColor: "var(--accent-deep)" }}>
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircle2 size={13} strokeWidth={1.8} style={{ color: "var(--accent-ink)" }} />
                <div className="text-[12.5px] font-semibold" style={{ color: "var(--accent-ink)" }}>Customer-facing closure</div>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: "var(--accent-ink)" }}>
                "We shipped this in 26.4. Here's how to tell {request.customerContact?.split(" · ")[0] || "your contact"}:"
              </p>
              <p className="text-[12px] mt-1.5 italic-emph leading-relaxed" style={{ color: "var(--accent-ink)" }}>
                Hey [contact], our product team shipped {request.title.toLowerCase()} — the feature you flagged on {request.capturedAt}.
                Here's how to find it: …
              </p>
              <button onClick={() => toast({ tone: "info", title: "Update sent", body: `Notification queued for ${request.customerContact?.split(" · ")[0] || "the customer"}.` })}
                className="text-[11px] font-semibold mt-2 h-7 px-2.5 rounded-md inline-flex items-center gap-1.5 bg-ink text-white">
                <Send size={11} strokeWidth={1.8} /> Send to {request.customerContact?.split(" · ")[0] || "customer"}
              </button>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-line shrink-0">
          <Link href={`/accounts/${slug}`}
            className="text-[11.5px] text-muted hover:text-ink inline-flex items-center gap-1">
            Open {request.account} <ArrowRight size={11} strokeWidth={1.8} />
          </Link>
        </div>
      </aside>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-surface-2 px-2.5 py-2">
      <div className="mono-label">{label}</div>
      <div className="text-[12px] text-ink-2 mt-0.5">{value}</div>
    </div>
  );
}
