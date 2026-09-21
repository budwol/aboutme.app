import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import React from "react";
import { Linking } from "@utils/webLinking";
import TestRenderer, { act } from "react-test-renderer";
import WnaDrawerMenu from "@/navigation/components/WnaDrawerMenu";
import {
  appLayoutConstants,
  appSpacingConstants,
} from "@constants/layoutConstants";

const mockHeaderButtonHeight = appLayoutConstants.headerButtonHeight;
const mockGlobalCornerRadius = appLayoutConstants.globalCornerRadius;

const mockPush = jest.fn();
const mockSetTheme = jest.fn();
const mockSetAppColors = jest.fn();
const mockCloseDrawer = jest.fn();
let mockPathname = "/";

type DrawerItemNode = {
  props: {
    text?: string;
    isActive?: boolean;
  };
};

type ButtonNode = {
  props: {
    text?: string;
    onPress?: () => Promise<void> | void;
  };
};

type FooterLinkNode = {
  props: {
    href?: string;
    children?: string;
  };
};

jest.mock("@/state/WnaAppContext", () => ({
  useWnaAppData: () => ({
    appData: {
      profile: {
        name: "John Doe",
        title: "Software Engineer",
      },
    },
  }),
  useWnaAppLifecycle: () => ({
    closeDrawer: mockCloseDrawer,
  }),
  useWnaLayout: jest.fn(() => ({
    appLayout: {
      contentPaddingBottom: 0,
      contentListPaddingTop: 0,
      globalListGap: 0,
      headerButtonHeight: mockHeaderButtonHeight,
      globalCornerRadius: mockGlobalCornerRadius,
      scrollEventThrottle: 16,
    },
  })),
  useWnaTheme: jest.fn(() => ({
    appStyle: {
      textTitleLarge: {},
      textSmall: {},
      textNeutralSmall: {},
      textNeutralMedium: {},
      containerCenterMaxWidth: {},
    },
    appColors: {
      isDark: false,
      staticCoolgray8: "#111",
      white: "#fff",
      warmgray1: "#eee",
      accent5: "#4a4",
      accent7: "#5b5",
      staticAccent5: "#4a4",
      black: "#000",
      coolgray1: "#ccc",
      coolgray2: "#bbb",
    },
    theme: "dark",
    setTheme: mockSetTheme,
    setAppColors: mockSetAppColors,
  })),
}));

jest.mock("@utils/currentAppVersion", () => () => "1.0.0");

jest.mock("@/i18n/i18n", () => ({
  getLangCode: () => "de",
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
  router: {},
  useWnaPathname: () => mockPathname,
}));

jest.mock("@/navigation/hooks/useWnaNavigationTransition", () => ({
  useWnaNavigationTransition: () => ({
    push: mockPush,
  }),
}));

