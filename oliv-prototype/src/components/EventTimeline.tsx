type Props = {
  data: number[][];      // rows × cols, each cell 0-4 intensity
  cellSize?: number;
  gap?: number;
  showLabels?: boolean;
};

const ROW_LABELS = ["D", "W", "M", "Q", "H"];

const intensityColor = (v: number, max = 4) => {
  if (v <= 0) return "var(--bg-deep)";
  const ratio = v / max;
  if (ratio < 0.4)  return "#C7E9D0";
  if (ratio < 0.7)  return "#7DC78E";
  if (ratio < 0.95) return "#3FA45A";
  return "#1F7A39";
};

export function EventTimeline({ data, cellSize = 10, gap = 3, showLabels = true }: Props) {
  if (!data || data.length === 0) return null;
  return (
    <div className="flex items-center gap-2">
      {showLabels && (
        <div className="flex flex-col" style={{ gap }}>
          {ROW_LABELS.slice(0, data.length).map((l) => (
            <div key={l} className="font-mono text-muted-2 select-none"
              style={{ fontSize: 9, lineHeight: `${cellSize}px`, height: cellSize, letterSpacing: "0.06em" }}>
              {l}
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-col" style={{ gap }}>
        {data.map((row, r) => (
          <div key={r} className="flex" style={{ gap }}>
            {row.map((v, c) => (
              <div key={c}
                title={`Intensity ${v} of 4`}
                style={{
                  width: cellSize, height: cellSize,
                  borderRadius: cellSize * 0.25,
                  background: intensityColor(v),
                }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MiniTimeline({ data, cellSize = 9, gap = 2, showLabels = true }: { data: number[][]; cellSize?: number; gap?: number; showLabels?: boolean }) {
  return <EventTimeline data={data} cellSize={cellSize} gap={gap} showLabels={showLabels} />;
}
