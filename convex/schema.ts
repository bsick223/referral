import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  videos: defineTable({
    videoId: v.string(),
    userId: v.string(),
  })
    .index("by_user_id", ["userId"])
    .index("by_video_id", ["videoId"])
    .index("by_user_and_video", ["userId", "videoId"]),

  transcript: defineTable({
    videoId: v.string(),
    userId: v.string(),
    transcript: v.array(
      v.object({
        text: v.string(),
        timestamp: v.string(),
      })
    ),
  })
    .index("by_user_id", ["userId"])
    .index("by_video_id", ["videoId"])
    .index("by_user_and_video", ["userId", "videoId"]),

  images: defineTable({
    storageId: v.id("_storage"),
    userId: v.string(),
    videoId: v.string(),
  })
    .index("by_user_id", ["userId"])
    .index("by_video_id", ["videoId"])
    .index("by_user_and_video", ["userId", "videoId"]),

  titles: defineTable({
    videoId: v.string(),
    userId: v.string(),
    title: v.string(),
  })
    .index("by_user_id", ["userId"])
    .index("by_video_id", ["videoId"])
    .index("by_user_and_video", ["userId", "videoId"]),

  contact: defineTable({
    name: v.string(),
    email: v.string(),
    message: v.string(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_created_at", ["createdAt"]),

  reviews: defineTable({
    userId: v.optional(v.string()),
    userEmail: v.optional(v.string()),
    name: v.string(),
    rating: v.number(),
    comment: v.string(),
    createdAt: v.number(),
  })
    .index("by_created_at", ["createdAt"])
    .index("by_user_id", ["userId"]),

  companies: defineTable({
    name: v.string(),
    userId: v.string(),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    logo: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_created_at", ["createdAt"]),

  referrals: defineTable({
    companyId: v.id("companies"),
    userId: v.string(),
    name: v.string(),
    linkedinUrl: v.optional(v.string()),
    email: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.string(),
    tags: v.optional(v.array(v.string())),
    hasAskedForFinalReferral: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_company_id", ["companyId"])
    .index("by_created_at", ["createdAt"])
    .index("by_company_and_user", ["companyId", "userId"]),

  messages: defineTable({
    userId: v.string(),
    title: v.string(),
    content: v.string(),
    isDefault: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    order: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_created_at", ["createdAt"])
    .index("by_default", ["isDefault"]),

  userProfiles: defineTable({
    userId: v.string(),
    linkedinUrl: v.optional(v.string()),
    twitterUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    onboardingCompleted: v.optional(v.boolean()),
    professionalTitle: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    hideFromLeaderboards: v.optional(v.boolean()),
    profileVisibility: v.optional(v.string()),
    showApplicationsCount: v.optional(v.boolean()),
    showReferralsCount: v.optional(v.boolean()),
    showCompaniesCount: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user_id", ["userId"]),

  // Applications table to store job applications
  applications: defineTable({
    userId: v.string(),
    companyName: v.string(),
    companyId: v.optional(v.id("companies")),
    position: v.string(),
    statusId: v.id("applicationStatuses"),
    dateApplied: v.string(),
    notes: v.optional(v.string()),
    salary: v.optional(v.string()),
    location: v.optional(v.string()),
    url: v.optional(v.string()),
    contactName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    orderIndex: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_company_id", ["companyId"])
    .index("by_status_id", ["statusId"])
    .index("by_created_at", ["createdAt"])
    .index("by_user_and_status", ["userId", "statusId"]),

  // Application statuses table to store custom status columns
  applicationStatuses: defineTable({
    userId: v.string(),
    name: v.string(),
    color: v.string(),
    order: v.number(), // for sorting the columns in UI
    isDefault: v.optional(v.boolean()), // to mark default statuses
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_user_and_order", ["userId", "order"]),

  // Application status history to track when applications change status
  applicationStatusHistory: defineTable({
    userId: v.string(),
    applicationId: v.id("applications"),
    statusId: v.id("applicationStatuses"),
    statusName: v.string(), // Store the name at the time of recording for easier queries
    createdAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_application_id", ["applicationId"])
    .index("by_user_and_status", ["userId", "statusName"]),

  // Achievements table to track user achievements
  achievements: defineTable({
    userId: v.string(),
    category: v.string(), // e.g., "applications", "referrals", "interviews", etc.
    tier: v.string(), // "bronze", "silver", "gold"
    name: v.string(), // Name of the achievement
    description: v.string(), // Description of the achievement
    earnedAt: v.number(), // Timestamp when earned
    progress: v.optional(v.number()), // Current progress toward the achievement (optional)
    requirement: v.optional(v.number()), // Total required for achievement (optional)
    icon: v.optional(v.string()), // Icon identifier (optional)
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_user_and_category", ["userId", "category"])
    .index("by_user_and_tier", ["userId", "tier"]),
});
