import WnaHomeRoute from "@components/screens/WnaHomeRoute";
import { testAppData } from "@/app-data/testAppData";
import {
  getDrawerNavigationPath,
  getDrawerProjectNavigationPath,
} from "@/navigation/routes/wnaNavigationRouteProvider";
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
import TestRenderer, { act } from "react-test-renderer";
import { mockDimensions } from "../../../helpers/mockDimensions";
import { renderWithAppContext } from "../../../helpers/renderWithAppContext";

const mockPush = jest.fn();
const mockScrollTo = jest.fn();

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

jest.mock("@components/cards/WnaSurfaceCard", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { jest: jestModule } = require("@jest/globals");
  const ReactModule = jestModule.requireActual(
    "react",
  ) as typeof import("react");
  return function MockSurfaceCard(props: unknown) {
    return ReactModule.createElement(
      "WnaSurfaceCard",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  };
});

jest.mock("@components/display/WnaSeparatorHorizontal", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { jest: jestModule } = require("@jest/globals");
  const ReactModule = jestModule.requireActual(
    "react",
  ) as typeof import("react");
  return function MockSeparator(props: unknown) {
    return ReactModule.createElement(
      "WnaSeparatorHorizontal",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/sections/WnaProfileCard", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { jest: jestModule } = require("@jest/globals");
  const ReactModule = jestModule.requireActual(
    "react",
  ) as typeof import("react");
  return function MockProfileCard(props: unknown) {
    return ReactModule.createElement(
      "WnaProfileCard",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/sections/WnaExperienceCard", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { jest: jestModule } = require("@jest/globals");
  const ReactModule = jestModule.requireActual(
    "react",
  ) as typeof import("react");
  return function MockExperienceCard(props: unknown) {
    return ReactModule.createElement(
      "WnaExperienceCard",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/sections/WnaProjectsCard", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { jest: jestModule } = require("@jest/globals");
  const ReactModule = jestModule.requireActual(
    "react",
  ) as typeof import("react");
  return function MockProjectsCard(props: unknown) {
    return ReactModule.createElement(
      "WnaProjectsCard",
      props as Record<string, unknown>,
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
      ScrollView: ReactModule.forwardRef((props: unknown, ref: unknown) => {
        if (ref && typeof ref === "object") {
          (ref as { current?: unknown }).current = { scrollTo: mockScrollTo };
        }

        return ReactModule.createElement(
          "AnimatedScrollView",
          props as Record<string, unknown>,
          (props as { children?: React.ReactNode }).children,
        );
      }),
    },
  };
});

describe("WnaHomeRoute integration", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockDimensions(1280, 800);
    mockPush.mockClear();
    mockScrollTo.mockClear();
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

  it("wires seeded app data into the deferred home sections", async () => {
    const tree = await renderWithAppContext(<WnaHomeRoute />);

    expect(
      tree.root.findByType("WnaProfileCard").props.appData.profile.name,
    ).toBe(testAppData.profile.name);
    expect(tree.root.findAllByType("WnaExperienceCard")).toHaveLength(0);
    expect(tree.root.findAllByType("WnaProjectsCard")).toHaveLength(0);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(
      tree.root.findByType("WnaExperienceCard").props.appData.experience[0]
        .company,
    ).toBe(testAppData.experience[0].company);
    expect(
      tree.root.findByType("WnaProjectsCard").props.appData.projects[0].title,
    ).toBe(testAppData.projects[0].title);
    expect(tree.root.findByType("WnaContactFooter")).toBeTruthy();
  });

  it("routes the deferred home actions to the localized targets", async () => {
    const tree = await renderWithAppContext(<WnaHomeRoute />);

    await act(async () => {
      jest.runAllTimers();
    });

    const experienceCard = tree.root.findByType("WnaExperienceCard");
    const projectsCard = tree.root.findByType("WnaProjectsCard");

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

  it("routes a secondary project selection to the matching localized project path", async () => {
    const tree = await renderWithAppContext(<WnaHomeRoute />);

    await act(async () => {
      jest.runAllTimers();
    });

    const projectsCard = tree.root.findByType("WnaProjectsCard");

    projectsCard.props.onProjectPress(1);

    expect(mockPush).toHaveBeenCalledWith(
      getDrawerProjectNavigationPath(
        createProjectSlug(testAppData.projects[1].title, 1),
        "de",
      ),
    );
  });

  it("still mounts deferred sections when experience and projects are empty", async () => {
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
      tree.root.findByType("WnaExperienceCard").props.appData.experience,
    ).toEqual([]);
    expect(
      tree.root.findByType("WnaProjectsCard").props.appData.projects,
    ).toEqual([]);
    expect(tree.root.findByType("WnaContactFooter")).toBeTruthy();
  });
});
