import { getDrawerProjectNavigationPath } from "@/navigation/routes/wnaNavigationRoutes";
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
import { mockDimensions } from "../../helpers/mockDimensions";
import { renderWithAppContext } from "../../helpers/renderWithAppContext";

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

jest.mock("@/navigation/components/WnaMenuToggleButton", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaMenuToggleButton");
});

jest.mock("@/navigation/components/WnaHeaderRouteButton", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaHeaderRouteButton");
});

jest.mock("@components/screens/WnaBaseScreen", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaBaseScreen", true);
});

jest.mock("@components/chrome/WnaContactFooter", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaContactFooter");
});

jest.mock("@components/buttons/WnaPressable", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaPressable", true);
});

jest.mock("@components/images/WnaHeroImage", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaHeroImage");
});

jest.mock("@components/icon/WnaIcon/WnaIcon", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaIcon");
});

jest.mock("@components/screens/useWnaScrollY", () => ({
  useWnaScrollY: () => ({
    scrollY: 0,
    onScroll: () => undefined,
  }),
}));

jest.mock("react-native", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react") as typeof import("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const actual = require("@jest/globals").jest.requireActual(
    "react-native",
  ) as typeof import("react-native");

  const FlatList = (props: {
    data?: unknown[];
    renderItem?: (info: { item: unknown; index: number }) => React.ReactNode;
    ListHeaderComponent?: React.ReactNode;
    ListFooterComponent?: React.ReactNode;
  }) =>
    ReactModule.createElement(
      "FlatList",
      null,
      props.ListHeaderComponent,
      props.data?.map((item, index) =>
        ReactModule.createElement(
          ReactModule.Fragment,
          { key: index },
          props.renderItem?.({ item, index }),
        ),
      ),
      props.ListFooterComponent,
    );

  return new Proxy(actual, {
    get(target, property, receiver) {
      return property === "FlatList"
        ? FlatList
        : Reflect.get(target, property, receiver);
    },
  });
});

describe("WnaProjectsRoute integration", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockDimensions(390, 844);
    mockPush.mockClear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
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
