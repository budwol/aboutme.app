import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaImage from "@components/images/WnaImage";

jest.mock("@components/images/WnaImageElement/WnaImageElement", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockWnaImageElement(props: unknown) {
    return ReactModule.createElement(
      "WnaImageElement",
      props as Record<string, unknown>,
    );
  };
});

describe("WnaImage", () => {
  it("normalizes local image asset paths to absolute web paths", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaImage
          appColors={{} as never}
          imageUrl="images/ava.webp"
          imageTitle="Avatar"
        />,
      );
    });

    const image = tree!.root.findByType("WnaImageElement");

    expect(image.props.imageUrl).toBe("/images/ava.webp");
  });
});
