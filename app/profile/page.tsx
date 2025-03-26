"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Medal,
  Trophy,
  Award,
  BarChart2,
  Users,
  Star,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Function to generate achievements based on user data
const generateAchievements = (
  referrals: any[] = [],
  companies: any[] = [],
  successfulReferrals = 0
) => [
  {
    id: 1,
    title: "Referral Pioneer",
    description: "Made your first referral",
    icon: <Medal className="h-6 w-6 text-orange-400" />,
    earned: referrals.length > 0,
    date:
      referrals.length > 0
        ? new Date(
            referrals[referrals.length - 1].createdAt
          ).toLocaleDateString()
        : null,
  },
  {
    id: 2,
    title: "Network Builder",
    description: "Referred 5 different people",
    icon: <Users className="h-6 w-6 text-blue-400" />,
    earned: referrals.length >= 5,
    date:
      referrals.length >= 5
        ? new Date(referrals[4].createdAt).toLocaleDateString()
        : null,
  },
  {
    id: 3,
    title: "Career Catalyst",
    description: "Had 3 successful referrals",
    icon: <Star className="h-6 w-6 text-yellow-400" />,
    earned: successfulReferrals >= 3,
    date: successfulReferrals >= 3 ? new Date().toLocaleDateString() : null,
  },
  {
    id: 4,
    title: "Industry Connector",
    description: "Made referrals to 3 different companies",
    icon: <Award className="h-6 w-6 text-purple-400" />,
    earned: companies.length >= 3,
    date: companies.length >= 3 ? new Date().toLocaleDateString() : null,
  },
];

export default function ProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser();

  // Redirect if not authenticated
  if (isLoaded && !isSignedIn) {
    redirect("/");
  }

  // Fetch user's referrals
  const referrals =
    useQuery(
      api.referrals.listByUser,
      user?.id ? { userId: user.id } : "skip"
    ) || [];

  // Fetch analytics data
  const analytics = useQuery(
    api.referrals.getUserReferralAnalytics,
    user?.id ? { userId: user.id } : "skip"
  );

  // Fetch referrals by company
  const companiesData = useQuery(
    api.referrals.getUserReferralsByCompany,
    user?.id ? { userId: user.id } : "skip"
  );

  // Fetch successful referrals count
  const successfulReferrals =
    useQuery(
      api.referrals.getSuccessfulReferralsCount,
      user?.id ? { userId: user.id } : "skip"
    ) || 0;

  // Fetch user's applications
  const applications =
    useQuery(
      api.applications.listByUser,
      user?.id ? { userId: user.id } : "skip"
    ) || [];

  // Fetch leaderboard data
  const leaderboardData = useQuery(api.referrals.getLeaderboard, {});

  // Calculate user's rank in leaderboard
  const leaderboardRank = leaderboardData
    ? leaderboardData.findIndex((entry) => entry.userId === user?.id) + 1
    : 0;

  // Calculate percentile if there are enough users
  const percentile =
    leaderboardData && leaderboardData.length > 0
      ? Math.round(
          ((leaderboardData.length - leaderboardRank) /
            leaderboardData.length) *
            100
        )
      : 0;

  // Generate achievements based on real data
  const achievements = generateAchievements(
    referrals,
    companiesData?.companiesData || [],
    successfulReferrals
  );

  // Calculate metrics from real data
  const metrics = {
    totalReferrals: analytics?.totalReferrals || 0,
    successfulReferrals: successfulReferrals || 0,
    totalApplications: applications.length || 0,
    totalCompanies: companiesData?.companiesData?.length || 0,
    leaderboardRank: leaderboardRank || 0,
  };

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
              Your Profile & Achievements
            </h1>
            <div className="absolute -bottom-1 left-0 h-[1px] w-full bg-gradient-to-r from-orange-500/80 via-purple-500/60 to-blue-500/40"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* User Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-[#20253d]/50 p-6">
              <div className="flex flex-col items-center">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.fullName || "Profile"}
                    className="h-24 w-24 rounded-full border-2 border-orange-500/30 mb-4"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gray-700 flex items-center justify-center mb-4">
                    <span className="text-2xl text-gray-300">
                      {user?.firstName?.charAt(0) || "U"}
                    </span>
                  </div>
                )}
                <h2 className="text-xl font-medium text-white">
                  {user?.fullName || "User"}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>

                <div className="mt-6 w-full">
                  <h3 className="text-md font-medium text-gray-300 mb-3">
                    Your Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#0f1326]/70 rounded-lg p-3">
                      <p className="text-sm text-gray-400">Referrals</p>
                      <p className="text-xl font-semibold text-white">
                        {metrics.totalReferrals}
                      </p>
                    </div>
                    <div className="bg-[#0f1326]/70 rounded-lg p-3">
                      <p className="text-sm text-gray-400">Rank</p>
                      <p className="text-xl font-semibold text-white">
                        #
                        {metrics.leaderboardRank > 0
                          ? metrics.leaderboardRank
                          : "-"}
                      </p>
                    </div>
                    <div className="bg-[#0f1326]/70 rounded-lg p-3">
                      <p className="text-sm text-gray-400">Applications</p>
                      <p className="text-xl font-semibold text-white">
                        {metrics.totalApplications}
                      </p>
                    </div>
                    <div className="bg-[#0f1326]/70 rounded-lg p-3">
                      <p className="text-sm text-gray-400">Companies</p>
                      <p className="text-xl font-semibold text-white">
                        {metrics.totalCompanies}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Leaderboard Position */}
            <div className="mt-6 bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-[#20253d]/50 p-6">
              <h3 className="text-md font-medium text-gray-300 mb-4 flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
                Leaderboard Position
              </h3>
              <div className="bg-[#0f1326]/70 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-white">
                    #
                    {metrics.leaderboardRank > 0
                      ? metrics.leaderboardRank
                      : "-"}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {percentile > 0 ? `Top ${percentile}%` : "Not ranked yet"}
                  </p>
                </div>
                <Link
                  href="/leaderboard"
                  className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                >
                  View Leaderboard
                </Link>
              </div>
            </div>
          </div>

          {/* Achievements and Metrics */}
          <div className="lg:col-span-3">
            {/* Achievements */}
            <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-[#20253d]/50">
              <div className="px-6 py-4 bg-[#0f1326]/70 border-b border-[#20253d]/50">
                <h3 className="text-xl font-light text-white flex items-center">
                  <Award className="h-5 w-5 mr-2 text-orange-400" />
                  Your Achievements
                </h3>
                <p className="text-gray-400 text-sm">
                  Badges and recognitions you've earned
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border ${
                        achievement.earned
                          ? "bg-[#0f1326]/70 border-[#20253d]/50"
                          : "bg-[#0f1326]/30 border-[#20253d]/30 opacity-60"
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-4">
                          {achievement.icon}
                        </div>
                        <div>
                          <h4 className="text-md font-medium text-white">
                            {achievement.title}
                          </h4>
                          <p className="text-sm text-gray-400 mt-1">
                            {achievement.description}
                          </p>
                          {achievement.earned && achievement.date && (
                            <p className="text-xs text-gray-500 mt-2">
                              Earned on {achievement.date}
                            </p>
                          )}
                          {!achievement.earned && (
                            <p className="text-xs text-gray-500 mt-2">
                              Not yet earned
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
