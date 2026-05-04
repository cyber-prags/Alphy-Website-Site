"use client";

import { useState } from "react";
import {
  SiSalesforce, SiHubspot, SiSlack, SiGmail, SiZoom, SiAirtable, SiAuth0,
  SiDatadog, SiGithub, SiSnowflake, SiStripe, SiNotion, SiLinear, SiVercel,
  SiShopify, SiCloudflare, SiSiemens, SiAkamai, SiHsbc, SiGitlab, SiAsana,
  SiMongodb, SiGooglecalendar, SiZendesk, SiIntercom, SiMixpanel,
} from "react-icons/si";
import type { IconType } from "react-icons";

type Brand = {
  Icon?: IconType;
  color: string;
  bg: string;
  short?: string;
  domain?: string;
};

// Normalize a company name to a stable lookup key.
const keyOf = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

// Real-brand registry. Where simple-icons covers it, we render the icon directly.
// Where it doesn't, we keep a domain so the Clearbit fallback can produce a real logo.
const BRANDS: Record<string, Brand> = {
  // === Customers / prospects (real companies) ===
  stripe:                 { Icon: SiStripe,     color: "#FFFFFF", bg: "#635BFF", domain: "stripe.com" },
  stripeinc:              { Icon: SiStripe,     color: "#FFFFFF", bg: "#635BFF", domain: "stripe.com" },
  snowflake:              { Icon: SiSnowflake,  color: "#FFFFFF", bg: "#29B5E8", domain: "snowflake.com" },
  snowflakeinc:           { Icon: SiSnowflake,  color: "#FFFFFF", bg: "#29B5E8", domain: "snowflake.com" },
  datadog:                { Icon: SiDatadog,    color: "#FFFFFF", bg: "#632CA6", domain: "datadoghq.com" },
  datadoginc:             { Icon: SiDatadog,    color: "#FFFFFF", bg: "#632CA6", domain: "datadoghq.com" },
  shopify:                { Icon: SiShopify,    color: "#FFFFFF", bg: "#7AB55C", domain: "shopify.com" },
  shopifyinc:             { Icon: SiShopify,    color: "#FFFFFF", bg: "#7AB55C", domain: "shopify.com" },
  rivian:                 { color: "#FFFFFF", bg: "#FFD400", domain: "rivian.com", short: "R" },
  rivianautomotive:       { color: "#FFFFFF", bg: "#FFD400", domain: "rivian.com", short: "R" },
  nextera:                { color: "#FFFFFF", bg: "#1F75BC", domain: "nexteraenergy.com", short: "NE" },
  nexteraenergy:          { color: "#FFFFFF", bg: "#1F75BC", domain: "nexteraenergy.com", short: "NE" },
  siemens:                { Icon: SiSiemens,    color: "#FFFFFF", bg: "#009999", domain: "siemens.com" },
  siemensag:              { Icon: SiSiemens,    color: "#FFFFFF", bg: "#009999", domain: "siemens.com" },
  lockheed:               { color: "#FFFFFF", bg: "#0033A0", domain: "lockheedmartin.com", short: "LM" },
  lockheedmartin:         { color: "#FFFFFF", bg: "#0033A0", domain: "lockheedmartin.com", short: "LM" },
  telstra:                { color: "#FFFFFF", bg: "#0099F8", domain: "telstra.com.au", short: "T" },
  telstragroupltd:        { color: "#FFFFFF", bg: "#0099F8", domain: "telstra.com.au", short: "T" },
  mongodb:                { Icon: SiMongodb,    color: "#FFFFFF", bg: "#13AA52", domain: "mongodb.com" },
  mongodbinc:             { Icon: SiMongodb,    color: "#FFFFFF", bg: "#13AA52", domain: "mongodb.com" },
  cloudflare:             { Icon: SiCloudflare, color: "#FFFFFF", bg: "#F38020", domain: "cloudflare.com" },
  cloudflareinc:          { Icon: SiCloudflare, color: "#FFFFFF", bg: "#F38020", domain: "cloudflare.com" },
  vercel:                 { Icon: SiVercel,     color: "#FFFFFF", bg: "#000000", domain: "vercel.com" },
  vercelinc:              { Icon: SiVercel,     color: "#FFFFFF", bg: "#000000", domain: "vercel.com" },
  linear:                 { Icon: SiLinear,     color: "#FFFFFF", bg: "#5E6AD2", domain: "linear.app" },
  linearsoftwareinc:      { Icon: SiLinear,     color: "#FFFFFF", bg: "#5E6AD2", domain: "linear.app" },
  patagonia:              { color: "#FFFFFF", bg: "#7C3F00", domain: "patagonia.com", short: "P" },
  comcast:                { color: "#FFFFFF", bg: "#1F69FF", domain: "comcast.com", short: "C" },
  comcastcorporation:     { color: "#FFFFFF", bg: "#1F69FF", domain: "comcast.com", short: "C" },
  raytheon:               { color: "#FFFFFF", bg: "#C8102E", domain: "rtx.com", short: "RT" },
  raytheontechnologies:   { color: "#FFFFFF", bg: "#C8102E", domain: "rtx.com", short: "RT" },
  tableau:                { color: "#FFFFFF", bg: "#1F457E", domain: "tableau.com", short: "T" },
  tableausoftware:        { color: "#FFFFFF", bg: "#1F457E", domain: "tableau.com", short: "T" },
  akamai:                 { Icon: SiAkamai,     color: "#FFFFFF", bg: "#0099CC", domain: "akamai.com" },
  akamaitechnologies:     { Icon: SiAkamai,     color: "#FFFFFF", bg: "#0099CC", domain: "akamai.com" },
  internationalpaper:     { color: "#FFFFFF", bg: "#1F4E79", domain: "internationalpaper.com", short: "IP" },
  sephora:                { color: "#FFFFFF", bg: "#000000", domain: "sephora.com", short: "S" },
  lathamwatkins:          { color: "#FFFFFF", bg: "#0F2545", domain: "lw.com", short: "L&W" },
  latham:                 { color: "#FFFFFF", bg: "#0F2545", domain: "lw.com", short: "L&W" },
  hsbc:                   { Icon: SiHsbc,       color: "#FFFFFF", bg: "#DB0011", domain: "hsbc.com" },
  hsbcholdings:           { Icon: SiHsbc,       color: "#FFFFFF", bg: "#DB0011", domain: "hsbc.com" },
  gitlab:                 { Icon: SiGitlab,     color: "#FFFFFF", bg: "#FC6D26", domain: "gitlab.com" },
  gitlabinc:              { Icon: SiGitlab,     color: "#FFFFFF", bg: "#FC6D26", domain: "gitlab.com" },
  bostondynamics:         { color: "#FFFFFF", bg: "#0B1320", domain: "bostondynamics.com", short: "BD" },
  asana:                  { Icon: SiAsana,      color: "#FFFFFF", bg: "#F06A6A", domain: "asana.com" },

  // === Common reference brands ===
  notion:                 { Icon: SiNotion,     color: "#FFFFFF", bg: "#000000", domain: "notion.so" },
  github:                 { Icon: SiGithub,     color: "#FFFFFF", bg: "#181717", domain: "github.com" },
  linkedin:               { color: "#FFFFFF", bg: "#0A66C2", domain: "linkedin.com", short: "in" },

  // === Integrations ===
  salesforce:             { Icon: SiSalesforce, color: "#FFFFFF", bg: "#00A1E0", domain: "salesforce.com" },
  hubspot:                { Icon: SiHubspot,    color: "#FFFFFF", bg: "#FF7A59", domain: "hubspot.com" },
  slack:                  { Icon: SiSlack,      color: "#FFFFFF", bg: "#4A154B", domain: "slack.com" },
  gmail:                  { Icon: SiGmail,      color: "#FFFFFF", bg: "#EA4335", domain: "gmail.com" },
  zoom:                   { Icon: SiZoom,       color: "#FFFFFF", bg: "#0B5CFF", domain: "zoom.us" },
  airtable:               { Icon: SiAirtable,   color: "#FFFFFF", bg: "#18BFFF", domain: "airtable.com" },
  okta:                   { Icon: SiAuth0,      color: "#FFFFFF", bg: "#007DC1", domain: "okta.com" },
  googlecalendar:         { Icon: SiGooglecalendar, color: "#FFFFFF", bg: "#4285F4", domain: "calendar.google.com" },
  outlook:                { color: "#FFFFFF", bg: "#0078D4", domain: "outlook.com", short: "O" },
  zendesk:                { Icon: SiZendesk,    color: "#FFFFFF", bg: "#03363D", domain: "zendesk.com" },
  intercom:               { Icon: SiIntercom,   color: "#FFFFFF", bg: "#1F8DED", domain: "intercom.com" },
  segment:                { color: "#FFFFFF", bg: "#52BD94", domain: "segment.com", short: "S" },
  amplitude:              { color: "#FFFFFF", bg: "#1E61F0", domain: "amplitude.com", short: "A" },
  mixpanel:               { Icon: SiMixpanel,   color: "#FFFFFF", bg: "#7856FF", domain: "mixpanel.com" },
};

