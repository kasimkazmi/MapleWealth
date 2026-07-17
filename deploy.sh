#!/bin/bash

# Local deploy script for MapleWealth web.
# Builds the Docker image from the repo root and runs it locally.
# No registry push, no cloud provider — just build + run.

set -e  # Exit on any error

# ─── Colors ───────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ─── Config ───────────────────────────────────────────────────────────────────
IMAGE_TAG="${1:-latest}"
WEB_IMAGE="maplewealth-web:$IMAGE_TAG"
WEB_CONTAINER="maplewealth-web"
NETWORK="maplewealth-net"

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE} MapleWealth Local Deploy${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "  Web image: ${GREEN}$WEB_IMAGE${NC}"
echo ""

# ─── Step 1: Build image ──────────────────────────────────────────────────────
echo -e "${YELLOW}[1/3] Building web image...${NC}"
docker build -f apps/web/Dockerfile -t "$WEB_IMAGE" .
echo -e "${GREEN}✓ Web image built${NC}"

# ─── Step 2: Ensure a network so web/postgres can reach each other ──────────
docker network inspect "$NETWORK" >/dev/null 2>&1 || docker network create "$NETWORK" >/dev/null

# ─── Step 3: Start Postgres (docker-compose.yml) on the same network ───────
echo -e "${YELLOW}[2/3] Starting Postgres via docker compose...${NC}"
docker compose up -d postgres

# ─── Step 4: Restart web container ────────────────────────────────────────────
echo -e "${YELLOW}[3/3] Restarting web container...${NC}"

docker rm -f "$WEB_CONTAINER" >/dev/null 2>&1 || true
docker run -d \
    --name "$WEB_CONTAINER" \
    --network "$NETWORK" \
    --env-file .env \
    -p 3000:3000 \
    "$WEB_IMAGE"

echo -e "${GREEN}✓ Container running${NC}"
echo ""
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "  Web: ${BLUE}http://localhost:3000${NC}"
echo ""
