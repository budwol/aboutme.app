import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaImageBackground from "@components/images/WnaImageBackground";

jest.mock("@components/effects/WnaBlurView", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return {
    WnaBlurView: (props: unknown) =>
      createElement(
        "WnaBlurView",
        props as Record<string, unknown>,
        (props as { children?: React.ReactNode }).children,
      ),
  };
});

describe("WnaImageBackground", () => {
  it("renders a plain background when no image is configured", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaImageBackground appColors={{ white: "#fff" } as never} isDarkMode>
          child
        </WnaImageBackground>,
      );
    });

    expect(tree!.root.findAllByType("img")).toHaveLength(0);
    expect(tree!.root.findByType("View").props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: "#fff" }),
      ]),
    );
  });

  it("renders the versioned image and blur overlay for configured images", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaImageBackground
          appColors={{ white: "#fff" } as never}
          imageUri="images/bg.webp"
          isDarkMode={false}
        >
          child
        </WnaImageBackground>,
      );
    });

    const image = tree!.root.findByType("img");
    const blur = tree!.root.findByType("WnaBlurView");

    expect(image.props.src).toBe("images/bg.webp");
    expect(image.props["aria-hidden"]).toBe("true");
    expect(image.props.fetchPriority).toBe("high");
    expect(image.props.loading).toBe("eager");
    expect(blur.props.forceExperimentalBlur).toBe(true);
    expect(blur.props.blurTint).toBe("light");
    expect(blur.props.blurIntensity).toBe(40);
  });

  it("renders the blur overlay in dark mode", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaImageBackground
          appColors={{ white: "#fff" } as never}
          imageUri="images/bg.webp"
          isDarkMode
        >
          child
        </WnaImageBackground>,
      );
    });

    const blur = tree!.root.findByType("WnaBlurView");

    expect(blur.props.blurTint).toBe("dark");
  });
});
