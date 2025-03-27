import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
// video protected page

const isProtectedRoute = createRouteMatcher([
  "/video(.*)",
  "/dashboard(.*)",
  "/companies(.*)",
  "/referrals(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();

  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn();
  }

  // If we have a userId and it's a protected route, ensure profile exists
  if (userId && isProtectedRoute(req)) {
    try {
      const convex = getConvexClient();
      await convex.mutation(api.userProfiles.updatePrivacySettings, {
        userId,
        profileVisibility: "public",
        hideFromLeaderboards: false,
        showApplicationsCount: true,
        showReferralsCount: true,
        showCompaniesCount: true,
      });
    } catch (error) {
      // Log error but don't block the request
      console.error("Error ensuring user profile exists:", error);
    }
  }

  return null;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
