import { Sparkles } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

type Source =
  | "Salesforce" | "HubSpot"
  | "Google Workspace" | "Microsoft 365"
  | "Gong" | "Clari"
  | "Mixpanel" | "Amplitude"
  | "LinkedIn"
  | "Slack"
  | "Zendesk" | "Intercom"
  | "Snowflake"
  | "Alphy AI"
  | "Email" | "Calendar";

// Tone is used only for the text colour of the chip — the icon itself is
// rendered via BrandLogo using the brand's actual mark.
const TONE: Record<Source, string> = {
  "Salesforce":        "var(--info)",
  "HubSpot":           "var(--warn)",
  "Google Workspace":  "var(--info)",
  "Microsoft 365":     "var(--info)",
  "Gong":              "var(--accent-deep)",
  "Clari":             "var(--info)",
  "Mixpanel":          "var(--accent-deep)",
  "Amplitude":         "var(--info)",
  "LinkedIn":          "var(--info)",
  "Slack":             "var(--info)",
  "Zendesk":           "var(--pos)",
  "Intercom":          "var(--info)",
  "Snowflake":         "var(--info)",
  "Alphy AI":          "var(--accent-deep)",
  "Email":             "var(--muted)",
  "Calendar":          "var(--muted)",
};

// Brand name → BrandLogo key. "Google Workspace" → "google", etc.
const BRAND_NAME: Record<Source, string | null> = {
  "Salesforce":        "Salesforce",
  "HubSpot":           "HubSpot",
  "Google Workspace":  "Google",
  "Microsoft 365":     null, // not in brand library yet
  "Gong":              "Gong",
  "Clari":             "Clari",
  "Mixpanel":          "Mixpanel",
  "Amplitude":         null,
  "LinkedIn":          "LinkedIn",
  "Slack":             "Slack",
  "Zendesk":           "Zendesk",
  "Intercom":          "Intercom",
  "Snowflake":         "Snowflake",
  "Alphy AI":          null,  // rendered with Sparkles
  "Email":             null,
  "Calendar":          null,
};

type Props = {
  source: Source;
  meta?: string;       // e.g., "transcript 00:14:12" or "9 min ago"
  size?: "xs" | "sm";
};

// Icon-only chip — used in DataFreshness header. Stacks/overlaps cleanly,
// shows the brand mark on a tinted tile, hover reveals the source name.
export function SourceIconChip({ source }: { source: Source }) {
  const tone = TONE[source];
  const brandName = BRAND_NAME[source];
  return (
    <span
      title={source}
      className="rounded-md overflow-hidden grid place-items-center transition-transform hover:scale-110 hover:z-10 relative"
      style={{
        width: 22, height: 22,
        background: "var(--surface)",
        border: "1px solid var(--line)",
        boxShadow: "0 0 0 2px var(--bg)",
      }}
    >
      {brandName ? (
        <BrandLogo name={brandName} size={20} />
      ) : (
        <Sparkles size={11} strokeWidth={2} style={{ color: tone }} />
      )}
    </span>
  );
}

export function SourceChip({ source, meta, size = "sm" }: Props) {
  const tone = TONE[source];
  const brandName = BRAND_NAME[source];
  const small = size === "xs";
  const iconSize = small ? 11 : 13;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded font-mono uppercase tracking-[0.06em]"
      style={{
        background: "var(--bg-deep)",
        color: tone,
        fontSize: small ? 9 : 9.5,
        padding: small ? "1px 6px 1px 3px" : "2px 7px 2px 3px",
        height: small ? 16 : 18,
      }}
      title={meta ? `${source} · ${meta}` : source}
    >
      <span className="rounded-sm overflow-hidden grid place-items-center"
        style={{ width: iconSize, height: iconSize }}>
        {brandName ? (
          <BrandLogo name={brandName} size={iconSize} />
        ) : (
          <Sparkles size={small ? 8 : 9} strokeWidth={2}
            style={{ color: tone }} />
        )}
      </span>
      {source}
      {meta && <span className="opacity-70 normal-case tracking-normal">· {meta}</span>}
    </span>
  );
}

// Freshness header used at the top of dashboards
export function DataFreshness({ minutesAgo, sources, onRefresh }: {
  minutesAgo: number;
  sources: Source[];
  onRefresh?: () => void;
}) {
  const text = minutesAgo === 0 ? "just now"
             : minutesAgo < 60 ? `${minutesAgo} min ago`
             : minutesAgo < 1440 ? `${Math.floor(minutesAgo / 60)}h ago`
             : `${Math.floor(minutesAgo / 1440)}d ago`;
  return (
    <div className="flex items-center gap-3 mb-4 flex-wrap">
      <div className="mono-label">
        Last built <span style={{ color: "var(--ink-2)" }}>{text}</span>
      </div>
      <span className="text-muted-2">·</span>
      <span className="text-[10.5px] text-muted">Data from</span>
      {/* Icon-only chips — hover for the source name */}
      <div className="flex items-center -space-x-1.5">
        {sources.map((s) => <SourceIconChip key={s} source={s} />)}
      </div>
      {onRefresh && (
        <button onClick={onRefresh}
          className="ml-2 text-[10.5px] text-muted hover:text-ink underline decoration-dotted underline-offset-2">
          Refresh
        </button>
      )}
    </div>
  );
}
