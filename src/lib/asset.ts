// Prefix a /public asset path with the deploy basePath if set.
// Use for raw <img src>, CSS background-image url(), and anywhere
// Next's automatic Link/Image handling doesn't apply.
//
//   <img src={asset("/screenshots/home-am.png")} />
//
// In dev (no BASE_PATH) this is a no-op; in production behind
// alphard.global/demo-v0.1 it returns "/demo-v0.1/screenshots/...".

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function asset(path: string): string {
  if (!path.startsWith("/")) return path;
  return BASE + path;
}
