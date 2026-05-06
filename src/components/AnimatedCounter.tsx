"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** numeric target — counter animates from 0 to this */
  target: number;
  /** prefix shown before the number, e.g. "$" */
  prefix?: string;
  /** suffix shown after, e.g. "%", "x", " hrs" */
  suffix?: string;
  /** decimals (default 0) */
  decimals?: number;
  /** ms to animate */
  duration?: number;
};

export function AnimatedCounter({
  target, prefix = "", suffix = "", decimals = 0, duration = 1400,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(target * eased);
            if (t < 1) requestAnimationFrame(tick);
            else setValue(target);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);

  const display = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
  return (
    <span ref={ref} className="tnum">
      {prefix}{display}{suffix}
    </span>
  );
}
