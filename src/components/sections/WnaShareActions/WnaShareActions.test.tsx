import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { Linking } from "react-native";
import WnaShareActions from "@components/sections/WnaShareActions";

jest.mock("@components/WnaAppContext", () => ({
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
  it("renders share actions and opens encoded share links", () => {
    const openUrlSpy = jest
      .spyOn(Linking, "openURL")
      .mockImplementation(() => Promise.resolve());
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaShareActions
          url="https://example.com/projects?id=1&lang=de"
          title="Hello World"
        />,
      );
    });

    const title = tree!.root.findByType("WnaSectionTitle");
    const buttons = tree!.root.findAllByType("WnaButtonIcon");

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
});
