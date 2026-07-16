import { PrismaClient } from "@maplewealth/db";

// Next.js dev-hot-reload-safe singleton: without this, every HMR reload of a module
// that imports prisma would create a brand-new PrismaClient (and a new pool of DB
// connections) on top of the ones from the previous reload.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
