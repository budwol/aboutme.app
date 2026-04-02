import WnaLegalDocumentScreen from "@components/screens/WnaLegalDocumentScreen";
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

jest.mock("@components/content/WnaHtmlRenderer", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaHtmlRenderer");
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
    useNavigation: () => ({}),
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  };
});

describe("WnaLegalDocumentScreen integration", () => {
  beforeEach(() => {
    mockDimensions(1280, 800);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("redirects to the localized menu route before initialization", async () => {
    const tree = await renderWithAppContext(
      <WnaLegalDocumentScreen headerTitle="Legal" htmlContent="<p>Legal</p>" />,
      { isAppInitialized: false },
    );

    expect(tree.root.findByType("Redirect").props.href).toBe(
      "/(drawer)/(tabs-de)/menu",
    );
  });

  it("renders the html document inside the shared legal screen shell", async () => {
    const tree = await renderWithAppContext(
      <WnaLegalDocumentScreen headerTitle="Legal" htmlContent="<p>Legal</p>" />,
    );

    expect(tree.root.findByType("WnaScrollViewScreen").props.headerTitle).toBe(
      "Legal",
    );
    expect(
      tree.root.findByType("WnaScrollViewScreen").props.showContactFooter,
    ).toBe(false);
    expect(tree.root.findByType("WnaHtmlRenderer").props.html).toBe(
      "<p>Legal</p>",
    );
    expect(tree.root.findByType("WnaHtmlRenderer").props.width).toBe(1280);
  });
});
