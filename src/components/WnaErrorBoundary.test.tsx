import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaErrorBoundary from "@components/WnaErrorBoundary";

jest.mock("@components/WnaApp", () => ({
  ErrorBoundary: (props: { error: Error; retry: () => Promise<void> }) =>
    React.createElement(
      "WnaErrorFallback",
      props as unknown as Record<string, unknown>,
    ),
}));

function ThrowOnce({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("boom");
  }

  return React.createElement("span", null, "ok");
}

describe("WnaErrorBoundary", () => {
  it("renders children when nothing has thrown", () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaErrorBoundary>
          <ThrowOnce shouldThrow={false} />
        </WnaErrorBoundary>,
      );
    });

    expect(tree!.root.findByType("span").props.children).toBe("ok");
  });

  it("catches a render error and shows the fallback, then recovers via retry", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    let shouldThrow = true;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaErrorBoundary>
          <ThrowOnce shouldThrow={shouldThrow} />
        </WnaErrorBoundary>,
      );
    });

    const fallback = tree!.root.findByType("WnaErrorFallback");
    expect(fallback.props.error.message).toBe("boom");

    shouldThrow = false;

    await act(async () => {
      await fallback.props.retry();
      tree!.update(
        <WnaErrorBoundary>
          <ThrowOnce shouldThrow={shouldThrow} />
        </WnaErrorBoundary>,
      );
    });

    expect(tree!.root.findByType("span").props.children).toBe("ok");

    consoleErrorSpy.mockRestore();
  });
});
