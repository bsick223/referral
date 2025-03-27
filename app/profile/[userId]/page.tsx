"use client";

import { useUser } from "@clerk/nextjs";
import { redirect, useParams } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
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
  EyeOff,
  MapPin,
  Linkedin,
  Phone,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";

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

// Category titles for the achievements display
const categoryTitles: Record<string, string> = {
  applications: "Job Applications",
  referrals: "Referrals",
  interviews: "Interviews",
  offers: "Job Offers",
  rejections: "Rejections",
};

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

interface UserData {
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  username?: string;
}

interface StatusInfo {
  userId: string;
  name: string;
}

interface UserPointsData {
  userId: string;
  auraPoints: number;
  referralCount: number;
  applicationCount: number;
  interviewCount: number;
  offerCount: number;
  rejectionCount: number;
}

interface ApplicationCountData {
  userId: string;
  applicationCount: number;
}

export default function UserProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const params = useParams();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userId = params.userId as string;

  // Redirect if not authenticated
  if (isLoaded && !isSignedIn) {
    redirect("/");
  }

  // Fetch user's profile for privacy settings
  const userProfile = useQuery(
    api.userProfiles.getByUserId,
    userId ? { userId } : "skip"
  );

  // For viewing user's achievements
  const viewerAchievements = useQuery(
    api.achievements.getFormattedUserAchievements,
    user?.id ? { userId: user.id } : "skip"
  );

  // Create a set of achievement IDs the viewing user has completed
  const viewerCompletedAchievementIds = useMemo(() => {
    const achievements = viewerAchievements || [];
    if (!achievements.length) return new Set<string>();
    return new Set(
      achievements
        .filter((achievement) => achievement.earned)
        .map((achievement) => `${achievement.category}-${achievement.tier}`)
    );
  }, [viewerAchievements]);

  // Check if profile is private and not the current user
  const isPrivateProfile =
    userProfile?.profileVisibility === "private" && user?.id !== userId;

  // Check individual privacy settings (only applied when profile is public)
  const canViewApplicationsCount =
    userProfile?.profileVisibility === "public" &&
    userProfile?.showApplicationsCount !== false;

  const canViewReferralsCount =
    userProfile?.profileVisibility === "public" &&
    userProfile?.showReferralsCount !== false;

  const canViewCompaniesCount =
    userProfile?.profileVisibility === "public" &&
    userProfile?.showCompaniesCount !== false;

  // Check if profile is public or viewing own profile
  const canViewPublicInfo =
    userProfile?.profileVisibility === "public" || user?.id === userId;

  // Check if viewing own profile (ignore privacy settings for own profile)
  const isOwnProfile = user?.id === userId;

  // Fetch the profile user info
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userIds: [userId] }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const { users } = await response.json();
        setUserData(users[userId]);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Fetch user's referrals and applications
  const referrals = useQuery(api.referrals.listByUser, { userId }) || [];

  const applications = useQuery(api.applications.listByUser, { userId }) || [];

  // Fetch user's company data
  const companiesData = useQuery(api.referrals.getUserReferralsByCompany, {
    userId,
  });

  // Fetch leaderboard data
  const leaderboardData = useQuery(api.referrals.getLeaderboard, {});

  // Fetch data for Aura leaderboard calculation
  const allUserIds = useQuery(api.users.getAllUserIds);
  const allReferrals = useQuery(api.referrals.getAllReferrals);
  const allApplications = useQuery(api.applications.getAllApplications);
  const allStatuses = useQuery(api.applicationStatuses.getAllStatuses);

  // Fetch all user profiles to check privacy settings
  const allUserProfiles = useQuery(api.userProfiles.getAll);

  // Fetch formatted achievements
  const rawAchievements = useQuery(
    api.achievements.getFormattedUserAchievements,
    { userId }
  );

  // Memoize achievements with fallback to empty array
  const achievements = useMemo(() => {
    return rawAchievements || [];
  }, [rawAchievements]);

  // Create calculated leaderboards for aura
  const auraLeaderboard = useMemo(() => {
    if (!allUserIds || !allReferrals || !allApplications || !allStatuses)
      return [];

    // Get all application status history for counting
    const statusHistoryByUser: Record<string, Record<string, Set<string>>> = {};

    // Process all users
    allUserIds.forEach((userId) => {
      statusHistoryByUser[userId] = {
        interview: new Set(),
        offer: new Set(),
        rejected: new Set(),
      };
    });

    // Get application status by ID for efficient lookup
    const statusById: Record<string, StatusInfo> = {};
    allStatuses.forEach((status) => {
      statusById[status._id.toString()] = {
        userId: status.userId,
        name: status.name.toLowerCase(),
      };
    });

    // Count applications for each status and user
    allApplications.forEach((app) => {
      const userId = app.userId;
      const statusInfo = statusById[app.statusId.toString()];

      if (statusInfo) {
        const statusName = statusInfo.name;

        // Count each application once in its current status
        if (statusName.includes("interview")) {
          statusHistoryByUser[userId]["interview"].add(app._id.toString());
        } else if (statusName === "offer") {
          statusHistoryByUser[userId]["offer"].add(app._id.toString());
        } else if (statusName === "rejected") {
          statusHistoryByUser[userId]["rejected"].add(app._id.toString());
        }
      }
    });

    // Filter users who have opted out of leaderboards
    const filteredUserIds = allUserIds.filter((userId) => {
      const userProfile = allUserProfiles ? allUserProfiles[userId] : null;
      return !userProfile?.hideFromLeaderboards;
    });

    // Calculate points for each user
    const userPoints = filteredUserIds.reduce((acc, userId) => {
      // Count user's referrals - 5 points each
      const referrals = allReferrals.filter((ref) => ref.userId === userId);
      const referralCount = referrals.length;
      const referralPoints = referralCount * 5;

      // Count user's applications - 1 point each
      const applications = allApplications.filter(
        (app) => app.userId === userId
      );
      const applicationCount = applications.length;
      const applicationPoints = applicationCount * 1;

      // Use the status counts from our history tracking
      const interviewCount = statusHistoryByUser[userId]["interview"].size;
      const offerCount = statusHistoryByUser[userId]["offer"].size;
      const rejectionCount = statusHistoryByUser[userId]["rejected"].size;

      // Calculate points: offers (100), rejections (2)
      const offerPoints = offerCount * 100;
      const rejectionPoints = rejectionCount * 2;

      // Total Aura points
      const totalPoints =
        referralPoints + applicationPoints + offerPoints + rejectionPoints;

      acc.push({
        userId,
        auraPoints: totalPoints,
        referralCount,
        applicationCount,
        interviewCount,
        offerCount,
        rejectionCount,
      });

      return acc;
    }, [] as UserPointsData[]);

    // Sort by aura points
    return userPoints.sort((a, b) => b.auraPoints - a.auraPoints);
  }, [allUserIds, allReferrals, allApplications, allStatuses, allUserProfiles]);

  // Calculate user's rank in Aura leaderboard
  const auraLeaderboardRank =
    auraLeaderboard.length > 0
      ? auraLeaderboard.findIndex((entry) => entry.userId === userId) + 1
      : 0;

  // Calculate percentile if there are enough users
  const percentile =
    auraLeaderboard.length > 0
      ? Math.round(
          ((auraLeaderboard.length - auraLeaderboardRank) /
            auraLeaderboard.length) *
            100
        )
      : 0;

  // Get user's referrals rank
  const referralsRank =
    leaderboardData && leaderboardData.length > 0
      ? leaderboardData.findIndex((entry) => entry.userId === userId) + 1
      : 0;

  // Calculate applications rank
  const applicationsLeaderboard = useMemo(() => {
    if (!allUserIds || !allApplications) return [];

    // Filter users who have opted out of leaderboards
    const filteredUserIds = allUserIds.filter((userId) => {
      const userProfile = allUserProfiles ? allUserProfiles[userId] : null;
      return !userProfile?.hideFromLeaderboards;
    });

    // Count applications for each user
    const userApplicationCounts = filteredUserIds.reduce((acc, userId) => {
      const applications = allApplications.filter(
        (app) => app.userId === userId
      );
      if (applications.length > 0) {
        acc.push({
          userId,
          applicationCount: applications.length,
        });
      }
      return acc;
    }, [] as ApplicationCountData[]);

    // Sort by application count
    return userApplicationCounts.sort(
      (a, b) => b.applicationCount - a.applicationCount
    );
  }, [allUserIds, allApplications, allUserProfiles]);

  const applicationsRank =
    applicationsLeaderboard.length > 0
      ? applicationsLeaderboard.findIndex((entry) => entry.userId === userId) +
        1
      : 0;

  // Calculate metrics from real data
  const metrics = {
    totalReferrals: referrals.length || 0,
    totalApplications: applications.length || 0,
    totalCompanies: companiesData?.companiesData?.length || 0,
    leaderboardRank: auraLeaderboardRank || 0,
  };

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

  // Get user's full name or username
  const userFullName = userData
    ? userData.firstName || userData.lastName
      ? `${userData.firstName || ""} ${userData.lastName || ""}`.trim()
      : userData.username || "User"
    : "User";

  if (isLoading || !userData) {
    return (
      <div className="min-h-screen bg-[#090d1b] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d1b]">
      <div className="bg-gradient-to-b from-[#0f1326]/70 to-transparent">
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-6">
            <Link
              href="/leaderboard"
              className="text-gray-300 hover:text-blue-400 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Leaderboard</span>
            </Link>
          </div>

          {isPrivateProfile ? (
            <div className="flex flex-col items-center justify-center bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-[#20253d]/50 p-10 max-w-2xl mx-auto">
              <EyeOff className="h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-medium text-white mb-2">
                Private Profile
              </h2>
              <p className="text-gray-400 text-center max-w-md">
                This user has set their profile to private. Their information is
                not available for viewing.
              </p>
              <Link
                href="/leaderboard"
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue active:bg-blue-700 transition ease-in-out duration-150"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Leaderboard
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* User Profile Card */}
              <div className="lg:col-span-1">
                <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-[#20253d]/50 p-6">
                  <div className="flex flex-col items-center">
                    {userData?.imageUrl ? (
                      <Image
                        src={userData.imageUrl}
                        alt={userFullName}
                        width={96}
                        height={96}
                        className="h-24 w-24 rounded-full border-2 border-orange-500/30 mb-4 object-cover"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-gray-700 flex items-center justify-center mb-4">
                        <span className="text-2xl text-gray-300">
                          {userData?.firstName?.charAt(0) || "U"}
                        </span>
                      </div>
                    )}
                    <h2 className="text-xl font-medium text-white">
                      {userFullName}
                    </h2>

                    {/* Show professional info if available */}
                    {userProfile &&
                      "professionalTitle" in userProfile &&
                      (userProfile.professionalTitle as string) &&
                      canViewPublicInfo && (
                        <p className="text-orange-400 text-sm mt-1">
                          {userProfile.professionalTitle as string}
                        </p>
                      )}

                    {/* Display location if available */}
                    {userProfile &&
                      "location" in userProfile &&
                      (userProfile.location as string) &&
                      canViewPublicInfo && (
                        <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mt-2">
                          <MapPin className="h-3 w-3" />
                          <span>{userProfile.location as string}</span>
                        </div>
                      )}

                    {/* Display phone number if available */}
                    {userProfile &&
                      "phoneNumber" in userProfile &&
                      (userProfile.phoneNumber as string) &&
                      canViewPublicInfo && (
                        <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mt-2">
                          <Phone className="h-3 w-3" />
                          <span>{userProfile.phoneNumber as string}</span>
                        </div>
                      )}

                    {/* LinkedIn link if available */}
                    {userProfile &&
                      "linkedinUrl" in userProfile &&
                      (userProfile.linkedinUrl as string) &&
                      canViewPublicInfo && (
                        <a
                          href={
                            (userProfile.linkedinUrl as string).startsWith(
                              "http"
                            )
                              ? (userProfile.linkedinUrl as string)
                              : `https://${userProfile.linkedinUrl as string}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 text-blue-400 hover:text-blue-300 text-xs mt-2 transition-colors"
                        >
                          <Linkedin className="h-3 w-3" />
                          <span>LinkedIn Profile</span>
                        </a>
                      )}

                    <div className="w-full h-[1px] my-4 bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>

                    {/* Stats */}
                    <div className="w-full space-y-3">
                      {canViewPublicInfo && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Aura Rank</span>
                          <span className="text-orange-400 font-medium">
                            #{auraLeaderboardRank} (Top {100 - percentile}%)
                          </span>
                        </div>
                      )}
                      {(isOwnProfile || canViewReferralsCount) && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Referrals Rank</span>
                          <span className="text-purple-400 font-medium">
                            #{referralsRank}
                          </span>
                        </div>
                      )}
                      {(isOwnProfile || canViewApplicationsCount) && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">
                            Applications Rank
                          </span>
                          <span className="text-blue-400 font-medium">
                            #{applicationsRank}
                          </span>
                        </div>
                      )}
                      {!isOwnProfile &&
                        !canViewPublicInfo &&
                        !canViewReferralsCount &&
                        !canViewApplicationsCount && (
                          <div className="text-center py-2 text-gray-400 text-sm">
                            This user has hidden their rank information.
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                {/* Stats Summary Card */}
                <div className="mt-6 bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-[#20253d]/50">
                  <div className="px-6 py-4 bg-[#0f1326]/70 border-b border-[#20253d]/50">
                    <h3 className="text-xl font-light text-white">Stats</h3>
                  </div>
                  <div className="p-6 grid grid-cols-2 gap-4">
                    {(isOwnProfile || canViewReferralsCount) && (
                      <div className="bg-[#1d2442]/40 rounded-lg p-3">
                        <p className="text-gray-400 text-sm">Referrals</p>
                        <p className="text-lg font-bold text-white">
                          {metrics.totalReferrals}
                        </p>
                      </div>
                    )}
                    {(isOwnProfile || canViewApplicationsCount) && (
                      <div className="bg-[#1d2442]/40 rounded-lg p-3">
                        <p className="text-gray-400 text-sm">Applications</p>
                        <p className="text-lg font-bold text-white">
                          {metrics.totalApplications}
                        </p>
                      </div>
                    )}
                    {(isOwnProfile || canViewCompaniesCount) && (
                      <div className="bg-[#1d2442]/40 rounded-lg p-3">
                        <p className="text-gray-400 text-sm">Companies</p>
                        <p className="text-lg font-bold text-white">
                          {metrics.totalCompanies}
                        </p>
                      </div>
                    )}
                    {canViewPublicInfo && (
                      <div className="bg-[#1d2442]/40 rounded-lg p-3">
                        <p className="text-gray-400 text-sm">Aura Rank</p>
                        <p className="text-lg font-bold text-white">
                          #{metrics.leaderboardRank}
                        </p>
                      </div>
                    )}
                    {!isOwnProfile &&
                      !canViewReferralsCount &&
                      !canViewApplicationsCount &&
                      !canViewCompaniesCount &&
                      !canViewPublicInfo && (
                        <div className="col-span-2 text-center py-4 text-gray-400 text-sm">
                          This user has hidden their stats.
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* Achievements Section */}
              <div className="lg:col-span-3">
                <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-[#20253d]/50">
                  <div className="px-6 py-4 bg-[#0f1326]/70 border-b border-[#20253d]/50">
                    <h3 className="text-xl font-light text-white">
                      Achievements
                    </h3>
                  </div>
                  <div className="p-6">
                    {/* Render achievements grouped by category */}
                    {Object.entries(categoryTitles).map(([category, title]) => (
                      <div key={category} className="mb-8 last:mb-0">
                        <div className="relative mb-4">
                          <h4 className="text-lg font-medium text-white">
                            {title}
                          </h4>
                          <div className="absolute -bottom-1 left-0 h-[1px] w-16 bg-gradient-to-r from-orange-500/80 to-transparent"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {achievementsByCategory[category]?.map(
                            (achievement: Achievement) => {
                              const tierStyle = tierColors[achievement.tier];
                              const achievementId = `${achievement.category}-${achievement.tier}`;

                              // Only show achievement if viewer has completed it OR it's their own profile
                              if (
                                !isOwnProfile &&
                                !viewerCompletedAchievementIds.has(
                                  achievementId
                                )
                              ) {
                                return null;
                              }

                              return (
                                <div
                                  key={achievement.id}
                                  className={`bg-gradient-to-br ${tierStyle.bgColor} p-4 rounded-lg border ${tierStyle.borderColor} relative overflow-hidden`}
                                >
                                  <div
                                    className={`absolute -top-10 -right-10 h-24 w-24 rounded-full ${
                                      achievement.earned
                                        ? "bg-gradient-to-br from-white/5 to-white/10"
                                        : "bg-transparent"
                                    }`}
                                  ></div>
                                  <div className="flex items-start space-x-3">
                                    <div
                                      className={`p-2 rounded-lg bg-[#0f1326]/60 ${
                                        achievement.earned
                                          ? tierStyle.textColor
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {achievementIcons[achievement.icon] || (
                                        <Trophy className="h-6 w-6" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <h5
                                        className={`text-base font-medium ${
                                          achievement.earned
                                            ? tierStyle.textColor
                                            : "text-gray-500"
                                        }`}
                                      >
                                        {achievement.name}
                                      </h5>
                                      <p className="text-xs text-gray-400 mb-2">
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
                                        {achievement.earned ? (
                                          <span className="text-xs opacity-70">
                                            Completed
                                          </span>
                                        ) : (
                                          `${achievement.progress} / ${achievement.requirement}`
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