jest.mock("@components/buttons/WnaPressable", () => {
  const ReactModule = jest.requireActual("react") as typeof import("react");
  return function MockPressable(props: unknown) {
    return ReactModule.createElement(
      "WnaPressable",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  };
});

jest.mock("@components/buttons/WnaButtonIconText", () => {
  const ReactModule = jest.requireActual("react") as typeof import("react");
  return function MockButtonIconText(props: unknown) {
    return ReactModule.createElement(
      "WnaButtonIconText",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/images/WnaImage", () => {
  const ReactModule = jest.requireActual("react") as typeof import("react");
  return function MockImage(props: unknown) {
    return ReactModule.createElement(
      "WnaImage",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/icon/WnaIcon/WnaIcon", () => {
  const ReactModule = jest.requireActual("react") as typeof import("react");
  return function MockIcon(props: unknown) {
    return ReactModule.createElement(
      "WnaIcon",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@/navigation/components/WnaNavigationList", () => {
  const ReactModule = jest.requireActual("react") as typeof import("react");
  return function MockNavigationList(props: {
    items: unknown[];
    renderItem: (item: unknown) => React.ReactNode;
  }) {
    return ReactModule.createElement(
      "WnaNavigationList",
      props,
      props.items.map((item, index) =>
        ReactModule.createElement(
          ReactModule.Fragment,
          { key: index },
          props.renderItem(item),
        ),
      ),
    );
  };
});

jest.mock("@/navigation/components/WnaDrawerNavigationItem", () => {
  const ReactModule = jest.requireActual("react") as typeof import("react");
  return function MockDrawerNavigationItem(props: unknown) {
    return ReactModule.createElement(
      "WnaDrawerNavigationItem",
      props as Record<string, unknown>,
    );
  };
});

describe("WnaDrawerMenu", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSetTheme.mockClear();
    mockSetAppColors.mockClear();
    mockShowWnaToast.mockClear();
    mockCloseDrawer.mockClear();
    mockPathname = "/";
  });

  it("does not trigger a navigation transition when the header is pressed on the home route", async () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaDrawerMenu />);
    });

    const headerPressable = tree!.root.findAllByType("WnaPressable")[0];

    act(() => {
      headerPressable.props.onPress();
    });

    expect(mockPush).not.toHaveBeenCalled();
    expect(mockCloseDrawer).not.toHaveBeenCalled();
  });

  it("navigates to the root route and closes the drawer when the header is pressed outside the home route", async () => {
    mockPathname = "/taetigkeiten";
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaDrawerMenu />);
    });

    const headerPressable = tree!.root.findAllByType("WnaPressable")[0];

    act(() => {
      headerPressable.props.onPress();
    });

    expect(mockPush).toHaveBeenCalledWith("/");
    expect(mockCloseDrawer).toHaveBeenCalledTimes(1);
  });

  it("marks the profile entry as active on the initial home route", async () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaDrawerMenu />);
    });

    const items = tree!.root.findAllByType("WnaDrawerNavigationItem");
    const profileItem = items.find(
      (item: DrawerItemNode) => item.props.text === "screenTitleProfile",
    );

    expect(profileItem).toBeDefined();
    expect(profileItem!.props.isActive).toBe(true);
  });

  it("renders the profile name and title in the drawer header", async () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaDrawerMenu />);
    });

    const headerTexts = tree!.root
      .findAllByType("span")
      .map((node: { props: { children?: unknown } }) => node.props.children);

    expect(headerTexts).toContain("John Doe");
    expect(headerTexts).toContain("SOFTWARE ENGINEER");
    expect(headerTexts).not.toContain("appBrand");
  });

  it("keeps the profile name/title column within the drawer's fixed width using border-box sizing", async () => {
    // Regression test: this column combines `width: "100%"` with
    // `paddingInline: 24` on a real DOM div. Content-box (the browser
    // default) would add that padding on top of the 100%-of-parent
    // width, overflowing the drawer's fixed panel width by 48px.
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaDrawerMenu />);
    });

    const nameSpan = tree!.root.find(
      (node: { props: { children?: unknown } }) =>
        node.props.children === "John Doe",
    );
    const centeredColumn = nameSpan.parent!;

    expect(centeredColumn.props.style).toEqual({
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
      boxSizing: "border-box",
      paddingInline: 24,
    });
  });

  it("keeps the drawer navigation top spacing separate from list padding", async () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaDrawerMenu />);
    });

    const navigationList = tree!.root.findByType("WnaNavigationList");

    expect(navigationList.props.overridePaddingTop).toBe(
      appSpacingConstants.xs,
    );
    expect(navigationList.props.overrideGap).toBe(appSpacingConstants.xs);
    expect(navigationList.props.style).toEqual({
      paddingInline: appSpacingConstants.xs,
      paddingBottom: appSpacingConstants.xs,
    });

    const navWrapper = tree!.root.find(
      (node: { props: { style?: unknown } }) =>
        Array.isArray(node.props.style)
          ? node.props.style.some(
              (style: { justifyContent?: string }) =>
                style.justifyContent === "flex-start",
            )
          : (node.props.style as { justifyContent?: string } | undefined)
              ?.justifyContent === "flex-start",
    );

    expect(navWrapper.props.style).toEqual({
      display: "flex",
      flexDirection: "column",
      flex: 1,
      justifyContent: "flex-start",
      marginTop: appSpacingConstants.sm,
    });
  });

  it("never re-centers the drawer navigation items vertically", async () => {
    // Regression test: the drawer panel now spans the full viewport height
    // (position: fixed overlay at 100% height), so `justifyContent: "center"`
    // on navWrapper would visually centre the nav items mid-panel instead of
    // anchoring them below the header.
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaDrawerMenu />);
    });

    const centeredWrappers = tree!.root.findAll(
      (node: { props: { style?: unknown } }) =>
        Array.isArray(node.props.style)
          ? node.props.style.some(
              (style: { justifyContent?: string }) =>
                style.justifyContent === "center",
            )
          : (node.props.style as { justifyContent?: string } | undefined)
              ?.justifyContent === "center",
    );

    expect(centeredWrappers).toHaveLength(0);
  });

  it("navigates and closes the drawer when an inactive drawer item is pressed", async () => {
    mockPathname = "/taetigkeiten";
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaDrawerMenu />);
    });

    const items = tree!.root.findAllByType("WnaDrawerNavigationItem");
    const projectsItem = items.find(
      (item: DrawerItemNode) => item.props.text === "screenTitleProjects",
    );

    act(() => {
      projectsItem!.props.onPress();
    });

    expect(mockPush).toHaveBeenCalledWith("/projekte");
    expect(mockCloseDrawer).toHaveBeenCalledTimes(1);
  });

  it("renders the footer copyright with the profile name from app data", async () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaDrawerMenu />);
    });

    const footerLink = tree!.root.find(
      (node: FooterLinkNode) => typeof node.props.href === "string",
    );

    expect(footerLink.props.children).toBe("© John Doe");
  });

  it("lets the footer link inherit its color from appStyle.textNeutralSmall instead of hardcoding it", async () => {
    // Regression test: this link previously set `color: "inherit"`,
    // added when the drawer was converted to a real DOM `<a>`. That
    // silently overrode the legible gray color coming from
    // `appStyle.textNeutralSmall` with whatever the surrounding text
    // color happened to be, rendering the copyright link nearly
    // invisible against the drawer background. `styles.footerLink` must
    // not set its own `color` at all, so `textNeutralSmall`'s color wins.
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaDrawerMenu />);
    });

    const footerLink = tree!.root.find(
      (node: FooterLinkNode) => typeof node.props.href === "string",
    ) as unknown as { props: { style: object } };

    expect(footerLink.props.style).toEqual({
      textDecoration: "underline",
      opacity: 0.9,
    });
  });

  it("navigates to the disclaimer route from the footer link", async () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaDrawerMenu />);
    });

    const footerLink = tree!.root.find(
      (node: FooterLinkNode) => typeof node.props.href === "string",
    ) as unknown as {
      props: { onClick: (event: { preventDefault: () => void }) => void };
    };

    act(() => {
      footerLink.props.onClick({ preventDefault: () => {} });
    });

    expect(mockPush).toHaveBeenCalledWith("/menu/impressum");
    expect(mockCloseDrawer).toHaveBeenCalledTimes(1);
  });

  it("renders a theme button in the drawer footer and toggles the theme", async () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaDrawerMenu />);
    });

    const buttons = tree!.root.findAllByType("WnaButtonIconText");
    const themeButton = buttons.find(
      (item: ButtonNode) =>
        item.props.text === "settingsTheme: common:catalogThemeDark",
    );

    expect(themeButton).toBeDefined();
    expect(themeButton!.props.style).toEqual({
      width: "100%",
      marginBottom: 8,
      marginInline: 0,
      height: Math.min(
        appLayoutConstants.headerButtonHeight,
        appLayoutConstants.textInputHeight,
      ),
      borderRadius: appLayoutConstants.globalCornerRadius,
    });

    await act(async () => {
      await themeButton!.props.onPress();
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

  it("renders a standalone portfolio download button in the drawer footer, separate from the nav list", async () => {
    const openURL = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaDrawerMenu />);
    });

    const navItems = tree!.root.findAllByType("WnaDrawerNavigationItem");
    expect(
      navItems.some(
        (item: DrawerItemNode) => item.props.text === "actionDownloadResume",
      ),
    ).toBe(false);

    const buttons = tree!.root.findAllByType("WnaButtonIconText");
    const downloadButton = buttons.find(
      (item: ButtonNode) => item.props.text === "actionDownloadResume",
    );

    expect(downloadButton).toBeDefined();

    await act(async () => {
      await downloadButton!.props.onPress();
    });

    expect(openURL).toHaveBeenCalledWith("/DE/John_Doe_-_Portfolio.pdf");

    openURL.mockRestore();
  });

  it("does not navigate when pressing the already-active drawer item", async () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaDrawerMenu />);
    });

    const items = tree!.root.findAllByType("WnaDrawerNavigationItem");
    const profileItem = items.find(
      (item: DrawerItemNode) => item.props.text === "screenTitleProfile",
    );

    act(() => {
      profileItem!.props.onPress();
    });

    expect(mockPush).not.toHaveBeenCalled();
    expect(mockCloseDrawer).not.toHaveBeenCalled();
  });

  it("uses dark-mode colors and falls back to default layout values", async () => {
    const { useWnaTheme, useWnaLayout } = jest.requireMock(
      "@/state/WnaAppContext",
    ) as {
      useWnaTheme: jest.Mock<() => unknown>;
      useWnaLayout: jest.Mock<() => unknown>;
    };
    useWnaTheme.mockReturnValueOnce({
      appStyle: {
        textTitleLarge: {},
        textSmall: {},
        textNeutralSmall: {},
        textNeutralMedium: {},
        containerCenterMaxWidth: {},
      },
      appColors: {
        isDark: true,
        staticCoolgray8: "#111",
        white: "#fff",
        warmgray1: "#eee",
        accent5: "#4a4",
        accent7: "#5b5",
        staticAccent5: "#4a4",
        black: "#000",
        coolgray1: "#ccc",
        coolgray2: "#bbb",
      },
      theme: "dark",
      setTheme: mockSetTheme,
      setAppColors: mockSetAppColors,
    });
    useWnaLayout.mockReturnValueOnce({
      appLayout: {
        contentPaddingBottom: 0,
        contentListPaddingTop: 0,
        globalListGap: 0,
        headerButtonHeight: undefined,
        globalCornerRadius: undefined,
        scrollEventThrottle: 16,
      },
    });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaDrawerMenu />);
    });

    const container = tree!.root.findAllByType("div")[0];
    expect(container.props.style).toEqual({
      display: "flex",
      flexDirection: "column",
      position: "relative",
      flex: 1,
      backgroundColor: "#111",
    });

    const buttons = tree!.root.findAllByType("WnaButtonIconText");
    const themeButton = buttons.find(
      (item: ButtonNode) =>
        item.props.text === "settingsTheme: common:catalogThemeDark",
    );

    expect(themeButton!.props.style).toEqual({
      width: "100%",
      marginBottom: 8,
      marginInline: 0,
      height: Math.min(
        appLayoutConstants.headerButtonHeight,
        appLayoutConstants.textInputHeight,
      ),
      borderRadius: appLayoutConstants.globalCornerRadius,
    });
  });
});
