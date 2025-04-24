"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Define a type for the resources
interface Resource {
  id: string;
  title: string;
  imagePath: string;
}

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

  // Resource data with type safety
  const resources: Resource[] = [
    { id: "7", title: "Leetcode Tracker", imagePath: "/photos/Leetcode.png" },
    {
      id: "1",
      title: "Roadmap to your first offer",
      imagePath: "/photos/Offer.png",
    },
    { id: "2", title: "Mindset", imagePath: "/photos/Mindset.png" },
    {
      id: "3",
      title: "Where to find jobs?",
      imagePath: "/photos/JobBoard.png",
    },
    {
      id: "4",
      title: "What should my Resume look like?",
      imagePath: "/photos/Resume.png",
    },
    {
      id: "5",
      title: "How to get referrals?",
      imagePath: "/photos/Networking.png",
    },
    { id: "6", title: "How to apply?", imagePath: "/photos/HowtoApply.png" },
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
            className="block bg-[#121a36]/50 backdrop-blur-sm shadow rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer border border-[#20253d]/50 group relative h-[260px]"
          >
            {/* Gradient border hover effect */}
            <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 bg-gradient-to-r from-orange-500/20 via-purple-500/20 to-blue-500/20 transition-opacity duration-300"></span>

            <div className="p-6 relative z-10 flex flex-col items-center justify-center h-full">
              {/* Resource Image */}
              <div className="w-40 h-40 mb-5 bg-gray-800/50 rounded-md flex items-center justify-center overflow-hidden">
                <Image
                  src={resource.imagePath}
                  alt={`${resource.title} icon`}
                  width={256}
                  height={256}
                  className="w-full h-full object-contain p-1"
                />
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
