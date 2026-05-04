import type { Stage } from "@/lib/mock";
import { stageColor } from "@/lib/mock";

export function StagePill({ stage, done, total }: { stage: Stage; done: number; total: number }) {
  const pct = total > 0 ? done / total : 0;
  const c = stageColor[stage];
  return (
    <div className="flex flex-col gap-1 min-w-[110px]">
      <div className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink">
        <span className="truncate">{stage}</span>
        <span
          className="text-[10px] font-mono tnum px-1.5 rounded"
          style={{ background: "var(--bg-deep)", color: c }}
        >
          {done}/{total}
        </span>
      </div>
      <div className="flex items-center gap-[2px]">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className="h-[3px] flex-1 rounded-full"
            style={{ background: i < done ? c : "var(--line)" }}
          />
        ))}
      </div>
    </div>
  );
}
