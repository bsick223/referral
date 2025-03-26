"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import {
  PlusCircle,
  Building,
  RefreshCw,
  MessageSquare,
  Trophy,
  Search,
  X,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import useOnboardingTour from "../hooks/useOnboardingTour";
import OnboardingButton from "../components/OnboardingButton";
import Image from "next/image";

export default function DashboardPage() {
  const { user } = useUser();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch companies for the current user
  const companies = useQuery(api.companies.listByUser, {
    userId: user?.id || "",
  });

  // Initialize seed data
  const ensureDefaultTemplate = useMutation(
    api.seedMessages.ensureDefaultTemplate
  );

  // Filter companies based on search query
  const filteredCompanies = companies
    ? [...companies]
        .sort((a, b) => a.name.localeCompare(b.name))
        .filter((company) =>
          company.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    : [];

  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSearchExpanded &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsSearchExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchExpanded]);

  // Focus input when search expands
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // Add search CSS for animation
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      .search-container {
        overflow: hidden;
        transition: all 0.3s ease;
      }
      
      .search-input {
        width: 0;
        padding: 0;
        opacity: 0;
        transition: all 0.3s ease;
      }
      
      .search-expanded {
        border: 1px solid rgba(32, 37, 61, 0.5);
      }
      
      .search-expanded .search-input {
        width: 200px;
        padding: 0.5rem 1rem;
        opacity: 1;
      }
    `;
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  // Check if user is new
  const isNewUser = companies !== undefined && companies.length === 0;

  // Debug log
  useEffect(() => {
    if (companies !== undefined) {
      console.log("User companies:", companies.length);
      console.log("Is user new?", isNewUser);
      console.log("User ID for onboarding:", user?.id || "");
    }
  }, [companies, isNewUser, user?.id]);

  // Get onboarding status directly from Convex for debugging
  const onboardingStatus = useQuery(api.userProfiles.hasCompletedOnboarding, {
    userId: user?.id || "",
  });

  // Debug log for onboarding
  useEffect(() => {
    console.log("Onboarding status from Convex:", onboardingStatus);
  }, [onboardingStatus]);

  // Initialize the onboarding tour
  const { startTour } = useOnboardingTour({
    userId: user?.id || "",
  });

  useEffect(() => {
    if (user) {
      ensureDefaultTemplate({ userId: user.id });
    }
  }, [user, ensureDefaultTemplate]);

  // Loading state
  if (!user || companies === undefined) {
    return (
      <div className="min-h-screen bg-[#090d1b] flex items-center justify-center">
        <RefreshCw className="h-10 w-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d1b] relative">
      {/* Help button to manually start tour */}
      <OnboardingButton startTour={startTour} />

      {/* Noise Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-soft-light pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          width: "200%",
          height: "200%",
          transform: "translate(-50%, -50%)",
        }}
      ></div>

      {/* Blurry background elements */}
      <div className="absolute left-0 top-0 w-1/2 h-1/2 bg-gradient-to-r from-orange-600/20 to-orange-600/5 rounded-full opacity-20 blur-[120px]"></div>
      <div className="absolute right-0 top-0 w-1/3 h-1/2 bg-blue-600/20 rounded-full opacity-20 blur-[100px]"></div>
      <div className="absolute right-1/4 bottom-0 w-1/3 h-1/3 bg-indigo-600/20 rounded-full opacity-20 blur-[80px]"></div>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <h2 className="text-2xl font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-gray-300 relative z-10">
                Dashboard
              </h2>
              <div className="absolute -bottom-1 left-0 h-[1px] w-full bg-gradient-to-r from-orange-500/80 via-purple-500/60 to-blue-500/40"></div>
            </div>

            {/* Search container */}
            <div
              className={`search-container flex items-center rounded-md bg-transparent hover:bg-[#121a36]/30 backdrop-blur-sm ml-2 relative ${
                isSearchExpanded
                  ? "search-expanded bg-[#121a36]/50 w-auto"
                  : "w-9"
              }`}
              ref={searchInputRef}
            >
              <button
                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                className="h-9 w-9 flex items-center justify-center text-gray-400 hover:text-white transition-colors focus:outline-none"
              >
                <Search className="h-4 w-4" />
              </button>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search companies..."
                className="search-input bg-transparent border-none text-gray-300 text-sm focus:outline-none"
              />

              {isSearchExpanded && searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <Link
              href="/leaderboard"
              className="inline-flex items-center px-4 py-2 border border-[#20253d]/50 shadow-sm text-sm font-medium text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer backdrop-blur-sm"
              data-tour="leaderboard"
            >
              <Trophy className="h-4 w-4 sm:mr-2 text-orange-400" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Link>
            <Link
              href="/dashboard/messages"
              className="inline-flex items-center px-4 py-2 border border-[#20253d]/50 shadow-sm text-sm font-medium text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer backdrop-blur-sm"
              data-tour="messages"
            >
              <MessageSquare className="h-4 w-4 sm:mr-2 text-orange-400" />
              <span className="hidden sm:inline">Messages</span>
            </Link>
            <Link
              href="/dashboard/companies/new"
              className="inline-flex items-center px-4 py-2 border border-[#20253d]/50 shadow-sm text-sm font-medium text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer backdrop-blur-sm"
              data-tour="add-company"
            >
              <PlusCircle className="h-4 w-4 sm:mr-2 text-orange-400" />
              <span className="hidden sm:inline">Add Company</span>
            </Link>
          </div>
        </div>

        {/* Companies grid */}
        {companies?.length === 0 ? (
          <div className="text-center py-16 bg-[#121a36]/50 backdrop-blur-sm shadow rounded-lg border border-[#20253d]/50">
            <Building className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-light text-white">
              No companies yet
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              Get started by adding your first company.
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard/companies/new"
                className="inline-flex items-center px-4 py-2 border border-[#20253d]/50 shadow-sm text-sm font-medium text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer backdrop-blur-sm"
                data-tour="empty-add-company"
              >
                <PlusCircle className="h-4 w-4 sm:mr-2 text-orange-400" />
                <span className="hidden sm:inline">Add Company</span>
              </Link>
            </div>
          </div>
        ) : filteredCompanies.length === 0 && searchQuery ? (
          <div className="text-center py-16 bg-[#121a36]/50 backdrop-blur-sm shadow rounded-lg border border-[#20253d]/50">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-light text-white">
              No matches found
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              No companies match your search query "{searchQuery}"
            </p>
            <div className="mt-6">
              <button
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center px-4 py-2 border border-[#20253d]/50 shadow-sm text-sm font-medium text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer backdrop-blur-sm"
              >
                <X className="h-4 w-4 sm:mr-2 text-orange-400" />
                <span className="hidden sm:inline">Clear Search</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCompanies.map((company) => (
              <Link
                key={company._id}
                href={`/dashboard/companies/${company._id}`}
                className="block bg-[#121a36]/50 backdrop-blur-sm shadow rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer border border-[#20253d]/50 group relative"
              >
                {/* Gradient border hover effect */}
                <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 bg-gradient-to-r from-orange-500/20 via-purple-500/20 to-blue-500/20 transition-opacity duration-300"></span>

                <div className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start">
                      {/* Company Logo */}
                      <div className="w-12 h-12 mb-3 bg-gray-800/50 rounded-md flex items-center justify-center overflow-hidden">
                        {company.website && company.website.length > 0 ? (
                          <Image
                            src={`https://logo.clearbit.com/${
                              company.website
                                .replace(/^https?:\/\//, "")
                                .replace(/\/$/, "")
                                .split("/")[0]
                            }`}
                            alt={`${company.name} logo`}
                            width={40}
                            height={40}
                            className="max-w-full max-h-full object-contain p-1"
                            onError={(e) => {
                              // Show fallback icon if logo can't be loaded
                              const target = e.target as HTMLImageElement;
                              const parent = target.parentElement;
                              if (parent) {
                                // Hide the image
                                target.style.display = "none";
                                // Create and append the SVG
                                const svgElement = document.createElementNS(
                                  "http://www.w3.org/2000/svg",
                                  "svg"
                                );
                                svgElement.setAttribute(
                                  "xmlns",
                                  "http://www.w3.org/2000/svg"
                                );
                                svgElement.setAttribute(
                                  "class",
                                  "h-6 w-6 text-orange-400"
                                );
                                svgElement.setAttribute("fill", "none");
                                svgElement.setAttribute("viewBox", "0 0 24 24");
                                svgElement.setAttribute(
                                  "stroke",
                                  "currentColor"
                                );

                                const pathElement = document.createElementNS(
                                  "http://www.w3.org/2000/svg",
                                  "path"
                                );
                                pathElement.setAttribute(
                                  "stroke-linecap",
                                  "round"
                                );
                                pathElement.setAttribute(
                                  "stroke-linejoin",
                                  "round"
                                );
                                pathElement.setAttribute("stroke-width", "2");
                                pathElement.setAttribute(
                                  "d",
                                  "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                );

                                svgElement.appendChild(pathElement);
                                parent.appendChild(svgElement);
                              }
                            }}
                          />
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-orange-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        )}
                      </div>
                      <h3 className="text-lg font-light text-white group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:via-purple-500 group-hover:to-blue-500 group-hover:text-transparent group-hover:bg-clip-text transition-all duration-300">
                        {company.name}
                      </h3>
                    </div>
                  </div>
                  {company.description && (
                    <p className="mt-2 text-sm text-gray-400 line-clamp-2">
                      {company.description}
                    </p>
                  )}
                  <div className="mt-4 pt-4 border-t border-[#20253d]/50 group-hover:border-[#20253d]/70 transition-colors duration-300 flex justify-between">
                    <div className="text-sm text-gray-400">
                      Added {new Date(company.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
