import { meddpiccLabels } from "@/lib/mock";

export function MeddpiccChips({ bits }: { bits: number[] }) {
  return (
    <div className="flex items-center gap-0.5">
      {meddpiccLabels.map((l, i) => {
        const on = bits[i] === 1;
        return (
          <span
            key={i}
            className="w-4 h-4 rounded-full grid place-items-center text-[8.5px] font-semibold tnum"
            style={{
              background: on ? "var(--ink)" : "transparent",
              color: on ? "white" : "var(--muted-2)",
              border: on ? "0" : "1px solid var(--line)",
            }}
            title={l}
          >
            {l}
          </span>
        );
      })}
    </div>
  );
}
