"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Database, Activity, Telescope, Bot, TrendingUp, Users, LineChart, BookOpen, Building2 } from "lucide-react";
import { deals } from "@/lib/mock";

const ROUTES = [
  { label: "Records",    href: "/deals",    Icon: Database,   group: "Navigation" },
  { label: "Activities", href: "/meetings", Icon: Activity,   group: "Navigation" },
  { label: "Analyst",    href: "/analyst",  Icon: Telescope,  group: "Navigation" },
  { label: "Agents",     href: "/agents",   Icon: Bot,        group: "Navigation" },
  { label: "Revenue",    href: "/revenue",  Icon: TrendingUp, group: "Navigation" },
  { label: "People",     href: "/people",   Icon: Users,      group: "Navigation" },
  { label: "Forecast",   href: "/forecast", Icon: LineChart,  group: "Navigation" },
  { label: "Playbook",   href: "/playbook", Icon: BookOpen,   group: "Navigation" },
];

export function CommandK({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!open) { setQ(""); setActive(0); }
  }, [open]);

  const items = useMemo(() => {
    const lc = q.trim().toLowerCase();
    const dealItems = deals
      .filter((d) => !lc || `${d.name} ${d.account}`.toLowerCase().includes(lc))
      .slice(0, 6)
      .map((d) => ({ kind: "deal" as const, label: d.name, sub: d.account, href: `/deals#${d.id}`, group: "Deals", Icon: Building2 }));
    const navItems = ROUTES.filter((r) => !lc || r.label.toLowerCase().includes(lc));
    return [...navItems, ...dealItems];
  }, [q]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length - 1)); }
      else if (e.key === "ArrowUp")   { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
      else if (e.key === "Enter") {
        const item = items[active];
        if (item) { router.push(item.href); onClose(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, active, items, router, onClose]);

  if (!open) return null;

  // Group items
  let lastGroup = "";
  return (
    <>
      <div className="fixed inset-0 bg-ink/30 z-[90] fade-in" onClick={onClose} />
      <div className="fixed inset-x-0 top-[15vh] z-[100] grid place-items-start justify-center p-4 pointer-events-none">
        <div className="card w-full max-w-xl pointer-events-auto fade-in shadow-[0_16px_48px_-16px_rgba(28,40,64,0.18)]"
             style={{ animation: "drawerIn 180ms cubic-bezier(0.32, 0.72, 0, 1)" }}>
          <div className="flex items-center gap-2 px-3 h-11 border-b border-line">
            <Search size={14} strokeWidth={1.6} className="text-muted-2" />
            <input
              autoFocus
              value={q}
              onChange={(e) => { setQ(e.target.value); setActive(0); }}
              placeholder="Search deals, pages, contacts…"
              className="flex-1 bg-transparent outline-none text-[13.5px] placeholder:text-muted-2"
            />
            <kbd className="text-[10px] text-muted-2 font-mono">esc</kbd>
          </div>
          <div className="max-h-[50vh] overflow-y-auto p-1.5">
            {items.length === 0 ? (
              <div className="px-3 py-6 text-center text-[12.5px] text-muted">No matches.</div>
            ) : items.map((it, i) => {
              const showHeader = it.group !== lastGroup;
              lastGroup = it.group;
              return (
                <div key={`${it.label}-${i}`}>
                  {showHeader && <div className="mono-label px-2 pt-2 pb-1">{it.group}</div>}
                  <button
                    onMouseEnter={() => setActive(i)}
                    onClick={() => { router.push(it.href); onClose(); }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[12.5px] text-left ${
                      active === i ? "bg-bg-deep" : ""
                    }`}
                  >
                    <it.Icon size={14} strokeWidth={1.6} className="text-muted" />
                    <span className="text-ink-2 font-medium">{it.label}</span>
                    {"sub" in it && typeof it.sub === "string" && <span className="text-muted text-[11.5px]">· {it.sub}</span>}
                    <span className="ml-auto"><ArrowRight size={12} strokeWidth={1.6} className="text-muted-2" /></span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
