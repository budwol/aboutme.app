import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaMenuHeaderRight from "@/navigation/components/WnaMenuHeaderRight";

jest.mock("@components/buttons/WnaButtonHeader", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaButtonHeader(props: unknown) {
    return createElement("WnaButtonHeader", props as Record<string, unknown>);
  };
});

describe("WnaMenuHeaderRight", () => {
  it("updates the header text when translation output changes", () => {
    const navigation = { dispatch: () => {} };
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaMenuHeaderRight
          appColors={{ isDark: false } as never}
          appStyle={{} as never}
          navigation={navigation}
          t={(() => "Menu") as never}
        />,
      );
    });

    act(() => {
      tree!.update(
        <WnaMenuHeaderRight
          appColors={{ isDark: false } as never}
          appStyle={{} as never}
          navigation={navigation}
          t={(() => "Menue") as never}
        />,
      );
    });

    const buttonHeader = tree!.root.findByType("WnaButtonHeader");

    expect(buttonHeader.props.text).toBe("Menue");
  });
});
