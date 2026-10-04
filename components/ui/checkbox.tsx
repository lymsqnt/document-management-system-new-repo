"use client";

import type { InputHTMLAttributes } from "react";

type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label?: string;
  labelClassName?: string;
};

export default function Checkbox({
  label,
  className = "",
  labelClassName = "",
  ...props
}: CheckboxProps) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2">
      <input
        {...props}
        type="checkbox"
        className={`checkbox checkbox-sm shrink-0 ${className}`}
      />

      {label && (
        <span className={`text-sm text-slate-600 ${labelClassName}`}>
          {label}
        </span>
      )}
    </label>
  );
}