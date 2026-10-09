"use client";

import { Bell, Menu, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser, type UserProfile } from "@/lib/auth";

type TopbarProps = {
  title: string;
  onToggleSidebar: () => void;
};

export default function Topbar({
  title,
  onToggleSidebar,
}: TopbarProps) {
  const [currentUser, setCurrentUser] =
    useState<UserProfile | null>(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  const initials =
    currentUser?.fullName
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((name) => name[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-5 lg:px-6">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Toggle sidebar"
          onClick={onToggleSidebar}
          className="rounded-md p-2 text-[#0B4FB3] transition-colors duration-200 hover:bg-blue-50 active:scale-95"
        >
          <Menu size={22} strokeWidth={2} />
        </button>

        <h1 className="text-xl font-bold text-[#102F68]">
          {title}
        </h1>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* NOTIFICATION */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-colors duration-200 hover:bg-slate-50"
        >
          <Bell size={19} strokeWidth={1.8} />

          <span className="absolute right-1 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            3
          </span>
        </button>

        {/* USER */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-xs font-semibold text-white">
            {currentUser?.profileImage ? (
              <img
                src={currentUser.profileImage}
                alt={currentUser.fullName || "User"}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <div className="hidden min-w-0 sm:block">
            <p className="max-w-[150px] truncate text-xs font-semibold text-[#102F68]">
              {currentUser?.fullName || "User"}
            </p>

            <p className="text-[10px] text-slate-500">
              {currentUser?.role || "Administrator"}
            </p>
          </div>

          <span className="hidden text-slate-500 sm:block">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </div>
      </div>
    </header>
  );
}