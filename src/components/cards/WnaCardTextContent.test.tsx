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

    const texts = tree!.root.findAllByType("Text");

    expect(
      texts.map(
        (text: { props: { children?: unknown } }) => text.props.children,
      ),
    ).toEqual(["Title", "Subtitle", "Description"]);
    expect(texts[0].props.style).toEqual(
      expect.objectContaining({ textAlign: "center", paddingTop: 2 }),
    );
    expect(texts[1].props.style).toEqual(
      expect.objectContaining({ textAlign: "right", paddingHorizontal: 6 }),
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

    const view = tree!.root.findByType("View");

    expect(view.props.style).toEqual(
      expect.objectContaining({
        alignItems: "center",
        padding: 8,
        paddingHorizontal: 8,
      }),
    );
    expect(tree!.root.findByType("TextMarker")).toBeTruthy();
  });

  it("renders nothing for omitted optional content", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaCardTextContent appColors={appColors} />);
    });

    expect(tree!.root.findAllByType("Text")).toHaveLength(0);
  });
});

function TextMarker() {
  return React.createElement("TextMarker");
}
