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

    const indicator = tree!.root.findByType("ActivityIndicator");

    expect(indicator.props.size).toBe(48);
    expect(indicator.props.color).toBe("#61afa7");
    expect(indicator.props["aria-label"]).toBe("activity-indicator");
    expect(indicator.props.style).toEqual([{ marginTop: 8 }]);
  });
});
