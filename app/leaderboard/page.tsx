"use client";

import { useUser } from "@clerk/nextjs";
import Leaderboard from "@/components/Leaderboard";
import AuraLeaderboard from "@/components/AuraLeaderboard";
import ApplicationsLeaderboard from "@/components/ApplicationsLeaderboard";
import LeaderboardTabs from "@/components/LeaderboardTabs";
import UserRankCard from "@/components/UserRankCard";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function LeaderboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [activeTab, setActiveTab] = useState<
    "aura" | "applications" | "referrals"
  >("aura");

  // Redirect if not authenticated
  if (isLoaded && !isSignedIn) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#090d1b] relative">
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
      <div
        className={`absolute left-0 top-0 w-1/2 h-1/2 rounded-full opacity-20 blur-[120px] transition-colors duration-700 ease-in-out ${
          activeTab === "aura"
            ? "bg-gradient-to-r from-orange-600/20 to-orange-600/5"
            : activeTab === "applications"
            ? "bg-gradient-to-r from-blue-600/20 to-blue-600/5"
            : "bg-gradient-to-r from-purple-600/20 to-purple-600/5"
        }`}
      ></div>
      <div
        className={`absolute right-0 top-0 w-1/3 h-1/2 rounded-full opacity-20 blur-[100px] transition-colors duration-700 ease-in-out ${
          activeTab === "aura"
            ? "bg-orange-600/20"
            : activeTab === "applications"
            ? "bg-blue-600/20"
            : "bg-purple-600/20"
        }`}
      ></div>
      <div
        className={`absolute right-1/4 bottom-0 w-1/3 h-1/3 rounded-full opacity-20 blur-[80px] transition-colors duration-700 ease-in-out ${
          activeTab === "aura"
            ? "bg-amber-600/20"
            : activeTab === "applications"
            ? "bg-indigo-600/20"
            : "bg-violet-600/20"
        }`}
      ></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <Link
            href="/dashboard"
            className="flex items-center text-gray-300 hover:text-white mr-4 transition-colors group"
          >
            <ArrowLeft className="h-5 w-5 mr-1 text-orange-400 group-hover:text-orange-300 transition-colors duration-300" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="relative">
            <h1
              className={`text-2xl font-light tracking-wide text-transparent bg-clip-text relative z-10 ${
                activeTab === "aura"
                  ? "bg-gradient-to-r from-white via-orange-100 to-gray-300"
                  : activeTab === "applications"
                  ? "bg-gradient-to-r from-white via-blue-100 to-gray-300"
                  : "bg-gradient-to-r from-white via-purple-100 to-gray-300"
              }`}
            >
              {activeTab === "aura"
                ? "Aura Leaderboard"
                : activeTab === "applications"
                ? "Applications Leaderboard"
                : "Referral Leaderboard"}
            </h1>
            <div
              className={`absolute -bottom-1 left-0 h-[1px] w-full ${
                activeTab === "aura"
                  ? "bg-gradient-to-r from-orange-500/80 via-purple-500/60 to-blue-500/40"
                  : activeTab === "applications"
                  ? "bg-gradient-to-r from-blue-500/80 via-indigo-500/60 to-cyan-500/40"
                  : "bg-gradient-to-r from-purple-500/80 via-pink-500/60 to-indigo-500/40"
              }`}
            ></div>
          </div>
        </div>

        {/* Tabs for switching between leaderboards */}
        <LeaderboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left sidebar with user's position */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <UserRankCard userId={user?.id} activeTab={activeTab} />

            <div className="mt-6 bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden p-6 border border-[#20253d]/50">
              <h3 className="text-lg font-light text-white mb-4">
                How It Works
              </h3>
              {activeTab === "aura" ? (
                <>
                  <p className="text-sm text-gray-400 mb-3">
                    <span className="text-orange-400 font-medium">
                      Aura Points
                    </span>{" "}
                    are calculated based on your activity:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex justify-between">
                      <span>Each referral</span>
                      <span className="font-medium text-orange-300">
                        5 points
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Each application</span>
                      <span className="font-medium text-orange-300">
                        1 point
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Each interview</span>
                      <span className="font-medium text-orange-300">
                        10 points
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Each offer</span>
                      <span className="font-medium text-orange-300">
                        500 points
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Each rejection</span>
                      <span className="font-medium text-orange-300">
                        2 points
                      </span>
                    </li>
                  </ul>
                </>
              ) : activeTab === "applications" ? (
                <p className="text-sm text-gray-400">
                  This leaderboard ranks users based on the total number of job
                  applications they've submitted. More applications means a
                  higher position!
                </p>
              ) : (
                <p className="text-sm text-gray-400">
                  This leaderboard showcases the top referrers in our community.
                  Every referral you make increases your position on the board.
                </p>
              )}
            </div>
          </div>

          {/* Main leaderboard */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-[#20253d]/50">
              <div
                className={`px-6 py-4 border-b border-[#20253d]/50 ${
                  activeTab === "aura"
                    ? "bg-gradient-to-r from-[#0f1326]/70 to-[#161a2c]/70"
                    : activeTab === "applications"
                    ? "bg-gradient-to-r from-[#0f1629]/70 to-[#111b33]/70"
                    : "bg-gradient-to-r from-[#13132c]/70 to-[#1a1333]/70"
                }`}
              >
                <h3 className="text-xl font-light text-white">
                  {activeTab === "aura"
                    ? "Aura Leaderboard"
                    : activeTab === "applications"
                    ? "Applications Leaderboard"
                    : "Referrals Leaderboard"}
                </h3>
                <p className="text-gray-400 text-sm">
                  {activeTab === "aura"
                    ? "Users with highest Aura points"
                    : activeTab === "applications"
                    ? "Users with most job applications"
                    : "Users with most referrals"}
                </p>
              </div>
              <div className="max-h-[800px] overflow-y-auto">
                {activeTab === "aura" && <AuraLeaderboard hideHeader={true} />}
                {activeTab === "applications" && (
                  <ApplicationsLeaderboard hideHeader={true} />
                )}
                {activeTab === "referrals" && <Leaderboard hideHeader={true} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
