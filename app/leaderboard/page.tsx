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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <Link
            href="/dashboard"
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Referral Leaderboard
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left sidebar with user's position */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <UserRankCard userId={user?.id} />

            <div className="mt-6 bg-white rounded-xl shadow-md overflow-hidden p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                How It Works
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Our leaderboard showcases the top referrers in our community.
              </p>
              <p className="text-sm text-gray-600 mb-3">
                Every referral you make increases your position on the
                leaderboard.
              </p>
              <p className="text-sm text-gray-600">
                Top performers may be eligible for special rewards and
                recognition!
              </p>
            </div>
          </div>

          {/* Main leaderboard */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-blue-600">
                <h3 className="text-xl font-bold text-white">
                  Full Leaderboard
                </h3>
                <p className="text-blue-100 text-sm">
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
