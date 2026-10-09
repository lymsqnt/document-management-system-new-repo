import { getCurrentUser } from "@/lib/auth";

export type AuditAction =
  | "Sign In"
  | "Sign Out"
  | "Account Created"
  | "Profile Updated"
  | "Password Changed"
  | "Password Reset"
  | "Document Uploaded"
  | "Document Updated"
  | "Student Deleted";

export type AuditResourceType = "Account" | "Profile" | "Security" | "Document" | "Student";

export type AuditLog = {
  id: string;
  timestamp: string;
  user: string;
  email: string;
  role: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resource: string;
  details: string;
};

const AUDIT_LOGS_KEY = "demoAuditLogs";
const ACTIONS: AuditAction[] = [
  "Sign In", "Sign Out", "Account Created", "Profile Updated", "Password Changed",
  "Password Reset", "Document Uploaded", "Document Updated", "Student Deleted",
];
const RESOURCE_TYPES: AuditResourceType[] = ["Account", "Profile", "Security", "Document", "Student"];

export function getAuditLogs(): AuditLog[] {
  if (typeof window === "undefined") return [];

  try {
    const stored: unknown = JSON.parse(localStorage.getItem(AUDIT_LOGS_KEY) || "[]");
    if (!Array.isArray(stored)) return [];

    return stored.filter((entry): entry is AuditLog =>
      typeof entry === "object" && entry !== null &&
      typeof (entry as AuditLog).id === "string" &&
      typeof (entry as AuditLog).timestamp === "string" &&
      typeof (entry as AuditLog).user === "string" &&
      typeof (entry as AuditLog).email === "string" &&
      typeof (entry as AuditLog).role === "string" &&
      ACTIONS.includes((entry as AuditLog).action) &&
      RESOURCE_TYPES.includes((entry as AuditLog).resourceType) &&
      !Number.isNaN(Date.parse((entry as AuditLog).timestamp)) &&
      typeof (entry as AuditLog).resource === "string" &&
      typeof (entry as AuditLog).details === "string"
    );
  } catch {
    return [];
  }
}

export function recordAuditLog(
  actor: { fullName: string; email: string; role: string },
  event: Pick<AuditLog, "action" | "resourceType" | "resource" | "details">
): void {
  if (typeof window === "undefined") return;

  try {
    const entry: AuditLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      user: actor.fullName.trim() || actor.email,
      email: actor.email.trim().toLowerCase(),
      role: actor.role.trim(),
      ...event,
    };
    const logs = getAuditLogs();
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify([entry, ...logs].slice(0, 1000)));
  } catch {
    // Audit logging must not prevent the underlying action.
  }
}

/** Para sa mga action ng naka-login na user (add/delete student, atbp.) */
export function logActivity(
  event: Pick<AuditLog, "action" | "resourceType" | "resource" | "details">
): void {
  const user = getCurrentUser();
  if (!user) return;

  recordAuditLog(
    { fullName: user.fullName, email: user.email, role: user.role },
    event
  );
}