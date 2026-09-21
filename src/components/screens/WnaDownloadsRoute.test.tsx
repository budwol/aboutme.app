/* eslint-disable @typescript-eslint/no-require-imports */
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import WnaDownloadsRoute from "@components/screens/WnaDownloadsRoute";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { testAppData } from "@/app-data/testAppData";

const SESSION_STORAGE_KEY = "wna-documents-auth";
const LAST_ACTIVE_STORAGE_KEY = "wna-documents-auth-last-active";

type ToggleButtonNode = {
  type: unknown;
  props: { "aria-expanded"?: boolean; onClick?: () => void };
};

jest.mock("@/state/WnaAppContext", () => {
  const { jest: jestModule } = require("@jest/globals");

  return {
    useWnaAppData: jestModule.fn(),
    useWnaTheme: jestModule.fn(),
  };
});

jest.mock("react-i18next", () => ({
  initReactI18next: {
    type: "3rdParty",
    init: () => undefined,
  },
  useTranslation: () => ({
    t: (value: string) => value,
  }),
}));

jest.mock("wna-logger", () => ({
  __esModule: true,
  default: {
    error: () => undefined,
    info: () => undefined,
    warn: () => undefined,
  },
}));

jest.mock("@/navigation/routes/wnaNavigationRoutes", () => {
  const { jest: jestModule } = require("@jest/globals");

  return { getNavigationLang: jestModule.fn(() => "en") };
});

