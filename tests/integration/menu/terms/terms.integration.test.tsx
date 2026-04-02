import WnaTermsRoute from "@components/screens/WnaTermsRoute";
import { getTermsHtmlContent } from "@components/screens/legalContent";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import React from "react";
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
  getTermsHtmlContent: require("@jest/globals").jest.fn(() => "<p>Terms</p>"),
}));

jest.mock("@components/screens/WnaLegalDocumentScreen", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaLegalDocumentScreen");
});

describe("WnaTermsRoute integration", () => {
  beforeEach(() => {
    mockDimensions(1280, 800);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("builds terms html and passes it into the legal screen", async () => {
    const tree = await renderWithAppContext(<WnaTermsRoute />);
    const legalDocumentScreen = tree.root.findByType("WnaLegalDocumentScreen");

    expect(getTermsHtmlContent).toHaveBeenCalledTimes(1);
    expect(legalDocumentScreen.props.headerTitle).toBe("screenTitleTerms");
    expect(legalDocumentScreen.props.htmlContent).toBe("<p>Terms</p>");
  });
});
