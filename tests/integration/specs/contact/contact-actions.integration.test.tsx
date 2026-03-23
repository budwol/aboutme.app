import { testAppData } from "@/app-data/testAppData";
import { useWnaAppData, useWnaTheme } from "@components/WnaAppContext";
import WnaContactCard from "@components/sections/WnaContactCard";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import Logger from "wna-logger";
import React from "react";
import { Linking } from "react-native";
import { act } from "react-test-renderer";
import { mockDimensions } from "../../../helpers/mockDimensions";
import { renderWithAppContext } from "../../../helpers/renderWithAppContext";

function ContactCardHost() {
  const { appData } = useWnaAppData();
  const { appColors, appStyle } = useWnaTheme();

  return (
    <WnaContactCard
      appColors={appColors}
      appData={appData}
      appStyle={appStyle}
      t={((value: string) => value) as never}
    />
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

jest.mock("wna-logger", () => ({
   
  __esModule: true,
  default: {
    error: require("@jest/globals").jest.fn(),
    info: require("@jest/globals").jest.fn(),
    warn: require("@jest/globals").jest.fn(),
  },
}));

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

describe("WnaContactCard action integration", () => {
  const canOpenURL = jest.spyOn(Linking, "canOpenURL");
  const openURL = jest.spyOn(Linking, "openURL");

  beforeEach(() => {
    mockDimensions(1280, 800);
    jest.clearAllMocks();
    canOpenURL.mockResolvedValue(true);
    openURL.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("logs unsupported links instead of opening them", async () => {
    const appData = {
      ...testAppData,
      contact: {
        ...testAppData.contact,
        github: "https://github.com/example",
      },
    };
    const loggerError = Logger.error as jest.Mock;

    canOpenURL.mockResolvedValue(false);

    const tree = await renderWithAppContext(<ContactCardHost />, { appData });
    const githubButton = tree.root.findAllByType("WnaButtonIcon")[0];

    await act(async () => {
      await githubButton.props.onPress();
    });

    expect(canOpenURL).toHaveBeenCalledWith(appData.contact.github);
    expect(openURL).not.toHaveBeenCalled();
    expect(loggerError).toHaveBeenCalledWith(
      WnaContactCard.name,
      "github not supported",
    );
  });

  it("logs runtime errors while preserving the rendered action set", async () => {
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
    const loggerError = Logger.error as jest.Mock;
    const failure = new Error("open failed");

    openURL.mockRejectedValue(failure);

    const tree = await renderWithAppContext(<ContactCardHost />, { appData });
    const buttons = tree.root.findAllByType("WnaButtonIcon");

    expect(buttons).toHaveLength(5);

    await act(async () => {
      await buttons[0].props.onPress();
    });

    expect(openURL).toHaveBeenCalledWith(appData.contact.github);
    expect(loggerError).toHaveBeenCalledWith("github", failure);
  });
});
