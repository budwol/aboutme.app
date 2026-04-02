import WnaLicensesRoute from "@components/screens/WnaLicensesRoute";
import { getLicensesHtmlContent } from "@components/screens/legalContent";
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
  getLicensesHtmlContent: require("@jest/globals").jest.fn(
    () => "<p>Licenses</p>",
  ),
}));

jest.mock("@components/screens/WnaLegalDocumentScreen", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaLegalDocumentScreen");
});

describe("WnaLicensesRoute integration", () => {
  beforeEach(() => {
    mockDimensions(1280, 800);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("builds licenses html and passes it into the legal screen", async () => {
    const tree = await renderWithAppContext(<WnaLicensesRoute />);
    const legalDocumentScreen = tree.root.findByType("WnaLegalDocumentScreen");

    expect(getLicensesHtmlContent).toHaveBeenCalledTimes(1);
    expect(legalDocumentScreen.props.headerTitle).toBe("screenTitleLicenses");
    expect(legalDocumentScreen.props.htmlContent).toBe("<p>Licenses</p>");
  });
});
