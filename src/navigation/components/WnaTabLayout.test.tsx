import WnaTabLayout from "@/navigation/components/WnaTabLayout";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";

const mockTabsScreen = jest.fn();
const mockTabs = jest.fn();
let mockIsDark = false;

jest.mock("@/state/WnaAppContext", () => ({
  useWnaTheme: () => ({
    appColors: {
      isDark: mockIsDark,
      staticWhite: "#fff",
      staticCoolgray1: "#eee",
      staticCoolgray8: "#222",
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
    (props: { children?: React.ReactNode }) => {
      mockTabs(props);
      return <>{props.children}</>;
    },
    {
      Screen: (props: unknown) => {
        mockTabsScreen(props);
        return null;
      },
    },
  ),
}));

jest.mock("@components/icon/WnaIcon/WnaIcon", () => (props: unknown) => {
  const ReactModule = jest.requireActual("react") as typeof import("react");

  return ReactModule.createElement("WnaIcon", props as Record<string, unknown>);
});

describe("WnaTabLayout", () => {
  beforeEach(() => {
    mockIsDark = false;
    mockTabs.mockClear();
    mockTabsScreen.mockClear();
  });

  it("assigns localized titles to tab screens", () => {
    act(() => {
      TestRenderer.create(
        <WnaTabLayout
          screens={[
            { name: "index", icon: "home" },
            { name: "projects", icon: "web" },
            { name: "projekte", icon: "web" },
            { name: "experience", icon: "account" },
            { name: "taetigkeiten", icon: "account" },
            { name: "contact", icon: "email" },
            { name: "kontakt", icon: "email" },
            { name: "menu", icon: "menu" },
            { name: "unknown", icon: "circle" },
          ]}
        />,
      );
    });

    expect(
      mockTabsScreen.mock.calls.map(([props]) => [
        (props as { name: string }).name,
        (props as { options: { title: string } }).options.title,
      ]),
    ).toEqual([
      ["index", "tx:screenTitleStartPage"],
      ["projects", "tx:screenTitleProjects"],
      ["projekte", "tx:screenTitleProjects"],
      ["experience", "tx:screenTitleExperience"],
      ["taetigkeiten", "tx:screenTitleExperience"],
      ["contact", "tx:screenTitleContact"],
      ["kontakt", "tx:screenTitleContact"],
      ["menu", "tx:screenTitleMenuWithoutDots"],
      ["unknown", ""],
    ]);
  });

  it("uses dark tab colors and renders focused icons", () => {
    mockIsDark = true;

    act(() => {
      TestRenderer.create(
        <WnaTabLayout screens={[{ name: "index", icon: "home" }]} />,
      );
    });

    const screenOptions = (
      mockTabs.mock.calls[0][0] as {
        screenOptions: {
          tabBarActiveTintColor: string;
          tabBarInactiveTintColor: string;
        };
      }
    ).screenOptions;
    const screen = mockTabsScreen.mock.calls[0][0] as {
      options: {
        sceneStyle: { backgroundColor: string };
        tabBarIcon: (props: {
          focused: boolean;
          color: string;
        }) => React.ReactNode;
        tabBarLabel: () => null;
      };
    };
    let icon: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      icon = TestRenderer.create(
        screen.options.tabBarIcon({ focused: true, color: "#abc" }),
      );
    });

    expect(screenOptions.tabBarActiveTintColor).toBe("#111");
    expect(screenOptions.tabBarInactiveTintColor).toBe("#666");
    expect(screen.options.sceneStyle.backgroundColor).toBe("transparent");
    expect(icon!.root.findByType("WnaIcon").props).toEqual(
      expect.objectContaining({
        color: "#abc",
        iconName: "home",
      }),
    );

    let unfocusedIcon: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      unfocusedIcon = TestRenderer.create(
        screen.options.tabBarIcon({ focused: false, color: "#abc" }),
      );
    });

    expect(unfocusedIcon!.root.findByType("WnaIcon").props.size).not.toEqual(
      icon!.root.findByType("WnaIcon").props.size,
    );
    expect(screen.options.tabBarLabel()).toBeNull();
  });
});
