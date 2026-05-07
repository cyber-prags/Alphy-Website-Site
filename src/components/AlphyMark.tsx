"use client";

// ─────────────────────────────────────────────────────────────────────
// AlphyMark — a custom geometric mark for the Alphy assistant.
// Eight-spoke radial pattern around a centre dot, drawn as paths so it
// scales crisply at any size. Distinct from the cliché AI sparkle.
// ─────────────────────────────────────────────────────────────────────

export function AlphyMark({
  size = 18,
  color = "currentColor",
  strokeWidth,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const sw = strokeWidth ?? Math.max(1, size * 0.08);
  return (
    <svg
      width={size}
      height={size}
      viewBox="-12 -12 24 24"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeWidth={sw}
      style={{ display: "block" }}
    >
      {/* Eight-spoke radial — alternating long and short for a starburst feel */}
      {/* Cardinal (long) */}
      <line x1="0" y1="-9.5" x2="0" y2="-3.5" />
      <line x1="0" y1="3.5"  x2="0" y2="9.5" />
      <line x1="-9.5" y1="0" x2="-3.5" y2="0" />
      <line x1="3.5"  y1="0" x2="9.5"  y2="0" />
      {/* Diagonal (short) */}
      <line x1="-6"   y1="-6" x2="-3"  y2="-3" />
      <line x1="6"    y1="-6" x2="3"   y2="-3" />
      <line x1="-6"   y1="6"  x2="-3"  y2="3" />
      <line x1="6"    y1="6"  x2="3"   y2="3" />
      {/* Centre dot */}
      <circle cx="0" cy="0" r={Math.max(1, size * 0.07)} fill={color} stroke="none" />
    </svg>
  );
}
