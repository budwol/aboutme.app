import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import TestRenderer, { act } from "react-test-renderer";
import WnaExperienceDetailsBox from "@components/sections/WnaExperienceSection/WnaExperienceDetailsBox";
import {
  detailsHeightBuffer,
  detailsTopSpacing,
} from "@components/sections/WnaExperienceSection/wnaExperienceSectionStyles";

type ResizeObserverEntryLike = {
  target: { offsetHeight: number };
  contentRect: { height: number };
};
type ResizeObserverCallbackLike = (entries: ResizeObserverEntryLike[]) => void;

let resizeObserverCallback: ResizeObserverCallbackLike | undefined;

class MockResizeObserver {
  constructor(callback: ResizeObserverCallbackLike) {
    resizeObserverCallback = callback;
  }
  observe() {}
  disconnect() {}
}

// Simulates the browser reporting a resize on the observed node. Carries
// both fields a real ResizeObserverEntry has, with a smaller contentRect
// (content box only) than target.offsetHeight (border box, including
// styles.detailsBox's own padding/border) -- exactly the gap that caused
// the real clipping bug this file guards against.
function emitResize(borderBoxHeight: number, contentBoxHeight: number) {
  resizeObserverCallback?.([
    {
      target: { offsetHeight: borderBoxHeight },
      contentRect: { height: contentBoxHeight },
    },
  ]);
}

function findDetailsClip(tree: ReturnType<typeof TestRenderer.create>) {
  return tree.root.find(
    (node: { props: { id?: string } }) =>
      typeof node.props.id === "string" &&
      node.props.id.startsWith("wna-experience-details-"),
  );
}

