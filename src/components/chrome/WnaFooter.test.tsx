import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { WnaFooter } from "@components/chrome/WnaFooter";

jest.mock("@components/effects/WnaCssGradient", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return {
    __esModule: true,
    default: (props: unknown) =>
      createElement(
        "WnaCssGradient",
        props as Record<string, unknown>,
        (props as { children?: React.ReactNode }).children,
      ),
  };
});

const appColors = {
  accent6: "#00aa99",
  red4: "#cc0000",
  white: "#ffffff",
  staticWhite: "#ffffff",
} as never;

const appStyle = {
  textMicro: { fontSize: 11 },
} as never;

describe("WnaFooter", () => {
  it("renders no offline banner while internet is reachable", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaFooter
          appColors={appColors}
          appStyle={appStyle}
          isLandscape={false}
          isInternetReachable
          t={((value: string) => value) as never}
        />,
      );
    });

    expect(tree!.toJSON()).toBeNull();
  });

  it("renders the localized offline banner in landscape layout", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaFooter
          appColors={appColors}
          appStyle={appStyle}
          isLandscape
          isInternetReachable={false}
          t={((value: string) => value) as never}
        />,
      );
    });

    const gradient = tree!.root.findByType("WnaCssGradient");
    const text = tree!.root.findByType("Text");

    expect(gradient.props.colors).toEqual([
      "rgba(255,255,255,0)",
      "rgba(204,0,0,0)",
      "#cc0000",
      "rgba(204,0,0,0)",
      "rgba(255,255,255,0)",
    ]);
    expect(gradient.props.style.alignItems).toBe("flex-end");
    expect(text.props.children).toBe("ERRORNOINTERNET");
  });

  it("centers the offline banner in portrait layout", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaFooter
          appColors={appColors}
          appStyle={appStyle}
          isLandscape={false}
          isInternetReachable={false}
          t={((value: string) => value) as never}
        />,
      );
    });

    const gradient = tree!.root.findByType("WnaCssGradient");

    expect(gradient.props.style.alignItems).toBe("center");
  });
});
