"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Sparkles, Medal, Briefcase, ArrowRight } from "lucide-react";

// Dynamically import the Leaderboard components
const Leaderboard = dynamic(() => import("./Leaderboard"), {
  ssr: false,
});

const ApplicationsLeaderboard = dynamic(
  () => import("./ApplicationsLeaderboard"),
  {
    ssr: false,
  }
);

const AuraLeaderboard = dynamic(() => import("./AuraLeaderboard"), {
  ssr: false,
});

export default function LeaderboardSection() {
  const [activeTab, setActiveTab] = useState<
    "aura" | "applications" | "referrals"
  >("aura");

  return (
    <div className="relative">
      {/* Semi-transparent background with gradient fade effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0e1326]/70 via-[#121a36]/60 to-transparent rounded-2xl backdrop-blur-sm"></div>

      <div className="relative z-10 px-4 py-6 md:py-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-light text-white">
            Community Leaders
          </h2>
          <p className="mt-2 text-gray-400 text-sm md:text-base">
            See who's leading in referrals, applications, and overall Aura
          </p>
        </div>

        {/* Simple tab navigation */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="flex justify-center bg-[#121a36]/30 rounded-lg p-1 backdrop-blur-sm border border-[#20253d]/50">
            <button
              onClick={() => setActiveTab("aura")}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === "aura"
                  ? "bg-orange-900/20 text-orange-400 border border-orange-700/30"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Aura
            </button>

            <button
              onClick={() => setActiveTab("applications")}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium mx-2 ${
                activeTab === "applications"
                  ? "bg-blue-900/20 text-blue-400 border border-blue-700/30"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              <Briefcase className="h-4 w-4 mr-1" />
              Applications
            </button>

            <button
              onClick={() => setActiveTab("referrals")}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === "referrals"
                  ? "bg-purple-900/20 text-purple-400 border border-purple-700/30"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              <Medal className="h-4 w-4 mr-1" />
              Referrals
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {activeTab === "aura" && (
            <AuraLeaderboard limit={3} hideHeader={true} />
          )}
          {activeTab === "applications" && (
            <ApplicationsLeaderboard limit={3} hideHeader={true} />
          )}
          {activeTab === "referrals" && (
            <Leaderboard limit={3} hideHeader={true} />
          )}

          <div className="mt-4 text-center">
            <Link
              href="/leaderboard"
              className="inline-flex items-center text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors"
            >
              View full leaderboard
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
