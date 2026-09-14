import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaSurfaceCard from "@components/cards/WnaSurfaceCard";

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

const lightColors = {
  isDark: false,
  staticWhite: "#ffffff",
  staticBlack: "#000000",
  coolgray2: "#cccccc",
} as never;

const darkColors = {
  isDark: true,
  staticWhite: "#ffffff",
  staticBlack: "#000000",
  coolgray2: "#444444",
} as never;

describe("WnaSurfaceCard", () => {
  it("uses light transparent defaults for light mode", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaSurfaceCard appColors={lightColors}>child</WnaSurfaceCard>,
      );
    });

    const blur = tree!.root.findByType("WnaBlurView");
    const views = tree!.root.findAllByType("div");

    expect(blur.props.blurIntensity).toBe(100);
    expect(blur.props.blurTint).toBe("extraLight");
    expect(views[0].props.style.backgroundColor).toBe("rgba(255,255,255,0.6)");
    expect(views[1].props.style.backgroundColor).toBe("transparent");
  });

  it("applies dark standalone styling and state color", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaSurfaceCard
          appColors={darkColors}
          stateColor="#ff0000"
          type="middle"
          theme="dark"
          minHeight={80}
          overflow="visible"
        >
          child
        </WnaSurfaceCard>,
      );
    });

    const blur = tree!.root.findByType("WnaBlurView");
    const views = tree!.root.findAllByType("div");

    expect(blur.props.blurIntensity).toBe(50);
    expect(blur.props.blurTint).toBe("dark");
    expect(blur.props.style).toEqual(
      expect.objectContaining({
        borderTopWidth: 0,
        minHeight: 80,
        overflow: "visible",
      }),
    );
    expect(views[0].props.style.backgroundColor).toBe("#000000");
    expect(views[1].props.style.backgroundColor).toBe("#ff0000");
  });

  it("defaults dark mode to the transparent dark theme", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaSurfaceCard appColors={darkColors}>child</WnaSurfaceCard>,
      );
    });

    const blur = tree!.root.findByType("WnaBlurView");
    const views = tree!.root.findAllByType("div");

    expect(blur.props.blurTint).toBe("dark");
    expect(views[0].props.style.backgroundColor).toBe("rgba(0,0,0,0.1)");
  });

  it("supports explicit light and transparent dark themes", () => {
    let lightTree: ReturnType<typeof TestRenderer.create> | undefined;
    let transparentDarkTree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      lightTree = TestRenderer.create(
        <WnaSurfaceCard appColors={lightColors} theme="light" type="first">
          child
        </WnaSurfaceCard>,
      );
      transparentDarkTree = TestRenderer.create(
        <WnaSurfaceCard
          appColors={darkColors}
          theme="transparentDark"
          type="last"
        >
          child
        </WnaSurfaceCard>,
      );
    });

    expect(lightTree!.root.findByType("WnaBlurView").props.blurTint).toBe(
      "extraLight",
    );
    expect(
      lightTree!.root.findAllByType("div")[0].props.style.backgroundColor,
    ).toBe("#ffffff");
    expect(
      transparentDarkTree!.root.findByType("WnaBlurView").props.blurTint,
    ).toBe("dark");
    expect(
      transparentDarkTree!.root.findAllByType("div")[0].props.style
        .backgroundColor,
    ).toBe("rgba(0,0,0,0.1)");
  });

  it("keeps the padded content column within the card's width using border-box sizing", () => {
    // Regression test: this column combines `width: "100%"` with
    // `padding: 12` on a real DOM div. Content-box (the browser default)
    // would add the padding on top of the 100%-of-parent width, making
    // the column 24px wider than its parent card.
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaSurfaceCard appColors={lightColors}>child</WnaSurfaceCard>,
      );
    });

    const views = tree!.root.findAllByType("div");
    const contentColumn = views[2];

    expect(contentColumn.props.style).toEqual({
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box",
      padding: 12,
      marginLeft: -8,
      width: "100%",
    });
  });
});
