"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  BarChart3,
  Users,
  UserRound,
  History,
  Settings,
  LogOut,
  X,
} from "lucide-react";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Student List", href: "/student-list", icon: Users },
  { label: "Request", href: "/request", icon: ClipboardList },
  { label: "Report", href: "/report", icon: BarChart3 },
  { label: "Users", href: "/users", icon: Users },
  { label: "Profile", href: "/profile", icon: UserRound },
  { label: "Audit Logs", href: "/audit-logs", icon: History },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay for mobile and tablet */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[275px] max-w-[85vw] flex-col
          border-r border-blue-400/30
          bg-gradient-to-b from-[#071A52] via-[#123D91] to-[#2563EB]
          text-white shadow-xl transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo */}
        <div className="relative flex h-40 shrink-0 flex-col items-center justify-center border-b border-white/15 px-3 sm:h-44">
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-md p-2 text-white hover:bg-white/10"
          >
            <X size={20} />
          </button>

          <img
            src="/Qeci_Logo.png"
            alt="QECI Logo"
            className="mb-2 h-20 w-20 rounded-full object-contain sm:h-[90px] sm:w-[90px]"
          />

          <h1 className="text-base font-bold tracking-wide sm:text-[17px]">
            QUEZONIAN
          </h1>
          <p className="mt-0.5 text-center text-[10px]">
            EDUCATIONAL COLLEGE INC.
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4 sm:py-5">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex min-h-10 items-center gap-3 rounded-md px-3 py-2
                  text-xs transition-colors sm:text-[12px]
                  ${
                    active
                      ? "bg-[#3514df] font-semibold text-white shadow-md"
                      : "text-blue-50 hover:bg-white/10"
                  }`}
              >
                <Icon size={19} className="shrink-0" strokeWidth={1.7} />
                <span className="uppercase tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="shrink-0 border-t border-white/15 p-3">
        <a href="/login">
          <button
            type="button"
            className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2 text-xs text-blue-50 transition-colors hover:bg-white/10"
          >
            <LogOut size={20} />
            <span>LOG OUT</span>
          </button>
          </a>
        </div>
      </aside>
    </>
  );
}