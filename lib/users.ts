import { getAccounts, getCurrentUser } from "@/lib/auth";

/**
 * active  = signed in on this browser right now
 * offline = registered, but not signed in
 */
export type UserPresence = "active" | "offline";

export type UserRow = {
  fullName: string;
  username: string;
  email: string;
  role: string;
  department: string;
  presence: UserPresence;
};

/** Read-only list of every registered account (passwords are never exposed). */
export function listUsers(): UserRow[] {
  const current = getCurrentUser();

  return getAccounts()
    .map((account) => {
      const signedIn =
        !!current &&
        current.username === account.username &&
        current.email === account.email;

      return {
        fullName: account.fullName ?? "",
        username: account.username ?? "",
        email: account.email ?? "",
        role: account.role ?? "",
        department: account.department ?? "",
        presence: signedIn ? ("active" as const) : ("offline" as const),
      };
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}