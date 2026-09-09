import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { useWnaScrollY } from "@components/screens/useWnaScrollY";

jest.mock("react-native-reanimated", () => ({
  useSharedValue: jest.fn((value: number) => ({ value })),
  useAnimatedScrollHandler: jest.fn((handlers: unknown) => handlers),
}));

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
  it("updates the shared scroll value from native scroll events", () => {
    let controller: ReturnType<typeof useWnaScrollY> | undefined;

    act(() => {
      TestRenderer.create(
        <ScrollProbe onValue={(value) => (controller = value)} />,
      );
    });

    act(() => {
      (
        controller!.onScroll as unknown as {
          onScroll: (event: { contentOffset: { y: number } }) => void;
        }
      ).onScroll({ contentOffset: { y: 42 } });
    });

    expect(controller!.scrollY.value).toBe(42);
  });
});
