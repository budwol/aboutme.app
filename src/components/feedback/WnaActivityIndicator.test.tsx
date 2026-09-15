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

    const indicator = tree!.root.findByType("div");

    expect(indicator.props.role).toBe("progressbar");
    expect(indicator.props["aria-label"]).toBe("activity-indicator");
    expect(indicator.props.className).toBe("wna-activity-indicator");
    expect(indicator.props.style).toEqual({ marginTop: 8 });
    // Regression test: this spinner combines a fixed `width`/`height`
    // with a `borderWidth` on a real DOM element. Content-box (the
    // browser default) would render it 8px larger (2 * border) than the
    // declared 48px, and off-center relative to its `borderRadius: 999`.
    expect(indicator.findAllByType("div")[1].props.style).toEqual({
      width: 48,
      height: 48,
      boxSizing: "border-box",
      borderWidth: 4,
      borderStyle: "solid",
      borderRadius: 999,
      borderColor: "rgba(128,128,128,0.24)",
      borderTopColor: "#61afa7",
      pointerEvents: "none",
    });
  });
});
