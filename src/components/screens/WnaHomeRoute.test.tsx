/* eslint-disable @typescript-eslint/no-require-imports */
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import WnaHomeRoute from "@components/screens/WnaHomeRoute";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { testAppData } from "@/app-data/testAppData";
import { createProjectSlug } from "@utils/projectRoutes";

type RenderedNode = {
  type: unknown;
};

const mockPush = jest.fn();
const mockScrollTo = jest.fn();
const mockRequestAnimationFrame =
  jest.fn<(callback: FrameRequestCallback) => number>();
const mockCancelAnimationFrame = jest.fn();

function renderHomeRoute(flushDeferredSections = false) {
  let tree: ReturnType<typeof TestRenderer.create> | undefined;

  act(() => {
    tree = TestRenderer.create(<WnaHomeRoute />, {
      createNodeMock: () => ({ scrollTo: mockScrollTo }),
    });
  });

  if (flushDeferredSections) {
    act(() => {
      jest.runAllTimers();
    });
  }

  return tree!;
}

jest.mock("@/state/WnaAppContext", () => {
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

jest.mock("@/i18n/i18n", () => ({
  getLangCode: () => "de",
}));

jest.mock("expo-router", () => ({
  useNavigation: () => ({}),
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/navigation/components/WnaMenuToggleButton", () => {
  const ReactModule = require("react") as typeof import("react");

  return function MockMenuHeaderRight(props: unknown) {
    return ReactModule.createElement(
      "WnaMenuToggleButton",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@/navigation/components/WnaHeaderRouteButton", () => {
  const ReactModule = require("react") as typeof import("react");

  return function MockHeaderButtonRight(props: unknown) {
    return ReactModule.createElement(
      "WnaHeaderRouteButton",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/display/WnaSeparatorHorizontal", () => {
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

const mockOnScroll = jest.fn();

jest.mock("@components/screens/useWnaScrollY", () => ({
  useWnaScrollY: () => ({
    scrollY: { value: 0 },
    onScroll: (event: unknown) => mockOnScroll(event),
  }),
}));

jest.mock("@components/cards/WnaSurfaceCard", () => {
  const ReactModule = require("react") as typeof import("react");

  return function MockCard(props: unknown) {
    return ReactModule.createElement(
      "WnaSurfaceCard",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  };
});

jest.mock("@components/sections/WnaProfileSection", () => {
  const ReactModule = require("react") as typeof import("react");
  return function MockWelcomeCard(props: unknown) {
    return ReactModule.createElement(
      "WnaProfileSection",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/sections/WnaProjectsSection", () => {
  const ReactModule = require("react") as typeof import("react");
  return function MockProjectsCard(props: unknown) {
    return ReactModule.createElement(
      "WnaProjectsSection",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/sections/WnaExperienceSection", () => {
  const ReactModule = require("react") as typeof import("react");
  return function MockExperienceCard(props: unknown) {
    return ReactModule.createElement(
      "WnaExperienceSection",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/chrome/WnaContactFooter", () => {
  const ReactModule = require("react") as typeof import("react");
  return function MockContactFooter(props: unknown) {
    return ReactModule.createElement(
      "WnaContactFooter",
      props as Record<string, unknown>,
    );
  };
});

describe("WnaHomeRoute", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockPush.mockClear();
    mockScrollTo.mockClear();
    mockRequestAnimationFrame.mockClear();
    mockCancelAnimationFrame.mockClear();
    mockRequestAnimationFrame.mockImplementation((callback) => {
      return setTimeout(() => callback(0), 0) as unknown as number;
    });
    mockCancelAnimationFrame.mockImplementation((frameId) => {
      clearTimeout(frameId as unknown as ReturnType<typeof setTimeout>);
    });
    global.requestAnimationFrame =
      mockRequestAnimationFrame as typeof requestAnimationFrame;
    global.cancelAnimationFrame =
      mockCancelAnimationFrame as typeof cancelAnimationFrame;

    const appContext = jest.requireMock("@/state/WnaAppContext") as {
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
    appContext.useWnaAppData.mockReturnValue({ appData: testAppData });
    appContext.useWnaLayout.mockReturnValue({
      appLayout: {
        contentPaddingBottom: 16,
        contentListPaddingTop: 16,
        scrollEventThrottle: 16,
      },
    });
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it("uses a name-specific browser tab title without changing the header text", () => {
    const tree = renderHomeRoute();
    const baseScreen = tree.root.findByType("WnaBaseScreen");

    expect(baseScreen.props.headerTitle).toBe("appBrand");
    expect(baseScreen.props.documentTitle).toBe(
      `appBrand - ${testAppData.profile.name}`,
    );
  });

  it("scrolls to the top when the header title is pressed", () => {
    const tree = renderHomeRoute();
    const baseScreen = tree.root.findByType("WnaBaseScreen");

    act(() => {
      baseScreen.props.onTitlePress();
    });

    expect(mockScrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("wires the scroll container's onScroll straight to the shared hook", () => {
    mockOnScroll.mockClear();
    const tree = renderHomeRoute();
    const scrollContainer = tree.root.find(
      (node: { props: { onScroll?: (event: unknown) => void } }) =>
        typeof node.props.onScroll === "function",
    );
    const event = { currentTarget: { scrollTop: 123 } };

    act(() => {
      scrollContainer.props.onScroll!(event as never);
    });

    expect(mockOnScroll).toHaveBeenCalledWith(event);
  });

  it("defer-mounts the lower home sections until after the first paint", () => {
    const tree = renderHomeRoute();

    let renderedSections = tree.root
      .findAll(
        (node: RenderedNode) =>
          typeof node.type === "string" &&
          (node.type === "WnaProfileSection" ||
            node.type === "WnaExperienceSection" ||
            node.type === "WnaProjectsSection"),
      )
      .map((node: RenderedNode) => node.type);

    expect(renderedSections).toEqual(["WnaProfileSection"]);

    act(() => {
      jest.runAllTimers();
    });

    renderedSections = tree.root
      .findAll(
        (node: RenderedNode) =>
          typeof node.type === "string" &&
          (node.type === "WnaProfileSection" ||
            node.type === "WnaExperienceSection" ||
            node.type === "WnaProjectsSection"),
      )
      .map((node: RenderedNode) => node.type);

    expect(renderedSections).toEqual([
      "WnaProfileSection",
      "WnaExperienceSection",
      "WnaProjectsSection",
    ]);
  });

  it("navigates to the experience route from the home teaser", () => {
    const tree = renderHomeRoute(true);
    const experiencePreview = tree.root.findByType("WnaExperienceSection");

    act(() => {
      experiencePreview.props.onFooterActionPress();
    });

    expect(mockPush).toHaveBeenCalledWith("/(drawer)/(tabs-de)/taetigkeiten");
  });

  it("keeps the experience details toggle enabled on the home teaser", () => {
    const tree = renderHomeRoute(true);
    const experiencePreview = tree.root.findByType("WnaExperienceSection");

    expect(experiencePreview.props.showDetails).toBeUndefined();
  });

  it("navigates to the projects route from the projects teaser action", () => {
    const tree = renderHomeRoute(true);
    const projectsCard = tree.root.findByType("WnaProjectsSection");

    act(() => {
      projectsCard.props.onShowMorePress();
    });

    expect(mockPush).toHaveBeenCalledWith("/(drawer)/(tabs-de)/projekte");
  });

  it("navigates to the project details route from the projects teaser", () => {
    const tree = renderHomeRoute(true);
    const projectsCard = tree.root.findByType("WnaProjectsSection");

    act(() => {
      projectsCard.props.onProjectPress(0);
    });

    expect(mockPush).toHaveBeenCalledWith(
      `/(drawer)/(tabs-de)/projekte/${createProjectSlug(testAppData.projects[0].title, 0)}`,
    );
  });

  it("does not navigate when the projects teaser receives an invalid project index", () => {
    const tree = renderHomeRoute(true);
    const projectsCard = tree.root.findByType("WnaProjectsSection");

    act(() => {
      projectsCard.props.onProjectPress(999);
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("does not navigate when a project index has no matching project", () => {
    const tree = renderHomeRoute(true);
    const projectsCard = tree.root.findByType("WnaProjectsSection");

    act(() => {
      projectsCard.props.onProjectPress(999);
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("cancels the pending animation frame on unmount before it fires", () => {
    const tree = renderHomeRoute();

    act(() => {
      tree.unmount();
    });

    expect(mockCancelAnimationFrame).toHaveBeenCalled();
  });

  it("does not cancel a missing animation frame on unmount", () => {
    mockRequestAnimationFrame.mockImplementationOnce(
      () => null as unknown as number,
    );

    const tree = renderHomeRoute();

    act(() => {
      tree.unmount();
    });

    expect(mockCancelAnimationFrame).not.toHaveBeenCalled();
  });

  it("clears the deferred section timeout on unmount before it fires", () => {
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
    const tree = renderHomeRoute();

    act(() => {
      jest.advanceTimersByTime(0);
    });

    clearTimeoutSpy.mockClear();

    act(() => {
      tree.unmount();
    });

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
