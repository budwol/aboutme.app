import { describe, expect, it } from "@jest/globals";
import { convertHexToRgba, shadeHexColor } from "@utils/colorConverter";

describe("convertHexToRgba", () => {
  it("converts a 6-digit hex to rgba", () => {
    expect(convertHexToRgba("#ffffff")).toBe("rgba(255,255,255,1)");
    expect(convertHexToRgba("#000000")).toBe("rgba(0,0,0,1)");
    expect(convertHexToRgba("#ff0000")).toBe("rgba(255,0,0,1)");
  });

  it("expands a 3-digit hex shorthand", () => {
    expect(convertHexToRgba("#fff")).toBe("rgba(255,255,255,1)");
    expect(convertHexToRgba("#000")).toBe("rgba(0,0,0,1)");
  });

  it("applies a fractional opacity", () => {
    expect(convertHexToRgba("#ffffff", 0.5)).toBe("rgba(255,255,255,0.5)");
  });

  it("normalizes whole-number opacity values to a 0-1 fraction", () => {
    expect(convertHexToRgba("#ffffff", 50)).toBe("rgba(255,255,255,0.5)");
    expect(convertHexToRgba("#000000", 100)).toBe("rgba(0,0,0,1)");
  });
});

describe("shadeHexColor", () => {
  it("returns the same color at 0% shade", () => {
    expect(shadeHexColor("#808080", 0)).toBe("#808080");
  });

  it("lightens a color towards white at positive percent", () => {
    expect(shadeHexColor("#000000", 1)).toBe("#ffffff");
  });

  it("darkens a color towards black at negative percent", () => {
    expect(shadeHexColor("#ffffff", -1)).toBe("#000000");
  });
});
