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
    let leaderboardEntries = Array.from(userReferralCounts.entries())
      .map(([userId, count]) => ({
        userId,
        name: userNames.get(userId) || "Anonymous",
        referralCount: count,
      }))
      .sort((a, b) => b.referralCount - a.referralCount);

    // Apply limit if provided
    if (args.limit) {
      leaderboardEntries = leaderboardEntries.slice(0, args.limit);
    }

    return leaderboardEntries;
  },
});

// Get referral analytics data for a user
export const getUserReferralAnalytics = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Get all referrals for the user
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    if (referrals.length === 0) {
      return {
        totalReferrals: 0,
        dailyData: [],
        weeklyData: [],
        monthlyData: [],
        yearlyData: [],
        statusBreakdown: {},
      };
    }

    // Calculate the start times for different periods
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
    const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;

    // Group referrals by day (for the last 7 days)
    const dailyData = new Array(7)
      .fill(0)
      .map((_, i) => {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split("T")[0];
        const startOfDay = new Date(dateStr).getTime();
        const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;

        const count = referrals.filter(
          (ref) => ref.createdAt >= startOfDay && ref.createdAt <= endOfDay
        ).length;

        return {
          date: dateStr,
          count,
        };
      })
      .reverse();

    // Group referrals by week (for the last 12 weeks)
    const weeklyData = new Array(12)
      .fill(0)
      .map((_, i) => {
        const weekStart = now - (i + 1) * 7 * 24 * 60 * 60 * 1000;
        const weekEnd = now - i * 7 * 24 * 60 * 60 * 1000 - 1;

        const count = referrals.filter(
          (ref) => ref.createdAt >= weekStart && ref.createdAt <= weekEnd
        ).length;

        const weekStartDate = new Date(weekStart);
        const label = `Week ${
          weekStartDate.getMonth() + 1
        }/${weekStartDate.getDate()}`;

        return {
          label,
          count,
        };
      })
      .reverse();

    // Group referrals by month (for the last 12 months)
    const monthlyData = new Array(12)
      .fill(0)
      .map((_, i) => {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        date.setDate(1);
        date.setHours(0, 0, 0, 0);
        const monthStart = date.getTime();

        date.setMonth(date.getMonth() + 1);
        const monthEnd = date.getTime() - 1;

        const count = referrals.filter(
          (ref) => ref.createdAt >= monthStart && ref.createdAt <= monthEnd
        ).length;

        const monthName = new Date(monthStart).toLocaleString("default", {
          month: "short",
        });
        const year = new Date(monthStart).getFullYear();

        return {
          label: `${monthName} ${year}`,
          count,
        };
      })
      .reverse();

    // Group referrals by status
    const statusBreakdown = referrals.reduce<Record<string, number>>(
      (acc, ref) => {
        const status = ref.status || "unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {}
    );

    // Recent activity (last 10 referrals)
    const recentActivity = referrals
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10)
      .map((ref) => ({
        id: ref._id,
        name: ref.name,
        status: ref.status,
        date: new Date(ref.createdAt).toISOString(),
      }));

    return {
      totalReferrals: referrals.length,
      dailyData,
      weeklyData,
      monthlyData,
      statusBreakdown,
      recentActivity,
    };
  },
});

// Get referrals grouped by company for a user
export const getUserReferralsByCompany = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Get all referrals for the user
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    if (referrals.length === 0) {
      return {
        totalReferrals: 0,
        companiesData: [],
      };
    }

    // Group referrals by company
    const companiesMap = new Map<
      string,
      { count: number; companyName: string }
    >();

    // Fetch company details for each referral
    for (const referral of referrals) {
      const companyId = referral.companyId;

      // Get or initialize company data
      let companyData = companiesMap.get(companyId.toString());

      if (!companyData) {
        // Fetch company details if we haven't seen this company yet
        const company = await ctx.db.get(companyId);

        companyData = {
          count: 0,
          companyName: company ? company.name : "Unknown Company",
        };

        companiesMap.set(companyId.toString(), companyData);
      }

      // Increment the count
      companyData.count += 1;
    }

    // Convert to array and sort by count
    const companiesData = Array.from(companiesMap.entries())
      .map(([companyId, data]) => ({
        companyId,
        companyName: data.companyName,
        referralCount: data.count,
        percentage: (data.count / referrals.length) * 100,
      }))
      .sort((a, b) => b.referralCount - a.referralCount);

    return {
      totalReferrals: referrals.length,
      companiesData,
    };
  },
});
