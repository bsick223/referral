"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import React, { useEffect } from "react";
import {
  ArrowLeft,
  Medal,
  Trophy,
  Award,
  Users,
  Calendar,
  CheckCircle,
  Shield,
  Rocket,
  Star,
  Link as LinkIcon,
  MessageSquare,
  Send,
  UserCheck,
  Zap,
  RefreshCw,
  Target,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Map for achievement icons
const achievementIcons: Record<string, React.ReactNode> = {
  medal: <Medal className="h-6 w-6" />,
  trophy: <Trophy className="h-6 w-6" />,
  award: <Award className="h-6 w-6" />,
  users: <Users className="h-6 w-6" />,
  calendar: <Calendar className="h-6 w-6" />,
  "check-circle": <CheckCircle className="h-6 w-6" />,
  shield: <Shield className="h-6 w-6" />,
  rocket: <Rocket className="h-6 w-6" />,
  star: <Star className="h-6 w-6" />,
  link: <LinkIcon className="h-6 w-6" />,
  "message-square": <MessageSquare className="h-6 w-6" />,
  send: <Send className="h-6 w-6" />,
  "user-check": <UserCheck className="h-6 w-6" />,
  zap: <Zap className="h-6 w-6" />,
  "refresh-cw": <RefreshCw className="h-6 w-6" />,
  target: <Target className="h-6 w-6" />,
};

// Map tier names to colors
const tierColors: Record<
  string,
  { bgColor: string; textColor: string; borderColor: string }
> = {
  bronze: {
    bgColor: "from-amber-700/20 to-amber-800/30",
    textColor: "text-amber-400",
    borderColor: "border-amber-700/40",
  },
  silver: {
    bgColor: "from-slate-400/20 to-slate-500/30",
    textColor: "text-slate-300",
    borderColor: "border-slate-400/40",
  },
  gold: {
    bgColor: "from-yellow-500/20 to-yellow-600/30",
    textColor: "text-yellow-400",
    borderColor: "border-yellow-500/40",
  },
};

// Map category names to readable titles
const categoryTitles: Record<string, string> = {
  applications: "Applications Sent",
  referrals: "Referrals Received",
  followups: "Follow-ups Completed",
  interviews: "Interviews Secured",
  offers: "Offers Received",
  rejections: "Rejections Handled",
};

// Type for achievement
interface Achievement {
  id: string;
  category: string;
  tier: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress: number;
  requirement: number;
}

export default function ProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser();

  // Redirect if not authenticated
  if (isLoaded && !isSignedIn) {
    redirect("/");
  }

  // Fetch user's referrals and applications
  const referrals =
    useQuery(
      api.referrals.listByUser,
      user?.id ? { userId: user.id } : "skip"
    ) || [];

  const applications =
    useQuery(
      api.applications.listByUser,
      user?.id ? { userId: user.id } : "skip"
    ) || [];

  // Fetch analytics data
  const analytics = useQuery(
    api.referrals.getUserReferralAnalytics,
    user?.id ? { userId: user.id } : "skip"
  );

  // Fetch user's company data
  const companiesData = useQuery(
    api.referrals.getUserReferralsByCompany,
    user?.id ? { userId: user.id } : "skip"
  );

  // Fetch leaderboard data
  const leaderboardData = useQuery(api.referrals.getLeaderboard, {});

  // Fetch formatted achievements
  const achievements =
    useQuery(
      api.achievements.getFormattedUserAchievements,
      user?.id ? { userId: user.id } : "skip"
    ) || [];

  // Mutation to check and update achievements
  const checkAchievements = useMutation(
    api.achievements.checkAndUpdateAchievements
  );

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

  // Calculate metrics from real data
  const metrics = {
    totalReferrals: referrals.length || 0,
    totalApplications: applications.length || 0,
    totalCompanies: companiesData?.companiesData?.length || 0,
    leaderboardRank: leaderboardRank || 0,
  };

  // Trigger achievement check when user data is loaded
  useEffect(() => {
    if (user?.id) {
      checkAchievements({ userId: user.id });
    }
  }, [user?.id, checkAchievements]);

  // Group achievements by category
  const achievementsByCategory: Record<string, Achievement[]> = {};

  achievements.forEach((achievement) => {
    if (!achievementsByCategory[achievement.category]) {
      achievementsByCategory[achievement.category] = [];
    }
    achievementsByCategory[achievement.category].push(
      achievement as Achievement
    );
  });

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

          {/* Achievements Section */}
          <div className="lg:col-span-3">
            <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-[#20253d]/50">
              <div className="px-6 py-4 bg-[#0f1326]/70 border-b border-[#20253d]/50">
                <h3 className="text-xl font-light text-white flex items-center">
                  <Award className="h-5 w-5 mr-2 text-orange-400" />
                  Your Achievements
                </h3>
                <p className="text-gray-400 text-sm">
                  Badges and recognitions as you progress through your job
                  search journey
                </p>
              </div>

              {achievements.length === 0 ? (
                <div className="p-10 text-center">
                  <Loader2 className="h-8 w-8 mx-auto text-gray-500 animate-spin mb-4" />
                  <p className="text-gray-400">Loading your achievements...</p>
                </div>
              ) : (
                <div className="p-6">
                  {Object.entries(categoryTitles).map(([category, title]) => (
                    <div key={category} className="mb-8 last:mb-0">
                      <h4 className="text-lg font-medium text-white mb-3 pb-2 border-b border-[#20253d]/30">
                        {title}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {achievementsByCategory[category]?.map(
                          (achievement: Achievement) => {
                            const tierStyle = tierColors[achievement.tier];
                            return (
                              <div
                                key={achievement.id}
                                className={`p-4 rounded-lg relative border ${
                                  achievement.earned
                                    ? `bg-gradient-to-br ${tierStyle.bgColor} ${tierStyle.borderColor}`
                                    : "bg-[#0f1326]/30 border-[#20253d]/30 opacity-60"
                                } backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]`}
                              >
                                {achievement.earned && (
                                  <div className="absolute top-0 right-0 transform translate-x-1/4 -translate a0y-1/4">
                                    <div
                                      className={`w-6 h-6 rounded-full ${tierStyle.bgColor} flex items-center justify-center border ${tierStyle.borderColor}`}
                                    >
                                      <CheckCircle className="w-4 h-4 text-white" />
                                    </div>
                                  </div>
                                )}
                                <div className="flex flex-col items-center text-center">
                                  <div
                                    className={`mb-3 p-3 rounded-full bg-[#0f1326]/70 ${
                                      achievement.earned
                                        ? tierStyle.textColor
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {achievementIcons[achievement.icon]}
                                  </div>
                                  <h5
                                    className={`text-md font-semibold mb-1 ${
                                      achievement.earned
                                        ? "text-white"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {achievement.name}
                                  </h5>
                                  <p className="text-sm text-gray-400 mb-3">
                                    {achievement.description}
                                  </p>
                                  <div className="w-full bg-[#0f1326]/70 rounded-full h-2 mt-auto">
                                    <div
                                      className={`${
                                        achievement.earned
                                          ? achievement.tier === "bronze"
                                            ? "bg-amber-500"
                                            : achievement.tier === "silver"
                                            ? "bg-slate-300"
                                            : "bg-yellow-400"
                                          : "bg-gray-600"
                                      } 
                                      h-2 rounded-full transition-all duration-500`}
                                      style={{
                                        width: `${Math.min(
                                          100,
                                          (achievement.progress /
                                            achievement.requirement) *
                                            100
                                        )}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-2">
                                    {achievement.progress} /{" "}
                                    {achievement.requirement}
                                  </p>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
