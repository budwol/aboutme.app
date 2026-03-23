/* eslint-disable @typescript-eslint/no-require-imports */
import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaContactFooter from "@components/screens/WnaContactFooter";

jest.mock("@components/WnaAppContext", () => ({
  useWnaAppData: () => {
    const { testAppData } = jest.requireActual(
      "@/app-data/testAppData",
    ) as typeof import("@/app-data/testAppData");

    return { appData: testAppData };
  },
  useWnaTheme: () => ({
    appColors: {},
    appStyle: {},
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

jest.mock("@/i18n/i18n", () => ({
  getLangCode: () => "de",
}));

jest.mock("@components/display/WnaSeparatorHorizontal", () => {
  const ReactModule = require("react") as typeof import("react");

  return function MockSeparator(props: unknown) {
    return ReactModule.createElement(
      "WnaSeparatorHorizontal",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/sections/WnaContactCard", () => {
  const ReactModule = require("react") as typeof import("react");

  return function MockContactCard(props: unknown) {
    return ReactModule.createElement(
      "WnaContactCard",
      props as Record<string, unknown>,
    );
  };
});

describe("WnaContactFooter", () => {
  it("renders top spacing by default", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaContactFooter />);
    });

    expect(tree!.root.findAllByType("WnaSeparatorHorizontal")).toHaveLength(1);
    expect(tree!.root.findByType("WnaContactCard")).toBeTruthy();
  });

  it("omits top spacing when disabled", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaContactFooter showTopSpacing={false} />);
    });

    expect(tree!.root.findAllByType("WnaSeparatorHorizontal")).toHaveLength(0);
    expect(tree!.root.findByType("WnaContactCard")).toBeTruthy();
  });
});
