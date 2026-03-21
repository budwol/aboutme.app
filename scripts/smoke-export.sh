#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT_DIR"

npm run init
. "$ROOT_DIR/scripts/load-env.sh" "$ROOT_DIR/.env"
npx expo export -p web

test -f dist/index.html
test -f public/site.webmanifest
test -f nginx/site.conf

grep -q "listen 8080 default_server;" nginx/site.conf

echo "export smoke check done"
