import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaDisclaimerRoute from "@components/screens/WnaDisclaimerRoute";

const mockAppData = {};

jest.mock("@components/WnaAppContext", () => ({
  useWnaAppData: () => ({ appData: mockAppData }),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

jest.mock("@components/screens/legalContent", () => ({
  buildDisclaimerHtml: jest.fn(() => "<p>disclaimer</p>"),
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

describe("WnaDisclaimerRoute", () => {
  it("passes the disclaimer title and generated html to the legal document screen", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaDisclaimerRoute />);
    });

    const screen = tree!.root.findByType("WnaLegalDocumentScreen");

    expect(screen.props.headerTitle).toBe("screenTitleDisclaimer");
    expect(screen.props.htmlContent).toBe("<p>disclaimer</p>");
  });
});
