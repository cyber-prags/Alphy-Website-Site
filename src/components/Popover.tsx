"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

type Props = {
  trigger: (open: boolean, toggle: () => void) => ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  align?: "left" | "right";
  width?: number;
};

export function Popover({ trigger, children, align = "left", width = 240 }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={ref} className="relative inline-block">
      {trigger(open, () => setOpen((o) => !o))}
      {open && (
        <div
          className="absolute top-full mt-1 z-40 card p-1 fade-in shadow-[0_8px_24px_-8px_rgba(28,40,64,0.16)]"
          style={{ width, [align === "right" ? "right" : "left"]: 0 }}
        >
          {typeof children === "function" ? (children as (c: () => void) => ReactNode)(close) : children}
        </div>
      )}
    </div>
  );
}

// Reusable menu items inside a Popover
export function MenuItem({
  children, onClick, selected, danger, kbd,
}: {
  children: ReactNode; onClick?: () => void; selected?: boolean; danger?: boolean; kbd?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12.5px] text-left ${
        selected ? "bg-bg-deep text-ink font-medium" : "text-ink-2 hover:bg-bg-deep"
      } ${danger ? "text-[color:var(--neg)] hover:text-[color:var(--neg)]" : ""}`}
    >
      <span className="flex-1">{children}</span>
      {kbd && <kbd className="text-[10px] text-muted-2 font-mono">{kbd}</kbd>}
    </button>
  );
}

export function MenuSeparator() {
  return <hr className="hairline my-1" />;
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return <div className="mono-label px-2.5 pt-1.5 pb-1">{children}</div>;
}
