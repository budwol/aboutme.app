/* eslint-disable @typescript-eslint/no-require-imports */
import { describe, expect, it, jest } from "@jest/globals";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";

jest.mock(
  "@components/screens/WnaHomeRoute",
  () =>
    function WnaHomeRoute() {
      return require("react").createElement("WnaHomeRoute");
    },
);

jest.mock(
  "@components/screens/WnaProjectDetailsRoute",
  () =>
    function WnaProjectDetailsRoute() {
      return require("react").createElement("WnaProjectDetailsRoute");
    },
);

jest.mock(
  "@components/screens/WnaProjectsRoute",
  () =>
    function WnaProjectsRoute() {
      return require("react").createElement("WnaProjectsRoute");
    },
);

jest.mock(
  "@components/screens/WnaExperienceRoute",
  () =>
    function WnaExperienceRoute() {
      return require("react").createElement("WnaExperienceRoute");
    },
);

jest.mock(
  "@components/screens/WnaContactRoute",
  () =>
    function WnaContactRoute() {
      return require("react").createElement("WnaContactRoute");
    },
);

jest.mock(
  "@components/screens/WnaMenuRoute",
  () =>
    function WnaMenuRoute() {
      return require("react").createElement("WnaMenuRoute");
    },
);

jest.mock(
  "@components/screens/WnaPrivacyRoute",
  () =>
    function WnaPrivacyRoute() {
      return require("react").createElement("WnaPrivacyRoute");
    },
);

jest.mock(
  "@components/screens/WnaTermsRoute",
  () =>
    function WnaTermsRoute() {
      return require("react").createElement("WnaTermsRoute");
    },
);

jest.mock(
  "@components/screens/WnaLicensesRoute",
  () =>
    function WnaLicensesRoute() {
      return require("react").createElement("WnaLicensesRoute");
    },
);

jest.mock(
  "@components/screens/WnaDisclaimerRoute",
  () =>
    function WnaDisclaimerRoute() {
      return require("react").createElement("WnaDisclaimerRoute");
    },
);

jest.mock(
  "@/navigation/components/WnaStackLayout",
  () =>
    function WnaStackLayout() {
      return require("react").createElement("WnaStackLayout");
    },
);

jest.mock(
  "@/navigation/components/WnaTabLayout",
  () =>
    function WnaTabLayout(props: unknown) {
      return require("react").createElement(
        "WnaTabLayout",
        props as Record<string, unknown>,
      );
    },
);

jest.mock("@/state/WnaAppContext", () => ({
  WnaAppContextProvider: ({ children }: { children?: React.ReactNode }) =>
    require("react").createElement("WnaAppContextProvider", null, children),
  useWnaTheme: jest.fn(() => ({
    appColors: {
      isDark: false,
      staticCoolgray8: "#222222",
      white: "#ffffff",
    },
  })),
  useWnaAppLifecycle: jest.fn(() => ({
    isDrawerOpen: false,
    closeDrawer: jest.fn(),
  })),
}));

jest.mock("@components/WnaApp", () => ({
  __esModule: true,
  default: ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
  } & Record<string, unknown>) =>
    require("react").createElement("WnaApp", props, children),
  ErrorBoundary: function ErrorBoundary() {
    return require("react").createElement("ErrorBoundary");
  },
}));

jest.mock("@/app-data", () => ({
  loadAppData: jest.fn(async () => ({ siteUrl: "https://example.test" })),
}));

jest.mock("@/storage/themeStorage", () => ({
  getThemeFromStorageAsync: jest.fn(async () => "dark"),
}));

jest.mock("@/navigation/routes/wnaNavigationRoutes", () => ({
  getNavigationPath: jest.fn(() => "/root"),
}));

jest.mock("@/i18n/i18n", () => ({ i18n: { language: "de" } }));

jest.mock("react-i18next", () => ({
  I18nextProvider: ({ children }: { children?: React.ReactNode }) =>
    require("react").createElement("I18nextProvider", null, children),
}));

jest.mock("expo-router", () => ({
  Redirect: (props: unknown) =>
    require("react").createElement(
      "Redirect",
      props as Record<string, unknown>,
    ),
  Slot: () => require("react").createElement("Slot"),
}));

jest.mock("expo-router/html", () => ({
  ScrollViewStyleReset: () =>
    require("react").createElement("ScrollViewStyleReset"),
}));

