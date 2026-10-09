import { BarChart3, FilePlus, FileText, FolderPlus, Zap } from "lucide-react";

type QuickActionsProps = {
  onEncodeStudent: () => void;
  onUploadDocument: () => void;
  onViewReports: () => void;
};

export default function QuickActions({
  onEncodeStudent,
  onUploadDocument,
  onViewReports,
}: QuickActionsProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Zap size={20} strokeWidth={2} className="text-blue-700" />
        <h2 className="text-base font-semibold text-blue-900">Quick Actions</h2>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <button
          type="button"
          onClick={onEncodeStudent}
          className="flex h-14 items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 px-3 transition hover:bg-blue-100"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
            <FilePlus size={17} />
          </span>
          <span className="text-sm font-medium text-blue-900">
            Encode Student
          </span>
        </button>

        <button
          type="button"
          onClick={onUploadDocument}
          className="flex h-14 items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 px-3 transition hover:bg-blue-100"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
            <FileText size={17} />
          </span>
          <span className="text-sm font-medium text-blue-900">
            Upload Document
          </span>
        </button>

        <button
          type="button"
          disabled
          className="flex h-14 cursor-not-allowed items-center gap-3 rounded-lg border border-teal-100 bg-teal-50 px-3 opacity-80"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white">
            <FolderPlus size={17} />
          </span>
          <span className="text-sm font-medium text-teal-700">New Folder</span>
        </button>

        <button
          type="button"
          onClick={onViewReports}
          className="flex h-14 items-center gap-3 rounded-lg border border-purple-100 bg-purple-50 px-3 transition hover:bg-purple-100"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-500 text-white">
            <BarChart3 size={17} />
          </span>
          <span className="text-sm font-medium text-purple-700">
            View Reports
          </span>
        </button>
      </div>
    </section>
  );
}