"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  PlusCircle,
  Building,
  RefreshCw,
  MessageSquare,
  Trophy,
  ClipboardList,
  UsersRound,
  Briefcase,
  Users,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import useOnboardingTour from "../hooks/useOnboardingTour";
import OnboardingButton from "../components/OnboardingButton";

// Mock application data (replace with actual data from Convex)
const applicationStats = {
  total: 12,
  active: 8,
  interviews: 3,
  offers: 1,
};

// Mock activity data (replace with actual data from Convex)
const recentActivity = [
  {
    id: "1",
    type: "application",
    action: "Applied to",
    company: "Tech Innovators",
    position: "Frontend Developer",
    date: "2 hours ago",
  },
  {
    id: "2",
    type: "referral",
    action: "Referred",
    company: "Global Systems",
    candidate: "Emily Johnson",
    date: "1 day ago",
  },
  {
    id: "3",
    type: "application",
    action: "Interview scheduled with",
    company: "Future Solutions",
    position: "UX Designer",
    date: "2 days ago",
  },
  {
    id: "4",
    type: "referral",
    action: "Referral accepted by",
    company: "Data Dynamics",
    candidate: "Alex Smith",
    date: "3 days ago",
  },
];

export default function DashboardHomePage() {
  const { user } = useUser();

  // Fetch referral counts per company
  const referralCounts = useQuery(api.referrals.getUserReferralsByCompany, {
    userId: user?.id || "",
  });

  // Initialize the onboarding tour
  const { startTour } = useOnboardingTour({
    userId: user?.id || "",
  });

  // Calculate total referrals
  const totalReferrals =
    referralCounts?.companiesData?.reduce(
      (sum, company) => sum + company.referralCount,
      0
    ) || 0;

  // Calculate pending and successful referrals (mock data for now)
  const pendingReferrals = 4;
  const successfulReferrals = 2;

  // Loading state
  if (!user || referralCounts === undefined) {
    return (
      <div className="min-h-screen bg-[#090d1b] flex items-center justify-center">
        <RefreshCw className="h-10 w-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d1b] relative overflow-x-hidden">
      {/* Help button to manually start tour */}
      <OnboardingButton startTour={startTour} />

      {/* Noise Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-soft-light pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          width: "200%",
          height: "200%",
          transform: "translate(-50%, -50%)",
        }}
      ></div>

      {/* Blurry background elements */}
      <div className="absolute left-0 top-0 w-1/2 h-1/2 bg-gradient-to-r from-orange-600/20 to-orange-600/5 rounded-full opacity-20 blur-[120px]"></div>
      <div className="absolute right-0 top-0 w-1/3 h-1/2 bg-blue-600/20 rounded-full opacity-20 blur-[100px]"></div>
      <div className="absolute right-1/4 bottom-0 w-1/3 h-1/3 bg-indigo-600/20 rounded-full opacity-20 blur-[80px]"></div>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <h2 className="text-2xl font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-gray-300 relative z-10">
                Dashboard
              </h2>
              <div className="absolute -bottom-1 left-0 h-[1px] w-full bg-gradient-to-r from-orange-500/80 via-purple-500/60 to-blue-500/40"></div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Link
              href="/dashboard/applications"
              className="inline-flex items-center px-4 py-2 border border-[#20253d]/50 shadow-sm text-sm font-medium text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer backdrop-blur-sm"
              data-tour="applications"
            >
              <ClipboardList className="h-4 w-4 sm:mr-2 text-orange-400" />
              <span className="hidden sm:inline">Applications</span>
            </Link>
            <Link
              href="/dashboard/referrals"
              className="inline-flex items-center px-4 py-2 border border-[#20253d]/50 shadow-sm text-sm font-medium text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer backdrop-blur-sm"
              data-tour="referrals"
            >
              <UsersRound className="h-4 w-4 sm:mr-2 text-orange-400" />
              <span className="hidden sm:inline">Referrals</span>
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center px-4 py-2 border border-[#20253d]/50 shadow-sm text-sm font-medium text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer backdrop-blur-sm"
              data-tour="leaderboard"
            >
              <Trophy className="h-4 w-4 sm:mr-2 text-orange-400" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Link>
            <Link
              href="/dashboard/messages"
              className="inline-flex items-center px-4 py-2 border border-[#20253d]/50 shadow-sm text-sm font-medium text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer backdrop-blur-sm"
              data-tour="messages"
            >
              <MessageSquare className="h-4 w-4 sm:mr-2 text-orange-400" />
              <span className="hidden sm:inline">Messages</span>
            </Link>
            <Link
              href="/dashboard/companies/new"
              className="inline-flex items-center px-4 py-2 border border-[#20253d]/50 shadow-sm text-sm font-medium text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer backdrop-blur-sm"
              data-tour="add-company"
            >
              <PlusCircle className="h-4 w-4 sm:mr-2 text-orange-400" />
              <span className="hidden sm:inline">Add Company</span>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Applications Stats */}
          <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-lg border border-[#20253d]/50 p-5 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium text-white mb-4 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-blue-400" />
                  Applications
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Total</p>
                    <p className="text-2xl font-semibold text-white">
                      {applicationStats.total}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Active</p>
                    <p className="text-2xl font-semibold text-white">
                      {applicationStats.active}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Interviews</p>
                    <p className="text-2xl font-semibold text-white">
                      {applicationStats.interviews}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Offers</p>
                    <p className="text-2xl font-semibold text-white">
                      {applicationStats.offers}
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 p-4">
                <Link
                  href="/dashboard/applications"
                  className="flex items-center text-sm text-blue-400 hover:text-blue-300"
                >
                  View all <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/10 rounded-full -mr-12 -mt-12 blur-xl"></div>
          </div>

          {/* Referrals Stats */}
          <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-lg border border-[#20253d]/50 p-5 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium text-white mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-orange-400" />
                  Referrals
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Total</p>
                    <p className="text-2xl font-semibold text-white">
                      {totalReferrals}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Pending</p>
                    <p className="text-2xl font-semibold text-white">
                      {pendingReferrals}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Successful</p>
                    <p className="text-2xl font-semibold text-white">
                      {successfulReferrals}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Companies</p>
                    <p className="text-2xl font-semibold text-white">
                      {referralCounts?.companiesData?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 p-4">
                <Link
                  href="/dashboard/referrals"
                  className="flex items-center text-sm text-orange-400 hover:text-orange-300"
                >
                  View all <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 h-24 w-24 bg-orange-500/10 rounded-full -mr-12 -mt-12 blur-xl"></div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/dashboard/applications/new"
            className="flex items-center justify-between bg-[#121a36]/50 backdrop-blur-sm rounded-lg border border-[#20253d]/50 p-4 hover:bg-[#121a36]/70 transition-colors"
          >
            <div className="flex items-center">
              <div className="bg-blue-500/20 rounded-full p-2 mr-3">
                <Briefcase className="h-5 w-5 text-blue-400" />
              </div>
              <span className="text-sm font-medium text-gray-200">
                New Application
              </span>
            </div>
            <PlusCircle className="h-4 w-4 text-blue-400" />
          </Link>

          <Link
            href="/dashboard/referrals/new"
            className="flex items-center justify-between bg-[#121a36]/50 backdrop-blur-sm rounded-lg border border-[#20253d]/50 p-4 hover:bg-[#121a36]/70 transition-colors"
          >
            <div className="flex items-center">
              <div className="bg-orange-500/20 rounded-full p-2 mr-3">
                <Users className="h-5 w-5 text-orange-400" />
              </div>
              <span className="text-sm font-medium text-gray-200">
                New Referral
              </span>
            </div>
            <PlusCircle className="h-4 w-4 text-orange-400" />
          </Link>

          <Link
            href="/dashboard/companies/new"
            className="flex items-center justify-between bg-[#121a36]/50 backdrop-blur-sm rounded-lg border border-[#20253d]/50 p-4 hover:bg-[#121a36]/70 transition-colors"
          >
            <div className="flex items-center">
              <div className="bg-purple-500/20 rounded-full p-2 mr-3">
                <Building className="h-5 w-5 text-purple-400" />
              </div>
              <span className="text-sm font-medium text-gray-200">
                Add New Company
              </span>
            </div>
            <PlusCircle className="h-4 w-4 text-purple-400" />
          </Link>

          <Link
            href="/leaderboard"
            className="flex items-center justify-between bg-[#121a36]/50 backdrop-blur-sm rounded-lg border border-[#20253d]/50 p-4 hover:bg-[#121a36]/70 transition-colors"
          >
            <div className="flex items-center">
              <div className="bg-green-500/20 rounded-full p-2 mr-3">
                <Trophy className="h-5 w-5 text-green-400" />
              </div>
              <span className="text-sm font-medium text-gray-200">
                Leaderboard
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-green-400" />
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-lg border border-[#20253d]/50 p-5">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-medium text-white flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-400" />
              Recent Activity
            </h2>
          </div>

          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start p-3 rounded-md bg-[#0c1029]/50 hover:bg-[#0c1029]/70 transition-colors"
              >
                <div
                  className={`rounded-full p-2 flex-shrink-0 mr-3 ${
                    activity.type === "application"
                      ? "bg-blue-500/20"
                      : "bg-orange-500/20"
                  }`}
                >
                  {activity.type === "application" ? (
                    <Briefcase
                      className="h-5 w-5 text-blue-400"
                      aria-hidden="true"
                    />
                  ) : (
                    <Users
                      className="h-5 w-5 text-orange-400"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200">
                    {activity.action}{" "}
                    <span className="font-semibold text-white">
                      {activity.company}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {activity.type === "application"
                      ? `Position: ${activity.position}`
                      : `Candidate: ${activity.candidate}`}
                  </p>
                </div>
                <div className="flex-shrink-0 self-center">
                  <p className="text-xs text-gray-500">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <button className="text-sm text-gray-400 hover:text-gray-300">
              View all activity
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
