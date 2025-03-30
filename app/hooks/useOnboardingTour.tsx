"use client";

import { useEffect, useState } from "react";
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePathname, useRouter } from "next/navigation";

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
  const pathname = usePathname();
  const router = useRouter();

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

      // Navigation routes for each step
      const stepRoutes = {
        applications: "/dashboard/applications",
        referrals: "/dashboard/referrals",
        messages: "/dashboard/messages",
        settings: "/settings",
        leaderboard: "/leaderboard",
      };

      // Helper function to navigate to the correct tab for a step
      const navigateToStepRoute = async (stepId: string): Promise<boolean> => {
        // Store the current step ID and tour state in sessionStorage
        window.sessionStorage.setItem("currentTourStep", stepId);
        window.sessionStorage.setItem("tourActive", "true");

        // Only navigate if we have a route for this step
        if (stepId in stepRoutes) {
          const route = stepRoutes[stepId as keyof typeof stepRoutes];

          // Check if we're already on this route
          if (pathname !== route) {
            console.log(`Navigating to ${route} for step ${stepId}`);

            // Navigate using the router
            router.push(route);

            // Return true to indicate navigation occurred
            return true;
          }
        }

        // Return false if no navigation was needed
        return false;
      };

      // Helper function to wait for a specific element to appear in the DOM
      const waitForElement = (
        selector: string,
        timeout = 5000
      ): Promise<HTMLElement | null> => {
        return new Promise((resolve) => {
          // Check if element already exists
          const element = document.querySelector(selector) as HTMLElement;
          if (element) {
            return resolve(element);
          }

          // Set a timeout to avoid waiting forever
          const timeoutId = setTimeout(() => {
            observer.disconnect();
            console.warn(`Timeout waiting for element: ${selector}`);
            resolve(null);
          }, timeout);

          // Create an observer to watch for DOM changes
          const observer = new MutationObserver((mutations) => {
            const element = document.querySelector(selector) as HTMLElement;
            if (element) {
              clearTimeout(timeoutId);
              observer.disconnect();
              resolve(element);
            }
          });

          // Start observing
          observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["id", "class"],
          });
        });
      };

      // Main function to setup each step with proper navigation and element detection
      const setupStep = (step: ShepherdStep) => {
        step.on("show", async () => {
          const stepId = step.id;
          console.log(`Showing step: ${stepId}`);

          // Store exact step we're on to enable precise recovery
          window.sessionStorage.setItem(
            "exactTourStep",
            String(tour.steps.indexOf(step))
          );

          // If navigation is required for this step, handle it
          const didNavigate = await navigateToStepRoute(stepId);

          // If we navigated, give time for the new page to load
          if (didNavigate) {
            // No need for further actions since page will reload and resume logic will trigger
            return;
          }

          // Now look for the target element
          if (step.options.attachTo) {
            const targetSelector = step.options.attachTo.element;
            console.log(`Looking for element: ${targetSelector}`);

            // Try multiple times with increasing delay to find the element
            let targetElement = null;
            for (let attempt = 0; attempt < 5; attempt++) {
              targetElement = document.querySelector(
                targetSelector
              ) as HTMLElement;
              if (targetElement) break;

              // Wait before next attempt (increasing delays: 100ms, 200ms, 400ms, 800ms, 1600ms)
              await new Promise((resolve) =>
                setTimeout(resolve, 100 * Math.pow(2, attempt))
              );
            }

            // If element still not found after retries, try waiting for DOM changes
            if (!targetElement) {
              console.log(
                `Element not found after retries, waiting for DOM changes: ${targetSelector}`
              );
              targetElement = await waitForElement(targetSelector, 3000);
            }

            if (targetElement) {
              console.log(`Found element: ${targetSelector}`);

              // Add highlight
              targetElement.classList.add("shepherd-highlighted");

              // Scroll to the element
              scrollToElement(targetElement);
            } else {
              console.warn(
                `Element not found after waiting: ${targetSelector}`
              );
              console.log(
                "Available data-tour elements:",
                Array.from(document.querySelectorAll("[data-tour]")).map((el) =>
                  el.getAttribute("data-tour")
                )
              );
              console.log(
                "Available data-tab elements:",
                Array.from(document.querySelectorAll("[data-tab]")).map((el) =>
                  el.getAttribute("data-tab")
                )
              );

              // Auto-advance if element can't be found
              setTimeout(() => {
                if (tour) {
                  console.log(
                    `Auto-advancing past step ${stepId} due to missing element`
                  );
                  tour.next();
                }
              }, 2000);
            }
          }

          // Also scroll the tour element into view
          setTimeout(() => {
            const tourElement = document.querySelector(".shepherd-element");
            scrollToElement(tourElement as HTMLElement);
          }, 200);
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

      // Welcome step - doesn't need tab navigation
      newTour.addStep({
        id: "welcome",
        title: "Welcome to your Dashboard!",
        text: `<p class="text-white mb-2">Welcome to dashboard! Be sure to view the resources to get the most out of app tracking. <strong>Pro-tip:</strong> Ask your referral for the referral BEFORE applying to a job, or else you won't be able to get a referral.</p>`,
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
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          },
        },
      });

      // Applications step
      const applicationsStep = newTour.addStep({
        id: "applications",
        title: "Applications Tab",
        text: '<p class="text-white mb-2">Create a new application and drag and drop them through the pipeline to track your progress.</p>',
        attachTo: {
          element: '[data-tab="applications"]',
          on: "right",
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

      setupStep(applicationsStep);

      // Referrals step
      const referralsStep = newTour.addStep({
        id: "referrals",
        title: "Track Your Referrals",
        text: '<p class="text-white mb-2">To track your referrals, add a company first then try to reach your goal of 5 confirmations of your referral.</p>',
        attachTo: {
          element: '[data-tab="referrals"]',
          on: "right",
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

      setupStep(referralsStep);

      // After reaching referrals page, point to the Add Company button
      const addCompanyStep = newTour.addStep({
        id: "add-company",
        title: "Add a Company",
        text: '<p class="text-white mb-2">Click here to add a company when you want to track referrals for a specific organization.</p>',
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

      setupStep(addCompanyStep);

      // Messages step
      const messagesStep = newTour.addStep({
        id: "messages",
        title: "Message Templates",
        text: '<p class="text-white mb-2">Create message templates for reaching out to people. These templates will help you save time and be consistent.</p>',
        attachTo: {
          element: '[data-tab="messages"]',
          on: "right",
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

      // Settings step
      const settingsStep = newTour.addStep({
        id: "settings",
        title: "Settings",
        text: '<p class="text-white mb-2">Update your profile, privacy settings, and reach out for feedback in the settings page.</p>',
        attachTo: {
          element: '[data-tab="settings"]',
          on: "right",
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

      setupStep(settingsStep);

      // Leaderboard step
      const leaderboardStep = newTour.addStep({
        id: "leaderboard",
        title: "Leaderboard",
        text: '<p class="text-white mb-2">This is where you can see how you compare with others. Compete and improve together!</p>',
        attachTo: {
          element: '[data-tab="leaderboard"]',
          on: "right",
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

      setupStep(leaderboardStep);

      // Thank you step
      const thankYouStep = newTour.addStep({
        id: "thank-you",
        title: "Thank You!",
        text: `<p class="text-white mb-2">This is one of the best ways to track applications, this process is similar to how businesses track leads and nurture them to become sales. In your case, job offers. Best of luck and see you on the score board!</p>`,
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

      setupStep(thankYouStep);

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
  }, [userId, markOnboardingCompleted, pathname, router]);

  // Auto-start the tour if user hasn't completed onboarding
  useEffect(() => {
    // Only execute on client side and when tour is initialized
    if (typeof window === "undefined" || !tour) return;

    // Check if we need to resume from a specific step after navigation
    const resumeStep = window.sessionStorage.getItem("currentTourStep");
    const exactStepIndex = window.sessionStorage.getItem("exactTourStep");
    const tourActive = window.sessionStorage.getItem("tourActive") === "true";

    if (tourActive) {
      // Try most precise step index first if available
      if (exactStepIndex && !isNaN(Number(exactStepIndex))) {
        const stepIndex = Number(exactStepIndex);
        if (stepIndex >= 0 && stepIndex < tour.steps.length) {
          console.log(`Resuming tour at exact step index: ${stepIndex}`);
          // Clear the exact step to avoid loops
          window.sessionStorage.removeItem("exactTourStep");

          // Wait for the page to be fully loaded after navigation
          setTimeout(() => {
            try {
              tour.show(stepIndex);
            } catch (error) {
              console.error("Error resuming tour at exact step:", error);
              // Fallback to first step if error
              tour.start();
            }
          }, 500);
          return;
        }
      }

      // Fall back to step ID if exact index not available
      if (resumeStep) {
        console.log(`Attempting to resume tour from step ID: ${resumeStep}`);

        // Find the step by ID
        const stepIndex = tour.steps.findIndex(
          (step: ShepherdStep) => step.id === resumeStep
        );

        if (stepIndex !== -1) {
          // Wait for the page to be fully loaded after navigation
          setTimeout(() => {
            // Only clear the specific step to avoid loops
            window.sessionStorage.removeItem("currentTourStep");
            try {
              tour.show(stepIndex);
            } catch (error) {
              console.error("Error resuming tour at step by ID:", error);
              // Fallback to first step if error
              tour.start();
            }
          }, 500);
          return;
        }
      }

      // If we get here but tour is active, restart from beginning
      // This is a fallback for cases where step info is lost
      if (tourActive && !resumeStep && !exactStepIndex) {
        console.log("Tour active but no step info, restarting tour");
        setTimeout(() => tour.start(), 800);
        return;
      }
    }

    // Only start the tour if the user hasn't completed onboarding and tour isn't already active
    if (hasCompletedOnboarding !== true && !tourActive) {
      // Longer delay to ensure elements are fully rendered
      const timer = setTimeout(() => {
        // Set tour as active to preserve across page loads
        window.sessionStorage.setItem("tourActive", "true");
        tour.start();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding, tour, pathname]);

  // Cleanup tourActive flag when tour completes or is cancelled
  useEffect(() => {
    if (!tour) return;

    const handleTourComplete = () => {
      window.sessionStorage.removeItem("tourActive");
      window.sessionStorage.removeItem("currentTourStep");
    };

    const handleTourCancel = () => {
      window.sessionStorage.removeItem("tourActive");
      window.sessionStorage.removeItem("currentTourStep");
    };

    tour.on("complete", handleTourComplete);
    tour.on("cancel", handleTourCancel);

    return () => {
      tour.off("complete", handleTourComplete);
      tour.off("cancel", handleTourCancel);
    };
  }, [tour]);

  const startTour = () => {
    if (tour) {
      window.sessionStorage.setItem("tourActive", "true");
      tour.start();
    }
  };

  const completeTour = () => {
    if (tour) {
      markOnboardingCompleted({ userId });
      window.sessionStorage.removeItem("tourActive");
      window.sessionStorage.removeItem("currentTourStep");
      tour.complete();
    }
  };

  return {
    startTour,
    completeTour,
    hasCompletedOnboarding: hasCompletedOnboarding === true,
  };
}
