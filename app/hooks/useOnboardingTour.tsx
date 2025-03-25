"use client";

import { useEffect, useState } from "react";
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface UseOnboardingTourProps {
  userId: string;
}

// Explicitly disable eslint for these specific lines
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ShepherdTour = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ShepherdStep = any;

export default function useOnboardingTour({ userId }: UseOnboardingTourProps) {
  const [tour, setTour] = useState<ShepherdTour>(null);

  // Use Convex to check if user has completed onboarding
  const hasCompletedOnboarding = useQuery(
    api.userProfiles.hasCompletedOnboarding,
    {
      userId,
    }
  );

  // Use Convex mutation to mark onboarding as completed
  const markOnboardingCompleted = useMutation(
    api.userProfiles.markOnboardingCompleted
  );

  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined") return;

    try {
      // Create a new tour regardless of user status
      const newTour = new Shepherd.Tour({
        defaultStepOptions: {
          cancelIcon: {
            enabled: true,
          },
          classes:
            "shepherd-theme-custom shadow-xl bg-[#090d1b] border border-[#20253d] text-white rounded-lg",
          scrollTo: false,
        },
        useModalOverlay: true,
      });

      // Add custom CSS for the tour styling
      const styleEl = document.createElement("style");
      styleEl.textContent = `
        .shepherd-theme-custom {
          max-width: 400px;
          color: white !important;
          background-color: #0c1333 !important; /* Slightly lighter background */
        }
        .shepherd-theme-custom .shepherd-header {
          background: linear-gradient(to right, rgba(249,115,22,0.3), rgba(168,85,247,0.3), rgba(59,130,246,0.3));
          border-radius: 8px 8px 0 0;
          padding: 1rem;
          background-color: #152047 !important; /* Lighter header */
        }
        .shepherd-theme-custom .shepherd-title {
          font-size: 1.25rem;
          font-weight: 300;
          color: white;
          background: linear-gradient(to right, #fff, #f5f5f5, #e5e5e5);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: brightness(1.2); /* Brighter text */
        }
        .shepherd-theme-custom .shepherd-text {
          padding: 1rem;
          color: #ffffff !important; /* Pure white text for better visibility */
          background-color: #0c1333 !important;
          font-size: 1.05rem; /* Slightly larger text */
        }
        .shepherd-theme-custom .shepherd-footer {
          padding: 0.75rem 1rem;
          border-top: 1px solid rgba(64, 78, 128, 0.7); /* Lighter border */
          background-color: #0c1333 !important;
        }
        .shepherd-theme-custom .shepherd-cancel-icon {
          color: rgba(220, 220, 220, 0.8); /* Brighter cancel icon */
        }
        .shepherd-theme-custom .shepherd-cancel-icon:hover {
          color: rgba(255, 255, 255, 1);
        }
        .shepherd-theme-custom .shepherd-button-primary {
          background: linear-gradient(to right, #ff8534, #b662ff, #4d94ff); /* Brighter gradient */
          color: white;
          border-radius: 4px;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          box-shadow: 0 0 15px rgba(249,115,22,0.5); /* More glow */
        }
        .shepherd-theme-custom .shepherd-button-primary:hover {
          background: linear-gradient(to right, #ff9d5c, #c77dff, #6ba5ff); /* Even brighter on hover */
          opacity: 1;
        }
        .shepherd-theme-custom .shepherd-button-secondary {
          background: rgba(20, 26, 58, 0.95);
          color: rgba(230, 230, 230, 0.95); /* Brighter text */
          border: 1px solid rgba(64, 78, 128, 0.7); /* Lighter border */
          border-radius: 4px;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          margin-right: 0.5rem;
        }
        .shepherd-theme-custom .shepherd-button-secondary:hover {
          background: rgba(25, 32, 65, 1);
          color: rgba(255, 255, 255, 1);
        }
        /* Fix additional elements that might be white */
        .shepherd-element, .shepherd-content, .shepherd-text p {
          background-color: #0c1333 !important;
          color: #ffffff !important;
        }
        /* Ensure the text we define is bright and clear */
        .shepherd-text p.text-white {
          color: #ffffff !important;
          font-weight: 400 !important;
          line-height: 1.5 !important;
        }
        /* Add a subtle highlight to the current element being pointed to */
        .shepherd-highlighted {
          box-shadow: 0 0 10px 3px rgba(249,115,22,0.5) !important;
          z-index: 10000 !important;
        }
      `;
      document.head.appendChild(styleEl);

      // Helper function for better scrolling that accounts for the header
      const scrollToElement = (element: HTMLElement | null) => {
        if (!element) return;

        const header = document.querySelector("header");
        const headerHeight = header ? header.offsetHeight + 16 : 80;

        const elementRect = element.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.pageYOffset;
        const middle =
          absoluteElementTop - window.innerHeight / 2 + elementRect.height / 2;
        const scrollPosition = middle - headerHeight;

        window.scrollTo({
          top: Math.max(0, scrollPosition),
          behavior: "smooth",
        });
      };

      // Helper function to handle common step setup
      const setupStep = (step: ShepherdStep) => {
        step.on("show", () => {
          // Wait for DOM to update
          setTimeout(() => {
            // Scroll to better position the step
            const stepElement = document.querySelector(".shepherd-element");
            scrollToElement(stepElement as HTMLElement);

            // Add highlight to the target element
            if (step.options.attachTo) {
              const targetElement = document.querySelector(
                step.options.attachTo.element
              );
              if (targetElement) {
                // Add custom highlight effect
                targetElement.classList.add("shepherd-highlighted");

                // Also scroll to make the target element visible
                scrollToElement(targetElement as HTMLElement);
              }
            }
          }, 100); // Slightly longer delay to ensure DOM is ready
        });

        step.on("hide", () => {
          // Remove highlight from the target element when step is hidden
          if (step.options.attachTo) {
            const targetElement = document.querySelector(
              step.options.attachTo.element
            );
            if (targetElement) {
              targetElement.classList.remove("shepherd-highlighted");
            }
          }
        });
      };

      // Define tour steps with custom positioning
      newTour.addStep({
        id: "welcome",
        title: "Welcome to your Dashboard!",
        text: `<p class="text-white mb-2">We'll guide you through the main features of our platform to help you get started.</p>`,
        buttons: [
          {
            action: () => {
              // Mark onboarding as skipped in Convex
              markOnboardingCompleted({ userId });
              newTour.cancel();
            },
            classes: "shepherd-button-secondary",
            text: "Skip Tour",
          },
          {
            action: newTour.next,
            classes: "shepherd-button-primary",
            text: "Next",
          },
        ],
        when: {
          show: () => {
            // For welcome step, scroll to top of the page with slight offset for header
            setTimeout(() => {
              const header = document.querySelector("header");
              const headerHeight = header ? header.offsetHeight : 0;
              window.scrollTo({
                top: headerHeight + 10,
                behavior: "smooth",
              });
            }, 100);
          },
        },
      });

      const addCompanyStep = newTour.addStep({
        id: "add-company",
        title: "Add Your First Company",
        text: '<p class="text-white mb-2">Start by adding a company. Click on the "Add Company" button to create your first company profile.</p>',
        attachTo: {
          element: '[data-tour="add-company"]',
          on: "bottom-start",
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

      setupStep(addCompanyStep);

      const messagesStep = newTour.addStep({
        id: "messages",
        title: "Manage Your Messages",
        text: '<p class="text-white mb-2">Create and customize message templates for different scenarios.</p>',
        attachTo: {
          element: '[data-tour="messages"]',
          on: "bottom-start",
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

      setupStep(messagesStep);

      const leaderboardStep = newTour.addStep({
        id: "leaderboard",
        title: "Check the Leaderboard",
        text: '<p class="text-white mb-2">See how you compare to others on our leaderboard.</p>',
        attachTo: {
          element: '[data-tour="leaderboard"]',
          on: "bottom-start",
        },
        buttons: [
          {
            action: newTour.back,
            classes: "shepherd-button-secondary",
            text: "Back",
          },
          {
            action: () => {
              // Mark onboarding as completed in Convex
              markOnboardingCompleted({ userId });
              newTour.complete();
            },
            classes: "shepherd-button-primary",
            text: "Finish",
          },
        ],
      });

      setupStep(leaderboardStep);

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
  }, [userId, markOnboardingCompleted]); // Add dependencies

  // Auto-start the tour if user hasn't completed onboarding
  useEffect(() => {
    // Only execute on client side and when tour is initialized
    if (typeof window === "undefined" || !tour) return;

    // The only condition: auto-start unless explicitly completed
    // The hasCompletedOnboarding will be undefined while loading, which is fine
    if (hasCompletedOnboarding !== true) {
      console.log("Auto-starting tour as onboarding not completed yet");
      console.log("Current onboarding status:", hasCompletedOnboarding);

      // Longer delay to ensure elements are fully rendered and styled
      const timer = setTimeout(() => {
        try {
          // Check if DOM elements exist first
          const addCompanyElement = document.querySelector(
            '[data-tour="add-company"]'
          );
          const messagesElement = document.querySelector(
            '[data-tour="messages"]'
          );
          const leaderboardElement = document.querySelector(
            '[data-tour="leaderboard"]'
          );

          console.log("Tour elements found?", {
            addCompany: !!addCompanyElement,
            messages: !!messagesElement,
            leaderboard: !!leaderboardElement,
          });

          if (addCompanyElement && messagesElement && leaderboardElement) {
            // Reset scroll position before starting tour
            window.scrollTo(0, 0);

            // Small additional delay to ensure scroll is complete
            setTimeout(() => {
              tour.start();
              console.log("Auto-started tour - onboarding not completed");
            }, 200);
          } else {
            console.warn(
              "Could not start tour - some elements were not found in DOM"
            );
          }
        } catch (error) {
          console.error("Error starting tour:", error);
        }
      }, 2500); // Increased delay to ensure everything is fully loaded

      return () => clearTimeout(timer);
    } else {
      console.log("Not auto-starting tour - onboarding already completed");
    }
  }, [hasCompletedOnboarding, tour]);

  const startTour = () => {
    console.log("useOnboardingTour: startTour called, tour exists:", !!tour);
    if (tour) {
      try {
        // Start the tour
        tour.start();
        console.log("useOnboardingTour: tour started manually");
      } catch (error) {
        console.error("Error starting tour:", error);
      }
    }
  };

  const completeTour = () => {
    if (tour) {
      // Mark onboarding as completed in Convex
      markOnboardingCompleted({ userId });
      tour.complete();
    }
  };

  return {
    startTour,
    completeTour,
    hasCompletedOnboarding: hasCompletedOnboarding === true,
  };
}
