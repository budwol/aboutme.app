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

jest.mock("react-native-popable", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return {
    Popable: (props: unknown) =>
      createElement(
        "Popable",
        props as Record<string, unknown>,
        (props as { children?: React.ReactNode }).children,
      ),
  };
});

describe("WnaPressable", () => {
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
    let popable = tree!.root.findByType("Popable");

    expect(popable.props.content).toBe("Open");
    expect(popable.props.position).toBe("top");
    expect(popable.props.visible).toBe(false);

    act(() => {
      base.props.onHoverIn();
    });

    popable = tree!.root.findByType("Popable");
    expect(popable.props.visible).toBe(true);

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
    expect(tree!.root.findByType("Popable").props.visible).toBe(false);
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

    const popable = tree!.root.findByType("Popable");

    expect(popable.props.content).toBe("Next");
    expect(popable.props.position).toBe("right");
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

    const popable = tree!.root.findByType("Popable");

    expect(popable.props.content).toBe("Done");
    expect(popable.props.position).toBe("bottom");
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

    const popable = tree!.root.findByType("Popable");

    expect(popable.props.content).toBe("Back");
    expect(popable.props.position).toBe("left");
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

    expect(tree!.root.findAllByType("Popable")).toHaveLength(0);
  });
});
