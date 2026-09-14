#!/usr/bin/env bash

set -eu

PORT="${1:-3000}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
EXAMPLE_FILE="$ROOT_DIR/app-data.example.json"
TARGET_FILE="$ROOT_DIR/public/app-data.json"
BACKUP_FILE="/tmp/about-me-app-data.e2e.backup.json"

load_env_file() {
  local file="$1"

  if [ -f "$file" ]; then
    set -a
    . "$file"
    set +a
  fi
}

restore() {
  if [ -f "$BACKUP_FILE" ]; then
    cp "$BACKUP_FILE" "$TARGET_FILE"
    rm -f "$BACKUP_FILE"
  else
    rm -f "$TARGET_FILE"
  fi
}

trap restore EXIT INT TERM

if [ -f "$TARGET_FILE" ]; then
  cp "$TARGET_FILE" "$BACKUP_FILE"
fi

cp "$EXAMPLE_FILE" "$TARGET_FILE"

# Expo can serve an existing static export with embedded app data. Remove it
# so the E2E server always builds from the example data prepared above.
rm -rf "$ROOT_DIR/dist"

mkdir -p "$ROOT_DIR/public/images"
cp "$ROOT_DIR/assets/defaults/bg.webp" "$ROOT_DIR/public/bg.webp"
cp "$ROOT_DIR/assets/defaults/images/default_avatar.webp" \
  "$ROOT_DIR/public/images/default_avatar.webp"
cp "$ROOT_DIR/assets/defaults/images/default_project.webp" \
  "$ROOT_DIR/public/images/default_project.webp"
convert "$ROOT_DIR/assets/defaults/images/default_avatar.webp" \
  -resize 300x300 -quality 80 \
  "$ROOT_DIR/public/images/default_avatar_300.webp"
convert "$ROOT_DIR/assets/defaults/images/default_avatar.webp" \
  -resize 384x384 -quality 80 \
  "$ROOT_DIR/public/images/default_avatar_384.webp"
convert "$ROOT_DIR/assets/defaults/images/default_avatar.webp" \
  -resize 512x512 -quality 80 \
  "$ROOT_DIR/public/images/default_avatar_512.webp"

load_env_file "$ROOT_DIR/.env.example"
load_env_file "$ROOT_DIR/.env"
load_env_file "$ROOT_DIR/.env.local"

CI=1 EXPO_NO_TELEMETRY=1 npx expo start --web --port "$PORT"
