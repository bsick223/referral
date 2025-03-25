import Link from "next/link";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import LeaderboardSection from "@/components/LeaderboardSection";
import ParticleBackground from "@/components/ParticleBackground";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#090d1b] font-sans relative overflow-hidden">
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

      {/* Interactive Three.js Particle Background */}
      <ParticleBackground />

      {/* Main content */}
      <div className="container mx-auto px-4 pt-16 md:pt-24 pb-24 md:pb-32 relative z-20">
        <div className="w-full max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-light text-white mb-6 leading-tight italic">
            <span className="text-[#e2e2e2]">a new-era of</span>
            <br />
            <span className="text-white font-normal">referrals arriving.</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-16 leading-relaxed">
            Never lose track of who offered to refer you again.
          </p>

          {/* CTA Button */}
          <div className="mb-24">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-8 py-3 text-base font-medium rounded-full bg-gradient-to-r from-orange-600/90 via-purple-600/80 to-blue-700/90 text-white hover:from-orange-500 hover:via-purple-500 hover:to-blue-600 transition-colors hover:shadow-xl backdrop-blur-sm shadow-[0_0_15px_rgba(249,115,22,0.5)] cursor-pointer">
                  Get Started <ArrowRight className="ml-2 inline h-4 w-4" />
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="px-8 py-3 text-base font-medium rounded-full bg-gradient-to-r from-orange-600/90 via-purple-600/80 to-blue-700/90 text-white hover:from-orange-500 hover:via-purple-500 hover:to-blue-600 transition-colors hover:shadow-xl backdrop-blur-sm inline-flex items-center shadow-[0_0_15px_rgba(249,115,22,0.5)]"
              >
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </SignedIn>
          </div>

          {/* Semi-transparent Leaderboard */}
          <div className="mb-16 opacity-90 backdrop-blur-sm">
            <LeaderboardSection />
          </div>

          {/* Footer info */}
          <div className="mt-16 grid grid-cols-2 gap-8 text-left text-sm text-gray-400">
            <div>
              <p className="mb-2 text-white">Transactions in Milliseconds</p>
              <p>Effortless connection with referrers.</p>
              <p>We do the introduction work for you.</p>
            </div>
            <div>
              <p className="mb-2 text-white">Precision! One hundred %</p>
              <p>No human errors.</p>
              <p>No complex application forms.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
