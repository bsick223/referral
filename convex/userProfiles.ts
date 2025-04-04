import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get user profile by user ID
export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    return profile;
  },
});

// Update or create user profile
export const upsertProfile = mutation({
  args: {
    userId: v.string(),
    linkedinUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, linkedinUrl } = args;

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      // Update existing profile
      await ctx.db.patch(existingProfile._id, {
        linkedinUrl,
        updatedAt: Date.now(),
      });
      return existingProfile._id;
    } else {
      // Create new profile
      const profileId = await ctx.db.insert("userProfiles", {
        userId,
        linkedinUrl,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return profileId;
    }
  },
});

// Delete LinkedIn URL from user profile
export const removeLinkedinUrl = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        linkedinUrl: undefined,
        updatedAt: Date.now(),
      });
      return profile._id;
    }

    return null;
  },
});

// Add a new function to get multiple user profiles at once by their IDs
export const getByUserIds = query({
  args: { userIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    const { userIds } = args;

    // If no userIds provided, return empty object
    if (userIds.length === 0) {
      return {};
    }

    const profiles: Record<string, any> = {};

    // Fetch each user's profile
    for (const userId of userIds) {
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .first();

      if (profile) {
        profiles[userId] = profile;
      }
    }

    return profiles;
  },
});

// Mark user onboarding as completed
export const markOnboardingCompleted = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const { userId } = args;

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      // Update existing profile
      await ctx.db.patch(existingProfile._id, {
        onboardingCompleted: true,
        updatedAt: Date.now(),
      });
      return existingProfile._id;
    } else {
      // Create new profile
      const profileId = await ctx.db.insert("userProfiles", {
        userId,
        onboardingCompleted: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return profileId;
    }
  },
});

// Check if user has completed onboarding
export const hasCompletedOnboarding = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    try {
      // If userId is empty or invalid, assume onboarding is needed
      if (!args.userId || args.userId.trim() === "") {
        return false;
      }

      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
        .first();

      // Return true only if profile exists AND onboardingCompleted is explicitly true
      // With our new initialization, it should be explicitly false for new users
      return profile?.onboardingCompleted === true;
    } catch (error) {
      // In case of error (auth issues, etc.), default to needing onboarding (false)
      console.error("Error checking onboarding status:", error);
      return false;
    }
  },
});

// Get all user profiles for leaderboards
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query("userProfiles").collect();

    // Convert to a map for easier lookup
    const profileMap: Record<string, any> = {};
    for (const profile of profiles) {
      profileMap[profile.userId] = profile;
    }

    return profileMap;
  },
});

// Update profile settings
export const updateProfileSettings = mutation({
  args: {
    userId: v.string(),
    professionalTitle: v.optional(v.string()),
    location: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, professionalTitle, location, phoneNumber, linkedinUrl } =
      args;

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      // Update existing profile
      await ctx.db.patch(existingProfile._id, {
        professionalTitle,
        location,
        phoneNumber,
        linkedinUrl,
        updatedAt: Date.now(),
      });
      return existingProfile._id;
    } else {
      // Create new profile
      const profileId = await ctx.db.insert("userProfiles", {
        userId,
        professionalTitle,
        location,
        phoneNumber,
        linkedinUrl,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return profileId;
    }
  },
});

// Update privacy settings
export const updatePrivacySettings = mutation({
  args: {
    userId: v.string(),
    hideFromLeaderboards: v.optional(v.boolean()),
    profileVisibility: v.optional(v.string()),
    showApplicationsCount: v.optional(v.boolean()),
    showReferralsCount: v.optional(v.boolean()),
    showCompaniesCount: v.optional(v.boolean()),
    showApplicationsInCommunity: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const {
      userId,
      hideFromLeaderboards,
      profileVisibility,
      showApplicationsCount,
      showReferralsCount,
      showCompaniesCount,
      showApplicationsInCommunity,
    } = args;

    // Find existing profile
    const profile = await ctx.db
      .query("userProfiles")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    // Create updates object with only the fields that are provided
    const updates: any = {
      updatedAt: Date.now(),
    };

    if (hideFromLeaderboards !== undefined)
      updates.hideFromLeaderboards = hideFromLeaderboards;
    if (profileVisibility !== undefined)
      updates.profileVisibility = profileVisibility;
    if (showApplicationsCount !== undefined)
      updates.showApplicationsCount = showApplicationsCount;
    if (showReferralsCount !== undefined)
      updates.showReferralsCount = showReferralsCount;
    if (showCompaniesCount !== undefined)
      updates.showCompaniesCount = showCompaniesCount;
    if (showApplicationsInCommunity !== undefined)
      updates.showApplicationsInCommunity = showApplicationsInCommunity;

    if (profile) {
      // Update existing profile
      await ctx.db.patch(profile._id, updates);
      return profile._id;
    } else {
      // Create new profile with privacy settings
      const id = await ctx.db.insert("userProfiles", {
        userId,
        hideFromLeaderboards: hideFromLeaderboards || false,
        profileVisibility: profileVisibility || "public",
        showApplicationsCount: showApplicationsCount !== false, // default to true
        showReferralsCount: showReferralsCount !== false, // default to true
        showCompaniesCount: showCompaniesCount !== false, // default to true
        showApplicationsInCommunity: showApplicationsInCommunity !== false, // default to true
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return id;
    }
  },
});

// Get user profile settings
export const getProfileSettings = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) {
      return {
        profileVisibility: "public",
        hideFromLeaderboards: false,
        showApplicationsCount: true,
        showReferralsCount: true,
        showCompaniesCount: true,
        showApplicationsInCommunity: true, // Default to true (opt-in)
      };
    }

    return {
      professionalTitle: profile.professionalTitle || "",
      location: profile.location || "",
      phoneNumber: profile.phoneNumber || "",
      linkedinUrl: profile.linkedinUrl || "",
      profileVisibility: profile.profileVisibility || "public",
      hideFromLeaderboards: profile.hideFromLeaderboards || false,
      showApplicationsCount: profile.showApplicationsCount !== false, // default to true
      showReferralsCount: profile.showReferralsCount !== false, // default to true
      showCompaniesCount: profile.showCompaniesCount !== false, // default to true
      // If we have an explicit value saved in the profile, use that value
      // Otherwise, default to true for opt-in behavior
      showApplicationsInCommunity:
        profile.showApplicationsInCommunity !== undefined
          ? profile.showApplicationsInCommunity
          : true,
    };
  },
});

// Initialize user profile with onboardingCompleted set to false for new users
export const initializeNewUserProfile = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const { userId } = args;

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      // If user already exists and onboardingCompleted is explicitly set, don't change it
      if (existingProfile.onboardingCompleted !== undefined) {
        return existingProfile._id;
      }

      // If user exists but onboardingCompleted is not set, set it to false
      await ctx.db.patch(existingProfile._id, {
        onboardingCompleted: false,
        updatedAt: Date.now(),
      });
      return existingProfile._id;
    } else {
      // Create new profile with onboardingCompleted explicitly set to false
      const profileId = await ctx.db.insert("userProfiles", {
        userId,
        onboardingCompleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return profileId;
    }
  },
});
