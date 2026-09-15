import WnaMultilineHeader from "@components/chrome/WnaMultilineHeader";
import { describe, expect, it, jest } from "@jest/globals";
import React, { CSSProperties } from "react";
import TestRenderer, { act } from "react-test-renderer";

jest.mock("@components/images/WnaImage", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockWnaImage(props: unknown) {
    return ReactModule.createElement(
      "WnaImage",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/buttons/WnaPressable", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockWnaPressable(props: unknown) {
    return ReactModule.createElement(
      "WnaPressable",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  };
});

describe("WnaMultilineHeader", () => {
  type HeaderTextNode = {
    props: {
      children?: React.ReactNode;
    };
  };

  type HeaderViewNode = {
    type: unknown;
    props: {
      style?: {
        height?: number;
        paddingLeft?: number;
      };
    };
    findAllByType: (type: string) => HeaderTextNode[];
  };

  const appColors = {
    staticWhite: "#ffffff",
  } as never;
  const appStyle = {
    textTitleLarge: {},
    textSmall: {},
  } as never;
  const appLayoutValues = {
    headerHeight: 64,
    globalCornerRadius: 16,
    headerButtonHeight: 48,
  };
  const appLayout = appLayoutValues as never;

  function renderHeader(isTabRoot: boolean) {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        WnaMultilineHeader(
          appColors,
          appStyle,
          appLayout,
          isTabRoot,
          false,
          "Projekt App",
        ),
      );
    });

    return tree!;
  }

  function renderSplitHeader() {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        WnaMultilineHeader(
          appColors,
          appStyle,
          appLayout,
          false,
          false,
          "Main | Sub",
        ),
      );
    });

    return tree!;
  }

  function findSingleLineTitleWrapper(
    tree: ReturnType<typeof TestRenderer.create>,
  ) {
    return tree.root.find(
      (node: HeaderViewNode) =>
        node.type === "div" &&
        node.props.style?.height === 64 &&
        node.props.style?.paddingLeft !== undefined &&
        node
          .findAllByType("span")
          .some(
            (textNode: HeaderTextNode) =>
              textNode.props.children === "Projekt App",
          ),
    );
  }

  it("keeps the extra left padding on root pages with logo", () => {
    const tree = renderHeader(true);
    const titleWrapper = findSingleLineTitleWrapper(tree);

    // Regression test: this box combines a fixed `height: 64` with
    // vertical padding on a real DOM div. Content-box (the browser
    // default) would add that padding on top of the 64px height, making
    // the box 80px tall instead of 64 — 24px more than the header row
    // actually has room for, which visibly pushed the title text below
    // the vertical center of the header's back button/icons.
    expect(titleWrapper.props.style).toEqual({
      display: "flex",
      flexDirection: "column",
      height: 64,
      boxSizing: "border-box",
      justifyContent: "center",
      alignItems: "center",
      padding: 8,
      paddingLeft: 16,
    });
    expect(tree.root.findAllByType("WnaImage")).toHaveLength(1);
  });

  it("does not add extra left padding on non-root pages", () => {
    const tree = renderHeader(false);
    const titleWrapper = findSingleLineTitleWrapper(tree);

    expect(titleWrapper.props.style).toEqual({
      display: "flex",
      flexDirection: "column",
      height: 64,
      boxSizing: "border-box",
      justifyContent: "center",
      alignItems: "center",
      padding: 8,
      paddingLeft: 8,
    });
    expect(tree.root.findAllByType("WnaImage")).toHaveLength(0);
  });

  it("keeps the pressable centering the header content on its exact declared height", () => {
    // Regression test: `WnaBasePressable`'s underlying `<button>` uses
    // `flex: 1` with the browser default `overflow: visible`, so it never
    // gets the CSS spec's automatic flex minimum-size override — its
    // content (this title box) silently forced it taller than the
    // explicit `height` below. Once that's fixed elsewhere, the button
    // also needs `alignItems`/`justifyContent: "center"` (its own default
    // packing is top-aligned, not centered) so the still-taller title
    // content overflows symmetrically instead of entirely downward.
    const tree = renderHeader(false);
    const pressable = tree.root.findByType("WnaPressable");

    expect(pressable.props.style).toEqual(
      expect.objectContaining({ height: appLayoutValues.headerButtonHeight }),
    );
    expect(pressable.props.baseStyle).toEqual({
      alignItems: "center",
      justifyContent: "center",
      minHeight: 0,
    });
  });

  it("splits pipe-separated titles into main and subtitle", () => {
    const tree = renderSplitHeader();
    const textValues = tree.root
      .findAllByType("span")
      .map((node: HeaderTextNode) => node.props.children);

    expect(textValues).toEqual(["Main", "Sub"]);
  });

  it("uses border-box sizing for the two-line title box too", () => {
    // Same regression as the single-line box above: `height` combined
    // with `padding` on a content-box div would render taller than the
    // declared `appLayoutValues.headerButtonHeight`.
    const tree = renderSplitHeader();
    const titleBox = tree.root.find(
      (node: HeaderViewNode) =>
        node.type === "div" &&
        node.props.style?.height === appLayoutValues.headerButtonHeight,
    ) as unknown as { props: { style: CSSProperties } };

    expect(titleBox.props.style).toEqual({
      display: "flex",
      flexDirection: "column",
      padding: 8,
      boxSizing: "border-box",
      flexShrink: 1,
      minWidth: 0,
      height: appLayoutValues.headerButtonHeight,
      justifyContent: "center",
    });
  });

  it("returns null when no header title is given", () => {
    const result = WnaMultilineHeader(
      appColors,
      appStyle,
      appLayout,
      false,
      false,
      undefined,
    );

    expect(result).toBeNull();
  });

  it("supports pressing the header without an onPress callback", () => {
    const tree = renderHeader(false);
    const pressable = tree.root.findByType("WnaPressable");

    expect(() => pressable.props.onPress()).not.toThrow();
  });

  it("uses the larger landscape font size for the main title", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        WnaMultilineHeader(
          appColors,
          appStyle,
          appLayout,
          true,
          true,
          "Projekt App",
        ),
      );
    });

    const titleWrapper = findSingleLineTitleWrapper(tree!);
    const titleText = titleWrapper
      .findAllByType("span")
      .find(
        (node: HeaderTextNode) => node.props.children === "Projekt App",
      ) as unknown as { props: { style: { fontSize?: number } } };

    expect(titleText.props.style).toEqual(
      expect.objectContaining({ fontSize: 20 }),
    );
  });
});
