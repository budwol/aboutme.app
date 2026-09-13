import WnaApp, { ErrorBoundary } from "@components/WnaApp";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import React from "react";
import { Dimensions, Text } from "react-native";
import TestRenderer, { act } from "react-test-renderer";
import { testAppData } from "@/app-data/testAppData";

const mockLoggerError = jest.fn();
const originalRequestAnimationFrame = global.requestAnimationFrame;
let mockPathname = "/start";

type RenderedTextNode = {
  props: {
    children?: unknown;
    accessibilityRole?: string;
    accessibilityLabel?: string;
    onPress?: () => void;
  };
};

jest.mock("wna-logger", () => ({
  __esModule: true,
  default: {
    error: (...args: unknown[]) => mockLoggerError(...args),
    info: () => {},
    warn: () => {},
  },
}));

const mockSetIsAppInitialized = jest.fn();
const mockSetAppData = jest.fn();
const mockSetAppColors = jest.fn();
const mockSetTheme = jest.fn();
const mockSetDimensions = jest.fn();
let mockNavigationTransitionBackgroundImageUrl: string | undefined;
let mockIsAppInitialized = true;
let mockIsNavigationTransitionActive = false;
const mockFinishNavigationTransition = jest.fn();
let mockAppColors = {
  isDark: false,
  accent5: "#2277ee",
  staticBlack: "#000000",
  background: "#ffffff",
  white: "#ffffff",
  black: "#111111",
  coolgray2: "#dddddd",
  coolgray4: "#999999",
  coolgray6: "#666666",
  coolgray8: "#111111",
};

jest.mock("@/state/WnaAppContext", () => ({
  useWnaAppLifecycle: () => ({
    finishNavigationTransition: mockFinishNavigationTransition,
    isAppInitialized: mockIsAppInitialized,
    isNavigationTransitionActive: mockIsNavigationTransitionActive,
    navigationTransitionBackgroundImageUrl:
      mockNavigationTransitionBackgroundImageUrl,
    setIsAppInitialized: mockSetIsAppInitialized,
  }),
  useWnaLayout: () => ({
    appLayout: { backgroundImageUrl: "/background.webp", footerHeight: 48 },
    setDimensions: mockSetDimensions,
  }),
  useWnaTheme: () => ({
    appColors: mockAppColors,
    setAppColors: mockSetAppColors,
    setTheme: mockSetTheme,
  }),
  useWnaAppData: () => ({
    setAppData: mockSetAppData,
  }),
}));

