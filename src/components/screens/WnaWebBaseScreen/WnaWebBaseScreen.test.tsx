import WnaWebBaseScreen from "@components/screens/WnaWebBaseScreen";
import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";

const mockStackScreen = jest.fn();
const mockUseIsFocused = jest.fn(() => true);

jest.mock("@react-navigation/native", () => ({
  useIsFocused: () => mockUseIsFocused(),
}));

jest.mock("expo-router", () => ({
  Stack: {
    Screen: (props: unknown) => {
      mockStackScreen(props);
      return null;
    },
  },
}));

describe("WnaWebBaseScreen", () => {
  it("sets the screen options and browser title from the page title", () => {
    Object.defineProperty(globalThis, "document", {
      value: { title: "Initial" },
      configurable: true,
      writable: true,
    });

    act(() => {
      TestRenderer.create(
        <WnaWebBaseScreen title="Portfolio">
          <></>
        </WnaWebBaseScreen>,
      );
    });

    expect(mockStackScreen).toHaveBeenCalledWith({
      options: { headerShown: false, title: "Portfolio" },
    });
    expect(globalThis.document.title).toBe("Portfolio");
  });

  it("restores the browser title when an already mounted screen becomes focused again", () => {
    Object.defineProperty(globalThis, "document", {
      value: { title: "Project" },
      configurable: true,
      writable: true,
    });

    mockUseIsFocused.mockReturnValue(false);

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <WnaWebBaseScreen title="Start">
          <></>
        </WnaWebBaseScreen>,
      );
    });

    expect(globalThis.document.title).toBe("Project");

    mockUseIsFocused.mockReturnValue(true);

    act(() => {
      tree!.update(
        <WnaWebBaseScreen title="Start">
          <></>
        </WnaWebBaseScreen>,
      );
    });

    expect(globalThis.document.title).toBe("Start");
  });
});
