"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  ExternalLink,
  Filter,
  Loader2,
  X,
  Check,
  Calendar,
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

// Define the application interface
interface Application {
  id: string;
  userId: string;
  companyName: string;
  position: string;
  statusName: string;
  statusColor: string;
  location?: string;
  salary?: string;
  url?: string;
  dateApplied: string;
  timestamp: number;
  isPublic?: boolean;
}

// Define filter options interface
interface FilterOptions {
  dateRange: string;
  status: string[];
  locationType: string[];
}

export default function CommunityPage() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [skip, setSkip] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserInfo>>(
    {}
  );
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0);

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    dateRange: "all",
    status: [],
    locationType: [],
  });
  const [appliedFilters, setAppliedFilters] = useState<FilterOptions>({
    dateRange: "all",
    status: [],
    locationType: [],
  });
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setShowFilters(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  // Create a memoized debounced search function
  const debouncedSearch = useMemo(
    () =>
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
    debouncedSearch(value);
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
  }, [results, skip, forceUpdateCounter]);

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
  }, [allApplications]);

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

  // Toggle filter dropdown
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Handle filter option changes
  const handleFilterChange = (
    filterType: keyof FilterOptions,
    value: string | string[]
  ) => {
    setFilterOptions((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  // Apply filters
  const applyFilters = () => {
    // Force clean state
    setAllApplications([]);
    setSkip(0);

    // Set applied filters
    setAppliedFilters({ ...filterOptions });
    setShowFilters(false);

    // Force a refresh by incrementing our counter
    setForceUpdateCounter((prev) => prev + 1);
  };

  // Reset filters
  const resetFilters = () => {
    const defaultFilters = {
      dateRange: "all",
      status: [],
      locationType: [],
    };

    // Force clean state
    setAllApplications([]);
    setSkip(0);

    setFilterOptions(defaultFilters);
    setAppliedFilters(defaultFilters);

    // Force a refresh by incrementing our counter
    setForceUpdateCounter((prev) => prev + 1);
  };

  // Filter applications based on applied filters
  const filteredApplications = useMemo(() => {
    // For debugging
    console.log("Filtering applications:", {
      allApplicationsLength: allApplications.length,
      dateRange: appliedFilters.dateRange,
      statusFilters: appliedFilters.status,
      locationFilters: appliedFilters.locationType,
    });

    return allApplications.filter((app) => {
      // Date range filter
      if (appliedFilters.dateRange !== "all") {
        const now = new Date();
        const appDate = new Date(app.timestamp);

        // Calculate days difference correctly - positive means app is older than cutoff
        const diffInMs = now.getTime() - appDate.getTime();
        const diffDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        // Debug logging for week filter
        if (appliedFilters.dateRange === "week") {
          console.log(
            `App: ${
              app.companyName
            }, Date: ${appDate.toLocaleDateString()}, Days ago: ${diffDays}, Included: ${
              diffDays <= 7
            }`
          );
        }

        // Check if the application falls within the filter timeframe
        switch (appliedFilters.dateRange) {
          case "week":
            if (diffDays > 7) return false;
            break;
          case "month":
            if (diffDays > 30) return false;
            break;
          case "quarter":
            if (diffDays > 90) return false;
            break;
          case "year":
            if (diffDays > 365) return false;
            break;
        }
      }

      // Status filter
      if (
        appliedFilters.status.length > 0 &&
        !appliedFilters.status.includes(app.statusName)
      ) {
        return false;
      }

      // Location type filter
      if (appliedFilters.locationType.length > 0) {
        const location = app.location?.toLowerCase() || "";
        const hasMatchingLocation = appliedFilters.locationType.some((type) => {
          if (type === "remote" && location.includes("remote")) return true;
          if (type === "hybrid" && location.includes("hybrid")) return true;
          if (
            type === "onsite" &&
            !location.includes("remote") &&
            !location.includes("hybrid")
          )
            return true;
          return false;
        });

        if (!hasMatchingLocation) return false;
      }

      return true;
    });
  }, [allApplications, appliedFilters]);

  // Status options for filter
  const statusOptions = [
    "Applied",
    "Phone Screen",
    "Interview",
    "Take Home",
    "Offer",
    "Rejected",
    "Accepted",
    "Withdrawn",
  ];

  // Location type options for filter
  const locationTypeOptions = [
    { value: "remote", label: "Remote" },
    { value: "hybrid", label: "Hybrid" },
    { value: "onsite", label: "On-site" },
  ];

  // Date range options for filter
  const dateRangeOptions = [
    { value: "all", label: "All Time" },
    { value: "week", label: "Last Week" },
    { value: "month", label: "Last Month" },
    { value: "quarter", label: "Last 3 Months" },
    { value: "year", label: "Last Year" },
  ];

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
      <div className="mb-6 bg-[#121a36]/50 backdrop-blur-sm rounded-lg border border-[#20253d]/50 p-4 flex flex-col md:flex-row gap-3 relative z-[100]">
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
        <div className="relative" ref={filterRef}>
          <button
            onClick={toggleFilters}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0c1029] border border-[#20253d] rounded-md text-gray-200 hover:bg-[#0c1029]/80 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Filter className="h-4 w-4" />
            <span>Filter</span>
            {(appliedFilters.status.length > 0 ||
              appliedFilters.locationType.length > 0 ||
              appliedFilters.dateRange !== "all") && (
              <span className="ml-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {appliedFilters.status.length +
                  appliedFilters.locationType.length +
                  (appliedFilters.dateRange !== "all" ? 1 : 0)}
              </span>
            )}
          </button>

          {/* Filter dropdown */}
          {showFilters && (
            <div className="fixed right-4 mt-2 w-72 bg-[#0c1029] border border-[#20253d] rounded-md shadow-xl z-[999]">
              <div className="p-4 border-b border-[#20253d]/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-medium">
                    Filter Applications
                  </h3>
                  <button
                    onClick={resetFilters}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Reset All
                  </button>
                </div>

                {/* Date Range Filter */}
                <div className="mb-4">
                  <h4 className="text-sm text-gray-300 mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Date Range
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {dateRangeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleFilterChange("dateRange", option.value)
                        }
                        className={`text-xs py-1 px-2 rounded ${
                          filterOptions.dateRange === option.value
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-[#121a36]/50 text-gray-300 border border-[#20253d] hover:bg-[#121a36]"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div className="mb-4">
                  <h4 className="text-sm text-gray-300 mb-2">Status</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          const newStatus = filterOptions.status.includes(
                            status
                          )
                            ? filterOptions.status.filter((s) => s !== status)
                            : [...filterOptions.status, status];
                          handleFilterChange("status", newStatus);
                        }}
                        className={`text-xs py-1 px-2 rounded flex items-center justify-between ${
                          filterOptions.status.includes(status)
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-[#121a36]/50 text-gray-300 border border-[#20253d] hover:bg-[#121a36]"
                        }`}
                      >
                        <span>{status}</span>
                        {filterOptions.status.includes(status) && (
                          <Check className="h-3 w-3" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location Type Filter */}
                <div className="mb-4">
                  <h4 className="text-sm text-gray-300 mb-2">Location Type</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {locationTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          const newLocationTypes =
                            filterOptions.locationType.includes(option.value)
                              ? filterOptions.locationType.filter(
                                  (l) => l !== option.value
                                )
                              : [...filterOptions.locationType, option.value];
                          handleFilterChange("locationType", newLocationTypes);
                        }}
                        className={`text-xs py-1 px-2 rounded flex items-center justify-between ${
                          filterOptions.locationType.includes(option.value)
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-[#121a36]/50 text-gray-300 border border-[#20253d] hover:bg-[#121a36]"
                        }`}
                      >
                        <span>{option.label}</span>
                        {filterOptions.locationType.includes(option.value) && (
                          <Check className="h-3 w-3" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3 border-t border-[#20253d]/50 flex justify-end gap-2">
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-3 py-1.5 text-xs bg-[#121a36] text-gray-300 rounded hover:bg-[#121a36]/80"
                >
                  Cancel
                </button>
                <button
                  onClick={applyFilters}
                  className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Applications timeline */}
      <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-lg border border-[#20253d]/50 overflow-hidden">
        <div className="p-4 border-b border-[#20253d]/50 flex justify-between items-center">
          <h2 className="text-lg font-medium text-white flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-400" />
            Latest Applications
          </h2>
          <span className="text-sm text-gray-400">
            {filteredApplications.length} of {results?.total || 0} applications
          </span>
        </div>

        {/* Applications list */}
        <div className="divide-y divide-[#20253d]/30">
          {!results && (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
          )}

          {results && filteredApplications.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-400 mb-2">No applications found</p>
              <p className="text-sm text-gray-500">
                {searchQuery ||
                appliedFilters.status.length > 0 ||
                appliedFilters.locationType.length > 0 ||
                appliedFilters.dateRange !== "all"
                  ? "Try adjusting your search or filters"
                  : "Check back later for new applications"}
              </p>
            </div>
          )}

          {filteredApplications.map((app, index) => (
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
                        <Image
                          src={userProfiles[app.userId].imageUrl}
                          alt={getDisplayName(app.userId)}
                          className="h-5 w-5 rounded-full mr-2 object-cover"
                          width={20}
                          height={20}
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
