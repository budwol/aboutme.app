# 20. Commit messages use professional one-line Gitmoji descriptions

Date: 2026-09-12

## Status

Accepted

## Context

Commit messages were inconsistent and included non-professional review wording and AI attribution.

## Decision

Use one concise, factual, imperative line with a Gitmoji icon selected through WebStorm and mapped to the change type on [gitmoji.dev](https://gitmoji.dev/). Do not add a body, AI attribution, session links, review labels, or quality claims.

```text
🐛 Preserve the background image during navigation
```

## Consequences

The history remains easy to scan and consistent. Rewritten history requires a force push with lease when publishing `main` as the new `master`.
