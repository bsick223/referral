"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Building } from "lucide-react";

function Header() {
  return (
    <header
      className="sticky top-0 left-0 right-0 px-4 md:px-0 bg-[#090d1b]/90
    backdrop-blur-sm border-b border-[#20253d]/50 z-50"
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Left */}
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Building className="h-6 w-6 text-orange-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500 text-transparent bg-clip-text">
                ReferralTracker
              </span>
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            <SignedIn>
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  className="w-fit relative bg-transparent text-white hover:text-gray-200
                font-semibold px-4 py-2 rounded-lg
                transition-all duration-100 ease-in-out
                border border-white/20
                backdrop-filter backdrop-blur-sm
                overflow-hidden
                before:absolute before:inset-0
                before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent
                before:translate-x-[-200%] hover:before:translate-x-[200%]
                before:transition-transform before:duration-1000
                before:pointer-events-none
                hover:bg-white/10 hover:shadow-md
                active:scale-95 active:shadow-inner hover:cursor-pointer"
                >
                  Dashboard
                </Button>
              </Link>

              <div
                className="p-2 w-10 h-10 flex items-center justify-center
                rounded-full border bg-blue-100 border-blue-200"
              >
                <UserButton />
              </div>
            </SignedIn>

            <SignedOut>
              <SignInButton
                mode="modal"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "bg-white",
                    headerTitle: "text-2xl font-semibold text-gray-900",
                    headerSubtitle: "text-gray-600",
                    formButtonPrimary:
                      "bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500",
                    formFieldInput:
                      "border-gray-300 focus:ring-blue-500 focus:border-blue-500",
                    dividerLine: "bg-gray-200",
                    dividerText: "text-gray-500",
                    socialButtonsBlockButton:
                      "border border-gray-300 hover:bg-gray-50",
                    footer: "text-gray-500",
                  },
                }}
              >
                <Button
                  variant="ghost"
                  className="relative bg-white text-blue-600
                font-semibold px-6 py-2 rounded-lg
                transition-all duration-200 ease-in-out
                border border-blue-200 hover:border-blue-300
                overflow-hidden
                before:absolute before:inset-0
                before:bg-gradient-to-r before:from-transparent before:via-amber-400/30 before:to-transparent
                before:translate-x-[-200%] hover:before:translate-x-[200%]
                before:transition-transform before:duration-1000
                before:pointer-events-none
                hover:shadow-md
                hover:cursor-pointer"
                >
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
