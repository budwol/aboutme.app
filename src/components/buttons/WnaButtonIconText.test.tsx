import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaButtonIconText from "@components/buttons/WnaButtonIconText";

jest.mock("@components/buttons/WnaPressable", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaPressable(props: unknown) {
    return createElement("WnaPressable", props as Record<string, unknown>);
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

    const pressable = tree!.root.findByType("WnaPressable");
    const content = tree!.root.findByType("WnaButtonTextContent");
    expect(pressable.props.disabled).toBe(true);
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
});
