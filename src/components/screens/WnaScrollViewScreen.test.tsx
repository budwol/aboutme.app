import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaScrollViewScreen from "@components/screens/WnaScrollViewScreen";

jest.mock("@components/navigation/wnaNavigationRouteProvider", () => ({
  getNavigationBaseUrl: () => "https://portfolio.example.com",
}));

jest.mock("@components/WnaAppContext", () => ({
  useWnaLayout: () => ({
    appLayout: {
      contentListPaddingTop: 16,
      contentPaddingBottom: 24,
      scrollEventThrottle: 16,
    },
  }),
  useWnaTheme: () => ({
    appStyle: {
      containerCenterMaxWidth: {},
    },
  }),
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

jest.mock("@components/screens/useWnaScrollY", () => ({
  useWnaScrollY: () => ({
    scrollY: { value: 0 },
    onScroll: () => undefined,
  }),
}));

jest.mock("@components/screens/WnaBaseScreen", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockBaseScreen(props: unknown) {
    return createElement(
      "WnaBaseScreen",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  };
});

jest.mock("@components/screens/WnaContactFooter", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockContactFooter(props: unknown) {
    return createElement("WnaContactFooter", props as Record<string, unknown>);
  };
});

jest.mock("@components/misc/WnaSeparatorHorizontal", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockSeparator(props: unknown) {
    return createElement(
      "WnaSeparatorHorizontal",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/welcome/WnaShareCard", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockShareCard(props: unknown) {
    return createElement("WnaShareCard", props as Record<string, unknown>);
  };
});

jest.mock("react-native-reanimated", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return {
    __esModule: true,
    default: {
      ScrollView: (props: unknown) =>
        createElement("AnimatedScrollView", props as Record<string, unknown>),
    },
  };
});

describe("WnaScrollViewScreen", () => {
  it("shows the contact footer by default", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaScrollViewScreen headerTitle="Page">
          <></>
        </WnaScrollViewScreen>,
      );
    });

    const footer = tree!.root.findByType("WnaContactFooter");

    expect(tree!.root.findAllByType("WnaContactFooter")).toHaveLength(1);
    expect(footer.props.showTopSpacing).toBeUndefined();
  });

  it("hides the contact footer when explicitly disabled", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaScrollViewScreen headerTitle="Contact" showContactFooter={false}>
          <></>
        </WnaScrollViewScreen>,
      );
    });

    expect(tree!.root.findAllByType("WnaContactFooter")).toHaveLength(0);
  });
});