jest.mock("expo-router", () => ({
  usePathname: () => mockPathname,
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

jest.mock("@components/feedback/WnaToastHost", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { jest: jestModule } = require("@jest/globals");
  const ReactModule = jestModule.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaToastHost(props: unknown) {
    return ReactModule.createElement(
      "WnaToastHost",
      props as Record<string, unknown>,
    );
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

jest.mock("@components/images/WnaImageBackground", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react") as typeof import("react");

  return function MockWnaImageBackground(props: unknown) {
    return ReactModule.createElement(
      "WnaImageBackground",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
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
      out: (value: unknown) => value,
      cubic: "cubic",
    },
    runOnJS: (callback: (...args: unknown[]) => void) => callback,
    useAnimatedStyle: (callback: () => Record<string, unknown>) => callback(),
    useSharedValue: (initialValue: number) => ({ value: initialValue }),
    withDelay: (_delay: number, value: unknown) => value,
    withTiming: (
      value: unknown,
      _config?: unknown,
      callback?: (finished?: boolean) => void,
    ) => {
      callback?.(true);

      return value;
    },
  };
});

describe("WnaApp", () => {
  beforeEach(() => {
    mockNavigationTransitionBackgroundImageUrl = undefined;
    mockIsAppInitialized = true;
    mockIsNavigationTransitionActive = false;
    mockPathname = "/start";
    mockAppColors = {
      isDark: false,
      accent5: "#2277ee",
      staticBlack: "#000000",
      background: "#ffffff",
      white: "#ffffff",
      black: "#111111",
      coolgray2: "#dddddd",
      coolgray4: "#999999",
      coolgray6: "#666666",
      coolgray8: "#111111",
    };
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.requestAnimationFrame = originalRequestAnimationFrame;
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("renders only the neutral boot shell before initialization", () => {
    mockIsAppInitialized = false;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaApp appData={testAppData} theme="system">
          <Text>content</Text>
        </WnaApp>,
      );
    });

    expect(tree!.root.findAllByType("SafeAreaView")).toHaveLength(0);
    expect(tree!.root.findAllByType("Text")).toHaveLength(0);
    expect(tree!.root.findByType("View").props.style).toEqual(
      expect.objectContaining({ flex: 1 }),
    );
  });

  it("uses a dark neutral boot shell when the OS color scheme is dark", () => {
    mockIsAppInitialized = false;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RN = require("react-native") as typeof import("react-native");
    const colorSchemeSpy = jest
      .spyOn(RN, "useColorScheme")
      .mockReturnValue("dark");
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaApp appData={testAppData} theme="system">
          <Text>content</Text>
        </WnaApp>,
      );
    });

    expect(tree!.root.findByType("View").props.style).toEqual(
      expect.objectContaining({ backgroundColor: "#111" }),
    );

    colorSchemeSpy.mockRestore();
  });

  it("unmounts cleanly before any debounced resize or reveal timers fire", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaApp appData={testAppData} theme="system">
          <Text>content</Text>
        </WnaApp>,
      );
    });

    act(() => {
      tree!.unmount();
    });
  });

  it("removes the static export shell when the app mounts", () => {
    const removeStaticShell = jest.fn();
    const originalDocument = global.document;
    (global as typeof globalThis & { document: Document }).document = {
      getElementById: (id: string) =>
        id === "wna-static-shell"
          ? ({ remove: removeStaticShell } as unknown as HTMLElement)
          : null,
    } as Document;

    act(() => {
      TestRenderer.create(
        <WnaApp appData={testAppData} theme="system">
          <Text>content</Text>
        </WnaApp>,
      );
    });

    expect(removeStaticShell).toHaveBeenCalled();

    global.document = originalDocument;
  });

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

  it("wires resize events through the debounced layout updater", () => {
    jest.useFakeTimers();
    const remove = jest.fn();
    let onChange: (() => void) | undefined;
    const addEventListenerSpy = jest
      .spyOn(Dimensions, "addEventListener")
      .mockImplementation((_type, listener) => {
        onChange = listener as () => void;

        return { remove } as never;
      });
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaApp appData={testAppData} theme="system">
          <Text>content</Text>
        </WnaApp>,
      );
    });

    expect(mockSetDimensions).toHaveBeenCalledTimes(1);

    act(() => {
      onChange!();
      onChange!();
      jest.advanceTimersByTime(100);
    });

    expect(mockSetDimensions).toHaveBeenCalledTimes(2);

    act(() => {
      tree!.unmount();
    });

    expect(remove).toHaveBeenCalledTimes(1);
    addEventListenerSpy.mockRestore();
    jest.useRealTimers();
  });

  it("shows the navigation transition overlay after the intro completed", () => {
    global.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      callback(0);

      return 1;
    }) as never;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaApp appData={testAppData} theme="system">
          <></>
        </WnaApp>,
      );
    });

    const contentView = tree!.root.findAllByType("AnimatedView")[0];

    act(() => {
      contentView.props.onLayout({});
    });

    mockIsNavigationTransitionActive = true;

    act(() => {
      tree!.update(
        <WnaApp appData={testAppData} theme="system">
          <></>
        </WnaApp>,
      );
    });

    expect(tree!.root.findAllByType("WnaHeroField")).toHaveLength(1);
    expect(mockFinishNavigationTransition).not.toHaveBeenCalled();
  });

  it("finishes the navigation transition after the pathname changes", () => {
    global.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      callback(0);

      return 1;
    }) as never;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaApp appData={testAppData} theme="system">
          <></>
        </WnaApp>,
      );
    });

    const contentView = tree!.root.findAllByType("AnimatedView")[0];

    act(() => {
      contentView.props.onLayout({});
    });

    mockIsNavigationTransitionActive = true;

    act(() => {
      tree!.update(
        <WnaApp appData={testAppData} theme="system">
          <></>
        </WnaApp>,
      );
    });

    mockPathname = "/next";

    act(() => {
      tree!.update(
        <WnaApp appData={testAppData} theme="system">
          <></>
        </WnaApp>,
      );
    });

    expect(mockFinishNavigationTransition).toHaveBeenCalledTimes(1);
  });

  it("keeps the navigation transition inactive during the intro", () => {
    mockIsNavigationTransitionActive = true;
    global.requestAnimationFrame = jest.fn(() => 1) as never;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaApp appData={testAppData} theme="system">
          <Text>content</Text>
        </WnaApp>,
      );
    });

    const contentView = tree!.root.findAllByType("AnimatedView")[0];

    act(() => {
      contentView.props.onLayout({});
    });

    expect(tree!.root.findAllByType("WnaHeroField")).toHaveLength(1);

    act(() => {
      contentView.props.onLayout({});
    });

    expect(tree!.root.findAllByType("WnaHeroField")).toHaveLength(1);
  });

  it("renders the navigation transition over its background image", () => {
    mockAppColors = { ...mockAppColors, isDark: true };
    global.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      callback(0);

      return 1;
    }) as never;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaApp appData={testAppData} theme="system">
          <Text>content</Text>
        </WnaApp>,
      );
    });

    const introOverlay = tree!.root.findAllByType("AnimatedView")[1];

    expect(introOverlay.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: "#111111" }),
      ]),
    );

    const contentView = tree!.root.findAllByType("AnimatedView")[0];

    act(() => {
      contentView.props.onLayout({});
    });

    mockIsNavigationTransitionActive = true;

    act(() => {
      tree!.update(
        <WnaApp appData={testAppData} theme="system">
          <Text>content</Text>
        </WnaApp>,
      );
    });

    const transitionContent = tree!.root.find(
      (node: { type: { name?: string } }) =>
        typeof node.type === "function" &&
        node.type.name === "WnaNavigationTransitionOverlay",
    );
    const transitionBackground = transitionContent.parent;
    const navigationOverlay = tree!.root
      .findAllByType("AnimatedView")
      .find(
        (node: { findAllByType: (type: string) => unknown[] }) =>
          node.findAllByType("WnaImageBackground").length > 0,
      );

    expect(transitionBackground?.type).toBe("WnaImageBackground");
    expect(navigationOverlay?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ zIndex: 20 }),
        expect.objectContaining({ backgroundColor: "#111111" }),
      ]),
    );
    expect(navigationOverlay?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ pointerEvents: "auto" }),
      ]),
    );
    expect(transitionBackground?.props).toEqual(
      expect.objectContaining({
        testID: "navigation-transition-background",
        imageUri: "/background.webp",
        appColors: mockAppColors,
        isDarkMode: true,
      }),
    );
    expect(navigationOverlay?.props.testID).toBe(
      "navigation-transition-overlay",
    );
  });

  it("uses the active screen background image for the navigation transition", () => {
    mockNavigationTransitionBackgroundImageUrl = "/project-background.webp";
    global.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      callback(0);

      return 1;
    }) as never;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaApp appData={testAppData} theme="system">
          <Text>content</Text>
        </WnaApp>,
      );
    });

    const contentView = tree!.root.findAllByType("AnimatedView")[0];

    act(() => {
      contentView.props.onLayout({});
    });

    mockIsNavigationTransitionActive = true;

    act(() => {
      tree!.update(
        <WnaApp appData={testAppData} theme="system">
          <Text>content</Text>
        </WnaApp>,
      );
    });

    const transitionBackground = tree!.root.find(
      (node: { type: string; props: { imageUri?: string } }) =>
        node.type === "WnaImageBackground" &&
        node.props.imageUri === "/project-background.webp",
    );

    expect(transitionBackground.props.imageUri).toBe(
      "/project-background.webp",
    );
  });

  it("falls back to the layout background when the active transition background is blank", () => {
    mockNavigationTransitionBackgroundImageUrl = "   ";
    global.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      callback(0);

      return 1;
    }) as never;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaApp appData={testAppData} theme="system">
          <Text>content</Text>
        </WnaApp>,
      );
    });

    const contentView = tree!.root.findAllByType("AnimatedView")[0];

    act(() => {
      contentView.props.onLayout({});
    });

    mockIsNavigationTransitionActive = true;

    act(() => {
      tree!.update(
        <WnaApp appData={testAppData} theme="system">
          <Text>content</Text>
        </WnaApp>,
      );
    });

    const transitionBackground = tree!.root.findByProps({
      testID: "navigation-transition-background",
    });

    expect(transitionBackground.props.imageUri).toBe("/background.webp");
  });

  it("does not finish the navigation transition when the outgoing animation is interrupted", () => {
    global.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      callback(0);

      return 1;
    }) as never;

    const reanimated = jest.requireMock("react-native-reanimated") as {
      withTiming: (
        value: unknown,
        config?: unknown,
        callback?: (finished?: boolean) => void,
      ) => unknown;
    };
    const originalWithTiming = reanimated.withTiming;

    reanimated.withTiming = (value, _config, callback) => {
      callback?.(false);

      return value;
    };

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaApp appData={testAppData} theme="system">
          <></>
        </WnaApp>,
      );
    });

    const contentView = tree!.root.findAllByType("AnimatedView")[0];

    act(() => {
      contentView.props.onLayout({});
    });

    mockIsNavigationTransitionActive = true;

    act(() => {
      tree!.update(
        <WnaApp appData={testAppData} theme="system">
          <></>
        </WnaApp>,
      );
    });

    mockPathname = "/next";

    act(() => {
      tree!.update(
        <WnaApp appData={testAppData} theme="system">
          <></>
        </WnaApp>,
      );
    });

    expect(mockFinishNavigationTransition).not.toHaveBeenCalled();

    reanimated.withTiming = originalWithTiming;
  });
});

describe("ErrorBoundary", () => {
  it("logs the error and renders a retry action", () => {
    mockLoggerError.mockClear();
    const error = new Error("boom");
    const retry = jest.fn<() => Promise<void>>();

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<ErrorBoundary error={error} retry={retry} />);
    });

    expect(mockLoggerError).toHaveBeenCalledWith("ErrorBoundary", error);

    const textValues = tree!.root
      .findAllByType("Text")
      .map((node: RenderedTextNode) => node.props.children);
    expect(textValues).toContain("boom");
    expect(textValues).toContain("actionRetry");

    const retryButton = tree!.root.find(
      (node: RenderedTextNode) =>
        node.props.accessibilityRole === "button" &&
        node.props.accessibilityLabel === "actionRetry",
    );
    expect(retryButton.props.accessibilityRole).toBe("button");
    expect(retryButton.props.accessibilityLabel).toBe("actionRetry");
    act(() => {
      retryButton.props.onPress!();
    });

    expect(retry).toHaveBeenCalledTimes(1);
  });
});
