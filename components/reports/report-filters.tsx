"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  FileSpreadsheet,
  Filter,
  Printer,
  RotateCcw,
} from "lucide-react";
import type { ComplianceStatus } from "@/lib/reports";

export type ReportFiltersState = {
  course: string;
  major: string;
  yearLevel: string;
  status: string;
};

type ReportFiltersProps = {
  filters: ReportFiltersState;
  courses: string[];
  majorsByCourse: Record<string, string[]>;
  yearLevels: string[];
  statusOptions: ComplianceStatus[];
  hasFilters: boolean;
  canExport: boolean;
  onChange: (next: ReportFiltersState) => void;
  onReset: () => void;
  onPrint: () => void;
  onExport: () => void;
};

const ALL = "All";

const EMPTY_FILTERS: ReportFiltersState = {
  course: ALL,
  major: ALL,
  yearLevel: ALL,
  status: ALL,
};

const selectClass =
  "h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

export default function ReportFilters({
  filters,
  courses,
  majorsByCourse,
  yearLevels,
  statusOptions,
  hasFilters,
  canExport,
  onChange,
  onReset,
  onPrint,
  onExport,
}: ReportFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftFilters, setDraftFilters] =
    useState<ReportFiltersState>({ ...filters });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setDraftFilters({ ...filters });
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDraftFilters({ ...filters });
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, filters]);

  const openFilters = () => {
    setDraftFilters({ ...filters });
    setIsOpen(true);
  };

  const cancelFilters = () => {
    setDraftFilters({ ...filters });
    setIsOpen(false);
  };

  const resetDraftFilters = () => {
    setDraftFilters({ ...EMPTY_FILTERS });
  };

  const applyFilters = () => {
    onChange({ ...draftFilters });
    setIsOpen(false);
  };

  const updateFilter = (
    key: keyof ReportFiltersState,
    value: string,
  ) => {
    setDraftFilters((current) => ({
      ...current,
      [key]: value,
      ...(key === "course" ? { major: ALL } : {}),
    }));
  };

  // Important: use draftFilters.course, not applied filters.course.
  // This makes the Major options update immediately as the user selects a course.
  const selectedMajors =
    draftFilters.course === ALL
      ? []
      : majorsByCourse[draftFilters.course] ?? [];

  const renderArrow = () => (
    <ChevronDown
      size={15}
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
    />
  );

  return (
    <div className="relative z-20 rounded-2xl bg-white p-3 shadow-sm sm:p-4 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div ref={containerRef} className="relative">
          <button
            type="button"
            onClick={() => (isOpen ? cancelFilters() : openFilters())}
            aria-expanded={isOpen}
            aria-controls="report-filters-panel"
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition ${
              isOpen || hasFilters
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Filter size={16} />
            Filters
            {hasFilters && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-semibold text-white">
                {[
                  filters.course !== ALL,
                  filters.major !== ALL,
                  filters.yearLevel !== ALL,
                  filters.status !== ALL,
                ].filter(Boolean).length}
              </span>
            )}
            <ChevronDown
              size={15}
              className={`transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <div
            id="report-filters-panel"
            aria-hidden={!isOpen}
            className={`absolute left-0 top-full z-50 mt-2 w-[min(92vw,680px)] origin-top-left transition-all duration-300 ease-in-out ${
              isOpen
                ? "visible translate-y-0 scale-100 opacity-100"
                : "invisible pointer-events-none -translate-y-2 scale-[0.98] opacity-0"
            }`}
          >
            <div className="max-h-[min(75vh,600px)] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
                <h2 className="text-sm font-semibold text-slate-900">
                  Refine Report
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Choose the criteria for your compliance report.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
                <label className="block text-xs font-medium text-slate-700">
                  Course
                  <span className="relative mt-1.5 block">
                    <select
                      value={draftFilters.course}
                      onChange={(event) =>
                        updateFilter("course", event.target.value)
                      }
                      className={selectClass}
                      disabled={!isOpen}
                    >
                      <option value={ALL}>All Courses</option>
                      {courses.map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>
                    {renderArrow()}
                  </span>
                </label>

                <label className="block text-xs font-medium text-slate-700">
                  Major
                  <span className="relative mt-1.5 block">
                    <select
                      value={draftFilters.major}
                      disabled={!isOpen || selectedMajors.length === 0}
                      onChange={(event) =>
                        updateFilter("major", event.target.value)
                      }
                      className={selectClass}
                    >
                      <option value={ALL}>
                        {draftFilters.course === ALL
                          ? "Select a Course First"
                          : selectedMajors.length === 0
                            ? "No Majors Available"
                            : "All Majors"}
                      </option>
                      {selectedMajors.map((major) => (
                        <option key={major} value={major}>
                          {major}
                        </option>
                      ))}
                    </select>
                    {renderArrow()}
                  </span>
                </label>

                <label className="block text-xs font-medium text-slate-700">
                  Year Level
                  <span className="relative mt-1.5 block">
                    <select
                      value={draftFilters.yearLevel}
                      onChange={(event) =>
                        updateFilter("yearLevel", event.target.value)
                      }
                      className={selectClass}
                      disabled={!isOpen}
                    >
                      <option value={ALL}>All Year Levels</option>
                      {yearLevels.map((yearLevel) => (
                        <option key={yearLevel} value={yearLevel}>
                          {yearLevel}
                        </option>
                      ))}
                    </select>
                    {renderArrow()}
                  </span>
                </label>

                <label className="block text-xs font-medium text-slate-700">
                  Status
                  <span className="relative mt-1.5 block">
                    <select
                      value={draftFilters.status}
                      onChange={(event) =>
                        updateFilter("status", event.target.value)
                      }
                      className={selectClass}
                      disabled={!isOpen}
                    >
                      <option value={ALL}>All Statuses</option>
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    {renderArrow()}
                  </span>
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
                <button
                  type="button"
                  onClick={resetDraftFilters}
                  disabled={!isOpen}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-default"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={cancelFilters}
                    disabled={!isOpen}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={applyFilters}
                    disabled={!isOpen}
                    className="rounded-full bg-blue-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-800"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onPrint}
            disabled={!canExport}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-blue-200 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Printer size={14} />
            Print
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={!canExport}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-blue-700 px-3 text-xs font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FileSpreadsheet size={14} />
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
