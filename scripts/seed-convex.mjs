/**
 * Seed script: Creates a demo gym in Convex.
 *
 * Usage:
 *   node scripts/seed-convex.mjs
 *
 * This creates a gym with:
 *   slug: "demo-gym"
 *   password: "gymsync2024"
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import bcrypt from "bcryptjs";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://proficient-dalmatian-47.eu-west-1.convex.cloud";

async function seed() {
  const client = new ConvexHttpClient(CONVEX_URL);

  // Check if demo gym already exists
  const existing = await client.query(api.gyms.getBySlug, { slug: "demo-gym" });
  if (existing) {
    console.log("Demo gym already exists, skipping seed.");
    return;
  }

  // Hash the password
  const passwordHash = await bcrypt.hash("gymsync2024", 10);

  const gymId = await client.mutation(api.gyms.create, {
    slug: "demo-gym",
    name: "Demo Fitness Hub",
    logoUrl: "",
    primaryColor: "#1A56DB",
    trainerName: "Rahul Sharma",
    trainerEmail: "akarshcreate@gmail.com",
    adminEmail: "akarshcreate@gmail.com",
    adminPasswordHash: passwordHash,
    isActive: true,
    plan: "growth",
  });

  console.log("Demo gym created with ID:", gymId);
  console.log("\nLogin credentials:");
  console.log("  Gym slug: demo-gym");
  console.log("  Password: gymsync2024");
}

seed().catch(console.error);
