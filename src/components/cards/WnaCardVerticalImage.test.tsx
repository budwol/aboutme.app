import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import TestRenderer, { act } from "react-test-renderer";
import WnaCardVerticalImage from "@components/cards/WnaCardVerticalImage";

const mockWnaImage = jest.fn();

jest.mock("@components/images/WnaImage", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaImage(props: unknown) {
    mockWnaImage(props);

    return createElement("WnaImage", props as Record<string, unknown>);
  };
});

jest.mock("@components/cards/WnaCardTextContent", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaVerticalCardTextContent(props: unknown) {
    return createElement(
      "WnaCardTextContent",
      props as Record<string, unknown>,
    );
  };
});

describe("WnaCardVerticalImage", () => {
  const appColors = {
    warmgray6: "#666666",
    coolgray2: "#222222",
    black: "#000000",
  } as never;

  beforeEach(() => {
    mockWnaImage.mockClear();
  });

  it("renders the image and forwards text props to the shared content component", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaCardVerticalImage
          appColors={appColors}
          appStyle={{} as never}
          imageUrl="images/project.png"
          text1="Project One"
          text2="Subtitle"
          width={300}
        />,
      );
    });

    const image = tree!.root.findByType("WnaImage");
    const content = tree!.root.findByType("WnaCardTextContent");

    expect(image.props.imageUrl).toBe("images/project.png");
    expect(image.props.style).toMatchObject({ width: 300, height: 150 });
    expect(content.props.title).toBe("Project One");
    expect(content.props.subtitle).toBe("Subtitle");
    expect(content.props.subtitleAlign).toBe("center");
    expect(content.props.subtitleMinHeight).toBe(52);
    expect(content.props.titleAlign).toBe("center");
    expect(content.props.titleMinHeight).toBe(40);
    expect(content.props.titleNumberOfLines).toBe(2);
    expect(content.props.titlePaddingHorizontal).toBe(12);
    expect(content.props.subtitleNumberOfLines).toBe(2);
    expect(content.props.subtitlePaddingHorizontal).toBe(12);
  });

  it("keeps a custom image height when provided", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaCardVerticalImage
          appColors={appColors}
          appStyle={{} as never}
          imageUrl="images/project.png"
          text1="Project One"
          text2="Subtitle"
          width={300}
          height={128}
        />,
      );
    });

    const image = tree!.root.findByType("WnaImage");

    expect(image.props.style).toMatchObject({ width: 300, height: 128 });
  });

  it("keeps a custom text area height when provided", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaCardVerticalImage
          appColors={appColors}
          appStyle={{} as never}
          imageUrl="images/project.png"
          text1="Project One"
          text2="Subtitle"
          contentMinHeight={78}
        />,
      );
    });

    const textWrap = tree!.root.findAllByType("div")[1];

    expect(textWrap.props.style).toMatchObject({ minHeight: 78 });
  });

  it("falls back to empty image title and url when omitted", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaCardVerticalImage appColors={appColors} appStyle={{} as never} />,
      );
    });

    const image = tree!.root.findByType("WnaImage");

    expect(image.props.imageTitle).toBe("");
    expect(image.props.imageUrl).toBe("");
  });

  it("skips re-rendering while memoized image props stay stable", () => {
    const props = {
      appColors,
      appStyle: {} as never,
      imageUrl: "images/project.png",
      text1: "Project One",
      text2: "Subtitle",
      width: 300,
    };
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaCardVerticalImage {...props} />);
    });

    expect(mockWnaImage).toHaveBeenCalledTimes(1);

    act(() => {
      tree!.update(<WnaCardVerticalImage {...props} />);
    });

    expect(mockWnaImage).toHaveBeenCalledTimes(1);

    act(() => {
      tree!.update(<WnaCardVerticalImage {...props} width={320} />);
    });

    expect(mockWnaImage).toHaveBeenCalledTimes(2);
  });
});
