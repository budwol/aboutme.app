import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaBasePressable from "@components/buttons/WnaBasePressable/WnaBasePressable";

type TestNode = { props: Record<string, unknown> };

describe("WnaBasePressable", () => {
  it("renders enabled light ripple pressable styles", () => {
    const onPress = jest.fn();
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaBasePressable
          accessibilityLabel="Open"
          ripple="light"
          onPress={onPress}
          baseStyle={{ marginTop: 4 }}
        >
          child
        </WnaBasePressable>,
      );
    });

    const pressable = tree!.root.find(
      (node: TestNode) =>
        node.props.accessibilityRole === "button" &&
        typeof node.props.style === "function",
    );

    expect(pressable.props.disabled).toBe(false);
    expect(pressable.props.accessibilityLabel).toBe("Open");
    expect(pressable.props.style({ hovered: true, pressed: true })).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ opacity: 1 }),
        expect.objectContaining({ backgroundColor: "rgba(0,0,0,0.02)" }),
        { backgroundColor: "rgba(255,255,255,0.06)", opacity: 0.9 },
        { backgroundColor: "rgba(255,255,255,0.08)", opacity: 0.8 },
        { cursor: "pointer" },
        { marginTop: 4 },
      ]),
    );
  });

  it("renders disabled dark ripple styles without hover when disabled", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaBasePressable
          ripple="dark"
          onPress={() => undefined}
          isEnabled={false}
          disableHover
        >
          child
        </WnaBasePressable>,
      );
    });

    const pressable = tree!.root.find(
      (node: TestNode) =>
        node.props.accessibilityRole === "button" &&
        typeof node.props.style === "function",
    );

    expect(pressable.props.disabled).toBe(true);
    expect(pressable.props.style({ hovered: true, pressed: true })).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ opacity: 1 }),
        expect.objectContaining({ backgroundColor: "rgba(0,0,0,0.02)" }),
        false,
        false,
        { cursor: "auto" },
      ]),
    );
  });

  it("uses dark ripple colors when hovered and pressed", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaBasePressable ripple="dark" onPress={() => undefined}>
          child
        </WnaBasePressable>,
      );
    });

    const pressable = tree!.root.find(
      (node: TestNode) =>
        node.props.accessibilityRole === "button" &&
        typeof node.props.style === "function",
    );

    expect(pressable.props.style({ hovered: true, pressed: true })).toEqual(
      expect.arrayContaining([
        { backgroundColor: "rgba(0,0,0,0.06)", opacity: 0.9 },
        { backgroundColor: "rgba(0,0,0,0.08)", opacity: 0.8 },
      ]),
    );
  });

  it("uses transparent ripple colors when no ripple is configured", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaBasePressable ripple={undefined} onPress={() => undefined}>
          child
        </WnaBasePressable>,
      );
    });

    const pressable = tree!.root.find(
      (node: TestNode) =>
        node.props.accessibilityRole === "button" &&
        typeof node.props.style === "function",
    );

    expect(pressable.props.style({ hovered: true, pressed: true })).toEqual(
      expect.arrayContaining([
        { backgroundColor: "transparent", opacity: 0.9 },
        { backgroundColor: "transparent", opacity: 0.8 },
      ]),
    );
  });
});
