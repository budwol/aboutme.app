import WnaProjectsRoute from "@components/screens/WnaProjectsRoute";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { testAppData } from "@/app-data/testAppData";

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

jest.mock("@/i18n/i18n", () => ({
  getLangCode: () => "de",
}));

jest.mock("expo-router", () => ({
  useNavigation: () => ({}),
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/navigation/components/WnaMenuHeaderRight", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockMenuHeaderRight(props: unknown) {
    return ReactModule.createElement(
      "WnaMenuHeaderRight",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@/navigation/components/WnaNavigationHeaderButtonRight", () => {
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

jest.mock("@components/cards/WnaSurfaceCard", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockCard(props: unknown) {
    return ReactModule.createElement(
      "WnaSurfaceCard",
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

jest.mock("@components/icon/WnaIcon/WnaIcon", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockWnaIcon(props: unknown) {
    return ReactModule.createElement(
      "WnaIcon",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/text/WnaSectionTitle", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockWelcomeTitle(props: unknown) {
    return ReactModule.createElement(
      "WnaSectionTitle",
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
        black: "#000",
        warmgray6: "#666",
        coolgray2: "#ccc",
        coolgray8: "#111",
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
    const header = flatList.props.ListHeaderComponent as React.ReactElement;
    let headerTree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      headerTree = TestRenderer.create(header);
    });
    const headerTextValues = headerTree!.root
      .findAllByType("Text")
      .map(
        (node: { props: { children?: React.ReactNode } }) =>
          node.props.children,
      );

    expect(baseScreen.props.headerTitle).toBe("screenTitleProjects");
    expect(baseScreen.props.titleHref).toBe("/(drawer)/(tabs-de)");
    expect(headerTextValues).toContain(testAppData.projectsContext);
    expect(headerTextValues).toContain(testAppData.projectsHighlights[0].text);
    expect(headerTextValues).toContain(testAppData.projectsHighlights[1].text);
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
    expect(textValues).toContain(testAppData.projectsHighlights[0].text);
    expect(textValues).toContain(testAppData.projectsHighlights[1].text);
    expect(pressables).toHaveLength(testAppData.projects.length);
  });

  it("renders subtitle and title in the project overlay", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaProjectsRoute />);
    });

    const flatList = tree!.root.findByType("AnimatedFlatList");
    const renderItemOutput = flatList.props.renderItem({
      item: {
        ...testAppData.projects[0],
        subtitle: "Android / Web App",
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
    expect(textValues).toContain(testAppData.projects[0].title);
  });

  it("allows longer landscape overlay titles to wrap across multiple lines", () => {
    const appContext = jest.requireMock("@components/WnaAppContext") as {
      useWnaAppData: jest.Mock;
      useWnaLayout: jest.Mock;
    };
    appContext.useWnaAppData.mockReturnValue({
      appData: {
        ...testAppData,
        projects: [
          {
            ...testAppData.projects[0],
            title:
              "Event-Driven Backend for Tour Workflows with Extended Title",
          },
          ...testAppData.projects.slice(1),
        ],
      },
    });
    appContext.useWnaLayout.mockReturnValue({
      appLayout: {
        contentListPaddingTop: 24,
        contentPaddingBottom: 24,
        scrollEventThrottle: 16,
      },
      currentWindowWidth: 1440,
      isLandscape: true,
    });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaProjectsRoute />);
    });

    const featuredTitle = tree!.root
      .findAllByType("Text")
      .find(
        (node: {
          props: { children?: React.ReactNode; numberOfLines?: number };
        }) =>
          node.props.children ===
          "Event-Driven Backend for Tour Workflows with Extended Title",
      );
    expect(featuredTitle?.props.numberOfLines).toBe(3);
  });

  it("omits the portrait intro entirely when there is no context or highlights", () => {
    const appContext = jest.requireMock("@components/WnaAppContext") as {
      useWnaAppData: jest.Mock;
    };
    appContext.useWnaAppData.mockReturnValue({
      appData: {
        ...testAppData,
        projectsContext: undefined,
        projectsHighlights: [],
      },
    });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaProjectsRoute />);
    });

    const flatList = tree!.root.findByType("AnimatedFlatList");

    expect(flatList.props.ListHeaderComponent).toBeNull();
  });

  it("renders only the highlights in the portrait intro when there is no context", () => {
    const appContext = jest.requireMock("@components/WnaAppContext") as {
      useWnaAppData: jest.Mock;
    };
    appContext.useWnaAppData.mockReturnValue({
      appData: {
        ...testAppData,
        projectsContext: undefined,
      },
    });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaProjectsRoute />);
    });

    const flatList = tree!.root.findByType("AnimatedFlatList");
    const header = flatList.props.ListHeaderComponent as React.ReactElement;
    let headerTree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      headerTree = TestRenderer.create(header);
    });

    const textValues = headerTree!.root
      .findAllByType("Text")
      .map(
        (node: { props: { children?: React.ReactNode } }) =>
          node.props.children,
      );

    expect(textValues).toContain(testAppData.projectsHighlights[0].text);
  });

  it("renders only the context in the portrait intro when there are no highlights", () => {
    const appContext = jest.requireMock("@components/WnaAppContext") as {
      useWnaAppData: jest.Mock;
    };
    appContext.useWnaAppData.mockReturnValue({
      appData: {
        ...testAppData,
        projectsHighlights: [],
      },
    });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaProjectsRoute />);
    });

    const flatList = tree!.root.findByType("AnimatedFlatList");
    const header = flatList.props.ListHeaderComponent as React.ReactElement;
    let headerTree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      headerTree = TestRenderer.create(header);
    });

    const textValues = headerTree!.root
      .findAllByType("Text")
      .map(
        (node: { props: { children?: React.ReactNode } }) =>
          node.props.children,
      );

    expect(textValues).toContain(testAppData.projectsContext);
  });

  it("uses a light ripple color and navigates on press in dark mode", () => {
    const appContext = jest.requireMock("@components/WnaAppContext") as {
      useWnaTheme: jest.Mock;
    };
    appContext.useWnaTheme.mockReturnValue({
      appColors: {
        isDark: true,
        black: "#000",
        warmgray6: "#666",
        coolgray2: "#ccc",
        coolgray8: "#111",
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

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaProjectsRoute />);
    });

    const flatList = tree!.root.findByType("AnimatedFlatList");
    const renderItemOutput = flatList.props.renderItem({
      item: { ...testAppData.projects[0], subtitle: undefined },
      index: 0,
    }) as React.ReactElement;
    let itemTree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      itemTree = TestRenderer.create(renderItemOutput);
    });

    const pressable = itemTree!.root.findByType("WnaPressable");

    expect(pressable.props.ripple).toBe("light");

    expect(() => {
      act(() => {
        (pressable.props as { onPress: () => void }).onPress();
      });
    }).not.toThrow();

    expect(flatList.props.keyExtractor(testAppData.projects[0])).toBe(
      testAppData.projects[0].title,
    );
    expect(flatList.props.ItemSeparatorComponent).toBeDefined();
    expect(() => flatList.props.ItemSeparatorComponent()).not.toThrow();
  });

  it("collapses the landscape layout when there is no context data or projects", () => {
    const appContext = jest.requireMock("@components/WnaAppContext") as {
      useWnaAppData: jest.Mock;
      useWnaLayout: jest.Mock;
    };
    appContext.useWnaAppData.mockReturnValue({
      appData: {
        ...testAppData,
        projectsContext: undefined,
        projectsHighlights: [],
        projectsSubtitle: undefined,
        projects: [],
      },
    });
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

    const textValues = tree!.root
      .findAllByType("Text")
      .map(
        (node: { props: { children?: React.ReactNode } }) =>
          node.props.children,
      );

    expect(tree!.root.findAllByType("WnaPressable")).toHaveLength(0);
    expect(textValues).toContain("");
  });
});
