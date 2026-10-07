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
  CalendarDays,
  ChevronDown,
  FileText,
  GraduationCap,
  Menu,
  UploadCloud,
  UserRound,
  X,
} from "lucide-react";

import Sidebar from "@/components/layout/sidebar";
import { getCurrentUser, type UserProfile } from "@/lib/auth";

type StudentDocument = {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  documentType: string;
  dateSubmitted: string;
  email: string;
  remarks: string;
  fileName: string;
  fileData: string;
};

const STORAGE_KEY = "demo-student-documents";

const DOCUMENT_TYPES = [
  "Form 137",
  "Diploma Copy",
  "Report Card",
  "Birth Certificate",
  "Good Moral Certificate",
  "Other",
];

const getTodayDate = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function DocumentList() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Current logged-in user
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Live date and time
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Form fields
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [course, setCourse] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [dateSubmitted, setDateSubmitted] = useState(getTodayDate());
  const [email, setEmail] = useState("");
  const [remarks, setRemarks] = useState("");

  // File
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState("");

  // Messages
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /*
   * Load currently logged-in user.
   */
  useEffect(() => {
    const user = getCurrentUser();

    if (user) {
      setCurrentUser(user);
    }
  }, []);

  /*
   * Live date and time.
   * Updates every second.
   */
  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  /*
   * Responsive sidebar.
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
   * Get current user display information.
   */
  const displayName = currentUser?.fullName?.trim() || "User";
  const displayRole = currentUser?.role?.trim() || "User";
  const profileImage = currentUser?.profileImage?.trim() || "";

  /*
   * Format current date.
   */
  const formattedDate = currentDateTime.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  /*
   * Format current weekday.
   */
  const formattedDay = currentDateTime
    .toLocaleDateString("en-US", {
      weekday: "long",
    })
    .toUpperCase();

  /*
   * Format live current time.
   */
  const formattedTime = currentDateTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });

  /*
   * Handle file selection.
   */
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    // Demo file size limit
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must not exceed 5MB for this demo.");
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

  /*
   * Remove selected file.
   */
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /*
   * Submit document.
   */
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (
      !studentId.trim() ||
      !studentName.trim() ||
      !course.trim() ||
      !documentType ||
      !dateSubmitted ||
      !email.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!selectedFile || !filePreview) {
      setError("Please upload a document.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    const newDocument: StudentDocument = {
      id: crypto.randomUUID(),
      studentId: studentId.trim(),
      studentName: studentName.trim(),
      course: course.trim(),
      documentType,
      dateSubmitted,
      email: email.trim().toLowerCase(),
      remarks: remarks.trim(),
      fileName: selectedFile.name,
      fileData: filePreview,
    };

    try {
      /*
       * Keep existing records and add the new document.
       */
      const saved = localStorage.getItem(STORAGE_KEY);

      let existingDocuments: StudentDocument[] = [];

      if (saved) {
        try {
          existingDocuments = JSON.parse(saved);
        } catch {
          existingDocuments = [];
        }
      }

      const updatedDocuments = [
        ...existingDocuments,
        newDocument,
      ];

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedDocuments)
      );

      /*
       * Clear form.
       */
      setStudentId("");
      setStudentName("");
      setCourse("");
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
              onClick={() => setSidebarOpen((open) => !open)}
              className="rounded-md p-2 hover:bg-slate-100"
            >
              <Menu size={24} />
            </button>

            <h2 className="text-base font-semibold sm:text-lg">
              MY PROFILE
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              className="relative rounded-full border border-slate-200 p-2"
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
                <p className="text-xs font-medium">
                  {displayName}
                </p>

                <p className="text-[11px] text-slate-500">
                  {displayRole}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1600px] space-y-4 p-3 sm:p-5 lg:p-6">
          {/* WELCOME BANNER */}
          <section className="relative flex min-h-[105px] items-center overflow-hidden rounded-2xl bg-gradient-to-r from-[#3211c7] via-[#2915c8] to-[#07185f] px-6 text-white shadow-sm">
            <div>
              <h1 className="text-lg font-semibold sm:text-xl">
                Welcome Back, {displayName}
              </h1>

              <p className="text-xs text-white/80">
                Here’s What’s happening in your systems today
              </p>
            </div>

            <span className="absolute left-[48%] text-3xl">
              👋
            </span>

            <div className="ml-auto hidden items-center gap-4 sm:flex">
              <CalendarDays size={48} />

              <div className="text-center">
                <p className="text-sm font-semibold">
                  {formattedDate}
                </p>

                <p className="text-xs">
                  {formattedDay}
                </p>

                <p className="text-[10px]">
                  {formattedTime}
                </p>
              </div>
            </div>
          </section>

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
                  Upload student admission requirements and institutional documents
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
                {/* LEFT SIDE */}
                <div className="space-y-3">
                  {/* STUDENT ID + STUDENT NAME */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {/* STUDENT ID */}
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium">
                        Student ID{" "}
                        <span className="text-red-500">*</span>
                      </span>

                      <div className="flex h-9 items-center rounded-md border border-slate-300 bg-white px-2">
                        <UserRound
                          size={16}
                          className="mr-2 text-slate-400"
                        />

                        <input
                          value={studentId}
                          onChange={(e) =>
                            setStudentId(e.target.value)
                          }
                          placeholder="Enter Student ID"
                          className="w-full text-xs outline-none"
                        />
                      </div>
                    </label>

                    {/* STUDENT NAME */}
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium">
                        Student Name{" "}
                        <span className="text-red-500">*</span>
                      </span>

                      <div className="flex h-9 items-center rounded-md border border-slate-300 bg-white px-2">
                        <UserRound
                          size={16}
                          className="mr-2 text-slate-400"
                        />

                        <input
                          value={studentName}
                          onChange={(e) =>
                            setStudentName(e.target.value)
                          }
                          placeholder="Enter student name"
                          className="w-full text-xs outline-none"
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

                    <div className="flex h-9 items-center rounded-md border border-slate-300 bg-white px-2">
                      <GraduationCap
                        size={16}
                        className="mr-2 text-slate-400"
                      />

                      <input
                        value={course}
                        onChange={(e) =>
                          setCourse(e.target.value)
                        }
                        placeholder="Enter course"
                        className="w-full text-xs outline-none"
                      />
                    </div>
                  </label>

                  {/* DOCUMENT TYPE */}
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium">
                      Document Type{" "}
                      <span className="text-red-500">*</span>
                    </span>

                    <div className="relative">
                      <select
                        value={documentType}
                        onChange={(e) =>
                          setDocumentType(e.target.value)
                        }
                        className="h-9 w-full appearance-none rounded-md border border-slate-300 bg-white px-3 pr-10 text-xs outline-none"
                      >
                        <option value="">
                          Select document type
                        </option>

                        {DOCUMENT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>

                      <ChevronDown
                        size={18}
                        className="pointer-events-none absolute right-2 top-2 text-slate-600"
                      />
                    </div>
                  </label>

                  {/* DATE */}
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium">
                      Date Submitted{" "}
                      <span className="text-red-500">*</span>
                    </span>

                    <input
                      type="date"
                      value={dateSubmitted}
                      onChange={(e) =>
                        setDateSubmitted(e.target.value)
                      }
                      className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-xs outline-none"
                    />
                  </label>

                  {/* EMAIL */}
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium">
                      Email{" "}
                      <span className="text-red-500">*</span>
                    </span>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      placeholder="Enter email address"
                      className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-xs outline-none"
                    />
                  </label>

                  {/* REMARKS */}
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium">
                      Remarks{" "}
                      <span className="text-slate-400">
                        (Optional)
                      </span>
                    </span>

                    <textarea
                      value={remarks}
                      onChange={(e) =>
                        setRemarks(e.target.value)
                      }
                      placeholder="Enter remarks"
                      rows={3}
                      className="w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-xs outline-none"
                    />
                  </label>
                </div>

                {/* RIGHT SIDE - UPLOAD */}
                <div className="border-l border-slate-200 pl-0 lg:pl-6">
                  <span className="mb-2 block text-xs font-medium">
                    Upload File{" "}
                    <span className="text-red-500">*</span>
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="flex h-[190px] w-full flex-col items-center justify-center rounded-md border border-dashed border-blue-300 bg-[#f1efff] px-4 text-center transition hover:bg-[#ebe8ff]"
                  >
                    <UploadCloud
                      size={34}
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

          {/* SYSTEM NOTIFICATIONS */}
          <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Bell
                size={22}
                className="text-blue-600"
              />

              <h2 className="text-sm font-semibold text-blue-700">
                System Notifications
              </h2>
            </div>

            <div className="space-y-3 text-[10px]">
              <div className="flex items-center gap-3">
                <span>⚠️</span>

                <span className="flex-1">
                  Missing mandatory file updates for 5 students
                </span>

                <span className="text-slate-400">
                  Today 9:00AM
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span>ⓘ</span>

                <span className="flex-1">
                  System backup due in 2 hours
                </span>

                <span className="text-slate-400">
                  Today 9:00AM
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}