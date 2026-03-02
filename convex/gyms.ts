import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("gyms")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const getByAdminEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("gyms")
      .withIndex("by_adminEmail", (q) => q.eq("adminEmail", args.email))
      .first();
  },
});

export const create = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    logoUrl: v.string(),
    primaryColor: v.string(),
    trainerName: v.string(),
    trainerEmail: v.string(),
    adminEmail: v.string(),
    adminPasswordHash: v.string(),
    googleSheetId: v.optional(v.string()),
    isActive: v.boolean(),
    plan: v.union(v.literal("starter"), v.literal("growth"), v.literal("pro")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("gyms", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("gyms"),
    slug: v.optional(v.string()),
    name: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    trainerName: v.optional(v.string()),
    trainerEmail: v.optional(v.string()),
    adminEmail: v.optional(v.string()),
    adminPasswordHash: v.optional(v.string()),
    googleSheetId: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    plan: v.optional(
      v.union(v.literal("starter"), v.literal("growth"), v.literal("pro"))
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    // Filter out undefined values
    const cleanUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }
    await ctx.db.patch(id, cleanUpdates);
  },
});
