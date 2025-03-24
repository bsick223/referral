"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default function LeaderboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { isLoaded, isSignedIn } = useUser();

  // Redirect to login if not authenticated
  if (isLoaded && !isSignedIn) {
    redirect("/");
  }

  return <div className="min-h-screen bg-[#090d1b]">{children}</div>;
}
