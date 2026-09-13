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
    expect(tree!.root.findByType("div").props).toEqual(
      expect.objectContaining({
        "aria-label": "Profile",
        style: expect.objectContaining({
          alignSelf: "flex-start",
          display: "flex",
          minHeight: 24,
        }),
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
