/**
 * @jest-environment jsdom
 */
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import type { TFunction } from "i18next";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import {
  useDocumentsAuth,
  UseDocumentsAuthResult,
} from "@/hooks/useDocumentsAuth";

const SESSION_STORAGE_KEY = "wna-documents-auth";
const LAST_ACTIVE_STORAGE_KEY = "wna-documents-auth-last-active";

jest.mock("wna-logger", () => ({
  __esModule: true,
  default: {
    error: () => undefined,
    info: () => undefined,
    warn: () => undefined,
  },
}));

function mockResponse(overrides: Partial<Response>): Response {
  return {
    ok: true,
    status: 200,
    json: async () => ({}),
    ...overrides,
  } as Response;
}

// No @testing-library/react (renderHook) is a dependency here, so a tiny
// throwaway component exposes the hook's return value to the test via a
// callback prop, matching how the rest of this repo drives hooks under
// react-test-renderer (see WnaDownloadsRoute.test.tsx).
function HookHarness({
  onResult,
}: {
  onResult: (result: UseDocumentsAuthResult) => void;
}) {
  const result = useDocumentsAuth(
    ((value: string) => value) as unknown as TFunction,
  );
  onResult(result);
  return null;
}

function renderHook() {
  let latest!: UseDocumentsAuthResult;
  let tree: ReturnType<typeof TestRenderer.create> | undefined;
  act(() => {
    tree = TestRenderer.create(
      React.createElement(HookHarness, {
        onResult: (result: UseDocumentsAuthResult) => {
          latest = result;
        },
      }),
    );
  });
  return {
    getResult: () => latest,
    rerender: () =>
      act(() =>
        tree!.update(
          React.createElement(HookHarness, {
            onResult: (result: UseDocumentsAuthResult) => {
              latest = result;
            },
          }),
        ),
      ),
  };
}

describe("useDocumentsAuth", () => {
  const fetchMock = jest.fn<typeof fetch>();

  beforeEach(() => {
    jest.clearAllMocks();
    window.sessionStorage.clear();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    window.sessionStorage.clear();
  });

  it("starts locked when nothing is stored", () => {
    const { getResult } = renderHook();

    expect(getResult().isUnlocked).toBe(false);
    expect(getResult().authHeader).toBeNull();
  });

  it("starts unlocked when a session is already stored", () => {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, "Basic stored-header");

    const { getResult } = renderHook();

    expect(getResult().isUnlocked).toBe(true);
    expect(getResult().authHeader).toBe("Basic stored-header");
  });

  it("unlocks on a correct password, storing the header and clearing the password field", async () => {
    fetchMock.mockResolvedValue(mockResponse({ ok: true, status: 200 }));
    const { getResult } = renderHook();

    await act(async () => {
      getResult().setPassword("!correct");
    });
    await act(async () => {
      await getResult().unlock("/files/DE/probe.zip");
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/files/DE/probe.zip",
      expect.objectContaining({
        method: "HEAD",
        headers: { Authorization: `Basic ${btoa("documents:!correct")}` },
      }),
    );
    expect(getResult().isUnlocked).toBe(true);
    expect(getResult().password).toBe("");
    expect(window.sessionStorage.getItem(SESSION_STORAGE_KEY)).toBe(
      `Basic ${btoa("documents:!correct")}`,
    );
  });

  it("sets an error and stays locked on a wrong password", async () => {
    fetchMock.mockResolvedValue(mockResponse({ ok: false, status: 401 }));
    const { getResult } = renderHook();

    await act(async () => {
      getResult().setPassword("!wrong");
    });
    await act(async () => {
      await getResult().unlock("/files/DE/probe.zip");
    });

    expect(getResult().isUnlocked).toBe(false);
    expect(getResult().error).toBe("errorIncorrectPassword");
  });

  it("sets a generic error when the unlock request itself throws", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));
    const { getResult } = renderHook();

    await act(async () => {
      getResult().setPassword("!correct");
    });
    await act(async () => {
      await getResult().unlock("/files/DE/probe.zip");
    });

    expect(getResult().isUnlocked).toBe(false);
    expect(getResult().error).toBe("errorUnknown");
  });

  it("authorizedFetch attaches the stored header and marks activity by default", async () => {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, "Basic stored-header");
    fetchMock.mockResolvedValue(mockResponse({ ok: true, status: 200 }));
    const { getResult } = renderHook();

    let response: Response | null = null;
    await act(async () => {
      response = await getResult().authorizedFetch("/files/DE/doc.pdf");
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/files/DE/doc.pdf",
      expect.objectContaining({
        headers: { Authorization: "Basic stored-header" },
      }),
    );
    expect(response).not.toBeNull();
    expect(
      window.sessionStorage.getItem(LAST_ACTIVE_STORAGE_KEY),
    ).not.toBeNull();
  });

  it("authorizedFetch relocks and reports an incorrect password on a 401", async () => {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, "Basic stored-header");
    fetchMock.mockResolvedValue(mockResponse({ ok: false, status: 401 }));
    const { getResult } = renderHook();

    let response: Response | null = null;
    await act(async () => {
      response = await getResult().authorizedFetch("/files/DE/doc.pdf");
    });

    expect(response).toBeNull();
    expect(getResult().isUnlocked).toBe(false);
    expect(getResult().error).toBe("errorIncorrectPassword");
    expect(window.sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  it("authorizedFetch with markActivity: false does not touch the last-active timestamp", async () => {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, "Basic stored-header");
    // Recent enough that the mount effect doesn't treat the session as stale.
    const lastActiveAt = String(Date.now() - 1000);
    window.sessionStorage.setItem(LAST_ACTIVE_STORAGE_KEY, lastActiveAt);
    fetchMock.mockResolvedValue(mockResponse({ ok: true, status: 200 }));
    const { getResult } = renderHook();

    await act(async () => {
      await getResult().authorizedFetch("/files/references-manifest.json", {
        markActivity: false,
      });
    });

    expect(window.sessionStorage.getItem(LAST_ACTIVE_STORAGE_KEY)).toBe(
      lastActiveAt,
    );
  });

  it("auto-locks 15 minutes after unlocking with no further activity", async () => {
    jest.useFakeTimers();
    try {
      fetchMock.mockResolvedValue(mockResponse({ ok: true, status: 200 }));
      const { getResult } = renderHook();

      await act(async () => {
        getResult().setPassword("!correct");
      });
      await act(async () => {
        await getResult().unlock("/files/DE/probe.zip");
      });
      expect(getResult().isUnlocked).toBe(true);

      await act(async () => {
        jest.advanceTimersByTime(15 * 60 * 1000);
      });

      expect(getResult().isUnlocked).toBe(false);
      expect(window.sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it("locks immediately on mount when the stored session already exceeded the inactivity window", () => {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, "Basic stored-header");
    window.sessionStorage.setItem(
      LAST_ACTIVE_STORAGE_KEY,
      String(Date.now() - (15 * 60 * 1000 + 1000)),
    );

    const { getResult } = renderHook();

    expect(getResult().isUnlocked).toBe(false);
    expect(window.sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  it("tolerates sessionStorage being unavailable when reading, writing and clearing", async () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage disabled");
    });
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage disabled");
    });
    jest.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("storage disabled");
    });

    const { getResult } = renderHook();
    expect(getResult().isUnlocked).toBe(false);

    fetchMock.mockResolvedValue(mockResponse({ ok: true, status: 200 }));
    await act(async () => {
      getResult().setPassword("!correct");
    });
    await act(async () => {
      await getResult().unlock("/files/DE/probe.zip");
    });

    expect(getResult().isUnlocked).toBe(true);
  });
});
