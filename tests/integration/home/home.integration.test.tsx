import WnaHomeRoute from "@components/screens/WnaHomeRoute";
import { testAppData } from "@/app-data/testAppData";
import {
  getDrawerNavigationPath,
  getDrawerProjectNavigationPath,
} from "@/navigation/routes/wnaNavigationRoutes";
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
import { act } from "react-test-renderer";
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

jest.mock("@components/cards/WnaSurfaceCard", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaSurfaceCard", true);
});

jest.mock("@components/display/WnaSeparatorHorizontal", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaSeparatorHorizontal");
});

jest.mock("@components/sections/WnaProfileSection", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaProfileSection");
});

jest.mock("@components/sections/WnaExperienceSection", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaExperienceSection");
});

jest.mock("@components/sections/WnaProjectsSection", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaProjectsSection");
});

jest.mock("@components/chrome/WnaContactFooter", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaContactFooter");
});

jest.mock("@components/screens/useWnaScrollY", () => ({
  useWnaScrollY: () => ({
    scrollY: 0,
    onScroll: () => undefined,
  }),
}));

describe("WnaHomeRoute integration", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockDimensions(1280, 800);
    mockPush.mockClear();
    global.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    }) as typeof requestAnimationFrame;
    global.cancelAnimationFrame = jest.fn() as typeof cancelAnimationFrame;
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("starts with the profile card and fills in the deferred sections afterwards", async () => {
    const tree = await renderWithAppContext(<WnaHomeRoute />);

    expect(
      tree.root.findByType("WnaProfileSection").props.appData.profile.name,
    ).toBe(testAppData.profile.name);
    expect(tree.root.findAllByType("WnaExperienceSection")).toHaveLength(0);
    expect(tree.root.findAllByType("WnaProjectsSection")).toHaveLength(0);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(
      tree.root.findByType("WnaExperienceSection").props.appData.experience[0]
        .company,
    ).toBe(testAppData.experience[0].company);
    expect(
      tree.root.findByType("WnaProjectsSection").props.appData.projects[0]
        .title,
    ).toBe(testAppData.projects[0].title);
    expect(tree.root.findByType("WnaContactFooter")).toBeTruthy();
  });

  it("forwards the deferred section actions to the localized targets", async () => {
    const tree = await renderWithAppContext(<WnaHomeRoute />);

    await act(async () => {
      jest.runAllTimers();
    });

    const experienceCard = tree.root.findByType("WnaExperienceSection");
    const projectsCard = tree.root.findByType("WnaProjectsSection");

    experienceCard.props.onFooterActionPress();
    projectsCard.props.onShowMorePress();
    projectsCard.props.onProjectPress(0);

    expect(mockPush).toHaveBeenNthCalledWith(
      1,
      getDrawerNavigationPath("experience", "de"),
    );
    expect(mockPush).toHaveBeenNthCalledWith(
      2,
      getDrawerNavigationPath("projects", "de"),
    );
    expect(mockPush).toHaveBeenNthCalledWith(
      3,
      getDrawerProjectNavigationPath(
        createProjectSlug(testAppData.projects[0].title, 0),
        "de",
      ),
    );
  });

  it("keeps secondary project selections on the correct localized route", async () => {
    const tree = await renderWithAppContext(<WnaHomeRoute />);

    await act(async () => {
      jest.runAllTimers();
    });

    const projectsCard = tree.root.findByType("WnaProjectsSection");

    projectsCard.props.onProjectPress(1);

    expect(mockPush).toHaveBeenCalledWith(
      getDrawerProjectNavigationPath(
        createProjectSlug(testAppData.projects[1].title, 1),
        "de",
      ),
    );
  });

  it("still renders the deferred section shells when experience and projects are empty", async () => {
    const tree = await renderWithAppContext(<WnaHomeRoute />, {
      appData: {
        ...testAppData,
        experience: [],
        projects: [],
      },
    });

    await act(async () => {
      jest.runAllTimers();
    });

    expect(
      tree.root.findByType("WnaExperienceSection").props.appData.experience,
    ).toEqual([]);
    expect(
      tree.root.findByType("WnaProjectsSection").props.appData.projects,
    ).toEqual([]);
    expect(tree.root.findByType("WnaContactFooter")).toBeTruthy();
  });
});
