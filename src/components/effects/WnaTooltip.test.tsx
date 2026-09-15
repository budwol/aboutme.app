import { describe, expect, it } from "@jest/globals";
import TestRenderer, { act } from "react-test-renderer";
import WnaTooltip, { WnaTooltipPosition } from "@components/effects/WnaTooltip";

describe("WnaTooltip", () => {
  it.each(["top", "right", "bottom", "left"] as WnaTooltipPosition[])(
    "centers %s tooltips on both axes regardless of flex direction",
    (position) => {
      // Regression test: this used to only check alignItems for top/
      // bottom and justifyContent for left/right, on the assumption that
      // the positioner's flex container defaults to React Native's
      // column direction. It renders as a plain `display: flex` <div>
      // (CSS default: row), which swaps which property controls which
      // axis — a tooltip centered only on the "expected" property still
      // hugs the anchor's edge on the other axis. Both properties must
      // be "center" for every position so centering doesn't depend on
      // flex direction at all.
      let tree: ReturnType<typeof TestRenderer.create> | undefined;

      act(() => {
        tree = TestRenderer.create(
          <WnaTooltip content="E-Mail" position={position} visible />,
        );
      });

      const positioner = tree!.root.findAllByType("div")[0];
      expect(positioner.props.style).toEqual(
        expect.objectContaining({
          alignItems: "center",
          justifyContent: "center",
        }),
      );
    },
  );

  it.each([
    ["top", "column"],
    ["bottom", "column"],
    ["right", "row"],
    ["left", "row"],
  ])(
    "stacks the %s tooltip's bubble and caret as a %s so the caret points at the anchor",
    (...args) => {
      // Regression test: the bubble and its caret are row-siblings in the
      // DOM for every position. top/bottom need flexDirection "column" to
      // stack the caret above/below the bubble (pointing at the anchor);
      // without it, the caret renders beside the bubble's text instead
      // (the "nose" ends up next to the tooltip instead of on it). This
      // used to be React Native View's implicit column default, lost in
      // the plain-DOM conversion for top/bottom only (right/left already
      // set flexDirection: "row" explicitly, correctly keeping the caret
      // beside the bubble there).
      const [position, flexDirection] = args as [WnaTooltipPosition, string];
      let tree: ReturnType<typeof TestRenderer.create> | undefined;

      act(() => {
        tree = TestRenderer.create(
          <WnaTooltip content="E-Mail" position={position} visible />,
        );
      });

      const positioner = tree!.root.findAllByType("div")[0];
      expect(positioner.props.style).toEqual(
        expect.objectContaining({ flexDirection }),
      );
    },
  );

  it("keeps long labels on one line and hides inactive tooltips", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaTooltip content="E-Mail" position="bottom" visible={false} />,
      );
    });

    const positioner = tree!.root.findAllByType("div")[0];
    const text = tree!.root.findByType("span");

    expect(positioner.props.style).toEqual(
      expect.objectContaining({ opacity: 0 }),
    );
    expect(text.props.style).toEqual(
      expect.objectContaining({ whiteSpace: "nowrap" }),
    );
  });

  it("uses a compact four pixel gap from the anchor", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaTooltip content="E-Mail" position="bottom" visible />,
      );
    });

    const positioner = tree!.root.findAllByType("div")[0];
    expect(positioner.props.style).toEqual(
      expect.objectContaining({ marginTop: 4 }),
    );
  });

  it("fades visibility changes instead of changing opacity abruptly", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaTooltip content="E-Mail" position="bottom" visible />,
      );
    });

    const positioner = tree!.root.findAllByType("div")[0];
    expect(positioner.props.style).toEqual(
      expect.objectContaining({
        transition: "opacity 140ms ease-in-out",
      }),
    );
  });

  it.each([
    ["top", "borderTopColor"],
    ["right", "borderLeftColor"],
    ["bottom", "borderBottomColor"],
    ["left", "borderRightColor"],
  ])("renders a caret pointing from %s to the anchor", (...args) => {
    const [position, border] = args as [
      WnaTooltipPosition,
      (
        | "borderBottomColor"
        | "borderLeftColor"
        | "borderRightColor"
        | "borderTopColor"
      ),
    ];
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaTooltip content="E-Mail" position={position} visible />,
      );
    });

    const caret = tree!.root
      .findAllByType("div")
      .find(
        (view: { props: { style?: Record<string, string> } }) =>
          view.props.style?.[border] === "#111",
      );
    expect(caret).toBeDefined();
  });
});
