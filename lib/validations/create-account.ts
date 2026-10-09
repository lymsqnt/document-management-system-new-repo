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

export const USERNAME_PATTERN =
  /^(?=.*[A-Za-z])(?=.*[^A-Za-z\d]).+$/;

export const EMAIL_PATTERN =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

/** Letters (incl. accents/ñ), spaces, periods, apostrophes and hyphens only. No numbers. */
export const FULL_NAME_PATTERN = /^\p{L}[\p{L}\s.'’-]*$/u;

/* ------------------------------------------------------------------ */
/* Helpers for the duplicate full-name check                           */
/* ------------------------------------------------------------------ */

/** Trim, collapse repeated spaces, ignore letter case. */
function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

/** Reads the registered accounts saved by the Create Account page. */
function getSavedAccounts(): { fullName?: string }[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem("demoAccounts") || "[]"
    );

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function isFullNameTaken(fullName: string): boolean {
  const entered = normalizeName(fullName);

  return getSavedAccounts().some(
    (account) => normalizeName(account.fullName ?? "") === entered
  );
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

export function validateCreateAccount(
  data: CreateAccountData
): CreateAccountErrors {
  const errors: CreateAccountErrors = {};

  /* Full Name */

  if (!data.fullName.trim()) {
    errors.fullName = "Full name is required.";
  } else if (!FULL_NAME_PATTERN.test(data.fullName.trim())) {
    errors.fullName =
      "Full name must contain letters only (no numbers or symbols).";
  } else if (isFullNameTaken(data.fullName)) {
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
  } else if (!EMAIL_PATTERN.test(email)) {
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