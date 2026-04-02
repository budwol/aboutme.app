import { testAppData } from "@/app-data/testAppData";
import WnaExperienceRoute from "@components/screens/WnaExperienceRoute";
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

jest.mock("expo-router", () => ({
  useNavigation: () => ({}),
  useRouter: () => ({}),
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

jest.mock("@components/cards/WnaSurfaceCard", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaSurfaceCard", true);
});

jest.mock("@components/sections/WnaExperienceCard", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaExperienceCard");
});

jest.mock("@components/screens/WnaScrollViewScreen", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMockComponent } = require("@tests/helpers/createMockComponent");
  return createMockComponent("WnaScrollViewScreen", true);
});

describe("WnaExperienceRoute integration", () => {
  beforeEach(() => {
    mockDimensions(1280, 800);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the shared screen shell and forwards seeded experience data", async () => {
    const tree = await renderWithAppContext(<WnaExperienceRoute />);
    const scrollViewScreen = tree.root.findByType("WnaScrollViewScreen");
    const experienceCard = tree.root.findByType("WnaExperienceCard");

    expect(scrollViewScreen.props.isRootPage).toBe(true);
    expect(scrollViewScreen.props.showFooter).toBe(false);
    expect(scrollViewScreen.props.headerTitle).toBe("screenTitleExperience");
    expect(experienceCard.props.appData.experience[0].company).toBe(
      testAppData.experience[0].company,
    );
    expect(experienceCard.props.appData.experience[0].companyUrl).toBe(
      testAppData.experience[0].companyUrl,
    );
  });

  it("preserves experiences without a company URL", async () => {
    const appData = {
      ...testAppData,
      experience: [
        {
          ...testAppData.experience[0],
          company: "Employer Without Link",
          companyUrl: undefined,
        },
      ],
    };

    const tree = await renderWithAppContext(<WnaExperienceRoute />, {
      appData,
    });
    const experienceCard = tree.root.findByType("WnaExperienceCard");

    expect(experienceCard.props.appData.experience[0].company).toBe(
      "Employer Without Link",
    );
    expect(
      experienceCard.props.appData.experience[0].companyUrl,
    ).toBeUndefined();
  });
});
