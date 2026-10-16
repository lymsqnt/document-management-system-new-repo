import type { StudentDocument } from "@/lib/types/student";

export const STUDENT_DOCUMENTS_KEY = "demo-student-documents";

/** Fired on window whenever student documents change in this tab. */
export const STUDENT_DOCUMENTS_UPDATED_EVENT = "student-documents-updated";

function normalizeStudentId(studentId: string | undefined): string {
  return studentId?.trim().toUpperCase() ?? "";
}

export function getStudentDocuments(): StudentDocument[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STUDENT_DOCUMENTS_KEY);

    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);

    return Array.isArray(parsed) ? (parsed as StudentDocument[]) : [];
  } catch {
    return [];
  }
}

/** Throws if the browser storage is full (e.g. the file is too large). */
export function saveStudentDocuments(documents: StudentDocument[]): void {
  localStorage.setItem(STUDENT_DOCUMENTS_KEY, JSON.stringify(documents));
}

export function getDocumentsByStudentId(studentId: string): StudentDocument[] {
  const id = normalizeStudentId(studentId);

  return getStudentDocuments().filter(
    (document) => normalizeStudentId(document.studentId) === id
  );
}

export function addStudentDocument(document: StudentDocument): void {
  saveStudentDocuments([...getStudentDocuments(), document]);
}

/** Replaces documents with the same id and adds the ones that are new. */
export function upsertStudentDocuments(documents: StudentDocument[]): void {
  const all = getStudentDocuments().map(
    (existing) =>
      documents.find((document) => document.id === existing.id) ?? existing
  );

  documents.forEach((document) => {
    if (!all.some((existing) => existing.id === document.id)) {
      all.push(document);
    }
  });

  saveStudentDocuments(all);
}

export function deleteStudentDocument(documentId: string): void {
  saveStudentDocuments(
    getStudentDocuments().filter((document) => document.id !== documentId)
  );
}

/** Deletes every document of a student. Returns how many were removed. */
export function deleteStudent(studentId: string): number {
  const id = normalizeStudentId(studentId);
  const documents = getStudentDocuments();
  const remaining = documents.filter(
    (document) => normalizeStudentId(document.studentId) !== id
  );

  saveStudentDocuments(remaining);

  return documents.length - remaining.length;
}
