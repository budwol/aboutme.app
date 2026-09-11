import { describe, expect, it } from "@jest/globals";
import { createShadowStyle } from "@components/effects/wnaShadowStyle";

describe("createShadowStyle", () => {
  it("converts a hex color into a shadow rgba box-shadow", () => {
    const style = createShadowStyle(1, "#000000");

    expect(style.boxShadow).toBe("0px 1px 8px rgba(0,0,0,0.08)");
  });

  it("passes non-hex colors through unchanged", () => {
    const style = createShadowStyle(1, "rgba(0,0,0,0.5)");

    expect(style.boxShadow).toBe("0px 1px 8px rgba(0,0,0,0.5)");
  });

  it("defaults to full opacity and black when no arguments are given", () => {
    const style = createShadowStyle();

    expect(style.boxShadow).toBe("0px 1px 8px rgba(0,0,0,0.08)");
  });
});
