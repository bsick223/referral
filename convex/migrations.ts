import { mutation } from "./_generated/server";
import { v } from "convex/values";

// This migration populates the applicationStatusHistory table with initial data
// from existing applications
export const migrateApplicationStatusHistory = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all applications
    const applications = await ctx.db.query("applications").collect();

    // Process each application
    for (const application of applications) {
      const { _id, userId, statusId } = application;

      // Get the status name
      const status = await ctx.db.get(statusId);
      if (!status) continue;

      // Check if we already have an entry for this application and status
      const existingEntry = await ctx.db
        .query("applicationStatusHistory")
        .withIndex("by_application_id", (q) => q.eq("applicationId", _id))
        .filter((q) => q.eq(q.field("statusId"), statusId))
        .first();

      // Only add if no entry exists
      if (!existingEntry) {
        await ctx.db.insert("applicationStatusHistory", {
          userId,
          applicationId: _id,
          statusId,
          statusName: status.name.toLowerCase(),
          createdAt: application.createdAt,
        });
      }
    }

    return {
      message: "Migration completed successfully",
      count: applications.length,
    };
  },
});
