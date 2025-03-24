"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Medal, Trophy, Award, User } from "lucide-react";
import { useState, useEffect } from "react";

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
  referralCount: number;
  userInfo?: UserInfo;
}

interface LeaderboardProps {
  limit?: number;
}

const Leaderboard = ({ limit = 5 }: LeaderboardProps) => {
  const leaderboard = useQuery(api.referrals.getLeaderboard, { limit });
  const { user } = useUser();
  const [isLoaded, setIsLoaded] = useState(false);
  const [leaderboardWithProfiles, setLeaderboardWithProfiles] = useState<
    LeaderboardEntry[]
  >([]);

  useEffect(() => {
    if (leaderboard !== undefined) {
      setIsLoaded(true);

      // Fetch user profile information
      const fetchUserProfiles = async () => {
        try {
          const userIds = leaderboard.map((entry) => entry.userId);

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
          const enrichedLeaderboard = leaderboard.map((entry) => ({
            ...entry,
            userInfo: users[entry.userId],
          }));

          setLeaderboardWithProfiles(enrichedLeaderboard);
        } catch (error) {
          console.error("Error fetching user profiles:", error);
          setLeaderboardWithProfiles(leaderboard);
        }
      };

      fetchUserProfiles();
    }
  }, [leaderboard]);

  // Return medal component based on position
  const getMedal = (position: number) => {
    switch (position) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-amber-700" />;
      default:
        return <Award className="h-6 w-6 text-blue-500" />;
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
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-blue-600">
        <h3 className="text-xl font-bold text-white">Referral Leaderboard</h3>
        <p className="text-blue-100 text-sm">
          Top users with the most referrals
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {!isLoaded ? (
          <div className="p-6 text-center">
            <div className="animate-pulse h-12 bg-gray-200 rounded"></div>
            <div className="animate-pulse h-12 bg-gray-200 rounded mt-2"></div>
            <div className="animate-pulse h-12 bg-gray-200 rounded mt-2"></div>
          </div>
        ) : leaderboardWithProfiles.length > 0 ? (
          leaderboardWithProfiles.map((entry, index) => (
            <div
              key={entry.userId}
              className={`p-4 flex items-center justify-between ${
                user && entry.userId === user.id ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">{getMedal(index)}</div>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {entry.userInfo?.imageUrl ? (
                    <Image
                      src={entry.userInfo.imageUrl}
                      alt={getDisplayName(entry)}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      priority={index < 3}
                      loading={index < 3 ? "eager" : "lazy"}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-blue-100">
                      <span className="text-blue-600 font-medium text-sm">
                        {getInitials(entry)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {getDisplayName(entry)}
                    {user && entry.userId === user.id && " (You)"}
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {entry.referralCount}{" "}
                {entry.referralCount === 1 ? "referral" : "referrals"}
              </div>
            </div>
          ))
        ) : leaderboard && leaderboard.length > 0 ? (
          leaderboard.map((entry, index) => (
            <div
              key={entry.userId}
              className={`p-4 flex items-center justify-between ${
                user && entry.userId === user.id ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">{getMedal(index)}</div>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  <div className="flex items-center justify-center w-full h-full bg-blue-100">
                    <span className="text-blue-600 font-medium text-sm">
                      {getInitials(entry)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {getDisplayName(entry)}
                    {user && entry.userId === user.id && " (You)"}
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {entry.referralCount}{" "}
                {entry.referralCount === 1 ? "referral" : "referrals"}
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">
            No referrals yet. Be the first to add one!
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
