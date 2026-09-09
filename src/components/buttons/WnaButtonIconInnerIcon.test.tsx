import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaButtonIconInnerIcon from "@components/buttons/WnaButtonIconInnerIcon";

jest.mock("@components/icon/WnaIcon/WnaIcon", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaIcon(props: unknown) {
    return createElement("WnaIcon", props as Record<string, unknown>);
  };
});

describe("WnaButtonIconInnerIcon", () => {
  it("renders default icon and size", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaButtonIconInnerIcon
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
        <WnaButtonIconInnerIcon
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
});
