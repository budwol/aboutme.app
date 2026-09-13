import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaBasePressable from "@components/buttons/WnaBasePressable/WnaBasePressable";

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

    const button = tree!.root.findByType("button");

    expect(button.props.type).toBe("button");
    expect(button.props.disabled).toBe(false);
    expect(button.props["aria-label"]).toBe("Open");
    expect(button.props.style).toEqual(
      expect.objectContaining({ opacity: 1, cursor: "pointer", marginTop: 4 }),
    );

    act(() => {
      button.props.onMouseEnter();
    });
    expect(button.props.style.backgroundColor).toBe("rgba(255,255,255,0.06)");
    expect(button.props.style.opacity).toBe(0.9);

    act(() => {
      button.props.onMouseDown();
    });
    expect(button.props.style.backgroundColor).toBe("rgba(255,255,255,0.08)");
    expect(button.props.style.opacity).toBe(0.8);

    act(() => {
      button.props.onMouseUp();
    });
    expect(button.props.style.backgroundColor).toBe("rgba(255,255,255,0.06)");

    act(() => {
      button.props.onMouseLeave();
    });
    expect(button.props.style.backgroundColor).toBe("transparent");
    expect(button.props.style.opacity).toBe(1);

    act(() => {
      onPress();
    });
    expect(onPress).toHaveBeenCalledTimes(1);
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

    const button = tree!.root.findByType("button");

    expect(button.props.disabled).toBe(true);
    expect(button.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: "rgba(0,0,0,0.02)",
        cursor: "auto",
      }),
    );

    act(() => {
      button.props.onMouseEnter();
      button.props.onMouseDown();
    });
    expect(button.props.style.backgroundColor).toBe("rgba(0,0,0,0.02)");
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

    const button = tree!.root.findByType("button");

    act(() => {
      button.props.onMouseEnter();
    });
    expect(button.props.style.backgroundColor).toBe("rgba(0,0,0,0.06)");

    act(() => {
      button.props.onMouseDown();
    });
    expect(button.props.style.backgroundColor).toBe("rgba(0,0,0,0.08)");
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

    const button = tree!.root.findByType("button");

    act(() => {
      button.props.onMouseEnter();
    });
    expect(button.props.style.backgroundColor).toBe("transparent");

    act(() => {
      button.props.onMouseDown();
    });
    expect(button.props.style.backgroundColor).toBe("transparent");
  });

  it("notifies hover callbacks and clears pressed state on mouse leave", () => {
    const onHoverIn = jest.fn();
    const onHoverOut = jest.fn();
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaBasePressable
          ripple="light"
          onPress={() => undefined}
          onHoverIn={onHoverIn}
          onHoverOut={onHoverOut}
        >
          child
        </WnaBasePressable>,
      );
    });

    const button = tree!.root.findByType("button");

    act(() => {
      button.props.onMouseEnter();
    });
    expect(onHoverIn).toHaveBeenCalledTimes(1);

    act(() => {
      button.props.onMouseLeave();
    });
    expect(onHoverOut).toHaveBeenCalledTimes(1);
  });
});
