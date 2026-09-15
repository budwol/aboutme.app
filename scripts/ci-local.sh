#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

rm -rf dist web-build .expo .expo/web .cache
npm prune
npm run test:prettier
npm run lint
npm run test:types
npm run test:circular
npm run test:unit
npm run test:coverage
npm run test:integration
npm run test:dry-run
npm run test:smoke
npm run test:e2e
node ./scripts/sync-web-app-data.cjs
echo ci:local done.
