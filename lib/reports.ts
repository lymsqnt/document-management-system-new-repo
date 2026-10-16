import { DOCUMENT_TYPES } from "@/lib/constants/student";
import { getMissingDocuments } from "@/lib/students";
import type { StudentSummary } from "@/lib/types/student";

/** A student is Completed once every required document is submitted. */
export type ComplianceStatus = "Completed" | "Incomplete";

export type ComplianceTotals = {
  total: number;
  completed: number;
  incomplete: number;
  /** Percent of students with every required document, 0–100. */
  complianceRate: number;
};

export type DocumentSubmissionRow = {
  documentType: string;
  submitted: number;
  notSubmitted: number;
};

export type CourseComplianceRow = ComplianceTotals & {
  course: string;
};

/** Byte order mark. Makes Excel read names with ñ or accents correctly. */
const UTF8_BOM = String.fromCharCode(0xfeff);

function percent(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 100);
}

export function getComplianceStatus(student: StudentSummary): ComplianceStatus {
  return student.progress === "Completed" ? "Completed" : "Incomplete";
}

export function summarizeCompliance(
  students: StudentSummary[],
): ComplianceTotals {
  const completed = students.filter(
    (student) => getComplianceStatus(student) === "Completed",
  ).length;

  return {
    total: students.length,
    completed,
    incomplete: students.length - completed,
    complianceRate: percent(completed, students.length),
  };
}

/** How many students submitted (or have not submitted) each required document. */
export function summarizeByDocument(
  students: StudentSummary[],
): DocumentSubmissionRow[] {
  return DOCUMENT_TYPES.map((documentType) => {
    const submitted = students.filter((student) =>
      student.submittedTypes.includes(documentType),
    ).length;

    return {
      documentType,
      submitted,
      notSubmitted: students.length - submitted,
    };
  });
}

export function summarizeByCourse(
  students: StudentSummary[],
): CourseComplianceRow[] {
  const groups = new Map<string, StudentSummary[]>();

  students.forEach((student) => {
    groups.set(student.course, [
      ...(groups.get(student.course) ?? []),
      student,
    ]);
  });

  return Array.from(groups.entries())
    .map(([course, courseStudents]) => ({
      course,
      ...summarizeCompliance(courseStudents),
    }))
    .sort((a, b) => a.course.localeCompare(b.course));
}

/**
 * Quotes a CSV cell. Values that start with =, +, - or @ get a leading
 * apostrophe so Excel shows them as text instead of running a formula.
 */
function csvCell(value: string | number): string {
  let text = String(value);

  if (/^[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

export function buildComplianceCsv(students: StudentSummary[]): string {
  const header = [
    "Student ID",
    "Student Name",
    "Course",
    "Major",
    "Year Level",
    "Email",
    ...DOCUMENT_TYPES,
    "Submitted",
    "Not Submitted Documents",
    "Status",
  ];

  const rows = students.map((student) => [
    student.studentId,
    student.studentName,
    student.course,
    student.major,
    student.yearLevel,
    student.email,
    ...DOCUMENT_TYPES.map((documentType) =>
      student.submittedTypes.includes(documentType)
        ? "Submitted"
        : "Not Submitted",
    ),
    `${student.submittedCount}/${student.requiredCount}`,
    getMissingDocuments(student).join("; ") || "None",
    getComplianceStatus(student),
  ]);

  return (
    UTF8_BOM +
    [header, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n")
  );
}
