export type EnrollmentStatus = "Enrolled" | "Graduated" | "Transferred";

/**
 * One submitted document. A student is the group of documents that share a
 * studentId. Older saved records may be missing the optional fields.
 */
export type StudentDocument = {
  id: string;
  studentId: string;
  studentName: string;
  college?: string;
  classification?: string;
  course?: string;
  major?: string;
  yearLevel?: string;
  enrollmentStatus?: EnrollmentStatus;
  documentType: string;
  dateSubmitted: string;
  email: string;
  remarks?: string;
  fileName: string;
  fileData?: string;
  profileImage?: string;
};

export type StudentProgress =
  | "Completed"
  | "Incomplete"
  | "No Documents Submitted";

/** One student, built from all of their submitted documents. */
export type StudentSummary = {
  studentName: string;
  studentId: string;
  course: string;
  major: string;
  yearLevel: string;
  college: string;
  email: string;
  enrollmentStatus: EnrollmentStatus | "Not set";
  submittedTypes: string[];
  submittedCount: number;
  requiredCount: number;
  progress: StudentProgress;
};
