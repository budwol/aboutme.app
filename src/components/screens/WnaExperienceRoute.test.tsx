import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaExperienceRoute from "@components/screens/WnaExperienceRoute";

const mockAppColors = { black: "#111111" };
const mockAppStyle = { textNeutralSmall: {} };
const mockAppData = { experience: [] };
const mockRouter = { push: jest.fn() };

jest.mock("@/state/WnaAppContext", () => ({
  useWnaTheme: () => ({ appColors: mockAppColors, appStyle: mockAppStyle }),
  useWnaAppData: () => ({ appData: mockAppData }),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

jest.mock("@/i18n/i18n", () => ({
  getLangCode: () => "de",
}));

jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

jest.mock("@components/cards/WnaSurfaceCard", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaSurfaceCard(props: unknown) {
    return createElement(
      "WnaSurfaceCard",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  };
});

jest.mock("@components/sections/WnaExperienceSection", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaExperienceSection(props: unknown) {
    return createElement(
      "WnaExperienceSection",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@/navigation/components/WnaMenuToggleButton", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaMenuToggleButton(props: unknown) {
    return createElement(
      "WnaMenuToggleButton",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@/navigation/components/WnaHeaderRouteButton", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaHeaderRouteButton(props: unknown) {
    return createElement(
      "WnaHeaderRouteButton",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/screens/WnaScrollViewScreen", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaScrollViewScreen(props: unknown) {
    return createElement(
      "WnaScrollViewScreen",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  };
});

describe("WnaExperienceRoute", () => {
  it("wires header buttons and experience content into the scroll screen", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaExperienceRoute />);
    });

    const screen = tree!.root.findByType("WnaScrollViewScreen");
    const homeButton = screen.props.headerButton0;
    const menuButton = screen.props.headerButton1;
    const card = tree!.root.findByType("WnaExperienceSection");

    expect(screen.props.isRootPage).toBe(true);
    expect(screen.props.headerTitle).toBe("screenTitleExperience");
    expect(screen.props.titleHref).toBe("/(drawer)/(tabs-de)");
    expect(homeButton.props.route).toBe("home");
    expect(homeButton.props.router).toBe(mockRouter);
    expect(menuButton.type).toBeDefined();
    expect(card.props.appData).toBe(mockAppData);
  });
});
