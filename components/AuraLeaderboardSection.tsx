"use client";

import dynamic from "next/dynamic";

// Dynamically import the AuraLeaderboard component within a client component
const AuraLeaderboard = dynamic(() => import("./AuraLeaderboard"), {
  ssr: false,
});

export default function AuraLeaderboardSection() {
  return (
    <div className="relative">
      {/* Semi-transparent background with gradient fade effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0e1326]/70 via-[#121a36]/60 to-transparent rounded-2xl backdrop-blur-sm"></div>

      <div className="relative z-10 px-4 py-6 md:py-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-light text-white">
            Aura Leaders
          </h2>
          <p className="mt-2 text-gray-400 text-sm md:text-base">
            Top users with the highest Aura points from referrals, applications,
            and offers
          </p>
          <div className="flex justify-center gap-6 mt-4 text-xs text-gray-400">
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-orange-500/60 mr-1"></span>
              <span>Referrals: 5 pts</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500/60 mr-1"></span>
              <span>Apps: 1 pt</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-purple-500/60 mr-1"></span>
              <span>Interviews: 10 pts</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500/60 mr-1"></span>
              <span>Offers: 500 pts</span>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <AuraLeaderboard limit={3} hideHeader={true} />
        </div>
      </div>
    </div>
  );
}
