import { describe, expect, it } from "@jest/globals";
import { getProjectImageForWidth } from "@components/images/wnaImageAssetResolver";

describe("wnaImageAssetResolver", () => {
  it("uses the small image for narrow widths", () => {
    expect(
      getProjectImageForWidth(
        { imageL: "large.webp", imageM: "medium.webp", imageS: "small.webp" },
        400,
      ),
    ).toBe("small.webp");
  });

  it("uses the medium image for mid-sized widths", () => {
    expect(
      getProjectImageForWidth(
        { imageL: "large.webp", imageM: "medium.webp", imageS: "small.webp" },
        800,
      ),
    ).toBe("medium.webp");
  });

  it("uses the large image for wide layouts", () => {
    expect(
      getProjectImageForWidth(
        { imageL: "large.webp", imageM: "medium.webp", imageS: "small.webp" },
        1280,
      ),
    ).toBe("large.webp");
  });
});
