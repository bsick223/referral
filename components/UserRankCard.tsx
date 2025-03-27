"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { RefreshCw, Trophy, Medal, Briefcase, Sparkles } from "lucide-react";

interface UserRankCardProps {
  userId?: string;
  activeTab?: "aura" | "applications" | "referrals";
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

const UserRankCard = ({
  userId,
  activeTab = "referrals",
}: UserRankCardProps) => {
  const { user: clerkUser } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data for all leaderboard types
  const referralLeaderboard = useQuery(api.referrals.getLeaderboard, {});

  // For applications and aura leaderboards, we need to calculate metrics
  const allUserIds = useQuery(api.users.getAllUserIds);
  const allReferrals = useQuery(api.referrals.getAllReferrals);
  const allApplications = useQuery(api.applications.getAllApplications);
  const allStatuses = useQuery(api.applicationStatuses.getAllStatuses);
  const allUserProfiles = useQuery(api.userProfiles.getAll);

  // Create calculated leaderboards for aura
  const auraLeaderboard = useMemo(() => {
    if (!allUserIds || !allReferrals || !allApplications || !allStatuses)
      return [];

    // Build a map of status IDs to their names for each user
    const statusMap = new Map();

    allStatuses.forEach((status) => {
      statusMap.set(status._id.toString(), {
        userId: status.userId,
        name: status.name.toLowerCase(),
      });
    });

    // Get users who have opted out of leaderboards
    const filteredUserIds = allUserIds.filter((userId) => {
      // Check if user profiles are available to filter by privacy setting
      if (allUserProfiles && allUserProfiles[userId]) {
        return !allUserProfiles[userId].hideFromLeaderboards;
      }
      return true; // Include user if profile not found
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

      // Count interviews, offers, and rejections
      let interviewCount = 0;
      let offerCount = 0;
      let rejectionCount = 0;

      applications.forEach((app) => {
        const status = statusMap.get(app.statusId.toString());
        if (status) {
          const statusName = status.name;
          if (statusName.includes("interview")) {
            interviewCount++;
          } else if (statusName === "offer") {
            offerCount++;
          } else if (statusName === "rejected") {
            rejectionCount++;
          }
        }
      });

      // Calculate points: interviews (100), offers (100), rejections (2)
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

  // Calculate applications leaderboard
  const applicationsLeaderboard = useMemo(() => {
    if (!allUserIds || !allApplications) return [];

    // Get users who have opted out of leaderboards
    const filteredUserIds = allUserIds.filter((userId) => {
      // Check if user profiles are available to filter by privacy setting
      if (allUserProfiles && allUserProfiles[userId]) {
        return !allUserProfiles[userId].hideFromLeaderboards;
      }
      return true; // Include user if profile not found
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

  useEffect(() => {
    if (
      referralLeaderboard !== undefined &&
      auraLeaderboard.length > 0 &&
      applicationsLeaderboard.length > 0
    ) {
      setIsLoading(false);
    }
  }, [referralLeaderboard, auraLeaderboard, applicationsLeaderboard]);

  // Calculate user's rank and percentile
  const getRankInfo = () => {
    // Default values
    let rank = 0;
    let total = 0;
    let value = 0;
    let percentile = 0;
    let iconComponent = <Trophy className="h-5 w-5 text-orange-400" />;
    let label = "Rank";
    let color = "text-orange-400";
    let valueSuffix = "";

    // Check if this is the current user's own card
    const isOwnCard = clerkUser?.id === userId;

    // Get the user's profile to check privacy settings
    const userProfile = allUserProfiles ? allUserProfiles[userId || ""] : null;

    // Always show own rank regardless of privacy settings
    const canViewReferrals =
      isOwnCard || userProfile?.showReferralsCount !== false;
    const canViewApplications =
      isOwnCard || userProfile?.showApplicationsCount !== false;

    if (activeTab === "referrals" && referralLeaderboard && canViewReferrals) {
      // Handle referrals leaderboard
      const leaderboard = referralLeaderboard;
      total = leaderboard.length;

      const userIndex = leaderboard.findIndex(
        (entry) => entry.userId === userId
      );
      rank = userIndex !== -1 ? userIndex + 1 : total > 0 ? total + 1 : 1;

      const userEntry = leaderboard.find((entry) => entry.userId === userId);
      value = userEntry ? userEntry.referralCount : 0;
      valueSuffix = value === 1 ? " referral" : " referrals";

      iconComponent = <Medal className="h-5 w-5 text-purple-400" />;
      color = "text-purple-400";
    } else if (activeTab === "applications" && canViewApplications) {
      // Handle applications leaderboard
      const leaderboard = applicationsLeaderboard;
      total = leaderboard.length;

      const userIndex = leaderboard.findIndex(
        (entry) => entry.userId === userId
      );
      rank = userIndex !== -1 ? userIndex + 1 : total > 0 ? total + 1 : 1;

      const userEntry = leaderboard.find((entry) => entry.userId === userId);
      value = userEntry ? userEntry.applicationCount : 0;
      valueSuffix = value === 1 ? " application" : " applications";

      iconComponent = <Briefcase className="h-5 w-5 text-blue-400" />;
      color = "text-blue-400";
    } else if (activeTab === "aura") {
      // Handle aura leaderboard - aura rank is always visible
      const leaderboard = auraLeaderboard;
      total = leaderboard.length;

      const userIndex = leaderboard.findIndex(
        (entry) => entry.userId === userId
      );
      rank = userIndex !== -1 ? userIndex + 1 : total > 0 ? total + 1 : 1;

      const userEntry = leaderboard.find((entry) => entry.userId === userId);
      value = userEntry ? userEntry.auraPoints : 0;
      valueSuffix = " points";

      iconComponent = <Sparkles className="h-5 w-5 text-orange-400" />;
      color = "text-orange-400";
      label = "Aura Rank";
    }

    // Calculate percentile (if there are enough users)
    percentile = total > 0 ? Math.round(((total - rank) / total) * 100) : 0;

    // Additional property to indicate if rank should be shown
    const showRank =
      (activeTab === "referrals" && canViewReferrals) ||
      (activeTab === "applications" && canViewApplications) ||
      activeTab === "aura";

    return {
      rank,
      total,
      percentile,
      value,
      iconComponent,
      label,
      color,
      valueSuffix,
      showRank,
    };
  };

  // Get medal based on rank
  const getMedal = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <Trophy className="h-12 w-12 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
        );
      case 2:
        return <Medal className="h-10 w-10 text-gray-300" />;
      case 3:
        return <Medal className="h-10 w-10 text-amber-600" />;
      default:
        return (
          <div
            className={`
            flex items-center justify-center rounded-full 
            ${
              activeTab === "aura"
                ? "bg-gradient-to-br from-orange-500/20 to-yellow-500/20 text-orange-400 border border-orange-500/30"
                : activeTab === "applications"
                ? "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-400 border border-blue-500/30"
                : "bg-gradient-to-br from-purple-500/20 to-violet-500/20 text-purple-400 border border-purple-500/30"
            }
            ${rank <= 10 ? "w-10 h-10 text-lg" : "w-12 h-12 text-xl"}
            font-bold
          `}
          >
            {rank}
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-[#20253d]/50 p-6 flex justify-center">
        <RefreshCw className="h-6 w-6 text-orange-500 animate-spin" />
      </div>
    );
  }

  const {
    rank,
    total,
    percentile,
    value,
    iconComponent,
    label,
    color,
    valueSuffix,
    showRank,
  } = getRankInfo();

  return (
    <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-[#20253d]/50">
      <div className="px-6 py-4 bg-[#0f1326]/70 border-b border-[#20253d]/50">
        <h3 className="text-xl font-light text-white">Your Position</h3>
      </div>

      {/* User info and rank */}
      <div className="p-6">
        {showRank ? (
          <>
            <div className="flex justify-center">{getMedal(rank)}</div>

            <div className="text-center mt-4">
              <p className="text-white font-medium">
                {clerkUser?.firstName || "User"}
                {clerkUser?.lastName && ` ${clerkUser.lastName}`}
              </p>

              <div className="flex items-center justify-center mt-2 space-x-1">
                {iconComponent}
                <p className={`text-xl font-bold ${color}`}>
                  #{rank}{" "}
                  <span className="text-gray-400 text-sm">of {total}</span>
                </p>
              </div>

              <p className="text-gray-400 text-sm mt-1">
                Top {100 - percentile}%
              </p>

              <div className="bg-[#1d2442]/40 rounded-lg p-3 mt-4">
                <p className="text-gray-400 text-sm">{label}</p>
                <p className="text-lg font-bold text-white">
                  {value}
                  {valueSuffix}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">
              {clerkUser?.id === userId
                ? "Your position is hidden based on your privacy settings."
                : "This user has hidden their rank information."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRankCard;
