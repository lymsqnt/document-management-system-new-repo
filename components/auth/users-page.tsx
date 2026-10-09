"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Search,
  UserCog,
  Users,
  X,
} from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { listUsers, type UserPresence, type UserRow } from "@/lib/users";

const PAGE_SIZE = 8;

const presenceStyles: Record<
  UserPresence,
  { label: string; pill: string; dot: string }
> = {
  active: { label: "Active", pill: "bg-green-50 text-green-700", dot: "bg-green-500" },
  offline: { label: "Offline", pill: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
};

function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"
  );
}

export default function UsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  const refresh = useCallback(() => setUsers(listUsers()), []);

  useEffect(() => {
    const updateSidebar = () => setSidebarOpen(window.innerWidth >= 1024);
    refresh();
    updateSidebar();
    window.addEventListener("resize", updateSidebar);
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("resize", updateSidebar);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) =>
      `${user.fullName} ${user.username} ${user.email} ${user.role} ${user.department} ${presenceStyles[user.presence].label}`
        .toLowerCase()
        .includes(query)
    );
  }, [users, search]);

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleUsers = filteredUsers.slice(startIndex, startIndex + PAGE_SIZE);

  useEffect(() => {
    if (!selectedUser) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedUser(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedUser]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f2f6fc] text-slate-800">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main
        className={`min-h-screen w-full transition-[margin] duration-300 ${
          sidebarOpen ? "lg:ml-[275px] lg:w-[calc(100%-275px)]" : "ml-0 w-full"
        }`}
      >
        <Topbar title="Users" onToggleSidebar={() => setSidebarOpen((open) => !open)} />

        <div className="mx-auto w-full max-w-[1600px] space-y-3 p-3 sm:p-5 lg:p-6">
          {/* Page banner (same treatment as Audit Logs) */}
          <section className="relative flex min-h-[112px] items-center overflow-hidden rounded-2xl bg-gradient-to-r from-[#102c79] via-[#1644a8] to-[#1b4db5] px-5 py-5 text-white shadow-sm sm:px-7">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <UserCog size={35} />
              </div>
              <div>
                <h1 className="text-xl font-semibold sm:text-2xl">Users</h1>
                <p className="mt-1 max-w-lg text-xs leading-5 text-blue-100 sm:text-sm">
                  See everyone registered in the system, along with their role and department.
                </p>
              </div>
            </div>
            <Users size={48} className="ml-auto hidden pr-2 text-blue-100/90 sm:block" />
          </section>

          {/* Search */}
          <section className="rounded-2xl bg-white p-3 shadow-sm sm:p-4" aria-label="User search">
            <div className="flex items-center gap-2">
              <div className="flex min-h-9 flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3">
                <Search size={15} className="shrink-0 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value.slice(0, 80));
                    setPage(1);
                  }}
                  maxLength={80}
                  placeholder="Search by name, username, email, role, or department"
                  aria-label="Search users"
                  className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
                />
                {search && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => {
                      setSearch("");
                      setPage(1);
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <span className="hidden text-[11px] text-slate-500 sm:block">
                {filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"}
              </span>
            </div>
          </section>

          {/* Table */}
          <section className="overflow-hidden rounded-2xl bg-white p-2 shadow-sm sm:p-3">
            <div className="overflow-x-auto rounded-lg border border-blue-100">
              <table className="w-full min-w-[640px] border-collapse text-left text-[11px]">
                <thead className="bg-[#eef5ff] text-[#163b83]">
                  <tr>
                    {["User", "Role", "Status", "Actions"].map((heading) => (
                      <th key={heading} className="whitespace-nowrap px-3 py-3 font-semibold">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-blue-100">
                  {visibleUsers.map((user) => {
                    const style = presenceStyles[user.presence];

                    return (
                      <tr
                        key={`${user.username}|${user.email}`}
                        className="transition hover:bg-blue-50/40"
                      >
                        <td className="px-3 py-2.5">
                          <div className="flex min-w-[200px] items-center gap-2">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-800">
                              {initials(user.fullName)}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate font-medium text-slate-800">
                                {user.fullName || "Unnamed user"}
                              </span>
                              <span className="block truncate text-[10px] text-slate-500">
                                {user.email}
                              </span>
                            </span>
                          </div>
                        </td>

                        <td className="px-3 py-2.5">
                          <span className="block text-slate-700">{user.role || "No role"}</span>
                          {user.department && (
                            <span className="block max-w-[200px] truncate text-[10px] text-slate-500">
                              {user.department}
                            </span>
                          )}
                        </td>

                        <td className="px-3 py-2.5">
                          <span
                            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 font-medium ${style.pill}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                            {style.label}
                          </span>
                        </td>

                        <td className="px-3 py-2.5">
                          <button
                            type="button"
                            aria-label={`View details for ${user.fullName}`}
                            onClick={() => setSelectedUser(user)}
                            className="rounded p-1 text-blue-800 hover:bg-blue-100"
                          >
                            <MoreHorizontal size={17} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {visibleUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-14 text-center">
                        <div className="mx-auto flex max-w-sm flex-col items-center">
                          <div className="mb-3 rounded-full bg-blue-50 p-3 text-blue-700">
                            <Search size={22} />
                          </div>
                          <p className="font-semibold text-slate-700">
                            {users.length ? "No users found" : "No registered accounts yet"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {users.length
                              ? "Try a different name, email, or role."
                              : "Accounts created on the Create Account page will appear here."}
                          </p>
                          {users.length > 0 && search && (
                            <button
                              type="button"
                              onClick={() => {
                                setSearch("");
                                setPage(1);
                              }}
                              className="mt-3 text-xs font-semibold text-blue-700 hover:underline"
                            >
                              Clear search
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-3 text-[11px] text-slate-600">
              <span>
                Showing {filteredUsers.length ? startIndex + 1 : 0}–
                {Math.min(startIndex + PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length}{" "}
                users
              </span>

              <nav aria-label="Users pages" className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                  aria-label="Previous page"
                  className="rounded-md border border-blue-100 p-1.5 text-blue-800 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>

                {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                  <button
                    type="button"
                    key={number}
                    aria-current={currentPage === number ? "page" : undefined}
                    onClick={() => setPage(number)}
                    className={`h-7 min-w-7 rounded-md border px-2 ${
                      currentPage === number
                        ? "border-blue-700 bg-blue-700 text-white"
                        : "border-blue-100 text-blue-800 hover:bg-blue-50"
                    }`}
                  >
                    {number}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage >= pageCount}
                  onClick={() => setPage(currentPage + 1)}
                  aria-label="Next page"
                  className="rounded-md border border-blue-100 p-1.5 text-blue-800 disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </nav>
            </div>
          </section>
        </div>
      </main>

      {/* Read-only details */}
      {selectedUser && (
        <div
          role="presentation"
          onClick={() => setSelectedUser(null)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-detail-title"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <h2 id="user-detail-title" className="text-lg font-semibold text-slate-900">
                User details
              </h2>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                aria-label="Close details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <dl className="mt-5 grid grid-cols-[110px_1fr] gap-x-3 gap-y-3 text-xs">
              <dt className="text-slate-500">Full name</dt>
              <dd className="font-medium">{selectedUser.fullName || "—"}</dd>
              <dt className="text-slate-500">Username</dt>
              <dd className="font-medium">{selectedUser.username || "—"}</dd>
              <dt className="text-slate-500">Email</dt>
              <dd className="break-all font-medium">{selectedUser.email || "—"}</dd>
              <dt className="text-slate-500">Role</dt>
              <dd className="font-medium">{selectedUser.role || "—"}</dd>
              <dt className="text-slate-500">Department</dt>
              <dd className="font-medium">{selectedUser.department || "—"}</dd>
              <dt className="text-slate-500">Status</dt>
              <dd>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-medium ${presenceStyles[selectedUser.presence].pill}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${presenceStyles[selectedUser.presence].dot}`}
                  />
                  {presenceStyles[selectedUser.presence].label}
                </span>
              </dd>
            </dl>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}