import { Check, X } from "lucide-react";
import { DOCUMENT_TYPES } from "@/lib/constants/student";
import { getComplianceStatus, type ComplianceStatus } from "@/lib/reports";
import type { StudentSummary } from "@/lib/types/student";

type StudentComplianceTableProps = {
  students: StudentSummary[];
  allStudentsCount: number;
};

const statusStyles: Record<ComplianceStatus, string> = {
  Completed: "bg-emerald-50 text-emerald-700",
  Incomplete: "bg-amber-50 text-amber-700",
};

function hasMajor(major: string) {
  return Boolean(major) && major !== "N/A" && major !== "—";
}

export default function StudentComplianceTable({
  students,
  allStudentsCount,
}: StudentComplianceTableProps) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white p-2 shadow-sm sm:p-3 print:overflow-visible print:p-0 print:shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-3 pt-1 print:px-0">
        <h2 className="text-sm font-semibold text-slate-900">
          Student Compliance
        </h2>
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Check size={13} className="text-emerald-600" />
            Submitted
          </span>
          <span className="inline-flex items-center gap-1">
            <X size={13} className="text-red-500" />
            Not Submitted
          </span>
          <span>
            {students.length} {students.length === 1 ? "student" : "students"}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-blue-100 print:overflow-visible print:border-slate-300">
        <table className="w-full min-w-[980px] border-collapse text-left text-[11px] print:min-w-0 print:text-[9px]">
          <thead className="bg-[#eef5ff] text-[#163b83]">
            <tr>
              <th className="px-3 py-3 font-semibold">Student</th>
              <th className="px-3 py-3 font-semibold">Course / Year</th>
              {DOCUMENT_TYPES.map((documentType) => (
                <th
                  key={documentType}
                  className="px-2 py-3 text-center font-semibold"
                >
                  {documentType}
                </th>
              ))}
              <th className="px-3 py-3 text-center font-semibold">Submitted</th>
              <th className="px-3 py-3 font-semibold">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-blue-100">
            {students.map((student) => {
              const status = getComplianceStatus(student);

              return (
                <tr key={student.studentId} className="print:break-inside-avoid">
                  <td className="px-3 py-2.5">
                    <span className="block font-medium text-slate-800">
                      {student.studentName}
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      {student.studentId}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="block text-slate-700">{student.course}</span>
                    {hasMajor(student.major) && (
                      <span className="block max-w-[180px] truncate text-[10px] text-slate-500">
                        {student.major}
                      </span>
                    )}
                    <span className="block text-[10px] text-slate-500">
                      {student.yearLevel}
                    </span>
                  </td>

                  {DOCUMENT_TYPES.map((documentType) => {
                    const submitted =
                      student.submittedTypes.includes(documentType);

                    return (
                      <td
                        key={documentType}
                        className="px-2 py-2.5 text-center"
                      >
                        {submitted ? (
                          <Check
                            size={15}
                            aria-label="Submitted"
                            className="mx-auto text-emerald-600"
                          />
                        ) : (
                          <X
                            size={15}
                            aria-label="Not Submitted"
                            className="mx-auto text-red-500"
                          />
                        )}
                      </td>
                    );
                  })}

                  <td className="px-3 py-2.5 text-center font-medium">
                    {student.submittedCount}/{student.requiredCount}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 font-medium ${statusStyles[status]}`}
                    >
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}

            {students.length === 0 && (
              <tr>
                <td
                  colSpan={DOCUMENT_TYPES.length + 4}
                  className="px-4 py-14 text-center"
                >
                  <p className="font-semibold text-slate-700">
                    {allStudentsCount
                      ? "No students match these filters"
                      : "No student records yet"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {allStudentsCount
                      ? "Try a different course, major, year level, or status."
                      : "Students added on the Documents page will appear here."}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
