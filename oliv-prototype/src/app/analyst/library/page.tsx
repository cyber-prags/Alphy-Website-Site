"use client";

import { useState, useMemo } from "react";
import { Search, Pin, Sparkles, Trash2, MessageSquare } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { savedConversations, type SavedConversation } from "@/lib/mock";
import { useToast } from "@/components/Toast";

export default function LibraryPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<SavedConversation[]>(savedConversations);

  const filtered = useMemo(() => {
    const lc = search.trim().toLowerCase();
    if (!lc) return items;
    return items.filter((c) => `${c.title} ${c.preview}`.toLowerCase().includes(lc));
  }, [search, items]);

  const togglePin = (id: string) => setItems((s) => s.map((c) => c.id === id ? { ...c, pinned: !c.pinned } : c));
  const remove = (id: string) => {
    setItems((s) => s.filter((c) => c.id !== id));
    toast({ tone: "success", title: "Conversation deleted" });
  };

  return (
    <AppShell>
      <div className="mb-5">
        <div className="mono-label mb-1.5">Analyst · Library</div>
        <h1 className="display" style={{ fontSize: 22 }}>Saved conversations</h1>
        <div className="text-[12.5px] text-muted mt-1">Past Analyst threads, pinned for quick recall.</div>
      </div>

      <div className="flex items-center gap-2 mb-3 max-w-md">
        <div className="flex-1 flex items-center gap-2 h-8 px-2.5 rounded-md border border-line bg-surface">
          <Search size={12} strokeWidth={1.6} className="text-muted-2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search saved threads…"
                 className="flex-1 bg-transparent outline-none text-[12px] placeholder:text-muted-2" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-[12.5px] text-muted">No saved conversations.</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((c) => (
            <div key={c.id} className="card p-4 group">
              <div className="flex items-start gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-md grid place-items-center" style={{ background: "var(--accent-soft)" }}>
                  <MessageSquare size={12} strokeWidth={1.6} style={{ color: "var(--accent)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-ink leading-snug">{c.title}</div>
                  <div className="text-[10.5px] text-muted mt-0.5">{c.when}</div>
                </div>
                <button onClick={() => togglePin(c.id)} title={c.pinned ? "Unpin" : "Pin"}
                  className={`w-6 h-6 rounded grid place-items-center hover:bg-bg-deep ${c.pinned ? "" : "opacity-0 group-hover:opacity-100"}`}>
                  <Pin size={11} strokeWidth={1.8}
                    style={{ color: c.pinned ? "var(--accent)" : "var(--muted-2)", fill: c.pinned ? "var(--accent)" : "transparent" }} />
                </button>
              </div>
              <p className="text-[12px] text-ink-2 leading-relaxed">{c.preview}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-line">
                <button className="text-[11px] font-medium text-ink-2 inline-flex items-center gap-1 hover:text-ink">
                  <Sparkles size={10} strokeWidth={1.8} style={{ color: "var(--accent)" }} />
                  Continue
                </button>
                <button onClick={() => remove(c.id)} title="Delete"
                  className="w-6 h-6 rounded grid place-items-center text-muted-2 hover:text-[color:var(--neg)] hover:bg-bg-deep opacity-0 group-hover:opacity-100">
                  <Trash2 size={11} strokeWidth={1.6} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
