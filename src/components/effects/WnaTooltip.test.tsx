import { describe, expect, it } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { Text, View } from "react-native";
import WnaTooltip, { WnaTooltipPosition } from "@components/effects/WnaTooltip";

describe("WnaTooltip", () => {
  it.each([
    ["top", "alignItems", "center"],
    ["bottom", "alignItems", "center"],
    ["left", "justifyContent", "center"],
    ["right", "justifyContent", "center"],
  ])("centers %s tooltips on the cross-axis", (...args) => {
    const [position, axis, value] = args as [
      WnaTooltipPosition,
      "alignItems" | "justifyContent",
      "center",
    ];
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaTooltip content="E-Mail" position={position} visible />,
      );
    });

    const positioner = tree!.root.findAllByType(View)[0];
    expect(positioner.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ [axis]: value })]),
    );
  });

  it("keeps long labels on one line and hides inactive tooltips", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaTooltip content="E-Mail" position="bottom" visible={false} />,
      );
    });

    const positioner = tree!.root.findAllByType(View)[0];
    const text = tree!.root.findByType(Text);

    expect(positioner.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ opacity: 0 })]),
    );
    expect(text.props.numberOfLines).toBe(1);
  });

  it("uses a compact four pixel gap from the anchor", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaTooltip content="E-Mail" position="bottom" visible />,
      );
    });

    const positioner = tree!.root.findAllByType(View)[0];
    expect(positioner.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ marginTop: 4 })]),
    );
  });

  it("fades visibility changes instead of changing opacity abruptly", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaTooltip content="E-Mail" position="bottom" visible />,
      );
    });

    const positioner = tree!.root.findAllByType(View)[0];
    expect(positioner.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          transition: "opacity 140ms ease-in-out",
        }),
      ]),
    );
  });
});
