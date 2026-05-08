"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ArrowRight, ArrowLeft, X, Check } from "lucide-react";
import { AlphyMark } from "./AlphyMark";
import { useUser } from "./UserContext";

// ─────────────────────────────────────────────────────────────────────
// AM Guided Tour — Cloudflare / Maya Chen scenario
//
// Narrative is in FIRST PERSON: the user is "me" (the AM). Every step
// reads like a thought running through my head as I work the deal.
//
// The tour drives the app: it navigates between routes at the right
// moment, and runs background actions (programmatic clicks / events)
// so the *right screen is on the right step*. The user only ever has
// to click "Next" or the highlighted target — everything else is
// orchestrated.
//
// Mechanics:
//   - Each Step can declare a `route` (the page that must be active).
//   - On entering a step, the tour pushes that route if needed, waits
//     for the path to land, then runs the optional `onEnter` action
//     (e.g. open a drawer, open Alphy, scroll an element into view).
//   - Targets are matched via querySelector and re-measured on every
//     scroll / resize / step change.
//   - `advanceOnClick` lets the highlighted element drive forward
//     motion when the user actually clicks it (so the tour feels
//     interactive, not narrated-over).
// ─────────────────────────────────────────────────────────────────────

type TourCtx = {
  firstName: string;
};

type Step = {
  id: string;
  /** Route that must be active when this step shows. */
  route?: string;
  /** CSS selector for the target element (or null = centred coach card) */
  target: string | null;
  title: string;
  body: string;
  /** Where to place the coach card relative to the target */
  placement?: "top" | "bottom" | "left" | "right" | "center";
  /** CTA label on the coach card's primary button */
  cta?: string;
  /** If true, the step advances when the user clicks the target. */
  advanceOnClick?: boolean;
  /** Background action to run AFTER the route is settled. */
  onEnter?: () => void;
  /** Cleanup to run when leaving this step. */
  onLeave?: () => void;
  /** Optional override of the default coach-card width (px). */
  cardWidth?: number;
  /** Optional rich content rendered INSIDE the coach card (replaces body). */
  richBody?: (ctx: TourCtx) => React.ReactNode;
};

const STORAGE_KEY = "alphard:am-tour:status";
// Cross-route persistence: AppShell remounts on every navigation, so the
// tour's open / step state must live in sessionStorage to survive route
// changes that the tour itself triggers.
const SESSION_ACTIVE_KEY = "alphard:am-tour:active";
const SESSION_STEP_KEY = "alphard:am-tour:step";
const ACCOUNT_SLUG = "cloudflare-inc";

// ── Helper: simulate clicking a tour-anchored element so a downstream
//    drawer / modal / panel actually opens.
function clickTarget(selector: string) {
  if (typeof document === "undefined") return;
  const el = document.querySelector(selector) as HTMLElement | null;
  if (el) el.click();
}

// ── Helper: scroll a target into the middle of the viewport.
function scrollTargetIntoView(selector: string) {
  if (typeof document === "undefined") return;
  const el = document.querySelector(selector) as HTMLElement | null;
  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
}

// ── Helper: dispatch a window event the rest of the app can listen for.
function fire(eventName: string, detail?: unknown) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
}

// Personalisation tokens — `{firstName}` etc — get substituted at render time.
const TPL = (s: string, ctx: TourCtx) =>
  s.replace(/\{firstName\}/g, ctx.firstName)
   .replace(/\{day\}/g, dayLabel())
   .replace(/\{time\}/g, timeLabel());

