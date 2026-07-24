import path from "node:path";
import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

// Single source of truth for env vars lives in apps/web/.env (the file Next.js
// actually reads). Load it explicitly here instead of duplicating values in a
// root-level .env.
dotenv.config({ path: path.resolve(__dirname, "../../apps/web/.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../../apps/web/.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
});
