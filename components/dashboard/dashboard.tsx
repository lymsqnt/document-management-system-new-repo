"use client";

import { useEffect, useState } from "react";
import { Clock3, FileText, UserCog, Users } from "lucide-react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import WelcomeBanner from "@/components/layout/welcome-banner";

import StatCard from "@/components/dashboard/statcard";
import StudentDistribution from "@/components/dashboard/student-distribution";
import ActivityChart from "@/components/dashboard/activitychart";
import QuickActions from "@/components/dashboard/quick-actions";
import RecentStudents from "@/components/dashboard/recent-students";

import { getAccounts } from "@/lib/auth";

const STORAGE_KEY = "demo-student-documents";

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
  fileData?: string;
  profileImage?: string;
};

type DashboardStudent = {
  studentId: string;
  studentName: string;
  course: string;
  major: string;
  yearLevel: string;
  email: string;
  dateSubmitted: string;
  profileImage?: string;
};

/** Percent change: items dated this month vs. last month. Null if no basis to compare. */
function monthlyTrend(dates: string[]): number | null {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const prev = new Date(thisYear, thisMonth - 1, 1);

  let current = 0;
  let previous = 0;

  dates.forEach((value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return;
    if (d.getFullYear() === thisYear && d.getMonth() === thisMonth) current++;
    else if (
      d.getFullYear() === prev.getFullYear() &&
      d.getMonth() === prev.getMonth()
    )
      previous++;
  });

  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export default function Dashboard() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [students, setStudents] = useState<DashboardStudent[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);

  const loadDashboardData = () => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        setDocuments([]);
        setStudents([]);
        setTotalUsers(getAccounts().length);
        return;
      }

      const parsed: unknown = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        setDocuments([]);
        setStudents([]);
        setTotalUsers(getAccounts().length);
        return;
      }

      const records = parsed as StudentDocument[];
      setDocuments(records);

      const studentMap = new Map<string, DashboardStudent>();

      records.forEach((record) => {
        const normalizedId = record.studentId?.trim().toUpperCase();
        if (!normalizedId) return;

        const existing = studentMap.get(normalizedId);

        if (!existing) {
          studentMap.set(normalizedId, {
            studentId: record.studentId,
            studentName: record.studentName,
            course: record.course || "—",
            major: record.major || "N/A",
            yearLevel: record.yearLevel || "—",
            email: record.email || "",
            dateSubmitted: record.dateSubmitted || "",
            profileImage: record.profileImage,
          });
          return;
        }

        const existingTime = new Date(existing.dateSubmitted).getTime();
        const currentTime = new Date(record.dateSubmitted).getTime();

        if (
          !Number.isNaN(currentTime) &&
          (Number.isNaN(existingTime) || currentTime > existingTime)
        ) {
          existing.dateSubmitted = record.dateSubmitted;
          if (record.profileImage) {
            existing.profileImage = record.profileImage;
          }
        }
      });

      const sortedStudents = Array.from(studentMap.values()).sort((a, b) => {
        const dateA = new Date(a.dateSubmitted).getTime();
        const dateB = new Date(b.dateSubmitted).getTime();

        if (Number.isNaN(dateA) && Number.isNaN(dateB)) return 0;
        if (Number.isNaN(dateA)) return 1;
        if (Number.isNaN(dateB)) return -1;
        return dateB - dateA;
      });

      setStudents(sortedStudents);
      setTotalUsers(getAccounts().length);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setDocuments([]);
      setStudents([]);
      setTotalUsers(getAccounts().length);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === "demoAccounts") {
        loadDashboardData();
      }
    };
    const handleFocus = () => loadDashboardData();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* Only 1st–4th Year are supported by the student validation. */
  const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

  const yearLevelData = yearLevels.map((yearLevel) => ({
    label: yearLevel,
    value: students.filter((student) => student.yearLevel === yearLevel)
      .length,
  }));

  /* Last 7 days document uploads. */
  const activityData = (() => {
    const result: { date: string; uploaded: number }[] = [];
    const today = new Date();

    for (let index = 6; index >= 0; index--) {
      const date = new Date(today);
      date.setHours(0, 0, 0, 0);
      date.setDate(today.getDate() - index);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateKey = `${year}-${month}-${day}`;

      const uploaded = documents.filter((document) =>
        document.dateSubmitted?.startsWith(dateKey)
      ).length;

      result.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        uploaded,
      });
    }

    return result;
  })();

  const stats = [
    {
      title: "Total Students Encoded",
      value: students.length,
      description: "Registered students",
      icon: Users,
      variant: "blue" as const,
      trend: monthlyTrend(students.map((s) => s.dateSubmitted)),
    },
    {
      title: "Total Documents",
      value: documents.length,
      description: "Submitted documents",
      icon: FileText,
      variant: "teal" as const,
      trend: monthlyTrend(documents.map((d) => d.dateSubmitted)),
    },
    {
      title: "Total Users",
      value: totalUsers,
      description: "Registered accounts",
      icon: UserCog,
      variant: "purple" as const,
      trend: null,
    },
    {
      title: "Pending Requests",
      value: 0,
      description: "No pending requests",
      icon: Clock3,
      variant: "red" as const,
      trend: null,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main
        className={`min-h-screen w-full transition-[margin,width] duration-300 ease-in-out ${
          sidebarOpen
            ? "lg:ml-[275px] lg:w-[calc(100%-275px)]"
            : "ml-0 w-full"
        }`}
      >
        <Topbar
          title="Dashboard"
          onToggleSidebar={() => setSidebarOpen((current) => !current)}
        />

        <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-5 lg:p-6">
          <WelcomeBanner />

          <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                description={stat.description}
                icon={stat.icon}
                variant={stat.variant}
                trend={stat.trend}
              />
            ))}
          </section>

          <section className="mt-5 grid items-stretch gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(420px,1fr)]">
            <div className="min-w-0 space-y-5">
              <StudentDistribution data={yearLevelData} />
              <ActivityChart data={activityData} />
              <QuickActions
                onEncodeStudent={() => router.push("/documents")}
                onUploadDocument={() => router.push("/documents")}
                onViewReports={() => router.push("/report")}
              />
            </div>

            <div className="min-w-0">
              <RecentStudents
                students={students.slice(0, 8)}
                onViewStudent={(studentId) =>
                  router.push(
                    `/student-profile-information?id=${encodeURIComponent(
                      studentId
                    )}`
                  )
                }
                onViewAll={() => router.push("/student-list")}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}