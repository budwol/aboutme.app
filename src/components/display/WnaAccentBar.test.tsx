import { describe, expect, it, jest } from "@jest/globals";
import TestRenderer, { act } from "react-test-renderer";
import WnaAccentBar, {
  applyAccentBarWebStyles,
} from "@components/display/WnaAccentBar";

const appColors = {
  accent5: "#2277ee",
} as never;

describe("WnaAccentBar", () => {
  it("renders the static bar at the configured width", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaAccentBar appColors={appColors} width={180} />,
      );
    });

    const row = tree!.root.findByType("div");
    const bar = tree!.root.findAllByType("div")[1];

    expect(row.props.style).toEqual(
      expect.objectContaining({
        display: "flex",
        flexDirection: "column",
        alignSelf: "center",
        marginLeft: "auto",
        marginRight: "auto",
      }),
    );
    expect(row.props.style.width).toBe(180);
    expect(bar.props.style.width).toBe(180);
  });

  it("defaults to the standard width when none is given", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaAccentBar appColors={appColors} />);
    });

    const row = tree!.root.findByType("div");

    expect(row.props.style.width).toBe(220);
  });

  it("uses a CSS transition when enabled", () => {
    jest
      .spyOn(global, "requestAnimationFrame")
      .mockImplementation((callback: FrameRequestCallback) => {
        callback(0);

        return 1;
      });
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaAccentBar appColors={appColors} animated width={180} />,
      );
    });

    const bar = tree!.root.findAllByType("div")[1];
    expect(bar.props.style).toEqual(
      expect.objectContaining({
        width: 8,
        transition: "width 820ms cubic-bezier(0.33, 1, 0.68, 1)",
      }),
    );
  });

  it("keeps the bar painted at full width until two real frames have passed, so the browser has something to animate from", () => {
    // Regression test: collapsing isCollapsed to true within the same
    // effect tick as the mount (no rAF, or only one) lets React commit
    // both the starting and collapsed widths before the browser ever
    // paints the starting one -- the CSS transition then has nothing to
    // interpolate from and the bar snaps straight to its collapsed width
    // instead of visibly animating there.
    const frameCallbacks: FrameRequestCallback[] = [];
    jest
      .spyOn(global, "requestAnimationFrame")
      .mockImplementation((callback: FrameRequestCallback) => {
        frameCallbacks.push(callback);

        return frameCallbacks.length;
      });
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaAccentBar appColors={appColors} animated width={180} />,
      );
    });

    expect(tree!.root.findAllByType("div")[1].props.style.width).toBe(180);

    act(() => {
      frameCallbacks.shift()!(0);
    });

    expect(tree!.root.findAllByType("div")[1].props.style.width).toBe(180);

    act(() => {
      frameCallbacks.shift()!(0);
    });

    expect(tree!.root.findAllByType("div")[1].props.style.width).toBe(8);
  });

  it("cancels the pending collapse frame if unmounted first", () => {
    const cancelAnimationFrame = jest.spyOn(global, "cancelAnimationFrame");
    jest.spyOn(global, "requestAnimationFrame").mockImplementation(() => 42);
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaAccentBar appColors={appColors} animated width={180} />,
      );
    });

    act(() => {
      tree!.unmount();
    });

    expect(cancelAnimationFrame).toHaveBeenCalledWith(42);
  });

  it("uses CSS keyframes for pulsing bars", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaAccentBar
          appColors={appColors}
          width={180}
          pulseToWidth={45}
          pulseDuration={1200}
        />,
      );
    });

    const bar = tree!.root.findAllByType("div")[1];
    expect(bar.props.style).toEqual(
      expect.objectContaining({
        "--wna-accent-bar-pulse-scale": 0.25,
        "--wna-accent-bar-duration": "2400ms",
        animation: "wna-accent-bar-pulse 2400ms ease-in-out infinite alternate",
      }),
    );
    expect(bar.props.className).toBe("wna-accent-bar-pulse");
  });

  it("sets pulsing CSS variables on a web element", () => {
    const setProperty = jest.fn();

    applyAccentBarWebStyles({ style: { setProperty } }, 0.25, "2400ms");

    expect(setProperty).toHaveBeenCalledWith(
      "--wna-accent-bar-pulse-scale",
      "0.25",
    );
    expect(setProperty).toHaveBeenCalledWith(
      "--wna-accent-bar-duration",
      "2400ms",
    );
  });

  it("uses the dedicated slow hero pulse for the profile bar", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaAccentBar
          appColors={appColors}
          width={112}
          pulseToWidth={24}
          pulseDuration={30000}
        />,
      );
    });

    const bar = tree!.root.findAllByType("div")[1];
    expect(bar.props.className).toBe("wna-accent-bar-pulse-hero");
    expect(bar.props.style.animation).toBe(
      "wna-accent-bar-pulse-hero 60000ms ease-in-out infinite alternate",
    );
    expect(bar.props.style["--wna-accent-bar-pulse-scale"]).toBe(24 / 112);
  });
});
