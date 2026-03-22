/* eslint-disable @typescript-eslint/no-require-imports */
import WnaContactRoute from "@components/screens/WnaContactRoute";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { testAppData } from "@/test/testAppData";

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

jest.mock("@services/i18n/i18n", () => ({
  getLangCode: () => "de",
}));

jest.mock("expo-router", () => ({
  useNavigation: () => ({}),
  useRouter: () => ({}),
}));

jest.mock("@components/cards/WnaListCardWhiteDecent", () => {
  const { createElement } = require("react") as typeof import("react");

  return function MockCard(props: unknown) {
    return createElement(
      "WnaListCardWhiteDecent",
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

jest.mock("@components/navigation/WnaMenuHeaderRight", () => {
  const { createElement } = require("react") as typeof import("react");

  return function MockMenuHeaderRight(props: unknown) {
    return createElement(
      "WnaMenuHeaderRight",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/navigation/WnaNavigationHeaderButtonRight", () => {
  const { createElement } = require("react") as typeof import("react");

  return function MockNavigationHeaderButtonRight(props: unknown) {
    return createElement(
      "WnaNavigationHeaderButtonRight",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/misc/WnaSeparatorHorizontal", () => {
  const { createElement } = require("react") as typeof import("react");

  return function MockSeparator(props: unknown) {
    return createElement(
      "WnaSeparatorHorizontal",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/text/WnaWelcomeTitle", () => {
  const { createElement } = require("react") as typeof import("react");

  return function MockWelcomeTitle(props: unknown) {
    return createElement("WnaWelcomeTitle", props as Record<string, unknown>);
  };
});

jest.mock("@components/welcome/WnaContactCard", () => {
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
