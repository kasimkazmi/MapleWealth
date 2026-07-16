import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../lib/prisma";

// The Prisma schema's User/Session/AuthAccount/Verification models were shaped to match
// Better Auth's Prisma adapter expectations almost exactly (token/expiresAt/ipAddress/
// userAgent on Session; providerId/password/accessToken on AuthAccount). The only mismatch
// is the model name for the "account" concept (`AuthAccount` instead of the default
// `Account`) — everything else is field-for-field identical, so only `modelName` mapping
// is needed below, no field-level remapping.
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  // Single active session per user, mirroring the previous NestJS AuthService behavior
  // (`session.deleteMany({ where: { userId } })` before creating a new one on login).
  session: {
    modelName: "session",
    expiresIn: 60 * 60 * 24 * 7, // 7 days, matches the old SESSION_TTL_MS
    updateAge: 60 * 60 * 24, // refresh expiry once per day of activity
  },
  user: {
    modelName: "user",
  },
  account: {
    modelName: "authAccount",
  },
  verification: {
    modelName: "verification",
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Better Auth's own scrypt-based hashing is used (no bcryptjs dependency needed) —
    // this replaces the old bcrypt.hash(data.password, 12) call in AuthService.register.
    autoSignIn: true,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  advanced: {
    database: {
      generateId: false, // let Postgres/Prisma's @default(uuid()) generate ids
    },
  },
});

export type Session = typeof auth.$Infer.Session;
