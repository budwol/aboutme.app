import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaButtonIconDecent from "@components/buttons/WnaButtonIconDecent";
import { actionButtonRightConstants } from "@constants/layoutConstants";

jest.mock("@components/WnaAppContext", () => ({
  useWnaTheme: () => ({
    appColors: {
      accent5: "#0aa",
    },
  }),
}));

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

jest.mock("@components/icon/WnaIcon/WnaIcon", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaIcon(props: unknown) {
    return createElement("WnaIcon", props as Record<string, unknown>);
  };
});

describe("WnaButtonIconDecent", () => {
  it("uses the shared action button size and forwards custom styles", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaButtonIconDecent
          iconName="account"
          onPress={() => {}}
          style={{ marginTop: 12 }}
        />,
      );
    });

    const wrapper = tree!.root.findByType("View");
    const icon = tree!.root.findByType("WnaIcon");

    expect(wrapper.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          height: actionButtonRightConstants.size,
          maxHeight: actionButtonRightConstants.size,
        }),
        expect.objectContaining({ marginTop: 12 }),
      ]),
    );
    expect(icon.props.color).toBe("#0aa");
  });
});
