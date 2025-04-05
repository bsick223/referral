"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ResourcesPage() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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

  // Resource data
  const resources = [
    { id: "1", title: "Roadmap to your first offer", icon: "book-open" },
    { id: "2", title: "Mindset", icon: "video" },
    { id: "3", title: "Where to find jobs?", icon: "folder" },
    { id: "4", title: "What should my Resume look like?", icon: "award" },
    { id: "5", title: "How to get referrals?", icon: "code" },
    { id: "6", title: "How to apply?", icon: "users" },
  ];

  // Loading state
  if (isLoading) {
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
              Resources
            </h2>
            <div className="absolute -bottom-1 left-0 h-[1px] w-full bg-gradient-to-r from-orange-500/80 via-purple-500/60 to-blue-500/40"></div>
          </div>

          <p className="text-xs text-gray-400 mt-1">
            Click on a resource to learn more
          </p>
        </div>
      </div>

      {/* Resources grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => (
          <Link
            key={resource.id}
            href={`/dashboard/resources/${resource.id}`}
            className="block bg-[#121a36]/50 backdrop-blur-sm shadow rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer border border-[#20253d]/50 group relative h-[180px]"
          >
            {/* Gradient border hover effect */}
            <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 bg-gradient-to-r from-orange-500/20 via-purple-500/20 to-blue-500/20 transition-opacity duration-300"></span>

            <div className="p-6 relative z-10 flex flex-col items-center justify-center h-full">
              {/* Resource Icon */}
              <div className="w-16 h-16 mb-4 bg-gray-800/50 rounded-md flex items-center justify-center overflow-hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-orange-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {resource.icon === "book-open" && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  )}
                  {resource.icon === "video" && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  )}
                  {resource.icon === "folder" && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  )}
                  {resource.icon === "award" && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  )}
                  {resource.icon === "code" && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  )}
                  {resource.icon === "users" && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  )}
                </svg>
              </div>
              <h3 className="text-lg font-light text-white text-center group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:via-purple-500 group-hover:to-blue-500 group-hover:text-transparent group-hover:bg-clip-text transition-all duration-300">
                {resource.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
