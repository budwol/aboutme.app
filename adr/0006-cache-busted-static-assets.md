# 6. Static local assets are cache-busted via a deploy version query param

Date: 2026-09-09

## Status

Accepted (reconstructed from existing implementation)

## Context

The exported static site is served by nginx with long-lived cache headers on static assets (see `nginx/site.conf`, referenced in README's Runtime Guarantees). Personal content (avatar, background, project images, `app-data.json`) can change between deploys without a filename change, so browsers/CDNs would otherwise keep serving stale copies.

## Decision

`scripts/sync-web-app-data.cjs` writes a fresh `EXPO_PUBLIC_DEPLOY_VERSION` (a base36 timestamp) into `.env.local` on every `npm run web` / `npm run export:web`. `src/utils/versionedAssetUrl/index.ts` (`getVersionedLocalAssetUrl`) appends `?v=<deployVersion>` to any relative local asset URL at render time, and is a no-op for remote (`http`), `data:`, or already-versioned URLs.

## Consequences

- Any code path that renders a locally-hosted asset by path (images today; the resume PDF as of ADR 0010) should route the URL through `getVersionedLocalAssetUrl` rather than hardcoding the path, or it will be served under nginx's long-lived cache header without a cache-busting hook.
- The version changes on every export, even if content didn't actually change — this trades a slightly less efficient cache for never worrying about staleness.
