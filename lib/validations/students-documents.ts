import {
  COURSE_MAJORS,
  DOCUMENT_TYPES,
  YEAR_LEVELS,
} from "@/lib/constants/student";
import type { StudentDocument } from "@/lib/types/student";
import {
  EMAIL_PATTERN,
  STUDENT_ID_PATTERN,
} from "@/lib/validations/patterns";

export function validateStudentId(studentId: string): string | null {
  const value = studentId.trim().toUpperCase();

  if (!value) {
    return "Student ID is required.";
  }

  if (!STUDENT_ID_PATTERN.test(value)) {
    return "Student ID must follow the format XX-00-000 (e.g. CS-23-033).";
  }

  return null;
}

export function validateStudentName(studentName: string): string | null {
  const value = studentName.trim();

  if (!value) {
    return "Student name is required.";
  }

  if (value.length < 2) {
    return "Student name must be at least 2 characters.";
  }

  return null;
}

export function validateStudentEmail(email: string): string | null {
  const value = email.trim().toLowerCase();

  if (!value) {
    return "Email is required.";
  }

  if (!EMAIL_PATTERN.test(value)) {
    return "Please enter a valid email address.";
  }

  return null;
}

export function validateCourse(course: string): string | null {
  const value = course.trim();

  if (!value) {
    return "Course is required.";
  }

  if (!Object.prototype.hasOwnProperty.call(COURSE_MAJORS, value)) {
    return "Please select a valid course.";
  }

  return null;
}

export function validateMajor(
  course: string,
  major: string
): string | null {
  const selectedCourse = course.trim();
  const selectedMajor = major.trim();

  if (!selectedCourse) {
    return "Please select a course first.";
  }

  const allowedMajors = COURSE_MAJORS[selectedCourse];

  if (!allowedMajors) {
    return "Please select a valid course.";
  }

  // Courses without majors must use N/A
  if (allowedMajors.length === 0) {
    if (selectedMajor !== "N/A") {
      return "This course does not have a major.";
    }

    return null;
  }

  if (!selectedMajor) {
    return "Major is required.";
  }

  if (!allowedMajors.includes(selectedMajor)) {
    return "Please select a valid major for the selected course.";
  }

  return null;
}

export function validateYearLevel(yearLevel: string): string | null {
  const value = yearLevel.trim();

  if (!value) {
    return "Year level is required.";
  }

  if (!YEAR_LEVELS.includes(value)) {
    return "Please select a valid year level.";
  }

  return null;
}

export function validateDocumentType(
  documentType: string
): string | null {
  const value = documentType.trim();

  if (!value) {
    return "Document type is required.";
  }

  if (!DOCUMENT_TYPES.includes(value)) {
    return "Please select a valid document type.";
  }

  return null;
}

export type StudentDocumentForm = {
  studentId: string;
  studentName: string;
  email: string;
  course: string;
  major: string;
  yearLevel: string;
  documentType: string;
  dateSubmitted: string;
  hasFile: boolean;
};

function normalizeStudentName(value: string | undefined): string | undefined {
  return value?.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Checks the Add Student form and makes sure the student ID, name and email
 * are not used yet. Returns the first error message, or null if valid.
 */
export function validateStudentDocumentForm(
  form: StudentDocumentForm,
  existingDocuments: StudentDocument[]
): string | null {
  const studentId = form.studentId.trim().toUpperCase();

  const fieldError =
    validateStudentId(studentId) ??
    validateStudentName(form.studentName) ??
    validateStudentEmail(form.email) ??
    validateCourse(form.course) ??
    validateMajor(form.course, form.major) ??
    validateYearLevel(form.yearLevel) ??
    validateDocumentType(form.documentType);

  if (fieldError) {
    return fieldError;
  }

  if (!form.dateSubmitted) {
    return "Date submitted is required.";
  }

  if (!form.hasFile) {
    return "Please upload a document.";
  }

  if (
    existingDocuments.some(
      (document) => document.studentId?.trim().toUpperCase() === studentId
    )
  ) {
    return `Student ID ${studentId} already exists.`;
  }

  const studentName = normalizeStudentName(form.studentName);

  if (
    existingDocuments.some(
      (document) => normalizeStudentName(document.studentName) === studentName
    )
  ) {
    return "A student with this name already exists.";
  }

  const email = form.email.trim().toLowerCase();

  if (
    existingDocuments.some(
      (document) => document.email?.trim().toLowerCase() === email
    )
  ) {
    return "This email address is already registered to a student.";
  }

  return null;
}
