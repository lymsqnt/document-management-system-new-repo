import {
  ACCOUNT_EMAIL_PATTERN,
  FULL_NAME_PATTERN,
  USERNAME_PATTERN,
} from "@/lib/validations/patterns";

export type CreateAccountData = {
  fullName: string;
  username: string;
  email: string;
  role: string;
  department: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
};

export type CreateAccountErrors = Partial<
  Record<keyof CreateAccountData, string>
>;

/* ------------------------------------------------------------------ */
/* Helpers for the duplicate full-name check                           */
/* ------------------------------------------------------------------ */

/** Trim, collapse repeated spaces, ignore letter case. */
export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function isFullNameTaken(
  fullName: string,
  existingAccounts: { fullName?: string }[]
): boolean {
  const entered = normalizeName(fullName);

  return existingAccounts.some(
    (account) => normalizeName(account.fullName ?? "") === entered
  );
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

export function validateCreateAccount(
  data: CreateAccountData,
  existingAccounts: { fullName?: string }[]
): CreateAccountErrors {
  const errors: CreateAccountErrors = {};

  /* Full Name */

  if (!data.fullName.trim()) {
    errors.fullName = "Full name is required.";
  } else if (!FULL_NAME_PATTERN.test(data.fullName.trim())) {
    errors.fullName =
      "Full name must contain letters only (no numbers or symbols).";
  } else if (isFullNameTaken(data.fullName, existingAccounts)) {
    errors.fullName = "This full name is already registered.";
  }

  /* Username */

  const username = data.username.trim();

  if (!username) {
    errors.username = "Username is required.";
  } else if (username.length < 3) {
    errors.username = "Username must be at least 3 characters.";
  } else if (!USERNAME_PATTERN.test(username)) {
    errors.username =
      "Username must contain letters and special characters (e.g. @, _, ., -).";
  }

  /* Email */

  const email = data.email.trim();

  if (!email) {
    errors.email = "Email address is required.";
  } else if (!ACCOUNT_EMAIL_PATTERN.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  /* Role */

  if (!data.role) {
    errors.role = "Please select a role.";
  }

  /* Department */

  if (!data.department) {
    errors.department = "Please select a department.";
  }

  /* Password */

  if (!data.password) {
    errors.password = "Password is required.";
  } else if (data.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  /* Confirm Password */

  if (!data.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  /* Terms */

  if (!data.acceptedTerms) {
    errors.acceptedTerms =
      "Please agree to the Terms and Conditions and Data Privacy Policy.";
  }

  return errors;
}
