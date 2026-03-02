import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const create = mutation({
  args: {
    gymId: v.id("gyms"),
    gymSlug: v.string(),
    rowId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    age: v.number(),
    gender: v.union(
      v.literal("male"),
      v.literal("female"),
      v.literal("other"),
      v.literal("prefer_not_to_say")
    ),
    city: v.string(),
    primaryGoal: v.union(
      v.literal("weight_loss"),
      v.literal("muscle_gain"),
      v.literal("aesthetic"),
      v.literal("athletic_performance"),
      v.literal("general_fitness"),
      v.literal("competition_prep")
    ),
    goalUrgency: v.union(
      v.literal("casual"),
      v.literal("moderate"),
      v.literal("aggressive")
    ),
    timelineMonths: v.number(),
    goalDetails: v.optional(v.string()),
    weightKg: v.number(),
    heightCm: v.number(),
    bodyFatPercent: v.optional(v.number()),
    selfRatedFitness: v.number(),
    gymExperience: v.union(
      v.literal("complete_beginner"),
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    ),
    dietType: v.union(
      v.literal("vegetarian"),
      v.literal("non_vegetarian"),
      v.literal("vegan"),
      v.literal("eggetarian"),
      v.literal("keto"),
      v.literal("other")
    ),
    sleepHoursPerNight: v.number(),
    stressLevel: v.number(),
    occupationType: v.union(
      v.literal("desk_job"),
      v.literal("active_job"),
      v.literal("student"),
      v.literal("freelance"),
      v.literal("other")
    ),
    medicalConditions: v.optional(v.string()),
    injuries: v.optional(v.string()),
    foodAllergies: v.optional(v.string()),
    daysPerWeekAvailable: v.number(),
    sessionDurationMinutes: v.number(),
    hasHomeEquipment: v.boolean(),
    interestedInPT: v.union(
      v.literal("yes"),
      v.literal("maybe"),
      v.literal("no")
    ),
    budgetForSupplements: v.union(
      v.literal("none"),
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    ),
    pushUpCount: v.optional(v.number()),
    plankHoldSeconds: v.optional(v.number()),
    flexibilityTest: v.optional(
      v.union(
        v.literal("touch_toes"),
        v.literal("almost"),
        v.literal("cant_reach")
      )
    ),
    restingHeartRate: v.optional(v.number()),
    submittedAt: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("members", {
      ...args,
      processingStatus: "pending" as const,
      mealPlanGenerated: false,
      emailSent: false,
      day3Sent: false,
      day7Sent: false,
      day30Sent: false,
    });
  },
});

export const update = mutation({
  args: {
    rowId: v.string(),
    processingStatus: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("processing"),
        v.literal("processed"),
        v.literal("failed")
      )
    ),
    mealPlanGenerated: v.optional(v.boolean()),
    emailSent: v.optional(v.boolean()),
    day3Sent: v.optional(v.boolean()),
    day7Sent: v.optional(v.boolean()),
    day30Sent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { rowId, ...updates } = args;
    const member = await ctx.db
      .query("members")
      .withIndex("by_rowId", (q) => q.eq("rowId", rowId))
      .first();

    if (!member) {
      throw new Error(`Member not found for rowId: ${rowId}`);
    }

    const cleanUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }

    await ctx.db.patch(member._id, cleanUpdates);
  },
});

export const getByRowId = query({
  args: { rowId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("members")
      .withIndex("by_rowId", (q) => q.eq("rowId", args.rowId))
      .first();
  },
});

export const listByGym = query({
  args: { gymSlug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("members")
      .withIndex("by_gymSlug", (q) => q.eq("gymSlug", args.gymSlug))
      .collect();
  },
});
