import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaBaseScreen from "@components/screens/WnaBaseScreen";
import { convertHexToRgba } from "@utils/colorConverter";

let mockIsAppInitialized = true;
let mockBackgroundImageUrl = "default-background.webp";
const mockUnregisterNavigationTransitionBackgroundImageUrl = jest.fn();
const mockRegisterNavigationTransitionBackgroundImageUrl = jest.fn(
  () => mockUnregisterNavigationTransitionBackgroundImageUrl,
);
type FocusEffectCallback = () => void | (() => void);
let mockFocusEffectCallbacks: FocusEffectCallback[] = [];

jest.mock("@/state/WnaAppContext", () => ({
  useWnaAppLifecycle: () => ({
    isAppInitialized: mockIsAppInitialized,
    registerNavigationTransitionBackgroundImageUrl:
      mockRegisterNavigationTransitionBackgroundImageUrl,
  }),
  useWnaTheme: () => ({
    appColors: {
      isDark: false,
      staticBlack: "#000000",
      black: "#111111",
    },
    appStyle: {
      textTitleLarge: {},
    },
  }),
  useWnaLayout: () => ({
    isLandscape: false,
    appLayout: {
      backgroundImageUrl: mockBackgroundImageUrl,
    },
  }),
}));

jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (callback: FocusEffectCallback) => {
    mockFocusEffectCallbacks.push(callback);
  },
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

jest.mock("@components/feedback/WnaActivityIndicator", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaActivityIndicator(props: unknown) {
    return createElement(
      "WnaActivityIndicator",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/chrome/WnaFooter", () => ({
  WnaFooter: (props: unknown) => {
    const { createElement } = jest.requireActual(
      "react",
    ) as typeof import("react");
    return createElement("WnaFooter", props as Record<string, unknown>);
  },
}));

jest.mock("@components/chrome/WnaHeader", () => ({
  WnaHeader: (props: unknown) => {
    const { createElement } = jest.requireActual(
      "react",
    ) as typeof import("react");
    return createElement("WnaHeader", props as Record<string, unknown>);
  },
}));

jest.mock("@components/screens/WnaWebBaseScreen", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaWebBaseScreen(props: unknown) {
    return createElement(
      "WnaWebBaseScreen",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  };
});

jest.mock("@components/images/WnaImageBackground", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaImageBackground(props: unknown) {
    return createElement(
      "WnaImageBackground",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  };
});

