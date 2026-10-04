"use client";

import type { LucideIcon } from "lucide-react";

type ProfileInputProps = {
  label: string;
  value: string;
  icon?: LucideIcon;
  editing: boolean;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
};

export default function ProfileInput({
  label,
  value,
  icon: Icon,
  editing,
  onChange,
  type = "text",
  placeholder,
}: ProfileInputProps) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block px-1 text-xs font-medium text-slate-800">
        {label}
      </span>

      <span className="flex h-9 w-full items-center gap-2 rounded-md border border-slate-300 bg-white px-2">
        {Icon && (
          <Icon size={15} className="shrink-0 text-slate-500" />
        )}

        <input
          type={type}
          value={value}
          readOnly={!editing}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-w-0 bg-white text-[11px] !text-slate-900 outline-none placeholder:text-slate-400 read-only:cursor-default"
        />
      </span>
    </label>
  );
}