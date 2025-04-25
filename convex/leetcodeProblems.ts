import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all leetcode problems for a user
export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const problems = await ctx.db
      .query("leetcodeProblems")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    // Sort problems by orderIndex (if present) or by createdAt (descending)
    return problems.sort((a, b) => {
      // If both have orderIndex, use that for sorting
      if (a.orderIndex !== undefined && b.orderIndex !== undefined) {
        return a.orderIndex - b.orderIndex;
      }

      // If only one has orderIndex, the one with orderIndex comes first
      if (a.orderIndex !== undefined) return -1;
      if (b.orderIndex !== undefined) return 1;

      // If neither has orderIndex, sort by createdAt (newest first)
      return b.createdAt - a.createdAt;
    });
  },
});

// Get a problem by ID
export const getById = query({
  args: { id: v.id("leetcodeProblems") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new leetcode problem
export const create = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    statusId: v.id("leetcodeStatuses"),
    link: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    notes: v.optional(v.string()),
    score: v.number(), // 1-5 rating that determines review scheduling
    spaceComplexity: v.optional(v.string()),
    timeComplexity: v.optional(v.string()),
    dayOfWeek: v.number(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get all problems in this status
    const existingProblems = await ctx.db
      .query("leetcodeProblems")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("statusId"), args.statusId),
          q.eq(q.field("dayOfWeek"), args.dayOfWeek)
        )
      )
      .collect();

    // Increment order index for all existing problems in this status
    const updatePromises = existingProblems.map((problem) => {
      const currentOrderIndex = problem.orderIndex ?? 0;
      return ctx.db.patch(problem._id, {
        orderIndex: currentOrderIndex + 1,
        updatedAt: Date.now(),
      });
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    // Create the new problem with orderIndex 0 (top position)
    const problemId = await ctx.db.insert("leetcodeProblems", {
      ...args,
      orderIndex: 0, // Place at the top
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return problemId;
  },
});

// Update a leetcode problem
export const update = mutation({
  args: {
    id: v.id("leetcodeProblems"),
    title: v.optional(v.string()),
    statusId: v.optional(v.id("leetcodeStatuses")),
    link: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    notes: v.optional(v.string()),
    score: v.optional(v.number()),
    spaceComplexity: v.optional(v.string()),
    timeComplexity: v.optional(v.string()),
    dayOfWeek: v.optional(v.number()),
    mastered: v.optional(v.boolean()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const existing = await ctx.db.get(id);

    if (!existing) {
      throw new Error("Problem not found");
    }

    await ctx.db.patch(id, {
      ...fields,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Delete a leetcode problem
export const remove = mutation({
  args: { id: v.id("leetcodeProblems") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);

    if (!existing) {
      throw new Error("Problem not found");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Update problem status (for drag and drop)
export const updateStatus = mutation({
  args: {
    id: v.id("leetcodeProblems"),
    statusId: v.id("leetcodeStatuses"),
    dayOfWeek: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);

    if (!existing) {
      throw new Error("Problem not found");
    }

    await ctx.db.patch(args.id, {
      statusId: args.statusId,
      dayOfWeek: args.dayOfWeek,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Count problems by status for a user
export const countByStatus = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const problems = await ctx.db
      .query("leetcodeProblems")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    // Group and count problems by status
    const counts = problems.reduce((acc, problem) => {
      const statusId = problem.statusId;
      acc[statusId] = (acc[statusId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return counts;
  },
});

// Update problem order (for drag and drop reordering within a column)
export const updateOrder = mutation({
  args: {
    problemIds: v.array(v.id("leetcodeProblems")),
    orderIndices: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const { problemIds, orderIndices } = args;

    if (problemIds.length !== orderIndices.length) {
      throw new Error(
        "Problem IDs and order indices must have the same length"
      );
    }

    // Update each problem with its new order index
    const updatePromises = problemIds.map((id, index) => {
      return ctx.db.patch(id, {
        orderIndex: orderIndices[index],
        updatedAt: Date.now(),
      });
    });

    await Promise.all(updatePromises);
    return problemIds;
  },
});
