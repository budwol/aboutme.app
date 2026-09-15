import { describe, expect, it, jest } from "@jest/globals";
import TestRenderer, { act } from "react-test-renderer";
import WnaButtonIcon from "@components/buttons/WnaButtonIcon";

jest.mock("@components/effects/WnaTooltip", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaTooltip(props: unknown) {
    return createElement("WnaTooltip", props as Record<string, unknown>);
  };
});

jest.mock("@components/buttons/WnaButtonIcon/WnaButtonIconBadge", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaButtonIconBadge(props: unknown) {
    return createElement(
      "WnaButtonIconBadge",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/effects/wnaShadowStyle", () => ({
  createShadowStyle: () => ({ boxShadow: "0px 1px 8px rgba(0, 0, 0, 0.2)" }),
}));

describe("WnaButtonIcon", () => {
  it("passes icon and tooltip props into the web button", () => {
    const onPress = jest.fn();
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaButtonIcon
          appColors={
            {
              isDark: false,
              staticWhite: "#ffffff",
              coolgray2: "#cccccc",
              staticBlack: "#000000",
              background: "#111111",
            } as never
          }
          appStyle={{} as never}
          iconName="account"
          toolTip="Open profile"
          toolTipPosition="right"
          color="#ff0000"
          style={{ marginTop: 12 }}
          onPress={onPress}
          t={((value: string) => value) as never}
          checkInternetConnection={false}
        />,
      );
    });

    const wrapper = tree!.root.findByType("div");
    const button = tree!.root.findByType("button");
    const icon = tree!.root.findByType("WnaButtonIconBadge");

    expect(wrapper.props.style).toEqual(
      expect.objectContaining({
        // Regression test: the tooltip inside this wrapper is
        // `position: absolute` and anchors to the nearest positioned
        // ancestor. Without `position: relative` here, it anchors to
        // whatever positioned element happens to be further up the tree
        // instead — this broke when the wrapper was converted from a
        // React Native `View` (implicitly `position: relative`) to a
        // plain `div` (implicitly `position: static`).
        position: "relative",
        boxShadow: "0px 1px 8px rgba(0, 0, 0, 0.2)",
        marginTop: 12,
      }),
    );
    expect(button.props.type).toBe("button");
    expect(button.props["aria-label"]).toBe("Open profile");
    expect(button.props.style).toEqual(
      expect.objectContaining({
        appearance: "none",
        borderRadius: 26,
        borderStyle: "solid",
        cursor: "pointer",
        height: 52,
        width: 52,
      }),
    );
    expect(button.props.onClick).toBe(onPress);
    expect(tree!.root.findByType("WnaTooltip").props.visible).toBe(false);
    act(() => {
      button.props.onMouseEnter();
    });
    expect(button.props.style.backgroundColor).toBe("rgba(255,255,255,0.08)");
    expect(tree!.root.findByType("WnaTooltip").props.visible).toBe(true);
    act(() => {
      button.props.onMouseDown();
    });
    expect(button.props.style.backgroundColor).toBe("rgba(255,255,255,0.14)");
    act(() => {
      button.props.onMouseUp();
    });
    expect(button.props.style.backgroundColor).toBe("rgba(255,255,255,0.08)");
    act(() => {
      button.props.onMouseLeave();
    });
    expect(button.props.style.backgroundColor).toBe("rgba(0,0,0,0.6)");
    expect(icon.props.iconName).toBe("account");
    expect(icon.props.color).toBe("#ff0000");
  });

  it("omits the tooltip when no tooltip content is provided", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaButtonIcon
          appColors={
            {
              isDark: false,
              staticWhite: "#ffffff",
              coolgray2: "#cccccc",
              staticBlack: "#000000",
              background: "#111111",
            } as never
          }
          appStyle={{} as never}
          iconName="account"
          onPress={jest.fn()}
        />,
      );
    });

    expect(tree!.root.findAllByType("WnaTooltip")).toHaveLength(0);
  });
});
