/* eslint-disable @typescript-eslint/no-require-imports */
import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { useWnaLayout } from "@/state/WnaAppContext";
import { WnaHeader } from "@components/chrome/WnaHeader";

const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockNavigate = jest.fn();
const mockCanGoBack = jest.fn(() => false);
const mockHistoryBack = jest.fn();
const mockStartNavigationTransition = jest.fn((action: () => void) => action());

type HeaderButtonNode = {
  props: {
    text?: string;
    onPress?: () => Promise<void> | void;
  };
};

jest.mock("@/state/WnaAppContext", () => {
  const { jest: jestModule } = require("@jest/globals");

  return {
    useWnaAppLifecycle: jestModule.fn(() => ({
      isNavigationTransitionActive: false,
      startNavigationTransition: mockStartNavigationTransition,
    })),
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
      isLandscape: true,
    })),
  };
});

jest.mock("@/navigation/router/wnaRouter", () => ({
  // Wrapped (not referenced directly) so each call reads the mock-prefixed
  // const's current value lazily — the object literal below would
  // otherwise be built once at module-eval time, before those consts are
  // initialized, permanently capturing them as undefined.
  router: {
    replace: (href: string) => mockReplace(href),
    back: (fallbackHref?: string) => mockBack(fallbackHref),
    navigate: (href: string) => mockNavigate(href),
    canGoBack: () => mockCanGoBack(),
  },
}));

