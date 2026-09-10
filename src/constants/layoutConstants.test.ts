import { describe, expect, it } from "@jest/globals";
import { appLayoutConstants, getAppLayout } from "@constants/layoutConstants";

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
