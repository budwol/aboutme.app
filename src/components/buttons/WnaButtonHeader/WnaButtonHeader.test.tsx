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
    expect(icon.props.iconName).toBe("home");
  });
});
