"use client";

import dynamic from "next/dynamic";

// Dynamically import the Leaderboard component within a client component
const Leaderboard = dynamic(() => import("./Leaderboard"), {
  ssr: false,
});

export default function LeaderboardSection() {
  return (
    <div className="relative">
      {/* Semi-transparent background with gradient fade effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0e1326]/70 via-[#121a36]/60 to-transparent rounded-2xl backdrop-blur-sm"></div>

      <div className="relative z-10 px-4 py-6 md:py-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-light text-white">
            Community Leaders
          </h2>
          <p className="mt-2 text-gray-400 text-sm md:text-base">
            Top users actively building their referral networks
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Leaderboard limit={3} hideHeader={true} />
        </div>
      </div>
    </div>
  );
}
