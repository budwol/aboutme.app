import { describe, expect, it } from "@jest/globals";
import { WnaShadowStyle } from "@components/effects/WnaShadowStyle";

describe("WnaShadowStyle", () => {
  it("converts a hex color into a shadow rgba box-shadow", () => {
    const style = WnaShadowStyle(1, "#000000");

    expect(style.boxShadow).toBe("0px 1px 8px rgba(0,0,0,0.08)");
  });

  it("passes non-hex colors through unchanged", () => {
    const style = WnaShadowStyle(1, "rgba(0,0,0,0.5)");

    expect(style.boxShadow).toBe("0px 1px 8px rgba(0,0,0,0.5)");
  });

  it("defaults to full opacity and black when no arguments are given", () => {
    const style = WnaShadowStyle();

    expect(style.boxShadow).toBe("0px 1px 8px rgba(0,0,0,0.08)");
  });
});
