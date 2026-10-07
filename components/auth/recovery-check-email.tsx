"use client";

import { KeyRound } from "lucide-react";

import Button from "@/components/ui/button";

type RecoveryCheckEmailProps = {
  email: string;
  onContinue: () => void;
};

function maskEmail(email: string) {
  const [name, domain] = email.split("@");

  if (!name || !domain) {
    return email;
  }

  return `${name.slice(0, 1)}${"•".repeat(Math.max(name.length - 1, 3))}@${domain}`;
}

export default function RecoveryCheckEmail({
  email,
  onContinue,
}: RecoveryCheckEmailProps) {
  return (
    <div>
      <div
        role="status"
        className="rounded-md border border-green-200 bg-green-50 px-3 py-3 text-xs text-green-700 sm:text-sm"
      >
        Demo only: no real email was sent. This confirms that{" "}
        <span className="font-semibold">{maskEmail(email)}</span> belongs to a
        registered local account.
      </div>

      <Button
        type="button"
        onClick={onContinue}
        className="mt-5 h-10 w-full rounded-full border-0 bg-gradient-to-r from-blue-900 to-blue-600 text-sm font-semibold text-white shadow-md hover:from-blue-950 hover:to-blue-700 sm:mt-6 sm:h-11 lg:h-12 lg:text-base"
      >
        <KeyRound size={18} strokeWidth={1.8} />
        Continue to Reset Password
      </Button>
    </div>
  );
}