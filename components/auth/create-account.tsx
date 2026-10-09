"use client";

import { ROLES, DEPARTMENTS } from "@/lib/constants";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserRoundPlus, UserRound, AtSign,Mail, BriefcaseBusiness, LockKeyhole, Building2, Eye, EyeOff, } from "lucide-react";

import { validateCreateAccount, type CreateAccountData, type CreateAccountErrors,} from "@/lib/validations/create-account";

type DemoAccount = {
  fullName: string;
  username: string;
  email: string;
  role: string;
  department: string;
  password: string;
};

const initialForm: CreateAccountData = {
  fullName: "",
  username: "",
  email: "",
  role: "",
  department: "",
  password: "",
  confirmPassword: "",
  acceptedTerms: false,
};

const inputClass = "h-10 w-full rounded-md border border-gray-400 bg-white py-2 pl-10 pr-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-blue-700 focus:ring-1 focus:ring-blue-700";
const labelClass = "mb-1 block text-xs font-medium text-black sm:text-sm";
const iconClass = "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500";

export default function CreateAccount() {
  const router = useRouter();

  const [form, setForm] = useState<CreateAccountData>(initialForm);
  const [errors, setErrors] = useState<CreateAccountErrors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateField = <K extends keyof CreateAccountData>(
    field: K,
    value: CreateAccountData[K]
  ) => {
    setForm((previous) => ({ ...previous, [field]: value }));

    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));

    setFormError("");
  };

  const handleRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const validationErrors = validateCreateAccount(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const existingAccounts: DemoAccount[] = JSON.parse(
        localStorage.getItem("demoAccounts") || "[]"
      );

      const emailExists = existingAccounts.some(
        (account) =>
          account.email.toLowerCase() === form.email.trim().toLowerCase()
      );

      const usernameExists = existingAccounts.some(
        (account) =>
          account.username.toLowerCase() ===
          form.username.trim().toLowerCase()
      );

      if (emailExists || usernameExists) {
        setFormError(
          emailExists
            ? "This email address is already registered."
            : "This username is already taken."
        );
        setLoading(false);
        return;
      }

      const newAccount: DemoAccount = {
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
        department: form.department,
        password: form.password,
      };

      localStorage.setItem(
        "demoAccounts",
        JSON.stringify([...existingAccounts, newAccount])
      );

      // Registration is complete. The user can now log in.
      router.push("/login");
    } catch {
      setFormError("Unable to create account. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-cover bg-center bg-no-repeat px-4 py-6 sm:px-6 lg:py-8"
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
        className="pointer-events-none absolute left-1/2 top-4 z-30 h-20 w-20 -translate-x-1/2 object-contain drop-shadow-xl sm:top-6 sm:h-24 sm:w-24 md:h-28 md:w-28 lg:left-[7%] lg:top-1/2 lg:h-60 lg:-translate-y-1/2 lg:translate-x-0 xl:h-72 xl:w-72"
      />

      <div className="relative z-20 flex min-h-screen w-full flex-col items-center justify-center lg:ml-[25%] lg:w-[75%] lg:px-8">
        <header className="mb-4 w-full pt-20 text-center sm:pt-24 lg:pt-0">
          <h1 className="text-lg font-bold leading-tight tracking-tight text-black sm:text-2xl md:text-3xl xl:text-4xl">
            QUEZONIAN EDUCATIONAL COLLEGE, INC
          </h1>
          <p className="mt-1 text-[11px] font-medium text-black sm:text-xs md:text-sm">
            Document Management Systems (DMS)
          </p>
        </header>

        <section className="card w-full max-w-sm overflow-hidden rounded-xl bg-white text-black shadow-2xl sm:max-w-xl md:max-w-2xl xl:max-w-3xl">
          <div className="h-2 bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600 sm:h-3" />

          <div className="card-body px-4 py-5 sm:px-7 sm:py-6 md:px-9 lg:px-12 lg:py-7">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <UserRoundPlus
                  size={42}
                  strokeWidth={2}
                  className="shrink-0 text-black sm:h-12 sm:w-12"
                />

                <h2 className="text-xl font-bold tracking-tight text-black sm:text-2xl md:text-3xl lg:text-4xl">
                  Create an Account
                </h2>
              </div>

              <p className="mx-auto mt-2 text-xs text-gray-700 sm:text-sm">
                Register to Access the DMS
              </p>
            </div>

            <div className="my-4 border-t border-gray-300 sm:my-5" />

            <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="min-w-0">
                  <label htmlFor="fullName" className={labelClass}>
                    Full Name
                  </label>
                  <div className="relative">
                    <UserRound size={16} className={iconClass} />
                    <input id="fullName" type="text" autoComplete="name" placeholder="Enter your full name" value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)} className={inputClass} required />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
                  )}
                </div>

                <div className="min-w-0">
                  <label htmlFor="username" className={labelClass}>
                    Username
                  </label>
                  <div className="relative">
                    <AtSign size={16} className={iconClass} />
                    <input id="username" type="text" autoComplete="username"  placeholder="Create username" value={form.username} onChange={(e) => updateField("username", e.target.value)} className={inputClass} required
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-xs text-red-600">{errors.username}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="min-w-0">
                  <label htmlFor="email" className={labelClass}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className={iconClass} />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email address"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                <div className="min-w-0">
                  <label htmlFor="role" className={labelClass}>
                    Role / Position
                  </label>
                  <div className="relative">
                    <BriefcaseBusiness size={16} className={iconClass} />
                    <select
                      id="role"
                      value={form.role}
                      onChange={(e) => updateField("role", e.target.value)}
                      className={`${inputClass} appearance-none pr-9`}
                      required
                    >
                      <option value="" disabled>
                        Select your role / position
                      </option>
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">
                      ▾
                    </span>
                  </div>
                  {errors.role && (
                    <p className="mt-1 text-xs text-red-600">{errors.role}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="min-w-0">
                  <label htmlFor="password" className={labelClass}>
                    Password
                  </label>
                  <div className="relative">
                    <LockKeyhole size={16} className={iconClass} />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Create strong password"
                      value={form.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      className={`${inputClass} pr-10`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((show) => !show)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-700"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                  )}
                </div>

                <div className="min-w-0">
                  <label htmlFor="confirmPassword" className={labelClass}>
                    Confirm Your Password
                  </label>
                  <div className="relative">
                    <LockKeyhole size={16} className={iconClass} />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Confirm your password"
                      value={form.confirmPassword}
                      onChange={(e) =>
                        updateField("confirmPassword", e.target.value)
                      }
                      className={`${inputClass} pr-10`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((show) => !show)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="min-w-0">
                <label htmlFor="department" className={labelClass}>
                  Department / Office
                </label>
                <div className="relative">
                  <Building2 size={16} className={iconClass} />
                  <select
                    id="department"
                    value={form.department}
                    onChange={(e) =>
                      updateField("department", e.target.value)
                    }
                    className={`${inputClass} appearance-none pr-9`}
                    required
                  >
                    <option value="" disabled>
                      Select your department or office
                    </option>
                    {DEPARTMENTS.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">
                    ▾
                  </span>
                </div>
                {errors.department && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.department}
                  </p>
                )}
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  id="terms"
                  type="checkbox"
                  checked={form.acceptedTerms}
                  onChange={(e) =>
                    updateField("acceptedTerms", e.target.checked)
                  }
                  className="checkbox checkbox-sm mt-0.5 shrink-0"
                  required
                />
                <label
                  htmlFor="terms"
                  className="text-[10px] leading-4 text-black sm:text-xs"
                >
                  I agree to{" "}
                  <Link
                    href="/terms"
                    className="text-blue-700 hover:underline"
                  >
                    terms and conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-blue-700 hover:underline"
                  >
                    data privacy policy
                  </Link>
                </label>
              </div>
              {errors.acceptedTerms && (
                <p className="text-xs text-red-600">
                  {errors.acceptedTerms}
                </p>
              )}

              {formError && (
                <p
                  role="alert"
                  className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600"
                >
                  {formError}
                </p>
              )}

              <div className="flex justify-center pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="h-10 w-full max-w-sm rounded-full border-0 bg-gradient-to-r from-blue-900 to-blue-600 text-sm font-semibold text-white shadow-md transition hover:from-blue-950 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:text-base"
                >
                  {loading ? "Creating Account..." : "Register"}
                </button>
              </div>
            </form>

            <div className="mt-2 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-300" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-center">
              <span className="text-[10px] text-gray-500 sm:text-xs">
                Already have an Account?
              </span>
              <Link
                href="/login"
                className="text-[10px] font-semibold text-blue-800 hover:text-blue-600 hover:underline sm:text-xs"
              >
                Login Here
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}