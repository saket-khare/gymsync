import { neon } from "@neondatabase/serverless";

const DATABASE_URL =
  process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function run() {
  console.log("Running migration 0007 (onboarding_extras)…");

  await sql`
    ALTER TABLE "members"
    ADD COLUMN IF NOT EXISTS "onboarding_extras" jsonb
  `;
  console.log("✓ members.onboarding_extras");

  console.log("\nMigration 0007 complete.");
}

run().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
