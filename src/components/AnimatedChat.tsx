"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, ArrowUp, Crown, Zap, Calendar, TrendingUp } from "lucide-react";

const ACCENT = "#266DF0";

type ChatMessage = {
  id: string;
  role: "user" | "agent";
  text: string;
  /** typewriter chunks rendered with structured visuals */
  blocks?: Block[];
  /** ms typing delay before message appears */
  delay: number;
};

type Block =
  | { kind: "para"; text: string }
  | { kind: "list"; items: { Icon: any; tone: string; label: string; detail: string }[] }
  | { kind: "footnote"; text: string };

const SCRIPT: ChatMessage[] = [
  {
    id: "u1",
    role: "user",
    text: "What changed at Cloudflare this week?",
    delay: 800,
  },
  {
    id: "a1",
    role: "agent",
    text: "",
    delay: 1400,
    blocks: [
      {
        kind: "para",
        text: "Three signals fired on Cloudflare this week. Two are openings, one is a deadline.",
      },
      {
        kind: "list",
        items: [
          {
            Icon: Crown, tone: "var(--accent-deep)",
            label: "Maya Chen → VP Engineering",
            detail: "Promotion confirmed Mon. Budget scope now spans Networking + Security.",
          },
          {
            Icon: Zap, tone: "#0FC27B",
            label: "Hit 92% of Networking plan limits",
            detail: "Third time this quarter. Strong upgrade signal.",
          },
          {
            Icon: Calendar, tone: "#F5B900",
            label: "AI Copilot trial ends May 28",
            detail: "10 active seats, 60% weekly engagement. 22 days to convert.",
          },
        ],
      },
      {
        kind: "footnote",
        text: "Suggested next move: re-open the Revenue Intel proposal with bundled Networking line. Drafted reply ready.",
      },
    ],
  },
];

