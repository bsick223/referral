import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all applications for a user
export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    // Sort applications by orderIndex (if present) or by dateApplied (descending)
    return applications.sort((a, b) => {
      // If both have orderIndex, use that for sorting
      if (a.orderIndex !== undefined && b.orderIndex !== undefined) {
        return a.orderIndex - b.orderIndex;
      }

      // If only one has orderIndex, the one with orderIndex comes first
      if (a.orderIndex !== undefined) return -1;
      if (b.orderIndex !== undefined) return 1;

      // If neither has orderIndex, sort by dateApplied (newest first)
      return (
        new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime()
      );
    });
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
    // Get all applications in this status
    const existingApps = await ctx.db
      .query("applications")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("statusId"), args.statusId))
      .collect();

    // Increment order index for all existing applications in this status
    const updatePromises = existingApps.map((app) => {
      const currentOrderIndex = app.orderIndex ?? 0;
      return ctx.db.patch(app._id, {
        orderIndex: currentOrderIndex + 1,
        updatedAt: Date.now(),
      });
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    // Create the new application with orderIndex 0 (top position)
    const applicationId = await ctx.db.insert("applications", {
      ...args,
      orderIndex: 0, // Place at the top
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

// Update application order (for drag and drop reordering within a column)
export const updateOrder = mutation({
  args: {
    applicationIds: v.array(v.id("applications")),
    orderIndices: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const { applicationIds, orderIndices } = args;

    if (applicationIds.length !== orderIndices.length) {
      throw new Error(
        "Application IDs and order indices must have the same length"
      );
    }

    // Update each application with its new order index
    const updatePromises = applicationIds.map((id, index) => {
      return ctx.db.patch(id, {
        orderIndex: orderIndices[index],
        updatedAt: Date.now(),
      });
    });

    await Promise.all(updatePromises);
    return applicationIds;
  },
});
