import { describe, expect, it } from "@jest/globals";
import { lineClampStyle } from "@utils/lineClampStyle";

describe("lineClampStyle", () => {
  it("uses single-line ellipsis truncation for one line", () => {
    expect(lineClampStyle(1)).toEqual({
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    });
  });

  it("uses webkit line-clamp for multiple lines", () => {
    expect(lineClampStyle(3)).toEqual({
      display: "-webkit-box",
      WebkitLineClamp: 3,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    });
  });
});
