import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Create a default message template if none exists for the user
export const ensureDefaultTemplate = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Check if user already has messages
    const existingMessages = await ctx.db
      .query("messages")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    // If no messages exist, create a default one
    if (existingMessages.length === 0) {
      await ctx.db.insert("messages", {
        userId: args.userId,
        title: "Default Connection Request",
        content:
          "Hi [Name], I noticed you work at [Company]. I'm looking to explore opportunities there and would appreciate your insights. Would you be open to a quick chat?",
        isDefault: true,
        tags: ["connection|0", "networking|1"],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return true;
  },
});
