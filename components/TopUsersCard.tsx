"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Trophy, Briefcase, Medal } from "lucide-react";

interface TopUsersCardProps {
  className?: string;
}

interface TopUserInfo {
  userId: string;
  username?: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string;
  referralCount?: number;
  applicationCount?: number;
}

interface ApplicationCountData {
  userId: string;
  applicationCount: number;
}

const TopUsersCard = ({ className }: TopUsersCardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [topReferralUser, setTopReferralUser] = useState<TopUserInfo | null>(
    null
  );
  const [topApplicationUser, setTopApplicationUser] =
    useState<TopUserInfo | null>(null);

  // Fetch data for all leaderboard types
  const referralLeaderboard = useQuery(api.referrals.getLeaderboard, {});

  // For applications leaderboard metrics
  const allUserIds = useQuery(api.users.getAllUserIds);
  const allApplications = useQuery(api.applications.getAllApplications);

  // Calculate applications leaderboard
  const applicationsLeaderboard = useMemo(() => {
    if (!allUserIds || !allApplications) return [];

    // Count applications for each user
    const userApplicationCounts = allUserIds.reduce((acc, userId) => {
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
  }, [allUserIds, allApplications]);

  useEffect(() => {
    if (
      referralLeaderboard !== undefined &&
      applicationsLeaderboard.length > 0
    ) {
      setIsLoading(false);
    }
  }, [referralLeaderboard, applicationsLeaderboard]);

  // Fetch user profile information for the top users
  useEffect(() => {
    if (!isLoading) {
      const fetchTopUsersProfiles = async () => {
        try {
          const userIds = [];

          // Get top referral user
          if (referralLeaderboard && referralLeaderboard.length > 0) {
            userIds.push(referralLeaderboard[0].userId);
          }

          // Get top application user
          if (applicationsLeaderboard.length > 0) {
            userIds.push(applicationsLeaderboard[0].userId);
          }

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

          // Set top referral user
          if (referralLeaderboard && referralLeaderboard.length > 0) {
            const topRefUser = referralLeaderboard[0];
            setTopReferralUser({
              userId: topRefUser.userId,
              ...users[topRefUser.userId],
              referralCount: topRefUser.referralCount,
            });
          }

          // Set top application user
          if (applicationsLeaderboard.length > 0) {
            const topAppUser = applicationsLeaderboard[0];
            setTopApplicationUser({
              userId: topAppUser.userId,
              ...users[topAppUser.userId],
              applicationCount: topAppUser.applicationCount,
            });
          }
        } catch (error) {
          console.error("Error fetching user profiles:", error);
        }
      };

      fetchTopUsersProfiles();
    }
  }, [isLoading, referralLeaderboard, applicationsLeaderboard]);

  // Helper function to get display name
  const getDisplayName = (user: TopUserInfo | null) => {
    if (!user) return "User";

    if (user.firstName) {
      return user.firstName + (user.lastName ? ` ${user.lastName}` : "");
    }

    return user.username || "User";
  };

  if (isLoading) {
    return (
      <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-[#20253d]/50 p-6 flex justify-center">
        <div className="animate-spin h-5 w-5 border-2 border-orange-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div
      className={`bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-[#20253d]/50 ${className}`}
    >
      <div className="px-6 py-4 bg-[#0f1326]/70 border-b border-[#20253d]/50">
        <h3 className="text-xl font-light text-white">Top Performers</h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Top Referrals User */}
        {topReferralUser && (
          <div className="bg-[#1d2442]/40 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <Trophy className="h-10 w-10 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-purple-400 mb-1">Top Referrals</p>
                <div className="flex items-center">
                  {topReferralUser.imageUrl ? (
                    <Image
                      src={topReferralUser.imageUrl}
                      alt={getDisplayName(topReferralUser)}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full border border-purple-500/30 mr-2 object-cover"
                      priority
                      quality={90}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                      <span className="text-sm text-gray-300">
                        {getDisplayName(topReferralUser)?.charAt(0) || "U"}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium truncate">
                      {getDisplayName(topReferralUser)}
                    </p>
                    <p className="text-xs text-gray-400">
                      <span className="inline-flex items-center space-x-1">
                        <Medal className="h-3 w-3 text-purple-400" />
                        <span>{topReferralUser.referralCount} referrals</span>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Applications User */}
        {topApplicationUser && (
          <div className="bg-[#1d2442]/40 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <Trophy className="h-10 w-10 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-blue-400 mb-1">Top Applications</p>
                <div className="flex items-center">
                  {topApplicationUser.imageUrl ? (
                    <Image
                      src={topApplicationUser.imageUrl}
                      alt={getDisplayName(topApplicationUser)}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full border border-blue-500/30 mr-2 object-cover"
                      priority
                      quality={90}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                      <span className="text-sm text-gray-300">
                        {getDisplayName(topApplicationUser)?.charAt(0) || "U"}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium truncate">
                      {getDisplayName(topApplicationUser)}
                    </p>
                    <p className="text-xs text-gray-400">
                      <span className="inline-flex items-center space-x-1">
                        <Briefcase className="h-3 w-3 text-blue-400" />
                        <span>
                          {topApplicationUser.applicationCount} applications
                        </span>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopUsersCard;
