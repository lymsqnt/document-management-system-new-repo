import { ArrowDown, ArrowUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type StatCardVariant = "blue" | "teal" | "purple" | "red";

type StatCardProps = {
  title: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
  variant: StatCardVariant;
  /** Percent change vs last month. Leave undefined to show the description instead. */
  trend?: number | null;
};

const styles = {
  blue: {
    card: "border-blue-100 bg-blue-50",
    icon: "bg-blue-100 text-blue-600",
    value: "text-blue-900",
    sub: "text-blue-600",
  },
  teal: {
    card: "border-teal-100 bg-teal-50",
    icon: "bg-teal-100 text-teal-600",
    value: "text-teal-900",
    sub: "text-teal-600",
  },
  purple: {
    card: "border-purple-100 bg-purple-50",
    icon: "bg-purple-100 text-purple-600",
    value: "text-purple-600",
    sub: "text-purple-600",
  },
  red: {
    card: "border-rose-100 bg-rose-50",
    icon: "bg-rose-100 text-rose-600",
    value: "text-rose-600",
    sub: "text-rose-600",
  },
};

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  variant,
  trend,
}: StatCardProps) {
  const s = styles[variant] ?? styles.blue;
  const hasTrend = typeof trend === "number";

  return (
    <section
      className={`flex min-h-[120px] items-center gap-4 rounded-xl border px-5 py-4 shadow-sm ${s.card}`}
    >
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${s.icon}`}
      >
        <Icon size={26} strokeWidth={1.8} />
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-700">{title}</p>

        <p className={`mt-1 text-4xl font-bold leading-none ${s.value}`}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>

        <p
          className={`mt-2 flex items-center gap-1 text-xs font-medium ${s.sub}`}
        >
          {hasTrend ? (
            <>
              {trend >= 0 ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
              {Math.abs(trend)}% from last month
            </>
          ) : (
            description
          )}
        </p>
      </div>
    </section>
  );
}