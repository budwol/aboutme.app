import { describe, expect, it } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { useWnaScrollY } from "@components/screens/useWnaScrollY";

function ScrollProbe({
  onValue,
}: {
  onValue: (value: ReturnType<typeof useWnaScrollY>) => void;
}) {
  const value = useWnaScrollY();
  onValue(value);

  return React.createElement("ScrollProbe");
}

describe("useWnaScrollY", () => {
  it("updates the scroll value from browser scroll events", () => {
    let controller: ReturnType<typeof useWnaScrollY> | undefined;

    act(() => {
      TestRenderer.create(
        <ScrollProbe onValue={(value) => (controller = value)} />,
      );
    });

    act(() => {
      controller!.onScroll({
        currentTarget: { scrollTop: 42 },
      } as never);
    });

    expect(controller!.scrollY).toBe(42);
  });
});
