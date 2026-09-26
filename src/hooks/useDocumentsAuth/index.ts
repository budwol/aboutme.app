import Logger from "wna-logger";
import { i18nKeys } from "@/i18n/i18nKeys";
import { TFunction } from "i18next";
import { useCallback, useEffect, useRef, useState } from "react";

// Fixed, non-secret -- with HTTP Basic Auth the secrecy lives entirely in
// the password, not the username. Mirrors DOCUMENTS_AUTH_USERNAME in
// scripts/init-process.cjs, which is what actually builds nginx's
// .htpasswd entry against this same name.
const DOCUMENTS_AUTH_USERNAME = "documents";

// Remembers a successful unlock only for this browser tab's session (not
// localStorage): re-opening the page in a new tab, or after the browser
// closes, asks again. Shared by every document-gated screen (the full list
// and each document's own detail page), so unlocking on one carries over to
// the other within the same tab.
const SESSION_STORAGE_KEY = "wna-documents-auth";

// Re-locks after 15 minutes without a download/preview, even within the
// same tab session -- a stopgap against a browser left open and unattended
// on a shared/public machine. This is purely a client-side convenience, not
// a security boundary: the server-side gate is still nginx's auth_basic,
// which has no concept of a session and stays valid until the password
// itself is rotated.
const AUTH_INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;
const LAST_ACTIVE_STORAGE_KEY = "wna-documents-auth-last-active";

function buildAuthHeader(username: string, password: string): string {
  return `Basic ${btoa(`${username}:${password}`)}`;
}

function readStoredAuthHeader(): string | null {
  try {
    return window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeAuthHeader(authHeader: string): void {
  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, authHeader);
  } catch {
    // sessionStorage can be unavailable (private browsing, disabled site
    // data) -- the unlocked state still works for the rest of this page
    // load, it just won't survive a reload.
  }
}

function clearStoredAuthHeader(): void {
  try {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // see storeAuthHeader
  }
}

