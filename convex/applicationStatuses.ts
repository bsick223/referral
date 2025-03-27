import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all application statuses for a user, ordered by their position
export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const statuses = await ctx.db
      .query("applicationStatuses")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    return statuses.sort((a, b) => a.order - b.order);
  },
});

// Get a status by ID
export const getById = query({
  args: { id: v.id("applicationStatuses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new application status (column)
export const create = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    color: v.string(),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Find the highest order to place this at the end
    const statuses = await ctx.db
      .query("applicationStatuses")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    const maxOrder =
      statuses.length > 0
        ? Math.max(...statuses.map((status) => status.order))
        : -1;

    const statusId = await ctx.db.insert("applicationStatuses", {
      userId: args.userId,
      name: args.name,
      color: args.color,
      order: maxOrder + 1,
      isDefault: args.isDefault ?? false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return statusId;
  },
});

// Update a status
export const update = mutation({
  args: {
    id: v.id("applicationStatuses"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const existing = await ctx.db.get(id);

    if (!existing) {
      throw new Error("Status not found");
    }

    // Prevent renaming default statuses
    if (existing.isDefault && fields.name && fields.name !== existing.name) {
      throw new Error("Cannot rename default status");
    }

    await ctx.db.patch(id, {
      ...fields,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Delete a status
export const remove = mutation({
  args: {
    id: v.id("applicationStatuses"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);

    if (!existing) {
      throw new Error("Status not found");
    }

    // Prevent deletion of default statuses
    if (existing.isDefault) {
      throw new Error("Cannot delete default status");
    }

    // Get all applications with this status
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_status_id", (q) => q.eq("statusId", args.id))
      .collect();

    // Delete all applications in this status
    for (const app of applications) {
      await ctx.db.delete(app._id);
    }

    // Delete the status
    await ctx.db.delete(args.id);

    // Reorder remaining statuses to maintain sequence
    const statuses = await ctx.db
      .query("applicationStatuses")
      .withIndex("by_user_id", (q) => q.eq("userId", existing.userId))
      .collect();

    const sortedStatuses = statuses.sort((a, b) => a.order - b.order);

    // Update order values
    for (let i = 0; i < sortedStatuses.length; i++) {
      await ctx.db.patch(sortedStatuses[i]._id, { order: i });
    }

    return args.id;
  },
});

// Reorder statuses
export const reorder = mutation({
  args: {
    userId: v.string(),
    statusId: v.id("applicationStatuses"),
    newOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const status = await ctx.db.get(args.statusId);

    if (!status) {
      throw new Error("Status not found");
    }

    // Get all statuses for this user
    const statuses = await ctx.db
      .query("applicationStatuses")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    const sortedStatuses = statuses.sort((a, b) => a.order - b.order);

    const oldOrder = status.order;
    const newOrder = Math.max(
      0,
      Math.min(args.newOrder, sortedStatuses.length - 1)
    );

    // Skip if no change
    if (oldOrder === newOrder) {
      return args.statusId;
    }

    // Update orders for all affected statuses
    if (oldOrder < newOrder) {
      // Moving right, decrement items in between
      for (const s of sortedStatuses) {
        if (s.order > oldOrder && s.order <= newOrder) {
          await ctx.db.patch(s._id, { order: s.order - 1 });
        }
      }
    } else {
      // Moving left, increment items in between
      for (const s of sortedStatuses) {
        if (s.order >= newOrder && s.order < oldOrder) {
          await ctx.db.patch(s._id, { order: s.order + 1 });
        }
      }
    }

    // Update the status being moved
    await ctx.db.patch(args.statusId, {
      order: newOrder,
      updatedAt: Date.now(),
    });

    return args.statusId;
  },
});

// Initialize default statuses for a new user
export const initializeDefaultStatuses = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Check if user already has statuses
    const existing = await ctx.db
      .query("applicationStatuses")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    if (existing.length > 0) {
      return; // User already has statuses
    }

    // Define default statuses
    const defaultStatuses = [
      { name: "Applied", color: "bg-blue-500" },
      { name: "Follow-up", color: "bg-purple-500" },
      { name: "Interview", color: "bg-indigo-500" },
      { name: "Offer", color: "bg-green-500" },
      { name: "Rejected", color: "bg-red-500" },
    ];

    // Create default statuses
    for (let i = 0; i < defaultStatuses.length; i++) {
      await ctx.db.insert("applicationStatuses", {
        userId: args.userId,
        name: defaultStatuses[i].name,
        color: defaultStatuses[i].color,
        order: i,
        isDefault: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Get all application statuses for leaderboards
export const getAllStatuses = query({
  args: {},
  handler: async (ctx) => {
    const statuses = await ctx.db.query("applicationStatuses").collect();
    return statuses;
  },
});

// Migrate all users to have the standard default statuses
export const migrateToDefaultStatuses = mutation({
  args: {},
  handler: async (ctx) => {
    // Define the expected default statuses with their standardized names
    const defaultStatusNames = [
      "Applied",
      "Follow-up",
      "Interview",
      "Offer",
      "Rejected",
    ];

    // Get all users with their statuses
    const allStatuses = await ctx.db.query("applicationStatuses").collect();

    // Group statuses by user
    const userStatusesMap = new Map();
    for (const status of allStatuses) {
      if (!userStatusesMap.has(status.userId)) {
        userStatusesMap.set(status.userId, []);
      }
      userStatusesMap.get(status.userId).push(status);
    }

    // Process each user
    const results = {
      processed: 0,
      updated: 0,
      created: 0,
    };

    for (const [userId, userStatuses] of userStatusesMap.entries()) {
      results.processed++;

      // Check if user has any statuses marked as default
      const hasDefaultStatuses = userStatuses.some(
        (s: any) => s.isDefault === true
      );

      // If user has no default statuses, mark existing ones with matching names as default
      // or create new ones if they don't exist
      for (let i = 0; i < defaultStatusNames.length; i++) {
        const defaultName = defaultStatusNames[i];
        const existingStatus = userStatuses.find(
          (s: any) => s.name.toLowerCase() === defaultName.toLowerCase()
        );

        if (existingStatus) {
          // Update existing status with matching name to be default
          if (!existingStatus.isDefault) {
            await ctx.db.patch(existingStatus._id, {
              isDefault: true,
              order: i, // ensure correct ordering
            });
            results.updated++;
          }
        } else {
          // Create missing default status
          const defaultColors = [
            "bg-blue-500",
            "bg-purple-500",
            "bg-indigo-500",
            "bg-green-500",
            "bg-red-500",
          ];

          await ctx.db.insert("applicationStatuses", {
            userId,
            name: defaultName,
            color: defaultColors[i] || "bg-gray-500",
            order: i,
            isDefault: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
          results.created++;
        }
      }
    }

    return results;
  },
});
