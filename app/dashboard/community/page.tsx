"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Globe,
  Search,
  Info,
  Clock,
  Building,
  MapPin,
  Briefcase,
  ExternalLink,
  ChevronRight,
  Filter,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { debounce } from "lodash";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";

// Define the user info interface
interface UserInfo {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
}

export default function CommunityPage() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [skip, setSkip] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allApplications, setAllApplications] = useState<any[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserInfo>>(
    {}
  );

  // Set up intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Fetch community applications
  const results = useQuery(
    api.applications.getCommunityApplications,
    user?.id
      ? {
          limit: 20,
          skip,
          searchQuery: debouncedQuery || undefined,
        }
      : "skip"
  );

  // Update the debounced search query
  const debouncedSetSearchQuery = useCallback(
    debounce((value: string) => {
      setDebouncedQuery(value);
      setSkip(0); // Reset pagination when search changes
      setAllApplications([]); // Clear existing results when search changes
    }, 300),
    []
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSetSearchQuery(value);
  };

  // Update the applications list when results change
  useEffect(() => {
    if (results?.applications) {
      if (skip === 0) {
        // If this is the first page, replace all applications
        setAllApplications(results.applications);
      } else {
        // Otherwise, append to existing applications
        setAllApplications((prev) => [...prev, ...results.applications]);
      }
      setIsLoadingMore(false);
    }
  }, [results, skip]);

  // Load more when scrolling to the bottom
  useEffect(() => {
    if (inView && results?.hasMore && !isLoadingMore && results.nextSkip) {
      setIsLoadingMore(true);
      setSkip(results.nextSkip);
    }
  }, [inView, results, isLoadingMore]);

  // Fetch user profiles when applications change
  useEffect(() => {
    if (allApplications.length > 0) {
      const fetchUserProfiles = async () => {
        try {
          // Get unique user IDs from applications
          const userIds = [
            ...new Set(allApplications.map((app) => app.userId)),
          ];

          // Skip if no users or if we already have all profiles
          if (userIds.length === 0) return;

          // Filter to only fetch profiles we don't already have
          const missingUserIds = userIds.filter((id) => !userProfiles[id]);
          if (missingUserIds.length === 0) return;

          const response = await fetch("/api/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userIds: missingUserIds }),
          });

          if (!response.ok) {
            throw new Error("Failed to fetch user profiles");
          }

          const { users } = await response.json();

          // Update user profiles state with new data
          setUserProfiles((prev) => ({
            ...prev,
            ...users,
          }));
        } catch (error) {
          console.error("Error fetching user profiles:", error);
        }
      };

      fetchUserProfiles();
    }
  }, [allApplications, userProfiles]);

  // Format the status color class
  const getStatusColorClass = (color: string) => {
    if (!color) return "bg-gray-500";
    if (color.startsWith("bg-")) return color;
    return `bg-${color}`;
  };

  // Format the text color based on background color
  const getStatusTextColorClass = (bgColor: string) => {
    if (!bgColor) return "text-gray-400";

    // Extract the color name without the "bg-" prefix
    const colorName = bgColor.startsWith("bg-")
      ? bgColor.replace("bg-", "")
      : bgColor;

    return `text-${colorName}-400`;
  };

  // Get display name for a user
  const getDisplayName = (userId: string) => {
    const userInfo = userProfiles[userId];

    if (userInfo) {
      if (userInfo.firstName && userInfo.lastName) {
        return `${userInfo.firstName} ${userInfo.lastName}`;
      } else if (userInfo.firstName) {
        return userInfo.firstName;
      } else if (userInfo.username) {
        return userInfo.username;
      }
    }

    return "Anonymous";
  };

  // Get initials for the avatar
  const getInitials = (userId: string) => {
    const userInfo = userProfiles[userId];

    if (userInfo) {
      if (userInfo.firstName && userInfo.lastName) {
        return `${userInfo.firstName.charAt(0)}${userInfo.lastName.charAt(0)}`;
      } else if (userInfo.firstName) {
        return userInfo.firstName.charAt(0);
      } else if (userInfo.username) {
        return userInfo.username.charAt(0);
      }
    }

    return "?";
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center mb-8">
        <div className="relative">
          <h1 className="text-2xl font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-gray-300 relative z-10 flex items-center">
            <Globe className="h-5 w-5 mr-2 text-blue-400" />
            Community Applications
          </h1>
          <div className="absolute -bottom-1 left-0 h-[1px] w-full bg-gradient-to-r from-blue-500/80 via-purple-500/60 to-blue-400/40"></div>
        </div>
      </div>

      {/* Info banner */}
      <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start">
        <Info className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-gray-300">
          Browse and search all job applications submitted by community members.
          See where other people are applying and track industry trends.
          <br />
          <span className="text-blue-400">
            Privacy note: This page only shows applications from users who have
            enabled sharing in their privacy settings.
          </span>
        </p>
      </div>

      {/* Search and filter bar */}
      <div className="mb-6 bg-[#121a36]/50 backdrop-blur-sm rounded-lg border border-[#20253d]/50 p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by company, position, or location..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-[#0c1029] border border-[#20253d] rounded-md py-2 pl-10 pr-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0c1029] border border-[#20253d] rounded-md text-gray-200 hover:bg-[#0c1029]/80 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <Filter className="h-4 w-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* Applications timeline */}
      <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-lg border border-[#20253d]/50 overflow-hidden">
        <div className="p-4 border-b border-[#20253d]/50 flex justify-between items-center">
          <h2 className="text-lg font-medium text-white flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-400" />
            Latest Applications
          </h2>
          <span className="text-sm text-gray-400">
            {results?.total || 0} total applications
          </span>
        </div>

        {/* Applications list */}
        <div className="divide-y divide-[#20253d]/30">
          {!results && (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
          )}

          {results && allApplications.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-400 mb-2">No applications found</p>
              <p className="text-sm text-gray-500">
                {searchQuery
                  ? "Try a different search term"
                  : "Check back later for new applications"}
              </p>
            </div>
          )}

          {allApplications.map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="p-4 hover:bg-[#0c1029]/50 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white group">
                        {app.url ? (
                          <a
                            href={app.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-400 transition-colors flex items-center"
                          >
                            {app.position}
                            <ExternalLink className="ml-2 h-4 w-4 opacity-50 group-hover:opacity-100" />
                          </a>
                        ) : (
                          app.position
                        )}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                        <Building className="h-4 w-4" />
                        <span>{app.companyName}</span>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorClass(
                          app.statusColor
                        )} bg-opacity-20 ${getStatusTextColorClass(
                          app.statusColor
                        )}`}
                      >
                        {app.statusName}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                    {app.location && (
                      <div className="flex items-center text-sm text-gray-400">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{app.location}</span>
                      </div>
                    )}
                    {app.salary && (
                      <div className="flex items-center text-sm text-gray-400">
                        <svg
                          className="h-4 w-4 mr-1"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="12" y1="1" x2="12" y2="23"></line>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                        <span>{app.salary}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-400">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Applied {app.dateApplied}</span>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-gray-500 flex items-center">
                    <Link
                      href={`/profile/${app.userId}`}
                      className="hover:text-blue-400 transition-colors flex items-center"
                    >
                      {userProfiles[app.userId]?.imageUrl ? (
                        <img
                          src={userProfiles[app.userId].imageUrl}
                          alt={getDisplayName(app.userId)}
                          className="h-5 w-5 rounded-full mr-2 object-cover"
                        />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mr-2">
                          {getInitials(app.userId)}
                        </div>
                      )}
                      <span>Added by {getDisplayName(app.userId)}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Infinite scroll loading indicator */}
          {results?.hasMore && (
            <div ref={loadMoreRef} className="p-4 text-center">
              {isLoadingMore && (
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
