import {
  COLLEGE_COURSES,
  COURSE_LABELS,
  DOCUMENT_TYPES,
  YEAR_LEVELS,
} from "@/lib/constants/student";
import type {
  StudentDocument,
  StudentProgress,
  StudentSummary,
} from "@/lib/types/student";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function getCollegeFromCourse(
  course: string,
  storedCollege?: string,
  storedClassification?: string,
) {
  if (storedCollege?.trim()) return storedCollege.trim();
  if (storedClassification?.trim()) return storedClassification.trim();

  const code = normalize(course);

  for (const [college, courses] of Object.entries(COLLEGE_COURSES)) {
    if (courses.some((item) => normalize(item) === code)) {
      return college;
    }
  }

  if (
    code.includes("education") ||
    code === "beed" ||
    code === "bsed"
  ) {
    return "College of Education";
  }

  if (
    code === "bsit" ||
    code === "bscs" ||
    code.includes("information technology") ||
    code.includes("computer science")
  ) {
    return "College of Information Technology";
  }

  if (
    code === "bsba" ||
    code.includes("business administration")
  ) {
    return "College of Business Administration";
  }

  if (code.includes("criminology")) {
    return "College of Criminology";
  }

  return "Unclassified";
}

export function getCourseLabel(course: string) {
  return COURSE_LABELS[course] ?? course;
}

export function getYearSortValue(year: string) {
  const index = YEAR_LEVELS.indexOf(year);
  return index === -1 ? YEAR_LEVELS.length : index;
}

/**
 * Groups documents by student ID and works out which required documents
 * each student has submitted. Sorted by student name.
 */
export function buildStudentSummaries(
  documents: StudentDocument[],
): StudentSummary[] {
  const studentMap = new Map<string, StudentSummary>();

  documents.forEach((doc) => {
    const studentId = doc.studentId?.trim();

    if (!studentId) return;

    const key = studentId.toUpperCase();
    const course = doc.course?.trim() || "—";
    const major = doc.major?.trim() || "—";
    const yearLevel = doc.yearLevel?.trim() || "—";
    const college = getCollegeFromCourse(
      course,
      doc.college,
      doc.classification,
    );

    let student = studentMap.get(key);

    if (!student) {
      student = {
        studentName: doc.studentName?.trim() || "Unnamed Student",
        studentId,
        course,
        major,
        yearLevel,
        college,
        email: doc.email?.trim() || "—",
        enrollmentStatus: doc.enrollmentStatus || "Not set",
        submittedTypes: [],
        submittedCount: 0,
        requiredCount: DOCUMENT_TYPES.length,
        progress: "No Documents Submitted",
      };

      studentMap.set(key, student);
    } else {
      if (
        student.studentName === "Unnamed Student" &&
        doc.studentName?.trim()
      ) {
        student.studentName = doc.studentName.trim();
      }

      if (student.course === "—" && course !== "—") {
        student.course = course;
        student.college = getCollegeFromCourse(
          course,
          doc.college,
          doc.classification,
        );
      }

      if (student.major === "—" && major !== "—") {
        student.major = major;
      }

      if (student.yearLevel === "—" && yearLevel !== "—") {
        student.yearLevel = yearLevel;
      }

      if (student.email === "—" && doc.email?.trim()) {
        student.email = doc.email.trim();
      }

      if (doc.enrollmentStatus) {
        student.enrollmentStatus = doc.enrollmentStatus;
      }

      if (doc.college?.trim() || doc.classification?.trim()) {
        student.college = getCollegeFromCourse(
          student.course,
          doc.college,
          doc.classification,
        );
      }
    }

    const documentType = doc.documentType?.trim();

    if (
      documentType &&
      DOCUMENT_TYPES.includes(documentType) &&
      !student.submittedTypes.includes(documentType)
    ) {
      student.submittedTypes.push(documentType);
    }
  });

  const result = Array.from(studentMap.values()).map((student) => {
    const submittedCount = student.submittedTypes.length;

    const progress: StudentProgress =
      submittedCount === 0
        ? "No Documents Submitted"
        : submittedCount >= student.requiredCount
          ? "Completed"
          : "Incomplete";

    return {
      ...student,
      submittedCount,
      progress,
    };
  });

  result.sort((a, b) =>
    a.studentName.localeCompare(b.studentName),
  );

  return result;
}

/** Required documents the student has not submitted yet. */
export function getMissingDocuments(student: StudentSummary): string[] {
  return DOCUMENT_TYPES.filter(
    (documentType) => !student.submittedTypes.includes(documentType),
  );
}
