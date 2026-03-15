#!/usr/bin/env bash
set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: $0 logo.svg"
  exit 1
fi

INPUT_SVG="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"

if [ ! -f "$INPUT_SVG" ]; then
  echo "File not found: $INPUT_SVG"
  exit 1
fi

OUTPUT_PNG="$(dirname "$INPUT_SVG")/logo.png"
OUTPUT_DIR="$(dirname "$INPUT_SVG")"

INKSCAPE_BIN="$(command -v inkscape)" || {
  echo "ERROR: inkscape not found"
  exit 1
}

echo "SVG: $INPUT_SVG"
echo "PNG: $OUTPUT_PNG"

# Try modern Inkscape syntax first
if "$INKSCAPE_BIN" "$INPUT_SVG" \
    --export-type=png \
    --export-filename="$OUTPUT_PNG" \
    --export-width=1024 >/dev/null 2>&1; then
  echo "Exported using modern Inkscape syntax"
else
  echo "Falling back to legacy Inkscape syntax"
  "$INKSCAPE_BIN" -z "$INPUT_SVG" \
    -e "$OUTPUT_PNG" \
    -w 1024
fi

cp "$INPUT_SVG" "$OUTPUT_DIR/favicon.svg"

echo "Done."
