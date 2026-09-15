import { describe, expect, it, jest } from "@jest/globals";
import WnaMenuRoute from "@components/screens/WnaMenuRoute";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";

const mockNavigate = jest.fn();
const mockSetTheme = jest.fn();
const mockSetAppColors = jest.fn();

jest.mock("@/state/WnaAppContext", () => ({
  useWnaAppLifecycle: jest.fn(() => ({ isAppInitialized: true })),
  useWnaTheme: jest.fn(() => ({
    appColors: { coolgray5: "#777" },
    appStyle: { textNeutralMedium: {} },
    theme: "dark",
    setTheme: mockSetTheme,
    setAppColors: mockSetAppColors,
  })),
}));

jest.mock("@/i18n/i18n", () => ({
  getLangCode: jest.fn(() => "de"),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

jest.mock("@/storage/themeStorage", () => ({
  getThemeFromStorageAsync: async () => "dark",
  setThemeToStorageAsync: async () => undefined,
}));

jest.mock("@utils/themeColors", () => ({
  getNextTheme: () => "light",
  resolveAppColors: () => ({ id: 2, isDark: false }),
}));

jest.mock("@components/feedback/wnaToast");

const mockShowWnaToast = (
  jest.requireMock("@components/feedback/wnaToast") as {
    showWnaToast: jest.Mock;
  }
).showWnaToast;

jest.mock("@/navigation/router/wnaRouter", () => ({
  // Wrapped, not referenced directly — see WnaHeader.test.tsx for why.
  router: { navigate: (href: string) => mockNavigate(href) },
}));

jest.mock("@components/cards/WnaSurfaceCard", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockCard(props: unknown) {
    return createElement(
      "WnaSurfaceCard",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  };
});

jest.mock("@/navigation/components/WnaMenuToggleButton", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");
  return function MockMenuHeaderRight(props: unknown) {
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
  return function MockNavHeaderRight(props: unknown) {
    return createElement(
      "WnaHeaderRouteButton",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/display/WnaSeparatorHorizontal", () => {
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

jest.mock("@/navigation/components/WnaNavigationItem", () => {
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
    expect(scrollViewScreen.props.titleHref).toBe("/");

    act(() => items[1].props.onPress());
    act(() => items[2].props.onPress());
    act(() => items[3].props.onPress());
    act(() => items[4].props.onPress());

    expect(mockNavigate).toHaveBeenNthCalledWith(1, "/menu/impressum");
    expect(mockNavigate).toHaveBeenNthCalledWith(2, "/menu/datenschutz");
    expect(mockNavigate).toHaveBeenNthCalledWith(
      3,
      "/menu/nutzungsbedingungen",
    );
    expect(mockNavigate).toHaveBeenNthCalledWith(4, "/menu/lizenzen");
  });

  it("renders a theme entry and toggles the theme from the drawer", async () => {
    mockSetTheme.mockClear();
    mockSetAppColors.mockClear();
    mockShowWnaToast.mockClear();

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaMenuRoute />);
    });

    const items = tree!.root.findAllByType("WnaNavigationItem");
    const themeItem = items[0];

    expect(themeItem.props.text).toBe("settingsTheme: common:catalogThemeDark");

    await act(async () => {
      await themeItem.props.onPress();
    });

    expect(mockSetAppColors).toHaveBeenCalledWith({ id: 2, isDark: false });
    expect(mockSetTheme).toHaveBeenCalledWith("light");
    expect(mockShowWnaToast).toHaveBeenCalledWith({
      type: "themeChange",
      text1: "Appearance",
      text2: "Light mode",
      props: { appColors: { id: 2, isDark: false } },
    });
  });

  it("renders nothing until the app is initialized", () => {
    const { useWnaAppLifecycle } = jest.requireMock(
      "@/state/WnaAppContext",
    ) as { useWnaAppLifecycle: jest.Mock<() => { isAppInitialized: boolean }> };
    useWnaAppLifecycle.mockReturnValueOnce({ isAppInitialized: false });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaMenuRoute />);
    });

    expect(tree!.toJSON()).toBeNull();
  });
});
