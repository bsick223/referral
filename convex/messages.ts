import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all messages for a user
export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return messages;
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
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      userId: args.userId,
      title: args.title,
      content: args.content,
      isDefault: args.isDefault || false,
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
