import { describe, expect, it } from "@jest/globals";
import { getContactHeroImageForWidth } from "@components/images/wnaDecorativeImageResolver";

describe("wnaDecorativeImageResolver", () => {
  it("uses the lighter contact hero on narrow layouts", () => {
    expect(getContactHeroImageForWidth(640)).toBe("images/default-s.webp");
  });

  it("keeps the full contact hero on wide layouts", () => {
    expect(getContactHeroImageForWidth(1280)).toBe("images/_be.webp");
  });
});
