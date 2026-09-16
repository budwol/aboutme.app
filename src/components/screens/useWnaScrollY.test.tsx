import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { useWnaScrollY } from "@components/screens/useWnaScrollY";
import { saveScrollY } from "@/navigation/router/wnaRouter";

type MockNode = {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
};

type ResizeObserverCallbackLike = () => void;

let resizeObserverCallback: ResizeObserverCallbackLike | undefined;
let resizeObserverDisconnect: jest.Mock;

class MockResizeObserver {
  constructor(callback: ResizeObserverCallbackLike) {
    resizeObserverCallback = callback;
  }
  observe() {}
  disconnect() {
    resizeObserverDisconnect();
    // A real ResizeObserver never invokes its callback again after
    // disconnect() -- clearing this mirrors that so a test manually
    // firing the captured callback afterward is a no-op too.
    resizeObserverCallback = undefined;
  }
}

function ScrollProbe({
  onValue,
  attachRef = true,
}: {
  onValue: (value: ReturnType<typeof useWnaScrollY>) => void;
  attachRef?: boolean;
}) {
  const value = useWnaScrollY();
  onValue(value);

  return React.createElement(
    "div",
    attachRef ? { ref: value.scrollContainerRef } : {},
  );
}

function renderProbe(nodeMock: object, attachRef = true) {
  // A plain `let` reassigned from onValue only ever reflects the render
  // that happened to run last before it was read -- onScroll() below
  // triggers a re-render, so callers need this box's *current* value at
  // read time, not whatever was returned by the initial render.
  const box: { current?: ReturnType<typeof useWnaScrollY> } = {};

  act(() => {
    TestRenderer.create(
      <ScrollProbe
        onValue={(value) => (box.current = value)}
        attachRef={attachRef}
      />,
      { createNodeMock: () => nodeMock },
    );
  });

  return {
    get current() {
      return box.current!;
    },
  };
}

describe("useWnaScrollY", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
    delete (global as { ResizeObserver?: unknown }).ResizeObserver;
    resizeObserverCallback = undefined;
    resizeObserverDisconnect = jest.fn();
  });

  it("updates the scroll value from browser scroll events", () => {
    const probe = renderProbe({ scrollTop: 0 });

    act(() => {
      probe.current.onScroll({
        currentTarget: { scrollTop: 42 },
      } as never);
    });

    expect(probe.current.scrollY).toBe(42);
  });

  it("saves the scroll position under the current pathname as the user scrolls", () => {
    // Regression test: every route mounts a fresh scroll container (see
    // wnaRouteTable.ts), so nothing else remembers where the user was --
    // without this, navigating away and back (e.g. via the browser's back
    // button) always lands scrolled to the top.
    window.history.replaceState(null, "", "/menu");
    const probe = renderProbe({ scrollTop: 0 });

    act(() => {
      probe.current.onScroll({
        currentTarget: { scrollTop: 77 },
      } as never);
    });

    const remounted = renderProbe({
      scrollTop: 0,
      scrollHeight: 1000,
      clientHeight: 400,
    });
    expect(
      (remounted.current.scrollContainerRef.current as unknown as MockNode)
        .scrollTop,
    ).toBe(77);
  });

  it("does not touch the container's scrollTop when nothing was saved for this path", () => {
    window.history.replaceState(null, "", "/nothing-saved-here");
    const nodeMock: MockNode = {
      scrollTop: 0,
      scrollHeight: 0,
      clientHeight: 0,
    };

    renderProbe(nodeMock);

    expect(nodeMock.scrollTop).toBe(0);
  });

  it("restores immediately when the container is already tall enough", () => {
    window.history.replaceState(null, "", "/projects");
    saveScrollY("/projects", 240);
    const nodeMock: MockNode = {
      scrollTop: 0,
      scrollHeight: 1000,
      clientHeight: 400,
    };

    renderProbe(nodeMock);

    expect(nodeMock.scrollTop).toBe(240);
  });

  it("keeps retrying via ResizeObserver until the container grows enough to reach the target, then stops", () => {
    // Regression test: some screens defer part of their content for
    // performance (see WnaHomeRoute's showDeferredSections), so the
    // container can still be too short to reach the saved position at
    // mount time -- the browser silently clamps scrollTop back to
    // whatever's actually reachable. Without retrying once the content
    // has grown in, "back" always lands scrolled to the top on those
    // screens specifically.
    (global as { ResizeObserver?: unknown }).ResizeObserver =
      MockResizeObserver;
    window.history.replaceState(null, "", "/projects");
    saveScrollY("/projects", 240);
    const nodeMock: MockNode = {
      scrollTop: 0,
      scrollHeight: 100,
      clientHeight: 100,
    };

    renderProbe(nodeMock);

    // Not reachable yet (100 - 100 = 0 < 240) -- simulate the browser
    // having clamped the optimistic initial set back down.
    nodeMock.scrollTop = 0;

    nodeMock.scrollHeight = 500;
    act(() => {
      resizeObserverCallback?.();
    });
    expect(nodeMock.scrollTop).toBe(240);
    expect(resizeObserverDisconnect).toHaveBeenCalledTimes(1);

    // Once the target was reached, further growth (or the user's own
    // scrolling) must never be overridden again.
    nodeMock.scrollTop = 10;
    nodeMock.scrollHeight = 800;
    act(() => {
      resizeObserverCallback?.();
    });
    expect(nodeMock.scrollTop).toBe(10);
  });

  it("stops watching for growth if the screen unmounts before the target becomes reachable", () => {
    (global as { ResizeObserver?: unknown }).ResizeObserver =
      MockResizeObserver;
    window.history.replaceState(null, "", "/projects");
    saveScrollY("/projects", 240);
    const nodeMock: MockNode = {
      scrollTop: 0,
      scrollHeight: 100,
      clientHeight: 100,
    };
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<ScrollProbe onValue={() => {}} />, {
        createNodeMock: () => nodeMock,
      });
    });

    act(() => {
      tree!.unmount();
    });

    expect(resizeObserverDisconnect).toHaveBeenCalledTimes(1);
  });

  it("does nothing further when ResizeObserver is unavailable and the target isn't reachable yet", () => {
    window.history.replaceState(null, "", "/projects");
    saveScrollY("/projects", 240);
    const nodeMock: MockNode = {
      scrollTop: 0,
      scrollHeight: 100,
      clientHeight: 100,
    };

    expect(() => renderProbe(nodeMock)).not.toThrow();
  });

  it("does nothing when the scroll container ref was never attached", () => {
    window.history.replaceState(null, "", "/projects");
    saveScrollY("/projects", 240);

    expect(() => renderProbe({}, false)).not.toThrow();
  });
});
