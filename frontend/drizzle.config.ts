// drizzle.config.ts
import type { Config } from "drizzle-kit";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Exclude backend tables managed by Alembic (FastAPI)
  tablesFilter: ["!ideas", "!alembic_version"],
} satisfies Config;
