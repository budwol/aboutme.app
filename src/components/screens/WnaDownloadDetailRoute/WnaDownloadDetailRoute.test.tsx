/* eslint-disable @typescript-eslint/no-require-imports */
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import WnaDownloadDetailRoute from "@components/screens/WnaDownloadDetailRoute";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { testAppData } from "@/app-data/testAppData";

const SESSION_STORAGE_KEY = "wna-documents-auth";
const LAST_ACTIVE_STORAGE_KEY = "wna-documents-auth-last-active";
const AUTH_HEADER = `Basic ${btoa("documents:!correct")}`;

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

function mockElement(name: string) {
  const { createElement } = require("react") as typeof import("react");

  return function MockElement(props: unknown) {
    return createElement(
      name,
      props as Record<string, unknown>,
      (props as { children?: React.ReactNode }).children,
    );
  };
}

jest.mock("@components/cards/WnaSurfaceCard", () =>
  mockElement("WnaSurfaceCard"),
);
jest.mock("@/navigation/components/WnaMenuToggleButton", () =>
  mockElement("WnaMenuToggleButton"),
);
jest.mock("@/navigation/components/WnaHeaderRouteButton", () =>
  mockElement("WnaHeaderRouteButton"),
);
jest.mock("@components/buttons/WnaButtonIconText", () =>
  mockElement("WnaButtonIconText"),
);
jest.mock("@components/documents/WnaDocumentsUnlockGate", () =>
  mockElement("WnaDocumentsUnlockGate"),
);
jest.mock("@components/screens/WnaScrollViewScreen", () =>
  mockElement("WnaScrollViewScreen"),
);

type Tree = ReturnType<typeof TestRenderer.create>;

function mockResponse(overrides: Partial<Response>): Response {
  return {
    ok: true,
    status: 200,
    blob: async () => new Blob(["%PDF-fake"]),
    ...overrides,
  } as Response;
}

