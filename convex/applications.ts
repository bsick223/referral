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

    // Get status name for history
    const status = await ctx.db.get(args.statusId);
    if (status) {
      // Record initial status in history
      await ctx.db.insert("applicationStatusHistory", {
        userId: args.userId,
        applicationId,
        statusId: args.statusId,
        statusName: status.name.toLowerCase(),
        createdAt: Date.now(),
      });
    }

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

    // Check if status is being updated
    if (
      fields.statusId &&
      existing.statusId.toString() !== fields.statusId.toString()
    ) {
      // Get status name for history
      const status = await ctx.db.get(fields.statusId);
      if (status) {
        // Record status change in history
        await ctx.db.insert("applicationStatusHistory", {
          userId: existing.userId,
          applicationId: id,
          statusId: fields.statusId,
          statusName: status.name.toLowerCase(),
          createdAt: Date.now(),
        });
      }
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

    // Only record history if status actually changed
    if (existing.statusId.toString() !== args.statusId.toString()) {
      // Get status name for history
      const status = await ctx.db.get(args.statusId);
      if (status) {
        // Record status change in history
        await ctx.db.insert("applicationStatusHistory", {
          userId: existing.userId,
          applicationId: args.id,
          statusId: args.statusId,
          statusName: status.name.toLowerCase(),
          createdAt: Date.now(),
        });
      }
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

// Get all applications for the leaderboards
export const getAllApplications = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("applications").collect();
  },
});

// Get application status history for a user
export const getStatusHistory = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("applicationStatusHistory")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Count unique applications that have entered each status for a user
export const countUniqueStatusEntries = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const history = await ctx.db
      .query("applicationStatusHistory")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    // Group by application ID and status name
    const statusEntries: Record<string, Set<string>> = {};

    // For each status, track unique application IDs
    history.forEach((entry) => {
      const statusName = entry.statusName.toLowerCase();
      if (!statusEntries[statusName]) {
        statusEntries[statusName] = new Set();
      }
      statusEntries[statusName].add(entry.applicationId.toString());
    });

    // Convert sets to counts
    const counts: Record<string, number> = {};
    for (const [status, appIds] of Object.entries(statusEntries)) {
      counts[status] = appIds.size;
    }

    return counts;
  },
});

// Fetch applications for community timeline with pagination
export const getCommunityApplications = query({
  args: {
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const skip = args.skip || 0;
    const searchQuery = args.searchQuery?.toLowerCase() || "";

    // Fetch all applications
    const applications = await ctx.db
      .query("applications")
      .order("desc")
      .collect();

    // Filter applications based on search query if provided
    const filteredApplications = searchQuery
      ? applications.filter(
          (app) =>
            app.companyName.toLowerCase().includes(searchQuery) ||
            app.position.toLowerCase().includes(searchQuery) ||
            (app.location && app.location.toLowerCase().includes(searchQuery))
        )
      : applications;

    // Get user profiles to check privacy settings
    const userIds = [...new Set(filteredApplications.map((app) => app.userId))];
    const userProfiles: Record<string, any> = {};

    for (const userId of userIds) {
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .first();
      userProfiles[userId] = profile;
    }

    // Filter out applications where the user has opted out
    const visibleApplications = filteredApplications.filter((app) => {
      const profile = userProfiles[app.userId];
      return (
        // Include application if no profile (default to show) or explicitly opted in
        !profile || profile.showApplicationsInCommunity !== false
      );
    });

    // Get application statuses for each application
    const statusMap = new Map();
    const statusIds = [
      ...new Set(visibleApplications.map((app) => app.statusId)),
    ];

    for (const statusId of statusIds) {
      const status = await ctx.db.get(statusId);
      if (status) {
        statusMap.set(statusId.toString(), status);
      }
    }

    // Apply pagination
    const paginatedApplications = visibleApplications
      .sort((a, b) => b.createdAt - a.createdAt) // Sort by timestamp (newest first)
      .slice(skip, skip + limit);

    // Calculate if there are more results
    const hasMore = skip + limit < visibleApplications.length;

    // Format the applications with user and status information
    const formattedApplications = await Promise.all(
      paginatedApplications.map(async (app) => {
        // Get user info from Clerk
        let userName = "Anonymous";
        let userImageUrl = "";

        // Get status info
        const status = statusMap.get(app.statusId.toString());
        const statusName = status ? status.name : "Unknown";
        const statusColor = status ? status.color : "bg-gray-500";

        // Format date
        const dateApplied = new Date(app.dateApplied).toLocaleDateString();

        return {
          id: app._id.toString(),
          companyName: app.companyName,
          position: app.position,
          location: app.location || "Remote",
          dateApplied,
          timestamp: app.createdAt,
          userId: app.userId,
          userName,
          userImageUrl,
          statusName,
          statusColor,
        };
      })
    );

    return {
      applications: formattedApplications,
      hasMore,
      nextSkip: hasMore ? skip + limit : null,
      total: visibleApplications.length,
    };
  },
});

// Search applications for community search
export const searchCommunityApplications = query({
  args: {
    searchQuery: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const searchQuery = args.searchQuery.toLowerCase();

    // Get all applications
    const applications = await ctx.db.query("applications").collect();

    // Filter by search term
    const filteredApplications = applications.filter(
      (app) =>
        app.companyName.toLowerCase().includes(searchQuery) ||
        app.position.toLowerCase().includes(searchQuery) ||
        (app.location && app.location.toLowerCase().includes(searchQuery))
    );

    // Get user profiles to check privacy settings
    const userIds = [...new Set(filteredApplications.map((app) => app.userId))];
    const userProfiles: Record<string, any> = {};

    for (const userId of userIds) {
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .first();
      userProfiles[userId] = profile;
    }

    // Get application statuses for each application
    const statusMap = new Map();
    const statusIds = [
      ...new Set(filteredApplications.map((app) => app.statusId)),
    ];

    for (const statusId of statusIds) {
      const status = await ctx.db.get(statusId);
      if (status) {
        statusMap.set(statusId.toString(), status);
      }
    }

    // Filter out applications where the user has opted out
    const visibleApplications = filteredApplications.filter((app) => {
      const profile = userProfiles[app.userId];
      return (
        // Include application if no profile (default to show) or explicitly opted in
        !profile || profile.showApplicationsInCommunity !== false
      );
    });

    // Format the applications with user and status information
    const formattedApplications = await Promise.all(
      visibleApplications.slice(0, limit).map(async (app) => {
        // Get user info from Clerk
        let userName = "Anonymous";
        let userImageUrl = "";

        // Get status info
        const status = statusMap.get(app.statusId.toString());
        const statusName = status ? status.name : "Unknown";
        const statusColor = status ? status.color : "bg-gray-500";

        // Format date
        const dateApplied = new Date(app.dateApplied).toLocaleDateString();

        return {
          id: app._id.toString(),
          companyName: app.companyName,
          position: app.position,
          location: app.location || "Remote",
          dateApplied,
          timestamp: app.createdAt,
          userId: app.userId,
          userName,
          userImageUrl,
          statusName,
          statusColor,
        };
      })
    );

    // Sort by timestamp (newest first)
    formattedApplications.sort((a, b) => b.timestamp - a.timestamp);

    return {
      applications: formattedApplications,
      total: visibleApplications.length,
    };
  },
});
