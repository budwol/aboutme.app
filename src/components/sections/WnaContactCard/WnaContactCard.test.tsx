import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import WnaContactCard from "@components/sections/WnaContactCard";
import { Linking } from "react-native";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { testAppData } from "@/app-data/testAppData";
import { useTranslation } from "react-i18next";

jest.mock("@components/WnaAppContext", () => ({
  useWnaLayout: () => ({ currentWindowWidth: 390 }),
}));

jest.mock("react-i18next", () => ({
  initReactI18next: {
    type: "3rdParty",
    init: () => {},
  },
  useTranslation: jest.fn(() => ({
    t: (value: string) => value,
    i18n: { resolvedLanguage: "de", language: "de" },
  })),
}));

jest.mock("wna-logger", () => ({
  __esModule: true,
  default: {
    error: () => {},
    info: () => {},
    warn: () => {},
  },
}));

jest.mock("@components/buttons/WnaButtonIcon", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockWnaButtonIcon(props: unknown) {
    return ReactModule.createElement("WnaButtonIcon", props);
  };
});

type ViewNode = {
  props: {
    style?: unknown;
  };
};

describe("WnaContactCard", () => {
  const canOpenURL = jest.spyOn(Linking, "canOpenURL");
  const openURL = jest.spyOn(Linking, "openURL");

  beforeEach(() => {
    jest.clearAllMocks();
    canOpenURL.mockResolvedValue(true);
    openURL.mockResolvedValue(undefined);
  });

  it("opens the social, phone and email URLs via Linking", async () => {
    const appData = {
      ...testAppData,
      contact: {
        ...testAppData.contact,
        github: "https://github.com/example",
        linkedin: "https://linkedin.com/in/example",
        xing: "https://xing.com/profile/example",
        phone: "+4912345",
        email: "hello@example.com",
      },
    };

    let testRenderer: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      testRenderer = TestRenderer.create(
        <WnaContactCard
          appColors={undefined as never}
          appData={appData}
          appStyle={undefined as never}
          t={((value: string) => value) as never}
        />,
      );
    });

    const buttons = testRenderer!.root.findAllByType("WnaButtonIcon");

    expect(buttons).toHaveLength(6);
    const actionContainer = testRenderer!.root
      .findAllByType("View")
      .find((node: ViewNode) => {
        const style = Array.isArray(node.props.style) ? node.props.style : [];

        return style.some(
          (entry: { maxWidth?: number } | false | undefined) =>
            entry && entry.maxWidth === 188,
        );
      });

    expect(actionContainer).toBeDefined();
    expect(actionContainer!.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          flexDirection: "row",
          flexWrap: "wrap",
          width: "100%",
        }),
        expect.objectContaining({ maxWidth: 188 }),
      ]),
    );

    await act(async () => {
      for (const button of buttons) {
        await button.props.onPress();
      }
    });

    expect(canOpenURL).toHaveBeenNthCalledWith(1, appData.contact.github);
    expect(canOpenURL).toHaveBeenNthCalledWith(2, appData.contact.linkedin);
    expect(canOpenURL).toHaveBeenNthCalledWith(3, appData.contact.xing);
    expect(canOpenURL).toHaveBeenNthCalledWith(
      4,
      `tel:${appData.contact.phone}`,
    );
    expect(canOpenURL).toHaveBeenNthCalledWith(
      5,
      `mailto:${appData.contact.email}`,
    );
    expect(canOpenURL).toHaveBeenNthCalledWith(
      6,
      "/John_Doe_-_Portfolio_DE.pdf",
    );

    expect(openURL).toHaveBeenNthCalledWith(1, appData.contact.github);
    expect(openURL).toHaveBeenNthCalledWith(2, appData.contact.linkedin);
    expect(openURL).toHaveBeenNthCalledWith(3, appData.contact.xing);
    expect(openURL).toHaveBeenNthCalledWith(4, `tel:${appData.contact.phone}`);
    expect(openURL).toHaveBeenNthCalledWith(
      5,
      `mailto:${appData.contact.email}`,
    );
    expect(openURL).toHaveBeenNthCalledWith(6, "/John_Doe_-_Portfolio_DE.pdf");
  });

  it("logs an error and skips opening when the URL is not supported", async () => {
    canOpenURL.mockResolvedValueOnce(false);

    let testRenderer: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      testRenderer = TestRenderer.create(
        <WnaContactCard
          appColors={undefined as never}
          appData={testAppData}
          appStyle={undefined as never}
          t={((value: string) => value) as never}
        />,
      );
    });

    const [githubButton] = testRenderer!.root.findAllByType("WnaButtonIcon");

    await act(async () => {
      await githubButton.props.onPress();
    });

    expect(canOpenURL).toHaveBeenCalledWith(testAppData.contact.github);
    expect(openURL).not.toHaveBeenCalled();
  });

  it("logs an error when opening the URL throws", async () => {
    const error = new Error("boom");
    openURL.mockRejectedValueOnce(error);

    let testRenderer: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      testRenderer = TestRenderer.create(
        <WnaContactCard
          appColors={undefined as never}
          appData={testAppData}
          appStyle={undefined as never}
          t={((value: string) => value) as never}
        />,
      );
    });

    const [githubButton] = testRenderer!.root.findAllByType("WnaButtonIcon");

    await act(async () => {
      await githubButton.props.onPress();
    });

    expect(openURL).toHaveBeenCalledWith(testAppData.contact.github);
  });

  it("omits the phone and email buttons when contact info is missing", async () => {
    const appData = {
      ...testAppData,
      contact: {
        ...testAppData.contact,
        phone: undefined,
        email: undefined,
      },
    } as never;

    let testRenderer: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      testRenderer = TestRenderer.create(
        <WnaContactCard
          appColors={undefined as never}
          appData={appData}
          appStyle={undefined as never}
          t={((value: string) => value) as never}
        />,
      );
    });

    const buttons = testRenderer!.root.findAllByType("WnaButtonIcon");

    expect(buttons).toHaveLength(4);
  });

  it("falls back to the English resume when the resolved language isn't German", async () => {
    (useTranslation as jest.Mock).mockReturnValueOnce({
      t: (value: string) => value,
      i18n: { resolvedLanguage: "en", language: "en" },
    });

    let testRenderer: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      testRenderer = TestRenderer.create(
        <WnaContactCard
          appColors={undefined as never}
          appData={testAppData}
          appStyle={undefined as never}
          t={((value: string) => value) as never}
        />,
      );
    });

    const buttons = testRenderer!.root.findAllByType("WnaButtonIcon");
    const resumeButton = buttons[buttons.length - 1];

    await act(async () => {
      await resumeButton.props.onPress();
    });

    expect(canOpenURL).toHaveBeenCalledWith("/John_Doe_-_Portfolio_EN.pdf");
  });

  it("falls back to the language when resolvedLanguage is unset", async () => {
    (useTranslation as jest.Mock).mockReturnValueOnce({
      t: (value: string) => value,
      i18n: { resolvedLanguage: undefined, language: "de" },
    });

    let testRenderer: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      testRenderer = TestRenderer.create(
        <WnaContactCard
          appColors={undefined as never}
          appData={testAppData}
          appStyle={undefined as never}
          t={((value: string) => value) as never}
        />,
      );
    });

    const buttons = testRenderer!.root.findAllByType("WnaButtonIcon");
    const resumeButton = buttons[buttons.length - 1];

    await act(async () => {
      await resumeButton.props.onPress();
    });

    expect(canOpenURL).toHaveBeenCalledWith("/John_Doe_-_Portfolio_DE.pdf");
  });
});
