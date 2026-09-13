import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaNavigationItem from "@/navigation/components/WnaNavigationItem";

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
    const button = tree!.root.findByType("button");

    expect(icons[0].props.iconName).toBe("shield-account");

    act(() => {
      button.props.onClick();
    });

    expect(onPressA).not.toHaveBeenCalled();
    expect(onPressB).toHaveBeenCalledWith("Legal");
  });

  it("squares off all corners for a middle-of-list item with a custom right icon", () => {
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
          text="Middle"
          iconName="scale-balance"
          iconRightName="chevron-right"
          type="middle"
          onPress={jest.fn()}
          t={((value: string) => value) as never}
        />,
      );
    });

    const button = tree!.root.findByType("button");

    expect(button.props.style).toEqual(
      expect.objectContaining({
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        cursor: "pointer",
      }),
    );

    act(() => {
      button.props.onMouseEnter();
    });
    expect(button.props.style.backgroundColor).toBe("rgba(0,0,0,0.06)");

    act(() => {
      button.props.onMouseLeave();
    });
    expect(button.props.style.backgroundColor).toBe("transparent");
  });

  it("hides the trailing icon when iconRightName is explicitly null", () => {
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
          text="Theme"
          iconName="scale-balance"
          iconRightName={null}
          type="standalone"
          onPress={jest.fn()}
          t={((value: string) => value) as never}
        />,
      );
    });

    const icons = tree!.root.findAllByType("WnaIcon");

    expect(icons).toHaveLength(1);
    expect(icons[0].props.iconName).toBe("scale-balance");
  });

  it("uses a visible light ripple for dark-theme sidebar items", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
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
          text="Privacy"
          iconName="shield-account"
          onPress={jest.fn()}
          t={((value: string) => value) as never}
        />,
      );
    });

    const button = tree!.root.findByType("button");

    act(() => {
      button.props.onMouseEnter();
    });

    expect(button.props.style.backgroundColor).toBe("rgba(255,255,255,0.06)");
  });
});
