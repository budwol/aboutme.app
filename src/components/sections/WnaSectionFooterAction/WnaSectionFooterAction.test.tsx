import { describe, expect, it, jest } from "@jest/globals";
import WnaSectionFooterAction from "@components/sections/WnaSectionFooterAction";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";

describe("WnaSectionFooterAction", () => {
  it("calls the handler and updates hover styling", () => {
    const onPress = jest.fn();
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaSectionFooterAction
          appColors={{ accent5: "#00aacc" } as never}
          appStyle={{ textMicro: {} } as never}
          label="actionShowMore"
          onPress={onPress}
        />,
      );
    });

    const pressable = tree!.root.find(
      (node: {
        props: {
          onPress?: (() => void) | undefined;
          onHoverIn?: (() => void) | undefined;
          onHoverOut?: (() => void) | undefined;
        };
      }) =>
        typeof node.props.onPress === "function" &&
        typeof node.props.onHoverIn === "function" &&
        typeof node.props.onHoverOut === "function",
    );

    expect(pressable.props.style[1].backgroundColor).toBe(
      "rgba(0,170,204,0.08)",
    );

    act(() => {
      pressable.props.onHoverIn();
    });

    expect(pressable.props.style[1].backgroundColor).toBe(
      "rgba(0,170,204,0.14)",
    );

    act(() => {
      pressable.props.onHoverOut();
      pressable.props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