describe("WnaBaseScreen", () => {
  beforeEach(() => {
    mockIsAppInitialized = true;
    mockBackgroundImageUrl = "default-background.webp";
    mockFocusEffectCallbacks = [];
    mockRegisterNavigationTransitionBackgroundImageUrl.mockClear();
    mockUnregisterNavigationTransitionBackgroundImageUrl.mockClear();
  });

  function focusScreen(index = mockFocusEffectCallbacks.length - 1) {
    const cleanup = mockFocusEffectCallbacks[index]?.();

    return typeof cleanup === "function" ? cleanup : () => undefined;
  }

  it("renders nothing until the app is initialized", () => {
    mockIsAppInitialized = false;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaBaseScreen headerTitle="Home" />);
    });

    expect(tree!.toJSON()).toBeNull();

    focusScreen();

    expect(
      mockRegisterNavigationTransitionBackgroundImageUrl,
    ).not.toHaveBeenCalled();
  });

  it("uses the layout background and forwards header props", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaBaseScreen headerTitle="Projects" icon="rocket" isRootPage>
          <></>
        </WnaBaseScreen>,
      );
    });

    const webBaseScreen = tree!.root.findByType("WnaWebBaseScreen");
    const imageBackground = tree!.root.findByType("WnaImageBackground");
    const header = tree!.root.findByType("WnaHeader");

    focusScreen();

    expect(webBaseScreen.props.title).toBe("Projects");
    expect(imageBackground.props.testID).toBe("screen-background");
    expect(imageBackground.props.imageUri).toBe("default-background.webp");
    expect(
      mockRegisterNavigationTransitionBackgroundImageUrl,
    ).toHaveBeenCalledWith("default-background.webp");
    expect(header.props.headerTitle).toBe("Projects");
    expect(header.props.icon).toBe("rocket");
    expect(header.props.isRootPage).toBe(true);
  });

  it("uses a screen-specific background image", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaBaseScreen
          headerTitle="Projects"
          backgroundImageUrl="/project-background.webp"
        >
          <></>
        </WnaBaseScreen>,
      );
    });

    const imageBackground = tree!.root.findByType("WnaImageBackground");
    const blurScreen = focusScreen();

    expect(imageBackground.props.imageUri).toBe("/project-background.webp");
    expect(
      mockRegisterNavigationTransitionBackgroundImageUrl,
    ).toHaveBeenCalledWith("/project-background.webp");

    act(() => {
      blurScreen();
      tree!.unmount();
    });

    expect(
      mockUnregisterNavigationTransitionBackgroundImageUrl,
    ).toHaveBeenCalledTimes(1);
  });

  it("updates the transition background when focus moves between mounted screens", () => {
    const unregisterFirst = jest.fn();
    const unregisterSecond = jest.fn();
    mockRegisterNavigationTransitionBackgroundImageUrl
      .mockReturnValueOnce(unregisterFirst)
      .mockReturnValueOnce(unregisterSecond);

    act(() => {
      TestRenderer.create(
        <>
          <WnaBaseScreen
            headerTitle="First"
            backgroundImageUrl="/first-background.webp"
          >
            <></>
          </WnaBaseScreen>
          <WnaBaseScreen
            headerTitle="Second"
            backgroundImageUrl="/second-background.webp"
          >
            <></>
          </WnaBaseScreen>
        </>,
      );
    });

    const blurFirst = focusScreen(0);
    const blurSecond = focusScreen(1);

    expect(
      mockRegisterNavigationTransitionBackgroundImageUrl,
    ).toHaveBeenNthCalledWith(1, "/first-background.webp");
    expect(
      mockRegisterNavigationTransitionBackgroundImageUrl,
    ).toHaveBeenNthCalledWith(2, "/second-background.webp");

    act(() => {
      blurSecond();
    });

    expect(unregisterSecond).toHaveBeenCalledTimes(1);
    expect(unregisterFirst).not.toHaveBeenCalled();

    act(() => {
      blurFirst();
    });

    expect(unregisterFirst).toHaveBeenCalledTimes(1);
  });

  it("uses documentTitle for the browser tab without changing the header text", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaBaseScreen
          headerTitle="Portfolio"
          documentTitle="Portfolio - Jane Doe"
        >
          <></>
        </WnaBaseScreen>,
      );
    });

    const webBaseScreen = tree!.root.findByType("WnaWebBaseScreen");
    const header = tree!.root.findByType("WnaHeader");

    expect(webBaseScreen.props.title).toBe("Portfolio - Jane Doe");
    expect(header.props.headerTitle).toBe("Portfolio");
  });

  it("shows the busy overlay and text when busy", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaBaseScreen isBusy isBusyText="Loading data">
          <></>
        </WnaBaseScreen>,
      );
    });

    expect(tree!.root.findAllByType("WnaActivityIndicator")).toHaveLength(1);
    const textValues = tree!.root
      .findAllByType("span")
      .map(
        (node: { props: { children?: React.ReactNode } }) =>
          node.props.children,
      );

    expect(textValues).toContain("Loading data");

    const busyOverlay = tree!.root.find(
      (node: { props: { id?: string } }) =>
        node.props.id === "wna-busy-overlay",
    );
    expect(busyOverlay.props.style).toEqual({
      display: "flex",
      flexDirection: "column",
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      opacity: 1,
      backgroundColor: convertHexToRgba("#000000", 0.7),
      pointerEvents: "auto",
      transition: "opacity 250ms cubic-bezier(.5, .01, 0, 1)",
    });
  });

  it("disables pointer events on the busy overlay when not busy", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaBaseScreen isBusy={false} isBusyText="Loading data">
          <></>
        </WnaBaseScreen>,
      );
    });

    const busyOverlay = tree!.root.find(
      (node: { props: { id?: string } }) =>
        node.props.id === "wna-busy-overlay",
    );
    expect(busyOverlay.props.style).toEqual({
      display: "flex",
      flexDirection: "column",
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      opacity: 0,
      backgroundColor: convertHexToRgba("#000000", 0.7),
      pointerEvents: "none",
      transition: "opacity 250ms cubic-bezier(.5, .01, 0, 1)",
    });
  });

  it("keeps the screen content container able to shrink below its content height so the page can scroll", () => {
    // Regression test: `styles.container` is a flex column and this is its
    // flex-item child. Flex items default to `min-height: auto`, so without
    // an explicit `minHeight: 0` this container refuses to shrink below its
    // content's intrinsic height, which stops the inner scrollable content
    // from ever being clipped by the viewport.
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaBaseScreen headerTitle="Home">
          {React.createElement("div", {
            "data-testid": "screen-content-marker",
          })}
        </WnaBaseScreen>,
      );
    });

    const marker = tree!.root.findByProps({
      "data-testid": "screen-content-marker",
    });
    const contentContainer = marker.parent!;

    expect(contentContainer.type).toBe("div");
    expect(contentContainer.props.style).toEqual({
      display: "flex",
      flexDirection: "column",
      flex: 1,
      minHeight: 0,
      alignContent: "stretch",
    });
  });
});