jest.mock("@components/effects/WnaBlurView", () => {
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

jest.mock("@components/chrome/WnaMultilineHeader", () => {
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

jest.mock("@components/effects/wnaShadowStyle", () => ({
  createShadowStyle: () => ({}),
}));

jest.mock("@/storage/themeStorage", () => ({
  getThemeFromStorageAsync: async () => "dark",
  setThemeToStorageAsync: async () => undefined,
}));

jest.mock("@utils/themeColors", () => ({
  getNextTheme: () => "light",
  resolveAppColors: () => ({ id: 2, isDark: false }),
}));

jest.mock("@components/feedback/wnaToast");

const mockShowWnaToast = (
  jest.requireMock("@components/feedback/wnaToast") as {
    showWnaToast: jest.Mock;
  }
).showWnaToast;

describe("WnaHeader", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockBack.mockClear();
    mockNavigate.mockClear();
    mockCanGoBack.mockReturnValue(false);
    mockShowWnaToast.mockClear();
    mockHistoryBack.mockClear();
    mockStartNavigationTransition.mockClear();
    (useWnaLayout as jest.Mock).mockReturnValue({
      appLayout: {
        headerHeight: 72,
        headerButtonHeight: 56,
        globalCornerRadius: 8,
      },
      isLandscape: true,
    });

    Object.defineProperty(window, "history", {
      configurable: true,
      value: {
        length: 2,
        back: mockHistoryBack,
      },
    });
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

  it("passes the next theme colors into the toast when toggling the theme", async () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaHeader headerTitle="Start" />);
    });

    const buttons = tree!.root.findAllByType("WnaButtonHeader");
    const themeButton = buttons.find(
      (button: HeaderButtonNode) => button.props.text === "Theme",
    );

    await act(async () => {
      await themeButton?.props.onPress();
    });

    expect(mockShowWnaToast).toHaveBeenCalledWith({
      type: "themeChange",
      text1: "Appearance",
      text2: "Light mode",
      props: { appColors: { id: 2, isDark: false } },
    });
  });

  it("does not render the theme button in portrait mode", () => {
    (useWnaLayout as jest.Mock).mockReturnValue({
      appLayout: {
        headerHeight: 72,
        headerButtonHeight: 56,
        globalCornerRadius: 8,
      },
      isLandscape: false,
    });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaHeader headerTitle="Start" />);
    });

    const buttons = tree!.root.findAllByType("WnaButtonHeader");
    const themeButton = buttons.find(
      (button: HeaderButtonNode) => button.props.text === "Theme",
    );

    expect(themeButton).toBeUndefined();
  });

  it("uses browser history back on web when no explicit backHref is provided", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaHeader headerTitle="Project" isRootPage={false} />,
      );
    });

    const backButton = tree!.root.findAllByType("WnaButtonHeader")[0];

    act(() => {
      backButton.props.onPress();
    });

    expect(mockHistoryBack).toHaveBeenCalledTimes(1);
    expect(mockStartNavigationTransition).toHaveBeenCalledTimes(1);
    expect(mockBack).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("prefers backHref over browser history", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaHeader
          headerTitle="Project"
          isRootPage={false}
          backHref="/projects"
        />,
      );
    });

    const backButton = tree!.root.findAllByType("WnaButtonHeader")[0];

    act(() => {
      backButton.props.onPress();
    });

    expect(mockReplace).toHaveBeenCalledWith("/projects");
    expect(mockHistoryBack).not.toHaveBeenCalled();
    expect(mockBack).not.toHaveBeenCalled();
  });

  it("falls back to the root route when no back path is available", () => {
    Object.defineProperty(window, "history", {
      configurable: true,
      value: {
        length: 1,
        back: mockHistoryBack,
      },
    });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaHeader headerTitle="Project" isRootPage={false} />,
      );
    });

    const title = tree!.root.findByType("WnaMultilineHeader");

    act(() => {
      title.props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith("/");
    expect(mockHistoryBack).not.toHaveBeenCalled();
    expect(mockBack).not.toHaveBeenCalled();
  });

  it("skips back navigation while busy", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaHeader headerTitle="Project" backHref="/projects" isBusy />,
      );
    });

    const backButton = tree!.root.findAllByType("WnaButtonHeader")[0];

    act(() => {
      backButton.props.onPress();
    });

    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockHistoryBack).not.toHaveBeenCalled();
    expect(mockBack).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("skips title navigation while busy", () => {
    const onTitlePress = jest.fn();
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaHeader
          headerTitle="Project"
          titleHref="/projects"
          onTitlePress={onTitlePress}
          isBusy
        />,
      );
    });

    const title = tree!.root.findByType("WnaMultilineHeader");

    act(() => {
      title.props.onPress();
    });

    expect(onTitlePress).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("forces the header shadow and blur fully visible when showShadow is true", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaHeader headerTitle="Project" showShadow />,
      );
    });

    const blurContainer = tree!.root.find(
      (node: { props: { id?: string } }) =>
        node.props.id === "wna-header-blur-container",
    );

    expect(blurContainer.props.style.opacity).toBe(0.2);
  });

  it("forces the header shadow and blur fully hidden when showShadow is false", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaHeader headerTitle="Project" showShadow={false} />,
      );
    });

    const blurContainer = tree!.root.find(
      (node: { props: { id?: string } }) =>
        node.props.id === "wna-header-blur-container",
    );

    expect(blurContainer.props.style.opacity).toBe(0);
  });

  it("caps the shadow and blur opacity once scroll passes the threshold", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaHeader headerTitle="Project" scrollY={1000} />,
      );
    });

    const blurOverlay = tree!.root.find(
      (node: { props: { id?: string } }) =>
        node.props.id === "wna-header-blur-overlay",
    );

    expect(blurOverlay.props.style.opacity).toBe(0.4);
  });

  it("hides the back placeholder spacer to match portrait spacing on the root page", () => {
    (useWnaLayout as jest.Mock).mockReturnValue({
      appLayout: {
        headerHeight: 72,
        headerButtonHeight: 56,
        globalCornerRadius: 8,
      },
      isLandscape: false,
    });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaHeader headerTitle="Project" isRootPage />,
      );
    });

    expect(tree!.root.findAllByType("WnaButtonHeader").length).toBe(0);
  });

  it("uses router back when browser history is not available but the router can go back", () => {
    Object.defineProperty(window, "history", {
      configurable: true,
      value: {
        length: 1,
        back: mockHistoryBack,
      },
    });
    mockCanGoBack.mockReturnValue(true);

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaHeader headerTitle="Project" isRootPage={false} />,
      );
    });

    const backButton = tree!.root.findAllByType("WnaButtonHeader")[0];

    act(() => {
      backButton.props.onPress();
    });

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockHistoryBack).not.toHaveBeenCalled();
  });
});
