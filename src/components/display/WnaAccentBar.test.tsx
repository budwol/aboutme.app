import { describe, expect, it } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaAccentBar from "@components/display/WnaAccentBar";

const appColors = {
  accent5: "#2277ee",
} as never;

describe("WnaAccentBar", () => {
  it("renders the static bar at the configured width", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaAccentBar appColors={appColors} width={180} />,
      );
    });

    const row = tree!.root.findByType("View");
    const bar = tree!.root.findAllByType("View")[1];

    expect(row.props.style[1].width).toBe(180);
    expect(bar.props.style[2].width).toBe(180);
  });

  it("defaults to the standard width when none is given", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaAccentBar appColors={appColors} />);
    });

    const row = tree!.root.findByType("View");

    expect(row.props.style[1].width).toBe(220);
  });

  it("uses a CSS transition when enabled", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaAccentBar appColors={appColors} animated width={180} />,
      );
    });

    const bar = tree!.root.findAllByType("View")[1];
    expect(bar.props.style[2]).toEqual(
      expect.objectContaining({
        width: 8,
        transition: "width 820ms cubic-bezier(0.33, 1, 0.68, 1)",
      }),
    );
  });

  it("uses CSS keyframes for pulsing bars", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaAccentBar
          appColors={appColors}
          width={180}
          pulseToWidth={45}
          pulseDuration={1200}
        />,
      );
    });

    const bar = tree!.root.findAllByType("View")[1];
    expect(bar.props.style[2]).toEqual({
      "--wna-accent-bar-pulse-scale": 0.25,
      animation: "wna-accent-bar-pulse 2400ms ease-in-out infinite alternate",
    });
  });
});
