import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Define achievement tiers and categories
export const ACHIEVEMENTS = {
  applications: {
    bronze: {
      name: "First Steps",
      description: "Applied to your first job",
      requirement: 1,
      icon: "medal",
    },
    silver: {
      name: "Go-Getter",
      description: "Applied to 100 jobs",
      requirement: 100,
      icon: "rocket",
    },
    gold: {
      name: "Application Champion",
      description: "Applied to 300 jobs",
      requirement: 300,
      icon: "trophy",
    },
  },
  referrals: {
    bronze: {
      name: "Connector",
      description: "Received 1 referral from network",
      requirement: 1,
      icon: "link",
    },
    silver: {
      name: "Networker",
      description: "Received 5 referrals",
      requirement: 5,
      icon: "users",
    },
    gold: {
      name: "Super Connector",
      description: "Received 15 referrals",
      requirement: 15,
      icon: "award",
    },
  },
  // followups: {
  //   bronze: {
  //     name: "Prompt Professional",
  //     description: "Sent 1 follow-up email",
  //     requirement: 1,
  //     icon: "mail",
  //   },
  //   silver: {
  //     name: "Diligent Diplomat",
  //     description: "Sent follow-ups for 5 apps",
  //     requirement: 5,
  //     icon: "message-square",
  //   },
  //   gold: {
  //     name: "Follow-Up Master",
  //     description: "Sent follow-ups for 20 apps",
  //     requirement: 20,
  //     icon: "send",
  //   },
  // },
  interviews: {
    bronze: {
      name: "Foot in the Door",
      description: "Secured your first interview",
      requirement: 1,
      icon: "calendar",
    },
    silver: {
      name: "In Demand",
      description: "Secured 5 interviews",
      requirement: 5,
      icon: "user-check",
    },
    gold: {
      name: "Interview Virtuoso",
      description: "Secured 10+ interviews",
      requirement: 10,
      icon: "star",
    },
  },
  offers: {
    bronze: {
      name: "On the Radar",
      description: "Received 1 job offer",
      requirement: 1,
      icon: "check-circle",
    },
    silver: {
      name: "Hot Prospect",
      description: "Received 3 job offers",
      requirement: 3,
      icon: "zap",
    },
    gold: {
      name: "Offer Magnet",
      description: "Received 5+ job offers",
      requirement: 5,
      icon: "award",
    },
  },
  rejections: {
    bronze: {
      name: "Thick Skin",
      description: "Bravely faced 5 rejections",
      requirement: 5,
      icon: "shield",
    },
    silver: {
      name: "Bounce Back",
      description: "Bounced back from 10 rejections",
      requirement: 10,
      icon: "refresh-cw",
    },
    gold: {
      name: "Phoenix Rising",
      description: "20+ rejections and still persisting!",
      requirement: 20,
      icon: "target",
    },
  },
};

// Type definition for category progress
type CategoryProgress = {
  count: number;
  bronze: boolean;
  silver: boolean;
  gold: boolean;
};

// Type definition for all progress
type ProgressData = {
  applications: CategoryProgress;
  referrals: CategoryProgress;
  interviews: CategoryProgress;
  offers: CategoryProgress;
  rejections: CategoryProgress;
};

