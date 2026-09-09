import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaExperienceRoute from "@components/screens/WnaExperienceRoute";

const mockAppColors = { black: "#111111" };
const mockAppStyle = { textNeutralSmall: {} };
const mockAppData = { experience: [] };
const mockNavigation = { openDrawer: jest.fn() };
const mockRouter = { push: jest.fn() };

jest.mock("@components/WnaAppContext", () => ({
  useWnaTheme: () => ({ appColors: mockAppColors, appStyle: mockAppStyle }),
  useWnaAppData: () => ({ appData: mockAppData }),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

jest.mock("expo-router", () => ({
  useNavigation: () => mockNavigation,
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

jest.mock("@components/sections/WnaExperienceCard", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaExperienceCard(props: unknown) {
    return createElement("WnaExperienceCard", props as Record<string, unknown>);
  };
});

jest.mock("@/navigation/components/WnaMenuHeaderRight", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaMenuHeaderRight(props: unknown) {
    return createElement(
      "WnaMenuHeaderRight",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@/navigation/components/WnaNavigationHeaderButtonRight", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaNavigationHeaderButtonRight(props: unknown) {
    return createElement(
      "WnaNavigationHeaderButtonRight",
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
    const card = tree!.root.findByType("WnaExperienceCard");

    expect(screen.props.isRootPage).toBe(true);
    expect(screen.props.showFooter).toBe(false);
    expect(screen.props.headerTitle).toBe("screenTitleExperience");
    expect(homeButton.props.route).toBe("home");
    expect(homeButton.props.router).toBe(mockRouter);
    expect(menuButton.props.navigation).toBe(mockNavigation);
    expect(card.props.appData).toBe(mockAppData);
  });
});
