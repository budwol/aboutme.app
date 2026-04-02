import WnaPrivacyRoute from "@components/screens/WnaPrivacyRoute";
import { buildPrivacyHtml } from "@components/screens/legalContent";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import React from "react";
import { testAppData } from "@/app-data/testAppData";
import { mockDimensions } from "../../../helpers/mockDimensions";
import { renderWithAppContext } from "../../../helpers/renderWithAppContext";

jest.mock("react-i18next", () => ({
  initReactI18next: {
    type: "3rdParty",
    init: () => undefined,
  },
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

jest.mock("@components/screens/legalContent", () => ({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  buildPrivacyHtml: require("@jest/globals").jest.fn(() => "<p>Privacy</p>"),
}));

jest.mock("@components/screens/WnaLegalDocumentScreen", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaLegalDocumentScreen");
});

describe("WnaPrivacyRoute integration", () => {
  beforeEach(() => {
    mockDimensions(1280, 800);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("builds privacy html from app data and passes it into the legal screen", async () => {
    const tree = await renderWithAppContext(<WnaPrivacyRoute />);
    const legalDocumentScreen = tree.root.findByType("WnaLegalDocumentScreen");

    expect(buildPrivacyHtml).toHaveBeenCalledWith(testAppData);
    expect(legalDocumentScreen.props.headerTitle).toBe("screenTitlePrivacy");
    expect(legalDocumentScreen.props.htmlContent).toBe("<p>Privacy</p>");
  });
});
