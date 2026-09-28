import { describe, expect, it } from "@jest/globals";
import {
  contrastRatio,
  measureTextContrast,
  relativeLuminance,
  requiredContrastRatio,
  toHex,
} from "./contrastMath";

function solid(color: [number, number, number], pixelCount: number) {
  return Array.from({ length: pixelCount }, () => [...color, 255]).flat();
}

describe("contrast math", () => {
  it("matches the WCAG reference values", () => {
    expect(relativeLuminance([255, 255, 255])).toBeCloseTo(1);
    expect(relativeLuminance([0, 0, 0])).toBe(0);
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21);
    expect(contrastRatio([255, 255, 255], [0, 0, 0])).toBeCloseTo(21);
    // #767676 on white is the classic "just passes AA" grey.
    expect(contrastRatio([0x76, 0x76, 0x76], [255, 255, 255])).toBeCloseTo(
      4.54,
      2,
    );
  });

  it("requires 3:1 only for large text", () => {
    expect(requiredContrastRatio(14, 400)).toBe(4.5);
    expect(requiredContrastRatio(24, 400)).toBe(3);
    expect(requiredContrastRatio(19, 700)).toBe(3);
    expect(requiredContrastRatio(19, 600)).toBe(4.5);
  });

  it("formats colours as hex", () => {
    expect(toHex([10, 255, 0])).toBe("#0aff00");
  });
});

describe("measureTextContrast", () => {
  it("reads text and background colour at the glyph pixels", () => {
    // 4 glyph pixels (dark grey) and 12 untouched pixels on light grey.
    const background = solid([230, 230, 230], 16);
    const withText = [...background];
    for (const pixel of [0, 5, 10, 15]) {
      withText.splice(pixel * 4, 3, 40, 40, 40);
    }

    const result = measureTextContrast(withText, background);

    expect(result.text).toEqual([40, 40, 40]);
    expect(result.background).toEqual([230, 230, 230]);
    expect(result.ratio).toBeCloseTo(
      contrastRatio([40, 40, 40], [230, 230, 230]),
    );
  });

  it("uses the glyph cores, not the antialiased edges", () => {
    const background = solid([255, 255, 255], 8);
    const withText = [...background];
    // Two full-strength core pixels, six faint edge pixels.
    withText.splice(0, 3, 0, 0, 0);
    withText.splice(7 * 4, 3, 0, 0, 0);
    for (let pixel = 1; pixel < 7; pixel++) {
      withText.splice(pixel * 4, 3, 200, 200, 200);
    }

    const result = measureTextContrast(withText, background);

    expect(result.text).toEqual([0, 0, 0]);
    expect(result.ratio).toBeCloseTo(21);
  });

  it("reports unreadable text as ratio 1 when no pixel changes", () => {
    const background = solid([120, 120, 120], 4);

    const result = measureTextContrast(background, background);

    expect(result.ratio).toBe(1);
    expect(result.background).toEqual([120, 120, 120]);
  });

  it("ignores changes below the noise threshold", () => {
    const background = solid([200, 200, 200], 4);
    const withText = solid([210, 210, 210], 4);

    expect(measureTextContrast(withText, background).ratio).toBe(1);
  });
});
