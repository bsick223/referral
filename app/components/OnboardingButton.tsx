"use client";

import { HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface OnboardingButtonProps {
  startTour: () => void;
}

export default function OnboardingButton({ startTour }: OnboardingButtonProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration errors by only rendering once the component is mounted
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const handleStartTour = () => {
    console.log("OnboardingButton: Starting tour");
    startTour();
  };

  return (
    <button
      onClick={handleStartTour}
      className="fixed bottom-4 right-4 z-50 p-2 rounded-full bg-gradient-to-r from-orange-500 via-purple-500 to-blue-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)] hover:from-orange-400 hover:via-purple-400 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      aria-label="Show Onboarding Tour"
      title="Help & Tour"
    >
      <HelpCircle className="h-6 w-6" />
    </button>
  );
}
