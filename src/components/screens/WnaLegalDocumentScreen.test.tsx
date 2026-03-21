import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import {
  useWnaAppLifecycle,
  useWnaLayout,
  useWnaTheme,
} from "@components/WnaAppContext";
import WnaLegalDocumentScreen from "@components/screens/WnaLegalDocumentScreen";

jest.mock("@components/WnaAppContext", () => ({
  useWnaAppLifecycle: jest.fn(),
  useWnaLayout: jest.fn(),
  useWnaTheme: jest.fn(),
}));

jest.mock("@services/i18n/i18n", () => ({
  getLangCode: jest.fn(() => "de"),
}));

jest.mock("@components/misc/WnaHtmlRenderer", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaHtmlRenderer(props: unknown) {
    return createElement("WnaHtmlRenderer", props as Record<string, unknown>);
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

jest.mock("expo-router", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return {
    Redirect: (props: unknown) =>
      createElement("Redirect", props as Record<string, unknown>),
    useNavigation: () => ({}),
    useRouter: () => ({
      push: () => undefined,
      replace: () => undefined,
      back: () => undefined,
    }),
  };
});

describe("WnaLegalDocumentScreen", () => {
  it("redirects to the localized drawer menu route before app initialization", () => {
    (useWnaAppLifecycle as jest.Mock).mockReturnValue({
      isAppInitialized: false,
    });
    (useWnaLayout as jest.Mock).mockReturnValue({ currentWindowWidth: 800 });
    (useWnaTheme as jest.Mock).mockReturnValue({
      appColors: { white: "#fff", coolgray2: "#999" },
      appStyle: {},
    });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaLegalDocumentScreen
          headerTitle="Legal"
          htmlContent="<p>Legal</p>"
        />,
      );
    });

    expect(tree!.root.findByType("Redirect").props.href).toBe(
      "/(drawer)/(tabs-de)/menu",
    );
  });

  it("disables the shared contact footer for legal content pages", () => {
    (useWnaAppLifecycle as jest.Mock).mockReturnValue({
      isAppInitialized: true,
    });
    (useWnaLayout as jest.Mock).mockReturnValue({ currentWindowWidth: 800 });
    (useWnaTheme as jest.Mock).mockReturnValue({
      appColors: { white: "#fff", coolgray2: "#999" },
      appStyle: {},
    });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaLegalDocumentScreen
          headerTitle="Legal"
          htmlContent="<p>Legal</p>"
        />,
      );
    });

    expect(
      tree!.root.findByType("WnaScrollViewScreen").props.showContactFooter,
    ).toBe(false);
  });
});
