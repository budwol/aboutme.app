import { describe, expect, it } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
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

    const positioner = tree!.root.findAllByType("div")[0];
    expect(positioner.props.style).toEqual(
      expect.objectContaining({ [axis]: value }),
    );
  });

  it("keeps long labels on one line and hides inactive tooltips", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaTooltip content="E-Mail" position="bottom" visible={false} />,
      );
    });

    const positioner = tree!.root.findAllByType("div")[0];
    const text = tree!.root.findByType("span");

    expect(positioner.props.style).toEqual(
      expect.objectContaining({ opacity: 0 }),
    );
    expect(text.props.style).toEqual(
      expect.objectContaining({ whiteSpace: "nowrap" }),
    );
  });

  it("uses a compact four pixel gap from the anchor", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaTooltip content="E-Mail" position="bottom" visible />,
      );
    });

    const positioner = tree!.root.findAllByType("div")[0];
    expect(positioner.props.style).toEqual(
      expect.objectContaining({ marginTop: 4 }),
    );
  });

  it("fades visibility changes instead of changing opacity abruptly", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaTooltip content="E-Mail" position="bottom" visible />,
      );
    });

    const positioner = tree!.root.findAllByType("div")[0];
    expect(positioner.props.style).toEqual(
      expect.objectContaining({
        transition: "opacity 140ms ease-in-out",
      }),
    );
  });

  it.each([
    ["top", "borderTopColor"],
    ["right", "borderLeftColor"],
    ["bottom", "borderBottomColor"],
    ["left", "borderRightColor"],
  ])("renders a caret pointing from %s to the anchor", (...args) => {
    const [position, border] = args as [
      WnaTooltipPosition,
      (
        | "borderBottomColor"
        | "borderLeftColor"
        | "borderRightColor"
        | "borderTopColor"
      ),
    ];
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaTooltip content="E-Mail" position={position} visible />,
      );
    });

    const caret = tree!.root
      .findAllByType("div")
      .find(
        (view: { props: { style?: Record<string, string> } }) =>
          view.props.style?.[border] === "#111",
      );
    expect(caret).toBeDefined();
  });
});
