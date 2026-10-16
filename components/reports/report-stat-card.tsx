import type { LucideIcon } from "lucide-react";

export type ReportStatCardData = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone: string;
};

type ReportStatCardProps = {
  card: ReportStatCardData;
};

export default function ReportStatCard({ card }: ReportStatCardProps) {
  const Icon = card.icon;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm print:break-inside-avoid print:border print:border-slate-300 print:shadow-none">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.tone}`}
        >
          <Icon size={19} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[11px] text-slate-500">{card.label}</p>
          <p className="text-xl font-semibold text-slate-900">{card.value}</p>
        </div>
      </div>
    </div>
  );
}
