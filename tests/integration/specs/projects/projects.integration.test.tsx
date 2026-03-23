import { getDrawerProjectNavigationPath } from "@/navigation/routes/wnaNavigationRouteProvider";
import { testAppData } from "@/app-data/testAppData";
import WnaProjectsRoute from "@components/screens/WnaProjectsRoute";
import { createProjectSlug } from "@utils/projectRoutes";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import React from "react";
import { mockDimensions } from "../../../helpers/mockDimensions";
import { renderWithAppContext } from "../../../helpers/renderWithAppContext";

const mockPush = jest.fn();

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

jest.mock("@/i18n/i18n", () => ({
  getLangCode: () => "de",
}));

jest.mock("expo-router", () => ({
  useNavigation: () => ({}),
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/navigation/hooks/useWnaNavigationTransition", () => ({
  useWnaNavigationTransition: () => ({
    push: mockPush,
  }),
}));

jest.mock("@/navigation/components/WnaMenuHeaderRight", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { jest: jestModule } = require("@jest/globals");
  const ReactModule = jestModule.requireActual(
    "react",
  ) as typeof import("react");
  return function MockMenuHeaderRight(props: unknown) {
    return ReactModule.createElement(
      "WnaMenuHeaderRight",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@/navigation/components/WnaNavigationHeaderButtonRight", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { jest: jestModule } = require("@jest/globals");
  const ReactModule = jestModule.requireActual(
    "react",
  ) as typeof import("react");
  return function MockNavigationHeaderButtonRight(props: unknown) {
    return ReactModule.createElement(
      "WnaNavigationHeaderButtonRight",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/screens/WnaBaseScreen", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { jest: jestModule } = require("@jest/globals");
  const ReactModule = jestModule.requireActual(
    "react",
  ) as typeof import("react");
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
  const { jest: jestModule } = require("@jest/globals");
  const ReactModule = jestModule.requireActual(
    "react",
  ) as typeof import("react");
  return function MockContactFooter(props: unknown) {
    return ReactModule.createElement(
      "WnaContactFooter",
      props as Record<string, unknown>,
    );
  };
});

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

jest.mock("@components/images/WnaHeroImage", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { jest: jestModule } = require("@jest/globals");
  const ReactModule = jestModule.requireActual(
    "react",
  ) as typeof import("react");
  return function MockHeroImage(props: unknown) {
    return ReactModule.createElement(
      "WnaHeroImage",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/icon/WnaIcon/WnaIcon", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { jest: jestModule } = require("@jest/globals");
  const ReactModule = jestModule.requireActual(
    "react",
  ) as typeof import("react");
  return function MockIcon(props: unknown) {
    return ReactModule.createElement(
      "WnaIcon",
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

jest.mock("react-native-reanimated", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { jest: jestModule } = require("@jest/globals");
  const ReactModule = jestModule.requireActual(
    "react",
  ) as typeof import("react");

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
          <>
            {(props as { ListHeaderComponent?: React.ReactNode })
              .ListHeaderComponent ?? null}
            {(
              props as {
                data?: unknown[];
                renderItem?: (item: {
                  item: unknown;
                  index: number;
                }) => React.ReactNode;
              }
            ).data?.map((item, index) =>
              (
                props as {
                  renderItem?: (item: {
                    item: unknown;
                    index: number;
                  }) => React.ReactNode;
                }
              ).renderItem?.({ item, index }) ? (
                <ReactModule.Fragment key={`flat-list-item-${index}`}>
                  {(
                    props as {
                      renderItem?: (item: {
                        item: unknown;
                        index: number;
                      }) => React.ReactNode;
                    }
                  ).renderItem?.({ item, index })}
                </ReactModule.Fragment>
              ) : null,
            )}
            {(props as { ListFooterComponent?: React.ReactNode })
              .ListFooterComponent ?? null}
          </>,
        ),
    },
  };
});

describe("WnaProjectsRoute integration", () => {
  beforeEach(() => {
    mockDimensions(390, 844);
    mockPush.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the intro copy and opens the selected project", async () => {
    const tree = await renderWithAppContext(<WnaProjectsRoute />);

    const textValues = tree.root
      .findAllByType("Text")
      .map(
        (node: { props: { children?: React.ReactNode } }) =>
          node.props.children,
      );

    expect(textValues).toContain(testAppData.projectsContext);
    expect(textValues).toContain(testAppData.projectsHighlights[0].text);
    expect(textValues).toContain(testAppData.projects[0].title);

    const firstProjectPressable = tree.root.findAllByType("WnaPressable")[0];

    firstProjectPressable.props.onPress();

    expect(mockPush).toHaveBeenCalledWith(
      getDrawerProjectNavigationPath(
        createProjectSlug(testAppData.projects[0].title, 0),
        "de",
      ),
    );
  });

  it("keeps secondary project cards on the correct localized slug", async () => {
    const tree = await renderWithAppContext(<WnaProjectsRoute />);
    const projectPressables = tree.root.findAllByType("WnaPressable");

    projectPressables[1].props.onPress();

    expect(mockPush).toHaveBeenCalledWith(
      getDrawerProjectNavigationPath(
        createProjectSlug(testAppData.projects[1].title, 1),
        "de",
      ),
    );
  });

  it("stays stable when optional intro copy and highlights are missing", async () => {
    const tree = await renderWithAppContext(<WnaProjectsRoute />, {
      appData: {
        ...testAppData,
        projectsContext: "",
        projectsHighlights: [],
      },
    });

    const textValues = tree.root
      .findAllByType("Text")
      .map(
        (node: { props: { children?: React.ReactNode } }) =>
          node.props.children,
      );

    expect(textValues).not.toContain("");
    expect(textValues).not.toContain(testAppData.projectsHighlights[0].text);
    expect(textValues).toContain(testAppData.projects[0].title);
  });
});
