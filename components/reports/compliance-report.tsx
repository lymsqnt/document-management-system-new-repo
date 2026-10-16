"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CircleCheck,
  ClipboardCheck,
  FileText,
  Users,
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

import ReportFilters, {
  type ReportFiltersState,
} from "@/components/reports/report-filters";
import ReportStatCard, {
  type ReportStatCardData,
} from "@/components/reports/report-stat-card";
import SubmissionsByDocument from "@/components/reports/submissions-by-document";
import ComplianceByCourse from "@/components/reports/compliance-by-course";
import StudentComplianceTable from "@/components/reports/student-compliance-table";

const ALL = "All";
const COURSES = Object.keys(COURSE_MAJORS);
const EMPTY_FILTERS: ReportFiltersState = {
  course: ALL,
  major: ALL,
  yearLevel: ALL,
  status: ALL,
};
const STATUS_OPTIONS: ComplianceStatus[] = ["Completed", "Incomplete"];

const PRINT_STYLES = `@media print {
  @page { size: A4 landscape; margin: 12mm; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}`;

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function ComplianceReport() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [filters, setFilters] = useState<ReportFiltersState>({
    ...EMPTY_FILTERS,
  });
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

  const courseOptions = useMemo(() => {
    const savedCourses = students
      .map((student) => student.course)
      .filter((course) => Boolean(course) && course !== "—");

    return Array.from(new Set([...COURSES, ...savedCourses])).sort(
      (a, b) => a.localeCompare(b),
    );
  }, [students]);

  // The filter dropdown uses this map with its un-applied draft course.
  const majorsByCourse = useMemo(() => {
    const result: Record<string, string[]> = {};

    for (const course of courseOptions) {
      const configuredMajors = COURSE_MAJORS[course] ?? [];
      const savedMajors = students
        .filter((student) => student.course === course)
        .map((student) => student.major)
        .filter(
          (major) =>
            Boolean(major) && major !== "N/A" && major !== "—",
        );

      result[course] = Array.from(
        new Set([...configuredMajors, ...savedMajors]),
      ).sort((a, b) => a.localeCompare(b));
    }

    return result;
  }, [courseOptions, students]);

  const filteredStudents = useMemo(
    () =>
      students.filter(
        (student) =>
          (filters.course === ALL || student.course === filters.course) &&
          (filters.major === ALL || student.major === filters.major) &&
          (filters.yearLevel === ALL || student.yearLevel === filters.yearLevel) &&
          (filters.status === ALL || getComplianceStatus(student) === filters.status),
      ),
    [students, filters],
  );

  const totals = useMemo(() => summarizeCompliance(filteredStudents), [filteredStudents]);
  const byDocument = useMemo(() => summarizeByDocument(filteredStudents), [filteredStudents]);
  const byCourse = useMemo(() => summarizeByCourse(filteredStudents), [filteredStudents]);

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
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `compliance-report-${formatDateKey(new Date())}.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const summaryCards: ReportStatCardData[] = [
    { label: "Total Students", value: totals.total, icon: Users, tone: "bg-blue-50 text-blue-700" },
    { label: "Completed", value: totals.completed, icon: CircleCheck, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Incomplete", value: totals.incomplete, icon: FileText, tone: "bg-amber-50 text-amber-700" },
    { label: "Compliance Rate", value: `${totals.complianceRate}%`, icon: ClipboardCheck, tone: "bg-indigo-50 text-indigo-700" },
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
        <div className="contents print:hidden">
          <Topbar title="Reports" onToggleSidebar={() => setSidebarOpen((open) => !open)} />
        </div>

        <div className="mx-auto w-full max-w-[1600px] space-y-3 p-3 sm:p-5 lg:p-6 print:max-w-none print:space-y-4 print:p-0">
          <div className="hidden border-b-2 border-slate-800 pb-3 text-center print:block">
            <p className="text-base font-bold uppercase tracking-wide">Quezonian Educational College, Inc.</p>
            <p className="text-[11px]">Document Management System</p>
            <h1 className="mt-2 text-lg font-semibold">Student Document Compliance Report</h1>
            <p className="mt-1 text-[11px] text-slate-600">{filterSummary}</p>
            <p className="text-[11px] text-slate-600">
              Generated {generatedLabel}{preparedBy && ` by ${preparedBy}`}
            </p>
          </div>

          <section className="relative flex min-h-[112px] items-center overflow-hidden rounded-2xl bg-gradient-to-r from-[#102c79] via-[#1644a8] to-[#1b4db5] px-5 py-5 text-white shadow-sm sm:px-7 print:hidden">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <ClipboardCheck size={32} />
              </div>
              <div>
                <h1 className="text-xl font-semibold sm:text-2xl">Compliance Report</h1>
                <p className="mt-1 max-w-lg text-xs leading-5 text-blue-100 sm:text-sm">
                  See which students have submitted all {DOCUMENT_TYPES.length} required documents, then print or export the results.
                </p>
              </div>
            </div>
          </section>

          <ReportFilters
            filters={filters}
            courses={courseOptions}
            majorsByCourse={majorsByCourse}
            yearLevels={YEAR_LEVELS}
            statusOptions={STATUS_OPTIONS}
            hasFilters={hasFilters}
            canExport={filteredStudents.length > 0}
            onChange={setFilters}
            onReset={() => setFilters({ ...EMPTY_FILTERS })}
            onPrint={() => window.print()}
            onExport={handleExport}
          />

          <section aria-label="Compliance summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4 print:grid-cols-4">
            {summaryCards.map((card) => <ReportStatCard key={card.label} card={card} />)}
          </section>

          <section className="grid gap-3 xl:grid-cols-2 print:grid-cols-2">
            <SubmissionsByDocument rows={byDocument} totalStudents={totals.total} />
            <ComplianceByCourse rows={byCourse} />
          </section>

          <StudentComplianceTable students={filteredStudents} allStudentsCount={students.length} />

          <div className="hidden pt-10 print:flex print:justify-end">
            <div className="w-64 text-center text-[11px]">
              <div className="min-h-5 border-t border-slate-800 pt-1 font-semibold">{preparedBy}</div>
              <p className="text-slate-600">Prepared by</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
