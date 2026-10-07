"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export default function WelcomeBanner() {
  const [displayName, setDisplayName] = useState("User");
  const [currentDateTime, setCurrentDateTime] =
    useState(new Date());

  useEffect(() => {
    const user = getCurrentUser();

    if (user?.fullName?.trim()) {
      setDisplayName(user.fullName.trim());
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const formattedDate =
    currentDateTime.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const formattedDay =
    currentDateTime
      .toLocaleDateString("en-US", {
        weekday: "long",
      })
      .toUpperCase();

  const formattedTime =
    currentDateTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    });

  return (
    <section className="relative min-h-[105px] overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F2A68] via-[#1646A3] to-[#0B1F4F] px-4 py-4 text-white shadow-sm sm:px-6">
      {/* SCHOOL IMAGE */}
      <div
        className="absolute inset-y-0 right-0 w-[55%] bg-cover bg-center opacity-20"
        style={{
          backgroundImage: "url('/school-bg.png')",
        }}
      />

      {/* IMAGE OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0F2A68] via-[#1646A3]/90 to-transparent" />

      {/* CONTENT */}
      <div className="relative z-10 flex min-h-[73px] h-full items-center">
        {/* WELCOME TEXT */}
        <div>
          <h1 className="text-lg font-semibold sm:text-xl">
            Welcome Back, {displayName}
          </h1>

          <p className="text-xs text-white/80">
            Here’s What’s happening in your systems today
          </p>
        </div>

        {/* WAVE */}
        <span className="absolute left-[18%] hidden text-3xl sm:block">
          👋
        </span>

        {/* DATE / TIME */}
        <div className="ml-auto flex items-center gap-3 sm:gap-4">
          <CalendarDays
            size={43}
            strokeWidth={1.8}
            className="hidden sm:block"
          />

          <div className="min-w-[120px] text-center">
            <p className="text-sm font-semibold">
              {formattedDate}
            </p>

            <p className="text-xs font-medium">
              {formattedDay}
            </p>

            <p className="text-[10px] text-white/90">
              {formattedTime}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}