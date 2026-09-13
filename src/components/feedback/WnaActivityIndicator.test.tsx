import { describe, expect, it } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaActivityIndicator from "@components/feedback/WnaActivityIndicator";

describe("WnaActivityIndicator", () => {
  it("renders the shared activity indicator with accent color", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaActivityIndicator
          appColors={{ accent4: "#61afa7" } as never}
          style={{ marginTop: 8 }}
        />,
      );
    });

    const indicator = tree!.root.findByType("View");

    expect(indicator.props.accessibilityRole).toBe("progressbar");
    expect(indicator.props.accessibilityLabel).toBe("activity-indicator");
    expect(indicator.props.className).toBe("wna-activity-indicator");
    expect(indicator.props.style).toEqual([{ marginTop: 8 }]);
    expect(indicator.findAllByType("View")[1].props.style).toEqual([
      expect.objectContaining({ width: 48, height: 48 }),
      { borderTopColor: "#61afa7", pointerEvents: "none" },
    ]);
  });
});
