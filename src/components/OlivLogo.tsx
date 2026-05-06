type Props = { size?: number; variant?: "mark" | "full" };

export function OlivLogo({ size = 22, variant = "full" }: Props) {
  const s = variant === "mark" ? size : size + 4;
  return (
    <span className="flex items-center gap-2 select-none">
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" stroke="var(--ink)" strokeWidth="2.5" />
        <circle cx="16" cy="16" r="5"  fill="var(--ink)" />
        <circle cx="16" cy="16" r="2"  fill="var(--accent)" />
      </svg>
      {variant === "full" && (
        <span style={{ fontWeight: 700, fontSize: size, letterSpacing: "-0.04em", color: "var(--ink)" }}>
          oliv<span style={{ color: "var(--accent-deep)" }}>.</span>
        </span>
      )}
    </span>
  );
}
