import { describe, expect, it } from "@jest/globals";
import {
  appLayoutConstants,
  appSpacingConstants,
  getAppLayout,
} from "@constants/layoutConstants";

describe("appSpacingConstants", () => {
  it("uses the global eight-point spacing scale", () => {
    expect(Object.values(appSpacingConstants)).toEqual([8, 16, 24, 32, 40]);
    expect(
      Object.values(appSpacingConstants).every((value) => value % 8 === 0),
    ).toBe(true);
  });
});

describe("getAppLayout", () => {
  it("uses landscape header sizing when in landscape", () => {
    const layout = getAppLayout(true);

    expect(layout.headerHeight).toBe(appLayoutConstants.headerHeightWeb);
    expect(layout.contentListPaddingTop).toBe(
      appLayoutConstants.headerHeightWeb,
    );
  });

  it("uses portrait header sizing when not in landscape", () => {
    const layout = getAppLayout(false);

    expect(layout.headerHeight).toBe(appLayoutConstants.headerButtonHeight);
    expect(layout.contentListPaddingTop).toBe(
      appLayoutConstants.headerButtonHeight + 8,
    );
  });
});
