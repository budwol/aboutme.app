import { describe, expect, it } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaCssGradient from "@components/effects/WnaCssGradient";

describe("WnaCssGradient", () => {
  it("renders a vertical gradient with default points", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaCssGradient colors={["#fff", "transparent"]}>
          content
        </WnaCssGradient>,
      );
    });

    const gradient = tree!.root.findByType("div");

    expect(gradient.props.style.backgroundImage).toBe(
      "linear-gradient(180deg, #fff, transparent)",
    );
    expect(gradient.props.children).toBe("content");
  });

  it("supports explicit points, color locations, and style arrays", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaCssGradient
          colors={["red", "blue", "black"]}
          locations={[0, 0.5, 1]}
          start={[0, 0]}
          end={{ x: 1, y: 0 }}
          style={[{ opacity: 0.8 }, { pointerEvents: "none" }]}
        />,
      );
    });

    const gradient = tree!.root.findByType("div");

    expect(gradient.props.style).toEqual({
      opacity: 0.8,
      pointerEvents: "none",
      backgroundImage: "linear-gradient(90deg, red 0%, blue 50%, black 100%)",
    });
  });
});
