"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import Image from "next/image";
import { Medal, Trophy, Award, User, LineChart } from "lucide-react";
import { useEffect, useState } from "react";

interface UserRankCardProps {
  userId?: string;
}

const UserRankCard = ({ userId }: UserRankCardProps) => {
  const allLeaderboardEntries = useQuery(api.referrals.getLeaderboard);
  const [userPosition, setUserPosition] = useState<number | null>(null);
  const [userEntry, setUserEntry] = useState<any | null>(null);
  const [userInfo, setUserInfo] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (allLeaderboardEntries && userId) {
      setIsLoading(true);

      // Find the user's position in the full leaderboard
      const position = allLeaderboardEntries.findIndex(
        (entry) => entry.userId === userId
      );

      if (position !== -1) {
        setUserPosition(position + 1); // +1 because array is 0-indexed
        setUserEntry(allLeaderboardEntries[position]);

        // Fetch user profile info
        const fetchUserInfo = async () => {
          try {
            const response = await fetch("/api/users", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ userIds: [userId] }),
            });

            if (response.ok) {
              const { users } = await response.json();
              setUserInfo(users[userId]);
            }
          } catch (error) {
            console.error("Error fetching user info:", error);
          } finally {
            setIsLoading(false);
          }
        };

        fetchUserInfo();
      } else {
        // User not in leaderboard (no referrals yet)
        setUserPosition(null);
        setUserEntry(null);
        setIsLoading(false);
      }
    } else if (!userId) {
      setIsLoading(false);
    }
  }, [allLeaderboardEntries, userId]);

  // Get medal icon based on position
  const getMedal = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-10 w-10 text-yellow-500" />;
      case 2:
        return <Medal className="h-10 w-10 text-gray-400" />;
      case 3:
        return <Medal className="h-10 w-10 text-amber-700" />;
      default:
        return <Award className="h-10 w-10 text-blue-500" />;
    }
  };

  // Get user's initials for avatar fallback
  const getInitials = () => {
    if (userInfo) {
      if (userInfo.firstName && userInfo.lastName) {
        return `${userInfo.firstName.charAt(0)}${userInfo.lastName.charAt(0)}`;
      } else if (userInfo.firstName) {
        return userInfo.firstName.charAt(0);
      } else if (userInfo.username) {
        return userInfo.username.charAt(0);
      }
    }
    return userEntry?.name.charAt(0) || "?";
  };

  // Get user's display name
  const getDisplayName = () => {
    if (userInfo) {
      if (userInfo.firstName && userInfo.lastName) {
        return `${userInfo.firstName} ${userInfo.lastName}`;
      } else if (userInfo.firstName) {
        return userInfo.firstName;
      } else if (userInfo.username) {
        return userInfo.username;
      }
    }
    return userEntry?.name || "Anonymous User";
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
        <div className="h-40 bg-gray-200"></div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 text-center">
        <p className="text-gray-500">Please sign in to see your ranking</p>
      </div>
    );
  }

  if (!userEntry) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-blue-600">
          <h3 className="text-xl font-bold text-white">Your Ranking</h3>
        </div>
        <div className="p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <User className="h-10 w-10 text-blue-600" />
          </div>
          <p className="font-medium text-gray-900 mb-2">
            You're not on the leaderboard yet
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Start adding referrals to earn your place!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-blue-600">
        <h3 className="text-xl font-bold text-white">Your Ranking</h3>
      </div>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <div className="mr-4">{getMedal(userPosition || 0)}</div>
          <div className="text-3xl font-bold text-gray-900">
            #{userPosition}
          </div>
        </div>

        <div className="flex items-center mb-6">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 mr-4">
            {userInfo?.imageUrl ? (
              <Image
                src={userInfo.imageUrl}
                alt={getDisplayName()}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-blue-100">
                <span className="text-blue-600 font-bold text-xl">
                  {getInitials()}
                </span>
              </div>
            )}
          </div>

          <div>
            <div className="font-medium text-lg text-gray-900">
              {getDisplayName()}
            </div>
            <div className="text-sm text-gray-500">You</div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg flex items-center">
          <LineChart className="w-5 h-5 text-blue-600 mr-2" />
          <div>
            <div className="text-xl font-bold text-blue-700">
              {userEntry.referralCount}
            </div>
            <div className="text-sm text-blue-600">
              {userEntry.referralCount === 1 ? "referral" : "referrals"}
            </div>
          </div>
        </div>

        {userPosition && userPosition > 1 && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            <p>
              {userPosition === 2
                ? "You need 1 more referral to reach 1st place!"
                : `You need ${userPosition} more referrals to reach 1st place!`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRankCard;
