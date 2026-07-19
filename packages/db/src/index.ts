import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Prisma compatibility exports
export * from "@prisma/client";

// Drizzle Schema exports
export * as schema from "./schema";
export * from "./schema";

// Drizzle Client initialisation
// Supabase DATABASE_URL can be loaded from process.env
const databaseUrl = process.env.DATABASE_URL || "";

// Configure postgres-js client
export const client = postgres(databaseUrl, {
  prepare: false, // Disable prepared statements for serverless/pooler compatibility
});

export const db = drizzle(client, { schema });
