import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  gyms: defineTable({
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
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_adminEmail", ["adminEmail"])
    .index("by_plan", ["plan"]),

  members: defineTable({
    gymId: v.id("gyms"),
    gymSlug: v.string(),
    rowId: v.string(),
    // Personal
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
    // Goals
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
    // Current Status
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
    // Lifestyle
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
    // Commitment
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
    // Fitness Test (optional)
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
    // Metadata
    submittedAt: v.string(),
    processingStatus: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("processed"),
      v.literal("failed")
    ),
    mealPlanGenerated: v.boolean(),
    emailSent: v.boolean(),
    day3Sent: v.boolean(),
    day7Sent: v.boolean(),
    day30Sent: v.boolean(),
  })
    .index("by_rowId", ["rowId"])
    .index("by_gymId", ["gymId"])
    .index("by_gymSlug", ["gymSlug"])
    .index("by_gymSlug_and_status", ["gymSlug", "processingStatus"]),

  mealPlans: defineTable({
    memberId: v.id("members"),
    gymId: v.id("gyms"),
    memberName: v.string(),
    goal: v.string(),
    weeklyCalorieTarget: v.number(),
    days: v.any(), // MealPlanDay[] — complex nested structure
    generalGuidelines: v.array(v.string()),
    foodsToAvoid: v.array(v.string()),
    supplementSuggestions: v.optional(v.array(v.string())),
    generatedAt: v.string(),
  })
    .index("by_memberId", ["memberId"])
    .index("by_gymId", ["gymId"]),

  trainerBriefs: defineTable({
    memberId: v.id("members"),
    gymId: v.id("gyms"),
    memberSnapshot: v.any(), // complex nested object
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
  })
    .index("by_memberId", ["memberId"])
    .index("by_gymId", ["gymId"]),
});
