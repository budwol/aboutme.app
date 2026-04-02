import { appLayoutConstants } from "@/constants/layoutConstants";
import { appMotionConstants } from "@/constants/motionConstants";
import { testAppData } from "@/app-data/testAppData";
import {
  useWnaAppData,
  useWnaAppLifecycle,
  useWnaLayout,
  useWnaTheme,
} from "@components/WnaAppContext";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import React from "react";
import { act } from "react-test-renderer";
import { mockDimensions } from "../../helpers/mockDimensions";
import { renderWithAppContext } from "../../helpers/renderWithAppContext";

function ContextProbe() {
  const { appData } = useWnaAppData();
  const {
    finishNavigationTransition,
    isAppInitialized,
    isNavigationTransitionActive,
    startNavigationTransition,
  } = useWnaAppLifecycle();
  const { appLayout, isLandscape, setDimensions } = useWnaLayout();
  const { theme } = useWnaTheme();

  return React.createElement("ContextProbe", {
    appDataName: appData.profile.name,
    appLayout,
    finishNavigationTransition,
    isAppInitialized,
    isLandscape,
    isNavigationTransitionActive,
    setDimensions,
    startNavigationTransition,
    theme,
  });
}

describe("WnaAppContextProvider integration", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("hydrates seeded app data and updates layout when the dimensions change", async () => {
    const dimensionsSpy = mockDimensions(390, 844);
    const tree = await renderWithAppContext(<ContextProbe />);

    let probe = tree.root.findByType("ContextProbe");

    expect(probe.props.appDataName).toBe(testAppData.profile.name);
    expect(probe.props.isAppInitialized).toBe(true);
    expect(probe.props.isLandscape).toBe(false);
    expect(probe.props.appLayout.headerHeight).toBe(
      appLayoutConstants.headerButtonHeight,
    );
    expect(probe.props.theme).toBe("system");

    dimensionsSpy.mockImplementation(() => ({
      width: 1280,
      height: 800,
      scale: 1,
      fontScale: 1,
    }));

    await act(async () => {
      probe.props.setDimensions();
    });

    probe = tree.root.findByType("ContextProbe");

    expect(probe.props.isLandscape).toBe(true);
    expect(probe.props.appLayout.headerHeight).toBe(
      appLayoutConstants.headerHeightWeb,
    );
  });

  it("delays navigation actions through the lifecycle transition helper", async () => {
    mockDimensions(1280, 800);
    const tree = await renderWithAppContext(<ContextProbe />);
    const probe = tree.root.findByType("ContextProbe");
    const action = jest.fn();

    await act(async () => {
      probe.props.startNavigationTransition(action);
    });

    expect(
      tree.root.findByType("ContextProbe").props.isNavigationTransitionActive,
    ).toBe(true);
    expect(action).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(appMotionConstants.navigationTransitionDelay);
    });

    expect(action).toHaveBeenCalledTimes(1);

    await act(async () => {
      tree.root.findByType("ContextProbe").props.finishNavigationTransition();
    });

    expect(
      tree.root.findByType("ContextProbe").props.isNavigationTransitionActive,
    ).toBe(false);
  });
});
