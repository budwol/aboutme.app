import WnaProjectDetailsRoute from "@components/screens/WnaProjectDetailsRoute";
import { i18nKeys } from "@/i18n/i18nKeys";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { testAppData } from "@/app-data/testAppData";
import { WnaWebModal } from "./WnaPrivateRepoModal";
import { createProjectSlug } from "@utils/projectRoutes";
import { Linking } from "@utils/webLinking";

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
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

jest.mock("@/i18n/i18n", () => ({
  getLangCode: () => "de",
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

jest.mock("@components/buttons/WnaButtonIcon", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockButtonIcon(props: unknown) {
    return ReactModule.createElement(
      "WnaButtonIcon",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/sections/WnaTechStackSection", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockTechstackCard(props: unknown) {
    return ReactModule.createElement(
      "WnaTechStackSection",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/display/WnaSeparatorHorizontal", () => {
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
  it("closes the web modal on Escape and removes its listener", () => {
    const addEventListener = jest.fn();
    const removeEventListener = jest.fn();
    const close = jest.fn();
    const originalDocument = globalThis.document;

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: { addEventListener, removeEventListener },
    });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    try {
      act(() => {
        tree = TestRenderer.create(
          <WnaWebModal visible onRequestClose={close}>
            <React.Fragment />
          </WnaWebModal>,
        );
      });

      expect(addEventListener).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function),
      );
      const handleKeyDown = addEventListener.mock.calls[0][1] as (
        event: KeyboardEvent,
      ) => void;

      act(() => handleKeyDown({ key: "Enter" } as KeyboardEvent));
      expect(close).not.toHaveBeenCalled();

      act(() => handleKeyDown({ key: "Escape" } as KeyboardEvent));
      expect(close).toHaveBeenCalledTimes(1);

      act(() => tree!.unmount());
      expect(removeEventListener).toHaveBeenCalledWith(
        "keydown",
        handleKeyDown,
      );
    } finally {
      if (originalDocument === undefined) {
        delete (globalThis as { document?: Document }).document;
      } else {
        Object.defineProperty(globalThis, "document", {
          configurable: true,
          value: originalDocument,
        });
      }
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);

    const appContext = jest.requireMock("@/state/WnaAppContext") as {
      useWnaAppData: jest.Mock;
      useWnaLayout: jest.Mock;
      useWnaTheme: jest.Mock;
    };

    appContext.useWnaTheme.mockReturnValue({
      appColors: {
        background: "#fcfcfc",
        black: "#111111",
        staticWhite: "#ffffff",
        staticCoolgray2: "#cccccc",
        staticCoolgray8: "#222222",
        coolgray2: "#d6d6d6",
        coolgray8: "#181818",
        accent5: "#2a7fff",
        white: "#ffffff",
        warmgray6: "#999999",
      },
      appStyle: {
        textSmall: {},
        textNeutralMedium: {},
      },
    });
    appContext.useWnaLayout.mockReturnValue({
      currentWindowWidth: 1200,
      isLandscape: true,
    });
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
    const appContext = jest.requireMock("@/state/WnaAppContext") as {
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
          repoVisibility: "public",
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
    const techstackCard = tree!.root.findByType("WnaTechStackSection");
    const title = tree!.root.findByType("WnaSectionTitle");
    const texts = tree!.root.findAllByType("Text");
    const textValues = texts.map(
      (node: { props: { children?: React.ReactNode } }) => node.props.children,
    );

    expect(scrollViewScreen.props.backHref).toBeUndefined();
    expect(scrollViewScreen.props.titleHref).toBe(
      "/(drawer)/(tabs-de)/projekte",
    );
    expect(scrollViewScreen.props.headerTitle).toBe(appData.projects[0].title);
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

  it("opens a modal for private repositories and offers continue and contact actions", async () => {
    const appContext = jest.requireMock("@/state/WnaAppContext") as {
      useWnaAppData: jest.Mock;
    };
    const expoRouter = jest.requireMock("expo-router") as {
      useLocalSearchParams: jest.Mock;
    };
    const appData = {
      ...testAppData,
      contact: {
        ...testAppData.contact,
        email: "contact@example.com",
      },
      projects: [
        {
          ...testAppData.projects[0],
          repoVisibility: "private",
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

    const repoLink = tree!.root
      .findAllByType("WnaButtonIconText")
      .find(
        (node: { props: { text?: string; iconName?: string } }) =>
          node.props.text === i18nKeys.actionGithub &&
          node.props.iconName === "github",
      );

    await act(async () => {
      await repoLink?.props.onPress();
    });

    expect(Linking.openURL).not.toHaveBeenCalled();

    const modal = tree!.root.findByProps({ role: "dialog" });
    const texts = tree!.root.findAllByType("Text");
    const textValues = texts.map(
      (node: { props: { children?: React.ReactNode } }) => node.props.children,
    );
    const modalActions = tree!.root
      .findAllByType("WnaButtonIconText")
      .slice(-2);
    const modalDialog = tree!.root.findByProps({
      testID: "private-repo-modal-dialog",
    });
    const modalCloseButton = tree!.root.findByProps({
      testID: "private-repo-modal-close",
    });
    const modalBackdrop = tree!.root.findByProps({
      testID: "private-repo-modal-backdrop",
    });

    expect(modal.props["aria-modal"]).toBe(true);
    expect(modalBackdrop.type).toBe("div");
    expect(modalCloseButton.type).toBe("button");
    expect(modalCloseButton.props.type).toBe("button");
    const stopPropagation = jest.fn();
    modalDialog.props.onClick({ stopPropagation });
    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(textValues).toContain(i18nKeys.titlePrivateRepo);
    expect(textValues).toContainEqual([
      i18nKeys.infoPrivateRepoHint,
      " ",
      i18nKeys.infoPrivateRepoBody,
    ]);
    expect(modalActions).toHaveLength(2);
    expect(modalActions[0].props.style).toMatchObject({ flexBasis: 208 });
    expect(modalActions[1].props.style).toMatchObject({ flexBasis: 208 });
    expect(modalDialog.props.style[1]).toMatchObject({
      backgroundColor: "rgba(252,252,252,0.96)",
      borderColor: "rgba(214,214,214,0.72)",
    });
    expect(modalCloseButton.props.style[1]).toMatchObject({
      backgroundColor: "rgba(252,252,252,0.98)",
      borderColor: "rgba(214,214,214,0.72)",
    });
    expect(modalActions[0].props.textColor).toBe("#ffffff");
    expect(modalActions[0].props.backgroundColor).toBe("rgba(42,127,255,0.92)");
    expect(modalActions[0].props.style).toMatchObject({
      borderColor: "rgba(214,214,214,0.4)",
    });
    expect(modalActions[1].props.textColor).toBe("#111111");
    expect(modalActions[1].props.backgroundColor).toBe(
      "rgba(252,252,252,0.98)",
    );
    expect(modalActions[1].props.style).toMatchObject({
      borderColor: "rgba(214,214,214,0.72)",
    });

    await act(async () => {
      await modalActions[0].props.onPress();
    });

    expect(Linking.openURL).toHaveBeenCalledWith(
      expect.stringContaining("mailto:contact@example.com"),
    );

    await act(async () => {
      tree = TestRenderer.create(<WnaProjectDetailsRoute />);
    });

    const linksAfterRerender = tree!.root.findAllByType("WnaButtonIconText");

    await act(async () => {
      await linksAfterRerender[0].props.onPress();
    });

    const continueAction = tree!.root
      .findAllByType("WnaButtonIconText")
      .find(
        (node: { props: { text?: string } }) =>
          node.props.text === i18nKeys.actionContinueToPage,
      );

    (Linking.openURL as jest.Mock).mockClear();
    await act(async () => {
      await continueAction.props.onPress();
    });

    expect(Linking.openURL).toHaveBeenCalledTimes(1);
    expect(Linking.openURL).toHaveBeenCalledWith(appData.projects[0].repoUrl);

    await act(async () => {
      tree = TestRenderer.create(<WnaProjectDetailsRoute />);
    });

    const linksAfterSecondRerender =
      tree!.root.findAllByType("WnaButtonIconText");

    await act(async () => {
      await linksAfterSecondRerender[0].props.onPress();
    });

    await act(async () => {
      tree!.root
        .findByProps({ testID: "private-repo-modal-close" })
        .props.onClick();
    });

    expect(
      tree!.root.findAllByProps({ testID: "private-repo-modal" }),
    ).toHaveLength(0);
  });

  it("renders bullet lines in project descriptions as separate bullet rows", async () => {
    const appContext = jest.requireMock("@/state/WnaAppContext") as {
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

  it("renders compact icon actions in portrait mode", async () => {
    const appContext = jest.requireMock("@/state/WnaAppContext") as {
      useWnaAppData: jest.Mock;
      useWnaLayout: jest.Mock;
    };
    const expoRouter = jest.requireMock("expo-router") as {
      useLocalSearchParams: jest.Mock;
    };
    const appData = {
      ...testAppData,
      projects: [
        {
          ...testAppData.projects[0],
          repoVisibility: "public",
          webUrl: "https://app.example.com",
          playStoreUrl: "https://play.example.com",
        },
      ],
    };

    appContext.useWnaAppData.mockReturnValue({ appData });
    appContext.useWnaLayout.mockReturnValue({
      currentWindowWidth: 420,
      isLandscape: false,
    });
    expoRouter.useLocalSearchParams.mockReturnValue({
      slug: createProjectSlug(appData.projects[0].title, 0),
    });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaProjectDetailsRoute />);
    });

    const iconButtons = tree!.root.findAllByType("WnaButtonIcon");
    const textButtons = tree!.root.findAllByType("WnaButtonIconText");

    expect(iconButtons).toHaveLength(3);
    expect(
      iconButtons.map(
        (button: { props: { iconName?: string } }) => button.props.iconName,
      ),
    ).toEqual(["github", "web", "google-play"]);
    expect(
      iconButtons.map(
        (button: { props: { toolTipPosition?: string } }) =>
          button.props.toolTipPosition,
      ),
    ).toEqual(["top", "top", "top"]);
    expect(textButtons).toHaveLength(0);
  });

  it("uses dark dialog colors when the active theme is dark", async () => {
    const appContext = jest.requireMock("@/state/WnaAppContext") as {
      useWnaAppData: jest.Mock;
      useWnaTheme: jest.Mock;
    };
    const expoRouter = jest.requireMock("expo-router") as {
      useLocalSearchParams: jest.Mock;
    };
    const appData = {
      ...testAppData,
      projects: [
        {
          ...testAppData.projects[0],
          repoVisibility: "private",
        },
      ],
    };

    appContext.useWnaTheme.mockReturnValue({
      appColors: {
        background: "#181818",
        black: "#ffffff",
        staticWhite: "#ffffff",
        staticCoolgray2: "#cccccc",
        staticCoolgray8: "#222222",
        coolgray2: "#282D37",
        coolgray8: "#fcfcfc",
        accent5: "#2a7fff",
        white: "#181818",
        warmgray6: "#999999",
      },
      appStyle: {
        textSmall: {},
        textNeutralMedium: {},
      },
    });
    appContext.useWnaAppData.mockReturnValue({ appData });
    expoRouter.useLocalSearchParams.mockReturnValue({
      slug: createProjectSlug(appData.projects[0].title, 0),
    });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaProjectDetailsRoute />);
    });

    const repoLink = tree!.root
      .findAllByType("WnaButtonIconText")
      .find(
        (node: { props: { text?: string; iconName?: string } }) =>
          node.props.text === i18nKeys.actionGithub &&
          node.props.iconName === "github",
      );

    await act(async () => {
      await repoLink?.props.onPress();
    });

    const modalDialog = tree!.root.findByProps({
      testID: "private-repo-modal-dialog",
    });
    const modalCloseButton = tree!.root.findByProps({
      testID: "private-repo-modal-close",
    });
    const modalActions = tree!.root
      .findAllByType("WnaButtonIconText")
      .slice(-2);

    expect(modalDialog.props.style[1]).toMatchObject({
      backgroundColor: "rgba(24,24,24,0.96)",
      borderColor: "rgba(40,45,55,0.72)",
    });
    expect(modalCloseButton.props.style[1]).toMatchObject({
      backgroundColor: "rgba(24,24,24,0.98)",
      borderColor: "rgba(40,45,55,0.72)",
    });
    expect(modalActions[0].props.textColor).toBe("#ffffff");
    expect(modalActions[1].props.textColor).toBe("#ffffff");
    expect(modalActions[1].props.backgroundColor).toBe("rgba(24,24,24,0.98)");
    expect(modalActions[1].props.style).toMatchObject({
      borderColor: "rgba(40,45,55,0.72)",
    });
  });

  it("redirects when the slug param is passed as an array", async () => {
    const expoRouter = jest.requireMock("expo-router") as {
      useLocalSearchParams: jest.Mock;
    };
    expoRouter.useLocalSearchParams.mockReturnValue({
      slug: [createProjectSlug(testAppData.projects[0].title, 0)],
    });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaProjectDetailsRoute />);
    });

    expect(tree!.root.findByType("WnaScrollViewScreen").props.headerTitle).toBe(
      testAppData.projects[0].title,
    );
  });

  it("opens the private repo modal from the compact portrait actions and dismisses it via backdrop and close button", async () => {
    const appContext = jest.requireMock("@/state/WnaAppContext") as {
      useWnaAppData: jest.Mock;
      useWnaLayout: jest.Mock;
    };
    const expoRouter = jest.requireMock("expo-router") as {
      useLocalSearchParams: jest.Mock;
    };
    const appData = {
      ...testAppData,
      projects: [
        {
          ...testAppData.projects[0],
          subtitle: undefined,
          repoVisibility: "private",
          webUrl: "https://app.example.com",
        },
      ],
    };

    appContext.useWnaAppData.mockReturnValue({ appData });
    appContext.useWnaLayout.mockReturnValue({
      currentWindowWidth: 420,
      isLandscape: false,
    });
    expoRouter.useLocalSearchParams.mockReturnValue({
      slug: createProjectSlug(appData.projects[0].title, 0),
    });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaProjectDetailsRoute />);
    });

    const iconButtons = tree!.root.findAllByType("WnaButtonIcon");
    const githubButton = iconButtons.find(
      (button: { props: { iconName?: string } }) =>
        button.props.iconName === "github",
    );
    const webButton = iconButtons.find(
      (button: { props: { iconName?: string } }) =>
        button.props.iconName === "web",
    );

    act(() => {
      githubButton?.props.onPress();
    });

    expect(Linking.openURL).not.toHaveBeenCalled();
    expect(
      tree!.root.findAllByProps({ testID: "private-repo-modal" }).length,
    ).toBeGreaterThan(0);

    act(() => {
      tree!.root
        .findByProps({ testID: "private-repo-modal-backdrop" })
        .props.onClick();
    });

    expect(
      tree!.root.findAllByProps({ testID: "private-repo-modal" }),
    ).toHaveLength(0);

    act(() => {
      githubButton?.props.onPress();
    });

    expect(
      tree!.root.findAllByProps({ testID: "private-repo-modal" }).length,
    ).toBeGreaterThan(0);

    const modalCloseButton = tree!.root.findByProps({
      testID: "private-repo-modal-close",
    });

    act(() => {
      modalCloseButton.props.onClick();
    });

    expect(
      tree!.root.findAllByProps({ testID: "private-repo-modal" }),
    ).toHaveLength(0);

    act(() => {
      webButton?.props.onPress();
    });

    expect(Linking.openURL).toHaveBeenCalledWith("https://app.example.com");
    expect(
      tree!.root.findAllByProps({ testID: "private-repo-modal" }),
    ).toHaveLength(0);
  });

  it("hides the compact portrait action row when the project has no links", async () => {
    const appContext = jest.requireMock("@/state/WnaAppContext") as {
      useWnaAppData: jest.Mock;
      useWnaLayout: jest.Mock;
    };
    const expoRouter = jest.requireMock("expo-router") as {
      useLocalSearchParams: jest.Mock;
    };
    const appData = {
      ...testAppData,
      projects: [
        {
          ...testAppData.projects[0],
          subtitle: "Solo side project",
          repoUrl: undefined,
          webUrl: undefined,
          playStoreUrl: undefined,
        },
      ],
    };

    appContext.useWnaAppData.mockReturnValue({ appData });
    appContext.useWnaLayout.mockReturnValue({
      currentWindowWidth: 420,
      isLandscape: false,
    });
    expoRouter.useLocalSearchParams.mockReturnValue({
      slug: createProjectSlug(appData.projects[0].title, 0),
    });

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaProjectDetailsRoute />);
    });

    expect(tree!.root.findAllByType("WnaButtonIcon")).toHaveLength(0);
    const textValues = tree!.root
      .findAllByType("Text")
      .map(
        (node: { props: { children?: React.ReactNode } }) =>
          node.props.children,
      );

    expect(textValues).toContain("Solo side project");
  });

  it("omits the optional sections when techstack, context, and description are absent", async () => {
    const appContext = jest.requireMock("@/state/WnaAppContext") as {
      useWnaAppData: jest.Mock;
    };
    const expoRouter = jest.requireMock("expo-router") as {
      useLocalSearchParams: jest.Mock;
    };
    const appData = {
      ...testAppData,
      projectDetailsContext: undefined,
      projects: [
        {
          ...testAppData.projects[0],
          techstack: [],
          description: undefined,
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

    expect(tree!.root.findAllByType("WnaTechStackSection")).toHaveLength(0);
  });
});
