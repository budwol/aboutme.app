import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaImage from "@components/images/WnaImage";

const mockLoggerWarn = jest.fn();
const mockLoggerError = jest.fn();
const mockWnaImageElement = jest.fn();

jest.mock("@/utils/logger", () => ({
  warn: (...args: unknown[]) => mockLoggerWarn(...args),
  error: (...args: unknown[]) => mockLoggerError(...args),
}));

jest.mock("@components/images/WnaImageElement/WnaImageElement", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require("react");

  return function MockWnaImageElement(props: unknown) {
    mockWnaImageElement(props);

    return ReactModule.createElement(
      "WnaImageElement",
      props as Record<string, unknown>,
    );
  };
});

describe("WnaImage", () => {
  const appColors = {} as never;

  beforeEach(() => {
    mockLoggerWarn.mockClear();
    mockLoggerError.mockClear();
    mockWnaImageElement.mockClear();
  });

  it("normalizes local image asset paths to absolute web paths", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaImage
          appColors={appColors}
          imageUrl="images/ava.webp"
          imageTitle="Avatar"
        />,
      );
    });

    const image = tree!.root.findByType("WnaImageElement");

    expect(image.props.imageUrl).toBe("/images/ava.webp");
  });

  it("normalizes responsive image sources to absolute web paths", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaImage
          appColors={appColors}
          imageUrl="images/ava.webp"
          imageTitle="Avatar"
          sources={[
            {
              imageUrl: "images/ava_300.webp",
              width: 300,
              webMaxViewportWidth: 1200,
            },
            {
              imageUrl: "images/ava.webp",
              width: 1024,
              webMaxViewportWidth: 2048,
            },
          ]}
          priority="high"
          responsivePolicy="static"
        />,
      );
    });

    const image = tree!.root.findByType("WnaImageElement");

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

  it("falls back from an empty image URL to thumbnail and placeholder URLs", () => {
    let thumbnailTree: ReturnType<typeof TestRenderer.create> | undefined;
    let placeholderTree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      thumbnailTree = TestRenderer.create(
        <WnaImage
          appColors={appColors}
          imageUrl=""
          imageTitle="Thumbnail"
          thumbnailUrl="thumb.webp"
          placeholderUrl="placeholder.webp"
        />,
      );
      placeholderTree = TestRenderer.create(
        <WnaImage
          appColors={appColors}
          imageUrl=""
          imageTitle="Placeholder"
          placeholderUrl="placeholder.webp"
        />,
      );
    });

    expect(thumbnailTree!.root.findAllByType("WnaImageElement")).toHaveLength(
      0,
    );
    expect(placeholderTree!.root.findAllByType("WnaImageElement")).toHaveLength(
      0,
    );
    expect(mockLoggerWarn).not.toHaveBeenCalled();
  });

  it("shows only the activity indicator for an empty image without fallbacks", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaImage
          appColors={appColors}
          imageUrl=""
          imageTitle="Missing"
          showActivityIndicator
        />,
      );
    });

    expect(mockLoggerWarn).toHaveBeenCalledWith(
      "WnaImage",
      "imageUrl is empty",
    );
    expect(tree!.root.findAllByType("WnaImageElement")).toHaveLength(0);
    expect(tree!.root.findByProps({ role: "progressbar" })).toBeTruthy();
  });

  it("keeps remote sources loading against a local placeholder", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaImage
          appColors={appColors}
          imageUrl="https://cdn.example.com/full.webp"
          imageTitle="Remote"
          placeholderUrl="placeholder.webp"
          hideBackground
        />,
      );
    });

    const wrapper = tree!.root.findByType("div");

    expect(tree!.root.findByType("WnaImageElement").props.source).toBe(
      "https://cdn.example.com/full.webp",
    );
    expect(wrapper.props.style.backgroundColor).toBe("transparent");
  });

  it("flattens an array style into a single merged wrapper style", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaImage
          appColors={appColors}
          imageUrl="images/project.webp"
          imageTitle="Project"
          style={[{ width: 100 }, { height: 200 }]}
        />,
      );
    });

    const wrapper = tree!.root.findByType("div");

    expect(wrapper.props.style).toEqual(
      expect.objectContaining({ width: 100, height: 200 }),
    );
  });

  it("falls back to empty state and logs when resolving the image throws", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaImage
          appColors={appColors}
          imageUrl=""
          imageTitle="Broken"
          thumbnailUrl={999 as unknown as string}
        />,
      );
    });

    expect(mockLoggerError).toHaveBeenCalledWith("WnaImage", expect.any(Error));
    expect(tree!.root.findAllByType("WnaImageElement")).toHaveLength(0);
  });

  it("falls back to the image URL for alt text when no title is given", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaImage
          appColors={appColors}
          imageUrl="images/ava.webp"
          imageTitle={undefined as unknown as string}
        />,
      );
    });

    const image = tree!.root.findByType("WnaImageElement");

    expect(image.props.altText).toContain("images/ava.webp");
  });

  it("does not re-render while memoized visual props stay unchanged", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;
    const stableStyle = { width: 100 };

    act(() => {
      tree = TestRenderer.create(
        <WnaImage
          appColors={appColors}
          imageUrl="images/ava.webp"
          imageTitle="Avatar"
          style={stableStyle}
        />,
      );
    });

    expect(mockWnaImageElement).toHaveBeenCalledTimes(1);

    act(() => {
      tree!.update(
        <WnaImage
          appColors={appColors}
          imageUrl="images/ava.webp"
          imageTitle="Avatar"
          style={stableStyle}
        />,
      );
    });

    expect(mockWnaImageElement).toHaveBeenCalledTimes(1);

    act(() => {
      tree!.update(
        <WnaImage
          appColors={appColors}
          imageUrl="images/ava.webp"
          imageTitle="Avatar updated"
          style={stableStyle}
        />,
      );
    });

    expect(mockWnaImageElement).toHaveBeenCalledTimes(2);
  });
});
