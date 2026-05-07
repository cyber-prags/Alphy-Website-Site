"use client";

import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────
// PersonAvatar — gender-aware dummy headshot per name.
// Uses randomuser.me (gender-explicit photo set) when we know the gender,
// fall back to a deterministic pravatar.cc photo otherwise.
// Falls back to initials if the image errors.
// ─────────────────────────────────────────────────────────────────────

// Curated gender map for the demo cast. Add entries here when you
// introduce a new character so their avatar gender is correct.
const GENDER_MAP: Record<string, "male" | "female"> = {
  // App user / current persona placeholders
  "Pragyan Jyoti Dutta": "male",
  "Pragyan Dutta": "male",
  "Walid Qayoumi": "male",
  "Joe": "male",

  // Sales / AM / CSM team (rep names)
  "Brad Allen": "male",
  "Brad Wallace": "male",
  "Sarah Chen": "female",
  "Paul Acker": "male",
  "Lisa Park": "female",
  "Rachel Kim": "female",
  "Derek Evans": "male",
  "Mike Torres": "male",
  "Tom Walker": "male",

  // Manager / forecast team
  "Cassandra Rivers": "female",
  "James Smith": "male",
  "Laura Thompson": "female",
  "Ryan Miller": "male",
  "Grace Simmons": "female",
  "Avery Brooks": "male",

  // Customer champions / sponsors
  "Maya Chen": "female",
  "James Whitfield": "male",
  "Priya Sharma": "female",
  "Priya Patel": "female",
  "Priya Gupta": "female",
  "Alex Rivera": "male",
  "Sam Patel": "male",
  "Owen Marsh": "male",
  "Lara Ng": "female",
  "Ben Liu": "male",
  "Rohan Das": "male",
  "Mira Cohen": "female",
  "Dev Kapoor": "male",
  "Jay Patel": "male",
  "Sara Nguyen": "female",
  "Ling Wei": "female",

  // Landing-page testimonials
  "Maria Rojas": "female",
  "James Chen": "male",
};

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Deterministic numeric seed from name
function seedNumber(name: string, max: number): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return h % max;
}

// Pick the avatar URL for a person:
// - If we know the gender, use randomuser.me's gender-explicit photo set
// - Otherwise use pravatar.cc as a deterministic fallback
function avatarUrl(name: string, size: number, genderOverride?: "male" | "female"): string {
  const gender = genderOverride ?? GENDER_MAP[name];
  if (gender) {
    const seed = seedNumber(name, 100);
    const folder = gender === "male" ? "men" : "women";
    return `https://randomuser.me/api/portraits/${folder}/${seed}.jpg`;
  }
  // Fallback — pravatar.cc range 1..70
  const seed = (seedNumber(name, 70) + 1);
  return `https://i.pravatar.cc/${size * 2}?img=${seed}`;
}

export function PersonAvatar({
  name,
  size = 28,
  ring,
  shape = "circle",
  gender,
}: {
  name: string;
  size?: number;
  /** Optional outline ring colour (useful on grouped/overlapping avatars) */
  ring?: string;
  shape?: "circle" | "rounded";
  /** Force a gender if you know the person isn't in the map */
  gender?: "male" | "female";
}) {
  const [errored, setErrored] = useState(false);
  const initials = deriveInitials(name);
  const url = avatarUrl(name, size, gender);
  const radius = shape === "circle" ? size / 2 : Math.round(size * 0.225);

  if (errored) {
    return (
      <span
        className="inline-grid place-items-center font-semibold shrink-0"
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          background: "var(--ink)",
          color: "white",
          fontSize: size * 0.42,
          boxShadow: ring ? `0 0 0 2px ${ring}` : undefined,
        }}
      >
        {initials}
      </span>
    );
  }

  return (
    <img
      src={url}
      alt={name}
      width={size}
      height={size}
      onError={() => setErrored(true)}
      className="shrink-0 object-cover"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: "var(--bg-deep)",
        boxShadow: ring ? `0 0 0 2px ${ring}` : undefined,
      }}
    />
  );
}

/**
 * Cluster — render up to N overlapping avatars + a "+x" chip.
 */
export function PersonAvatarCluster({
  names,
  size = 22,
  max = 4,
  ring = "var(--surface)",
}: {
  names: string[];
  size?: number;
  max?: number;
  ring?: string;
}) {
  const shown = names.slice(0, max);
  const overflow = names.length - shown.length;
  return (
    <div className="inline-flex items-center">
      {shown.map((n, i) => (
        <span
          key={i}
          style={{ marginLeft: i === 0 ? 0 : -size * 0.35 }}
          className="relative"
        >
          <PersonAvatar name={n} size={size} ring={ring} />
        </span>
      ))}
      {overflow > 0 && (
        <span
          style={{ marginLeft: -size * 0.35, width: size, height: size }}
          className="grid place-items-center text-[10px] font-semibold text-ink-2 rounded-full"
        >
          <span
            style={{
              width: size,
              height: size,
              borderRadius: "50%",
              background: "var(--bg-deep)",
              border: "1px solid var(--line)",
              boxShadow: `0 0 0 2px ${ring}`,
            }}
            className="grid place-items-center"
          >
            +{overflow}
          </span>
        </span>
      )}
    </div>
  );
}
