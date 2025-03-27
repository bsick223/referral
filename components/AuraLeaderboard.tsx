"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Trophy, Medal, Award } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface UserInfo {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
}

interface LeaderboardEntry {
  userId: string;
  name: string;
  auraPoints: number;
  referralCount: number;
  applicationCount: number;
  interviewCount: number;
  offerCount: number;
  rejectionCount: number;
  userInfo?: UserInfo;
  linkedinUrl?: string;
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

  // Fetch all user IDs from the database to calculate Aura scores
  const allUserIds = useQuery(api.users.getAllUserIds);

  // Fetch referrals for all users
  const allReferrals = useQuery(api.referrals.getAllReferrals);

  // Fetch applications for all users
  const allApplications = useQuery(api.applications.getAllApplications);

  // Fetch application statuses for all users to identify interviews, offers, rejections
  const allStatuses = useQuery(api.applicationStatuses.getAllStatuses);

  // Fetch LinkedIn URLs
  const userProfiles = useQuery(api.userProfiles.getAll);

  // Helper function to get LinkedIn URL
  const getLinkedinUrl = useCallback(
    (userId: string) => {
      if (!userProfiles) return undefined;
      return userProfiles[userId]?.linkedinUrl;
    },
    [userProfiles]
  );

  // Calculate Aura points and build leaderboard
  useEffect(() => {
    if (allUserIds && allReferrals && allApplications && allStatuses) {
      // Build a map of status IDs to their names for each user
      const statusMap = new Map();

      allStatuses.forEach((status) => {
        statusMap.set(status._id.toString(), {
          userId: status.userId,
          name: status.name.toLowerCase(),
        });
      });

      // Calculate points for each user
      const userPoints = allUserIds.reduce((acc, userId) => {
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

        acc[userId] = {
          userId,
          auraPoints: totalPoints,
          referralCount,
          applicationCount,
          interviewCount,
          offerCount,
          rejectionCount,
          name: referrals.length > 0 ? referrals[0].name.split(" ")[0] : "User",
        };

        return acc;
      }, {} as Record<string, LeaderboardEntry>);

      // Convert to array and sort by aura points
      const sortedLeaderboard = Object.values(userPoints)
        .sort((a, b) => b.auraPoints - a.auraPoints)
        .slice(0, limit);

      setIsLoaded(true);

      // Fetch user profile information
      const fetchUserProfiles = async () => {
        try {
          const userIds = sortedLeaderboard.map((entry) => entry.userId);

          if (userIds.length === 0) return;

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

          // Combine leaderboard data with user profiles
          const enrichedLeaderboard = sortedLeaderboard.map((entry) => ({
            ...entry,
            userInfo: users[entry.userId],
            linkedinUrl: getLinkedinUrl(entry.userId),
          }));

          setLeaderboardWithProfiles(enrichedLeaderboard);
        } catch (error) {
          console.error("Error fetching user profiles:", error);

          // Still include LinkedIn URLs even if other profile info fails
          const fallbackLeaderboard = sortedLeaderboard.map((entry) => ({
            ...entry,
            linkedinUrl: getLinkedinUrl(entry.userId),
          }));

          setLeaderboardWithProfiles(fallbackLeaderboard);
        }
      };

      fetchUserProfiles();
    }
  }, [
    allUserIds,
    allReferrals,
    allApplications,
    allStatuses,
    getLinkedinUrl,
    limit,
  ]);

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
        return <Award className="h-5 w-5 text-blue-400" />;
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
    return entry.name;
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
    return entry.name.charAt(0);
  };

  // Get background color for aura points
  const getAuraBackground = (points: number) => {
    if (points >= 1000) return "bg-gradient-to-r from-orange-500 to-pink-500";
    if (points >= 500) return "bg-gradient-to-r from-violet-500 to-purple-500";
    if (points >= 100) return "bg-gradient-to-r from-blue-500 to-cyan-500";
    if (points >= 50) return "bg-gradient-to-r from-green-500 to-emerald-500";
    return "bg-gradient-to-r from-slate-600 to-slate-500";
  };

  return (
    <div className="overflow-hidden rounded-xl bg-[#0a0e1c]/30 backdrop-blur-sm border border-[#20253d]/50">
      {!hideHeader && (
        <div className="px-6 py-4 bg-[#0f1326]/50 border-b border-[#20253d]/50">
          <h3 className="text-xl font-light text-white">Aura Leaderboard</h3>
          <p className="text-gray-400 text-sm">
            Users with highest Aura points from referrals, applications,
            interviews, offers and more
          </p>
        </div>
      )}

      <div className="divide-y divide-[#20253d]/30">
        {!isLoaded ? (
          <div className="p-6 text-center">
            <div className="animate-pulse h-12 bg-[#1d2442]/20 rounded"></div>
            <div className="animate-pulse h-12 bg-[#1d2442]/20 rounded mt-2"></div>
            <div className="animate-pulse h-12 bg-[#1d2442]/20 rounded mt-2"></div>
          </div>
        ) : leaderboardWithProfiles.length > 0 ? (
          leaderboardWithProfiles.map((entry, index) => (
            <div
              key={entry.userId}
              className={`p-4 flex items-center justify-between gap-4 ${
                user && entry.userId === user.id ? "bg-[#1d2442]/20" : ""
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="flex-shrink-0 w-8">{getMedal(index)}</div>
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
                <div className="min-w-0">
                  <div className="text-xs font-medium text-white truncate">
                    {getDisplayName(entry)}
                    {user && entry.userId === user.id && " (You)"}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-orange-900/20 text-orange-300 border border-orange-800/30">
                      {entry.referralCount} refs
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-blue-900/20 text-blue-300 border border-blue-800/30">
                      {entry.applicationCount} apps
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-purple-900/20 text-purple-300 border border-purple-800/30">
                      {entry.interviewCount} ints
                    </span>
                  </div>
                </div>
              </div>
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-medium text-white ${getAuraBackground(
                  entry.auraPoints
                )}`}
              >
                {entry.auraPoints} points
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-400">
            No data available yet
          </div>
        )}
      </div>
    </div>
  );
};

export default AuraLeaderboard;
