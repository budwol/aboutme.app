import { describe, expect, it, jest } from "@jest/globals";
import TestRenderer, { act } from "react-test-renderer";
import WnaButtonHeader from "@components/buttons/WnaButtonHeader";

jest.mock("@components/effects/WnaTooltip", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaTooltip(props: unknown) {
    return createElement("WnaTooltip", props as Record<string, unknown>);
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

    const button = tree!.root.findByType("button");
    const icon = tree!.root.findByType("WnaIcon");

    expect(button.props.type).toBe("button");
    expect(button.props["aria-label"]).toBe("Home");
    expect(button.props.style).toEqual(
      expect.objectContaining({
        appearance: "none",
        borderRadius: 28,
        cursor: "pointer",
      }),
    );
    expect(icon.props.iconName).toBe("home");
  });

  it("gives the tooltip a positioned ancestor to anchor against", () => {
    // Regression test: the tooltip inside this wrapper is `position:
    // absolute` and anchors to the nearest positioned ancestor. Without
    // `position: relative` here, it anchors to whatever positioned
    // element happens to be further up the tree instead — this broke
    // when the wrapper was converted from a React Native `View`
    // (implicitly `position: relative`) to a plain `div` (implicitly
    // `position: static`).
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

    const wrapper = tree!.root.findAllByType("div")[0];

    expect(wrapper.props.style).toEqual(
      expect.objectContaining({ position: "relative" }),
    );
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

    const button = tree!.root.findByType("button");

    expect(button.props["aria-label"]).toBe("menu");
    expect(
      tree!.root.findAll(
        (node: { props: { style?: { height?: number } } }) =>
          node.props.style?.height === 8,
      ),
    ).toHaveLength(0);
  });

  it("shows the tooltip and hover ripple without changing the circular button", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaButtonHeader
          appColors={{ staticWhite: "#fff" } as never}
          appStyle={{ containerCenterCenter: {} } as never}
          iconName="menu"
          text="Menu"
          onPress={jest.fn()}
        />,
      );
    });

    const button = tree!.root.findByType("button");
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
      button.props.onMouseLeave();
    });

    expect(button.props.style.backgroundColor).toBe("transparent");
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
        (node: { props: { style?: { backgroundColor?: string } } }) =>
          node.props.style?.backgroundColor === "#f00",
      ).length,
    ).toBeGreaterThan(0);
  });
});
