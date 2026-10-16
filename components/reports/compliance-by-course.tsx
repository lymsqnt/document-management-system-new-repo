import { DOCUMENT_TYPES } from "@/lib/constants/student";
import type { summarizeByCourse } from "@/lib/reports";

type CourseSummary = ReturnType<typeof summarizeByCourse>[number];

type ComplianceByCourseProps = {
  rows: CourseSummary[];
};

export default function ComplianceByCourse({
  rows,
}: ComplianceByCourseProps) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm print:break-inside-avoid print:border print:border-slate-300 print:shadow-none">
      <h2 className="text-sm font-semibold text-slate-900">
        Compliance by Course
      </h2>
      <p className="mt-0.5 text-[11px] text-slate-500">
        Completed means all {DOCUMENT_TYPES.length} documents are submitted.
      </p>

      <div className="mt-4 overflow-x-auto print:overflow-visible">
        <table className="w-full min-w-[360px] text-left text-[11px] print:min-w-0">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              {["Course", "Students", "Completed", "Incomplete", "Rate"].map(
                (heading) => (
                  <th key={heading} className="py-2 pr-3 font-semibold">
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.course}>
                <td className="py-2 pr-3 font-medium text-slate-700">
                  {row.course}
                </td>
                <td className="py-2 pr-3">{row.total}</td>
                <td className="py-2 pr-3 text-emerald-700">
                  {row.completed}
                </td>
                <td className="py-2 pr-3 text-amber-700">
                  {row.incomplete}
                </td>
                <td className="py-2 pr-3 font-semibold">
                  {row.complianceRate}%
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-500">
                  No students to summarize.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
