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
  applicationCount: number;
  userInfo?: UserInfo;
  linkedinUrl?: string;
}

interface ApplicationsLeaderboardProps {
  limit?: number;
  hideHeader?: boolean;
}

const ApplicationsLeaderboard = ({
  limit = 100,
  hideHeader = false,
}: ApplicationsLeaderboardProps) => {
  const { user } = useUser();
  const [isLoaded, setIsLoaded] = useState(false);
  const [leaderboardWithProfiles, setLeaderboardWithProfiles] = useState<
    LeaderboardEntry[]
  >([]);

  // Fetch all user IDs from the database
  const allUserIds = useQuery(api.users.getAllUserIds);

  // Fetch applications for all users
  const allApplications = useQuery(api.applications.getAllApplications);

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

  // Calculate application counts and build leaderboard
  useEffect(() => {
    if (allUserIds && allApplications) {
      // Count applications for each user
      const userApplicationCounts = allUserIds.reduce((acc, userId) => {
        const applications = allApplications.filter(
          (app) => app.userId === userId
        );
        if (applications.length > 0) {
          acc[userId] = {
            userId,
            applicationCount: applications.length,
            name: "User", // This will be updated with profile info later
          };
        }
        return acc;
      }, {} as Record<string, LeaderboardEntry>);

      // Convert to array and sort by application count
      const sortedLeaderboard = Object.values(userApplicationCounts)
        .sort((a, b) => b.applicationCount - a.applicationCount)
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
  }, [allUserIds, allApplications, getLinkedinUrl, limit]);

  // Return medal component based on position
  const getMedal = (position: number) => {
    switch (position) {
      case 0:
        return <Trophy className="h-5 w-5 text-blue-500" />;
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

  return (
    <div className="overflow-hidden rounded-xl bg-[#0a0e1c]/30 backdrop-blur-sm border border-[#20253d]/50">
      {!hideHeader && (
        <div className="px-6 py-4 bg-[#0f1326]/50 border-b border-[#20253d]/50">
          <h3 className="text-xl font-light text-white">
            Applications Leaderboard
          </h3>
          <p className="text-gray-400 text-sm">
            Users with the most job applications
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
                  <p className="text-xs font-medium text-white truncate">
                    {getDisplayName(entry)}
                    {user && entry.userId === user.id && " (You)"}
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-900/20 text-blue-300 border border-blue-700/30">
                {entry.applicationCount}{" "}
                {entry.applicationCount === 1 ? "application" : "applications"}
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-400">
            No applications data available
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsLeaderboard;
