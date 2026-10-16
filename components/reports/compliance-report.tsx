"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  CircleCheck,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  Printer,
  RotateCcw,
  Users,
  X,
} from "lucide-react";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import {
  COURSE_MAJORS,
  DOCUMENT_TYPES,
  YEAR_LEVELS,
} from "@/lib/constants/student";
import {
  buildComplianceCsv,
  getComplianceStatus,
  summarizeByCourse,
  summarizeByDocument,
  summarizeCompliance,
  type ComplianceStatus,
} from "@/lib/reports";
import { getCurrentUser } from "@/lib/storage/accounts";
import {
  getStudentDocuments,
  STUDENT_DOCUMENTS_KEY,
  STUDENT_DOCUMENTS_UPDATED_EVENT,
} from "@/lib/storage/student-documents";
import { buildStudentSummaries } from "@/lib/students";
import type { StudentSummary } from "@/lib/types/student";

const ALL = "All";

/** Same choices as the Add Student form on the Documents page. */
const COURSES = Object.keys(COURSE_MAJORS);

type Filters = {
  course: string;
  major: string;
  yearLevel: string;
  status: string;
};

const EMPTY_FILTERS: Filters = {
  course: ALL,
  major: ALL,
  yearLevel: ALL,
  status: ALL,
};

const STATUS_OPTIONS: ComplianceStatus[] = ["Completed", "Incomplete"];

const statusStyles: Record<ComplianceStatus, string> = {
  Completed: "bg-emerald-50 text-emerald-700",
  Incomplete: "bg-amber-50 text-amber-700",
};

/** Landscape pages, and keep badge colors when printing. */
const PRINT_STYLES = `@media print {
  @page { size: A4 landscape; margin: 12mm; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}`;

const selectClass =
  "h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

const cardClass =
  "rounded-2xl bg-white p-4 shadow-sm print:break-inside-avoid print:border print:border-slate-300 print:shadow-none";

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/** Courses without majors are saved as "N/A". */
function hasMajor(major: string) {
  return Boolean(major) && major !== "N/A" && major !== "—";
}

