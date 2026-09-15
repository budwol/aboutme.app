import { describe, expect, it } from "@jest/globals";
import fs from "fs";
import path from "path";
import ts from "typescript";

// Regression test: `WnaContactSection`'s `styles.container` combined
// `width: "100%"` with `padding: 12` on a real DOM `<div>` without
// `boxSizing: "border-box"`. Since the browser default is `content-box`,
// the padding was added ON TOP of the 100%-of-parent content width,
// making the element exactly `2 * padding` wider than its parent — a
// silent horizontal overflow that only became visible once the page's
// scroll container legitimately started clipping/scrolling. Separately,
// `appStyle.containerCenterMaxWidth` used the React-Native-only
// `paddingHorizontal` property, which React silently drops when written
// to a plain DOM `style` prop (it is not a real CSS property), so the
// page's intended horizontal margins were rendering as 0px. Both bugs
// were invisible in isolation and only surfaced as "margins are gone" /
// a persistent horizontal scrollbar once discovered together.
//
// This test statically scans every non-test `src/**/*.{ts,tsx}` file for
// both bug classes so neither can silently reappear anywhere in the
// codebase, not just in the one file where it was first found.

const SRC_ROOT = __dirname;

// React Native's `StyleSheet` accepts these as shorthands, but they are
// not real CSS properties. React silently drops them when written to a
// plain DOM `style` prop, so any style object destined for a raw
// `React.createElement("div"/"span"/"button", { style })` must not use
// them directly.
const RN_ONLY_PROPERTIES = [
  "paddingHorizontal",
  "paddingVertical",
  "marginHorizontal",
  "marginVertical",
] as const;

// These files intentionally accept `paddingHorizontal`/`paddingVertical`
// as part of a component's own style prop type and translate them to
// real CSS (`paddingLeft`/`paddingRight`/`paddingTop`/`paddingBottom`)
// before ever touching the DOM. Grep-verified as the only such usages in
// the codebase; add a file here only alongside its own translation code.
const RN_ONLY_PROPERTY_ALLOWLIST = new Set([
  path.join(SRC_ROOT, "components/display/WnaBadge.tsx"),
  path.join(SRC_ROOT, "components/cards/WnaCardVerticalSmall.tsx"),
]);

// Line-level allowlist for the vertical box-sizing check: `file:line`
// (1-indexed, the object literal's own start line) for object literals
// that combine a fixed `height` with vertical padding/border but are
// verified safe for a specific, documented reason — not just "seems
// fine". Keep this list short; prefer fixing the object over allowing it.
const VERTICAL_BOX_SIZING_ALLOWLIST = new Set([
  // Passed as the `style` prop into `<WnaBadge>`, which always merges its
  // own `styles.container` (boxSizing: "border-box") underneath any
  // caller-supplied style — boxSizing already applies, just not visible
  // to this single-object-literal scan.
  `${path.join(SRC_ROOT, "components/cards/WnaCardVerticalSmall.tsx")}:73`,
]);

// Only these keys affect the horizontal box and can combine with
// `width: "100%"` to overflow a content-box element. `paddingBlock`/
// `paddingVertical`/`paddingTop`/`paddingBottom` only affect height and
// are deliberately excluded.
const HORIZONTAL_PADDING_KEYS = new Set([
  "padding",
  "paddingHorizontal",
  "paddingLeft",
  "paddingRight",
  "paddingInline",
]);
const HORIZONTAL_BORDER_KEYS = new Set([
  "borderWidth",
  "borderLeftWidth",
  "borderRightWidth",
]);

// Same bug, vertical axis: a fixed `height` combined with vertical
// padding/border on a content-box element renders taller than declared.
// This is exactly how `WnaMultilineHeader`'s header title box rendered
// 80px tall instead of 64, pushing the title text below the vertical
// center of the header's back button/icons.
const VERTICAL_PADDING_KEYS = new Set([
  "padding",
  "paddingVertical",
  "paddingTop",
  "paddingBottom",
  "paddingBlock",
]);
const VERTICAL_BORDER_KEYS = new Set([
  "borderWidth",
  "borderTopWidth",
  "borderBottomWidth",
]);

function listSourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      listSourceFiles(full, out);
    } else if (
      /\.(ts|tsx)$/.test(entry.name) &&
      !/\.test\.(ts|tsx)$/.test(entry.name)
    ) {
      out.push(full);
    }
  }
  return out;
}

function parse(file: string): { sourceFile: ts.SourceFile; text: string } {
  const text = fs.readFileSync(file, "utf8");
  const sourceFile = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  return { sourceFile, text };
}

