#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"
. "$SCRIPT_DIR/load-env.sh" "$PROJECT_DIR/.env"

: "${CONTAINER_REGISTRY:?Missing CONTAINER_REGISTRY}"
: "${IMAGE:?Missing IMAGE}"

npm run export:web
IMAGE_REF="$CONTAINER_REGISTRY/$IMAGE:latest"
echo "$IMAGE_REF"
docker build -t "$IMAGE_REF" .
docker push "$IMAGE_REF"
echo "deploy:container done."
