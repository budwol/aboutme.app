import { testAppData } from "@/app-data/testAppData";
import { getDrawerNavigationPath } from "@/navigation/routes/wnaNavigationRouteProvider";
import { appMotionConstants } from "@constants/motionConstants";
import WnaDrawerMenu from "@/app/(drawer)/WnaDrawerMenu";
import { toggleWnaTheme } from "@components/theme/wnaThemeToggle";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import React from "react";
import { act } from "react-test-renderer";
import { mockDimensions } from "../../../helpers/mockDimensions";
import { renderWithAppContext } from "../../../helpers/renderWithAppContext";

const mockPush = jest.fn();
const mockSetOptions = jest.fn();
const mockToggleWnaTheme = jest.fn(async (_params?: unknown) => undefined);

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

jest.mock("@react-navigation/drawer", () => ({
  useDrawerStatus: () => "open",
}));

jest.mock("expo-router", () => ({
  router: {},
  useNavigation: () => ({
    setOptions: mockSetOptions,
  }),
  useSegments: () => ["(drawer)", "(tabs-de)", "kontakt"],
}));

jest.mock("@/navigation/hooks/useWnaNavigationTransition", () => ({
  useWnaNavigationTransition: () => ({
    push: mockPush,
  }),
}));

jest.mock("@components/theme/wnaThemeToggle", () => ({
  getThemeIcon: () => "moon-waning-crescent",
  toggleWnaTheme: (params: unknown) => mockToggleWnaTheme(params),
}));

jest.mock("@components/buttons/WnaPressable", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { jest: jestModule } = require("@jest/globals");
  const ReactModule = jestModule.requireActual(
    "react",
  ) as typeof import("react");
  return function MockPressable(props: unknown) {
    return ReactModule.createElement(
      "WnaPressable",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  };
});

jest.mock("@components/buttons/WnaButtonIconText", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { jest: jestModule } = require("@jest/globals");
  const ReactModule = jestModule.requireActual(
    "react",
  ) as typeof import("react");
  return function MockButtonIconText(props: unknown) {
    return ReactModule.createElement(
      "WnaButtonIconText",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/images/WnaImage", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { jest: jestModule } = require("@jest/globals");
  const ReactModule = jestModule.requireActual(
    "react",
  ) as typeof import("react");
  return function MockImage(props: unknown) {
    return ReactModule.createElement(
      "WnaImage",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@/navigation/components/WnaNavigationList", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { jest: jestModule } = require("@jest/globals");
  const ReactModule = jestModule.requireActual(
    "react",
  ) as typeof import("react");
  return function MockNavigationList(props: unknown) {
    return ReactModule.createElement(
      "WnaNavigationList",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@/navigation/components/WnaDrawerNavigationItem", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { jest: jestModule } = require("@jest/globals");
  const ReactModule = jestModule.requireActual(
    "react",
  ) as typeof import("react");
  return function MockDrawerNavigationItem(props: unknown) {
    return ReactModule.createElement(
      "WnaDrawerNavigationItem",
      props as Record<string, unknown>,
    );
  };
});

describe("WnaDrawerMenu integration", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockDimensions(1280, 800);
    mockPush.mockClear();
    mockSetOptions.mockClear();
    mockToggleWnaTheme.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("renders drawer items from app data and marks the matching route as active", async () => {
    const tree = await renderWithAppContext(<WnaDrawerMenu />);
    const navigationList = tree.root.findByType("WnaNavigationList");
    const items = navigationList.props.items;
    const renderedItems = items.map(
      (item: unknown) =>
        navigationList.props.renderItem(item) as React.ReactElement,
    );

    expect(mockSetOptions).toHaveBeenCalledWith({ animationEnabled: false });
    expect(navigationList.props.items).toHaveLength(5);
    expect(renderedItems).toHaveLength(5);
    expect(renderedItems[2].props.text).toBe("screenTitleContact");
    expect(renderedItems[2].props.isActive).toBe(true);
  });

  it("runs delayed navigation pushes and forwards footer actions", async () => {
    const tree = await renderWithAppContext(<WnaDrawerMenu />);
    const pressables = tree.root.findAllByType("WnaPressable");
    const navigationList = tree.root.findByType("WnaNavigationList");
    const drawerItems = navigationList.props.items.map(
      (item: unknown) =>
        navigationList.props.renderItem(item) as React.ReactElement,
    );
    const themeButton = tree.root.findByType("WnaButtonIconText");
    const footerLink = tree.root.find(
      (node: {
        type: unknown;
        props: { onPress?: () => void; children?: React.ReactNode };
      }) => node.type === "Text" && typeof node.props.onPress === "function",
    );

    await act(async () => {
      pressables[0].props.onPress();
      drawerItems[0].props.onPress();
      drawerItems[3].props.onPress();
      jest.advanceTimersByTime(appMotionConstants.navigationTransitionDelay);
    });

    expect(mockPush).toHaveBeenNthCalledWith(
      1,
      getDrawerNavigationPath("root", "de"),
    );
    expect(mockPush).toHaveBeenNthCalledWith(
      2,
      getDrawerNavigationPath("root", "de"),
    );
    expect(mockPush).toHaveBeenNthCalledWith(
      3,
      getDrawerNavigationPath("projects", "de"),
    );

    await act(async () => {
      await themeButton.props.onPress();
    });

    expect(toggleWnaTheme).toBeDefined();
    expect(mockToggleWnaTheme).toHaveBeenCalledTimes(1);

    await act(async () => {
      footerLink.props.onPress();
      jest.advanceTimersByTime(appMotionConstants.navigationTransitionDelay);
    });

    expect(mockPush).toHaveBeenLastCalledWith(
      getDrawerNavigationPath("disclaimer", "de"),
    );
  });
});
