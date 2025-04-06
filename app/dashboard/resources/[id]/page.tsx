"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw, ChevronLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Define a type for the resources
interface Resource {
  id: string;
  title: string;
  imagePath: string;
  content: string;
  videoUrl: string;
}

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [resource, setResource] = useState<Resource | null>(null);

  // Resource data - static for now
  const resourcesData: Resource[] = [
    {
      id: "1",
      title: "Roadmap to your first offer",
      imagePath: "/photos/Offer.png",
      content:
        "This comprehensive guide will walk you through all the basic features and functionality. Perfect for new users who are just getting started with our platform.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Replace with actual YouTube video ID
    },
    {
      id: "2",
      title: "Mindset",
      imagePath: "/photos/Mindset.png",
      content:
        "Watch step-by-step video tutorials that demonstrate how to use advanced features and get the most out of our platform.",
      videoUrl: "https://www.youtube.com/embed/jNQXAC9IVRw", // Replace with actual YouTube video ID
    },
    {
      id: "3",
      title: "Where to find jobs?",
      imagePath: "/photos/JobBoard.png",
      content:
        "Browse our extensive library of templates to find the perfect starting point for your project.",
      videoUrl: "https://www.youtube.com/embed/mUpPj6gvYCw", // Replace with actual YouTube video ID
    },
    {
      id: "4",
      title: "What should my Resume look like?",
      imagePath: "/photos/Resume.png",
      content:
        "Learn from industry experts about the best practices for maximizing efficiency and effectiveness when using our platform.",
      videoUrl: "https://www.youtube.com/embed/kJQP7kiw5Fk", // Replace with actual YouTube video ID
    },
    {
      id: "5",
      title: "How to get referrals?",
      imagePath: "/photos/Networking.png",
      content:
        "Detailed technical documentation for developers looking to integrate with our API and extend functionality.",
      videoUrl: "https://www.youtube.com/embed/9bZkp7q19f0", // Replace with actual YouTube video ID
    },
    {
      id: "6",
      title: "How to apply?",
      imagePath: "/photos/HowtoApply.png",
      content:
        "Connect with other users, ask questions, share your experiences, and collaborate on solutions in our community forum.",
      videoUrl: "https://www.youtube.com/embed/XqZsoesa55w", // Replace with actual YouTube video ID
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

          {/* Additional content */}
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
