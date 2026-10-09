import { FileText } from "lucide-react";

type ActivityItem = {
  date: string;
  uploaded: number;
};

type ActivityChartProps = {
  data: ActivityItem[];
};

function getAxisMax(maxValue: number) {
  for (let mag = 1; mag <= 1_000_000; mag *= 10) {
    for (const base of [1, 2, 5]) {
      const step = base * mag;
      if (step * 4 >= maxValue) return step * 4;
    }
  }
  return 4;
}

export default function ActivityChart({ data }: ActivityChartProps) {
  const width = 900;
  const height = 260;
  const left = 44;
  const right = 16;
  const top = 16;
  const bottom = 36;

  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;

  const maxDataValue = Math.max(...data.map((item) => item.uploaded), 0);
  const maxValue = getAxisMax(maxDataValue);

  const points = data.map((item, index) => ({
    ...item,
    x: left + (index / Math.max(data.length - 1, 1)) * chartWidth,
    y: top + chartHeight - (item.uploaded / maxValue) * chartHeight,
  }));

  const linePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const baseY = top + chartHeight;
  const areaPath =
    points.length > 0
      ? `M ${points[0].x},${baseY} ` +
        points.map((p) => `L ${p.x},${p.y}`).join(" ") +
        ` L ${points[points.length - 1].x},${baseY} Z`
      : "";

  const gridValues = [1, 0.75, 0.5, 0.25, 0].map((r) =>
    Math.round(maxValue * r)
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={20} strokeWidth={1.8} className="text-blue-700" />
          <h2 className="text-base font-semibold text-blue-900">
            Document Uploads & Activities
          </h2>
        </div>

        <button
          type="button"
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700"
        >
          Last 7 Days <span className="ml-2">▾</span>
        </button>
      </div>

      {/* LEGEND */}
      <div className="mt-4 flex items-center gap-5 text-xs">
        <div className="flex items-center gap-1.5 text-blue-600">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
          Uploaded
        </div>
        <div className="flex items-center gap-1.5 text-purple-500">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
          Downloaded
        </div>
        <div className="flex items-center gap-1.5 text-teal-500">
          <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
          Viewed
        </div>
      </div>

      {/* CHART */}
      <div className="mt-3 w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full"
          role="img"
          aria-label="Document uploads over the last 7 days"
        >
          <defs>
            <linearGradient id="uploadArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1557D6" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#1557D6" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {gridValues.map((value) => {
            const y = top + chartHeight - (value / maxValue) * chartHeight;
            return (
              <g key={value}>
                <line
                  x1={left}
                  x2={width - right}
                  y1={y}
                  y2={y}
                  stroke="#e5eaf2"
                  strokeWidth="1"
                />
                <text
                  x={left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#64748b"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {areaPath && <path d={areaPath} fill="url(#uploadArea)" />}

          {points.length > 0 && (
            <polyline
              points={linePoints}
              fill="none"
              stroke="#1557D6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {points.map((p) => (
            <circle key={p.date} cx={p.x} cy={p.y} r="4" fill="#1557D6" />
          ))}

          {points.map((p) => (
            <text
              key={`date-${p.date}`}
              x={p.x}
              y={height - 10}
              textAnchor="middle"
              fontSize="12"
              fill="#475569"
            >
              {p.date}
            </text>
          ))}
        </svg>
      </div>
    </section>
  );
}