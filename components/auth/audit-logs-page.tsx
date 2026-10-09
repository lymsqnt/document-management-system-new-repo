"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock3,
  FileText, ListFilter, Menu, MoreHorizontal, RefreshCw, Search,
  ShieldCheck, UserRound, X,
} from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import { getAccounts, getCurrentUser, type UserProfile } from "@/lib/auth";
import { getAuditLogs, type AuditAction, type AuditLog } from "@/lib/validations/audit-logs";

const actionStyles: Record<AuditAction, string> = {
  "Sign In": "bg-blue-50 text-blue-700",
  "Sign Out": "bg-slate-100 text-slate-700",
  "Account Created": "bg-teal-50 text-teal-700",
  "Profile Updated": "bg-purple-50 text-purple-700",
  "Password Changed": "bg-orange-50 text-orange-700",
  "Password Reset": "bg-rose-50 text-rose-700",
  "Document Uploaded": "bg-violet-50 text-violet-700",
  "Student Deleted": "bg-red-50 text-red-700",
};

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function AuditLogs() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [accountNames, setAccountNames] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [userFilter, setUserFilter] = useState("All Users");
  const [actionFilter, setActionFilter] = useState("All Actions");
  const [resourceFilter, setResourceFilter] = useState("All Resources");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dateError, setDateError] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const pageSize = 8;

  useEffect(() => {
    const refresh = () => {
      setCurrentUser(getCurrentUser());
      setLogs(getAuditLogs());
      setAccountNames(getAccounts().map((account) => account.fullName.trim()).filter(Boolean));
    };
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
  }, []);

  const users = useMemo(() => [...new Set([...accountNames, ...logs.map((log) => log.user)])].sort(), [accountNames, logs]);
  const actions = useMemo(() => [...new Set(logs.map((log) => log.action))].sort(), [logs]);
  const resources = useMemo(() => [...new Set(logs.map((log) => log.resourceType))].sort(), [logs]);
  const filteredLogs = useMemo(() => logs.filter((log) => {
    const date = log.timestamp.slice(0, 10);
    const query = search.trim().toLowerCase();
    return (!fromDate || date >= fromDate) && (!toDate || date <= toDate) &&
      (userFilter === "All Users" || log.user === userFilter) &&
      (actionFilter === "All Actions" || log.action === actionFilter) &&
      (resourceFilter === "All Resources" || log.resourceType === resourceFilter) &&
      (!query || `${log.user} ${log.email} ${log.role} ${log.action} ${log.resource} ${log.details}`.toLowerCase().includes(query));
  }), [logs, fromDate, toDate, userFilter, actionFilter, resourceFilter, search]);
  const pageCount = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const visibleLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize);
  const displayName = currentUser?.fullName?.trim() || "Signed out";
  const displayRole = currentUser?.role?.trim() || "No active session";
  const today = new Date().toISOString().slice(0, 10);

  const validateDates = (nextFrom: string, nextTo: string) => {
    if (nextFrom && nextTo && nextFrom > nextTo) {
      setDateError("Start date must be on or before the end date.");
      return false;
    }
    if ((nextFrom && nextFrom > today) || (nextTo && nextTo > today)) {
      setDateError("Date range cannot include a future date.");
      return false;
    }
    setDateError("");
    return true;
  };
  const changeFrom = (value: string) => {
    if (!validateDates(value, toDate)) return;
    setFromDate(value);
    setPage(1);
  };
  const changeTo = (value: string) => {
    if (!validateDates(fromDate, value)) return;
    setToDate(value);
    setPage(1);
  };
  const clearFilters = () => {
    setFromDate(""); setToDate(""); setUserFilter("All Users");
    setActionFilter("All Actions"); setResourceFilter("All Resources");
    setSearch(""); setDateError(""); setPage(1);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f2f6fc] text-slate-800">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className={`min-h-screen w-full transition-[margin] duration-300 ${sidebarOpen ? "lg:ml-[275px] lg:w-[calc(100%-275px)]" : "ml-0 w-full"}`}>
        <header className="sticky top-0 z-30 flex min-h-[58px] items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 shadow-sm sm:px-5 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" aria-label="Toggle sidebar" onClick={() => setSidebarOpen((open) => !open)} className="rounded-lg p-2 hover:bg-slate-100"><Menu size={21} /></button>
            <h2 className="truncate text-base font-semibold text-[#12377f]">Audit Logs</h2>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button type="button" aria-label="Notifications" className="relative rounded-full border border-slate-200 p-2 text-slate-600"><Bell size={17} /></button>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-blue-200 bg-blue-100 text-xs font-semibold text-blue-800">
                {currentUser?.profileImage ? <img src={currentUser.profileImage} alt={displayName} className="h-full w-full object-cover" /> : <UserRound size={18} />}
              </div>
              <div className="hidden sm:block"><p className="text-xs font-semibold">{displayName}</p><p className="text-[11px] text-slate-500">{displayRole}</p></div>
              <ChevronDown size={14} className="hidden text-slate-500 sm:block" />
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1600px] space-y-3 p-3 sm:p-5 lg:p-6">
          <section className="relative flex min-h-[112px] items-center overflow-hidden rounded-2xl bg-gradient-to-r from-[#102c79] via-[#1644a8] to-[#1b4db5] px-5 py-5 text-white shadow-sm sm:px-7">
            <div className="flex items-center gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10"><ShieldCheck size={35} /></div><div><h1 className="text-xl font-semibold sm:text-2xl">Audit Logs</h1><p className="mt-1 max-w-lg text-xs leading-5 text-blue-100 sm:text-sm">Track account and document activity for greater accountability and transparency.</p></div></div>
            <FileText size={48} className="ml-auto hidden pr-2 text-blue-100/90 sm:block" />
          </section>

          <section className="rounded-2xl bg-white p-3 shadow-sm sm:p-4" aria-label="Audit log filters">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[1.15fr_1fr_1fr_1fr_auto]">
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-[#183b81]">Date Range</span>
                    <div className="flex min-h-10 items-center gap-2 rounded-lg border border-blue-200 px-2">
                            <CalendarDays size={15} className="shrink-0 text-blue-700" />
                            <input aria-label="Start date" type="date" max={today} value={fromDate} onChange={(event) => changeFrom(event.target.value)} className="min-w-0 w-full bg-transparent text-[11px] outline-none" />
                               <span className="text-slate-400">–</span>
                            <input aria-label="End date" type="date" max={today} value={toDate} onChange={(event) => changeTo(event.target.value)} className="min-w-0 w-full bg-transparent text-[11px] outline-none" />
                    </div>
              </label>
              <label className="block">
                    <span className="mb-1 block text-[11px] font-semibold text-[#183b81]">User</span>
                    <div className="flex min-h-10 items-center gap-2 rounded-lg border border-blue-200 px-2"><UserRound size={15} className="shrink-0 text-blue-700" />
                        <select aria-label="Filter by user" value={userFilter} onChange={(event) => { setUserFilter(event.target.value); setPage(1); }} className="w-full bg-transparent text-xs outline-none">
                            <option>All Users</option>{users.map((user) => <option key={user}>{user}</option>)}
                        </select>
                        
                    </div>
             </label>
             <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-[#183b81]">Action Type</span>
                    <div className="flex min-h-10 items-center gap-2 rounded-lg border border-blue-200 px-2">
                        <ListFilter size={15} className="shrink-0 text-blue-700" /><select aria-label="Filter by action" value={actionFilter} onChange={(event) => { setActionFilter(event.target.value); setPage(1); }} className="w-full bg-transparent text-xs outline-none">
                                <option>All Actions</option>
                                {actions.map((action) => <option key={action}>{action}</option>)}
                            </select>
                    </div>
              </label>
              <label className="block"><span className="mb-1 block text-[11px] font-semibold text-[#183b81]">Resource Type</span><div className="flex min-h-10 items-center gap-2 rounded-lg border border-blue-200 px-2"><FileText size={15} className="shrink-0 text-blue-700" /><select aria-label="Filter by resource type" value={resourceFilter} onChange={(event) => { setResourceFilter(event.target.value); setPage(1); }} className="w-full bg-transparent text-xs outline-none"><option>All Resources</option>{resources.map((resource) => <option key={resource}>{resource}</option>)}</select></div></label>
              <div className="flex items-end"><button type="button" onClick={clearFilters} className="flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-blue-200 px-3 text-xs font-medium text-blue-800 hover:bg-blue-50 xl:w-auto"><RefreshCw size={14} />Clear Filters</button></div>
            </div>
            {dateError && <p role="alert" className="mt-2 text-xs font-medium text-red-600">{dateError}</p>}
            <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3"><div className="flex min-h-9 flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3"><Search size={15} className="shrink-0 text-slate-400" /><input value={search} onChange={(event) => { setSearch(event.target.value.slice(0, 80)); setPage(1); }} maxLength={80} placeholder="Search by user, email, resource, or details" aria-label="Search audit logs" className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400" />{search && <button type="button" onClick={() => { setSearch(""); setPage(1); }} aria-label="Clear search"><X size={14} /></button>}</div><span className="hidden text-[11px] text-slate-500 sm:block">{filteredLogs.length} {filteredLogs.length === 1 ? "record" : "records"}</span></div>
          </section>

          <section className="overflow-hidden rounded-2xl bg-white p-2 shadow-sm sm:p-3">
            <div className="overflow-x-auto rounded-lg border border-blue-100">
              <table className="w-full min-w-[790px] border-collapse text-left text-[11px]">
                <thead className="bg-[#eef5ff] text-[#163b83]"><tr>{["Date & Time", "User", "Action", "Resource", "Details", "Actions"].map((heading) => <th key={heading} className="whitespace-nowrap px-3 py-3 font-semibold">{heading}</th>)}</tr></thead>
                <tbody className="divide-y divide-blue-100">
                  {visibleLogs.map((log) => <tr key={log.id} className="transition hover:bg-blue-50/40">
                    <td className="whitespace-nowrap px-3 py-3 text-slate-600">{formatDate(log.timestamp)} <span className="ml-1">{formatTime(log.timestamp)}</span></td>
                    <td className="px-3 py-2.5"><div className="flex min-w-[150px] items-center gap-2"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-800">{initials(log.user)}</span><span><span className="block whitespace-nowrap font-medium text-slate-800">{log.user}</span><span className="text-[10px] text-slate-500">{log.role} · {log.email}</span></span></div></td>
                    <td className="px-3 py-2.5"><span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1.5 font-medium ${actionStyles[log.action]}`}>{log.action}</span></td>
                    <td className="px-3 py-2.5"><span className="block text-slate-700">{log.resourceType}</span><span className="block max-w-[180px] truncate text-[10px] text-slate-500">{log.resource}</span></td>
                    <td className="max-w-[220px] px-3 py-2.5 leading-4 text-slate-600">{log.details}</td>
                    <td className="px-3 py-2.5"><button type="button" aria-label={`View details for ${log.user} ${log.action}`} onClick={() => setSelectedLog(log)} className="rounded p-1 text-blue-800 hover:bg-blue-100"><MoreHorizontal size={17} /></button></td>
                  </tr>)}
                  {visibleLogs.length === 0 && <tr><td colSpan={6} className="px-4 py-14 text-center"><div className="mx-auto flex max-w-sm flex-col items-center"><div className="mb-3 rounded-full bg-blue-50 p-3 text-blue-700"><Search size={22} /></div><p className="font-semibold text-slate-700">{logs.length ? "No audit logs found" : "No activity recorded yet"}</p><p className="mt-1 text-xs text-slate-500">{logs.length ? "Try changing your filters or date range." : "Successful sign-ins and account or document changes will appear here."}</p>{logs.length > 0 && <button type="button" onClick={clearFilters} className="mt-3 text-xs font-semibold text-blue-700 hover:underline">Clear all filters</button>}</div></td></tr>}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-3 text-[11px] text-slate-600"><span>Showing {filteredLogs.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filteredLogs.length)} of {filteredLogs.length} logs</span><nav aria-label="Audit logs pages" className="flex items-center gap-1"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} aria-label="Previous page" className="rounded-md border border-blue-100 p-1.5 text-blue-800 disabled:opacity-40"><ChevronLeft size={14} /></button>{Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button type="button" key={number} aria-current={page === number ? "page" : undefined} onClick={() => setPage(number)} className={`h-7 min-w-7 rounded-md border px-2 ${page === number ? "border-blue-700 bg-blue-700 text-white" : "border-blue-100 text-blue-800 hover:bg-blue-50"}`}>{number}</button>)}<button type="button" disabled={page >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} aria-label="Next page" className="rounded-md border border-blue-100 p-1.5 text-blue-800 disabled:opacity-40"><ChevronRight size={14} /></button></nav></div>
          </section>
          <p className="flex items-center justify-end gap-1 px-1 text-[10px] text-slate-400"><Clock3 size={12} />Times are displayed in your local timezone.</p>
        </div>
      </main>

      {selectedLog && <div role="presentation" onClick={() => setSelectedLog(null)} className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4"><section role="dialog" aria-modal="true" aria-labelledby="log-detail-title" onClick={(event) => event.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Audit record</p><h2 id="log-detail-title" className="mt-1 text-lg font-semibold text-slate-900">Activity details</h2></div><button type="button" onClick={() => setSelectedLog(null)} aria-label="Close details" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button></div><dl className="mt-5 grid grid-cols-[100px_1fr] gap-x-3 gap-y-3 text-xs"><dt className="text-slate-500">Date & time</dt><dd className="font-medium">{formatDate(selectedLog.timestamp)} at {formatTime(selectedLog.timestamp)}</dd><dt className="text-slate-500">User</dt><dd className="font-medium">{selectedLog.user} <span className="font-normal text-slate-500">({selectedLog.role})</span></dd><dt className="text-slate-500">Email</dt><dd className="font-medium">{selectedLog.email}</dd><dt className="text-slate-500">Action</dt><dd><span className={`rounded-full px-2 py-1 font-medium ${actionStyles[selectedLog.action]}`}>{selectedLog.action}</span></dd><dt className="text-slate-500">Resource</dt><dd className="font-medium">{selectedLog.resourceType}: {selectedLog.resource}</dd><dt className="text-slate-500">Details</dt><dd className="font-medium">{selectedLog.details}</dd></dl><div className="mt-6 flex justify-end"><button type="button" onClick={() => setSelectedLog(null)} className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800">Close</button></div></section></div>}
    </div>
  );
}