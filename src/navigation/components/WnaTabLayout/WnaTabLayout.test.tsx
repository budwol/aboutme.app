import WnaTabLayout from "@/navigation/components/WnaTabLayout";
import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";

const mockTabsScreen = jest.fn();

jest.mock("@components/WnaAppContext", () => ({
  useWnaTheme: () => ({
    appColors: {
      isDark: false,
      staticWhite: "#fff",
      staticCoolgray1: "#eee",
      staticCoolgray5: "#666",
      staticCoolgray6: "#777",
      accent1: "#111",
      accent5: "#555",
      white: "#fff",
    },
  }),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (value: string) => `tx:${value}`,
  }),
}));

jest.mock("expo-router", () => ({
  Tabs: Object.assign(
    ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    {
      Screen: (props: unknown) => {
        mockTabsScreen(props);
        return null;
      },
    },
  ),
}));

jest.mock("@components/icon/WnaIcon/WnaIcon", () => () => null);

describe("WnaTabLayout", () => {
  it("assigns localized titles to tab screens", () => {
    act(() => {
      TestRenderer.create(
        <WnaTabLayout
          screens={[
            { name: "index", icon: "home" },
            { name: "menu", icon: "menu" },
          ]}
        />,
      );
    });

    expect(mockTabsScreen).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        name: "index",
        options: expect.objectContaining({
          title: "tx:screenTitleStartPage",
        }),
      }),
    );
    expect(mockTabsScreen).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        name: "menu",
        options: expect.objectContaining({
          title: "tx:screenTitleMenuWithoutDots",
        }),
      }),
    );
  });
});
