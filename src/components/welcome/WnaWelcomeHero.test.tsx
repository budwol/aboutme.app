import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaWelcomeHero from "@components/welcome/WnaWelcomeHero";
import { testAppData } from "@/test/testAppData";

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

jest.mock("@components/misc/WnaAccentBar", () => {
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
    useReducedMotion: () => true,
    useAnimatedStyle: (callback: () => Record<string, unknown>) => callback(),
    useSharedValue: (initialValue: number) => ({ value: initialValue }),
    withRepeat: (value: unknown) => value,
    withSequence: (...values: unknown[]) => values[0],
    withTiming: (value: unknown) => value,
  };
});

describe("WnaWelcomeHero", () => {
  it("renders the accent bar between name and title in the regular hero", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaWelcomeHero
          appColors={
            {
              white: "#ffffff",
              black: "#000000",
              accent5: "#22aa66",
              coolgray2: "#cccccc",
              coolgray8: "#222222",
              coolgray6: "#666666",
              warmgray6: "#999999",
            } as never
          }
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
        <WnaWelcomeHero
          appColors={
            {
              white: "#ffffff",
              black: "#000000",
              accent5: "#22aa66",
              coolgray2: "#cccccc",
              coolgray8: "#222222",
              coolgray6: "#666666",
              warmgray6: "#999999",
            } as never
          }
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
});
