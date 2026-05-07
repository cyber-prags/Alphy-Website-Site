"use client";

// ─────────────────────────────────────────────────────────────────────
// BrandLogo — small SVG brand marks for the integrations we show.
// Falls back to first-letter mono if the brand isn't known.
// All marks are ~20x20 viewBox and use brand colors.
// ─────────────────────────────────────────────────────────────────────

type BrandKey =
  | "salesforce" | "gong" | "zendesk" | "mixpanel" | "slack" | "linkedin"
  | "snowflake" | "looker" | "hubspot" | "intercom" | "outreach"
  | "salesloft" | "clari" | "google" | "notion" | "okta" | "stripe";

const BRAND_KEYS: BrandKey[] = [
  "salesforce", "gong", "zendesk", "mixpanel", "slack", "linkedin",
  "snowflake", "looker", "hubspot", "intercom", "outreach",
  "salesloft", "clari", "google", "notion", "okta", "stripe",
];

function normalize(name: string): BrandKey | null {
  const n = name.toLowerCase().replace(/[^a-z]/g, "");
  for (const k of BRAND_KEYS) {
    if (n === k || n.startsWith(k) || k.startsWith(n)) return k;
  }
  return null;
}

export function BrandLogo({ name, size = 28 }: { name: string; size?: number }) {
  const key = normalize(name);
  const Mark = key ? MARKS[key] : null;
  if (Mark) return <Mark size={size} />;
  // Fallback — first letter on a soft tile
  const letter = (name[0] ?? "?").toUpperCase();
  return (
    <div
      className="rounded-md grid place-items-center font-semibold"
      style={{
        width: size, height: size,
        background: "var(--bg-deep)",
        color: "var(--ink-2)",
        fontSize: size * 0.5,
      }}
    >
      {letter}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Brand marks (simplified — recognizable, not pixel-perfect)
// ─────────────────────────────────────────────────────────────────────

const MARKS: Record<BrandKey, (props: { size: number }) => React.ReactElement> = {
  salesforce: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="22" fill="#00A1E0" />
      <path
        d="M59.4 30.1c2.7-2.8 6.5-4.5 10.6-4.5 5.5 0 10.3 3 12.8 7.5 2.2-1 4.6-1.5 7.2-1.5.2 0 .4 0 .5.1-2.1-7.4-8.9-12.8-17-12.8-4.7 0-9 1.9-12.2 4.9-2.7-3.7-7-6.1-12-6.1-7.6 0-13.9 5.7-14.7 13.1-2.1-1-4.4-1.5-6.9-1.5C18.2 29.3 11 36.6 11 45.6c0 1.6.2 3.1.6 4.6-3.5 1.7-6 5.4-6 9.6 0 5.9 4.8 10.7 10.7 10.7H70c8.3 0 15-6.7 15-15 0-1.6-.3-3.2-.7-4.7 1.4-2.3 2.2-5 2.2-7.9 0-7.6-6.2-13.7-13.7-13.7-1.7 0-3.4.3-4.9.9-2.5-3.7-6.7-6.1-11.5-6.1"
        fill="white"
        transform="translate(0 5) scale(0.85)"
      />
    </svg>
  ),
  gong: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="22" fill="#8038F4" />
      <circle cx="50" cy="50" r="22" fill="none" stroke="white" strokeWidth="6" />
      <circle cx="50" cy="50" r="8" fill="white" />
    </svg>
  ),
  zendesk: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="22" fill="#03363D" />
      <path d="M22 30 L48 30 L22 65 L22 75 L52 75 Z" fill="#A6E2D6" />
      <circle cx="68" cy="40" r="14" fill="white" />
      <path d="M54 75 L82 75 L82 60 Z" fill="white" />
    </svg>
  ),
  mixpanel: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="22" fill="#7856FF" />
      <circle cx="30" cy="50" r="10" fill="white" />
      <circle cx="50" cy="50" r="16" fill="white" />
      <circle cx="74" cy="50" r="8" fill="white" />
    </svg>
  ),
  slack: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="22" fill="white" stroke="#E4E6EA" />
      <rect x="22" y="44" width="14" height="38" rx="7" fill="#36C5F0" />
      <rect x="44" y="64" width="38" height="14" rx="7" fill="#2EB67D" />
      <rect x="64" y="22" width="14" height="38" rx="7" fill="#E01E5A" />
      <rect x="22" y="22" width="38" height="14" rx="7" fill="#ECB22E" />
    </svg>
  ),
  linkedin: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="22" fill="#0A66C2" />
      <rect x="22" y="42" width="12" height="36" fill="white" />
      <circle cx="28" cy="30" r="6" fill="white" />
      <path d="M44 42 L56 42 L56 48 C58 44 64 41 70 41 C78 41 82 47 82 56 L82 78 L70 78 L70 60 C70 54 68 50 63 50 C58 50 56 54 56 60 L56 78 L44 78 Z" fill="white" />
    </svg>
  ),
  snowflake: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="22" fill="#29B5E8" />
      <g stroke="white" strokeWidth="4" strokeLinecap="round">
        <line x1="50" y1="20" x2="50" y2="80" />
        <line x1="20" y1="50" x2="80" y2="50" />
        <line x1="29" y1="29" x2="71" y2="71" />
        <line x1="29" y1="71" x2="71" y2="29" />
      </g>
      <circle cx="50" cy="50" r="6" fill="white" />
    </svg>
  ),
  looker: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="22" fill="#4285F4" />
      <circle cx="50" cy="50" r="22" fill="none" stroke="white" strokeWidth="6" />
      <circle cx="50" cy="50" r="6" fill="white" />
      <line x1="50" y1="50" x2="50" y2="78" stroke="white" strokeWidth="6" strokeLinecap="round" />
    </svg>
  ),
  hubspot: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="22" fill="#FF7A59" />
      <circle cx="68" cy="56" r="12" fill="none" stroke="white" strokeWidth="5" />
      <line x1="68" y1="20" x2="68" y2="44" stroke="white" strokeWidth="5" strokeLinecap="round" />
      <circle cx="68" cy="20" r="5" fill="white" />
      <line x1="58" y1="56" x2="38" y2="56" stroke="white" strokeWidth="5" strokeLinecap="round" />
      <circle cx="32" cy="56" r="6" fill="white" />
    </svg>
  ),
  intercom: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="22" fill="#1F8DED" />
      <rect x="22" y="22" width="56" height="56" rx="12" fill="none" stroke="white" strokeWidth="5" />
      <line x1="34" y1="38" x2="34" y2="58" stroke="white" strokeWidth="5" strokeLinecap="round" />
      <line x1="50" y1="34" x2="50" y2="62" stroke="white" strokeWidth="5" strokeLinecap="round" />
      <line x1="66" y1="38" x2="66" y2="58" stroke="white" strokeWidth="5" strokeLinecap="round" />
    </svg>
  ),
  outreach: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="22" fill="#5951FF" />
      <path d="M30 65 L50 30 L70 65 L60 65 L50 47 L40 65 Z" fill="white" />
    </svg>
  ),
  salesloft: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="22" fill="#3F44A6" />
      <path d="M30 35 L70 35 L70 50 L40 50 L40 60 L70 60 L70 75 L30 75 L30 60 L60 60 L60 50 L30 50 Z" fill="white" />
    </svg>
  ),
  clari: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="22" fill="#1B1F33" />
      <path d="M30 55 L40 65 L70 35" stroke="#5DD3F1" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  google: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="22" fill="white" stroke="#E4E6EA" />
      <path d="M77 50c0-2-.2-3.5-.5-5H50v9.5h15.5c-.5 3-2 5.5-4.5 7.3v6h7.3C73.5 63.5 77 57.5 77 50z" fill="#4285F4" />
      <path d="M50 78c6 0 11-2 14.5-5.5l-7.3-6c-2 1.4-4.5 2.2-7.2 2.2-5.5 0-10.3-3.7-12-9H30v6.2C33.5 73 41 78 50 78z" fill="#34A853" />
      <path d="M38 59.7c-.4-1.4-.7-2.8-.7-4.2s.3-2.8.7-4.2v-6.2H30c-1.5 3-2.3 6.4-2.3 10.4 0 4 .8 7.4 2.3 10.4l8-6.2z" fill="#FBBC05" />
      <path d="M50 36.7c3 0 6 1 8.2 3.1l6-6C60.8 30 56 28 50 28c-9 0-16.5 5-20 12.3l8 6.2c1.7-5.3 6.5-9 12-9z" fill="#EA4335" />
    </svg>
  ),
  notion: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="22" fill="white" stroke="#E4E6EA" />
      <path d="M28 26 L72 22 L72 78 L52 80 L36 64 L36 28 Z" fill="white" stroke="#0F1218" strokeWidth="3" strokeLinejoin="round" />
      <path d="M44 38 L44 66 M44 38 L62 60 L62 38" stroke="#0F1218" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  okta: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="22" fill="#007DC1" />
      <circle cx="50" cy="50" r="20" fill="none" stroke="white" strokeWidth="8" />
    </svg>
  ),
  stripe: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="22" fill="#635BFF" />
      <path d="M55 35 C45 35 38 39 38 47 C38 60 60 56 60 64 C60 67 57 68 53 68 C47 68 40 65 36 62 L36 73 C40 75 47 77 53 77 C64 77 72 73 72 64 C72 51 50 55 50 47 C50 44 53 43 56 43 C61 43 67 45 71 47 L71 36 C67 35 61 35 55 35 Z" fill="white" />
    </svg>
  ),
};
