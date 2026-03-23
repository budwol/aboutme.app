import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaNavigationItem from "@/navigation/components/WnaNavigationItem";

jest.mock("@components/buttons/WnaPressable", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaPressable(props: unknown) {
    return createElement(
      "WnaPressable",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  };
});

jest.mock("@components/cards/WnaSurfaceCard", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockCard(props: unknown) {
    return createElement(
      "WnaSurfaceCard",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
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

describe("WnaNavigationItem", () => {
  it("updates icon and handler props when they change", () => {
    const onPressA = jest.fn();
    const onPressB = jest.fn();
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaNavigationItem
          appColors={
            {
              isDark: false,
              black: "#000",
              accent5: "#0af",
              coolgray4: "#999",
            } as never
          }
          appStyle={{ textNeutralMedium: {} } as never}
          text="Legal"
          iconName="scale-balance"
          onPress={onPressA}
          t={((value: string) => value) as never}
        />,
      );
    });

    act(() => {
      tree!.update(
        <WnaNavigationItem
          appColors={
            {
              isDark: true,
              black: "#000",
              accent5: "#f50",
              coolgray4: "#222",
            } as never
          }
          appStyle={{ textNeutralMedium: {} } as never}
          text="Legal"
          iconName="shield-account"
          onPress={onPressB}
          t={((value: string) => value) as never}
        />,
      );
    });

    const icons = tree!.root.findAllByType("WnaIcon");
    const pressable = tree!.root.findByType("WnaPressable");

    expect(icons[0].props.iconName).toBe("shield-account");

    act(() => {
      pressable.props.onPress();
    });

    expect(onPressA).not.toHaveBeenCalled();
    expect(onPressB).toHaveBeenCalledWith("Legal");
  });
});
