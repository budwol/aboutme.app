import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaButtonHeader from "@components/buttons/WnaButtonHeader";

jest.mock("@components/buttons/WnaPressable", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaPressable(props: unknown) {
    return createElement("WnaPressable", props as Record<string, unknown>);
  };
});

jest.mock("@components/icon/WnaIcon/WnaIcon", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaIcon(props: unknown) {
    return createElement("WnaIcon", props as Record<string, unknown>);
  };
});

describe("WnaButtonHeader", () => {
  it("updates tooltip and icon when props change", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaButtonHeader
          appColors={{ staticWhite: "#fff" } as never}
          appStyle={{ containerCenterCenter: {} } as never}
          iconName="menu"
          text="Menu"
          onPress={() => {}}
        />,
      );
    });

    act(() => {
      tree!.update(
        <WnaButtonHeader
          appColors={{ staticWhite: "#fff" } as never}
          appStyle={{ containerCenterCenter: {} } as never}
          iconName="home"
          text="Home"
          onPress={() => {}}
        />,
      );
    });

    const pressable = tree!.root.findByType("WnaPressable");
    const icon = tree!.root.findByType("WnaIcon");

    expect(pressable.props.toolTip).toBe("Home");
    expect(pressable.props.accessibilityLabel).toBe("Home");
    expect(icon.props.iconName).toBe("home");
  });

  it("defaults tooltip text and hides the badge when omitted", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaButtonHeader
          appColors={{ staticWhite: "#fff" } as never}
          appStyle={{ containerCenterCenter: {} } as never}
          iconName="menu"
          onPress={() => {}}
        />,
      );
    });

    const pressable = tree!.root.findByType("WnaPressable");

    expect(pressable.props.toolTip).toBe("");
    expect(pressable.props.accessibilityLabel).toBe("menu");
    expect(
      tree!.root.findAll(
        (node: { props: { style?: unknown } }) =>
          Array.isArray(node.props.style) &&
          node.props.style.some(
            (s: { height?: number }) => s && s.height === 8,
          ),
      ),
    ).toHaveLength(0);
  });

  it("shows the badge and uses an explicit color when provided", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaButtonHeader
          appColors={{ staticWhite: "#fff", red3: "#f00" } as never}
          appStyle={{ containerCenterCenter: {} } as never}
          iconName="menu"
          color="#123456"
          badgeVisible
          onPress={() => {}}
        />,
      );
    });

    const icon = tree!.root.findByType("WnaIcon");

    expect(icon.props.color).toBe("#123456");
    expect(
      tree!.root.findAll(
        (node: { props: { style?: unknown } }) =>
          Array.isArray(node.props.style) &&
          node.props.style.some(
            (s: { backgroundColor?: string }) =>
              s && s.backgroundColor === "#f00",
          ),
      ).length,
    ).toBeGreaterThan(0);
  });
});
