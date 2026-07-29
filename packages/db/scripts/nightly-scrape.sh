#!/bin/bash
# Nightly credit card fee scrape, meant to be invoked by cron (see repo root for setup notes).
# Loads DATABASE_URL from apps/web/.env.local so it matches whatever the app itself connects to.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_PACKAGE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$DB_PACKAGE_DIR/../../apps/web/.env.local"

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

cd "$DB_PACKAGE_DIR"
npx ts-node scripts/scrape-credit-cards.ts >> "$DB_PACKAGE_DIR/scrape.log" 2>&1
