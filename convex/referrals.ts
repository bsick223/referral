import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all referrals for a company
export const listByCompany = query({
  args: {
    companyId: v.id("companies"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_company_and_user", (q) =>
        q.eq("companyId", args.companyId).eq("userId", args.userId)
      )
      .order("desc")
      .collect();

    return referrals;
  },
});

// Get all referrals for a user
export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return referrals;
  },
});

// Get a single referral by ID
export const getById = query({
  args: { id: v.id("referrals") },
  handler: async (ctx, args) => {
    const referral = await ctx.db.get(args.id);
    return referral;
  },
});

// Create a new referral
export const create = mutation({
  args: {
    companyId: v.id("companies"),
    userId: v.string(),
    name: v.string(),
    linkedinUrl: v.string(),
    email: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const referralId = await ctx.db.insert("referrals", {
      companyId: args.companyId,
      userId: args.userId,
      name: args.name,
      linkedinUrl: args.linkedinUrl,
      email: args.email,
      phoneNumber: args.phoneNumber,
      notes: args.notes,
      status: args.status || "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return referralId;
  },
});

// Update an existing referral
export const update = mutation({
  args: {
    id: v.id("referrals"),
    name: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    email: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Get the existing referral
    const existingReferral = await ctx.db.get(id);
    if (!existingReferral) {
      throw new Error("Referral not found");
    }

    // Update with new values
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Delete a referral
export const remove = mutation({
  args: { id: v.id("referrals") },
  handler: async (ctx, args) => {
    // Get the existing referral
    const existingReferral = await ctx.db.get(args.id);
    if (!existingReferral) {
      throw new Error("Referral not found");
    }

    // Delete the referral
    await ctx.db.delete(args.id);

    return args.id;
  },
});

// Get the leaderboard of users with most referrals
export const getLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10; // Default to top 10

    // Get all referrals
    const referrals = await ctx.db.query("referrals").collect();

    // Count referrals per user
    const userReferralCounts = new Map<string, number>();
    const userNames = new Map<string, string>();

    // Process all referrals to count per user
    for (const referral of referrals) {
      const userId = referral.userId;
      userReferralCounts.set(userId, (userReferralCounts.get(userId) || 0) + 1);

      // Store the user's first referral name to be used as a fallback
      // This assumes we don't have a separate users table with names
      if (!userNames.has(userId)) {
        userNames.set(userId, referral.name.split(" ")[0] || "Anonymous");
      }
    }

    // Convert to array and sort by count
    const leaderboardEntries = Array.from(userReferralCounts.entries())
      .map(([userId, count]) => ({
        userId,
        name: userNames.get(userId) || "Anonymous",
        referralCount: count,
      }))
      .sort((a, b) => b.referralCount - a.referralCount)
      .slice(0, limit);

    return leaderboardEntries;
  },
});
