import { describe, expect, it } from "@jest/globals";
import { addToLineHeight } from "./addToLineHeight";

describe("addToLineHeight", () => {
  it("parses a pixel string and adds the delta", () => {
    expect(addToLineHeight("16px", 4, 0)).toBe("20px");
  });

  it("adds the delta to a bare number", () => {
    expect(addToLineHeight(16, 4, 0)).toBe("20px");
  });

  it("falls back to the given value when lineHeight is undefined", () => {
    expect(addToLineHeight(undefined, 2, 18)).toBe("20px");
  });
});
