"use client";

import Link from "next/link";

export default function RecoverySuccess() {
  return (
    <div>
      <div
        role="status"
        className="rounded-md border border-green-200 bg-green-50 px-3 py-3 text-xs text-green-700 sm:text-sm"
      >
        Password changed successfully. You can now log in using your new
        password.
      </div>

      <Link
        href="/login"
        className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-full border-0 bg-gradient-to-r from-blue-900 to-blue-600 text-sm font-semibold text-white shadow-md hover:from-blue-950 hover:to-blue-700 sm:mt-6 sm:h-11 lg:h-12 lg:text-base"
      >
        Go to Login
      </Link>
    </div>
  );
}