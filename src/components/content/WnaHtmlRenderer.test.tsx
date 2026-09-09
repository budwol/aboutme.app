import { afterEach, describe, expect, it, jest } from "@jest/globals";
import React from "react";
import { Platform } from "react-native";
import TestRenderer, { act } from "react-test-renderer";
import WnaHtmlRenderer from "@components/content/WnaHtmlRenderer";

const originalPlatformOS = Platform.OS;

jest.mock("react-native-render-html", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return {
    __esModule: true,
    default: (props: unknown) =>
      createElement("RenderHtml", props as Record<string, unknown>),
    defaultSystemFonts: ["System"],
  };
});

jest.mock("expo-linear-gradient", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return {
    LinearGradient: (props: unknown) =>
      createElement("LinearGradient", props as Record<string, unknown>),
  };
});

const appColors = {
  isDark: false,
  white: "#ffffff",
  coolgray6: "#666666",
} as never;

const appStyle = {
  textSmall: {
    fontSize: 14,
    lineHeight: 18,
    color: "#333333",
    fontWeight: "400",
  },
  textNeutralLarge: {
    fontSize: 22,
    lineHeight: 28,
    color: "#111111",
    fontWeight: "600",
  },
  textNeutralTitleLarge: {
    fontSize: 20,
    lineHeight: 24,
    color: "#222222",
    fontWeight: "600",
  },
  textNeutralMedium: {
    fontSize: 16,
    lineHeight: 20,
    color: "#222222",
    fontWeight: "500",
  },
} as never;

describe("WnaHtmlRenderer", () => {
  afterEach(() => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: originalPlatformOS,
    });
  });

  it("renders sanitized html as a web div", () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaHtmlRenderer
          appColors={appColors}
          appStyle={appStyle}
          width={320}
          html={'<p>Hello</p><script>alert("x")</script>'}
          padding={8}
          fontFamily="Manrope"
          fontSize={15}
          fontColor="#123456"
        />,
      );
    });

    const div = tree!.root.findByType("div");

    expect(div.props.style).toEqual(
      expect.objectContaining({
        padding: 8,
        fontFamily: "Manrope",
        fontSize: 15,
        color: "#123456",
      }),
    );
    expect(div.props.dangerouslySetInnerHTML.__html).toContain("<p>Hello</p>");
    expect(div.props.dangerouslySetInnerHTML.__html).not.toContain("script");
  });

  it("renders native html and max-height gradient fallback for empty html", () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" });
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaHtmlRenderer
          appColors={appColors}
          appStyle={appStyle}
          width={320}
          html=""
          maxHeight={120}
        />,
      );
    });

    const renderer = tree!.root.findByType("RenderHtml");
    const gradient = tree!.root.findByType("LinearGradient");

    expect(renderer.props.contentWidth).toBe(320);
    expect(renderer.props.source.html).toBe("");
    expect(renderer.props.systemFonts).toEqual(
      expect.arrayContaining(["System", expect.stringContaining("Manrope")]),
    );
    expect(gradient.props.colors).toEqual(["#ffffff", "transparent"]);
    expect(gradient.props.style.height).toBe(60);
  });
});
