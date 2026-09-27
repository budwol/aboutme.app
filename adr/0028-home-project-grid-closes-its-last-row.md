# 28. The home page's project grid closes its last row

Date: 2026-09-27

## Status

Accepted

## Context

The home page shows every project as a card in a centred, wrapping row layout; in landscape the first card is two columns wide. How many cards fit in a row follows from the section's width, not from a fixed grid. With seven projects the last row held two cards and left a one-column gap, which made the section look unfinished.

## Decision

`WnaProjectsSection` measures its grid with a `ResizeObserver` and derives the column count from the card width and gap (`getProjectColumnCount`). `getProjectCardSpans` walks the cards row by row; if the last row ends exactly one column short, its last card becomes two columns wide as well. The result is a featured card at the top left and one at the bottom right.

## Consequences

- The rule depends only on the measured width, so it holds for any window size and project count; a full last row, or one that is more than one column short, stays unchanged.
- Until the first measurement (or where `ResizeObserver` is missing) only the first card is featured, which was the previous behaviour.
- The widened card uses the large image variant, like the first card. Its 2:1 image is cropped to the wide card's shape, so the subject should sit in the vertical middle of the image.
- The projects page (`WnaProjectsRoute`) has its own layout and is unaffected.
