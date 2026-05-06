import type { ForecastCategory } from "@/lib/mock";
import { forecastColor } from "@/lib/mock";

export function ForecastPill({ category, prob }: { category: ForecastCategory; prob: number }) {
  const c = forecastColor[category];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 h-6 rounded-full text-[11.5px] font-medium"
      style={{ background: c.bg, color: c.ink }}
    >
      {category}
      <span
        className="grid place-items-center w-5 h-5 rounded-full text-[9.5px] font-mono tnum"
        style={{ background: "rgba(255,255,255,0.15)", color: c.ink }}
      >
        {prob}
      </span>
    </span>
  );
}
