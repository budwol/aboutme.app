import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaDrawerNavigationItem from "@/navigation/components/WnaDrawerNavigationItem";

type TestNode = { props: Record<string, unknown> };

jest.mock("@components/icon/WnaIcon/WnaIcon", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaIcon(props: unknown) {
    return createElement("WnaIcon", props as Record<string, unknown>);
  };
});

const appStyle = {
  textNeutralMedium: { fontSize: 14 },
} as never;

const lightColors = {
  isDark: false,
  staticAccent5: "#00aa99",
  coolgray1: "#eeeeee",
  coolgray2: "#dddddd",
  black: "#111111",
} as never;

const darkColors = {
  isDark: true,
  staticAccent5: "#00aa99",
  coolgray1: "#eeeeee",
  coolgray2: "#222222",
  black: "#111111",
} as never;

describe("WnaDrawerNavigationItem", () => {
  it("renders an inactive secondary item with pressed background", () => {
    const onPress = jest.fn();
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaDrawerNavigationItem
          text="Projects"
          iconName="account"
          onPress={onPress}
          appStyle={appStyle}
          appColors={lightColors}
          isSecondary
        />,
      );
    });

    const pressable = tree!.root.find(
      (node: TestNode) =>
        typeof node.props.onPress === "function" &&
        typeof node.props.style === "function",
    );
    const icon = tree!.root.findByType("WnaIcon");
    const text = tree!.root.find(
      (node: TestNode) => node.props.children === "Projects",
    );

    expect(pressable.props.style({ pressed: true })[1]).toEqual({
      paddingLeft: 32,
      backgroundColor: "#eeeeee",
    });
    expect(icon.props.size).toBe(20);
    expect(icon.props.color).toBe("#111111");
    expect(icon.props.style.opacity).toBe(0.7);
    expect(text.props.style[2]).toEqual(
      expect.objectContaining({ opacity: 0.7, fontWeight: "400" }),
    );

    act(() => {
      pressable.props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renders an active item with accent styles", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaDrawerNavigationItem
          text="Projects"
          iconName="account"
          onPress={() => undefined}
          appStyle={appStyle}
          appColors={darkColors}
          isActive
        />,
      );
    });

    const pressable = tree!.root.find(
      (node: TestNode) =>
        typeof node.props.onPress === "function" &&
        typeof node.props.style === "function",
    );
    const icon = tree!.root.findByType("WnaIcon");
    const accentBar = tree!.root.find(
      (node: TestNode) =>
        Array.isArray(node.props.style) &&
        node.props.style.some((style: { width?: number }) => style.width === 4),
    );

    expect(pressable.props.style({ pressed: false })[1]).toEqual({
      paddingLeft: 16,
      backgroundColor: "#222222",
    });
    expect(icon.props.size).toBe(21);
    expect(icon.props.color).toBe("#00aa99");
    expect(accentBar.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ width: 4 }),
        { backgroundColor: "#00aa99" },
      ]),
    );
  });
});
