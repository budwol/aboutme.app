import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import Colors from "@constants/theme/colors";
import WnaToastHost, {
  renderWnaToastCard,
} from "@components/feedback/WnaToastHost";
import { showWnaToast } from "@components/feedback/wnaToast";

const appColors = {
  isDark: false,
  accent5: "#2277ee",
  staticBlack: "#000000",
  background: "#ffffff",
  white: "#ffffff",
  black: "#111111",
  coolgray2: "#dddddd",
  coolgray4: "#999999",
  coolgray6: "#666666",
  coolgray8: "#111111",
} as unknown as Colors;

type RenderedTextNode = {
  props: {
    children?: unknown;
  };
};

describe("WnaToastHost", () => {
  it("renders toast content with fallback and override colors", () => {
    let fallbackCard: ReturnType<typeof TestRenderer.create> | undefined;
    let darkCard: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      fallbackCard = TestRenderer.create(
        renderWnaToastCard(appColors, "Saved", "Done"),
      );
      darkCard = TestRenderer.create(
        renderWnaToastCard(
          { ...appColors, isDark: true, background: "#101010" } as Colors,
          "Alert",
          "Failed",
        ),
      );
    });

    expect(
      fallbackCard.root
        .findAllByType("span")
        .map((node: RenderedTextNode) => node.props.children),
    ).toEqual(["Saved", "Done"]);
    expect(fallbackCard.root.findAllByType("div")[0].props.style).toEqual(
      expect.objectContaining({ backgroundColor: "rgba(255,255,255,0.98)" }),
    );
    expect(darkCard.root.findAllByType("div")[0].props.style).toEqual(
      expect.objectContaining({ backgroundColor: "rgba(16,16,16,0.98)" }),
    );

    act(() => {
      fallbackCard!.unmount();
      darkCard!.unmount();
    });
  });

  it("supports toast cards without either text line", () => {
    let titleOnly: ReturnType<typeof TestRenderer.create> | undefined;
    let bodyOnly: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      titleOnly = TestRenderer.create(renderWnaToastCard(appColors, "Title"));
      bodyOnly = TestRenderer.create(
        renderWnaToastCard(appColors, undefined, "Body"),
      );
    });

    expect(titleOnly!.root.findAllByType("span")).toHaveLength(1);
    expect(bodyOnly!.root.findAllByType("span")).toHaveLength(1);

    act(() => {
      titleOnly!.unmount();
      bodyOnly!.unmount();
    });
  });

  it("shows a toast and removes it after its display duration", () => {
    jest.useFakeTimers();
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaToastHost appColors={appColors} />);
    });
    act(() => {
      showWnaToast({ type: "info", text1: "Info", text2: "More" });
      showWnaToast({ type: "info", text1: "Updated", text2: "Again" });
    });

    expect(tree!.root.findAllByType("span")).toHaveLength(2);

    act(() => {
      jest.advanceTimersByTime(2400);
    });

    expect(tree!.root.findAllByType("span")).toHaveLength(0);

    act(() => {
      showWnaToast({ type: "success", text2: "Cleanup" });
    });

    act(() => {
      tree!.unmount();
    });

    jest.useRealTimers();
  });

  it("keeps the toast card within its max-width using border-box sizing", () => {
    // Regression test: this card combines `width: "100%"` with
    // `paddingInline: 18` on a real DOM div. Content-box (the browser
    // default) would add that padding on top of the 100%-of-parent
    // width, making the toast 36px wider than intended and able to
    // overflow past the edge of the screen it's anchored to.
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(renderWnaToastCard(appColors, "Saved"));
    });

    const style = tree!.root.findAllByType("div")[0].props.style as Record<
      string,
      unknown
    >;

    expect({
      width: style.width,
      boxSizing: style.boxSizing,
      maxWidth: style.maxWidth,
      paddingInline: style.paddingInline,
      paddingBlock: style.paddingBlock,
    }).toEqual({
      width: "100%",
      boxSizing: "border-box",
      maxWidth: 328,
      paddingInline: 18,
      paddingBlock: 16,
    });

    act(() => {
      tree!.unmount();
    });
  });

  it("unsubscribes cleanly when no toast is active", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaToastHost appColors={appColors} />);
    });
    act(() => {
      tree!.unmount();
    });
  });
});
