import { neon } from "@neondatabase/serverless";

const DATABASE_URL =
  process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function run() {
  console.log("Running migration 0004…");

  await sql`
    CREATE TABLE IF NOT EXISTS "affiliate_products" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "gym_id" uuid NOT NULL REFERENCES "gyms"("id") ON DELETE CASCADE,
      "name" varchar(255) NOT NULL,
      "description" text,
      "image_url" text,
      "affiliate_url" text NOT NULL,
      "tag" varchar(64),
      "goal_tags" jsonb,
      "is_active" boolean DEFAULT true NOT NULL,
      "sort_order" integer DEFAULT 0 NOT NULL,
      "created_at" timestamp with time zone DEFAULT NOW() NOT NULL
    )
  `;
  console.log("✓ affiliate_products table");

  await sql`
    CREATE INDEX IF NOT EXISTS "affiliate_products_gym_id_idx"
    ON "affiliate_products" ("gym_id")
  `;
  console.log("✓ affiliate_products index");

  await sql`
    CREATE TABLE IF NOT EXISTS "affiliate_clicks" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "product_id" uuid NOT NULL REFERENCES "affiliate_products"("id") ON DELETE CASCADE,
      "member_id" uuid REFERENCES "members"("id") ON DELETE SET NULL,
      "gym_id" uuid NOT NULL REFERENCES "gyms"("id") ON DELETE CASCADE,
      "clicked_at" timestamp with time zone DEFAULT NOW() NOT NULL
    )
  `;
  console.log("✓ affiliate_clicks table");

  await sql`
    CREATE INDEX IF NOT EXISTS "affiliate_clicks_product_id_idx"
    ON "affiliate_clicks" ("product_id")
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "affiliate_clicks_gym_id_idx"
    ON "affiliate_clicks" ("gym_id")
  `;
  console.log("✓ affiliate_clicks indexes");

  console.log("\nMigration 0004 complete.");
}

run().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
