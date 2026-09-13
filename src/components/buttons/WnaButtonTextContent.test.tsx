import { describe, expect, it } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaButtonTextContent from "@components/buttons/WnaButtonTextContent";

describe("WnaButtonTextContent", () => {
  it("renders text and optional left content", () => {
    const appStyle = {
      textNeutralMedium: { fontSize: 15 },
    } as never;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaButtonTextContent
          appStyle={appStyle}
          text="Open"
          textColor="#ffffff"
          childrenLeft={<span data-testid="left-icon" />}
        />,
      );
    });

    expect(
      tree!.root.find(
        (node: { type: unknown; props: { children?: unknown } }) =>
          node.type === "span" && node.props.children === "Open",
      ),
    ).toBeTruthy();
    expect(tree!.root.findByProps({ "data-testid": "left-icon" })).toBeTruthy();
  });

  it("falls back to the default text style when no app style is given", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaButtonTextContent text="Open" textColor="#ffffff" />,
      );
    });

    expect(tree!.root.findByType("span").props.style).toEqual(
      expect.objectContaining({ fontSize: 16, fontWeight: "500" }),
    );
  });
});
