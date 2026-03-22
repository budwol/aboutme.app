import WnaProjectDetailsRoute from "@components/screens/WnaProjectDetailsRoute";
import { i18nKeys } from "@services/i18n/i18nKeys";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { testAppData } from "@/test/testAppData";
import { createProjectSlug } from "@utils/projectRoutes";
import { Linking } from "react-native";

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
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

jest.mock("@services/i18n/i18n", () => ({
  getLangCode: () => "de",
}));

jest.mock("@components/navigation/WnaMenuHeaderRight", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockMenuHeaderRight(props: unknown) {
    return ReactModule.createElement(
      "WnaMenuHeaderRight",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/cards/WnaListCardWhiteDecent", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockCard(props: unknown) {
    return ReactModule.createElement(
      "WnaListCardWhiteDecent",
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

jest.mock("@components/text/WnaWelcomeTitle", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockWelcomeTitle(props: unknown) {
    return ReactModule.createElement(
      "WnaWelcomeTitle",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/buttons/WnaButtonIconText", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockButtonIconText(props: unknown) {
    return ReactModule.createElement(
      "WnaButtonIconText",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/welcome/WnaTechstackCard", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockTechstackCard(props: unknown) {
    return ReactModule.createElement(
      "WnaTechStackCard",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/misc/WnaSeparatorHorizontal", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockSeparator(props: unknown) {
    return ReactModule.createElement(
      "WnaSeparatorHorizontal",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/screens/WnaScrollViewScreen", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

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
  const ReactModule = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { jest: jestModule } = require("@jest/globals");

  return {
    Redirect: (props: unknown) =>
      ReactModule.createElement("Redirect", props as Record<string, unknown>),
    useLocalSearchParams: jestModule.fn(),
    useNavigation: () => ({}),
    useRouter: () => ({
      push: jestModule.fn(),
      replace: jestModule.fn(),
      back: jestModule.fn(),
    }),
  };
});

describe("WnaProjectDetailsRoute", () => {
  beforeEach(() => {
    jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);

    const appContext = jest.requireMock("@components/WnaAppContext") as {
      useWnaAppData: jest.Mock;
      useWnaLayout: jest.Mock;
      useWnaTheme: jest.Mock;
    };

    appContext.useWnaTheme.mockReturnValue({
      appColors: {
        staticWhite: "#ffffff",
        staticCoolgray8: "#222222",
        coolgray2: "#cccccc",
        coolgray8: "#222222",
        accent5: "#2a7fff",
        white: "#ffffff",
        warmgray6: "#999999",
      },
      appStyle: {
        textSmall: {},
        textNeutralMedium: {},
      },
    });
    appContext.useWnaLayout.mockReturnValue({ currentWindowWidth: 1200 });
    appContext.useWnaAppData.mockReturnValue({ appData: testAppData });

    const expoRouter = jest.requireMock("expo-router") as {
      useLocalSearchParams: jest.Mock;
    };
    expoRouter.useLocalSearchParams.mockReset();
  });

  it("redirects to the localized projects route when the slug is unknown", async () => {
    const expoRouter = jest.requireMock("expo-router") as {
      useLocalSearchParams: jest.Mock;
    };
    expoRouter.useLocalSearchParams.mockReturnValue({
      slug: "missing-project",
    });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaProjectDetailsRoute />);
    });

    expect(tree!.root.findByType("Redirect").props.href).toBe(
      "/(drawer)/(tabs-de)/projekte",
    );
  });

  it("renders the matching project details for a known slug", async () => {
    const appContext = jest.requireMock("@components/WnaAppContext") as {
      useWnaAppData: jest.Mock;
    };
    const expoRouter = jest.requireMock("expo-router") as {
      useLocalSearchParams: jest.Mock;
    };
    const appData = {
      ...testAppData,
      projects: [
        {
          ...testAppData.projects[0],
          context: "Part of a cohesive fullstack system",
          webUrl: "https://app.example.com",
          playStoreUrl: "https://play.example.com",
        },
      ],
    };

    appContext.useWnaAppData.mockReturnValue({ appData });
    expoRouter.useLocalSearchParams.mockReturnValue({
      slug: createProjectSlug(appData.projects[0].title, 0),
    });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaProjectDetailsRoute />);
    });

    const scrollViewScreen = tree!.root.findByType("WnaScrollViewScreen");
    const heroImage = tree!.root.findByType("WnaHeroImage");
    const links = tree!.root.findAllByType("WnaButtonIconText");
    const techstackCard = tree!.root.findByType("WnaTechStackCard");
    const title = tree!.root.findByType("WnaWelcomeTitle");
    const texts = tree!.root.findAllByType("Text");
    const textValues = texts.map(
      (node: { props: { children?: React.ReactNode } }) => node.props.children,
    );

    expect(scrollViewScreen.props.backHref).toBeUndefined();
    expect(scrollViewScreen.props.titleHref).toBe(
      "/(drawer)/(tabs-de)/projekte",
    );
    expect(scrollViewScreen.props.headerTitle).toBe(appData.projects[0].title);
    expect(scrollViewScreen.props.showFooter).toBe(false);
    expect(heroImage.props.imageUrl).toBe(
      `images/${appData.projects[0].imageL}`,
    );
    expect(title.props.title).toBe(appData.projects[0].title);
    expect(title.props.subtitle).toBe(appData.projects[0].context);
    expect(textValues).toContain(appData.projects[0].subtitle);
    expect(textValues).toContain(appData.projectDetailsContext);
    expect(textValues).toContain(appData.projects[0].description);
    expect(
      links.map((link: { props: { text: string; iconName?: string } }) => ({
        text: link.props.text,
        icon: link.props.iconName,
      })),
    ).toEqual([
      { text: i18nKeys.actionGithub, icon: "github" },
      { text: i18nKeys.actionWebApp, icon: "web" },
      { text: i18nKeys.actionPlayStore, icon: "google-play" },
    ]);
    for (const link of links) {
      expect(link.props.onPress).toEqual(expect.any(Function));
    }

    await act(async () => {
      await links[0].props.onPress();
    });

    expect(Linking.openURL).toHaveBeenCalledWith(appData.projects[0].repoUrl);
    expect(techstackCard.props.groups).toEqual([
      {
        key: "project-techstack",
        title: i18nKeys.titleProjectTechstack,
        stack: appData.projects[0].techstack,
      },
    ]);
  });

  it("renders bullet lines in project descriptions as separate bullet rows", async () => {
    const appContext = jest.requireMock("@components/WnaAppContext") as {
      useWnaAppData: jest.Mock;
    };
    const expoRouter = jest.requireMock("expo-router") as {
      useLocalSearchParams: jest.Mock;
    };

    appContext.useWnaAppData.mockReturnValue({
      appData: {
        ...testAppData,
        projects: [
          {
            ...testAppData.projects[0],
            description: "Einleitung\n- Punkt eins\n- Punkt zwei",
          },
        ],
      },
    });
    expoRouter.useLocalSearchParams.mockReturnValue({
      slug: createProjectSlug(testAppData.projects[0].title, 0),
    });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaProjectDetailsRoute />);
    });

    const textValues = tree!.root
      .findAllByType("Text")
      .map(
        (node: { props: { children?: React.ReactNode } }) =>
          node.props.children,
      );

    expect(textValues).toContain("Einleitung");
    expect(textValues).toContain("•");
    expect(textValues).toContain("Punkt eins");
    expect(textValues).toContain("Punkt zwei");
  });
});
