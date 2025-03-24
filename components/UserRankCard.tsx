"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import Image from "next/image";
import {
  Medal,
  Trophy,
  Award,
  User,
  LineChart,
  Linkedin,
  X,
  Edit,
  Link as LinkIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface UserRankCardProps {
  userId?: string;
}

// Add these interfaces for proper typing
interface LeaderboardEntry {
  userId: string;
  name: string;
  referralCount: number;
}

interface UserInfo {
  firstName?: string;
  lastName?: string;
  username?: string;
  imageUrl?: string;
}

const UserRankCard = ({ userId }: UserRankCardProps) => {
  const allLeaderboardEntries = useQuery(api.referrals.getLeaderboard, {});
  const userProfile = useQuery(
    api.userProfiles.getByUserId,
    userId ? { userId } : "skip"
  );
  const upsertProfile = useMutation(api.userProfiles.upsertProfile);
  const removeLinkedinUrl = useMutation(api.userProfiles.removeLinkedinUrl);

  const [userPosition, setUserPosition] = useState<number | null>(null);
  const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isEditingLinkedin, setIsEditingLinkedin] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [showLinkedinInput, setShowLinkedinInput] = useState(false);

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

  // Set LinkedIn URL from user profile
  useEffect(() => {
    if (userProfile && userProfile.linkedinUrl) {
      setLinkedinUrl(userProfile.linkedinUrl);
    } else {
      setLinkedinUrl("");
    }
  }, [userProfile]);

  // Handle saving LinkedIn URL
  const handleSaveLinkedin = async () => {
    if (!userId) return;

    // Validate URL
    let url = linkedinUrl.trim();
    if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    await upsertProfile({ userId, linkedinUrl: url });
    setIsEditingLinkedin(false);
    setShowLinkedinInput(false);
  };

  // Handle removing LinkedIn URL
  const handleRemoveLinkedin = async () => {
    if (!userId) return;
    await removeLinkedinUrl({ userId });
    setLinkedinUrl("");
    setIsEditingLinkedin(false);
    setShowLinkedinInput(false);
  };

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
      <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden animate-pulse border border-[#20253d]/50">
        <div className="h-40 bg-[#1d2442]/20"></div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden p-6 text-center border border-[#20253d]/50">
        <p className="text-gray-400">Please sign in to see your ranking</p>
      </div>
    );
  }

  if (!userEntry) {
    return (
      <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-[#20253d]/50">
        <div className="px-6 py-4 bg-[#0f1326]/70 border-b border-[#20253d]/50">
          <h3 className="text-xl font-light text-white">Your Ranking</h3>
        </div>
        <div className="p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-[#1d2442]/40 flex items-center justify-center mx-auto mb-4">
            <User className="h-10 w-10 text-orange-400" />
          </div>
          <p className="font-light text-white mb-2">
            You&apos;re not on the leaderboard yet
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Start adding referrals to earn your place!
          </p>

          {/* LinkedIn URL Section */}
          <div className="mt-6 border-t border-[#20253d]/50 pt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-light text-white">
                Your LinkedIn Profile
              </h4>
              {!showLinkedinInput && (
                <button
                  onClick={() => setShowLinkedinInput(true)}
                  className="text-orange-400 hover:text-orange-300 text-sm flex items-center"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Add
                </button>
              )}
            </div>

            {showLinkedinInput ? (
              <div className="mt-2">
                <div className="flex">
                  <input
                    type="text"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  />
                </div>
                <div className="mt-2 flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowLinkedinInput(false);
                      setLinkedinUrl(userProfile?.linkedinUrl || "");
                    }}
                    className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveLinkedin}
                    className="px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : userProfile?.linkedinUrl ? (
              <div className="mt-2 flex items-center justify-between">
                <a
                  href={userProfile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline text-sm flex items-center truncate max-w-[180px]"
                >
                  <Linkedin className="h-4 w-4 mr-1" />
                  <span className="truncate">{userProfile.linkedinUrl}</span>
                </a>
                <div className="flex space-x-1">
                  <button
                    onClick={() => {
                      setLinkedinUrl(userProfile.linkedinUrl || "");
                      setShowLinkedinInput(true);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                    title="Edit"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                  <button
                    onClick={handleRemoveLinkedin}
                    className="text-gray-500 hover:text-red-500"
                    title="Remove"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm mt-1">
                No LinkedIn profile added
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-[#20253d]/50">
      <div className="px-6 py-4 bg-[#0f1326]/70 border-b border-[#20253d]/50">
        <h3 className="text-xl font-light text-white">Your Ranking</h3>
      </div>
      <div className="p-6">
        <div className="flex items-center">
          <div className="mr-4 flex-shrink-0">
            {userPosition ? (
              getMedal(userPosition)
            ) : (
              <User className="h-10 w-10 text-orange-400" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1d2442]/40 mr-3 flex-shrink-0 border border-[#20253d]/70">
                {userInfo?.imageUrl ? (
                  <Image
                    src={userInfo.imageUrl}
                    alt={getDisplayName()}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    quality={90}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-[#1d2442]">
                    <span className="text-gray-300 font-medium">
                      {getInitials()}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-lg font-light text-white">
                  {getDisplayName()}
                </h4>
                <p className="text-sm text-gray-400">
                  {userPosition
                    ? `Rank #${userPosition} · ${
                        userEntry?.referralCount || 0
                      } ${
                        (userEntry?.referralCount || 0) === 1
                          ? "referral"
                          : "referrals"
                      }`
                    : "No referrals yet"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Link href={`/analytics?userId=${userId}`} className="block w-full">
          <div className="bg-[#121a36]/60 border border-[#20253d]/50 p-4 rounded-lg flex items-center transition-colors hover:bg-[#1d2442]/50 cursor-pointer backdrop-blur-sm mt-4 group">
            <LineChart className="w-5 h-5 text-orange-400 group-hover:text-orange-300 mr-2 transition-colors" />
            <div>
              <div className="text-xl font-light text-white group-hover:text-orange-300 transition-colors">
                {userEntry.referralCount}
              </div>
              <div className="text-sm text-gray-400">
                {userEntry.referralCount === 1 ? "referral" : "referrals"}
              </div>
            </div>
            <div className="ml-auto">
              <span className="text-sm text-gray-300 group-hover:text-orange-300 transition-colors flex items-center">
                View Analytics
                <svg
                  className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            </div>
          </div>
        </Link>

        {/* LinkedIn URL Section */}
        <div className="mt-6 border-t border-[#20253d]/50 pt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-light text-white">
              Show Your LinkedIn Profile
            </h4>
            {!showLinkedinInput && (
              <button
                onClick={() => setShowLinkedinInput(true)}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                {userProfile?.linkedinUrl ? (
                  <>
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </>
                ) : (
                  <>
                    <Edit className="h-3 w-3 mr-1" />
                    Add
                  </>
                )}
              </button>
            )}
          </div>

          {showLinkedinInput ? (
            <div className="mt-2">
              <div className="flex">
                <input
                  type="text"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>
              <div className="mt-2 flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowLinkedinInput(false);
                    setLinkedinUrl(userProfile?.linkedinUrl || "");
                  }}
                  className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLinkedin}
                  className="px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
                >
                  Save
                </button>
              </div>
            </div>
          ) : userProfile?.linkedinUrl ? (
            <div className="mt-2 flex items-center justify-between">
              <a
                href={userProfile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline text-sm flex items-center truncate max-w-[180px]"
              >
                <Linkedin className="h-4 w-4 mr-1" />
                <span className="truncate">{userProfile.linkedinUrl}</span>
              </a>
              <div className="flex space-x-1">
                <button
                  onClick={() => {
                    setLinkedinUrl(userProfile.linkedinUrl || "");
                    setShowLinkedinInput(true);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                  title="Edit"
                >
                  <Edit className="h-3 w-3" />
                </button>
                <button
                  onClick={handleRemoveLinkedin}
                  className="text-gray-500 hover:text-red-500"
                  title="Remove"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm mt-1">
              No LinkedIn profile added
            </p>
          )}
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
