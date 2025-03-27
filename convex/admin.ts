import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { migrateToDefaultStatuses } from "./applicationStatuses";

// Admin function to run the migration for all users
export const runStatusMigration = mutation({
  args: { adminSecret: v.string() },
  handler: async (ctx, args) => {
    // Simple admin validation - in production you'd want better auth
    if (args.adminSecret !== process.env.ADMIN_SECRET) {
      throw new Error("Unauthorized");
    }

    // Run the migration
    return await migrateToDefaultStatuses(ctx, {});
  },
});
