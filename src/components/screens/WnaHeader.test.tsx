/* eslint-disable @typescript-eslint/no-require-imports */
import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { WnaHeader } from "@components/screens/WnaHeader";

const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockNavigate = jest.fn();
const mockCanGoBack = jest.fn(() => false);

jest.mock("@components/WnaAppContext", () => {
  const { jest: jestModule } = require("@jest/globals");

  return {
    useWnaTheme: jestModule.fn(() => ({
      appColors: {
        staticWarmgray8: "#222",
        staticWhite: "#fff",
      },
      appStyle: {},
      setAppColors: jestModule.fn(),
      theme: "dark",
      setTheme: jestModule.fn(),
    })),
    useWnaLayout: jestModule.fn(() => ({
      appLayout: {
        headerHeight: 72,
        headerButtonHeight: 56,
        globalCornerRadius: 8,
      },
      isLandscape: false,
    })),
  };
});

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
    back: mockBack,
    navigate: mockNavigate,
    canGoBack: mockCanGoBack,
  }),
}));

jest.mock("@components/misc/WnaBlurView", () => {
  const ReactModule = require("react") as typeof import("react");

  return {
    WnaBlurView: (props: unknown) =>
      ReactModule.createElement(
        "WnaBlurView",
        props as Record<string, unknown>,
      ),
  };
});

jest.mock("@components/buttons/WnaButtonHeader", () => {
  const ReactModule = require("react") as typeof import("react");

  return function MockButtonHeader(props: unknown) {
    return ReactModule.createElement(
      "WnaButtonHeader",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/screens/WnaMultilineHeader", () => {
  const ReactModule = require("react") as typeof import("react");

  return function MockMultilineHeader(
    _appColors: unknown,
    _appStyle: unknown,
    _appLayout: unknown,
    _isTabRoot: boolean,
    _isLandscape: boolean,
    headerTitle?: string,
    onPress?: () => void,
  ) {
    return ReactModule.createElement("WnaMultilineHeader", {
      headerTitle,
      onPress,
    });
  };
});

jest.mock("@components/misc/WnaShadowStyle", () => ({
  WnaShadowStyle: () => ({}),
}));

jest.mock("@services/wnaAsyncStorageProvider", () => ({
  getThemeFromStorageAsync: async () => "dark",
  setThemeToStorageAsync: async () => undefined,
}));

jest.mock("@utils/themeColors", () => ({
  getNextTheme: () => "light",
  resolveAppColors: () => ({}),
}));

jest.mock("react-native-toast-message", () => ({
  show: jest.fn(),
}));

jest.mock("react-native-reanimated", () => {
  const ReactModule = require("react") as typeof import("react");

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
      bezier: () => 0,
    },
    useAnimatedStyle: (factory: () => unknown) => factory(),
    useSharedValue: (value: unknown) => ({ value }),
    withTiming: (value: unknown) => value,
  };
});

describe("WnaHeader", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockBack.mockClear();
    mockNavigate.mockClear();
    mockCanGoBack.mockReturnValue(false);
  });

  it("uses onTitlePress before navigation", () => {
    const onTitlePress = jest.fn();
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaHeader
          headerTitle="Start"
          titleHref="/somewhere"
          onTitlePress={onTitlePress}
        />,
      );
    });

    const title = tree!.root.findByType("WnaMultilineHeader");

    act(() => {
      title.props.onPress();
    });

    expect(onTitlePress).toHaveBeenCalledTimes(1);
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockBack).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("falls back to titleHref when no custom title handler exists", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaHeader headerTitle="Projects" titleHref="/projects" />,
      );
    });

    const title = tree!.root.findByType("WnaMultilineHeader");

    act(() => {
      title.props.onPress();
    });

    expect(mockReplace).toHaveBeenCalledWith("/projects");
  });
});
