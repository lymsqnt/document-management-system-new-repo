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

type NavigationItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
};

type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

const navigationGroups: NavigationGroup[] = [
  {
    label: "Main",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Documents",
        href: "/documents",
        icon: FileText,
      },
      {
        label: "Student List",
        href: "/student-list",
        icon: Users,
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        label: "Request",
        href: "/request",
        icon: ClipboardList,
      },
      {
        label: "Report",
        href: "/report",
        icon: BarChart3,
      },
      {
        label: "Users",
        href: "/users",
        icon: Users,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        label: "Profile",
        href: "/profile",
        icon: UserRound,
      },
      {
        label: "Audit Logs",
        href: "/audit-logs-page",
        icon: History,
      },
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile / Tablet Overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px] transition-opacity duration-200 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[275px] max-w-[85vw] flex-col
    border-r border-white/10
    bg-gradient-to-b from-[#0B2A6F] via-[#1749A6] to-[#2563EB]
    text-white shadow-2xl
    transition-transform duration-300 ease-in-out
    ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >

        {/* ==================== */}
        {/* HEADER / LOGO */}
        {/* ==================== */}
        <div className="relative flex shrink-0 flex-col items-center border-b border-white/10 px-4 pb-5 pt-6">
          {/* Close Button */}
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-lg p-2 text-white/70
              transition-all duration-200
              hover:bg-white/10 hover:text-white
              focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <X size={19} strokeWidth={1.8} />
          </button>

          {/* Logo */}
          <div className="mb-3 flex h-[82px] w-[82px] items-center justify-center rounded-full bg-white/10 p-1 shadow-lg ring-1 ring-white/15">
            <img
              src="/Qeci_Logo.png"
              alt="QECI Logo"
              className="h-full w-full rounded-full object-contain"
            />
          </div>

          {/* School Name */}
          <h1 className="text-[16px] font-bold tracking-[0.08em] text-white">
            QUEZONIAN
          </h1>

          <p className="mt-1 text-center text-[9px] font-medium tracking-[0.12em] text-blue-100/80">
            EDUCATIONAL COLLEGE INC.
          </p>
        </div>

        {/* ==================== */}
        {/* NAVIGATION */}
        {/* ==================== */}
        <nav
          aria-label="Main navigation"
          className="flex-1 overflow-y-auto px-3 py-5"
        >
          <div className="space-y-6">
            {navigationGroups.map((group) => (
              <div key={group.label}>
                {/* Group Label */}
                <div className="mb-2 px-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-200/60">
                    {group.label}
                  </span>
                </div>

                {/* Group Items */}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={`group relative flex min-h-10 items-center gap-3 rounded-lg px-3 py-2.5
                          text-[12px] font-medium
                          transition-all duration-200 ease-out
                          focus:outline-none focus:ring-2 focus:ring-white/30
                          ${active
                            ? "bg-white/14 text-white shadow-sm"
                            : "text-blue-50/85 hover:bg-white/[0.08] hover:text-white"
                          }`}
                      >
                        {/* Active Indicator */}
                        <span
                          className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full
                            transition-all duration-200
                            ${active
                              ? "bg-white opacity-100"
                              : "bg-transparent opacity-0"
                            }`}
                        />

                        {/* Icon */}
                        <Icon
                          size={18}
                          strokeWidth={active ? 2 : 1.7}
                          className={`shrink-0 transition-all duration-200 ${active
                              ? "text-white"
                              : "text-blue-100/75 group-hover:text-white"
                            }`}
                        />

                        {/* Label */}
                        <span className="truncate tracking-wide">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* ==================== */}
        {/* LOGOUT */}
        {/* ==================== */}
        <div className="shrink-0 border-t border-white/10 p-3">
          <Link
            href="/login"
            onClick={onClose}
            className="group flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5
              text-[12px] font-medium text-blue-50/80
              transition-all duration-200
              hover:bg-white/[0.08] hover:text-white
              focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <LogOut
              size={18}
              strokeWidth={1.8}
              className="shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5"
            />

            <span className="tracking-wide">Log Out</span>
          </Link>
        </div>
      </aside>
    </>
  );
}