jest.mock(
  "@/navigation/components/WnaDrawerMenu",
  () =>
    function WnaDrawerMenu() {
      return require("react").createElement("WnaDrawerMenu");
    },
);

const routeCases = [
  ["./(drawer)/(tabs-en)", "WnaHomeRoute"],
  ["./(drawer)/(tabs-de)", "WnaHomeRoute"],
  ["./(drawer)/(tabs-en)/projects", "WnaProjectsRoute"],
  ["./(drawer)/(tabs-de)/projekte", "WnaProjectsRoute"],
  ["./(drawer)/(tabs-en)/projects/[slug]", "WnaProjectDetailsRoute"],
  ["./(drawer)/(tabs-de)/projekte/[slug]", "WnaProjectDetailsRoute"],
  ["./(drawer)/(tabs-en)/experience", "WnaExperienceRoute"],
  ["./(drawer)/(tabs-de)/taetigkeiten", "WnaExperienceRoute"],
  ["./(drawer)/(tabs-en)/contact", "WnaContactRoute"],
  ["./(drawer)/(tabs-de)/kontakt", "WnaContactRoute"],
  ["./(drawer)/(tabs-en)/menu", "WnaMenuRoute"],
  ["./(drawer)/(tabs-de)/menu", "WnaMenuRoute"],
  ["./(drawer)/(tabs-en)/menu/privacy", "WnaPrivacyRoute"],
  ["./(drawer)/(tabs-de)/menu/datenschutz", "WnaPrivacyRoute"],
  ["./(drawer)/(tabs-en)/menu/terms-of-use", "WnaTermsRoute"],
  ["./(drawer)/(tabs-de)/menu/nutzungsbedingungen", "WnaTermsRoute"],
  ["./(drawer)/(tabs-en)/menu/third-party-licenses", "WnaLicensesRoute"],
  ["./(drawer)/(tabs-de)/menu/lizenzen", "WnaLicensesRoute"],
  ["./(drawer)/(tabs-en)/menu/disclaimer", "WnaDisclaimerRoute"],
  ["./(drawer)/(tabs-de)/menu/impressum", "WnaDisclaimerRoute"],
] satisfies [string, string][];

const stackLayoutCases = [
  "./(drawer)/(tabs-en)/projects/_layout",
  "./(drawer)/(tabs-de)/projekte/_layout",
  "./(drawer)/(tabs-en)/experience/_layout",
  "./(drawer)/(tabs-de)/taetigkeiten/_layout",
  "./(drawer)/(tabs-en)/contact/_layout",
  "./(drawer)/(tabs-de)/kontakt/_layout",
  "./(drawer)/(tabs-en)/menu/_layout",
  "./(drawer)/(tabs-de)/menu/_layout",
] satisfies string[];

const tabLayoutCases = [
  ["./(drawer)/(tabs-en)/_layout", "home"],
  ["./(drawer)/(tabs-de)/_layout", "home"],
] satisfies [string, string][];

