import {
  clearCurrentUser,
  getAccounts,
  getCurrentUser,
  saveAccounts,
  saveCurrentUser,
} from "@/lib/storage/accounts";
import type { DemoAccount, SafeUser, UserProfile } from "@/lib/types/account";
import {
  normalizeName,
  type CreateAccountData,
} from "@/lib/validations/create-account";
import { validateNewPassword } from "@/lib/validations/profile";

type ActionResult = { success: true } | { success: false; message: string };

function toSafeUser(account: DemoAccount): SafeUser {
  const { password: _password, ...safeUser } = account;
  return safeUser;
}

/** Saves a new account. Run validateCreateAccount on the form first. */
export function createAccount(form: CreateAccountData): ActionResult {
  const accounts = getAccounts();
  const email = form.email.trim().toLowerCase();
  const username = form.username.trim();

  if (accounts.some((account) => account.email.toLowerCase() === email)) {
    return {
      success: false,
      message: "This email address is already registered.",
    };
  }

  if (
    accounts.some(
      (account) => account.username.toLowerCase() === username.toLowerCase()
    )
  ) {
    return { success: false, message: "This username is already taken." };
  }

  saveAccounts([
    ...accounts,
    {
      fullName: form.fullName.trim(),
      username,
      email,
      role: form.role,
      department: form.department,
      password: form.password,
    },
  ]);

  return { success: true };
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

  saveCurrentUser(safeUser);

  return {
    success: true,
    user: safeUser,
  };
}

export function logout(): void {
  clearCurrentUser();
}

/** Saves profile changes. Run validateProfile on the form first. */
export function updateProfile(
  oldUsername: string,
  oldEmail: string,
  profile: UserProfile
): ActionResult {
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

  const newName = normalizeName(profile.fullName);
  const newUsername = profile.username.trim();
  const newEmail = profile.email.trim().toLowerCase();

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
  saveCurrentUser(toSafeUser(accounts[accountIndex]));

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
): ActionResult {
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

  const passwordError = validateNewPassword(newPassword);

  if (passwordError) {
    return { success: false, message: passwordError };
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
): ActionResult {
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

  if (currentUser?.email.toLowerCase() === normalizedEmail) {
    saveCurrentUser(toSafeUser(accounts[accountIndex]));
  }

  return { success: true };
}
