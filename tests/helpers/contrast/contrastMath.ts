// WCAG 2.x contrast math plus a pixel-based measurement of rendered text.
// Kept free of Playwright and the DOM so it can be unit tested with Jest.

export type Rgb = [number, number, number];

export type TextContrastMeasurement = {
  ratio: number;
  text: Rgb;
  background: Rgb;
};

// Pixels whose colour changes by less than this between the screenshot with
// and without text are treated as compression/antialiasing noise.
const GLYPH_DIFF_THRESHOLD = 24;
// Only the most strongly changed pixels are glyph cores; the rest are
// antialiased edges that blend text and background and would understate
// the contrast a reader actually sees.
const GLYPH_CORE_SHARE = 0.25;

function channelToLinear(channel: number): number {
  const value = channel / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance([r, g, b]: Rgb): number {
  return (
    0.2126 * channelToLinear(r) +
    0.7152 * channelToLinear(g) +
    0.0722 * channelToLinear(b)
  );
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const lighter = Math.max(relativeLuminance(a), relativeLuminance(b));
  const darker = Math.min(relativeLuminance(a), relativeLuminance(b));
  return (lighter + 0.05) / (darker + 0.05);
}

// WCAG AA: 4.5:1 for body text, 3:1 for large text (at least 24px, or
// at least 18.66px (14pt) when bold).
export function requiredContrastRatio(
  fontSizePx: number,
  fontWeight: number,
): number {
  const isLarge =
    fontSizePx >= 24 || (fontSizePx >= 18.66 && fontWeight >= 700);
  return isLarge ? 3 : 4.5;
}

function meanColor(pixels: ArrayLike<number>, offsets: number[]): Rgb {
  const sum: Rgb = [0, 0, 0];
  for (const offset of offsets) {
    sum[0] += pixels[offset];
    sum[1] += pixels[offset + 1];
    sum[2] += pixels[offset + 2];
  }
  return sum.map((channel) => Math.round(channel / offsets.length)) as Rgb;
}

/**
 * Compares the same screen region rendered with and without its text (RGBA
 * pixel data of equal size). Where the two differ, a glyph covers the
 * background; the text colour is read from the first capture and the
 * background from the second, at the same pixels. That includes every
 * transparency, blur and image actually underneath the text.
 *
 * Text that doesn't change a single pixel noticeably is unreadable, so it
 * reports a ratio of 1 instead of nothing.
 */
export function measureTextContrast(
  withText: ArrayLike<number>,
  withoutText: ArrayLike<number>,
): TextContrastMeasurement {
  const changed: { offset: number; diff: number }[] = [];
  for (let offset = 0; offset < withText.length; offset += 4) {
    const diff = Math.max(
      Math.abs(withText[offset] - withoutText[offset]),
      Math.abs(withText[offset + 1] - withoutText[offset + 1]),
      Math.abs(withText[offset + 2] - withoutText[offset + 2]),
    );
    if (diff >= GLYPH_DIFF_THRESHOLD) {
      changed.push({ offset, diff });
    }
  }

  if (changed.length === 0) {
    const background = meanColor(
      withoutText,
      Array.from({ length: withoutText.length / 4 }, (_, index) => index * 4),
    );
    return { ratio: 1, text: background, background };
  }

  changed.sort((a, b) => b.diff - a.diff);
  const coreCount = Math.max(1, Math.round(changed.length * GLYPH_CORE_SHARE));
  const core = changed.slice(0, coreCount).map(({ offset }) => offset);
  const text = meanColor(withText, core);
  const background = meanColor(withoutText, core);

  return { ratio: contrastRatio(text, background), text, background };
}

export function toHex([r, g, b]: Rgb): string {
  return `#${[r, g, b]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}
