"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [resource, setResource] = useState<any>(null);

  // Resource data - static for now
  const resourcesData = [
    {
      id: "1",
      title: "Getting Started Guide",
      icon: "book-open",
      content:
        "This comprehensive guide will walk you through all the basic features and functionality. Perfect for new users who are just getting started with our platform.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
    {
      id: "2",
      title: "Video Tutorials",
      icon: "video",
      content:
        "Watch step-by-step video tutorials that demonstrate how to use advanced features and get the most out of our platform.",
      videoUrl: "https://www.youtube.com/embed/jNQXAC9IVRw",
    },
    {
      id: "3",
      title: "Template Library",
      icon: "folder",
      content:
        "Browse our extensive library of templates to find the perfect starting point for your project.",
      videoUrl: "https://www.youtube.com/embed/mUpPj6gvYCw",
    },
    {
      id: "4",
      title: "Best Practices",
      icon: "award",
      content:
        "Learn from industry experts about the best practices for maximizing efficiency and effectiveness when using our platform.",
      videoUrl: "https://www.youtube.com/embed/kJQP7kiw5Fk",
    },
    {
      id: "5",
      title: "API Documentation",
      icon: "code",
      content:
        "Detailed technical documentation for developers looking to integrate with our API and extend functionality.",
      videoUrl: "https://www.youtube.com/embed/9bZkp7q19f0",
    },
    {
      id: "6",
      title: "Community Forum",
      icon: "users",
      content:
        "Connect with other users, ask questions, share your experiences, and collaborate on solutions in our community forum.",
      videoUrl: "https://www.youtube.com/embed/XqZsoesa55w",
    },
  ];

  // Simulate loading and fetch resource
  useEffect(() => {
    const timer = setTimeout(() => {
      const foundResource = resourcesData.find((r) => r.id === params.id);
      setResource(foundResource || null);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [params.id]);

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
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090d1b] flex items-center justify-center">
        <RefreshCw className="h-10 w-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  // Resource not found
  if (!resource) {
    return (
      <div className="py-8 px-8">
        <div className="mb-6">
          <Link
            href="/dashboard/resources"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>Back to Resources</span>
          </Link>
        </div>
        <div className="text-center py-16 bg-[#121a36]/50 backdrop-blur-sm shadow rounded-lg border border-[#20253d]/50">
          <h3 className="mt-2 text-lg font-light text-white">
            Resource not found
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            The resource you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  // Display resource
  return (
    <div className="py-8 px-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/dashboard/resources"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Back to Resources</span>
        </Link>
      </div>

      {/* Resource header */}
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gray-800/50 rounded-md flex items-center justify-center overflow-hidden mr-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-orange-400"
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
        <div className="relative">
          <h2 className="text-2xl font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-gray-300 relative z-10">
            {resource.title}
          </h2>
          <div className="absolute -bottom-1 left-0 h-[1px] w-full bg-gradient-to-r from-orange-500/80 via-purple-500/60 to-blue-500/40"></div>
        </div>
      </div>

      {/* Resource content */}
      <div className="bg-[#121a36]/50 backdrop-blur-sm shadow rounded-lg overflow-hidden border border-[#20253d]/50">
        <div className="p-6">
          <p className="text-gray-300 mb-6">{resource.content}</p>

          {/* YouTube Video Embed */}
          <div className="mb-8">
            <div className="relative w-full pb-[56.25%] h-0 overflow-hidden rounded-md border border-[#20253d]/50 bg-black/20">
              <iframe
                src={resource.videoUrl}
                title={`${resource.title} Video`}
                className="absolute top-0 left-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* Placeholder content - this would be replaced with actual resource content */}
          <div className="space-y-6">
            <div className="bg-[#0c1029]/70 p-4 rounded-md border border-[#20253d]/50">
              <h3 className="text-lg font-light text-white mb-2">Overview</h3>
              <p className="text-gray-400">
                This is placeholder content for the {resource.title} resource.
                You can replace this with actual content specific to each
                resource.
              </p>
            </div>

            <div className="bg-[#0c1029]/70 p-4 rounded-md border border-[#20253d]/50">
              <h3 className="text-lg font-light text-white mb-2">
                Key Features
              </h3>
              <ul className="text-gray-400 list-disc pl-5 space-y-2">
                <li>Feature one description</li>
                <li>Feature two description</li>
                <li>Feature three description</li>
                <li>Feature four description</li>
              </ul>
            </div>

            <div className="bg-[#0c1029]/70 p-4 rounded-md border border-[#20253d]/50">
              <h3 className="text-lg font-light text-white mb-2">
                Getting Help
              </h3>
              <p className="text-gray-400">
                Need additional help? Contact our support team for personalized
                assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
