import { afterEach, describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaProfileHero, {
  WnaHeroField,
} from "@components/sections/WnaProfileHero";
import { testAppData } from "@/app-data/testAppData";

let mockReduceMotion = true;

jest.mock("@components/images/WnaImage", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaImage(props: unknown) {
    return createElement("WnaImage", props as Record<string, unknown>);
  };
});

jest.mock("@components/images/wnaAvatarImageResolver", () => ({
  getAvatarImageSources: () => [],
}));

jest.mock("@components/display/WnaAccentBar", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaAccentBar(props: unknown) {
    return createElement("WnaAccentBar", props as Record<string, unknown>);
  };
});

jest.mock("react-native-reanimated", () => {
  const ReactModule = jest.requireActual("react") as typeof import("react");

  return {
    __esModule: true,
    default: {
      View: (props: unknown) =>
        ReactModule.createElement(
          "AnimatedView",
          props as Record<string, unknown>,
          (props as { children?: React.ReactNode }).children,
        ),
    },
    Easing: {
      inOut: (value: unknown) => value,
      sin: "sin",
    },
    interpolate: (
      value: number,
      inputRange: [number, number],
      outputRange: [number, number],
    ) => {
      const [inputStart, inputEnd] = inputRange;
      const [outputStart, outputEnd] = outputRange;
      const ratio = (value - inputStart) / (inputEnd - inputStart);

      return outputStart + ratio * (outputEnd - outputStart);
    },
    useReducedMotion: () => mockReduceMotion,
    useAnimatedStyle: (callback: () => Record<string, unknown>) => callback(),
    useSharedValue: (initialValue: number) => ({ value: initialValue }),
    withRepeat: (value: unknown) => value,
    withSequence: (...values: unknown[]) => values[0],
    withTiming: (value: unknown) => value,
  };
});

describe("WnaProfileHero", () => {
  afterEach(() => {
    mockReduceMotion = true;
  });

  const appColors = {
    white: "#ffffff",
    black: "#000000",
    accent5: "#22aa66",
    coolgray2: "#cccccc",
    coolgray8: "#222222",
    coolgray6: "#666666",
    warmgray6: "#999999",
  } as never;

  it("renders the accent bar between name and title in the regular hero", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaProfileHero
          appColors={appColors}
          appData={testAppData}
          appStyle={
            {
              textExtraLarge: {},
              textNeutralSubtitle: {},
            } as never
          }
        />,
      );
    });

    const accentBars = tree!.root.findAllByType("WnaAccentBar");
    const texts = tree!.root.findAllByType("Text");
    const textValues = texts.map(
      (node: { props: { children?: React.ReactNode } }) => node.props.children,
    );

    expect(accentBars).toHaveLength(1);
    expect(accentBars[0].props.width).toBe(112);
    expect(accentBars[0].props.pulseToWidth).toBe(24);
    expect(accentBars[0].props.pulseDuration).toBe(30000);
    expect(textValues).toEqual([
      testAppData.profile.name,
      testAppData.profile.title.toUpperCase(),
    ]);
  });

  it("renders the accent bar in the compact hero copy as well", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaProfileHero
          appColors={appColors}
          appData={testAppData}
          appStyle={
            {
              textExtraLarge: { fontFamily: "System" },
              textMicro: { fontFamily: "System" },
            } as never
          }
          compact
        />,
      );
    });

    const accentBars = tree!.root.findAllByType("WnaAccentBar");

    expect(accentBars).toHaveLength(1);
    expect(accentBars[0].props.width).toBe(112);
    expect(accentBars[0].props.pulseToWidth).toBe(24);
    expect(accentBars[0].props.pulseDuration).toBe(30000);
  });

  it("animates hero shapes when reduced motion is disabled", () => {
    mockReduceMotion = false;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaProfileHero
          appColors={appColors}
          appData={testAppData}
          appStyle={
            {
              textExtraLarge: {},
              textNeutralSubtitle: {},
            } as never
          }
        />,
      );
    });

    const animatedShape = tree!.root
      .findAllByType("AnimatedView")
      .find(
        (node: { props: { style?: unknown[] } }) =>
          Array.isArray(node.props.style) &&
          (node.props.style[1] as { opacity?: number })?.opacity !== 1,
      );

    expect(animatedShape?.props.style[1]).toEqual(
      expect.objectContaining({
        opacity: expect.any(Number),
        transform: expect.arrayContaining([
          expect.objectContaining({ scale: expect.any(Number) }),
        ]),
      }),
    );
  });

  it("defaults WnaHeroField to non-compact when compact is omitted", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaHeroField appColors={appColors} />);
    });

    const shapeField = tree!.root.findByType("View" as never);

    expect(shapeField.props.style[1]).toBe(false);
  });
});
