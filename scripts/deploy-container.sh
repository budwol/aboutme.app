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

: "${CONTAINER_REGISTRY:?Missing CONTAINER_REGISTRY}"
: "${IMAGE:?Missing IMAGE}"

if [[ "$CONTAINER_REGISTRY" =~ [[:space:]] ]] || [[ "$IMAGE" =~ [[:space:]] ]]; then
  echo "container registry and image must not contain whitespace" >&2
  exit 1
fi

if [[ ! "$IMAGE" =~ ^[a-z0-9._/-]+$ ]]; then
  echo "image name looks wrong: $IMAGE" >&2
  exit 1
fi

npm run export:web
IMAGE_REF="$CONTAINER_REGISTRY/$IMAGE:latest"
echo "image ref: $IMAGE_REF"

if [ "$dry_run" = true ]; then
  echo "dry run: no build, no push, just a quiet little rehearsal"
  exit 0
fi

if [ -t 0 ] && [ "$assume_yes" != true ]; then
  printf "build and push %s ? [y/N] " "$IMAGE_REF"
  read -r reply
  case "$reply" in
    y|Y|yes|YES) ;;
    *)
      echo "container deploy stayed in the studio"
      exit 1
      ;;
  esac
fi

docker build -t "$IMAGE_REF" .
docker push "$IMAGE_REF"
echo "container deploy done"
