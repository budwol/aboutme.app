import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { Router } from "expo-router";
import { useWnaNavigationTransition } from "@/navigation/hooks/useWnaNavigationTransition";

const mockUseWnaAppLifecycle = jest.fn();

jest.mock("@components/WnaAppContext", () => ({
  useWnaAppLifecycle: (...args: unknown[]) => mockUseWnaAppLifecycle(...args),
}));

function Probe({
  router,
  onValue,
}: {
  router: Router;
  onValue: (value: ReturnType<typeof useWnaNavigationTransition>) => void;
}) {
  const value = useWnaNavigationTransition(router);
  onValue(value);

  return React.createElement("Probe");
}

function createRouter() {
  return {
    push: jest.fn(),
    replace: jest.fn(),
    navigate: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => false),
  } as unknown as Router;
}

function renderHook(router: Router) {
  let controller: ReturnType<typeof useWnaNavigationTransition> | undefined;

  act(() => {
    TestRenderer.create(
      <Probe router={router} onValue={(value) => (controller = value)} />,
    );
  });

  return controller!;
}

describe("useWnaNavigationTransition", () => {
  it("skips the action entirely while a transition is already active", () => {
    mockUseWnaAppLifecycle.mockReturnValue({
      isNavigationTransitionActive: true,
      startNavigationTransition: jest.fn(),
    });
    const router = createRouter();

    const controller = renderHook(router);
    act(() => controller.push("/home" as never));

    expect(router.push).not.toHaveBeenCalled();
  });

  it("runs the action directly when no transition starter is available", () => {
    mockUseWnaAppLifecycle.mockReturnValue({
      isNavigationTransitionActive: false,
    });
    const router = createRouter();

    const controller = renderHook(router);
    act(() => controller.push("/home" as never));

    expect(router.push).toHaveBeenCalledWith("/home");
  });

  it("defers the action to the transition starter when available", () => {
    const startNavigationTransition = jest.fn((action: () => void) => action());
    mockUseWnaAppLifecycle.mockReturnValue({
      isNavigationTransitionActive: false,
      startNavigationTransition,
    });
    const router = createRouter();

    const controller = renderHook(router);
    act(() => controller.replace("/menu" as never));

    expect(startNavigationTransition).toHaveBeenCalledWith(
      expect.any(Function),
    );
    expect(router.replace).toHaveBeenCalledWith("/menu");
  });

  it("navigates directly when the router can go back", () => {
    mockUseWnaAppLifecycle.mockReturnValue({
      isNavigationTransitionActive: false,
    });
    const router = createRouter();
    (router.canGoBack as jest.Mock<() => boolean>).mockReturnValue(true);

    const controller = renderHook(router);
    act(() => controller.back());

    expect(router.back).toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("falls back to the provided href when the router cannot go back", () => {
    mockUseWnaAppLifecycle.mockReturnValue({
      isNavigationTransitionActive: false,
    });
    const router = createRouter();

    const controller = renderHook(router);
    act(() => controller.back("/fallback" as never));

    expect(router.back).not.toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith("/fallback");
  });

  it("does nothing when the router cannot go back and no fallback is given", () => {
    mockUseWnaAppLifecycle.mockReturnValue({
      isNavigationTransitionActive: false,
    });
    const router = createRouter();

    const controller = renderHook(router);
    act(() => controller.back());

    expect(router.back).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("also exposes a working navigate() helper", () => {
    mockUseWnaAppLifecycle.mockReturnValue({
      isNavigationTransitionActive: false,
    });
    const router = createRouter();

    const controller = renderHook(router);
    act(() => controller.navigate("/projects" as never));

    expect(router.navigate).toHaveBeenCalledWith("/projects");
  });
});
