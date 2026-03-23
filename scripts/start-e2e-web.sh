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

load_env_file "$ROOT_DIR/.env.example"
load_env_file "$ROOT_DIR/.env"
load_env_file "$ROOT_DIR/.env.local"

CI=1 EXPO_NO_TELEMETRY=1 npx expo start --web --port "$PORT"
