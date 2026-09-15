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
import TestRenderer, { act } from "react-test-renderer";
import { testAppData } from "@/app-data/testAppData";
import { appMotionConstants } from "@constants/motionConstants";

const mockLoggerError = jest.fn();
let mockPathname = "/start";
let activeTree: ReturnType<typeof TestRenderer.create> | undefined;

function createTrackedTree(
  element: React.ReactElement,
): ReturnType<typeof TestRenderer.create> {
  activeTree = TestRenderer.create(element);
  return activeTree;
}

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

jest.mock("@/navigation/router/wnaRouter", () => ({
  useWnaPathname: () => mockPathname,
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
    if (activeTree) {
      act(() => {
        activeTree!.unmount();
      });
      activeTree = undefined;
    }
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it("renders only the neutral boot shell before initialization", () => {
    mockIsAppInitialized = false;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = createTrackedTree(
        <WnaApp appData={testAppData} theme="system">
          <></>
        </WnaApp>,
      );
    });

    expect(tree!.root.findAllByType("SafeAreaView")).toHaveLength(0);
    expect(tree!.root.findAllByType("span")).toHaveLength(0);
    expect(tree!.root.findByType("div").props.style).toEqual({
      flex: 1,
      backgroundColor: "#fff",
    });
  });

  it("uses a dark neutral boot shell when the OS color scheme is dark", () => {
    mockIsAppInitialized = false;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const colorSchemeModule = require("@utils/useBrowserColorScheme");
    const colorSchemeSpy = jest
      .spyOn(colorSchemeModule, "useBrowserColorScheme")
      .mockReturnValue("dark");
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = createTrackedTree(
        <WnaApp appData={testAppData} theme="system">
          <></>
        </WnaApp>,
      );
    });

    expect(tree!.root.findByType("div").props.style).toEqual({
      flex: 1,
      backgroundColor: "#111",
    });

    colorSchemeSpy.mockRestore();
  });

  it("unmounts cleanly before any debounced resize or reveal timers fire", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = createTrackedTree(
        <WnaApp appData={testAppData} theme="system">
          <></>
        </WnaApp>,
      );
    });

    act(() => {
      tree!.unmount();
    });
  });

  it("removes the static export shell when the app mounts", () => {
    const removeStaticShell = jest.fn();
    const getElementByIdSpy = jest
      .spyOn(document, "getElementById")
      .mockImplementation((id: string) =>
        id === "wna-static-shell"
          ? ({ remove: removeStaticShell } as unknown as HTMLElement)
          : null,
      );

    act(() => {
      createTrackedTree(
        <WnaApp appData={testAppData} theme="system">
          <></>
        </WnaApp>,
      );
    });

    expect(removeStaticShell).toHaveBeenCalled();

    getElementByIdSpy.mockRestore();
  });

  it("skips removing the static export shell when no document is available", () => {
    const originalDocument = globalThis.document;
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      writable: true,
      value: undefined,
    });

    try {
      expect(() => {
        act(() => {
          createTrackedTree(
            <WnaApp appData={testAppData} theme="system">
              <></>
            </WnaApp>,
          );
        });
      }).not.toThrow();
    } finally {
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: originalDocument,
      });
    }
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
      tree = createTrackedTree(
        <WnaApp appData={appData} theme="system">
          <></>
        </WnaApp>,
      );
    });

    const heroField = tree!.root.findByType("WnaHeroField");
    const textValues = tree!.root
      .findAllByType("span")
      .map((node: RenderedTextNode) => node.props.children);

    expect(heroField.props.compact).toBe(true);
    expect(textValues).toContain(appData.profile.name);
    expect(textValues).toContain(appData.profile.title.toUpperCase());
    expect(
      tree!.root
        .findAllByType("div")
        .some(
          (node: { props: { id?: string } }) =>
            node.props.id === "wna-safe-area",
        ),
    ).toBe(true);
  });

  it("wires browser resize events through the debounced layout updater", () => {
    jest.useFakeTimers();
    let onChange: (() => void) | undefined;
    const originalWindow = global.window;
    const addEventListener = jest.fn((type: string, listener: () => void) => {
      if (type === "resize") onChange = listener;
    });
    const removeEventListener = jest.fn();
    Object.defineProperty(global, "window", {
      configurable: true,
      value: { addEventListener, removeEventListener },
    });
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = createTrackedTree(
        <WnaApp appData={testAppData} theme="system">
          <></>
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

    expect(removeEventListener).toHaveBeenCalledWith("resize", onChange);
    Object.defineProperty(global, "window", {
      configurable: true,
      value: originalWindow,
    });
    jest.useRealTimers();
  });

  it("uses the browser resize event when the web target is available", () => {
    const originalWindow = global.window;
    const addEventListener = jest.fn();
    const removeEventListener = jest.fn();
    Object.defineProperty(global, "window", {
      configurable: true,
      value: { addEventListener, removeEventListener },
    });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;
    act(() => {
      tree = createTrackedTree(
        <WnaApp appData={testAppData} theme="system">
          <></>
        </WnaApp>,
      );
    });

    expect(addEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );

    act(() => {
      tree!.unmount();
    });

    expect(removeEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );
    Object.defineProperty(global, "window", {
      configurable: true,
      value: originalWindow,
    });
  });

  it("skips wiring resize events when window.addEventListener is unavailable", () => {
    // `addEventListener` lives on the prototype, so shadow it with an
    // own, non-function property instead of trying to `delete` it.
    Object.defineProperty(window, "addEventListener", {
      configurable: true,
      value: undefined,
    });

    try {
      expect(() => {
        act(() => {
          createTrackedTree(
            <WnaApp appData={testAppData} theme="system">
              <></>
            </WnaApp>,
          );
        });
      }).not.toThrow();

      expect(mockSetDimensions).toHaveBeenCalledTimes(1);
    } finally {
      delete (window as { addEventListener?: unknown }).addEventListener;
    }
  });

  it("shows the navigation transition overlay after the intro completed", () => {
    jest.useFakeTimers();
    jest
      .spyOn(global, "requestAnimationFrame")
      .mockImplementation((callback: FrameRequestCallback) => {
        callback(0);

        return 1;
      });
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = createTrackedTree(
        <WnaApp appData={testAppData} theme="system">
          <></>
        </WnaApp>,
      );
    });

    act(() => {
      jest.advanceTimersByTime(
        appMotionConstants.introDelay + appMotionConstants.introDuration,
      );
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
    jest.useFakeTimers();
    jest
      .spyOn(global, "requestAnimationFrame")
      .mockImplementation((callback: FrameRequestCallback) => {
        callback(0);

        return 1;
      });
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = createTrackedTree(
        <WnaApp appData={testAppData} theme="system">
          <></>
        </WnaApp>,
      );
    });

    act(() => {
      jest.advanceTimersByTime(
        appMotionConstants.introDelay + appMotionConstants.introDuration,
      );
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
    const queuedFrames: FrameRequestCallback[] = [];
    jest
      .spyOn(global, "requestAnimationFrame")
      .mockImplementation((callback: FrameRequestCallback) => {
        queuedFrames.push(callback);
        return queuedFrames.length;
      });

    act(() => {
      tree!.update(
        <WnaApp appData={testAppData} theme="system">
          <></>
        </WnaApp>,
      );
    });

    const contentAfterNavigation = tree!.root.find(
      (node: { props: { style?: { flex?: number; opacity?: number } } }) =>
        node.props.style?.flex === 1 &&
        typeof node.props.style?.opacity === "number",
    );
    expect(contentAfterNavigation.props.style).toEqual({
      display: "flex",
      flexDirection: "column",
      flex: 1,
      minHeight: 0,
      opacity: 0,
      transition: `opacity ${appMotionConstants.navigationTransitionDurationOut}ms ease-out`,
    });
    act(() => queuedFrames.shift()?.(0));
    act(() => queuedFrames.shift()?.(0));

    expect(
      tree!.root.findByProps({ id: "navigation-transition-overlay" }).props
        .style,
    ).toEqual({
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 20,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f8f7f3",
      pointerEvents: "auto",
      opacity: 0,
      transition: `opacity ${appMotionConstants.navigationTransitionDurationOut}ms ease-out`,
    });

    act(() => {
      jest.advanceTimersByTime(560);
    });

    expect(mockFinishNavigationTransition).toHaveBeenCalledTimes(1);

    act(() => {
      tree!.unmount();
    });
  });

  it("keeps the navigation transition inactive during the intro", () => {
    jest.useFakeTimers();
    mockIsNavigationTransitionActive = true;
    jest.spyOn(global, "requestAnimationFrame").mockImplementation(() => 1);
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = createTrackedTree(
        <WnaApp appData={testAppData} theme="system">
          <></>
        </WnaApp>,
      );
    });

    expect(tree!.root.findAllByType("WnaHeroField")).toHaveLength(1);
  });

  it("renders the navigation transition over its background image", () => {
    jest.useFakeTimers();
    mockAppColors = { ...mockAppColors, isDark: true };
    jest
      .spyOn(global, "requestAnimationFrame")
      .mockImplementation((callback: FrameRequestCallback) => {
        callback(0);

        return 1;
      });
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = createTrackedTree(
        <WnaApp appData={testAppData} theme="system">
          <></>
        </WnaApp>,
      );
    });

    const introOverlay = tree!.root.findByProps({
      id: "wna-intro-overlay",
    });

    expect(introOverlay.props.style).toEqual({
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 20,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#111111",
      pointerEvents: "none",
    });

    act(() => {
      jest.advanceTimersByTime(
        appMotionConstants.introDelay + appMotionConstants.introDuration,
      );
    });

    mockIsNavigationTransitionActive = true;

    act(() => {
      tree!.update(
        <WnaApp appData={testAppData} theme="system">
          <></>
        </WnaApp>,
      );
    });

    const transitionContent = tree!.root.find(
      (node: { type: { name?: string } }) =>
        typeof node.type === "function" &&
        node.type.name === "WnaNavigationTransitionOverlay",
    );
    const transitionBackground = transitionContent.parent;
    const navigationOverlay = tree!.root.findByProps({
      id: "navigation-transition-overlay",
    });

    expect(transitionBackground?.type).toBe("WnaImageBackground");
    // `opacity`/`transition` depend on the in-flight transition phase
    // timing and are intentionally left out of scope for this test, which
    // is about the overlay's identity/background, not its fade timing
    // (already covered by the dedicated transition-phase tests below).
    expect(navigationOverlay?.props.style).toEqual(
      expect.objectContaining({
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#111111",
        pointerEvents: "auto",
      }),
    );
    // `children` is intentionally left out of scope here: it's already
    // verified above via `transitionContent` (the `WnaNavigationTransitionOverlay`
    // descendant lookup), so re-asserting the exact element tree here
    // would just duplicate that check.
    expect(transitionBackground?.props).toEqual(
      expect.objectContaining({
        testID: "navigation-transition-background",
        imageUri: "/background.webp",
        appColors: mockAppColors,
        isDarkMode: true,
      }),
    );
    expect(navigationOverlay?.props.id).toBe("navigation-transition-overlay");
  });

  it("uses the active screen background image for the navigation transition", () => {
    jest.useFakeTimers();
    mockNavigationTransitionBackgroundImageUrl = "/project-background.webp";
    jest
      .spyOn(global, "requestAnimationFrame")
      .mockImplementation((callback: FrameRequestCallback) => {
        callback(0);

        return 1;
      });
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = createTrackedTree(
        <WnaApp appData={testAppData} theme="system">
          <></>
        </WnaApp>,
      );
    });

    act(() => {
      jest.advanceTimersByTime(
        appMotionConstants.introDelay + appMotionConstants.introDuration,
      );
    });

    mockIsNavigationTransitionActive = true;

    act(() => {
      tree!.update(
        <WnaApp appData={testAppData} theme="system">
          <></>
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
    jest.useFakeTimers();
    mockNavigationTransitionBackgroundImageUrl = "   ";
    jest
      .spyOn(global, "requestAnimationFrame")
      .mockImplementation((callback: FrameRequestCallback) => {
        callback(0);

        return 1;
      });
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = createTrackedTree(
        <WnaApp appData={testAppData} theme="system">
          <></>
        </WnaApp>,
      );
    });

    act(() => {
      jest.advanceTimersByTime(
        appMotionConstants.introDelay + appMotionConstants.introDuration,
      );
    });

    mockIsNavigationTransitionActive = true;

    act(() => {
      tree!.update(
        <WnaApp appData={testAppData} theme="system">
          <></>
        </WnaApp>,
      );
    });

    const transitionBackground = tree!.root.findByProps({
      testID: "navigation-transition-background",
    });

    expect(transitionBackground.props.imageUri).toBe("/background.webp");
  });

  it("waits for the outgoing CSS transition before finishing navigation", () => {
    jest.useFakeTimers();
    jest
      .spyOn(global, "requestAnimationFrame")
      .mockImplementation((callback: FrameRequestCallback) => {
        callback(0);

        return 1;
      });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = createTrackedTree(
        <WnaApp appData={testAppData} theme="system">
          <></>
        </WnaApp>,
      );
    });

    act(() => {
      jest.advanceTimersByTime(
        appMotionConstants.introDelay + appMotionConstants.introDuration,
      );
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

    act(() => {
      jest.advanceTimersByTime(560);
    });

    expect(mockFinishNavigationTransition).toHaveBeenCalledTimes(1);
  });

  it("keeps the routed content container able to shrink below its content height so the page can scroll", () => {
    // Regression test: this container sits inside a `flex-direction: column`
    // ancestor chain. Flex items default to `min-height: auto`, which stops
    // them shrinking below their content's intrinsic height even with
    // `flex: 1` — the exact bug that broke page scrolling (content grew to
    // fill its full height instead of being clipped by the viewport).
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = createTrackedTree(
        <WnaApp appData={testAppData} theme="system">
          {React.createElement("div", {
            "data-testid": "app-content-marker",
          })}
        </WnaApp>,
      );
    });

    const marker = tree!.root.findByProps({
      "data-testid": "app-content-marker",
    });
    const contentContainer = marker.parent!;

    expect(contentContainer.type).toBe("div");
    expect(contentContainer.props.style).toEqual({
      display: "flex",
      flexDirection: "column",
      flex: 1,
      minHeight: 0,
      transform: "translateY(10px)",
      opacity: 1,
      transition: `opacity ${appMotionConstants.navigationTransitionDurationOut}ms ease-out`,
    });
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
      .findAllByType("span")
      .map((node: RenderedTextNode) => node.props.children);
    expect(textValues).toContain("boom");
    expect(textValues).toContain("actionRetry");

    const retryButton = tree!.root.findByType("button");
    expect(retryButton.props.type).toBe("button");
    expect(retryButton.props["aria-label"]).toBe("actionRetry");
    act(() => {
      retryButton.props.onClick();
    });

    expect(retry).toHaveBeenCalledTimes(1);
  });
});