describe("app routes", () => {
  it.each(routeCases)("re-exports %s as %s", (modulePath, typeName) => {
    const Route = require(modulePath).default;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<Route />);
    });

    expect(tree!.root.findByType(typeName)).toBeTruthy();
  });

  it.each(stackLayoutCases)("re-exports %s as stack layout", (modulePath) => {
    const Layout = require(modulePath).default;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<Layout />);
    });

    expect(tree!.root.findByType("WnaStackLayout")).toBeTruthy();
  });

  it.each(tabLayoutCases)("renders %s as tab layout", (modulePath) => {
    const Layout = require(modulePath).default;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<Layout />);
    });

    expect(tree!.root.findByType("WnaTabLayout").props.screens).toEqual(
      expect.arrayContaining([expect.objectContaining({ icon: "home" })]),
    );
  });

  it("redirects unknown routes to the localized root path", () => {
    const NotFound = require("./+not-found").default;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<NotFound />);
    });

    expect(tree!.root.findByType("Redirect").props.href).toBe("/root");
  });

  it("renders the root html shell and removes Expo's injected font node", () => {
    const remove = jest.fn();
    const originalDocument = global.document;
    Object.defineProperty(global, "document", {
      configurable: true,
      value: {
        getElementById: jest.fn(() => ({ remove })),
      },
    });
    const RootHtml = require("./+html").default;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(
        <RootHtml>
          <main />
        </RootHtml>,
      );
    });

    expect(remove).toHaveBeenCalledTimes(1);
    expect(tree!.root.findByType("html").props.lang).toBe("de");
    expect(tree!.root.findByType("title").props.children).toBe("AboutMe");
    expect(tree!.root.findByType("main")).toBeTruthy();

    const shellStyles = tree!.root.findByType("style").props.children as string;
    expect(shellStyles).toContain(".wna-accent-bar-pulse");
    expect(shellStyles).toContain("@keyframes wna-accent-bar-pulse");
    expect(shellStyles).toContain("@keyframes wna-accent-bar-pulse-hero");
    expect(shellStyles).toContain("scaleX(.2142857)");
    expect(shellStyles).toContain("wna-accent-bar-pulse-hero 60s");
    expect(shellStyles).toContain(".wna-hero-shape");
    expect(shellStyles).toContain("@keyframes wna-hero-shape-swing");
    expect(shellStyles).toContain("@keyframes wna-hero-shape-swing-positive");
    expect(shellStyles).toContain("@keyframes wna-hero-shape-swing-negative");
    expect(shellStyles).toContain("wna-hero-shape-swing-positive 13s");
    expect(shellStyles).toContain("wna-hero-shape-swing-negative 13s");

    Object.defineProperty(global, "document", {
      configurable: true,
      value: originalDocument,
    });
  });

  it("skips removing the font node when it is absent", () => {
    const originalDocument = global.document;
    Object.defineProperty(global, "document", {
      configurable: true,
      value: {
        getElementById: jest.fn(() => null),
      },
    });
    const RootHtml = require("./+html").default;

    expect(() => {
      act(() => {
        TestRenderer.create(
          <RootHtml>
            <main />
          </RootHtml>,
        );
      });
    }).not.toThrow();

    Object.defineProperty(global, "document", {
      configurable: true,
      value: originalDocument,
    });
  });

  it("renders the routed content and the shared drawer menu when open", () => {
    const { useWnaAppLifecycle } = require("@/state/WnaAppContext");
    useWnaAppLifecycle.mockReturnValueOnce({
      isDrawerOpen: true,
      closeDrawer: jest.fn(),
    });
    const DrawerLayout = require("./(drawer)/_layout").default;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<DrawerLayout />);
    });

    expect(tree!.root.findByType("Slot")).toBeTruthy();
    expect(tree!.root.findByType("WnaDrawerMenu")).toBeTruthy();

    const panel = tree!.root.findByProps({ "data-testid": "wna-drawer-panel" });
    expect(panel.props.style.backgroundColor).toBe("#ffffff");
  });

  it("uses the dark drawer background in dark mode", () => {
    const {
      useWnaTheme,
      useWnaAppLifecycle,
    } = require("@/state/WnaAppContext");
    useWnaTheme.mockReturnValueOnce({
      appColors: {
        isDark: true,
        staticCoolgray8: "#222222",
        white: "#ffffff",
      },
    });
    useWnaAppLifecycle.mockReturnValueOnce({
      isDrawerOpen: true,
      closeDrawer: jest.fn(),
    });
    const DrawerLayout = require("./(drawer)/_layout").default;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<DrawerLayout />);
    });

    const panel = tree!.root.findByProps({ "data-testid": "wna-drawer-panel" });
    expect(panel.props.style.backgroundColor).toBe("#222222");
  });

  it("keeps the drawer panel in the DOM but non-interactive when closed", () => {
    const DrawerLayout = require("./(drawer)/_layout").default;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<DrawerLayout />);
    });

    expect(tree!.root.findByType("Slot")).toBeTruthy();
    expect(
      tree!.root.findAllByProps({ "data-testid": "wna-drawer-panel" }),
    ).toHaveLength(1);
    const overlay = tree!.root.findByProps({ id: "wna-drawer-overlay" });
    expect(overlay.props.style.pointerEvents).toBe("none");
  });

  it("activates the drawer panel transition on the next frame after opening", () => {
    jest.useFakeTimers();
    const originalDocument = global.document;
    Object.defineProperty(global, "document", {
      configurable: true,
      value: {
        body: {},
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      },
    });
    const { useWnaAppLifecycle } = require("@/state/WnaAppContext");
    useWnaAppLifecycle.mockImplementation(() => ({
      isDrawerOpen: true,
      closeDrawer: jest.fn(),
    }));
    const DrawerLayout = require("./(drawer)/_layout").default;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<DrawerLayout />);
    });

    const backdropBefore = tree!.root.findByProps({
      "data-testid": "wna-drawer-backdrop",
    });
    expect(backdropBefore.props.style.opacity).toBe(0);

    act(() => {
      jest.advanceTimersByTime(16);
    });

    const backdropAfter = tree!.root.findByProps({
      "data-testid": "wna-drawer-backdrop",
    });
    expect(backdropAfter.props.style.opacity).toBe(1);

    useWnaAppLifecycle.mockImplementation(() => ({
      isDrawerOpen: false,
      closeDrawer: jest.fn(),
    }));
    Object.defineProperty(global, "document", {
      configurable: true,
      value: originalDocument,
    });
    jest.useRealTimers();
  });

  it("closes on Escape and disables pointer events on the overlay", () => {
    jest.useFakeTimers();
    const originalDocument = global.document;
    const escapeHandlers: ((event: { key: string }) => void)[] = [];
    Object.defineProperty(global, "document", {
      configurable: true,
      value: {
        body: {},
        addEventListener: jest.fn((type: string, listener: unknown) => {
          if (type === "keydown") {
            escapeHandlers.push(listener as (event: { key: string }) => void);
          }
        }),
        removeEventListener: jest.fn(),
      },
    });
    const { useWnaAppLifecycle } = require("@/state/WnaAppContext");
    const mockCloseDrawer = jest.fn();
    let isOpen = true;
    useWnaAppLifecycle.mockImplementation(() => ({
      isDrawerOpen: isOpen,
      closeDrawer: mockCloseDrawer,
    }));
    const DrawerLayout = require("./(drawer)/_layout").default;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    act(() => {
      tree = TestRenderer.create(<DrawerLayout />);
    });

    act(() => {
      jest.advanceTimersByTime(16);
    });

    act(() => {
      escapeHandlers.forEach((handler) => handler({ key: "Enter" }));
    });

    expect(mockCloseDrawer).not.toHaveBeenCalled();

    act(() => {
      escapeHandlers.forEach((handler) => handler({ key: "Escape" }));
    });

    expect(mockCloseDrawer).toHaveBeenCalledTimes(1);

    isOpen = false;

    act(() => {
      tree!.update(<DrawerLayout />);
    });

    const overlay = tree!.root.findByProps({ id: "wna-drawer-overlay" });
    expect(overlay.props.style.pointerEvents).toBe("none");
    const panel = tree!.root.findByProps({
      "data-testid": "wna-drawer-panel",
    });
    expect(panel.props.style.transform).toBe("translateX(100%)");

    Object.defineProperty(global, "document", {
      configurable: true,
      value: originalDocument,
    });
    jest.useRealTimers();
    useWnaAppLifecycle.mockImplementation(() => ({
      isDrawerOpen: false,
      closeDrawer: jest.fn(),
    }));
  });

  it("initializes app data and theme before rendering the root layout content", async () => {
    const RootLayout = require("./_layout").default;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<RootLayout />);
    });

    await act(async () => undefined);

    expect(tree!.root.findByType("WnaAppContextProvider")).toBeTruthy();
    expect(tree!.root.findAllByType("GestureHandlerRootView")).toHaveLength(0);
    expect(tree!.root.findByType("WnaApp")).toBeTruthy();
    expect(tree!.root.findByType("WnaApp").props.theme).toBe("dark");
    expect(tree!.root.findByType("Slot")).toBeTruthy();
  });

  it("falls back to the system theme when none is stored", async () => {
    const { getThemeFromStorageAsync } = require("@/storage/themeStorage") as {
      getThemeFromStorageAsync: jest.Mock<() => Promise<string | null>>;
    };
    getThemeFromStorageAsync.mockResolvedValueOnce(null);
    const RootLayout = require("./_layout").default;
    let tree: ReturnType<typeof TestRenderer.create> | undefined;

    await act(async () => {
      tree = TestRenderer.create(<RootLayout />);
    });
    await act(async () => undefined);

    expect(tree!.root.findByType("WnaApp").props.theme).toBe("system");
  });
});
