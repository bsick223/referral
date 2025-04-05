"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { PlusCircle, Building, RefreshCw, Search, X } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Image from "next/image";

const LOGO_DEV_PUBLISHABLE_API_KEY =
  process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_API_KEY;

export default function ReferralsPage() {
  const { user } = useUser();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch companies for the current user
  const companies = useQuery(api.companies.listByUser, {
    userId: user?.id || "",
  });

  // Fetch referral counts per company
  const referralCounts = useQuery(api.referrals.getUserReferralsByCompany, {
    userId: user?.id || "",
  });

  // Map to easily lookup referral counts by company ID
  const companyReferralMap = new Map();
  if (referralCounts?.companiesData) {
    referralCounts.companiesData.forEach((item) => {
      companyReferralMap.set(item.companyId, item.referralCount);
    });
  }

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

  // Handle click outside to close search only if search query is empty
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSearchExpanded &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        !searchQuery // Only collapse if there's no search query
      ) {
        setIsSearchExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchExpanded, searchQuery]); // Add searchQuery as a dependency

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

  useEffect(() => {
    if (user) {
      ensureDefaultTemplate({ userId: user.id });
    }
  }, [user, ensureDefaultTemplate]);

  // Now using a different approach for the glow
  const renderProgressBar = (count: number) => {
    const percentage = Math.min((count / 5) * 100, 100);
    let color = "bg-orange-500";
    let showGlow = false;

    if (count >= 5) {
      color = "bg-blue-500";
      showGlow = true;
    } else if (count >= 3) {
      color = "bg-green-500";
    }

    return (
      <div className="w-1/3 h-1.5 rounded-full bg-[#0c1029] border border-[#20253d]/50 relative">
        <div
          className={`h-full rounded-full ${color}`}
          style={{
            width: `${percentage}%`,
            transition: "width 0.5s ease-in-out",
          }}
        ></div>
        {showGlow && (
          <div
            className="absolute inset-0 rounded-full bg-blue-500 opacity-70 blur-sm"
            style={{
              width: `${percentage}%`,
              animation: "glow 1.5s infinite alternate",
            }}
          ></div>
        )}
      </div>
    );
  };

  // Add custom animation for the glow
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      @keyframes glow {
        from {
          box-shadow: 0 0 5px rgba(59, 130, 246, 0.7);
        }
        to {
          box-shadow: 0 0 20px rgba(59, 130, 246, 1.0);
        }
      }
    `;
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  // Loading state
  if (!user || companies === undefined || referralCounts === undefined) {
    return (
      <div className="min-h-screen bg-[#090d1b] flex items-center justify-center">
        <RefreshCw className="h-10 w-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-8 px-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <h2 className="text-2xl font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-gray-300 relative z-10">
              Companies & Referrals
            </h2>
            <div className="absolute -bottom-1 left-0 h-[1px] w-full bg-gradient-to-r from-orange-500/80 via-purple-500/60 to-blue-500/40"></div>
          </div>

          <p className="text-xs text-gray-400 mt-1">
            Click on a company to manage referrals
          </p>

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
            href="/dashboard/companies/new"
            data-tour="add-company"
            className="inline-flex items-center px-4 py-2 border border-[#20253d]/50 shadow-sm text-sm font-medium text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer backdrop-blur-sm"
          >
            <PlusCircle className="h-4 w-4 sm:mr-2 text-orange-400" />
            <span className="hidden sm:inline">Add New Company</span>
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
              data-tour="add-company"
              className="inline-flex items-center px-4 py-2 border border-[#20253d]/50 shadow-sm text-sm font-medium text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer backdrop-blur-sm"
            >
              <PlusCircle className="h-4 w-4 sm:mr-2 text-orange-400" />
              <span className="hidden sm:inline">Add New Company</span>
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
            No companies match your search query &ldquo;{searchQuery}&rdquo;
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
                          src={`https://img.logo.dev/${
                            company.website
                              .replace(/^https?:\/\//, "")
                              .replace(/\/$/, "")
                              .split("/")[0]
                          }?token=${LOGO_DEV_PUBLISHABLE_API_KEY}&format=png&retina=true`}
                          alt={`${company.name} logo`}
                          width={40}
                          height={40}
                          className={`max-w-full max-h-full object-contain p-1 ${
                            company.website.toLowerCase().includes("apple.com")
                              ? "invert"
                              : ""
                          }`}
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
                              svgElement.setAttribute("stroke", "currentColor");

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
                <div className="mt-4 pt-4 border-t border-[#20253d]/50 group-hover:border-[#20253d]/70 transition-colors duration-300 flex items-center">
                  {renderProgressBar(companyReferralMap.get(company._id) || 0)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
