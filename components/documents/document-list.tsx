"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Bell,
  BookOpen,
  CalendarDays,
  FileText,
  GraduationCap,
  Layers3,
  Mail,
  Menu,
  MessageSquare,
  UploadCloud,
  UserRound,
  X,
} from "lucide-react";

import Sidebar from "@/components/layout/sidebar";
import WelcomeBanner from "@/components/layout/welcome-banner";
import Select from "@/components/ui/select";

import { getCurrentUser, type UserProfile } from "@/lib/auth";

import {
  COURSE_MAJORS,
  DOCUMENT_TYPES,
  YEAR_LEVELS,
  validateCourse,
  validateDocumentType,
  validateMajor,
  validateStudentEmail,
  validateStudentId,
  validateStudentName,
  validateYearLevel,
} from "@/lib/validations/students-documents";

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
};

const STORAGE_KEY = "demo-student-documents";

const getTodayDate = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function DocumentList() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [currentUser, setCurrentUser] =
    useState<UserProfile | null>(null);

  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [course, setCourse] = useState("");
  const [major, setMajor] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [dateSubmitted, setDateSubmitted] =
    useState(getTodayDate());
  const [email, setEmail] = useState("");
  const [remarks, setRemarks] = useState("");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);
  const [filePreview, setFilePreview] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const dateInputRef =
    useRef<HTMLInputElement | null>(null);

  const availableMajors = COURSE_MAJORS[course] ?? [];

  useEffect(() => {
    const user = getCurrentUser();

    if (user) {
      setCurrentUser(user);
    }
  }, []);

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

  const displayName =
    currentUser?.fullName?.trim() || "User";

  const displayRole =
    currentUser?.role?.trim() || "User";

  const profileImage =
    currentUser?.profileImage?.trim() || "";

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "File size must not exceed 5MB for this demo."
      );

      event.target.value = "";
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();

    reader.onload = () => {
      setFilePreview(String(reader.result));
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCourseChange = (
    selectedCourse: string
  ) => {
    setCourse(selectedCourse);

    const courseMajors =
      COURSE_MAJORS[selectedCourse] ?? [];

    if (courseMajors.length > 0) {
      setMajor("");
    } else if (selectedCourse) {
      setMajor("N/A");
    } else {
      setMajor("");
    }
  };

  const openDatePicker = () => {
    if (!dateInputRef.current) return;

    const input = dateInputRef.current;

    if ("showPicker" in HTMLInputElement.prototype) {
      input.showPicker();
    } else {
      input.focus();
    }
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const normalizedStudentId =
      studentId.trim().toUpperCase();

    const normalizedStudentName = studentName
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();

    const normalizedEmail =
      email.trim().toLowerCase();

    const studentIdError =
      validateStudentId(normalizedStudentId);

    if (studentIdError) {
      setError(studentIdError);
      return;
    }

    const studentNameError =
      validateStudentName(studentName);

    if (studentNameError) {
      setError(studentNameError);
      return;
    }

    const studentEmailError =
      validateStudentEmail(email);

    if (studentEmailError) {
      setError(studentEmailError);
      return;
    }

    const courseError =
      validateCourse(course);

    if (courseError) {
      setError(courseError);
      return;
    }

    const majorError =
      validateMajor(course, major);

    if (majorError) {
      setError(majorError);
      return;
    }

    const yearLevelError =
      validateYearLevel(yearLevel);

    if (yearLevelError) {
      setError(yearLevelError);
      return;
    }

    const documentTypeError =
      validateDocumentType(documentType);

    if (documentTypeError) {
      setError(documentTypeError);
      return;
    }

    if (!dateSubmitted) {
      setError("Date submitted is required.");
      return;
    }

    if (!selectedFile || !filePreview) {
      setError("Please upload a document.");
      return;
    }

    try {
      const saved =
        localStorage.getItem(STORAGE_KEY);

      let existingDocuments: StudentDocument[] = [];

      if (saved) {
        try {
          const parsed: unknown = JSON.parse(saved);

          if (Array.isArray(parsed)) {
            existingDocuments =
              parsed as StudentDocument[];
          }
        } catch {
          existingDocuments = [];
        }
      }

      const duplicateStudentId =
        existingDocuments.some(
          (document) =>
            document.studentId
              ?.trim()
              .toUpperCase() ===
            normalizedStudentId
        );

      if (duplicateStudentId) {
        setError(
          `Student ID ${normalizedStudentId} already exists.`
        );
        return;
      }

      const duplicateStudentName =
        existingDocuments.some(
          (document) =>
            document.studentName
              ?.trim()
              .replace(/\s+/g, " ")
              .toLowerCase() ===
            normalizedStudentName
        );

      if (duplicateStudentName) {
        setError(
          "A student with this name already exists."
        );
        return;
      }

      const duplicateEmail =
        existingDocuments.some(
          (document) =>
            document.email
              ?.trim()
              .toLowerCase() ===
            normalizedEmail
        );

      if (duplicateEmail) {
        setError(
          "This email address is already registered to a student."
        );
        return;
      }

      const newDocument: StudentDocument = {
        id: crypto.randomUUID(),
        studentId: normalizedStudentId,
        studentName: studentName
          .trim()
          .replace(/\s+/g, " "),
        course: course.trim(),
        major: major.trim(),
        yearLevel: yearLevel.trim(),
        documentType,
        dateSubmitted,
        email: normalizedEmail,
        remarks: remarks.trim(),
        fileName: selectedFile.name,
        fileData: filePreview,
      };

      const updatedDocuments = [
        ...existingDocuments,
        newDocument,
      ];

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedDocuments)
      );

      setStudentId("");
      setStudentName("");
      setCourse("");
      setMajor("");
      setYearLevel("");
      setDocumentType("");
      setDateSubmitted(getTodayDate());
      setEmail("");
      setRemarks("");

      handleRemoveFile();

      setMessage(
        `${documentType} submitted successfully for ${newDocument.studentName}.`
      );
    } catch {
      setError(
        "Unable to save the demo document. The file may be too large."
      );
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f1f3fc] text-slate-800">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main
        className={`min-h-screen w-full transition-[margin] duration-300 ${
          sidebarOpen
            ? "lg:ml-[275px] lg:w-[calc(100%-275px)]"
            : "ml-0 w-full"
        }`}
      >
        {/* HEADER */}
        <header className="sticky top-0 z-30 flex min-h-[58px] w-full items-center justify-between border-b border-slate-200 bg-white px-3 shadow-sm sm:px-5 lg:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Toggle sidebar"
              onClick={() =>
                setSidebarOpen((open) => !open)
              }
              className="rounded-md p-2 text-slate-700 transition-colors hover:bg-slate-100"
            >
              <Menu size={24} />
            </button>

            <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
              MY PROFILE
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              className="relative rounded-full border border-slate-200 p-2 text-slate-700 transition-colors hover:bg-slate-100"
              aria-label="Notifications"
            >
              <Bell size={17} />

              <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-blue-600" />
            </button>

            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-blue-500 bg-blue-100 text-blue-800">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound size={18} />
                )}
              </div>

              <div className="hidden text-right sm:block">
                <p className="text-xs font-medium text-slate-800">
                  {displayName}
                </p>

                <p className="text-[11px] text-slate-500">
                  {displayRole}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="mx-auto w-full max-w-[1600px] space-y-4 p-3 sm:p-5 lg:p-6">
          <WelcomeBanner />

          {/* DOCUMENT FORM */}
          <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start gap-2">
              <FileText
                size={22}
                className="mt-0.5 text-blue-600"
              />

              <div>
                <h2 className="text-base font-semibold text-blue-700">
                  DOCUMENTS
                </h2>

                <p className="text-[10px] text-slate-500">
                  Upload student admission requirements and
                  institutional documents
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                {/* LEFT SIDE */}
                <div className="space-y-3">
                  {/* STUDENT ID + NAME */}
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {/* STUDENT ID */}
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium">
                        Student ID{" "}
                        <span className="text-red-500">*</span>
                      </span>

                      <div className="flex h-9 items-center rounded-md border border-slate-300 bg-white px-2 transition-all duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                        <UserRound
                          size={16}
                          className="mr-2 shrink-0 text-slate-400"
                        />

                        <input
                          value={studentId}
                          onChange={(e) =>
                            setStudentId(
                              e.target.value.toUpperCase()
                            )
                          }
                          placeholder="e.g. CS-23-033"
                          maxLength={9}
                          className="w-full bg-transparent font-sans text-xs outline-none"
                        />
                      </div>
                    </label>

                    {/* STUDENT NAME */}
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium">
                        Student Name{" "}
                        <span className="text-red-500">*</span>
                      </span>

                      <div className="flex h-9 items-center rounded-md border border-slate-300 bg-white px-2 transition-all duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                        <UserRound
                          size={16}
                          className="mr-2 shrink-0 text-slate-400"
                        />

                        <input
                          value={studentName}
                          onChange={(e) =>
                            setStudentName(e.target.value)
                          }
                          placeholder="Enter student name"
                          className="w-full bg-transparent font-sans text-xs outline-none"
                        />
                      </div>
                    </label>
                  </div>

                  {/* COURSE */}
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium">
                      Course{" "}
                      <span className="text-red-500">*</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <GraduationCap
                        size={16}
                        className="shrink-0 text-slate-400"
                      />

                      <Select
                        value={course}
                        onChange={handleCourseChange}
                        placeholder="Select course"
                        options={Object.keys(
                          COURSE_MAJORS
                        ).map((courseOption) => ({
                          label: courseOption,
                          value: courseOption,
                        }))}
                        className="flex-1"
                      />
                    </div>
                  </label>

                  {/* MAJOR */}
                  <div
                    aria-hidden={
                      availableMajors.length === 0
                    }
                    className={`grid transition-all duration-300 ease-in-out ${
                      availableMajors.length > 0
                        ? "grid-rows-[1fr] opacity-100"
                        : "pointer-events-none grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="min-h-0">
                      <label className="block">
                        <span className="mb-1 block text-xs font-medium">
                          Major{" "}
                          <span className="text-red-500">*</span>
                        </span>

                        <div className="flex items-center gap-2">
                          <BookOpen
                            size={16}
                            className="shrink-0 text-slate-400"
                          />

                          <Select
                            value={major}
                            onChange={setMajor}
                            placeholder="Select major"
                            disabled={
                              availableMajors.length === 0
                            }
                            options={availableMajors.map(
                              (majorOption) => ({
                                label: majorOption,
                                value: majorOption,
                              })
                            )}
                            className="flex-1"
                          />
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* YEAR LEVEL */}
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium">
                      Year Level{" "}
                      <span className="text-red-500">*</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <Layers3
                        size={16}
                        className="shrink-0 text-slate-400"
                      />

                      <Select
                        value={yearLevel}
                        onChange={setYearLevel}
                        placeholder="Select year level"
                        options={YEAR_LEVELS.map(
                          (level) => ({
                            label: level,
                            value: level,
                          })
                        )}
                        className="flex-1"
                      />
                    </div>
                  </label>

                  {/* DOCUMENT TYPE */}
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium">
                      Document Type{" "}
                      <span className="text-red-500">*</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <FileText
                        size={16}
                        className="shrink-0 text-slate-400"
                      />

                      <Select
                        value={documentType}
                        onChange={setDocumentType}
                        placeholder="Select document type"
                        options={DOCUMENT_TYPES.map(
                          (type) => ({
                            label: type,
                            value: type,
                          })
                        )}
                        className="flex-1"
                      />
                    </div>
                  </label>

                  {/* DATE SUBMITTED */}
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium">
                      Date Submitted{" "}
                      <span className="text-red-500">*</span>
                    </span>

                    <div
                      onClick={openDatePicker}
                      className="flex h-9 cursor-pointer items-center rounded-md border border-slate-300 bg-white px-3 transition-all duration-200 hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
                    >
                      <input
                        ref={dateInputRef}
                        type="date"
                        value={dateSubmitted}
                        onChange={(e) =>
                          setDateSubmitted(
                            e.target.value
                          )
                        }
                        className="w-full cursor-pointer bg-transparent font-sans text-xs outline-none"
                      />

                      <CalendarDays
                        size={16}
                        className="ml-2 shrink-0 text-slate-400"
                      />
                    </div>
                  </label>

                  {/* EMAIL */}
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium">
                      Email{" "}
                      <span className="text-red-500">*</span>
                    </span>

                    <div className="flex h-9 items-center rounded-md border border-slate-300 bg-white px-2 transition-all duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                      <Mail
                        size={16}
                        className="mr-2 shrink-0 text-slate-400"
                      />

                      <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        placeholder="Enter email address"
                        className="w-full bg-transparent font-sans text-xs outline-none"
                      />
                    </div>
                  </label>

                  {/* REMARKS */}
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium">
                      Remarks{" "}
                      <span className="text-slate-400">
                        (Optional)
                      </span>
                    </span>

                    <div className="flex items-start rounded-md border border-slate-300 bg-white px-2 py-2 transition-all duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                      <MessageSquare
                        size={16}
                        className="mr-2 mt-0.5 shrink-0 text-slate-400"
                      />

                      <textarea
                        value={remarks}
                        onChange={(e) =>
                          setRemarks(e.target.value)
                        }
                        placeholder="Enter remarks"
                        rows={3}
                        className="w-full resize-none bg-transparent font-sans text-xs outline-none"
                      />
                    </div>
                  </label>
                </div>

                {/* RIGHT SIDE - UPLOAD */}
                <div className="border-t border-slate-200 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                  <span className="mb-2 block text-xs font-medium">
                    Upload File{" "}
                    <span className="text-red-500">*</span>
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="flex h-[240px] w-full flex-col items-center justify-center rounded-md border border-dashed border-blue-300 bg-[#f1efff] px-4 text-center transition hover:bg-[#ebe8ff]"
                  >
                    <UploadCloud
                      size={36}
                      className="mb-3 text-blue-600"
                    />

                    {selectedFile ? (
                      <>
                        <p className="max-w-full break-all text-xs font-medium text-blue-700">
                          {selectedFile.name}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-500">
                          Click to change file
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-[11px] text-slate-600">
                          Drag and Drop your file here
                        </p>

                        <p className="text-[10px] text-slate-500">
                          or click to browse
                        </p>
                      </>
                    )}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {selectedFile && (
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="mt-2 flex items-center gap-1 text-[10px] text-red-600 hover:underline"
                    >
                      <X size={12} />
                      Remove selected file
                    </button>
                  )}

                  <p className="mt-2 text-[9px] text-slate-400">
                    Maximum file size: 5MB
                  </p>
                </div>
              </div>

              {/* MESSAGE */}
              {error && (
                <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                  {error}
                </div>
              )}

              {message && (
                <div className="mt-4 rounded-md bg-green-50 px-3 py-2 text-xs text-green-600">
                  {message}
                </div>
              )}

              {/* SUBMIT */}
              <div className="mt-5 flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm min-w-32"
                >
                  Submit Document
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}