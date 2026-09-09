import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaText from "@components/text/WnaText";

jest.mock("@components/content/WnaHtmlRenderer", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaHtmlRenderer(props: unknown) {
    return createElement("WnaHtmlRenderer", props as Record<string, unknown>);
  };
});

const appColors = {
  black: "#111111",
  isDark: false,
} as never;

const appStyle = {
  textNeutralSmall: { fontSize: 13, lineHeight: 18 },
} as never;

describe("WnaText", () => {
  it("renders plain text with default text props and stripped html", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaText
          appColors={appColors}
          appStyle={appStyle}
          text="Hello World"
        />,
      );
    });

    const text = tree!.root.findByType("Text");

    expect(text.props.children).toBe("Hello World");
    expect(text.props.numberOfLines).toBe(0);
    expect(text.props.ellipsizeMode).toBe("clip");
    expect(text.props.textBreakStrategy).toBe("simple");
    expect(text.props.style).toEqual(
      expect.arrayContaining([
        { fontSize: 13, lineHeight: 18 },
        { color: "#111111" },
      ]),
    );
  });

  it("can force html stripping while rendering as text", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaText
          appColors={appColors}
          appStyle={appStyle}
          text={"Hello <strong>World</strong>"}
          showHtml={false}
          numberOfLines={2}
          ellipseMode="tail"
          textBreakStrategy="balanced"
          style={{ fontSize: 15 }}
        />,
      );
    });

    const text = tree!.root.findByType("Text");

    expect(text.props.children).toBe("Hello World");
    expect(text.props.numberOfLines).toBe(2);
    expect(text.props.ellipsizeMode).toBe("tail");
    expect(text.props.textBreakStrategy).toBe("balanced");
  });

  it("renders html through the html renderer with explicit display props", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaText
          appColors={appColors}
          appStyle={appStyle}
          text={"<p>Hello</p>"}
          showHtml
          fontFamily="Manrope"
          fontSize={16}
          fontColor="#123456"
          maxHeight={120}
        />,
      );
    });

    const renderer = tree!.root.findByType("WnaHtmlRenderer");

    expect(renderer.props.html).toBe("<p>Hello</p>");
    expect(renderer.props.fontFamily).toBe("Manrope");
    expect(renderer.props.fontSize).toBe(16);
    expect(renderer.props.fontColor).toBe("#123456");
    expect(renderer.props.maxHeight).toBe(120);
  });
});