function readStoredLastActiveAt(): number | null {
  try {
    const raw = window.sessionStorage.getItem(LAST_ACTIVE_STORAGE_KEY);
    const parsed = raw === null ? NaN : Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function storeLastActiveAt(timestamp: number): void {
  try {
    window.sessionStorage.setItem(LAST_ACTIVE_STORAGE_KEY, String(timestamp));
  } catch {
    // see storeAuthHeader
  }
}

function clearLastActiveAt(): void {
  try {
    window.sessionStorage.removeItem(LAST_ACTIVE_STORAGE_KEY);
  } catch {
    // see storeAuthHeader
  }
}

export type UseDocumentsAuthResult = {
  authHeader: string | null;
  isUnlocked: boolean;
  password: string;
  setPassword: (value: string) => void;
  error: string | null;
  setError: (value: string | null) => void;
  isVerifying: boolean;
  unlock: (probeUrl: string) => Promise<void>;
  // Attaches the stored Authorization header, marks activity (unless
  // markActivity: false -- see below), and on a 401 clears the session +
  // sets errorIncorrectPassword + returns null (the password was rotated
  // since this session started). Any other response is handed back as-is:
  // a size/reference manifest fetch treats a non-401 failure as "skip this
  // data", a document download/preview fetch treats it as errorUnknown --
  // callers differ here today, so this only owns the one behavior they
  // actually share.
  authorizedFetch: (
    url: string,
    // markActivity defaults to true (a download or preview fetch is real,
    // user-initiated activity) -- pass false for a fetch that happens
    // automatically regardless of anything the visitor did (the size/
    // reference manifest fetch), which must not reset the inactivity
    // window on its own.
    init?: RequestInit & { markActivity?: boolean },
  ) => Promise<Response | null>;
};

// The full password/session/15-minute-inactivity-lock flow, shared by every
// screen gated behind /files/'s auth_basic (WnaDownloadsRoute's full list,
// WnaDownloadDetailRoute's single-document page) -- extracted so neither
// reimplements it.
export function useDocumentsAuth(
  t: TFunction<string[], undefined>,
): UseDocumentsAuthResult {
  const [authHeader, setAuthHeader] = useState<string | null>(() =>
    readStoredAuthHeader(),
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const autoLockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelAutoLock = useCallback(() => {
    if (autoLockTimeoutRef.current !== null) {
      clearTimeout(autoLockTimeoutRef.current);
      autoLockTimeoutRef.current = null;
    }
  }, []);

  const scheduleAutoLock = useCallback(
    (remainingMs: number) => {
      cancelAutoLock();
      autoLockTimeoutRef.current = setTimeout(() => {
        clearStoredAuthHeader();
        clearLastActiveAt();
        setAuthHeader(null);
      }, remainingMs);
    },
    [cancelAutoLock],
  );

  // Called on unlock and on every authorized fetch -- both count as
  // "activity", resetting the 15-minute inactivity window.
  const markActive = useCallback(() => {
    storeLastActiveAt(Date.now());
    scheduleAutoLock(AUTH_INACTIVITY_TIMEOUT_MS);
  }, [scheduleAutoLock]);

  // Re-derives the inactivity timer whenever authHeader changes: covers
  // both a fresh unlock (markActive already wrote a current timestamp) and
  // a page load that found an existing session in sessionStorage (where the
  // last recorded activity could already be stale, in which case this locks
  // immediately instead of trusting a session that outlived its window). A
  // *missing* timestamp -- sessionStorage unavailable entirely, or an
  // older session predating this feature -- is deliberately not treated as
  // "infinitely stale": that would auto-lock every unlock immediately
  // whenever storage can't be read, which is strictly worse than not having
  // this convenience feature at all. It's instead treated as activity
  // happening right now, same as a fresh unlock.
  useEffect(() => {
    if (!authHeader) {
      return;
    }

    const lastActiveAt = readStoredLastActiveAt();
    if (lastActiveAt === null) {
      markActive();
      return cancelAutoLock;
    }

    const elapsed = Date.now() - lastActiveAt;
    if (elapsed >= AUTH_INACTIVITY_TIMEOUT_MS) {
      clearStoredAuthHeader();
      clearLastActiveAt();
      setAuthHeader(null);
      return;
    }

    scheduleAutoLock(AUTH_INACTIVITY_TIMEOUT_MS - elapsed);
    return cancelAutoLock;
  }, [authHeader, cancelAutoLock, markActive, scheduleAutoLock]);

  const unlock = useCallback(
    async (probeUrl: string) => {
      setError(null);
      setIsVerifying(true);
      const candidateHeader = buildAuthHeader(
        DOCUMENTS_AUTH_USERNAME,
        password,
      );

      try {
        const response = await fetch(probeUrl, {
          method: "HEAD",
          headers: { Authorization: candidateHeader },
        });

        if (!response.ok) {
          setError(t(i18nKeys.errorIncorrectPassword));
          return;
        }

        storeAuthHeader(candidateHeader);
        markActive();
        setAuthHeader(candidateHeader);
        setPassword("");
      } catch (requestError) {
        Logger.error(useDocumentsAuth.name, requestError);
        setError(t(i18nKeys.errorUnknown));
      } finally {
        setIsVerifying(false);
      }
    },
    [markActive, password, t],
  );

  // Only ever meaningful once authHeader is set -- every caller only
  // invokes this from a screen state that already requires an active
  // session.
  const authorizedFetch = useCallback(
    async (
      url: string,
      {
        markActivity = true,
        ...init
      }: RequestInit & { markActivity?: boolean } = {},
    ): Promise<Response | null> => {
      const currentAuthHeader = authHeader as string;
      if (markActivity) {
        markActive();
      }

      const response = await fetch(url, {
        ...init,
        headers: { ...init.headers, Authorization: currentAuthHeader },
      });

      if (response.status === 401) {
        cancelAutoLock();
        clearStoredAuthHeader();
        clearLastActiveAt();
        setAuthHeader(null);
        setError(t(i18nKeys.errorIncorrectPassword));
        return null;
      }

      return response;
    },
    [authHeader, cancelAutoLock, markActive, t],
  );

  return {
    authHeader,
    isUnlocked: authHeader !== null,
    password,
    setPassword,
    error,
    setError,
    isVerifying,
    unlock,
    authorizedFetch,
  };
}
