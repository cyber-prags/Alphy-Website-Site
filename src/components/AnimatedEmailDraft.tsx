"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Mail, Paperclip, Send, Check } from "lucide-react";

const ACCENT = "#266DF0";

const SUBJECT = "Quick follow-up on Revenue Intel — congrats on the promotion";

const PARAGRAPHS: string[] = [
  "Hi Maya,",
  "Congrats on the promotion to VP Engineering — saw the announcement this week.",
  "Wanted to revisit the Revenue Intel proposal we sent on May 1. Given your expanded scope spans Networking + Security now, I have a few thoughts on bundling Networking that could simplify procurement and unlock the cross-product use case Jason mentioned in your last review.",
  "Worth a 20-min sync next Tuesday at 11? Happy to bring numbers from Databricks and HashiCorp deals that are close comparables.",
  "— Walid",
];

// Context chips that fly into the agent panel before drafting
const CONTEXTS = [
  { label: "Champion: Maya Chen → VP Eng", tone: ACCENT },
  { label: "Proposal sent: May 1, 2026", tone: "#0F1218" },
  { label: "Comparables: Databricks, HashiCorp", tone: "#0FC27B" },
  { label: "Last call: Apr 18 (Jason flagged Networking)", tone: "#7C3AED" },
];

export function AnimatedEmailDraft() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "context" | "drafting" | "done">("idle");
  const [contextCount, setContextCount] = useState(0);
  const [paraCount, setParaCount] = useState(0);
  const [typedSubject, setTypedSubject] = useState("");
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
    // Phase 1 — context chips fly in
    setPhase("context");
    let ci = 0;
    const ctxTimer = setInterval(() => {
      ci += 1;
      setContextCount(ci);
      if (ci >= CONTEXTS.length) {
        clearInterval(ctxTimer);
        // Phase 2 — drafting
        setTimeout(() => {
          setPhase("drafting");
          // Subject typewriter
          let s = 0;
          const subTimer = setInterval(() => {
            s += 2;
            setTypedSubject(SUBJECT.slice(0, s));
            if (s >= SUBJECT.length) {
              clearInterval(subTimer);
              // Reveal paragraphs sequentially
              let pi = 0;
              const paraTimer = setInterval(() => {
                pi += 1;
                setParaCount(pi);
                if (pi >= PARAGRAPHS.length) {
                  clearInterval(paraTimer);
                  setTimeout(() => setPhase("done"), 800);
                }
              }, 600);
            }
          }, 22);
        }, 400);
      }
    }, 350);
  }

  return (
    <div ref={containerRef}
      className="relative rounded-[18px] overflow-hidden bg-white"
      style={{
        border: "1px solid rgba(15,18,24,0.08)",
        boxShadow:
          "0 1px 2px rgba(15,18,24,0.04), 0 22px 70px -16px rgba(15,18,24,0.18), 0 30px 90px -30px rgba(38,109,240,0.15)",
      }}>
      {/* Header — looks like an email composer */}
      <div className="px-5 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(15,18,24,0.06)", background: "#FAFAFB" }}>
        <div className="flex items-center gap-2">
          <Mail size={13} strokeWidth={2} style={{ color: "rgba(15,18,24,0.55)" }} />
          <span className="text-[12px] font-semibold" style={{ color: "#0F1218" }}>New message</span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em]"
          style={{ color: phase === "done" ? "#0FC27B" : ACCENT }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: phase === "done" ? "#0FC27B" : ACCENT }} />
          {phase === "drafting" ? "Drafting…" : phase === "done" ? "Ready to send" : "Gathering context"}
        </span>
      </div>

      {/* Top: To/From/Subject */}
      <div className="px-5 py-3 space-y-1.5"
        style={{ borderBottom: "1px solid rgba(15,18,24,0.06)" }}>
        <div className="flex items-center gap-2 text-[11.5px]">
          <span className="w-10 shrink-0" style={{ color: "rgba(15,18,24,0.48)" }}>To</span>
          <span style={{ color: "#0F1218" }}>maya.chen@cloudflare.com</span>
        </div>
        <div className="flex items-center gap-2 text-[11.5px]">
          <span className="w-10 shrink-0" style={{ color: "rgba(15,18,24,0.48)" }}>Subject</span>
          <span className="font-medium" style={{ color: "#0F1218" }}>
            {typedSubject}
            {phase === "drafting" && typedSubject.length < SUBJECT.length && (
              <span className="inline-block w-[2px] h-[12px] ml-0.5 align-middle animate-pulse"
                style={{ background: ACCENT }} />
            )}
          </span>
        </div>
      </div>

      {/* Context chips */}
      <div className="px-5 py-3"
        style={{ background: "linear-gradient(180deg, rgba(38,109,240,0.04) 0%, transparent 100%)", borderBottom: "1px solid rgba(15,18,24,0.06)" }}>
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-2"
          style={{ color: "rgba(15,18,24,0.50)" }}>
          Context attached by Alphard
        </div>
        <div className="flex flex-wrap gap-1.5 min-h-[26px]">
          {CONTEXTS.slice(0, contextCount).map((c, i) => (
            <span key={i}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10.5px] font-medium animate-chip"
              style={{
                background: "white",
                border: `1px solid ${c.tone}40`,
                color: c.tone,
              }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.tone }} />
              {c.label}
            </span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-5 min-h-[230px]">
        {PARAGRAPHS.slice(0, paraCount).map((p, i) => (
          <p key={i}
            className="text-[13px] leading-relaxed mb-3 animate-fade-up"
            style={{ color: "#0F1218" }}>
            {p}
          </p>
        ))}
        {phase === "context" && paraCount === 0 && (
          <div className="flex items-center gap-2 text-[11.5px] mt-2"
            style={{ color: "rgba(15,18,24,0.48)" }}>
            <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Reading 47 emails, 12 calls, last 6 product events…
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 flex items-center justify-between"
        style={{ borderTop: "1px solid rgba(15,18,24,0.06)", background: "#FAFAFB" }}>
        <div className="flex items-center gap-2">
          <button className="text-[11.5px] inline-flex items-center gap-1.5"
            style={{ color: "rgba(15,18,24,0.55)" }}>
            <Paperclip size={11} strokeWidth={2} /> 1 ROI calc
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg text-[11.5px] font-medium bg-white"
            style={{ border: "1px solid rgba(15,18,24,0.12)", color: "#0F1218" }}>
            Edit
          </button>
          <button className="px-3.5 py-1.5 rounded-lg text-[11.5px] font-semibold inline-flex items-center gap-1.5 text-white transition-all"
            style={{ background: phase === "done" ? "#0FC27B" : ACCENT }}>
            {phase === "done" ? <><Check size={11} strokeWidth={2.4} /> Sent</> : <><Send size={11} strokeWidth={2.4} /> Send</>}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes chip { from { opacity: 0; transform: translateY(-4px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-chip { animation: chip 320ms ease-out; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fadeUp 360ms ease-out; }
      `}</style>
    </div>
  );
}
