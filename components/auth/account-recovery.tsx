"use client";

import { LockKeyhole, Send } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Checkbox from "@/components/ui/checkbox";

export default function AccountRecovery() {
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

      
        <fieldset className=" card card-sm w-full max-w-md overflow-hidden bg-white text-black shadow-2xl sm:max-w-md md:max-w-lg lg:max-w-2xl">

          <div className="h-2 bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600 sm:h-3" />

          <div className="card-body px-4 py-6 sm:px-7 sm:py-7 md:px-9 lg:px-14 lg:py-9">

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 sm:gap-3 lg:gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 sm:h-14 sm:w-14 lg:h-16 lg:w-16">
                  <LockKeyhole
                    className="text-blue-600"
                    size={28}
                    strokeWidth={1.8}
                  />
                </div>

                <h2 className="text-xl font-bold tracking-tight text-black sm:text-2xl md:text-3xl lg:text-4xl">
                  Account Recovery
                </h2>
              </div>

              <p className="mx-auto mt-2 max-w-md text-[11px] leading-tight text-gray-700 sm:text-xs md:text-sm ml-20">
                Enter your registered email address and we'll
                <br className="hidden sm:block" />
                send you instructions to reset your password.
              </p>
            </div>

            <div className="my-4 border-t border-gray-300 sm:my-5 lg:my-6" />

            <div>
              <label
                htmlFor="email"
                className="text-sm font-semibold text-black sm:text-base lg:text-lg"
              >
                Email Address
              </label>

              <Input
                id="email"
                type="email"
                placeholder="Enter your registered email"
              />
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
              />
            </div>

    
            <Button className="mt-5 h-10 w-full rounded-full border-0 bg-gradient-to-r from-blue-900 to-blue-600 text-sm font-semibold text-white shadow-md hover:from-blue-950 hover:to-blue-700 sm:mt-6 sm:h-11 lg:mt-7 lg:h-12 lg:text-base">
              <Send size={18} strokeWidth={1.8} />
              Send recovery link
            </Button>


            <div className="mt-3 flex flex-wrap items-center justify-center gap-1 border-t border-gray-300 pt-3 text-center sm:mt-4 sm:gap-2">
              <span className="text-[11px] text-gray-500 sm:text-xs lg:text-sm">
                Remember your password?
              </span>
          <a href="/login">
              <button 
                type="button"
                className="text-[11px] font-semibold text-blue-800 hover:text-blue-600 hover:underline sm:text-xs lg:text-sm"
              > 
                Login Here
              </button>
              </a>
            </div>

          </div>
        </fieldset>
       
      </div>
    </main>
  );
}