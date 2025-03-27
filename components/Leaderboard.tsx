"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Medal, Trophy, Award, Link as LinkIcon } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface UserInfo {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
}

// interface UserProfile {
//   _id: string;
//   userId: string;
//   linkedinUrl?: string;
//   createdAt: number;
//   updatedAt: number;
// }

interface LeaderboardEntry {
  userId: string;
  name: string;
  referralCount: number;
  userInfo?: UserInfo;
  linkedinUrl?: string;
}

interface LeaderboardProps {
  limit?: number;
  hideHeader?: boolean;
}

const Leaderboard = ({ limit = 5, hideHeader = false }: LeaderboardProps) => {
  const leaderboard = useQuery(api.referrals.getLeaderboard, { limit });
  const { user } = useUser();
  const [isLoaded, setIsLoaded] = useState(false);
  const [leaderboardWithProfiles, setLeaderboardWithProfiles] = useState<
    LeaderboardEntry[]
  >([]);

  // Fetch all user profiles to check privacy settings
  const allUserProfiles = useQuery(api.userProfiles.getAll);

  // Fetch LinkedIn URLs
  const userProfiles = useQuery(
    api.userProfiles.getByUserIds,
    leaderboard ? { userIds: leaderboard.map((entry) => entry.userId) } : "skip"
  );

  // Helper function to get LinkedIn URL
  const getLinkedinUrl = useCallback(
    (userId: string) => {
      if (!userProfiles) return undefined;
      return userProfiles[userId]?.linkedinUrl;
    },
    [userProfiles]
  );

  // Helper function to check if user has opted out of leaderboards
  const hasOptedOutOfLeaderboards = useCallback(
    (userId: string) => {
      if (!allUserProfiles) return false;
      return allUserProfiles[userId]?.hideFromLeaderboards === true;
    },
    [allUserProfiles]
  );

  useEffect(() => {
    if (leaderboard) {
      console.log("Referrals: Starting with", leaderboard.length, "entries");

      const buildLeaderboardWithPrivacy = async () => {
        try {
          // Fetch user profiles for privacy settings
          const profiles = await allUserProfiles;

          // Get all user IDs in the leaderboard
          const leaderboardUserIds = leaderboard.map((entry) => entry.userId);
          console.log(
            "Referrals: Processing",
            leaderboardUserIds.length,
            "users in leaderboard"
          );

          // Get list of users who opted out of leaderboards or hid referral counts
          const excludedUsers = leaderboardUserIds.filter((userId) => {
            const profile = profiles[userId];
            return (
              profile?.hideFromLeaderboards === true ||
              profile?.showReferralsCount === false
            );
          });

          console.log(
            `Filtered out ${excludedUsers.length} users who opted out or hid referral counts`
          );

          // Filter out users who have opted out of leaderboards or hid referral counts
          const filteredLeaderboard = leaderboard.filter(
            (entry) => !excludedUsers.includes(entry.userId)
          );

          // Add ranking info with only visible users
          const leaderboardWithRanks = filteredLeaderboard.map(
            (entry, index) => ({
              ...entry,
              rank: index + 1, // Rank now reflects only visible users
            })
          );

          // Fetch profile information for each user
          fetchUserProfiles(leaderboardWithRanks.slice(0, limit));
        } catch (error) {
          console.error("Error building leaderboard with privacy:", error);
          // Fallback to displaying the full leaderboard
          const leaderboardWithRanks = leaderboard.map((entry, index) => ({
            ...entry,
            rank: index + 1,
          }));
          fetchUserProfiles(leaderboardWithRanks.slice(0, limit));
        }
      };

      buildLeaderboardWithPrivacy();
    }
  }, [leaderboard, allUserProfiles, limit]);

  // Separate function to fetch user profiles
  const fetchUserProfiles = async (leaderboardData: any[]) => {
    try {
      const userIds = leaderboardData.map((entry) => entry.userId);
      console.log("Referrals: Fetching profiles for", userIds.length, "users");

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
        "Referrals: Received profiles for",
        Object.keys(users).length,
        "users"
      );

      // Combine leaderboard data with user profiles
      const enrichedLeaderboard = leaderboardData.map((entry) => ({
        ...entry,
        userInfo: users[entry.userId],
        linkedinUrl: userProfiles
          ? userProfiles[entry.userId]?.linkedinUrl
          : undefined,
      }));

      console.log("Referrals: Updated leaderboard with user details");
      setLeaderboardWithProfiles(enrichedLeaderboard);
      setIsLoaded(true);
    } catch (error) {
      console.error("Error fetching user profiles:", error);

      // Still include LinkedIn URLs even if other profile info fails
      const fallbackLeaderboard = leaderboardData.map((entry) => ({
        ...entry,
        linkedinUrl: userProfiles
          ? userProfiles[entry.userId]?.linkedinUrl
          : undefined,
      }));

      setLeaderboardWithProfiles(fallbackLeaderboard);
      setIsLoaded(true);
    }
  };

  // Also let's add a console.log to help debug
  useEffect(() => {
    console.log("LinkedIn URLs:", userProfiles);
  }, [userProfiles]);

  // Add a fallback to ensure loading state doesn't get stuck
  useEffect(() => {
    // If leaderboard data is undefined after 5 seconds, set isLoaded to true
    // This prevents the component from being stuck in loading state
    const timeout = setTimeout(() => {
      if (!isLoaded) {
        console.log("Referrals: Setting isLoaded to true after timeout");
        setIsLoaded(true);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isLoaded]);

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
            Referral Leaderboard
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
                <div className="flex items-center">
                  <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-900/20 text-purple-300 border border-purple-700/30">
                    {entry.referralCount}{" "}
                    {entry.referralCount === 1 ? "referral" : "referrals"}
                  </div>
                  {entry.linkedinUrl && (
                    <a
                      href={entry.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-400">
              No referrals yet. Be the first!
            </div>
          )
        ) : (
          // Loading state for both versions
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

export default Leaderboard;
