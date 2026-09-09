import { describe, expect, it } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaSeparatorHorizontal from "@components/display/WnaSeparatorHorizontal";

describe("WnaSeparatorHorizontal", () => {
  it("renders the default visible separator", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaSeparatorHorizontal />);
    });

    expect(tree!.root.findByType("View").props.style[0]).toEqual(
      expect.objectContaining({
        backgroundColor: "#b0b0b0",
        height: 3,
      }),
    );
  });

  it("renders a transparent separator with custom spacing", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaSeparatorHorizontal transparent color="#123456" space={24} />,
      );
    });

    expect(tree!.root.findByType("View").props.style[0]).toEqual(
      expect.objectContaining({
        backgroundColor: "transparent",
        height: 1,
        margin: 24,
      }),
    );
  });
});
