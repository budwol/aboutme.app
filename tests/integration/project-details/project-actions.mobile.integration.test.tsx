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
import { Linking } from "@utils/webLinking";
import { act } from "react-test-renderer";
import { mockDimensions } from "../../helpers/mockDimensions";
import { renderWithAppContext } from "../../helpers/renderWithAppContext";

const mockOpenURL = jest.fn();

// react-test-renderer can't follow a real DOM portal (it isn't ReactDOM),
// so render the portal's children inline instead, same as the component's
// own unit test does.
jest.mock("react-dom", () => ({
  createPortal: (children: React.ReactNode) => children,
}));

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

jest.mock("@components/sections/WnaTechStackSection", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaTechStackSection");
});

jest.mock("@components/screens/WnaScrollViewScreen", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaScrollViewScreen", true);
});

jest.mock("@/navigation/router/wnaRouter", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { jest: jestModule } = require("@jest/globals");

  return {
    router: {
      push: jestModule.fn(),
      replace: jestModule.fn(),
      navigate: jestModule.fn(),
      back: jestModule.fn(),
      canGoBack: jestModule.fn(() => false),
    },
  };
});

describe("WnaProjectDetailsRoute mobile action integration", () => {
  beforeEach(() => {
    mockDimensions(390, 844);
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
    const tree = await renderWithAppContext(
      <WnaProjectDetailsRoute slug={createProjectSlug(project.title, 0)} />,
      { appData: createProjectDetailsAppData(project) },
    );

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
    const tree = await renderWithAppContext(
      <WnaProjectDetailsRoute slug={createProjectSlug(project.title, 0)} />,
      { appData: createProjectDetailsAppData(project) },
    );

    const iconActions = getIconActions(tree);

    await act(async () => {
      await iconActions[0].props.onPress();
    });

    expect(mockOpenURL).not.toHaveBeenCalled();
    const modal = tree.root.findByProps({ id: "private-repo-modal" });
    expect(modal.props["aria-label"]).toBe("private-repo-modal");
    expect(modal.props.role).toBe("dialog");
    expect(modal.props["aria-modal"]).toBe(true);
  });
});
