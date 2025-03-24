"use client";

import { useUser } from "@clerk/nextjs";
import Leaderboard from "@/components/Leaderboard";
import UserRankCard from "@/components/UserRankCard";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LeaderboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();

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
      <div className="absolute left-0 top-0 w-1/2 h-1/2 bg-gradient-to-r from-orange-600/20 to-orange-600/5 rounded-full opacity-20 blur-[120px]"></div>
      <div className="absolute right-0 top-0 w-1/3 h-1/2 bg-blue-600/20 rounded-full opacity-20 blur-[100px]"></div>
      <div className="absolute right-1/4 bottom-0 w-1/3 h-1/3 bg-indigo-600/20 rounded-full opacity-20 blur-[80px]"></div>

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
            <h1 className="text-2xl font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-gray-300 relative z-10">
              Referral Leaderboard
            </h1>
            <div className="absolute -bottom-1 left-0 h-[1px] w-full bg-gradient-to-r from-orange-500/80 via-purple-500/60 to-blue-500/40"></div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left sidebar with user's position */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <UserRankCard userId={user?.id} />

            <div className="mt-6 bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden p-6 border border-[#20253d]/50">
              <h3 className="text-lg font-light text-white mb-4">
                How It Works
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                Our leaderboard showcases the top referrers in our community.
              </p>
              <p className="text-sm text-gray-400 mb-3">
                Every referral you make increases your position on the
                leaderboard.
              </p>
              <p className="text-sm text-gray-400">
                Top performers may be eligible for special rewards and
                recognition!
              </p>
            </div>
          </div>

          {/* Main leaderboard */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-[#20253d]/50">
              <div className="px-6 py-4 bg-[#0f1326]/70 border-b border-[#20253d]/50">
                <h3 className="text-xl font-light text-white">
                  Full Leaderboard
                </h3>
                <p className="text-gray-400 text-sm">
                  Our top community members
                </p>
              </div>
              <div className="max-h-[800px] overflow-y-auto">
                <Leaderboard hideHeader={true} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
