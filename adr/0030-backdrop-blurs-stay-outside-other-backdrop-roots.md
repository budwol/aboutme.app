# 30. Backdrop blurs stay outside other backdrop roots

Date: 2026-09-28

## Status

Accepted

## Context

The header was meant to blur the page content scrolling beneath it, but it only darkened. `backdrop-filter` blurs what lies behind an element only up to its nearest backdrop root, and any element with `backdrop-filter`, `filter`, `opacity < 1`, `mask`, `clip-path` or `mix-blend-mode` is one. Two such roots sat above the header's blur layer: the page background's blur (`WnaImageBackground` wrapped every screen inside its blurred layer), and the header's own blur container, which faded in through `opacity`.

## Decision

- `WnaImageBackground` renders its blur as an empty layer over the image and the screen content in a sibling layer above it, never inside it.
- `WnaHeader` fades its blur in by growing the blur radius with the scroll position (0 to 6 px), not by fading a container. The darkening overlay keeps its previous strength.
- Any new `backdrop-filter` must not be nested inside another `backdrop-filter`, and nothing between it and the content it should blur may carry `opacity < 1`, `filter`, `mask`, `clip-path` or `mix-blend-mode`.

## Consequences

- The header blurs content from the first scrolled pixel, matching the design.
- The page background looks unchanged.
- The rule is easy to break unintentionally; the code comments in both components and the header tests (the blur container has no `opacity`) point back here.
