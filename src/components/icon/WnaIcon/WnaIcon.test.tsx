import { describe, expect, it } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaIcon from "@components/icon/WnaIcon/WnaIcon";

describe("WnaIcon", () => {
  it("renders with default size and color", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaIcon iconName="cube" />);
    });

    const svg = tree!.root.findByType("svg");

    expect(svg.props.width).toBe(24);
    expect(svg.props.height).toBe(24);
    expect(svg.props.fill).toBe("currentColor");
  });

  it("renders with configured size, color and style", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaIcon
          iconName="account"
          size={32}
          color="#123456"
          style={{ margin: 4 } as never}
        />,
      );
    });

    const svg = tree!.root.findByType("svg");

    expect(svg.props.width).toBe(32);
    expect(svg.props.height).toBe(32);
    expect(svg.props.fill).toBe("#123456");
    expect(svg.props.style).toEqual({ margin: 4 });
  });

  it("renders nothing when the icon name is unknown", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaIcon iconName={"does-not-exist" as never} />,
      );
    });

    expect(tree!.toJSON()).toBeNull();
  });
});