describe("WnaExperienceDetailsBox", () => {
  beforeEach(() => {
    resizeObserverCallback = undefined;
    (global as { ResizeObserver?: unknown }).ResizeObserver =
      MockResizeObserver;
  });

  it("stays fully collapsed regardless of the measured content size", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaExperienceDetailsBox
          isExpanded={false}
          backgroundColor="#fff"
          borderColor="#ddd"
        >
          <span>detail</span>
        </WnaExperienceDetailsBox>,
        { createNodeMock: () => ({ offsetHeight: 122 }) },
      );
    });

    act(() => {
      emitResize(122, 96);
    });

    expect(
      (findDetailsClip(tree!).props.style as { height?: number }).height,
    ).toBe(0);
  });

  it("measures the observed node's border-box height, not just its content box", () => {
    // Regression test for the real clipping bug: styles.detailsBox has
    // 12px padding and a 1px border on every side (26px total) that
    // ResizeObserverEntry.contentRect.height excludes -- using contentRect
    // here under-sized the clip wrapper by exactly that much, cutting the
    // bottom of the expanded box off. target.offsetHeight is the box's
    // real, on-screen footprint and must be what drives the clip height.
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaExperienceDetailsBox
          isExpanded
          backgroundColor="#fff"
          borderColor="#ddd"
        >
          <span>detail</span>
        </WnaExperienceDetailsBox>,
        { createNodeMock: () => ({ offsetHeight: 122 }) },
      );
    });

    // contentRect (96) is deliberately smaller than target.offsetHeight
    // (122, the real observed node's border-box) -- this is the exact
    // 300px card width repro from the live bug (padding 12 + 12, border
    // 1 + 1 = 26px difference between the two).
    act(() => {
      emitResize(122, 96);
    });

    expect(
      (findDetailsClip(tree!).props.style as { height?: number }).height,
    ).toBe(122 + detailsTopSpacing + detailsHeightBuffer);
  });

  it("re-measures and grows the clip height when the content changes size again", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaExperienceDetailsBox
          isExpanded
          backgroundColor="#fff"
          borderColor="#ddd"
        >
          <span>detail</span>
        </WnaExperienceDetailsBox>,
        { createNodeMock: () => ({ offsetHeight: 96 }) },
      );
    });

    act(() => {
      emitResize(96, 80);
    });

    expect(
      (findDetailsClip(tree!).props.style as { height?: number }).height,
    ).toBe(96 + detailsTopSpacing + detailsHeightBuffer);

    act(() => {
      emitResize(150, 120);
    });

    expect(
      (findDetailsClip(tree!).props.style as { height?: number }).height,
    ).toBe(150 + detailsTopSpacing + detailsHeightBuffer);
  });

  it("does not re-render when the measured height is unchanged", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaExperienceDetailsBox
          isExpanded
          backgroundColor="#fff"
          borderColor="#ddd"
        >
          <span>detail</span>
        </WnaExperienceDetailsBox>,
        { createNodeMock: () => ({ offsetHeight: 96 }) },
      );
    });

    act(() => {
      emitResize(96, 80);
    });
    const heightAfterFirstEmit = (
      findDetailsClip(tree!).props.style as { height?: number }
    ).height;

    act(() => {
      emitResize(96, 80);
    });

    expect(
      (findDetailsClip(tree!).props.style as { height?: number }).height,
    ).toBe(heightAfterFirstEmit);
  });

  it("collapses back to 0 without waiting for a re-measurement", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaExperienceDetailsBox
          isExpanded
          backgroundColor="#fff"
          borderColor="#ddd"
        >
          <span>detail</span>
        </WnaExperienceDetailsBox>,
        { createNodeMock: () => ({ offsetHeight: 122 }) },
      );
    });

    act(() => {
      emitResize(122, 96);
    });
    expect(
      (findDetailsClip(tree!).props.style as { height?: number }).height,
    ).toBe(122 + detailsTopSpacing + detailsHeightBuffer);

    act(() => {
      tree!.update(
        <WnaExperienceDetailsBox
          isExpanded={false}
          backgroundColor="#fff"
          borderColor="#ddd"
        >
          <span>detail</span>
        </WnaExperienceDetailsBox>,
      );
    });

    expect(
      (findDetailsClip(tree!).props.style as { height?: number }).height,
    ).toBe(0);
  });

  it("clips at 0 height (plus spacing/buffer) when ResizeObserver is unavailable", () => {
    delete (global as { ResizeObserver?: unknown }).ResizeObserver;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaExperienceDetailsBox
          isExpanded
          backgroundColor="#fff"
          borderColor="#ddd"
        >
          <span>detail</span>
        </WnaExperienceDetailsBox>,
        { createNodeMock: () => ({ offsetHeight: 122 }) },
      );
    });

    expect(
      (findDetailsClip(tree!).props.style as { height?: number }).height,
    ).toBe(detailsTopSpacing + detailsHeightBuffer);
  });

  it("stops observing on unmount", () => {
    const disconnectSpy = jest.spyOn(
      MockResizeObserver.prototype,
      "disconnect",
    );
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaExperienceDetailsBox
          isExpanded
          backgroundColor="#fff"
          borderColor="#ddd"
        >
          <span>detail</span>
        </WnaExperienceDetailsBox>,
        { createNodeMock: () => ({ offsetHeight: 122 }) },
      );
    });

    act(() => {
      tree!.unmount();
    });

    expect(disconnectSpy).toHaveBeenCalledTimes(1);
    disconnectSpy.mockRestore();
  });

  it("renders its children inside the measured box", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaExperienceDetailsBox
          isExpanded
          backgroundColor="#fff"
          borderColor="#ddd"
        >
          <span>hello detail</span>
        </WnaExperienceDetailsBox>,
        { createNodeMock: () => ({ offsetHeight: 40 }) },
      );
    });

    expect(tree!.root.findByType("span").props.children).toBe("hello detail");
  });

  it("applies the given border and background color to the measured box", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaExperienceDetailsBox
          isExpanded
          backgroundColor="rgba(1, 2, 3, 0.5)"
          borderColor="#abcabc"
        >
          <span>detail</span>
        </WnaExperienceDetailsBox>,
        { createNodeMock: () => ({ offsetHeight: 40 }) },
      );
    });

    const box = tree!.root.findByType("span").parent!;
    expect(box.props.style).toEqual(
      expect.objectContaining({
        borderColor: "#abcabc",
        backgroundColor: "rgba(1, 2, 3, 0.5)",
      }),
    );
  });
});
