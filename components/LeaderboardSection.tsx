"use client";

import dynamic from "next/dynamic";

// Dynamically import the Leaderboard component within a client component
const Leaderboard = dynamic(() => import("./Leaderboard"), {
  ssr: false,
});

export default function LeaderboardSection() {
  return (
    <section className="py-12 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Our Community Leaders
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Check out our top users who are actively managing their referrals
            and building their networks.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Leaderboard limit={5} />
        </div>
      </div>
    </section>
  );
}
