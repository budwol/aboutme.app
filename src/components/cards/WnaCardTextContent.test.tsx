import { describe, expect, it } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaCardTextContent from "@components/cards/WnaCardTextContent";

const appColors = {
  black: "#111111",
} as never;

describe("WnaCardTextContent", () => {
  it("renders title, subtitle and description without app style", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaCardTextContent
          appColors={appColors}
          title="Title"
          subtitle="Subtitle"
          description="Description"
          titleAlign="center"
          subtitleAlign="right"
          titlePaddingHorizontal={4}
          titlePaddingTop={2}
          subtitlePaddingHorizontal={6}
        />,
      );
    });

    const spans = tree!.root.findAllByType("span");

    expect(
      spans.map(
        (span: { props: { children?: unknown } }) => span.props.children,
      ),
    ).toEqual(["Title", "Subtitle", "Description"]);
    expect(spans[0].props.style).toEqual(
      expect.objectContaining({ textAlign: "center", paddingTop: 2 }),
    );
    expect(spans[1].props.style).toEqual(
      expect.objectContaining({ textAlign: "right", paddingInline: 6 }),
    );
  });

  it("renders custom subtitle content with centered alignment", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaCardTextContent
          appColors={appColors}
          appStyle={
            {
              textNeutralMedium: { lineHeight: 20 },
              textNeutralSmall: { lineHeight: 16 },
              textNeutralMicro: { fontSize: 10 },
            } as never
          }
          title="Title"
          subtitleContent={<TextMarker />}
          subtitleAlign="center"
          bodyPadding={8}
        />,
      );
    });

    const wrapper = tree!.root.findByType("div");

    expect(wrapper.props.style).toEqual(
      expect.objectContaining({
        alignItems: "center",
        padding: 8,
        paddingInline: 8,
      }),
    );
    expect(tree!.root.findByType("TextMarker")).toBeTruthy();
  });

  it("uses app style text rules and right-aligned custom content", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaCardTextContent
          appColors={appColors}
          appStyle={
            {
              textNeutralMedium: { lineHeight: undefined },
              textNeutralSmall: { lineHeight: undefined },
              textNeutralMicro: { color: "#555555" },
            } as never
          }
          title="Styled title"
          subtitle="Styled subtitle"
          description="Styled description"
          subtitleAlign="right"
          titleNumberOfLines={1}
          subtitleNumberOfLines={2}
          bodyPadding={3}
        />,
      );
    });

    const spans = tree!.root.findAllByType("span");

    expect(spans[0].props.style).toEqual(
      expect.objectContaining({
        lineHeight: "20px",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
      }),
    );
    expect(spans[1].props.style).toEqual(
      expect.objectContaining({
        lineHeight: "18px",
        paddingInline: 3,
        textAlign: "right",
        WebkitLineClamp: 2,
      }),
    );
    expect(spans[2].props.style).toEqual({ color: "#555555" });
  });

  it("left-aligns custom subtitle content by default", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaCardTextContent
          appColors={appColors}
          subtitleContent={<TextMarker />}
        />,
      );
    });

    expect(tree!.root.findByType("div").props.style).toEqual(
      expect.objectContaining({ alignItems: "flex-start" }),
    );
  });

  it("renders title without app style using default paddings and alignment", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaCardTextContent appColors={appColors} title="Plain title" />,
      );
    });

    const span = tree!.root.findByType("span");

    expect(span.props.style).toEqual(
      expect.objectContaining({
        paddingInline: 0,
        paddingTop: 0,
        textAlign: "left",
      }),
    );
  });

  it("aligns custom subtitle content to the right", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaCardTextContent
          appColors={appColors}
          subtitleContent={<TextMarker />}
          subtitleAlign="right"
        />,
      );
    });

    expect(tree!.root.findByType("div").props.style).toEqual(
      expect.objectContaining({ alignItems: "flex-end" }),
    );
  });

  it("uses default subtitle spacing and alignment without app style", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaCardTextContent appColors={appColors} subtitle="Plain subtitle" />,
      );
    });

    const span = tree!.root.findByType("span");

    expect(span.props.style).toEqual(
      expect.objectContaining({
        paddingInline: 0,
        textAlign: "left",
      }),
    );
  });

  it("defaults subtitle body padding to 0 with app style when nothing provided", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaCardTextContent
          appColors={appColors}
          appStyle={
            {
              textNeutralSmall: { lineHeight: 16 },
            } as never
          }
          subtitle="Styled subtitle"
        />,
      );
    });

    const span = tree!.root.findByType("span");

    expect(span.props.style).toEqual(
      expect.objectContaining({ padding: 0, paddingInline: 0 }),
    );
  });

  it("prefers subtitlePaddingHorizontal over bodyPadding with app style", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaCardTextContent
          appColors={appColors}
          appStyle={
            {
              textNeutralSmall: { lineHeight: 16 },
            } as never
          }
          subtitle="Styled subtitle"
          bodyPadding={5}
          subtitlePaddingHorizontal={9}
        />,
      );
    });

    const span = tree!.root.findByType("span");

    expect(span.props.style).toEqual(
      expect.objectContaining({ paddingInline: 9 }),
    );
  });

  it("renders nothing for omitted optional content", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaCardTextContent appColors={appColors} />);
    });

    expect(tree!.root.findAllByType("span")).toHaveLength(0);
  });
});

function TextMarker() {
  return React.createElement("TextMarker");
}
