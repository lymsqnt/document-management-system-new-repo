import type { DemoAccount, SafeUser, UserProfile } from "@/lib/types/account";

export const ACCOUNTS_KEY = "demoAccounts";
const CURRENT_USER_KEY = "currentUser";
const REMEMBERED_USERNAME_KEY = "rememberedUsername";

export function getAccounts(): DemoAccount[] {
  if (typeof window === "undefined") return [];

  try {
    const storedAccounts = localStorage.getItem(ACCOUNTS_KEY);

    if (!storedAccounts) return [];

    const parsedAccounts: unknown = JSON.parse(storedAccounts);

    return Array.isArray(parsedAccounts)
      ? (parsedAccounts as DemoAccount[])
      : [];
  } catch {
    return [];
  }
}

export function saveAccounts(accounts: DemoAccount[]): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function getCurrentUser(): UserProfile | null {
  if (typeof window === "undefined") return null;

  try {
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);

    if (!storedUser) return null;

    const user = JSON.parse(storedUser) as Partial<UserProfile>;

    return {
      fullName: user.fullName ?? "",
      username: user.username ?? "",
      email: user.email ?? "",
      role: user.role ?? "",
      department: user.department ?? "",
      address: user.address ?? "",
      birthday: user.birthday ?? "",
      gender: user.gender ?? "",
      profileImage: user.profileImage ?? "",
    };
  } catch {
    return null;
  }
}

export function saveCurrentUser(user: SafeUser): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function clearCurrentUser(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getRememberedUsername(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(REMEMBERED_USERNAME_KEY);
}

/** Pass null to forget the remembered username. */
export function saveRememberedUsername(username: string | null): void {
  if (typeof window === "undefined") return;

  if (username) {
    localStorage.setItem(REMEMBERED_USERNAME_KEY, username);
  } else {
    localStorage.removeItem(REMEMBERED_USERNAME_KEY);
  }
}
