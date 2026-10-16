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
