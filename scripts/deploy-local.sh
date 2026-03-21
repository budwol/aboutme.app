#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

dry_run=false
assume_yes=false

while [ "$#" -gt 0 ]; do
  case "$1" in
    --dry-run)
      dry_run=true
      ;;
    --yes)
      assume_yes=true
      ;;
    *)
      echo "that flag does not live here: $1" >&2
      echo "use --dry-run or --yes" >&2
      exit 1
      ;;
  esac
  shift
done

cd "$PROJECT_DIR"
. "$SCRIPT_DIR/load-env.sh" "$PROJECT_DIR/.env"
TARGET_DIR="${DEPLOY_TARGET_DIR:-/var/www/html}"
RESOLVED_TARGET_DIR="$(realpath -m "$TARGET_DIR")"

case "$RESOLVED_TARGET_DIR" in
  /var/www/*) ;;
  *)
    echo "deploy target has to stay inside /var/www: $RESOLVED_TARGET_DIR" >&2
    exit 1
    ;;
esac

if [ "$RESOLVED_TARGET_DIR" = "/var/www" ]; then
  echo "deploy target must not be /var/www itself" >&2
  exit 1
fi

if [ ! -d "$RESOLVED_TARGET_DIR" ]; then
  echo "deploy target is missing: $RESOLVED_TARGET_DIR" >&2
  exit 1
fi

echo "local target: $RESOLVED_TARGET_DIR"
echo "this swaps the current contents for ./dist"

if [ "$dry_run" = true ]; then
  echo "dry run: no export, no copy, no little accidents"
  exit 0
fi

if [ -t 0 ] && [ "$assume_yes" != true ]; then
  printf "ship the local canvas? [y/N] "
  read -r reply
  case "$reply" in
    y|Y|yes|YES) ;;
    *)
      echo "local deploy stayed on the easel"
      exit 1
      ;;
  esac
fi

npm run export:web
sudo find "$RESOLVED_TARGET_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
sudo cp -r ./dist/. "$RESOLVED_TARGET_DIR"
echo "local deploy done"
