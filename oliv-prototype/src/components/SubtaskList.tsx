"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { type Subtask } from "@/lib/mock";

export function SubtaskList({
  subtasks,
  onChange,
}: {
  subtasks: Subtask[];
  onChange?: (updated: Subtask[]) => void;
}) {
  const [newLabel, setNewLabel] = useState("");
  const done = subtasks.filter((s) => s.done).length;
  const pct = subtasks.length > 0 ? Math.round((done / subtasks.length) * 100) : 0;

  const toggle = (id: string) => {
    onChange?.(subtasks.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
  };

  const add = () => {
    if (!newLabel.trim()) return;
    const next: Subtask = { id: `st-${Date.now()}`, label: newLabel.trim(), done: false };
    onChange?.([...subtasks, next]);
    setNewLabel("");
  };

  return (
    <div>
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-deep)" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "var(--accent)" }} />
        </div>
        <span className="text-[10.5px] font-mono font-semibold tnum text-muted">{done}/{subtasks.length}</span>
      </div>

      {/* Checklist */}
      <div className="space-y-1">
        {subtasks.map((s) => (
          <button
            key={s.id}
            onClick={() => toggle(s.id)}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left hover:bg-bg-deep/50 transition-colors group"
          >
            <span
              className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors"
              style={{
                background: s.done ? "var(--accent)" : "transparent",
                borderColor: s.done ? "var(--accent)" : "var(--line)",
              }}
            >
              {s.done && <Check size={10} strokeWidth={2.5} style={{ color: "var(--bg)" }} />}
            </span>
            <span className={`text-[12px] leading-tight ${s.done ? "line-through text-muted" : "text-ink"}`}>
              {s.label}
            </span>
          </button>
        ))}
      </div>

      {/* Add subtask */}
      <div className="flex items-center gap-1.5 mt-2 px-2">
        <Plus size={12} strokeWidth={1.8} className="text-muted shrink-0" />
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") add(); }}
          placeholder="Add subtask..."
          className="flex-1 bg-transparent outline-none text-[11.5px] placeholder:text-muted-2"
        />
      </div>
    </div>
  );
}
