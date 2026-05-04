"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import { useEscape } from "./Toast";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  width?: number;
  footer?: ReactNode;
};

export function Modal({ open, onClose, title, description, children, width = 480, footer }: Props) {
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-ink/30 z-[90] fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-[100] grid place-items-center p-4 pointer-events-none">
        <div
          className="card pointer-events-auto fade-in flex flex-col max-h-[90vh]"
          style={{ width, animation: "drawerIn 200ms cubic-bezier(0.32, 0.72, 0, 1)" }}
        >
          {(title || description) && (
            <div className="px-5 pt-4 pb-3 border-b border-line flex items-start justify-between gap-3">
              <div>
                {title && <h3 className="display" style={{ fontSize: 15 }}>{title}</h3>}
                {description && <div className="text-[12px] text-muted mt-0.5">{description}</div>}
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-md grid place-items-center text-muted hover:bg-bg-deep hover:text-ink">
                <X size={13} strokeWidth={1.6} />
              </button>
            </div>
          )}
          <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
          {footer && <div className="px-5 py-3 border-t border-line flex items-center justify-end gap-2">{footer}</div>}
        </div>
      </div>
    </>
  );
}

export function FormField({
  label, hint, children,
}: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="mb-3">
      <label className="text-[11.5px] font-medium text-ink-2 mb-1 block">
        {label}
        {hint && <span className="text-muted-2 font-normal"> · {hint}</span>}
      </label>
      {children}
    </div>
  );
}

export function TextInput({
  value, onChange, placeholder, type = "text",
}: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-9 px-3 rounded-md border border-line bg-surface text-[13px] text-ink outline-none focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
    />
  );
}

export function SelectInput<T extends string>({
  value, onChange, options,
}: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="w-full h-9 px-2.5 rounded-md border border-line bg-surface text-[13px] text-ink outline-none"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function ModalButton({
  children, onClick, primary, danger, disabled,
}: { children: ReactNode; onClick?: () => void; primary?: boolean; danger?: boolean; disabled?: boolean }) {
  const base = "text-[12px] font-medium h-8 px-3 rounded-md inline-flex items-center gap-1.5";
  const cls = danger
    ? `${base} text-white`
    : primary
    ? `${base} bg-ink text-white hover:bg-ink-2`
    : `${base} border border-line bg-surface text-ink-2 hover:bg-bg-deep`;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cls}
      style={danger ? { background: "var(--neg)" } : undefined}
    >
      {children}
    </button>
  );
}
