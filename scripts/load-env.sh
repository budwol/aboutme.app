#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-.env}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARSER="$SCRIPT_DIR/env-parser.cjs"

if [ ! -f "$ENV_FILE" ]; then
  echo "env file not found: $ENV_FILE" >&2
  return 1 2>/dev/null || exit 1
fi

while IFS= read -r -d '' key && IFS= read -r -d '' value; do
  declare -gx "$key=$value"
done < <(node "$PARSER" "$ENV_FILE")
