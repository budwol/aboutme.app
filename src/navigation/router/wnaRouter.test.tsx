/**
 * @jest-environment jsdom
 */
import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import {
  registerRoutePreloader,
  router,
  useWnaPathname,
} from "@/navigation/router/wnaRouter";

function PathnameProbe({ onValue }: { onValue: (value: string) => void }) {
  onValue(useWnaPathname());
  return React.createElement("PathnameProbe");
}

function renderProbe() {
  let value = "";

  act(() => {
    TestRenderer.create(<PathnameProbe onValue={(v) => (value = v)} />);
  });

  return () => value;
}

describe("wnaRouter", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("reflects the current pathname on mount", () => {
    window.history.replaceState(null, "", "/menu");
    const getValue = renderProbe();

    expect(getValue()).toBe("/menu");
  });

  it("updates the pathname on push and marks canGoBack true", () => {
    const getValue = renderProbe();

    act(() => {
      router.push("/menu/privacy");
    });

    expect(getValue()).toBe("/menu/privacy");
    expect(router.canGoBack()).toBe(true);
  });

  it("updates the pathname on replace without enabling canGoBack", () => {
    const getValue = renderProbe();

    act(() => {
      router.replace("/projects");
    });

    expect(getValue()).toBe("/projects");
    expect(router.canGoBack()).toBe(false);
  });

  it("preserves canGoBack across a replace that follows a push", () => {
    const getValue = renderProbe();

    act(() => {
      router.push("/menu");
    });
    expect(router.canGoBack()).toBe(true);

    act(() => {
      router.replace("/menu/privacy");
    });

    expect(getValue()).toBe("/menu/privacy");
    expect(router.canGoBack()).toBe(true);
  });

  it("navigate behaves like push", () => {
    const getValue = renderProbe();

    act(() => {
      router.navigate("/experience");
    });

    expect(getValue()).toBe("/experience");
  });

  it("replaces with the fallback href when there is nothing to go back to", () => {
    const getValue = renderProbe();

    act(() => {
      router.back("/menu");
    });

    expect(getValue()).toBe("/menu");
  });

  it("does nothing on back() without a fallback when there is no history", () => {
    const getValue = renderProbe();

    act(() => {
      router.back();
    });

    expect(getValue()).toBe("/");
  });

  it("delegates to window.history.back() when canGoBack is true", () => {
    const backSpy = jest
      .spyOn(window.history, "back")
      .mockImplementation(() => {});

    act(() => {
      router.push("/menu");
    });

    act(() => {
      router.back("/fallback");
    });

    expect(backSpy).toHaveBeenCalledTimes(1);
    backSpy.mockRestore();
  });

  it("updates the pathname on a real browser popstate event", () => {
    const getValue = renderProbe();

    act(() => {
      router.push("/contact");
    });
    expect(getValue()).toBe("/contact");

    act(() => {
      window.history.replaceState(null, "", "/");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(getValue()).toBe("/");
  });

  it("is a no-op during server rendering, when window is unavailable", () => {
    const originalWindow = global.window;
    // @ts-expect-error simulating a server-rendering environment
    delete global.window;

    try {
      let tree: ReturnType<typeof TestRenderer.create> | undefined;

      act(() => {
        tree = TestRenderer.create(<PathnameProbe onValue={() => {}} />);
      });

      expect(() => router.push("/menu")).not.toThrow();
      expect(() => router.replace("/menu")).not.toThrow();
      expect(router.canGoBack()).toBe(false);

      act(() => {
        tree!.unmount();
      });
    } finally {
      Object.defineProperty(global, "window", {
        configurable: true,
        value: originalWindow,
      });
    }
  });

  it("resolves immediately when no route preloader has been registered", async () => {
    // The real router singleton always sets preload (see the router
    // object below) -- it's optional only on the WnaRouter type, for
    // test doubles that don't need it.
    await expect(router.preload!("/anything")).resolves.toBeUndefined();
  });

  it("delegates preload() to whatever was registered", async () => {
    // WnaRoutes.tsx registers the real route table's preloader this way
    // instead of this module importing it directly, which would pull
    // every screen component into wnaRouter.ts's graph (see WnaRoutes.tsx
    // for why that would circle back into useWnaNavigationTransition.ts).
    const preloadImpl = jest.fn(() => Promise.resolve("loaded"));
    registerRoutePreloader(preloadImpl);

    await expect(router.preload!("/menu")).resolves.toBe("loaded");
    expect(preloadImpl).toHaveBeenCalledWith("/menu");
  });

  it("removes its popstate listener on unmount", () => {
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<PathnameProbe onValue={() => {}} />);
    });

    act(() => {
      tree!.unmount();
    });

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "popstate",
      expect.any(Function),
    );
    removeEventListenerSpy.mockRestore();
  });
});
