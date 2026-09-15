import WnaLegalDocumentScreen from "@components/screens/WnaLegalDocumentScreen";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
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

jest.mock("@/navigation/components/WnaMenuToggleButton", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaMenuToggleButton");
});

jest.mock("@/navigation/components/WnaHeaderRouteButton", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaHeaderRouteButton");
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

jest.mock("@/navigation/router/WnaRedirect", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { jest: jestModule } = require("@jest/globals");
  const ReactModule = jestModule.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaRedirect(props: unknown) {
    return ReactModule.createElement(
      "WnaRedirect",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@/navigation/router/wnaRouter", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { jest: jestModule } = require("@jest/globals");

  return {
    router: {
      push: jestModule.fn(),
      replace: jestModule.fn(),
      navigate: jestModule.fn(),
      back: jestModule.fn(),
      canGoBack: jestModule.fn(() => false),
    },
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

    expect(tree.root.findByType("WnaRedirect").props.href).toBe("/menu");
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
