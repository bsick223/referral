import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all applications for a user
export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("applications")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Get an application by ID
export const getById = query({
  args: { id: v.id("applications") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new application
export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const applicationId = await ctx.db.insert("applications", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return applicationId;
  },
});

// Update an application
export const update = mutation({
  args: {
    id: v.id("applications"),
    companyName: v.optional(v.string()),
    companyId: v.optional(v.id("companies")),
    position: v.optional(v.string()),
    statusId: v.optional(v.id("applicationStatuses")),
    dateApplied: v.optional(v.string()),
    notes: v.optional(v.string()),
    salary: v.optional(v.string()),
    location: v.optional(v.string()),
    url: v.optional(v.string()),
    contactName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const existing = await ctx.db.get(id);

    if (!existing) {
      throw new Error("Application not found");
    }

    await ctx.db.patch(id, {
      ...fields,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Delete an application
export const remove = mutation({
  args: { id: v.id("applications") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);

    if (!existing) {
      throw new Error("Application not found");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Update application status (for drag and drop)
export const updateStatus = mutation({
  args: {
    id: v.id("applications"),
    statusId: v.id("applicationStatuses"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);

    if (!existing) {
      throw new Error("Application not found");
    }

    await ctx.db.patch(args.id, {
      statusId: args.statusId,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Count applications by status for a user
export const countByStatus = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    // Group and count applications by status
    const counts = applications.reduce((acc, app) => {
      const statusId = app.statusId;
      acc[statusId] = (acc[statusId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return counts;
  },
});
