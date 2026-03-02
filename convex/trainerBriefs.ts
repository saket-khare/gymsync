import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const store = mutation({
  args: {
    memberId: v.id("members"),
    gymId: v.id("gyms"),
    memberSnapshot: v.any(),
    gapAnalysis: v.string(),
    conversationStarters: v.array(v.string()),
    upsellSignal: v.union(
      v.literal("HIGH"),
      v.literal("MEDIUM"),
      v.literal("LOW")
    ),
    upsellReasoning: v.string(),
    redFlags: v.array(v.string()),
    suggestedModifications: v.array(v.string()),
    baselineTestSummary: v.optional(v.string()),
    generatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("trainerBriefs", args);
  },
});

export const getByMember = query({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("trainerBriefs")
      .withIndex("by_memberId", (q) => q.eq("memberId", args.memberId))
      .order("desc")
      .first();
  },
});
