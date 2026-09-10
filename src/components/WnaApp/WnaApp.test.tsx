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

jest.mock("wna-logger", () => ({
  __esModule: true,
  default: {
    error: (...args: unknown[]) => mockLoggerError(...args),
    info: () => {},
    warn: () => {},
  },
}));

type RenderedTextNode = {
  props: {
    children?: unknown;
  };
};

const mockSetIsAppInitialized = jest.fn();
const mockSetAppData = jest.fn();
const mockSetAppColors = jest.fn();
const mockSetTheme = jest.fn();
const mockSetDimensions = jest.fn();
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

function MockToast(props: unknown) {
  // keep the test renderer simple, we only care about the config prop here
  // and the static api shape matching the runtime component.
  return React.createElement("Toast", props as Record<string, unknown>);
}

MockToast.show = jest.fn();

jest.mock("@components/WnaAppContext", () => ({
  useWnaAppLifecycle: () => ({
    finishNavigationTransition: mockFinishNavigationTransition,
    isAppInitialized: mockIsAppInitialized,
    isNavigationTransitionActive: mockIsNavigationTransitionActive,
    setIsAppInitialized: mockSetIsAppInitialized,
  }),
  useWnaLayout: () => ({
    appLayout: { footerHeight: 48 },
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

  it("renders toast cards with configured text and fallback app colors", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaApp appData={testAppData} theme="system">
          <></>
        </WnaApp>,
      );
    });

    const toast = tree!.root.findByType("Toast");
    let card: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      card = TestRenderer.create(
        toast.props.config.success({
          text1: "Saved",
          text2: "Done",
          props: {},
        }),
      );
    });

    const textValues = card!.root
      .findAllByType("Text")
      .map((node: RenderedTextNode) => node.props.children);

    expect(textValues).toEqual(["Saved", "Done"]);
    expect(card.root.findAllByType("View")[0].props.style).toEqual(
      expect.objectContaining({
        backgroundColor: "rgba(255,255,255,0.98)",
      }),
    );
  });

  it("renders dark toast cards with provided override colors", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaApp appData={testAppData} theme="dark">
          <></>
        </WnaApp>,
      );
    });

    const toast = tree!.root.findByType("Toast");
    let card: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      card = TestRenderer.create(
        toast.props.config.error({
          text2: "Failed",
          props: {
            appColors: {
              ...mockAppColors,
              isDark: true,
              background: "#101010",
            },
          },
        }),
      );
    });

    expect(card!.root.findByType("Text").props.children).toBe("Failed");
    expect(card!.root.findAllByType("View")[0].props.style).toEqual(
      expect.objectContaining({
        backgroundColor: "rgba(16,16,16,0.98)",
      }),
    );

    let darkTitleCard: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      darkTitleCard = TestRenderer.create(
        toast.props.config.error({
          text1: "Alert",
          text2: "Failed",
          props: {
            appColors: {
              ...mockAppColors,
              isDark: true,
              background: "#101010",
            },
          },
        }),
      );
    });

    const darkTitleTexts = darkTitleCard!.root
      .findAllByType("Text")
      .map((node: RenderedTextNode) => node.props.children);

    expect(darkTitleTexts).toEqual(["Alert", "Failed"]);

    let fallbackColorsCard: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      fallbackColorsCard = TestRenderer.create(
        toast.props.config.error({
          text1: "Oops",
          text2: "Failed",
          props: {},
        }),
      );
    });

    expect(
      fallbackColorsCard!.root.findAllByType("View")[0].props.style,
    ).toEqual(
      expect.objectContaining({
        backgroundColor: "rgba(255,255,255,0.98)",
      }),
    );
  });

  it("renders theme-change and info toast variants", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaApp appData={testAppData} theme="system">
          <></>
        </WnaApp>,
      );
    });

    const toast = tree!.root.findByType("Toast");
    let themeChangeCard: ReturnType<typeof TestRenderer.create> | undefined;
    let infoCard: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      themeChangeCard = TestRenderer.create(
        toast.props.config.themeChange({
          text1: "Theme",
          props: {},
        }),
      );
      infoCard = TestRenderer.create(
        toast.props.config.info({
          text1: "Info",
          text2: "More",
          props: {},
        }),
      );
    });

    expect(themeChangeCard!.root.findByType("Text").props.children).toBe(
      "Theme",
    );
    expect(
      infoCard!.root
        .findAllByType("Text")
        .map((node: RenderedTextNode) => node.props.children),
    ).toEqual(["Info", "More"]);
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

  it("renders dark intro and navigation transition overlays", () => {
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

    const navigationOverlay = tree!.root.find(
      (node: { type: { name?: string } }) =>
        typeof node.type === "function" &&
        node.type.name === "WnaNavigationTransitionOverlay",
    ).parent;

    expect(navigationOverlay?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: "#111111" }),
      ]),
    );
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

    reanimated.withTiming = (value, config, callback) => {
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
    expect(textValues).toContain("retry");

    const retryText = tree!.root
      .findAllByType("Text")
      .find((node: RenderedTextNode) => node.props.children === "retry");
    act(() => {
      (retryText!.props as { onPress: () => void }).onPress();
    });

    expect(retry).toHaveBeenCalledTimes(1);
  });
});
