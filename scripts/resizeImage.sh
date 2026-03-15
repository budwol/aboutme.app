#!/usr/bin/env bash

INPUT="$1"

if [ ! -f "$INPUT" ]; then
    echo "File not found"
    exit 1
fi

DIR="$(dirname "$INPUT")"
FILENAME="$(basename "$INPUT")"
NAME="${FILENAME%.*}"

SIZES=(1024 512 300 256 192 180 152 144 128 120 114 96 76 72 64 60 57 48 32 24 16)
ICO_SIZES=(256 128 64 48 32 24 16)

convert "$INPUT" \
    $(printf -- "-resize %sx%s " "${ICO_SIZES[@]}") \
    "${DIR}/${NAME}.ico"

for SIZE in "${SIZES[@]}"; do

    convert "$INPUT" \
        -resize "${SIZE}x${SIZE}" \
        "${DIR}/${NAME}_${SIZE}.png"

    convert "$INPUT" \
        -resize "${SIZE}x${SIZE}" \
        -quality 90 \
        "${DIR}/${NAME}_${SIZE}.webp"

done

echo "Generating favicon versions..."

convert "${DIR}/${NAME}_256.png" \
    $(printf -- "-resize %sx%s " "${ICO_SIZES[@]}") \
    "${DIR}/favicon.ico"

convert "${DIR}/${NAME}_96.png" \
    -resize "96x96" \
    "${DIR}/favicon.png"

echo "Done."