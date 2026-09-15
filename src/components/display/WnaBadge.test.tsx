import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaBadge from "@components/display/WnaBadge";

jest.mock("@components/icon/WnaIcon/WnaIcon", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaIcon(props: unknown) {
    return createElement("WnaIcon", props as Record<string, unknown>);
  };
});

const appColors = {
  warmgray6: "#666666",
  coolgray8: "#222222",
  white: "#ffffff",
} as never;

const appStyle = {
  textMicro: { fontSize: 11 },
} as never;

describe("WnaBadge", () => {
  it("renders nothing without icon or text", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaBadge appColors={appColors} appStyle={appStyle} />,
      );
    });

    expect(tree!.toJSON()).toBeNull();
  });

  it("renders icon and text with default colors", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaBadge
          appColors={appColors}
          appStyle={appStyle}
          icon="account"
          text="Profile"
        />,
      );
    });

    const icon = tree!.root.findByType("WnaIcon");
    const text = tree!.root.findByType("span");

    expect(icon.props.iconName).toBe("account");
    expect(icon.props.color).toBe("#222222");
    expect(text.props.children).toBe("Profile");
    expect(text.props.style).toEqual(
      expect.objectContaining({ color: "#ffffff" }),
    );
    // Regression test: this pill rendered visibly "brick"-like/too tall
    // at height 28 (then still too tall at 26) with 4px of padding on
    // every side. The text itself is only 16px tall (12px font, 16px
    // line-height), so height is now 20 — exactly the text height plus a
    // slim 2px top/bottom via `paddingBlock`, kept separate from the
    // horizontal 4px via `paddingInline` since `boxSizing: "border-box"`
    // means only `height` (not `padding`) controls the outer box size.
    // Locked to an exact value (not an objectContaining lower bound) so a
    // future height change is a deliberate, visible diff here.
    expect(tree!.root.findByType("div").props).toEqual(
      expect.objectContaining({
        "aria-label": "Profile",
        style: {
          display: "flex",
          alignSelf: "flex-start",
          flexGrow: 0,
          flexShrink: 0,
          boxSizing: "border-box",
          height: 20,
          paddingInline: 4,
          paddingBlock: 2,
          borderRadius: 4,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          backgroundColor: "#666666",
        },
      }),
    );
  });

  it("keeps array text styles when provided", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaBadge
          appColors={appColors}
          appStyle={appStyle}
          text="Profile"
          fontColor="#123456"
          style={{ paddingHorizontal: 4, paddingVertical: 2 }}
          textStyle={[{ marginTop: 1 }, { marginBottom: 2 }]}
        />,
      );
    });

    const text = tree!.root.findByType("span");

    expect(text.props.style).toEqual(
      expect.objectContaining({
        color: "#123456",
        marginTop: 1,
        marginBottom: 2,
      }),
    );

    expect(tree!.root.findByType("div").props.style).toEqual(
      expect.objectContaining({
        paddingLeft: 4,
        paddingRight: 4,
        paddingTop: 2,
        paddingBottom: 2,
      }),
    );
  });

  it("uses the default text color with array text styles", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaBadge
          appColors={appColors}
          appStyle={appStyle}
          text="Profile"
          textStyle={[{ marginTop: 1 }]}
        />,
      );
    });

    const text = tree!.root.findByType("span");

    expect(text.props.style).toEqual(
      expect.objectContaining({ color: "#ffffff", marginTop: 1 }),
    );
  });
});
