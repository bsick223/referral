"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Trophy, Medal, Award, Sparkles } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useConvex } from "convex/react";

interface UserInfo {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
}

interface LeaderboardEntry {
  userId: string;
  name?: string;
  auraPoints: number;
  userInfo?: UserInfo;
}

interface AuraLeaderboardProps {
  limit?: number;
  hideHeader?: boolean;
}

const AuraLeaderboard = ({
  limit = 100,
  hideHeader = false,
}: AuraLeaderboardProps) => {
  const { user } = useUser();
  const [isLoaded, setIsLoaded] = useState(false);
  const [leaderboardWithProfiles, setLeaderboardWithProfiles] = useState<
    LeaderboardEntry[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [userRank, setUserRank] = useState<number | null>(null);
  const convex = useConvex();

  // Fetch data for Aura leaderboard calculation
  const allUserIds = useQuery(api.users.getAllUserIds);
  const allReferrals = useQuery(api.referrals.getAllReferrals);
  const allApplications = useQuery(api.applications.getAllApplications);
  const allStatuses = useQuery(api.applicationStatuses.getAllStatuses);

  // Calculate Aura leaderboard
  useEffect(() => {
    if (allUserIds && allReferrals && allApplications && allStatuses) {
      setIsLoading(true);
      console.log(
        "Aura: Starting leaderboard calculation with",
        allUserIds.length,
        "users"
      );

      // Build a map of status IDs to their names for each user
      const statusMap = new Map();

      allStatuses.forEach((status) => {
        statusMap.set(status._id.toString(), {
          userId: status.userId,
          name: status.name.toLowerCase(),
        });
      });

      // Calculate points for each user without privacy filtering for now
      // We'll handle visibility on the leaderboard page level instead
      const userPointsArray = allUserIds.reduce((acc, userId) => {
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

        // Calculate points: interviews (10), offers (500), rejections (2)
        const interviewPoints = interviewCount * 10;
        const offerPoints = offerCount * 500;
        const rejectionPoints = rejectionCount * 2;

        // Total Aura points
        const totalPoints =
          referralPoints +
          applicationPoints +
          interviewPoints +
          offerPoints +
          rejectionPoints;

        acc.push({
          userId,
          auraPoints: totalPoints,
        });

        return acc;
      }, [] as any[]);

      // Sort by aura points
      const sorted = userPointsArray.sort(
        (a, b) => b.auraPoints - a.auraPoints
      );

      // Get current user's rank
      const currentUserRank = user
        ? sorted.findIndex((entry) => entry.userId === user.id)
        : -1;

      // Slice to get the top limit users
      const topUsers = sorted.slice(0, limit);
      console.log("Aura: Generated leaderboard with", topUsers.length, "users");

      setLeaderboardData(topUsers);
      setUserRank(currentUserRank !== -1 ? currentUserRank + 1 : null);

      if (topUsers.length > 0) {
        // Fetch user profiles for the top users
        fetchUserProfiles(topUsers);
      } else {
        setIsLoaded(true);
        setIsLoading(false);
        setLeaderboardWithProfiles([]);
      }
    }
  }, [allUserIds, allReferrals, allApplications, allStatuses, user, limit]);

  // Separate function to fetch user profiles
  const fetchUserProfiles = async (leaderboardData: LeaderboardEntry[]) => {
    try {
      const userIds = leaderboardData.map((entry) => entry.userId);
      console.log("Aura: Fetching profiles for", userIds.length, "users");

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profiles");
      }

      const { users } = await response.json();
      console.log(
        "Aura: Received profiles for",
        Object.keys(users).length,
        "users"
      );

      // Combine leaderboard data with user profiles
      const enrichedLeaderboard = leaderboardData.map((entry) => ({
        ...entry,
        userInfo: users[entry.userId],
      }));

      setLeaderboardWithProfiles(enrichedLeaderboard);
    } catch (error) {
      console.error("Error fetching user profiles:", error);
      // Still display the leaderboard even without user details
      setLeaderboardWithProfiles(
        leaderboardData.map((entry) => ({
          ...entry,
          userInfo: undefined,
        }))
      );
    } finally {
      setIsLoaded(true);
      setIsLoading(false);
    }
  };

  // Return medal component based on position
  const getMedal = (position: number) => {
    switch (position) {
      case 0:
        return <Trophy className="h-5 w-5 text-orange-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-300" />;
      case 2:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <div className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold bg-gradient-to-br from-orange-400/20 to-yellow-400/20 text-orange-400 border border-orange-500/30">
            {position + 1}
          </div>
        );
    }
  };

  const getDisplayName = (entry: LeaderboardEntry) => {
    if (entry.userInfo) {
      if (entry.userInfo.firstName && entry.userInfo.lastName) {
        return `${entry.userInfo.firstName} ${entry.userInfo.lastName}`;
      } else if (entry.userInfo.firstName) {
        return entry.userInfo.firstName;
      } else if (entry.userInfo.username) {
        return entry.userInfo.username;
      }
    }
    return entry.name || "User";
  };

  // Add a function to get the user's initials for the avatar
  const getInitials = (entry: LeaderboardEntry) => {
    if (entry.userInfo) {
      if (entry.userInfo.firstName && entry.userInfo.lastName) {
        return `${entry.userInfo.firstName.charAt(
          0
        )}${entry.userInfo.lastName.charAt(0)}`;
      } else if (entry.userInfo.firstName) {
        return entry.userInfo.firstName.charAt(0);
      } else if (entry.userInfo.username) {
        return entry.userInfo.username.charAt(0);
      }
    }
    return (entry.name || "U").charAt(0);
  };

  return (
    <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-[#20253d]/50">
      {!hideHeader && (
        <div className="px-6 py-4 bg-[#0f1326]/70 border-b border-[#20253d]/50">
          <h3 className="text-xl font-light text-white">Aura Leaderboard</h3>
        </div>
      )}
      <div className="overflow-hidden">
        {isLoaded ? (
          leaderboardWithProfiles.length > 0 ? (
            leaderboardWithProfiles.map((entry, index) => (
              <div
                key={entry.userId}
                className={`p-4 flex items-center justify-between ${
                  user && entry.userId === user.id ? "bg-[#1d2442]/20" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">{getMedal(index)}</div>
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-[#1d2442]/40 flex-shrink-0 border border-[#20253d]/50">
                    {entry.userInfo?.imageUrl ? (
                      <Image
                        src={entry.userInfo.imageUrl}
                        alt={getDisplayName(entry)}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        priority={index < 3}
                        loading={index < 3 ? "eager" : "lazy"}
                        quality={90}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-[#1d2442]">
                        <span className="text-gray-300 font-medium text-xs">
                          {getInitials(entry)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/profile/${entry.userId}`}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <p className="text-xs font-medium text-white truncate hover:text-orange-300">
                        {getDisplayName(entry)}
                        {user && entry.userId === user.id && " (You)"}
                      </p>
                    </Link>
                  </div>
                </div>
                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-900/20 text-orange-300 border border-orange-700/30">
                  <Sparkles className="h-3 w-3 mr-1 text-orange-400" />
                  {entry.auraPoints} points
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-400">
              No data available yet.
            </div>
          )
        ) : (
          // Loading state
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 flex items-center justify-between animate-pulse"
            >
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gray-700 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                <div className="h-4 bg-gray-700 rounded w-24"></div>
              </div>
              <div className="h-4 bg-gray-700 rounded w-16"></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AuraLeaderboard;
