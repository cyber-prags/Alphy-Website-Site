import {
  Database, Calendar, Phone, Activity as ActivityIcon, Globe2, MessageSquare,
  Inbox as InboxIcon, Server, Sparkles, Mail,
} from "lucide-react";

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

const META: Record<Source, { Icon: typeof Mail; tone: string }> = {
  "Salesforce":        { Icon: Database,        tone: "var(--info)"    },
  "HubSpot":           { Icon: Database,        tone: "var(--warn)"    },
  "Google Workspace":  { Icon: Mail,            tone: "var(--info)"    },
  "Microsoft 365":     { Icon: Mail,            tone: "var(--info)"    },
  "Gong":              { Icon: Phone,           tone: "var(--accent-deep)" },
  "Clari":             { Icon: ActivityIcon,    tone: "var(--info)"    },
  "Mixpanel":          { Icon: ActivityIcon,    tone: "var(--accent-deep)" },
  "Amplitude":         { Icon: ActivityIcon,    tone: "var(--info)"    },
  "LinkedIn":          { Icon: Globe2,          tone: "var(--info)"    },
  "Slack":             { Icon: MessageSquare,   tone: "var(--info)"    },
  "Zendesk":           { Icon: InboxIcon,       tone: "var(--pos)"     },
  "Intercom":          { Icon: InboxIcon,       tone: "var(--info)"    },
  "Snowflake":         { Icon: Server,          tone: "var(--info)"    },
  "Alphy AI":          { Icon: Sparkles,        tone: "var(--accent-deep)" },
  "Email":             { Icon: Mail,            tone: "var(--muted)"   },
  "Calendar":          { Icon: Calendar,        tone: "var(--muted)"   },
};

type Props = {
  source: Source;
  meta?: string;       // e.g., "transcript 00:14:12" or "9 min ago"
  size?: "xs" | "sm";
};

export function SourceChip({ source, meta, size = "sm" }: Props) {
  const m = META[source];
  const small = size === "xs";
  return (
    <span
      className="inline-flex items-center gap-1 rounded font-mono uppercase tracking-[0.06em]"
      style={{
        background: "var(--bg-deep)",
        color: m.tone,
        fontSize: small ? 9 : 9.5,
        padding: small ? "1px 5px" : "2px 6px",
        height: small ? 14 : 16,
      }}
      title={meta ? `${source} · ${meta}` : source}
    >
      <m.Icon size={small ? 8 : 9} strokeWidth={1.8} />
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
      <div className="flex items-center gap-1.5">
        {sources.map((s) => <SourceChip key={s} source={s} size="xs" />)}
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
