import { Users } from "lucide-react";

type DistributionItem = {
  label: string;
  value: number;
};

type StudentDistributionProps = {
  data: DistributionItem[];
};

const colors = ["#1557D6", "#3B82F6", "#8B5CF6", "#14B8A6", "#60A5FA"];

/** Picks a clean axis step so the top tick is step * 4. */
function getAxisMax(maxValue: number) {
  for (let mag = 1; mag <= 1_000_000; mag *= 10) {
    for (const base of [1, 2, 5]) {
      const step = base * mag;
      if (step * 4 >= maxValue) return step * 4;
    }
  }
  return 4;
}

export default function StudentDistribution({
  data,
}: StudentDistributionProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const axisMax = getAxisMax(maxValue);
  const ticks = [1, 0.75, 0.5, 0.25, 0].map((r) => Math.round(axisMax * r));

  let running = 0;
  const segments = data.map((item, index) => {
    const percentage = total === 0 ? 0 : (item.value / total) * 100;
    const start = running;
    running += percentage;
    return {
      ...item,
      percentage,
      start,
      end: running,
      color: colors[index % colors.length],
    };
  });

  const donutBackground =
    total === 0
      ? "#e2e8f0"
      : `conic-gradient(${segments
          .map((s) => `${s.color} ${s.start}% ${s.end}%`)
          .join(", ")})`;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users size={20} strokeWidth={1.8} className="text-blue-700" />
          <h2 className="text-base font-semibold text-blue-900">
            Student Distribution by Year Level
          </h2>
        </div>

        <span className="whitespace-nowrap rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
          Total Students: {total.toLocaleString()}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* BAR CHART */}
        <div className="relative ml-9 mb-8 h-[210px]">
          {/* GRID + Y LABELS */}
          {ticks.map((tick) => (
            <div
              key={tick}
              className="absolute left-0 right-0"
              style={{ bottom: `${(tick / axisMax) * 100}%` }}
            >
              <span className="absolute -left-9 w-7 -translate-y-1/2 text-right text-xs text-slate-500">
                {tick}
              </span>
              <div className="h-px w-full bg-slate-200" />
            </div>
          ))}

          {/* BARS */}
          <div className="absolute inset-0 flex items-end justify-around gap-3 px-2">
            {data.map((item, index) => {
              const percentage =
                total === 0 ? 0 : Math.round((item.value / total) * 100);
              const height = (item.value / axisMax) * 100;

              return (
                <div
                  key={item.label}
                  className="relative flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                >
                  <div className="mb-1 text-center text-xs leading-tight text-slate-600">
                    {item.value} ({percentage}%)
                  </div>

                  <div
                    className="w-full max-w-[52px] rounded-t-sm"
                    style={{
                      height: `${height}%`,
                      minHeight: item.value > 0 ? 4 : 0,
                      backgroundColor: colors[index % colors.length],
                    }}
                  />

                  <span className="absolute top-full mt-2 whitespace-nowrap text-xs text-slate-600">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* DONUT + LEGEND */}
        <div className="flex items-center justify-center gap-6">
          <div
            className="flex h-[150px] w-[150px] shrink-0 items-center justify-center rounded-full"
            style={{ background: donutBackground }}
          >
            <div className="flex h-[100px] w-[100px] flex-col items-center justify-center rounded-full bg-white">
              <span className="text-[11px] text-slate-500">Total Students</span>
              <span className="text-xl font-bold text-blue-950">
                {total.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {segments.map((segment) => (
              <div key={segment.label} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="w-[62px] text-sm text-slate-700">
                  {segment.label}
                </span>
                <span className="text-sm text-slate-500">
                  {Math.round(segment.percentage)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}