"use client";

import { useState, type FormEvent } from "react";
import { KeyRound } from "lucide-react";

import Button from "@/components/ui/button";
import InputPass from "@/components/ui/inputpass";
import {
  validateResetPassword,
  type ResetPasswordErrors,
} from "@/lib/validations/reset-password";

type ResetPasswordFormProps = {
  email: string;
  onResetPassword: (
    email: string,
    newPassword: string
  ) => { success: true } | { success: false; message: string };
  onSuccess: () => void;
};

export default function ResetPasswordForm({
  email,
  onResetPassword,
  onSuccess,
}: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<ResetPasswordErrors>({});
  const [formError, setFormError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const validationErrors = validateResetPassword({
      password,
      confirmPassword,
    });

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const result = onResetPassword(email, password);

    if (!result.success) {
      setFormError(result.message);
      return;
    }

    setPassword("");
    setConfirmPassword("");
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div>
        <label
          htmlFor="newPassword"
          className="text-sm font-semibold text-black sm:text-base lg:text-lg"
        >
          New Password
        </label>

        <InputPass
          id="newPassword"
          name="newPassword"
          autoComplete="new-password"
          placeholder="Enter new password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setErrors((previous) => ({
              ...previous,
              password: undefined,
            }));
            setFormError("");
          }}
          aria-invalid={Boolean(errors.password)}
        />

        {errors.password && (
          <p className="mt-1 text-xs text-red-600">{errors.password}</p>
        )}
      </div>

      <div className="mt-4">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-semibold text-black sm:text-base lg:text-lg"
        >
          Confirm New Password
        </label>

        <InputPass
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            setErrors((previous) => ({
              ...previous,
              confirmPassword: undefined,
            }));
            setFormError("");
          }}
          aria-invalid={Boolean(errors.confirmPassword)}
        />

        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-600">
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {formError && (
        <p
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 sm:text-sm"
        >
          {formError}
        </p>
      )}

      <Button
        type="submit"
        className="mt-5 h-10 w-full rounded-full border-0 bg-gradient-to-r from-blue-900 to-blue-600 text-sm font-semibold text-white shadow-md hover:from-blue-950 hover:to-blue-700 sm:mt-6 sm:h-11 lg:h-12 lg:text-base"
      >
        <KeyRound size={18} strokeWidth={1.8} />
        Change Password
      </Button>
    </form>
  );
}