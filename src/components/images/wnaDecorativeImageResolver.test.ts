import { describe, expect, it } from "@jest/globals";
import { getContactHeroImageForWidth } from "@components/images/wnaDecorativeImageResolver";

describe("wnaDecorativeImageResolver", () => {
  it("uses the configured contact hero on narrow layouts", () => {
    expect(getContactHeroImageForWidth(640)).toBe("bg.webp");
  });

  it("uses the configured contact hero on wide layouts", () => {
    expect(getContactHeroImageForWidth(1280)).toBe("bg.webp");
  });
});
