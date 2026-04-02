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
import WnaProjectDetailsRoute from "@/components/screens/WnaProjectDetailsRoute";
import { testAppData } from "@/app-data/testAppData";
import { mockDimensions } from "../../helpers/mockDimensions";
import { renderWithAppContext } from "../../helpers/renderWithAppContext";

const mockOpenURL = jest.fn();
const mockUseLocalSearchParams = jest.fn();

jest.mock("react-i18next", () => ({
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
  const ReactModule = jest.requireActual("react") as typeof import("react");

  return {
    Redirect: (props: unknown) =>
      ReactModule.createElement("Redirect", props as Record<string, unknown>),
    useLocalSearchParams: () => mockUseLocalSearchParams(),
    useNavigation: () => ({}),
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  };
});

describe("WnaProjectDetailsRoute integration", () => {
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

  it("renders seeded project data and opens the private repository modal", async () => {
    const appData = {
      ...testAppData,
      projects: [
        {
          ...testAppData.projects[0],
          repoVisibility: "private" as const,
        },
      ],
    };

    mockUseLocalSearchParams.mockReturnValue({
      slug: createProjectSlug(appData.projects[0].title, 0),
    });

    const tree = await renderWithAppContext(<WnaProjectDetailsRoute />, {
      appData,
    });

    const scrollViewScreen = tree.root.findByType("WnaScrollViewScreen");
    const title = tree.root.findByType("WnaSectionTitle");
    const texts = tree.root
      .findAllByType("Text")
      .map(
        (node: { props: { children?: React.ReactNode } }) =>
          node.props.children,
      );

    expect(scrollViewScreen.props.headerTitle).toBe(appData.projects[0].title);
    expect(title.props.title).toBe(appData.projects[0].title);
    expect(texts).toContain(appData.projectDetailsContext);

    const githubAction = tree.root.findAllByType("WnaButtonIconText")[0];

    await act(async () => {
      await githubAction.props.onPress();
    });

    expect(mockOpenURL).not.toHaveBeenCalled();
    expect(tree.root.findByType("Modal").props.visible).toBe(true);
    const modalTexts = tree.root
      .findAllByType("Text")
      .map(
        (node: { props: { children?: React.ReactNode } }) =>
          node.props.children,
      );
    expect(modalTexts).toContain("titlePrivateRepo");
  });

  it("redirects unknown project slugs to the localized projects route", async () => {
    mockUseLocalSearchParams.mockReturnValue({
      slug: "missing-project",
    });

    const tree = await renderWithAppContext(<WnaProjectDetailsRoute />);

    expect(tree.root.findByType("Redirect").props.href).toBe(
      "/(drawer)/(tabs-de)/projekte",
    );
  });
});
