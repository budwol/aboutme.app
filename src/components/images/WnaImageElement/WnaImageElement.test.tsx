import { describe, expect, it } from "@jest/globals";
import TestRenderer, { act } from "react-test-renderer";
import WnaImageElement from "@components/images/WnaImageElement/WnaImageElement";

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

    const image = tree!.root.findByType("img");

    expect(image.props.src).toBe("/image-b.webp");
    expect(image.props.alt).toBe("B");
    expect(image.props.style.objectFit).toBe("contain");
  });

  it("flattens nested and conditional styles for the DOM image", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaImageElement
          appColors={{} as never}
          imageUrl="/image.webp"
          altText="Image"
          style={[
            { width: 120 },
            false,
            [{ height: 80 }, null, { borderRadius: 4 }],
          ]}
        />,
      );
    });

    const image = tree!.root.findByType("img");

    expect(image.props.style).toEqual(
      expect.objectContaining({
        width: 120,
        height: 80,
        borderRadius: 4,
      }),
    );
    expect(Object.keys(image.props.style)).not.toContain("0");
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

    const image = tree!.root.findByType("img");

    expect(image.props.src).toBe("/images/ava_300.webp");
    expect(image.props.srcSet).toBe(
      "/images/ava_300.webp 300w, /images/ava.webp 1024w",
    );
    expect(image.props.sizes).toBe("(max-width: 1200px) 300px, 1024px");
    expect(image.props.loading).toBe("eager");
    expect(image.props.fetchPriority).toBe("high");
  });

  it("accepts a single responsive source object", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaImageElement
          appColors={{} as never}
          altText="Avatar"
          source={{ uri: "/images/avatar.webp", width: 1024 }}
        />,
      );
    });

    const image = tree!.root.findByType("img");
    expect(image.props.src).toBe("/images/avatar.webp");
    expect(image.props.srcSet).toBe("/images/avatar.webp 1024w");
  });

  it("accepts a string source", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaImageElement
          appColors={{} as never}
          altText="Image"
          source="/images/image.webp"
        />,
      );
    });

    expect(tree!.root.findByType("img").props.src).toBe("/images/image.webp");
  });

  it("falls back to an empty source when neither source nor imageUrl is given", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaImageElement appColors={{} as never} altText="Empty" />,
      );
    });

    const image = tree!.root.findByType("img");

    expect(image.props.src).toBe("");
  });

  it("reveals the image after it has loaded", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaImageElement
          appColors={{} as never}
          imageUrl="/image.webp"
          altText="Image"
        />,
      );
    });

    const image = tree!.root.findByType("img");
    expect(image.props.style.opacity).toBe(0);

    act(() => {
      image.props.onLoad();
    });

    expect(tree!.root.findByType("img").props.style.opacity).toBe(1);
  });
});