export function AnimatedChat() {
  const [shown, setShown] = useState<number>(0);
  const [agentTyping, setAgentTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  // Start animation when scrolled into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          schedule();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function schedule() {
    let idx = 0;
    const tick = () => {
      const msg = SCRIPT[idx];
      if (!msg) return;
      if (msg.role === "agent") {
        setAgentTyping(true);
        setTimeout(() => {
          setAgentTyping(false);
          setShown((s) => s + 1);
          idx += 1;
          if (idx < SCRIPT.length) setTimeout(tick, SCRIPT[idx].delay);
        }, 1200);
      } else {
        setShown((s) => s + 1);
        idx += 1;
        if (idx < SCRIPT.length) setTimeout(tick, SCRIPT[idx].delay);
      }
    };
    setTimeout(tick, SCRIPT[0].delay);
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
          <div className="relative">
            <div className="w-7 h-7 rounded-lg grid place-items-center"
              style={{ background: "linear-gradient(135deg, #266DF0 0%, #7C3AED 100%)" }}>
              <Sparkles size={13} strokeWidth={2.2} className="text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
              style={{ background: "#0FC27B" }} />
          </div>
          <div>
            <div className="text-[12.5px] font-semibold" style={{ color: "#0F1218" }}>Revenue Agent</div>
            <div className="text-[10px]" style={{ color: "rgba(15,18,24,0.50)" }}>Always on · Cloudflare context</div>
          </div>
        </div>
        <span className="text-[10px] font-mono" style={{ color: "rgba(15,18,24,0.40)" }}>
          {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        </span>
      </div>

      {/* Messages */}
      <div className="px-5 py-5 space-y-4 min-h-[420px]" style={{ background: "#FAFAFB" }}>
        {SCRIPT.slice(0, shown).map((m) => (
          <Message key={m.id} msg={m} />
        ))}
        {agentTyping && <TypingIndicator />}
        {shown === 0 && !agentTyping && (
          <div className="text-[11.5px] italic"
            style={{ color: "rgba(15,18,24,0.45)" }}>
            Scroll to see the conversation.
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="px-5 py-3.5 flex items-center gap-2.5"
        style={{ borderTop: "1px solid rgba(15,18,24,0.06)", background: "white" }}>
        <span className="w-2 h-2 rounded-full" style={{ background: ACCENT }} />
        <span className="flex-1 text-[12.5px]" style={{ color: "rgba(15,18,24,0.45)" }}>
          Ask the Revenue Agent…
        </span>
        <button className="w-8 h-8 rounded-full grid place-items-center"
          style={{ background: ACCENT, color: "white" }}>
          <ArrowUp size={13} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
function Message({ msg }: { msg: ChatMessage }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end animate-slide-up">
        <div className="max-w-[80%] px-3.5 py-2.5 rounded-2xl rounded-br-md"
          style={{
            background: "#0F1218",
            color: "white",
          }}>
          <p className="text-[13px] leading-snug">{msg.text}</p>
        </div>
        <style jsx>{`
          @keyframes slideUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
          .animate-slide-up { animation: slideUp 320ms ease-out; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 animate-slide-up">
      <div className="w-7 h-7 rounded-lg grid place-items-center shrink-0"
        style={{ background: "linear-gradient(135deg, #266DF0 0%, #7C3AED 100%)" }}>
        <Sparkles size={12} strokeWidth={2.2} className="text-white" />
      </div>
      <div className="max-w-[88%] flex-1">
        {msg.blocks?.map((b, i) => <BlockView key={i} block={b} />)}
      </div>
      <style jsx>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slideUp 400ms ease-out; }
      `}</style>
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  if (block.kind === "para") {
    return (
      <p className="text-[12.5px] mb-3 leading-relaxed"
        style={{ color: "#0F1218" }}>{block.text}</p>
    );
  }
  if (block.kind === "footnote") {
    return (
      <div className="mt-3 pt-3 px-3 py-2.5 rounded-xl flex items-start gap-2"
        style={{
          background: "rgba(38,109,240,0.06)",
          border: "1px solid rgba(38,109,240,0.20)",
        }}>
        <TrendingUp size={11} strokeWidth={2.4} className="mt-0.5 shrink-0" style={{ color: ACCENT }} />
        <p className="text-[11.5px] leading-relaxed" style={{ color: ACCENT }}>{block.text}</p>
      </div>
    );
  }
  return (
    <div className="space-y-2 mb-2">
      {block.items.map((it, i) => (
        <div key={i}
          className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-white animate-fade-row"
          style={{
            border: "1px solid rgba(15,18,24,0.08)",
            animationDelay: `${i * 200}ms`,
          }}>
          <div className="w-6 h-6 rounded-md grid place-items-center shrink-0 mt-0.5"
            style={{ background: `color-mix(in srgb, ${it.tone} 12%, white)` }}>
            <it.Icon size={11} strokeWidth={2.2} style={{ color: it.tone }} />
          </div>
          <div className="min-w-0">
            <div className="text-[12px] font-semibold leading-tight mb-0.5" style={{ color: "#0F1218" }}>{it.label}</div>
            <div className="text-[11px] leading-relaxed" style={{ color: "rgba(15,18,24,0.62)" }}>{it.detail}</div>
          </div>
        </div>
      ))}
      <style jsx>{`
        @keyframes fadeRow { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-row { animation: fadeRow 300ms ease-out backwards; }
      `}</style>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-lg grid place-items-center shrink-0"
        style={{ background: "linear-gradient(135deg, #266DF0 0%, #7C3AED 100%)" }}>
        <Sparkles size={12} strokeWidth={2.2} className="text-white" />
      </div>
      <div className="px-3.5 py-3 rounded-2xl rounded-bl-md flex items-center gap-1"
        style={{ background: "white", border: "1px solid rgba(15,18,24,0.08)" }}>
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
            style={{
              background: "rgba(15,18,24,0.40)",
              animationDelay: `${i * 150}ms`,
              animationDuration: "1000ms",
            }} />
        ))}
      </div>
    </div>
  );
}
