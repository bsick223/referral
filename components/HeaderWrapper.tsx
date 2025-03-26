"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function HeaderWrapper() {
  const pathname = usePathname();
  const isDashboard = pathname.includes("/dashboard");
  const isProfile = pathname.includes("/profile");

  // Only render the header if we're not in the dashboard or profile page
  if (isDashboard || isProfile) {
    return null;
  }

  return <Header />;
}
