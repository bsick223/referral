"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Trophy, Medal, Award } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

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

// Define ApplicationStatus enum if used in the component
enum ApplicationStatus {
  SUBMITTED = "submitted",
  INTERVIEW_SCHEDULED = "interview_scheduled",
  OFFER_SENT = "offer_sent",
  REJECTED = "rejected",
}

const ApplicationsLeaderboard = ({
  limit = 5,
  hideHeader = false,
}: ApplicationsLeaderboardProps) => {
  const { user } = useUser();
  const [isLoaded, setIsLoaded] = useState(false);
  const [leaderboardWithProfiles, setLeaderboardWithProfiles] = useState<
    LeaderboardEntry[]
  >([]);

  // Fetch all user profiles to check privacy settings
  const allUserProfiles = useQuery(api.userProfiles.getAll);

  // Fetch all user IDs and applications
  const allUserIds = useQuery(api.users.getAllUserIds);
  const allApplications = useQuery(api.applications.getAllApplications);

  // Helper function to check if user has opted out of leaderboards
  const hasOptedOutOfLeaderboards = useCallback(
    (userId: string) => {
      if (!allUserProfiles) return false;
      return allUserProfiles[userId]?.hideFromLeaderboards === true;
    },
    [allUserProfiles]
  );

  // Calculate Applications leaderboard
  useEffect(() => {
    if (allUserIds && allApplications) {
      const buildLeaderboardWithPrivacy = async () => {
        try {
          // Fetch user profiles for privacy settings
          const profiles = await allUserProfiles;

          // Filter users who have opted out of leaderboards or have hidden application counts
          const filteredUserIds = allUserIds.filter((userId) => {
            const userProfile = profiles ? profiles[userId] : null;
            return (
              !userProfile?.hideFromLeaderboards &&
              userProfile?.showApplicationsCount !== false
            );
          });

          console.log(
            `Applications: Filtered out ${
              allUserIds.length - filteredUserIds.length
            } users who opted out or hid application counts`
          );

          // Count applications for each user
          const userApplicationCounts = filteredUserIds.reduce(
            (acc, userId) => {
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
            },
            [] as any[]
          );

          // Sort by application count
          const sortedLeaderboard = userApplicationCounts
            .sort((a, b) => b.applicationCount - a.applicationCount)
            .slice(0, limit);

          console.log(
            "Applications: Generated leaderboard with",
            sortedLeaderboard.length,
            "users"
          );

          setIsLoaded(true);

          if (sortedLeaderboard.length > 0) {
            // Fetch user profile information
            fetchUserProfiles(sortedLeaderboard);
          } else {
            setLeaderboardWithProfiles([]);
          }
        } catch (error) {
          console.error(
            "Error building applications leaderboard with privacy:",
            error
          );

          // Fallback to simple leaderboard without privacy filtering
          const fallbackLeaderboard = createBasicLeaderboard();
          if (fallbackLeaderboard.length > 0) {
            fetchUserProfiles(fallbackLeaderboard);
          } else {
            setLeaderboardWithProfiles([]);
            setIsLoaded(true);
          }
        }
      };

      buildLeaderboardWithPrivacy();
    }
  }, [allUserIds, allApplications, limit, allUserProfiles]);

  // Helper function to create a basic leaderboard without privacy filtering
  const createBasicLeaderboard = () => {
    if (!allUserIds || !allApplications) return [];

    // Filter out users who opted out of leaderboards or hid application counts
    const filteredUserIds = allUserProfiles
      ? allUserIds.filter((userId) => {
          const userProfile = allUserProfiles[userId] || null;
          return (
            !userProfile?.hideFromLeaderboards &&
            userProfile?.showApplicationsCount !== false
          );
        })
      : allUserIds;

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
    }, [] as any[]);

    // Sort by application count
    return userApplicationCounts
      .sort((a, b) => b.applicationCount - a.applicationCount)
      .slice(0, limit);
  };

  // Separate function to fetch user profiles
  const fetchUserProfiles = async (leaderboardData: LeaderboardEntry[]) => {
    try {
      const userIds = leaderboardData.map((entry) => entry.userId);
      console.log(
        "Applications: Fetching profiles for",
        userIds.length,
        "users"
      );

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profiles for applications");
      }

      const { users } = await response.json();
      console.log(
        "Applications: Received profiles for",
        Object.keys(users).length,
        "users"
      );

      // Combine leaderboard data with user profiles
      const enrichedLeaderboard = leaderboardData.map((entry) => ({
        ...entry,
        userInfo: users[entry.userId],
      }));

      console.log("Applications: Updated leaderboard with user details");
      setLeaderboardWithProfiles(enrichedLeaderboard);
    } catch (error) {
      console.error("Error fetching application user profiles:", error);
      // Still display the leaderboard even without user details
      setLeaderboardWithProfiles(leaderboardData);
    }
  };

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
        return (
          <div className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold bg-gradient-to-br from-blue-400/20 to-indigo-400/20 text-blue-400 border border-blue-500/30">
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
    <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-[#20253d]/50">
      {!hideHeader && (
        <div className="px-6 py-4 bg-[#0f1326]/70 border-b border-[#20253d]/50">
          <h3 className="text-xl font-light text-white">
            Applications Leaderboard
          </h3>
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
                        width={40}
                        height={40}
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
                      <p className="text-xs font-medium text-white truncate hover:text-blue-300">
                        {getDisplayName(entry)}
                        {user && entry.userId === user.id && " (You)"}
                      </p>
                    </Link>
                  </div>
                </div>
                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-900/20 text-blue-300 border border-blue-700/30">
                  {entry.applicationCount}{" "}
                  {entry.applicationCount === 1
                    ? "application"
                    : "applications"}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-400">
              No applications yet. Be the first!
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

export default ApplicationsLeaderboard;
