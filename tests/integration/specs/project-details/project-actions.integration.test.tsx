import { testAppData } from "@/app-data/testAppData";
import WnaProjectDetailsRoute from "@/components/screens/WnaProjectDetailsRoute";
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
import { Linking } from "react-native";
import { act } from "react-test-renderer";
import { mockDimensions } from "../../../helpers/mockDimensions";
import { renderWithAppContext } from "../../../helpers/renderWithAppContext";

const mockOpenURL = jest.fn();
const mockUseLocalSearchParams = jest.fn();

function createProjectDetailsAppData(
  project: (typeof testAppData.projects)[number],
) {
  return {
    ...testAppData,
    projects: [project],
  };
}

function getTextActions(
  tree: Awaited<ReturnType<typeof renderWithAppContext>>,
) {
  return tree.root.findAllByType("WnaButtonIconText");
}

function findActionByText(
  tree: Awaited<ReturnType<typeof renderWithAppContext>>,
  text: string,
) {
  return getTextActions(tree).find(
    (node: { props: { text?: string } }) => node.props.text === text,
  );
}

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

jest.mock("@components/text/WnaSectionTitle", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { jest: jestModule } = require("@jest/globals");
  const ReactModule = jestModule.requireActual(
    "react",
  ) as typeof import("react");
  return function MockSectionTitle(props: unknown) {
    return ReactModule.createElement(
      "WnaSectionTitle",
      props as Record<string, unknown>,
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

jest.mock("@components/buttons/WnaButtonIcon", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { jest: jestModule } = require("@jest/globals");
  const ReactModule = jestModule.requireActual(
    "react",
  ) as typeof import("react");
  return function MockButtonIcon(props: unknown) {
    return ReactModule.createElement(
      "WnaButtonIcon",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/sections/WnaTechStackCard", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { jest: jestModule } = require("@jest/globals");
  const ReactModule = jestModule.requireActual(
    "react",
  ) as typeof import("react");
  return function MockTechStackCard(props: unknown) {
    return ReactModule.createElement(
      "WnaTechStackCard",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/screens/WnaScrollViewScreen", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { jest: jestModule } = require("@jest/globals");
  const ReactModule = jestModule.requireActual(
    "react",
  ) as typeof import("react");
  return function MockScrollViewScreen(props: unknown) {
    return ReactModule.createElement(
      "WnaScrollViewScreen",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  };
});

jest.mock("expo-router", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { jest: jestModule } = require("@jest/globals");
  const ReactModule = jestModule.requireActual(
    "react",
  ) as typeof import("react");

  return {
    Redirect: (props: unknown) =>
      ReactModule.createElement("Redirect", props as Record<string, unknown>),
    useLocalSearchParams: () => mockUseLocalSearchParams(),
    useNavigation: () => ({}),
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  };
});

describe("WnaProjectDetailsRoute action integration", () => {
  beforeEach(() => {
    mockDimensions(1280, 800);
    mockUseLocalSearchParams.mockReset();
    mockOpenURL.mockReset();
    jest
      .spyOn(Linking, "openURL")
      .mockImplementation((...args: Parameters<typeof Linking.openURL>) => {
        mockOpenURL(...args);
        return Promise.resolve();
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("opens the public landscape actions directly", async () => {
    const project = {
      ...testAppData.projects[0],
      repoVisibility: "public" as const,
      repoUrl: "https://github.com/example/public-repo",
      webUrl: "https://example.com/app",
      playStoreUrl: "https://play.google.com/store/apps/details?id=app",
    };
    mockUseLocalSearchParams.mockReturnValue({
      slug: createProjectSlug(project.title, 0),
    });

    const tree = await renderWithAppContext(<WnaProjectDetailsRoute />, {
      appData: createProjectDetailsAppData(project),
    });

    const actions = getTextActions(tree);

    await act(async () => {
      await actions[0].props.onPress();
      await actions[1].props.onPress();
      await actions[2].props.onPress();
    });

    expect(mockOpenURL).toHaveBeenNthCalledWith(1, project.repoUrl);
    expect(mockOpenURL).toHaveBeenNthCalledWith(2, project.webUrl);
    expect(mockOpenURL).toHaveBeenNthCalledWith(3, project.playStoreUrl);
  });

  it("opens the private repo modal and forwards both modal actions", async () => {
    const project = {
      ...testAppData.projects[0],
      repoVisibility: "private" as const,
      repoUrl: "https://github.com/example/private-repo",
    };
    mockUseLocalSearchParams.mockReturnValue({
      slug: createProjectSlug(project.title, 0),
    });

    const tree = await renderWithAppContext(<WnaProjectDetailsRoute />, {
      appData: createProjectDetailsAppData(project),
    });

    const [githubAction] = getTextActions(tree);

    await act(async () => {
      await githubAction.props.onPress();
    });

    expect(tree.root.findByType("Modal").props.visible).toBe(true);

    const emailButton = findActionByText(tree, "actionEmail");

    await act(async () => {
      await emailButton?.props.onPress();
    });

    expect(mockOpenURL).toHaveBeenCalledWith(
      expect.stringContaining(`mailto:${testAppData.contact.email}`),
    );

    await act(async () => {
      await githubAction.props.onPress();
    });

    const reopenedContinueButton = findActionByText(
      tree,
      "actionContinueToPage",
    );

    await act(async () => {
      await reopenedContinueButton?.props.onPress();
    });

    expect(mockOpenURL).toHaveBeenLastCalledWith(project.repoUrl);
  });
});
