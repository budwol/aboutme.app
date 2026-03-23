import WnaHeroImage from "@components/images/WnaHeroImage";
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

jest.mock("expo-linear-gradient", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return {
    LinearGradient: (props: unknown) =>
      ReactModule.createElement(
        "LinearGradient",
        props as Record<string, unknown>,
      ),
  };
});

describe("WnaHeroImage", () => {
  it("applies the custom image height to the wrapper and image element", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaHeroImage
          appColors={{ staticBlack: "#000" } as never}
          imageUrl="images/project.webp"
          imageTitle="Project"
          style={{ height: 420 }}
        />,
      );
    });

    const wrapper = tree!.root.findByType("View");
    const image = tree!.root.findByType("WnaImage");

    expect(wrapper.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ height: 420 })]),
    );
    expect(image.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ height: 256 }),
        expect.objectContaining({ height: 420 }),
      ]),
    );
  });
});
