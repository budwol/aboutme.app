import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaPressable from "@components/buttons/WnaPressable";

jest.mock("@components/buttons/WnaBasePressable/WnaBasePressable", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaBasePressable(props: unknown) {
    return createElement(
      "WnaBasePressable",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  };
});

jest.mock("@components/effects/WnaTooltip", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaTooltip(props: unknown) {
    return createElement("WnaTooltip", props as Record<string, unknown>);
  };
});

describe("WnaPressable", () => {
  it("does not invoke a disabled action and marks the base pressable disabled", () => {
    const onPress = jest.fn();
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaPressable onPress={onPress} ripple="light" disabled>
          child
        </WnaPressable>,
      );
    });

    const base = tree!.root.findByType("WnaBasePressable");

    expect(base.props.isEnabled).toBe(false);
    act(() => {
      base.props.onPress();
    });
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders a top tooltip and throttles repeated presses", () => {
    jest.useFakeTimers();
    const onPress = jest.fn();
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaPressable
          onPress={onPress}
          ripple="dark"
          toolTip="Open"
          toolTipPosition="top"
        >
          child
        </WnaPressable>,
      );
    });

    const base = tree!.root.findByType("WnaBasePressable");
    let tooltip = tree!.root.findByType("WnaTooltip");

    expect(tooltip.props.content).toBe("Open");
    expect(tooltip.props.position).toBe("top");
    expect(tooltip.props.visible).toBe(false);

    act(() => {
      base.props.onHoverIn();
    });

    tooltip = tree!.root.findByType("WnaTooltip");
    expect(tooltip.props.visible).toBe(true);

    act(() => {
      base.props.onPress();
      base.props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(500);
      base.props.onPress();
      base.props.onHoverOut();
    });

    expect(onPress).toHaveBeenCalledTimes(2);
    expect(tree!.root.findByType("WnaTooltip").props.visible).toBe(false);
    jest.useRealTimers();
  });

  it("renders right-positioned tooltip after the pressable", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaPressable
          onPress={() => undefined}
          ripple="light"
          toolTip="Next"
          toolTipPosition="right"
        >
          child
        </WnaPressable>,
      );
    });

    const tooltip = tree!.root.findByType("WnaTooltip");

    expect(tooltip.props.content).toBe("Next");
    expect(tooltip.props.position).toBe("right");
  });

  it("renders bottom-positioned tooltip after the pressable", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaPressable
          onPress={() => undefined}
          ripple="light"
          toolTip="Done"
          toolTipPosition="bottom"
        >
          child
        </WnaPressable>,
      );
    });

    const tooltip = tree!.root.findByType("WnaTooltip");

    expect(tooltip.props.content).toBe("Done");
    expect(tooltip.props.position).toBe("bottom");
  });

  it("renders a left-positioned tooltip before the pressable", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaPressable
          onPress={() => undefined}
          ripple="light"
          toolTip="Back"
          toolTipPosition="left"
        >
          child
        </WnaPressable>,
      );
    });

    const tooltip = tree!.root.findByType("WnaTooltip");

    expect(tooltip.props.content).toBe("Back");
    expect(tooltip.props.position).toBe("left");
  });

  it("omits tooltip wrappers when tooltip text is missing", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaPressable onPress={() => undefined} ripple={undefined}>
          child
        </WnaPressable>,
      );
    });

    expect(tree!.root.findAllByType("WnaTooltip")).toHaveLength(0);
  });

  it("preserves the rounded hover clipping from the pressable style", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaPressable
          onPress={() => undefined}
          ripple="light"
          style={{ borderRadius: 24 }}
        >
          child
        </WnaPressable>,
      );
    });

    expect(tree!.root.findAllByType("div")[1].props.style).toEqual(
      expect.objectContaining({ borderRadius: 24, overflow: "hidden" }),
    );
  });
});
