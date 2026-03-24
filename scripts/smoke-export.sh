#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TEMP_BIN_DIR=""
APP_VERSION="$(node -p "require('./package.json').version")"

cleanup() {
  if [ -n "$TEMP_BIN_DIR" ] && [ -d "$TEMP_BIN_DIR" ]; then
    rm -rf "$TEMP_BIN_DIR"
  fi
}

trap cleanup EXIT

setup_smoke_tool_stubs() {
  TEMP_BIN_DIR="$(mktemp -d)"

  cat >"$TEMP_BIN_DIR/inkscape" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

output=""

for arg in "$@"; do
  case "$arg" in
    --export-filename=*)
      output="${arg#--export-filename=}"
      ;;
  esac
done

if [ -z "$output" ]; then
  for ((index = 1; index <= $#; index += 1)); do
    if [ "${!index}" = "-e" ]; then
      next_index=$((index + 1))
      output="${!next_index}"
      break
    fi
  done
fi

if [ -z "$output" ]; then
  echo "smoke inkscape stub could not find an output path" >&2
  exit 1
fi

mkdir -p "$(dirname "$output")"
: >"$output"
EOF

  cat >"$TEMP_BIN_DIR/convert" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

output="${!#}"
mkdir -p "$(dirname "$output")"
: >"$output"
EOF

  chmod +x "$TEMP_BIN_DIR/inkscape" "$TEMP_BIN_DIR/convert"
  export PATH="$TEMP_BIN_DIR:$PATH"
}

cd "$ROOT_DIR"

if ! command -v inkscape >/dev/null 2>&1 || ! command -v convert >/dev/null 2>&1; then
  echo "smoke run: using lightweight logo tool stubs"
  setup_smoke_tool_stubs
fi

npm run init
. "$ROOT_DIR/scripts/load-env.sh" "$ROOT_DIR/.env"
EXPO_CONFIG_JSON="$(npx expo config --json)"

echo "$EXPO_CONFIG_JSON" | grep -q "\"version\":\"$APP_VERSION\""
echo "$EXPO_CONFIG_JSON" | grep -q "\"appVersion\":\"$APP_VERSION\""

npx expo export -p web

test -f dist/index.html
test -f public/app-data.json
test -f public/site.webmanifest
test -f nginx/site.conf

grep -q "listen 8080 default_server;" nginx/site.conf

echo "export smoke check done"
