# 27. Projects can override the shared details context

Date: 2026-09-27

## Status

Accepted

## Context

`projectDetailsContextDe`/`En` is one top-level text shown on every project detail page. It was written for a portfolio whose projects all belong to one product ("part of a cohesive system for …"). Once a project from outside that product is listed, such as this portfolio app itself, the shared text is wrong for that project.

## Decision

A project entry may set its own `detailsContextDe`/`detailsContextEn` (plus the plain `detailsContext` fallback, per ADR 0003). `normalizeProjectEntry` resolves it to `ProjectEntry.detailsContext`, and `WnaProjectDetailsRoute` shows it instead of `appData.projectDetailsContext`. Projects without it keep showing the shared text.

## Consequences

- The shared text stays the default, so existing data needs no change.
- An override replaces the shared text; it isn't shown in addition to it.
- The overview's `projectsContext` has no per-project variant. It has to be worded so it still fits when not every project belongs to the same product.
