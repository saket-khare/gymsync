import { neon } from "@neondatabase/serverless";

const DATABASE_URL =
  process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function run() {
  console.log("Running migration 0008 (lead_substatus)…");

  await sql`
    ALTER TABLE "members"
    ADD COLUMN IF NOT EXISTS "lead_substatus" varchar(32) NOT NULL DEFAULT 'new'
  `;
  console.log("✓ members.lead_substatus");

  console.log("\nMigration 0008 complete.");
}

run().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
