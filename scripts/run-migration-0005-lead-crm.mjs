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
  console.log("Running migration 0005 (lead/CRM + PT offer fields)…");

  await sql`
    ALTER TABLE "members"
    ADD COLUMN IF NOT EXISTS "member_status" varchar(32) NOT NULL DEFAULT 'lead'
  `;
  console.log("✓ members.member_status");

  await sql`
    ALTER TABLE "members"
    ADD COLUMN IF NOT EXISTS "lead_source" varchar(32)
  `;
  console.log("✓ members.lead_source");

  await sql`
    ALTER TABLE "members"
    ADD COLUMN IF NOT EXISTS "converted_at" timestamp with time zone
  `;
  console.log("✓ members.converted_at");

  await sql`
    ALTER TABLE "members"
    ADD COLUMN IF NOT EXISTS "follow_up_day1_sent" boolean NOT NULL DEFAULT false
  `;
  await sql`
    ALTER TABLE "members"
    ADD COLUMN IF NOT EXISTS "follow_up_day3_sent" boolean NOT NULL DEFAULT false
  `;
  await sql`
    ALTER TABLE "members"
    ADD COLUMN IF NOT EXISTS "follow_up_day7_sent" boolean NOT NULL DEFAULT false
  `;
  await sql`
    ALTER TABLE "members"
    ADD COLUMN IF NOT EXISTS "follow_up_day14_sent" boolean NOT NULL DEFAULT false
  `;
  await sql`
    ALTER TABLE "members"
    ADD COLUMN IF NOT EXISTS "follow_up_day30_sent" boolean NOT NULL DEFAULT false
  `;
  console.log("✓ members follow_up_* columns");

  await sql`
    ALTER TABLE "members"
    ADD COLUMN IF NOT EXISTS "pt_offer_sent" boolean NOT NULL DEFAULT false
  `;
  await sql`
    ALTER TABLE "members"
    ADD COLUMN IF NOT EXISTS "pt_offer_sent_at" timestamp with time zone
  `;
  console.log("✓ members pt_offer_sent, pt_offer_sent_at");

  await sql`
    CREATE INDEX IF NOT EXISTS "members_member_status_idx"
    ON "members" ("member_status")
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "members_lead_source_idx"
    ON "members" ("lead_source")
  `;
  console.log("✓ members indexes");

  // Existing members who have subscriptions are considered converted
  await sql`
    UPDATE "members" m
    SET member_status = 'converted', converted_at = COALESCE(m.converted_at, NOW())
    WHERE m.member_status = 'lead'
    AND EXISTS (SELECT 1 FROM "subscriptions" s WHERE s.member_id = m.id)
  `;
  console.log("✓ backfill converted status for members with subscriptions");

  console.log("\nMigration 0005 complete.");
}

run().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
