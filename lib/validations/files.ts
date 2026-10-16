const MB = 1024 * 1024;

const REQUIREMENT_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/** Account photo on the My Profile page. */
export function validateProfilePhoto(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Please select a valid image file.";
  }

  return null;
}

/** Student ID picture on the student profile page. */
export function validateStudentPhoto(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Please select an image file.";
  }

  if (file.size > 5 * MB) {
    return "Profile image must be smaller than 5 MB.";
  }

  return null;
}

/** Document uploaded with the Add Student form. */
export function validateDocumentFile(file: File): string | null {
  if (file.size > 5 * MB) {
    return "File size must not exceed 5MB for this demo.";
  }

  return null;
}

/** Requirement uploaded or replaced on the student profile page. */
export function validateRequirementFile(file: File): string | null {
  if (!REQUIREMENT_FILE_TYPES.includes(file.type)) {
    return "Please upload a PDF, JPG, PNG, DOC, or DOCX file.";
  }

  if (file.size > 10 * MB) {
    return "The document must be smaller than 10 MB.";
  }

  return null;
}
