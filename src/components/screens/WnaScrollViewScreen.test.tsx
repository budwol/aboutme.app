import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaScrollViewScreen from "@components/screens/WnaScrollViewScreen";

jest.mock("@/state/WnaAppContext", () => ({
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

const mockOnScroll = jest.fn();

jest.mock("@components/screens/useWnaScrollY", () => ({
  useWnaScrollY: () => ({
    scrollY: 0,
    onScroll: (event: unknown) => mockOnScroll(event),
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

jest.mock("@components/chrome/WnaContactFooter", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockContactFooter(props: unknown) {
    return createElement("WnaContactFooter", props as Record<string, unknown>);
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

  it("forwards a screen-specific background image", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaScrollViewScreen
          headerTitle="Project"
          backgroundImageUrl="/project-background.webp"
        >
          <></>
        </WnaScrollViewScreen>,
      );
    });

    const baseScreen = tree!.root.findByType("WnaBaseScreen");

    expect(baseScreen.props.backgroundImageUrl).toBe(
      "/project-background.webp",
    );
  });

  it("wires the scroll container's onScroll straight to the shared hook", () => {
    mockOnScroll.mockClear();

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaScrollViewScreen headerTitle="Page">
          <></>
        </WnaScrollViewScreen>,
      );
    });

    const scrollContainer = tree!.root.find(
      (node: { props: { onScroll?: (event: unknown) => void } }) =>
        typeof node.props.onScroll === "function",
    );
    const event = { currentTarget: { scrollTop: 123 } };

    act(() => {
      scrollContainer.props.onScroll!(event as never);
    });

    expect(mockOnScroll).toHaveBeenCalledWith(event);
  });
});
