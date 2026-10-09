"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";

import { useSearchParams } from "next/navigation";

import {
  BookOpen,
  CalendarDays,
  Camera,
  Check,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Mail,
  Upload,
  UserRound,
} from "lucide-react";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

import { DOCUMENT_TYPES } from "@/lib/validations/students-documents";

type StudentDocument = {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  major: string;
  yearLevel: string;
  documentType: string;
  dateSubmitted: string;
  email: string;
  remarks: string;
  fileName: string;
  fileData: string;
  profileImage?: string;
};

const STORAGE_KEY = "demo-student-documents";

export default function StudentProfileInformation() {
  const searchParams = useSearchParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [documents, setDocuments] = useState<StudentDocument[]>([]);

  const [loading, setLoading] = useState(true);

  const studentId = searchParams.get("id") ?? "";

  /*
   * Responsive sidebar
   */
  useEffect(() => {
    const updateSidebar = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };

    updateSidebar();

    window.addEventListener("resize", updateSidebar);

    return () => {
      window.removeEventListener("resize", updateSidebar);
    };
  }, []);

  /*
   * Load student documents
   */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        setDocuments([]);
        setLoading(false);
        return;
      }

      const parsed: StudentDocument[] = JSON.parse(stored);

      const normalizedStudentId = studentId
        .trim()
        .toUpperCase();

      const filteredDocuments = parsed.filter(
        (document) =>
          document.studentId?.trim().toUpperCase() ===
          normalizedStudentId
      );

      setDocuments(filteredDocuments);
    } catch (error) {
      console.error(
        "Failed to load student documents:",
        error
      );

      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  /*
   * First document represents
   * the student information.
   */
  const student = documents[0];

  /*
   * Group documents by document type.
   */
  const documentsByType = useMemo(() => {
    const map = new Map<string, StudentDocument>();

    documents.forEach((document) => {
      map.set(document.documentType, document);
    });

    return map;
  }, [documents]);

  /*
   * Format date
   */
  const formatDate = (date: string) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  /*
   * Save updated student documents
   * into localStorage.
   */
  const saveDocuments = (
    updatedDocuments: StudentDocument[]
  ) => {
    if (!student) {
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        return;
      }

      const parsed: StudentDocument[] =
        JSON.parse(stored);

      const normalizedStudentId =
        student.studentId.trim().toUpperCase();

      const updatedAllDocuments = parsed.map(
        (document) => {
          if (
            document.studentId?.trim().toUpperCase() ===
            normalizedStudentId
          ) {
            const updatedStudentDocument =
              updatedDocuments.find(
                (updatedDocument) =>
                  updatedDocument.id === document.id
              );

            if (updatedStudentDocument) {
              return updatedStudentDocument;
            }
          }

          return document;
        }
      );

      /*
       * Add newly created documents.
       */
      updatedDocuments.forEach((updatedDocument) => {
        const alreadyExists =
          updatedAllDocuments.some(
            (document) =>
              document.id === updatedDocument.id
          );

        if (!alreadyExists) {
          updatedAllDocuments.push(updatedDocument);
        }
      });

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedAllDocuments)
      );

      setDocuments(updatedDocuments);
    } catch (error) {
      console.error(
        "Failed to save student documents:",
        error
      );

      alert(
        "Unable to save the changes. Please try again."
      );
    }
  };

  /*
   * Upload / update student ID picture
   */
  const handleProfileImageUpload = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file || !student) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      event.target.value = "";
      return;
    }

    /*
     * Maximum profile picture size: 5 MB
     */
    if (file.size > 5 * 1024 * 1024) {
      alert(
        "Profile image must be smaller than 5 MB."
      );

      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result;

      if (typeof imageData !== "string") {
        return;
      }

      const updatedDocuments = documents.map(
        (document) => ({
          ...document,
          profileImage: imageData,
        })
      );

      saveDocuments(updatedDocuments);
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  /*
   * Upload / create / replace requirement
   */
  const handleRequirementUpload = (
    documentType: string,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file || !student) {
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Please upload a PDF, JPG, PNG, DOC, or DOCX file."
      );

      event.target.value = "";
      return;
    }

    /*
     * Maximum document size: 10 MB
     */
    if (file.size > 10 * 1024 * 1024) {
      alert(
        "The document must be smaller than 10 MB."
      );

      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const fileData = reader.result;

      if (typeof fileData !== "string") {
        return;
      }

      const existingDocument =
        documentsByType.get(documentType);

      const now = new Date().toISOString();

      /*
       * UPDATE existing requirement
       */
      if (existingDocument) {
        const updatedDocuments = documents.map(
          (document) =>
            document.id === existingDocument.id
              ? {
                  ...document,
                  fileName: file.name,
                  fileData,
                  dateSubmitted: now,
                }
              : document
        );

        saveDocuments(updatedDocuments);
        return;
      }

      /*
       * CREATE new requirement
       */
      const newDocument: StudentDocument = {
        id: `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`,

        studentId: student.studentId,
        studentName: student.studentName,
        course: student.course,
        major: student.major,
        yearLevel: student.yearLevel,
        documentType,
        dateSubmitted: now,
        email: student.email,
        remarks: "",
        fileName: file.name,
        fileData,
        profileImage: student.profileImage,
      };

      const updatedDocuments = [
        ...documents,
        newDocument,
      ];

      saveDocuments(updatedDocuments);
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  /*
   * Delete requirement
   */
  const handleDeleteDocument = (
    documentToDelete: StudentDocument
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${documentToDelete.documentType}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        return;
      }

      const parsed: StudentDocument[] =
        JSON.parse(stored);

      const updatedAllDocuments =
        parsed.filter(
          (document) =>
            document.id !== documentToDelete.id
        );

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedAllDocuments)
      );

      const updatedDocuments = documents.filter(
        (document) =>
          document.id !== documentToDelete.id
      );

      setDocuments(updatedDocuments);
    } catch (error) {
      console.error(
        "Failed to delete document:",
        error
      );

      alert(
        "Unable to delete the document. Please try again."
      );
    }
  };

  /*
   * View document
   */
  const handleViewDocument = (
    document: StudentDocument
  ) => {
    if (!document.fileData) {
      return;
    }

    window.open(
      document.fileData,
      "_blank"
    );
  };

  /*
   * Download document
   */
  const handleDownloadDocument = (
    document: StudentDocument
  ) => {
    if (!document.fileData) {
      return;
    }

    const link =
      window.document.createElement("a");

    link.href = document.fileData;

    link.download =
      document.fileName ||
      document.documentType;

    link.click();
  };

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden bg-[#f4f6fb]">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main
          className={`min-h-screen w-full transition-[margin,width] duration-300 ease-in-out ${
            sidebarOpen
              ? "lg:ml-[275px] lg:w-[calc(100%-275px)]"
              : "ml-0 w-full"
          }`}
        >
          <Topbar
            title="Student Profile"
            onToggleSidebar={() =>
              setSidebarOpen((current) => !current)
            }
          />

          <div className="mx-auto w-full max-w-[1500px] p-4 sm:p-5 lg:p-6">
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
              <p className="text-sm text-slate-500">
                Loading student information...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /*
   * Student not found
   */
  if (!student) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden bg-[#f4f6fb]">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main
          className={`min-h-screen w-full transition-[margin,width] duration-300 ease-in-out ${
            sidebarOpen
              ? "lg:ml-[275px] lg:w-[calc(100%-275px)]"
              : "ml-0 w-full"
          }`}
        >
          <Topbar
            title="Student Profile"
            onToggleSidebar={() =>
              setSidebarOpen((current) => !current)
            }
          />

          <div className="mx-auto w-full max-w-[1500px] p-4 sm:p-5 lg:p-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <UserRound size={28} />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-800">
                Student not found
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                No student record was found for
                student ID{" "}
                <span className="font-medium text-slate-700">
                  {studentId || "—"}
                </span>
                .
              </p>
            </section>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f4f6fb]">
      {/* SIDEBAR */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* MAIN AREA */}
      <main
        className={`min-h-screen w-full transition-[margin,width] duration-300 ease-in-out ${
          sidebarOpen
            ? "lg:ml-[275px] lg:w-[calc(100%-275px)]"
            : "ml-0 w-full"
        }`}
      >
        {/* TOP BAR */}
        <Topbar
          title="Student Profile"
          onToggleSidebar={() =>
            setSidebarOpen((current) => !current)
          }
        />

        {/* CENTERED CONTENT */}
        <div className="mx-auto w-full max-w-[1500px] p-4 sm:p-5 lg:p-6">
          {/* STUDENT PROFILE */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* PROFILE HEADER */}
            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                {/* STUDENT ID PICTURE */}
                <div className="relative h-24 w-24 shrink-0">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 text-blue-600">
                    {student.profileImage ? (
                      <img
                        src={student.profileImage}
                        alt={`${student.studentName} profile`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound
                        size={42}
                        strokeWidth={1.5}
                      />
                    )}
                  </div>

                  {/* CAMERA BUTTON */}
                  <label
                    htmlFor="student-profile-image"
                    title={
                      student.profileImage
                        ? "Change ID picture"
                        : "Upload ID picture"
                    }
                    className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-sm transition-all duration-200 hover:bg-blue-700 active:scale-95"
                  >
                    <Camera size={14} />

                    <input
                      id="student-profile-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={
                        handleProfileImageUpload
                      }
                    />
                  </label>
                </div>

                {/* STUDENT NAME */}
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Student Profile
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                    {student.studentName}
                  </h2>

                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-medium text-blue-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Active Student
                  </div>
                </div>
              </div>

              {/* INFORMATION SUMMARY */}
              <div className="mt-6 grid grid-cols-1 overflow-hidden rounded-xl bg-[#f1f4ff] sm:grid-cols-2 lg:grid-cols-5">
                {/* STUDENT NUMBER */}
                <div className="flex items-center gap-3 border-b border-slate-200 p-4 sm:border-r lg:border-b-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <FileText size={19} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-slate-700">
                      Student Number
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {student.studentId}
                    </p>
                  </div>
                </div>

                {/* COURSE + MAJOR */}
                <div className="flex items-center gap-3 border-b border-slate-200 p-4 lg:border-b-0 lg:border-r">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <GraduationCap size={19} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-slate-700">
                      Course
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-600">
                      {student.course || "—"}
                    </p>

                    {student.major &&
                      student.major !== "N/A" && (
                        <p className="mt-0.5 truncate text-[10px] text-slate-400">
                          {student.major}
                        </p>
                      )}
                  </div>
                </div>

                {/* YEAR LEVEL */}
                <div className="flex items-center gap-3 border-b border-slate-200 p-4 sm:border-r lg:border-b-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                    <BookOpen size={19} />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-slate-700">
                      Year Level
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {student.yearLevel || "—"}
                    </p>
                  </div>
                </div>

                {/* EMAIL */}
                <div className="flex items-center gap-3 border-b border-slate-200 p-4 lg:border-b-0 lg:border-r">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                    <Mail size={19} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-slate-700">
                      Email Address
                    </p>

                    <p className="mt-1 truncate text-[10px] text-slate-500">
                      {student.email || "—"}
                    </p>
                  </div>
                </div>

                {/* LAST ACTIVITY */}
                <div className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CalendarDays size={19} />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-slate-700">
                      Last Activity
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-600">
                      {formatDate(
                        student.dateSubmitted
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* STUDENT CREDENTIALS */}
            <div className="border-t border-slate-200 p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Student Credentials
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Manage submitted documents and
                    requirements.
                  </p>
                </div>

                <div className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-medium text-blue-600">
                  {documents.length} submitted
                </div>
              </div>

              {/* CREDENTIAL TABLE */}
              <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-600">
                          Document
                        </th>

                        <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-600">
                          Status
                        </th>

                        <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-600">
                          Date Submitted
                        </th>

                        <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-600">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {DOCUMENT_TYPES.map(
                        (documentType) => {
                          const document =
                            documentsByType.get(
                              documentType
                            );

                          const submitted =
                            Boolean(document);

                          const uploadId = `upload-${documentType
                            .replace(
                              /\s+/g,
                              "-"
                            )
                            .toLowerCase()}`;

                          return (
                            <tr
                              key={documentType}
                              className="border-b border-slate-100 last:border-b-0"
                            >
                              {/* DOCUMENT */}
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                      submitted
                                        ? "bg-blue-50 text-blue-600"
                                        : "bg-slate-50 text-slate-400"
                                    }`}
                                  >
                                    <FileText size={18} />
                                  </div>

                                  <div>
                                    <p className="text-xs font-semibold text-slate-700">
                                      {documentType}
                                    </p>

                                    {submitted &&
                                      document?.fileName && (
                                        <p className="mt-0.5 max-w-[260px] truncate text-[9px] text-slate-400">
                                          {
                                            document.fileName
                                          }
                                        </p>
                                      )}
                                  </div>
                                </div>
                              </td>

                              {/* STATUS */}
                              <td className="px-4 py-4">
                                {submitted ? (
                                  <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-3 py-1.5 text-[10px] font-medium text-emerald-600">
                                    <Check size={12} />
                                    Submitted
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5 text-[10px] font-medium text-red-500">
                                    Not Submitted
                                  </span>
                                )}
                              </td>

                              {/* DATE */}
                              <td className="px-4 py-4">
                                <p className="text-xs text-slate-600">
                                  {submitted
                                    ? formatDate(
                                        document?.dateSubmitted ||
                                          ""
                                      )
                                    : "—"}
                                </p>
                              </td>

                              {/* ACTIONS */}
                              <td className="px-4 py-4">
                                <div className="flex flex-wrap items-center gap-2">
                                  {/* UPLOAD / REPLACE */}
                                  <label
                                    htmlFor={uploadId}
                                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-blue-200 px-3 py-1.5 text-[10px] font-medium text-blue-600 transition-all duration-200 hover:bg-blue-50 active:scale-95"
                                  >
                                    <Upload size={13} />

                                    {submitted
                                      ? "Replace"
                                      : "Upload"}

                                    <input
                                      id={uploadId}
                                      type="file"
                                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                      className="hidden"
                                      onChange={(
                                        event
                                      ) =>
                                        handleRequirementUpload(
                                          documentType,
                                          event
                                        )
                                      }
                                    />
                                  </label>

                                  {/* VIEW */}
                                  {submitted &&
                                    document && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleViewDocument(
                                            document
                                          )
                                        }
                                        disabled={
                                          !document.fileData
                                        }
                                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-[10px] font-medium text-slate-600 transition-all duration-200 hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                                      >
                                        <Eye size={13} />
                                        View
                                      </button>
                                    )}

                                  {/* DOWNLOAD */}
                                  {submitted &&
                                    document && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDownloadDocument(
                                            document
                                          )
                                        }
                                        disabled={
                                          !document.fileData
                                        }
                                        className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-[10px] font-medium text-white transition-all duration-200 hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                                      >
                                        <Download
                                          size={13}
                                        />
                                        Download
                                      </button>
                                    )}

                                  {/* NO DOCUMENT */}
                                  {!submitted && (
                                    <span className="text-[10px] text-slate-400">
                                      No document
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}