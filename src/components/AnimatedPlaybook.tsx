"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Check, Sparkles, Zap, Crown, FileText, Target, AlertCircle, Calendar } from "lucide-react";

const ACCENT = "#266DF0";

type StepStatus = "pending" | "drafting" | "done";

type PlaybookStep = {
  id: string;
  Icon: any;
  tone: string;
  label: string;
  detail: string;
};

const STEPS: PlaybookStep[] = [
  { id: "s1", Icon: Crown,        tone: "#7C3AED",  label: "Reach Maya Chen — VP Engineering",        detail: "Send congrats note + reopen Revenue Intel proposal with bundled Networking line." },
  { id: "s2", Icon: Zap,          tone: "#0FC27B",  label: "Loop in Jason Park — Security review",    detail: "Schedule a 30-min review on data handling. Required to unblock procurement." },
  { id: "s3", Icon: FileText,     tone: ACCENT,     label: "Send tailored ROI deck",                  detail: "Comparable wins: Databricks ($135K, 28d), HashiCorp ($110K, 35d). Auto-personalized." },
  { id: "s4", Icon: Calendar,     tone: "#F5B900",  label: "Book QBR before May 22",                  detail: "Push the renewal narrative — currently 5 weeks since last business review." },
  { id: "s5", Icon: Target,       tone: "#FF5B59",  label: "Convert AI Copilot trial — May 28 cutoff", detail: "10 active seats. Send usage report + conversion proposal by next Tuesday." },
];

export function AnimatedPlaybook() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "scanning" | "writing" | "done">("idle");
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(
    STEPS.map(() => "pending")
  );
  const [progress, setProgress] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          run();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function run() {
    // Phase 1 — scanning bar fills
    setPhase("scanning");
    let p = 0;
    const scanTimer = setInterval(() => {
      p += 4;
      setProgress(p);
      if (p >= 100) {
        clearInterval(scanTimer);
        // Phase 2 — write steps one by one
        setPhase("writing");
        let i = 0;
        const stepTimer = setInterval(() => {
          // Set drafting on step i
          setStepStatuses((prev) => {
            const next = [...prev];
            next[i] = "drafting";
            return next;
          });
          // Then 600ms later mark done
          setTimeout(() => {
            setStepStatuses((prev) => {
              const next = [...prev];
              next[i] = "done";
              return next;
            });
          }, 600);
          i += 1;
          if (i >= STEPS.length) {
            clearInterval(stepTimer);
            setTimeout(() => setPhase("done"), 900);
          }
        }, 800);
      }
    }, 60);
  }

  return (
    <div ref={containerRef}
      className="relative rounded-[18px] overflow-hidden bg-white"
      style={{
        border: "1px solid rgba(15,18,24,0.08)",
        boxShadow:
          "0 1px 2px rgba(15,18,24,0.04), 0 22px 70px -16px rgba(15,18,24,0.18), 0 30px 90px -30px rgba(38,109,240,0.15)",
      }}>
      {/* Header */}
      <div className="px-5 py-3.5 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(15,18,24,0.06)" }}>
        <div className="flex items-center gap-2.5">
          <BookOpen size={14} strokeWidth={1.8} style={{ color: "rgba(15,18,24,0.55)" }} />
          <div>
            <div className="text-[12.5px] font-semibold" style={{ color: "#0F1218" }}>
              Cloudflare · Strategic Growth playbook
            </div>
            <div className="text-[10.5px]" style={{ color: "rgba(15,18,24,0.50)" }}>
              Auto-curated from 8 weeks of signals
            </div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em]"
          style={{ color: phase === "done" ? "#0FC27B" : ACCENT }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: phase === "done" ? "#0FC27B" : ACCENT }} />
          {phase === "done" ? "Ready" : phase === "writing" ? "Drafting" : "Curating"}
        </span>
      </div>

      {/* Scanning bar */}
      {phase !== "done" && (
        <div className="px-5 py-3"
          style={{ background: "rgba(38,109,240,0.04)", borderBottom: "1px solid rgba(15,18,24,0.06)" }}>
          <div className="flex items-center justify-between text-[10.5px] mb-1.5"
            style={{ color: "rgba(15,18,24,0.55)" }}>
            <span>
              {phase === "scanning" ? "Scanning signals · usage · CRM · calls · email" : "Tailoring plays for Cloudflare"}
            </span>
            <span className="font-mono tnum">{progress}%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden"
            style={{ background: "rgba(15,18,24,0.08)" }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${ACCENT}, #7C3AED)` }} />
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="px-5 py-4 space-y-2 min-h-[420px]">
        {STEPS.map((s, i) => {
          const status = stepStatuses[i];
          const isVisible = status !== "pending";
          if (!isVisible) {
            return (
              <div key={s.id} className="rounded-xl p-3 flex items-center gap-2.5 opacity-30"
                style={{ background: "rgba(15,18,24,0.02)", border: "1px dashed rgba(15,18,24,0.10)" }}>
                <div className="w-6 h-6 rounded-md grid place-items-center"
                  style={{ background: "rgba(15,18,24,0.06)" }}>
                  <span className="w-1 h-1 rounded-full" style={{ background: "rgba(15,18,24,0.30)" }} />
                </div>
                <span className="text-[11.5px]" style={{ color: "rgba(15,18,24,0.40)" }}>
                  Step {i + 1} pending…
                </span>
              </div>
            );
          }
          return (
            <div key={s.id}
              className="rounded-xl p-3 flex items-start gap-2.5 animate-step-in"
              style={{
                background: "white",
                border: `1px solid ${status === "done" ? s.tone + "30" : "rgba(15,18,24,0.08)"}`,
                boxShadow: status === "done" ? `0 4px 16px -8px ${s.tone}30` : undefined,
              }}>
              <div className="w-7 h-7 rounded-lg grid place-items-center shrink-0"
                style={{ background: `color-mix(in srgb, ${s.tone} 12%, white)` }}>
                {status === "drafting" ? (
                  <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"
                    style={{ color: s.tone }} />
                ) : (
                  <s.Icon size={13} strokeWidth={2.2} style={{ color: s.tone }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[12.5px] font-semibold" style={{ color: "#0F1218" }}>
                    {s.label}
                  </span>
                  {status === "done" && (
                    <Check size={10} strokeWidth={2.4} style={{ color: s.tone }} />
                  )}
                </div>
                <div className="text-[11px] leading-relaxed" style={{ color: "rgba(15,18,24,0.62)" }}>
                  {s.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 flex items-center justify-between"
        style={{ borderTop: "1px solid rgba(15,18,24,0.06)", background: "#FAFAFB" }}>
        <div className="flex items-center gap-2 text-[10.5px]"
          style={{ color: "rgba(15,18,24,0.55)" }}>
          <AlertCircle size={11} strokeWidth={2} />
          Updates as new signals fire on this account.
        </div>
        <button className="px-3 py-1.5 rounded-lg text-[11.5px] font-semibold text-white"
          style={{ background: phase === "done" ? "#0F1218" : "rgba(15,18,24,0.4)" }}>
          Run playbook
        </button>
      </div>

      <style jsx>{`
        @keyframes stepIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
        .animate-step-in { animation: stepIn 360ms ease-out; }
      `}</style>
    </div>
  );
}
