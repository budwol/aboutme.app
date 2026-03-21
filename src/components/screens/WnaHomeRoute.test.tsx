/* eslint-disable @typescript-eslint/no-require-imports */
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import WnaHomeRoute from "@components/screens/WnaHomeRoute";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";

type RenderedNode = {
  type: unknown;
};

const mockPush = jest.fn();
const mockScrollTo = jest.fn();

jest.mock("@components/WnaAppContext", () => {
  const { jest: jestModule } = require("@jest/globals");

  return {
    useWnaAppData: jestModule.fn(),
    useWnaLayout: jestModule.fn(),
    useWnaTheme: jestModule.fn(),
  };
});

jest.mock("react-i18next", () => ({
  initReactI18next: {
    type: "3rdParty",
    init: () => undefined,
  },
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

jest.mock("@services/i18n/i18n", () => ({
  getLangCode: () => "de",
}));

jest.mock("expo-router", () => ({
  useNavigation: () => ({}),
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@components/navigation/WnaMenuHeaderRight", () => {
  const ReactModule = require("react") as typeof import("react");

  return function MockMenuHeaderRight(props: unknown) {
    return ReactModule.createElement(
      "WnaMenuHeaderRight",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/navigation/WnaNavigationHeaderButtonRight", () => {
  const ReactModule = require("react") as typeof import("react");

  return function MockHeaderButtonRight(props: unknown) {
    return ReactModule.createElement(
      "WnaNavigationHeaderButtonRight",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/misc/WnaSeparatorHorizontal", () => {
  const ReactModule = require("react") as typeof import("react");

  return function MockSeparator(props: unknown) {
    return ReactModule.createElement(
      "WnaSeparatorHorizontal",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/screens/WnaBaseScreen", () => {
  const ReactModule = require("react") as typeof import("react");

  return function MockBaseScreen(props: unknown) {
    return ReactModule.createElement(
      "WnaBaseScreen",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  };
});

jest.mock("@components/screens/useWnaScrollY", () => ({
  useWnaScrollY: () => ({
    scrollY: { value: 0 },
    onScroll: () => undefined,
  }),
}));

jest.mock("@components/cards/WnaListCardWhiteDecent", () => {
  const ReactModule = require("react") as typeof import("react");

  return function MockCard(props: unknown) {
    return ReactModule.createElement(
      "WnaListCardWhiteDecent",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  };
});

jest.mock("@components/welcome/WnaWelcomeCard", () => {
  const ReactModule = require("react") as typeof import("react");
  return function MockWelcomeCard(props: unknown) {
    return ReactModule.createElement(
      "WnaWelcomeCard",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/welcome/WnaProjectsCard", () => {
  const ReactModule = require("react") as typeof import("react");
  return function MockProjectsCard(props: unknown) {
    return ReactModule.createElement(
      "WnaProjectsCard",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/welcome/WnaExperienceCard", () => {
  const ReactModule = require("react") as typeof import("react");
  return function MockExperienceCard(props: unknown) {
    return ReactModule.createElement(
      "WnaExperienceCard",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/screens/WnaContactFooter", () => {
  const ReactModule = require("react") as typeof import("react");
  return function MockContactFooter(props: unknown) {
    return ReactModule.createElement(
      "WnaContactFooter",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("react-native-reanimated", () => {
  const ReactModule = require("react") as typeof import("react");

  return {
    __esModule: true,
    default: {
      ScrollView: ReactModule.forwardRef((props: unknown, ref: unknown) => {
        if (ref && typeof ref === "object") {
          (ref as { current?: unknown }).current = { scrollTo: mockScrollTo };
        }

        return ReactModule.createElement(
          "AnimatedScrollView",
          props as Record<string, unknown>,
        );
      }),
    },
  };
});

describe("WnaHomeRoute", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockScrollTo.mockClear();
    const { defaultAppData } = jest.requireActual(
      "@/app-data",
    ) as typeof import("@/app-data");

    const appContext = jest.requireMock("@components/WnaAppContext") as {
      useWnaAppData: jest.Mock;
      useWnaLayout: jest.Mock;
      useWnaTheme: jest.Mock;
    };

    appContext.useWnaTheme.mockReturnValue({
      appColors: {},
      appStyle: {
        containerCenterMaxWidth: {},
      },
    });
    appContext.useWnaAppData.mockReturnValue({ appData: defaultAppData });
    appContext.useWnaLayout.mockReturnValue({
      appLayout: {
        contentPaddingBottom: 16,
        contentListPaddingTop: 16,
        scrollEventThrottle: 16,
      },
    });
  });

  it("scrolls to the top when the header title is pressed", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaHomeRoute />);
    });

    const baseScreen = tree!.root.findByType("WnaBaseScreen");

    act(() => {
      baseScreen.props.onTitlePress();
    });

    expect(mockScrollTo).toHaveBeenCalledWith({ y: 0, animated: true });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("renders experience before private projects on the home route", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaHomeRoute />);
    });

    const renderedSections = tree!.root
      .findAll(
        (node: RenderedNode) =>
          typeof node.type === "string" &&
          (node.type === "WnaWelcomeCard" ||
            node.type === "WnaExperienceCard" ||
            node.type === "WnaProjectsCard"),
      )
      .map((node: RenderedNode) => node.type);

    expect(renderedSections).toEqual([
      "WnaWelcomeCard",
      "WnaExperienceCard",
      "WnaProjectsCard",
    ]);
  });

  it("navigates to the experience route from the home teaser", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaHomeRoute />);
    });

    const experiencePreview = tree!.root.findByType("WnaExperienceCard");

    act(() => {
      experiencePreview.props.onFooterActionPress();
    });

    expect(mockPush).toHaveBeenCalledWith("/(drawer)/(tabs-de)/taetigkeiten");
  });
});
