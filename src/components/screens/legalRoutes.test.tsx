import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaLicensesRoute from "@components/screens/WnaLicensesRoute";
import WnaPrivacyRoute from "@components/screens/WnaPrivacyRoute";
import WnaTermsRoute from "@components/screens/WnaTermsRoute";

const mockAppData = {};

jest.mock("@/state/WnaAppContext", () => ({
  useWnaAppData: () => ({ appData: mockAppData }),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

jest.mock("@components/screens/legalContent", () => ({
  buildPrivacyHtml: jest.fn(() => "<p>privacy</p>"),
  getTermsHtmlContent: jest.fn(() => "<p>terms</p>"),
  getLicensesHtmlContent: jest.fn(() => "<p>licenses</p>"),
}));

jest.mock("@components/screens/WnaLegalDocumentScreen", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaLegalDocumentScreen(props: unknown) {
    return createElement(
      "WnaLegalDocumentScreen",
      props as Record<string, unknown>,
    );
  };
});

describe("legal routes", () => {
  it.each([
    [WnaPrivacyRoute, "screenTitlePrivacy", "<p>privacy</p>"],
    [WnaTermsRoute, "screenTitleTerms", "<p>terms</p>"],
    [WnaLicensesRoute, "screenTitleLicenses", "<p>licenses</p>"],
  ] satisfies [React.ComponentType, string, string][])(
    "passes legal content into the document screen",
    (Route, headerTitle, htmlContent) => {
      let tree: ReturnType<typeof TestRenderer.create> | undefined;

      act(() => {
        tree = TestRenderer.create(<Route />);
      });

      const screen = tree!.root.findByType("WnaLegalDocumentScreen");

      expect(screen.props.headerTitle).toBe(headerTitle);
      expect(screen.props.htmlContent).toBe(htmlContent);
    },
  );
});
