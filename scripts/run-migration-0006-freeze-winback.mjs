import { neon } from "@neondatabase/serverless";

const DATABASE_URL =
  "postgresql://neondb_owner:npg_Qy7x5YoXevib@ep-quiet-mountain-a10s9dd4-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
// process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function run() {
  console.log(
    "Running migration 0006 (freeze + winback fields on subscriptions)…",
  );

  await sql`
    ALTER TABLE "subscriptions"
    ADD COLUMN IF NOT EXISTS "freeze_start_date" date
  `;
  await sql`
    ALTER TABLE "subscriptions"
    ADD COLUMN IF NOT EXISTS "freeze_end_date" date
  `;
  await sql`
    ALTER TABLE "subscriptions"
    ADD COLUMN IF NOT EXISTS "original_end_date" date
  `;
  console.log("✓ subscriptions freeze columns");

  await sql`
    ALTER TABLE "subscriptions"
    ADD COLUMN IF NOT EXISTS "winback_day7_sent" boolean NOT NULL DEFAULT false
  `;
  await sql`
    ALTER TABLE "subscriptions"
    ADD COLUMN IF NOT EXISTS "winback_day30_sent" boolean NOT NULL DEFAULT false
  `;
  await sql`
    ALTER TABLE "subscriptions"
    ADD COLUMN IF NOT EXISTS "winback_day60_sent" boolean NOT NULL DEFAULT false
  `;
  console.log("✓ subscriptions winback columns");

  console.log("\nMigration 0006 complete.");
}

run().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
