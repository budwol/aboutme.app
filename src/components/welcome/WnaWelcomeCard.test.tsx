import { defaultAppData } from "@/app-data";
import WnaWelcomeCard from "@components/welcome/WnaWelcomeCard";
import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";

jest.mock("@components/text/WnaWelcomeTitle", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockWnaWelcomeTitle(props: unknown) {
    return ReactModule.createElement(
      "WnaWelcomeTitle",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/images/WnaImage", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockWnaImage(props: unknown) {
    return ReactModule.createElement(
      "WnaImage",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/welcome/WnaTechstackCard", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockWnaTechStackCard(props: unknown) {
    return ReactModule.createElement(
      "WnaTechStackCard",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/welcome/WnaWelcomeHero", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockWnaWelcomeHero(props: unknown) {
    return ReactModule.createElement(
      "WnaWelcomeHero",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("react-native-reanimated", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

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

describe("WnaWelcomeCard", () => {
  it("renders the profile text as separate paragraphs from a multiline string", () => {
    const appData = {
      ...defaultAppData,
      profile: {
        ...defaultAppData.profile,
        description: "Absatz eins\n\nAbsatz zwei\nAbsatz drei",
      },
    };

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaWelcomeCard
          appColors={
            {
              white: "#ffffff",
              black: "#000000",
              coolgray2: "#cccccc",
              coolgray8: "#222222",
              warmgray6: "#999999",
              accent5: "#2277ee",
            } as never
          }
          appData={appData}
          appStyle={
            {
              textNeutralMedium: {},
              textExtraLarge: {},
            } as never
          }
          t={((value: string) => value) as never}
        />,
      );
    });

    const hero = tree!.root.findByType("WnaWelcomeHero");
    const techstack = tree!.root.findByType("WnaTechStackCard");
    const textValues = tree!.root
      .findAllByType("Text")
      .map(
        (node: { props: { children?: React.ReactNode } }) =>
          node.props.children,
      );

    expect(hero.props.appData).toBe(appData);
    expect(textValues).toEqual(["Absatz eins", "Absatz zwei", "Absatz drei"]);
    expect(techstack.props.appData).toBe(appData);
  });
});
