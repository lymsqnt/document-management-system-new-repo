import type { UserProfile } from "@/lib/types/account";
import {
  EMAIL_PATTERN,
  FULL_NAME_PATTERN,
  USERNAME_PATTERN,
} from "@/lib/validations/patterns";

/**
 * Checks the profile form. Returns an error message, or null if valid.
 * The username format is only checked when it changed, so older accounts
 * can still edit their other details.
 */
export function validateProfile(
  profile: UserProfile,
  oldUsername: string
): string | null {
  if (
    !profile.fullName.trim() ||
    !profile.username.trim() ||
    !profile.email.trim() ||
    !profile.role.trim() ||
    !profile.department.trim()
  ) {
    return "Please fill in all required fields.";
  }

  if (!EMAIL_PATTERN.test(profile.email.trim())) {
    return "Please enter a valid email address.";
  }

  if (!FULL_NAME_PATTERN.test(profile.fullName.trim())) {
    return "Full name must contain letters only (no numbers or symbols).";
  }

  const newUsername = profile.username.trim();
  const usernameChanged =
    newUsername.toLowerCase() !== oldUsername.trim().toLowerCase();

  if (usernameChanged) {
    if (newUsername.length < 3) {
      return "Username must be at least 3 characters.";
    }

    if (/\s/.test(newUsername)) {
      return "Username must not contain spaces.";
    }

    if (!USERNAME_PATTERN.test(newUsername)) {
      return "Username must mix letters and special characters (e.g. @, _, ., -).";
    }
  }

  return null;
}

export function validateNewPassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  return null;
}
