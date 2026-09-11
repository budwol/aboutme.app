import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaButtonIconBadge from "@components/buttons/WnaButtonIcon/WnaButtonIconBadge";
import WnaIcon from "@components/icon/WnaIcon/WnaIcon";

jest.mock("@components/icon/WnaIcon/WnaIcon", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return {
    __esModule: true,
    default: jest.fn((props: unknown) =>
      createElement("WnaIcon", props as Record<string, unknown>),
    ),
  };
});

const mockWnaIcon = WnaIcon as unknown as jest.Mock;

describe("WnaButtonIconBadge", () => {
  it("renders default icon and size", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaButtonIconBadge
          appColors={
            {
              staticBlack: "#000000",
              staticWhite: "#ffffff",
              isDark: false,
            } as never
          }
          appStyle={
            { containerCenterCenter: { alignItems: "center" } } as never
          }
        />,
      );
    });

    const view = tree!.root.findByType("View");
    const icon = tree!.root.findByType("WnaIcon");

    expect(view.props.style).toEqual(
      expect.arrayContaining([
        { alignItems: "center" },
        expect.objectContaining({
          width: 52,
          height: 52,
          backgroundColor: "rgba(0,0,0,0.6)",
        }),
      ]),
    );
    expect(icon.props.iconName).toBe("cube");
    expect(icon.props.color).toBe("#ffffff");
  });

  it("renders configured icon, color and size", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaButtonIconBadge
          appColors={
            {
              staticBlack: "#000000",
              staticWhite: "#ffffff",
              isDark: false,
            } as never
          }
          appStyle={{ containerCenterCenter: {} } as never}
          iconName="account"
          color="#123456"
          size={32}
        />,
      );
    });

    const view = tree!.root.findByType("View");
    const icon = tree!.root.findByType("WnaIcon");

    expect(view.props.style[1]).toEqual(
      expect.objectContaining({ width: 32, height: 32 }),
    );
    expect(icon.props.iconName).toBe("account");
    expect(icon.props.color).toBe("#123456");
  });

  it("re-renders only when isDark, color or iconName change", () => {
    mockWnaIcon.mockClear();

    const baseColors = {
      staticBlack: "#000000",
      staticWhite: "#ffffff",
      isDark: false,
    };
    const appStyle = { containerCenterCenter: {} } as never;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaButtonIconBadge
          appColors={baseColors as never}
          appStyle={appStyle}
          iconName="account"
          color="#111111"
        />,
      );
    });
    expect(mockWnaIcon).toHaveBeenCalledTimes(1);

    // Same values via new object/prop references: comparator should treat as
    // equal (isDark ===, color ===, iconName ===) so memo skips re-render.
    act(() => {
      tree!.update(
        <WnaButtonIconBadge
          appColors={{ ...baseColors } as never}
          appStyle={appStyle}
          iconName="account"
          color="#111111"
        />,
      );
    });
    expect(mockWnaIcon).toHaveBeenCalledTimes(1);

    // isDark differs -> first comparator condition is false -> re-renders.
    act(() => {
      tree!.update(
        <WnaButtonIconBadge
          appColors={{ ...baseColors, isDark: true } as never}
          appStyle={appStyle}
          iconName="account"
          color="#111111"
        />,
      );
    });
    expect(mockWnaIcon).toHaveBeenCalledTimes(2);

    // isDark unchanged, color differs -> second condition is false.
    act(() => {
      tree!.update(
        <WnaButtonIconBadge
          appColors={{ ...baseColors, isDark: true } as never}
          appStyle={appStyle}
          iconName="account"
          color="#222222"
        />,
      );
    });
    expect(mockWnaIcon).toHaveBeenCalledTimes(3);

    // isDark and color unchanged, iconName differs -> third condition false.
    act(() => {
      tree!.update(
        <WnaButtonIconBadge
          appColors={{ ...baseColors, isDark: true } as never}
          appStyle={appStyle}
          iconName="cube"
          color="#222222"
        />,
      );
    });
    expect(mockWnaIcon).toHaveBeenCalledTimes(4);
  });
});
