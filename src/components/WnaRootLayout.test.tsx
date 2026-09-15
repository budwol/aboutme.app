/* eslint-disable @typescript-eslint/no-require-imports */
import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import WnaRootLayout from "@components/WnaRootLayout";

const mockAppData = { siteUrl: "https://example.test" };

jest.mock("@/state/WnaAppContext", () => {
  const ReactModule = jest.requireActual("react") as typeof import("react");

  return {
    WnaAppContextProvider: ({ children }: { children?: React.ReactNode }) =>
      ReactModule.createElement("WnaAppContextProvider", null, children),
  };
});

jest.mock("@components/WnaApp", () => {
  const ReactModule = jest.requireActual("react") as typeof import("react");

  return {
    __esModule: true,
    default: ({
      children,
      ...props
    }: { children?: React.ReactNode } & Record<string, unknown>) =>
      ReactModule.createElement("WnaApp", props, children),
  };
});

jest.mock("@/navigation/components/WnaDrawerLayout", () => {
  const ReactModule = jest.requireActual("react") as typeof import("react");

  return function MockWnaDrawerLayout() {
    return ReactModule.createElement("WnaDrawerLayout");
  };
});

jest.mock("@/app-data", () => ({
  loadAppData: jest.fn(async () => mockAppData),
}));

jest.mock("@/storage/themeStorage", () => ({
  getThemeFromStorageAsync: jest.fn(async () => "dark"),
}));

jest.mock("@/i18n/i18n", () => ({ i18n: { language: "de" } }));

jest.mock("react-i18next", () => ({
  I18nextProvider: ({ children }: { children?: React.ReactNode }) =>
    require("react").createElement("I18nextProvider", null, children),
}));

describe("WnaRootLayout", () => {
  it("initializes app data and theme before rendering the root layout content", async () => {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaRootLayout />);
    });

    await act(async () => undefined);

    expect(tree!.root.findByType("WnaAppContextProvider")).toBeTruthy();
    expect(tree!.root.findByType("WnaApp")).toBeTruthy();
    expect(tree!.root.findByType("WnaApp").props.theme).toBe("dark");
    expect(tree!.root.findByType("WnaDrawerLayout")).toBeTruthy();
  });

  it("falls back to the system theme when none is stored", async () => {
    const { getThemeFromStorageAsync } = require("@/storage/themeStorage") as {
      getThemeFromStorageAsync: jest.Mock<() => Promise<string | null>>;
    };
    getThemeFromStorageAsync.mockResolvedValueOnce(null);

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<WnaRootLayout />);
    });
    await act(async () => undefined);

    expect(tree!.root.findByType("WnaApp").props.theme).toBe("system");
  });

  it("renders nothing until app data has loaded", async () => {
    const { loadAppData } = require("@/app-data") as {
      loadAppData: jest.Mock<() => Promise<unknown>>;
    };
    let resolveLoad!: (value: unknown) => void;
    loadAppData.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveLoad = resolve;
      }),
    );

    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<WnaRootLayout />);
    });

    expect(tree!.root.findAllByType("WnaApp")).toHaveLength(0);

    await act(async () => {
      resolveLoad(mockAppData);
    });

    expect(tree!.root.findByType("WnaApp")).toBeTruthy();
  });
});
