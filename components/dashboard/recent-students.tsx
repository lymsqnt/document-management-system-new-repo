import { Eye, Users } from "lucide-react";

type Student = {
  studentId: string;
  studentName: string;
  course: string;
  major: string;
  yearLevel: string;
  email: string;
  dateSubmitted: string;
  profileImage?: string;
};

type RecentStudentsProps = {
  students: Student[];
  onViewStudent: (studentId: string) => void;
  onViewAll: () => void;
};

function formatDate(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

const avatarColors = [
  "bg-teal-600",
  "bg-blue-600",
  "bg-blue-500",
  "bg-teal-700",
  "bg-violet-500",
  "bg-slate-600",
];

export default function RecentStudents({
  students,
  onViewStudent,
  onViewAll,
}: RecentStudentsProps) {
  return (
    <section className="flex h-full min-h-[640px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* HEADER */}
      <div className="flex shrink-0 items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <Users size={20} strokeWidth={1.8} className="text-blue-700" />
          <h2 className="text-base font-semibold text-blue-900">
            Recent Students Encoded
          </h2>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          View All
        </button>
      </div>

      {/* STUDENTS */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {students.length === 0 ? (
          <div className="flex h-full min-h-[300px] items-center justify-center p-6">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Users size={22} />
              </div>
              <p className="mt-3 text-sm font-medium text-slate-700">
                No students encoded yet.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Encoded students will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border-t border-slate-100">
            {students.map((student, index) => (
              <div
                key={student.studentId}
                className="flex min-w-0 items-center gap-3 px-5 py-4"
              >
                {/* AVATAR */}
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-semibold text-white ${
                    avatarColors[index % avatarColors.length]
                  }`}
                >
                  {student.profileImage ? (
                    <img
                      src={student.profileImage}
                      alt={student.studentName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitials(student.studentName)
                  )}
                </div>

                {/* NAME + DETAILS */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {student.studentName}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {student.course}
                    {student.major &&
                      student.major !== "N/A" &&
                      ` - ${student.major}`}
                    {" | "}
                    {student.yearLevel}
                  </p>
                </div>

                {/* DATE */}
                <div className="shrink-0 text-right">
                  <p className="text-xs text-slate-500">
                    {formatDate(student.dateSubmitted)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatTime(student.dateSubmitted)}
                  </p>
                </div>

                {/* STATUS */}
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Encoded
                </span>

                {/* VIEW */}
                <button
                  type="button"
                  onClick={() => onViewStudent(student.studentId)}
                  aria-label={`View ${student.studentName}`}
                  className="rounded-md p-1.5 text-blue-600 transition hover:bg-blue-50"
                >
                  <Eye size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}