jest.mock("@components/cards/WnaSurfaceCard", () => {
  const { createElement } = require("react") as typeof import("react");

  return function MockCard(props: unknown) {
    return createElement(
      "WnaSurfaceCard",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  };
});

jest.mock("@/navigation/components/WnaMenuToggleButton", () => {
  const { createElement } = require("react") as typeof import("react");

  return function MockMenuToggleButton(props: unknown) {
    return createElement(
      "WnaMenuToggleButton",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@/navigation/components/WnaHeaderRouteButton", () => {
  const { createElement } = require("react") as typeof import("react");

  return function MockHeaderRouteButton(props: unknown) {
    return createElement(
      "WnaHeaderRouteButton",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/display/WnaSeparatorHorizontal", () => {
  const { createElement } = require("react") as typeof import("react");

  return function MockSeparator(props: unknown) {
    return createElement(
      "WnaSeparatorHorizontal",
      props as Record<string, unknown>,
    );
  };
});

jest.mock("@components/text/WnaSectionTitle", () => {
  const { createElement } = require("react") as typeof import("react");

  return function MockSectionTitle(props: unknown) {
    return createElement("WnaSectionTitle", props as Record<string, unknown>);
  };
});

jest.mock("@components/buttons/WnaButtonIconText", () => {
  const { createElement } = require("react") as typeof import("react");

  return function MockButtonIconText(props: unknown) {
    return createElement("WnaButtonIconText", props as Record<string, unknown>);
  };
});

jest.mock("@/navigation/components/WnaNavigationItem", () => {
  const { createElement } = require("react") as typeof import("react");

  return function MockNavigationItem(props: unknown) {
    return createElement("WnaNavigationItem", props as Record<string, unknown>);
  };
});

jest.mock("@components/icon/WnaIcon/WnaIcon", () => {
  const { createElement } = require("react") as typeof import("react");

  return function MockIcon(props: unknown) {
    return createElement("WnaIcon", props as Record<string, unknown>);
  };
});

jest.mock("@components/screens/WnaScrollViewScreen", () => {
  const { createElement } = require("react") as typeof import("react");

  return function MockScrollViewScreen(props: unknown) {
    return createElement(
      "WnaScrollViewScreen",
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  };
});

function mockResponse(overrides: Partial<Response>): Response {
  return {
    ok: true,
    status: 200,
    blob: async () => new Blob(["content"]),
    ...overrides,
  } as Response;
}

describe("WnaDownloadsRoute", () => {
  const fetchMock = jest.fn<typeof fetch>();

  beforeEach(() => {
    jest.clearAllMocks();
    window.sessionStorage.clear();
    global.fetch = fetchMock as unknown as typeof fetch;

    const appContext = jest.requireMock("@/state/WnaAppContext") as {
      useWnaAppData: jest.Mock;
      useWnaTheme: jest.Mock;
    };
    appContext.useWnaTheme.mockReturnValue({
      appColors: {
        coolgray2: "#ccc",
        background: "#fff",
        text: "#000",
        red4: "#f75056",
        yellow4: "#fff000",
      },
      appStyle: { textNeutralMedium: {}, textNeutralSubtitle: {} },
    });
    appContext.useWnaAppData.mockReturnValue({ appData: testAppData });
  });

  afterEach(() => {
    window.sessionStorage.clear();
  });

  // Simulates an already-unlocked session, the way handleUnlock's markActive
  // leaves sessionStorage after a real unlock: both the auth header and a
  // recent last-active timestamp, so the inactivity effect doesn't
  // immediately treat a freshly-seeded fixture as stale.
  function setStoredSession(authHeader: string, lastActiveAt = Date.now()) {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, authHeader);
    window.sessionStorage.setItem(
      LAST_ACTIVE_STORAGE_KEY,
      String(lastActiveAt),
    );
  }

  function renderRoute() {
    let tree: ReturnType<typeof TestRenderer.create> | undefined;
    act(() => {
      tree = TestRenderer.create(<WnaDownloadsRoute />);
    });
    return tree!;
  }

  function findInput(tree: ReturnType<typeof TestRenderer.create>) {
    return tree.root.findByType("input");
  }

  function findUnlockButton(tree: ReturnType<typeof TestRenderer.create>) {
    return tree.root.findByType("WnaButtonIconText");
  }

  function findVisibilityToggle(tree: ReturnType<typeof TestRenderer.create>) {
    return tree.root.findByType("button");
  }

  // Cards start collapsed/expanded per WnaDownloadsRoute's own default
  // (matching the current UI language; jsdom's default locale resolves to
  // "en" here, so English starts expanded and German collapsed) -- most
  // tests below care about the download/auth mechanics, not that default,
  // so they expand every card first to see every document row regardless.
  function expandAllSections(tree: ReturnType<typeof TestRenderer.create>) {
    const collapsedToggles = tree.root.findAll(
      (node: ToggleButtonNode) =>
        node.type === "button" && node.props["aria-expanded"] === false,
    );
    act(() => {
      collapsedToggles.forEach((toggle: ToggleButtonNode) =>
        (toggle.props.onClick as () => void)(),
      );
    });
  }

  // The manifest-fetch effect awaits Promise.all of two fetches and then a
  // sequential .json() on each -- more microtask hops than a single
  // `await Promise.resolve()` flushes.
  async function flushManifestFetch() {
    await act(async () => {
      for (let i = 0; i < 6; i += 1) {
        await Promise.resolve();
      }
    });
  }

  it("disables the shared contact footer", () => {
    const tree = renderRoute();

    expect(
      tree.root.findByType("WnaScrollViewScreen").props.showContactFooter,
    ).toBe(false);
  });

  it("shows a locked password prompt when nothing is stored", () => {
    const tree = renderRoute();

    expect(() => tree.root.findByType("input")).not.toThrow();
    expect(findUnlockButton(tree).props.text).toBe("actionUnlock");
    expect(findUnlockButton(tree).props.disabled).toBe(true);
  });

  it("starts with the password field masked", () => {
    const tree = renderRoute();

    expect(findInput(tree).props.type).toBe("password");
    expect(findVisibilityToggle(tree).props["aria-label"]).toBe(
      "actionShowPassword",
    );
    expect(
      findVisibilityToggle(tree).findByType("WnaIcon").props.iconName,
    ).toBe("eye");
  });

  it("sets the input's native color-scheme to match the current theme", () => {
    const appContext = jest.requireMock("@/state/WnaAppContext") as {
      useWnaTheme: jest.Mock;
    };
    appContext.useWnaTheme.mockReturnValue({
      appColors: {
        coolgray2: "#ccc",
        background: "#000",
        text: "#fff",
        red4: "#f75056",
        yellow4: "#fff000",
        isDark: true,
      },
      appStyle: { textNeutralMedium: {}, textNeutralSubtitle: {} },
    });

    const tree = renderRoute();

    expect(
      (findInput(tree).props.style as { colorScheme: string }).colorScheme,
    ).toBe("dark");
  });

  it("toggles the password field between masked and revealed", () => {
    const tree = renderRoute();

    act(() => {
      findVisibilityToggle(tree).props.onClick();
    });

    expect(findInput(tree).props.type).toBe("text");
    expect(findVisibilityToggle(tree).props["aria-label"]).toBe(
      "actionHidePassword",
    );
    expect(
      findVisibilityToggle(tree).findByType("WnaIcon").props.iconName,
    ).toBe("eye-off");

    act(() => {
      findVisibilityToggle(tree).props.onClick();
    });

    expect(findInput(tree).props.type).toBe("password");
  });

  it("enables the unlock button once a password is typed", () => {
    const tree = renderRoute();

    act(() => {
      findInput(tree).props.onChange({
        target: { value: "!secret" },
      });
    });

    expect(findUnlockButton(tree).props.disabled).toBe(false);
  });

  it("unlocks and shows every document after a correct password", async () => {
    fetchMock.mockResolvedValue(mockResponse({ ok: true, status: 200 }));
    const tree = renderRoute();

    act(() => {
      findInput(tree).props.onChange({ target: { value: "!correct" } });
    });

    await act(async () => {
      await (findUnlockButton(tree).props.onPress as () => Promise<void>)();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/files/DE/John_Doe_-_Bewerbungsunterlagen.zip",
      expect.objectContaining({
        method: "HEAD",
        headers: { Authorization: `Basic ${btoa("documents:!correct")}` },
      }),
    );
    expandAllSections(tree);
    expect(tree.root.findAllByType("WnaNavigationItem")).toHaveLength(10);
    expect(window.sessionStorage.getItem(SESSION_STORAGE_KEY)).toBe(
      `Basic ${btoa("documents:!correct")}`,
    );
  });

  it("skips the prompt when a valid session is already stored", () => {
    setStoredSession(`Basic ${btoa("documents:!correct")}`);
    const tree = renderRoute();

    expandAllSections(tree);
    expect(tree.root.findAllByType("WnaNavigationItem")).toHaveLength(10);
  });

  it("groups documents into a German and an English card, each flag-marked, ZIP first", () => {
    setStoredSession(`Basic ${btoa("documents:!correct")}`);
    const tree = renderRoute();
    expandAllSections(tree);

    const cards = tree.root.findAllByType("WnaSurfaceCard");
    // The intro card, plus one per language.
    expect(cards).toHaveLength(3);

    const items = tree.root.findAllByType("WnaNavigationItem");
    // Once unlocked there is no password field at all, so every
    // WnaNavigationItem here is a document row -- one folder-zip + four
    // file-pdf-box (CV, CV-ATS, Portfolio, Portfolio-ATS) per language,
    // German section first, each downloading rather than navigating.
    type NavItemProps = {
      props: { iconName: string; iconColor: string; iconRightName: string };
    };
    expect(items.map((item: NavItemProps) => item.props.iconName)).toEqual([
      "folder-zip",
      "file-pdf-box",
      "file-pdf-box",
      "file-pdf-box",
      "file-pdf-box",
      "folder-zip",
      "file-pdf-box",
      "file-pdf-box",
      "file-pdf-box",
      "file-pdf-box",
    ]);
    expect(items.map((item: NavItemProps) => item.props.iconColor)).toEqual([
      "#fff000",
      "#f75056",
      "#f75056",
      "#f75056",
      "#f75056",
      "#fff000",
      "#f75056",
      "#f75056",
      "#f75056",
      "#f75056",
    ]);
    expect(
      items.every(
        (item: NavItemProps) => item.props.iconRightName === "download",
      ),
    ).toBe(true);
  });

  it("appends the formatted file size to a fixed document's label once document-sizes.json loads", async () => {
    setStoredSession(`Basic ${btoa("documents:!correct")}`);
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url === "/files/document-sizes.json") {
        return mockResponse({
          ok: true,
          json: async () => ({
            "/files/DE/John_Doe_-_Bewerbungsunterlagen.zip": 1_572_864,
          }),
        });
      }
      if (url === "/files/references-manifest.json") {
        return mockResponse({ ok: true, json: async () => [] });
      }
      return mockResponse({ ok: true });
    });

    const tree = renderRoute();
    await flushManifestFetch();
    expandAllSections(tree);

    const zipRow = tree.root
      .findAllByType("WnaNavigationItem")
      .find((item: { props: { text: string } }) =>
        item.props.text.startsWith("documentApplicationPackageDe"),
      ) as { props: { text: string } };
    expect(zipRow.props.text).toBe("documentApplicationPackageDe (1.5 MB)");
  });

  it("appends the reference document's own size to its label without a separate lookup", async () => {
    setStoredSession(`Basic ${btoa("documents:!correct")}`);
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url === "/files/references-manifest.json") {
        return mockResponse({
          ok: true,
          json: async () => [
            {
              category: "certificates",
              fileName: "Jane_Example_-_Zertifikat_AutoCAD.pdf",
              label: "Zertifikat AutoCAD",
              url: "/files/Zertifikate/Jane_Example_-_Zertifikat_AutoCAD.pdf",
              size: 2048,
            },
          ],
        });
      }
      return mockResponse({ ok: true, json: async () => ({}) });
    });

    const tree = renderRoute();
    await flushManifestFetch();
    expandAllSections(tree);

    const referenceRow = tree.root
      .findAllByType("WnaNavigationItem")
      .find((item: { props: { text: string } }) =>
        item.props.text.startsWith("Zertifikat AutoCAD"),
      ) as { props: { text: string } };
    expect(referenceRow.props.text).toBe("Zertifikat AutoCAD (2.0 KB)");
  });

  function findSectionToggles(tree: ReturnType<typeof TestRenderer.create>) {
    return tree.root.findAll(
      (node: ToggleButtonNode) =>
        node.type === "button" && node.props["aria-expanded"] !== undefined,
    );
  }

  it("shows the current-language card first (expanded) and the other one last (collapsed) when the site isn't in German", () => {
    setStoredSession(`Basic ${btoa("documents:!correct")}`);
    const tree = renderRoute();

    // English is the mocked getNavigationLang() default (see the top-of-file
    // mock) -- the current-language card renders first.
    const [currentToggle, otherToggle] = findSectionToggles(tree);
    expect(currentToggle.props["aria-expanded"]).toBe(true);
    expect(otherToggle.props["aria-expanded"]).toBe(false);
    // Only the expanded (English) card's 5 rows render.
    expect(tree.root.findAllByType("WnaNavigationItem")).toHaveLength(5);
  });

  it("shows the current-language card first (expanded) and the other one last (collapsed) when the site is in German", () => {
    const navigationRoutes = jest.requireMock(
      "@/navigation/routes/wnaNavigationRoutes",
    ) as { getNavigationLang: jest.Mock };
    navigationRoutes.getNavigationLang.mockReturnValue("de");

    setStoredSession(`Basic ${btoa("documents:!correct")}`);
    const tree = renderRoute();

    const [currentToggle, otherToggle] = findSectionToggles(tree);
    expect(currentToggle.props["aria-expanded"]).toBe(true);
    expect(otherToggle.props["aria-expanded"]).toBe(false);

    navigationRoutes.getNavigationLang.mockReturnValue("en");
  });

  it("expands a collapsed card on click and collapses it again on a second click", () => {
    setStoredSession(`Basic ${btoa("documents:!correct")}`);
    const tree = renderRoute();

    expect(tree.root.findAllByType("WnaNavigationItem")).toHaveLength(5);

    // Toggle index 1 is the "other" (German) card -- collapsed by default
    // since English is current; index 0 (English) already starts expanded.
    act(() => {
      (findSectionToggles(tree)[1].props.onClick as () => void)();
    });
    expect(tree.root.findAllByType("WnaNavigationItem")).toHaveLength(10);

    act(() => {
      (findSectionToggles(tree)[1].props.onClick as () => void)();
    });
    expect(tree.root.findAllByType("WnaNavigationItem")).toHaveLength(5);
  });

  it("shows an error and stays locked when the password is wrong", async () => {
    fetchMock.mockResolvedValue(mockResponse({ ok: false, status: 401 }));
    const tree = renderRoute();

    act(() => {
      findInput(tree).props.onChange({ target: { value: "!wrong" } });
    });
    await act(async () => {
      await (findUnlockButton(tree).props.onPress as () => Promise<void>)();
    });

    expect(tree.root.findAllByType("WnaButtonIconText")).toHaveLength(1);
    expect(window.sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
    const spans = tree.root.findAllByType("span");
    expect(
      spans.some((span: { children: unknown[] }) =>
        span.children.includes("errorIncorrectPassword"),
      ),
    ).toBe(true);
  });

  it("shows a generic error when the unlock request itself fails", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));
    const tree = renderRoute();

    act(() => {
      findInput(tree).props.onChange({ target: { value: "!correct" } });
    });
    await act(async () => {
      await (findUnlockButton(tree).props.onPress as () => Promise<void>)();
    });

    const spans = tree.root.findAllByType("span");
    expect(
      spans.some((span: { children: unknown[] }) =>
        span.children.includes("errorUnknown"),
      ),
    ).toBe(true);
  });

  it("triggers unlock when Enter is pressed in the password field", async () => {
    fetchMock.mockResolvedValue(mockResponse({ ok: true, status: 200 }));
    const tree = renderRoute();

    act(() => {
      findInput(tree).props.onChange({ target: { value: "!correct" } });
    });
    await act(async () => {
      findInput(tree).props.onKeyDown({ key: "Enter" });
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(fetchMock).toHaveBeenCalled();
  });

  it("ignores a non-Enter key in the password field", () => {
    const tree = renderRoute();

    act(() => {
      findInput(tree).props.onKeyDown({ key: "a" });
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("downloads a document via fetch + blob once unlocked", async () => {
    setStoredSession(`Basic ${btoa("documents:!correct")}`);
    const blob = new Blob(["%PDF-fake"]);
    fetchMock.mockResolvedValue(
      mockResponse({ ok: true, blob: async () => blob }),
    );
    (URL as unknown as { createObjectURL: unknown }).createObjectURL = jest
      .fn()
      .mockReturnValue("blob:mock-url");
    (URL as unknown as { revokeObjectURL: unknown }).revokeObjectURL =
      jest.fn();
    const clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    const tree = renderRoute();
    expandAllSections(tree);
    const [firstButton] = tree.root.findAllByType("WnaNavigationItem");

    await act(async () => {
      await (firstButton.props.onPress as () => Promise<void>)();
    });

    // English renders first: the mocked getNavigationLang() defaults to
    // "en" (see the top-of-file mock), and the current-language card is
    // always first (see renderLanguageFragment/orderedLanguageSections).
    expect(fetchMock).toHaveBeenCalledWith(
      "/files/EN/John_Doe_-_ApplicationDocuments.zip",
      {
        headers: { Authorization: `Basic ${btoa("documents:!correct")}` },
      },
    );
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(clickSpy).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");

    clickSpy.mockRestore();
  });

  it("relocks and reports an incorrect password when a download comes back 401", async () => {
    setStoredSession(`Basic ${btoa("documents:!stale")}`);
    fetchMock.mockResolvedValue(mockResponse({ ok: false, status: 401 }));

    const tree = renderRoute();
    expandAllSections(tree);
    const [firstButton] = tree.root.findAllByType("WnaNavigationItem");

    await act(async () => {
      await (firstButton.props.onPress as () => Promise<void>)();
    });

    expect(window.sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
    expect(() => tree.root.findByType("input")).not.toThrow();
  });

  it("reports a generic error when a download fails for another reason", async () => {
    setStoredSession(`Basic ${btoa("documents:!correct")}`);
    fetchMock.mockResolvedValue(mockResponse({ ok: false, status: 404 }));

    const tree = renderRoute();
    expandAllSections(tree);
    const [firstButton] = tree.root.findAllByType("WnaNavigationItem");

    await act(async () => {
      await (firstButton.props.onPress as () => Promise<void>)();
    });

    expect(tree.root.findAllByType("WnaNavigationItem")).toHaveLength(10);
  });

  it("swallows a network error thrown while downloading", async () => {
    setStoredSession(`Basic ${btoa("documents:!correct")}`);
    fetchMock.mockRejectedValue(new Error("boom"));

    const tree = renderRoute();
    expandAllSections(tree);
    const [firstButton] = tree.root.findAllByType("WnaNavigationItem");

    await expect(
      act(async () => {
        await (firstButton.props.onPress as () => Promise<void>)();
      }),
    ).resolves.toBeUndefined();
  });

  it("tolerates sessionStorage being unavailable when reading, writing and clearing", async () => {
    const getItemSpy = jest
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("storage disabled");
      });
    const setItemSpy = jest
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("storage disabled");
      });
    const removeItemSpy = jest
      .spyOn(Storage.prototype, "removeItem")
      .mockImplementation(() => {
        throw new Error("storage disabled");
      });

    // Reading throws -> falls back to the locked state instead of crashing.
    const lockedTree = renderRoute();
    expect(() => lockedTree.root.findByType("input")).not.toThrow();

    // Unlocking successfully still works even though persisting it fails.
    fetchMock.mockResolvedValue(mockResponse({ ok: true, status: 200 }));
    act(() => {
      findInput(lockedTree).props.onChange({ target: { value: "!correct" } });
    });
    await act(async () => {
      await (
        findUnlockButton(lockedTree).props.onPress as () => Promise<void>
      )();
    });
    expandAllSections(lockedTree);
    expect(lockedTree.root.findAllByType("WnaNavigationItem")).toHaveLength(10);

    // A 401 on download still clears local state even though the storage
    // clear itself throws.
    fetchMock.mockResolvedValue(mockResponse({ ok: false, status: 401 }));
    const [firstButton] = lockedTree.root.findAllByType("WnaNavigationItem");
    await act(async () => {
      await (firstButton.props.onPress as () => Promise<void>)();
    });
    expect(() => lockedTree.root.findByType("input")).not.toThrow();

    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
    removeItemSpy.mockRestore();
  });

  describe("inactivity auto-lock", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("auto-locks 15 minutes after unlocking with no further activity", async () => {
      fetchMock.mockResolvedValue(mockResponse({ ok: true, status: 200 }));
      const tree = renderRoute();

      act(() => {
        findInput(tree).props.onChange({ target: { value: "!correct" } });
      });
      await act(async () => {
        await (findUnlockButton(tree).props.onPress as () => Promise<void>)();
      });
      expandAllSections(tree);
      expect(tree.root.findAllByType("WnaNavigationItem")).toHaveLength(10);

      await act(async () => {
        jest.advanceTimersByTime(15 * 60 * 1000);
      });

      expect(() => tree.root.findByType("input")).not.toThrow();
      expect(window.sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
      expect(window.sessionStorage.getItem(LAST_ACTIVE_STORAGE_KEY)).toBeNull();
    });

    it("does not yet auto-lock a moment before the 15-minute window elapses", async () => {
      fetchMock.mockResolvedValue(mockResponse({ ok: true, status: 200 }));
      const tree = renderRoute();

      act(() => {
        findInput(tree).props.onChange({ target: { value: "!correct" } });
      });
      await act(async () => {
        await (findUnlockButton(tree).props.onPress as () => Promise<void>)();
      });
      expandAllSections(tree);

      await act(async () => {
        jest.advanceTimersByTime(15 * 60 * 1000 - 1000);
      });

      expect(tree.root.findAllByType("WnaNavigationItem")).toHaveLength(10);
    });

    it("resets the inactivity window on each download", async () => {
      fetchMock.mockResolvedValue(mockResponse({ ok: true, status: 200 }));
      const tree = renderRoute();

      act(() => {
        findInput(tree).props.onChange({ target: { value: "!correct" } });
      });
      await act(async () => {
        await (findUnlockButton(tree).props.onPress as () => Promise<void>)();
      });
      expandAllSections(tree);

      await act(async () => {
        jest.advanceTimersByTime(10 * 60 * 1000);
      });
      expect(tree.root.findAllByType("WnaNavigationItem")).toHaveLength(10);

      const [firstButton] = tree.root.findAllByType("WnaNavigationItem");
      await act(async () => {
        await (firstButton.props.onPress as () => Promise<void>)();
      });

      // 10 more minutes -- 20 since unlock, but only 10 since the download
      // reset the window -- must still be unlocked.
      await act(async () => {
        jest.advanceTimersByTime(10 * 60 * 1000);
      });
      expect(tree.root.findAllByType("WnaNavigationItem")).toHaveLength(10);

      // 5 more minutes -- 15 since the download -- now it locks.
      await act(async () => {
        jest.advanceTimersByTime(5 * 60 * 1000);
      });
      expect(() => tree.root.findByType("input")).not.toThrow();
    });

    it("locks immediately on load when the stored session already exceeded the inactivity window", () => {
      setStoredSession(
        `Basic ${btoa("documents:!correct")}`,
        Date.now() - (15 * 60 * 1000 + 1000),
      );

      const tree = renderRoute();

      expect(() => tree.root.findByType("input")).not.toThrow();
      expect(window.sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
    });

    it("keeps an unlocked session and schedules only the remaining time when not yet stale", async () => {
      setStoredSession(
        `Basic ${btoa("documents:!correct")}`,
        Date.now() - 10 * 60 * 1000,
      );

      const tree = renderRoute();
      expandAllSections(tree);
      expect(tree.root.findAllByType("WnaNavigationItem")).toHaveLength(10);

      // 4 more minutes -- 14 since the recorded activity -- still unlocked.
      await act(async () => {
        jest.advanceTimersByTime(4 * 60 * 1000);
      });
      expect(tree.root.findAllByType("WnaNavigationItem")).toHaveLength(10);

      // 1 more minute -- 15 since the recorded activity -- now it locks.
      await act(async () => {
        jest.advanceTimersByTime(60 * 1000);
      });
      expect(() => tree.root.findByType("input")).not.toThrow();
    });

    it("treats a session with no recorded last-active timestamp as active now, not as stale", async () => {
      // Unlike setStoredSession, this leaves LAST_ACTIVE_STORAGE_KEY entirely
      // unset -- e.g. a session persisted by a build predating this feature.
      window.sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        `Basic ${btoa("documents:!correct")}`,
      );

      const tree = renderRoute();
      expandAllSections(tree);
      expect(tree.root.findAllByType("WnaNavigationItem")).toHaveLength(10);

      await act(async () => {
        jest.advanceTimersByTime(14 * 60 * 1000);
      });
      expect(tree.root.findAllByType("WnaNavigationItem")).toHaveLength(10);

      await act(async () => {
        jest.advanceTimersByTime(60 * 1000);
      });
      expect(() => tree.root.findByType("input")).not.toThrow();
    });
  });
});
