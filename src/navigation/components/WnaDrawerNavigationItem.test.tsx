import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaDrawerNavigationItem from "@/navigation/components/WnaDrawerNavigationItem";

type TestNode = {
  props: Record<string, unknown> & {
    style?: Record<string, unknown>;
  };
};

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

    const button = tree!.root.find(
      (node: TestNode) =>
        node.props.type === "button" &&
        typeof node.props.onClick === "function",
    );
    const icon = tree!.root.findByType("WnaIcon");
    const text = tree!.root.find(
      (node: TestNode) => node.props.children === "Projects",
    );

    expect(button.props["aria-label"]).toBe("Projects");
    expect(button.props["aria-current"]).toBeUndefined();
    expect(button.props.style).toEqual(
      expect.objectContaining({
        paddingLeft: 32,
        paddingTop: 14,
        paddingBottom: 14,
        paddingRight: 16,
        margin: 0,
        backgroundColor: "transparent",
        position: "relative",
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
      }),
    );
    expect(button.props.style).toEqual(
      expect.objectContaining({
        paddingTop: 14,
        paddingBottom: 14,
        paddingRight: 16,
      }),
    );
    expect(icon.props.size).toBe(20);
    expect(icon.props.color).toBe("#111111");
    expect(icon.props.style.opacity).toBe(0.7);
    expect(text.props.style[2]).toEqual(
      expect.objectContaining({ opacity: 0.7, fontWeight: "400" }),
    );

    act(() => {
      button.props.onMouseEnter();
    });
    expect(button.props.style.backgroundColor).toBe("#eeeeee");

    act(() => {
      button.props.onMouseDown();
    });
    expect(button.props.style.backgroundColor).toBe("#eeeeee");

    act(() => {
      button.props.onMouseUp();
      button.props.onClick();
      button.props.onMouseLeave();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(button.props.style.backgroundColor).toBe("transparent");
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

    const button = tree!.root.find(
      (node: TestNode) =>
        node.props.type === "button" &&
        typeof node.props.onClick === "function",
    );
    const icon = tree!.root.findByType("WnaIcon");
    const accentBar = tree!.root.find(
      (node: TestNode) =>
        Array.isArray(node.props.style) &&
        node.props.style.some((style: { width?: number }) => style.width === 4),
    );

    expect(button.props["aria-label"]).toBe("Projects");
    expect(button.props["aria-current"]).toBe("page");
    expect(button.props.style).toEqual(
      expect.objectContaining({
        paddingLeft: 16,
        backgroundColor: "#222222",
        margin: 0,
      }),
    );
    act(() => {
      button.props.onMouseEnter();
      button.props.onMouseDown();
      button.props.onMouseLeave();
    });
    expect(button.props.style.backgroundColor).toBe("#222222");
    expect(icon.props.size).toBe(21);
    expect(icon.props.color).toBe("#00aa99");
    expect(accentBar.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          position: "absolute",
        }),
        { backgroundColor: "#00aa99" },
      ]),
    );
    expect(icon.props.style).toEqual(
      expect.objectContaining({ width: 28, opacity: 1 }),
    );
    expect(
      tree!.root.find((node: TestNode) => node.props.children === "Projects")
        .props.style[1],
    ).toEqual(expect.objectContaining({ marginLeft: 12 }));
  });

  it("keeps the dark inactive hover state visible against the drawer", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaDrawerNavigationItem
          text="Contact"
          iconName="email-outline"
          onPress={() => undefined}
          appStyle={appStyle}
          appColors={darkColors}
        />,
      );
    });

    const button = tree!.root.find(
      (node: TestNode) =>
        node.props.type === "button" &&
        typeof node.props.onMouseEnter === "function",
    );

    act(() => {
      button.props.onMouseEnter();
    });

    expect(button.props.style.backgroundColor).toBe("#222222");
  });
});
