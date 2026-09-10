import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import {
  useWnaAppData,
  useWnaAppLifecycle,
  useWnaLayout,
  useWnaTheme,
  WnaAppContextProvider,
} from "@components/WnaAppContext";
import { themePalettes } from "@constants/themePalettes";

function ContextProbe({ onValue }: { onValue: (value: unknown) => void }) {
  const lifecycle = useWnaAppLifecycle();
  const layout = useWnaLayout();
  const theme = useWnaTheme();
  const data = useWnaAppData();

  onValue({ lifecycle, layout, theme, data });

  return React.createElement("ContextProbe");
}

function LifecycleProbe({
  onValue,
}: {
  onValue: (value: ReturnType<typeof useWnaAppLifecycle>) => void;
}) {
  const lifecycle = useWnaAppLifecycle();
  onValue(lifecycle);

  return React.createElement("LifecycleProbe");
}

describe("WnaAppContext", () => {
  it("throws a clear error when a hook is used outside the provider", () => {
    function BrokenProbe() {
      useWnaTheme();
      return null;
    }

    expect(() => {
      act(() => {
        TestRenderer.create(<BrokenProbe />);
      });
    }).toThrow("useWnaTheme must be used within WnaAppContextProvider");
  });

  it("provides lifecycle, layout, theme and app data state", () => {
    let captured: {
      lifecycle: ReturnType<typeof useWnaAppLifecycle>;
      layout: ReturnType<typeof useWnaLayout>;
      theme: ReturnType<typeof useWnaTheme>;
      data: ReturnType<typeof useWnaAppData>;
    } | null = null;

    act(() => {
      TestRenderer.create(
        <WnaAppContextProvider>
          <ContextProbe onValue={(value) => (captured = value as never)} />
        </WnaAppContextProvider>,
      );
    });

    expect(captured!.lifecycle.isAppInitialized).toBe(false);
    expect(captured!.lifecycle.isStatusBarVisible).toBe(true);
    expect(captured!.layout.appLayout).toBeDefined();
    expect(captured!.layout.currentWindowWidth).toBeGreaterThan(0);
    expect(captured!.theme.theme).toBe("system");
    expect(captured!.theme.appColors).toBe(themePalettes.light);
    expect(captured!.data.appData).toBeDefined();

    act(() => {
      captured!.lifecycle.setIsAppInitialized(true);
      captured!.lifecycle.setIsStatusBarVisible(false);
      captured!.theme.setTheme("dark");
      captured!.theme.setAppColors(themePalettes.dark);
      captured!.data.setAppData({ profile: { name: "WNA" } } as never);
      captured!.layout.setDimensions();
    });

    expect(captured!.lifecycle.isAppInitialized).toBe(true);
    expect(captured!.lifecycle.isStatusBarVisible).toBe(false);
    expect(captured!.theme.theme).toBe("dark");
    expect(captured!.theme.appColors).toBe(themePalettes.dark);
    expect(captured!.data.appData).toEqual({ profile: { name: "WNA" } });
  });

  it("guards concurrent navigation transitions and clears them on finish", () => {
    jest.useFakeTimers();
    const action = jest.fn();
    let lifecycle: ReturnType<typeof useWnaAppLifecycle> | null = null;

    act(() => {
      TestRenderer.create(
        <WnaAppContextProvider>
          <LifecycleProbe onValue={(value) => (lifecycle = value)} />
        </WnaAppContextProvider>,
      );
    });

    act(() => {
      lifecycle!.startNavigationTransition(action);
    });

    expect(lifecycle!.isNavigationTransitionActive).toBe(true);

    act(() => {
      lifecycle!.startNavigationTransition(action);
      jest.runOnlyPendingTimers();
    });

    expect(action).toHaveBeenCalledTimes(1);

    act(() => {
      lifecycle!.finishNavigationTransition();
    });

    expect(lifecycle!.isNavigationTransitionActive).toBe(false);
    jest.useRealTimers();
  });

  it("restarts the pending timer when triggered twice within the same tick", () => {
    jest.useFakeTimers();
    const action = jest.fn();
    let lifecycle: ReturnType<typeof useWnaAppLifecycle> | null = null;

    act(() => {
      TestRenderer.create(
        <WnaAppContextProvider>
          <LifecycleProbe onValue={(value) => (lifecycle = value)} />
        </WnaAppContextProvider>,
      );
    });

    act(() => {
      lifecycle!.startNavigationTransition(action);
      lifecycle!.startNavigationTransition(action);
    });

    expect(jest.getTimerCount()).toBe(1);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(action).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it("clears the pending timer when finishing before it fires", () => {
    jest.useFakeTimers();
    const action = jest.fn();
    let lifecycle: ReturnType<typeof useWnaAppLifecycle> | null = null;

    act(() => {
      TestRenderer.create(
        <WnaAppContextProvider>
          <LifecycleProbe onValue={(value) => (lifecycle = value)} />
        </WnaAppContextProvider>,
      );
    });

    act(() => {
      lifecycle!.startNavigationTransition(action);
    });

    act(() => {
      lifecycle!.finishNavigationTransition();
    });

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(action).not.toHaveBeenCalled();
    expect(lifecycle!.isNavigationTransitionActive).toBe(false);
    jest.useRealTimers();
  });

  it("clears the pending navigation timer on unmount", () => {
    jest.useFakeTimers();
    const action = jest.fn();
    let lifecycle: ReturnType<typeof useWnaAppLifecycle> | null = null;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaAppContextProvider>
          <LifecycleProbe onValue={(value) => (lifecycle = value)} />
        </WnaAppContextProvider>,
      );
    });

    act(() => {
      lifecycle!.startNavigationTransition(action);
    });

    act(() => {
      tree!.unmount();
    });

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(action).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it("unmounts cleanly when no navigation timer is pending", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaAppContextProvider>
          <LifecycleProbe onValue={() => {}} />
        </WnaAppContextProvider>,
      );
    });

    expect(() => {
      act(() => {
        tree!.unmount();
      });
    }).not.toThrow();
  });
});
