"use client";

import { useEffect, useState } from "react";
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";

interface UseOnboardingTourProps {
  isNewUser: boolean;
}

export default function useOnboardingTour({
  isNewUser,
}: UseOnboardingTourProps) {
  const [tour, setTour] = useState<any>(null);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined") return;

    try {
      // Check local storage to see if user has already completed the tour
      const tourCompleted =
        localStorage.getItem("onboardingTourCompleted") === "true";

      if (tourCompleted) {
        setHasCompletedTour(true);
      }

      // Create a new tour regardless of user status
      const newTour = new Shepherd.Tour({
        defaultStepOptions: {
          cancelIcon: {
            enabled: true,
          },
          classes:
            "shepherd-theme-custom shadow-xl bg-[#090d1b] border border-[#20253d] text-white rounded-lg",
          scrollTo: true,
        },
        useModalOverlay: true,
      });

      // Add custom CSS for the tour styling
      const styleEl = document.createElement("style");
      styleEl.textContent = `
        .shepherd-theme-custom {
          max-width: 400px;
          color: white !important;
          background-color: #090d1b !important;
        }
        .shepherd-theme-custom .shepherd-header {
          background: linear-gradient(to right, rgba(249,115,22,0.2), rgba(168,85,247,0.2), rgba(59,130,246,0.2));
          border-radius: 8px 8px 0 0;
          padding: 1rem;
          background-color: #121a36 !important;
        }
        .shepherd-theme-custom .shepherd-title {
          font-size: 1.25rem;
          font-weight: 300;
          color: white;
          background: linear-gradient(to right, #fff, #f5f5f5, #e5e5e5);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .shepherd-theme-custom .shepherd-text {
          padding: 1rem;
          color: #e5e7eb !important;
          background-color: #090d1b !important;
        }
        .shepherd-theme-custom .shepherd-footer {
          padding: 0.75rem 1rem;
          border-top: 1px solid rgba(32, 37, 61, 0.7);
          background-color: #090d1b !important;
        }
        .shepherd-theme-custom .shepherd-cancel-icon {
          color: rgba(156, 163, 175, 0.7);
        }
        .shepherd-theme-custom .shepherd-cancel-icon:hover {
          color: rgba(156, 163, 175, 1);
        }
        .shepherd-theme-custom .shepherd-button-primary {
          background: linear-gradient(to right, #f97316, #a855f7, #3b82f6);
          color: white;
          border-radius: 4px;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          box-shadow: 0 0 15px rgba(249,115,22,0.3);
        }
        .shepherd-theme-custom .shepherd-button-primary:hover {
          background: linear-gradient(to right, #f97316, #a855f7, #3b82f6);
          opacity: 0.9;
        }
        .shepherd-theme-custom .shepherd-button-secondary {
          background: rgba(12, 16, 41, 0.9);
          color: rgba(209, 213, 219, 0.9);
          border: 1px solid rgba(32, 37, 61, 0.5);
          border-radius: 4px;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          margin-right: 0.5rem;
        }
        .shepherd-theme-custom .shepherd-button-secondary:hover {
          background: rgba(12, 16, 41, 1);
          color: rgba(209, 213, 219, 1);
        }
        /* Fix additional elements that might be white */
        .shepherd-element, .shepherd-content, .shepherd-text p {
          background-color: #090d1b !important;
          color: #e5e7eb !important;
        }
        /* Ensure the text we define is bright and clear */
        .shepherd-text p.text-gray-300 {
          color: #e5e7eb !important;
        }
      `;
      document.head.appendChild(styleEl);

      // Define tour steps
      newTour.addStep({
        id: "welcome",
        title: "Welcome to your Dashboard!",
        text: `<p class="text-white mb-2">We'll guide you through the main features of our platform to help you get started.</p>`,
        buttons: [
          {
            action: newTour.cancel,
            classes: "shepherd-button-secondary",
            text: "Skip Tour",
          },
          {
            action: newTour.next,
            classes: "shepherd-button-primary",
            text: "Next",
          },
        ],
      });

      newTour.addStep({
        id: "add-company",
        title: "Add Your First Company",
        text: '<p class="text-white mb-2">Start by adding a company. Click on the "Add Company" button to create your first company profile.</p>',
        attachTo: {
          element: '[data-tour="add-company"]',
          on: "bottom",
        },
        buttons: [
          {
            action: newTour.back,
            classes: "shepherd-button-secondary",
            text: "Back",
          },
          {
            action: newTour.next,
            classes: "shepherd-button-primary",
            text: "Next",
          },
        ],
      });

      newTour.addStep({
        id: "messages",
        title: "Manage Your Messages",
        text: '<p class="text-white mb-2">Create and customize message templates for different scenarios.</p>',
        attachTo: {
          element: '[data-tour="messages"]',
          on: "bottom",
        },
        buttons: [
          {
            action: newTour.back,
            classes: "shepherd-button-secondary",
            text: "Back",
          },
          {
            action: newTour.next,
            classes: "shepherd-button-primary",
            text: "Next",
          },
        ],
      });

      newTour.addStep({
        id: "leaderboard",
        title: "Check the Leaderboard",
        text: '<p class="text-white mb-2">See how you compare to others on our leaderboard.</p>',
        attachTo: {
          element: '[data-tour="leaderboard"]',
          on: "bottom",
        },
        buttons: [
          {
            action: newTour.back,
            classes: "shepherd-button-secondary",
            text: "Back",
          },
          {
            action: () => {
              localStorage.setItem("onboardingTourCompleted", "true");
              setHasCompletedTour(true);
              newTour.complete();
            },
            classes: "shepherd-button-primary",
            text: "Finish",
          },
        ],
      });

      setTour(newTour);

      return () => {
        if (newTour) {
          newTour.cancel();
        }
        // Clean up style element
        if (styleEl.parentNode) {
          styleEl.parentNode.removeChild(styleEl);
        }
      };
    } catch (error) {
      console.error("Error initializing tour:", error);
    }
  }, []); // Remove isNewUser dependency so tour is always initialized

  // Auto-start the tour if user is new and hasn't completed it
  useEffect(() => {
    if (isNewUser && !hasCompletedTour && tour) {
      // Small delay to ensure elements are rendered
      const timer = setTimeout(() => {
        try {
          tour.start();
          console.log("Auto-started tour for new user");
        } catch (error) {
          console.error("Error starting tour:", error);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isNewUser, hasCompletedTour, tour]);

  const startTour = () => {
    console.log("useOnboardingTour: startTour called, tour exists:", !!tour);
    if (tour) {
      try {
        tour.start();
        console.log("useOnboardingTour: tour started");
      } catch (error) {
        console.error("Error starting tour:", error);
      }
    }
  };

  const completeTour = () => {
    if (tour) {
      localStorage.setItem("onboardingTourCompleted", "true");
      setHasCompletedTour(true);
      tour.complete();
    }
  };

  return {
    startTour,
    completeTour,
    hasCompletedTour,
  };
}
