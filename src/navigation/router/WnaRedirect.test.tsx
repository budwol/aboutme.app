import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaRedirect from "@/navigation/router/WnaRedirect";
import { router } from "@/navigation/router/wnaRouter";

describe("WnaRedirect", () => {
  it("replaces the current entry with the given href on mount", () => {
    const replaceSpy = jest
      .spyOn(router, "replace")
      .mockImplementation(() => {});

    act(() => {
      TestRenderer.create(<WnaRedirect href="/menu" />);
    });

    expect(replaceSpy).toHaveBeenCalledWith("/menu");
    replaceSpy.mockRestore();
  });

  it("renders nothing", () => {
    const replaceSpy = jest
      .spyOn(router, "replace")
      .mockImplementation(() => {});
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaRedirect href="/menu" />);
    });

    expect(tree!.toJSON()).toBeNull();
    replaceSpy.mockRestore();
  });
});
