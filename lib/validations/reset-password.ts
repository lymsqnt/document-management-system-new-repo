export type ResetPasswordData = {
  password: string;
  confirmPassword: string;
};

export type ResetPasswordErrors = Partial<Record<keyof ResetPasswordData, string>>;

export function validateResetPassword(data: ResetPasswordData): ResetPasswordErrors {
  const errors: ResetPasswordErrors = {};

  if (!data.password) {
    errors.password = "Password is required.";
  } else if (data.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}