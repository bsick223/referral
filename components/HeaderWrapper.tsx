"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function HeaderWrapper() {
  const pathname = usePathname();
  const isDashboard = pathname.includes("/dashboard");

  // Only render the header if we're not in the dashboard
  if (isDashboard) {
    return null;
  }

  return <Header />;
}
