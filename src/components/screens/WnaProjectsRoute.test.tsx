import WnaProjectsRoute from "@components/screens/WnaProjectsRoute";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { testAppData } from "@/test/testAppData";

jest.mock("@components/WnaAppContext", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
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
    init: () => {},
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
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@components/navigation/WnaMenuHeaderRight", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockMenuHeaderRight(props: unknown) {
    return ReactModule.createElement(
      "WnaMenuHeaderRight",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/navigation/WnaNavigationHeaderButtonRight", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockHeaderButtonRight(props: unknown) {
    return ReactModule.createElement(
      "WnaNavigationHeaderButtonRight",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/screens/useWnaScrollY", () => ({
  useWnaScrollY: () => ({
    scrollY: { value: 0 },
    onScroll: () => undefined,
  }),
}));

jest.mock("@components/cards/WnaListCardWhiteDecent", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockCard(props: unknown) {
    return ReactModule.createElement(
      "WnaListCardWhiteDecent",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  };
});

jest.mock("@components/buttons/WnaPressable", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockPressable(props: unknown) {
    return ReactModule.createElement(
      "WnaPressable",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  };
});

jest.mock("@components/images/WnaHeroImage", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockHeroImage(props: unknown) {
    return ReactModule.createElement(
      "WnaHeroImage",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/text/WnaWelcomeTitle", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockWelcomeTitle(props: unknown) {
    return ReactModule.createElement(
      "WnaWelcomeTitle",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/screens/WnaBaseScreen", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockBaseScreen(props: unknown) {
    return ReactModule.createElement(
      "WnaBaseScreen",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  };
});

jest.mock("@components/screens/WnaContactFooter", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockContactFooter(props: unknown) {
    return ReactModule.createElement(
      "WnaContactFooter",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("react-native-reanimated", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return {
    __esModule: true,
    default: {
      ScrollView: (props: unknown) =>
        ReactModule.createElement(
          "AnimatedScrollView",
          props as Record<string, unknown>,
          (props as { children?: React.ReactNode }).children,
        ),
      FlatList: (props: unknown) =>
        ReactModule.createElement(
          "AnimatedFlatList",
          props as Record<string, unknown>,
        ),
    },
  };
});

describe("WnaProjectsRoute", () => {
  beforeEach(() => {
    const appContext = jest.requireMock("@components/WnaAppContext") as {
      useWnaAppData: jest.Mock;
      useWnaLayout: jest.Mock;
      useWnaTheme: jest.Mock;
    };

    appContext.useWnaTheme.mockReturnValue({
      appColors: {
        isDark: false,
        warmgray6: "#666",
        coolgray2: "#ccc",
        staticAccent5: "#0aa",
        staticBlack: "#000",
        staticCoolgray2: "#ccc",
        staticCoolgray6: "#666",
        staticCoolgray8: "#111",
        staticWhite: "#fff",
      },
      appStyle: {
        containerCenterMaxWidth: {},
        textTitleLarge: {},
        textSmall: {},
        textNeutralMedium: {},
      },
    });
    appContext.useWnaAppData.mockReturnValue({ appData: testAppData });
    appContext.useWnaLayout.mockReturnValue({
      appLayout: {
        contentPaddingBottom: 16,
        contentPaddingBottomWhenActionButton: 16,
        contentListPaddingTop: 16,
        scrollEventThrottle: 16,
      },
      currentWindowWidth: 1200,
      isLandscape: false,
    });
  });

  it("sets the header title target to the localized home route", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaProjectsRoute />);
    });

    const baseScreen = tree!.root.findByType("WnaBaseScreen");
    const flatList = tree!.root.findByType("AnimatedFlatList");

    expect(baseScreen.props.headerTitle).toBe("screenTitleProjects");
    expect(baseScreen.props.titleHref).toBe("/(drawer)/(tabs-de)");
    expect(flatList.props.ListHeaderComponent).toBeUndefined();
    expect(flatList.props.ListFooterComponent.type.name).toBe(
      "MockContactFooter",
    );
    expect(flatList.props.contentContainerStyle.paddingBottom).toBe(16);
  });

  it("renders the dedicated landscape projects layout when the screen is wide", () => {
    const appContext = jest.requireMock("@components/WnaAppContext") as {
      useWnaLayout: jest.Mock;
    };

    appContext.useWnaLayout.mockReturnValue({
      appLayout: {
        contentPaddingBottom: 16,
        contentPaddingBottomWhenActionButton: 16,
        contentListPaddingTop: 16,
        scrollEventThrottle: 16,
      },
      currentWindowWidth: 1400,
      isLandscape: true,
    });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaProjectsRoute />);
    });

    const scrollView = tree!.root.findByType("AnimatedScrollView");
    const pressables = tree!.root.findAllByType("WnaPressable");
    const textValues = tree!.root
      .findAllByType("Text")
      .map(
        (node: { props: { children?: React.ReactNode } }) =>
          node.props.children,
      );

    expect(scrollView).toBeDefined();
    expect(tree!.root.findAllByType("AnimatedFlatList")).toHaveLength(0);
    expect(textValues).toContain("screenTitleProjects");
    expect(textValues).toContain(testAppData.projectsSubtitle?.toUpperCase());
    expect(textValues).toContain(testAppData.projectsContext);
    expect(pressables).toHaveLength(testAppData.projects.length);
  });

  it("renders subtitle and context in the project overlay", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaProjectsRoute />);
    });

    const flatList = tree!.root.findByType("AnimatedFlatList");
    const renderItemOutput = flatList.props.renderItem({
      item: {
        ...testAppData.projects[0],
        subtitle: "Android / Web App",
        context: "Part of a cohesive fullstack system",
      },
      index: 0,
    }) as React.ReactElement;
    let itemTree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      itemTree = TestRenderer.create(renderItemOutput);
    });

    const textValues = itemTree!.root
      .findAllByType("Text")
      .map(
        (node: { props: { children?: React.ReactNode } }) =>
          node.props.children,
      );

    expect(textValues).toContain("Android / Web App");
    expect(textValues).toContain("Part of a cohesive fullstack system");
  });
});
