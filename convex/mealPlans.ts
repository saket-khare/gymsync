import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const store = mutation({
  args: {
    memberId: v.id("members"),
    gymId: v.id("gyms"),
    memberName: v.string(),
    goal: v.string(),
    weeklyCalorieTarget: v.number(),
    days: v.any(),
    generalGuidelines: v.array(v.string()),
    foodsToAvoid: v.array(v.string()),
    supplementSuggestions: v.optional(v.array(v.string())),
    generatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("mealPlans", args);
  },
});

export const getByMember = query({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mealPlans")
      .withIndex("by_memberId", (q) => q.eq("memberId", args.memberId))
      .order("desc")
      .first();
  },
});
