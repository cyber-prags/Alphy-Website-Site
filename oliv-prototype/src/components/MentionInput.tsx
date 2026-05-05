"use client";

import { useState, useRef } from "react";
import { Send } from "lucide-react";
import { teamMembers } from "@/lib/mock";

export function MentionInput({ onSubmit }: { onSubmit: (text: string, mentions: string[]) => void }) {
  const [text, setText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = teamMembers.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const handleChange = (value: string) => {
    setText(value);
    const lastAt = value.lastIndexOf("@");
    if (lastAt >= 0 && lastAt === value.length - 1) {
      setShowDropdown(true);
      setQuery("");
    } else if (lastAt >= 0) {
      const afterAt = value.slice(lastAt + 1);
      if (!afterAt.includes(" ")) {
        setShowDropdown(true);
        setQuery(afterAt);
      } else {
        setShowDropdown(false);
      }
    } else {
      setShowDropdown(false);
    }
  };

  const selectMember = (name: string) => {
    const lastAt = text.lastIndexOf("@");
    const newText = text.slice(0, lastAt) + `@${name} `;
    setText(newText);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const submit = () => {
    if (!text.trim()) return;
    const mentions = Array.from(text.matchAll(/@([A-Za-z]+ [A-Za-z]+)/g)).map((m) => m[1]);
    onSubmit(text.trim(), mentions);
    setText("");
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-full grid place-items-center text-[8.5px] font-semibold shrink-0"
          style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}
        >
          WQ
        </div>
        <div className="flex-1 flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-line bg-surface">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !showDropdown) submit(); }}
            placeholder="Add a comment... (use @ to mention)"
            className="flex-1 bg-transparent outline-none text-[11.5px] placeholder:text-muted-2"
          />
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="w-5 h-5 rounded grid place-items-center disabled:opacity-30 transition-opacity"
            style={{ background: "var(--accent)", color: "var(--bg)" }}
          >
            <Send size={9} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {showDropdown && filtered.length > 0 && (
        <div
          className="absolute left-8 bottom-full mb-1 w-52 rounded-xl border border-line shadow-lg overflow-hidden z-50"
          style={{ background: "var(--surface)" }}
        >
          {filtered.map((m) => (
            <button
              key={m.name}
              onClick={() => selectMember(m.name)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-bg-deep transition-colors"
            >
              <span
                className="w-5 h-5 rounded-full grid place-items-center text-[8px] font-semibold shrink-0"
                style={{ background: "var(--bg-deep)", color: "var(--ink)" }}
              >
                {m.initials}
              </span>
              <span className="text-[11.5px] text-ink">{m.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
