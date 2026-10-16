/** Must contain letters and at least one special character (e.g. @, _, ., -). */
export const USERNAME_PATTERN =
  /^(?=.*[A-Za-z])(?=.*[^A-Za-z\d]).+$/;

/** Letters (incl. accents/ñ), spaces, periods, apostrophes and hyphens only. No numbers. */
export const FULL_NAME_PATTERN = /^\p{L}[\p{L}\s.'’-]*$/u;

/** Stricter email check, used when creating an account. */
export const ACCOUNT_EMAIL_PATTERN =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

/** Basic email check, used for students, profile and account recovery. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Format XX-00-000, e.g. CS-23-033. */
export const STUDENT_ID_PATTERN = /^[A-Z]{2}-\d{2}-\d{3}$/;
