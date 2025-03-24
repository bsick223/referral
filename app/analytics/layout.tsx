"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default function AnalyticsLayout({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();

  // Redirect to login if not authenticated
  if (isLoaded && !isSignedIn) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="w-full max-w-[1600px] mx-auto pt-4 px-4 md:px-6">
        {children}
      </div>
    </div>
  );
}