function dayLabel() {
  const d = new Date();
  return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()];
}
function timeLabel() {
  const d = new Date();
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${m}${ampm}`;
}

const STEPS: Step[] = [
  // 0 ── Set the scene
  {
    id: "welcome",
    route: "/home",
    target: null,
    placement: "center",
    title: "{day}, {time} — morning, {firstName}.",
    body:
      "Yesterday Maya Chen got promoted to VP Engineering at Cloudflare. She's been your champion for two years. Her budget now spans Networking + Security, and procurement is talking single-vendor consolidation in the next 12 days. Cloudflare's at $720K ARR with NRR 124% — this is the biggest expansion lever in your book.\n\nLet's walk through exactly how Alphard turns that signal into closed expansion — without leaving this tab.",
    cta: "Open my queue",
  },

  // 1 ── Spot the play on the home queue
  {
    id: "spot-the-play",
    route: "/home",
    target: "[data-tour='featured-play']",
    placement: "right",
    title: "There it is — top of your queue, {firstName}.",
    body:
      "Alphard pushed Cloudflare to #1 because it caught Maya's title change on LinkedIn 14 hours ago. The reason chips tell you what changed: champion promoted, 38% week-over-week usage spike on the Networking SKU, renewal in 178 days.\n\nThis is exactly the deal you should be working first today.",
    cta: "Read the evidence",
    onEnter: () => scrollTargetIntoView("[data-tour='featured-play']"),
  },

  // 2 ── Open the evidence drawer (real click, drawer opens behind the tour)
  {
    id: "why-now",
    route: "/home",
    target: "[data-tour='featured-play'] [data-tour='why-now-btn']",
    placement: "right",
    title: "Before you write anything — see the receipts.",
    body:
      "{firstName}, you don't trust a recommendation you can't audit. Click \"Why now\" and Alphy pulls the evidence chain: the LinkedIn promotion, the email where Maya hinted at consolidation, and the product activity spike.",
    cta: "Click \"Why now\"",
    advanceOnClick: true,
  },

  // 3 ── Read evidence (the inline "Why now" panel is now expanded inside
  //       the featured play card — anchor the highlight on the card itself
  //       so the user can see the panel that just appeared).
  {
    id: "read-evidence",
    route: "/home",
    target: "[data-tour='featured-play']",
    placement: "right",
    title: "Receipts. Now you walk in with proof.",
    body:
      "Look at the panel that just expanded: LinkedIn promotion 14 hours ago, a 38% week-over-week spike on the Networking SKU, and the email where Maya wrote \"we're looking at consolidating spend.\"\n\nThat's not a hunch — that's a plan {firstName} can walk into with confidence.",
    cta: "Draft the message",
    onEnter: () => scrollTargetIntoView("[data-tour='featured-play']"),
  },

  // 4 ── Click Draft follow-up — opens QuickActionModal in the page
  {
    id: "draft",
    route: "/home",
    target: "[data-tour='featured-play'] [data-tour='draft-btn']",
    placement: "right",
    title: "One click — Alphy drafts in your voice.",
    body:
      "No generic templates, {firstName}. Alphy has read every email Maya has sent you (terse, technical, no fluff) and matches your usual response register. Watch what lands.",
    cta: "Click \"Draft follow-up\"",
    advanceOnClick: true,
  },

  // 5 ── Review modal — the execution drawer just slid in from the right
  //       with the drafted email. Anchor on the drawer itself.
  {
    id: "approve",
    route: "/home",
    target: "[data-tour='exec-drawer']",
    placement: "left",
    title: "Read it. Tweak the second paragraph. Approve.",
    body:
      "Alphy opened with congrats — short, specific to her new scope. Paragraph two proposes bundling Networking + Security into a single contract that matches her new title. {firstName}, you tighten one sentence, then hit Approve & send.\n\nThe email goes out. The activity logs to Salesforce. You never left this screen.",
    cta: "Email sent — what's next",
    onLeave: () => {
      // Close the execution drawer before we navigate to the account page
      const closeBtn = document.querySelector("[data-tour='exec-drawer'] [aria-label='Close']") as HTMLElement | null;
      if (closeBtn) closeBtn.click();
      else fire("alphard:close-drawer");
    },
  },

  // 6 ── Navigate to Cloudflare account workspace
  {
    id: "open-account",
    route: `/accounts/${ACCOUNT_SLUG}`,
    target: null,
    placement: "center",
    title: "Email's out. Now plan the next two quarters.",
    body:
      "Procurement wants a single-vendor decision in 12 days, {firstName}. You've got an email in flight — now you need a real plan to send Maya tomorrow. Let's jump into Cloudflare's account workspace.",
    cta: "Open the plan",
  },

  // 7 ── Plan tab on the account page
  {
    id: "deals-tab",
    route: `/accounts/${ACCOUNT_SLUG}`,
    target: "[data-tour='account-deals-tab']",
    placement: "bottom",
    title: "Your expansion deal — drilled down.",
    body:
      "The Deals tab pins the Cloudflare expansion at $125K. You'll see touchpoints, completed and upcoming tasks, and the highest-ROI moves Alphard recommends. {firstName}, this becomes your single source of truth for the next 12 days.",
    cta: "Open the deal",
    advanceOnClick: true,
    onEnter: () => scrollTargetIntoView("[data-tour='account-deals-tab']"),
  },

  // 8 ── Open Alphy + have it build the business case
  {
    id: "build-case",
    route: `/accounts/${ACCOUNT_SLUG}`,
    target: null,
    placement: "center",
    title: "Now Alphy builds the business case.",
    body:
      "{firstName}, watch — ⌘J opens Alphy from anywhere. The panel slides in and I'm asking it to build a one-page expansion case using comparable wins, ROI math, and an exec cover note for Maya.",
    cta: "Generate the case",
    onEnter: () => {
      // Open Alphy AND inject a prompt + result so the demo lands.
      fire("alphard:open-alphy");
      // Give Alphy a moment to mount, then auto-run the case prompt
      setTimeout(() => {
        fire("alphard:alphy-run", { prompt: "Build expansion business case for Cloudflare", artifact: "expansion-case" });
      }, 600);
    },
  },

  // 9 ── Alphy now has the generated case in the panel — point to it
  {
    id: "case-result",
    route: `/accounts/${ACCOUNT_SLUG}`,
    target: null,
    placement: "center",
    title: "Done — Alphy dropped the case in your assistant.",
    body:
      "Look right, {firstName}. The Cloudflare expansion case landed in Alphy as a structured report — Executive Summary, ROI Math, Comparable Win, Risks, Next Steps — with metrics tiles you can attach to Maya's reply in one click.\n\nIt's saved to her workspace and queued on the email draft.",
    cta: "Looks good — what's next",
  },

  // 10 ── Wrap up
  {
    id: "finished",
    route: `/accounts/${ACCOUNT_SLUG}`,
    target: null,
    placement: "center",
    title: "Stand-up's at 9 — you're done by {time}.",
    body:
      "In twelve minutes, {firstName}, you went from a champion-promotion signal at the top of your queue → a personalised email in Maya's inbox → the deal drilled into a single workspace → a business case ready to attach to her reply.\n\nThat's the loop: spot · explain · draft · approve · plan. Every signal you see in Alphard for the rest of the week works exactly the same way.",
    cta: "Finish onboarding",
  },
];

// ─────────────────────────────────────────────────────────────────────
// Business case artifact — rendered inline as the rich body of step 9
// ─────────────────────────────────────────────────────────────────────
function BusinessCaseCard({ firstName }: { firstName: string }) {
  void firstName;
  return (
    <div className="space-y-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-2">
        Generated · Cloudflare expansion · 1-page
      </div>
      <div className="rounded-xl border border-line bg-bg-deep p-4 space-y-3 max-h-[420px] overflow-y-auto"
        style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)" }}>
        <Section label="Executive Summary">
          <p>Cloudflare is at $720K ARR, 124% NRR, renewal in 178 days. Champion Maya Chen was just promoted to VP Engineering — her budget now spans Networking + Security. Bundling the two SKUs into a single 12-month contract maps directly to her new scope and unlocks a $215K expansion before procurement consolidates with another vendor.</p>
        </Section>
        <Section label="ROI Math">
          <ul className="space-y-1.5 list-disc list-inside">
            <li>Networking SKU usage up <b className="text-ink">+38% WoW</b> — under-provisioned at current tier.</li>
            <li>Combined Networking + Security bundle: <b className="text-ink">$215K ARR</b> incremental, 14-month payback.</li>
            <li>Avoided cost of single-vendor consolidation with a competitor: <b className="text-ink">$420K</b> over 3 years.</li>
            <li>Time-to-value for Security module: <b className="text-ink">11 days</b> (existing Networking integration).</li>
          </ul>
        </Section>
        <Section label="Comparable Win — Datadog">
          <p>Datadog landed the same combined-tier bundle at comparable scale (3,400 employees, $720K starting ARR) in Q4 2025. Result: <b className="text-ink">3.2× pipeline visibility</b> and the largest single-quarter NRR contribution that year. Champion was also a newly promoted VP Eng — the pattern is a near-mirror.</p>
        </Section>
        <Section label="Risks">
          <ul className="space-y-1.5 list-disc list-inside">
            <li>InfoSec review on Security module — schedule with Owen Mitchell (Head of InfoSec) inside 48h.</li>
            <li>Procurement (Priya Sharma) is silent for 11 days — multi-thread before they engage a competitor.</li>
            <li>VP Sales (Rebecca Chu) registered as a detractor — neutralise with a 15-min direct convo.</li>
          </ul>
        </Section>
        <Section label="Recommended Next Steps">
          <ol className="space-y-1.5 list-decimal list-inside">
            <li>Reply to Maya with this case attached — today.</li>
            <li>Schedule a 30-min combined-tier walkthrough with Maya + Owen Mitchell — by Friday.</li>
            <li>Open a parallel thread with Naomi Walker (CFO) on the avoided-cost story — Mon.</li>
            <li>Pull the Datadog reference call onto the calendar before procurement engages — within 7 days.</li>
          </ol>
        </Section>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-2">
          <Check size={11} strokeWidth={2.4} className="text-pos" /> Saved to Cloudflare workspace
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-2">
          <Check size={11} strokeWidth={2.4} className="text-pos" /> Attached to email draft
        </span>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 mb-1">{label}</div>
      <div className="text-[12.5px] text-ink-2 leading-relaxed">{children}</div>
    </div>
  );
}

export function AmGuidedTour({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // Hydrate stepIdx from sessionStorage so a route navigation triggered by
  // the tour itself doesn't reset progress when AppShell remounts.
  const [stepIdx, setStepIdx] = useState(() => {
    if (typeof window === "undefined") return 0;
    const raw = window.sessionStorage.getItem(SESSION_STEP_KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n >= 0 && n < STEPS.length ? n : 0;
  });
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [tick, setTick] = useState(0);
  const [routeReady, setRouteReady] = useState(true);
  const prevStepRef = useRef<number>(-1);

  // Mirror open + stepIdx into sessionStorage so the next AppShell mount
  // (after a route change inside the tour) can rehydrate seamlessly.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (open) {
      window.sessionStorage.setItem(SESSION_ACTIVE_KEY, "1");
      window.sessionStorage.setItem(SESSION_STEP_KEY, String(stepIdx));
    }
  }, [open, stepIdx]);

  const step = STEPS[stepIdx];
  const isFirst = stepIdx === 0;
  const isLast = stepIdx === STEPS.length - 1;

  // ── Route orchestration: when a step demands a different route,
  //    push it. Mark routeReady false until pathname matches; then
  //    fire the onEnter background action.
  useEffect(() => {
    if (!open) return;

    // Run the previous step's onLeave (if any)
    const prev = prevStepRef.current;
    if (prev >= 0 && prev !== stepIdx) {
      try { STEPS[prev]?.onLeave?.(); } catch {}
    }
    prevStepRef.current = stepIdx;

    const targetRoute = step.route;
    if (targetRoute && pathname !== targetRoute) {
      setRouteReady(false);
      router.push(targetRoute);
    } else {
      setRouteReady(true);
      // Give the page a beat to render before triggering background actions
      const t = setTimeout(() => {
        try { step.onEnter?.(); } catch {}
        setTick((x) => x + 1);
      }, 220);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx, open]);

  // When the pathname catches up to the step's required route,
  // mark the step ready and run its onEnter action.
  useEffect(() => {
    if (!open) return;
    if (!step.route) return;
    if (pathname !== step.route) return;
    if (routeReady) return;
    setRouteReady(true);
    const t = setTimeout(() => {
      try { step.onEnter?.(); } catch {}
      setTick((x) => x + 1);
    }, 320);
    return () => clearTimeout(t);
  }, [pathname, step.route, routeReady, open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-measure target rect on step change / scroll / resize
  useEffect(() => {
    if (!open || !step?.target) {
      setRect(null);
      return;
    }
    const measure = () => {
      const el = document.querySelector(step.target!) as HTMLElement | null;
      if (el) {
        const r = el.getBoundingClientRect();
        setRect(r);
      } else {
        setRect(null);
      }
    };
    measure();
    const interval = setInterval(measure, 250);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, step?.target, tick, routeReady]);

  // Force a re-measure when stepIdx changes
  useEffect(() => { setTick((t) => t + 1); }, [stepIdx]);

  // Capture-phase click on advanceOnClick targets advances the tour
  useEffect(() => {
    if (!open || !step.advanceOnClick || !step.target) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const matched = target.closest(step.target!);
      if (matched) {
        setTimeout(() => setStepIdx((i) => Math.min(STEPS.length - 1, i + 1)), 220);
      }
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [open, step.advanceOnClick, step.target]);

  // Esc / Enter shortcuts
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      if (e.key === "Enter" && !step.advanceOnClick) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, stepIdx]);

  const next = useCallback(() => {
    // For advanceOnClick steps, the CTA should perform the same action as
    // clicking the highlighted target — synthesize a real click on the
    // target. The capture-phase listener will then advance the tour after
    // the click has settled and the drawer / panel has had a frame to open.
    if (step.advanceOnClick && step.target) {
      const el = document.querySelector(step.target) as HTMLElement | null;
      if (el) {
        el.click();
        return; // capture-phase listener will advance us
      }
      // Fallback if the target somehow isn't on the page — just advance
    }
    if (isLast) finish();
    else setStepIdx((i) => i + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLast, step.advanceOnClick, step.target]);

  const back = useCallback(() => setStepIdx((i) => Math.max(0, i - 1)), []);

  const finish = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "finished");
      window.sessionStorage.removeItem(SESSION_ACTIVE_KEY);
      window.sessionStorage.removeItem(SESSION_STEP_KEY);
    } catch {}
    onClose();
  }, [onClose]);

  const skip = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "skipped");
      window.sessionStorage.removeItem(SESSION_ACTIVE_KEY);
      window.sessionStorage.removeItem(SESSION_STEP_KEY);
    } catch {}
    onClose();
  }, [onClose]);

  if (!open) return null;

  // ── Cutout rect computation
  const PAD = 8;
  const cutoutStyle = rect && routeReady
    ? {
        left: rect.left - PAD,
        top: rect.top - PAD,
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
      }
    : null;

  const placement = step.placement ?? "right";
  const tourCtx: TourCtx = { firstName: user.firstName };
  const coachCard = (
    <CoachCard
      step={step}
      stepIdx={stepIdx}
      total={STEPS.length}
      rect={cutoutStyle ? rect : null}
      placement={placement}
      onNext={next}
      onBack={back}
      onSkip={skip}
      isFirst={isFirst}
      isLast={isLast}
      ctx={tourCtx}
      pending={!routeReady}
    />
  );

  return (
    <div className="fixed inset-0 z-[200] tour-fade" style={{ pointerEvents: "none" }}>
      {cutoutStyle ? (
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "auto" }}>
          <defs>
            <mask id="am-tour-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={cutoutStyle.left}
                y={cutoutStyle.top}
                width={cutoutStyle.width}
                height={cutoutStyle.height}
                rx={12}
                fill="black"
              />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(15,18,24,0.55)" mask="url(#am-tour-mask)" />
          <rect
            x={cutoutStyle.left}
            y={cutoutStyle.top}
            width={cutoutStyle.width}
            height={cutoutStyle.height}
            rx={12}
            fill="none"
            stroke="rgba(38,109,240,0.65)"
            strokeWidth="2"
            className="tour-pulse"
          />
        </svg>
      ) : (
        <div className="absolute inset-0"
          style={{ background: "rgba(15,18,24,0.55)", pointerEvents: "auto" }} />
      )}

      {coachCard}

      <style jsx>{`
        @keyframes tourFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .tour-fade { animation: tourFade 220ms ease-out; }
        @keyframes tourPulse {
          0%, 100% { stroke-opacity: 0.6; stroke-width: 2; }
          50%      { stroke-opacity: 1.0; stroke-width: 3; }
        }
        .tour-pulse { animation: tourPulse 1800ms ease-in-out infinite; }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Coach card
// ─────────────────────────────────────────────────────────────────────

function CoachCard({
  step, stepIdx, total, rect, placement,
  onNext, onBack, onSkip, isFirst, isLast, pending, ctx,
}: {
  step: Step;
  stepIdx: number;
  total: number;
  rect: DOMRect | null;
  placement: "top" | "bottom" | "left" | "right" | "center";
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  isFirst: boolean;
  isLast: boolean;
  pending: boolean;
  ctx: TourCtx;
}) {
  const W = step.cardWidth ?? 380;
  const GAP = 16;
  const style: React.CSSProperties = { width: W };

  if (!rect || placement === "center") {
    style.left = "50%";
    style.top = "50%";
    style.transform = "translate(-50%, -50%)";
  } else if (placement === "right") {
    style.left = Math.min(window.innerWidth - W - 24, rect.right + GAP);
    style.top = Math.max(24, Math.min(window.innerHeight - 320, rect.top));
  } else if (placement === "left") {
    style.left = Math.max(24, rect.left - W - GAP);
    style.top = Math.max(24, Math.min(window.innerHeight - 320, rect.top));
  } else if (placement === "bottom") {
    style.left = Math.max(24, Math.min(window.innerWidth - W - 24, rect.left));
    style.top = rect.bottom + GAP;
  } else if (placement === "top") {
    style.left = Math.max(24, Math.min(window.innerWidth - W - 24, rect.left));
    style.top = Math.max(24, rect.top - 320);
  }

  return (
    <div
      className="absolute rounded-2xl p-5 coach-pop"
      style={{
        ...style,
        background: "var(--bg)",
        border: "1px solid var(--line)",
        boxShadow: "0 24px 60px -16px rgba(15,18,24,0.30), 0 4px 12px -4px rgba(15,18,24,0.10)",
        pointerEvents: "auto",
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg grid place-items-center"
            style={{
              background: "linear-gradient(135deg, rgba(38,109,240,0.18), rgba(124,58,237,0.10))",
              border: "1px solid rgba(38,109,240,0.20)",
            }}>
            <AlphyMark size={13} color="var(--accent)" strokeWidth={1.6} />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
            Onboarding · {stepIdx + 1} of {total}
          </span>
        </div>
        <button onClick={onSkip}
          className="text-[10.5px] font-medium text-muted hover:text-ink transition-colors inline-flex items-center gap-1">
          Skip
          <X size={11} strokeWidth={1.8} />
        </button>
      </div>

      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className="h-1 rounded-full transition-all"
            style={{
              width: i === stepIdx ? 20 : 6,
              background: i <= stepIdx ? "var(--accent)" : "var(--line)",
            }} />
        ))}
      </div>

      <h3 className="text-[18px] font-semibold text-ink mb-2 leading-tight"
        style={{ letterSpacing: "-0.018em" }}>
        {TPL(step.title, ctx)}
      </h3>
      {step.richBody ? (
        <div className="mb-5">{step.richBody(ctx)}</div>
      ) : (
        <p className="text-[13px] text-ink-2 leading-[1.55] whitespace-pre-line mb-5">
          {TPL(step.body, ctx)}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <button onClick={onBack} disabled={isFirst}
          className="inline-flex items-center gap-1 text-[11.5px] font-medium px-2.5 py-1.5 rounded-lg transition-colors hover:bg-bg-deep disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ color: "var(--ink-2)" }}>
          <ArrowLeft size={11} strokeWidth={2} />
          Back
        </button>
        <div className="flex items-center gap-2">
          {step.advanceOnClick && (
            <span className="text-[10.5px] text-muted-2 italic">
              or click the highlighted item
            </span>
          )}
          {pending && (
            <span className="text-[10.5px] text-muted-2 italic">
              loading screen…
            </span>
          )}
          <button onClick={onNext}
            disabled={pending}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-4 py-2 rounded-lg text-white transition-transform hover:scale-[1.03] disabled:opacity-50"
            style={{
              background: isLast ? "var(--pos)" : "var(--ink)",
              boxShadow: "0 4px 12px -4px rgba(15,18,24,0.30)",
            }}>
            {isLast ? <Check size={12} strokeWidth={2.4} /> : null}
            {step.cta ?? (isLast ? "Finish" : "Next")}
            {!isLast && <ArrowRight size={11} strokeWidth={2.2} />}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes coachPop {
          from { opacity: 0; transform: ${(!rect || placement === "center") ? "translate(-50%, calc(-50% + 8px))" : "translateY(8px)"}; }
          to { opacity: 1; transform: ${(!rect || placement === "center") ? "translate(-50%, -50%)" : "translateY(0)"}; }
        }
        .coach-pop { animation: coachPop 280ms cubic-bezier(0.22, 1, 0.36, 1); }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Hook + reset helper
// ─────────────────────────────────────────────────────────────────────
export function useAmTourEligible() {
  const [eligible, setEligible] = useState(false);
  useEffect(() => {
    try {
      const status = window.localStorage.getItem(STORAGE_KEY);
      setEligible(status !== "finished" && status !== "skipped");
    } catch {
      setEligible(false);
    }
  }, []);
  return [eligible, setEligible] as const;
}

export function resetAmTour() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(SESSION_ACTIVE_KEY);
    window.sessionStorage.removeItem(SESSION_STEP_KEY);
  } catch {}
}

// Read-on-mount hook: was the tour mid-flight on the previous AppShell mount?
// AppShell calls this on every mount so the tour resumes across the route
// changes the tour itself triggers.
export function readAmTourActive(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(SESSION_ACTIVE_KEY) === "1";
  } catch {
    return false;
  }
}
