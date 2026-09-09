import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { WnaBlurView } from "@components/effects/WnaBlurView";

jest.mock("expo-blur", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return {
    BlurView: (props: unknown) =>
      createElement(
        "BlurView",
        props as Record<string, unknown>,
        (props as { children?: React.ReactNode }).children,
      ),
  };
});

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

    const blur = tree!.root.findByType("BlurView");
    const view = tree!.root.findByType("View");

    expect(blur.props.experimentalBlurMethod).toBe("dimezisBlurView");
    expect(blur.props.intensity).toBe(64);
    expect(view.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: "rgba(18,52,86,0.25)" }),
      ]),
    );
  });
});
