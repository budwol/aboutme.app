import WnaDisclaimerRoute from "@components/screens/WnaDisclaimerRoute";
import { buildDisclaimerHtml } from "@components/screens/legalContent";
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
  buildDisclaimerHtml: require("@jest/globals").jest.fn(
    () => "<p>Disclaimer</p>",
  ),
}));

jest.mock("@components/screens/WnaLegalDocumentScreen", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaLegalDocumentScreen");
});

describe("WnaDisclaimerRoute integration", () => {
  beforeEach(() => {
    mockDimensions(1280, 800);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("builds disclaimer html from app data and passes it into the legal screen", async () => {
    const tree = await renderWithAppContext(<WnaDisclaimerRoute />);
    const legalDocumentScreen = tree.root.findByType("WnaLegalDocumentScreen");

    expect(buildDisclaimerHtml).toHaveBeenCalledWith(testAppData);
    expect(legalDocumentScreen.props.headerTitle).toBe("screenTitleDisclaimer");
    expect(legalDocumentScreen.props.htmlContent).toBe("<p>Disclaimer</p>");
  });
});
