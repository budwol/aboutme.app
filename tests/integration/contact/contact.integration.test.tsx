import { testAppData } from "@/app-data/testAppData";
import WnaContactRoute from "@components/screens/WnaContactRoute";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import React from "react";
import { mockDimensions } from "../../helpers/mockDimensions";
import { renderWithAppContext } from "../../helpers/renderWithAppContext";

jest.mock("react-i18next", () => ({
  initReactI18next: {
    type: "3rdParty",
    init: () => undefined,
  },
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

jest.mock("expo-router", () => ({
  useNavigation: () => ({}),
  useRouter: () => ({}),
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

jest.mock("@components/display/WnaSeparatorHorizontal", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaSeparatorHorizontal");
});

jest.mock("@components/text/WnaSectionTitle", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaSectionTitle");
});

jest.mock("@components/sections/WnaContactCard", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaContactCard");
});

jest.mock("@components/screens/WnaScrollViewScreen", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaScrollViewScreen", true);
});

describe("WnaContactRoute integration", () => {
  beforeEach(() => {
    mockDimensions(1280, 800);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the seeded contact details and wires the contact card with app data", async () => {
    const tree = await renderWithAppContext(<WnaContactRoute />);
    const scrollViewScreen = tree.root.findByType("WnaScrollViewScreen");
    const contactCard = tree.root.findByType("WnaContactCard");
    const texts = tree.root
      .findAllByType("Text")
      .map(
        (node: { props: { children?: React.ReactNode } }) =>
          node.props.children,
      );

    expect(scrollViewScreen.props.showFooter).toBe(false);
    expect(scrollViewScreen.props.showContactFooter).toBe(false);
    expect(texts).toContain(testAppData.profile.name);
    expect(texts).toContain(testAppData.contact.addressStreet);
    expect(texts).toContainEqual(
      expect.arrayContaining([
        testAppData.contact.addressZipCode,
        " ",
        testAppData.contact.addressCity,
      ]),
    );
    expect(contactCard.props.appData.contact.email).toBe(
      testAppData.contact.email,
    );
  });
});
