import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all companies for a user
export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const companies = await ctx.db
      .query("companies")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return companies;
  },
});

// Get a single company by ID
export const getById = query({
  args: { id: v.id("companies") },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.id);
    return company;
  },
});

// Create a new company
export const create = mutation({
  args: {
    name: v.string(),
    userId: v.string(),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    logo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const companyId = await ctx.db.insert("companies", {
      name: args.name,
      userId: args.userId,
      description: args.description,
      website: args.website,
      logo: args.logo,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return companyId;
  },
});

// Update an existing company
export const update = mutation({
  args: {
    id: v.id("companies"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    logo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Get the existing company
    const existingCompany = await ctx.db.get(id);
    if (!existingCompany) {
      throw new Error("Company not found");
    }

    // Update with new values
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Delete a company
export const remove = mutation({
  args: { id: v.id("companies") },
  handler: async (ctx, args) => {
    // Get the existing company
    const existingCompany = await ctx.db.get(args.id);
    if (!existingCompany) {
      throw new Error("Company not found");
    }

    // Delete the company
    await ctx.db.delete(args.id);

    return args.id;
  },
});
