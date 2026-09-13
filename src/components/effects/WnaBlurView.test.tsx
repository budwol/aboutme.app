import { describe, expect, it } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { WnaBlurView } from "@components/effects/WnaBlurView";

describe("WnaBlurView", () => {
  it("renders a fallback view with dark tint defaults", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaBlurView blurTint="dark" style={{ padding: 4 }}>
          child
        </WnaBlurView>,
      );
    });

    const view = tree!.root.findByType("View");

    expect(view.props.style).toEqual(
      expect.arrayContaining([
        { padding: 4 },
        expect.objectContaining({ backgroundColor: "rgba(17,17,17,0.5)" }),
      ]),
    );
  });

  it("renders an experimental blur wrapper and respects overrides", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaBlurView
          blurTint="extraLight"
          forceExperimentalBlur
          isBackground
          backgroundColor="#123456"
          backgroundOpacity={0.25}
          blurIntensity={64}
        >
          child
        </WnaBlurView>,
      );
    });

    const views = tree!.root.findAllByType("View");
    const blur = views[0];
    const view = views[1];

    expect(blur.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }),
      ]),
    );
    expect(view.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: "rgba(18,52,86,0.25)" }),
      ]),
    );
  });

  it("defaults the tint to dark when none is given", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaBlurView blurTint={undefined as unknown as "dark"}>
          child
        </WnaBlurView>,
      );
    });

    const view = tree!.root.findByType("View");

    expect(view.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: "rgba(17,17,17,0.5)" }),
      ]),
    );
  });

  it("uses a light background and lower opacity for non-dark, non-default tints", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaBlurView blurTint="light">child</WnaBlurView>,
      );
    });

    const view = tree!.root.findByType("View");

    expect(view.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: "rgba(255,255,255,0.8)" }),
      ]),
    );
  });
});
