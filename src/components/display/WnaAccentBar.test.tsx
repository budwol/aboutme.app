import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaAccentBar from "@components/display/WnaAccentBar";

type ReanimatedMock = {
  withRepeat: jest.Mock<(value: unknown) => unknown>;
  withSequence: jest.Mock<(...values: unknown[]) => unknown>;
  withTiming: jest.Mock<(value: unknown) => unknown>;
};

jest.mock("react-native-reanimated", () => {
  const ReactModule = jest.requireActual("react") as typeof import("react");

  return {
    __esModule: true,
    default: {
      View: (props: unknown) =>
        ReactModule.createElement(
          "AnimatedView",
          props as Record<string, unknown>,
        ),
    },
    Easing: {
      inOut: (value: unknown) => value,
      out: (value: unknown) => value,
      cubic: "cubic",
      sin: "sin",
    },
    useAnimatedStyle: (callback: () => Record<string, unknown>) => callback(),
    useSharedValue: (initialValue: number) => ({ value: initialValue }),
    withRepeat: jest.fn((value: unknown) => value),
    withSequence: jest.fn((...values: unknown[]) => values[0]),
    withTiming: jest.fn((value: unknown) => value),
  };
});

const appColors = {
  accent5: "#2277ee",
} as never;

describe("WnaAccentBar", () => {
  const reanimatedMock = jest.requireMock(
    "react-native-reanimated",
  ) as ReanimatedMock;

  beforeEach(() => {
    reanimatedMock.withRepeat.mockClear();
    reanimatedMock.withSequence.mockClear();
    reanimatedMock.withTiming.mockClear();
  });

  it("renders the static bar at the configured width", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaAccentBar appColors={appColors} width={180} />,
      );
    });

    const row = tree!.root.findByType("View");
    const bar = tree!.root.findByType("AnimatedView");

    expect(row.props.style[1].width).toBe(180);
    expect(bar.props.style[2].width).toBe(180);
  });

  it("defaults to the standard width when none is given", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaAccentBar appColors={appColors} />);
    });

    const row = tree!.root.findByType("View");

    expect(row.props.style[1].width).toBe(220);
  });

  it("animates towards a collapsed width when enabled", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaAccentBar appColors={appColors} animated width={180} />,
      );
    });

    expect(reanimatedMock.withTiming).toHaveBeenCalledWith(8, {
      duration: 820,
      easing: "cubic",
    });
    expect(tree!.root.findByType("AnimatedView").props.style[2].width).toBe(
      180,
    );
  });

  it("uses scale animation for pulsing bars", () => {
    act(() => {
      TestRenderer.create(
        <WnaAccentBar
          appColors={appColors}
          width={180}
          pulseToWidth={45}
          pulseDuration={1200}
        />,
      );
    });

    expect(reanimatedMock.withTiming).toHaveBeenNthCalledWith(1, 0.25, {
      duration: 1200,
      easing: "sin",
    });
    expect(reanimatedMock.withTiming).toHaveBeenNthCalledWith(2, 1, {
      duration: 1200,
      easing: "sin",
    });
    expect(reanimatedMock.withSequence).toHaveBeenCalledTimes(1);
    expect(reanimatedMock.withRepeat).toHaveBeenCalledWith(0.25, -1, false);
  });
});
