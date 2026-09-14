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

const baseAppColors = {
  black: "#111111",
  isDark: false,
};

const appColors = baseAppColors as never;

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

    const text = tree!.root.findByType("span");

    expect(text.props.children).toBe("Hello World");
    expect(text.props.style).toEqual(
      expect.objectContaining({
        fontSize: 13,
        lineHeight: 18,
        color: "#111111",
      }),
    );
    expect(text.props.style.whiteSpace).toBeUndefined();
    expect(text.props.style.WebkitLineClamp).toBeUndefined();
  });

  it("can force html stripping while rendering as text and clamps to the requested line count", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaText
          appColors={appColors}
          appStyle={appStyle}
          text={"Hello <strong>World</strong>"}
          showHtml={false}
          numberOfLines={2}
          style={{ fontSize: 15 }}
        />,
      );
    });

    const text = tree!.root.findByType("span");

    expect(text.props.children).toBe("Hello World");
    expect(text.props.style).toEqual(
      expect.objectContaining({
        fontSize: 15,
        WebkitLineClamp: 2,
        display: "-webkit-box",
      }),
    );
  });

  it("flattens an array style into a single merged style object", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaText
          appColors={appColors}
          appStyle={appStyle}
          text="Hello"
          style={[{ fontSize: 15 }, { fontWeight: "700" }]}
        />,
      );
    });

    const text = tree!.root.findByType("span");

    expect(text.props.style).toEqual(
      expect.objectContaining({ fontSize: 15, fontWeight: "700" }),
    );
  });

  it("uses single-line ellipsis truncation when numberOfLines is 1", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaText
          appColors={appColors}
          appStyle={appStyle}
          text="Single line"
          numberOfLines={1}
        />,
      );
    });

    const text = tree!.root.findByType("span");

    expect(text.props.style).toEqual(
      expect.objectContaining({
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
      }),
    );
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

  it("skips re-rendering when text and dark mode stay stable", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaText appColors={appColors} appStyle={appStyle} text="Stable" />,
      );
    });

    act(() => {
      tree!.update(
        <WnaText
          appColors={{ ...baseAppColors } as never}
          appStyle={appStyle}
          text="Stable"
        />,
      );
    });

    expect(tree!.root.findByType("span").props.children).toBe("Stable");

    act(() => {
      tree!.update(
        <WnaText
          appColors={{ ...baseAppColors, isDark: true } as never}
          appStyle={appStyle}
          text="Changed"
        />,
      );
    });

    expect(tree!.root.findByType("span").props.children).toBe("Changed");
  });
});