// Helper function to calculate user achievement progress
// This is separate from the registered query but contains the same logic
async function calculateUserAchievementProgress(
  ctx: any,
  userId: string
): Promise<ProgressData> {
  // Fetch data needed for achievements
  const applications = await ctx.db
    .query("applications")
    .withIndex("by_user_id", (q: any) => q.eq("userId", userId))
    .collect();

  const referrals = await ctx.db
    .query("referrals")
    .withIndex("by_user_id", (q: any) => q.eq("userId", userId))
    .collect();

  // Get application statuses to identify interviews, offers, rejections
  const applicationStatuses = await ctx.db
    .query("applicationStatuses")
    .withIndex("by_user_id", (q: any) => q.eq("userId", userId))
    .collect();

  // Map status names to IDs
  const statusMap: Record<string, string> = {};
  applicationStatuses.forEach((status: any) => {
    statusMap[status.name.toLowerCase()] = status._id;
  });

  // Count applications by status
  const appCounts: Record<string, number> = {};
  applications.forEach((app: any) => {
    const statusInfo = applicationStatuses.find(
      (s: any) => s._id === app.statusId
    );
    if (statusInfo) {
      const statusName = statusInfo.name.toLowerCase();
      appCounts[statusName] = (appCounts[statusName] || 0) + 1;
    }
  });

  // Calculate progress for each achievement category
  return {
    applications: {
      count: applications.length,
      bronze:
        applications.length >= ACHIEVEMENTS.applications.bronze.requirement,
      silver:
        applications.length >= ACHIEVEMENTS.applications.silver.requirement,
      gold: applications.length >= ACHIEVEMENTS.applications.gold.requirement,
    },
    referrals: {
      count: referrals.length,
      bronze: referrals.length >= ACHIEVEMENTS.referrals.bronze.requirement,
      silver: referrals.length >= ACHIEVEMENTS.referrals.silver.requirement,
      gold: referrals.length >= ACHIEVEMENTS.referrals.gold.requirement,
    },
    interviews: {
      // Simplified - count applications in "interview" status
      count: appCounts["interview"] || 0,
      bronze:
        (appCounts["interview"] || 0) >=
        ACHIEVEMENTS.interviews.bronze.requirement,
      silver:
        (appCounts["interview"] || 0) >=
        ACHIEVEMENTS.interviews.silver.requirement,
      gold:
        (appCounts["interview"] || 0) >=
        ACHIEVEMENTS.interviews.gold.requirement,
    },
    offers: {
      // Count applications in "offer" status
      count: appCounts["offer"] || 0,
      bronze:
        (appCounts["offer"] || 0) >= ACHIEVEMENTS.offers.bronze.requirement,
      silver:
        (appCounts["offer"] || 0) >= ACHIEVEMENTS.offers.silver.requirement,
      gold: (appCounts["offer"] || 0) >= ACHIEVEMENTS.offers.gold.requirement,
    },
    rejections: {
      // Count applications in "rejected" status
      count: appCounts["rejected"] || 0,
      bronze:
        (appCounts["rejected"] || 0) >=
        ACHIEVEMENTS.rejections.bronze.requirement,
      silver:
        (appCounts["rejected"] || 0) >=
        ACHIEVEMENTS.rejections.silver.requirement,
      gold:
        (appCounts["rejected"] || 0) >=
        ACHIEVEMENTS.rejections.gold.requirement,
    },
  };
}

// Get all achievements for a user
export const getUserAchievements = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_user_id", (q: any) => q.eq("userId", args.userId))
      .collect();

    return achievements;
  },
});

// Get user's progress toward achievements
export const getUserAchievementProgress = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return calculateUserAchievementProgress(ctx, args.userId);
  },
});

// Check and update user achievements
export const checkAndUpdateAchievements = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const { userId } = args;

    // Get current achievement progress using the helper function
    const progress = await calculateUserAchievementProgress(ctx, userId);

    // Get existing achievements for user
    const existingAchievements = await ctx.db
      .query("achievements")
      .withIndex("by_user_id", (q: any) => q.eq("userId", userId))
      .collect();

    const newAchievements = [];

    // Check each category and tier
    for (const [category, categoryData] of Object.entries(progress)) {
      // Type assertion for the category data
      const categoryProgress = categoryData as CategoryProgress;

      // Check each tier
      for (const tier of ["bronze", "silver", "gold"] as const) {
        // Get the earned status for this tier
        const earned = categoryProgress[tier];

        // If achievement earned but not already recorded
        if (
          earned &&
          !existingAchievements.some(
            (a: any) => a.category === category && a.tier === tier
          )
        ) {
          // Get achievement details
          const achievementDetails =
            ACHIEVEMENTS[category as keyof typeof ACHIEVEMENTS][tier];

          // Insert new achievement
          const achievementId = await ctx.db.insert("achievements", {
            userId,
            category,
            tier,
            name: achievementDetails.name,
            description: achievementDetails.description,
            earnedAt: Date.now(),
            progress: categoryProgress.count,
            requirement: achievementDetails.requirement,
            icon: achievementDetails.icon,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });

          newAchievements.push(achievementId);
        }
      }
    }

    return { newAchievements };
  },
});

// Get formatted user achievements for display
export const getFormattedUserAchievements = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const { userId } = args;

    // Get user's achievement progress using the helper function
    const progress = await calculateUserAchievementProgress(ctx, userId);

    // Format achievements for display
    // Filter out the followups category
    const categories = Object.keys(ACHIEVEMENTS).filter(
      (category) => category !== "followups"
    );
    const formattedAchievements = [];

    for (const category of categories) {
      const tiers = ["bronze", "silver", "gold"] as const;

      // Type assertion for the category data
      const categoryProgress = progress[
        category as keyof typeof progress
      ] as CategoryProgress;

      for (const tier of tiers) {
        const achievement =
          ACHIEVEMENTS[category as keyof typeof ACHIEVEMENTS][tier];

        formattedAchievements.push({
          id: `${category}-${tier}`,
          category,
          tier,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          earned: categoryProgress[tier],
          progress: categoryProgress.count,
          requirement: achievement.requirement,
        });
      }
    }

    return formattedAchievements;
  },
});
