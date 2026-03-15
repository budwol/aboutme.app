#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"
. "$SCRIPT_DIR/load-env.sh" "$PROJECT_DIR/.env"
TARGET_DIR="${DEPLOY_TARGET_DIR:-/var/www/html}"

if [ ! -d "$TARGET_DIR" ]; then
  echo "Missing target directory: $TARGET_DIR" >&2
  exit 1
fi

npm run export:web
sudo find "$TARGET_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
sudo cp -r ./dist/. "$TARGET_DIR"
echo "deploy:local done."
