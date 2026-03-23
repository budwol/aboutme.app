import WnaApp from "@components/WnaApp";
import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { testAppData } from "@/app-data/testAppData";

type RenderedTextNode = {
  props: {
    children?: unknown;
  };
};

const mockSetIsAppInitialized = jest.fn();
const mockSetAppData = jest.fn();
const mockSetAppColors = jest.fn();
const mockSetTheme = jest.fn();

function MockToast(props: unknown) {
  // keep the test renderer simple, we only care about the config prop here
  // and the static api shape matching the runtime component.
  return React.createElement("Toast", props as Record<string, unknown>);
}

MockToast.show = jest.fn();

jest.mock("@components/WnaAppContext", () => ({
  useWnaAppLifecycle: () => ({
    isAppInitialized: true,
    setIsAppInitialized: mockSetIsAppInitialized,
  }),
  useWnaLayout: () => ({
    appLayout: { footerHeight: 48 },
    setDimensions: jest.fn(),
  }),
  useWnaTheme: () => ({
    appColors: {
      isDark: false,
      accent5: "#2277ee",
      coolgray6: "#666666",
      coolgray8: "#111111",
    },
    setAppColors: mockSetAppColors,
    setTheme: mockSetTheme,
  }),
  useWnaAppData: () => ({
    setAppData: mockSetAppData,
  }),
}));

jest.mock("@utils/themeColors", () => ({
  resolveAppColors: () => ({ resolved: true }),
}));

jest.mock("react-i18next", () => ({
  initReactI18next: {
    type: "3rdParty",
    init: () => undefined,
  },
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: (props: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ReactModule = require("react") as typeof import("react");

    return ReactModule.createElement(
      "SafeAreaView",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  },
}));

jest.mock("react-native-toast-message", () => {
  return {
    __esModule: true,
    default: MockToast,
  };
});

jest.mock("@components/sections/WnaProfileHero", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react") as typeof import("react");

  return {
    WnaHeroField: (props: unknown) =>
      ReactModule.createElement(
        "WnaHeroField",
        props as Record<string, unknown>,
      ),
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
      out: (value: unknown) => value,
      cubic: "cubic",
    },
    runOnJS: (callback: (...args: unknown[]) => void) => callback,
    useAnimatedStyle: (callback: () => Record<string, unknown>) => callback(),
    useSharedValue: (initialValue: number) => ({ value: initialValue }),
    withDelay: (_delay: number, value: unknown) => value,
    withTiming: (value: unknown) => value,
  };
});

describe("WnaApp", () => {
  it("renders the opener bubble field with the provided app data", () => {
    const appData = {
      ...testAppData,
      profile: {
        ...testAppData.profile,
        name: "Test Person",
        title: "Platform Engineer",
      },
    };

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaApp appData={appData} theme="system">
          <></>
        </WnaApp>,
      );
    });

    const heroField = tree!.root.findByType("WnaHeroField");
    const textValues = tree!.root
      .findAllByType("Text")
      .map((node: RenderedTextNode) => node.props.children);

    expect(heroField.props.compact).toBe(true);
    expect(textValues).toContain(appData.profile.name);
    expect(textValues).toContain(appData.profile.title.toUpperCase());
  });
});
