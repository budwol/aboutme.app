import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaBaseScreen from "@components/screens/WnaBaseScreen";

let mockIsAppInitialized = true;
let mockBackgroundImageUrl = "default-background.webp";

jest.mock("@components/WnaAppContext", () => ({
  useWnaAppLifecycle: () => ({
    isAppInitialized: mockIsAppInitialized,
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

jest.mock("@components/screens/WnaFooter", () => ({
  WnaFooter: (props: unknown) => {
    const { createElement } = jest.requireActual(
      "react",
    ) as typeof import("react");
    return createElement("WnaFooter", props as Record<string, unknown>);
  },
}));

jest.mock("@components/screens/WnaHeader", () => ({
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

jest.mock("react-native-reanimated", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return {
    __esModule: true,
    default: {
      View: (props: unknown) =>
        createElement(
          "AnimatedView",
          props as Record<string, unknown>,
          (props as { children?: React.ReactNode }).children,
        ),
    },
    Easing: {
      bezier: () => "bezier",
    },
    useAnimatedStyle: (callback: () => Record<string, unknown>) => callback(),
    useSharedValue: (initialValue: number) => ({ value: initialValue }),
    withTiming: (value: unknown) => value,
  };
});

describe("WnaBaseScreen", () => {
  it("renders nothing until the app is initialized", () => {
    mockIsAppInitialized = false;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaBaseScreen headerTitle="Home" />);
    });

    expect(tree!.toJSON()).toBeNull();
    mockIsAppInitialized = true;
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

    expect(webBaseScreen.props.title).toBe("Projects");
    expect(imageBackground.props.imageUri).toBe("default-background.webp");
    expect(header.props.headerTitle).toBe("Projects");
    expect(header.props.icon).toBe("rocket");
    expect(header.props.isRootPage).toBe(true);
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
      .findAllByType("Text")
      .map(
        (node: { props: { children?: React.ReactNode } }) =>
          node.props.children,
      );

    expect(textValues).toContain("Loading data");
  });
});
