"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Menu,
  Bell,
  UserRound,
  Camera,
  GraduationCap,
  LockKeyhole,
  ShieldCheck,
  Eye,
  EyeOff,
  Save,
  Pencil,
  X,
  MapPin,
  Mail,
  CalendarDays,
  BriefcaseBusiness,
  Building2,
} from "lucide-react";

import Sidebar from "@/components/layout/sidebar";
import ProfileInput from "@/components/ui/profileinput";
import ProfileSelect from "@/components/ui/profileselect";
import { ROLES, DEPARTMENTS, GENDERS } from "@/lib/constants";
import {
  getCurrentUser,
  updateProfile,
  updatePassword,
  getAccountPassword,
  type UserProfile,
} from "@/lib/auth";

type ProfileData = UserProfile;

const initialProfile: ProfileData = {
  fullName: "",
  username: "",
  email: "",
  role: "",
  department: "",
  address: "",
  birthday: "",
  gender: "",
};

export default function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"account" | "security">("account");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [savedProfile, setSavedProfile] =
    useState<ProfileData>(initialProfile);

  const [originalAccount, setOriginalAccount] = useState({
    username: "",
    email: "",
  });

  const [saveError, setSaveError] = useState("");

  // Password (Security tab)
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  // Sidebar responsive behavior
  useEffect(() => {
    const updateSidebar = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };

    updateSidebar();
    window.addEventListener("resize", updateSidebar);

    return () => window.removeEventListener("resize", updateSidebar);
  }, []);

  // Load the currently logged-in registered account
  useEffect(() => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      setSaveError("No logged-in account found. Please log in again.");
      return;
    }

    const userProfile: ProfileData = {
      fullName: currentUser.fullName ?? "",
      username: currentUser.username ?? "",
      email: currentUser.email ?? "",
      role: currentUser.role ?? "",
      department: currentUser.department ?? "",
      address: currentUser.address ?? "",
      birthday: currentUser.birthday ?? "",
      gender: currentUser.gender ?? "",
    };

    setProfile(userProfile);
    setSavedProfile(userProfile);

    setOriginalAccount({
      username: currentUser.username ?? "",
      email: currentUser.email ?? "",
    });

    setPassword(
      getAccountPassword(currentUser.username ?? "", currentUser.email ?? "")
    );

    setSaveError("");
  }, []);

  // Update a profile field
  const updateField = (field: keyof ProfileData, value: string) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
    setSaveError("");
  };

  // Validate and save profile to localStorage
  const handleSave = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaved(false);
    setSaveError("");

    if (
      !profile.fullName.trim() ||
      !profile.username.trim() ||
      !profile.email.trim() ||
      !profile.role.trim() ||
      !profile.department.trim()
    ) {
      setSaveError("Please fill in all required fields.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(profile.email.trim())) {
      setSaveError("Please enter a valid email address.");
      return;
    }

    if (!originalAccount.username || !originalAccount.email) {
      setSaveError("Account information is missing. Please log in again.");
      return;
    }

    const updatedProfile: ProfileData = {
      ...profile,
      fullName: profile.fullName.trim(),
      username: profile.username.trim(),
      email: profile.email.trim().toLowerCase(),
      role: profile.role.trim(),
      department: profile.department.trim(),
      address: profile.address.trim(),
    };

    const result = updateProfile(
      originalAccount.username,
      originalAccount.email,
      updatedProfile
    );

    if (!result.success) {
      setSaveError(result.message);
      return;
    }

    setProfile(updatedProfile);
    setSavedProfile(updatedProfile);

    // Keep the account reference updated if username/email changed
    setOriginalAccount({
      username: updatedProfile.username,
      email: updatedProfile.email,
    });

    setEditing(false);
    setSaved(true);
  };

  // Discard unsaved changes
  const handleCancel = () => {
    setProfile(savedProfile);
    setEditing(false);
    setSaved(false);
    setSaveError("");
  };

  // Save the password shown in the Security tab
  const handlePasswordSave = () => {
    setPasswordError("");
    setPasswordSaved(false);

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    const updated = updatePassword(
      originalAccount.username,
      originalAccount.email,
      password
    );

    if (!updated) {
      setPasswordError("Account not found. Please log in again.");
      return;
    }

    setPasswordSaved(true);
  };

  const initials = profile.fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f1f3fc] text-slate-800">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main
        className={`min-h-screen w-full transition-[margin] duration-300 ${
          sidebarOpen
            ? "lg:ml-[275px] lg:w-[calc(100%-275px)]"
            : "ml-0 w-full"
        }`}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-30 flex min-h-[58px] w-full items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 shadow-sm sm:px-5 lg:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              onClick={() => setSidebarOpen((open) => !open)}
              className="shrink-0 rounded-md p-2 text-slate-800 transition hover:bg-slate-100"
            >
              <Menu size={22} />
            </button>

            <h2 className="truncate text-sm font-semibold uppercase tracking-wide sm:text-base">
              My Profile
            </h2>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <button
              type="button"
              aria-label="Notifications"
              className="relative rounded-full border border-slate-200 p-2 hover:bg-slate-50"
            >
              <Bell size={17} />
              <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-blue-600" />
            </button>

            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 bg-blue-100 text-sm font-semibold text-blue-800 sm:h-10 sm:w-10">
                {initials || <UserRound size={18} />}
              </div>

              <div className="hidden min-w-0 text-right sm:block">
                <p className="max-w-[150px] truncate text-xs font-medium">
                  {profile.fullName}
                </p>
                <p className="text-[11px] text-slate-500">
                  {profile.role}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="mx-auto w-full max-w-[1600px] space-y-4 p-3 sm:space-y-5 sm:p-5 lg:p-6">
          {/* Heading */}
          <section className="flex min-w-0 items-center gap-3 rounded-xl bg-gradient-to-r from-[#e9e9f7] via-white to-white px-3 py-4 shadow-sm sm:gap-4 sm:px-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#cbdafa] text-blue-600 sm:h-[68px] sm:w-[68px]">
              <UserRound
                size={34}
                fill="currentColor"
                strokeWidth={1.3}
                className="sm:h-[45px] sm:w-[45px]"
              />
            </div>

            <div className="min-w-0">
              <h1 className="text-base font-semibold sm:text-lg">
                My Profile
              </h1>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                View and manage your account information
              </p>
            </div>
          </section>

          {/* Profile card and details */}
          <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[260px_minmax(0,1fr)] xl:gap-5">
            {/* Profile Card */}
            <section className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl bg-white shadow-sm">
              <div className="relative h-28 shrink-0 overflow-hidden bg-gradient-to-br from-[#001b68] via-[#0643be] to-[#07165d] sm:h-[125px]">
                <div className="absolute -right-8 -top-16 h-36 w-36 rounded-full border-[28px] border-blue-500/30" />
                <div className="absolute -left-8 top-20 h-20 w-60 -rotate-12 rounded-full border-t-4 border-white/80" />
              </div>

              <div className="-mt-14 flex min-w-0 flex-col items-center px-4 sm:-mt-[65px] sm:px-5">
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-white bg-blue-100 text-2xl font-bold text-blue-800 shadow-sm sm:h-[105px] sm:w-[105px] sm:text-3xl">
                  {initials || <UserRound size={34} />}

                  <button
                    type="button"
                    aria-label="Change profile photo"
                    className="absolute bottom-1 right-0 rounded-full bg-blue-700 p-1.5 text-white shadow"
                  >
                    <Camera size={13} />
                  </button>
                </div>

                <h2 className="mt-2 max-w-full break-words text-center text-base font-semibold sm:text-lg">
                  {profile.fullName || "Your Name"}
                </h2>

                <span className="mt-1 max-w-full rounded-full bg-indigo-100 px-4 py-1 text-center text-[10px] text-indigo-700">
                  {profile.role || "Role"}
                </span>

                <p className="mt-4 max-w-[220px] text-center text-[10px] leading-4 text-slate-500">
                  “Committed to quality education and student service”
                </p>
              </div>

              <div className="mt-auto p-4 pb-5 sm:p-5">
                <div className="flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-3 sm:px-4">
                  <GraduationCap
                    size={28}
                    className="shrink-0 text-slate-800"
                    fill="currentColor"
                  />
                  <p className="text-xs font-semibold leading-4 text-slate-800">
                    Quezonian Educational
                    <br />
                    College Inc.
                  </p>
                </div>
              </div>
            </section>

            {/* Information Panel */}
            <section className="min-w-0 w-full rounded-xl bg-white p-3 shadow-sm sm:p-5 lg:p-6">
              {/* Tabs */}
              <div className="mb-5 flex w-full max-w-[340px] flex-wrap rounded-lg bg-[#dce5ff] p-1 sm:mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("account");
                    setSaveError("");
                  }}
                  className={`min-w-0 flex-1 rounded-md px-2 py-2 text-[11px] transition sm:text-xs ${
                    activeTab === "account"
                      ? "bg-white/80 font-medium text-blue-800 underline underline-offset-2"
                      : "text-slate-800 hover:bg-white/40"
                  }`}
                >
                  Account Information
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("security");
                    setSaveError("");
                  }}
                  className={`flex min-w-0 flex-1 items-center justify-center gap-1 rounded-md px-2 py-2 text-[11px] transition sm:text-xs ${
                    activeTab === "security"
                      ? "bg-white/80 font-medium text-blue-800 underline underline-offset-2"
                      : "text-slate-800 hover:bg-white/40"
                  }`}
                >
                  <LockKeyhole size={13} />
                  Security
                </button>
              </div>

              {activeTab === "account" ? (
                <form
                  onSubmit={handleSave}
                  className="space-y-3 sm:space-y-4"
                >
                  <ProfileInput
                    label="Full Name"
                    value={profile.fullName}
                    icon={UserRound}
                    editing={editing}
                    onChange={(value) => updateField("fullName", value)}
                  />

                  <ProfileInput
                    label="Address"
                    value={profile.address}
                    icon={MapPin}
                    editing={editing}
                    onChange={(value) => updateField("address", value)}
                  />

                  <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <ProfileInput
                      label="Username"
                      value={profile.username}
                      icon={UserRound}
                      editing={editing}
                      onChange={(value) => updateField("username", value)}
                    />

                    <ProfileInput
                      label="Email Address"
                      value={profile.email}
                      icon={Mail}
                      type="email"
                      editing={editing}
                      onChange={(value) => updateField("email", value)}
                    />

                    <ProfileSelect
                      label="Role"
                      value={profile.role}
                      icon={BriefcaseBusiness}
                      editing={editing}
                      options={ROLES}
                      onChange={(value) => updateField("role", value)}
                    />

                    <ProfileSelect
                      label="Office and department"
                      value={profile.department}
                      icon={Building2}
                      editing={editing}
                      options={DEPARTMENTS}
                      onChange={(value) =>
                        updateField("department", value)
                      }
                    />

                    <ProfileInput
                      label="Birthday"
                      value={profile.birthday}
                      icon={CalendarDays}
                      type="date"
                      editing={editing}
                      onChange={(value) => updateField("birthday", value)}
                    />
                  </div>

                  {/* Gender */}
                  <div className="pt-1">
                    <p className="mb-2 text-xs font-medium text-slate-800">
                      Gender
                    </p>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                      {GENDERS.map((gender) => (
                        <label
                          key={gender}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <input
                            type="radio"
                            name="gender"
                            value={gender}
                            checked={profile.gender === gender}
                            disabled={!editing}
                            onChange={() => updateField("gender", gender)}
                            className="radio radio-primary radio-xs"
                          />
                          {gender}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap justify-end gap-2 pt-3 sm:gap-3 sm:pt-4">
                    {editing ? (
                      <>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="btn btn-outline btn-xs min-w-24"
                        >
                          <X size={13} />
                          Cancel
                        </button>

                        <button
                          type="submit"
                          className="btn btn-primary btn-xs min-w-28 sm:min-w-32"
                        >
                          <Save size={14} />
                          Save Changes
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(true);
                          setSaved(false);
                          setSaveError("");
                        }}
                        className="btn btn-primary btn-xs min-w-28 sm:min-w-32"
                      >
                        <Pencil size={14} />
                        Edit Profile
                      </button>
                    )}
                  </div>

                  {saveError && (
                    <p
                      role="alert"
                      className="break-words pt-2 text-right text-xs text-red-600"
                    >
                      {saveError}
                    </p>
                  )}

                  {saved && (
                    <p
                      role="status"
                      className="break-words pt-2 text-right text-xs text-green-600"
                    >
                      Profile changes saved successfully.
                    </p>
                  )}
                </form>
              ) : (
                <div className="min-w-0 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold">
                      Security Settings
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Manage your password and account security.
                    </p>
                  </div>

                  <label className="block min-w-0">
                    <span className="mb-1 block text-xs font-medium text-slate-800">
                      Password
                    </span>

                    <span className="flex h-10 w-full min-w-0 items-center gap-2 rounded-md border border-slate-300 bg-white px-2">
                      <LockKeyhole
                        size={16}
                        className="shrink-0 text-slate-400"
                      />

                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setPasswordSaved(false);
                          setPasswordError("");
                        }}
                        className="w-full min-w-0 bg-white text-xs !text-slate-900 outline-none"
                      />

                      <button
                        type="button"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowPassword((show) => !show)}
                        className="shrink-0 text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </span>
                  </label>

                  <div className="flex min-w-0 items-start gap-3 rounded-lg bg-blue-50 p-3 sm:p-4">
                    <ShieldCheck
                      size={24}
                      className="shrink-0 text-blue-700"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800">
                        Account protection
                      </p>
                      <p className="mt-1 break-words text-[11px] text-slate-600">
                        Keep your password private and use a strong password.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="button"
                      onClick={handlePasswordSave}
                      className="btn btn-primary btn-xs"
                    >
                      <Save size={14} />
                      Save Changes
                    </button>
                  </div>

                  {passwordError && (
                    <p
                      role="alert"
                      className="break-words text-right text-xs text-red-600"
                    >
                      {passwordError}
                    </p>
                  )}

                  {passwordSaved && (
                    <p
                      role="status"
                      className="break-words text-right text-xs text-green-600"
                    >
                      Password updated successfully.
                    </p>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}