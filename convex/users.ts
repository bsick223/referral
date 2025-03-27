import { query } from "./_generated/server";
import { v } from "convex/values";

// Get all user IDs for the leaderboards
export const getAllUserIds = query({
  args: {},
  handler: async (ctx) => {
    // Get referrals to extract user IDs
    const referrals = await ctx.db.query("referrals").collect();

    // Get applications to extract user IDs
    const applications = await ctx.db.query("applications").collect();

    // Combine user IDs from both sources and remove duplicates
    const userIdsFromReferrals = referrals.map((ref) => ref.userId);
    const userIdsFromApplications = applications.map((app) => app.userId);

    const allUserIds = [
      ...new Set([...userIdsFromReferrals, ...userIdsFromApplications]),
    ];

    return allUserIds;
  },
});
