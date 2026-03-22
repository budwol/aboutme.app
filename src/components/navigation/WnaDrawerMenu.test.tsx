import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaDrawerMenu from "@app/(drawer)/WnaDrawerMenu";
import { appLayoutConstants } from "@constants/layoutConstants";

const mockHeaderButtonHeight = appLayoutConstants.headerButtonHeight;
const mockGlobalCornerRadius = appLayoutConstants.globalCornerRadius;

const mockSetOptions = jest.fn();
const mockPush = jest.fn();
const mockSetTheme = jest.fn();
const mockSetAppColors = jest.fn();
const mockToastShow = jest.fn();
let mockDrawerStatus = "closed";
let mockSegments: string[] = ["(drawer)", "(tabs-de)"];

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
    accessibilityRole?: string;
    children?: string[];
  };
};

function MockToast(_props: unknown) {
  return null;
}

MockToast.show = mockToastShow;

jest.mock("@components/WnaAppContext", () => ({
  useWnaAppData: () => ({
    appData: {
      profile: {
        name: "John Doe",
        title: "Software Engineer",
      },
    },
  }),
  useWnaLayout: () => ({
    appLayout: {
      contentPaddingBottom: 0,
      contentListPaddingTop: 0,
      globalListGap: 0,
      headerButtonHeight: mockHeaderButtonHeight,
      globalCornerRadius: mockGlobalCornerRadius,
      scrollEventThrottle: 16,
    },
  }),
  useWnaTheme: () => ({
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
      staticAccent5: "#4a4",
      black: "#000",
      coolgray1: "#ccc",
      coolgray2: "#bbb",
    },
    theme: "dark",
    setTheme: mockSetTheme,
    setAppColors: mockSetAppColors,
  }),
}));

jest.mock("@components/currentAppVersion", () => () => "1.0.0");

jest.mock("@services/i18n/i18n", () => ({
  getLangCode: () => "de",
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

jest.mock("@services/wnaAsyncStorageProvider", () => ({
  getThemeFromStorageAsync: async () => "dark",
  setThemeToStorageAsync: async () => undefined,
}));

jest.mock("@utils/themeColors", () => ({
  getNextTheme: () => "light",
  resolveAppColors: () => ({ id: 2, isDark: false }),
}));

jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: MockToast,
}));

jest.mock("@react-navigation/drawer", () => ({
  useDrawerStatus: () => mockDrawerStatus,
}));

jest.mock("expo-router", () => ({
  router: {},
  useNavigation: () => ({
    setOptions: mockSetOptions,
  }),
  useSegments: () => mockSegments,
}));

jest.mock("@components/navigation/useWnaNavigationTransition", () => ({
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

jest.mock("@components/navigation/WnaNavigationList", () => {
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

jest.mock("@/components/navigation/WnaDrawerNavigationItem", () => {
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
    mockSetOptions.mockClear();
    mockSetTheme.mockClear();
    mockSetAppColors.mockClear();
    mockToastShow.mockClear();
    mockDrawerStatus = "closed";
    mockSegments = ["(drawer)", "(tabs-de)"];
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
  });

  it("navigates to the root route when the header is pressed outside the home route", async () => {
    mockSegments = ["(drawer)", "experience"];
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaDrawerMenu />);
    });

    const headerPressable = tree!.root.findAllByType("WnaPressable")[0];

    act(() => {
      headerPressable.props.onPress();
    });

    expect(mockPush).toHaveBeenCalledWith("/(drawer)/(tabs-de)");
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

  it("disables drawer animation when the drawer is open", async () => {
    mockDrawerStatus = "open";

    await act(async () => {
      TestRenderer.create(<WnaDrawerMenu />);
    });

    expect(mockSetOptions).toHaveBeenCalledWith({ animationEnabled: false });
  });

  it("navigates when an inactive drawer item is pressed", async () => {
    mockSegments = ["(drawer)", "experience"];
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

    expect(mockPush).toHaveBeenCalledWith("/(drawer)/(tabs-de)/projekte");
  });

  it("renders the footer copyright with the profile name from app data", async () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaDrawerMenu />);
    });

    const footerLink = tree!.root.find(
      (node: FooterLinkNode) => node.props.accessibilityRole === "link",
    );

    expect(footerLink.props.children.join("")).toBe("© John Doe");
  });

  it("navigates to the disclaimer route from the footer link", async () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaDrawerMenu />);
    });

    const footerLink = tree!.root.find(
      (node: FooterLinkNode) => node.props.accessibilityRole === "link",
    );

    act(() => {
      footerLink.props.onPress();
    });

    expect(mockPush).toHaveBeenCalledWith("/(drawer)/(tabs-de)/menu/impressum");
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
    expect(themeButton!.props.style).toEqual(
      expect.objectContaining({
        marginHorizontal: 0,
        height: appLayoutConstants.textInputHeight,
        borderRadius: appLayoutConstants.globalCornerRadius,
      }),
    );

    await act(async () => {
      await themeButton!.props.onPress();
    });

    expect(mockSetAppColors).toHaveBeenCalledWith({ id: 2, isDark: false });
    expect(mockSetTheme).toHaveBeenCalledWith("light");
    expect(mockToastShow).toHaveBeenCalledWith({
      type: "themeChange",
      text1: "Appearance",
      text2: "Light mode",
      props: { appColors: { id: 2, isDark: false } },
    });
  });
});
