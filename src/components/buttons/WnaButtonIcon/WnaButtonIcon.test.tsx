import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaButtonIcon from "@components/buttons/WnaButtonIcon";

jest.mock("@components/buttons/WnaPressable", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaPressable(props: unknown) {
    return createElement("WnaPressable", props as Record<string, unknown>);
  };
});

jest.mock("@components/buttons/WnaButtonIconInnerIcon", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaButtonIconInnerIcon(props: unknown) {
    return createElement(
      "WnaButtonIconInnerIcon",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/effects/WnaShadowStyle", () => ({
  WnaShadowStyle: () => ({ boxShadow: "0px 1px 8px rgba(0, 0, 0, 0.2)" }),
}));

describe("WnaButtonIcon", () => {
  it("passes icon and tooltip props into the pressable button", () => {
    const onPress = jest.fn();
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaButtonIcon
          appColors={
            {
              isDark: false,
              staticWhite: "#ffffff",
              coolgray2: "#cccccc",
              staticBlack: "#000000",
              background: "#111111",
            } as never
          }
          appStyle={{} as never}
          iconName="account"
          toolTip="Open profile"
          toolTipPosition="right"
          color="#ff0000"
          style={{ marginTop: 12 }}
          onPress={onPress}
          t={((value: string) => value) as never}
          checkInternetConnection={false}
        />,
      );
    });

    const view = tree!.root.findByType("View");
    const pressable = tree!.root.findByType("WnaPressable");
    const icon = tree!.root.findByType("WnaButtonIconInnerIcon");

    expect(view.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          boxShadow: "0px 1px 8px rgba(0, 0, 0, 0.2)",
        }),
        expect.objectContaining({ marginTop: 12 }),
      ]),
    );
    expect(pressable.props.ripple).toBe("light");
    expect(pressable.props.toolTip).toBe("Open profile");
    expect(pressable.props.toolTipPosition).toBe("right");
    expect(pressable.props.onPress).toBe(onPress);
    expect(icon.props.iconName).toBe("account");
    expect(icon.props.color).toBe("#ff0000");
  });
});
