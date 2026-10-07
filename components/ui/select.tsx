"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export default function Select({
  value,
  onChange,
  options,
  placeholder = "Select option",
  disabled = false,
  className = "",
}: SelectProps) {
  const [open, setOpen] = useState(false);

  const selectRef =
    useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find(
    (option) => option.value === value
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setOpen(false);
  };

  return (
    <div
      ref={selectRef}
      className={`relative w-full font-sans ${className}`}
    >
      {/* SELECT BUTTON */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={`flex h-9 w-full items-center justify-between rounded-md border bg-white px-3 text-left font-sans text-[12px] outline-none transition ${
          disabled
            ? "cursor-not-allowed bg-slate-100 text-slate-400"
            : open
              ? "border-blue-500 ring-1 ring-blue-500"
              : "border-slate-300 text-slate-700 hover:border-slate-400"
        }`}
      >
        <span
          className={
            selectedOption
              ? "font-sans text-[12px] text-slate-700"
              : "font-sans text-[12px] text-slate-400"
          }
        >
          {selectedOption?.label || placeholder}
        </span>

        <ChevronDown
          size={15}
          strokeWidth={1.8}
          className={`shrink-0 text-slate-500 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* DROPDOWN */}
      {open && !disabled && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-slate-200 bg-white p-1 font-sans shadow-lg">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => {
              const isSelected =
                option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    handleSelect(option.value)
                  }
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left font-sans text-[12px] transition-colors ${
                    isSelected
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`text-[12px] ${
                      isSelected
                        ? "text-blue-600"
                        : "text-slate-400"
                    }`}
                  >
                    •
                  </span>

                  <span className="flex-1 font-sans text-[12px]">
                    {option.label}
                  </span>

                  {isSelected && (
                    <Check
                      size={14}
                      strokeWidth={2}
                      className="text-blue-600"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}