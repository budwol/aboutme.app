import { CSSProperties } from "react";

export function lineClampStyle(lines: number): CSSProperties {
  if (lines === 1) {
    return {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    };
  }

  return {
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  };
}
