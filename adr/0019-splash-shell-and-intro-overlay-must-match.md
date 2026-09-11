# 19. The static splash shell and the app's intro overlay must match

Date: 2026-09-11

## Status

Accepted

## Context

Before React hydrates, `scripts/inject-web-shell.cjs` injects a static, plain-CSS "splash" (`#wna-static-shell`) into every exported HTML file, showing the profile name and title. Once React mounts, `src/components/WnaApp.tsx`'s `WnaLoadingCopy` renders its own intro overlay with the same name/title, then that overlay removes the static shell (see the `document.getElementById("wna-static-shell")?.remove()` effect in `WnaApp.tsx`) and crossfades into the real page.

Originally these two independently described the same content with different font sizes and a different accent-bar treatment, which produced a visible layout jump and size change right at the hydration handoff.

## Decision

The static shell's CSS (`buildStaticShellStyle`/`buildStaticShell` in `scripts/inject-web-shell.cjs`) and the intro overlay's styles (`WnaLoadingCopy`/`styles.introBrand`/`styles.introName` in `WnaApp.tsx`) are kept pixel-matched by hand: same font sizes/weights, same letter-spacing, same 12px vertical gaps, and the accent bar renders at its final settled size (`48×8`, color `#61afa7`) in both places instead of animating from a larger size on mount.

`inject-web-shell.cjs` is a plain Node/CommonJS script that runs outside the app bundle and cannot import `WnaApp.tsx` or the app's theme constants, so there is no way to share these values as a single source of truth without adding build complexity disproportionate to a splash screen. Both files carry a comment pointing at this ADR and at each other.

## Consequences

- Any future change to the intro overlay's typography, spacing, or accent-bar size in `WnaApp.tsx` must be mirrored in `inject-web-shell.cjs`'s static shell CSS/markup, or the hydration handoff will visibly jump again.
- There is no automated test enforcing this match; it relies on the comments and this ADR. If this drifts again, consider a small script/test that renders both descriptions and diffs the resulting sizes rather than trusting manual sync a third time.
