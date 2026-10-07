"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, KeyRound, LockKeyhole, Send } from "lucide-react";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Checkbox from "@/components/ui/checkbox";
import RecoveryCheckEmail from "@/components/auth/recovery-check-email";
import RecoverySuccess from "@/components/auth/recovery-success";
import ResetPasswordForm from "@/components/auth/reset-password-form";
import { findAccountByEmail, resetPasswordByEmail } from "@/lib/auth";
import {
  validateAccountRecovery,
  type AccountRecoveryErrors,
} from "@/lib/validations/account-recovery";

type RecoveryStep = "email" | "check-email" | "reset-password" | "success";

export default function AccountRecovery() {
  const [step, setStep] = useState<RecoveryStep>("email");
  const [email, setEmail] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [notRobot, setNotRobot] = useState(false);
  const [errors, setErrors] = useState<AccountRecoveryErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    const validationErrors = validateAccountRecovery({
      email: normalizedEmail,
      notRobot,
    });

    if (!validationErrors.email && !findAccountByEmail(normalizedEmail)) {
      validationErrors.email = "No registered account found with this email.";
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setRecoveryEmail(normalizedEmail);
    setStep("check-email");
  }

  function restartRecovery() {
    setStep("email");
    setEmail("");
    setRecoveryEmail("");
    setNotRobot(false);
    setErrors({});
  }

  const title =
    step === "check-email"
      ? "Check Your Email"
      : step === "reset-password"
        ? "Reset Password"
        : step === "success"
          ? "Password Changed"
          : "Account Recovery";

  const description =
    step === "check-email"
      ? "We've prepared a demo recovery link for your registered account."
      : step === "reset-password"
        ? "Create a new password for your registered account."
        : step === "success"
          ? "Your password has been updated in this frontend demo."
          : "Enter your registered email address and we'll send you instructions to reset your password.";

  return (
    <main
      className="relative min-h-screen overflow-x-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/school-bg.png')" }}
    >
      <div className="absolute inset-0 bg-white/10" />

      <img
        src="/login-layout.png"
        alt=""
        className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden h-full w-auto object-contain object-left lg:block"
      />

      <img
        src="/Qeci_Logo.png"
        alt="Quezonian Educational College Inc. Logo"
        className="pointer-events-none absolute left-1/2 top-5 z-30 h-20 w-20 -translate-x-1/2 object-contain drop-shadow-xl sm:top-7 sm:h-24 sm:w-24 md:h-28 md:w-28 lg:left-[7%] lg:top-1/2 lg:h-60 lg:w-60 lg:-translate-x-0 lg:-translate-y-1/2 xl:h-72 xl:w-72"
      />

      <div className="ml-50 relative z-20 flex min-h-screen flex-col items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="mb-4 w-full pt-24 text-center sm:pt-28 md:pt-32 lg:pt-0">
          <h1 className="text-lg font-bold leading-tight tracking-tight text-black sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl">
            QUEZONIAN EDUCATIONAL COLLEGE, INC
          </h1>

          <p className="mt-1 text-[11px] font-medium text-black sm:text-xs md:text-sm">
            Document Management Systems(DMS)
          </p>
        </div>

        <fieldset className="card card-sm w-full max-w-md overflow-hidden bg-white text-black shadow-2xl sm:max-w-md md:max-w-lg lg:max-w-2xl">
          <div className="h-2 bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600 sm:h-3" />

          <div className="card-body px-4 py-6 sm:px-7 sm:py-7 md:px-9 lg:px-14 lg:py-9">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 sm:gap-3 lg:gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 sm:h-14 sm:w-14 lg:h-16 lg:w-16">
                  {step === "success" ? (
                    <CheckCircle2
                      className="text-green-600"
                      size={28}
                      strokeWidth={1.8}
                    />
                  ) : step === "reset-password" ? (
                    <KeyRound
                      className="text-blue-600"
                      size={28}
                      strokeWidth={1.8}
                    />
                  ) : (
                    <LockKeyhole
                      className="text-blue-600"
                      size={28}
                      strokeWidth={1.8}
                    />
                  )}
                </div>

                <h2 className="text-xl font-bold tracking-tight text-black sm:text-2xl md:text-3xl lg:text-4xl">
                  {title}
                </h2>
              </div>

              <p className="mx-auto mt-2 max-w-md text-[11px] leading-tight text-gray-700 sm:text-xs md:text-sm">
                {description}
              </p>
            </div>

            <div className="my-4 border-t border-gray-300 sm:my-5 lg:my-6" />

            {step === "email" && (
              <form onSubmit={handleSubmit} noValidate>
                <div>
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-black sm:text-base lg:text-lg"
                  >
                    Email Address
                  </label>

                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setErrors((previous) => ({
                        ...previous,
                        email: undefined,
                      }));
                    }}
                    aria-invalid={Boolean(errors.email)}
                  />

                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="mt-5 sm:mt-6 lg:mt-7">
                  <h3 className="text-sm font-semibold text-black sm:text-base lg:text-lg">
                    Security Verification
                  </h3>

                  <p className="mt-1 text-[11px] text-gray-700 sm:text-xs lg:text-sm">
                    Please Complete the verification to continue
                  </p>

                  <Checkbox
                    id="verification"
                    label="I'm not a robot"
                    checked={notRobot}
                    onChange={(event) => {
                      setNotRobot(event.target.checked);
                      setErrors((previous) => ({
                        ...previous,
                        notRobot: undefined,
                      }));
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-2 focus:ring-blue-100"
                  />

                  {errors.notRobot && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.notRobot}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="mt-5 h-10 w-full rounded-full border-0 bg-gradient-to-r from-blue-900 to-blue-600 text-sm font-semibold text-white shadow-md hover:from-blue-950 hover:to-blue-700 sm:mt-6 sm:h-11 lg:mt-7 lg:h-12 lg:text-base"
                >
                  <Send size={18} strokeWidth={1.8} />
                  Send recovery link
                </Button>
              </form>
            )}

            {step === "check-email" && (
              <RecoveryCheckEmail
                email={recoveryEmail}
                onContinue={() => setStep("reset-password")}
              />
            )}

            {step === "reset-password" && (
              <ResetPasswordForm
                email={recoveryEmail}
                onResetPassword={resetPasswordByEmail}
                onSuccess={() => setStep("success")}
              />
            )}

            {step === "success" && <RecoverySuccess />}

            <div className="mt-3 flex flex-wrap items-center justify-center gap-1 border-t border-gray-300 pt-3 text-center sm:mt-4 sm:gap-2">
              {step === "email" ? (
                <>
                  <span className="text-[11px] text-gray-500 sm:text-xs lg:text-sm">
                    Remember your password?
                  </span>
                  <Link
                    href="/login"
                    className="text-[11px] font-semibold text-blue-800 hover:text-blue-600 hover:underline sm:text-xs lg:text-sm"
                  >
                    Login Here
                  </Link>
                </>
              ) : (
                <button
                  type="button"
                  onClick={restartRecovery}
                  className="text-[11px] font-semibold text-blue-800 hover:text-blue-600 hover:underline sm:text-xs lg:text-sm"
                >
                  Start account recovery again
                </button>
              )}
            </div>
          </div>
        </fieldset>
      </div>
    </main>
  );
}