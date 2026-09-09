import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaStackLayout from "@/navigation/components/WnaStackLayout";

jest.mock("@/navigation/components/WnaStackScreenOptions", () => {
  const { createElement } = jest.requireActual(
    "react",
  ) as typeof import("react");

  return function MockWnaStackScreenOptions() {
    return createElement("WnaStackScreenOptions");
  };
});

describe("WnaStackLayout", () => {
  it("renders the shared stack screen options", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaStackLayout />);
    });

    expect(tree!.root.findByType("WnaStackScreenOptions")).toBeTruthy();
  });
});
