"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ReactNode, useEffect } from "react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { dark } from "@clerk/themes";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

function ProfileInitializer() {
  const { userId } = useAuth();
  const updatePrivacySettings = useMutation(
    api.userProfiles.updatePrivacySettings
  );
  const initializeUserProfile = useMutation(
    api.userProfiles.initializeNewUserProfile
  );

  useEffect(() => {
    if (userId) {
      // First, initialize the user profile with onboardingCompleted set to false for new users
      initializeUserProfile({ userId })
        .then(() => {
          // Then ensure profile has default public settings
          updatePrivacySettings({
            userId,
            profileVisibility: "public",
            hideFromLeaderboards: false,
            showApplicationsCount: true,
            showReferralsCount: true,
            showCompaniesCount: true,
          }).catch((error) => {
            console.error("Error updating privacy settings:", error);
          });
        })
        .catch((error) => {
          console.error("Error initializing user profile:", error);
        });
    }
  }, [userId, updatePrivacySettings, initializeUserProfile]);

  return null;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        elements: {
          formButtonPrimary: {
            backgroundColor: "#3b82f6",
            borderRadius: "0.375rem",
            "&:hover": {
              backgroundColor: "#2563eb",
            },
          },
          card: {
            backgroundColor: "#121a36",
            borderRadius: "0.5rem",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
            border: "1px solid #20253d",
          },
          headerTitle: {
            color: "white",
          },
          headerSubtitle: {
            color: "#94a3b8",
          },
          socialButtonsIconButton: {
            border: "1px solid #20253d",
            backgroundColor: "#0c1029",
            "&:hover": {
              backgroundColor: "#192245",
            },
          },
          socialButtonsBlockButton: {
            backgroundColor: "#0c1029",
            border: "1px solid #20253d",
            "&:hover": {
              backgroundColor: "#192245",
            },
          },
          formFieldLabel: {
            color: "#94a3b8",
          },
          formFieldInput: {
            backgroundColor: "#0c1029",
            border: "1px solid #20253d",
            color: "white",
            "&:focus": {
              borderColor: "#3b82f6",
              outline: "none",
            },
          },
          footerActionText: {
            color: "#94a3b8",
          },
          footerActionLink: {
            color: "#3b82f6",
            "&:hover": {
              color: "#60a5fa",
            },
          },
          identityPreviewText: {
            color: "white",
          },
        },
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
      }}
      afterSignOutUrl="/"
    >
      <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
        <ProfileInitializer />
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
