import { describe, expect, it, jest } from "@jest/globals";
import TestRenderer, { act } from "react-test-renderer";
import Colors from "@constants/theme/colors";
import { convertHexToRgba } from "@utils/colorConverter";
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
    expect(fallbackCard.root.findAllByType("div")[0].props.style).toEqual({
      width: "100%",
      boxSizing: "border-box",
      maxWidth: 328,
      minHeight: 78,
      borderRadius: 18,
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: convertHexToRgba(appColors.coolgray2, 0.78),
      backgroundColor: convertHexToRgba(appColors.white, 0.98),
      paddingInline: 18,
      paddingBlock: 16,
      boxShadow: `0px 12px 22px ${convertHexToRgba(appColors.staticBlack, 0.12)}`,
      overflow: "hidden",
    });
    const darkAppColors = {
      ...appColors,
      isDark: true,
      background: "#101010",
    } as Colors;
    expect(darkCard.root.findAllByType("div")[0].props.style).toEqual({
      width: "100%",
      boxSizing: "border-box",
      maxWidth: 328,
      minHeight: 78,
      borderRadius: 18,
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: convertHexToRgba(darkAppColors.coolgray4, 0.3),
      backgroundColor: convertHexToRgba(darkAppColors.background, 0.98),
      paddingInline: 18,
      paddingBlock: 16,
      boxShadow: `0px 12px 22px ${convertHexToRgba(darkAppColors.staticBlack, 0.24)}`,
      overflow: "hidden",
    });

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

    // Display time is over: fading out, but still mounted until the exit
    // transition has finished.
    act(() => {
      jest.advanceTimersByTime(2400);
    });

    expect(tree!.root.findAllByType("span")).toHaveLength(2);

    act(() => {
      jest.advanceTimersByTime(180);
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

  describe("animation", () => {
    type HostNode = { props: { style: Record<string, unknown> } };

    function renderHost() {
      const getBoundingClientRect = jest.fn();
      let tree: ReturnType<typeof TestRenderer.create> | undefined;
      act(() => {
        tree = TestRenderer.create(<WnaToastHost appColors={appColors} />, {
          createNodeMock: () => ({ getBoundingClientRect }),
        });
      });
      const hostStyle = () =>
        (tree!.root.findAllByType("div")[0] as unknown as HostNode).props.style;
      return { tree: tree!, hostStyle, getBoundingClientRect };
    }

    it("slides and fades in, then fades out before unmounting", () => {
      jest.useFakeTimers();
      const { tree, hostStyle, getBoundingClientRect } = renderHost();

      act(() => {
        showWnaToast({ type: "info", text2: "Hello" });
      });

      // The hidden start frame was flushed, then switched to shown.
      expect(getBoundingClientRect).toHaveBeenCalled();
      expect(hostStyle()).toMatchObject({
        opacity: 1,
        transform: "none",
        transition: "opacity 220ms ease-out, transform 220ms ease-out",
      });

      act(() => {
        jest.advanceTimersByTime(2400);
      });

      expect(hostStyle()).toMatchObject({
        opacity: 0,
        transform: "translateY(-16px) scale(0.98)",
        transition: "opacity 180ms ease-in, transform 180ms ease-in",
      });

      act(() => {
        tree.unmount();
      });
      jest.useRealTimers();
    });

    it("animates back in when a new toast arrives mid-fade-out", () => {
      jest.useFakeTimers();
      const { tree, hostStyle } = renderHost();

      act(() => {
        showWnaToast({ type: "info", text2: "First" });
      });
      act(() => {
        jest.advanceTimersByTime(2400 + 90);
      });
      expect(hostStyle().opacity).toBe(0);

      act(() => {
        showWnaToast({ type: "info", text2: "Second" });
      });
      // The pending unmount from the first toast was cancelled.
      act(() => {
        jest.advanceTimersByTime(180);
      });

      expect(hostStyle().opacity).toBe(1);
      expect(
        tree.root
          .findAllByType("span")
          .map((node: RenderedTextNode) => node.props.children),
      ).toEqual(["Second"]);

      act(() => {
        tree.unmount();
      });
      jest.useRealTimers();
    });

    it("swaps the content in place when a new toast arrives while one is shown", () => {
      jest.useFakeTimers();
      const { tree, hostStyle, getBoundingClientRect } = renderHost();

      act(() => {
        showWnaToast({ type: "info", text2: "First" });
      });
      getBoundingClientRect.mockClear();
      act(() => {
        jest.advanceTimersByTime(1000);
        showWnaToast({ type: "info", text2: "Second" });
      });

      // No re-entry frame: it stays shown and just shows the new text.
      expect(getBoundingClientRect).not.toHaveBeenCalled();
      expect(hostStyle().opacity).toBe(1);
      expect(
        tree.root
          .findAllByType("span")
          .map((node: RenderedTextNode) => node.props.children),
      ).toEqual(["Second"]);

      // The display timer restarted with the second toast.
      act(() => {
        jest.advanceTimersByTime(2399);
      });
      expect(hostStyle().opacity).toBe(1);

      act(() => {
        tree.unmount();
      });
      jest.useRealTimers();
    });

    it("only fades, without sliding, when reduced motion is preferred", () => {
      jest.useFakeTimers();
      const matchMedia = jest.fn(() => ({ matches: true }));
      Object.defineProperty(window, "matchMedia", {
        configurable: true,
        value: matchMedia,
      });
      const { tree, hostStyle } = renderHost();

      act(() => {
        showWnaToast({ type: "info", text2: "Hello" });
      });
      act(() => {
        jest.advanceTimersByTime(2400);
      });

      expect(matchMedia).toHaveBeenCalledWith(
        "(prefers-reduced-motion: reduce)",
      );
      expect(hostStyle()).toMatchObject({ opacity: 0, transform: "none" });

      act(() => {
        tree.unmount();
      });
      delete (window as { matchMedia?: unknown }).matchMedia;
      jest.useRealTimers();
    });
  });
});
