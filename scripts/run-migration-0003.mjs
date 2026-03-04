import { neon } from "@neondatabase/serverless";

const DATABASE_URL =
  process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function run() {
  console.log("Running migration 0003…");

  await sql`
    CREATE TABLE IF NOT EXISTS "subscription_types" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "gym_id" uuid NOT NULL REFERENCES "gyms"("id") ON DELETE CASCADE,
      "name" varchar(255) NOT NULL,
      "description" text,
      "color" varchar(32) DEFAULT '#5E6AD2' NOT NULL,
      "is_active" boolean DEFAULT true NOT NULL,
      "created_at" timestamp with time zone DEFAULT NOW() NOT NULL
    )
  `;
  console.log("✓ subscription_types table");

  await sql`
    CREATE INDEX IF NOT EXISTS "subscription_types_gym_id_idx"
    ON "subscription_types" ("gym_id")
  `;
  console.log("✓ subscription_types index");

  await sql`
    ALTER TABLE "subscriptions"
    ADD COLUMN IF NOT EXISTS "type_id" uuid REFERENCES "subscription_types"("id") ON DELETE SET NULL
  `;
  console.log("✓ subscriptions.type_id column");

  await sql`
    CREATE INDEX IF NOT EXISTS "subscriptions_type_id_idx"
    ON "subscriptions" ("type_id")
  `;
  console.log("✓ subscriptions type_id index");

  await sql`
    ALTER TABLE "members"
    ADD COLUMN IF NOT EXISTS "portal_otp" varchar(8)
  `;
  console.log("✓ members.portal_otp");

  await sql`
    ALTER TABLE "members"
    ADD COLUMN IF NOT EXISTS "portal_otp_expires_at" timestamp with time zone
  `;
  console.log("✓ members.portal_otp_expires_at");

  await sql`
    ALTER TABLE "members"
    ADD COLUMN IF NOT EXISTS "last_login_at" timestamp with time zone
  `;
  console.log("✓ members.last_login_at");

  console.log("\nMigration 0003 complete.");
}

run().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
