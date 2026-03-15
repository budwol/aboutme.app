import { describe, expect, it, jest } from "@jest/globals";
import WnaMenuRoute from "@components/screens/WnaMenuRoute";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";

const mockNavigate = jest.fn();

jest.mock("@components/WnaAppContext", () => ({
  useWnaAppLifecycle: jest.fn(() => ({ isAppInitialized: true })),
  useWnaTheme: jest.fn(() => ({
    appColors: { coolgray5: "#777" },
    appStyle: { textNeutralMedium: {} },
  })),
}));

jest.mock("@services/i18n/i18n", () => ({
  getLangCode: jest.fn(() => "de"),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({ navigate: mockNavigate }),
  useNavigation: () => ({}),
}));

jest.mock("@components/cards/WnaListCardWhiteDecent", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockCard(props: unknown) {
    return createElement(
      "WnaListCardWhiteDecent",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  };
});

jest.mock("@components/navigation/WnaMenuHeaderRight", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");
  return function MockMenuHeaderRight(props: unknown) {
    return createElement(
      "WnaMenuHeaderRight",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/navigation/WnaNavigationHeaderButtonRight", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");
  return function MockNavHeaderRight(props: unknown) {
    return createElement(
      "WnaNavigationHeaderButtonRight",
      props as Record<string, unknown>,
    );
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

jest.mock("@components/navigation/WnaNavigationItem", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");
  return function MockNavigationItem(props: unknown) {
    return createElement("WnaNavigationItem", props as Record<string, unknown>);
  };
});

jest.mock("@components/screens/WnaScrollViewScreen", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");
  return function MockScrollViewScreen(props: unknown) {
    return createElement(
      "WnaScrollViewScreen",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  };
});

describe("WnaMenuRoute", () => {
  it("uses localized drawer paths for legal navigation entries", () => {
    mockNavigate.mockClear();

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaMenuRoute />);
    });

    const items = tree!.root.findAllByType("WnaNavigationItem");
    const scrollViewScreen = tree!.root.findByType("WnaScrollViewScreen");

    expect(scrollViewScreen.props.showContactFooter).toBe(false);

    act(() => items[0].props.onPress());
    act(() => items[1].props.onPress());
    act(() => items[2].props.onPress());
    act(() => items[3].props.onPress());

    expect(mockNavigate).toHaveBeenNthCalledWith(
      1,
      "/(drawer)/(tabs-de)/menu/impressum",
    );
    expect(mockNavigate).toHaveBeenNthCalledWith(
      2,
      "/(drawer)/(tabs-de)/menu/datenschutz",
    );
    expect(mockNavigate).toHaveBeenNthCalledWith(
      3,
      "/(drawer)/(tabs-de)/menu/nutzungsbedingungen",
    );
    expect(mockNavigate).toHaveBeenNthCalledWith(
      4,
      "/(drawer)/(tabs-de)/menu/lizenzen",
    );
  });
});
