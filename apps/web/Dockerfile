# MapleWealth — web (Next.js dashboard).
#
# Built from the repo root (npm workspaces monorepo):
#   docker build -f apps/web/Dockerfile -t maplewealth-web .
#
# Three-stage build:
#   deps   — npm ci across the whole workspace (needed so @maplewealth/db resolves)
#   build  — generate the Prisma client, then next build (emits .next/standalone)
#   run    — node:22-alpine + node server.js, non-root, EXPOSE 3000
#
# Relies on next.config.ts setting `output: "standalone"`. Without
# that, .next/standalone is missing and the runtime stage's COPY fails.

# ---------- deps ----------
FROM node:22-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/db/package.json ./packages/db/package.json
RUN npm ci

# ---------- build ----------
FROM node:22-alpine AS build

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run db:generate -w @maplewealth/db

ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production
RUN npm run build -w @maplewealth/web

# ---------- runtime ----------
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# `output: "standalone"` packs server.js + the minimal node_modules
# subset under .next/standalone. We then layer .next/static next to it
# (Next looks for static at .next/static relative to server.js).
COPY --from=build --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=node:node /app/apps/web/public ./apps/web/public

USER node
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
