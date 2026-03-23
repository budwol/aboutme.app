import WnaStackScreenOptions from "@/navigation/components/WnaStackScreenOptions";
import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";

const mockStack = jest.fn();

jest.mock("@components/WnaAppContext", () => ({
  useWnaTheme: () => ({
    appColors: {
      staticBlack: "#111111",
      staticWhite: "#ffffff",
    },
  }),
}));

jest.mock("expo-router", () => ({
  Stack: (props: unknown) => {
    mockStack(props);
    return null;
  },
}));

describe("WnaStackScreenOptions", () => {
  it("configures a fade-from-bottom page transition", () => {
    act(() => {
      TestRenderer.create(<WnaStackScreenOptions />);
    });

    expect(mockStack).toHaveBeenCalledWith({
      screenOptions: expect.objectContaining({
        animation: "fade_from_bottom",
        animationDuration: 240,
        headerShown: true,
      }),
    });
  });
});
