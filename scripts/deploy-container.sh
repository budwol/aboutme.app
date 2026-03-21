#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"
. "$SCRIPT_DIR/load-env.sh" "$PROJECT_DIR/.env"

: "${CONTAINER_REGISTRY:?Missing CONTAINER_REGISTRY}"
: "${IMAGE:?Missing IMAGE}"

if [[ "$CONTAINER_REGISTRY" =~ [[:space:]] ]] || [[ "$IMAGE" =~ [[:space:]] ]]; then
  echo "container registry and image must not contain whitespace" >&2
  exit 1
fi

if [[ ! "$IMAGE" =~ ^[a-z0-9._/-]+$ ]]; then
  echo "invalid IMAGE value: $IMAGE" >&2
  exit 1
fi

npm run export:web
IMAGE_REF="$CONTAINER_REGISTRY/$IMAGE:latest"
echo "$IMAGE_REF"
docker build -t "$IMAGE_REF" .
docker push "$IMAGE_REF"
echo "container deploy finished"
