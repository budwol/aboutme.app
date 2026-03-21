import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaImageElement from "@components/images/WnaImageElement/WnaImageElement";

jest.mock("expo-image", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return {
    Image: (props: unknown) =>
      createElement("ExpoImage", props as Record<string, unknown>),
  };
});

describe("WnaImageElement", () => {
  it("updates the image source when props change", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaImageElement
          appColors={{} as never}
          imageUrl="/image-a.webp"
          altText="A"
        />,
      );
    });

    act(() => {
      tree!.update(
        <WnaImageElement
          appColors={{} as never}
          imageUrl="/image-b.webp"
          altText="B"
          grayScale
          contentFit="contain"
        />,
      );
    });

    const image = tree!.root.findByType("ExpoImage");

    expect(image.props.source).toBe("/image-b.webp");
    expect(image.props.alt).toBe("B");
    expect(image.props.contentFit).toBe("contain");
  });

  it("passes through responsive source configuration", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaImageElement
          appColors={{} as never}
          altText="Avatar"
          source={[
            {
              uri: "/images/ava_300.webp",
              width: 300,
              height: 300,
              webMaxViewportWidth: 1200,
            },
            {
              uri: "/images/ava.webp",
              width: 1024,
              height: 1024,
              webMaxViewportWidth: 2048,
            },
          ]}
          priority="high"
          responsivePolicy="static"
        />,
      );
    });

    const image = tree!.root.findByType("ExpoImage");

    expect(image.props.source).toEqual([
      {
        uri: "/images/ava_300.webp",
        width: 300,
        height: 300,
        webMaxViewportWidth: 1200,
      },
      {
        uri: "/images/ava.webp",
        width: 1024,
        height: 1024,
        webMaxViewportWidth: 2048,
      },
    ]);
    expect(image.props.priority).toBe("high");
    expect(image.props.responsivePolicy).toBe("static");
  });
});
