"use client";

import { HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

interface OnboardingButtonProps {
  startTour: () => void;
}

export default function OnboardingButton({ startTour }: OnboardingButtonProps) {
  const { user } = useUser();
  const [isMounted, setIsMounted] = useState(false);

  // Get the onboarding completion status
  const onboardingCompletedStatus = useQuery(
    api.userProfiles.hasCompletedOnboarding,
    {
      userId: user?.id || "",
    }
  );

  // Only consider onboarding completed if explicitly true
  const onboardingCompleted = onboardingCompletedStatus === true;

  const [showAnimation, setShowAnimation] = useState(false);

  // Prevent hydration errors by only rendering once the component is mounted
  useEffect(() => {
    setIsMounted(true);

    // Only show animation if onboarding is explicitly false
    if (onboardingCompletedStatus === false) {
      setShowAnimation(true);

      // Disable animation after 10 seconds
      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [onboardingCompletedStatus]);

  if (!isMounted) return null;

  const handleStartTour = () => {
    console.log("OnboardingButton: Starting tour");
    startTour();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center space-x-2">
      <div
        className={`${
          showAnimation ? "animate-pulse opacity-100" : "opacity-0"
        } transition-opacity duration-500 bg-[#121a36]/90 text-white px-3 py-2 rounded-lg shadow-md`}
      >
        Need help? Take the tour
      </div>
      <button
        onClick={handleStartTour}
        className={`${
          onboardingCompleted
            ? "p-2 bg-gray-600 hover:bg-gray-500"
            : `p-3 bg-gradient-to-r from-orange-500 via-purple-500 to-blue-600 hover:from-orange-400 hover:via-purple-400 hover:to-blue-500 shadow-[0_0_15px_rgba(249,115,22,0.5)] ${
                showAnimation ? "animate-bounce" : ""
              }`
        } rounded-full text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        aria-label="Show Onboarding Tour"
        title="Help & Tour"
      >
        <HelpCircle
          className={`${onboardingCompleted ? "h-5 w-5" : "h-6 w-6"}`}
        />
      </button>
    </div>
  );
}
