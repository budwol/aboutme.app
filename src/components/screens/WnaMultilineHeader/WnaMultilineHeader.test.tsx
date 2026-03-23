import WnaMultilineHeader from "@components/screens/WnaMultilineHeader";
import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
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
  const appLayout = {
    headerHeight: 64,
    globalCornerRadius: 16,
    headerButtonHeight: 48,
  } as never;

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

  function findSingleLineTitleWrapper(
    tree: ReturnType<typeof TestRenderer.create>,
  ) {
    return tree.root.find(
      (node: HeaderViewNode) =>
        node.type === "View" &&
        node.props.style?.height === 64 &&
        node.props.style?.paddingLeft !== undefined &&
        node
          .findAllByType("Text")
          .some(
            (textNode: HeaderTextNode) =>
              textNode.props.children === "Projekt App",
          ),
    );
  }

  it("keeps the extra left padding on root pages with logo", () => {
    const tree = renderHeader(true);
    const titleWrapper = findSingleLineTitleWrapper(tree);

    expect(titleWrapper.props.style.paddingLeft).toBe(16);
    expect(tree.root.findAllByType("WnaImage")).toHaveLength(1);
  });

  it("does not add extra left padding on non-root pages", () => {
    const tree = renderHeader(false);
    const titleWrapper = findSingleLineTitleWrapper(tree);

    expect(titleWrapper.props.style.paddingLeft).toBe(8);
    expect(tree.root.findAllByType("WnaImage")).toHaveLength(0);
  });
});
