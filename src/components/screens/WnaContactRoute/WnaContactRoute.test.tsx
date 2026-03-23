/* eslint-disable @typescript-eslint/no-require-imports */
import WnaContactRoute from "@components/screens/WnaContactRoute";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { testAppData } from "@/app-data/testAppData";

jest.mock("@components/WnaAppContext", () => {
  const { jest: jestModule } = require("@jest/globals");

  return {
    useWnaAppData: jestModule.fn(),
    useWnaLayout: jestModule.fn(),
    useWnaTheme: jestModule.fn(),
  };
});

jest.mock("react-i18next", () => ({
  initReactI18next: {
    type: "3rdParty",
    init: () => undefined,
  },
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

jest.mock("@/i18n/i18n", () => ({
  getLangCode: () => "de",
}));

jest.mock("expo-router", () => ({
  useNavigation: () => ({}),
  useRouter: () => ({}),
}));

jest.mock("@components/cards/WnaSurfaceCard", () => {
  const { createElement } = require("react") as typeof import("react");

  return function MockCard(props: unknown) {
    return createElement(
      "WnaSurfaceCard",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  };
});

jest.mock("@components/images/WnaHeroImage", () => {
  const { createElement } = require("react") as typeof import("react");

  return function MockHeroImage(props: unknown) {
    return createElement("WnaHeroImage", props as Record<string, unknown>);
  };
});

jest.mock("@/navigation/components/WnaMenuHeaderRight", () => {
  const { createElement } = require("react") as typeof import("react");

  return function MockMenuHeaderRight(props: unknown) {
    return createElement(
      "WnaMenuHeaderRight",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@/navigation/components/WnaNavigationHeaderButtonRight", () => {
  const { createElement } = require("react") as typeof import("react");

  return function MockNavigationHeaderButtonRight(props: unknown) {
    return createElement(
      "WnaNavigationHeaderButtonRight",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/display/WnaSeparatorHorizontal", () => {
  const { createElement } = require("react") as typeof import("react");

  return function MockSeparator(props: unknown) {
    return createElement(
      "WnaSeparatorHorizontal",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/text/WnaSectionTitle", () => {
  const { createElement } = require("react") as typeof import("react");

  return function MockWelcomeTitle(props: unknown) {
    return createElement("WnaSectionTitle", props as Record<string, unknown>);
  };
});

jest.mock("@components/sections/WnaContactCard", () => {
  const { createElement } = require("react") as typeof import("react");

  return function MockContactCard(props: unknown) {
    return createElement("WnaContactCard", props as Record<string, unknown>);
  };
});

jest.mock("@components/screens/WnaScrollViewScreen", () => {
  const { createElement } = require("react") as typeof import("react");

  return function MockScrollViewScreen(props: unknown) {
    return createElement(
      "WnaScrollViewScreen",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  };
});

describe("WnaContactRoute", () => {
  beforeEach(() => {
    const appContext = jest.requireMock("@components/WnaAppContext") as {
      useWnaAppData: jest.Mock;
      useWnaLayout: jest.Mock;
      useWnaTheme: jest.Mock;
    };

    appContext.useWnaTheme.mockReturnValue({
      appColors: {},
      appStyle: { textNeutralMedium: {} },
    });
    appContext.useWnaLayout.mockReturnValue({ currentWindowWidth: 1200 });
    appContext.useWnaAppData.mockReturnValue({ appData: testAppData });
  });

  it("disables the shared contact footer on the contact page", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaContactRoute />);
    });

    expect(tree!.root.findByType("WnaScrollViewScreen").props.showFooter).toBe(
      false,
    );
    expect(
      tree!.root.findByType("WnaScrollViewScreen").props.showContactFooter,
    ).toBe(false);
  });
});
