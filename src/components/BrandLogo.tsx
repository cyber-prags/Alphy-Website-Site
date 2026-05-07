"use client";

// ─────────────────────────────────────────────────────────────────────
// BrandLogo — real brand SVGs bundled via react-icons/si.
// Falls back to a first-letter tile if the brand isn't known.
// All icons render as inline SVG — no CDN dependency.
// ─────────────────────────────────────────────────────────────────────

import {
  SiSalesforce, SiHubspot, SiZendesk, SiSlack, SiSnowflake,
  SiGoogle, SiNotion, SiOkta, SiStripe,
  SiAirtable, SiZoom, SiGithub, SiJira, SiAsana, SiDatadog,
  SiLooker, SiIntercom, SiMixpanel,
} from "react-icons/si";
import { FaLinkedin, FaMicrosoft } from "react-icons/fa6";

type BrandSpec = {
  Icon: any;
  bg: string;     // brand colour
  fg?: string;    // foreground (default white)
};

// Brand colour mapping — all real-world brand hex values.
const BRANDS: Record<string, BrandSpec> = {
  salesforce:        { Icon: SiSalesforce,        bg: "#00A1E0" },
  hubspot:           { Icon: SiHubspot,           bg: "#FF7A59" },
  zendesk:           { Icon: SiZendesk,           bg: "#03363D" },
  slack:             { Icon: SiSlack,             bg: "#4A154B" },
  linkedin:          { Icon: FaLinkedin,          bg: "#0A66C2" },
  linkedinsales:     { Icon: FaLinkedin,          bg: "#0A66C2" },
  snowflake:         { Icon: SiSnowflake,         bg: "#29B5E8" },
  google:            { Icon: SiGoogle,            bg: "#FFFFFF", fg: "#000000" },
  googleworkspace:   { Icon: SiGoogle,            bg: "#FFFFFF", fg: "#000000" },
  notion:            { Icon: SiNotion,            bg: "#000000" },
  okta:              { Icon: SiOkta,              bg: "#007DC1" },
  stripe:            { Icon: SiStripe,            bg: "#635BFF" },
  airtable:          { Icon: SiAirtable,          bg: "#18BFFF" },
  zoom:              { Icon: SiZoom,              bg: "#0B5CFF" },
  github:            { Icon: SiGithub,            bg: "#181717" },
  jira:              { Icon: SiJira,              bg: "#0052CC" },
  asana:             { Icon: SiAsana,             bg: "#F06A6A" },
  datadog:           { Icon: SiDatadog,           bg: "#632CA6" },
  looker:            { Icon: SiLooker,            bg: "#4285F4" },
  intercom:          { Icon: SiIntercom,          bg: "#1F8DED" },
  mixpanel:          { Icon: SiMixpanel,          bg: "#7856FF" },
  microsoft:         { Icon: FaMicrosoft,         bg: "#5E5E5E" },
  microsoft365:      { Icon: FaMicrosoft,         bg: "#D83B01" },
};

// Brands NOT in react-icons/si — render a tasteful custom SVG mark.
// (Gong, Mixpanel, Outreach, Salesloft, Clari)
const CUSTOM_BRANDS: Record<string, BrandSpec> = {
  gong: {
    bg: "#8038F4",
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor"
        style={{ width: "100%", height: "100%" }}>
        <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="2.4" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    ),
  },
  outreach: {
    bg: "#5951FF",
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ width: "100%", height: "100%" }}>
        <path d="M5 17 L12 5 L19 17 L15 17 L12 11 L9 17 Z" fill="currentColor" />
      </svg>
    ),
  },
  salesloft: {
    bg: "#3F44A6",
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor"
        style={{ width: "100%", height: "100%" }}>
        <path d="M6 6 L18 6 L18 11 L8 11 L8 13 L18 13 L18 18 L6 18 L6 13 L16 13 L16 11 L6 11 Z" />
      </svg>
    ),
  },
  clari: {
    bg: "#1B1F33",
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="#5DD3F1" strokeWidth="2.6"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ width: "100%", height: "100%" }}>
        <path d="M5 13 L10 18 L19 7" />
      </svg>
    ),
  },
  alphardai: {
    bg: "#266DF0",
    Icon: () => (
      <svg viewBox="-12 -12 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round"
        style={{ width: "100%", height: "100%" }}>
        <line x1="0" y1="-9" x2="0" y2="-3" />
        <line x1="0" y1="3" x2="0" y2="9" />
        <line x1="-9" y1="0" x2="-3" y2="0" />
        <line x1="3" y1="0" x2="9" y2="0" />
        <line x1="-6" y1="-6" x2="-3" y2="-3" />
        <line x1="6" y1="-6" x2="3" y2="-3" />
        <line x1="-6" y1="6" x2="-3" y2="3" />
        <line x1="6" y1="6" x2="3" y2="3" />
      </svg>
    ),
  },
};

function lookup(name: string): BrandSpec | null {
  const n = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (BRANDS[n]) return BRANDS[n];
  if (CUSTOM_BRANDS[n]) return CUSTOM_BRANDS[n];
  // Fuzzy prefix match
  for (const [k, v] of Object.entries({ ...BRANDS, ...CUSTOM_BRANDS })) {
    if (n.startsWith(k.slice(0, 6)) || k.startsWith(n.slice(0, 6))) return v;
  }
  return null;
}

export function BrandLogo({ name, size = 28 }: { name: string; size?: number }) {
  const brand = lookup(name);
  const radius = Math.round(size * 0.225);

  if (brand) {
    const Icon = brand.Icon;
    return (
      <div
        className="grid place-items-center shrink-0"
        style={{
          width: size, height: size,
          borderRadius: radius,
          background: brand.bg,
          color: brand.fg ?? "#FFFFFF",
        }}
      >
        <span style={{ width: size * 0.55, height: size * 0.55, display: "grid", placeItems: "center" }}>
          <Icon size={size * 0.55} />
        </span>
      </div>
    );
  }

  // Fallback — first letter tile
  const letter = (name[0] ?? "?").toUpperCase();
  return (
    <div
      className="grid place-items-center font-semibold shrink-0"
      style={{
        width: size, height: size,
        borderRadius: radius,
        background: "var(--bg-deep)",
        color: "var(--ink-2)",
        fontSize: size * 0.5,
      }}
    >
      {letter}
    </div>
  );
}
