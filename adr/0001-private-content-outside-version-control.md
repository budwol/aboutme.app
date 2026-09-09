# 1. Private/personal content lives outside version control and is synced at build time

Date: 2026-09-09

## Status

Accepted (reconstructed from existing implementation)

## Context

This repo is a personal portfolio app but is also published as a fork-able template (see README, `.gitignore` comment "remove them after fork"). The actual person's data — name, address, phone, employer history, photos — cannot live in the tracked source tree, or every fork would ship the original author's private data by default and every edit to that data would show up as a git diff.

## Decision

All personal content (`app-data.json`, avatar/background/logo images) lives under `.aboutme/`, which is `.gitignore`d in full. `scripts/init-process.cjs` bootstraps `.aboutme/app-data.json` from the tracked `app-data.example.json` on first run. `scripts/sync-web-app-data.cjs` copies `.aboutme/app-data.json` and `.aboutme/images/*` into `public/` (also gitignored) before every dev run (`npm run web`) and every export (`npm run export:web`), and bumps `EXPO_PUBLIC_DEPLOY_VERSION` in `.env.local` in the same step. The app itself only ever reads from `public/app-data.json` at runtime (`src/app-data/index.ts`), never from `.aboutme/` directly.

## Consequences

- Cloning the repo gives you a working template with placeholder data; personal data is a local-only overlay.
- Any script or feature that needs the real data (e.g. resume PDF generation, ADR 0010) must read from `.aboutme/`, not `public/`, and must run after `sync-web-app-data.cjs` if it depends on `public/` being current.
- CI never has real `.aboutme/` data — `npm run init` seeds it from the example file, so CI/smoke runs always exercise the example dataset, not personal data.
