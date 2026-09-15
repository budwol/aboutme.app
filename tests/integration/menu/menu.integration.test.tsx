import WnaMenuRoute from "@components/screens/WnaMenuRoute";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { act } from "react-test-renderer";
import { mockDimensions } from "../../helpers/mockDimensions";
import { renderWithAppContext } from "../../helpers/renderWithAppContext";

const mockNavigate = jest.fn();
const mockToggleWnaTheme = jest.fn(async (_params?: unknown) => undefined);

jest.mock("react-i18next", () => ({
  initReactI18next: {
    type: "3rdParty",
    init: () => undefined,
  },
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

jest.mock("@/navigation/hooks/useWnaNavigationTransition", () => ({
  useWnaNavigationTransition: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock("@/i18n/i18n", () => ({
  getLangCode: () => "de",
}));

jest.mock("@components/theme/wnaThemeToggle", () => ({
  getThemeIcon: () => "moon-waning-crescent",
  toggleWnaTheme: (params: unknown) => mockToggleWnaTheme(params),
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

jest.mock("@components/cards/WnaSurfaceCard", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaSurfaceCard", true);
});

jest.mock("@components/display/WnaSeparatorHorizontal", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaSeparatorHorizontal");
});

jest.mock("@/navigation/components/WnaNavigationItem", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaNavigationItem");
});

jest.mock("@components/screens/WnaScrollViewScreen", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaScrollViewScreen", true);
});

describe("WnaMenuRoute integration", () => {
  beforeEach(() => {
    mockDimensions(1280, 800);
    mockNavigate.mockClear();
    mockToggleWnaTheme.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders menu entries and navigates to the localized legal routes", async () => {
    const tree = await renderWithAppContext(<WnaMenuRoute />);
    const items = tree.root.findAllByType("WnaNavigationItem");

    expect(items).toHaveLength(5);

    await act(async () => {
      items[1].props.onPress();
      items[2].props.onPress();
      items[3].props.onPress();
      items[4].props.onPress();
    });

    expect(mockNavigate).toHaveBeenNthCalledWith(1, "/menu/impressum");
    expect(mockNavigate).toHaveBeenNthCalledWith(2, "/menu/datenschutz");
    expect(mockNavigate).toHaveBeenNthCalledWith(
      3,
      "/menu/nutzungsbedingungen",
    );
    expect(mockNavigate).toHaveBeenNthCalledWith(4, "/menu/lizenzen");
  });

  it("forwards the theme action through the theme toggle helper", async () => {
    const tree = await renderWithAppContext(<WnaMenuRoute />);
    const themeItem = tree.root.findAllByType("WnaNavigationItem")[0];

    await act(async () => {
      await themeItem.props.onPress();
    });

    expect(mockToggleWnaTheme).toHaveBeenCalledTimes(1);
  });
});
