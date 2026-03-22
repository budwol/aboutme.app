import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaTechStackCard from "@components/welcome/WnaTechstackCard";
import { appLayoutConstants } from "@constants/layoutConstants";
import { testAppData } from "@/test/testAppData";

jest.mock("@components/misc/WnaBadge", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaBadge(props: unknown) {
    return createElement("WnaBadge", props as Record<string, unknown>);
  };
});

describe("WnaTechStackCard", () => {
  it("uses a reduced gap between the primary and secondary techstack groups", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaTechStackCard
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

    const wrapper = tree!.root.findAllByType("View")[0];

    expect(wrapper.props.style.gap).toBe(appLayoutConstants.globalListGap / 2);
  });
});
