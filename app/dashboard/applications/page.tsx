"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  RefreshCw,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import Link from "next/link";

// Define application status types
const APPLICATION_STATUSES = [
  { id: "applied", name: "Applied", color: "bg-blue-500" },
  { id: "screening", name: "Screening", color: "bg-purple-500" },
  { id: "interview", name: "Interview", color: "bg-indigo-500" },
  { id: "assessment", name: "Assessment", color: "bg-cyan-500" },
  { id: "final", name: "Final Round", color: "bg-emerald-500" },
  { id: "offer", name: "Offer", color: "bg-green-500" },
  { id: "rejected", name: "Rejected", color: "bg-red-500" },
];

// Temporary mock data - will be replaced with actual data from Convex
const MOCK_APPLICATIONS = [
  {
    id: "1",
    companyName: "Tech Solutions Inc.",
    position: "Frontend Developer",
    status: "applied",
    dateApplied: "2023-08-15",
    notes: "Applied through company website",
  },
  {
    id: "2",
    companyName: "InnovateCorp",
    position: "Full Stack Engineer",
    status: "screening",
    dateApplied: "2023-08-10",
    notes: "HR screening scheduled for next week",
  },
  {
    id: "3",
    companyName: "Digital Labs",
    position: "React Developer",
    status: "interview",
    dateApplied: "2023-08-05",
    notes: "Technical interview scheduled with team lead",
  },
  {
    id: "4",
    companyName: "Future Systems",
    position: "Software Engineer",
    status: "offer",
    dateApplied: "2023-07-20",
    notes: "Received offer letter, need to negotiate salary",
  },
];

export default function ApplicationsPage() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [applications, setApplications] = useState(MOCK_APPLICATIONS);

  // Horizontal scrolling functionality
  const scrollContainer = (direction: "left" | "right") => {
    const container = document.getElementById("board-container");
    if (container) {
      const scrollAmount = 300;
      if (direction === "left") {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  // Function to handle drag-and-drop (to be implemented)
  const handleDragStart = (e: React.DragEvent, applicationId: string) => {
    e.dataTransfer.setData("applicationId", applicationId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const applicationId = e.dataTransfer.getData("applicationId");

    // Update application status
    const updatedApplications = applications.map((app) => {
      if (app.id === applicationId) {
        return { ...app, status: targetStatus };
      }
      return app;
    });

    setApplications(updatedApplications);
  };

  // Filter applications based on search query
  const filteredApplications = applications.filter(
    (app) =>
      app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading state
  if (!user) {
    return (
      <div className="min-h-screen bg-[#090d1b] flex items-center justify-center">
        <RefreshCw className="h-10 w-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d1b] relative">
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
      <div className="absolute left-0 top-0 w-1/2 h-1/2 bg-gradient-to-r from-blue-600/20 to-blue-600/5 rounded-full opacity-20 blur-[120px]"></div>
      <div className="absolute right-0 top-0 w-1/3 h-1/2 bg-purple-600/20 rounded-full opacity-20 blur-[100px]"></div>
      <div className="absolute right-1/4 bottom-0 w-1/3 h-1/3 bg-indigo-600/20 rounded-full opacity-20 blur-[80px]"></div>

      {/* Main content */}
      <main className="relative z-10 max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <h2 className="text-2xl font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-gray-300 relative z-10">
                Job Applications
              </h2>
              <div className="absolute -bottom-1 left-0 h-[1px] w-full bg-gradient-to-r from-blue-500/80 via-purple-500/60 to-indigo-500/40"></div>
            </div>

            {/* Search input */}
            <div className="ml-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-[#20253d]/50 rounded-md leading-5 bg-[#121a36]/50 text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-[#20253d]/50 shadow-sm text-sm font-medium text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer backdrop-blur-sm"
            >
              <ChevronLeft className="h-4 w-4 mr-2 text-blue-400" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/applications/new"
              className="inline-flex items-center px-4 py-2 border border-[#20253d]/50 shadow-sm text-sm font-medium text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer backdrop-blur-sm"
            >
              <Plus className="h-4 w-4 mr-2 text-blue-400" />
              New Application
            </Link>
          </div>
        </div>

        {/* Board controls - horizontal scroll buttons */}
        <div className="flex justify-between items-center mb-4">
          <button
            className="p-2 rounded-full bg-[#121a36]/70 border border-[#20253d]/50 text-gray-300 hover:bg-[#121a36] focus:outline-none"
            onClick={() => scrollContainer("left")}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            className="p-2 rounded-full bg-[#121a36]/70 border border-[#20253d]/50 text-gray-300 hover:bg-[#121a36] focus:outline-none"
            onClick={() => scrollContainer("right")}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Trello-like Board */}
        <div
          id="board-container"
          className="flex overflow-x-auto pb-6 space-x-4 hide-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Status Columns */}
          {APPLICATION_STATUSES.map((status) => (
            <div
              key={status.id}
              className="flex-shrink-0 w-80 bg-[#121a36]/50 backdrop-blur-sm rounded-lg border border-[#20253d]/50 overflow-hidden"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status.id)}
            >
              {/* Column Header */}
              <div
                className={`px-4 py-3 ${status.color}/20 border-b border-[#20253d]/50 flex items-center justify-between`}
              >
                <div className="flex items-center">
                  <div
                    className={`h-3 w-3 rounded-full ${status.color} mr-2`}
                  ></div>
                  <h3 className="font-medium text-gray-200">{status.name}</h3>
                </div>
                <span className="text-sm text-gray-400 bg-[#0c1029]/50 px-2 py-0.5 rounded-full">
                  {
                    filteredApplications.filter(
                      (app) => app.status === status.id
                    ).length
                  }
                </span>
              </div>

              {/* Cards */}
              <div className="p-2 h-[calc(100vh-15rem)] overflow-y-auto">
                {filteredApplications
                  .filter((app) => app.status === status.id)
                  .map((application) => (
                    <div
                      key={application.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, application.id)}
                      className="mb-2 p-3 bg-[#0c1029]/80 rounded-md border border-[#20253d]/50 cursor-pointer hover:shadow-md hover:border-[#20253d] transition-all duration-200"
                    >
                      <h4 className="text-sm font-medium text-gray-200">
                        {application.position}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        {application.companyName}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          Applied: {application.dateApplied}
                        </span>
                      </div>
                      {application.notes && (
                        <p className="mt-2 text-xs text-gray-400 border-t border-[#20253d]/30 pt-2">
                          {application.notes}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add custom CSS for hiding scrollbars */}
        <style jsx global>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </main>
    </div>
  );
}
