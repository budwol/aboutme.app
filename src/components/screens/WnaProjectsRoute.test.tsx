import WnaProjectsRoute from "@components/screens/WnaProjectsRoute";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import React, { CSSProperties } from "react";
import TestRenderer, { act } from "react-test-renderer";
import { testAppData } from "@/app-data/testAppData";

jest.mock("@/state/WnaAppContext", () => {
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

jest.mock("@/navigation/components/WnaMenuToggleButton", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockMenuHeaderRight(props: unknown) {
    return ReactModule.createElement(
      "WnaMenuToggleButton",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@/navigation/components/WnaHeaderRouteButton", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockHeaderButtonRight(props: unknown) {
    return ReactModule.createElement(
      "WnaHeaderRouteButton",
      props as Record<string, unknown>,
    );
  };
});

const mockOnScroll = jest.fn();

jest.mock("@components/screens/useWnaScrollY", () => ({
  useWnaScrollY: () => ({
    scrollY: 0,
    onScroll: (event: unknown) => mockOnScroll(event),
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

jest.mock("@components/chrome/WnaContactFooter", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockContactFooter(props: unknown) {
    return ReactModule.createElement(
      "WnaContactFooter",
      props as Record<string, unknown>,
    );
  };
});

describe("WnaProjectsRoute", () => {
  beforeEach(() => {
    const appContext = jest.requireMock("@/state/WnaAppContext") as {
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
    const scrollView = tree!.root.find(
      (node: { props: { onScroll?: (event: unknown) => void } }) =>
        typeof node.props.onScroll === "function",
    );
    const children = scrollView.props.children as React.ReactElement[];
    const header = children[0];
    let headerTree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      headerTree = TestRenderer.create(header);
    });
    const headerTextValues = headerTree!.root
      .findAllByType("span")
      .map(
        (node: { props: { children?: React.ReactNode } }) =>
          node.props.children,
      );

    expect(baseScreen.props.headerTitle).toBe("screenTitleProjects");
    expect(baseScreen.props.titleHref).toBe("/(drawer)/(tabs-de)");
    expect(headerTextValues).toContain(testAppData.projectsContext);
    expect(headerTextValues).toContain(testAppData.projectsHighlights[0].text);
    expect(headerTextValues).toContain(testAppData.projectsHighlights[1].text);
    expect((children.at(-1)?.type as { name?: string }).name).toBe(
      "MockContactFooter",
    );
    expect(scrollView.props.style.paddingBottom).toBe(16);
  });

  it("renders the dedicated landscape projects layout when the screen is wide", () => {
    const appContext = jest.requireMock("@/state/WnaAppContext") as {
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

    const scrollView = tree!.root.find(
      (node: { props: { onScroll?: (event: unknown) => void } }) =>
        typeof node.props.onScroll === "function",
    );
    const pressables = tree!.root.findAllByType("WnaPressable");
    const textValues = tree!.root
      .findAllByType("span")
      .map(
        (node: { props: { children?: React.ReactNode } }) =>
          node.props.children,
      );

    expect(scrollView).toBeDefined();
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

    const textValues = tree!.root
      .findAllByType("span")
      .map(
        (node: { props: { children?: React.ReactNode } }) =>
          node.props.children,
      );

    expect(textValues).toContain(testAppData.projects[0].subtitle);
    expect(textValues).toContain(testAppData.projects[0].title);
  });

  it("allows longer landscape overlay titles to wrap across multiple lines", () => {
    const appContext = jest.requireMock("@/state/WnaAppContext") as {
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
      .findAllByType("span")
      .find(
        (node: {
          props: { children?: React.ReactNode; style?: CSSProperties };
        }) =>
          node.props.children ===
          "Event-Driven Backend for Tour Workflows with Extended Title",
      );
    expect(
      (featuredTitle?.props.style as { WebkitLineClamp?: number })
        ?.WebkitLineClamp,
    ).toBe(3);
  });

  it("omits the portrait intro entirely when there is no context or highlights", () => {
    const appContext = jest.requireMock("@/state/WnaAppContext") as {
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

    const scrollView = tree!.root.find(
      (node: { props: { onScroll?: (event: unknown) => void } }) =>
        typeof node.props.onScroll === "function",
    );

    expect((scrollView.props.children as React.ReactNode[])[0]).toBeNull();
  });

  it("renders only the highlights in the portrait intro when there is no context", () => {
    const appContext = jest.requireMock("@/state/WnaAppContext") as {
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

    const scrollView = tree!.root.find(
      (node: { props: { onScroll?: (event: unknown) => void } }) =>
        typeof node.props.onScroll === "function",
    );
    const header = (scrollView.props.children as React.ReactElement[])[0];
    let headerTree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      headerTree = TestRenderer.create(header);
    });

    const textValues = headerTree!.root
      .findAllByType("span")
      .map(
        (node: { props: { children?: React.ReactNode } }) =>
          node.props.children,
      );

    expect(textValues).toContain(testAppData.projectsHighlights[0].text);
  });

  it("renders only the context in the portrait intro when there are no highlights", () => {
    const appContext = jest.requireMock("@/state/WnaAppContext") as {
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

    const scrollView = tree!.root.find(
      (node: { props: { onScroll?: (event: unknown) => void } }) =>
        typeof node.props.onScroll === "function",
    );
    const header = (scrollView.props.children as React.ReactElement[])[0];
    let headerTree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      headerTree = TestRenderer.create(header);
    });

    const textValues = headerTree!.root
      .findAllByType("span")
      .map(
        (node: { props: { children?: React.ReactNode } }) =>
          node.props.children,
      );

    expect(textValues).toContain(testAppData.projectsContext);
  });

  it("uses a light ripple color and navigates on press in dark mode", () => {
    const appContext = jest.requireMock("@/state/WnaAppContext") as {
      useWnaAppData: jest.Mock;
      useWnaTheme: jest.Mock;
    };
    appContext.useWnaAppData.mockReturnValue({
      appData: {
        ...testAppData,
        projects: [
          { ...testAppData.projects[0], subtitle: undefined },
          ...testAppData.projects.slice(1),
        ],
      },
    });
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

    const scrollView = tree!.root.find(
      (node: { props: { onScroll?: (event: unknown) => void } }) =>
        typeof node.props.onScroll === "function",
    );
    const pressable = tree!.root.findAllByType("WnaPressable")[0];

    expect(pressable.props.ripple).toBe("light");

    expect(() => {
      act(() => {
        (pressable.props as { onPress: () => void }).onPress();
      });
    }).not.toThrow();

    expect(scrollView.props.onScroll).toEqual(expect.any(Function));
    const projectGroups = scrollView.props.children[1] as React.ReactElement[];
    expect(projectGroups).toHaveLength(testAppData.projects.length);
    expect(projectGroups.map((group) => group.key)).toEqual(
      testAppData.projects.map((project, index) => `${project.title}-${index}`),
    );
  });

  it("adapts the portrait DOM scroll event into the shared hook's expected shape", () => {
    mockOnScroll.mockClear();
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaProjectsRoute />);
    });

    const scrollView = tree!.root.find(
      (node: { props: { onScroll?: (event: unknown) => void } }) =>
        typeof node.props.onScroll === "function",
    );

    act(() => {
      scrollView.props.onScroll!({
        currentTarget: { scrollTop: 123 },
      } as never);
    });

    expect(mockOnScroll).toHaveBeenCalledWith({
      nativeEvent: { contentOffset: { y: 123 } },
    });
  });

  it("adapts the landscape DOM scroll event into the shared hook's expected shape", () => {
    mockOnScroll.mockClear();
    const appContext = jest.requireMock("@/state/WnaAppContext") as {
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

    const scrollView = tree!.root.find(
      (node: { props: { onScroll?: (event: unknown) => void } }) =>
        typeof node.props.onScroll === "function",
    );

    act(() => {
      scrollView.props.onScroll!({
        currentTarget: { scrollTop: 321 },
      } as never);
    });

    expect(mockOnScroll).toHaveBeenCalledWith({
      nativeEvent: { contentOffset: { y: 321 } },
    });
  });

  it("collapses the landscape layout when there is no context data or projects", () => {
    const appContext = jest.requireMock("@/state/WnaAppContext") as {
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
      .findAllByType("span")
      .map(
        (node: { props: { children?: React.ReactNode } }) =>
          node.props.children,
      );

    expect(tree!.root.findAllByType("WnaPressable")).toHaveLength(0);
    expect(textValues).toContain("");
  });

  it("keeps the portrait context/feature boxes and project cards within their parent's width using border-box sizing", () => {
    // Regression test: these elements combine `width: "100%"` with
    // horizontal padding or a border on a real DOM div. Content-box (the
    // browser default) would add that padding/border on top of the
    // 100%-of-parent width, overflowing the page horizontally.
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaProjectsRoute />);
    });

    type StyleNode = { props: { style?: CSSProperties } };
    const divs = tree!.root.findAllByType("div") as unknown as StyleNode[];
    const radius16Boxes = divs.filter(
      (node) => node.props.style?.borderRadius === 16,
    );
    const contextBox = radius16Boxes.find(
      (node) => node.props.style?.flexDirection === "column",
    );
    const featureBox = radius16Boxes.find(
      (node) => node.props.style?.flexDirection === "row",
    );
    const projectCard = divs.find(
      (node) =>
        node.props.style?.borderRadius === 12 &&
        node.props.style?.position === "relative",
    );

    const boxSizingSubset = (style: CSSProperties | undefined) => ({
      width: style?.width,
      boxSizing: style?.boxSizing,
    });

    expect(boxSizingSubset(contextBox?.props.style)).toEqual({
      width: "100%",
      boxSizing: "border-box",
    });
    expect(boxSizingSubset(featureBox?.props.style)).toEqual({
      width: "100%",
      boxSizing: "border-box",
    });
    expect(boxSizingSubset(projectCard?.props.style)).toEqual({
      width: "100%",
      boxSizing: "border-box",
    });
  });

  it("keeps the landscape shell within its parent's width using border-box sizing", () => {
    // Regression test: this shell combines `width: "100%"` with
    // `paddingInline: 28` on a real DOM div, the same content-box
    // overflow risk as above.
    const appContext = jest.requireMock("@/state/WnaAppContext") as {
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

    type StyleNode = { props: { style?: CSSProperties } };
    const landscapeShell = (
      tree!.root.findAllByType("div") as unknown as StyleNode[]
    ).find((node) => node.props.style?.maxWidth === 1480);

    expect(landscapeShell?.props.style).toEqual({
      width: "100%",
      boxSizing: "border-box",
      maxWidth: 1480,
      paddingInline: 28,
    });
  });
});
