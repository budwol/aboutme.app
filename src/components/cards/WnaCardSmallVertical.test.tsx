import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaCardSmallVertical from "@components/cards/WnaCardSmallVertical";

jest.mock("@components/cards/WnaVerticalCardTextContent", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaVerticalCardTextContent(props: unknown) {
    return createElement(
      "WnaVerticalCardTextContent",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/misc/WnaBadge", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaBadge(props: unknown) {
    return createElement("WnaBadge", props as Record<string, unknown>);
  };
});

jest.mock("@components/buttons/WnaPressable", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaPressable(props: unknown) {
    return createElement(
      "WnaPressable",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  };
});

describe("WnaCardSmallVertical", () => {
  it("forwards title, subtitle and description to the shared content component", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaCardSmallVertical
          appColors={
            {
              warmgray6: "#666666",
              coolgray2: "#222222",
              black: "#000000",
            } as never
          }
          appStyle={
            {
              textMicro: { lineHeight: 16 },
              textNeutralMicro: {},
            } as never
          }
          title="Engineer"
          subtitle="Example Inc."
          description="Built features."
          badgeText="3 yrs 5 mos"
          opacity={0.7}
        />,
      );
    });

    const content = tree!.root.findByType("WnaVerticalCardTextContent");
    const badge = tree!.root.findByType("WnaBadge");
    const container = tree!.root
      .findAll((node: { props?: { style?: { opacity?: number } } }) =>
        Boolean(node.props?.style?.opacity),
      )
      .at(0);

    expect(content.props.title).toBe("Engineer");
    expect(content.props.subtitle).toBe("Example Inc.");
    expect(content.props.description).toBeUndefined();
    expect(badge.props.text).toBe("3 yrs 5 mos");
    expect(container?.props.style.opacity).toBe(0.7);
  });

  it("renders a pressable card body when onPress is provided", () => {
    const onPress = jest.fn();
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaCardSmallVertical
          appColors={
            {
              warmgray6: "#666666",
              coolgray2: "#222222",
              coolgray1: "#dddddd",
              coolgray8: "#111111",
              black: "#000000",
            } as never
          }
          appStyle={
            {
              textMicro: { lineHeight: 16 },
              textNeutralMicro: {},
            } as never
          }
          title="Engineer"
          subtitle="Example Inc."
          description="Built features."
          onPress={onPress}
        />,
      );
    });

    const pressable = tree!.root.findByType("WnaPressable");

    expect(pressable.props.ripple).toBe("dark");

    act(() => {
      pressable.props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
