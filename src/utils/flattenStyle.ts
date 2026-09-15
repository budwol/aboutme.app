import { CSSProperties } from "react";

export type FlattenableStyle<T extends object = CSSProperties> =
  | T
  | FlattenableStyle<T>[]
  | null
  | undefined
  | false;

// React Native's StyleSheet.flatten() equivalent for plain style objects:
// merges a (possibly nested) array of style objects left-to-right, later
// entries overriding earlier ones, skipping falsy entries. A single object
// is returned as-is. Generic so it also covers narrower style-prop types
// (e.g. a component's own CSSProperties subset) beyond plain CSSProperties.
export function flattenStyle<T extends object = CSSProperties>(
  style: FlattenableStyle<T>,
): T {
  if (!style) return {} as T;
  if (!Array.isArray(style)) return style;

  return style.reduce<T>(
    (result, item) => ({ ...result, ...flattenStyle(item) }),
    {} as T,
  );
}
