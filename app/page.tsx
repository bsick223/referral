import Link from "next/link";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import AuraLeaderboardSection from "@/components/AuraLeaderboardSection";
import DataVisualizationBackground from "@/components/ParticleBackground";

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

      {/* Interactive Three.js Data Visualization Background */}
      <DataVisualizationBackground />

      {/* Main content */}
      <div className="container mx-auto px-4 pt-4 md:pt-6 pb-24 md:pb-32 relative z-20">
        <div className="w-full max-w-5xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-light text-white mb-4 leading-tight italic">
            <span className="text-white font-normal">
              Track Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-purple-400 to-blue-400 font-semibold">
                Job Applications <span className="text-white">&</span> Referrals
              </span>{" "}
              <span className="sparkle-container">
                Effortlessly
                <span className="sparkle sparkle-1"></span>
                <span className="sparkle sparkle-2"></span>
                <span className="sparkle sparkle-3"></span>
                <span className="sparkle sparkle-4"></span>
                <span className="sparkle sparkle-5"></span>
                <span className="sparkle sparkle-6"></span>
                <span className="sparkle sparkle-7"></span>
                <span className="sparkle sparkle-8"></span>
                <span className="sparkle sparkle-9"></span>
                <span className="sparkle sparkle-10"></span>
              </span>
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-2xl text-gray-300 max-w-[100%] md:max-w-full mx-auto mb-2 leading-relaxed px-2 md:px-4">
            Turn the grind into a game. Boost your chances of landing interviews
            by{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-purple-400 to-blue-400 font-semibold">
              4x
            </span>
          </p>

          {/* YouTube Video Embed */}
          <div className="max-w-2xl mx-auto mb-16 rounded-xl overflow-hidden shadow-2xl shadow-blue-900/20 relative aspect-video">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/MX8eeYRFIFg?si=lJEcO05_9066RJJg&autoplay=1&mute=1&rel=0&modestbranding=1&controls=0&loop=1&playlist=MX8eeYRFIFg"
              title="Product Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              style={{
                objectFit: "cover",
                transform: "scale(1.00)",
                transformOrigin: "center",
              }}
            ></iframe>
          </div>

          {/* CTA Button */}
          <div className="mb-16">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-8 py-3 text-base font-medium rounded-full bg-gradient-to-r from-orange-600/90 via-purple-600/80 to-blue-700/90 text-white hover:from-orange-500 hover:via-purple-500 hover:to-blue-600 transition-colors hover:shadow-xl backdrop-blur-sm shadow-[0_0_15px_rgba(249,115,22,0.5)] cursor-pointer">
                  Unlock Your Network{" "}
                  <ArrowRight className="ml-2 inline h-4 w-4" />
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

          <p className="text-base sm:text-lg md:text-2xl text-gray-300 max-w-[100%] md:max-w-full mx-auto mb-8 leading-relaxed px-2 md:px-4">
            Level up your progress with points and leaderboards.
          </p>

          {/* Semi-transparent Leaderboard */}
          <div className="mb-16 opacity-90 backdrop-blur-sm">
            <AuraLeaderboardSection />
          </div>

          {/* Footer info */}
          <div className="mt-16 md:grid md:grid-cols-2 gap-8 text-left text-sm text-gray-400 space-y-6 md:space-y-0">
            <div>
              <p className="mb-2 text-white font-medium">Statistics</p>
              <ul className="space-y-2">
                <li>
                  • Referred candidates: 28.5% hire rate vs 2.7% for
                  non-referred.
                </li>
                <li>• 4x more likely to get an interview.</li>
                <li>• 40% higher probability of being recruited.</li>
              </ul>
              <p className="mt-2 italic opacity-45">
                JobStick, Apollo Technical
              </p>
            </div>
            <div>
              <p className="mb-2 text-white font-medium">
                Early Bird, Gets the Job
              </p>
              <ul className="space-y-2">
                <li>• Be the first to apply.</li>
                <li>• Have many referrals ready.</li>
              </ul>
            </div>
          </div>

          {/* Privacy Policy Link */}
          <div className="mt-12 text-center">
            <Link
              href="/privacy"
              className="text-gray-500 hover:text-gray-300 text-xs opacity-40 transition-opacity hover:opacity-80"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-500 mx-2 text-xs opacity-40">/</span>
            <Link
              href="/attributions"
              className="text-gray-500 hover:text-gray-300 text-xs opacity-40 transition-opacity hover:opacity-80"
            >
              Attributions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
