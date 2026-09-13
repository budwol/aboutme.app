import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaProfileHero, {
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
  const appColors = {
    white: "#ffffff",
    black: "#000000",
    accent5: "#22aa66",
    coolgray2: "#cccccc",
    coolgray8: "#222222",
    coolgray6: "#666666",
    warmgray6: "#999999",
  } as never;

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
    const texts = tree!.root.findAllByType("Text");
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
      .findAllByType("View")
      .find(
        (node: { props: { nativeID?: string } }) =>
          node.props.nativeID === "wna-hero-shape-0",
      );

    expect(animatedShape?.props.style[1]).toEqual(
      expect.objectContaining({
        "--wna-hero-shape-duration": "13000ms",
        "--wna-hero-shape-start-scale": expect.any(Number),
        "--wna-hero-shape-end-scale": expect.any(Number),
        "--wna-hero-shape-start-opacity": expect.any(Number),
        "--wna-hero-shape-end-opacity": expect.any(Number),
      }),
    );
  });

  it("defaults WnaHeroField to non-compact when compact is omitted", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaHeroField appColors={appColors} />);
    });

    const shapeField = tree!.root.findByType("View" as never);

    expect(shapeField.props.style[1]).toBe(false);
  });
});
