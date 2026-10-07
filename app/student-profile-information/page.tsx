import { Suspense } from "react";
import StudentProfileInformation from "@/components/documents/student-profile-information";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f4f6fb]">
          <p className="text-sm text-slate-500">
            Loading student profile...
          </p>
        </div>
      }
    >
      <StudentProfileInformation />
    </Suspense>
  );
}