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
import { mockDimensions } from "../../helpers/mockDimensions";
import { renderWithAppContext } from "../../helpers/renderWithAppContext";

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

function getIconActions(
  tree: Awaited<ReturnType<typeof renderWithAppContext>>,
) {
  return tree.root.findAllByType("WnaButtonIcon");
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
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaMenuHeaderRight");
});

jest.mock("@/navigation/components/WnaNavigationHeaderButtonRight", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaNavigationHeaderButtonRight");
});

jest.mock("@components/cards/WnaSurfaceCard", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaSurfaceCard", true);
});

jest.mock("@components/images/WnaHeroImage", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaHeroImage");
});

jest.mock("@components/text/WnaSectionTitle", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaSectionTitle");
});

jest.mock("@components/buttons/WnaButtonIconText", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaButtonIconText");
});

jest.mock("@components/buttons/WnaButtonIcon", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaButtonIcon");
});

jest.mock("@components/sections/WnaTechStackCard", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaTechStackCard");
});

jest.mock("@components/screens/WnaScrollViewScreen", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaScrollViewScreen", true);
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

describe("WnaProjectDetailsRoute mobile action integration", () => {
  beforeEach(() => {
    mockDimensions(390, 844);
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

  it("shows icon actions in portrait mode and opens public links directly", async () => {
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

    const iconActions = getIconActions(tree);

    expect(iconActions).toHaveLength(3);

    await act(async () => {
      await iconActions[0].props.onPress();
      await iconActions[1].props.onPress();
      await iconActions[2].props.onPress();
    });

    expect(mockOpenURL).toHaveBeenNthCalledWith(1, project.repoUrl);
    expect(mockOpenURL).toHaveBeenNthCalledWith(2, project.webUrl);
    expect(mockOpenURL).toHaveBeenNthCalledWith(3, project.playStoreUrl);
  });

  it("opens the private repository modal from the portrait github icon", async () => {
    const project = {
      ...testAppData.projects[0],
      repoVisibility: "private" as const,
      repoUrl: "https://github.com/example/private-repo",
      webUrl: "https://example.com/app",
    };
    mockUseLocalSearchParams.mockReturnValue({
      slug: createProjectSlug(project.title, 0),
    });

    const tree = await renderWithAppContext(<WnaProjectDetailsRoute />, {
      appData: createProjectDetailsAppData(project),
    });

    const iconActions = getIconActions(tree);

    await act(async () => {
      await iconActions[0].props.onPress();
    });

    expect(mockOpenURL).not.toHaveBeenCalled();
    expect(tree.root.findByType("Modal").props.visible).toBe(true);
  });
});