export default function ComplianceReport() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [preparedBy, setPreparedBy] = useState("");

  const loadStudents = useCallback(() => {
    try {
      setStudents(buildStudentSummaries(getStudentDocuments()));
    } catch (error) {
      console.error("Failed to load report data:", error);
      setStudents([]);
    }

    setGeneratedAt(new Date());
    setPreparedBy(getCurrentUser()?.fullName.trim() ?? "");
  }, []);

  useEffect(() => {
    const updateSidebar = () => setSidebarOpen(window.innerWidth >= 1024);
    const onStorage = (event: StorageEvent) => {
      if (event.key === STUDENT_DOCUMENTS_KEY) loadStudents();
    };

    loadStudents();
    updateSidebar();
    window.addEventListener("resize", updateSidebar);
    window.addEventListener("storage", onStorage);
    window.addEventListener(STUDENT_DOCUMENTS_UPDATED_EVENT, loadStudents);

    return () => {
      window.removeEventListener("resize", updateSidebar);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(STUDENT_DOCUMENTS_UPDATED_EVENT, loadStudents);
    };
  }, [loadStudents]);

  // Like the Add Student form, majors only exist for some courses.
  const majors =
    filters.course === ALL ? [] : COURSE_MAJORS[filters.course] ?? [];

  const filteredStudents = useMemo(
    () =>
      students.filter(
        (student) =>
          (filters.course === ALL || student.course === filters.course) &&
          (filters.major === ALL || student.major === filters.major) &&
          (filters.yearLevel === ALL ||
            student.yearLevel === filters.yearLevel) &&
          (filters.status === ALL ||
            getComplianceStatus(student) === filters.status),
      ),
    [students, filters],
  );

  const totals = useMemo(
    () => summarizeCompliance(filteredStudents),
    [filteredStudents],
  );
  const byDocument = useMemo(
    () => summarizeByDocument(filteredStudents),
    [filteredStudents],
  );
  const byCourse = useMemo(
    () => summarizeByCourse(filteredStudents),
    [filteredStudents],
  );

  const hasFilters = Object.values(filters).some((value) => value !== ALL);

  const filterSummary = [
    `Course: ${filters.course}`,
    `Major: ${filters.major}`,
    `Year Level: ${filters.yearLevel}`,
    `Status: ${filters.status}`,
  ].join("  •  ");

  const generatedLabel = generatedAt
    ? generatedAt.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  const handleExport = () => {
    const csv = buildComplianceCsv(filteredStudents);
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = window.document.createElement("a");

    link.href = url;
    link.download = `compliance-report-${formatDateKey(new Date())}.csv`;
    link.click();

    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const summaryCards = [
    {
      label: "Total Students",
      value: totals.total,
      icon: Users,
      tone: "bg-blue-50 text-blue-700",
    },
    {
      label: "Completed",
      value: totals.completed,
      icon: CircleCheck,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Incomplete",
      value: totals.incomplete,
      icon: FileText,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "Compliance Rate",
      value: `${totals.complianceRate}%`,
      icon: ClipboardCheck,
      tone: "bg-indigo-50 text-indigo-700",
    },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f2f6fc] text-slate-800 print:bg-white">
      <style>{PRINT_STYLES}</style>

      <div className="print:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      <main
        className={`min-h-screen w-full transition-[margin] duration-300 print:!ml-0 print:!w-full ${
          sidebarOpen ? "lg:ml-[275px] lg:w-[calc(100%-275px)]" : "ml-0 w-full"
        }`}
      >
        {/* `contents` keeps the Topbar sticky while still hiding it in print. */}
        <div className="contents print:hidden">
          <Topbar
            title="Reports"
            onToggleSidebar={() => setSidebarOpen((open) => !open)}
          />
        </div>

        <div className="mx-auto w-full max-w-[1600px] space-y-3 p-3 sm:p-5 lg:p-6 print:max-w-none print:space-y-4 print:p-0">
          {/* Print-only heading */}
          <div className="hidden border-b-2 border-slate-800 pb-3 text-center print:block">
            <p className="text-base font-bold uppercase tracking-wide">
              Quezonian Educational College, Inc.
            </p>
            <p className="text-[11px]">Document Management System</p>
            <h1 className="mt-2 text-lg font-semibold">
              Student Document Compliance Report
            </h1>
            <p className="mt-1 text-[11px] text-slate-600">{filterSummary}</p>
            <p className="text-[11px] text-slate-600">
              Generated {generatedLabel}
              {preparedBy && ` by ${preparedBy}`}
            </p>
          </div>

          {/* Page banner (same treatment as Users and Audit Logs) */}
          <section className="relative flex min-h-[112px] items-center overflow-hidden rounded-2xl bg-gradient-to-r from-[#102c79] via-[#1644a8] to-[#1b4db5] px-5 py-5 text-white shadow-sm sm:px-7 print:hidden">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <ClipboardCheck size={32} />
              </div>
              <div>
                <h1 className="text-xl font-semibold sm:text-2xl">
                  Compliance Report
                </h1>
                <p className="mt-1 max-w-lg text-xs leading-5 text-blue-100 sm:text-sm">
                  See which students have submitted all {DOCUMENT_TYPES.length}{" "}
                  required documents, then print or export the results.
                </p>
              </div>
            </div>
          </section>

          {/* Filters and actions */}
          <section
            aria-label="Report filters"
            className="rounded-2xl bg-white p-3 shadow-sm sm:p-4 print:hidden"
          >
            <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <label className="block text-[11px] font-medium text-slate-600">
                  Course
                  <span className="relative mt-1 block">
                    <select
                      value={filters.course}
                      onChange={(event) =>
                        setFilters((current) => ({
                          ...current,
                          course: event.target.value,
                          major: ALL,
                        }))
                      }
                      className={selectClass}
                    >
                      <option value={ALL}>All Courses</option>
                      {COURSES.map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </span>
                </label>

                <label className="block text-[11px] font-medium text-slate-600">
                  Major
                  <span className="relative mt-1 block">
                    <select
                      value={filters.major}
                      disabled={majors.length === 0}
                      onChange={(event) =>
                        setFilters((current) => ({
                          ...current,
                          major: event.target.value,
                        }))
                      }
                      className={selectClass}
                    >
                      <option value={ALL}>
                        {filters.course !== ALL && majors.length === 0
                          ? "N/A"
                          : "All Majors"}
                      </option>
                      {majors.map((major) => (
                        <option key={major} value={major}>
                          {major}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </span>
                </label>

                <label className="block text-[11px] font-medium text-slate-600">
                  Year Level
                  <span className="relative mt-1 block">
                    <select
                      value={filters.yearLevel}
                      onChange={(event) =>
                        setFilters((current) => ({
                          ...current,
                          yearLevel: event.target.value,
                        }))
                      }
                      className={selectClass}
                    >
                      <option value={ALL}>All Year Levels</option>
                      {YEAR_LEVELS.map((yearLevel) => (
                        <option key={yearLevel} value={yearLevel}>
                          {yearLevel}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </span>
                </label>

                <label className="block text-[11px] font-medium text-slate-600">
                  Status
                  <span className="relative mt-1 block">
                    <select
                      value={filters.status}
                      onChange={(event) =>
                        setFilters((current) => ({
                          ...current,
                          status: event.target.value,
                        }))
                      }
                      className={selectClass}
                    >
                      <option value={ALL}>All Statuses</option>
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </span>
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  disabled={!hasFilters}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  disabled={filteredStudents.length === 0}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-blue-200 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Printer size={14} />
                  Print
                </button>

                <button
                  type="button"
                  onClick={handleExport}
                  disabled={filteredStudents.length === 0}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-700 px-3 text-xs font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FileSpreadsheet size={14} />
                  Export CSV
                </button>
              </div>
            </div>
          </section>

          {/* Summary */}
          <section
            aria-label="Compliance summary"
            className="grid grid-cols-2 gap-3 lg:grid-cols-4 print:grid-cols-4"
          >
            {summaryCards.map((card) => (
              <div key={card.label} className={cardClass}>
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.tone}`}
                  >
                    <card.icon size={19} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] text-slate-500">
                      {card.label}
                    </p>
                    <p className="text-xl font-semibold text-slate-900">
                      {card.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Breakdowns */}
          <section className="grid gap-3 xl:grid-cols-2 print:grid-cols-2">
            <div className={cardClass}>
              <h2 className="text-sm font-semibold text-slate-900">
                Submissions by Document
              </h2>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Students who submitted each required document.
              </p>

              <ul className="mt-4 space-y-3">
                {byDocument.map((row) => {
                  const rate = totals.total
                    ? Math.round((row.submitted / totals.total) * 100)
                    : 0;

                  return (
                    <li key={row.documentType}>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-slate-700">
                          {row.documentType}
                        </span>
                        <span className="text-slate-500">
                          {row.submitted}/{totals.total} submitted
                          {row.notSubmitted > 0 && (
                            <span className="text-red-600">
                              {" "}
                              · {row.notSubmitted} not submitted
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className={cardClass}>
              <h2 className="text-sm font-semibold text-slate-900">
                Compliance by Course
              </h2>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Completed means all {DOCUMENT_TYPES.length} documents are
                submitted.
              </p>

              <div className="mt-4 overflow-x-auto print:overflow-visible">
                <table className="w-full min-w-[360px] text-left text-[11px] print:min-w-0">
                  <thead className="border-b border-slate-200 text-slate-500">
                    <tr>
                      {["Course", "Students", "Completed", "Incomplete", "Rate"].map(
                        (heading) => (
                          <th key={heading} className="py-2 pr-3 font-semibold">
                            {heading}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {byCourse.map((row) => (
                      <tr key={row.course}>
                        <td className="py-2 pr-3 font-medium text-slate-700">
                          {row.course}
                        </td>
                        <td className="py-2 pr-3">{row.total}</td>
                        <td className="py-2 pr-3 text-emerald-700">
                          {row.completed}
                        </td>
                        <td className="py-2 pr-3 text-amber-700">
                          {row.incomplete}
                        </td>
                        <td className="py-2 pr-3 font-semibold">
                          {row.complianceRate}%
                        </td>
                      </tr>
                    ))}

                    {byCourse.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-500">
                          No students to summarize.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Student details */}
          <section className="overflow-hidden rounded-2xl bg-white p-2 shadow-sm sm:p-3 print:overflow-visible print:p-0 print:shadow-none">
            <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-3 pt-1 print:px-0">
              <h2 className="text-sm font-semibold text-slate-900">
                Student Compliance
              </h2>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Check size={13} className="text-emerald-600" />
                  Submitted
                </span>
                <span className="inline-flex items-center gap-1">
                  <X size={13} className="text-red-500" />
                  Not Submitted
                </span>
                <span>
                  {filteredStudents.length}{" "}
                  {filteredStudents.length === 1 ? "student" : "students"}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-blue-100 print:overflow-visible print:border-slate-300">
              <table className="w-full min-w-[980px] border-collapse text-left text-[11px] print:min-w-0 print:text-[9px]">
                <thead className="bg-[#eef5ff] text-[#163b83]">
                  <tr>
                    <th className="px-3 py-3 font-semibold">Student</th>
                    <th className="px-3 py-3 font-semibold">Course / Year</th>
                    {DOCUMENT_TYPES.map((documentType) => (
                      <th
                        key={documentType}
                        className="px-2 py-3 text-center font-semibold"
                      >
                        {documentType}
                      </th>
                    ))}
                    <th className="px-3 py-3 text-center font-semibold">
                      Submitted
                    </th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-blue-100">
                  {filteredStudents.map((student) => {
                    const status = getComplianceStatus(student);

                    return (
                      <tr
                        key={student.studentId}
                        className="print:break-inside-avoid"
                      >
                        <td className="px-3 py-2.5">
                          <span className="block font-medium text-slate-800">
                            {student.studentName}
                          </span>
                          <span className="block text-[10px] text-slate-500">
                            {student.studentId}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="block text-slate-700">
                            {student.course}
                          </span>
                          {hasMajor(student.major) && (
                            <span className="block max-w-[180px] truncate text-[10px] text-slate-500">
                              {student.major}
                            </span>
                          )}
                          <span className="block text-[10px] text-slate-500">
                            {student.yearLevel}
                          </span>
                        </td>
                        {DOCUMENT_TYPES.map((documentType) => {
                          const submitted =
                            student.submittedTypes.includes(documentType);

                          return (
                            <td key={documentType} className="px-2 py-2.5 text-center">
                              {submitted ? (
                                <Check
                                  size={15}
                                  aria-label="Submitted"
                                  className="mx-auto text-emerald-600"
                                />
                              ) : (
                                <X
                                  size={15}
                                  aria-label="Not Submitted"
                                  className="mx-auto text-red-500"
                                />
                              )}
                            </td>
                          );
                        })}
                        <td className="px-3 py-2.5 text-center font-medium">
                          {student.submittedCount}/{student.requiredCount}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 font-medium ${statusStyles[status]}`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredStudents.length === 0 && (
                    <tr>
                      <td
                        colSpan={DOCUMENT_TYPES.length + 4}
                        className="px-4 py-14 text-center"
                      >
                        <p className="font-semibold text-slate-700">
                          {students.length
                            ? "No students match these filters"
                            : "No student records yet"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {students.length
                            ? "Try a different course, major, year level, or status."
                            : "Students added on the Documents page will appear here."}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Print-only signature line */}
          <div className="hidden pt-10 print:flex print:justify-end">
            <div className="w-64 text-center text-[11px]">
              <div className="min-h-5 border-t border-slate-800 pt-1 font-semibold">
                {preparedBy}
              </div>
              <p className="text-slate-600">Prepared by</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
