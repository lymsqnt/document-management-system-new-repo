"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Eye,
  Menu,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";

import Sidebar from "@/components/layout/sidebar";
import { getCurrentUser, type UserProfile } from "@/lib/auth";

type StudentDocument = {
  id: string;
  studentId: string;
  studentName: string;
  course?: string;
  documentType: string;
  dateSubmitted: string;
  email: string;
  remarks?: string;
  fileName: string;
  fileData?: string;
};

type Student = {
  id: string;
  studentName: string;
  studentId: string;
  course: string;
  email: string;
  status: "Active" | "Pending" | "Incomplete";
};

const STORAGE_KEY = "demo-student-documents";

export default function StudentList() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All Documents");

  const [currentUser, setCurrentUser] =
    useState<UserProfile | null>(null);

  const [currentDateTime, setCurrentDateTime] =
    useState(new Date());

  /*
   * Load logged-in user
   */
  useEffect(() => {
    const user = getCurrentUser();

    if (user) {
      setCurrentUser(user);
    }
  }, []);

  /*
   * SAME SIDEBAR BEHAVIOR AS DOCUMENTS
   *
   * Desktop  = sidebar open
   * Mobile   = sidebar closed
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
   * Live date and time
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
   * Load students
   */
  const loadStudents = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        setStudents([]);
        return;
      }

      const documents: StudentDocument[] =
        JSON.parse(stored);

      const studentMap = new Map<string, Student>();

      documents.forEach((document) => {
        const studentId = document.studentId?.trim();

        if (!studentId) {
          return;
        }

        const existingStudent =
          studentMap.get(studentId);

        if (!existingStudent) {
          studentMap.set(studentId, {
            id: studentId,
            studentName: document.studentName,
            studentId,
            course:
              document.course?.trim() || "—",
            email: document.email,
            status: "Active",
          });
        } else {
          /*
           * If another document contains
           * the student's course, use it.
           */
          if (
            existingStudent.course === "—" &&
            document.course?.trim()
          ) {
            existingStudent.course =
              document.course.trim();
          }
        }
      });

      setStudents(
        Array.from(studentMap.values())
      );
    } catch (error) {
      console.error(
        "Failed to load students:",
        error
      );

      setStudents([]);
    }
  };

  /*
   * Initial load + storage listener
   */
  useEffect(() => {
    loadStudents();

    const handleStorageChange = (
      event: StorageEvent
    ) => {
      if (event.key === STORAGE_KEY) {
        loadStudents();
      }
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  /*
   * Delete student
   */
  const handleDeleteStudent = (
    student: Student
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.studentName}?\n\nAll documents submitted under ${student.studentId} will also be deleted.`
    );

    if (!confirmed) {
      return;
    }

    try {
      const stored =
        localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        return;
      }

      const documents: StudentDocument[] =
        JSON.parse(stored);

      const updatedDocuments =
        documents.filter(
          (document) =>
            document.studentId.trim() !==
            student.studentId
        );

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedDocuments)
      );

      loadStudents();
    } catch (error) {
      console.error(
        "Failed to delete student:",
        error
      );
    }
  };

  /*
   * Search
   */
  const filteredStudents =
    students.filter((student) => {
      const searchValue =
        search.trim().toLowerCase();

      if (!searchValue) {
        return true;
      }

      return (
        student.studentName
          .toLowerCase()
          .includes(searchValue) ||
        student.studentId
          .toLowerCase()
          .includes(searchValue) ||
        student.course
          .toLowerCase()
          .includes(searchValue) ||
        student.email
          .toLowerCase()
          .includes(searchValue)
      );
    });

  /*
   * Current user
   */
  const displayName =
    currentUser?.fullName?.trim() ||
    "User";

  const displayRole =
    currentUser?.role?.trim() ||
    "Administrator";

  /*
   * Date / time
   */
  const formattedDate =
    currentDateTime.toLocaleDateString(
      "en-US",
      {
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    );

  const formattedDay =
    currentDateTime
      .toLocaleDateString("en-US", {
        weekday: "long",
      })
      .toUpperCase();

  const formattedTime =
    currentDateTime.toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      }
    );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f1f3fc] text-slate-800">

      {/* SIDEBAR */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* 
        IMPORTANT:
        This is the SAME layout behavior as Documents.
        Sidebar open  -> 275px margin
        Sidebar closed -> full width
      */}
      <main
        className={`min-h-screen w-full transition-[margin] duration-300 ${
          sidebarOpen
            ? "lg:ml-[275px] lg:w-[calc(100%-275px)]"
            : "ml-0 w-full"
        }`}
      >

        {/* HEADER */}
        <header className="sticky top-0 z-30 flex min-h-[58px] w-full items-center justify-between border-b border-slate-200 bg-white px-3 shadow-sm sm:px-5 lg:px-6">

          {/* LEFT SIDE */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* 
              DO NOT use lg:hidden here.
              This button MUST remain visible when
              the sidebar is closed.
            */}
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

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3 sm:gap-4">

            {/* NOTIFICATION */}
            <button
              type="button"
              aria-label="Notifications"
              className="relative rounded-full border border-slate-200 p-2 text-slate-700 transition-colors hover:bg-slate-100"
            >
              <Bell size={18} />

              <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-blue-600" />
            </button>

            {/* USER */}
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-blue-500 bg-blue-100 text-blue-700">
                <UserRound size={18} />
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

          {/* WELCOME BANNER */}
          <section className="relative flex min-h-[105px] items-center overflow-hidden rounded-2xl bg-gradient-to-r from-[#3211c7] via-[#2915c8] to-[#07185f] px-6 text-white shadow-sm">

            <div>
              <h1 className="text-lg font-semibold sm:text-xl">
                Welcome Back, {displayName}
              </h1>

              <p className="text-xs text-white/80">
                Here’s What's happening in your systems today
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

          {/* STUDENT LIST */}
          <section className="rounded-2xl bg-white shadow-sm">

            {/* CARD HEADER */}
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-6">

              <div className="flex items-start gap-2">
                <UserRound
                  size={22}
                  className="mt-0.5 text-blue-600"
                />

                <div>
                  <h2 className="text-base font-semibold text-blue-700">
                    STUDENT LIST
                  </h2>

                  <p className="text-[10px] text-slate-500">
                    View and manage registered students and their documents.
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-[10px] text-blue-700">
                {students.length}{" "}
                {students.length === 1
                  ? "record"
                  : "records"}
              </span>
            </div>

            {/* SEARCH + FILTER */}
            <div className="flex flex-col gap-3 px-5 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">

              {/* SEARCH */}
              <div className="relative w-full md:max-w-md">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search Student ID or Student Name"
                  className="h-10 w-full rounded-md border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* FILTER */}
              <div className="relative">
                <select
                  value={filter}
                  onChange={(event) =>
                    setFilter(event.target.value)
                  }
                  className="h-10 min-w-[190px] appearance-none rounded-md border border-slate-300 bg-white px-4 pr-10 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="All Documents">
                    All Documents
                  </option>

                  <option value="View All Pendings">
                    View All Pendings
                  </option>

                  <option value="Incomplete Documents">
                    Incomplete Documents
                  </option>

                  <option value="Active Documents">
                    Active Documents
                  </option>
                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto px-5 sm:px-6">
              <table className="w-full min-w-[750px]">

                <thead>
                  <tr className="border-b border-slate-200 text-left">

                    <th className="px-3 py-3 text-xs font-semibold text-slate-500">
                      Student Name
                    </th>

                    <th className="px-3 py-3 text-xs font-semibold text-slate-500">
                      Student ID
                    </th>

                    <th className="px-3 py-3 text-xs font-semibold text-slate-500">
                      Course
                    </th>

                    <th className="px-3 py-3 text-xs font-semibold text-slate-500">
                      Email
                    </th>

                    <th className="px-3 py-3 text-xs font-semibold text-slate-500">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr
                        key={student.studentId}
                        className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                      >

                        <td className="px-3 py-4 text-sm font-medium text-slate-800">
                          {student.studentName}
                        </td>

                        <td className="px-3 py-4 text-sm text-slate-600">
                          {student.studentId}
                        </td>

                        <td className="px-3 py-4 text-sm text-slate-600">
                          {student.course}
                        </td>

                        <td className="px-3 py-4 text-sm text-slate-600">
                          {student.email}
                        </td>

                        <td className="px-3 py-4">
                          <div className="flex items-center gap-1">

                            {/* VIEW */}
                            <button
                              type="button"
                              title="View Student"
                              aria-label={`View ${student.studentName}`}
                              className="rounded-md p-2 text-blue-600 transition-colors hover:bg-blue-50"
                            >
                              <Eye size={18} />
                            </button>

                            {/* DELETE */}
                            <button
                              type="button"
                              title="Delete Student"
                              aria-label={`Delete ${student.studentName}`}
                              onClick={() =>
                                handleDeleteStudent(
                                  student
                                )
                              }
                              className="rounded-md p-2 text-red-500 transition-colors hover:bg-red-50"
                            >
                              <Trash2 size={18} />
                            </button>

                          </div>
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-10 text-center text-sm text-slate-500"
                      >
                        {students.length === 0
                          ? "No students have been submitted yet."
                          : "No students found."}
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>

            {/* FOOTER */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 px-5 py-4 sm:px-6">

              <p className="text-xs text-slate-500">
                Showing {filteredStudents.length} of{" "}
                {students.length} students
              </p>

              <div className="flex gap-1">

                <button
                  type="button"
                  disabled
                  className="rounded border border-slate-200 px-3 py-1.5 text-xs text-slate-400"
                >
                  Previous
                </button>

                <button
                  type="button"
                  className="rounded border border-blue-600 bg-blue-600 px-3 py-1.5 text-xs text-white"
                >
                  1
                </button>

                <button
                  type="button"
                  disabled
                  className="rounded border border-slate-200 px-3 py-1.5 text-xs text-slate-400"
                >
                  Next
                </button>

              </div>
            </div>

          </section>
        </div>
      </main>
    </div>
  );
}