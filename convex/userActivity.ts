import { query } from "./_generated/server";
import { v } from "convex/values";

// Get recent activity (applications and referrals) for a user
export const getRecentActivity = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10; // Default to 10 items

    // Fetch recent applications
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    // Fetch recent referrals
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    // Fetch application statuses for application status names
    const applicationStatuses = await ctx.db
      .query("applicationStatuses")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    // Create a map of status IDs to status names for quick lookup
    const statusMap = new Map();
    applicationStatuses.forEach((status) => {
      statusMap.set(status._id.toString(), status.name);
    });

    // Fetch companies for company names
    const companyIds = new Set([
      ...applications
        .filter((app) => app.companyId)
        .map((app) => app.companyId),
      ...referrals.map((ref) => ref.companyId),
    ]);

    const companyMap = new Map();
    for (const companyId of companyIds) {
      if (!companyId) continue;
      const company = await ctx.db.get(companyId);
      if (company) {
        companyMap.set(companyId.toString(), company.name);
      }
    }

    // Format applications for activity feed
    const applicationActivities = applications.map((app) => {
      // Determine action based on status
      const statusName = statusMap.get(app.statusId.toString()) || "Unknown";
      let action = "Applied to";

      if (statusName.toLowerCase().includes("interview")) {
        action = "Interview with";
      } else if (statusName === "Offer") {
        action = "Received offer from";
      } else if (statusName === "Rejected") {
        action = "Rejected by";
      }

      const companyName = app.companyId
        ? companyMap.get(app.companyId.toString())
        : app.companyName;

      return {
        id: app._id.toString(),
        type: "application",
        action,
        company: companyName || app.companyName,
        position: app.position,
        timestamp: app.createdAt,
        date: formatRelativeTime(app.createdAt),
      };
    });

    // Format referrals for activity feed
    const referralActivities = referrals.map((ref) => {
      const action = ref.hasAskedForFinalReferral
        ? "Successfully referred at"
        : "Referred";
      const companyName =
        companyMap.get(ref.companyId.toString()) || "Unknown Company";

      return {
        id: ref._id.toString(),
        type: "referral",
        action,
        company: companyName,
        candidate: ref.name,
        timestamp: ref.createdAt,
        date: formatRelativeTime(ref.createdAt),
      };
    });

    // Combine and sort by timestamp (newest first)
    const allActivities = [...applicationActivities, ...referralActivities]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);

    return allActivities;
  },
});

// Helper function to format timestamps as relative time
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) {
    return "just now";
  } else if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  } else if (days < 7) {
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  } else if (weeks < 4) {
    return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  } else {
    return `${months} month${months !== 1 ? "s" : ""} ago`;
  }
}
