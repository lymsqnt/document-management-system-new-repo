"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

type GroupedSelectOption = {
  value: string;
  label: string;
  description?: string;
};

type GroupedSelectGroup = {
  group: string;
  options: GroupedSelectOption[];
};

type GroupedSelectProps = {
  value: string;
  onChange: (value: string) => void;
  groups: GroupedSelectGroup[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Text for the trigger when a value is selected. Falls back to the label. */
  selectedLabel?: string;
};

const MIN_MENU_HEIGHT = 160;
const MAX_MENU_HEIGHT = 280;

/**
 * Select whose menu is grouped under a parent heading (e.g. a college).
 * The menu renders in a portal so no ancestor stacking context or sibling
 * field can paint over it, and it flips above the trigger near the viewport
 * bottom.
 */
export default function GroupedSelect({
  value,
  onChange,
  groups,
  placeholder = "Select option",
  disabled = false,
  className = "",
  selectedLabel,
}: GroupedSelectProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [placement, setPlacement] = useState<"bottom" | "top">(
    "bottom"
  );
  const [position, setPosition] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    width: 0,
    maxHeight: 280,
  });

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = useMemo(() => {
    for (const group of groups) {
      const match = group.options.find(
        (option) => option.value === value
      );

      if (match) return { match, group: group.group };
    }

    return null;
  }, [groups, value]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keep the menu glued to the trigger while it is open.
  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;

      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();

      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Flip above only when the menu genuinely does not fit below.
      const flip =
        spaceBelow < MIN_MENU_HEIGHT && spaceAbove > spaceBelow;

      const available = (flip ? spaceAbove : spaceBelow) - 12;

      const maxHeight = Math.max(
        MIN_MENU_HEIGHT,
        Math.min(MAX_MENU_HEIGHT, available)
      );

      setPlacement(flip ? "top" : "bottom");
      setPosition({
        top: flip ? 0 : rect.bottom + 4,
        // Anchoring by `bottom` keeps the menu above the trigger without a
        // translate, so the open animation is free to animate transform.
        bottom: flip ? window.innerHeight - rect.top + 4 : 0,
        left: rect.left,
        width: rect.width,
        maxHeight,
      });
    };

    updatePosition();

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        !triggerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener(
      "mousedown",
      handlePointerDown
    );
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener(
        "scroll",
        updatePosition,
        true
      );
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open]);

  const handleSelect = (
    optionValue: string
  ) => {
    onChange(optionValue);
    setOpen(false);
  };

  const triggerText =
    selectedLabel ??
    selectedOption?.match.label ??
    placeholder;

  return (
    <div className={`relative w-full font-sans ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`flex min-h-9 w-full items-center justify-between gap-2 rounded-md border bg-white px-3 py-1.5 text-left font-sans text-[12px] outline-none transition ${
          disabled
            ? "cursor-not-allowed bg-slate-100 text-slate-400"
            : open
              ? "border-blue-500 ring-1 ring-blue-500"
              : "border-slate-300 text-slate-700 hover:border-slate-400"
        }`}
      >
        <span className="flex min-w-0 flex-col">
          {selectedOption ? (
            <>
              <span className="truncate text-[9px] font-medium uppercase tracking-wide text-slate-400">
                {selectedOption.group}
              </span>

              <span className="truncate font-sans text-[12px] text-slate-700">
                {triggerText}
              </span>
            </>
          ) : (
            <span className="truncate font-sans text-[12px] text-slate-400">
              {placeholder}
            </span>
          )}
        </span>

        <ChevronDown
          size={15}
          strokeWidth={1.8}
          className={`shrink-0 text-slate-500 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {mounted &&
        open &&
        !disabled &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            style={{
              position: "fixed",
              top: placement === "bottom" ? position.top : undefined,
              bottom:
                placement === "top"
                  ? position.bottom
                  : undefined,
              left: position.left,
              width: position.width,
              maxHeight: position.maxHeight,
            }}
            className={`z-[9999] overflow-y-auto rounded-md border border-slate-200 bg-white p-1 font-sans shadow-xl ${
              placement === "top"
                ? "origin-bottom"
                : "origin-top"
            } animate-[grouped-select-in_140ms_ease-out]`}
          >
            {groups.map((group, groupIndex) => (
              <div
                key={group.group}
                className={
                  groupIndex > 0
                    ? "mt-1 border-t border-slate-100 pt-1"
                    : ""
                }
              >
                <p className="px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  {group.group}
                </p>

                {group.options.map((option) => {
                  const isSelected =
                    option.value === value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() =>
                        handleSelect(option.value)
                      }
                      className={`flex w-full items-start gap-2 rounded-md px-3 py-2 text-left font-sans text-[12px] transition-colors ${
                        isSelected
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="flex-1">
                        <span className="block font-sans text-[12px]">
                          {option.label}
                        </span>

                        <span className="block text-[9px] text-slate-400">
                          {option.description ??
                            option.value}
                        </span>
                      </span>

                      {isSelected && (
                        <Check
                          size={14}
                          strokeWidth={2}
                          className="mt-0.5 shrink-0 text-blue-600"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
