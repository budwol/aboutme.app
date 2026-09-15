import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaProfileHero, {
  applyHeroShapeWebStyles,
  WnaHeroField,
} from "@components/sections/WnaProfileHero";
import { testAppData } from "@/app-data/testAppData";

jest.mock("@components/images/WnaImage", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaImage(props: unknown) {
    return createElement("WnaImage", props as Record<string, unknown>);
  };
});

jest.mock("@components/images/wnaAvatarImageResolver", () => ({
  getAvatarImageSources: () => [],
}));

jest.mock("@components/display/WnaAccentBar", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaAccentBar(props: unknown) {
    return createElement("WnaAccentBar", props as Record<string, unknown>);
  };
});

describe("WnaProfileHero", () => {
  const appColorsValues = {
    white: "#ffffff",
    black: "#000000",
    accent5: "#22aa66",
    coolgray2: "#cccccc",
    coolgray8: "#222222",
    coolgray6: "#666666",
    warmgray6: "#999999",
  };
  const appColors = appColorsValues as never;

  it("renders the accent bar between name and title in the regular hero", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaProfileHero
          appColors={appColors}
          appData={testAppData}
          appStyle={
            {
              textExtraLarge: {},
              textNeutralSubtitle: {},
            } as never
          }
        />,
      );
    });

    const accentBars = tree!.root.findAllByType("WnaAccentBar");
    const texts = tree!.root.findAllByType("span");
    const textValues = texts.map(
      (node: { props: { children?: React.ReactNode } }) => node.props.children,
    );

    expect(accentBars).toHaveLength(1);
    expect(accentBars[0].props.width).toBe(112);
    expect(accentBars[0].props.pulseToWidth).toBe(24);
    expect(accentBars[0].props.pulseDuration).toBe(30000);
    expect(textValues).toEqual([
      testAppData.profile.name,
      testAppData.profile.title.toUpperCase(),
    ]);
  });

  it("keeps the avatar image at its declared size using border-box sizing", () => {
    // Regression test: this style combines a fixed `width`/`height` with
    // a `borderWidth` on the avatar image. Content-box (the browser
    // default) would render it 2px larger than `avatarSize`, breaking
    // the circular clip computed from that same size
    // (`borderRadius: avatarSize / 2`).
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaProfileHero
          appColors={appColors}
          appData={testAppData}
          appStyle={
            {
              textExtraLarge: {},
              textNeutralSubtitle: {},
            } as never
          }
        />,
      );
    });

    const avatar = tree!.root.findByType("WnaImage");

    expect(avatar.props.style).toEqual({
      width: 200,
      height: 200,
      boxSizing: "border-box",
      borderRadius: 100,
      backgroundColor: appColorsValues.white,
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: appColorsValues.coolgray2,
    });
  });

  it("renders the accent bar in the compact hero copy as well", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaProfileHero
          appColors={appColors}
          appData={testAppData}
          appStyle={
            {
              textExtraLarge: { fontFamily: "System" },
              textMicro: { fontFamily: "System" },
            } as never
          }
          compact
        />,
      );
    });

    const accentBars = tree!.root.findAllByType("WnaAccentBar");

    expect(accentBars).toHaveLength(1);
    expect(accentBars[0].props.width).toBe(112);
    expect(accentBars[0].props.pulseToWidth).toBe(24);
    expect(accentBars[0].props.pulseDuration).toBe(30000);
  });

  it("exposes the hero shape motion as CSS animation variables", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaProfileHero
          appColors={appColors}
          appData={testAppData}
          appStyle={
            {
              textExtraLarge: {},
              textNeutralSubtitle: {},
            } as never
          }
        />,
      );
    });

    const animatedShape = tree!.root
      .findAllByType("div")
      .find(
        (node: { props: { id?: string } }) =>
          node.props.id === "wna-hero-shape-0",
      );

    expect(animatedShape?.props.style).toEqual(
      expect.objectContaining({
        "--wna-hero-shape-duration": "13000ms",
        "--wna-hero-shape-start-scale": expect.any(Number),
        "--wna-hero-shape-end-scale": expect.any(Number),
        "--wna-hero-shape-start-opacity": expect.any(Number),
        "--wna-hero-shape-end-opacity": expect.any(Number),
        animation:
          "wna-hero-shape-swing-positive 13000ms ease-in-out infinite alternate",
        // Regression test: this shape combines a fixed `width`/`height`
        // with a `borderWidth` on a real DOM element. Content-box (the
        // browser default) would render it 2px larger than declared.
        boxSizing: "border-box",
      }),
    );
    expect(animatedShape?.props.className).toBe(
      "wna-hero-shape wna-hero-shape-swing-positive",
    );
    expect(animatedShape?.props.style.animation).toBe(
      "wna-hero-shape-swing-positive 13000ms ease-in-out infinite alternate",
    );

    const negativeShape = tree!.root
      .findAllByType("div")
      .find(
        (node: { props: { id?: string } }) =>
          node.props.id === "wna-hero-shape-1",
      );
    expect(negativeShape?.props.className).toBe(
      "wna-hero-shape wna-hero-shape-swing-negative",
    );
    expect(negativeShape?.props.style.animation).toBe(
      "wna-hero-shape-swing-negative 13000ms ease-in-out infinite alternate",
    );
  });

  it("sets hero motion variables on a web element", () => {
    const setProperty = jest.fn();

    applyHeroShapeWebStyles(
      { style: { setProperty } },
      {
        "--wna-hero-shape-duration": "13000ms",
        "--wna-hero-shape-start-x": "-4px",
      },
    );

    expect(setProperty).toHaveBeenCalledWith(
      "--wna-hero-shape-duration",
      "13000ms",
    );
    expect(setProperty).toHaveBeenCalledWith(
      "--wna-hero-shape-start-x",
      "-4px",
    );
  });

  it("defaults WnaHeroField to non-compact when compact is omitted", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaHeroField appColors={appColors} />);
    });

    const shapeField = tree!.root.findAllByType("div")[0];

    expect(shapeField.props.style.overflow).toBeUndefined();
  });
});
