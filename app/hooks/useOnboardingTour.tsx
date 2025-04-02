"use client";

import { useEffect, useState } from "react";
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePathname } from "next/navigation";

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
  const [isMobile, setIsMobile] = useState(false);

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

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on initial load
    checkMobile();

    // Add resize listener
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
        /* Make sure the tour is visible on mobile */
        @media (max-width: 767px) {
          .shepherd-theme-custom {
            max-width: 300px;
            font-size: 14px;
          }
          .shepherd-text {
            padding: 0.75rem;
          }
          .shepherd-footer {
            padding: 0.5rem 0.75rem;
          }
          /* Ensure step is visible at bottom of screen */
          .shepherd-element[data-popper-placement="bottom"] {
            margin-top: 10px !important;
          }
          /* Ensure modal stays within screen */
          .shepherd-modal-overlay-container {
            z-index: 9999 !important;
          }
          /* Make buttons more tappable */
          .shepherd-button {
            padding: 8px 12px !important;
            min-height: 44px;
            font-size: 16px !important;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          /* Fix mobile floating sidebar issues */
          .shepherd-element[x-out-of-boundaries] {
            visibility: visible !important;
            /* Force the tour to stay visible on the screen */
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
          }
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

      // Helper function to open the mobile sidebar
      const openMobileSidebar = () => {
        if (!isMobile) return false;

        const menuButton = document.querySelector(
          'button[aria-controls="mobile-sidebar"]'
        );
        const sidebar = document.querySelector('[data-sidebar="mobile"]');
        const isOpen = sidebar?.classList.contains("translate-x-0");

        if (menuButton && !isOpen) {
          console.log("Opening mobile sidebar for tour");
          (menuButton as HTMLElement).click();
          return true; // Sidebar was opened
        }

        return isOpen; // Return true if it was already open
      };

      // Track sidebar state
      let keepSidebarOpen = false;

      // Function to force check and ensure sidebar is open
      const ensureSidebarOpen = () => {
        if (!isMobile) return;

        if (keepSidebarOpen) {
          const isOpen = document
            .querySelector('[data-sidebar="mobile"]')
            ?.classList.contains("translate-x-0");
          if (!isOpen) {
            console.log("Sidebar closed unexpectedly, reopening");
            openMobileSidebar();
          }
        }
      };

      // Hook to check sidebar status frequently during tour
      const startSidebarMonitoring = () => {
        if (!isMobile) return undefined;

        keepSidebarOpen = true;

        // Check every 100ms to ensure sidebar stays open
        const intervalId = window.setInterval(() => {
          if (keepSidebarOpen) {
            ensureSidebarOpen();
          } else {
            window.clearInterval(intervalId);
          }
        }, 100);

        return intervalId as unknown as number;
      };

      // Cleanup function
      const stopSidebarMonitoring = (intervalId: number | undefined) => {
        keepSidebarOpen = false;
        if (intervalId !== undefined) {
          window.clearInterval(intervalId);
        }
      };

      // Helper function to handle common step setup
      const setupStep = (step: ShepherdStep) => {
        let sidebarMonitoringId: number | undefined;

        step.on("show", () => {
          // Wait for DOM to update
          setTimeout(() => {
            // For mobile steps that need the sidebar
            if (
              isMobile &&
              step.id !== "welcome" &&
              step.id !== "menu-button" &&
              step.id !== "thank-you"
            ) {
              // Ensure sidebar is open
              openMobileSidebar();

              // Start monitoring to keep sidebar open
              if (!sidebarMonitoringId) {
                sidebarMonitoringId = startSidebarMonitoring();
              }

              // Give time for sidebar to be fully opened
              setTimeout(() => {
                // Find and highlight target element
                if (step.options.attachTo) {
                  const targetSelector = step.options.attachTo.element;
                  const targetElement = document.querySelector(targetSelector);

                  if (targetElement) {
                    // Add custom highlight effect
                    targetElement.classList.add("shepherd-highlighted");

                    // Also scroll to make the target element visible
                    scrollToElement(targetElement as HTMLElement);
                  } else {
                    console.warn(`Target element not found: ${targetSelector}`);
                    console.log("Available elements:", {
                      "data-tab": Array.from(
                        document.querySelectorAll("[data-tab]")
                      ).map((el) => el.getAttribute("data-tab")),
                      "aria-controls": Array.from(
                        document.querySelectorAll("[aria-controls]")
                      ).map((el) => el.getAttribute("aria-controls")),
                      "in sidebar": document.querySelector(
                        '[data-sidebar="mobile"]'
                      ),
                    });

                    // Auto-advance if element can't be found
                    setTimeout(() => {
                      if (newTour) {
                        console.log(
                          `Auto-advancing past step due to missing element: ${targetSelector}`
                        );
                        newTour.next();
                      }
                    }, 1000);
                  }
                }
              }, 300);
            } else {
              // For desktop or welcome/thank-you steps
              // Add highlight to the target element
              if (step.options.attachTo) {
                const targetSelector = step.options.attachTo.element;
                console.log(`Looking for element: ${targetSelector}`);
                const targetElement = document.querySelector(targetSelector);

                if (targetElement) {
                  // Add custom highlight effect
                  targetElement.classList.add("shepherd-highlighted");

                  // Also scroll to make the target element visible
                  scrollToElement(targetElement as HTMLElement);
                } else {
                  console.warn(`Target element not found: ${targetSelector}`);
                  // Auto-advance if element can't be found
                  setTimeout(() => {
                    if (newTour) {
                      newTour.next();
                    }
                  }, 1000);
                }
              }
            }

            // Scroll to better position the step
            const stepElement = document.querySelector(".shepherd-element");
            scrollToElement(stepElement as HTMLElement);
          }, 200);
        });

        step.on("hide", () => {
          // Remove highlight from target element when step is hidden
          if (step.options.attachTo) {
            const targetElement = document.querySelector(
              step.options.attachTo.element
            );
            if (targetElement) {
              targetElement.classList.remove("shepherd-highlighted");
            }
          }

          // Don't stop monitoring between steps - only at the end
          if (step.id === "thank-you" && sidebarMonitoringId) {
            stopSidebarMonitoring(sidebarMonitoringId);
          }

          // If we're on mobile and moving to next step (not on thank-you)
          // ensure sidebar is still open
          if (isMobile && step.id !== "thank-you") {
            ensureSidebarOpen();
          }
        });

        // Also cleanup on complete or cancel
        step.tour.on("complete", () => {
          if (sidebarMonitoringId) {
            stopSidebarMonitoring(sidebarMonitoringId);
          }
        });

        step.tour.on("cancel", () => {
          if (sidebarMonitoringId) {
            stopSidebarMonitoring(sidebarMonitoringId);
          }
        });
      };

      // Welcome step - doesn't need tab navigation
      newTour.addStep({
        id: "welcome",
        title: "Welcome to your Dashboard!",
        text: `<p class="text-white mb-2">Welcome to dashboard!</p>
        <div class="w-full h-[1px] my-3 bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
        <p class="text-white mb-2"><strong>Pro-tip:</strong> Ask your referrer for the referral BEFORE applying to a job, usually they'll give you a link to apply.</p>`,
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
            action: () => {
              // Log all data-tab attributes to help debug
              console.log(
                "Available data-tab values:",
                Array.from(document.querySelectorAll("[data-tab]")).map(
                  (el) => {
                    const rect = el.getBoundingClientRect();
                    return {
                      "data-tab": el.getAttribute("data-tab"),
                      visible: rect.width > 0 && rect.height > 0,
                      text: el.textContent?.trim(),
                      classes: (el as HTMLElement).className,
                    };
                  }
                )
              );

              // Go to appropriate next step based on device type
              if (isMobile) {
                newTour.show("menu-button");
              } else {
                newTour.show("profile");
              }
            },
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

      // Mobile-specific step for menu button (only shown on mobile)
      if (isMobile) {
        newTour.addStep({
          id: "menu-button",
          title: "Navigation Menu",
          text: '<p class="text-white mb-2">Tap this menu button to access navigation options like Applications, Referrals, and Messages.</p>',
          attachTo: {
            element: 'button[aria-controls="mobile-sidebar"]',
            on: "bottom",
          },
          buttons: [
            {
              action: () => {
                // Open sidebar then go to next step
                openMobileSidebar();
                keepSidebarOpen = true; // Start keeping sidebar open
                // Give extra time for sidebar animation to complete
                setTimeout(() => newTour.next(), 800);
              },
              classes: "shepherd-button-primary",
              text: "Next",
            },
          ],
        });
      }

      // Profile section step
      const profileStep = newTour.addStep({
        id: "profile",
        title: "Your Profile",
        text: '<p class="text-white mb-2">View your stats and achievements here. Track your progress and see how many applications and referrals you\'ve completed over time.</p>',
        attachTo: {
          // Target the "Your Account" navigation link using the correct data-tab
          element: '[data-tab="your account"]',
          on: isMobile ? "bottom" : "right",
        },
        buttons: [
          {
            action: newTour.back,
            classes: "shepherd-button-secondary",
            text: "Back",
          },
          {
            action: () => {
              // On mobile, simply go to next step without checking sidebar
              // The setupStep function already handles this on the show event
              newTour.next();
            },
            classes: "shepherd-button-primary",
            text: "Next",
          },
        ],
      });

      setupStep(profileStep);

      // Applications step
      const applicationsStep = newTour.addStep({
        id: "applications",
        title: "Applications Tab",
        text: '<p class="text-white mb-2">Create a new application and drag and drop them through the pipeline to track your progress.</p>',
        attachTo: {
          element: '[data-tab="applications"]',
          on: isMobile ? "bottom" : "right",
        },
        buttons: [
          {
            action: newTour.back,
            classes: "shepherd-button-secondary",
            text: "Back",
          },
          {
            action: () => {
              // On mobile, simply go to next step without checking sidebar
              // The setupStep function already handles this on the show event
              newTour.next();
            },
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
          on: isMobile ? "bottom" : "right",
        },
        buttons: [
          {
            action: newTour.back,
            classes: "shepherd-button-secondary",
            text: "Back",
          },
          {
            action: () => {
              // On mobile, simply go to next step without checking sidebar
              // The setupStep function already handles this on the show event
              newTour.next();
            },
            classes: "shepherd-button-primary",
            text: "Next",
          },
        ],
      });

      setupStep(referralsStep);

      // Leaderboard step
      const leaderboardStep = newTour.addStep({
        id: "leaderboard",
        title: "Leaderboard",
        text: '<p class="text-white mb-2">This is where you can see how you compare with others. Compete and improve together!</p>',
        attachTo: {
          element: '[data-tab="leaderboard"]',
          on: isMobile ? "bottom" : "right",
        },
        buttons: [
          {
            action: newTour.back,
            classes: "shepherd-button-secondary",
            text: "Back",
          },
          {
            action: () => {
              // On mobile, simply go to next step without checking sidebar
              // The setupStep function already handles this on the show event
              newTour.next();
            },
            classes: "shepherd-button-primary",
            text: "Next",
          },
        ],
      });

      setupStep(leaderboardStep);

      // Messages step
      const messagesStep = newTour.addStep({
        id: "messages",
        title: "Message Templates",
        text: '<p class="text-white mb-2">Create message templates for reaching out to people. These templates will help you save time and be consistent.</p>',
        attachTo: {
          element: '[data-tab="messages"]',
          on: isMobile ? "bottom" : "right",
        },
        buttons: [
          {
            action: newTour.back,
            classes: "shepherd-button-secondary",
            text: "Back",
          },
          {
            action: () => {
              // On mobile, simply go to next step without checking sidebar
              // The setupStep function already handles this on the show event
              newTour.next();
            },
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
          on: isMobile ? "bottom" : "right",
        },
        buttons: [
          {
            action: newTour.back,
            classes: "shepherd-button-secondary",
            text: "Back",
          },
          {
            action: () => {
              // On mobile, simply go to next step without checking sidebar
              // The setupStep function already handles this on the show event
              newTour.next();
            },
            classes: "shepherd-button-primary",
            text: "Next",
          },
        ],
      });

      setupStep(settingsStep);

      // Thank you step
      const thankYouStep = newTour.addStep({
        id: "thank-you",
        title: "Thank You!",
        text: `
          <p class="text-white mb-3">This is one of the best ways to track applications!</p>
          
          <div class="bg-gradient-to-r from-orange-500/20 via-purple-500/20 to-blue-500/20 p-3 rounded-md mb-3">
            <p class="text-white text-sm">Think of it like a business tracking leads → sales.</p>
            <p class="text-white text-sm font-bold">In your case: applications → job offers!</p>
          </div>
          
          <div class="w-full h-[1px] my-3 bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
          
          <p class="text-white text-sm">Best of luck and see you on the <span class="font-bold text-blue-400">scoreboard</span>! 🏆</p>
        `,
        buttons: [
          {
            action: newTour.back,
            classes: "shepherd-button-secondary",
            text: "Back",
          },
          {
            action: () => {
              // Reset sidebar state
              keepSidebarOpen = false;
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
  }, [userId, markOnboardingCompleted, pathname, isMobile]);

  // Auto-start the tour if user hasn't completed onboarding
  useEffect(() => {
    // Only execute on client side and when tour is initialized
    if (typeof window === "undefined" || !tour) return;

    // Only start the tour if onboardingCompleted is explicitly false
    // This works with our new initialization that sets it to false for new users
    if (hasCompletedOnboarding === false) {
      // Longer delay to ensure elements are fully rendered
      const timer = setTimeout(() => {
        tour.start();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding, tour]);

  const startTour = () => {
    if (tour) {
      tour.start();
    }
  };

  const completeTour = () => {
    if (tour) {
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
