import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { Linking, View } from "react-native";
import WnaShareActions from "@components/sections/WnaShareActions";

let mockCurrentWindowWidth = 390;

type TestNode = {
  props: {
    style?: unknown;
  };
};

jest.mock("@components/WnaAppContext", () => ({
  useWnaLayout: () => ({
    currentWindowWidth: mockCurrentWindowWidth,
  }),
  useWnaTheme: () => ({
    appColors: {
      staticWhite: "#ffffff",
    },
    appStyle: {},
  }),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

jest.mock("@components/text/WnaSectionTitle", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaSectionTitle(props: unknown) {
    return createElement("WnaSectionTitle", props as Record<string, unknown>);
  };
});

jest.mock("@components/buttons/WnaButtonIcon", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaButtonIcon(props: unknown) {
    return createElement("WnaButtonIcon", props as Record<string, unknown>);
  };
});

describe("WnaShareActions", () => {
  function renderShareActions(width = 390) {
    mockCurrentWindowWidth = width;

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaShareActions
          url="https://example.com/projects?id=1&lang=de"
          title="Hello World"
        />,
      );
    });

    return tree!;
  }

  it("renders share actions and opens encoded share links", () => {
    const openUrlSpy = jest
      .spyOn(Linking, "openURL")
      .mockImplementation(() => Promise.resolve());
    const tree = renderShareActions();

    const title = tree.root.findByType("WnaSectionTitle");
    const buttons = tree.root.findAllByType("WnaButtonIcon");

    expect(title.props.title).toBe("actionShare");
    expect(buttons).toHaveLength(4);

    act(() => {
      buttons[0]!.props.onPress();
      buttons[2]!.props.onPress();
    });

    expect(openUrlSpy).toHaveBeenNthCalledWith(
      1,
      "https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fexample.com%2Fprojects%3Fid%3D1%26lang%3Dde",
    );
    expect(openUrlSpy).toHaveBeenNthCalledWith(
      2,
      "https://telegram.me/share/url?url=https%3A%2F%2Fexample.com%2Fprojects%3Fid%3D1%26lang%3Dde&text=Hello%20World",
    );

    openUrlSpy.mockRestore();
  });

  it("keeps share buttons constrained to two columns on narrow screens", () => {
    const tree = renderShareActions(360);
    const actionContainer = tree.root
      .findAllByType(View)
      .find((node: TestNode) => {
        const style = Array.isArray(node.props.style) ? node.props.style : [];

        return style.some(
          (entry: { maxWidth?: number } | false | undefined) =>
            entry && entry.maxWidth === 116,
        );
      });

    expect(actionContainer).toBeDefined();
    expect(actionContainer!.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          flexDirection: "row",
          flexWrap: "wrap",
          width: "100%",
        }),
        expect.objectContaining({
          maxWidth: 116,
        }),
      ]),
    );
  });

  it("uses the wider share row on larger screens", () => {
    const tree = renderShareActions(720);
    const actionContainer = tree.root
      .findAllByType(View)
      .find((node: TestNode) => {
        const style = Array.isArray(node.props.style) ? node.props.style : [];

        return style.some(
          (entry: { maxWidth?: number } | false | undefined) =>
            entry && entry.maxWidth === 320,
        );
      });

    expect(actionContainer).toBeDefined();
    expect(actionContainer!.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          flexWrap: "wrap",
          maxWidth: 320,
        }),
        false,
      ]),
    );
  });
});
