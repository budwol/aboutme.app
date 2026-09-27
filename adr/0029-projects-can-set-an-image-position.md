# 29. Projects can set the visible part of their image

Date: 2026-09-27

## Status

Accepted

## Context

Project images are 2:1, but the project detail header and the wide home page cards (ADR 0028) are closer to 4:1. `object-fit: cover` crops them around the centre, so only the middle half stays visible. That works for flat subjects like code or maps, but cut off the head of a portrait in the AboutMe project's screenshot. Supplying a second, wider image per project would double the image maintenance for a few special cases.

## Decision

A project entry may set `imagePosition`, a CSS `object-position` value such as `"center 10%"`. `normalizeProjectEntry` keeps it only if it consists of up to four keywords (`left`, `right`, `top`, `bottom`, `center`) or numbers with `%`, `px` or no unit; anything else is dropped. The value travels as `contentPosition` through `WnaImage` to the `<img>` element and is applied wherever a project image is cropped: the detail header (`WnaProjectHero`), the home page cards (`WnaCardVerticalImage`) and the projects page (`WnaProjectsRoute`).

## Consequences

- Without the field nothing changes; images stay centred.
- One value serves every crop of the same image. A 2:1 card isn't cropped at all, so the position only matters for the wider views.
- `contentPosition` is a general image prop and can be reused by any other cropped image in the app.
- Strict validation keeps arbitrary CSS out of the inline style, at the cost of rejecting valid but exotic `object-position` syntax such as `calc()`.
