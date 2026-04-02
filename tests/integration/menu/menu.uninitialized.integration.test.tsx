import WnaMenuRoute from "@components/screens/WnaMenuRoute";
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

jest.mock("@components/theme/wnaThemeToggle", () => ({
  getThemeIcon: () => "moon-waning-crescent",
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  toggleWnaTheme: require("@jest/globals").jest.fn(async () => undefined),
}));

jest.mock("expo-router", () => ({
  useNavigation: () => ({}),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: () => false,
  }),
}));

describe("WnaMenuRoute uninitialized integration", () => {
  beforeEach(() => {
    mockDimensions(1280, 800);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders nothing before the app lifecycle is initialized", async () => {
    const tree = await renderWithAppContext(<WnaMenuRoute />, {
      isAppInitialized: false,
    });

    expect(tree.toJSON()).toBeNull();
  });
});
