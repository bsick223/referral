"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  MessageSquare,
  Trophy,
  UsersRound,
  ChevronRight,
  LogOut,
  Settings,
  Menu,
  X,
  Briefcase,
  Globe,
  BookOpen,
} from "lucide-react";
import { UserButton, useClerk } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut } = useClerk();

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close sidebar when screen is resized above mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Add click outside detection to close mobile sidebar
  useEffect(() => {
    if (!sidebarOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const sidebar = document.querySelector('[data-sidebar="mobile"]');

      // If click is outside sidebar and not on the toggle button
      if (
        sidebar &&
        !sidebar.contains(target) &&
        !target.closest('button[aria-controls="mobile-sidebar"]')
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);

  const navigation = [
    {
      name: "Your Account",
      href: "/profile",
      icon: UserButton,
      isAccount: true,
    },
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Applications", href: "/dashboard/applications", icon: Briefcase },
    { name: "Referrals", href: "/dashboard/referrals", icon: UsersRound },
    { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
    {
      name: "Leaderboard",
      href: "/dashboard/leaderboard",
      icon: Trophy,
    },
    { name: "Community", href: "/dashboard/community", icon: Globe },
    { name: "Resources", href: "/dashboard/resources", icon: BookOpen },
  ];

  // Helper function to check if a path is active
  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") {
      return true;
    }
    return (
      pathname.startsWith(path) && (path !== "/dashboard" || pathname === path)
    );
  };

  return (
    <div className="flex h-screen bg-[#090d1b] overflow-hidden">
      {/* Noise Overlay for entire layout */}
      <div
        className="fixed inset-0 opacity-[0.03] mix-blend-soft-light pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          width: "200%",
          height: "200%",
          transform: "translate(-50%, -50%)",
        }}
      ></div>

      {/* Blurry background elements */}
      <div className="fixed left-0 top-0 w-1/2 h-1/2 bg-gradient-to-r from-orange-600/20 to-orange-600/5 rounded-full opacity-20 blur-[120px] z-0"></div>
      <div className="fixed right-0 top-0 w-1/3 h-1/2 bg-blue-600/20 rounded-full opacity-20 blur-[100px] z-0"></div>
      <div className="fixed right-1/4 bottom-0 w-1/3 h-1/3 bg-indigo-600/20 rounded-full opacity-20 blur-[80px] z-0"></div>

      {/* Mobile Header with Logo and Menu Button */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0c1029]/90 border-b border-[#20253d]/50 z-20 backdrop-blur-sm flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center">
          <Image
            src="/AppTrackedLogo-removebg-preview.png"
            alt="App Tracked Logo"
            width={60}
            height={60}
            className="h-14 w-auto"
          />
          <div className="ml-2">
            <h1 className="text-lg font-medium text-white">App Tracked</h1>
          </div>
        </Link>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md text-gray-300 hover:bg-[#121a36] hover:text-white"
          aria-controls="mobile-sidebar"
        >
          {sidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-10"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar - hidden on mobile unless open, always visible on desktop */}
      <div
        data-sidebar="mobile"
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } fixed md:static w-64 h-full border-r border-[#20253d]/50 backdrop-blur-sm bg-[#0c1029]/90 transition-transform duration-300 ease-in-out z-20 md:z-10 pt-16 md:pt-0`}
      >
        <div className="h-full flex flex-col justify-between py-6 overflow-y-auto">
          {/* Logo and site name - hidden on mobile (shown in header instead) */}
          <div className="px-6">
            <Link
              href="/dashboard"
              className="hidden md:flex items-center hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="flex-shrink-0">
                {/* Your logo */}
                <Image
                  src="/AppTrackedLogo-removebg-preview.png"
                  alt="App Tracked Logo"
                  width={60}
                  height={60}
                  className="h-14 w-auto"
                />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-medium text-white">App Tracked</h1>
                <p className="text-xs text-gray-400">Job & Referral Tracker</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="mt-8 space-y-1">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    data-tab={item.name.toLowerCase()}
                    className={`group flex items-center px-3 py-2 rounded-md relative ${
                      active
                        ? "bg-[#121a36] text-orange-400"
                        : "text-gray-400 hover:text-gray-200 hover:bg-[#121a36]/50"
                    }`}
                  >
                    {active && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-400 to-blue-500 rounded-full"></div>
                    )}
                    {item.isAccount ? (
                      <div className="mr-3 flex items-center justify-center">
                        <UserButton />
                      </div>
                    ) : (
                      <item.icon
                        data-tour={item.name.toLowerCase()}
                        className={`mr-3 h-5 w-5 ${
                          active
                            ? "text-orange-400"
                            : "text-gray-400 group-hover:text-gray-300"
                        }`}
                      />
                    )}
                    <span>{item.name}</span>
                    {active && (
                      <ChevronRight className="ml-auto h-4 w-4 text-gray-500" />
                    )}
                  </Link>
                );
              })}

              {/* Admin link - only visible to admins */}
              {/* {user && ADMIN_IDS.includes(user.id) && (
                <Link
                  href="/dashboard/admin"
                  className={`group flex items-center px-3 py-2 rounded-md relative ${
                    isActive("/dashboard/admin")
                      ? "bg-[#121a36] text-orange-400"
                      : "text-gray-400 hover:text-gray-200 hover:bg-[#121a36]/50"
                  }`}
                >
                  {isActive("/dashboard/admin") && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-400 to-blue-500 rounded-full"></div>
                  )}
                  <ShieldAlert
                    className={`mr-3 h-5 w-5 ${
                      isActive("/dashboard/admin")
                        ? "text-orange-400"
                        : "text-gray-400 group-hover:text-gray-300"
                    }`}
                  />
                  <span>Admin</span>
                  {isActive("/dashboard/admin") && (
                    <ChevronRight className="ml-auto h-4 w-4 text-gray-500" />
                  )}
                </Link> 
               )} */}
            </nav>
          </div>

          {/* User Account */}
          <div className="px-6 mt-6">
            <div className="border-t border-[#20253d]/50 pt-4">
              <a
                href="/settings"
                data-tab="settings"
                className="group flex items-center px-3 py-2 text-sm text-gray-400 rounded-md hover:text-gray-200 hover:bg-[#121a36]/50"
              >
                <Settings data-tour="settings" className="mr-3 h-5 w-5" />
                <span>Settings</span>
              </a>
              <button
                onClick={() => signOut({ redirectUrl: "/" })}
                className="w-full text-left group flex items-center px-3 py-2 text-sm text-gray-400 rounded-md hover:text-red-400 hover:bg-[#121a36]/50"
              >
                <LogOut className="mr-3 h-5 w-5" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content - add padding-top on mobile for header */}
      <div className="flex-1 flex flex-col overflow-y-auto md:pt-0 pt-16">
        <main className="flex-1 relative">{children}</main>
      </div>
    </div>
  );
}
