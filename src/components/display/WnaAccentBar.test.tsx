import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaAccentBar from "@components/display/WnaAccentBar";

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
    withRepeat: (value: unknown) => value,
    withSequence: (...values: unknown[]) => values[0],
    withTiming: (value: unknown) => value,
  };
});

const appColors = {
  accent5: "#2277ee",
} as never;

describe("WnaAccentBar", () => {
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

  it("animates towards a collapsed width when enabled", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaAccentBar appColors={appColors} animated width={180} />,
      );
    });

    expect(tree!.root.findByType("AnimatedView").props.style[2].width).toBe(
      180,
    );
  });

  it("uses scale animation for pulsing bars", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaAccentBar
          appColors={appColors}
          width={180}
          pulseToWidth={45}
          pulseDuration={1200}
        />,
      );
    });

    expect(tree!.root.findByType("AnimatedView").props.style[2]).toEqual({
      transform: [{ scaleX: 1 }],
    });
  });
});
