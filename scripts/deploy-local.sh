#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"
. "$SCRIPT_DIR/load-env.sh" "$PROJECT_DIR/.env"
TARGET_DIR="${DEPLOY_TARGET_DIR:-/var/www/html}"
RESOLVED_TARGET_DIR="$(realpath -m "$TARGET_DIR")"

case "$RESOLVED_TARGET_DIR" in
  /var/www/*) ;;
  *)
    echo "deploy target must stay inside /var/www: $RESOLVED_TARGET_DIR" >&2
    exit 1
    ;;
esac

if [ "$RESOLVED_TARGET_DIR" = "/var/www" ]; then
  echo "deploy target must not be /var/www directly" >&2
  exit 1
fi

if [ ! -d "$RESOLVED_TARGET_DIR" ]; then
  echo "deploy target not found: $RESOLVED_TARGET_DIR" >&2
  exit 1
fi

npm run export:web
sudo find "$RESOLVED_TARGET_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
sudo cp -r ./dist/. "$RESOLVED_TARGET_DIR"
echo "local deploy finished"
