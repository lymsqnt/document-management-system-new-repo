"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserRound } from "lucide-react";

import Input from "@/components/ui/input";
import InputPass from "@/components/ui/inputpass";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";

import { login } from "@/lib/auth";
import {
  getRememberedUsername,
  saveRememberedUsername,
} from "@/lib/storage/accounts";
import { validateLogin, type LoginErrors } from "@/lib/validations/login";

export default function Login() {
  const router = useRouter();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const rememberedUsername = getRememberedUsername();

    if (rememberedUsername) {
      setUsernameOrEmail(rememberedUsername);
      setRememberMe(true);
    }
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoginError("");

    const validationErrors = validateLogin({
      usernameOrEmail,
      password,
    });

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    const result = login(usernameOrEmail.trim(), password);

    if (!result.success) {
      setLoginError(result.message);
      setIsLoading(false);
      return;
    }

    saveRememberedUsername(rememberMe ? usernameOrEmail.trim() : null);

    router.push("/profile");
  }

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-100">
      {/* School background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/school-bg.png')" }}
      />

      {/* Light overlay to improve readability */}
      <div className="absolute inset-0 bg-white/10" />

      {/* Blue curved decorative design */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[38%] min-w-[260px] max-w-[620px]">
        <img
          src="/login-layout.png"
          alt=""
          className="h-full w-full object-cover object-left"
        />
      </div>

      {/* QECI logo */}
      <div className="absolute left-[8%] top-1/2 z-20 hidden -translate-y-1/2 md:block">
        <img
          src="/Qeci_Logo.png"
          alt="Quezonian Educational College logo"
          className="h-auto w-[clamp(150px,20vw,300px)] drop-shadow-md"
        />
      </div>

      {/* Login content */}
      <section className="relative z-30 flex min-h-screen w-full flex-col items-center justify-center px-5 py-10 md:ml-[8vw] md:w-[min(560px,90vw)] md:px-0">
        {/* School heading */}
        <header className="mb-7 w-full text-center text-slate-950">
          <h1 className="text-xl font-extrabold uppercase leading-tight tracking-wide sm:text-2xl md:text-[25px]">
            Quezonian Educational College, Inc
          </h1>
          <p className="mt-1 text-sm font-medium sm:text-base">
            Document Management Systems (DMS)
          </p>
        </header>

        {/* Login card */}
        <div className="w-full overflow-hidden rounded-xl bg-white shadow-2xl shadow-slate-900/25">
          {/* Blue top accent */}
          <div className="h-2.5 w-full bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600" />

          <div className="px-6 pb-8 pt-8 sm:px-10 sm:pb-10 sm:pt-9">
            {/* Welcome text */}
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-[34px]">
                Welcome <span className="font-semibold">Back!</span>
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                please login to access your account
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Username */}
              <div>
                <label
                  htmlFor="usernameOrEmail"
                  className="mb-1.5 block text-base font-medium text-slate-900"
                >
                  Username
                </label>

                <div className="relative">
                  <UserRound
                    size={19}
                    strokeWidth={1.5}
                    className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-500"
                  />

                  <Input
                    id="usernameOrEmail"
                    name="usernameOrEmail"
                    type="text"
                    autoComplete="username"
                    placeholder="User@gmail.com"
                    value={usernameOrEmail}
                    onChange={(event) => {
                      setUsernameOrEmail(event.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        usernameOrEmail: "",
                      }));
                      setLoginError("");
                    }}
                    aria-invalid={Boolean(errors.usernameOrEmail)}
                    className="h-11 w-full rounded-md border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {errors.usernameOrEmail && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.usernameOrEmail}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-base font-medium text-slate-900"
                >
                  Password
                </label>

                <InputPass
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your Password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      password: "",
                    }));
                    setLoginError("");
                  }}
                  aria-invalid={Boolean(errors.password)}
                  className="h-11 w-full rounded-md border border-slate-300 bg-white text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />

                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember me and forgot password */}
              <div className="flex items-center justify-between gap-3">
                <Checkbox
                  label="Remember me"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                   className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-2 focus:ring-blue-100"
                />

                <Link
                  href="/Account-recovery"
                  className="text-sm font-medium text-blue-700 underline-offset-2 transition hover:text-blue-900 hover:underline"
                >
                  Forgot Password
                </Link>
              </div>

              {/* Login error */}
              {loginError && (
                <div
                  role="alert"
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                  {loginError}
                </div>
              )}

              {/* Login button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="mt-2 h-11 w-full rounded-full bg-gradient-to-r from-blue-900 to-blue-600 text-base font-semibold text-white shadow-md transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-3 pt-1">
                <div className="h-px flex-1 bg-slate-300" />
                <span className="text-xs text-slate-400">Or</span>
                <div className="h-px flex-1 bg-slate-300" />
              </div>

              {/* Create account */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-sm">
                <span className="text-slate-500">
                  Don't have an account?
                </span>
                <Link
                  href="/Create-Account"
                  className="font-semibold text-blue-800 transition hover:text-blue-600 hover:underline"
                >
                  Create Account
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Mobile logo */}
        <div className="mt-6 md:hidden">
          <img
            src="/Qeci_Logo.png"
            alt="Quezonian Educational College logo"
            className="h-auto w-24 drop-shadow-md"
          />
        </div>
      </section>
    </main>
  );
}