import { describe, expect, it, jest } from "@jest/globals";
import TestRenderer, { act } from "react-test-renderer";
import WnaHtmlRenderer, {
  areWnaHtmlRendererPropsEqual,
} from "@components/content/WnaHtmlRenderer";

jest.mock("@components/effects/WnaCssGradient", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return {
    __esModule: true,
    default: (props: unknown) =>
      createElement("WnaCssGradient", props as Record<string, unknown>),
  };
});

const appColors = {
  white: "#ffffff",
  coolgray6: "#666666",
  isDark: false,
} as never;

const appStyle = {} as never;

describe("WnaHtmlRenderer", () => {
  it("renders sanitized HTML and the optional fade overlay", () => {
    let plainTree: ReturnType<typeof TestRenderer.create> | undefined;
    let overlayTree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      plainTree = TestRenderer.create(
        <WnaHtmlRenderer
          appColors={appColors}
          appStyle={appStyle}
          width={320}
          html="<p>Safe</p>"
        />,
      );
      overlayTree = TestRenderer.create(
        <WnaHtmlRenderer
          appColors={appColors}
          appStyle={appStyle}
          width={320}
          maxHeight={120}
          html=""
          padding={8}
          fontFamily="Arial"
          fontSize={16}
          fontColor="#111111"
        />,
      );
    });

    expect(plainTree!.root.findAllByType("div")).toHaveLength(1);
    expect(overlayTree!.root.findAllByType("div")).toHaveLength(1);
    expect(overlayTree!.root.findAllByType("WnaCssGradient")).toHaveLength(1);

    expect(
      areWnaHtmlRendererPropsEqual(
        { appColors, appStyle, width: 320, html: "same" },
        { appColors, appStyle, width: 640, html: "same" },
      ),
    ).toBe(true);
    expect(
      areWnaHtmlRendererPropsEqual(
        { appColors, appStyle, width: 320, html: "same" },
        {
          appColors: { ...(appColors as object), isDark: true } as never,
          appStyle,
          width: 320,
          html: "same",
        },
      ),
    ).toBe(false);

    act(() => {
      plainTree!.update(
        <WnaHtmlRenderer
          appColors={appColors}
          appStyle={appStyle}
          width={320}
          html="<p>Changed</p>"
        />,
      );
      plainTree!.update(
        <WnaHtmlRenderer
          appColors={
            {
              ...(appColors as {
                isDark: boolean;
                white: string;
                coolgray6: string;
              }),
              isDark: true,
            } as never
          }
          appStyle={appStyle}
          width={320}
          html="<p>Changed</p>"
        />,
      );
      plainTree!.unmount();
      overlayTree!.unmount();
    });
  });
});
