export const STUDENT_ID_PATTERN = /^[A-Z]{2}-\d{2}-\d{3}$/;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const COURSE_MAJORS: Record<string, string[]> = {
  BSBA: [
    "Marketing Management",
    "Human Resource Management",
    "Financial Management",
  ],
  BSED: ["Filipino", "Mathematics", "English"],
  BSCS: [],
  BEED: [],
  "BS Criminology": [],
};

export const YEAR_LEVELS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
];

export const DOCUMENT_TYPES = [
  "Form 137",
  "Diploma Copy",
  "Report Card",
  "Birth Certificate",
  "Good Moral Certificate",
];

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