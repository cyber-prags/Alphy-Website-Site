import type { NextConfig } from "next";

// When deploying behind a path prefix (e.g. alphard.global/demo-v0.1),
// set BASE_PATH=/demo-v0.1 in the environment.
// Local dev runs without a basePath unless explicitly set.
const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  basePath: basePath || undefined,
  // Make basePath available to client components for raw <img> src and similar.
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  devIndicators: false,
};
export default nextConfig;
