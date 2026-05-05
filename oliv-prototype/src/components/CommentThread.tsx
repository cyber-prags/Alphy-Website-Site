"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { type TaskComment } from "@/lib/mock";

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function CommentThread({
  comments,
  onAdd,
}: {
  comments: TaskComment[];
  onAdd?: (comment: TaskComment) => void;
}) {
  const [text, setText] = useState("");

  const post = () => {
    if (!text.trim()) return;
    const c: TaskComment = {
      id: `tc-${Date.now()}`,
      author: "Walid Qayoumi",
      authorInitials: "WQ",
      text: text.trim(),
      at: new Date().toISOString(),
    };
    onAdd?.(c);
    setText("");
  };

  return (
    <div>
      {/* Comment list */}
      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="flex items-start gap-2.5">
            <div
              className="w-6 h-6 rounded-full grid place-items-center text-[8.5px] font-semibold shrink-0"
              style={{ background: "var(--bg-deep)", color: "var(--ink)" }}
            >
              {c.authorInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-[11.5px] font-semibold text-ink">{c.author}</span>
                <span className="text-[10px] text-muted-2">{timeAgo(c.at)}</span>
              </div>
              <p className="text-[12px] text-ink-2 leading-relaxed mt-0.5">{c.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-line">
        <div
          className="w-6 h-6 rounded-full grid place-items-center text-[8.5px] font-semibold shrink-0"
          style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}
        >
          WQ
        </div>
        <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-line bg-surface">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") post(); }}
            placeholder="Add a comment..."
            className="flex-1 bg-transparent outline-none text-[11.5px] placeholder:text-muted-2"
          />
          <button
            onClick={post}
            disabled={!text.trim()}
            className="w-5 h-5 rounded grid place-items-center disabled:opacity-30 transition-opacity"
            style={{ background: "var(--accent)", color: "var(--bg)" }}
          >
            <Send size={9} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
}
