import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all messages for a user
export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    // Sort by order if available, otherwise by creation time (most recent first)
    return messages.sort((a, b) => {
      // If both have order, sort by order
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      // If only one has order, put the one with order first
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      // Default sort by creation time (newest first)
      return b.createdAt - a.createdAt;
    });
  },
});

// Get a single message by ID
export const getById = query({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.id);
    return message;
  },
});

// Create a new message
export const create = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    content: v.string(),
    isDefault: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get highest order number
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    const maxOrder =
      messages.length > 0 ? Math.max(...messages.map((m) => m.order ?? 0)) : -1;

    const messageId = await ctx.db.insert("messages", {
      userId: args.userId,
      title: args.title,
      content: args.content,
      isDefault: args.isDefault || false,
      tags: args.tags || [],
      order: args.order ?? maxOrder + 1, // Default to placing at the end
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return messageId;
  },
});

// Update an existing message
export const update = mutation({
  args: {
    id: v.id("messages"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Get the existing message
    const existingMessage = await ctx.db.get(id);
    if (!existingMessage) {
      throw new Error("Message not found");
    }

    // Update with new values
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Delete a message
export const remove = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    // Get the existing message
    const existingMessage = await ctx.db.get(args.id);
    if (!existingMessage) {
      throw new Error("Message not found");
    }

    // Delete the message
    await ctx.db.delete(args.id);

    return args.id;
  },
});
