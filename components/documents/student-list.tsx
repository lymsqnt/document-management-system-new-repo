
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Eye,
  Search,
  SlidersHorizontal,
  Trash2,
  UserRound,
} from "lucide-react";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import WelcomeBanner from "@/components/layout/welcome-banner";
import {
  COLLEGE_COURSES,
  COURSE_MAJORS,
  YEAR_LEVELS,
} from "@/lib/constants/student";
import { logActivity } from "@/lib/storage/audit-logs";
import {
  deleteStudent,
  getStudentDocuments,
  STUDENT_DOCUMENTS_KEY,
  STUDENT_DOCUMENTS_UPDATED_EVENT,
} from "@/lib/storage/student-documents";
import {
  buildStudentSummaries,
  getCourseLabel,
  getYearSortValue,
} from "@/lib/students";
import type { StudentSummary as Student } from "@/lib/types/student";
import StudentFilters, {
  type FilterState,
} from "@/components/documents/student-filters";

const ALL = "All";

const EMPTY_FILTERS: FilterState = {
  college: ALL,
  course: ALL,
  major: ALL,
  yearLevel: ALL,
  enrollmentStatus: ALL,
  progress: "All Progress",
  search: "",
};

export default function StudentList() {
  const router = useRouter();
  const filterContainerRef = useRef<HTMLDivElement>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>({ ...EMPTY_FILTERS });

  const [draftFilters, setDraftFilters] =
    useState<FilterState>({ ...EMPTY_FILTERS });

  // RESPONSIVE SIDEBAR
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

  // LOAD STUDENTS
  const loadStudents = useCallback(() => {
    try {
      setStudents(buildStudentSummaries(getStudentDocuments()));
    } catch (error) {
      console.error("Failed to load students:", error);
      setStudents([]);
    }
  }, []);

  // REFRESH WHEN STUDENT DOCUMENTS CHANGE
  useEffect(() => {
    loadStudents();

    const onStorage = (event: StorageEvent) => {
      if (event.key === STUDENT_DOCUMENTS_KEY) {
        loadStudents();
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", loadStudents);
    window.addEventListener(
      STUDENT_DOCUMENTS_UPDATED_EVENT,
      loadStudents,
    );

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", loadStudents);
      window.removeEventListener(
        STUDENT_DOCUMENTS_UPDATED_EVENT,
        loadStudents,
      );
    };
  }, [loadStudents]);

  // CLOSE FILTERS WITH ESCAPE
  useEffect(() => {
    if (!filterOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFilterOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [filterOpen]);

  // CLOSE FILTERS WHEN CLICKING OUTSIDE
  useEffect(() => {
    if (!filterOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        filterContainerRef.current &&
        !filterContainerRef.current.contains(target)
      ) {
        setFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, [filterOpen]);

  // COLLEGE OPTIONS
  const colleges = useMemo(() => {
    return Array.from(
      new Set([
        ...Object.keys(COLLEGE_COURSES),
        ...students
          .map((student) => student.college)
          .filter(
            (college) =>
              college && college !== "Unclassified",
          ),
      ]),
    ).sort();
  }, [students]);

  // COURSE OPTIONS DEPEND ON SELECTED COLLEGE
  const courses = useMemo(() => {
    const configuredCourses =
      draftFilters.college === ALL
        ? Object.keys(COURSE_MAJORS)
        : COLLEGE_COURSES[draftFilters.college] ?? [];

    const savedCourses = students
      .filter(
        (student) =>
          draftFilters.college === ALL ||
          student.college === draftFilters.college,
      )
      .map((student) => student.course)
      .filter((course) => course && course !== "—");

    return Array.from(
      new Set([...configuredCourses, ...savedCourses]),
    ).sort();
  }, [students, draftFilters.college]);

  // MAJOR OPTIONS DEPEND ON SELECTED COURSE
  const majors = useMemo(() => {
    const mappedMajors =
      draftFilters.course !== ALL
        ? COURSE_MAJORS[draftFilters.course] ?? []
        : [];

    const savedMajors = students
      .filter(
        (student) =>
          (draftFilters.college === ALL ||
            student.college === draftFilters.college) &&
          (draftFilters.course === ALL ||
            student.course === draftFilters.course),
      )
      .map((student) => student.major)
      .filter(
        (major) =>
          major && major !== "—" && major !== "N/A",
      );

    return Array.from(
      new Set([...mappedMajors, ...savedMajors]),
    ).sort();
  }, [students, draftFilters.college, draftFilters.course]);

  // YEAR LEVEL OPTIONS DEPEND ON SELECTIONS
  const yearLevels = useMemo(() => {
    const savedYearLevels = students
      .filter(
        (student) =>
          (draftFilters.college === ALL ||
            student.college === draftFilters.college) &&
          (draftFilters.course === ALL ||
            student.course === draftFilters.course) &&
          (draftFilters.major === ALL ||
            student.major === draftFilters.major),
      )
      .map((student) => student.yearLevel)
      .filter((year) => year && year !== "—");

    return Array.from(
      new Set([...YEAR_LEVELS, ...savedYearLevels]),
    ).sort(
      (a, b) => getYearSortValue(a) - getYearSortValue(b),
    );
  }, [
    students,
    draftFilters.college,
    draftFilters.course,
    draftFilters.major,
  ]);

  // FILTER STUDENTS
  const filteredStudents = useMemo(() => {
    const query = `${search} ${appliedFilters.search}`
      .trim()
      .toLowerCase();

    return students.filter((student) => {
      const studentName = (
        student.studentName ?? ""
      ).toLowerCase();

      const studentId = (
        student.studentId ?? ""
      ).toLowerCase();

      const matchesSearch =
        !query ||
        studentName.includes(query) ||
        studentId.includes(query);

      const matchesCollege =
        appliedFilters.college === ALL ||
        student.college === appliedFilters.college;

      const matchesCourse =
        appliedFilters.course === ALL ||
        student.course === appliedFilters.course;

      const matchesMajor =
        appliedFilters.major === ALL ||
        student.major === appliedFilters.major;

      const matchesYear =
        appliedFilters.yearLevel === ALL ||
        student.yearLevel === appliedFilters.yearLevel;

      const matchesEnrollment =
        appliedFilters.enrollmentStatus === ALL ||
        student.enrollmentStatus ===
        appliedFilters.enrollmentStatus;

      const matchesProgress =
        appliedFilters.progress === "All Progress" ||
        student.progress === appliedFilters.progress;

      return (
        matchesSearch &&
        matchesCollege &&
        matchesCourse &&
        matchesMajor &&
        matchesYear &&
        matchesEnrollment &&
        matchesProgress
      );
    });
  }, [students, search, appliedFilters]);

  // DELETE STUDENT
  const handleDeleteStudent = (student: Student) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.studentName}?\n\nAll documents submitted under ${student.studentId} will also be deleted.`,
    );

    if (!confirmed) return;

    try {
      const deletedCount = deleteStudent(student.studentId);

      logActivity({
        action: "Student Deleted",
        resourceType: "Student",
        resource: `${student.studentName} (${student.studentId})`,
        details: `Deleted student record and ${deletedCount} document(s).`,
      });

      loadStudents();

      window.dispatchEvent(
        new Event(STUDENT_DOCUMENTS_UPDATED_EVENT),
      );
    } catch (error) {
      console.error("Failed to delete student:", error);
      window.alert(
        "Unable to delete this student. Please try again.",
      );
    }
  };

  // OPEN FILTERS
  const openFilters = () => {
    setDraftFilters({ ...appliedFilters });
    setFilterOpen(true);
  };

  // RESET DRAFT FILTERS
  const resetFilters = () => {
    setDraftFilters({ ...EMPTY_FILTERS });
  };

  // CANCEL WITHOUT APPLYING DRAFT CHANGES
  const cancelFilters = () => {
    setDraftFilters({ ...appliedFilters });
    setFilterOpen(false);
  };

  // APPLY FILTERS
  const applyFilters = () => {
    setAppliedFilters({ ...draftFilters });
    setSearch("");
    setFilterOpen(false);
  };

  // COUNT ACTIVE FILTERS
  const activeFilterCount = [
    appliedFilters.college !== ALL,
    appliedFilters.course !== ALL,
    appliedFilters.major !== ALL,
    appliedFilters.yearLevel !== ALL,
    appliedFilters.enrollmentStatus !== ALL,
    appliedFilters.progress !== "All Progress",
    Boolean(appliedFilters.search.trim()),
  ].filter(Boolean).length;

  // PROGRESS BADGE STYLE
  const progressBadgeClass = (
    progress: Student["progress"],
  ) => {
    if (progress === "Completed") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (progress === "No Documents Submitted") {
      return "bg-slate-100 text-slate-600";
    }

    return "bg-amber-50 text-amber-700";
  };

  // PROGRESS BAR STYLE
  const progressBarClass = (
    progress: Student["progress"],
  ) =>
    progress === "Completed"
      ? "bg-emerald-500"
      : "bg-amber-400";

  // OPEN STUDENT PROFILE
  const openStudentProfile = (studentId: string) => {
    router.push(
      `/student-profile-information?id=${encodeURIComponent(
        studentId,
      )}`,
    );
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f1f3fc] text-slate-800">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main
        className={`min-h-screen w-full transition-[margin,width] duration-300 ${sidebarOpen
            ? "lg:ml-[275px] lg:w-[calc(100%-275px)]"
            : "ml-0 w-full"
          }`}
      >
        <Topbar
          title="Student List"
          onToggleSidebar={() =>
            setSidebarOpen((current) => !current)
          }
        />

        <div className="mx-auto w-full max-w-[1600px] space-y-4 p-3 sm:p-5 lg:p-6">
          <WelcomeBanner />

          <section className="relative rounded-2xl bg-white shadow-sm">
            {/* HEADER */}
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
                    View and manage student records and document submissions.
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-[10px] text-blue-700">
                {students.length}{" "}
                {students.length === 1 ? "record" : "records"}
              </span>
            </div>

            {/* SEARCH AND FILTER BUTTON */}
            <div className="px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                {/* SEARCH */}
                <div className="relative w-full md:max-w-md">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search by Student Name or Student ID"
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* FILTER BUTTON AND DROPDOWN */}
                <div
                  ref={filterContainerRef}
                  className="relative w-full md:w-auto"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (filterOpen) {
                        setFilterOpen(false);
                      } else {
                        openFilters();
                      }
                    }}
                    aria-expanded={filterOpen}
                    aria-controls="student-filters-panel"
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 md:w-auto"
                  >
                    <SlidersHorizontal size={16} />

                    Filters

                    {activeFilterCount > 0 && (
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] text-white">
                        {activeFilterCount}
                      </span>
                    )}

                    <ChevronDown
                      size={15}
                      className={`transition-transform duration-300 ${filterOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {/* DROPDOWN FILTER PANEL */}
                  <div
                    className={`absolute right-0 top-full z-[100] mt-2 w-[min(92vw,680px)] transition-all duration-300 ease-in-out ${filterOpen
                        ? "visible translate-y-0 opacity-100"
                        : "invisible -translate-y-2 opacity-0 pointer-events-none"
                      }`}
                  >
                    <div className="max-h-[min(75vh,650px)] overflow-y-auto rounded-2xl">
                      <StudentFilters
                        isOpen={filterOpen}
                        draftFilters={draftFilters}
                        setDraftFilters={setDraftFilters}
                        colleges={colleges}
                        courses={courses.map((course) => ({
                          value: course,
                          label: getCourseLabel(course),
                        }))}
                        majors={majors}
                        yearLevels={yearLevels}
                        onReset={resetFilters}
                        onCancel={cancelFilters}
                        onApply={applyFilters}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CLEAR FILTERS */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 px-5 pb-3 sm:px-6">
                <span className="text-xs text-slate-500">
                  Filters applied:
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setAppliedFilters({ ...EMPTY_FILTERS });
                    setDraftFilters({ ...EMPTY_FILTERS });
                    setSearch("");
                  }}
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto px-5 sm:px-6 md:block">
              <table className="w-full min-w-[980px] border-separate border-spacing-0">
                <thead>
                  <tr className="text-left">
                    {[
                      "Student Name",
                      "Student ID",
                      "Course",
                      "Document Progress",
                      "Email",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="border-b border-slate-200 px-3 py-3 text-xs font-medium text-slate-600"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => {
                      const percentage = Math.min(
                        100,
                        Math.round(
                          (student.submittedCount /
                            Math.max(student.requiredCount, 1)) *
                          100,
                        ),
                      );

                      return (
                        <tr
                          key={student.studentId}
                          className="transition hover:bg-slate-50/80"
                        >
                          <td className="border-b border-slate-100 px-3 py-4 text-sm font-medium">
                            {student.studentName}
                          </td>

                          <td className="border-b border-slate-100 px-3 py-4 text-sm text-slate-600">
                            {student.studentId}
                          </td>

                          <td className="border-b border-slate-100 px-3 py-4 text-sm text-slate-600">
                            {getCourseLabel(student.course)}
                          </td>

                          <td className="border-b border-slate-100 px-3 py-4">
                            <div className="min-w-[145px]">
                              <div className="mb-1.5 flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold">
                                  {student.submittedCount}/
                                  {student.requiredCount} documents
                                </span>

                                <span className="text-[10px] text-slate-500">
                                  {percentage}%
                                </span>
                              </div>

                              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className={`h-full rounded-full ${progressBarClass(
                                    student.progress,
                                  )}`}
                                  style={{
                                    width: `${percentage}%`,
                                  }}
                                />
                              </div>

                              <span
                                className={`mt-1.5 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${progressBadgeClass(
                                  student.progress,
                                )}`}
                              >
                                {student.progress}
                              </span>
                            </div>
                          </td>

                          <td className="border-b border-slate-100 px-3 py-4 text-sm text-slate-600">
                            {student.email}
                          </td>

                          <td className="border-b border-slate-100 px-3 py-4">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                title="View Student"
                                aria-label={`View ${student.studentName}`}
                                onClick={() =>
                                  openStudentProfile(
                                    student.studentId,
                                  )
                                }
                                className="rounded-md p-2 text-blue-600 hover:bg-blue-50"
                              >
                                <Eye size={18} />
                              </button>

                              <button
                                type="button"
                                title="Delete Student"
                                aria-label={`Delete ${student.studentName}`}
                                onClick={() =>
                                  handleDeleteStudent(student)
                                }
                                className="rounded-md p-2 text-red-500 hover:bg-red-50"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 py-12 text-center text-sm text-slate-500"
                      >
                        {students.length === 0
                          ? "No students have submitted documents yet."
                          : "No students match your search or filters."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="grid gap-3 px-4 pb-4 md:hidden">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const percentage = Math.min(
                    100,
                    Math.round(
                      (student.submittedCount /
                        Math.max(student.requiredCount, 1)) *
                      100,
                    ),
                  );

                  return (
                    <article
                      key={student.studentId}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="break-words text-sm font-semibold">
                            {student.studentName}
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            {student.studentId}
                          </p>
                        </div>

                        <div className="flex">
                          <button
                            type="button"
                            aria-label={`View ${student.studentName}`}
                            onClick={() =>
                              openStudentProfile(
                                student.studentId,
                              )
                            }
                            className="rounded-md p-2 text-blue-600 hover:bg-blue-50"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            aria-label={`Delete ${student.studentName}`}
                            onClick={() =>
                              handleDeleteStudent(student)
                            }
                            className="rounded-md p-2 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                        <div>
                          <p className="text-[10px] uppercase text-slate-400">
                            Course
                          </p>

                          <p className="mt-1 break-words text-xs">
                            {getCourseLabel(student.course)}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase text-slate-400">
                            Email
                          </p>

                          <p className="mt-1 break-all text-xs">
                            {student.email}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase text-slate-400">
                            College / Classification
                          </p>

                          <p className="mt-1 break-words text-xs">
                            {student.college}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase text-slate-400">
                            Year Level
                          </p>

                          <p className="mt-1 text-xs">
                            {student.yearLevel}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="mb-1.5 flex justify-between gap-2">
                          <span className="text-xs font-semibold">
                            {student.submittedCount}/
                            {student.requiredCount} documents
                          </span>

                          <span className="text-[10px] text-slate-500">
                            {percentage}%
                          </span>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full ${progressBarClass(
                              student.progress,
                            )}`}
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>

                        <span
                          className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${progressBadgeClass(
                            student.progress,
                          )}`}
                        >
                          {student.progress}
                        </span>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                  {students.length === 0
                    ? "No students have submitted documents yet."
                    : "No students match your search or filters."}
                </div>
              )}
            </div>

            {/* FOOTER COUNT */}
            <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {filteredStudents.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {students.length}
                </span>{" "}
                students
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
