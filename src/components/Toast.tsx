"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, X, AlertCircle, Info } from "lucide-react";

type Tone = "success" | "info" | "error";
type ToastItem = { id: string; tone: Tone; title: string; body?: string };

const ToastCtx = createContext<{ push: (t: Omit<ToastItem, "id">) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const push = useCallback((t: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((s) => [...s, { ...t, id }]);
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), 3800);
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div role="region" aria-live="polite" aria-label="Notifications"
        className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => {
          const Icon = t.tone === "error" ? AlertCircle : t.tone === "info" ? Info : CheckCircle2;
          const color = t.tone === "error" ? "var(--neg)" : t.tone === "info" ? "var(--info)" : "var(--pos)";
          return (
            <div key={t.id} className="card p-3 flex items-start gap-2.5 fade-in shadow-[0_4px_16px_-4px_rgba(28,40,64,0.12)]">
              <Icon size={14} strokeWidth={2} style={{ color, marginTop: 1 }} />
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-semibold text-ink leading-snug">{t.title}</div>
                {t.body && <div className="text-[11.5px] text-muted leading-snug mt-0.5">{t.body}</div>}
              </div>
              <button onClick={() => setToasts((s) => s.filter((x) => x.id !== t.id))} className="text-muted-2 hover:text-ink">
                <X size={11} strokeWidth={1.6} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastCtx);
  // No-op fallback so components don't crash during hot reload edge cases
  if (!ctx) return () => {};
  return ctx.push;
};

// Hook for ESC key handler in modals/drawers
export function useEscape(active: boolean, onEsc: () => void) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onEsc(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, onEsc]);
}
