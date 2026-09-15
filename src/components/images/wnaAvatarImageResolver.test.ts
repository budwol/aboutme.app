import { describe, expect, it } from "@jest/globals";
import { getAvatarImageSources } from "@components/images/wnaAvatarImageResolver";

describe("getAvatarImageSources", () => {
  it("returns responsive avatar sources for the welcome hero", () => {
    expect(getAvatarImageSources("ava.webp", 200)).toEqual([
      {
        imageUrl: "images/ava_300.webp",
        width: 300,
        webMaxViewportWidth: 2048,
        displayWidth: 200,
      },
      {
        imageUrl: "images/ava_384.webp",
        width: 384,
        webMaxViewportWidth: 4096,
        displayWidth: 200,
      },
      {
        imageUrl: "images/ava_512.webp",
        width: 512,
        webMaxViewportWidth: 6144,
        displayWidth: 200,
      },
      {
        imageUrl: "images/ava.webp",
        width: 1024,
        webMaxViewportWidth: 8192,
        displayWidth: 200,
      },
    ]);
  });

  it("uses the given display width, not a source file's own resolution", () => {
    // Regression test: the avatar always renders at the same fixed CSS
    // width regardless of which resolution loads, so every source must
    // carry that display width for the sizes attribute -- see
    // WnaImageElement.getSizes and WnaProfileHero.test.tsx's matching
    // "sizes" assertion.
    const sources = getAvatarImageSources("ava.webp", 132);

    expect(sources.every((source) => source.displayWidth === 132)).toBe(true);
  });

  it("returns an empty list for an empty avatar file name", () => {
    expect(getAvatarImageSources("", 200)).toEqual([]);
  });

  it("returns an empty list for a nullish avatar file name", () => {
    expect(getAvatarImageSources(undefined as unknown as string, 200)).toEqual(
      [],
    );
  });
});
