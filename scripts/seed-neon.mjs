/**
 * Seed script: Creates a demo gym in Neon PostgreSQL.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." node scripts/seed-neon.mjs
 *
 * Run the migration first: psql $DATABASE_URL -f lib/db/migrations/0000_init.sql
 *
 * This creates a gym with:
 *   slug: "demo-gym"
 *   password: "gymsync2024"
 */

import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const DATABASE_URL =
  process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL;
if (!DATABASE_URL) {
  console.error(
    "DATABASE_URL or NEXT_PUBLIC_DATABASE_URL is required. Set it in .env or pass when running.",
  );
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function seed() {
  const passwordHash = await bcrypt.hash("gymsync2024", 10);

  // Check if demo gym already exists (raw query to avoid pulling full schema in ESM script)
  const existing = await sql`
    SELECT id FROM gyms WHERE slug = 'demo-gym' LIMIT 1
  `;
  if (existing.length > 0) {
    console.log("Demo gym already exists, skipping seed.");
    return;
  }

  await sql`
    INSERT INTO gyms (
      slug, name, logo_url, primary_color, trainer_name, trainer_email,
      admin_email, admin_password_hash, is_active, plan
    ) VALUES (
      'demo-gym', 'Demo Fitness Hub', '', '#1A56DB', 'Rahul Sharma',
      'akarshcreate@gmail.com', 'akarshcreate@gmail.com', ${passwordHash},
      true, 'growth'
    )
  `;

  console.log("Demo gym created.");
  console.log("\nLogin credentials:");
  console.log("  Gym slug: demo-gym");
  console.log("  Password: gymsync2024");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