export function getBrand(name: string): Brand | null {
  return BRANDS[keyOf(name)] ?? null;
}

const initialsOf = (n: string) =>
  n.split(/[\s&]+/).filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase() || "·";

const colorFor = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360} 60% 92%)`;
};
const inkFor = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360} 50% 28%)`;
};

type Props = { name: string; domain?: string; size?: number; rounded?: number; className?: string };

export function Logo({ name, domain, size = 28, rounded = 6, className = "" }: Props) {
  const brand = getBrand(name);
  const resolvedDomain = (domain ?? brand?.domain ?? "").replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  // 0 = use simple-icons brand mark, 1 = use Clearbit, 2 = favicon, 3 = initials
  const initialStage: 0 | 1 | 2 | 3 = brand?.Icon ? 0 : resolvedDomain ? 1 : 3;
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(initialStage);

  if (stage === 0 && brand?.Icon) {
    const { Icon, color, bg } = brand;
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 ${className}`}
        style={{ width: size, height: size, borderRadius: rounded, background: bg, color }}
        aria-label={name}
      >
        <Icon size={size * 0.55} color={color} />
      </span>
    );
  }

  if ((stage === 1 || stage === 2) && resolvedDomain) {
    const src = stage === 1
      ? `https://logo.clearbit.com/${resolvedDomain}`
      : `https://www.google.com/s2/favicons?domain=${resolvedDomain}&sz=128`;
    return (
      <span
        className={`inline-flex items-center justify-center bg-white shrink-0 overflow-hidden border border-line ${className}`}
        style={{ width: size, height: size, borderRadius: rounded }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={name}
          width={size}
          height={size}
          loading="lazy"
          onError={() => setStage((s) => (s + 1) as 0 | 1 | 2 | 3)}
          style={{ width: size, height: size, objectFit: "contain", padding: Math.max(2, Math.round(size * 0.1)) }}
        />
      </span>
    );
  }

  // Initials fallback
  const short = brand?.short ?? initialsOf(name);
  const bg = brand?.bg ?? colorFor(name);
  const color = brand?.color ?? inkFor(name);
  return (
    <span
      className={`inline-flex items-center justify-center font-semibold shrink-0 ${className}`}
      style={{
        width: size, height: size, borderRadius: rounded,
        background: bg, color,
        fontSize: Math.max(9, Math.round(size * (short.length > 1 ? 0.34 : 0.42))),
        letterSpacing: "0.02em",
      }}
      aria-label={name}
    >
      {short}
    </span>
  );
}
