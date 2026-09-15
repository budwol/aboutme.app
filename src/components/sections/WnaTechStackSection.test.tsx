import { describe, expect, it, jest } from "@jest/globals";
import TestRenderer, { act } from "react-test-renderer";
import WnaTechStackSection from "@components/sections/WnaTechStackSection";
import { appLayoutConstants } from "@constants/layoutConstants";
import { testAppData } from "@/app-data/testAppData";

jest.mock("@components/display/WnaBadge", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaBadge(props: unknown) {
    return createElement("WnaBadge", props as Record<string, unknown>);
  };
});

describe("WnaTechStackSection", () => {
  it("uses a reduced gap between the primary and secondary techstack groups", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaTechStackSection
          appColors={
            {
              warmgray6: "#999999",
              coolgray2: "#cccccc",
              coolgray8: "#222222",
            } as never
          }
          appData={testAppData}
          appStyle={
            {
              textNeutralTitleLarge: {},
            } as never
          }
          t={((value: string) => value) as never}
        />,
      );
    });

    const wrapper = tree!.root.findAllByType("div")[0];

    expect(wrapper.props.style.gap).toBe(appLayoutConstants.globalListGap / 2);
    expect(
      tree!.root
        .findAllByType("div")
        .some(
          (view: { props: { style?: Record<string, unknown> } }) =>
            view.props.style?.flexWrap === "wrap" &&
            view.props.style?.alignItems === "flex-start",
        ),
    ).toBe(true);
  });

  it("falls back to empty stacks and renders nothing when techStack data is missing", () => {
    const appData = {
      ...testAppData,
      techStack: {
        primary: undefined,
        secondary: undefined,
      },
    } as never;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaTechStackSection
          appColors={
            {
              warmgray6: "#999999",
              coolgray2: "#cccccc",
              coolgray8: "#222222",
            } as never
          }
          appData={appData}
          appStyle={
            {
              textNeutralTitleLarge: {},
            } as never
          }
          t={((value: string) => value) as never}
        />,
      );
    });

    expect(tree!.root.findAllByType("WnaBadge")).toHaveLength(0);
  });
});
