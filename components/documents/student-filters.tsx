
"use client";

import type { Dispatch, SetStateAction } from "react";
import {
    ChevronDown,
    FileText,
    Filter,
    Search,
} from "lucide-react";

import { DOCUMENT_TYPES } from "@/lib/constants/student";

export type ProgressFilter =
    | "All Progress"
    | "Completed"
    | "Incomplete"
    | "No Documents Submitted";

export type FilterState = {
    college: string;
    course: string;
    major: string;
    yearLevel: string;
    enrollmentStatus: string;
    progress: ProgressFilter;
    search: string;
};

export type CourseOption = {
    value: string;
    label: string;
};

type StudentFiltersProps = {
    isOpen: boolean;
    draftFilters: FilterState;
    setDraftFilters: Dispatch<SetStateAction<FilterState>>;
    colleges: string[];
    courses: CourseOption[];
    majors: string[];
    yearLevels: string[];
    onReset: () => void;
    onCancel: () => void;
    onApply: () => void;
};

const ALL = "All";

export default function StudentFilters({
    isOpen,
    draftFilters,
    setDraftFilters,
    colleges,
    courses,
    majors,
    yearLevels,
    onReset,
    onCancel,
    onApply,
}: StudentFiltersProps) {
    const selectClass =
        "h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50";

    const updateFilter = <K extends keyof FilterState>(
        key: K,
        value: FilterState[K],
    ) => {
        setDraftFilters((current) => ({
            ...current,
            [key]: value,
        }));
    };

    const renderArrow = () => (
        <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
    );

    // Remove duplicate course values while preserving their labels.
    const uniqueCourses = Array.from(
        new Map(
            courses.map((course) => [course.value, course]),
        ).values(),
    );

    return (
        <section
            id="student-filters-panel"
            aria-label="Refine Students"
            aria-hidden={!isOpen}
            className={`grid transition-[grid-template-rows,opacity,transform,margin] duration-300 ease-in-out ${
                isOpen
                    ? "mt-4 grid-rows-[1fr] translate-y-0 opacity-100"
                    : "pointer-events-none mt-0 grid-rows-[0fr] -translate-y-2 opacity-0"
            }`}
        >
            <div className="min-h-0 overflow-hidden">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <header className="flex items-start justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
                        <div>
                            <h2 className="text-sm font-semibold text-slate-900">
                                Refine Students
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Filter student records
                            </p>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
                        {/* COLLEGE / CLASSIFICATION */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="filter-college"
                                className="block text-xs font-medium text-slate-700"
                            >
                                College / Classification
                            </label>

                            <div className="relative">
                                <select
                                    id="filter-college"
                                    value={draftFilters.college}
                                    onChange={(event) =>
                                        setDraftFilters((current) => ({
                                            ...current,
                                            college: event.target.value,
                                            course: ALL,
                                            major: ALL,
                                            yearLevel: ALL,
                                        }))
                                    }
                                    className={selectClass}
                                    disabled={!isOpen}
                                >
                                    <option value={ALL}>All Colleges</option>

                                    {Array.from(new Set(colleges)).map(
                                        (college) => (
                                            <option
                                                key={college}
                                                value={college}
                                            >
                                                {college}
                                            </option>
                                        ),
                                    )}
                                </select>

                                {renderArrow()}
                            </div>
                        </div>

                        {/* COURSE */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="filter-course"
                                className="block text-xs font-medium text-slate-700"
                            >
                                Course
                            </label>

                            <div className="relative">
                                <select
                                    id="filter-course"
                                    value={draftFilters.course}
                                    onChange={(event) =>
                                        setDraftFilters((current) => ({
                                            ...current,
                                            course: event.target.value,
                                            major: ALL,
                                            yearLevel: ALL,
                                        }))
                                    }
                                    className={selectClass}
                                    disabled={!isOpen}
                                >
                                    <option value={ALL}>All Courses</option>

                                    {uniqueCourses.map((course) => (
                                        <option
                                            key={course.value}
                                            value={course.value}
                                        >
                                            {course.label}
                                        </option>
                                    ))}
                                </select>

                                {renderArrow()}
                            </div>
                        </div>

                        {/* MAJOR */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="filter-major"
                                className="block text-xs font-medium text-slate-700"
                            >
                                Major
                            </label>

                            <div className="relative">
                                <select
                                    id="filter-major"
                                    value={draftFilters.major}
                                    onChange={(event) =>
                                        setDraftFilters((current) => ({
                                            ...current,
                                            major: event.target.value,
                                            yearLevel: ALL,
                                        }))
                                    }
                                    className={selectClass}
                                    disabled={!isOpen}
                                >
                                    <option value={ALL}>All Majors</option>

                                    {Array.from(new Set(majors)).map(
                                        (major) => (
                                            <option
                                                key={major}
                                                value={major}
                                            >
                                                {major}
                                            </option>
                                        ),
                                    )}
                                </select>

                                {renderArrow()}
                            </div>
                        </div>

                        {/* YEAR LEVEL */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="filter-year"
                                className="block text-xs font-medium text-slate-700"
                            >
                                Year Level
                            </label>

                            <div className="relative">
                                <select
                                    id="filter-year"
                                    value={draftFilters.yearLevel}
                                    onChange={(event) =>
                                        updateFilter(
                                            "yearLevel",
                                            event.target.value,
                                        )
                                    }
                                    className={selectClass}
                                    disabled={!isOpen}
                                >
                                    <option value={ALL}>All Year Levels</option>

                                    {Array.from(new Set(yearLevels)).map(
                                        (year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ),
                                    )}
                                </select>

                                {renderArrow()}
                            </div>
                        </div>

                        {/* ENROLLMENT STATUS */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="filter-enrollment"
                                className="block text-xs font-medium text-slate-700"
                            >
                                Enrollment Status
                            </label>

                            <div className="relative">
                                <select
                                    id="filter-enrollment"
                                    value={draftFilters.enrollmentStatus}
                                    onChange={(event) =>
                                        updateFilter(
                                            "enrollmentStatus",
                                            event.target.value,
                                        )
                                    }
                                    className={selectClass}
                                    disabled={!isOpen}
                                >
                                    <option value={ALL}>All Statuses</option>
                                    <option value="Enrolled">Enrolled</option>
                                    <option value="Graduated">Graduated</option>
                                    <option value="Transferred">Transferred</option>
                                </select>

                                {renderArrow()}
                            </div>
                        </div>

                        {/* DOCUMENT PROGRESS */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="filter-progress"
                                className="block text-xs font-medium text-slate-700"
                            >
                                Document Progress
                            </label>

                            <div className="relative">
                                <select
                                    id="filter-progress"
                                    value={draftFilters.progress}
                                    onChange={(event) =>
                                        updateFilter(
                                            "progress",
                                            event.target.value as ProgressFilter,
                                        )
                                    }
                                    className={selectClass}
                                    disabled={!isOpen}
                                >
                                    <option value="All Progress">
                                        All Progress
                                    </option>
                                    <option value="Completed">Completed</option>
                                    <option value="Incomplete">Incomplete</option>
                                    <option value="No Documents Submitted">
                                        No Documents Submitted
                                    </option>
                                </select>

                                {renderArrow()}
                            </div>
                        </div>

                        {/* SEARCH */}
                        <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                            <label
                                htmlFor="filter-search"
                                className="block text-xs font-medium text-slate-700"
                            >
                                Search Student
                            </label>

                            <div className="relative">
                                <Search
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    id="filter-search"
                                    type="search"
                                    value={draftFilters.search}
                                    onChange={(event) =>
                                        updateFilter(
                                            "search",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Student name or Student ID"
                                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                                    disabled={!isOpen}
                                />
                            </div>
                        </div>
                    </div>

                    {/* DOCUMENT NOTE */}
                    <div className="px-4 pb-3 sm:px-5">
                        <p className="text-[11px] leading-5 text-slate-500">
                            <FileText size={13} className="mr-1 inline" />
                            Progress is based on the {DOCUMENT_TYPES.length} required
                            document types.
                        </p>
                    </div>

                    {/* ACTIONS */}
                    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3 sm:px-5">
                        <button
                            type="button"
                            onClick={onReset}
                            disabled={!isOpen}
                            className="rounded-lg px-3 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-default"
                        >
                            Reset
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={!isOpen}
                                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-default"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={onApply}
                                disabled={!isOpen}
                                className="inline-flex items-center gap-1.5 rounded-full bg-blue-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-900 disabled:cursor-default"
                            >
                                <Filter size={14} />
                                Apply Filters
                            </button>
                        </div>
                    </footer>
                </div>
            </div>
        </section>
    );
}
