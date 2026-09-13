import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaButtonIconText from "@components/buttons/WnaButtonIconText";
import {
  actionButtonRightConstants,
  appLayoutConstants,
} from "@constants/layoutConstants";

jest.mock("@components/icon/WnaIcon/WnaIcon", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaIcon(props: unknown) {
    return createElement("WnaIcon", props as Record<string, unknown>);
  };
});

jest.mock("@components/buttons/WnaButtonTextContent", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaButtonTextContent(props: unknown) {
    return createElement(
      "WnaButtonTextContent",
      props as Record<string, unknown>,
    );
  };
});

describe("WnaButtonIconText", () => {
  it("passes icon, text and disabled state into the composed button", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaButtonIconText
          appColors={
            {
              isDark: false,
              staticWhite: "#fff",
              staticWarmgray8: "#ccc",
              staticWarmgray7: "#333",
              background: "#111",
            } as never
          }
          text="Open profile"
          iconName="account"
          onPress={() => {}}
          t={((value: string) => value) as never}
          checkInternetConnection={false}
          disabled={true}
        />,
      );
    });

    const button = tree!.root.findByType("button");
    const content = tree!.root.findByType("WnaButtonTextContent");
    expect(button.props.disabled).toBe(true);
    expect(button.props["aria-disabled"]).toBe(true);
    expect(button.props.style).toEqual(
      expect.objectContaining({
        appearance: "none",
        height: actionButtonRightConstants.size,
        borderRadius: appLayoutConstants.globalCornerRadius,
        borderColor: "#747067",
        borderStyle: "solid",
        cursor: "not-allowed",
        opacity: 0.5,
      }),
    );
    expect(content.props.text).toBe("Open profile");
    expect(content.props.childrenLeft.props.iconName).toBe("account");
  });

  it("updates rendered content when text and icon change", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaButtonIconText
          appColors={
            {
              isDark: false,
              staticWhite: "#fff",
              staticWarmgray8: "#ccc",
              staticWarmgray7: "#333",
              background: "#111",
            } as never
          }
          text="Open profile"
          iconName="account"
          onPress={() => {}}
          t={((value: string) => value) as never}
          checkInternetConnection={false}
          disabled={false}
        />,
      );
    });

    act(() => {
      tree!.update(
        <WnaButtonIconText
          appColors={
            {
              isDark: false,
              staticWhite: "#fff",
              staticWarmgray8: "#ccc",
              staticWarmgray7: "#333",
              background: "#111",
            } as never
          }
          text="View details"
          iconName="rocket-launch-outline"
          onPress={() => {}}
          t={((value: string) => value) as never}
          checkInternetConnection={false}
          disabled={false}
        />,
      );
    });

    const content = tree!.root.findByType("WnaButtonTextContent");

    expect(content.props.text).toBe("View details");
    expect(content.props.childrenLeft.props.iconName).toBe(
      "rocket-launch-outline",
    );
  });

  it("falls back to the dark background color and a custom border width", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaButtonIconText
          appColors={
            {
              isDark: true,
              staticWhite: "#fff",
              staticWarmgray8: "#ccc",
              staticWarmgray7: "#333",
              background: "#111",
            } as never
          }
          text="Open profile"
          iconName="account"
          onPress={() => {}}
          borderWidth={3}
        />,
      );
    });

    const button = tree!.root.findByType("button");

    expect(button.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: "#333",
        borderColor: "#747067",
        borderStyle: "solid",
        borderWidth: 3,
      }),
    );

    act(() => {
      button.props.onMouseEnter();
    });
    expect(button.props.style.opacity).toBe(0.9);

    act(() => {
      button.props.onMouseDown();
    });
    expect(button.props.style.opacity).toBe(0.8);

    act(() => {
      button.props.onMouseUp();
      button.props.onMouseLeave();
    });
    expect(button.props.style.opacity).toBe(1);
  });
});
