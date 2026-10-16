import type { summarizeByDocument } from "@/lib/reports";

type DocumentSummary = ReturnType<typeof summarizeByDocument>[number];

type SubmissionsByDocumentProps = {
  rows: DocumentSummary[];
  totalStudents: number;
};

export default function SubmissionsByDocument({
  rows,
  totalStudents,
}: SubmissionsByDocumentProps) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm print:break-inside-avoid print:border print:border-slate-300 print:shadow-none">
      <h2 className="text-sm font-semibold text-slate-900">
        Submissions by Document
      </h2>
      <p className="mt-0.5 text-[11px] text-slate-500">
        Students who submitted each required document.
      </p>

      <ul className="mt-4 space-y-3">
        {rows.map((row) => {
          const rate = totalStudents
            ? Math.round((row.submitted / totalStudents) * 100)
            : 0;

          return (
            <li key={row.documentType}>
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className="font-medium text-slate-700">
                  {row.documentType}
                </span>
                <span className="text-right text-slate-500">
                  {row.submitted}/{totalStudents} submitted
                  {row.notSubmitted > 0 && (
                    <span className="text-red-600">
                      {" "}· {row.notSubmitted} not submitted
                    </span>
                  )}
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${rate}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
