# 7. Deploy scripts guard destructive actions behind confirmation, dry-run, and path checks

Date: 2026-09-09

## Status

Accepted (reconstructed from existing implementation)

## Context

`scripts/deploy-local.sh` overwrites an arbitrary directory's contents with `sudo`; `scripts/deploy-container.sh` builds and pushes a container image to a configured registry. Both are effectively irreversible from the script's own point of view (the previous deployed state isn't backed up first) and both are invoked by a human at a terminal, sometimes from muscle memory.

## Decision

Both scripts share the same shape: they source `.env` via `scripts/load-env.sh`, validate required config is present and well-formed before doing anything (`deploy-container.sh` rejects whitespace/invalid characters in `CONTAINER_REGISTRY`/`IMAGE`; `deploy-local.sh` resolves the target path and refuses anything outside `/var/www/*` or equal to `/var/www` itself), support a `--dry-run` flag that prints what would happen and exits before the destructive step, and otherwise prompt for an interactive `y/N` confirmation unless `--yes` is passed and stdin is a TTY (`[ -t 0 ]`).

## Consequences

- New deploy scripts should follow the same `--dry-run` / `--yes` / path-safety-check shape rather than inventing a new confirmation pattern.
- Non-interactive contexts (CI, cron) must pass `--yes` explicitly — the scripts fail closed (exit 1) if stdin isn't a TTY and `--yes` wasn't given, rather than silently proceeding or silently hanging.
