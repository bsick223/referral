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
    linkedinUrl: v.string(),
    email: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_company_id", ["companyId"])
    .index("by_created_at", ["createdAt"])
    .index("by_company_and_user", ["companyId", "userId"]),
});
