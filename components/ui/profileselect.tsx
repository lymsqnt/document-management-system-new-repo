"use client";

import type { LucideIcon } from "lucide-react";

type ProfileSelectProps = {
  label: string;
  value: string;
  icon?: LucideIcon;
  editing: boolean;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function ProfileSelect({
  label,
  value,
  icon: Icon,
  editing,
  options,
  onChange,
  placeholder = "Select an option",
}: ProfileSelectProps) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block px-1 text-xs font-medium text-slate-800">
        {label}
      </span>

      <span className="flex h-9 w-full items-center gap-2 rounded-md border border-slate-300 bg-white px-2">
        {Icon && (
          <Icon size={15} className="shrink-0 text-slate-500" />
        )}

        <select
          value={value}
          disabled={!editing}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 bg-white text-[11px] !text-slate-900 outline-none disabled:cursor-default disabled:opacity-100"
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}