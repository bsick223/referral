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
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    // Return true only if profile exists AND onboardingCompleted is explicitly true
    // Return false for undefined/null/false values
    return profile?.onboardingCompleted === true;
  },
});
