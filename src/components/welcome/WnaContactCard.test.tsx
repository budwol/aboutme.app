import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import WnaContactCard from "@components/welcome/WnaContactCard";
import { Linking } from "react-native";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { testAppData } from "@/test/testAppData";

jest.mock("react-i18next", () => ({
  initReactI18next: {
    type: "3rdParty",
    init: () => {},
  },
  useTranslation: () => ({
    t: (value: string) => value,
  }),
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

    expect(buttons).toHaveLength(5);

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

    expect(openURL).toHaveBeenNthCalledWith(1, appData.contact.github);
    expect(openURL).toHaveBeenNthCalledWith(2, appData.contact.linkedin);
    expect(openURL).toHaveBeenNthCalledWith(3, appData.contact.xing);
    expect(openURL).toHaveBeenNthCalledWith(4, `tel:${appData.contact.phone}`);
    expect(openURL).toHaveBeenNthCalledWith(
      5,
      `mailto:${appData.contact.email}`,
    );
  });
});
