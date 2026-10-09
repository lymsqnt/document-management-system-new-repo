import {
  USERNAME_PATTERN,
  FULL_NAME_PATTERN,
} from "@/lib/validations/create-account";

/** Trim, collapse repeated spaces, ignore letter case. */
function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export type DemoAccount = {
  fullName: string;
  username: string;
  email: string;
  role: string;
  department: string;
  password: string;
  address?: string;
  birthday?: string;
  gender?: string;
  profileImage?: string;
};

export type UserProfile = {
  fullName: string;
  username: string;
  email: string;
  role: string;
  department: string;
  address: string;
  birthday: string;
  gender: string;
  profileImage?: string;
};

export type SafeUser = Omit<DemoAccount, "password">;

const ACCOUNTS_KEY = "demoAccounts";
const CURRENT_USER_KEY = "currentUser";

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

function toSafeUser(account: DemoAccount): SafeUser {
  const { password: _password, ...safeUser } = account;
  return safeUser;
}

export function login(
  usernameOrEmail: string,
  password: string
):
  | { success: true; user: SafeUser }
  | { success: false; message: string } {
  const accounts = getAccounts();
  const enteredUsername = usernameOrEmail.trim().toLowerCase();

  const matchedAccount = accounts.find((account) => {
    return (
      account.username.toLowerCase() === enteredUsername ||
      account.email.toLowerCase() === enteredUsername
    );
  });

  if (!matchedAccount || matchedAccount.password !== password) {
    return {
      success: false,
      message: "Invalid username/email or password.",
    };
  }

  const safeUser = toSafeUser(matchedAccount);

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));

  return {
    success: true,
    user: safeUser,
  };
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

export function logout(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(CURRENT_USER_KEY);
}

export function updateProfile(
  oldUsername: string,
  oldEmail: string,
  profile: UserProfile
):
  | { success: true }
  | { success: false; message: string } {
  const accounts = getAccounts();

  const accountIndex = accounts.findIndex(
    (account) =>
      account.username === oldUsername && account.email === oldEmail
  );

  if (accountIndex === -1) {
    return {
      success: false,
      message: "Account not found. Please log in again.",
    };
  }

  if (!FULL_NAME_PATTERN.test(profile.fullName.trim())) {
    return {
      success: false,
      message: "Full name must contain letters only (no numbers or symbols).",
    };
  }

  const newName = normalizeName(profile.fullName);
  const newUsername = profile.username.trim();
  const newEmail = profile.email.trim().toLowerCase();

  // Username format: letters + special characters (only checked when changed,
  // so older accounts can still edit their other details).
  const usernameChanged =
    newUsername.toLowerCase() !== oldUsername.trim().toLowerCase();

  if (usernameChanged) {
    if (newUsername.length < 3) {
      return {
        success: false,
        message: "Username must be at least 3 characters.",
      };
    }

    if (/\s/.test(newUsername)) {
      return {
        success: false,
        message: "Username must not contain spaces.",
      };
    }

    if (!USERNAME_PATTERN.test(newUsername)) {
      return {
        success: false,
        message:
          "Username must mix letters and special characters (e.g. @, _, ., -).",
      };
    }
  }

  // Full name, username and email must not belong to ANOTHER account.
  const others = accounts.filter((_, index) => index !== accountIndex);

  if (others.some((a) => normalizeName(a.fullName ?? "") === newName)) {
    return {
      success: false,
      message: "This full name is already used by another account.",
    };
  }

  if (
    others.some(
      (a) => (a.username ?? "").trim().toLowerCase() === newUsername.toLowerCase()
    )
  ) {
    return {
      success: false,
      message: "This username is already taken.",
    };
  }

  if (
    others.some((a) => (a.email ?? "").trim().toLowerCase() === newEmail)
  ) {
    return {
      success: false,
      message: "This email address is already registered.",
    };
  }

  accounts[accountIndex] = {
    ...accounts[accountIndex],
    ...profile,
  };

  saveAccounts(accounts);

  localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify(toSafeUser(accounts[accountIndex]))
  );

  return { success: true };
}

export function updatePassword(
  username: string,
  email: string,
  newPassword: string
): boolean {
  const accounts = getAccounts();

  const accountIndex = accounts.findIndex(
    (account) => account.username === username && account.email === email
  );

  if (accountIndex === -1) return false;

  accounts[accountIndex].password = newPassword;
  saveAccounts(accounts);

  return true;
}

export function getAccountPassword(username: string, email: string): string {
  const account = getAccounts().find(
    (item) => item.username === username && item.email === email
  );

  return account?.password ?? "";
}

export function changePassword(
  username: string,
  email: string,
  currentPassword: string,
  newPassword: string
): { success: true } | { success: false; message: string } {
  const accounts = getAccounts();

  const account = accounts.find(
    (item) => item.username === username && item.email === email
  );

  if (!account) {
    return {
      success: false,
      message: "Account not found. Please log in again.",
    };
  }

  if (account.password !== currentPassword) {
    return { success: false, message: "Current password is incorrect." };
  }

  if (newPassword.length < 8) {
    return {
      success: false,
      message: "New password must be at least 8 characters.",
    };
  }

  account.password = newPassword;
  saveAccounts(accounts);

  return { success: true };
}

export function findAccountByEmail(email: string): SafeUser | null {
  const normalizedEmail = email.trim().toLowerCase();

  const account = getAccounts().find(
    (item) => item.email.toLowerCase() === normalizedEmail
  );

  return account ? toSafeUser(account) : null;
}

export function resetPasswordByEmail(
  email: string,
  newPassword: string
): { success: true } | { success: false; message: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = getAccounts();

  const accountIndex = accounts.findIndex(
    (item) => item.email.toLowerCase() === normalizedEmail
  );

  if (accountIndex === -1) {
    return {
      success: false,
      message: "Account not found. Please start account recovery again.",
    };
  }

  accounts[accountIndex] = {
    ...accounts[accountIndex],
    password: newPassword,
  };

  saveAccounts(accounts);

  const currentUser = getCurrentUser();

  if (
    typeof window !== "undefined" &&
    currentUser?.email.toLowerCase() === normalizedEmail
  ) {
    localStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify(toSafeUser(accounts[accountIndex]))
    );
  }

  return { success: true };
}