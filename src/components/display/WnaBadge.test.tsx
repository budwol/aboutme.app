import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaBadge from "@components/display/WnaBadge";

jest.mock("@components/text/WnaText", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaText(props: unknown) {
    return createElement("WnaText", props as Record<string, unknown>);
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
    const text = tree!.root.findByType("WnaText");

    expect(icon.props.iconName).toBe("account");
    expect(icon.props.color).toBe("#222222");
    expect(text.props.fontColor).toBe("#ffffff");
    expect(text.props.text).toBe("Profile");
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
          textStyle={[{ marginTop: 1 }, { marginBottom: 2 }]}
        />,
      );
    });

    const text = tree!.root.findByType("WnaText");

    expect(text.props.fontColor).toBe("#123456");
    expect(text.props.style).toEqual(
      expect.arrayContaining([{ marginTop: 1 }, { marginBottom: 2 }]),
    );
  });
});