describe("WnaDownloadDetailRoute", () => {
  const fetchMock = jest.fn<typeof fetch>();
  const createObjectURL = jest.fn(() => "blob:preview");
  const revokeObjectURL = jest.fn();
  let clickSpy: ReturnType<typeof jest.spyOn>;
  let clickedAnchors: HTMLAnchorElement[];

  beforeEach(() => {
    jest.clearAllMocks();
    window.sessionStorage.clear();
    global.fetch = fetchMock as unknown as typeof fetch;
    (URL as unknown as { createObjectURL: unknown }).createObjectURL =
      createObjectURL;
    (URL as unknown as { revokeObjectURL: unknown }).revokeObjectURL =
      revokeObjectURL;
    clickedAnchors = [];
    clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function (this: HTMLAnchorElement) {
        clickedAnchors.push(this);
      });

    const appContext = jest.requireMock("@/state/WnaAppContext") as {
      useWnaAppData: jest.Mock;
      useWnaTheme: jest.Mock;
    };
    appContext.useWnaTheme.mockReturnValue({
      appColors: { coolgray1: "#eee", red4: "#f75056" },
      appStyle: { textNeutralMedium: {} },
    });
    appContext.useWnaAppData.mockReturnValue({ appData: testAppData });
  });

  afterEach(() => {
    clickSpy.mockRestore();
    window.sessionStorage.clear();
  });

  function setStoredSession() {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, AUTH_HEADER);
    window.sessionStorage.setItem(LAST_ACTIVE_STORAGE_KEY, String(Date.now()));
  }

  async function renderRoute(
    kind: React.ComponentProps<typeof WnaDownloadDetailRoute>["kind"],
  ): Promise<Tree> {
    let tree: Tree | undefined;
    await act(async () => {
      tree = TestRenderer.create(<WnaDownloadDetailRoute kind={kind} />);
    });
    return tree!;
  }

  function findDownloadButton(tree: Tree) {
    return tree.root.findByType("WnaButtonIconText");
  }

  describe("a public document (Portfolio)", () => {
    it("skips the password gate and previews the file straight from its URL", async () => {
      const tree = await renderRoute("portfolioDe");

      expect(tree.root.findAllByType("WnaDocumentsUnlockGate")).toHaveLength(0);
      expect(tree.root.findByType("iframe").props.src).toBe(
        "/DE/John_Doe_-_Portfolio.pdf",
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("titles the page with the document label and links the title back to the list", async () => {
      const tree = await renderRoute("portfolioAtsEn");

      const screen = tree.root.findByType("WnaScrollViewScreen");
      expect(screen.props.headerTitle).toBe("documentPortfolioAtsEn");
      expect(screen.props.titleHref).toBe("/application-documents");
      expect(screen.props.showContactFooter).toBe(false);
    });

    it("downloads the file under its own name without fetching it", async () => {
      const tree = await renderRoute("portfolioDe");

      expect(findDownloadButton(tree).props.disabled).toBe(false);
      act(() => {
        findDownloadButton(tree).props.onPress();
      });

      expect(clickedAnchors).toHaveLength(1);
      expect(clickedAnchors[0].getAttribute("href")).toBe(
        "/DE/John_Doe_-_Portfolio.pdf",
      );
      expect(clickedAnchors[0].download).toBe("John_Doe_-_Portfolio.pdf");
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe("a protected document (CV)", () => {
    it("shows the password gate with a document-specific body when locked", async () => {
      const tree = await renderRoute("cvDe");

      const gate = tree.root.findByType("WnaDocumentsUnlockGate");
      expect(gate.props.bodyText).toBe("downloadsUnlockBodyDocument");
      expect(tree.root.findAllByType("iframe")).toHaveLength(0);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("unlocks by probing the document itself, then previews it", async () => {
      fetchMock.mockResolvedValue(mockResponse({}));
      const tree = await renderRoute("cvDe");

      await act(async () => {
        tree.root
          .findByType("WnaDocumentsUnlockGate")
          .props.setPassword("!correct");
      });
      await act(async () => {
        await tree.root.findByType("WnaDocumentsUnlockGate").props.onUnlock();
      });

      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        "/files/DE/John_Doe_-_Lebenslauf.pdf",
        expect.objectContaining({ method: "HEAD" }),
      );
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        "/files/DE/John_Doe_-_Lebenslauf.pdf",
        { headers: { Authorization: AUTH_HEADER } },
      );
      expect(tree.root.findByType("iframe").props.src).toBe("blob:preview");
    });

    it("previews straight away when a session is already stored", async () => {
      setStoredSession();
      fetchMock.mockResolvedValue(mockResponse({}));

      const tree = await renderRoute("cvAtsEn");

      expect(fetchMock).toHaveBeenCalledWith(
        "/files/EN/John_Doe_-_CV_ATS.pdf",
        {
          headers: { Authorization: AUTH_HEADER },
        },
      );
      expect(tree.root.findByType("iframe").props.src).toBe("blob:preview");
      expect(findDownloadButton(tree).props.disabled).toBe(false);
    });

    it("shows a loading hint and a disabled download button while the preview loads", async () => {
      setStoredSession();
      fetchMock.mockReturnValue(new Promise<Response>(() => undefined));

      const tree = await renderRoute("cvDe");

      expect(
        tree.root.findAll(
          (node: { type: unknown; props: { children?: unknown } }) =>
            node.type === "span" &&
            node.props.children === "infoLoadingPreview",
        ),
      ).toHaveLength(1);
      expect(findDownloadButton(tree).props.disabled).toBe(true);

      // Nothing to download yet -- pressing it anyway is a no-op.
      act(() => {
        findDownloadButton(tree).props.onPress();
      });
      expect(clickedAnchors).toHaveLength(0);
    });

    it("downloads the already-fetched preview blob instead of fetching again", async () => {
      setStoredSession();
      const blob = new Blob(["%PDF-fake"]);
      fetchMock.mockResolvedValue(mockResponse({ blob: async () => blob }));
      const tree = await renderRoute("cvDe");

      act(() => {
        findDownloadButton(tree).props.onPress();
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(createObjectURL).toHaveBeenLastCalledWith(blob);
      expect(clickedAnchors[0].download).toBe("John_Doe_-_Lebenslauf.pdf");
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:preview");
    });

    it("relocks when the stored session comes back 401", async () => {
      setStoredSession();
      fetchMock.mockResolvedValue(mockResponse({ ok: false, status: 401 }));

      const tree = await renderRoute("cvDe");

      const gate = tree.root.findByType("WnaDocumentsUnlockGate");
      expect(gate.props.error).toBe("errorIncorrectPassword");
      expect(window.sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
    });

    it("reports a generic error when the preview request fails", async () => {
      setStoredSession();
      fetchMock.mockResolvedValue(mockResponse({ ok: false, status: 404 }));

      const tree = await renderRoute("cvDe");

      expect(tree.root.findAllByType("iframe")).toHaveLength(0);
      // Once as the missing-preview placeholder, once as the error line.
      expect(
        tree.root.findAll(
          (node: { type: unknown; props: { children?: unknown } }) =>
            node.type === "span" && node.props.children === "errorUnknown",
        ),
      ).toHaveLength(2);
    });

    it("reports a generic error when the preview request throws", async () => {
      setStoredSession();
      fetchMock.mockRejectedValue(new Error("network down"));

      const tree = await renderRoute("cvDe");

      expect(
        tree.root.findAll(
          (node: { type: unknown; props: { children?: unknown } }) =>
            node.type === "span" && node.props.children === "errorUnknown",
        ),
      ).toHaveLength(2);
    });

    it("ignores a preview that resolves after the page was left", async () => {
      setStoredSession();
      let resolveFetch!: (response: Response) => void;
      fetchMock.mockReturnValue(
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
      );
      const tree = await renderRoute("cvDe");

      act(() => {
        tree.unmount();
      });
      await act(async () => {
        resolveFetch(mockResponse({}));
      });

      expect(createObjectURL).not.toHaveBeenCalled();
    });

    it("ignores a failed or rejected preview after the page was left", async () => {
      setStoredSession();
      let resolveFetch!: (response: Response) => void;
      let rejectFetch!: (error: Error) => void;
      fetchMock
        .mockReturnValueOnce(
          new Promise<Response>((resolve) => {
            resolveFetch = resolve;
          }),
        )
        .mockReturnValueOnce(
          new Promise<Response>((_, reject) => {
            rejectFetch = reject;
          }),
        );

      const first = await renderRoute("cvDe");
      act(() => {
        first.unmount();
      });
      await act(async () => {
        resolveFetch(mockResponse({ ok: false, status: 500 }));
      });

      const second = await renderRoute("cvEn");
      act(() => {
        second.unmount();
      });
      await act(async () => {
        rejectFetch(new Error("network down"));
      });

      expect(createObjectURL).not.toHaveBeenCalled();
    });

    it("revokes the preview's object URL when the page is left", async () => {
      setStoredSession();
      fetchMock.mockResolvedValue(mockResponse({}));
      const tree = await renderRoute("cvDe");

      act(() => {
        tree.unmount();
      });

      expect(revokeObjectURL).toHaveBeenCalledWith("blob:preview");
    });
  });
});
