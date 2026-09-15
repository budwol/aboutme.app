import { describe, expect, it, jest } from "@jest/globals";
import TestRenderer, { act } from "react-test-renderer";
import WnaSectionTitle from "@components/text/WnaSectionTitle";

jest.mock("@components/display/WnaAccentBar", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaAccentBar(props: unknown) {
    return createElement("WnaAccentBar", props as Record<string, unknown>);
  };
});

jest.mock("@components/display/WnaSeparatorHorizontal", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaSeparatorHorizontal(props: unknown) {
    return createElement(
      "WnaSeparatorHorizontal",
      props as Record<string, unknown>,
    );
  };
});

const appColors = {
  black: "#000000",
} as never;

const appStyle = {
  textExtraLarge: {},
  textNeutralSubtitle: {},
} as never;

describe("WnaSectionTitle", () => {
  it("renders only the title when no subtitle is provided", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaSectionTitle
          appColors={appColors}
          appStyle={appStyle}
          title="Title only"
        />,
      );
    });

    expect(tree!.root.findByType("span").props.children).toBe("Title only");
    expect(tree!.root.findAllByType("WnaSeparatorHorizontal")).toHaveLength(0);
    expect(tree!.root.findAllByType("WnaAccentBar")).toHaveLength(0);
  });

  it("renders the subtitle without the accent bar by default", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaSectionTitle
          appColors={appColors}
          appStyle={appStyle}
          title="Title"
          subtitle="Subtitle"
        />,
      );
    });

    const separators = tree!.root.findAllByType("WnaSeparatorHorizontal");

    expect(separators).toHaveLength(2);
    expect(separators[0].props.space).toBe(8);
    expect(separators[1].props.space).toBe(8);
    expect(tree!.root.findAllByType("WnaAccentBar")).toHaveLength(0);
    expect(
      tree!.root
        .findAllByType("span")
        .find(
          (node: { props: { children?: unknown } }) =>
            node.props.children === "Subtitle",
        ),
    ).toBeTruthy();
  });

  it("renders the accent bar and extra separator when showAccentBar is true", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaSectionTitle
          appColors={appColors}
          appStyle={appStyle}
          title="Title"
          subtitle="Subtitle"
          showAccentBar
          accentBarWidth={64}
          accentBarPulseToWidth={16}
          accentBarPulseDuration={2000}
        />,
      );
    });

    const separators = tree!.root.findAllByType("WnaSeparatorHorizontal");
    const accentBars = tree!.root.findAllByType("WnaAccentBar");

    expect(separators).toHaveLength(3);
    expect(separators[0].props.space).toBe(10);
    expect(separators[1].props.space).toBe(10);
    expect(separators[2].props.space).toBe(8);
    expect(accentBars).toHaveLength(1);
    expect(accentBars[0].props.width).toBe(64);
    expect(accentBars[0].props.pulseToWidth).toBe(16);
    expect(accentBars[0].props.pulseDuration).toBe(2000);
  });

  it("uses a custom title text color when provided", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaSectionTitle
          appColors={appColors}
          appStyle={appStyle}
          title="Title"
          titleTextColor="#ff0000"
        />,
      );
    });

    const titleText = tree!.root.findByType("span");

    expect(titleText.props.style).toEqual(
      expect.objectContaining({ color: "#ff0000" }),
    );
  });
});
