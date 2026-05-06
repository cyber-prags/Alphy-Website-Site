"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";

let initialized = false;

function PostHogPageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!initialized) return;
    let url = window.location.origin + pathname;
    const qs = searchParams?.toString();
    if (qs) url += "?" + qs;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (initialized) return;
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
    if (!key) {
      // No key configured — silently skip. Dev sandbox.
      return;
    }
    posthog.init(key, {
      api_host: host,
      person_profiles: "identified_only",
      capture_pageview: false, // we handle pageviews manually so SPA navigation is tracked
      loaded: () => { initialized = true; },
    });
    initialized = true;
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageviewTracker />
      </Suspense>
      {children}
    </>
  );
}
