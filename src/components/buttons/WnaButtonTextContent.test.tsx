import { describe, expect, it } from "@jest/globals";
import React from "react";
import { Text, View } from "react-native";
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
          childrenLeft={<View testID="left-icon" />}
        />,
      );
    });

    expect(tree!.root.findByType(Text).props.children).toBe("Open");
    expect(tree!.root.findByProps({ testID: "left-icon" })).toBeTruthy();
  });

  it("falls back to the default text style when no app style is given", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaButtonTextContent text="Open" textColor="#ffffff" />,
      );
    });

    expect(tree!.root.findByType(Text).props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fontSize: 16, fontWeight: "500" }),
      ]),
    );
  });
});
