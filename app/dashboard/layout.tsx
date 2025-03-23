"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();

  // Redirect to login if not authenticated
  if (isLoaded && !isSignedIn) {
    redirect("/");
  }

  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
