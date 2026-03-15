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
});