describe("DOM style object safety", () => {
  const files = listSourceFiles(SRC_ROOT);

  it('never combines width: "100%" with horizontal padding/border on a content-box element without boxSizing: "border-box"', () => {
    const offenses: string[] = [];

    for (const file of files) {
      const { sourceFile } = parse(file);

      function visit(node: ts.Node) {
        if (ts.isObjectLiteralExpression(node)) {
          let hasFullWidth = false;
          let hasHorizontalPadding = false;
          let hasHorizontalBorder = false;
          let hasBoxSizing = false;

          for (const prop of node.properties) {
            if (!ts.isPropertyAssignment(prop)) continue;
            const name = prop.name.getText(sourceFile);

            if (
              name === "width" &&
              prop.initializer.getText(sourceFile).includes("100%")
            ) {
              hasFullWidth = true;
            }
            if (HORIZONTAL_PADDING_KEYS.has(name)) {
              hasHorizontalPadding = true;
            }
            if (
              HORIZONTAL_BORDER_KEYS.has(name) &&
              prop.initializer.getText(sourceFile) !== "0"
            ) {
              hasHorizontalBorder = true;
            }
            if (name === "boxSizing") {
              hasBoxSizing = true;
            }
          }

          if (
            hasFullWidth &&
            (hasHorizontalPadding || hasHorizontalBorder) &&
            !hasBoxSizing
          ) {
            const { line } = sourceFile.getLineAndCharacterOfPosition(
              node.getStart(sourceFile),
            );
            offenses.push(`${path.relative(SRC_ROOT, file)}:${line + 1}`);
          }
        }
        ts.forEachChild(node, visit);
      }

      visit(sourceFile);
    }

    expect(offenses).toEqual([]);
  });

  it('never combines a fixed height with vertical padding/border on a content-box element without boxSizing: "border-box"', () => {
    const offenses: string[] = [];

    for (const file of files) {
      const { sourceFile } = parse(file);

      function visit(node: ts.Node) {
        if (ts.isObjectLiteralExpression(node)) {
          let hasFixedHeight = false;
          let hasVerticalPadding = false;
          let hasVerticalBorder = false;
          let hasBoxSizing = false;

          for (const prop of node.properties) {
            if (!ts.isPropertyAssignment(prop)) continue;
            const name = prop.name.getText(sourceFile);

            if (name === "height") {
              const value = prop.initializer.getText(sourceFile);
              // `height: 0` combined with borders is the CSS
              // "triangle"/caret trick (a zero-size box whose colored
              // borders form the visible shape) — the border is
              // *supposed* to extend outside the zero-size box there, so
              // it's excluded rather than treated as a bug.
              if (
                value !== '"auto"' &&
                value !== "undefined" &&
                value !== "0"
              ) {
                hasFixedHeight = true;
              }
            }
            if (VERTICAL_PADDING_KEYS.has(name)) {
              hasVerticalPadding = true;
            }
            if (
              VERTICAL_BORDER_KEYS.has(name) &&
              prop.initializer.getText(sourceFile) !== "0"
            ) {
              hasVerticalBorder = true;
            }
            if (name === "boxSizing") {
              hasBoxSizing = true;
            }
          }

          if (
            hasFixedHeight &&
            (hasVerticalPadding || hasVerticalBorder) &&
            !hasBoxSizing
          ) {
            const { line } = sourceFile.getLineAndCharacterOfPosition(
              node.getStart(sourceFile),
            );
            if (VERTICAL_BOX_SIZING_ALLOWLIST.has(`${file}:${line + 1}`)) {
              ts.forEachChild(node, visit);
              return;
            }
            offenses.push(`${path.relative(SRC_ROOT, file)}:${line + 1}`);
          }
        }
        ts.forEachChild(node, visit);
      }

      visit(sourceFile);
    }

    expect(offenses).toEqual([]);
  });

  it("never writes a React-Native-only spacing shorthand directly into a style object outside the documented translation layer", () => {
    const offenses: string[] = [];

    for (const file of files) {
      if (RN_ONLY_PROPERTY_ALLOWLIST.has(file)) continue;

      const { sourceFile } = parse(file);

      function visit(node: ts.Node) {
        if (
          ts.isPropertyAssignment(node) ||
          ts.isShorthandPropertyAssignment(node)
        ) {
          const name = node.name.getText(sourceFile);
          if ((RN_ONLY_PROPERTIES as readonly string[]).includes(name)) {
            const { line } = sourceFile.getLineAndCharacterOfPosition(
              node.getStart(sourceFile),
            );
            offenses.push(
              `${path.relative(SRC_ROOT, file)}:${line + 1} (${name})`,
            );
          }
        }
        ts.forEachChild(node, visit);
      }

      visit(sourceFile);
    }

    expect(offenses).toEqual([]);
  });
});
