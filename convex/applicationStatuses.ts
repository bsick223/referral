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
      { name: "Screening", color: "bg-purple-500" },
      { name: "Interview", color: "bg-indigo-500" },
      { name: "Assessment", color: "bg-cyan-500" },
      { name: "Final Round", color: "bg-emerald-500" },
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
